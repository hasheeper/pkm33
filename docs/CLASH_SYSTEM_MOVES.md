# 对冲系统 - 招式分类与属性设计

> **分支**: `feature/clash-system`  
> **状态**: 设计阶段  
> **日期**: 2026-01-07

---

## 一、核心发现：直接复用 Pokemon Showdown Flags

`moves-data.js` 已包含 **Pokemon Showdown 标准 flags 系统**，无需新增字段！

```javascript
// 示例：波导弹 (Aura Sphere)
aurasphere: {
    flags: { protect: 1, mirror: 1, distance: 1, metronome: 1, bullet: 1, pulse: 1 },
    // bullet + pulse → BEAM 类型
}

// 示例：燕返 (Aerial Ace)
aerialace: {
    flags: { contact: 1, protect: 1, mirror: 1, distance: 1, metronome: 1, slicing: 1 },
    // contact + slicing → PIERCE 类型
}
```

---

## 二、Flags → Clash Type 映射规则

### 2.1 优先级规则（从高到低）

```
1. slicing → PIERCE (切割优先，即使有 contact)
2. bullet/pulse → BEAM (投射物)
3. wind/sound → WAVE (范围波动)
4. contact (无 slicing) → SOLID (近身肉搏)
5. 无以上 flags → BEAM (默认远程能量)
```

### 2.2 映射表

| Clash Type | 英文 | 对应 Flags | 描述 |
|------------|------|-----------|------|
| **SOLID** | 实体 | `contact` (无 `slicing`) | 身体撞击、拳脚、咬击 |
| **BEAM** | 光束 | `bullet`, `pulse`, 或无特殊 flag | 有弹道的能量投射 |
| **WAVE** | 波动 | `wind`, `sound` | 无实体范围攻击 |
| **PIERCE** | 穿透 | `slicing` (优先于 `contact`) | 物理利刃、切裂 |

### 2.3 代码实现

```javascript
/**
 * 从招式 flags 推导 Clash Type
 * @param {Object} move - 招式对象 (含 flags)
 * @returns {string} 'SOLID' | 'BEAM' | 'WAVE' | 'PIERCE'
 */
function getClashType(move) {
    const flags = move.flags || {};
    
    // 优先级 1: 切割类 → PIERCE
    if (flags.slicing) return 'PIERCE';
    
    // 优先级 2: 投射物 → BEAM
    if (flags.bullet || flags.pulse) return 'BEAM';
    
    // 优先级 3: 范围波动 → WAVE
    if (flags.wind || flags.sound) return 'WAVE';
    
    // 优先级 4: 接触类 → SOLID
    if (flags.contact) return 'SOLID';
    
    // 默认: 远程能量 → BEAM
    return 'BEAM';
}
```

---

## 三、Clash Type 详细分类

### 3.1 SOLID (实体/近身)

**特征**: 使用身体部位直接接触对手

**对应 Flags**: `contact` (无 `slicing`)

**细分类型**:

| 子类型 | Flag 组合 | 代表招式 |
|--------|----------|----------|
| **拳击** | `contact` + `punch` | 音速拳、火焰拳、雷电拳、冰冻拳、子弹拳 |
| **咬击** | `contact` + `bite` | 咬住、冰冻牙、火焰牙、雷电牙、强力咬碎 |
| **踢击** | `contact` (无其他) | 踢倒、二连踢、回旋踢、飞膝踢 |
| **撞击** | `contact` (无其他) | 猛撞、舍身冲撞、蛮力、近身战 |
| **抓握** | `contact` (无其他) | 抓、绑紧、束缚 |

**代表招式列表**:

```
近身战 (Close Combat)     - contact
蛮力 (Superpower)         - contact
猛撞 (Take Down)          - contact
舍身冲撞 (Double-Edge)    - contact
铁头 (Iron Head)          - contact
音速拳 (Mach Punch)       - contact, punch
子弹拳 (Bullet Punch)     - contact, punch
咬碎 (Crunch)             - contact, bite
```

---

### 3.2 BEAM (光束/投射)

**特征**: 有弹道的能量或物体投射

**对应 Flags**: `bullet`, `pulse`, 或无特殊 flag

**细分类型**:

| 子类型 | Flag 组合 | 代表招式 |
|--------|----------|----------|
| **能量球** | `bullet` | 暗影球、能量球、气象球、种子炸弹 |
| **波动** | `pulse` | 波导弹、水之波动、恶之波动、龙之波动 |
| **光线** | 无特殊 | 破坏光线、日光束、急冻光线、十万伏特 |
| **喷射** | 无特殊 | 喷射火焰、水枪、冰冻光束 |

**代表招式列表**:

```
暗影球 (Shadow Ball)       - bullet
波导弹 (Aura Sphere)       - bullet, pulse
能量球 (Energy Ball)       - bullet
气象球 (Weather Ball)      - bullet
水之波动 (Water Pulse)     - pulse
恶之波动 (Dark Pulse)      - pulse
龙之波动 (Dragon Pulse)    - pulse
喷射火焰 (Flamethrower)    - 无特殊 (默认 BEAM)
十万伏特 (Thunderbolt)     - 无特殊 (默认 BEAM)
冰冻光束 (Ice Beam)        - 无特殊 (默认 BEAM)
破坏光线 (Hyper Beam)      - 无特殊 (默认 BEAM)
```

---

### 3.3 WAVE (波动/范围)

**特征**: 无实体的范围攻击，难以用物理手段拦截

**对应 Flags**: `wind`, `sound`

**细分类型**:

| 子类型 | Flag 组合 | 代表招式 |
|--------|----------|----------|
| **风系** | `wind` | 暴风雪、神鸟猛击、空气斩、飓风 |
| **声波** | `sound` | 爆音波、虫鸣、吼叫、歌唱 |
| **地震波** | 无 (特殊处理) | 地震、震级、大地之力 |
| **场地波** | 无 (特殊处理) | 冲浪、热风、污泥波 |

**代表招式列表**:

```
暴风雪 (Blizzard)          - wind
飓风 (Hurricane)           - wind
神鸟猛击 (Aeroblast)       - wind
空气利刃 (Air Cutter)      - wind, slicing (→ PIERCE 优先)
爆音波 (Boomburst)         - sound
虫鸣 (Bug Buzz)            - sound
回声 (Echoed Voice)        - sound
地震 (Earthquake)          - 无 (需特殊标记)
冲浪 (Surf)                - 无 (需特殊标记)
```

**注意**: 地震、冲浪等招式在原 flags 中没有 `wind`/`sound`，需要**手动补充标记**或在代码中特殊处理。

---

### 3.4 PIERCE (穿透/切裂)

**特征**: 锋利的物理攻击，可切裂能量

**对应 Flags**: `slicing` (优先于 `contact`)

**细分类型**:

| 子类型 | Flag 组合 | 代表招式 |
|--------|----------|----------|
| **斩击** | `slicing` + `contact` | 暗影爪、燕返、居合斩、圣剑 |
| **远程斩** | `slicing` (无 contact) | 精神利刃、空气斩、水流裁 |
| **刺击** | `slicing` + `contact` | 钻角攻击、毒刺 |

**代表招式列表**:

```
燕返 (Aerial Ace)          - contact, slicing
暗影爪 (Shadow Claw)       - contact, slicing
圣剑 (Sacred Sword)        - contact, slicing
居合斩 (Cut)               - contact, slicing
精神利刃 (Psycho Cut)      - slicing (无 contact)
空气斩 (Air Slash)         - slicing (无 contact)
水流裁 (Aqua Cutter)       - slicing (无 contact)
苦恶之剑 (Bitter Blade)    - contact, slicing
```

---

## 四、属性克制与对冲交互

### 4.1 属性对对冲的影响

不同属性的招式在对冲时有额外的交互效果：

| 属性组合 | 效果 | 描述 |
|----------|------|------|
| **火 vs 水** | 水方 +30% CP | 水克火，蒸发效果 |
| **火 vs 冰** | 火方 +50% CP | 火融冰，压倒性优势 |
| **火 vs 草** | 火方 +30% CP | 火烧草 |
| **水 vs 电** | 电方 +20% CP | 导电效果 |
| **地 vs 电** | 地方免疫 | 电系无法对冲地面波动 |
| **飞 vs 地** | 飞方免疫 | 地震无法命中飞行投射 |
| **幽灵 vs 普通** | 互相穿透 | 无法对冲，各自命中 |
| **龙 vs 龙** | 双方 +20% CP | 龙之对决，更激烈 |
| **钢 vs 岩** | 双方 -20% 伤害 | 硬碰硬，抵消 |

### 4.2 属性加成公式

```javascript
function getTypeClashModifier(moveA, moveB) {
    const typeA = moveA.type;
    const typeB = moveB.type;
    
    // 克制关系加成
    const effectiveness = getTypeEffectiveness(typeA, [typeB]);
    
    if (effectiveness >= 2) return 1.3;  // 克制 +30%
    if (effectiveness <= 0.5) return 0.7; // 被克 -30%
    if (effectiveness === 0) return 0;    // 免疫 = 无法对冲
    
    return 1.0; // 正常
}
```

---

## 五、对冲优先矩阵 (Clash Matrix)

### 5.1 基础矩阵

当两个招式在时间轴上重叠时，根据 Clash Type 决定交互方式：

```
         │ BEAM      │ SOLID     │ WAVE      │ PIERCE
─────────┼───────────┼───────────┼───────────┼───────────
BEAM     │ 对波      │ 通常BEAM胜│ BEAM穿透  │ 被切裂
         │ (CP Check)│ 近距SOLID │ WAVE      │ (PIERCE胜)
─────────┼───────────┼───────────┼───────────┼───────────
SOLID    │ 硬抗/闪避 │ 拼刀      │ SOLID突破 │ 拼刀
         │           │ (CP Check)│           │ (高暴击)
─────────┼───────────┼───────────┼───────────┼───────────
WAVE     │ 被穿透    │ 被突破    │ 叠加/抵消 │ 无效
         │           │           │ (CP Check)│ (WAVE消散)
─────────┼───────────┼───────────┼───────────┼───────────
PIERCE   │ 切裂BEAM  │ 拼刀      │ 无效      │ 交叉斩
         │ (PIERCE胜)│ (高暴击)  │ (穿透)    │ (双伤)
```

### 5.2 矩阵结果解释

| 结果 | 描述 | 效果 |
|------|------|------|
| **对波 (CP Check)** | 双方能量碰撞 | 比较 Clash Power，高者获胜 |
| **通常X胜** | 类型优势 | 优势方自动获得 +50% CP |
| **穿透** | 无法阻挡 | 被穿透方招式无效，穿透方全额命中 |
| **拼刀** | 近身对决 | CP Check + 双方都有暴击加成 |
| **切裂** | 利刃切开能量 | PIERCE 方自动获胜 |
| **突破** | 强行冲过 | SOLID 无视 WAVE，全额命中 |
| **抵消/叠加** | 波动干涉 | CP 接近则抵消，差距大则叠加 |
| **无效** | 无法交互 | 各自命中原目标 |
| **交叉斩** | 双刃相交 | 双方都受到 50% 伤害 |

### 5.3 代码实现

```javascript
/**
 * 获取对冲交互结果
 * @param {string} typeA - 先手 Clash Type
 * @param {string} typeB - 后手 Clash Type
 * @returns {Object} { interaction, advantage, critBonus }
 */
function getClashInteraction(typeA, typeB) {
    const matrix = {
        'BEAM': {
            'BEAM':   { interaction: 'cpCheck', advantage: 0, critBonus: 0 },
            'SOLID':  { interaction: 'beamAdvantage', advantage: 0.5, critBonus: 0 },
            'WAVE':   { interaction: 'pierce', advantage: 1.0, critBonus: 0 },
            'PIERCE': { interaction: 'sliced', advantage: -1.0, critBonus: 0 }
        },
        'SOLID': {
            'BEAM':   { interaction: 'tankOrDodge', advantage: -0.3, critBonus: 0 },
            'SOLID':  { interaction: 'cpCheck', advantage: 0, critBonus: 0.2 },
            'WAVE':   { interaction: 'breakthrough', advantage: 0.8, critBonus: 0 },
            'PIERCE': { interaction: 'parry', advantage: 0, critBonus: 0.3 }
        },
        'WAVE': {
            'BEAM':   { interaction: 'pierced', advantage: -1.0, critBonus: 0 },
            'SOLID':  { interaction: 'broken', advantage: -0.8, critBonus: 0 },
            'WAVE':   { interaction: 'cpCheck', advantage: 0, critBonus: 0 },
            'PIERCE': { interaction: 'dissipate', advantage: -0.5, critBonus: 0 }
        },
        'PIERCE': {
            'BEAM':   { interaction: 'slice', advantage: 1.0, critBonus: 0 },
            'SOLID':  { interaction: 'parry', advantage: 0, critBonus: 0.3 },
            'WAVE':   { interaction: 'passThrough', advantage: 0.5, critBonus: 0 },
            'PIERCE': { interaction: 'crossSlash', advantage: 0, critBonus: 0.5 }
        }
    };
    
    return matrix[typeA]?.[typeB] || { interaction: 'cpCheck', advantage: 0, critBonus: 0 };
}
```

---

## 六、需要手动补充的招式

以下招式在原 flags 中缺少关键标识，需要在代码中特殊处理：

### 6.1 应标记为 WAVE 但缺少 wind/sound

| 招式 | 英文 | 建议处理 |
|------|------|----------|
| 地震 | Earthquake | 代码特判 → WAVE |
| 震级 | Magnitude | 代码特判 → WAVE |
| 大地之力 | Earth Power | 代码特判 → WAVE |
| 冲浪 | Surf | 代码特判 → WAVE |
| 热风 | Heat Wave | 已有 wind ✓ |
| 污泥波 | Sludge Wave | 代码特判 → WAVE |
| 放电 | Discharge | 代码特判 → WAVE |

### 6.2 特殊处理列表

```javascript
const WAVE_OVERRIDE = [
    'earthquake', 'magnitude', 'earthpower', 'bulldoze',
    'surf', 'muddywater', 'sludgewave', 'discharge',
    'heatwave', 'icywind', 'sparklingaria'
];

function getClashType(move) {
    const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // 特殊处理：强制 WAVE
    if (WAVE_OVERRIDE.includes(moveId)) return 'WAVE';
    
    // ... 正常 flags 判断
}
```

---

## 七、变化技与对冲

### 7.1 变化技不参与对冲

变化技 (`category: 'Status'`) 不能发起或参与对冲：

```javascript
function canClash(move) {
    // 变化技不能对冲
    if (move.category === 'Status') return false;
    
    // 威力为 0 的招式不能对冲
    if (!move.basePower || move.basePower === 0) return false;
    
    return true;
}
```

### 7.2 特殊招式处理

| 招式类型 | 处理方式 |
|----------|----------|
| **守住类** | 不参与对冲，但可阻挡对冲结果 |
| **蓄力技** | 蓄力回合不参与，释放回合可对冲 |
| **多段攻击** | 只有第一段参与对冲判定 |
| **固定伤害** | 使用固定值作为 CP |
| **反击类** | 不能主动对冲，但可被动触发 |

---

## 八、Clash Power (CP) 计算公式

### 8.1 基础公式

```
CP = BasePower × (Atk or SpA) / 100 × TypeModifier × ClashAdvantage × RNG
```

### 8.2 详细计算

```javascript
function calculateClashPower(user, move, opponent, opponentMove) {
    const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const fullMoveData = MOVES[moveId] || {};
    
    // 基础威力
    let basePower = move.basePower || fullMoveData.basePower || 0;
    
    // 攻击/特攻
    const isSpecial = (move.category === 'Special' || move.cat === 'spec');
    const atkStat = isSpecial ? user.getStat('spa') : user.getStat('atk');
    
    // 属性克制加成
    const typeModifier = getTypeClashModifier(move, opponentMove);
    
    // Clash Type 优势
    const myClashType = getClashType(move);
    const theirClashType = getClashType(opponentMove);
    const interaction = getClashInteraction(myClashType, theirClashType);
    const clashAdvantage = 1 + interaction.advantage;
    
    // 乱数 (0.9 ~ 1.1)
    const rng = 0.9 + Math.random() * 0.2;
    
    // 最终 CP
    const cp = Math.floor(basePower * (atkStat / 100) * typeModifier * clashAdvantage * rng);
    
    return {
        cp,
        clashType: myClashType,
        interaction: interaction.interaction,
        critBonus: interaction.critBonus
    };
}
```

---

## 九、对冲结果判定

### 9.1 结果类型

| 结果 | 条件 | 效果 |
|------|------|------|
| **Overpower (碾压)** | CP_A ≥ 2 × CP_B | A 全额命中，B 被中断 |
| **Dominate (压制)** | CP_A ≥ 1.5 × CP_B | A 命中 75%，B 被中断 |
| **Pierce (削减)** | CP_A > CP_B × 1.3 | A 命中 50%，B 被中断 |
| **Neutralize (抵消)** | 差距 < 30% | 双方无伤，PP 扣除 |
| **Backfire (反噬)** | CP_A < CP_B × 0.7 | A 被中断，B 命中 50% |

### 9.2 代码实现

```javascript
function resolveClash(cpA, cpB, moveA, moveB, userA, userB) {
    const ratio = cpA / cpB;
    
    let result = {
        winner: null,
        loser: null,
        damageMultiplierA: 0,
        damageMultiplierB: 0,
        type: 'neutralize'
    };
    
    if (ratio >= 2.0) {
        // Overpower: A 碾压 B
        result = { winner: 'A', loser: 'B', damageMultiplierA: 1.0, damageMultiplierB: 0, type: 'overpower' };
    } else if (ratio >= 1.5) {
        // Dominate: A 压制 B
        result = { winner: 'A', loser: 'B', damageMultiplierA: 0.75, damageMultiplierB: 0, type: 'dominate' };
    } else if (ratio >= 1.3) {
        // Pierce: A 削减命中
        result = { winner: 'A', loser: 'B', damageMultiplierA: 0.5, damageMultiplierB: 0, type: 'pierce' };
    } else if (ratio >= 0.77) {
        // Neutralize: 抵消
        result = { winner: null, loser: null, damageMultiplierA: 0, damageMultiplierB: 0, type: 'neutralize' };
    } else if (ratio >= 0.5) {
        // Backfire: B 反击
        result = { winner: 'B', loser: 'A', damageMultiplierA: 0, damageMultiplierB: 0.5, type: 'backfire' };
    } else {
        // B Overpower
        result = { winner: 'B', loser: 'A', damageMultiplierA: 0, damageMultiplierB: 1.0, type: 'overpower' };
    }
    
    return result;
}
```

---

## 十、UI 表现建议

### 10.1 对冲动画

| 结果类型 | 动画效果 |
|----------|----------|
| **Overpower** | 一方能量完全吞噬另一方，爆炸 |
| **Dominate** | 能量推进，压制对方 |
| **Pierce** | 能量穿透，残余命中 |
| **Neutralize** | 中心爆炸，烟雾弥漫 |
| **Backfire** | 能量反弹，反噬发起者 |

### 10.2 日志文案

```javascript
const CLASH_MESSAGES = {
    overpower: [
        '{winner}的{move}完全压制了对方！',
        '{winner}的{move}势不可挡！',
        '压倒性的力量！{winner}的{move}碾压了一切！'
    ],
    dominate: [
        '{winner}的{move}占据了上风！',
        '{winner}的{move}压制住了对方的攻击！'
    ],
    pierce: [
        '{winner}的{move}穿透了对方的攻击！',
        '能量对冲！{winner}的{move}略胜一筹！'
    ],
    neutralize: [
        '两股能量相互抵消了！',
        '势均力敌！双方的攻击同时消散！',
        '完美的对冲！双方都没有受到伤害！'
    ],
    backfire: [
        '{winner}的{move}反击成功！',
        '{loser}的攻击被弹回来了！'
    ]
};
```

---

## 附录 A：常用招式 Clash Type 速查表

| 招式 | 英文 | Flags | Clash Type |
|------|------|-------|------------|
| 十万伏特 | Thunderbolt | - | BEAM |
| 喷射火焰 | Flamethrower | - | BEAM |
| 冰冻光束 | Ice Beam | - | BEAM |
| 暗影球 | Shadow Ball | bullet | BEAM |
| 波导弹 | Aura Sphere | bullet, pulse | BEAM |
| 能量球 | Energy Ball | bullet | BEAM |
| 近身战 | Close Combat | contact | SOLID |
| 蛮力 | Superpower | contact | SOLID |
| 铁头 | Iron Head | contact | SOLID |
| 咬碎 | Crunch | contact, bite | SOLID |
| 音速拳 | Mach Punch | contact, punch | SOLID |
| 燕返 | Aerial Ace | contact, slicing | PIERCE |
| 暗影爪 | Shadow Claw | contact, slicing | PIERCE |
| 精神利刃 | Psycho Cut | slicing | PIERCE |
| 空气斩 | Air Slash | slicing | PIERCE |
| 暴风雪 | Blizzard | wind | WAVE |
| 飓风 | Hurricane | wind | WAVE |
| 爆音波 | Boomburst | sound | WAVE |
| 地震 | Earthquake | - (特判) | WAVE |
| 冲浪 | Surf | - (特判) | WAVE |

---

## 附录 B：开发检查清单

- [ ] 实现 `getClashType()` 函数
- [ ] 实现 `getClashInteraction()` 矩阵
- [ ] 实现 `calculateClashPower()` 公式
- [ ] 实现 `resolveClash()` 结果判定
- [ ] 添加 WAVE_OVERRIDE 特殊处理列表
- [ ] 实现对冲动画
- [ ] 实现对冲日志文案
- [ ] 测试各类型组合
