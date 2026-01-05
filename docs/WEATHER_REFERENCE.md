# 天气系统参考文档 (Weather System Reference)

## 概述

本文档定义了 PKM 战斗系统中天气值的**统一标准**，确保所有模块使用一致的天气值命名。

---

## 标准天气值 (Standard Weather Values)

| 天气类型 | 标准值 | 中文名 | 效果 |
|---------|--------|-------|------|
| 晴天 | `sun` | 大晴天 | 火系威力×1.5，水系威力×0.5，日光束无需蓄力 |
| 雨天 | `rain` | 下雨 | 水系威力×1.5，火系威力×0.5，打雷必中 |
| 沙暴 | `sandstorm` | 沙暴 | 非岩/地/钢系每回合扣 1/16 HP，岩石系特防×1.5 |
| 冰雹 | `hail` | 冰雹 | 非冰系每回合扣 1/16 HP，暴风雪必中 |
| 雪天 | `snow` | 下雪 | 冰系防御×1.5（第九世代新增） |

## 极端天气值 (Extreme Weather Values)

| 天气类型 | 标准值 | 中文名 | 效果 |
|---------|--------|-------|------|
| 大日照 | `harshsun` | 大日照 | 火系威力×1.5，水系招式无效（原始固拉多） |
| 大雨 | `heavyrain` | 大雨 | 水系威力×1.5，火系招式无效（原始盖欧卡） |

---

## 天气设置来源

### 1. 天气招式 (Weather Moves)

```javascript
// engine/move-handlers.js

'Sunny Day': { battle.weather = 'sun' }      // 大晴天
'Rain Dance': { battle.weather = 'rain' }    // 求雨
'Sandstorm': { battle.weather = 'sandstorm' } // 沙暴
'Hail': { battle.weather = 'hail' }          // 冰雹
'Snowscape': { battle.weather = 'snow' }     // 雪景
```

### 2. 天气特性 (Weather Abilities)

```javascript
// engine/ability-handlers.js

'Drought': { battle.weather = 'sun' }        // 日照
'Drizzle': { battle.weather = 'rain' }       // 降雨
'Sand Stream': { battle.weather = 'sandstorm' } // 扬沙
'Snow Warning': { battle.weather = 'snow' }  // 降雪
```

### 3. 极巨招式 (Max Moves)

```javascript
// engine/move-handlers.js

'Max Flare': { battle.weather = 'sun' }      // 极巨火爆
'Max Geyser': { battle.weather = 'rain' }    // 极巨水流
'Max Hailstorm': { battle.weather = 'hail' } // 极巨寒冰
'Max Rockfall': { battle.weather = 'sandstorm' } // 极巨岩石
```

---

## 天气检查规范

### 晴天检查
```javascript
// 【推荐】兼容标准值和极端天气
const isSunny = weather === 'sun' || weather === 'harshsun';
```

### 雨天检查
```javascript
// 【推荐】兼容标准值和极端天气
const isRainy = weather === 'rain' || weather === 'heavyrain';
```

### 沙暴检查
```javascript
// 沙暴只有一个标准值
const isSandstorm = weather === 'sandstorm';
```

### 冰雹/雪天检查
```javascript
// 【推荐】兼容冰雹和雪天（部分特性两者都生效）
const isIcy = weather === 'hail' || weather === 'snow';
```

---

## 天气相关特性

### 速度翻倍特性

| 特性 | 英文名 | 触发天气 |
|-----|--------|---------|
| 叶绿素 | Chlorophyll | `sun`, `harshsun` |
| 悠游自如 | Swift Swim | `rain`, `heavyrain` |
| 拨沙 | Sand Rush | `sandstorm` |
| 拨雪 | Slush Rush | `snow`, `hail` |

### 回复/伤害特性

| 特性 | 英文名 | 效果 |
|-----|--------|-----|
| 干燥皮肤 | Dry Skin | 雨天回复 1/8 HP，晴天扣 1/8 HP |
| 雨盘 | Rain Dish | 雨天回复 1/16 HP |
| 冰冻之躯 | Ice Body | 冰雹/雪天回复 1/16 HP |
| 太阳之力 | Solar Power | 晴天特攻×1.5，每回合扣 1/8 HP |

### 状态免疫特性

| 特性 | 英文名 | 效果 |
|-----|--------|-----|
| 叶子防守 | Leaf Guard | 晴天免疫所有异常状态 |
| 湿润之躯 | Hydration | 雨天回合末治愈所有异常状态 |

---

## 天气威力修正

定义在 `engine/move-effects.js` 的 `WEATHER_TYPES` 常量中：

```javascript
const WEATHER_TYPES = {
    sun: { fireBoost: 1.5, waterNerf: 0.5 },
    rain: { waterBoost: 1.5, fireNerf: 0.5 },
    harshsun: { fireBoost: 1.5, waterNerf: 0, blockWater: true },
    heavyrain: { waterBoost: 1.5, fireNerf: 0, blockFire: true },
    // ...
};
```

---

## 天气回合数

天气默认持续 5 回合，可通过道具延长：

| 道具 | 英文名 | 效果 |
|-----|--------|-----|
| 炽热岩石 | Heat Rock | 晴天持续 8 回合 |
| 潮湿岩石 | Damp Rock | 雨天持续 8 回合 |
| 沙沙岩石 | Smooth Rock | 沙暴持续 8 回合 |
| 冰冷岩石 | Icy Rock | 冰雹/雪天持续 8 回合 |

---

## 历史遗留问题（已修复）

以下是之前存在的天气值不一致问题，现已统一修复：

| 位置 | 旧值 | 新值 |
|-----|------|------|
| Drought 特性 | `'sunnyday'` | `'sun'` |
| Drizzle 特性 | `'raindance'` | `'rain'` |
| Sandstorm 招式 | `'sand'` | `'sandstorm'` |
| Max Flare | `'sunnyday'` | `'sun'` |
| Max Geyser | `'raindance'` | `'rain'` |

---

## 添加新天气相关功能的规范

1. **设置天气时**：使用标准值（`sun`, `rain`, `sandstorm`, `hail`, `snow`）
2. **检查天气时**：使用兼容性检查（如 `weather === 'sun' || weather === 'harshsun'`）
3. **添加注释**：在代码中添加 `// 【天气统一】` 注释说明

---

## 文件索引

| 文件 | 职责 |
|-----|------|
| `engine/move-effects.js` | `WEATHER_TYPES` 常量定义，`getWeatherModifier()` 函数 |
| `engine/move-handlers.js` | 天气招式、极巨招式的天气设置 |
| `engine/ability-handlers.js` | 天气特性的天气设置和检查 |
| `battle/battle-turns.js` | 回合末天气伤害和特性效果 |

---

*最后更新: 2026-01-05*
