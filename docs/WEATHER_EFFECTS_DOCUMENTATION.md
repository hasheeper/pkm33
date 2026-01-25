# Weather Effects System - 完整技术文档

## 概述

`weather-effects.js` 是宝可梦对战系统的天气效果核心模块，统一管理所有天气的机制逻辑。该模块采用纯数据驱动设计，无外部依赖，通过配置化方式实现了 10 种天气系统，包括普通天气、始源天气、区域天气和环境天气。

**文件路径**: `/Users/liuhang/Documents/pkm12/engine/weather-effects.js`  
**总行数**: 2171 行  
**导出函数数量**: 60+ 个

---

## 核心架构

### 1. 天气分类体系

天气系统按照影响范围和优先级分为四个层级：

#### 1.1 普通天气 (Normal Weather)
- **特点**: 可被其他天气覆盖，持续 5-8 回合
- **包含**: `rain`, `sun`, `sandstorm`, `snow`
- **触发方式**: 宝可梦招式（求雨、大晴天等）

#### 1.2 始源天气 (Primal Weather)
- **特点**: 不可被普通天气覆盖，不递减回合，只能被其他始源天气替换
- **标识**: `isPrimal: true`
- **包含**: `harshsun`, `heavyrain`, `deltastream`
- **触发方式**: 原始固拉多/原始盖欧卡/超级烈空坐的特性

#### 1.3 区域天气 (Regional Weather)
- **特点**: 特定地图的环境天气，具有独特机制
- **标识**: `isRegional: true`
- **包含**: `smog` (N区), `ashfall` (A区), `fog` (S区), `gale` (B区)
- **触发方式**: 进入特定区域自动生效

#### 1.4 环境天气 (Environmental Weather)
- **特点**: 剧情/Boss 战专属，无限持续，具有压制系统
- **标识**: `isEnvironmental: true`
- **包含**: `ambrosia` (C区神秘区), `chronalrift` (S区绝对领域)
- **压制等级**: Tier 2 (有抑制) / Tier 3 (绝对领域)

---

## 天气配置数据结构

### WEATHER_CONFIG 对象

所有天气配置集中在 `WEATHER_CONFIG` 对象中（第 48-571 行），每个天气包含以下字段：

```javascript
{
    name: '天气中文名',
    icon: '🌧️',
    isPrimal: boolean,        // 是否为始源天气
    isRegional: boolean,      // 是否为区域天气
    isEnvironmental: boolean, // 是否为环境天气
    tier: number,             // 压制等级 (1/2/3)
    
    // 威力修正
    powerModifiers: {
        Water: 1.5,  // 水系威力 x1.5
        Fire: 0.5    // 火系威力 x0.5
    },
    
    // 命中率修正
    accuracyModifiers: {
        Thunder: true  // 雷电必中
    },
    
    // 回合末伤害
    endTurnDamage: {
        fraction: 1/16,
        immuneTypes: ['Rock', 'Ground'],
        immuneAbilities: ['sandveil', 'magicguard']
    },
    
    // 防御加成
    defenseBoost: {
        types: ['Rock'],
        stat: 'spd',      // 'spd' = 特防, 'def' = 物防
        multiplier: 1.5
    },
    
    // 特殊效果
    effects: {
        // 各种天气特有的效果配置
    },
    
    visualKey: 'rain'  // 对应 battle-weather.js 的粒子类型
}
```

---

## 天气详细机制

### 普通天气

#### Rain (雨天)
- **威力修正**: 水系 x1.5, 火系 x0.5
- **命中率**: 雷电/暴风必中
- **特殊**: 日光束威力减半

#### Sun (晴天)
- **威力修正**: 火系 x1.5, 水系 x0.5
- **特殊**: 日光束无需蓄力，光合作用/晨光/月光回复 2/3 HP

#### Sandstorm (沙暴)
- **回合末伤害**: 1/16 HP (岩/地/钢免疫)
- **防御加成**: 岩石系特防 x1.5

#### Snow (雪天)
- **防御加成**: 冰系物防 x1.5 (Gen 9 机制)
- **特殊**: 暴风雪必中，允许使用极光幕

### 始源天气

#### Harsh Sun (大日照)
- **威力修正**: 火系 x1.5, **水系完全失效 (x0)**
- **特殊**: 水系攻击招式直接失败

#### Heavy Rain (大雨)
- **威力修正**: 水系 x1.5, **火系完全失效 (x0)**
- **特殊**: 火系攻击招式直接失败

#### Delta Stream (乱气流)
- **特殊**: 飞行系弱点变为普通效果 (2x → 1x)

---

## 区域天气机制

### Smog (烟霾 - N区需虹区)

**四大机制**:

1. **呼吸道腐蚀 (Respiratory Breakdown)**
   - 回合末伤害 1/16 HP
   - 免疫: 毒/钢/电系，防尘/魔防/白色烟雾特性

2. **化学屏障 (Chemical Inertia)**
   - **所有回复效果减半** (树果、剩饭、吸取、特性回复等)
   - 实现: `getHealingMultiplier()` 返回 0.5
   - 统一入口: `applyHeal()` 函数自动应用减半

3. **腐蚀气体 (Toxic Rain)**
   - 气体/粉尘招式必中 (毒瓦斯、麻痹粉等)
   - 检查: `isGasMoveGuaranteedHit()`

4. **易爆气体 (Volatile Fumes)**
   - 火系威力 x1.2，但使用后受到 10% 反冲伤害
   - 恶臭特性畸缩率提升至 30%

### Ashfall (火山灰 - A区极诣区)

**四大机制**:

1. **积灰迟滞 (Clogged Gears)**
   - 接地宝可梦速度 x0.67
   - 钢系额外惩罚 x0.5 (无火/地/岩副属性)
   - 免疫: 飞行/火/岩/地系，漂浮特性，气球道具
   - 实现: `getAshfallSpeedMultiplier()`

2. **覆盖失效 (Blanketed)**
   - 树果和剩饭道具失效
   - 检查: `isItemBlanketed()`

3. **灼热大地 (Scorched Earth)**
   - 地面系招式有 20% 几率灼伤目标 (火系免疫)
   - 实现: `getScorchedEarthBurnChance()`

4. **扬尘暴击 (Dust Devil)**
   - 岩石系招式暴击率 +1
   - 实现: `getDustDevilCritBoost()`

### Fog (暗影迷雾 - S区暗影区)

**四大机制**:

1. **视觉遮断 (Hazed Vision)**
   - 非幽灵/恶系命中率 x0.8
   - 免疫: 锐利目光/心眼/胜利之星特性
   - 实现: `getHazedVisionAccuracyMultiplier()`

2. **夜之民 (Nocturnal Predator)**
   - 幽灵/恶系闪避 +1
   - 实现: `getNocturnalPredatorEvasionBoost()`

3. **必中技特化 (Guided Strike)**
   - 必中技 (accuracy: true) 威力 x1.25
   - 实现: `getGuidedStrikePowerMultiplier()`

4. **光线折射 (Refraction)**
   - 日光束/日光刃威力 x0.5
   - 其他 Beam 类招式威力 x0.8
   - 实现: `getRefractionPowerMultiplier()`

### Gale (香风 - B区盛放区)

**七大机制**:

1. **孢子传媒 (Pollen Carrier)**
   - 粉末/孢子招式必中 + 穿透替身
   - 实现: `getPollenCarrierEffect()`

2. **过和湿气 (Saturated Air)**
   - 火系威力 x0.5，无法灼伤
   - 实现: `getSaturatedAirPowerMultiplier()`, `doesSaturatedAirPreventBurn()`

3. **生机传导 (Vitality Surge)**
   - 吸取类招式威力 x1.2
   - 吸取回复比率 50% → 66%
   - 寄生种子伤害 1/8 → 1/6
   - 实现: `getVitalitySurgePowerMultiplier()`, `getVitalitySurgeDrainRatio()`, `getVitalitySurgeLeechSeedRatio()`

4. **水汽对流 (Hydro-Lift)**
   - 水系 + (飞行系或漂浮) 进场速度 +1
   - 实现: `getHydroLiftSpeedBoost()`

5. **飞叶风暴 (Razor Wind)**
   - 草系切斩/风类招式暴击 +1
   - 实现: `getRazorWindCritBoost()`

6. **极速解冻 (Rapid Thaw)**
   - 冰系防御 x0.7
   - 冰冻状态自动解除
   - 实现: `getRapidThawDefenseMultiplier()`, `checkRapidThawCure()`

---

## 环境天气机制

### Ambrosia (神之琼浆 - C区神秘区)

**五大机制**:

1. **唯心实体化 (Psychic Mind)**
   - 全员暴击率 +1
   - 实现: `getPsychicMindCritBoost()`

2. **AVS 羁绊系统倍率**
   - AVS 触发率 x2
   - 实现: `getAVSMultiplier()`

3. **时空醉 (Neuro-Backlash)**
   - 使用 Mega/Z招式/极巨化/太晶化后，下回合陷入混乱
   - 穿透神秘守护
   - Boss 免疫 (isAdmin 标记)
   - 实现: `checkNeuroBacklash()`, `applyNeuroBacklashConfusion()`

4. **无限场地 (Infinite Terrain)**
   - 超能场地/薄雾场地永久持续
   - 实现: `isTerrainInfinite()`

5. **污染回火 (Contamination Recoil)**
   - 毒/恶系招式威力 ≥90 时触发
   - 效果: 暴击率 -1 或 30% 混乱
   - 实现: `checkContaminationRecoil()`

### Chronal Rift (时空裂隙 - S区绝对领域)

**五大机制**:

1. **古今悖论 (Paradox Resonance)**
   - 自动激活古代活性/夸克充能特性
   - 异兽气场: 非时空类招式伤害 -20%
   - 免疫来源: 悖谬种、异兽、洗翠、起源形态
   - 实现: `checkParadoxResonance()`, `checkBeastAura()`
   - **依赖**: `window.POKEMON_CATEGORIES` 系统

2. **洗翠无法 (Unbound Arts)**
   - **刚猛 (Strong Style)**:
     - 无冷却，伤害 x1.5，命中 x0.85，优先度 -1
     - 洗翠/起源形态: 无视命中惩罚 (命中 x1.0)
   - **迅疾 (Agile Style)**:
     - 无冷却，优先度 +1
     - 速度快: 威力 x1.0，速度慢: 威力 x0.9
     - 洗翠/起源形态: 总是满威力 (x1.0)
   - 实现: `getUnboundArtsModifier()`
   - **依赖**: `window.POKEMON_CATEGORIES` 检查洗翠/起源形态

3. **速度熵增 (Entropy Flux)**
   - 每回合开始 15% 概率翻转戏法空间状态
   - 翻转后的戏法空间无回合限制 (infiniteDuration)
   - 实现: `checkEntropyFlux()`

4. **起源共鸣 (Origin Pulse)**
   - 洗翠/起源形态在洗翠无法中获得额外加成
   - 识别关键词: 'hisui', 'hisuian', 'origin'
   - 已整合到 `getUnboundArtsModifier()` 中

5. **技能黑箱 (Move Glitch)**
   - **触发条件**:
     - 科技类招式 (multiattack, technoblast, flashcannon 等)
     - 人造/机械类宝可梦 (porygon, genesect, magearna 等)
     - **仅 iron 开头的未来悖谬种** (排除 Miraidon/Koraidon)
   - **效果**:
     - 20% 暴击成功: 威力 x2
     - 10% 失败: 威力 x0 (招式失败)
   - 实现: `checkMoveGlitch()`
   - **依赖**: `window.POKEMON_CATEGORIES` 检查 'artificial' 和 'paradox_future'

---

## 核心函数详解

### 天气查询函数

#### `normalizeWeatherId(weatherId)`
- **功能**: 标准化天气 ID (冰雹 → 雪天)
- **返回**: 标准化后的天气 ID

#### `getWeatherConfig(weather)`
- **功能**: 获取天气配置对象
- **返回**: 配置对象或 null

#### `isPrimalWeather(weather)`
- **功能**: 检查是否为始源天气
- **返回**: boolean

### 天气伤害系统

#### `isWeatherDamageImmune(pokemon, weather)`
- **检查顺序**:
  1. 类型免疫 (immuneTypes)
  2. 特性免疫 (immuneAbilities)
  3. 道具免疫 (Safety Goggles)
- **返回**: boolean

#### `getWeatherDamage(pokemon, weather)`
- **计算公式**: `Math.floor(maxHp * fraction)`
- **最小值**: 1
- **返回**: 伤害值 (0 = 免疫)

#### `getWeatherDamageLog(pokemon, weather, damage)`
- **返回**: 日志文本 (如 "大剑鬼 受到沙暴的伤害! (-25)")

### 威力修正系统

#### `getWeatherPowerModifier(weather, moveType, moveName)`
- **特判**: Hydro Steam 在晴天威力 x1.5 (而非 x0.5)
- **返回**: `{ modifier: number, log: string|null }`
- **modifier = 0**: 招式完全失效 (大日照/大雨)

### 命中率修正系统

#### `getWeatherAccuracyModifier(weather, moveName)`
- **雨天**: 雷电/暴风必中
- **晴天**: 雷电/暴风命中率降至 50%
- **雪天**: 暴风雪必中
- **返回**: `{ accuracy: true|number|null, log: string|null }`
  - `true` = 必中
  - `number` = 修正后命中率
  - `null` = 不修改

### 防御加成系统

#### `getWeatherDefenseBoost(weather, defenderTypes, isSpecial)`
- **沙暴**: 岩石系特防 x1.5 (仅特殊攻击)
- **雪天**: 冰系物防 x1.5 (仅物理攻击)
- **返回**: `{ multiplier: number, log: string|null }`

### 统一治愈函数

#### `applyHeal(pokemon, baseAmount, options)`
- **功能**: 处理所有 HP 回复，自动应用 Smog 化学屏障减半
- **参数**:
  - `pokemon`: 要回复的宝可梦
  - `baseAmount`: 基础回复量
  - `options.bypassWeather`: 是否跳过天气减半 (治愈之愿等)
  - `options.source`: 回复来源 (用于日志)
- **返回**: 实际回复量
- **重要**: 所有回复来源都应使用此函数

### 接地检测系统

#### `isGrounded(pokemon)`
- **不接地条件**:
  1. 飞行系
  2. 漂浮特性
  3. 气球道具
  4. 电磁浮游状态 (magnetrise)
  5. 念力移物状态 (telekinesis)
- **返回**: boolean
- **用途**: Ashfall 积灰迟滞判定

---

## 压制系统 (Suppression Tier System)

### 压制等级常量

```javascript
SUPPRESSION_TIER = {
    NORMAL: 1,      // 无影响 - 宝可梦天气正常覆盖
    SUPPRESSED: 2,  // 有抑制 - 宝可梦天气持续回合数减半
    ABSOLUTE: 3     // 绝对领域 - 宝可梦天气技能直接失败
}
```

### `getEnvironmentSuppressionTier(battle)`
- **判定逻辑**:
  1. 优先读取 `battle.environmentConfig.suppressionTier`
  2. 始源天气 → Tier 3
  3. 区域天气 → Tier 2
  4. 普通天气 → Tier 1
- **返回**: 1/2/3

### `tryDeployWeather(battle, newWeather, options)`
- **统一入口**: 所有宝可梦天气技能都应调用此函数
- **参数**:
  - `newWeather`: 要展开的天气 ID
  - `options.itemId`: 使用者道具 ID (延长岩石判定)
  - `options.weatherName`: 天气中文名 (日志)
  - `options.visualKey`: 视觉效果 key
- **返回**: `{ success: boolean, logs: string[], weatherTurns: number }`
- **逻辑**:
  1. Tier 3: 直接失败，返回阻止日志
  2. Tier 2: 成功但回合数减半 (5→2, 8→4)
  3. Tier 1: 正常展开
  4. 自动调用 `window.setWeatherVisuals()`

### `getWeatherRevertMessage(battle)`
- **功能**: 获取天气回归时的日志消息
- **优先级**: 自定义消息 > 默认消息
- **返回**: HTML 格式日志

---

## 依赖系统

### POKEMON_CATEGORIES 系统

时空裂隙的三个机制依赖 `window.POKEMON_CATEGORIES`:

1. **checkBeastAura** (异兽气场)
   - 检查防御方是否为 'ultrabeast'
   - 检查攻击方是否为 'paradox', 'ultrabeast', 'hisuian', 'origin'

2. **getUnboundArtsModifier** (洗翠无法)
   - 检查使用者是否为 'hisuian' 或 'origin'

3. **checkMoveGlitch** (技能黑箱)
   - 检查使用者是否为 'artificial'
   - 检查 iron 开头的宝可梦是否为 'paradox_future'

**降级策略**: 如果 `POKEMON_CATEGORIES` 不可用，使用硬编码列表或字符串匹配

### MOVES 数据依赖

以下函数需要访问 `window.MOVES` 获取完整招式数据:

- `getGuidedStrikePowerMultiplier()`: 检查 accuracy === true
- `getRefractionPowerMultiplier()`: 检查招式 ID 包含 'beam'
- `getPollenCarrierEffect()`: 检查 flags.powder
- `getVitalitySurgePowerMultiplier()`: 检查 drain 属性
- `getRazorWindCritBoost()`: 检查 flags.slicing / flags.wind

---

## 全局导出

所有函数通过 `window.WeatherEffects` 导出（第 2102-2170 行）:

```javascript
window.WeatherEffects = {
    // 基础查询
    normalizeWeatherId,
    getWeatherConfig,
    isPrimalWeather,
    
    // 伤害系统
    isWeatherDamageImmune,
    getWeatherDamage,
    getWeatherDamageLog,
    
    // 修正系统
    getWeatherPowerModifier,
    getWeatherAccuracyModifier,
    getWeatherDefenseBoost,
    
    // Smog 专用 (7个)
    getHealingMultiplier,
    applyHeal,
    isGasMoveGuaranteedHit,
    getWeatherRecoilPercent,
    getAbilityWeatherBoost,
    
    // Ashfall 专用 (5个)
    isGrounded,
    getAshfallSpeedMultiplier,
    isItemBlanketed,
    getScorchedEarthBurnChance,
    getDustDevilCritBoost,
    
    // Fog 专用 (5个)
    getHazedVisionAccuracyMultiplier,
    getNocturnalPredatorEvasionBoost,
    getGuidedStrikePowerMultiplier,
    getRefractionPowerMultiplier,
    isImmuneToHazedVision,
    
    // Gale 专用 (9个)
    getPollenCarrierEffect,
    getSaturatedAirPowerMultiplier,
    doesSaturatedAirPreventBurn,
    getVitalitySurgePowerMultiplier,
    getVitalitySurgeDrainRatio,
    getVitalitySurgeLeechSeedRatio,
    getHydroLiftSpeedBoost,
    getRazorWindCritBoost,
    getRapidThawDefenseMultiplier,
    doesRapidThawPreventFreeze,
    checkRapidThawCure,
    
    // Ambrosia 专用 (6个)
    getPsychicMindCritBoost,
    getAVSMultiplier,
    checkNeuroBacklash,
    applyNeuroBacklashConfusion,
    isTerrainInfinite,
    checkContaminationRecoil,
    
    // Chronal Rift 专用 (6个)
    isChronalRift,
    checkParadoxResonance,
    checkBeastAura,
    getUnboundArtsModifier,
    checkEntropyFlux,
    checkMoveGlitch,
    
    // 压制系统 (4个)
    SUPPRESSION_TIER,
    getEnvironmentSuppressionTier,
    tryDeployWeather,
    getWeatherRevertMessage,
    
    // 配置数据
    WEATHER_CONFIG
};
```

---

## 使用示例

### 示例 1: 检查天气伤害

```javascript
// 回合末处理沙暴伤害
const weather = battle.weather;
const pokemon = battle.playerPokemon;

if (!window.WeatherEffects.isWeatherDamageImmune(pokemon, weather)) {
    const damage = window.WeatherEffects.getWeatherDamage(pokemon, weather);
    pokemon.currHp -= damage;
    const log = window.WeatherEffects.getWeatherDamageLog(pokemon, weather, damage);
    addBattleLog(log);
}
```

### 示例 2: 应用天气威力修正

```javascript
// 在 calcDamage 中应用天气修正
const weather = battle.weather;
const moveType = move.type;
const moveName = move.name;

const { modifier, log } = window.WeatherEffects.getWeatherPowerModifier(
    weather, moveType, moveName
);

if (modifier === 0) {
    // 招式被天气阻止
    return { blocked: true, message: log };
}

basePower *= modifier;
if (log) addBattleLog(log);
```

### 示例 3: 使用统一治愈函数

```javascript
// 剩饭回复 (自动应用 Smog 减半)
const healAmount = Math.floor(pokemon.maxHp / 16);
const actualHeal = window.WeatherEffects.applyHeal(pokemon, healAmount, {
    source: 'leftovers'
});
addBattleLog(`${pokemon.cnName} 的剩饭回复了 ${actualHeal} HP！`);

// 治愈之愿 (跳过天气减半)
const wishHeal = Math.floor(pokemon.maxHp / 2);
const actualWishHeal = window.WeatherEffects.applyHeal(pokemon, wishHeal, {
    bypassWeather: true,
    source: 'wish'
});
```

### 示例 4: 检查时空裂隙机制

```javascript
// 检查异兽气场
const weather = 'chronalrift';
const defender = battle.enemyPokemon;
const attacker = battle.playerPokemon;

const { hasAura, damageMultiplier, message } = 
    window.WeatherEffects.checkBeastAura(weather, defender, attacker);

if (hasAura) {
    damage = Math.floor(damage * damageMultiplier);
    addBattleLog(message);
}

// 检查技能黑箱
const { triggered, effect, powerMultiplier, message } = 
    window.WeatherEffects.checkMoveGlitch(weather, move, attacker);

if (triggered) {
    if (effect === 'fail') {
        return { failed: true, message };
    } else if (effect === 'critical') {
        basePower *= powerMultiplier;
        addBattleLog(message);
    }
}
```

### 示例 5: 展开宝可梦天气

```javascript
// 使用求雨技能
const result = window.WeatherEffects.tryDeployWeather(battle, 'rain', {
    itemId: pokemon.item,  // 检查是否携带湿润岩石
    weatherName: '雨天',
    visualKey: 'rain'
});

if (result.success) {
    addBattleLog(`开始下雨了！(${result.weatherTurns}回合)`);
    result.logs.forEach(log => addBattleLog(log));
} else {
    result.logs.forEach(log => addBattleLog(log));
}
```

---

## 设计原则

1. **纯数据驱动**: 所有天气逻辑通过配置对象定义，便于扩展和维护
2. **统一接口**: 相同类型的效果使用统一的函数接口
3. **降级策略**: 依赖外部系统时提供降级方案
4. **日志友好**: 所有修正函数返回日志文本，便于调试和显示
5. **类型安全**: 使用 JSDoc 注释标注参数和返回值类型
6. **模块化**: 按天气类型分组函数，便于查找和维护

---

## 已知问题与注意事项

1. **POKEMON_CATEGORIES 依赖**: 时空裂隙的三个机制强依赖此系统，需确保在 `weather-effects.js` 加载前初始化

2. **MOVES 数据依赖**: 部分函数需要访问完整招式数据，确保 `moves-data.js` 已加载

3. **统一治愈函数**: 所有回复来源（树果、剩饭、吸取、特性等）都应使用 `applyHeal()` 以正确应用 Smog 减半

4. **天气 ID 标准化**: 使用天气 ID 前应先调用 `normalizeWeatherId()` (冰雹 → 雪天)

5. **压制系统**: 宝可梦天气技能必须使用 `tryDeployWeather()` 统一入口，不要直接修改 `battle.weather`

6. **视觉效果同步**: `tryDeployWeather()` 会自动调用 `window.setWeatherVisuals()`，确保该函数已定义

---

## 版本历史

- **v2.0**: 完整实现 10 种天气系统，引入压制系统
- **v1.5**: 添加环境天气 (Ambrosia, Chronal Rift)
- **v1.0**: 实现普通天气、始源天气、区域天气

---

## 相关文件

- `/Users/liuhang/Documents/pkm12/battle/battle-weather.js`: Canvas 粒子天气视觉系统
- `/Users/liuhang/Documents/pkm12/data/pokedex-data.js`: POKEMON_CATEGORIES 定义
- `/Users/liuhang/Documents/pkm12/data/moves-data.js`: MOVES 招式数据
- `/Users/liuhang/Documents/pkm12/engine/ability-handlers.js`: 特性处理器 (调用天气函数)
- `/Users/liuhang/Documents/pkm12/battle/battle-calc.js`: 伤害计算 (调用威力修正)
- `/Users/liuhang/Documents/pkm12/battle/battle-turns.js`: 回合处理 (调用速度熵增)
