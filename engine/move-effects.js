/**
 * =============================================
 * MOVE EFFECTS - 技能效果扩展模块
 * =============================================
 * 
 * 处理 moves-data.js 中的通用字段，实现高级战斗机制：
 * - 优先级 (Priority)
 * - 状态异常 (Status Conditions)
 * - 天气效果 (Weather)
 * - 场地效果 (Terrain)
 * - 特殊技能标记 (Flags)
 * - 固定伤害技能
 * - 一击必杀技能
 */

// ========== 优先级系统 (Priority) ==========
// 决定回合内的行动顺序

/**
 * 获取技能优先级
 * @param {object} move 技能数据
 * @returns {number} 优先级 (-7 ~ +5)
 */
function getMovePriority(move) {
    // 【古武系统】如果招式对象已有 priority 属性（被 style 修改过），直接使用
    if (typeof move.priority === 'number') {
        return move.priority;
    }
    
    const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const fullMoveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
    
    // 从数据中读取优先级
    if (typeof fullMoveData.priority === 'number') {
        return fullMoveData.priority;
    }
    
    // 硬编码常见优先级技能
    const priorityMap = {
        // +5
        'Helping Hand': 5,
        // +4
        'Protect': 4, 'Detect': 4, 'Endure': 4, 'Magic Coat': 4, 'Snatch': 4,
        'Baneful Bunker': 4, 'Spiky Shield': 4, "King's Shield": 4, 'Obstruct': 4,
        'Silk Trap': 4, 'Burning Bulwark': 4,
        // +3
        'Fake Out': 3, 'Quick Guard': 3, 'Wide Guard': 3, 'Crafty Shield': 3,
        // +2
        'Extreme Speed': 2, 'Feint': 2, 'First Impression': 2, 'Accelerock': 2,
        // +1
        'Aqua Jet': 1, 'Baby-Doll Eyes': 1, 'Bullet Punch': 1, 'Ice Shard': 1,
        'Mach Punch': 1, 'Quick Attack': 1, 'Shadow Sneak': 1, 'Sucker Punch': 1,
        'Vacuum Wave': 1, 'Water Shuriken': 1, 'Grassy Glide': 1, 'Jet Punch': 1,
        // -1
        'Vital Throw': -1,
        // -3
        'Focus Punch': -3,
        // -4
        'Avalanche': -4, 'Revenge': -4,
        // -5
        'Counter': -5, 'Mirror Coat': -5,
        // -6
        'Circle Throw': -6, 'Dragon Tail': -6, 'Roar': -6, 'Whirlwind': -6, 'Teleport': -6,
        // -7
        'Trick Room': -7
    };
    
    return priorityMap[move.name] || 0;
}

/**
 * 比较两个行动的先后顺序
 * @param {object} action1 { pokemon, move, isPlayer }
 * @param {object} action2 { pokemon, move, isPlayer }
 * @returns {number} 负数=action1先，正数=action2先，0=同速
 */
function compareActionOrder(action1, action2) {
    const pri1 = getMovePriority(action1.move);
    const pri2 = getMovePriority(action2.move);
    
    // 优先级高的先动
    if (pri1 !== pri2) {
        return pri2 - pri1;
    }
    
    // 同优先级比速度
    const spe1 = action1.pokemon.getStat('spe');
    const spe2 = action2.pokemon.getStat('spe');
    
    if (spe1 !== spe2) {
        return spe2 - spe1; // 速度高的先动
    }
    
    // 同速随机
    return Math.random() < 0.5 ? -1 : 1;
}

// ========== 状态异常系统 (Status Conditions) ==========

const STATUS_CONDITIONS = {
    // 主要状态（互斥）
    par: { name: '麻痹', color: '#f1c40f', speedMod: 0.5, skipChance: 0.25 },
    brn: { name: '灼伤', color: '#e74c3c', atkMod: 0.5, dotPercent: 1/16 },
    psn: { name: '中毒', color: '#9b59b6', dotPercent: 1/8 },
    tox: { name: '剧毒', color: '#8e44ad', dotBase: 1/16, dotIncrement: true },
    slp: { name: '睡眠', color: '#95a5a6', skipChance: 1, duration: [1, 3] },
    frz: { name: '冰冻', color: '#3498db', skipChance: 1, thawChance: 0.2 }
};

/**
 * 尝试给目标施加状态异常
 * @param {Pokemon} target 目标
 * @param {string} status 状态ID (par/brn/psn/tox/slp/frz)
 * @returns {object} { success, message }
 */
function tryInflictStatus(target, status) {
    // 已有主要状态则无法施加
    if (target.status) {
        return { success: false, message: `${target.cnName} 已经处于异常状态!` };
    }
    
    // 属性免疫检查
    const immunities = {
        par: ['Electric'], // 电系免疫麻痹
        brn: ['Fire'],     // 火系免疫灼伤
        psn: ['Poison', 'Steel'], // 毒/钢系免疫中毒
        tox: ['Poison', 'Steel'],
        frz: ['Ice']       // 冰系免疫冰冻
    };
    
    if (immunities[status]) {
        for (const type of target.types) {
            if (immunities[status].includes(type)) {
                return { success: false, message: `${target.cnName} 的${type}属性免疫了该状态!` };
            }
        }
    }
    
    // 施加状态
    target.status = status;
    target.statusTurns = 0;
    
    const statusInfo = STATUS_CONDITIONS[status];
    return { 
        success: true, 
        message: `${target.cnName} ${statusInfo.name}了!` 
    };
}

/**
 * 处理回合开始时的状态效果
 * @param {Pokemon} pokemon 
 * @returns {object} { canMove, damage, message }
 */
function processStatusEffects(pokemon) {
    if (!pokemon.status) {
        return { canMove: true, damage: 0, message: null };
    }
    
    const status = pokemon.status;
    const info = STATUS_CONDITIONS[status];
    let result = { canMove: true, damage: 0, message: null };
    
    switch (status) {
        case 'par':
            // 25% 概率无法行动
            if (Math.random() < info.skipChance) {
                result.canMove = false;
                result.message = `${pokemon.cnName} 因麻痹而无法行动!`;
            }
            break;
            
        case 'slp':
            pokemon.statusTurns++;
            const sleepDuration = pokemon.sleepDuration || (Math.floor(Math.random() * 3) + 1);
            pokemon.sleepDuration = sleepDuration;
            
            if (pokemon.statusTurns >= sleepDuration) {
                pokemon.status = null;
                pokemon.statusTurns = 0;
                pokemon.sleepDuration = 0;
                result.message = `${pokemon.cnName} 醒来了!`;
            } else {
                result.canMove = false;
                result.message = `${pokemon.cnName} 正在睡觉...`;
            }
            break;
            
        case 'frz':
            // 20% 概率解冻
            if (Math.random() < info.thawChance) {
                pokemon.status = null;
                result.message = `${pokemon.cnName} 解冻了!`;
            } else {
                result.canMove = false;
                result.message = `${pokemon.cnName} 被冻住了!`;
            }
            break;
    }
    
    return result;
}

/**
 * 处理回合结束时的状态伤害
 * @param {Pokemon} pokemon 
 * @returns {object} { damage, message }
 */
function processStatusDamage(pokemon) {
    if (!pokemon.status) {
        return { damage: 0, message: null };
    }
    
    const status = pokemon.status;
    let damage = 0;
    let message = null;
    
    switch (status) {
        case 'brn':
            damage = Math.max(1, Math.floor(pokemon.maxHp / 16));
            pokemon.takeDamage(damage);
            message = `${pokemon.cnName} 因灼伤受到了 ${damage} 点伤害!`;
            break;
            
        case 'psn':
            damage = Math.max(1, Math.floor(pokemon.maxHp / 8));
            pokemon.takeDamage(damage);
            message = `${pokemon.cnName} 因中毒受到了 ${damage} 点伤害!`;
            break;
            
        case 'tox':
            pokemon.statusTurns = (pokemon.statusTurns || 0) + 1;
            damage = Math.max(1, Math.floor(pokemon.maxHp * pokemon.statusTurns / 16));
            pokemon.takeDamage(damage);
            message = `${pokemon.cnName} 因剧毒受到了 ${damage} 点伤害!`;
            break;
    }
    
    return { damage, message };
}

// ========== 技能附加状态效果 ==========

/**
 * 处理技能的状态异常附加效果
 * @param {Pokemon} user 攻击方
 * @param {Pokemon} target 防御方
 * @param {object} move 技能数据
 * @returns {Array} 日志消息数组
 */
function processMoveStatusEffects(user, target, move) {
    const logs = [];
    const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const fullMoveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
    
    // 检查 secondary 中的状态效果
    if (fullMoveData.secondary && fullMoveData.secondary.status) {
        const chance = fullMoveData.secondary.chance || 100;
        if (Math.random() * 100 < chance) {
            const result = tryInflictStatus(target, fullMoveData.secondary.status);
            if (result.message) logs.push(result.message);
        }
    }
    
    // 检查必定触发的状态效果
    if (fullMoveData.status) {
        const result = tryInflictStatus(target, fullMoveData.status);
        if (result.message) logs.push(result.message);
    }
    
    // 硬编码常见状态技能
    const statusMoves = {
        'Thunder Wave': { status: 'par', chance: 100 },
        'Stun Spore': { status: 'par', chance: 100 },
        'Glare': { status: 'par', chance: 100 },
        'Nuzzle': { status: 'par', chance: 100 },
        'Will-O-Wisp': { status: 'brn', chance: 100 },
        'Toxic': { status: 'tox', chance: 100 },
        'Poison Powder': { status: 'psn', chance: 100 },
        'Poison Gas': { status: 'psn', chance: 100 },
        'Spore': { status: 'slp', chance: 100 },
        'Sleep Powder': { status: 'slp', chance: 75 },
        'Hypnosis': { status: 'slp', chance: 60 },
        'Sing': { status: 'slp', chance: 55 },
        // 攻击技能附带效果
        'Thunderbolt': { status: 'par', chance: 10 },
        'Thunder': { status: 'par', chance: 30 },
        'Discharge': { status: 'par', chance: 30 },
        'Body Slam': { status: 'par', chance: 30 },
        'Flamethrower': { status: 'brn', chance: 10 },
        'Fire Blast': { status: 'brn', chance: 10 },
        'Scald': { status: 'brn', chance: 30 },
        'Lava Plume': { status: 'brn', chance: 30 },
        'Ice Beam': { status: 'frz', chance: 10 },
        'Blizzard': { status: 'frz', chance: 10 },
        'Sludge Bomb': { status: 'psn', chance: 30 },
        'Poison Jab': { status: 'psn', chance: 30 }
    };
    
    if (statusMoves[move.name] && !fullMoveData.secondary?.status) {
        const { status, chance } = statusMoves[move.name];
        if (Math.random() * 100 < chance) {
            const result = tryInflictStatus(target, status);
            if (result.success && result.message) logs.push(result.message);
        }
    }
    
    return logs;
}

// ========== 固定伤害技能 ==========

/**
 * 检查并计算固定伤害技能
 * @param {Pokemon} attacker 
 * @param {Pokemon} defender 
 * @param {object} move 
 * @returns {object|null} { damage, message } 或 null（非固定伤害技能）
 */
function checkFixedDamageMove(attacker, defender, move) {
    const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const fullMoveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
    
    // damage 字段表示固定伤害
    if (fullMoveData.damage) {
        if (fullMoveData.damage === 'level') {
            return { damage: attacker.level, message: null };
        }
        if (typeof fullMoveData.damage === 'number') {
            return { damage: fullMoveData.damage, message: null };
        }
    }
    
    // 特殊固定伤害技能
    const fixedDamageMoves = {
        'Sonic Boom': 20,
        'Dragon Rage': 40,
        'Seismic Toss': 'level',
        'Night Shade': 'level',
        'Psywave': 'random', // 0.5x ~ 1.5x level
        'Super Fang': 'half', // 当前HP的一半
        'Nature\'s Madness': 'half',
        'Guardian of Alola': 'threequarters',
        'Endeavor': 'endeavor' // 将对方HP降到与自己相同
    };
    
    const fixedType = fixedDamageMoves[move.name];
    if (!fixedType) return null;
    
    let damage = 0;
    switch (fixedType) {
        case 'level':
            damage = attacker.level;
            break;
        case 'random':
            damage = Math.floor(attacker.level * (0.5 + Math.random()));
            break;
        case 'half':
            damage = Math.floor(defender.currHp / 2);
            break;
        case 'threequarters':
            damage = Math.floor(defender.currHp * 3 / 4);
            break;
        case 'endeavor':
            damage = Math.max(0, defender.currHp - attacker.currHp);
            break;
        default:
            if (typeof fixedType === 'number') {
                damage = fixedType;
            }
    }
    
    return { damage: Math.max(1, damage), message: null };
}

// ========== 一击必杀技能 (OHKO) ==========

/**
 * 检查一击必杀技能
 * @param {Pokemon} attacker 
 * @param {Pokemon} defender 
 * @param {object} move 
 * @returns {object|null} { success, damage, message } 或 null
 */
function checkOHKOMove(attacker, defender, move) {
    const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const fullMoveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
    
    // ohko 字段标记一击必杀
    if (!fullMoveData.ohko) {
        const ohkoMoves = ['Fissure', 'Horn Drill', 'Guillotine', 'Sheer Cold'];
        if (!ohkoMoves.includes(move.name)) return null;
    }
    
    // 等级低于对方则无效
    if (attacker.level < defender.level) {
        return { success: false, damage: 0, message: `${defender.cnName} 的等级太高了!` };
    }
    
    // 命中率 = 30 + (攻击方等级 - 防御方等级)
    const hitChance = 30 + (attacker.level - defender.level);
    
    if (Math.random() * 100 < hitChance) {
        return { 
            success: true, 
            damage: defender.currHp, 
            message: `一击必杀!` 
        };
    } else {
        return { success: false, damage: 0, message: null };
    }
}

// ========== 天气系统 (Weather) ==========

const WEATHER_TYPES = {
    sunnyday: { name: '大晴天', fireBoost: 1.5, waterNerf: 0.5, solarBeamCharge: false },
    raindance: { name: '下雨', waterBoost: 1.5, fireNerf: 0.5, thunderAccuracy: true },
    sandstorm: { name: '沙暴', dotTypes: ['Rock', 'Ground', 'Steel'], spDefBoost: ['Rock'] },
    hail: { name: '冰雹', dotExcept: ['Ice'], blizzardAccuracy: true },
    snow: { name: '下雪', defBoost: ['Ice'] }
};

/**
 * 获取天气对技能威力的修正
 * @param {string} weather 当前天气
 * @param {string} moveType 技能属性
 * @returns {number} 威力倍率
 */
function getWeatherModifier(weather, moveType) {
    if (!weather || !WEATHER_TYPES[weather]) return 1;
    
    const w = WEATHER_TYPES[weather];
    
    if (moveType === 'Fire') {
        if (w.fireBoost) return w.fireBoost;
        if (w.fireNerf) return w.fireNerf;
    }
    
    if (moveType === 'Water') {
        if (w.waterBoost) return w.waterBoost;
        if (w.waterNerf) return w.waterNerf;
    }
    
    return 1;
}

// ========== 场地系统 (Terrain) ==========

const TERRAIN_TYPES = {
    electricterrain: { name: '电气场地', boost: 'Electric', preventSleep: true },
    grassyterrain: { name: '青草场地', boost: 'Grass', healPercent: 1/16 },
    psychicterrain: { name: '精神场地', boost: 'Psychic', blockPriority: true },
    mistyterrain: { name: '薄雾场地', dragonNerf: 0.5, preventStatus: true }
};

/**
 * 获取场地对技能威力的修正
 * @param {string} terrain 当前场地
 * @param {string} moveType 技能属性
 * @param {boolean} isGrounded 是否接地
 * @returns {number} 威力倍率
 */
function getTerrainModifier(terrain, moveType, isGrounded = true) {
    if (!terrain || !isGrounded || !TERRAIN_TYPES[terrain]) return 1;
    
    const t = TERRAIN_TYPES[terrain];
    
    if (t.boost === moveType) return 1.3;
    if (moveType === 'Dragon' && t.dragonNerf) return t.dragonNerf;
    
    return 1;
}

// ========== 技能标记系统 (Flags) ==========

/**
 * 检查技能是否有特定标记
 * @param {object} move 
 * @param {string} flag 标记名
 * @returns {boolean}
 */
function hasMoveFlag(move, flag) {
    const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const fullMoveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
    
    return !!(fullMoveData.flags && fullMoveData.flags[flag]);
}

// 常用标记说明
const MOVE_FLAGS = {
    contact: '接触类技能，触发接触特性（如铁刺、静电）',
    protect: '可被守住类技能挡下',
    mirror: '可被魔法反射反弹',
    sound: '声音类技能，穿透替身',
    punch: '拳类技能，铁拳特性加成',
    bite: '咬类技能，强壮之颚特性加成',
    bullet: '子弹/球类技能，防弹特性免疫',
    pulse: '波动类技能，超级发射器特性加成',
    slicing: '斩切类技能，锋锐特性加成',
    wind: '风类技能，风力发电特性触发'
};

/**
 * 检查技能是否为接触类
 */
function isContactMove(move) {
    return hasMoveFlag(move, 'contact');
}

/**
 * 检查技能是否可被守住
 */
function isProtectable(move) {
    return hasMoveFlag(move, 'protect');
}

/**
 * 检查技能是否为声音类
 */
function isSoundMove(move) {
    return hasMoveFlag(move, 'sound');
}

// ========== 场地钉子系统 (Entry Hazards) ==========

/**
 * 处理场地状态技能 (sideCondition)
 * 包括：隐形岩、撒菱、毒菱、黏黏网、顺风、双墙等
 * @param {Pokemon} user 使用者
 * @param {object} move 技能数据
 * @param {object} battle 战斗实例
 * @returns {Array} 日志消息数组
 */
function applySideCondition(user, move, battle) {
    const logs = [];
    const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const fullMoveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
    
    if (!fullMoveData.sideCondition) return logs;
    
    const conditionId = fullMoveData.sideCondition;
    const target = fullMoveData.target || 'foeSide';
    
    // 判断施法者是否为玩家
    const isPlayerUser = battle && battle.getPlayer && (user === battle.getPlayer());
    
    // 获取受影响的场地（完全基于 target 字段，无硬编码）
    let targetSide = null;
    let sideNameCN = "我方";
    
    if (target === 'foeSide') {
        targetSide = isPlayerUser ? battle.enemySide : battle.playerSide;
        sideNameCN = isPlayerUser ? "敌方" : "我方";
    } else if (target === 'allySide' || target === 'self') {
        targetSide = isPlayerUser ? battle.playerSide : battle.enemySide;
        sideNameCN = isPlayerUser ? "我方" : "敌方";
    }
    
    if (!targetSide) return logs;
    
    // === 场地状态配置（数据驱动，易于扩展） ===
    const SIDE_CONDITION_CONFIG = {
        // 可叠加的钉子
        'spikes': {
            type: 'stackable',
            maxLayers: 3,
            key: 'spikes',
            messages: {
                success: (layers) => `撒菱散布在${sideNameCN}场地上! (当前${layers}层)`,
                failed: () => `但是没什么效果... (已经撒不下了)`
            }
        },
        'toxicspikes': {
            type: 'stackable',
            maxLayers: 2,
            key: 'toxicspikes',
            altKey: 'toxicSpikes', // 支持驼峰命名
            messages: {
                success: () => `毒菱散布在${sideNameCN}场地上!`,
                failed: () => `但是没什么效果... (已经撒不下了)`
            }
        },
        // 布尔型钉子
        'stealthrock': {
            type: 'boolean',
            key: 'stealthRock',
            messages: {
                success: () => `尖锐的岩石悬浮在${sideNameCN}场地上!`,
                failed: () => `但是失败了! (已经存在)`
            }
        },
        'stickyweb': {
            type: 'boolean',
            key: 'stickyWeb',
            messages: {
                success: () => `黏黏网铺设在${sideNameCN}场地上!`,
                failed: () => `但是失败了! (已经存在)`
            }
        },
        // 有时限的场地状态
        'tailwind': {
            type: 'timed',
            duration: 4, // 实际是5回合（设置后立即-1）
            key: 'tailwind',
            messages: {
                success: () => `${sideNameCN}刮起了顺风!`,
                failed: () => `但是失败了! (已经存在)`
            }
        },
        'reflect': {
            type: 'timed',
            duration: 5,
            key: 'reflect',
            messages: {
                success: () => `${sideNameCN}竖起了反射壁!`,
                failed: () => `但是失败了! (已经存在)`
            }
        },
        'lightscreen': {
            type: 'timed',
            duration: 5,
            key: 'lightScreen',
            messages: {
                success: () => `${sideNameCN}竖起了光墙!`,
                failed: () => `但是失败了! (已经存在)`
            }
        },
        'auroraveil': {
            type: 'timed',
            duration: 5,
            key: 'auroraVeil',
            messages: {
                success: () => `${sideNameCN}被极光幕包围了!`,
                failed: () => `但是失败了! (已经存在)`
            }
        }
    };
    
    const config = SIDE_CONDITION_CONFIG[conditionId];
    if (!config) {
        // 未配置的 sideCondition，使用通用处理
        console.warn(`[SIDE CONDITION] 未配置的场地状态: ${conditionId}`);
        return logs;
    }
    
    // 根据类型处理
    if (config.type === 'stackable') {
        // 可叠加类型
        const key = config.key;
        const altKey = config.altKey;
        if (!targetSide[key]) targetSide[key] = 0;
        if (altKey && !targetSide[altKey]) targetSide[altKey] = 0;
        
        const currentLayers = targetSide[key] || targetSide[altKey] || 0;
        if (currentLayers < config.maxLayers) {
            targetSide[key] = currentLayers + 1;
            if (altKey) targetSide[altKey] = currentLayers + 1;
            logs.push(config.messages.success(currentLayers + 1));
        } else {
            logs.push(config.messages.failed());
        }
    } else if (config.type === 'boolean') {
        // 布尔类型
        const key = config.key;
        if (!targetSide[key]) {
            targetSide[key] = true;
            logs.push(config.messages.success());
        } else {
            logs.push(config.messages.failed());
        }
    } else if (config.type === 'timed') {
        // 有时限类型
        const key = config.key;
        if (!targetSide[key] || targetSide[key] <= 0) {
            targetSide[key] = config.duration;
            logs.push(config.messages.success());
        } else {
            logs.push(config.messages.failed());
        }
    }
    
    return logs;
}

/**
 * 宝可梦上场时结算场地钉子伤害
 * @param {Pokemon} pokemon 上场的宝可梦
 * @param {boolean} isPlayer 是否为玩家方
 * @param {object} battle 战斗实例
 * @returns {Array} 日志消息数组
 */
function applyEntryHazards(pokemon, isPlayer, battle) {
    const logs = [];
    if (!pokemon || !battle) return logs;
    
    // 获取对应的场地状态
    const side = isPlayer ? battle.playerSide : battle.enemySide;
    if (!side) return logs;
    
    const types = pokemon.types || [];
    const isFlying = types.includes('Flying');
    const hasLevitate = (pokemon.ability || '').toLowerCase() === 'levitate';
    const isGrounded = !isFlying && !hasLevitate;
    const isPoison = types.includes('Poison');
    const isSteel = types.includes('Steel');
    
    // === 隐形岩 (Stealth Rock) ===
    // 岩石系伤害，根据属性克制计算
    if (side.stealthRock) {
        let effectiveness = 1;
        const rockChart = { 
            weak: ['Fire', 'Ice', 'Flying', 'Bug'], 
            resist: ['Fighting', 'Ground', 'Steel'] 
        };
        
        for (const type of types) {
            if (rockChart.weak.includes(type)) effectiveness *= 2;
            if (rockChart.resist.includes(type)) effectiveness *= 0.5;
        }
        
        const damage = Math.max(1, Math.floor(pokemon.maxHp * effectiveness / 8));
        pokemon.takeDamage(damage);
        logs.push(`尖锐的岩石扎进了 ${pokemon.cnName}! (-${damage})`);
    }
    
    // === 撒菱 (Spikes) ===
    // 地面系伤害，飞行/漂浮免疫
    if (side.spikes && side.spikes > 0 && isGrounded) {
        const layers = side.spikes;
        const damagePercent = [0, 1/8, 1/6, 1/4][layers] || 1/4;
        const damage = Math.max(1, Math.floor(pokemon.maxHp * damagePercent));
        pokemon.takeDamage(damage);
        logs.push(`${pokemon.cnName} 被撒菱扎伤了! (-${damage})`);
    }
    
    // === 毒菱 (Toxic Spikes) ===
    // 毒系宝可梦踩上去会清除，飞行/漂浮免疫
    // 注意：支持两种命名格式 toxicspikes 和 toxicSpikes
    const toxicLayers = side.toxicspikes || side.toxicSpikes || 0;
    if (toxicLayers > 0 && isGrounded) {
        if (isPoison) {
            // 毒系宝可梦清除毒菱
            side.toxicspikes = 0;
            side.toxicSpikes = 0;
            logs.push(`${pokemon.cnName} 吸收了毒菱!`);
        } else if (!isSteel && !pokemon.status) {
            // 钢系免疫中毒
            if (toxicLayers >= 2) {
                pokemon.status = 'tox';
                logs.push(`${pokemon.cnName} 中了剧毒!`);
            } else {
                pokemon.status = 'psn';
                logs.push(`${pokemon.cnName} 中毒了!`);
            }
        }
    }
    
    // === 黏黏网 (Sticky Web) ===
    // 速度-1，飞行/漂浮免疫
    if (side.stickyWeb && isGrounded) {
        if (typeof pokemon.applyBoost === 'function') {
            pokemon.applyBoost('spe', -1);
            logs.push(`${pokemon.cnName} 被黏黏网缠住了! 速度下降!`);
            if (typeof window.playSFX === 'function') window.playSFX('STAT_DOWN');
        }
    }
    
    return logs;
}

/**
 * 清除场地钉子（高速旋转、清除浓雾）
 * @param {boolean} isPlayer 清除哪一方的场地
 * @param {object} battle 战斗实例
 * @returns {Array} 日志消息数组
 */
function clearEntryHazards(isPlayer, battle) {
    const logs = [];
    if (!battle) return logs;
    
    const side = isPlayer ? battle.playerSide : battle.enemySide;
    if (!side) return logs;
    
    let cleared = false;
    
    if (side.stealthRock) {
        side.stealthRock = false;
        cleared = true;
    }
    if (side.spikes) {
        side.spikes = 0;
        cleared = true;
    }
    if (side.toxicspikes) {
        side.toxicspikes = 0;
        cleared = true;
    }
    if (side.stickyWeb) {
        side.stickyWeb = false;
        cleared = true;
    }
    
    if (cleared) {
        logs.push(`场地上的障碍物被清除了!`);
    }
    
    return logs;
}

// ========== Volatile 状态系统 (Taunt, Substitute 等) ==========

/**
 * 处理 Volatile 状态技能
 * @param {Pokemon} user 使用者
 * @param {Pokemon} target 目标
 * @param {object} move 技能数据
 * @returns {object} { success, logs }
 */
function applyVolatileStatus(user, target, move) {
    const logs = [];
    const moveName = move.name || '';
    
    // 初始化 volatile 对象
    if (!target.volatile) target.volatile = {};
    if (!user.volatile) user.volatile = {};
    
    switch (moveName) {
        case 'Taunt':
            // 挑衅：3回合内无法使用变化技
            if (target.volatile.taunt && target.volatile.taunt > 0) {
                logs.push(`但是失败了! (${target.cnName} 已经处于挑衅状态)`);
                return { success: false, logs };
            }
            target.volatile.taunt = 3;
            logs.push(`${target.cnName} 陷入了挑衅状态!`);
            return { success: true, logs };
            
        case 'Substitute':
            // 替身：消耗 1/4 HP 生成护盾
            const subHp = Math.floor(user.maxHp / 4);
            if (user.currHp <= subHp) {
                logs.push(`但是失败了! (HP 不足以制造替身)`);
                return { success: false, logs };
            }
            if (user.volatile.substitute && user.volatile.substitute > 0) {
                logs.push(`但是失败了! (已经有替身了)`);
                return { success: false, logs };
            }
            user.currHp -= subHp;
            user.volatile.substitute = subHp;
            logs.push(`${user.cnName} 制造了一个替身! (消耗 ${subHp} HP)`);
            return { success: true, logs };
            
        case 'Encore':
            // 再来一次：强制使用上一个技能
            if (!target.lastMoveUsed) {
                logs.push(`但是失败了!`);
                return { success: false, logs };
            }
            target.volatile.encore = 3;
            target.volatile.encoreMove = target.lastMoveUsed;
            logs.push(`${target.cnName} 被强制再来一次!`);
            return { success: true, logs };
            
        case 'Disable':
            // 定身法：封印上一个技能
            if (!target.lastMoveUsed) {
                logs.push(`但是失败了!`);
                return { success: false, logs };
            }
            target.volatile.disable = 4;
            target.volatile.disabledMove = target.lastMoveUsed;
            logs.push(`${target.cnName} 的 ${target.lastMoveUsed} 被封印了!`);
            return { success: true, logs };
            
        case 'Torment':
            // 无理取闹：无法连续使用同一技能
            target.volatile.torment = true;
            logs.push(`${target.cnName} 陷入了无理取闹状态!`);
            return { success: true, logs };
            
        case 'Heal Block':
            // 回复封锁
            target.volatile.healBlock = 5;
            logs.push(`${target.cnName} 被封锁了回复!`);
            return { success: true, logs };
            
        // ===================== 持续伤害/干扰类 =====================
        
        case 'Leech Seed':
            // 寄生种子：每回合吸取 1/8 HP
            if (target.types && target.types.includes('Grass')) {
                logs.push(`对草属性宝可梦无效!`);
                return { success: false, logs };
            }
            if (target.volatile.leechseed) {
                logs.push(`但是失败了! (${target.cnName} 已经被种下种子了)`);
                return { success: false, logs };
            }
            target.volatile.leechseed = true;
            logs.push(`寄生种子种在了 ${target.cnName} 身上!`);
            return { success: true, logs };
            
        case 'Curse':
            // 诅咒：区分幽灵系和非幽灵系
            if (user.types && user.types.includes('Ghost')) {
                // 幽灵系：扣 50% HP，对方每回合掉 1/4
                const curseCost = Math.floor(user.maxHp / 2);
                if (user.currHp <= curseCost) {
                    logs.push(`但是失败了! (HP 不足以施展诅咒)`);
                    return { success: false, logs };
                }
                user.currHp -= curseCost;
                target.volatile.curse = true;
                logs.push(`${user.cnName} 削减了自己的体力，对 ${target.cnName} 施加了诅咒!`);
                return { success: true, logs };
            } else {
                // 非幽灵系：速度-1，攻防+1（由 boosts 处理，这里只返回成功）
                return { success: false, logs }; // 让默认的 boosts 处理
            }
            
        case 'Yawn':
            // 哈欠：下回合结束时睡着
            if (target.status) {
                logs.push(`但是失败了! (${target.cnName} 已经有异常状态了)`);
                return { success: false, logs };
            }
            if (target.volatile.yawn) {
                logs.push(`但是失败了!`);
                return { success: false, logs };
            }
            target.volatile.yawn = 2; // 2回合后睡着
            logs.push(`${target.cnName} 打了个哈欠...`);
            return { success: true, logs };
            
        case 'Perish Song':
            // 灭亡之歌：3回合后双方倒下
            if (user.volatile.perishsong || target.volatile.perishsong) {
                logs.push(`但是失败了!`);
                return { success: false, logs };
            }
            user.volatile.perishsong = 3;
            target.volatile.perishsong = 3;
            logs.push(`所有听到歌声的宝可梦将在 3 回合后倒下!`);
            return { success: true, logs };
            
        case 'Destiny Bond':
            // 同命：如果自己倒下，对方也倒下
            user.volatile.destinybond = true;
            logs.push(`${user.cnName} 想要和对手同归于尽!`);
            return { success: true, logs };
            
        // ===================== 束缚类 =====================
        
        case 'Bind':
        case 'Wrap':
        case 'Fire Spin':
        case 'Clamp':
        case 'Whirlpool':
        case 'Sand Tomb':
        case 'Magma Storm':
        case 'Infestation':
        case 'Snap Trap':
            // 束缚：每回合扣 1/8 HP，持续 4-5 回合
            if (target.volatile.partiallytrapped) {
                logs.push(`但是失败了! (${target.cnName} 已经被束缚了)`);
                return { success: false, logs };
            }
            target.volatile.partiallytrapped = 4 + Math.floor(Math.random() * 2); // 4-5 回合
            logs.push(`${target.cnName} 被 ${moveName} 束缚住了!`);
            return { success: true, logs };
            
        // ===================== 混乱类 =====================
        
        case 'Confuse Ray':
        case 'Supersonic':
        case 'Sweet Kiss':
        case 'Teeter Dance':
        case 'Flatter':
        case 'Swagger':
            // 混乱
            if (target.volatile.confusion) {
                logs.push(`但是失败了! (${target.cnName} 已经混乱了)`);
                return { success: false, logs };
            }
            target.volatile.confusion = 2 + Math.floor(Math.random() * 4); // 2-5 回合
            logs.push(`${target.cnName} 混乱了!`);
            return { success: true, logs };
            
        // ===================== 接力类 =====================
        
        case 'Shed Tail':
            // 断尾：消耗 50% HP 制造替身并换人
            const shedCost = Math.ceil(user.maxHp / 2);
            if (user.currHp <= shedCost) {
                logs.push(`但是失败了! (HP 不足以断尾)`);
                return { success: false, logs };
            }
            user.currHp -= shedCost;
            // 制造一个 1/4 HP 的替身给下一只
            user.volatile.shedTailSub = Math.floor(user.maxHp / 4);
            logs.push(`${user.cnName} 制造了一个替身并准备撤退!`);
            return { success: true, logs, pivot: true, passSub: true };
            
        // ===================== 其他常用状态技 =====================
        
        case 'Attract':
            // 着迷
            if (target.volatile.attract) {
                logs.push(`但是失败了!`);
                return { success: false, logs };
            }
            target.volatile.attract = true;
            logs.push(`${target.cnName} 着迷了!`);
            return { success: true, logs };
            
        case 'Focus Energy':
            // 聚气：暴击率 +2
            user.volatile.focusenergy = true;
            logs.push(`${user.cnName} 深呼吸，集中精神!`);
            return { success: true, logs };
            
        case 'Imprison':
            // 封印：对手不能使用与自己相同的招式
            user.volatile.imprison = true;
            logs.push(`${user.cnName} 封印了对手的招式!`);
            return { success: true, logs };
            
        case 'Embargo':
            // 查封：无法使用道具
            target.volatile.embargo = 5;
            logs.push(`${target.cnName} 无法使用道具了!`);
            return { success: true, logs };
            
        case 'Aqua Ring':
            // 水流环：每回合回复 1/16 HP
            user.volatile.aquaring = true;
            logs.push(`${user.cnName} 用水流环包裹住了自己!`);
            return { success: true, logs };
            
        case 'Ingrain':
            // 扎根：每回合回复 1/16 HP，无法换人
            user.volatile.ingrain = true;
            logs.push(`${user.cnName} 扎下了根!`);
            return { success: true, logs };
            
        default:
            return { success: false, logs };
    }
}

/**
 * 检查宝可梦是否可以使用指定技能
 * @param {Pokemon} pokemon 
 * @param {object} move 
 * @returns {object} { canUse, reason }
 */
function canUseMove(pokemon, move) {
    if (!pokemon.volatile) return { canUse: true, reason: null };
    
    const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const fullMoveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
    const category = fullMoveData.category || move.category || move.cat || 'Physical';
    
    // 挑衅检查：无法使用变化技
    if (pokemon.volatile.taunt && pokemon.volatile.taunt > 0) {
        if (category === 'Status' || category === 'status') {
            return { canUse: false, reason: `${pokemon.cnName} 被挑衅了，无法使用变化技!` };
        }
    }
    
    // 定身法检查
    if (pokemon.volatile.disable && pokemon.volatile.disable > 0) {
        if (pokemon.volatile.disabledMove === move.name) {
            return { canUse: false, reason: `${move.name} 被封印了!` };
        }
    }
    
    // 再来一次检查
    if (pokemon.volatile.encore && pokemon.volatile.encore > 0) {
        if (pokemon.volatile.encoreMove && move.name !== pokemon.volatile.encoreMove) {
            return { canUse: false, reason: `被强制使用 ${pokemon.volatile.encoreMove}!` };
        }
    }
    
    // 无理取闹检查
    if (pokemon.volatile.torment && pokemon.lastMoveUsed === move.name) {
        return { canUse: false, reason: `${pokemon.cnName} 无法连续使用同一技能!` };
    }
    
    // 封印检查 (Imprison)：对手不能使用与自己相同的招式
    // 注意：这需要在战斗中检查对手的招式，这里只做标记检查
    if (pokemon.volatile.imprisonBlocked && pokemon.volatile.imprisonBlocked.includes(move.name)) {
        return { canUse: false, reason: `${move.name} 被封印了!` };
    }
    
    return { canUse: true, reason: null };
}

/**
 * 检查混乱状态是否导致自伤
 * @param {Pokemon} pokemon 
 * @returns {object} { confused, selfHit, damage, logs }
 */
function checkConfusion(pokemon) {
    const logs = [];
    
    if (!pokemon.volatile || !pokemon.volatile.confusion || pokemon.volatile.confusion <= 0) {
        return { confused: false, selfHit: false, damage: 0, logs };
    }
    
    logs.push(`${pokemon.cnName} 正处于混乱中!`);
    
    // 33% 概率自伤
    if (Math.random() < 0.33) {
        // 自伤伤害：40 威力物理攻击
        const selfDamage = Math.max(1, Math.floor(pokemon.atk * 40 / pokemon.def / 50 * 2));
        pokemon.currHp = Math.max(0, pokemon.currHp - selfDamage);
        logs.push(`${pokemon.cnName} 在混乱中攻击了自己! (-${selfDamage})`);
        return { confused: true, selfHit: true, damage: selfDamage, logs };
    }
    
    return { confused: true, selfHit: false, damage: 0, logs };
}

/**
 * 检查着迷状态是否阻止行动
 * @param {Pokemon} pokemon 
 * @returns {object} { attracted, immobilized, logs }
 */
function checkAttract(pokemon) {
    const logs = [];
    
    if (!pokemon.volatile || !pokemon.volatile.attract) {
        return { attracted: false, immobilized: false, logs };
    }
    
    logs.push(`${pokemon.cnName} 对对手着迷了!`);
    
    // 50% 概率无法行动
    if (Math.random() < 0.5) {
        logs.push(`${pokemon.cnName} 因为着迷而无法行动!`);
        return { attracted: true, immobilized: true, logs };
    }
    
    return { attracted: true, immobilized: false, logs };
}

/**
 * 检查替身是否吸收伤害
 * @param {Pokemon} defender 防御方
 * @param {number} damage 原始伤害
 * @param {object} move 技能数据
 * @returns {object} { absorbed, remainingDamage, logs }
 */
function checkSubstitute(defender, damage, move) {
    const logs = [];
    
    if (!defender.volatile || !defender.volatile.substitute || defender.volatile.substitute <= 0) {
        return { absorbed: false, remainingDamage: damage, logs };
    }
    
    // 声音类技能穿透替身
    if (isSoundMove(move)) {
        return { absorbed: false, remainingDamage: damage, logs };
    }
    
    const subHp = defender.volatile.substitute;
    
    if (damage >= subHp) {
        // 替身被打破
        defender.volatile.substitute = 0;
        logs.push(`${defender.cnName} 的替身消失了!`);
        // 剩余伤害不传递给本体（替身吸收所有伤害）
        return { absorbed: true, remainingDamage: 0, logs };
    } else {
        // 替身吸收伤害
        defender.volatile.substitute -= damage;
        logs.push(`替身代替 ${defender.cnName} 承受了伤害! (替身剩余: ${defender.volatile.substitute})`);
        return { absorbed: true, remainingDamage: 0, logs };
    }
}

/**
 * 回合结束时递减 Volatile 状态计数器
 * @param {Pokemon} pokemon 
 * @param {Pokemon} opponent - 对手（用于灭亡之歌等）
 * @returns {Array} 日志消息
 */
function tickVolatileStatus(pokemon, opponent = null) {
    const logs = [];
    if (!pokemon.volatile) return logs;
    
    // 挑衅
    if (pokemon.volatile.taunt && pokemon.volatile.taunt > 0) {
        pokemon.volatile.taunt--;
        if (pokemon.volatile.taunt === 0) {
            logs.push(`${pokemon.cnName} 的挑衅状态解除了!`);
        }
    }
    
    // 定身法
    if (pokemon.volatile.disable && pokemon.volatile.disable > 0) {
        pokemon.volatile.disable--;
        if (pokemon.volatile.disable === 0) {
            pokemon.volatile.disabledMove = null;
            logs.push(`${pokemon.cnName} 的技能封印解除了!`);
        }
    }
    
    // 再来一次
    if (pokemon.volatile.encore && pokemon.volatile.encore > 0) {
        pokemon.volatile.encore--;
        if (pokemon.volatile.encore === 0) {
            pokemon.volatile.encoreMove = null;
            logs.push(`${pokemon.cnName} 的再来一次状态解除了!`);
        }
    }
    
    // 回复封锁
    if (pokemon.volatile.healBlock && pokemon.volatile.healBlock > 0) {
        pokemon.volatile.healBlock--;
        if (pokemon.volatile.healBlock === 0) {
            logs.push(`${pokemon.cnName} 的回复封锁解除了!`);
        }
    }
    
    // 哈欠 -> 睡眠
    if (pokemon.volatile.yawn && pokemon.volatile.yawn > 0) {
        pokemon.volatile.yawn--;
        if (pokemon.volatile.yawn === 0) {
            if (!pokemon.status) {
                pokemon.status = 'slp';
                pokemon.sleepTurns = 0;
                logs.push(`${pokemon.cnName} 睡着了!`);
            }
            delete pokemon.volatile.yawn;
        }
    }
    
    // 灭亡之歌
    if (pokemon.volatile.perishsong && pokemon.volatile.perishsong > 0) {
        pokemon.volatile.perishsong--;
        logs.push(`${pokemon.cnName} 的灭亡倒计时: ${pokemon.volatile.perishsong}!`);
        if (pokemon.volatile.perishsong === 0) {
            pokemon.currHp = 0;
            logs.push(`${pokemon.cnName} 因灭亡之歌倒下了!`);
        }
    }
    
    // 混乱
    if (pokemon.volatile.confusion && pokemon.volatile.confusion > 0) {
        pokemon.volatile.confusion--;
        if (pokemon.volatile.confusion === 0) {
            logs.push(`${pokemon.cnName} 的混乱解除了!`);
        }
    }
    
    // 束缚
    if (pokemon.volatile.partiallytrapped && typeof pokemon.volatile.partiallytrapped === 'number') {
        pokemon.volatile.partiallytrapped--;
        if (pokemon.volatile.partiallytrapped === 0) {
            delete pokemon.volatile.partiallytrapped;
            logs.push(`${pokemon.cnName} 从束缚中解脱了!`);
        }
    }
    
    // 查封
    if (pokemon.volatile.embargo && pokemon.volatile.embargo > 0) {
        pokemon.volatile.embargo--;
        if (pokemon.volatile.embargo === 0) {
            logs.push(`${pokemon.cnName} 可以使用道具了!`);
        }
    }
    
    // 同命（每回合重置）
    if (pokemon.volatile.destinybond) {
        delete pokemon.volatile.destinybond;
    }
    
    return logs;
}

// ========== 导出 ==========

window.MoveEffects = {
    // 优先级
    getMovePriority,
    compareActionOrder,
    
    // 状态异常
    STATUS_CONDITIONS,
    tryInflictStatus,
    processStatusEffects,
    processStatusDamage,
    processMoveStatusEffects,
    
    // 特殊伤害
    checkFixedDamageMove,
    checkOHKOMove,
    
    // 天气/场地
    WEATHER_TYPES,
    TERRAIN_TYPES,
    getWeatherModifier,
    getTerrainModifier,
    
    // 技能标记
    MOVE_FLAGS,
    hasMoveFlag,
    isContactMove,
    isProtectable,
    isSoundMove,
    
    // 场地钉子
    applySideCondition,
    applyEntryHazards,
    clearEntryHazards,
    
    // Volatile 状态 (Taunt, Substitute 等)
    applyVolatileStatus,
    canUseMove,
    checkConfusion,
    checkAttract,
    checkSubstitute,
    tickVolatileStatus
};

console.log('[PKM] MoveEffects 模块已加载');
