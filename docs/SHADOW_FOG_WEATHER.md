# Shadow Fog (暗影迷雾) 天气系统

## 概述

**引擎 ID**: `fog`  
**区域**: S区 - Shadow 暗影区  
**主题**: 鬼影幢幢、都市怪谈、偷袭  
**视觉风格**: 乳白色高斯模糊覆盖中下层视野，偶尔有噪点闪过

---

## 核心机制

### A. 视觉遮断 (Hazed Vision)

**规则**: 非幽灵系/恶系的宝可梦，命中率修正为 **x0.8**

**免疫条件**:
- 幽灵系或恶系宝可梦
- 拥有以下特性: 锐利目光 (Keen Eye)、心眼 (Mind's Eye)、胜利之星 (Victory Star)

**战术影响**:
| 原始命中率 | 迷雾中命中率 |
|-----------|-------------|
| 100% | 80% |
| 90% | 72% |
| 85% | 68% |
| 70% | 56% |

---

### B. 夜之民 (Nocturnal Predator)

**规则**: 幽灵系和恶系宝可梦获得 **+1 闪避等级**

**受益类型**:
- Ghost (幽灵)
- Dark (恶)

**RP 逻辑**: 它们本来就融于暗影。当你看不清它们时，它们不仅看得很清，甚至还能借助雾气隐藏身形。

---

### C. 必中技特化 (Guided Strike)

**规则**: 必中技 (accuracy: true) 威力 **x1.25**

**涵盖技能**:
- 燕返 (Aerial Ace)
- 波导弹 (Aura Sphere)
- 暗影拳 (Shadow Punch)
- 电击波 (Shock Wave)
- 高速星星 (Swift)
- 魔法叶 (Magical Leaf)
- 神智冲击 (Disarming Voice)
- 等其他 `accuracy: true` 的攻击技

**战术**: 带着路卡利欧 (波导弹) 或坚盾剑怪 (暗影拳) 来 S 区是版本答案。

---

### D. 光线折射 (Refraction)

**规则**: 光束类招式威力降低

| 招式类型 | 威力倍率 |
|---------|---------|
| Solar Beam / Solar Blade | x0.5 |
| 其他 Beam 类招式 | x0.8 |

**受影响招式**:
- Solar Beam (日光束) - x0.5
- Solar Blade (日光刃) - x0.5
- Ice Beam (冰冻光线) - x0.8
- Hyper Beam (破坏光线) - x0.8
- Aurora Beam (极光束) - x0.8
- Charge Beam (充电光束) - x0.8
- Psybeam (幻象光线) - x0.8
- 等其他名称包含 "beam" 的招式

**RP 逻辑**: 在漫天大雾里用激光笔照远处，光线会扩散，无法有效伤害敌人。

---

## 天气球效果

在暗影迷雾中，天气球 (Weather Ball) 变为:
- **属性**: Ghost (幽灵)
- **威力**: 100

---

## API 调用示例

```javascript
// 检查视觉遮断命中率倍率
const accMult = window.WeatherEffects.getHazedVisionAccuracyMultiplier('fog', attacker);
// 返回: 1 (免疫) 或 0.8 (受影响)

// 检查夜之民闪避加成
const evaBoost = window.WeatherEffects.getNocturnalPredatorEvasionBoost('fog', defender);
// 返回: 0 (无加成) 或 1 (幽灵/恶系)

// 检查必中技威力倍率
const guidedMult = window.WeatherEffects.getGuidedStrikePowerMultiplier('fog', move);
// 返回: 1 (普通招式) 或 1.25 (必中技)

// 检查光线折射威力倍率
const refractMult = window.WeatherEffects.getRefractionPowerMultiplier('fog', move);
// 返回: 1 (普通招式) 或 0.5/0.8 (Beam类)

// 检查是否免疫视觉遮断
const isImmune = window.WeatherEffects.isImmuneToHazedVision('fog', attacker);
// 返回: true/false
```

---

## 配置位置

- **天气配置**: `engine/weather-effects.js` → `WEATHER_CONFIG.fog`
- **辅助函数**: `engine/weather-effects.js` → Shadow Fog 辅助函数区块
- **命中率/闪避**: `battle/battle-calc.js` → 命中判定区块
- **威力修正**: `battle/battle-calc.js` → 天气威力修正区块
- **视觉效果**: `battle/battle-weather.js` → `CONFIG.fog`
- **CSS 样式**: `index.css` → `.bg-fog`

---

## 版本答案宝可梦

### 进攻端
- **路卡利欧** - 波导弹 (必中 + 威力加成)
- **坚盾剑怪** - 暗影拳 (必中 + 威力加成 + 夜之民闪避)
- **耿鬼** - 暗影球 (夜之民闪避 + 免疫命中惩罚)
- **阿勃梭鲁** - 暗系招式 (夜之民闪避 + 免疫命中惩罚)

### 防守端
- **幽灵/恶系** - 天生免疫命中惩罚 + 闪避加成
- **锐利目光特性** - 免疫命中惩罚

---

## 注意事项

1. 必中技的威力加成只对 `basePower > 0` 的攻击技生效，变化技不受影响
2. 光线折射对所有名称包含 "beam" 的招式生效（不区分大小写）
3. 夜之民的闪避加成是额外的闪避等级，会与宝可梦自身的闪避等级叠加
4. 视觉遮断的命中率惩罚在必中技面前无效
