# 对冲系统设计文档 (Clash System Design)

> **分支**: `feature/clash-system`  
> **状态**: 规划阶段  
> **作者**: Cascade AI  
> **日期**: 2026-01-07

---

## 一、核心概念

### 1.1 设计目标

将现有的"线性执行"回合制改造为"阶段结算"模式，引入**杀意感知 (Insight Check)** 和 **对冲判定 (Clash Resolution)** 机制。

```
现有流程:
Input → Speed Sort → Execution A → Execution B（线性）

新流程:
Phase 1: 宣言阶段 (Declaration Phase)
    ↓
Phase 2: 准备/博弈阶段 (Reaction Phase)
    ↓
Phase 3: 对冲结算阶段 (Resolution Phase)
```

### 1.2 核心机制

| 机制 | 描述 |
|------|------|
| **杀意感知** | 速度慢的一方可以"预判"对方的招式类型，基于 Insight AVs 和速度差 |
| **后手对冲** | 当速度低于对方 25% 时，可选择放弃先制权，尝试用自己的招式拦截对方 |
| **对冲结算** | 两股能量碰撞时，根据 Clash Power (CP) 计算胜负 |

---

## 二、技能物理类型定义 (Clash Property Tags)

在 `moves-data.js` 中为技能添加 `clashType` 属性：

| 类型 | 英文 | 描述 | 代表技能 |
|------|------|------|----------|
| **实体** | `SOLID` | 身体撞击、近身肉搏 | 猛撞、近身战、铁头 |
| **光束** | `BEAM` | 有弹道的能量投射 | 水枪、喷射火焰、暗影球 |
| **波动** | `WAVE` | 无实体范围攻击 | 地震、大声咆哮、污泥波 |
| **穿透** | `PIERCE` | 物理利刃、切裂 | 暗影爪、精神利刃、燕返 |

### 2.1 对冲优先矩阵 (Clash Matrix)

| 我方 \ 敌方 | BEAM (远程) | SOLID (近身) | WAVE (波动) |
|-------------|-------------|--------------|-------------|
| **BEAM** | 对波 (Dmg Check) | 通常 BEAM 胜 / 距离过近 SOLID 胜 | BEAM 穿透 WAVE |
| **SOLID** | 硬抗 / 闪避 | 拼刀 (Parry Check) | SOLID 强行突破 |
| **PIERCE** | 切裂 (一刀两断) | 拼刀 (高暴击风险) | 攻击无效或消散 |

---

## 三、对冲判定数学模型

### 3.1 Clash Power (CP) 计算

```javascript
CP = (BasePower × (UserAtk/SpA)) / (TargetDef/SpD) × RNG(0.9~1.1)
```

### 3.2 结果判定

| 结果 | 条件 | 效果 |
|------|------|------|
| **Overpower (碾压)** | 一方 CP ≥ 2× 对方 | 赢家招式全额命中，输家被中断 |
| **Neutralize (抵消)** | 双方 CP 接近 (差距 < 30%) | 双方无伤或受轻微反伤，PP 扣除 |
| **Pierce (削减)** | 赢家 CP 领先 30%~100% | 赢家技能剩余部分命中 (50% 伤害) |

---

## 四、速度分级策略 (Speed Tiers)

### 4.1 高速方 (Speed Advantage)

- **特权**: 拥有【主动截击权】
- **UI 提示**: "速度占优，要抢攻（Direct Hit）还是预架（Wait & Clash）？"
- **战术**: 
  - 抢攻秒杀脆皮
  - 预架抵消对方蓄力技

### 4.2 低速方 (Speed Disadvantage ≤ 75%)

- **被动**: 通常情况下只能挨打
- **机会**: 【后手对冲 (Clash Trigger)】
- **触发条件**:
  - 速度 ≤ 对方的 75%
  - 对方使用"非必中"且"有弹道"的攻击技能
  - 消耗额外 PP 或 Insight 值

---

## 五、杀意感知 (Insight Check)

### 5.1 预判蓄力技 (Easy Mode)

- **触发**: 敌方使用蓄力技 (Solar Beam, Hyper Beam 等)
- **UI**: 显性提示 "卡比兽正在把气吸进肚子里..."
- **无需 Insight**: 直接可见

### 5.2 预判瞬发技 (Hard Mode)

- **触发**: 敌方决定使用攻击技能
- **判定**: `Insight AVs` vs `敌方 Speed/Level`
- **成功**: UI 警告灯闪烁 🔴 + 提示 "直觉告诉你，一股幽灵系的能量正在汇聚..."
- **失败**: 无提示，正常回合

### 5.3 Insight 阈值

| Insight 值 | 预判成功率 | 信息精度 |
|------------|-----------|----------|
| 0~50 | 10% | 仅知道"有攻击意图" |
| 51~150 | 30% | 知道属性类型 |
| 151~220 | 50% | 知道属性 + 物理/特殊 |
| 221~255 | 70% | 知道具体招式名 |

---

## 六、技术实现路线图

### Phase 1: 数据层 (Data Layer)

**文件**: `data/moves-data.js`

```javascript
// 为常用技能添加 clashType 属性
// 示例:
flamethrower: {
    // ... 现有属性
    clashType: 'beam'
},
tackle: {
    // ... 现有属性
    clashType: 'solid'
}
```

**工作量**: ~50 行，低风险

---

### Phase 2: 核心逻辑 (Core Logic)

**新建文件**: `mechanics/clash-system.js`

```javascript
/**
 * 预计算意图 (在 handleAttack 开始时调用)
 * @param {Pokemon} attacker - 攻击方
 * @param {Pokemon} defender - 防守方
 * @param {Object} move - 招式
 * @returns {Object} { canClash, insightResult, clashType }
 */
function preCalculateIntent(attacker, defender, move) { ... }

/**
 * 对冲结算
 * @param {Object} moveA - 先手招式
 * @param {Object} moveB - 后手招式
 * @param {Pokemon} userA - 先手使用者
 * @param {Pokemon} userB - 后手使用者
 * @returns {Object|null} { winner, loser, resultType, damage, logs }
 */
function resolveClash(moveA, moveB, userA, userB) { ... }

/**
 * 检查是否满足对冲条件
 */
function canTriggerClash(attacker, defender, attackerMove, defenderMove) { ... }

/**
 * 计算 Clash Power
 */
function calculateClashPower(user, move) { ... }
```

**工作量**: ~300 行，中等风险

---

### Phase 3: 流程改造 (Flow Modification)

**修改文件**: `index.js` (handleAttack 函数)

```javascript
async function handleAttack(moveIndex, options = {}) {
    // ... 现有代码 ...
    
    // === 【新增】Phase 1: 宣言阶段 ===
    const intentResult = preCalculateIntent(e, p, enemyMove);
    if (intentResult.insightResult.success) {
        // 显示杀意感知 UI
        showInsightWarning(intentResult.insightResult);
    }
    
    // === 【新增】Phase 2: 对冲检测 ===
    if (canTriggerClash(p, e, playerMove, enemyMove)) {
        // 显示对冲选项 UI
        const clashChoice = await showClashOption(playerMove);
        if (clashChoice === 'clash') {
            // === 【新增】Phase 3: 对冲结算 ===
            const clashResult = resolveClash(playerMove, enemyMove, p, e);
            if (clashResult) {
                // 跳过正常回合，直接应用对冲结果
                applyClashResult(clashResult);
                return;
            }
        }
    }
    
    // ... 现有速度判定和回合执行代码 ...
}
```

**工作量**: ~100 行，中等风险

---

### Phase 4: UI 层 (UI Layer)

**修改文件**: `index.html`, `index.css`, `ui/ui-renderer.js`

1. **Insight Bar**: 在指令盘上方添加直觉条
2. **Clash 按钮**: 在攻击按钮上添加 🛡️CLASH 角标
3. **对冲动画**: 两股能量碰撞的视觉效果

**工作量**: ~150 行，低风险

---

## 七、风险评估

| 风险 | 等级 | 缓解措施 |
|------|------|----------|
| 破坏现有战斗流程 | 中 | 使用 feature flag 控制，可随时关闭 |
| 平衡性问题 | 中 | 先在少量技能上测试，逐步扩展 |
| UI 复杂度增加 | 低 | 对冲选项默认隐藏，仅在满足条件时显示 |

---

## 八、测试计划

### 8.1 单元测试

- `calculateClashPower()` 数值正确性
- `resolveClash()` 各种结果判定
- `canTriggerClash()` 条件检测

### 8.2 集成测试

- 正常回合不受影响
- 对冲触发时流程正确
- Insight 预判 UI 显示正确

### 8.3 平衡性测试

- 对冲不应过于强势或过于弱势
- Insight 预判不应破坏游戏悬念

---

## 九、开发顺序

1. ✅ 创建 git 分支 `feature/clash-system`
2. ⬜ 在 `moves-data.js` 中为 10 个常用技能添加 `clashType`
3. ⬜ 创建 `mechanics/clash-system.js` 骨架
4. ⬜ 实现 `calculateClashPower()` 和 `resolveClash()`
5. ⬜ 在 `index.js` 中添加 feature flag 和钩子
6. ⬜ 实现 Insight UI
7. ⬜ 实现 Clash 选项 UI
8. ⬜ 测试和调试
9. ⬜ 合并到 main 分支

---

## 十、附录：常用技能 clashType 参考

| 技能 | 英文 | clashType |
|------|------|-----------|
| 猛撞 | Take Down | solid |
| 近身战 | Close Combat | solid |
| 铁头 | Iron Head | solid |
| 喷射火焰 | Flamethrower | beam |
| 水枪 | Water Gun | beam |
| 暗影球 | Shadow Ball | beam |
| 地震 | Earthquake | wave |
| 冲浪 | Surf | wave |
| 暗影爪 | Shadow Claw | pierce |
| 精神利刃 | Psycho Cut | pierce |
