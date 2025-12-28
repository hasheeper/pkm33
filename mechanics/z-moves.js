/**
 * ===========================================
 * Z-MOVES.JS - Z 招式与极巨化招式推导系统
 * ===========================================
 * 
 * 职责:
 * - Z 招式推导 (通用 Z / 专属 Z)
 * - 极巨化招式推导 (Max Move / G-Max Move)
 * - 招式映射表管理
 */

// ============================================
// 通用属性 Z 招式表 (Type -> Z-Move Name)
// ============================================
const GENERIC_Z_BY_TYPE = {
    'Normal': 'Breakneck Blitz', 'Fire': 'Inferno Overdrive', 'Water': 'Hydro Vortex',
    'Grass': 'Bloom Doom', 'Electric': 'Gigavolt Havoc', 'Ice': 'Subzero Slammer',
    'Fighting': 'All-Out Pummeling', 'Poison': 'Acid Downpour', 'Ground': 'Tectonic Rage',
    'Flying': 'Supersonic Skystrike', 'Psychic': 'Shattered Psyche', 'Bug': 'Savage Spin-Out',
    'Rock': 'Continental Crush', 'Ghost': 'Never-Ending Nightmare', 'Dragon': 'Devastating Drake',
    'Dark': 'Black Hole Eclipse', 'Steel': 'Corkscrew Crash', 'Fairy': 'Twinkle Tackle'
};

// ============================================
// 专属 Z 矩阵 (Signature Z Matrix)
// 格式: "basemove+species" => "Z-Move Name"
// ============================================
const SIGNATURE_Z_MATRIX = {
    // 皮卡丘系
    'thunderbolt+pikachu': '10,000,000 Volt Thunderbolt',
    'volttackle+pikachu': 'Catastropika',
    'thunderbolt+raichu': 'Stoked Sparksurfer',
    'thunderbolt+raichualola': 'Stoked Sparksurfer',
    // 伊布
    'lastresort+eevee': 'Extreme Evoboost',
    // 卡比兽
    'gigaimpact+snorlax': 'Pulverizing Pancake',
    // 御三家
    'darkestlariat+incineroar': 'Malicious Moonsault',
    'sparklingaria+primarina': 'Oceanic Operetta',
    'spiritshackle+decidueye': 'Sinister Arrow Raid',
    // 传说/神兽
    'photongeyser+necrozma': 'Light That Burns the Sky',
    'sunsteelstrike+solgaleo': 'Searing Sunraze Smash',
    'moongeistbeam+lunala': 'Menacing Moonraze Maelstrom',
    'spectralthief+marshadow': 'Soul-Stealing 7-Star Strike',
    'clangingscales+kommoo': 'Clangorous Soulblaze',
    'psychic+mew': 'Genesis Supernova',
    // 其他
    'playrough+mimikyu': "Let's Snuggle Forever",
    'stoneedge+lycanroc': 'Splintered Stormshards',
    'naturesmadness+tapukoko': 'Guardian of Alola',
    'naturesmadness+tapulele': 'Guardian of Alola',
    'naturesmadness+tapubulu': 'Guardian of Alola',
    'naturesmadness+tapufini': 'Guardian of Alola'
};

// ============================================
// 专属 Z 优先级表 (越靠前优先级越高)
// 用于解决同一只宝可梦有多个专属 Z 时的冲突
// ============================================
const SIGNATURE_Z_PRIORITY = [
    '10,000,000 Volt Thunderbolt', // 智皮 Z (最高优先级)
    'Catastropika',                 // 皮卡 Z
    'Stoked Sparksurfer',           // 雷丘 Z
    'Extreme Evoboost',             // 伊布 Z
    'Clangorous Soulblaze',         // 杖尾鳞甲龙 Z
    'Light That Burns the Sky',     // 奈克洛兹玛 Z
    'Searing Sunraze Smash',        // 索尔迦雷欧 Z
    'Menacing Moonraze Maelstrom',  // 露奈雅拉 Z
    'Soul-Stealing 7-Star Strike',  // 玛夏多 Z
    'Malicious Moonsault',          // 炽焰咆哮虎 Z
    'Oceanic Operetta',             // 西狮海壬 Z
    'Sinister Arrow Raid',          // 狙射树枭 Z
    'Genesis Supernova',            // 梦幻 Z
    "Let's Snuggle Forever",        // 谜拟Q Z
    'Splintered Stormshards',       // 鬃岩狼人 Z
    'Guardian of Alola',            // 卡璞 Z
    'Pulverizing Pancake'           // 卡比兽 Z
];

// ============================================
// 通用 Max 招式表 (Type -> Max Move Name)
// ============================================
const GENERIC_MAX_BY_TYPE = {
    'Normal': 'Max Strike', 'Fire': 'Max Flare', 'Water': 'Max Geyser',
    'Grass': 'Max Overgrowth', 'Electric': 'Max Lightning', 'Ice': 'Max Hailstorm',
    'Fighting': 'Max Knuckle', 'Poison': 'Max Ooze', 'Ground': 'Max Quake',
    'Flying': 'Max Airstream', 'Psychic': 'Max Mindstorm', 'Bug': 'Max Flutterby',
    'Rock': 'Max Rockfall', 'Ghost': 'Max Phantasm', 'Dragon': 'Max Wyrmwind',
    'Dark': 'Max Darkness', 'Steel': 'Max Steelspike', 'Fairy': 'Max Starfall'
};

// ============================================
// 动态生成的映射表
// ============================================

// 专属 Z 招式反查表 (BaseMove ID -> Z-Move Data)
const EXCLUSIVE_Z_MAP = {};

// G-Max 专属招式表 (Species -> { type, moveName })
const GMAX_MOVE_MAP = {};

// ============================================
// 初始化：从数据库构建反查表
// ============================================
(function buildMoveDerivationMaps() {
    if (typeof MOVES === 'undefined') {
        console.warn('[Z-MOVES] MOVES database not loaded');
        return;
    }
    
    // 专属 Z 招式的 baseMove 映射 (手动维护，因为数据库没有这个字段)
    const EXCLUSIVE_Z_BASE_MOVES = {
        '10000000voltthunderbolt': 'thunderbolt',
        'catastropika': 'volttackle',
        'stokedsparksurfer': 'thunderbolt',
        'extremeevoboost': 'lastresort',
        'oceanicoperetta': 'sparklingaria',
        'maliciousmoonsault': 'darkestlariat',
        'soulstealing7starstrike': 'spectralthief',
        'sinisterarrowraid': 'spiritshackle',
        'clangoroussoulblaze': 'clangingscales',
        'lightthatburnsthesky': 'photongeyser',
        'searingsunrazesmash': 'sunsteelstrike',
        'menacingmoonrazemaelstrom': 'moongeistbeam',
        'letssnuggleforever': 'playrough',
        'splinteredstormshards': 'stoneedge',
        'pulverizingpancake': 'gigaimpact',
        'genesis supernova': 'psychic'
    };
    
    // 遍历所有招式，构建映射表
    for (const moveId in MOVES) {
        const moveData = MOVES[moveId];
        
        // 构建专属 Z 招式反查表
        if (moveData.isZ && typeof moveData.isZ === 'string') {
            const baseMove = EXCLUSIVE_Z_BASE_MOVES[moveId];
            if (baseMove) {
                EXCLUSIVE_Z_MAP[baseMove] = {
                    name: moveData.name,
                    id: moveId,
                    type: moveData.type,
                    basePower: moveData.basePower || 180,
                    zCrystal: moveData.isZ
                };
            }
        }
        
        // 构建 G-Max 专属招式表
        if (moveData.isMax && typeof moveData.isMax === 'string') {
            const species = moveData.isMax.toLowerCase().replace(/[^a-z0-9]/g, '');
            GMAX_MOVE_MAP[species] = {
                name: moveData.name,
                id: moveId,
                type: moveData.type,
                basePower: moveData.basePower || 130
            };
        }
    }
    
    console.log('[Z-MOVES] Built EXCLUSIVE_Z_MAP:', Object.keys(EXCLUSIVE_Z_MAP).length, 'entries');
    console.log('[Z-MOVES] Built GMAX_MOVE_MAP:', Object.keys(GMAX_MOVE_MAP).length, 'entries');
})();

// ============================================
// 核心函数
// ============================================

/**
 * 计算宝可梦的"命中注定专属 Z"（优先级最高的那个）
 * @param {Object} pokemon - 宝可梦对象
 * @returns {string|null} 最高优先级的专属 Z 名称，或 null
 */
function calculateBestZForPokemon(pokemon) {
    // 使用缓存避免重复计算
    if (pokemon._cachedBestZ !== undefined) return pokemon._cachedBestZ;
    
    const speciesId = (pokemon.name || '').toLowerCase().replace(/[^a-z0-9]/g, '').replace(/(partner|alola|galar|gmax|mega|cap)/g, '');
    
    let bestFound = null;
    let highestPrio = Infinity;
    
    // 遍历精灵所有招式，找出优先级最高的专属 Z
    (pokemon.moves || []).forEach(m => {
        const moveId = (m.name || m || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const matrixKey = `${moveId}+${speciesId}`;
        const targetZName = SIGNATURE_Z_MATRIX[matrixKey];
        
        if (targetZName) {
            let prio = SIGNATURE_Z_PRIORITY.indexOf(targetZName);
            if (prio === -1) prio = 999; // 未排序的默认很低
            
            if (prio < highestPrio) {
                highestPrio = prio;
                bestFound = targetZName;
            }
        }
    });
    
    // 缓存结果
    pokemon._cachedBestZ = bestFound;
    return bestFound;
}

/**
 * 获取招式对应的 Z 招式名称 (单一 Z 锁定策略)
 * @param {Object} baseMoveObj - 原始招式对象
 * @param {Object} pokemon - 宝可梦对象
 * @returns {Object|null} Z 招式信息 { name, type, power } 或 null
 */
function getZMoveTarget(baseMoveObj, pokemon) {
    // 0. 基础门槛
    const battle = typeof window !== 'undefined' ? window.battle : null;
    if (battle && battle.playerUnlocks && !battle.playerUnlocks.enable_z_move) return null;
    if (pokemon.mechanic !== 'zmove') return null;
    if (pokemon.isMega || pokemon.isDynamaxed || pokemon.hasBondResonance) return null;
    if (baseMoveObj.category === 'Status' || baseMoveObj.cat === 'status') return null;
    
    // 准备 Key
    const moveId = (baseMoveObj.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const moveType = baseMoveObj.type || 'Normal';
    const speciesRoot = (pokemon.name || '').toLowerCase().replace(/[^a-z0-9]/g, '').replace(/(partner|alola|galar|gmax|mega|cap)/g, '');
    
    // 1. 获取这只宝可梦"命中注定"的专属 Z（优先级最高的那个）
    const theOneZ = calculateBestZForPokemon(pokemon);
    
    // 2. 检查当前招式是否能产生专属 Z
    const sigKey = `${moveId}+${speciesRoot}`;
    const potentialZ = SIGNATURE_Z_MATRIX[sigKey];
    
    if (potentialZ) {
        // 关键判断：只有当这个招式产生的 Z 等于"命中注定"的 Z 时，才点亮
        if (potentialZ === theOneZ) {
            return {
                name: potentialZ,
                type: moveType,
                power: 200,
                isExclusive: true
            };
        }
        // 虽然是专属招式，但因优先级输了，返回 null
        return null;
    }
    
    // 3. 如果这只宝可梦没有任何专属 Z 能力，允许通用 Z
    if (!theOneZ) {
        if (GENERIC_Z_BY_TYPE[moveType]) {
            const basePower = baseMoveObj.basePower || baseMoveObj.power || 60;
            let zPower = 100;
            if (basePower >= 140) zPower = 200;
            else if (basePower >= 130) zPower = 195;
            else if (basePower >= 120) zPower = 190;
            else if (basePower >= 110) zPower = 185;
            else if (basePower >= 100) zPower = 180;
            else if (basePower >= 90) zPower = 175;
            else if (basePower >= 80) zPower = 160;
            else if (basePower >= 70) zPower = 140;
            else if (basePower >= 60) zPower = 120;
            else zPower = 100;
            
            return {
                name: GENERIC_Z_BY_TYPE[moveType],
                type: moveType,
                power: zPower,
                isExclusive: false
            };
        }
    }
    
    // 4. 如果这只宝可梦有专属 Z（theOneZ 存在），其他招式不能变成通用 Z
    return null;
}

/**
 * 获取招式对应的极巨化招式名称
 * @param {Object} baseMoveObj - 原始招式对象
 * @param {Object} pokemon - 宝可梦对象
 * @returns {Object|null} Max 招式信息 { name, type, power } 或 null
 */
function getMaxMoveTarget(baseMoveObj, pokemon) {
    // 变化技变成 Max Guard
    if (baseMoveObj.category === 'Status' || baseMoveObj.cat === 'status') {
        return {
            name: 'Max Guard',
            type: 'Normal',
            power: 0,
            isGMax: false
        };
    }
    
    const moveType = baseMoveObj.type || 'Normal';
    
    // 获取精灵的基础 ID (去除 gmax/mega 等后缀)
    const pokeName = pokemon.name || '';
    const species = pokeName.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/(gmax|mega|gigantamax)/g, '');
    
    // 检查是否有 G-Max 专属招式
    if (GMAX_MOVE_MAP[species]) {
        const gmaxData = GMAX_MOVE_MAP[species];
        // 检查招式类型是否匹配 G-Max 招式类型
        if (gmaxData.type === moveType) {
            return {
                name: gmaxData.name,
                type: gmaxData.type,
                power: gmaxData.basePower || 130,
                isGMax: true
            };
        }
    }
    
    // 通用 Max 招式
    const genericMaxName = GENERIC_MAX_BY_TYPE[moveType];
    if (genericMaxName) {
        // Max 招式威力根据原招式威力计算
        const basePower = baseMoveObj.basePower || baseMoveObj.power || 60;
        let maxPower = 90;
        if (basePower >= 150) maxPower = 150;
        else if (basePower >= 110) maxPower = 140;
        else if (basePower >= 75) maxPower = 130;
        else if (basePower >= 65) maxPower = 120;
        else if (basePower >= 55) maxPower = 110;
        else if (basePower >= 45) maxPower = 100;
        else maxPower = 90;
        
        return {
            name: genericMaxName,
            type: moveType,
            power: maxPower,
            isGMax: false
        };
    }
    
    return null;
}

// ============================================
// 导出
// ============================================

// 浏览器环境
if (typeof window !== 'undefined') {
    window.GENERIC_Z_BY_TYPE = GENERIC_Z_BY_TYPE;
    window.SIGNATURE_Z_MATRIX = SIGNATURE_Z_MATRIX;
    window.SIGNATURE_Z_PRIORITY = SIGNATURE_Z_PRIORITY;
    window.GENERIC_MAX_BY_TYPE = GENERIC_MAX_BY_TYPE;
    window.EXCLUSIVE_Z_MAP = EXCLUSIVE_Z_MAP;
    window.GMAX_MOVE_MAP = GMAX_MOVE_MAP;
    window.calculateBestZForPokemon = calculateBestZForPokemon;
    window.getZMoveTarget = getZMoveTarget;
    window.getMaxMoveTarget = getMaxMoveTarget;
}

// Node.js 环境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GENERIC_Z_BY_TYPE,
        SIGNATURE_Z_MATRIX,
        SIGNATURE_Z_PRIORITY,
        GENERIC_MAX_BY_TYPE,
        EXCLUSIVE_Z_MAP,
        GMAX_MOVE_MAP,
        calculateBestZForPokemon,
        getZMoveTarget,
        getMaxMoveTarget
    };
}
