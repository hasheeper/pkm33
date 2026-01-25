# 环境天气系统 (Environment Weather System)

## 概述

环境天气系统允许地图模块在战斗开始时预设天气效果，作为战斗场景的默认天气。宝可梦的天气技能/特性可以临时覆盖环境天气，但当这些效果结束后，天气会自动回归到环境天气。

## 配置方式

### JSON 配置结构

```json
{
  "settings": {
    "enableEnvironment": true   // 环境天气系统开关
  },
  
  "environment": {
    "weather": "rain",          // 天气类型
    "weatherTurns": 0           // 持续回合数 (0 = 永久)
  },
  
  "player": { ... },
  "enemy": { ... }
}
```

### 可用天气类型

| 值 | 天气效果 | 视觉效果 |
|---|---------|---------|
| `"none"` | 无天气 | 无 |
| `"rain"` | 雨天 | 蓝色雨丝 + 浅灰蓝背景 |
| `"sun"` | 晴天 | 金色光斑 + 浅金色背景 |
| `"sandstorm"` | 沙暴 | 横向沙粒 + 浅土色背景 |
| `"snow"` | 雪天 | 飘落雪花 + 浅天蓝背景 |
| `"hail"` | 冰雹 | 冰粒 + 浅天蓝背景 |

### 设置开关

- `settings.enableEnvironment`: 控制环境天气系统是否启用
  - `true` (默认): 启用环境天气
  - `false`: 禁用环境天气，战斗开始时无预设天气

## 运行机制

### 1. 初始化流程

```
战斗开始
    ↓
检查 enableEnvironment 开关
    ↓ (启用)
读取 environment.weather
    ↓
设置 battle.weather = envWeather
设置 battle.environmentWeather = envWeather (保存用于回归)
    ↓
显示环境天气日志
触发天气视觉效果
    ↓
触发入场特性 (可能覆盖环境天气)
```

### 2. 天气覆盖与回归

```
环境天气: 雨天 (永久)
    ↓
玩家使用 Sunny Day (晴天 5 回合)
    ↓
天气变为: 晴天
    ↓
5 回合后晴天结束
    ↓
检测到 environmentWeather = "rain"
    ↓
天气回归: 雨天
显示 "🌍 环境天气回归：雨天！"
```

### 3. 特性覆盖

宝可梦的天气特性 (Drizzle, Drought, Sand Stream, Snow Warning) 可以在入场时覆盖环境天气。当该宝可梦离场或天气被其他效果替换后，天气结束时会回归环境天气。

## 相关文件

| 文件 | 职责 |
|-----|-----|
| `engine/weather-effects.js` | **天气效果核心模块** - 统一管理天气配置、伤害、免疫、修正 |
| `systems/data-loader.js` | 定义 JSON 配置格式和默认值 |
| `index.js` | 读取配置并初始化环境天气 |
| `engine/battle-engine.js` | 天气回合递减和回归逻辑 |
| `battle/battle-weather.js` | Canvas 粒子天气视觉效果 |
| `index.css` | 天气背景色调样式 |

## 天气效果模块 API

`engine/weather-effects.js` 提供以下函数：

| 函数 | 说明 |
|-----|-----|
| `normalizeWeatherId(id)` | 标准化天气 ID（冰雹 → 雪天） |
| `getWeatherConfig(weather)` | 获取天气配置对象 |
| `isPrimalWeather(weather)` | 检查是否为始源天气 |
| `isWeatherDamageImmune(pokemon, weather)` | 检查宝可梦是否免疫天气伤害 |
| `getWeatherDamage(pokemon, weather)` | 计算天气回合末伤害 |
| `getWeatherPowerModifier(weather, moveType)` | 获取天气对招式威力的修正 |
| `getWeatherAccuracyModifier(weather, moveName)` | 获取天气对命中率的修正 |
| `getWeatherDefenseBoost(weather, types, isSpecial)` | 获取天气对防御的加成 |
| `checkWeatherBlocksMove(weather, moveType, power)` | 检查招式是否被天气阻止 |
| `canUseAuroraVeil(weather)` | 检查是否可以使用极光幕 |
| `isSolarBeamInstant(weather)` | 检查日光束是否可以瞬发 |
| `getWeatherBallStats(weather)` | 获取天气球的属性和威力 |
| `getRecoveryRatio(weather, moveName)` | 获取回复技能的回复比例 |

全局访问: `window.WeatherEffects.函数名()`

## 关键变量

| 变量 | 位置 | 说明 |
|-----|-----|-----|
| `battle.weather` | BattleState | 当前生效的天气 |
| `battle.weatherTurns` | BattleState | 天气剩余回合 (0 = 永久) |
| `battle.environmentWeather` | BattleState | 环境天气 (用于回归) |
| `GAME_SETTINGS.enableEnvironment` | window | 系统开关 |

## 使用示例

### 沙漠地图

```json
{
  "environment": {
    "weather": "sandstorm",
    "weatherTurns": 0
  }
}
```

### 雪山地图

```json
{
  "environment": {
    "weather": "snow",
    "weatherTurns": 0
  }
}
```

### 火山地图

```json
{
  "environment": {
    "weather": "sun",
    "weatherTurns": 0
  }
}
```

### 禁用环境天气

```json
{
  "settings": {
    "enableEnvironment": false
  }
}
```

## 天气效果一览

| 天气 | 火系威力 | 水系威力 | 其他效果 |
|-----|---------|---------|---------|
| 雨天 | x0.5 | x1.5 | 雷电必中 |
| 晴天 | x1.5 | x0.5 | 日光束无需蓄力 |
| 沙暴 | - | - | 岩石系特防x1.5，非岩/地/钢每回合损失1/16HP |
| 雪天 | - | - | 冰系防御x1.5 |
| 冰雹 | - | - | 非冰系每回合损失1/16HP |

## 注意事项

1. **始源天气不受影响**: Desolate Land、Primordial Sea、Delta Stream 不会被环境天气覆盖，也不会在结束后回归环境天气。

2. **优先级**: 入场特性 > 环境天气。如果首发宝可梦有天气特性，会覆盖环境天气。

3. **视觉效果**: 环境天气会触发 Canvas 粒子效果和背景色调变化。

4. **永久天气**: `weatherTurns: 0` 表示永久持续，不会自然结束。只有被其他天气覆盖时才会改变。
