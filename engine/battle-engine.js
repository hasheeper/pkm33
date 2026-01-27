/**
 * =============================================
 * BATTLE ENGINE - 战斗核心引擎
 * =============================================
 * 
 * 负责：
 * - 属性克制计算
 * - Pokemon 实例创建
 * - 战斗状态管理
 */

// === 软编码：智能提取基础形态名 ===
// 硬编码数据已移至 move-constants.js

/**
 * 从宝可梦名称提取基础形态ID（用于图片回退）
 * @param {string} name 原始名称
 * @returns {string} 基础形态ID
 */
export function extractBaseFormId(name = '') {
    let id = name.toLowerCase().replace(/[^a-z0-9-]/g, '');
    
    // 从 move-constants.js 获取后缀列表，如果不存在则使用内置后备
    const suffixes = (typeof FORM_SUFFIXES !== 'undefined') ? FORM_SUFFIXES : [
        'starter', 'gmax', 'megax', 'megay', 'mega',
        'alola', 'galar', 'hisui', 'paldea',
        'therian', 'incarnate', 'origin', 'altered',
        'crowned', 'hero', 'eternamax', 'primal', 'ultra', 'ash', 'totem'
    ];
    
    // 尝试移除后缀
    for (const suffix of suffixes) {
        if (id.endsWith(suffix)) {
            const base = id.slice(0, -suffix.length);
            if (base.length >= 3) {
                return base;
            }
        }
    }
    
    return id;
}

/**
 * 获取精灵图ID（保留横杠以支持地区形态和特殊名字）
 * 例如: "Vulpix-Alola" -> "vulpix-alola", "Ho-Oh" -> "ho-oh"
 * Mega 形态特殊处理: "Charizard-Mega-X" -> "charizardmegax" (紧凑格式)
 */
export function resolveSpriteId(name = '') {
    const normalized = name.toLowerCase().replace(/[^a-z0-9-]/g, '');
    
    // 【修复】Mega 形态：保留横杠（Showdown 格式）
    // Metagross-Mega -> metagross-mega
    // Charizard-Mega-X -> charizard-mega-x
    // 不再移除横杠，直接返回规范化后的名称
    
    // 其他形态：保留横杠（地区形态、特殊名字等）
    return normalized;
}

/**
 * 获取回退精灵图ID（提取基础形态）
 */
export function getFallbackSpriteId(name = '') {
    return extractBaseFormId(name);
}

if (typeof window !== 'undefined') {
    window.resolveSpriteId = resolveSpriteId;
    window.extractBaseFormId = extractBaseFormId;
    window.getFallbackSpriteId = getFallbackSpriteId;
}

// === 性格修正表 ===
// 性格 -> { 增益属性: 1.1, 减益属性: 0.9 }
// 无修正性格（认真、努力等）不在此表中
export const NATURE_MODIFIERS = {
    // 加攻击
    'Lonely':   { atk: 1.1, def: 0.9 },
    'Adamant':  { atk: 1.1, spa: 0.9 },
    'Naughty':  { atk: 1.1, spd: 0.9 },
    'Brave':    { atk: 1.1, spe: 0.9 },
    // 加防御
    'Bold':     { def: 1.1, atk: 0.9 },
    'Impish':   { def: 1.1, spa: 0.9 },
    'Lax':      { def: 1.1, spd: 0.9 },
    'Relaxed':  { def: 1.1, spe: 0.9 },
    // 加特攻
    'Modest':   { spa: 1.1, atk: 0.9 },
    'Mild':     { spa: 1.1, def: 0.9 },
    'Rash':     { spa: 1.1, spd: 0.9 },
    'Quiet':    { spa: 1.1, spe: 0.9 },
    // 加特防
    'Calm':     { spd: 1.1, atk: 0.9 },
    'Gentle':   { spd: 1.1, def: 0.9 },
    'Careful':  { spd: 1.1, spa: 0.9 },
    'Sassy':    { spd: 1.1, spe: 0.9 },
    // 加速度
    'Timid':    { spe: 1.1, atk: 0.9 },
    'Hasty':    { spe: 1.1, def: 0.9 },
    'Jolly':    { spe: 1.1, spa: 0.9 },
    'Naive':    { spe: 1.1, spd: 0.9 },
};

// === 属性克制表 ===
// 攻击方属性 -> { 被克制属性: 2, 抵抗属性: 0.5, 免疫属性: 0 }
export const TYPE_CHART = {
    'Normal':   { weak: [],                          resist: ['Rock', 'Steel'],      immune: ['Ghost'] },
    'Fire':     { weak: ['Grass', 'Ice', 'Bug', 'Steel'], resist: ['Fire', 'Water', 'Rock', 'Dragon'], immune: [] },
    'Water':    { weak: ['Fire', 'Ground', 'Rock'],  resist: ['Water', 'Grass', 'Dragon'], immune: [] },
    'Electric': { weak: ['Water', 'Flying'],         resist: ['Electric', 'Grass', 'Dragon'], immune: ['Ground'] },
    'Grass':    { weak: ['Water', 'Ground', 'Rock'], resist: ['Fire', 'Grass', 'Poison', 'Flying', 'Bug', 'Dragon', 'Steel'], immune: [] },
    'Ice':      { weak: ['Grass', 'Ground', 'Flying', 'Dragon'], resist: ['Fire', 'Water', 'Ice', 'Steel'], immune: [] },
    'Fighting': { weak: ['Normal', 'Ice', 'Rock', 'Dark', 'Steel'], resist: ['Poison', 'Flying', 'Psychic', 'Bug', 'Fairy'], immune: ['Ghost'] },
    'Poison':   { weak: ['Grass', 'Fairy'],          resist: ['Poison', 'Ground', 'Rock', 'Ghost'], immune: ['Steel'] },
    'Ground':   { weak: ['Fire', 'Electric', 'Poison', 'Rock', 'Steel'], resist: ['Grass', 'Bug'], immune: ['Flying'] },
    'Flying':   { weak: ['Grass', 'Fighting', 'Bug'], resist: ['Electric', 'Rock', 'Steel'], immune: [] },
    'Psychic':  { weak: ['Fighting', 'Poison'],      resist: ['Psychic', 'Steel'],   immune: ['Dark'] },
    'Bug':      { weak: ['Grass', 'Psychic', 'Dark'], resist: ['Fire', 'Fighting', 'Poison', 'Flying', 'Ghost', 'Steel', 'Fairy'], immune: [] },
    'Rock':     { weak: ['Fire', 'Ice', 'Flying', 'Bug'], resist: ['Fighting', 'Ground', 'Steel'], immune: [] },
    'Ghost':    { weak: ['Psychic', 'Ghost'],        resist: ['Dark'],               immune: ['Normal'] },
    'Dragon':   { weak: ['Dragon'],                  resist: ['Steel'],              immune: ['Fairy'] },
    'Dark':     { weak: ['Psychic', 'Ghost'],        resist: ['Fighting', 'Dark', 'Fairy'], immune: [] },
    'Steel':    { weak: ['Ice', 'Rock', 'Fairy'],    resist: ['Fire', 'Water', 'Electric', 'Steel'], immune: [] },
    'Fairy':    { weak: ['Fighting', 'Dark', 'Dragon'], resist: ['Fire', 'Poison', 'Steel'], immune: [] },
};

/**
 * 计算属性克制倍率
 * @param {string} atkType - 攻击技能属性
 * @param {string[]} defTypes - 防御方属性数组
 * @param {string} moveName - 技能名称（用于特殊克制规则）
 * @returns {number} - 倍率 (0, 0.25, 0.5, 1, 2, 4)
 */
export function getTypeEffectiveness(atkType, defTypes, moveName = '') {
    const chart = TYPE_CHART[atkType];
    if (!chart) return 1;
    
    // 防护：确保 defTypes 是有效数组
    if (!Array.isArray(defTypes) || defTypes.length === 0) {
        console.warn(`[TYPE EFFECTIVENESS] Invalid defTypes:`, defTypes, `for atkType:`, atkType);
        return 1;
    }
    
    let multiplier = 1;
    const moveId = moveName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    for (const defType of defTypes) {
        // === 特殊克制规则 ===
        // Freeze-Dry (冷冻干燥): 对水系效果绝佳
        if (moveId === 'freezedry' && defType === 'Water') {
            multiplier *= 2;
            continue;
        }
        // Flying Press (飞身重压): 同时具有格斗和飞行属性
        // Thousand Arrows (千箭): 对飞行系也有效
        if (moveId === 'thousandarrows' && defType === 'Flying') {
            // 不免疫，正常计算
            continue;
        }
        
        if (chart.immune.includes(defType)) return 0;
        if (chart.weak.includes(defType)) multiplier *= 2;
        if (chart.resist.includes(defType)) multiplier *= 0.5;
    }
    return multiplier;
}

/**
 * 宝可梦名称规范化器 ("宽进"策略)
 * 将 AI 生成的自然语言形容词转换为标准的 ID 后缀
 * 例如: "Grimer-Alolan" -> "Grimer-Alola"
 * @param {string} rawName - 原始名称
 * @returns {string} 规范化后的名称
 */
export function normalizePokemonName(rawName) {
    if (!rawName) return '';
    let name = String(rawName).trim();
    
    // 处理形容词后缀 (Alolan -> Alola, Galarian -> Galar, etc.)
    const adjectiveMap = [
        { pattern: /-Alolan$/i, replacement: '-Alola' },
        { pattern: /\s+Alolan$/i, replacement: '-Alola' },
        { pattern: /-Galarian$/i, replacement: '-Galar' },
        { pattern: /\s+Galarian$/i, replacement: '-Galar' },
        { pattern: /-Hisuian$/i, replacement: '-Hisui' },
        { pattern: /\s+Hisuian$/i, replacement: '-Hisui' },
        { pattern: /-Paldean$/i, replacement: '-Paldea' },
        { pattern: /\s+Paldean$/i, replacement: '-Paldea' }
    ];

    for (const { pattern, replacement } of adjectiveMap) {
        if (pattern.test(name)) {
            const normalized = name.replace(pattern, replacement);
            console.log(`[PKM] [NORMALIZE] "${rawName}" -> "${normalized}"`);
            return normalized;
        }
    }

    return name;
}

/**
 * 从 Pokemon Showdown POKEDEX 获取宝可梦数据 (带智能回退机制)
 * 策略: 规范化名称 -> 直接查找 -> 修正后缀 -> 回退到基础形态
 * @param {string} name - 英文名 (如 'Pikachu')
 * @returns {object|null}
 */
export function getPokemonData(name) {
    if (typeof POKEDEX === 'undefined') return null;
    
    // === 第一步: 规范化名称 (宽进) ===
    const normalizedName = normalizePokemonName(name);
    let id = normalizedName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // === 第二步: 直接查找 ===
    if (POKEDEX[id]) {
        const data = POKEDEX[id];
        return {
            name: data.name,
            types: data.types || ['Normal'],
            baseStats: data.baseStats
        };
    }
    
    // === 第三步: 修正常见的形容词后缀错误 ===
    const suffixFixes = [
        { from: 'alolan', to: 'alola' },
        { from: 'galarian', to: 'galar' },
        { from: 'hisuian', to: 'hisui' },
        { from: 'paldean', to: 'paldea' }
    ];
    
    for (const fix of suffixFixes) {
        if (id.endsWith(fix.from)) {
            const fixedId = id.slice(0, -fix.from.length) + fix.to;
            if (POKEDEX[fixedId]) {
                console.log(`[PKM] [SUFFIX FIX] "${id}" -> "${fixedId}"`);
                const data = POKEDEX[fixedId];
                return {
                    name: data.name,
                    types: data.types || ['Normal'],
                    baseStats: data.baseStats
                };
            }
        }
    }
    
    // === 第四步: 智能回退到基础形态 ===
    const splitChars = ['-', ' '];
    for (const splitChar of splitChars) {
        if (normalizedName.includes(splitChar)) {
            const potentialBaseName = normalizedName.split(splitChar)[0];
            if (potentialBaseName && potentialBaseName !== normalizedName) {
                const baseId = potentialBaseName.toLowerCase().replace(/[^a-z0-9]/g, '');
                if (POKEDEX[baseId]) {
                    console.log(`[PKM] [FALLBACK] Using base species "${potentialBaseName}" instead of "${normalizedName}"`);
                    const data = POKEDEX[baseId];
                    return {
                        name: data.name,
                        types: data.types || ['Normal'],
                        baseStats: data.baseStats
                    };
                }
            }
        }
    }
    
    // === 第五步: 找不到 ===
    console.warn(`[PKM] [NOT FOUND] Pokemon "${name}" not found in POKEDEX`);
    return null;
}

/**
 * 从 Pokemon Showdown MOVES 获取技能数据
 * @param {string} name - 英文名 (如 'Thunderbolt')
 * @returns {object} 包含所有原始数据 + 标准化字段
 */
export function getMoveData(name) {
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const data = typeof MOVES !== 'undefined' ? MOVES[id] : null;
    
    if (!data) {
        return { name: name, type: 'Normal', power: 40, cat: 'phys', accuracy: 100 };
    }
    
    // === CRITICAL FIX ===
    // 使用 spread operator 保留所有原始数据（accuracy, multihit, recoil, drain, secondary 等）
    // 同时添加标准化字段供 API 调用
    
    // === 动态威力技能补丁 ===
    // 这些技能的 basePower 在原数据中是 0 或 null（需要运行时计算），给它们固定威力
    const dynamicPowerPatches = {
        'gyroball': 80,         // 陀螺球：速度差计算，平均约80
        'electroball': 80,      // 电球：速度差计算
        'grassknot': 80,        // 打草结：体重计算
        'lowkick': 80,          // 踢倒：体重计算
        'heatcrash': 80,        // 高温重压：体重计算
        'heavyslam': 80,        // 重磅冲撞：体重计算
        'fling': 50,            // 投掷：道具威力
        'return': 102,          // 报恩：满亲密度
        'frustration': 102,     // 迁怒：满不亲密
        'punishment': 70,       // 惩罚：能力变化
        'storedpower': 80,      // 辅助力量：能力变化
        'reversal': 100,        // 绝处逢生：低血高威力
        'flail': 100,           // 挣扎：低血高威力
        'eruption': 150,        // 喷火：满血威力
        'waterspout': 150,      // 喷水：满血威力
        'crushgrip': 100,       // 握碎：对方血量
        'wringout': 100,        // 绞紧：对方血量
        'naturalgift': 80,      // 自然之恩：树果
        'trumpcard': 80,        // 王牌：PP
        'spitup': 100,          // 喷出：蓄力次数
        'present': 60,          // 礼物：随机
        'magnitude': 70,        // 震级：随机
    };
    
    let finalPower = data.basePower || 0;
    const moveId = id.toLowerCase();
    if (dynamicPowerPatches[moveId]) {
        finalPower = dynamicPowerPatches[moveId];
    }
    
    return {
        ...data, // 保留所有高级属性！
        
        // 标准化字段
        name: data.name || name,
        type: data.type || 'Normal',
        power: finalPower,
        cat: data.category === 'Special' ? 'spec' : (data.category === 'Physical' ? 'phys' : 'status'),
        accuracy: (data.accuracy === true) ? true : (data.accuracy === undefined ? 100 : data.accuracy)
    };
}

/**
 * 计算能力值 (支持新版 stats_meta 格式)
 * 
 * @param {object} baseStats - { hp, atk, def, spa, spd, spe }
 * @param {number} level - 等级
 * @param {object} options - 可选参数
 * @param {object} options.ivs - 个体值对象 { hp, atk, def, spa, spd, spe }，默认全31
 * @param {number} options.ev_level - 统一努力值等级 (0~252)，会同时加到六项
 * @param {string} options.nature - 性格名称，用于修正能力值
 * @returns {object} 计算后的能力值 { hp, atk, def, spa, spd, spe }
 */
export function calcStats(baseStats, level, options = {}) {
    // 兼容旧版调用: calcStats(baseStats, level, iv, ev)
    let ivs, evs, nature;
    if (typeof options === 'number') {
        // 旧版调用方式
        const oldIv = options;
        const oldEv = arguments[3] || 0;
        ivs = { hp: oldIv, atk: oldIv, def: oldIv, spa: oldIv, spd: oldIv, spe: oldIv };
        evs = { hp: oldEv, atk: oldEv, def: oldEv, spa: oldEv, spd: oldEv, spe: oldEv };
        nature = null;
    } else {
        // 新版调用方式
        ivs = options.ivs || { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
        
        // 支持三种 ev_level 格式：
        // 1. 数字 (统一值): 252 -> 所有项都是 252
        // 2. 数组 [HP, Atk, Def, SpA, SpD, Spe]: [252, 0, 0, 252, 6, 0]
        // 3. 对象 { hp, atk, def, spa, spd, spe }
        const evInput = options.ev_level;
        if (Array.isArray(evInput)) {
            // 数组格式: [HP, Atk, Def, SpA, SpD, Spe]
            evs = {
                hp: evInput[0] || 0,
                atk: evInput[1] || 0,
                def: evInput[2] || 0,
                spa: evInput[3] || 0,
                spd: evInput[4] || 0,
                spe: evInput[5] || 0
            };
        } else if (typeof evInput === 'object' && evInput !== null) {
            // 对象格式
            evs = evInput;
        } else {
            // 数字格式 (统一值)
            const evLevel = evInput !== undefined ? evInput : 0;
            evs = { hp: evLevel, atk: evLevel, def: evLevel, spa: evLevel, spd: evLevel, spe: evLevel };
        }
        
        nature = options.nature || null;
    }
    
    // 获取性格修正
    const natureMod = nature ? (NATURE_MODIFIERS[nature] || {}) : {};
    
    // HP 计算公式（HP 不受性格影响）
    const calcHP = (base, iv, ev) => {
        return Math.floor((2 * base + iv + ev / 4) * level / 100) + level + 10;
    };
    
    // 其他能力计算公式（受性格影响）
    const calcOther = (base, iv, ev, statName) => {
        let val = Math.floor(((2 * base + iv + ev / 4) * level / 100 + 5));
        // 应用性格修正
        if (natureMod[statName]) {
            val = Math.floor(val * natureMod[statName]);
        }
        return val;
    };
    
    return {
        hp: calcHP(baseStats.hp, ivs.hp || 31, evs.hp || 0),
        atk: calcOther(baseStats.atk, ivs.atk || 31, evs.atk || 0, 'atk'),
        def: calcOther(baseStats.def, ivs.def || 31, evs.def || 0, 'def'),
        spa: calcOther(baseStats.spa, ivs.spa || 31, evs.spa || 0, 'spa'),
        spd: calcOther(baseStats.spd, ivs.spd || 31, evs.spd || 0, 'spd'),
        spe: calcOther(baseStats.spe, ivs.spe || 31, evs.spe || 0, 'spe')
    };
}

/**
 * Pokemon 战斗实例
 * 从 Pokemon Showdown POKEDEX 查表创建，自动计算能力值
 * 
 * 支持两种构造方式：
 * 1. 旧版：new Pokemon(name, level, moves)
 * 2. 新版：new Pokemon(config) 其中 config 包含完整的 stats_meta
 */
export class Pokemon {
    constructor(nameOrConfig, level, moveNames = []) {
        // 检测是否为新版配置对象格式
        if (typeof nameOrConfig === 'object' && nameOrConfig !== null && nameOrConfig.name) {
            this._initFromConfig(nameOrConfig);
        } else {
            // 旧版构造方式
            const name = nameOrConfig;
            const data = getPokemonData(name);
            if (!data) {
                console.warn(`Pokemon "${name}" not found in POKEDEX, using Pikachu`);
                const fallback = getPokemonData('Pikachu') || {
                    name: 'Pikachu', types: ['Electric'],
                    baseStats: { hp: 35, atk: 55, def: 40, spa: 50, spd: 50, spe: 90 }
                };
                this._initLegacy('Pikachu', fallback.types, fallback.baseStats, level, moveNames);
            } else {
                this._initLegacy(name, data.types, data.baseStats, level, moveNames);
            }
        }
    }
    
    /**
     * 新版初始化：从完整配置对象创建
     * @param {object} config - 包含 name, lv, moves, gender, nature, ability, stats_meta 等
     */
    _initFromConfig(config) {
        const name = config.name;
        const level = config.lv || config.level || 50;
        const moveNames = config.moves || [];
        
        const data = getPokemonData(name);
        if (!data) {
            console.warn(`Pokemon "${name}" not found in POKEDEX, using Pikachu`);
            const fallback = getPokemonData('Pikachu') || {
                name: 'Pikachu', types: ['Electric'],
                baseStats: { hp: 35, atk: 55, def: 40, spa: 50, spd: 50, spe: 90 }
            };
            this._initCore('Pikachu', fallback.types, fallback.baseStats, level, moveNames, config);
        } else {
            this._initCore(name, data.types, data.baseStats, level, moveNames, config);
        }
    }
    
    /**
     * 旧版初始化：兼容旧的构造方式
     */
    _initLegacy(name, types, baseStats, level, moveNames) {
        this._initCore(name, types, baseStats, level, moveNames, {});
    }
    
    /**
     * 核心初始化逻辑
     * @param {string} name - 宝可梦名称
     * @param {string[]} types - 属性数组
     * @param {object} baseStats - 种族值
     * @param {number} level - 等级
     * @param {string[]} moveNames - 技能名称数组
     * @param {object} config - 额外配置 (gender, nature, ability, stats_meta, shiny 等)
     */
    _initCore(name, types, baseStats, level, moveNames, config = {}) {
        this.name = name;
        // 使用增强版 Locale 工具获取中文名（支持智能后缀解析）
        if (typeof window !== 'undefined' && window.Locale) {
            // Locale.get 现在会自动处理 "Zoroark-Hisui" -> "索罗亚克-洗翠" 这类转换
            this.cnName = window.Locale.get(name);
        } else {
            this.cnName = name;
        }
        this.types = types;
        this.baseStats = baseStats;
        this.level = level;
        
        // === 新增属性：性别、性格、特性、闪光 ===
        this.gender = config.gender || null; // 'M', 'F', or null
        this.nature = config.nature || null; // 性格名称
        this.shiny = config.shiny || false;  // 是否闪光
        
        // 特性处理：优先使用配置中的特性，否则从 POKEDEX 获取默认特性
        if (config.ability) {
            this.ability = config.ability;
        } else {
            // 从 POKEDEX 获取默认特性 (使用规范化名称)
            const normalizedId = normalizePokemonName(name).toLowerCase().replace(/[^a-z0-9]/g, '');
            const pokeData = typeof POKEDEX !== 'undefined' ? POKEDEX[normalizedId] : null;
            if (pokeData && pokeData.abilities) {
                this.ability = pokeData.abilities['0'] || null;
            } else {
                this.ability = null;
            }
        }
        
        // === 能力值计算 ===
        // 优先使用 stats_meta 中的完整数据
        const statsMeta = config.stats_meta || {};
        let ivs, evLevel;
        
        if (statsMeta.ivs || statsMeta.ev_level !== undefined) {
            // 新版格式：使用 stats_meta
            ivs = statsMeta.ivs || { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
            evLevel = statsMeta.ev_level !== undefined ? statsMeta.ev_level : 0;
        } else {
            // 旧版兼容：动态 EV 计算逻辑
            // 等级越高，经历的战斗越多，积累的努力值就越高
            // 公式：每级给 1.5 的单项 EV，上限 85 (6项 x 85 = 510 总量)
            ivs = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
            evLevel = Math.min(85, Math.floor(level * 1.5));
        }
        
        // 保存原始数据以便后续查看/导出
        this.statsMeta = {
            ivs: ivs,
            ev_level: evLevel
        };
        
        // 计算能力值
        const stats = calcStats(baseStats, level, {
            ivs: ivs,
            ev_level: evLevel,
            nature: this.nature
        });
        
        // === 【脱壳忍者 Shedinja 特判】HP 强制为 1 ===
        const speciesId = (this.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (speciesId === 'shedinja') {
            this.maxHp = 1;
            this.currHp = 1;
            console.log(`[SHEDINJA] ${this.cnName} 的 HP 强制设为 1`);
        } else {
            this.maxHp = stats.hp;
            this.currHp = stats.hp;
        }
        this.atk = stats.atk;
        this.def = stats.def;
        this.spa = stats.spa;
        this.spd = stats.spd;
        this.spe = stats.spe;
        
        // === 战场能力增益等级 (Stages) ===
        // 范围 -6 到 +6, 默认 0
        this.boosts = {
            atk: 0, def: 0, spa: 0, spd: 0, spe: 0,
            accuracy: 0, evasion: 0
        };
        
        // === 上场回合数 (用于 Fake Out 等首回合限制技能) ===
        this.turnsOnField = 0;
        
        // === 技能使用追踪 (用于连续使用限制) ===
        this.lastMoveUsed = null;       // 上回合使用的技能名称
        this.protectCounter = 0;        // 连续使用守住类技能的次数
        this.mustRecharge = false;      // 是否需要蓄力/僵直（破坏光线等）
        
        // === 状态异常系统 ===
        this.status = null;      // 主要状态: 'slp', 'par', 'brn', 'psn', 'tox', 'frz'
        this.volatile = {};      // 临时状态: { flinch: true, confusion: true }
        this.sleepTurns = 0;     // 睡眠剩余回合数
        
        // =====================================================
        // === 情感努力值 (Affective Values - AVs) ===
        // === 洛迪亚特区 (Rhodia Region) 专属系统 ===
        // =====================================================
        // 受神馔粉雾 (Ambrosia) 影响，宝可梦与训练家的灵魂链接产生的加点
        // 每个维度 0~255，类似传统 EVs 但影响战斗机制而非数值
        // 支持两种格式：
        // 1. 扁平格式: { avs: { trust, passion, insight, devotion } }
        // 2. 嵌套格式: { friendship: { avs: { trust, passion, insight, devotion } } }
        let avsConfig = config.avs || {};
        if (config.friendship) {
            // 嵌套格式: friendship.avs
            if (config.friendship.avs) {
                avsConfig = config.friendship.avs;
            } else {
                // 旧扁平格式: friendship 直接包含 trust/passion 等
                avsConfig = config.friendship;
            }
        }
        // 【解锁系统】enable_insight 控制 AVs 上限
        // 未解锁：上限 155
        // 已解锁：上限 255
        // 注意：这里只存储原始值，实际效果计算时会根据 enable_insight 动态调整
        this.avs = {
            trust: avsConfig.trust || 0,       // 信赖：防守向，致命伤害时锁血
            passion: avsConfig.passion || 0,   // 激情：进攻向，暴击率提升
            insight: avsConfig.insight || 0,   // 灵犀：回避向，闪避率提升
            devotion: avsConfig.devotion || 0  // 献身：回复向，回合末治愈异常
        };
        console.log(`[AVS] ${this.name} loaded AVs (raw):`, this.avs);
        
        // 灵魂伙伴标记 (isAce) 和 Second Wind 机制
        this.isAce = config.isAce || false;
        this.hasSecondWind = config.hasSecondWind || false;
        
        // 首发标记 (isLead) - 标记该宝可梦是否为首发出战
        this.isLead = config.isLead || false;
        
        // === 互斥机制系统 (Mechanic Lock) ===
        // mechanic: 'mega' | 'dynamax' | 'zmove' | 'tera' | undefined
        this.mechanic = config.mechanic || null;
        
        // === 极巨化 (Dynamax) 系统 ===
        // canDynamax: 是否可以极巨化
        // 如果 mechanic === 'dynamax'，自动启用极巨化能力
        this.canDynamax = config.canDynamax || (this.mechanic === 'dynamax');
        this.isDynamaxed = false;      // 当前是否处于极巨化状态
        this.dynamaxTurns = 0;         // 极巨化剩余回合数
        this.dynamax_moves = config.dynamax_moves || null; // 极巨化时的招式列表
        
        // === Mega 进化目标 ===
        // 支持 mega_target 或 mega 字段（用于 G-Max 形态等）
        // 注意：这里只设置 megaTargetId，canMegaEvolve 由 autoDetectMegaEligibility 处理
        const megaTarget = config.mega_target || config.mega;
        if (megaTarget) {
            this.megaTargetId = megaTarget;
            // 【修复】只有当 mechanic 不是 'mega' 时，才根据 gmax 设置 canDynamax
            // mechanic 字段是最高权威，不应被 mega_target 劫持
            if (megaTarget.includes('gmax') && this.mechanic !== 'mega') {
                this.canDynamax = true;
            }
        }
        
        // === Z 招式配置 ===
        // z_move_config: { base_move, target_move, is_unique, trigger_text }
        this.z_move_config = config.z_move_config || null;
        
        // === 太晶化 (Terastallization) 系统 ===
        // teraType: 太晶化后的属性 (预设型)
        // 如果没配置，默认 fallback 到第一属性
        this.teraType = config.tera_type || config.teraType || this.types[0] || 'Normal';
        this.isTerastallized = false;       // 当前是否处于太晶化状态
        this.originalTypes = [...this.types]; // 保存原始属性 (用于 STAB 回溯)
        // canTera: 是否可以太晶化 (由 mechanic 决定)
        this.canTera = (this.mechanic === 'tera');
        
        // === 道具 ===
        this.item = config.item || null;
        
        // 调试日志：确认新字段是否正确解析
        if (this.mechanic || this.z_move_config || this.dynamax_moves || this.canDynamax || this.canTera) {
            console.log(`[MECHANIC] ${this.name} initialized with:`, {
                mechanic: this.mechanic,
                canDynamax: this.canDynamax,
                canTera: this.canTera,
                teraType: this.teraType,
                megaTargetId: this.megaTargetId,
                z_move_config: this.z_move_config,
                dynamax_moves: this.dynamax_moves,
                item: this.item
            });
        }
        
        // AVs 触发记录（每场战斗只触发一次的效果）
        this.avsTriggered = {
            trustEndure: false,  // Trust 锁血是否已触发
            passionKill: false   // Passion 击杀加成是否已触发
        };
        
        const safeMoves = Array.isArray(moveNames) ? moveNames : [];
        this.moves = safeMoves.map(mn => {
            const id = (mn || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const rawData = typeof MOVES !== 'undefined' ? MOVES[id] : null;
            let md = getMoveData(mn);
            if (!rawData) {
                const randomFallback = FALLBACK_MOVES[Math.floor(Math.random() * FALLBACK_MOVES.length)];
                md = getMoveData(randomFallback);
            }
            // 使用 Locale 工具获取技能中文名
            const cnName = (typeof window !== 'undefined' && window.Locale) ? window.Locale.get(md.name) : md.name;
            // 【修复】保留 target 字段，用于精神场地等机制判断招式目标类型
            return { 
                name: md.name, 
                cn: cnName, 
                type: md.type, 
                power: md.power || 0, 
                cat: md.cat || 'phys',
                target: md.target || 'normal',  // 【关键】保留目标类型
                priority: md.priority || 0      // 【关键】保留优先度
            };
        });
        
        // 如果没给技能或过滤后为空，给个默认的
        if (this.moves.length === 0) {
            const tackleCN = (typeof window !== 'undefined' && window.Locale) ? window.Locale.get('Tackle') : 'Tackle';
            this.moves = [{ name: 'Tackle', cn: tackleCN, type: 'Normal', power: 40, cat: 'phys' }];
        }
    }
    
    /**
     * 获取有效 AVs 值（考虑 enable_insight / enable_styles 解锁限制）
     * @param {string} stat - AVs 属性名: 'trust', 'passion', 'insight', 'devotion'
     * @returns {number} 有效的 AVs 值
     */
    getEffectiveAVs(stat) {
        // 【全局开关】AVS 系统关闭时返回 0
        if (typeof window !== 'undefined' && window.GAME_SETTINGS && !window.GAME_SETTINGS.enableAVS) {
            return 0;
        }
        
        if (!this.avs || !this.avs[stat]) return 0;
        
        const rawValue = this.avs[stat];
        
        // 获取解锁状态（区分玩家和敌方）
        // 通过检查当前宝可梦是否在玩家队伍中来判断
        let insightUnlocked = false;
        if (typeof battle !== 'undefined') {
            const isPlayerPokemon = battle.playerParty && battle.playerParty.includes(this);
            if (isPlayerPokemon) {
                // 玩家宝可梦：检查 playerUnlocks
                const unlocks = battle.playerUnlocks || {};
                insightUnlocked = unlocks.enable_insight === true || unlocks.enable_styles === true;
            } else {
                // 敌方宝可梦：检查 enemyUnlocks
                const unlocks = battle.enemyUnlocks || {};
                insightUnlocked = unlocks.enable_insight === true || unlocks.enable_styles === true;
            }
        }
        
        // 未解锁：上限 155
        // 已解锁：上限 255，且在 255 时有额外加成（通过 avsEvolutionBoost 或其他机制）
        const cap = insightUnlocked ? 255 : 155;
        const cappedValue = Math.min(rawValue, cap);
        
        // 如果已解锁且达到满值 255，给予 1.1x 加成
        if (insightUnlocked && rawValue >= 255) {
            return Math.floor(cappedValue * 1.1);
        }
        
        return cappedValue;
    }
    
    // 获取精灵图 URL
    getSprite(isBack = false) {
        // 非官方 Mega：返回基础形态的图片 URL
        if (this.isUnofficialMega && this.megaTargetId) {
            const baseSpecies = this.megaTargetId.replace(/mega.*$/i, '');
            const folder = isBack ? 'ani-back' : 'ani';
            return `https://play.pokemonshowdown.com/sprites/${folder}/${baseSpecies}.gif`;
        }
        
        const id = resolveSpriteId(this.name);
        let folder = isBack ? 'ani-back' : 'ani';
        
        // Mega 形态强制使用普通色（避免异色 Mega 资源缺失）
        const isMegaForm = /mega|primal/i.test(this.name);
        if (this.shiny && !isMegaForm) {
            folder += '-shiny';
        }
        return `https://play.pokemonshowdown.com/sprites/${folder}/${id}.gif`;
    }
    
    // 获取回退精灵图 URL（基础形态）
    getFallbackSprite(isBack = false) {
        const id = getFallbackSpriteId(this.name);
        let folder = isBack ? 'ani-back' : 'ani';
        
        // Mega 形态强制使用普通色（避免异色 Mega 资源缺失）
        const isMegaForm = /mega|primal/i.test(this.name);
        if (this.shiny && !isMegaForm) {
            folder += '-shiny';
        }
        return `https://play.pokemonshowdown.com/sprites/${folder}/${id}.gif`;
    }
    
    // 是否存活
    isAlive() {
        return this.currHp > 0;
    }
    
    // 受伤
    // @param {number} dmg - 伤害值
    // @param {string} category - 伤害类型 ('physical'/'special'/null)，用于 Counter/Mirror Coat
    takeDamage(dmg, category = null) {
        // === 记录本回合受到的伤害（用于 Counter/Mirror Coat）===
        if (!this.turnData) this.turnData = {};
        if (dmg > 0 && category) {
            this.turnData.lastDamageTaken = {
                amount: dmg,
                category: category.toLowerCase()
            };
        }
        
        // Focus Sash (气势披带): 满血时，致命伤害只会让 HP 剩 1
        // 使用 items-data.js 的 ItemEffects 处理器
        if (typeof ItemEffects !== 'undefined' && ItemEffects.checkFocusSash) {
            if (ItemEffects.checkFocusSash(this, dmg)) {
                console.log(`[ITEM] ${this.cnName} 的气势披带发动了！`);
                return; // 不执行后续扣血
            }
        } else {
            // Fallback: 兼容旧逻辑
            const itemName = (this.item || '').toLowerCase().replace(/[^a-z]/g, '');
            if (itemName === 'focussash' && this.currHp === this.maxHp && dmg >= this.currHp) {
                this.currHp = 1;
                this.item = null;
                this.focusSashTriggered = true;
                console.log(`[ITEM] ${this.cnName} 的气势披带发动了！`);
                return;
            }
        }
        
        // =====================================================
        // === AVs: Trust (信赖) - Sync Guard 锁血效果 ===
        // =====================================================
        // 【线性机制】概率 = (effectiveTrust / 255) * 0.50
        // 满值 255 时约 50% 概率，100 时约 20% 概率
        // 每只宝可梦每场战斗只能触发一次
        // 只有 isAce=true 的宝可梦才能触发 AVs 被动
        // 【Ambrosia】神之琼浆天气下 AVS 触发率 x2
        if (this.isAce && this.avs && dmg >= this.currHp && !this.avsTriggered?.trustEndure) {
            const baseTrust = this.getEffectiveAVs('trust');
            // 【全局开关】AVS 关闭时 getEffectiveAVs 返回 0，跳过计算
            if (baseTrust > 0) {
                const effectiveTrust = this.avsEvolutionBoost ? baseTrust * 2 : baseTrust;
                // 线性概率：满值 50%，无保底（低 AVS 就是低概率）
                // Trust 60 → 11.76%, Trust 100 → 19.6%, Trust 255 → 50%
                let triggerChance = (effectiveTrust / 255) * 0.50;
                
                // 【Ambrosia 神之琼浆】AVS 触发率 x2
                if (typeof window.WeatherEffects !== 'undefined' && window.WeatherEffects.getAVSMultiplier) {
                    const currentWeather = window.battle?.weather || '';
                    const avsMultiplier = window.WeatherEffects.getAVSMultiplier(currentWeather);
                    if (avsMultiplier > 1) {
                        triggerChance *= avsMultiplier;
                        console.log(`[AMBROSIA] 💫 神之琼浆：Trust 触发率 x${avsMultiplier}`);
                    }
                }
                triggerChance = Math.min(triggerChance, 1.0); // 上限 100%
                
                if (Math.random() < triggerChance) {
                    this.currHp = 1;
                    this.avsTriggered.trustEndure = true; // 每场战斗只能触发一次
                    this.trustEndureTriggered = true; // 标记用于日志
                    console.log(`[AVs] ${this.cnName} 的 Trust 守护发动！(Chance: ${Math.round(triggerChance * 100)}%, Trust: ${baseTrust}${this.avsEvolutionBoost ? ' x2' : ''})`);
                    return; // 不执行后续扣血
                }
            }
        }
        
        // =====================================================
        // === Second Wind (第二气息) - 极诣区 Boss 专属 ===
        // =====================================================
        // 王牌宝可梦首次血条归零时：锁 1 HP + 全属性 +1
        // 只有标记了 hasSecondWind 的宝可梦才能触发
        if (this.hasSecondWind && dmg >= this.currHp && !this.secondWindTriggered) {
            this.currHp = 1;
            this.secondWindTriggered = true;
            this.secondWindActivated = true; // 标记用于日志和动画
            
            // 全属性 +1
            this.applyBoost('atk', 1);
            this.applyBoost('def', 1);
            this.applyBoost('spa', 1);
            this.applyBoost('spd', 1);
            this.applyBoost('spe', 1);
            
            console.log(`[Second Wind] ${this.cnName} 的第二气息发动了！全属性 +1！`);
            return; // 不执行后续扣血
        }
        
        // =====================================================
        // === 【战术指挥】ENDURE! 指令 - 概率挺住 ===
        // =====================================================
        // 基础 50% + Trust AVS 50%（满值时 100%）
        if (this.commandEndureActive && dmg >= this.currHp) {
            let endureChance = 0.50; // 基础 50%
            
            // Trust AVS 加成：满值 255 时 +50%
            // 【全局开关】使用 getEffectiveAVs 检查有效值
            if (this.isAce && this.avs) {
                const baseTrust = this.getEffectiveAVs('trust');
                if (baseTrust > 0) {
                    const effectiveTrust = this.avsEvolutionBoost ? baseTrust * 2 : baseTrust;
                    const trustBonus = (Math.min(effectiveTrust, 255) / 255) * 0.50;
                    endureChance += trustBonus;
                    console.log(`[COMMANDER] ENDURE! Trust 加成: +${(trustBonus * 100).toFixed(1)}% (Trust: ${baseTrust})`);
                }
            }
            
            endureChance = Math.min(endureChance, 1.0); // 上限 100%
            const roll = Math.random();
            console.log(`[COMMANDER] ENDURE! Roll: ${(roll * 100).toFixed(1)}% vs Chance: ${(endureChance * 100).toFixed(1)}%`);
            
            this.commandEndureActive = false; // 使用后消耗
            
            if (roll < endureChance) {
                this.currHp = 1;
                this.commandEndureTriggered = true; // 标记用于日志
                console.log(`[COMMANDER] ENDURE! 指令成功！${this.cnName} 在训练家的呼喊下撑住了！`);
                return; // 不执行后续扣血
            } else {
                console.log(`[COMMANDER] ENDURE! 指令失败...${this.cnName} 没能撑住...`);
            }
        }
        
        // =====================================================
        // === Bond Endure (羁绊挺住) - 进化拦截器 ===
        // =====================================================
        // 当满足进化条件时，致命伤害会锁血至 1 HP
        // 条件：isAce + 有进化型 + AVs 达标 + 等级在宽容范围内 + 本场未进化过
        // 触发后立即显示 EVO 按钮
        if (this.isAce && dmg >= this.currHp && !this.hasEvolvedThisBattle && !this.bondEndureTriggered) {
            const canBondEndure = this._checkBondEndureEligibility();
            if (canBondEndure) {
                this.currHp = 1;
                this.bondEndureTriggered = true;
                this.bondEndureActivated = true; // 标记用于日志和动画
                console.log(`[Bond Endure] ${this.cnName} 因为想回应训练家的期待，撑住了！`);
                return; // 不执行后续扣血
            }
        }
        
        this.currHp = Math.max(0, this.currHp - dmg);
    }
    
    /**
     * 检查是否满足羁绊挺住条件（进化拦截）
     * 【仅限玩家】敌人不触发此机制
     * @returns {boolean}
     */
    _checkBondEndureEligibility() {
        // 【全局开关】EVO 系统关闭时不触发
        if (typeof window !== 'undefined' && window.GAME_SETTINGS && !window.GAME_SETTINGS.enableEVO) {
            return false;
        }
        
        // 【仅限玩家】敌人不触发 Bond Endure
        if (typeof window !== 'undefined' && window.battle && window.battle.playerParty) {
            if (!window.battle.playerParty.includes(this)) return false;
        }
        
        if (!this.avs) return false;
        
        // 计算 AVs 总和
        const totalAVs = (this.getEffectiveAVs('trust') || 0) + 
                         (this.getEffectiveAVs('passion') || 0) + 
                         (this.getEffectiveAVs('insight') || 0) + 
                         (this.getEffectiveAVs('devotion') || 0);
        
        // 获取宝可梦数据
        const baseId = this.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const data = typeof POKEDEX !== 'undefined' ? POKEDEX[baseId] : null;
        if (!data) return false;
        
        // 必须有进化型
        if (!data.evos || data.evos.length === 0) return false;
        
        // 已 Mega 或已变身的不能触发
        if (this.isMega || this.isTransformed) return false;
        
        // 获取进化型数据
        const nextFormName = data.evos[0];
        const nextId = nextFormName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const nextData = typeof POKEDEX !== 'undefined' ? POKEDEX[nextId] : null;
        if (!nextData) return false;
        
        // 【特殊进化检查】只有等级进化或亲密度进化才能触发战斗EVO
        // 道具进化(useItem)、交换进化(trade)、特殊条件进化等不触发
        // 例如：伊布需要道具进化，不应触发战斗EVO
        const allowedEvoTypes = [undefined, 'levelFriendship'];
        if (!allowedEvoTypes.includes(nextData.evoType)) return false;
        
        // 等级检查（允许越级3级）
        const reqLevel = Math.max(1, (nextData.evoLevel || 1) - 3);
        if (this.level < reqLevel) return false;
        
        // AVs 阈值检查
        // 一阶(无prevo): 80
        // 二阶(有prevo): 160
        // 只有一次进化(有prevo但进化型无evos): 140
        const isFirstStage = !data.prevo;
        const nextHasEvos = nextData.evos && nextData.evos.length > 0;
        
        let reqAVs;
        if (isFirstStage) {
            reqAVs = 80;  // 一阶段
        } else if (!nextHasEvos) {
            reqAVs = 140; // 只有一次升级（二阶进化到最终形态）
        } else {
            reqAVs = 160; // 二阶段（还能继续进化）
        }
        
        if (totalAVs < reqAVs) return false;
        
        console.log(`[Bond Endure Check] ${this.cnName}: AVs=${totalAVs}/${reqAVs}, Level=${this.level}/${reqLevel}, Target=${nextFormName}`);
        return true;
    }
    
    // 回复
    // 【Smog 专用】化学屏障 - 所有回复效果减半
    heal(amount, options = {}) {
        let finalAmount = amount;
        
        // 检查天气回复减半（Smog 化学屏障）
        // options.bypassWeather = true 可以跳过（用于治愈之愿等更替技能）
        if (!options.bypassWeather && typeof window !== 'undefined' && window.battle && window.WeatherEffects) {
            const healMult = window.WeatherEffects.getHealingMultiplier(window.battle.weather);
            if (healMult < 1) {
                finalAmount = Math.floor(amount * healMult);
                console.log(`[SMOG] 🏭 化学屏障：回复量 ${amount} -> ${finalAmount} (x${healMult})`);
            }
        }
        
        this.currHp = Math.min(this.maxHp, this.currHp + finalAmount);
        return finalAmount; // 返回实际回复量
    }
    
    /**
     * 消耗道具（触发 Unburden 等特性）
     * @param {string} reason - 消耗原因 ('use', 'fling', 'knockoff', 'consume')
     * @returns {string|null} - 被消耗的道具名称
     */
    consumeItem(reason = 'consume') {
        if (!this.item) return null;
        
        const consumedItem = this.item;
        this.item = null;
        
        // 触发 onItemLost 钩子（Unburden 等特性）
        if (typeof AbilityHandlers !== 'undefined' && this.ability) {
            const handler = AbilityHandlers[this.ability];
            if (handler && handler.onItemLost) {
                let logs = [];
                handler.onItemLost(this, consumedItem, logs);
                // 日志输出由调用方处理
                if (logs.length > 0 && typeof log === 'function') {
                    logs.forEach(txt => log(txt));
                }
            }
        }
        
        console.log(`[ITEM] ${this.cnName} 的 ${consumedItem} 被消耗了 (${reason})`);
        return consumedItem;
    }
    
    // === 重置能力变化 (换人时调用) ===
    resetBoosts() {
        this.boosts = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, accuracy: 0, evasion: 0 };
        this.turnsOnField = 0;      // 重置上场回合数
        this.lastMoveUsed = null;   // 重置上回合技能
        this.protectCounter = 0;    // 重置守住计数器
        this.mustRecharge = false;  // 重置僵直状态
        
        // 【修复】换人时清除极巨化状态
        // 正作规则：极巨化宝可梦一旦退场，极巨化立刻解除
        if (this.isDynamaxed) {
            console.log(`[SWITCH] Clearing Dynamax for ${this.name}`);
            this.isDynamaxed = false;
            this.dynamaxTurns = 0;
            
            // 恢复原始名称（G-Max 形态名称 -> 基础名称）
            if (this.originalName) {
                console.log(`[SWITCH] Restoring name: ${this.name} -> ${this.originalName}`);
                this.name = this.originalName;
                delete this.originalName;
            }
            
            // 恢复 HP（如果之前乘了 1.5 倍）
            if (this.preDynamaxMaxHp) {
                // 按比例恢复 HP
                const hpRatio = this.currHp / this.maxHp;
                this.maxHp = this.preDynamaxMaxHp;
                this.currHp = Math.max(1, Math.floor(this.maxHp * hpRatio));
                this.preDynamaxMaxHp = null;
                this.preDynamaxCurrHp = null;
            }
        }
        
        // 清除蓄力状态 (Solar Beam, Skull Bash, etc.)
        this.isCharging = false;
        this.chargingMove = null;
        
        // 清除其他 volatile 状态
        if (this.volatiles) {
            this.volatiles = {};
        }
    }
    
    // === 应用能力等级变化 ===
    applyBoost(statName, stage) {
        if (!this.boosts.hasOwnProperty(statName)) return 0;
        
        // Contrary (唱反调): 能力变化反转
        if (this.ability && this.ability.toLowerCase().replace(/\s/g, '') === 'contrary') {
            stage = -stage;
        }
        
        const oldVal = this.boosts[statName];
        this.boosts[statName] = Math.min(6, Math.max(-6, oldVal + stage));
        return this.boosts[statName] - oldVal;
    }
    
    // === 获取经过能力修正后的实战数值 ===
    getStat(statName) {
        // 基础六围 (除了 HP, accuracy, evasion)
        if (['atk', 'def', 'spa', 'spd', 'spe'].includes(statName)) {
            const base = this[statName];
            const stage = this.boosts[statName];
            
            // 核心公式： stage >= 0: (2 + stage) / 2; stage < 0: 2 / (2 + |stage|)
            let multiplier = 1.0;
            if (stage >= 0) multiplier = (2 + stage) / 2;
            else multiplier = 2 / (2 + Math.abs(stage));
            
            let val = Math.floor(base * multiplier);
            
            // === 【环境图层系统】Environment Overlay 数值修正 ===
            if (typeof window !== 'undefined' && window.envOverlay) {
                const envMod = window.envOverlay.getStatMod(this, statName);
                if (envMod !== 1) {
                    const oldVal = val;
                    val = Math.floor(val * envMod);
                    console.log(`[ENV OVERLAY] 🌍 ${this.cnName} ${statName}: ${oldVal} → ${val} (x${envMod})`);
                }
            }
            
            // === 特性加成 Hook (大力士、毛皮大衣、天气加速等) ===
            if (typeof AbilityHandlers !== 'undefined' && this.ability && AbilityHandlers[this.ability]) {
                const ah = AbilityHandlers[this.ability];
                if (ah.onModifyStat) {
                    const shell = { atk: this.atk, def: this.def, spa: this.spa, spd: this.spd, spe: this.spe };
                    shell[statName] = val;
                    // 传递 battle 对象以支持天气特性 (叶绿素、悠游自如等)
                    const battleRef = (typeof battle !== 'undefined') ? battle : (typeof window !== 'undefined' ? window.battle : null);
                    ah.onModifyStat(shell, this, battleRef);
                    val = shell[statName];
                }
            }
            
            // === 道具加成 (讲究系列、电气球、粗骨头、进化奇石等) ===
            if (this.item && typeof window !== 'undefined' && typeof window.getItem === 'function') {
                const itemData = window.getItem(this.item);
                if (itemData && itemData.statBoost && itemData.statBoost[statName]) {
                    const itemBoost = itemData.statBoost[statName];
                    let shouldApply = true;
                    
                    // 检查是否为特定宝可梦专属道具
                    if (itemData.itemUser) {
                        // 专属道具：检查是否为指定宝可梦
                        const pokeName = this.name.split('-')[0]; // 处理地区形态
                        shouldApply = itemData.itemUser.some(u => this.name.includes(u) || pokeName === u);
                    }
                    
                    // 检查是否为进化奇石（需要未完全进化）
                    if (itemData.requiresNFE) {
                        // 检查宝可梦是否可以进化（通过 POKEDEX 数据）
                        const normalizedId = this.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                        const pokeData = (typeof POKEDEX !== 'undefined') ? POKEDEX[normalizedId] : null;
                        // 如果有 evos 字段，说明可以进化，进化奇石生效
                        // 如果没有 evos 字段，说明已经是最终形态，进化奇石不生效
                        shouldApply = pokeData && pokeData.evos && pokeData.evos.length > 0;
                    }
                    
                    if (shouldApply) {
                        val = Math.floor(val * itemBoost);
                        console.log(`[ITEM] ${this.cnName} 的 ${itemData.cnName || this.item} 使 ${statName} x${itemBoost}`);
                    }
                }
            }
            
            return Math.max(1, val);
        }
        
        // 命中/闪避返回等级值，由引擎计算最终命中率
        if (statName === 'accuracy' || statName === 'evasion') {
            return this.boosts[statName];
        }
        
        return 0;
    }
}

/**
 * =============================================
 * DAMAGE CALCULATION - 已迁移
 * =============================================
 * 
 * calcDamage 函数已迁移到 -> battle/battle-calc.js
 */

/**
 * =============================================
 * MOVE SECONDARY EFFECTS - 已迁移
 * =============================================
 * 
 * applyMoveSecondaryEffects 函数已迁移到 -> battle/battle-effects.js
 */

/**
 * 核心：判断当前宝可梦能否行动
 * @param {Pokemon} pokemon
 * @param {Object} move - 可选，要使用的招式（用于挑衅/再来一次/定身法检查）
 * @returns {{ can: boolean, msg: string, forcedMove: Object|null }}
 */
export function checkCanMove(pokemon, move = null) {
    // 1. 畏缩 (Flinch) - 本回合无法行动，用完即清
    if (pokemon.volatile && pokemon.volatile.flinch) {
        pokemon.volatile.flinch = false;
        // 【重要】畏缩会中断蓄力技能
        if (pokemon.volatile.chargingMove) {
            delete pokemon.volatile.chargingMove;
            // 清除半无敌状态
            delete pokemon.volatile.flying;
            delete pokemon.volatile.underground;
            delete pokemon.volatile.underwater;
            delete pokemon.volatile.shadow;
        }
        return { can: false, msg: `${pokemon.cnName} 因为畏缩而无法动弹!` };
    }
    
    // 2. 睡眠 (Sleep) - 每回合减少计数，到0醒来
    if (pokemon.status === 'slp') {
        pokemon.sleepTurns--;
        if (pokemon.sleepTurns <= 0) {
            pokemon.status = null;
            return { can: true, msg: `${pokemon.cnName} 醒过来了!` };
        }
        // 【重要】睡眠会中断蓄力技能
        if (pokemon.volatile && pokemon.volatile.chargingMove) {
            delete pokemon.volatile.chargingMove;
            delete pokemon.volatile.flying;
            delete pokemon.volatile.underground;
            delete pokemon.volatile.underwater;
            delete pokemon.volatile.shadow;
        }
        return { can: false, msg: `${pokemon.cnName} 正在熟睡中...` };
    }
    
    // 3. 麻痹 (Paralysis) - 25% 几率无法行动
    if (pokemon.status === 'par') {
        if (Math.random() < 0.25) {
            // 【重要】麻痹无法行动会中断蓄力技能
            if (pokemon.volatile && pokemon.volatile.chargingMove) {
                delete pokemon.volatile.chargingMove;
                delete pokemon.volatile.flying;
                delete pokemon.volatile.underground;
                delete pokemon.volatile.underwater;
                delete pokemon.volatile.shadow;
            }
            return { can: false, msg: `${pokemon.cnName} 因身体麻痹而无法行动!` };
        }
    }
    
    // 3.5 【Ambrosia 时空醉】检查并应用混乱（Mega/Z/Dynamax/Tera 后的下回合）
    // 注意：这里只设置混乱状态，不返回，让后续的混乱检查处理自伤逻辑
    let neuroBacklashMessage = '';
    if (pokemon.volatile && pokemon.volatile.neuroBacklash) {
        if (typeof window.WeatherEffects !== 'undefined' && window.WeatherEffects.applyNeuroBacklashConfusion) {
            const neuroResult = window.WeatherEffects.applyNeuroBacklashConfusion(pokemon);
            if (neuroResult.applied) {
                console.log(`[AMBROSIA] ⚡ 时空醉发作：${pokemon.cnName} 陷入混乱`);
                neuroBacklashMessage = neuroResult.message;
                // 不返回，继续执行后续检查（混乱自伤会在 battle-turns.js 中处理）
            }
        }
    }
    
    // 4. 冰冻 (Frozen) - 20% 几率解冻，否则无法行动
    if (pokemon.status === 'frz') {
        // 4a. 【Gale 极速解冻】香风天气下立即解冻
        if (typeof window !== 'undefined' && window.battle && 
            typeof window.WeatherEffects !== 'undefined' && window.WeatherEffects.checkRapidThawCure) {
            const thawResult = window.WeatherEffects.checkRapidThawCure(window.battle.weather, pokemon);
            if (thawResult.thawed) {
                return { can: true, msg: thawResult.message };
            }
        }
        
        // 4b. 自解冻招式检查 (defrost flag)
        // 使用带有 defrost 标记的招式可以立即解冻并攻击
        if (move) {
            const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const fullMoveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
            if (fullMoveData.flags && fullMoveData.flags.defrost) {
                pokemon.status = null;
                return { can: true, msg: `${pokemon.cnName} 的烈焰融化了身上的冰!` };
            }
        }
        
        // 4c. 随机解冻 (20% 几率)
        if (Math.random() < 0.2) {
            pokemon.status = null;
            return { can: true, msg: `${pokemon.cnName} 的冰冻解除了!` };
        }
        // 【重要】冰冻会中断蓄力技能
        if (pokemon.volatile && pokemon.volatile.chargingMove) {
            delete pokemon.volatile.chargingMove;
            delete pokemon.volatile.flying;
            delete pokemon.volatile.underground;
            delete pokemon.volatile.underwater;
            delete pokemon.volatile.shadow;
        }
        return { can: false, msg: `${pokemon.cnName} 被冻得动弹不得!` };
    }
    
    // ============================================
    // 5. 挥发性封锁检查 (Volatile Locks)
    // ============================================
    
    // 5a. 挑衅 (Taunt) - 无法使用变化技
    if (pokemon.volatile && pokemon.volatile.taunt > 0 && move) {
        const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const fullMoveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
        const category = fullMoveData.category || move.category || move.cat;
        if (category === 'Status') {
            return { can: false, msg: `${pokemon.cnName} 因为挑衅无法使用 ${move.cn || move.name}!` };
        }
    }
    
    // 5a2. 突击背心 (Assault Vest) - 无法使用变化技
    if (pokemon.item && move) {
        const itemId = (pokemon.item || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const itemData = (typeof window !== 'undefined' && typeof window.getItem === 'function') 
            ? window.getItem(pokemon.item) : null;
        if (itemData && itemData.disableStatus) {
            const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const fullMoveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
            const category = fullMoveData.category || move.category || move.cat;
            if (category === 'Status') {
                return { can: false, msg: `${pokemon.cnName} 的${itemData.cnName || pokemon.item}使其无法使用变化技!` };
            }
        }
    }
    
    // 5b. 再来一次 (Encore) - 只能使用被锁定的招式
    if (pokemon.volatile && pokemon.volatile.encore > 0 && pokemon.volatile.encoreMove && move) {
        if (move.name !== pokemon.volatile.encoreMove) {
            return { 
                can: false, 
                msg: `${pokemon.cnName} 被再来一次锁定了!`,
                forcedMove: pokemon.volatile.encoreMove
            };
        }
    }
    
    // 5c. 定身法 (Disable) - 无法使用被封印的招式
    if (pokemon.volatile && pokemon.volatile.disable > 0 && pokemon.volatile.disabledMove && move) {
        if (move.name === pokemon.volatile.disabledMove) {
            return { can: false, msg: `${pokemon.cnName} 的 ${move.cn || move.name} 被封印了!` };
        }
    }
    
    // 5d. 怨恨封印 (Grudge Seal) - 被怨恨封印的招式无法使用
    if (pokemon.volatile && pokemon.volatile.grudgeSealed && move) {
        if (pokemon.volatile.grudgeSealed.includes(move.name)) {
            return { can: false, msg: `${pokemon.cnName} 的 ${move.cn || move.name} 被怨念封印了!` };
        }
    }
    
    return { can: true, msg: neuroBacklashMessage, forcedMove: null };
}

/**
 * 清除回合结束时的临时状态（如畏缩）
 */
export function clearVolatileStatus(pokemon) {
    if (pokemon.volatile) {
        pokemon.volatile.flinch = false;
    }
}

/**
 * 清除换人时的所有临时状态（包括蓄力状态）
 * 用于换人、濒死等情况
 */
export function clearAllVolatileStatus(pokemon) {
    if (!pokemon) return;
    
    // 清除蓄力状态
    if (typeof clearChargingState === 'function') {
        clearChargingState(pokemon);
    } else if (pokemon.volatile) {
        // Fallback: 手动清除蓄力相关状态
        delete pokemon.volatile.chargingMove;
        delete pokemon.volatile.flying;
        delete pokemon.volatile.underground;
        delete pokemon.volatile.underwater;
        delete pokemon.volatile.shadow;
    }
    
    // 清除其他临时状态
    if (pokemon.volatile) {
        pokemon.volatile.flinch = false;
        pokemon.volatile.protect = false;
        delete pokemon.volatile.lockedMove;
        delete pokemon.volatile.lastMove;
    }
}

// 注意：applyEntryHazards 和 tickVolatileStatus 已在 move-effects.js 中实现
// 使用 MoveEffects.applyEntryHazards 和 MoveEffects.tickVolatileStatus

/**
 * =============================================
 * END TURN STATUS - 已迁移
 * =============================================
 * 
 * getEndTurnStatusLogs 函数已迁移到 -> battle/battle-turns.js
 */

// getMovePriority 已迁移到 move-effects.js，使用 MoveEffects.getMovePriority

if (typeof window !== 'undefined') {
    window.checkCanMove = checkCanMove;
    window.clearVolatileStatus = clearVolatileStatus;
    window.clearAllVolatileStatus = clearAllVolatileStatus;
    // getEndTurnStatusLogs 已迁移到 battle-turns.js
    // getMovePriority 使用 MoveEffects.getMovePriority
    window.getMovePriority = (typeof MoveEffects !== 'undefined' && MoveEffects.getMovePriority) 
        ? MoveEffects.getMovePriority 
        : function(move) { return move?.priority || 0; };
}

/**
 * =============================================
 * MEGA EVOLUTION SYSTEM - 已迁移
 * =============================================
 * 
 * 代码已迁移到 -> mechanics/mega-evolution.js
 * 
 * 函数列表：
 * - autoDetectFormChangeEligibility()
 * - autoDetectMegaEligibility()
 * - performMegaEvolution()
 * - canMegaEvolve()
 * - isUnofficialMega()
 */

/**
 * 战斗状态管理器
 */
export class BattleState {
    constructor() {
        this.playerParty = [];
        this.enemyParty = [];
        this.playerActive = 0;
        this.enemyActive = 0;
        this.phase = 'intro';
        this.trainer = null;
        this.locked = false;
        this.scriptedResult = null;
        this.aiDifficulty = 'normal';
        // Mega Evolution 状态
        this.playerMegaUsed = false;    // 玩家本场是否已使用 Mega
        this.enemyMegaUsed = false;     // 敌方本场是否已使用 Mega
        this.playerMegaArmed = false;   // 玩家是否已预备 Mega (点击了按钮)
        
        // Z-Move / Max Move 状态 (全场只能用一次)
        this.playerZUsed = false;       // 玩家本场是否已使用 Z 招式
        this.enemyZUsed = false;        // 敌方本场是否已使用 Z 招式
        this.playerMaxUsed = false;     // 玩家本场是否已使用极巨化
        this.enemyMaxUsed = false;      // 敌方本场是否已使用极巨化
        
        // 太晶化 (Terastallization) 状态 (全场只能用一次，由生到死)
        this.playerTeraUsed = false;    // 玩家本场是否已使用太晶化
        this.enemyTeraUsed = false;     // 敌方本场是否已使用太晶化
        
        // =========================================================
        // 全局战场状态 (Field Conditions)
        // 【规范】所有字段使用驼峰命名，与 moves-data.js 的小写 pseudoWeather 对应
        // =========================================================
        this.field = {
            trickRoom: 0,   // 戏法空间剩余回合 (0=未开启)
            gravity: 0,     // 重力剩余回合
            magicRoom: 0,   // 魔法空间剩余回合
            wonderRoom: 0,  // 奇妙空间剩余回合
            fairyLock: 0,   // 妖精之锁剩余回合
            ionDeluge: 0,   // 等离子浴剩余回合
            mudSport: 0,    // 玩泥巴剩余回合
            waterSport: 0   // 玩水剩余回合
        };
        
        // 玩家侧状态 (Player Side)
        this.playerSide = {
            tailwind: 0,      // 顺风剩余回合
            reflect: 0,       // 反射壁剩余回合
            lightScreen: 0,   // 光墙剩余回合
            auroraVeil: 0,    // 极光幕剩余回合
            stealthRock: false,  // 隐形岩
            spikes: 0,        // 撒菱层数 (0-3)
            toxicSpikes: 0,   // 毒菱层数 (0-2)
            stickyWeb: false  // 黏黏网
        };
        
        // 敌方侧状态 (Enemy Side)
        this.enemySide = {
            tailwind: 0,
            reflect: 0,
            lightScreen: 0,
            auroraVeil: 0,
            stealthRock: false,
            spikes: 0,
            toxicSpikes: 0,
            stickyWeb: false
        };
    }
    
    // 回合结束时递减场地状态
    tickFieldConditions() {
        const logs = [];
        
        // 全局场地 - 使用通用递减逻辑
        const fieldEffects = [
            { key: 'trickRoom', msg: '扭曲的时空恢复了正常！' },
            { key: 'gravity', msg: '重力恢复了正常！' },
            { key: 'magicRoom', msg: '魔法空间消失了！' },
            { key: 'wonderRoom', msg: '奇妙空间消失了！' },
            { key: 'fairyLock', msg: '妖精之锁解除了！' },
            { key: 'ionDeluge', msg: '等离子浴结束了！' },
            { key: 'mudSport', msg: '玩泥巴的效果消失了！' },
            { key: 'waterSport', msg: '玩水的效果消失了！' }
        ];
        
        for (const effect of fieldEffects) {
            if (this.field[effect.key] > 0) {
                this.field[effect.key]--;
                if (this.field[effect.key] === 0) {
                    logs.push(effect.msg);
                }
            }
        }
        
        // 玩家侧
        if (this.playerSide.tailwind > 0) {
            this.playerSide.tailwind--;
            if (this.playerSide.tailwind === 0) {
                logs.push("我方的顺风停止了！");
            }
        }
        if (this.playerSide.reflect > 0) {
            this.playerSide.reflect--;
            if (this.playerSide.reflect === 0) {
                logs.push("我方的反射壁消失了！");
            }
        }
        if (this.playerSide.lightScreen > 0) {
            this.playerSide.lightScreen--;
            if (this.playerSide.lightScreen === 0) {
                logs.push("我方的光墙消失了！");
            }
        }
        if (this.playerSide.auroraVeil > 0) {
            this.playerSide.auroraVeil--;
            if (this.playerSide.auroraVeil === 0) {
                logs.push("我方的极光幕消失了！");
            }
        }
        
        // 敌方侧
        if (this.enemySide.tailwind > 0) {
            this.enemySide.tailwind--;
            if (this.enemySide.tailwind === 0) {
                logs.push("敌方的顺风停止了！");
            }
        }
        if (this.enemySide.reflect > 0) {
            this.enemySide.reflect--;
            if (this.enemySide.reflect === 0) {
                logs.push("敌方的反射壁消失了！");
            }
        }
        if (this.enemySide.lightScreen > 0) {
            this.enemySide.lightScreen--;
            if (this.enemySide.lightScreen === 0) {
                logs.push("敌方的光墙消失了！");
            }
        }
        if (this.enemySide.auroraVeil > 0) {
            this.enemySide.auroraVeil--;
            if (this.enemySide.auroraVeil === 0) {
                logs.push("敌方的极光幕消失了！");
            }
        }
        
        // =========================================================
        // 【修复】天气回合递减
        // 【重要】始源天气 (deltastream, harshsun, heavyrain) 不递减
        // 它们只在对应特性宝可梦在场时存在
        // =========================================================
        const PRIMAL_WEATHERS = ['deltastream', 'harshsun', 'heavyrain'];
        if (this.weatherTurns && this.weatherTurns > 0 && !PRIMAL_WEATHERS.includes(this.weather)) {
            this.weatherTurns--;
            console.log(`[WEATHER] 天气回合递减: ${this.weatherTurns + 1} -> ${this.weatherTurns}`);
            if (this.weatherTurns === 0) {
                const weatherNames = {
                    'rain': '雨停了。',
                    'sun': '阳光恢复了正常。',
                    'sandstorm': '沙暴停止了。',
                    'hail': '冰雹停止了。',
                    'snow': '雪停了。'
                };
                const msg = weatherNames[this.weather] || '天气恢复了正常。';
                logs.push(`🌤️ ${msg}`);
                console.log(`[WEATHER] 天气结束: ${this.weather}`);
                
                // 检查是否有环境天气需要回归
                if (this.environmentWeather && this.environmentWeather !== 'none') {
                    this.weather = this.environmentWeather;
                    this.weatherTurns = 0; // 环境天气永久
                    
                    // 使用压制系统的回归消息
                    if (typeof window !== 'undefined' && window.WeatherEffects) {
                        const revertMsg = window.WeatherEffects.getWeatherRevertMessage(this);
                        logs.push(revertMsg);
                    } else {
                        const envWeatherNames = {
                            'rain': '雨天', 'sun': '晴天', 'sandstorm': '沙暴',
                            'snow': '雪天', 'hail': '冰雹', 'smog': '烟霾'
                        };
                        const envName = envWeatherNames[this.environmentWeather] || this.environmentWeather;
                        logs.push(`<span style="color:#9b59b6">🌍 环境天气回归：${envName}！</span>`);
                    }
                    console.log(`[ENVIRONMENT] 回归环境天气: ${this.environmentWeather}`);
                    
                    // 更新天气视觉效果
                    if (typeof window !== 'undefined' && window.setWeatherVisuals) {
                        window.setWeatherVisuals(this.environmentWeather);
                    }
                } else {
                    this.weather = null;
                    // 更新天气视觉效果
                    if (typeof window !== 'undefined' && window.setWeatherVisuals) {
                        window.setWeatherVisuals('none');
                    }
                }
            }
        }
        
        // =========================================================
        // 【修复】场地回合递减 (Terrain)
        // 【Ambrosia】神之琼浆天气下，精神场地和薄雾场地无限持续
        // =========================================================
        if (this.terrainTurns && this.terrainTurns > 0) {
            // 【Ambrosia 无限场地】检查是否跳过递减
            let skipTerrainDecrement = false;
            if (typeof window.WeatherEffects !== 'undefined' && window.WeatherEffects.isTerrainInfinite) {
                if (window.WeatherEffects.isTerrainInfinite(this.weather, this.terrain)) {
                    skipTerrainDecrement = true;
                    console.log(`[AMBROSIA] 🌈 无限场地：${this.terrain} 在神之琼浆中永久持续`);
                }
            }
            
            if (!skipTerrainDecrement) {
                this.terrainTurns--;
                console.log(`[TERRAIN] 场地回合递减: ${this.terrainTurns + 1} -> ${this.terrainTurns}`);
                if (this.terrainTurns === 0) {
                    const terrainNames = {
                        'electricterrain': '电气场地消失了。',
                        'grassyterrain': '青草场地消失了。',
                        'psychicterrain': '精神场地消失了。',
                        'mistyterrain': '薄雾场地消失了。'
                    };
                    const msg = terrainNames[this.terrain] || '场地效果消失了。';
                    logs.push(`🌿 ${msg}`);
                    console.log(`[TERRAIN] 场地结束: ${this.terrain}`);
                    this.terrain = null;
                }
            }
        }
        
        return logs;
    }
    
    // 从 AI JSON 初始化敌方
    loadFromJSON(json) {
        const enemyObj = json.enemy || json.trainer || {};

        const typeLabel = typeof enemyObj.type === 'string' ? enemyObj.type.trim() : '';
        const nameId = typeof enemyObj.name === 'string' ? enemyObj.name.trim() : '';

        const isWild = (typeLabel.toLowerCase() === 'wild') || (!nameId && !enemyObj.type);

        let imgId = 'wild';
        if (!isWild) {
            imgId = enemyObj.id || nameId || 'wild';
        }

        let displayName = nameId;
        if (isWild && !displayName) displayName = "Wild Pokemon";
        if (!displayName) displayName = "Unknown";

        const lines = enemyObj.lines || {};

        this.trainer = {
            name: displayName,
            title: typeLabel || '',
            id: imgId,
            lines: {
                start: lines.start || enemyObj.line || "",
                win: lines.win || "",
                lose: lines.lose || "",
                escape: lines.escape || ""
            }
        };

        this.scriptedResult = json.script || null;
        const rawDiff = (json.ai || json.difficulty || enemyObj.difficulty || '').toString().toLowerCase();
        if (rawDiff) {
            this.aiDifficulty = rawDiff;
        } else {
            this.aiDifficulty = isWild ? 'easy' : 'normal';
        }
        const trainerNameLower = (displayName || '').toLowerCase();
        if (/cynthia|red|steven|champion/.test(trainerNameLower)) {
            this.aiDifficulty = 'hard';
        }
        
        // 【修复】读取敌方训练家熟练度，用于敌方 AI 对冲触发概率
        // JSON 格式: enemy.trainerProficiency (0-255)
        // 根据 enable_proficiency_cap 解锁状态限制上限：false=155, true=255
        // 注意：敌方的 unlocks 在后面解析，这里先预读取
        const enemyProficiencyCapUnlocked = (json.unlocks || enemyObj.unlocks || {}).enable_proficiency_cap === true;
        if (enemyObj.trainerProficiency !== undefined) {
            const enemyProficiencyCap = enemyProficiencyCapUnlocked ? 255 : 155;
            this.enemyTrainerProficiency = Math.min(enemyProficiencyCap, Math.max(0, enemyObj.trainerProficiency));
            console.log(`[ENEMY PROFICIENCY] 敌方训练家熟练度: ${this.enemyTrainerProficiency} (上限: ${enemyProficiencyCap})`);
        } else {
            this.enemyTrainerProficiency = 0;
        }
        
        let rawParty = [];
        if (Array.isArray(json.party)) {
            rawParty.push(...json.party);
        }
        if (Array.isArray(enemyObj.party)) {
            rawParty.push(...enemyObj.party);
        }
        if (rawParty.length === 0 && Array.isArray(json.enemyParty)) {
            rawParty.push(...json.enemyParty);
        }
        if (rawParty.length > 6) {
            rawParty = rawParty.slice(0, 6);
        }

        const validPartyData = [];
        for (const p of rawParty) {
            const seed = (p?.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            if (!seed) continue;
            validPartyData.push(p);
        }

        if (validPartyData.length === 0) {
            console.warn("[PKM] Warn: No valid pokemon found in enemy party. Adding fallback.");
            validPartyData.push({ name: 'Magikarp', lv: 5, moves: ['Splash'] });
        }

        // === 敌方解锁系统 (Enemy Unlock System) ===
        // 解析 unlocks 对象，决定 NPC 是否有资格使用各机制
        // unlocks 可以在 json.unlocks 或 enemyObj.unlocks 中
        const enemyUnlocksRaw = json.unlocks || enemyObj.unlocks || {};
        this.enemyUnlocks = {
            enable_bond: enemyUnlocksRaw.enable_bond === true,        // 羁绊共鸣 (默认关闭)
            enable_styles: enemyUnlocksRaw.enable_styles === true,    // 刚猛/迅疾 (默认关闭)
            enable_insight: enemyUnlocksRaw.enable_insight === true,  // 心眼/AVs突破155上限 (默认关闭)
            enable_mega: enemyUnlocksRaw.enable_mega === true,        // Mega进化 (默认关闭)
            enable_z_move: enemyUnlocksRaw.enable_z_move === true,    // Z招式 (默认关闭)
            enable_dynamax: enemyUnlocksRaw.enable_dynamax === true,  // 极巨化 (默认关闭)
            enable_tera: enemyUnlocksRaw.enable_tera === true,        // 太晶化 (默认关闭)
            enable_proficiency_cap: enemyUnlocksRaw.enable_proficiency_cap === true  // 训练度突破155上限 (默认关闭)
        };
        console.log('[UNLOCK] 敌方解锁状态:', this.enemyUnlocks);

        // 检查敌方训练家是否有 Mega 权限
        // 优先使用 unlocks.enable_mega，其次检查 canMega 字段或 Boss 名称
        // (trainerNameLower 已在上面定义)
        const isBossTrainer = /cynthia|red|steven|champion|elite|leader|boss/.test(trainerNameLower);
        const enemyCanMega = this.enemyUnlocks.enable_mega || 
            (enemyObj.canMega !== false && (enemyObj.canMega === true || isBossTrainer));
        
        this.enemyParty = validPartyData.map(p => {
            // 使用新版构造方式：传入完整配置对象
            const poke = new Pokemon(p);
            
            // 【修复】即使 enemyCanMega=false，如果宝可梦有 mechanic='dynamax'，也需要检测形态
            // autoDetectMegaEligibility 不仅处理 Mega，还处理 Dynamax/GMax 形态
            const needsFormDetection = (enemyCanMega && !isWild) || 
                poke.mechanic === 'dynamax' || 
                poke.mechanic === 'tera' ||
                poke.canDynamax;
            
            if (needsFormDetection) {
                console.log('[FORM] Enemy: Calling autoDetectMegaEligibility for', poke.name, 'mechanic:', poke.mechanic);
                autoDetectMegaEligibility(poke, p.mega || null);
                console.log('[FORM] Enemy after detection:', poke.name, 'canMegaEvolve:', poke.canMegaEvolve, 'canDynamax:', poke.canDynamax, 'megaTargetId:', poke.megaTargetId);
            }
            return poke;
        });
        
        // 【isLead 首发逻辑】检查是否有标记为 isLead 的宝可梦，自动将其移到第一位
        const leadIndex = this.enemyParty.findIndex(p => p.isLead === true);
        if (leadIndex > 0) {
            // 找到 isLead=true 的宝可梦且不在第一位，将其与第一位交换
            const leadPokemon = this.enemyParty[leadIndex];
            this.enemyParty[leadIndex] = this.enemyParty[0];
            this.enemyParty[0] = leadPokemon;
            console.log(`[LEAD] Enemy: ${leadPokemon.cnName} (${leadPokemon.name}) marked as isLead, swapped to first position`);
        } else if (leadIndex === 0) {
            console.log(`[LEAD] Enemy: ${this.enemyParty[0].cnName} is already in first position with isLead=true`);
        } else {
            console.log('[LEAD] Enemy: No Pokémon marked as isLead, using default order');
        }
        
        // 【调试】打印敌方队伍初始化状态
        console.log('[ENEMY PARTY] Loaded', this.enemyParty.length, 'Pokemon:');
        this.enemyParty.forEach((p, i) => {
            console.log(`  [${i}] ${p.cnName} (${p.name}) - HP: ${p.currHp}/${p.maxHp}, isAlive: ${p.isAlive()}`);
        });
        
        this.enemyActive = 0;
        this.enemyMegaUsed = false;

        if (isWild && this.enemyParty.length > 0) {
            this.trainer.name = this.enemyParty[0].cnName;
        }

        this.phase = 'battle';
    }
    
    // 设置玩家队伍
    // 【修复】canMega 只控制 Mega 进化，但极巨化/太晶化等需要单独检查
    setPlayerParty(partyData, canMega = true) {
        console.log('[MEGA] setPlayerParty called, canMega:', canMega, 'partyData:', partyData);
        this.playerParty = partyData.map(p => {
            // 使用新版构造方式：传入完整配置对象
            // AVs 应该在 pkm-tavern-plugin.js 中处理 (AVl/AVup 格式)
            const poke = new Pokemon(p);
            
            // 【修复】即使 canMega=false，如果宝可梦有 mechanic='dynamax'，也需要检测形态
            // autoDetectMegaEligibility 不仅处理 Mega，还处理 Dynamax/GMax 形态
            const needsFormDetection = canMega || 
                poke.mechanic === 'dynamax' || 
                poke.mechanic === 'tera' ||
                poke.canDynamax;
            
            if (needsFormDetection) {
                console.log('[FORM] Calling autoDetectMegaEligibility for', poke.name, 'with mega flag:', p.mega, 'mechanic:', poke.mechanic);
                autoDetectMegaEligibility(poke, p.mega || null);
                console.log('[FORM] After detection:', poke.name, 'canMegaEvolve:', poke.canMegaEvolve, 'canDynamax:', poke.canDynamax, 'megaTargetId:', poke.megaTargetId);
            }
            return poke;
        });
        
        // 【isLead 首发逻辑】检查是否有标记为 isLead 的宝可梦，自动将其移到第一位
        const leadIndex = this.playerParty.findIndex(p => p.isLead === true);
        if (leadIndex > 0) {
            // 找到 isLead=true 的宝可梦且不在第一位，将其与第一位交换
            const leadPokemon = this.playerParty[leadIndex];
            this.playerParty[leadIndex] = this.playerParty[0];
            this.playerParty[0] = leadPokemon;
            console.log(`[LEAD] ${leadPokemon.cnName} (${leadPokemon.name}) marked as isLead, swapped to first position`);
        } else if (leadIndex === 0) {
            console.log(`[LEAD] ${this.playerParty[0].cnName} is already in first position with isLead=true`);
        } else {
            console.log('[LEAD] No Pokémon marked as isLead, using default order');
        }
        
        this.playerActive = 0;
        this.playerMegaUsed = false;
    }
    
    // 获取当前出战
    getPlayer() { return this.playerParty[this.playerActive]; }
    getEnemy() { return this.enemyParty[this.enemyActive]; }
    
    // 检查胜负
    // 【官方规则】同命导致的双杀，使用同命者输
    checkBattleEnd() {
        const playerAlive = this.playerParty.some(p => p.isAlive());
        const enemyAlive = this.enemyParty.some(p => p.isAlive());
        
        console.log(`[checkBattleEnd] playerAlive: ${playerAlive}, enemyAlive: ${enemyAlive}, destinyBondCauser: ${this.destinyBondCauser}`);
        
        // 双方都没有存活的宝可梦 -> 需要判断谁输
        if (!playerAlive && !enemyAlive) {
            // 【同命规则】如果是同命导致的双杀，使用同命者输
            // destinyBondCauser 记录了谁使用了同命导致双杀
            if (this.destinyBondCauser === 'enemy') {
                // 敌方使用同命导致双杀 -> 敌方输 -> 玩家赢
                console.log('[BATTLE END] 同命双杀：敌方使用同命，敌方输');
                return 'win';
            } else if (this.destinyBondCauser === 'player') {
                // 玩家使用同命导致双杀 -> 玩家输
                console.log('[BATTLE END] 同命双杀：玩家使用同命，玩家输');
                return 'loss';
            }
            // 其他双杀情况（如大爆炸）：攻击者输
            // 默认：玩家输（保守判定）
            console.log('[BATTLE END] 双杀：默认玩家输');
            return 'loss';
        }
        
        if (!playerAlive) return 'loss';
        if (!enemyAlive) return 'win';
        return null;
    }
    
    // 找下一个存活的敌方
    nextAliveEnemy() {
        // 重置当前敌方的能力等级
        const currentEnemy = this.enemyParty[this.enemyActive];
        if (currentEnemy && typeof currentEnemy.resetBoosts === 'function') {
            currentEnemy.resetBoosts();
        }
        
        // 调试：打印所有敌方宝可梦的状态
        console.log('[nextAliveEnemy] Current active:', this.enemyActive);
        this.enemyParty.forEach((p, i) => {
            console.log(`[nextAliveEnemy] Enemy ${i}: ${p.cnName}, HP: ${p.currHp}/${p.maxHp}, isAlive: ${p.isAlive()}`);
        });
        
        // ============================================
        // 智能换人：Expert/Hard 难度使用 Revenge Killer 逻辑
        // ============================================
        const difficulty = this.aiDifficulty || 'hard';
        if ((difficulty === 'expert' || difficulty === 'hard') && 
            typeof window !== 'undefined' && typeof window.getBestRevengeKiller === 'function') {
            const playerPoke = this.getPlayer();
            if (playerPoke && playerPoke.isAlive()) {
                const smartIdx = window.getBestRevengeKiller(this.enemyParty, playerPoke, this.enemyActive);
                if (smartIdx !== -1 && smartIdx !== this.enemyActive && 
                    this.enemyParty[smartIdx] && this.enemyParty[smartIdx].isAlive()) {
                    console.log(`[nextAliveEnemy] Smart switch: choosing index ${smartIdx} (Revenge Killer)`);
                    this.enemyActive = smartIdx;
                    return true;
                }
            }
        }
        
        // Fallback: 线性查找下一个存活的
        const idx = this.enemyParty.findIndex((p, i) => i !== this.enemyActive && p.isAlive());
        console.log('[nextAliveEnemy] Found next alive at index:', idx);
        if (idx !== -1) this.enemyActive = idx;
        return idx !== -1;
    }
    
    // 找下一个存活的玩家
    nextAlivePlayer() {
        const idx = this.playerParty.findIndex((p, i) => i !== this.playerActive && p.isAlive());
        if (idx !== -1) this.playerActive = idx;
        this.phase = 'battle';
    }
}

/* =============================================================
 *  BATTLE AI - 已迁移到 ai-engine.js
 *  保留此注释以标记 AI 逻辑的新位置
 * ============================================================= */

// 导出
window.TYPE_CHART = TYPE_CHART;
window.NATURE_MODIFIERS = NATURE_MODIFIERS;
window.getTypeEffectiveness = getTypeEffectiveness;
window.getPokemonData = getPokemonData;
window.getMoveData = getMoveData;
window.calcStats = calcStats;
window.Pokemon = Pokemon;
// calcDamage 已迁移到 battle/battle-calc.js，由 src/globals.js 挂载
// applyMoveSecondaryEffects 已迁移到 battle/battle-effects.js，由该文件自行挂载
window.BattleState = BattleState;
window.checkCanMove = checkCanMove;
window.clearVolatileStatus = clearVolatileStatus;
// applyEntryHazards 和 tickVolatileStatus 已在 move-effects.js 中导出为 MoveEffects.xxx
// window.getAiMove - 已迁移到 ai-engine.js
