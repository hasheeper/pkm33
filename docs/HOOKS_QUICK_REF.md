# ⚡ 钩子函数快速参考卡

> 开发特性时的快速查阅表

---

## 🎯 伤害类钩子

| 钩子名 | 签名 | 返回值 |
|--------|------|--------|
| `onBasePower` | `(power, attacker, defender, move)` | `number` |
| `onDefenderModifyDamage` | `(damage, attacker, defender, move, effectiveness)` | `number` |
| `onDamageHack` | `(damage, defender)` | `number` |
| `onCritDamage` | `(damage)` | `number` |

---

## 📊 能力值类钩子

| 钩子名 | 签名 | 返回值 |
|--------|------|--------|
| `onModifyStat` | `(stats, poke, battle)` | `void` (直接修改 stats) |
| `onModifySTAB` | `(stab)` | `number` |
| `onModifyEffectiveness` | `(effectiveness)` | `number` |

---

## 🎲 优先度/命中类钩子

| 钩子名 | 签名 | 返回值 |
|--------|------|--------|
| `onModifyPriority` | `(priority, user, target, move)` | `number` |
| `onTryHit` | `(attacker, defender, move, effectiveness)` | `{ blocked, message? }` |

---

## 🛡️ 免疫类钩子

| 钩子名 | 签名 | 返回值 |
|--------|------|--------|
| `onImmunity` | `(atkType, move)` | `boolean` |
| `onAbsorbHit` | `(pokemon, move, logs)` | `{ absorbed, heal? }` |
| `onImmunityStatus` | `(status, pokemon?, battle?)` | `boolean` |
| `onStatusDamage` | `(pokemon, status)` | `{ blocked, healed?, message? }` |

---

## 👊 接触反馈类钩子

| 钩子名 | 签名 | 返回值 |
|--------|------|--------|
| `onContactDamage` | `(attacker, defender)` | `{ damage, message }` |
| `onContactStatus` | `(attacker, defender)` | `{ status, message }` 或 `null` |
| `onContactVolatile` | `(attacker, defender)` | `{ volatile, message }` 或 `null` |
| `onPhysicalHit` | `(attacker, defender, logs)` | `void` |

---

## 🔄 入场/退场/回合类钩子

| 钩子名 | 签名 | 返回值 |
|--------|------|--------|
| `onStart` | `(self, enemy, logs, battle)` | `void` |
| `onSwitchOut` | `(pokemon)` | `void` |
| `onEndTurn` | `(pokemon, logs)` | `void` |
| `onKill` | `(attacker, logs)` | `void` |

---

## ⚔️ 招式修改类钩子

| 钩子名 | 签名 | 返回值 |
|--------|------|--------|
| `onModifyMove` | `(move, attacker)` | `void` (直接修改 move) |
| `onBeforeMove` | `(user, move, logs)` | `boolean` (false=禁止行动) |

---

## 📈 能力变化类钩子

| 钩子名 | 签名 | 返回值 |
|--------|------|--------|
| `onTryBoost` | `(boost, pokemon, source, stat)` | `number` (0=阻止) |
| `onAfterStatDrop` | `(pokemon, stat, stages, logs)` | `void` |

---

## ⚠️ 黄金法则

```
1. damage/power 类钩子 → 第一个参数是数值
2. 直接修改类钩子 → 不需要返回值 (onModifyStat, onModifyMove)
3. 判定类钩子 → 返回 boolean 或 { blocked: boolean }
4. 所有数值计算 → 使用 Math.floor()
5. 所有分支 → 必须有返回值
```

---

## 🔍 调用位置速查

| 钩子 | 文件:行号 |
|------|----------|
| `onBasePower` | `battle-calc.js:109` |
| `onDefenderModifyDamage` | `battle-calc.js:531` |
| `onModifyStat` | `battle-engine.js:932` |
| `onModifyPriority` | `move-effects.js:113` |
| `onTryHit` | `battle-calc.js:219` |
| `onImmunity` | `battle-calc.js:210` |
| `onContactDamage` | `battle-effects.js:349` |
| `onContactStatus` | `battle-effects.js:358` |
| `onPhysicalHit` | `battle-effects.js:390` |
| `onStart` | `battle-switch.js:516` |
| `onKill` | `battle-switch.js:222` |
| `onEndTurn` | `index.js:1993` |
| `onBeforeMove` | `battle-turns.js:102` |

---

*快速参考 v1.0 - 2026-01-03*
