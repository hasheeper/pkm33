# 开发者指南 - 宝可梦战斗引擎

> **面向对象**: 引擎开发者、模组制作者、贡献者  
> **难度等级**: 中级 - 高级

---

## 📑 目录

1. [开发环境搭建](#开发环境搭建)
2. [代码架构详解](#代码架构详解)
3. [核心模块解析](#核心模块解析)
4. [扩展开发指南](#扩展开发指南)
5. [调试与测试](#调试与测试)
6. [性能优化](#性能优化)
7. [最佳实践](#最佳实践)

---

## 开发环境搭建

### 环境要求

- **Node.js**: >= 16.0.0
- **npm**: >= 7.0.0
- **浏览器**: 支持 ES6+ 的现代浏览器

### 安装步骤

```bash
# 1. 克隆仓库
git clone <repository-url>
cd pkm12

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 构建生产版本
npm run build
```

### 项目结构

```
pkm12/
├── data/               # 数据层（只读）
│   ├── pokedex-data.js
│   ├── moves-data.js
│   ├── trainer-data.js
│   └── move-constants.js
│
├── engine/             # 核心引擎（纯函数）
│   ├── battle-engine.js
│   ├── ability-handlers.js
│   ├── move-handlers.js
│   ├── move-effects.js
│   ├── items-data.js
│   └── ai-engine.js
│
├── battle/             # 战斗系统（有状态）
│   ├── battle-calc.js
│   ├── battle-damage.js
│   ├── battle-effects.js
│   ├── battle-turns.js
│   └── battle-switch.js
│
├── mechanics/          # 世代机制（插件式）
│   ├── mega-evolution.js
│   ├── z-moves.js
│   ├── dynamax.js
│   ├── clash-system.js
│   ├── move-styles.js
│   └── form-change/
│
├── systems/            # 辅助系统
│   ├── catch-system.js
│   ├── growth-system.js
│   ├── audio-manager.js
│   └── translations.js
│
├── ui/                 # UI 层
│   ├── ui-menus.js
│   ├── ui-renderer.js
│   └── ui-sprites.js
│
└── main.js             # 入口文件
```

---

## 代码架构详解

### 设计原则

#### 1. 分层架构

```
┌─────────────────────────────────┐
│         UI Layer (ui/)          │  ← 用户交互
├─────────────────────────────────┤
│    Battle System (battle/)      │  ← 战斗流程
├─────────────────────────────────┤
│   Mechanics Layer (mechanics/)  │  ← 世代机制
├─────────────────────────────────┤
│    Engine Layer (engine/)       │  ← 核心计算
├─────────────────────────────────┤
│      Data Layer (data/)         │  ← 静态数据
└─────────────────────────────────┘
```

**职责划分**：
- **Data Layer**: 只读数据，不包含逻辑
- **Engine Layer**: 纯函数，无副作用，可测试
- **Mechanics Layer**: 插件式扩展，独立模块
- **Battle System**: 有状态管理，协调各层
- **UI Layer**: 视图渲染，事件处理

#### 2. 模块化设计

**ES Modules 导入导出**：
```javascript
// 导出
export function calcDamage(attacker, defender, move) { ... }
export const TYPE_CHART = { ... };

// 导入
import { calcDamage, TYPE_CHART } from './battle-calc.js';
```

**向后兼容（window 挂载）**：
```javascript
// 兼容旧代码
if (typeof window !== 'undefined') {
    window.calcDamage = calcDamage;
    window.TYPE_CHART = TYPE_CHART;
}
```

#### 3. 钩子系统

**特性钩子**（`ability-handlers.js`）：
```javascript
export const AbilityHandlers = {
    'Ability Name': {
        // 修改伤害
        onModifyDamage(baseDamage, attacker, defender, move) {
            return baseDamage * 1.5;
        },
        
        // 修改招式属性
        onModifyType(move, user) {
            return 'Fairy';
        },
        
        // 入场效果
        onSwitchIn(pokemon, battle) {
            // 触发入场效果
        },
        
        // 受到攻击时
        onDamagingHit(damage, attacker, defender, move) {
            // 接触反馈
        },
        
        // 回合开始
        onTurnStart(pokemon, battle) {
            // 回合开始效果
        }
    }
};
```

**招式钩子**（`move-handlers.js`）：
```javascript
export const MoveHandlers = {
    'Move Name': {
        // 使用前检查
        onUse(user, target, logs, battle, isPlayer) {
            return { failed: false };
        },
        
        // 命中后效果
        onHit(user, target, damage, logs, battle) {
            // 命中后触发
        },
        
        // 修改属性
        onModifyType(move, user, battle) {
            return 'Electric';
        },
        
        // 修改威力
        onBasePower(basePower, user, target, move) {
            return basePower * 2;
        }
    }
};
```

---

## 核心模块解析

### 1. 战斗引擎核心 (`engine/battle-engine.js`)

**Pokemon 类**：
```javascript
export class Pokemon {
    constructor(data, level = 50) {
        this.name = data.name;
        this.cnName = data.cnName || data.name;
        this.level = level;
        this.types = data.types || ['Normal'];
        
        // 种族值
        this.baseStats = data.baseStats;
        
        // 个体值（默认 31）
        this.ivs = data.ivs || { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
        
        // 努力值（默认 0）
        this.evs = data.evs || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
        
        // 性格
        this.nature = data.nature || 'Serious';
        
        // 计算实际能力值
        const stats = calcStats(this);
        this.maxHp = stats.hp;
        this.currHp = this.maxHp;
        this.atk = stats.atk;
        this.def = stats.def;
        this.spa = stats.spa;
        this.spd = stats.spd;
        this.spe = stats.spe;
        
        // 能力等级
        this.boosts = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, accuracy: 0, evasion: 0 };
        
        // 特性与道具
        this.ability = data.ability;
        this.item = data.item;
        
        // 招式
        this.moves = data.moves || [];
        
        // 状态
        this.status = null;
        this.volatileStatus = {};
    }
    
    // 获取能力值（含能力等级修正）
    getStat(stat) {
        const base = this[stat];
        const boost = this.boosts[stat] || 0;
        const multiplier = boost >= 0 
            ? (2 + boost) / 2 
            : 2 / (2 - boost);
        return Math.floor(base * multiplier);
    }
    
    // 检查是否存活
    isAlive() {
        return this.currHp > 0;
    }
}
```

**能力值计算**：
```javascript
export function calcStats(pokemon) {
    const base = pokemon.baseStats;
    const ivs = pokemon.ivs;
    const evs = pokemon.evs;
    const level = pokemon.level;
    const nature = pokemon.nature;
    
    // HP 计算
    const hp = Math.floor(
        ((2 * base.hp + ivs.hp + Math.floor(evs.hp / 4)) * level) / 100 + level + 10
    );
    
    // 其他能力值计算
    const calcStat = (statName) => {
        const baseStat = base[statName];
        const iv = ivs[statName];
        const ev = evs[statName];
        
        let stat = Math.floor(
            ((2 * baseStat + iv + Math.floor(ev / 4)) * level) / 100 + 5
        );
        
        // 性格修正
        const natureMod = NATURE_MODIFIERS[nature];
        if (natureMod && natureMod[statName]) {
            stat = Math.floor(stat * natureMod[statName]);
        }
        
        return stat;
    };
    
    return {
        hp,
        atk: calcStat('atk'),
        def: calcStat('def'),
        spa: calcStat('spa'),
        spd: calcStat('spd'),
        spe: calcStat('spe')
    };
}
```

### 2. 伤害计算引擎 (`battle/battle-calc.js`)

**核心算法**：
```javascript
export function calcDamage(attacker, defender, move, options = {}) {
    // 1. 获取招式数据
    const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const fullMoveData = MOVES[moveId] || {};
    
    // 2. 特性钩子：onModifyMove
    if (AbilityHandlers[attacker.ability]?.onModifyMove) {
        AbilityHandlers[attacker.ability].onModifyMove(move, attacker);
    }
    
    // 3. 获取基础威力
    let basePower = move.power ?? fullMoveData.basePower ?? 0;
    
    // 4. 招式钩子：onBasePower
    const handler = getMoveHandler(move.name);
    if (handler?.onBasePower) {
        basePower = handler.onBasePower(basePower, attacker, defender, move);
    }
    
    // 5. 特性修正威力
    if (AbilityHandlers[attacker.ability]?.onBasePower) {
        basePower = AbilityHandlers[attacker.ability].onBasePower(
            basePower, attacker, defender, move
        );
    }
    
    // 6. 道具修正威力
    if (attacker.item && ItemEffects[attacker.item]?.onBasePower) {
        basePower = ItemEffects[attacker.item].onBasePower(
            basePower, attacker, move
        );
    }
    
    // 7. 计算攻击/防御
    const category = fullMoveData.category || 'Physical';
    const attackStat = category === 'Physical' ? 'atk' : 'spa';
    const defenseStat = category === 'Physical' ? 'def' : 'spd';
    
    let A = attacker.getStat(attackStat);
    let D = defender.getStat(defenseStat);
    
    // 8. 特性修正攻击/防御
    if (AbilityHandlers[attacker.ability]?.onModifyAtk) {
        A = AbilityHandlers[attacker.ability].onModifyAtk(A, attacker, defender, move);
    }
    if (AbilityHandlers[defender.ability]?.onModifyDef) {
        D = AbilityHandlers[defender.ability].onModifyDef(D, defender, attacker, move);
    }
    
    // 9. 基础伤害计算
    const level = attacker.level;
    let damage = Math.floor(
        ((2 * level / 5 + 2) * basePower * A / D) / 50 + 2
    );
    
    // 10. 暴击判定
    let isCrit = false;
    const critRatio = move.critRatio || fullMoveData.critRatio || 0;
    const critChance = [1/24, 1/8, 1/2, 1][Math.min(critRatio, 3)];
    if (Math.random() < critChance) {
        isCrit = true;
        damage = Math.floor(damage * 1.5);
    }
    
    // 11. 随机因子 (0.85 ~ 1.0)
    const randomFactor = 0.85 + Math.random() * 0.15;
    damage = Math.floor(damage * randomFactor);
    
    // 12. STAB（本系加成）
    const isSTAB = attacker.types.includes(move.type);
    if (isSTAB) {
        const stabMultiplier = attacker.isTerastallized ? 2.0 : 1.5;
        damage = Math.floor(damage * stabMultiplier);
    }
    
    // 13. 属性克制
    const effectiveness = getTypeEffectiveness(move.type, defender.types);
    damage = Math.floor(damage * effectiveness);
    
    // 14. 灼伤修正（物理招式减半）
    if (attacker.status === 'brn' && category === 'Physical') {
        damage = Math.floor(damage * 0.5);
    }
    
    // 15. 特性修正最终伤害
    if (AbilityHandlers[attacker.ability]?.onModifyDamage) {
        damage = AbilityHandlers[attacker.ability].onModifyDamage(
            damage, attacker, defender, move
        );
    }
    
    // 16. 道具修正最终伤害
    if (attacker.item && ItemEffects[attacker.item]?.onModifyDamage) {
        damage = ItemEffects[attacker.item].onModifyDamage(
            damage, attacker, move
        );
    }
    
    return {
        damage: Math.max(1, damage),
        effectiveness,
        isCrit,
        miss: false,
        hitCount: 1
    };
}
```

### 3. AI 引擎 (`engine/ai-engine.js`)

**招式评分系统**：
```javascript
function rankMovesByScore(attacker, defender, aiParty) {
    const rankedMoves = [];
    
    for (const move of attacker.moves) {
        let score = 0;
        
        // 1. 基础伤害评分
        const dmgResult = calcDamage(attacker, defender, move, { isSimulation: true });
        score += dmgResult.damage;
        
        // 2. 属性克制加成
        if (dmgResult.effectiveness >= 2) {
            score += 200;  // 效果绝佳
        } else if (dmgResult.effectiveness <= 0.5) {
            score -= 100;  // 效果不佳
        }
        
        // 3. 命中率惩罚
        const accuracy = move.accuracy || 100;
        if (accuracy < 100) {
            score *= (accuracy / 100);
        }
        
        // 4. 斩杀加成
        if (dmgResult.damage >= defender.currHp) {
            score += 500;  // 优先击杀
        }
        
        // 5. 副作用评分
        const moveData = MOVES[move.name.toLowerCase().replace(/[^a-z0-9]/g, '')];
        if (moveData?.secondary) {
            // 能力提升
            if (moveData.secondary.self?.boosts) {
                score += 100;
            }
            // 状态异常
            if (moveData.secondary.status) {
                score += 80;
            }
        }
        
        // 6. 折返技能评分
        if (PIVOT_MOVES.includes(move.name)) {
            const switchValue = evaluateSwitchValue(attacker, defender, aiParty);
            score += switchValue;
        }
        
        rankedMoves.push({ move, score });
    }
    
    // 按评分降序排序
    return rankedMoves.sort((a, b) => b.score - a.score);
}
```

**Expert AI 换人决策**：
```javascript
function shouldSwitchOut(aiPoke, playerPoke, aiParty, battleContext) {
    // 1. 检查是否有可换入的宝可梦
    if (!hasAliveSwitch(aiParty, battleContext.enemyActive)) {
        return false;
    }
    
    // 2. 属性劣势检查
    const typeDisadvantage = checkTypeDisadvantage(aiPoke, playerPoke);
    if (typeDisadvantage > 1.5) {
        return true;  // 属性被克制，考虑换人
    }
    
    // 3. 负面状态清除
    if (aiPoke.boosts.atk <= -2 || aiPoke.boosts.spa <= -2) {
        return true;  // 攻击力大幅下降，换人清除
    }
    
    // 4. 濒死保护
    const hpPercent = aiPoke.currHp / aiPoke.maxHp;
    if (hpPercent < 0.2 && isFragile(aiPoke)) {
        return true;  // 脆皮输出手残血，保护核心
    }
    
    // 5. 战术换人（设置钉子后换人）
    if (battleContext.hazardsSet && !battleContext.coreSent) {
        return true;  // 钉子已设置，换核心输出
    }
    
    return false;
}
```

---

## 扩展开发指南

### 添加新招式

#### 1. 普通招式（仅数据）

在 `data/moves-data.js` 添加：
```javascript
'newmove': {
    num: 9999,
    name: 'New Move',
    cnName: '新招式',
    type: 'Fire',
    category: 'Special',
    basePower: 90,
    accuracy: 100,
    pp: 15,
    priority: 0,
    flags: { protect: 1, mirror: 1 },
    secondary: {
        chance: 10,
        status: 'brn'
    },
    desc: '有10%概率使目标陷入灼伤状态。'
}
```

#### 2. 特殊招式（需要逻辑）

在 `engine/move-handlers.js` 添加处理器：
```javascript
export const MoveHandlers = {
    'New Move': {
        // 使用前检查
        onUse(user, target, logs, battle, isPlayer) {
            // 例：首回合限制
            if (user.turnsOnField > 0) {
                logs.push(`${user.cnName} 的新招式失败了！`);
                return { failed: true };
            }
            return { failed: false };
        },
        
        // 命中后效果
        onHit(user, target, damage, logs, battle) {
            // 例：降低目标防御
            if (!target.boosts) target.boosts = {};
            target.boosts.def = Math.max(-6, (target.boosts.def || 0) - 1);
            logs.push(`${target.cnName} 的防御下降了！`);
        },
        
        // 修改威力
        onBasePower(basePower, user, target, move) {
            // 例：HP 越低威力越高
            const hpRatio = user.currHp / user.maxHp;
            return Math.floor(basePower * (2 - hpRatio));
        }
    }
};
```

#### 3. 复杂招式示例

**梦话（随机使用其他招式）**：
```javascript
'Sleep Talk': {
    onUse(user, target, logs, battle, isPlayer) {
        // 检查是否睡眠
        if (user.status !== 'slp') {
            logs.push(`但是失败了！`);
            return { failed: true };
        }
        
        // 过滤可用招式
        const usableMoves = user.moves.filter(m => 
            m.name !== 'Sleep Talk' && 
            !['Bide', 'Focus Punch', 'Uproar'].includes(m.name)
        );
        
        if (usableMoves.length === 0) {
            return { failed: true };
        }
        
        // 随机选择一个招式
        const randomMove = usableMoves[Math.floor(Math.random() * usableMoves.length)];
        
        // 返回 callMove 触发递归执行
        return {
            callMove: randomMove,
            skipDamage: true
        };
    }
}
```

### 添加新特性

#### 1. 简单特性（修正伤害）

```javascript
export const AbilityHandlers = {
    'New Ability': {
        // 修正攻击方伤害
        onModifyDamage(baseDamage, attacker, defender, move) {
            if (move.type === 'Fire') {
                return Math.floor(baseDamage * 1.5);  // 火系招式 1.5 倍
            }
            return baseDamage;
        }
    }
};
```

#### 2. 复杂特性（多钩子）

**变幻自如（Protean）**：
```javascript
'Protean': {
    onBeforeMove(user, target, move, battle) {
        // 使用招式前变为招式属性
        if (move.type && !user.types.includes(move.type)) {
            user.types = [move.type];
            log(`${user.cnName} 变为了 ${move.type} 属性！`);
        }
    }
}
```

**威吓（Intimidate）**：
```javascript
'Intimidate': {
    onSwitchIn(pokemon, battle) {
        // 入场降低对方攻击
        const opponent = battle.getOpponent(pokemon);
        if (opponent && opponent.isAlive()) {
            opponent.boosts.atk = Math.max(-6, (opponent.boosts.atk || 0) - 1);
            log(`${opponent.cnName} 被威吓了！攻击下降！`);
        }
    }
}
```

### 添加新道具

#### 1. 数据定义

在 `engine/items-data.js`：
```javascript
export const ITEMS = {
    'newitem': {
        name: 'New Item',
        cnName: '新道具',
        desc: '持有后火系招式威力提升20%',
        spritenum: 999
    }
};
```

#### 2. 效果实现

```javascript
export const ItemEffects = {
    'New Item': {
        // 修正威力
        onBasePower(basePower, holder, move) {
            if (move.type === 'Fire') {
                return Math.floor(basePower * 1.2);
            }
            return basePower;
        },
        
        // 回合结束效果
        onResidual(holder, battle) {
            // 每回合恢复 HP
            const heal = Math.floor(holder.maxHp / 16);
            holder.currHp = Math.min(holder.maxHp, holder.currHp + heal);
            log(`${holder.cnName} 恢复了少量 HP！`);
        }
    }
};
```

### 添加新世代机制

#### 1. 创建新机制文件

`mechanics/new-mechanic.js`：
```javascript
/**
 * 新机制系统
 */

// 检查是否可用
export function canUseNewMechanic(pokemon, battle) {
    // 检查条件
    return pokemon.hasNewMechanicItem && !battle.playerNewMechanicUsed;
}

// 触发机制
export function triggerNewMechanic(pokemon, battle) {
    if (!canUseNewMechanic(pokemon, battle)) {
        return false;
    }
    
    // 执行机制效果
    pokemon.newMechanicActive = true;
    battle.playerNewMechanicUsed = true;
    
    // 修改宝可梦属性
    pokemon.types = ['Dragon', 'Fairy'];
    pokemon.baseStats.atk += 50;
    
    log(`${pokemon.cnName} 触发了新机制！`);
    return true;
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.canUseNewMechanic = canUseNewMechanic;
    window.triggerNewMechanic = triggerNewMechanic;
}
```

#### 2. 集成到战斗系统

在 `battle/battle-turns.js` 添加触发点：
```javascript
export async function executePlayerTurn(p, e, move) {
    // ... 现有代码
    
    // 检查新机制触发
    if (window.canUseNewMechanic && window.canUseNewMechanic(p, battle)) {
        // 显示触发按钮
        showNewMechanicButton();
    }
    
    // ... 继续执行
}
```

---

## 调试与测试

### 调试技巧

#### 1. 开启调试模式

```javascript
// 在浏览器控制台
window.DEBUG_MODE = true;

// 查看详细日志
window.VERBOSE_LOGGING = true;
```

#### 2. 模拟伤害计算

```javascript
// 不触发副作用的伤害计算
const result = calcDamage(attacker, defender, move, { isSimulation: true });
console.log('预计伤害:', result.damage);
console.log('属性克制:', result.effectiveness);
console.log('是否暴击:', result.isCrit);
```

#### 3. 查看 AI 决策

```javascript
const action = getAiAction(aiPoke, playerPoke, 'expert', aiParty, battleContext);
console.log('AI 选择:', action.type);
console.log('招式:', action.move?.name);
console.log('评分:', action.score);
console.log('理由:', action.reasoning);
```

#### 4. 断点调试

在关键函数设置断点：
```javascript
export function calcDamage(attacker, defender, move, options = {}) {
    debugger;  // 浏览器会在此处暂停
    // ...
}
```

### 单元测试

#### 1. 测试伤害计算

```javascript
// test/battle-calc.test.js
import { calcDamage } from '../battle/battle-calc.js';
import { Pokemon } from '../engine/battle-engine.js';

describe('Damage Calculation', () => {
    test('STAB bonus', () => {
        const attacker = new Pokemon({
            name: 'Charizard',
            types: ['Fire', 'Flying'],
            baseStats: { hp: 78, atk: 84, def: 78, spa: 109, spd: 85, spe: 100 }
        }, 50);
        
        const defender = new Pokemon({
            name: 'Venusaur',
            types: ['Grass', 'Poison'],
            baseStats: { hp: 80, atk: 82, def: 83, spa: 100, spd: 100, spe: 80 }
        }, 50);
        
        const move = {
            name: 'Flamethrower',
            type: 'Fire',
            power: 90,
            cat: 'spec'
        };
        
        const result = calcDamage(attacker, defender, move);
        
        // 火系招式对草系，效果绝佳（2倍）+ STAB（1.5倍）= 3倍
        expect(result.effectiveness).toBe(2);
        expect(result.damage).toBeGreaterThan(0);
    });
});
```

#### 2. 测试特性触发

```javascript
describe('Ability Handlers', () => {
    test('Intimidate lowers attack on switch-in', () => {
        const intimidateUser = new Pokemon({
            name: 'Gyarados',
            ability: 'Intimidate',
            // ...
        });
        
        const opponent = new Pokemon({
            name: 'Machamp',
            // ...
        });
        
        // 模拟入场
        AbilityHandlers['Intimidate'].onSwitchIn(intimidateUser, mockBattle);
        
        expect(opponent.boosts.atk).toBe(-1);
    });
});
```

---

## 性能优化

### 1. 数据缓存

```javascript
// 缓存招式数据查询
const moveDataCache = new Map();

function getMoveData(moveName) {
    if (moveDataCache.has(moveName)) {
        return moveDataCache.get(moveName);
    }
    
    const moveId = moveName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const data = MOVES[moveId];
    moveDataCache.set(moveName, data);
    return data;
}
```

### 2. 减少 DOM 操作

```javascript
// 批量更新 UI
function updateBattleUI(updates) {
    requestAnimationFrame(() => {
        // 一次性更新所有 DOM
        for (const [id, value] of Object.entries(updates)) {
            document.getElementById(id).textContent = value;
        }
    });
}
```

### 3. 懒加载精灵图

```javascript
// 按需加载精灵图
const spriteCache = new Map();

async function loadSprite(pokemonId) {
    if (spriteCache.has(pokemonId)) {
        return spriteCache.get(pokemonId);
    }
    
    const url = `https://play.pokemonshowdown.com/sprites/gen5/${pokemonId}.png`;
    const img = new Image();
    img.src = url;
    
    await new Promise((resolve) => {
        img.onload = resolve;
    });
    
    spriteCache.set(pokemonId, img);
    return img;
}
```

### 4. AI 计算优化

```javascript
// 剪枝优化：提前终止明显劣势的招式评估
function rankMovesByScore(attacker, defender, aiParty) {
    const rankedMoves = [];
    let bestScore = -Infinity;
    
    for (const move of attacker.moves) {
        // 快速检查：如果招式被免疫，直接跳过
        const effectiveness = getTypeEffectiveness(move.type, defender.types);
        if (effectiveness === 0) {
            rankedMoves.push({ move, score: -9999 });
            continue;
        }
        
        // 计算评分
        let score = calculateMoveScore(move, attacker, defender);
        
        // 更新最佳评分
        if (score > bestScore) {
            bestScore = score;
        }
        
        rankedMoves.push({ move, score });
    }
    
    return rankedMoves.sort((a, b) => b.score - a.score);
}
```

---

## 最佳实践

### 1. 代码风格

**命名规范**：
```javascript
// 常量：大写下划线
const MAX_POKEMON_LEVEL = 100;
const TYPE_CHART = { ... };

// 函数：驼峰命名
function calcDamage() { ... }
function getTypeEffectiveness() { ... }

// 类：帕斯卡命名
class Pokemon { ... }
class BattleState { ... }

// 私有变量：下划线前缀
const _internalCache = new Map();
```

**注释规范**：
```javascript
/**
 * 计算伤害
 * @param {Pokemon} attacker - 攻击方
 * @param {Pokemon} defender - 防御方
 * @param {Move} move - 招式
 * @param {Object} options - 可选参数
 * @returns {Object} 伤害结果
 */
export function calcDamage(attacker, defender, move, options = {}) {
    // 实现
}
```

### 2. 错误处理

```javascript
export function calcDamage(attacker, defender, move, options = {}) {
    // 参数验证
    if (!attacker || !defender || !move) {
        console.error('[calcDamage] Invalid parameters', { attacker, defender, move });
        return { damage: 0, effectiveness: 0, miss: true, failed: true };
    }
    
    try {
        // 核心逻辑
        const damage = performCalculation();
        return { damage, effectiveness: 1, miss: false };
    } catch (error) {
        console.error('[calcDamage] Calculation error:', error);
        return { damage: 0, effectiveness: 0, miss: true, failed: true };
    }
}
```

### 3. 模块化设计

**单一职责原则**：
```javascript
// ❌ 不好：一个函数做太多事
function handleBattleTurn(player, enemy, move) {
    // 计算伤害
    // 应用伤害
    // 处理副作用
    // 更新 UI
    // 检查胜负
}

// ✅ 好：拆分职责
function executeBattleTurn(player, enemy, move) {
    const damage = calcDamage(player, enemy, move);
    applyDamage(enemy, damage);
    applySecondaryEffects(player, enemy, move);
    updateBattleUI();
    checkBattleEnd();
}
```

### 4. 可测试性

```javascript
// ✅ 纯函数，易于测试
export function calcDamage(attacker, defender, move, options = {}) {
    // 无副作用，只依赖参数
    return { damage: 100 };
}

// ❌ 依赖全局状态，难以测试
function calcDamage(move) {
    const attacker = window.battle.getPlayer();  // 全局依赖
    const defender = window.battle.getEnemy();
    // ...
}
```

### 5. 向后兼容

```javascript
// 保持旧 API 兼容
export function calcDamage(attacker, defender, move, options = {}) {
    // 新实现
}

// 兼容旧代码
if (typeof window !== 'undefined') {
    window.calcDamage = calcDamage;
    
    // 提供迁移提示
    window.oldCalcDamage = function(...args) {
        console.warn('[Deprecated] Use calcDamage instead of oldCalcDamage');
        return calcDamage(...args);
    };
}
```

---

## 常见问题

### Q: 如何调试招式不生效？

A: 检查以下步骤：
1. 招式数据是否正确添加到 `moves-data.js`
2. 招式 ID 是否正确（小写、无特殊字符）
3. 招式处理器是否正确注册到 `MoveHandlers`
4. 查看控制台是否有错误日志

### Q: 如何添加新的对冲类型？

A: 参考 `mechanics/clash-system.js`：
1. 在 `CLASH_TYPE` 添加新类型
2. 在 `CLASH_MATRIX` 添加交互规则
3. 在 `OVERRIDE` 数组添加招式映射

### Q: 如何优化 AI 性能？

A: 
1. 使用 `isSimulation: true` 避免副作用
2. 缓存招式评分结果
3. 剪枝优化：提前终止劣势招式
4. 限制搜索深度

---

**文档结束**

更多问题请参考主文档或提交 Issue。
