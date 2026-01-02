/**
 * =============================================
 * 特性开发模板 - ABILITY TEMPLATE
 * =============================================
 * 
 * 使用方法：
 * 1. 复制需要的钩子模板
 * 2. 粘贴到 engine/ability-handlers.js 的 AbilityHandlers 对象中
 * 3. 修改特性名称和逻辑
 * 
 * ⚠️ 重要：参数顺序必须严格按照模板，否则会导致 NaN/undefined BUG
 */

// ============================================
// 模板：伤害修正类特性
// ============================================

/**
 * 基础威力修正模板
 * 调用位置: battle-calc.js:109
 */
const BasePowerTemplate = {
    'Template_BasePower': {
        onBasePower: (power, attacker, defender, move) => {
            // power: number - 当前基础威力
            // attacker: Pokemon - 攻击方
            // defender: Pokemon - 防御方
            // move: object - { name, type, power, cat, ... }
            
            // 示例：特定属性威力提升
            if (move.type === 'Fire') {
                return Math.floor(power * 1.5);
            }
            
            // ⚠️ 必须返回 power
            return power;
        }
    }
};

/**
 * 防御方伤害修正模板
 * 调用位置: battle-calc.js:531
 */
const DefenderModifyDamageTemplate = {
    'Template_DefenderDamage': {
        onDefenderModifyDamage: (damage, attacker, defender, move, effectiveness) => {
            // damage: number - 当前伤害值
            // attacker: Pokemon - 攻击方
            // defender: Pokemon - 防御方
            // move: object - 招式对象
            // effectiveness: number - 属性克制倍率 (0.25, 0.5, 1, 2, 4)
            
            // 示例：特定属性伤害减半
            if (move.type === 'Fire') {
                return Math.floor(damage * 0.5);
            }
            
            // 示例：克制伤害减少
            if (effectiveness > 1) {
                return Math.floor(damage * 0.75);
            }
            
            // ⚠️ 必须返回 damage
            return damage;
        }
    }
};

// ============================================
// 模板：能力值修正类特性
// ============================================

/**
 * 能力值修正模板
 * 调用位置: battle-engine.js:932
 */
const ModifyStatTemplate = {
    'Template_ModifyStat': {
        onModifyStat: (stats, poke, battle) => {
            // stats: object - { atk, def, spa, spd, spe } 可直接修改
            // poke: Pokemon - 当前宝可梦
            // battle: BattleState - 战斗状态
            
            // 示例：物攻翻倍
            stats.atk *= 2;
            
            // 示例：天气条件下速度翻倍
            if (battle && battle.weather === 'sunnyday') {
                stats.spe *= 2;
            }
            
            // 示例：异常状态时攻击提升
            if (poke.status) {
                stats.atk = Math.floor(stats.atk * 1.5);
            }
            
            // ⚠️ 不需要返回值，直接修改 stats 对象
        }
    }
};

// ============================================
// 模板：免疫类特性
// ============================================

/**
 * 属性免疫模板
 * 调用位置: battle-calc.js:210
 */
const ImmunityTemplate = {
    'Template_Immunity': {
        // 简单属性免疫
        onImmunity: (atkType, move) => {
            // atkType: string - 攻击属性 ('Fire', 'Water', etc.)
            // move: object - 招式对象
            
            // 示例：免疫地面
            return atkType === 'Ground';
        }
    },
    
    'Template_ImmunityWithMove': {
        // 特定招式免疫
        onImmunity: (atkType, move) => {
            const soundMoves = ['Boomburst', 'Bug Buzz', 'Hyper Voice'];
            return move && soundMoves.includes(move.name);
        }
    }
};

/**
 * 吸收攻击模板（免疫+效果）
 * 调用位置: 免疫判定后
 */
const AbsorbHitTemplate = {
    'Template_AbsorbHit': {
        onImmunity: (atkType) => atkType === 'Water',
        onAbsorbHit: (pokemon, move, logs) => {
            // pokemon: Pokemon - 被攻击的宝可梦
            // move: object - 招式对象
            // logs: string[] - 日志数组
            
            if (move.type === 'Water') {
                // 回复 HP
                const heal = Math.floor(pokemon.maxHp / 4);
                pokemon.currHp = Math.min(pokemon.maxHp, pokemon.currHp + heal);
                logs.push(`💧 ${pokemon.cnName} 回复了 ${heal} HP！`);
                return { absorbed: true, heal };
            }
            return { absorbed: false };
        }
    },
    
    'Template_AbsorbWithBoost': {
        onImmunity: (atkType) => atkType === 'Electric',
        onAbsorbHit: (pokemon, move, logs) => {
            if (move.type === 'Electric') {
                // 提升能力
                if (pokemon.applyBoost) pokemon.applyBoost('spa', 1);
                logs.push(`⚡ ${pokemon.cnName} 的特攻提升了！`);
                return { absorbed: true };
            }
            return { absorbed: false };
        }
    }
};

// ============================================
// 模板：入场/退场类特性
// ============================================

/**
 * 入场效果模板
 * 调用位置: battle-switch.js:516
 */
const OnStartTemplate = {
    'Template_OnStart': {
        onStart: (self, enemy, logs, battle) => {
            // self: Pokemon - 入场的宝可梦
            // enemy: Pokemon - 对手宝可梦
            // logs: string[] - 日志数组
            // battle: BattleState - 战斗状态
            
            // 示例：威吓
            if (enemy && enemy.isAlive() && typeof enemy.applyBoost === 'function') {
                enemy.applyBoost('atk', -1);
                logs.push(`${self.cnName} 的威吓让对手攻击降低了!`);
            }
        }
    },
    
    'Template_WeatherStart': {
        onStart: (self, enemy, logs, battle) => {
            // 设置天气
            if (battle) battle.weather = 'sunnyday';
            logs.push(`☀️ ${self.cnName} 让阳光变得强烈了!`);
        }
    }
};

/**
 * 退场效果模板
 * 调用位置: 换人逻辑中
 */
const OnSwitchOutTemplate = {
    'Template_SwitchOut': {
        onSwitchOut: (pokemon) => {
            // pokemon: Pokemon - 退场的宝可梦
            
            // 示例：再生力
            if (pokemon.currHp < pokemon.maxHp && pokemon.currHp > 0) {
                const heal = Math.floor(pokemon.maxHp / 3);
                pokemon.currHp = Math.min(pokemon.maxHp, pokemon.currHp + heal);
            }
        }
    }
};

// ============================================
// 模板：回合结束类特性
// ============================================

/**
 * 回合结束效果模板
 * 调用位置: index.js:1993
 */
const OnEndTurnTemplate = {
    'Template_EndTurn': {
        onEndTurn: (pokemon, logs) => {
            // pokemon: Pokemon - 当前宝可梦
            // logs: string[] - 日志数组
            
            // 示例：加速
            if (pokemon.boosts && pokemon.boosts.spe < 6) {
                if (typeof pokemon.applyBoost === 'function') {
                    pokemon.applyBoost('spe', 1);
                    logs.push(`${pokemon.cnName} 的速度提升了!`);
                }
            }
        }
    }
};

// ============================================
// 模板：击杀触发类特性
// ============================================

/**
 * 击杀后效果模板
 * 调用位置: battle-switch.js:222
 */
const OnKillTemplate = {
    'Template_OnKill': {
        onKill: (attacker, logs) => {
            // attacker: Pokemon - 击杀者
            // logs: string[] - 日志数组
            
            // 示例：自信过剩
            if (typeof attacker.applyBoost === 'function') {
                attacker.applyBoost('atk', 1);
                logs.push(`${attacker.cnName} 的攻击提升了!`);
            }
        }
    }
};

// ============================================
// 模板：接触反馈类特性
// ============================================

/**
 * 接触反伤模板
 * 调用位置: battle-effects.js:349
 */
const ContactDamageTemplate = {
    'Template_ContactDamage': {
        onContactDamage: (attacker, defender) => {
            // attacker: Pokemon - 发起接触的攻击方
            // defender: Pokemon - 拥有特性的防御方
            
            return { 
                damage: Math.floor(attacker.maxHp / 8), 
                message: `${attacker.cnName} 被特性伤害了！` 
            };
        }
    }
};

/**
 * 接触状态模板
 * 调用位置: battle-effects.js:358
 */
const ContactStatusTemplate = {
    'Template_ContactStatus': {
        onContactStatus: (attacker, defender) => {
            // attacker: Pokemon - 发起接触的攻击方
            // defender: Pokemon - 拥有特性的防御方
            
            // 30% 概率触发
            if (Math.random() < 0.3) {
                return { status: 'par', message: `${attacker.cnName} 被麻痹了！` };
            }
            return null;
        }
    }
};

// ============================================
// 模板：优先度/命中类特性
// ============================================

/**
 * 优先度修正模板
 * 调用位置: move-effects.js:113
 */
const ModifyPriorityTemplate = {
    'Template_Priority': {
        onModifyPriority: (priority, user, target, move) => {
            // priority: number - 当前优先度
            // user: Pokemon - 使用者
            // target: Pokemon | null - 目标
            // move: object - 招式对象
            
            // 示例：变化技优先度+1
            if (move.cat === 'status' || move.category === 'Status') {
                return priority + 1;
            }
            return priority;
        }
    }
};

/**
 * 命中判定模板
 * 调用位置: battle-calc.js:219
 */
const TryHitTemplate = {
    'Template_TryHit': {
        onTryHit: (attacker, defender, move, effectiveness) => {
            // attacker: Pokemon - 攻击方
            // defender: Pokemon - 防御方
            // move: object - 招式对象
            // effectiveness: number - 属性克制倍率
            
            // 示例：神奇守护
            if (effectiveness <= 1) {
                return { blocked: true, message: `${defender.cnName} 的特性让攻击无效了！` };
            }
            return { blocked: false };
        }
    }
};

// ============================================
// 模板：招式修改类特性
// ============================================

/**
 * 招式属性修改模板
 * 调用位置: battle-calc.js:33
 */
const ModifyMoveTemplate = {
    'Template_ModifyMove': {
        onModifyMove: (move, attacker) => {
            // move: object - 招式对象（可直接修改）
            // attacker: Pokemon - 攻击方
            
            // 示例：声音招式变水属性
            const soundMoves = ['Boomburst', 'Hyper Voice'];
            if (soundMoves.includes(move.name)) {
                move.type = 'Water';
            }
            
            // ⚠️ 不需要返回值，直接修改 move 对象
        }
    }
};

/**
 * 行动前检查模板
 * 调用位置: battle-turns.js:102
 */
const BeforeMoveTemplate = {
    'Template_BeforeMove': {
        onBeforeMove: (user, move, logs) => {
            // user: Pokemon - 使用者
            // move: object - 招式对象
            // logs: string[] - 日志数组
            
            // 示例：懒惰
            if (user.skipNextTurn) {
                logs.push(`${user.cnName} 正在偷懒！`);
                user.skipNextTurn = false;
                return false; // 禁止行动
            }
            user.skipNextTurn = true;
            return true; // 允许行动
        }
    }
};

// ============================================
// 模板：能力变化类特性
// ============================================

/**
 * 能力变化阻止模板
 * 调用位置: applyBoost 方法中
 */
const TryBoostTemplate = {
    'Template_TryBoost': {
        onTryBoost: (boost, pokemon, source, stat) => {
            // boost: number - 能力变化等级
            // pokemon: Pokemon - 被影响的宝可梦
            // source: Pokemon - 来源宝可梦
            // stat: string - 能力名称
            
            // 示例：免疫能力下降
            if (boost < 0 && source !== pokemon) {
                return 0; // 阻止下降
            }
            return boost;
        }
    }
};

/**
 * 能力下降后触发模板
 * 调用位置: 能力下降后
 */
const AfterStatDropTemplate = {
    'Template_AfterStatDrop': {
        onAfterStatDrop: (pokemon, stat, stages, logs) => {
            // pokemon: Pokemon - 被降能力的宝可梦
            // stat: string - 被降的能力
            // stages: number - 下降的等级
            // logs: string[] - 日志数组
            
            // 示例：不服输
            if (typeof pokemon.applyBoost === 'function') {
                pokemon.applyBoost('atk', 2);
                logs.push(`${pokemon.cnName} 的攻击大幅提升了!`);
            }
        }
    }
};

// ============================================
// 模板：状态免疫类特性
// ============================================

/**
 * 状态免疫模板
 * 调用位置: 状态施加时
 */
const ImmunityStatusTemplate = {
    'Template_ImmunityStatus': {
        // 简单状态免疫
        onImmunityStatus: (status) => {
            return status === 'par'; // 免疫麻痹
        }
    },
    
    'Template_ConditionalImmunity': {
        // 条件状态免疫
        onImmunityStatus: (status, pokemon, battle) => {
            // 晴天时免疫所有状态
            return battle && battle.weather === 'sunnyday';
        }
    }
};

// ============================================
// 完整特性示例
// ============================================

/**
 * 完整特性示例：干燥皮肤
 * 免疫水系+回复HP，火系伤害x1.25
 */
const ExampleDrySkin = {
    'Dry Skin': {
        // 免疫水系
        onImmunity: (atkType) => atkType === 'Water',
        
        // 水系攻击回复HP
        onAbsorbHit: (pokemon, move, logs) => {
            if (move.type === 'Water') {
                const heal = Math.floor(pokemon.maxHp / 4);
                pokemon.currHp = Math.min(pokemon.maxHp, pokemon.currHp + heal);
                logs.push(`💧 ${pokemon.cnName} 的干燥皮肤回复了 ${heal} HP！`);
                return { absorbed: true, heal };
            }
            return { absorbed: false };
        },
        
        // 火系伤害x1.25
        onDefenderModifyDamage: (damage, attacker, defender, move, effectiveness) => {
            return move.type === 'Fire' ? Math.floor(damage * 1.25) : damage;
        }
    }
};

/**
 * 完整特性示例：威吓
 * 入场时降低对手攻击
 */
const ExampleIntimidate = {
    'Intimidate': {
        onStart: (self, enemy, logs, battle) => {
            if (!enemy || !enemy.isAlive()) return;
            
            // 检查对方是否有防止下降的特性
            const immuneAbilities = ['Clear Body', 'White Smoke', 'Inner Focus'];
            if (enemy.ability && immuneAbilities.includes(enemy.ability)) {
                logs.push(`(对方的 ${enemy.ability} 免疫了威吓!)`);
                return;
            }
            
            if (typeof enemy.applyBoost === 'function') {
                enemy.applyBoost('atk', -1);
                logs.push(`${self.cnName} 的威吓让对手攻击降低了!`);
            }
        }
    }
};

// ============================================
// 导出说明
// ============================================

/**
 * 如何使用这些模板：
 * 
 * 1. 在 engine/ability-handlers.js 中找到 AbilityHandlers 对象
 * 2. 复制需要的模板代码
 * 3. 修改特性名称（如 'Template_BasePower' → 'My Ability'）
 * 4. 修改内部逻辑
 * 5. 测试特性是否正常工作
 * 
 * ⚠️ 注意事项：
 * - 参数顺序必须严格按照模板
 * - 数值计算使用 Math.floor()
 * - 所有分支必须有返回值（除了 void 类型）
 * - 测试时检查控制台是否有 NaN 或 undefined
 */
