# 特性钩子系统文档 (Ability Hooks Documentation)

本文档记录了 `ability-handlers.js` 中所有可用的特性钩子及其调用时机。

## 钩子列表

### 1. 入场钩子 (Entry Hooks)

| 钩子名 | 参数 | 调用时机 | 示例特性 |
|--------|------|----------|----------|
| `onStart` | `(self, enemy, logs, battle)` | 宝可梦入场时 | Intimidate, Download, Trace, Imposter, Illusion |

### 2. 离场钩子 (Exit Hooks)

| 钩子名 | 参数 | 调用时机 | 示例特性 |
|--------|------|----------|----------|
| `onSwitchOut` | `(pokemon)` | 宝可梦换下时 | Regenerator, Natural Cure, Imposter |

### 3. 伤害修正钩子 (Damage Modification Hooks)

| 钩子名 | 参数 | 调用时机 | 示例特性 |
|--------|------|----------|----------|
| `onBasePower` | `(power, attacker, defender, move, battle)` | 计算招式基础威力时 | Technician, Reckless, Iron Fist |
| `onDefenderModifyDamage` | `(damage, attacker, defender, move, effectiveness)` | 防御方修正伤害时 | Thick Fat, Filter, Multiscale |
| `onDamageHack` | `(damage, defender)` | 伤害应用前的最终修正 | Sturdy |
| `onCritDamage` | `(damage)` | 暴击伤害修正 | Sniper |

### 4. 能力值修正钩子 (Stat Modification Hooks)

| 钩子名 | 参数 | 调用时机 | 示例特性 |
|--------|------|----------|----------|
| `onModifyStat` | `(stats, poke, battle)` | 计算实际能力值时 | Huge Power, Unburden, Chlorophyll |
| `onModifySTAB` | `(stab)` | 修正本系加成倍率 | Adaptability |
| `onModifyEffectiveness` | `(eff)` | 修正属性克制倍率 | Tinted Lens |

### 5. 能力阶级钩子 (Boost Hooks)

| 钩子名 | 参数 | 调用时机 | 示例特性 |
|--------|------|----------|----------|
| `onTryBoost` | `(boost, pokemon, source, stat, logs)` | 尝试改变能力阶级时 | Clear Body, Mirror Armor |
| `onAfterStatDrop` | `(pokemon, stat, stages, logs)` | 能力下降后 | Defiant, Competitive |

### 6. 免疫钩子 (Immunity Hooks)

| 钩子名 | 参数 | 调用时机 | 示例特性 |
|--------|------|----------|----------|
| `onImmunity` | `(atkType, move)` | 检查属性/招式免疫 | Levitate, Flash Fire, Bulletproof |
| `onImmunityStatus` | `(status, pokemon, battle)` | 检查状态免疫 | Immunity, Insomnia, Limber |
| `onAbsorbHit` | `(pokemon, move, logs)` | 吸收招式效果 | Water Absorb, Lightning Rod |

### 7. 攻击钩子 (Attack Hooks)

| 钩子名 | 参数 | 调用时机 | 示例特性 |
|--------|------|----------|----------|
| `onBeforeMove` | `(user, move, logs)` | 使用招式前 | Protean, Truant |
| `onModifyMove` | `(move, attacker)` | 修改招式属性 | Liquid Voice |
| `onMoveHitCount` | `(move, user)` | 决定多段攻击次数 | Skill Link |
| `onModifySecondaryChance` | `(chance, move, user)` | 修改副作用概率 | Serene Grace |
| `onModifyPriority` | `(priority, user, target, move)` | 修改招式优先度 | Prankster, Stall |

### 8. 受击钩子 (Hit Reaction Hooks)

| 钩子名 | 参数 | 调用时机 | 示例特性 |
|--------|------|----------|----------|
| `onTryHit` | `(attacker, defender, move, effectiveness)` | 招式命中前检查 | Wonder Guard, Dazzling |
| `onDamageTaken` | `(pokemon, damage, source, logs)` | 受到伤害后 | Illusion |
| `onContactDamage` | `(attacker, defender)` | 接触类招式命中后 | Rough Skin, Iron Barbs |
| `onContactStatus` | `(attacker, defender)` | 接触类招式可能附加状态 | Static, Flame Body |
| `onContactVolatile` | `(attacker, defender)` | 接触类招式可能附加 volatile | Cute Charm |
| `onPhysicalHit` | `(attacker, defender, logs)` | 被物理攻击命中后 | Weak Armor |

### 9. 回合结束钩子 (End of Turn Hooks)

| 钩子名 | 参数 | 调用时机 | 示例特性 |
|--------|------|----------|----------|
| `onEndTurn` | `(pokemon, logs)` | 回合结束时 | Speed Boost, Slow Start, Bad Dreams |
| `onStatusDamage` | `(pokemon, status)` | 状态伤害结算时 | Poison Heal |

### 10. 道具钩子 (Item Hooks)

| 钩子名 | 参数 | 调用时机 | 示例特性 |
|--------|------|----------|----------|
| `onItemLost` | `(pokemon, item, logs)` | 道具被消耗/拍落时 | Unburden |

### 11. 击杀钩子 (Kill Hooks)

| 钩子名 | 参数 | 调用时机 | 示例特性 |
|--------|------|----------|----------|
| `onKill` | `(attacker, logs)` | 击杀对手后 | Moxie, Beast Boost |

---

## 标记属性 (Flag Properties)

除了钩子函数，特性还可以设置以下标记属性：

| 属性名 | 类型 | 说明 | 示例特性 |
|--------|------|------|----------|
| `groundImmune` | boolean | 免疫地面系 | Levitate |
| `noRecoil` | boolean | 免疫反伤 | Rock Head |
| `noIndirectDamage` | boolean | 免疫间接伤害 | Magic Guard |
| `noFlinch` | boolean | 免疫畏缩 | Inner Focus |
| `noConfusion` | boolean | 免疫混乱 | Own Tempo |
| `ignoreScreens` | boolean | 无视光墙/反射壁 | Infiltrator |
| `ignoreSubstitute` | boolean | 无视替身 | Infiltrator |
| `ignoreAbility` | boolean | 无视对手特性 | Mold Breaker |
| `ignoreDefenderBoosts` | boolean | 攻击时忽略对手防御提升 | Unaware |
| `ignoreAttackerBoosts` | boolean | 防御时忽略对手攻击提升 | Unaware |
| `isTrapping` | boolean | 困住特性 | Shadow Tag, Arena Trap |
| `canTrap` | function | 判断是否能困住目标 | `(self, target) => boolean` |
| `reflectStatus` | boolean | 反弹变化技 | Magic Bounce |
| `preventPhazing` | boolean | 防止被强制换下 | Suction Cups |
| `preventItemTheft` | boolean | 防止道具被偷 | Sticky Hold |
| `pranksterImmunity` | boolean | 恶作剧之心对恶系无效 | Prankster |
| `canPoisonAny` | boolean | 可以让任何属性中毒 | Corrosion |
| `alwaysAsleep` | boolean | 视为睡眠状态 | Comatose |
| `earlyBird` | boolean | 睡眠回合减半 | Early Bird |
| `teamSleepImmune` | boolean | 队友也免疫睡眠 | Sweet Veil |
| `wonderGuard` | boolean | 神奇守护标记 | Wonder Guard |

---

## 新增特性列表 (2024-01 更新)

### 核心攻击组件

| 特性 | 效果 | 代表宝可梦 |
|------|------|-----------|
| **Skill Link** | 多段攻击固定为最大次数 | 刺甲贝、赫拉克罗斯 |
| **Infiltrator** | 无视光墙/反射壁/替身 | 多龙巴鲁托 |
| **Serene Grace** | 副作用概率翻倍 | 波克基斯、基拉祈 |
| **Reckless** | 反伤类招式威力 x1.2 | 姆克鹰 |
| **Unburden** | 失去道具后速度翻倍 | 摔角鹰人 |

### 信息读取类

| 特性 | 效果 | 代表宝可梦 |
|------|------|-----------|
| **Trace** | 入场时复制对手特性 | 沙奈朵、多边兽2 |
| **Download** | 入场时根据对手耐久提升攻击/特攻 | 多边兽Z、盖诺赛克特 |

### 受队与回复

| 特性 | 效果 | 代表宝可梦 |
|------|------|-----------|
| **Natural Cure** | 换下时治愈异常状态 | 幸福蛋、宝石海星 |

### 极高难度机制

| 特性 | 效果 | 代表宝可梦 |
|------|------|-----------|
| **Imposter** | 入场时自动变身为对手 | 百变怪 |
| **Illusion** | 伪装成队伍最后一只存活的宝可梦 | 索罗亚克 |

---

## 调用位置

| 钩子 | 调用文件 | 调用函数 |
|------|----------|----------|
| `onStart` | `index.js` | `triggerAbilityOnStart()` |
| `onSwitchOut` | `index.js` | `performSwitch()` |
| `onDamageTaken` | `battle/battle-damage.js` | `applyDamage()` |
| `onBasePower` | `battle/battle-calc.js` | `calcDamage()` |
| `onModifyStat` | `battle/battle-calc.js` | `getEffectiveStats()` |
| `onEndTurn` | `index.js` | `handleEndOfTurn()` |
| `onItemLost` | `engine/battle-engine.js` | `Pokemon.consumeItem()` |

---

## UI 支持

### Imposter / Illusion 精灵图显示

当宝可梦拥有 `displaySpriteId` 属性时，UI 会显示伪装的精灵图：

```javascript
// index.js - updateAllVisuals()
const playerSpriteUrl = p.displaySpriteId 
    ? `https://play.pokemonshowdown.com/sprites/ani-back/${p.displaySpriteId}.gif`
    : p.getSprite(true);
```

### 名称显示

当宝可梦拥有 `displayCnName` 属性时，UI 会显示伪装的名称：

```javascript
document.getElementById('player-name').innerText = p.displayCnName || p.cnName;
```

### 精灵图更新

特性可以调用 `window.updateBattleSprites()` 来刷新战斗精灵图显示。
