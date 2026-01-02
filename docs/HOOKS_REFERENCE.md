# 🎮 PKM Battle Engine - 钩子函数参考文档

> **重要**: 本文档记录了所有特性钩子函数的正确参数签名。  
> **开发新特性前必须参考此文档，避免参数顺序错误导致的 NaN/undefined BUG。**

---

## 📋 目录

1. [伤害计算钩子](#1-伤害计算钩子)
2. [能力值修正钩子](#2-能力值修正钩子)
3. [优先度修正钩子](#3-优先度修正钩子)
4. [命中判定钩子](#4-命中判定钩子)
5. [免疫判定钩子](#5-免疫判定钩子)
6. [接触反馈钩子](#6-接触反馈钩子)
7. [入场/退场钩子](#7-入场退场钩子)
8. [回合结束钩子](#8-回合结束钩子)
9. [击杀触发钩子](#9-击杀触发钩子)
10. [招式修改钩子](#10-招式修改钩子)
11. [能力变化钩子](#11-能力变化钩子)
12. [状态免疫钩子](#12-状态免疫钩子)

---

## 1. 伤害计算钩子

### `onBasePower` - 基础威力修正

**调用位置**: `battle/battle-calc.js:109`

```javascript
// 调用方式
basePower = ah.onBasePower(basePower, attacker, defender, move);
```

**正确签名**:
```javascript
onBasePower: (power, attacker, defender, move) => {
    // power: number - 当前基础威力
    // attacker: Pokemon - 攻击方
    // defender: Pokemon - 防御方
    // move: object - 招式对象 { name, type, power, cat, ... }
    // 返回: number - 修正后的威力
    return power;
}
```

**使用示例**:
```javascript
// 【技术高手】低威力招式 x1.5
'Technician': {
    onBasePower: (power, attacker, defender, move) => {
        if (power <= 60) return power * 1.5;
        return power;
    }
}

// 【猛火】红血时火系 x1.5
'Blaze': {
    onBasePower: (power, attacker, defender, move) => {
        if (move.type === 'Fire' && attacker.currHp <= attacker.maxHp / 3) {
            return power * 1.5;
        }
        return power;
    }
}
```

---

### `onDefenderModifyDamage` - 防御方伤害修正

**调用位置**: `battle/battle-calc.js:531`

```javascript
// 调用方式
singleHitDamage = ahDef.onDefenderModifyDamage(singleHitDamage, attacker, defender, move, effectiveness);
```

**正确签名**:
```javascript
onDefenderModifyDamage: (damage, attacker, defender, move, effectiveness) => {
    // damage: number - 当前伤害值
    // attacker: Pokemon - 攻击方
    // defender: Pokemon - 防御方
    // move: object - 招式对象
    // effectiveness: number - 属性克制倍率 (0.25, 0.5, 1, 2, 4)
    // 返回: number - 修正后的伤害
    return damage;
}
```

**使用示例**:
```javascript
// 【干燥皮肤】火系伤害 x1.25
'Dry Skin': {
    onDefenderModifyDamage: (damage, attacker, defender, move, effectiveness) => {
        return move.type === 'Fire' ? Math.floor(damage * 1.25) : damage;
    }
}

// 【厚脂肪】火/冰伤害减半
'Thick Fat': {
    onDefenderModifyDamage: (damage, attacker, defender, move, effectiveness) => {
        if (move.type === 'Fire' || move.type === 'Ice') {
            return Math.floor(damage * 0.5);
        }
        return damage;
    }
}

// 【滤镜】克制伤害 x0.75
'Filter': {
    onDefenderModifyDamage: (damage, attacker, defender, move, effectiveness) => {
        if (effectiveness > 1) return Math.floor(damage * 0.75);
        return damage;
    }
}
```

---

### `onDamageHack` - 伤害最终修正（结实等）

**调用位置**: `battle/battle-calc.js:599-600`

```javascript
// 调用方式
singleHitDamage = ahDef.onDamageHack(singleHitDamage * hitCount, defender);
```

**正确签名**:
```javascript
onDamageHack: (damage, defender) => {
    // damage: number - 总伤害值
    // defender: Pokemon - 防御方
    // 返回: number - 修正后的伤害
    return damage;
}
```

**使用示例**:
```javascript
// 【结实】满血时至少保留1HP
'Sturdy': {
    onDamageHack: (damage, defender) => {
        if (defender.currHp === defender.maxHp && damage >= defender.currHp) {
            return defender.currHp - 1;
        }
        return damage;
    }
}
```

---

### `onCritDamage` - 暴击伤害修正

**调用位置**: 暴击伤害计算时

```javascript
// 调用方式
critDamage = ah.onCritDamage(critDamage);
```

**正确签名**:
```javascript
onCritDamage: (damage) => {
    // damage: number - 暴击伤害
    // 返回: number - 修正后的暴击伤害
    return damage;
}
```

**使用示例**:
```javascript
// 【狙击手】暴击伤害 x1.5
'Sniper': {
    onCritDamage: (damage) => Math.floor(damage * 1.5)
}
```

---

## 2. 能力值修正钩子

### `onModifyStat` - 能力值修正

**调用位置**: `engine/battle-engine.js:932`

```javascript
// 调用方式
ah.onModifyStat(shell, this, battleRef);
// shell = { atk, def, spa, spd, spe } - 可直接修改的能力值对象
```

**正确签名**:
```javascript
onModifyStat: (stats, poke, battle) => {
    // stats: object - { atk, def, spa, spd, spe } 可直接修改
    // poke: Pokemon - 当前宝可梦
    // battle: BattleState - 战斗状态（用于天气判断等）
    // 返回: void (直接修改 stats 对象)
}
```

**使用示例**:
```javascript
// 【大力士】物攻翻倍
'Huge Power': {
    onModifyStat: (stats, poke, battle) => {
        stats.atk *= 2;
    }
}

// 【叶绿素】晴天速度翻倍
'Chlorophyll': {
    onModifyStat: (stats, poke, battle) => {
        if (battle && battle.weather === 'sunnyday') {
            stats.spe *= 2;
        }
    }
}

// 【毅力】异常状态时物攻 x1.5
'Guts': {
    onModifyStat: (stats, poke, battle) => {
        if (poke.status) {
            stats.atk = Math.floor(stats.atk * 1.5);
        }
    }
}

// 【软弱】半血以下攻击/特攻减半
'Defeatist': {
    onModifyStat: (stats, poke, battle) => {
        if (poke.currHp <= poke.maxHp / 2) {
            stats.atk = Math.floor(stats.atk * 0.5);
            stats.spa = Math.floor(stats.spa * 0.5);
        }
    }
}
```

---

## 3. 优先度修正钩子

### `onModifyPriority` - 优先度修正

**调用位置**: `engine/move-effects.js:113`

```javascript
// 调用方式
const modifiedPriority = abilityHandler.onModifyPriority(basePriority, user, null, move);
```

**正确签名**:
```javascript
onModifyPriority: (priority, user, target, move) => {
    // priority: number - 当前优先度
    // user: Pokemon - 使用者
    // target: Pokemon | null - 目标（可能为 null）
    // move: object - 招式对象
    // 返回: number - 修正后的优先度
    return priority;
}
```

**使用示例**:
```javascript
// 【恶作剧之心】变化技优先度+1
'Prankster': {
    onModifyPriority: (priority, user, target, move) => {
        if (move.cat === 'status' || move.category === 'Status') {
            return priority + 1;
        }
        return priority;
    }
}

// 【慢出】永远最后行动
'Stall': {
    onModifyPriority: (priority, user, target, move) => {
        return -6;
    }
}
```

---

## 4. 命中判定钩子

### `onTryHit` - 命中前判定

**调用位置**: `battle/battle-calc.js:219`

```javascript
// 调用方式
const tryHitResult = ahDef.onTryHit(attacker, defender, move, preEffectiveness);
```

**正确签名**:
```javascript
onTryHit: (attacker, defender, move, effectiveness) => {
    // attacker: Pokemon - 攻击方
    // defender: Pokemon - 防御方
    // move: object - 招式对象
    // effectiveness: number - 属性克制倍率
    // 返回: { blocked: boolean, message?: string }
    return { blocked: false };
}
```

**使用示例**:
```javascript
// 【神奇守护】只能被效果绝佳的招式打中
'Wonder Guard': {
    onTryHit: (attacker, defender, move, effectiveness) => {
        if (effectiveness <= 1) {
            return { blocked: true, message: `${defender.cnName} 的神奇守护让攻击无效了！` };
        }
        return { blocked: false };
    }
}

// 【鲜艳之躯】免疫先制攻击
'Dazzling': {
    onTryHit: (attacker, defender, move, effectiveness) => {
        if (move.priority && move.priority > 0) {
            return { blocked: true, message: `${defender.cnName} 的特性让先制攻击无效了！` };
        }
        return { blocked: false };
    }
}
```

---

## 5. 免疫判定钩子

### `onImmunity` - 属性免疫判定

**调用位置**: `battle/battle-calc.js:210`

```javascript
// 调用方式
if (ahDef.onImmunity && ahDef.onImmunity(move.type, move)) { ... }
```

**正确签名**:
```javascript
onImmunity: (atkType, move) => {
    // atkType: string - 攻击属性 ('Fire', 'Water', etc.)
    // move: object - 招式对象（用于特殊招式判定）
    // 返回: boolean - true 表示免疫
    return false;
}
```

**使用示例**:
```javascript
// 【漂浮】免疫地面
'Levitate': {
    onImmunity: (atkType) => atkType === 'Ground'
}

// 【引火】免疫火系
'Flash Fire': {
    onImmunity: (atkType) => atkType === 'Fire'
}

// 【隔音】免疫声音招式
'Soundproof': {
    onImmunity: (atkType, move) => {
        const soundMoves = ['Boomburst', 'Bug Buzz', 'Hyper Voice', ...];
        return move && soundMoves.includes(move.name);
    }
}
```

---

### `onAbsorbHit` - 吸收攻击（免疫+效果）

**调用位置**: 免疫判定后

```javascript
// 调用方式
const result = ahDef.onAbsorbHit(pokemon, move, logs);
```

**正确签名**:
```javascript
onAbsorbHit: (pokemon, move, logs) => {
    // pokemon: Pokemon - 被攻击的宝可梦
    // move: object - 招式对象
    // logs: string[] - 日志数组（可 push 消息）
    // 返回: { absorbed: boolean, heal?: number }
    return { absorbed: false };
}
```

**使用示例**:
```javascript
// 【蓄水】免疫水系+回复1/4HP
'Water Absorb': {
    onAbsorbHit: (pokemon, move, logs) => {
        if (move.type === 'Water') {
            const heal = Math.floor(pokemon.maxHp / 4);
            pokemon.currHp = Math.min(pokemon.maxHp, pokemon.currHp + heal);
            logs.push(`💧 ${pokemon.cnName} 的蓄水回复了 ${heal} HP！`);
            return { absorbed: true, heal };
        }
        return { absorbed: false };
    }
}

// 【避雷针】免疫电系+特攻+1
'Lightning Rod': {
    onAbsorbHit: (pokemon, move, logs) => {
        if (move.type === 'Electric') {
            if (pokemon.applyBoost) pokemon.applyBoost('spa', 1);
            logs.push(`⚡ ${pokemon.cnName} 的避雷针发动！特攻提升！`);
            return { absorbed: true };
        }
        return { absorbed: false };
    }
}
```

---

## 6. 接触反馈钩子

### `onContactDamage` - 接触反伤

**调用位置**: `battle/battle-effects.js:349`

```javascript
// 调用方式
const result = ah.onContactDamage(user, target);
```

**正确签名**:
```javascript
onContactDamage: (attacker, defender) => {
    // attacker: Pokemon - 发起接触的攻击方
    // defender: Pokemon - 拥有特性的防御方
    // 返回: { damage: number, message: string }
    return { damage: 0, message: '' };
}
```

**使用示例**:
```javascript
// 【粗糙皮肤】接触时反伤1/8
'Rough Skin': {
    onContactDamage: (attacker, defender) => {
        return { 
            damage: Math.floor(attacker.maxHp / 8), 
            message: `${attacker.cnName} 被粗糙皮肤伤害了！` 
        };
    }
}
```

---

### `onContactStatus` - 接触状态

**调用位置**: `battle/battle-effects.js:358`

```javascript
// 调用方式
const result = ah.onContactStatus(user, target);
```

**正确签名**:
```javascript
onContactStatus: (attacker, defender) => {
    // attacker: Pokemon - 发起接触的攻击方
    // defender: Pokemon - 拥有特性的防御方
    // 返回: { status: string, message: string } | null
    return null;
}
```

**使用示例**:
```javascript
// 【静电】接触时30%麻痹
'Static': {
    onContactStatus: (attacker, defender) => {
        if (Math.random() < 0.3) {
            return { status: 'par', message: `${attacker.cnName} 被静电麻痹了！` };
        }
        return null;
    }
}
```

---

### `onPhysicalHit` - 被物理攻击时

**调用位置**: `battle/battle-effects.js:390`

```javascript
// 调用方式
ah.onPhysicalHit(user, target, logs);
```

**正确签名**:
```javascript
onPhysicalHit: (attacker, defender, logs) => {
    // attacker: Pokemon - 攻击方
    // defender: Pokemon - 防御方（拥有特性）
    // logs: string[] - 日志数组
    // 返回: void
}
```

**使用示例**:
```javascript
// 【碎裂铠甲】被物理攻击时防御-1速度+2
'Weak Armor': {
    onPhysicalHit: (attacker, defender, logs) => {
        if (defender.applyBoost) {
            defender.applyBoost('def', -1);
            defender.applyBoost('spe', 2);
        }
        logs.push(`${defender.cnName} 的碎裂铠甲发动！`);
    }
}
```

---

## 7. 入场/退场钩子

### `onStart` - 入场时触发

**调用位置**: `battle/battle-switch.js:516`

```javascript
// 调用方式
h.onStart(pokemon, opponent, logs, battle);
```

**正确签名**:
```javascript
onStart: (self, enemy, logs, battle) => {
    // self: Pokemon - 入场的宝可梦
    // enemy: Pokemon - 对手宝可梦
    // logs: string[] - 日志数组
    // battle: BattleState - 战斗状态
    // 返回: void
}
```

**使用示例**:
```javascript
// 【威吓】入场时降低对手攻击
'Intimidate': {
    onStart: (self, enemy, logs, battle) => {
        if (!enemy || !enemy.isAlive()) return;
        if (typeof enemy.applyBoost === 'function') {
            enemy.applyBoost('atk', -1);
            logs.push(`${self.cnName} 的威吓让对手攻击降低了!`);
        }
    }
}

// 【降雨】入场时设置天气
'Drizzle': {
    onStart: (self, enemy, logs, battle) => {
        if (battle) battle.weather = 'raindance';
        logs.push(`🌧️ ${self.cnName} 带来了降雨!`);
    }
}
```

---

### `onSwitchOut` - 退场时触发

**调用位置**: 换人逻辑中

```javascript
// 调用方式
h.onSwitchOut(pokemon);
```

**正确签名**:
```javascript
onSwitchOut: (pokemon) => {
    // pokemon: Pokemon - 退场的宝可梦
    // 返回: void
}
```

**使用示例**:
```javascript
// 【再生力】换下时回复1/3血
'Regenerator': {
    onSwitchOut: (pokemon) => {
        if (pokemon.currHp < pokemon.maxHp && pokemon.currHp > 0) {
            const heal = Math.floor(pokemon.maxHp / 3);
            pokemon.currHp = Math.min(pokemon.maxHp, pokemon.currHp + heal);
        }
    }
}
```

---

## 8. 回合结束钩子

### `onEndTurn` - 回合结束时触发

**调用位置**: `index.js:1993` 和 `index.js:2003`

```javascript
// 调用方式
pAbilityHandler.onEndTurn(p, abilityLogs);
```

**正确签名**:
```javascript
onEndTurn: (pokemon, logs) => {
    // pokemon: Pokemon - 当前宝可梦
    // logs: string[] - 日志数组
    // 返回: void
}
```

**使用示例**:
```javascript
// 【加速】回合结束速度+1
'Speed Boost': {
    onEndTurn: (pokemon, logs) => {
        if (pokemon.boosts && pokemon.boosts.spe < 6) {
            if (typeof pokemon.applyBoost === 'function') {
                pokemon.applyBoost('spe', 1);
                logs.push(`${pokemon.cnName} 的速度提升了! (加速)`);
            }
        }
    }
}
```

---

## 9. 击杀触发钩子

### `onKill` - 击杀后触发

**调用位置**: `battle/battle-switch.js:222` 和 `battle/battle-switch.js:484`

```javascript
// 调用方式
AbilityHandlers[abilityId].onKill(p, killLogs);
```

**正确签名**:
```javascript
onKill: (attacker, logs) => {
    // attacker: Pokemon - 击杀者
    // logs: string[] - 日志数组
    // 返回: void
}
```

**使用示例**:
```javascript
// 【自信过剩】击杀后攻击+1
'Moxie': {
    onKill: (attacker, logs) => {
        if (typeof attacker.applyBoost === 'function') {
            attacker.applyBoost('atk', 1);
            logs.push(`${attacker.cnName} 的攻击提升了! (自信过剩)`);
        }
    }
}

// 【异兽提升】击杀后提升最高能力
'Beast Boost': {
    onKill: (attacker, logs) => {
        const stats = ['atk', 'def', 'spa', 'spd', 'spe'];
        let best = 'atk';
        let bestVal = attacker.atk || 0;
        for (const s of stats) {
            if (attacker[s] > bestVal) {
                bestVal = attacker[s];
                best = s;
            }
        }
        if (typeof attacker.applyBoost === 'function') {
            attacker.applyBoost(best, 1);
            logs.push(`${attacker.cnName} 的 ${best} 提升了! (异兽提升)`);
        }
    }
}
```

---

## 10. 招式修改钩子

### `onModifyMove` - 招式属性修改

**调用位置**: `battle/battle-calc.js:33-34`

```javascript
// 调用方式
abilityHandler.onModifyMove(move, attacker);
```

**正确签名**:
```javascript
onModifyMove: (move, attacker) => {
    // move: object - 招式对象（可直接修改）
    // attacker: Pokemon - 攻击方
    // 返回: void
}
```

**使用示例**:
```javascript
// 【湿润之声】声音招式变为水属性
'Liquid Voice': {
    onModifyMove: (move, attacker) => {
        const soundMoves = ['Boomburst', 'Hyper Voice', 'Disarming Voice', ...];
        if (soundMoves.includes(move.name)) {
            move.type = 'Water';
        }
    }
}
```

---

### `onBeforeMove` - 行动前检查

**调用位置**: `battle/battle-turns.js:102` 和 `battle/battle-turns.js:226`

```javascript
// 调用方式
const canMove = abilityHandler.onBeforeMove(p, move, beforeMoveLogs);
```

**正确签名**:
```javascript
onBeforeMove: (user, move, logs) => {
    // user: Pokemon - 使用者
    // move: object - 招式对象
    // logs: string[] - 日志数组
    // 返回: boolean - false 表示无法行动
    return true;
}
```

**使用示例**:
```javascript
// 【懒惰】每隔一回合才能行动
'Truant': {
    onBeforeMove: (self, move, logs) => {
        if (self.truantNextTurn) {
            logs.push(`${self.cnName} 正在偷懒！`);
            self.truantNextTurn = false;
            return false; // 禁止行动
        } else {
            self.truantNextTurn = true;
            return true; // 允许行动
        }
    }
}

// 【变幻自如】使用招式前变换属性
'Protean': {
    onBeforeMove: (user, move, logs) => {
        if (move.type && !user.types.includes(move.type)) {
            user.types = [move.type];
            logs.push(`${user.cnName} 变成了 ${move.type} 属性!`);
        }
        return true;
    }
}
```

---

## 11. 能力变化钩子

### `onTryBoost` - 能力变化前判定

**调用位置**: `applyBoost` 方法中

```javascript
// 调用方式
boost = handler.onTryBoost(boost, pokemon, source, stat);
```

**正确签名**:
```javascript
onTryBoost: (boost, pokemon, source, stat) => {
    // boost: number - 能力变化等级 (+1, -1, etc.)
    // pokemon: Pokemon - 被影响的宝可梦
    // source: Pokemon - 来源宝可梦
    // stat: string - 能力名称 ('atk', 'def', etc.)
    // 返回: number - 修正后的变化等级（0 表示阻止）
    return boost;
}
```

**使用示例**:
```javascript
// 【清除之躯】免疫能力下降
'Clear Body': {
    onTryBoost: (boost, pokemon, source, stat) => {
        if (boost < 0 && source !== pokemon) return 0;
        return boost;
    }
}

// 【怪力钳】防止攻击降低
'Hyper Cutter': {
    onTryBoost: (boost, pokemon, source, stat) => {
        if (stat === 'atk' && boost < 0 && source !== pokemon) return 0;
        return boost;
    }
}
```

---

### `onAfterStatDrop` - 能力下降后触发

**调用位置**: 能力下降后

```javascript
// 调用方式
handler.onAfterStatDrop(pokemon, stat, stages, logs);
```

**正确签名**:
```javascript
onAfterStatDrop: (pokemon, stat, stages, logs) => {
    // pokemon: Pokemon - 被降能力的宝可梦
    // stat: string - 被降的能力
    // stages: number - 下降的等级
    // logs: string[] - 日志数组
    // 返回: void
}
```

**使用示例**:
```javascript
// 【不服输】被降能力时攻击+2
'Defiant': {
    onAfterStatDrop: (pokemon, stat, stages, logs) => {
        if (typeof pokemon.applyBoost === 'function') {
            pokemon.applyBoost('atk', 2);
            logs.push(`${pokemon.cnName} 的攻击大幅提升了! (不服输)`);
        }
    }
}
```

---

## 12. 状态免疫钩子

### `onImmunityStatus` - 异常状态免疫

**调用位置**: 状态施加时

```javascript
// 调用方式
if (handler.onImmunityStatus && handler.onImmunityStatus(status, pokemon, battle)) { ... }
```

**正确签名**:
```javascript
onImmunityStatus: (status, pokemon, battle) => {
    // status: string - 状态类型 ('par', 'brn', 'psn', 'tox', 'slp', 'frz')
    // pokemon: Pokemon - 目标宝可梦（可选）
    // battle: BattleState - 战斗状态（可选）
    // 返回: boolean - true 表示免疫
    return false;
}
```

**使用示例**:
```javascript
// 【柔软】免疫麻痹
'Limber': {
    onImmunityStatus: (status) => status === 'par'
}

// 【免疫】免疫中毒
'Immunity': {
    onImmunityStatus: (status) => status === 'psn' || status === 'tox'
}

// 【叶子防守】晴天时免疫异常状态
'Leaf Guard': {
    onImmunityStatus: (status, pokemon, battle) => {
        return battle && battle.weather === 'sunnyday';
    }
}
```

---

### `onStatusDamage` - 状态伤害处理

**调用位置**: 状态伤害计算时

```javascript
// 调用方式
const result = handler.onStatusDamage(pokemon, status);
```

**正确签名**:
```javascript
onStatusDamage: (pokemon, status) => {
    // pokemon: Pokemon - 受状态影响的宝可梦
    // status: string - 状态类型
    // 返回: { blocked: boolean, healed?: boolean, message?: string }
    return { blocked: false };
}
```

**使用示例**:
```javascript
// 【毒疗】中毒时回复HP
'Poison Heal': {
    onStatusDamage: (pokemon, status) => {
        if (status === 'psn' || status === 'tox') {
            const healAmount = Math.floor(pokemon.maxHp / 8);
            pokemon.currHp = Math.min(pokemon.maxHp, pokemon.currHp + healAmount);
            return { 
                blocked: true, 
                healed: true,
                message: `${pokemon.cnName} 的毒疗特性发动，回复了 ${healAmount} 点体力!`
            };
        }
        return { blocked: false };
    }
}
```

---

## ⚠️ 常见错误

### 1. 参数顺序错误

```javascript
// ❌ 错误
onDefenderModifyDamage: (attacker, defender, move, damage) => { ... }

// ✅ 正确
onDefenderModifyDamage: (damage, attacker, defender, move, effectiveness) => { ... }
```

### 2. 返回值类型错误

```javascript
// ❌ 错误 - 返回了对象而不是数字
onBasePower: (power, attacker, defender, move) => {
    return { power: power * 1.5 }; // 错误！
}

// ✅ 正确
onBasePower: (power, attacker, defender, move) => {
    return power * 1.5; // 直接返回数字
}
```

### 3. 忘记返回值

```javascript
// ❌ 错误 - 条件不满足时没有返回
onBasePower: (power, attacker, defender, move) => {
    if (move.type === 'Fire') {
        return power * 1.5;
    }
    // 忘记返回 power！
}

// ✅ 正确
onBasePower: (power, attacker, defender, move) => {
    if (move.type === 'Fire') {
        return power * 1.5;
    }
    return power; // 始终返回
}
```

### 4. 直接修改 vs 返回新值

```javascript
// onModifyStat 是直接修改对象
onModifyStat: (stats, poke, battle) => {
    stats.atk *= 2; // 直接修改
    // 不需要返回
}

// onBasePower 是返回新值
onBasePower: (power, attacker, defender, move) => {
    return power * 2; // 返回新值
}
```

---

## 📝 开发检查清单

在添加新特性前，请确认：

- [ ] 参数顺序与本文档一致
- [ ] 返回值类型正确
- [ ] 所有分支都有返回值（如果需要）
- [ ] 使用 `Math.floor()` 处理伤害/能力值计算
- [ ] 正确访问 Pokemon 对象的属性和方法
- [ ] 日志消息格式统一

---

*最后更新: 2026-01-03*
*维护者: PKM Battle Engine Team*
