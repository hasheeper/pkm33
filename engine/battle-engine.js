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
function extractBaseFormId(name = '') {
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
function resolveSpriteId(name = '') {
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
function getFallbackSpriteId(name = '') {
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
const NATURE_MODIFIERS = {
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
const TYPE_CHART = {
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
function getTypeEffectiveness(atkType, defTypes, moveName = '') {
    const chart = TYPE_CHART[atkType];
    if (!chart) return 1;
    
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
function normalizePokemonName(rawName) {
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
function getPokemonData(name) {
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
function getMoveData(name) {
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
function calcStats(baseStats, level, options = {}) {
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
class Pokemon {
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
        this.maxHp = stats.hp;
        this.currHp = stats.hp;
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
            return { name: md.name, cn: cnName, type: md.type, power: md.power || 0, cat: md.cat || 'phys' };
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
        // 【平衡调整】降低概率，每只宝可梦每场战斗只能触发一次
        // Trust >= 200: 35% 概率触发（原 50%）
        // Trust >= 150: 20% 概率触发（原 30%）
        // Trust >= 100: 10% 概率触发（原 15%）
        // 只有 isAce=true 的宝可梦才能触发 AVs 被动
        if (this.isAce && this.avs && this.avs.trust > 0 && dmg >= this.currHp && !this.avsTriggered?.trustEndure) {
            let triggerChance = 0;
            const baseTrust = this.getEffectiveAVs('trust');
            const effectiveTrust = this.avsEvolutionBoost ? baseTrust * 2 : baseTrust;
            if (effectiveTrust >= 200) triggerChance = 0.35;      // 削弱：50% -> 35%
            else if (effectiveTrust >= 150) triggerChance = 0.20; // 削弱：30% -> 20%
            else if (effectiveTrust >= 100) triggerChance = 0.10; // 削弱：15% -> 10%
            
            if (triggerChance > 0 && Math.random() < triggerChance) {
                this.currHp = 1;
                this.avsTriggered.trustEndure = true; // 每场战斗只能触发一次
                this.trustEndureTriggered = true; // 标记用于日志
                console.log(`[AVs] ${this.cnName} 的 Trust 守护发动！(Chance: ${Math.round(triggerChance * 100)}%, Trust: ${baseTrust}${this.avsEvolutionBoost ? ' x2' : ''})`);
                return; // 不执行后续扣血
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
        
        this.currHp = Math.max(0, this.currHp - dmg);
    }
    
    // 回复
    heal(amount) {
        this.currHp = Math.min(this.maxHp, this.currHp + amount);
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
 * 伤害计算 (含能力等级修正、命中判定、多段攻击、暴击率)
 * @param {Pokemon} attacker 
 * @param {Pokemon} defender 
 * @param {object} move - { type, power, cat, accuracy }
 * @returns {object} - { damage, effectiveness, isCrit, miss, hitCount, blocked }
 */
function calcDamage(attacker, defender, move) {
    // 获取完整技能数据
    const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const fullMoveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
    const accuracy = move.accuracy ?? fullMoveData.accuracy;
    let category = fullMoveData.category || (move.cat === 'spec' ? 'Special' : (move.cat === 'phys' ? 'Physical' : 'Status'));
    let basePower = move.power ?? fullMoveData.basePower ?? 0;
    
    // =====================================================
    // === 【极巨化/Z招式威力修正补丁】 ===
    // =====================================================
    // 数据库中 G-Max 专属招式和部分通用 Max 招式的 basePower 被设为 10
    // 这会导致刮痧（超低伤害），需要强制修正
    const moveName = move.name || '';
    const isMaxMoveName = moveName.startsWith('Max ') || moveName.startsWith('G-Max ');
    const isZMoveName = moveName.includes('10,000,000') || 
                        moveName.includes('Catastropika') || 
                        moveName.includes('Stoked Sparksurfer') ||
                        moveName.includes('Pulverizing Pancake') ||
                        (fullMoveData.isZ && basePower < 100);
    
    if (isMaxMoveName && basePower < 100) {
        // G-Max 专属招式通常 130-160，通用 Max 招式 90-140
        // 根据原技能威力推算，这里统一给 130 作为合理默认值
        const oldPower = basePower;
        basePower = 130;
        console.warn(`[ENGINE FIX] Max/G-Max 威力修正: ${moveName} (${oldPower} -> ${basePower})`);
    }
    
    if (isZMoveName && basePower < 100) {
        // Z 招式威力通常 160-200
        const oldPower = basePower;
        basePower = 180;
        console.warn(`[ENGINE FIX] Z-Move 威力修正: ${moveName} (${oldPower} -> ${basePower})`);
    }
    
    // =====================================================
    // === 【Tera Blast 特判】 ===
    // =====================================================
    // Tera Blast 默认是普通系 80 威力特殊招式
    // 太晶化后：
    // 1. 属性变为太晶属性
    // 2. 分类根据攻击者的 Atk vs SpA 决定
    if (moveName === 'Tera Blast' && attacker.isTerastallized) {
        // 改属性：变为太晶属性
        move.type = attacker.teraType;
        
        // 改分类：比较物攻和特攻，高者决定分类
        const atkStat = attacker.getStat ? attacker.getStat('atk') : attacker.atk;
        const spaStat = attacker.getStat ? attacker.getStat('spa') : attacker.spa;
        
        if (atkStat > spaStat) {
            move.cat = 'phys';
            category = 'Physical';
        } else {
            move.cat = 'spec';
            category = 'Special';
        }
        
        console.log(`[TERA BLAST] ${attacker.name} 使用 Tera Blast: 属性=${move.type}, 分类=${category} (Atk=${atkStat}, SpA=${spaStat})`);
    }
    
    // === 策略模式：检查是否有特殊处理器 ===
    const handler = (typeof getMoveHandler === 'function') ? getMoveHandler(move.name) : null;
    
    // === 固定伤害技能 (damageCallback) ===
    if (handler && handler.damageCallback) {
        const fixedDamage = handler.damageCallback(attacker, defender);
        return { 
            damage: fixedDamage, 
            effectiveness: 1, 
            isCrit: false, 
            miss: false, 
            hitCount: 1,
            fixedDamage: true
        };
    }
    
    // === 动态威力技能 (basePowerCallback) ===
    if (handler && handler.basePowerCallback) {
        basePower = handler.basePowerCallback(attacker, defender);
    }
    
    // === 特性威力加成 Hook (技师、猛火、激流等) ===
    if (typeof AbilityHandlers !== 'undefined' && attacker.ability && AbilityHandlers[attacker.ability]) {
        const ah = AbilityHandlers[attacker.ability];
        if (ah.onBasePower) {
            basePower = ah.onBasePower(basePower, attacker, defender, move);
        }
    }
    
    // === Mirror Coat / Counter 简化处理：转为普通攻击 ===
    if (move.name === 'Mirror Coat') {
        basePower = 100;
        move.cat = 'spec';
    } else if (move.name === 'Counter') {
        basePower = 80;
        move.cat = 'phys';
    }
    
    // === Protect/Detect 守住判定 ===
    // 如果防御方处于守住状态，且这是一个针对性攻击（非变化技）
    if (defender.volatile && defender.volatile.protect && basePower > 0) {
        // 某些技能可以贯穿守住 (Feint, Phantom Force 等)，这里暂不处理
        return { damage: 0, effectiveness: 0, isCrit: false, miss: false, hitCount: 0, blocked: true };
    }
    
    // === 特性免疫判定 Hook (漂浮、避雷针、引火等) ===
    if (typeof AbilityHandlers !== 'undefined' && defender.ability && AbilityHandlers[defender.ability]) {
        const ahDef = AbilityHandlers[defender.ability];
        if (ahDef.onImmunity && ahDef.onImmunity(move.type)) {
            return { damage: 0, effectiveness: 0, isCrit: false, miss: false, hitCount: 0, blocked: true, abilityImmune: defender.ability };
        }
    }
    
    // 变化技不造成伤害，但需要命中判定
    if (basePower === 0 || category === 'Status') {
        // 变化技命中判定
        let statusAcc = (accuracy === true || accuracy === undefined) ? 100 : accuracy;
        const accStage = attacker.boosts.accuracy;
        const evaStage = defender.boosts.evasion;
        const finalStage = Math.min(6, Math.max(-6, accStage - evaStage));
        let accMult = 1.0;
        if (finalStage >= 0) accMult = (3 + finalStage) / 3;
        else accMult = 3 / (3 + Math.abs(finalStage));
        const finalAcc = statusAcc * accMult;
        
        // 必中技能 (accuracy === true 或 undefined) 跳过判定
        if (statusAcc < 100 && Math.random() * 100 >= finalAcc) {
            return { damage: 0, effectiveness: 1, isCrit: false, miss: true, hitCount: 0 };
        }
        return { damage: 0, effectiveness: 1, isCrit: false, miss: false, hitCount: 0 };
    }
    
    // === 命中判定 ===
    let moveAcc = (accuracy === true || accuracy === undefined) ? 100 : accuracy;
    
    // 命中/闪避修正公式：以 3 为基准
    const accStage = attacker.boosts.accuracy;
    const evaStage = defender.boosts.evasion;
    const finalStage = Math.min(6, Math.max(-6, accStage - evaStage));
    
    let accMult = 1.0;
    if (finalStage >= 0) accMult = (3 + finalStage) / 3;
    else accMult = 3 / (3 + Math.abs(finalStage));
    
    let hitRate = moveAcc * accMult;
    
    // =====================================================
    // === 必中判定：Z 招式和极巨招式豁免 ===
    // =====================================================
    // Z 招式和极巨招式是必中的，无视回避率提升
    const isZMove = move.isZ || (move.name && (
        move.name.includes('10,000,000') ||
        move.name.includes('Catastropika') ||
        move.name.includes('Breakneck Blitz') ||
        move.name.includes('Inferno Overdrive') ||
        move.name.includes('Hydro Vortex') ||
        move.name.includes('Gigavolt Havoc')
    ));
    const isMaxMove = move.isMax || (move.name && (
        move.name.startsWith('Max ') ||
        move.name.startsWith('G-Max ')
    ));
    const isSureHit = isZMove || isMaxMove || accuracy === true;
    
    // =====================================================
    // === Insight 奇迹闪避 (Miracle Dodge) ===
    // =====================================================
    // 极高 Insight (250+) 可以有小概率闪避必中招式
    // 这是 RP 叙事的"规则级闪避"，代表极致的第六感
    if (isSureHit && defender.isAce && defender.avs && defender.avs.insight >= 250) {
        const baseInsight = defender.getEffectiveAVs('insight');
        const effectiveInsight = defender.avsEvolutionBoost ? baseInsight * 2 : baseInsight;
        // 255 满值 = 10% 奇迹闪避，250-254 = 5%
        const miracleChance = effectiveInsight >= 255 ? 10 : 5;
        
        if (Math.random() * 100 < miracleChance) {
            console.log(`[Insight] MIRACLE DODGE TRIGGERED! Bypassed Sure-Hit.`);
            return {
                damage: 0,
                effectiveness: 0,
                isCrit: false,
                miss: true,
                hitCount: 0,
                insightMiracle: true // 标记为奇迹闪避
            };
        }
    }
    
    // =====================================================
    // === AVs: Insight (灵犀) - Sixth Sense 闪避加成 ===
    // =====================================================
    // 【平衡调整 v2】进一步削弱闪避加成，设置上限
    // Insight >= 200: 命中率 -8%（原 -10%）
    // Insight >= 150: 命中率 -5%（原 -7%）
    // Insight >= 100: 命中率 -2%（原 -3%）
    // 【上限】最终命中率不低于 70%（防止闪避流过于变态）
    // 只有 isAce=true 的宝可梦才能触发 AVs 被动
    // 【修复】Z 招式和极巨招式是必中的，不受 Insight 影响
    if (defender.isAce && defender.avs && defender.avs.insight > 0 && !isSureHit) {
        let evasionBonus = 0;
        const baseInsight = defender.getEffectiveAVs('insight');
        const effectiveInsight = defender.avsEvolutionBoost ? baseInsight * 2 : baseInsight;
        if (effectiveInsight >= 200) evasionBonus = 8;      // 削弱：10% -> 8%
        else if (effectiveInsight >= 150) evasionBonus = 5; // 削弱：7% -> 5%
        else if (effectiveInsight >= 100) evasionBonus = 2; // 削弱：3% -> 2%
        // 【上限】最终命中率不低于 70%，防止闪避流过于变态
        hitRate = Math.max(70, hitRate - evasionBonus);
    }
    
    // 检测是否 Miss (必中类不需要检定)
    if (typeof accuracy === 'number' && !isSureHit) {
        if (Math.random() * 100 > hitRate) {
            return { damage: 0, effectiveness: 0, isCrit: false, miss: true, hitCount: 0, insightDodge: defender.avs?.insight >= 100 };
        }
    }
    
    // === 多段攻击 (Multi-Hit) ===
    let hitCount = 1;
    const multihit = fullMoveData.multihit;
    if (multihit) {
        if (Array.isArray(multihit)) {
            // 随机次数 [min, max]，如 [2, 5]
            // 概率分布：2次=1/3, 3次=1/3, 4次=1/6, 5次=1/6 (简化为均匀分布)
            const [min, max] = multihit;
            hitCount = Math.floor(Math.random() * (max - min + 1)) + min;
        } else {
            // 固定次数，如 multihit: 2 (双重劈) 或 3 (水流连打)
            hitCount = multihit;
        }
    }
    
    // === 选择攻击/防御能力 (使用 getStat 获取修正后数值) ===
    const isSpecial = (move.cat === 'spec' || category === 'Special');
    let atkStat = isSpecial ? attacker.getStat('spa') : attacker.getStat('atk');
    let defStat = isSpecial ? defender.getStat('spd') : defender.getStat('def');
    
    // === 【纯朴 Unaware】特性处理 ===
    // 攻击方有纯朴：忽略防御方的防御/特防提升
    // 防御方有纯朴：忽略攻击方的攻击/特攻提升
    if (typeof AbilityHandlers !== 'undefined') {
        const attackerHandler = attacker.ability ? AbilityHandlers[attacker.ability] : null;
        const defenderHandler = defender.ability ? AbilityHandlers[defender.ability] : null;
        
        // 攻击方纯朴：忽略防御方的防御提升，使用基础防御值
        if (attackerHandler && attackerHandler.ignoreDefenderBoosts) {
            const baseDefStat = isSpecial ? defender.spd : defender.def;
            if (defStat > baseDefStat) {
                console.log(`[UNAWARE] ${attacker.cnName} 的纯朴无视了 ${defender.cnName} 的防御提升`);
                defStat = baseDefStat;
            }
        }
        
        // 防御方纯朴：忽略攻击方的攻击提升，使用基础攻击值
        if (defenderHandler && defenderHandler.ignoreAttackerBoosts) {
            const baseAtkStat = isSpecial ? attacker.spa : attacker.atk;
            if (atkStat > baseAtkStat) {
                console.log(`[UNAWARE] ${defender.cnName} 的纯朴无视了 ${attacker.cnName} 的攻击提升`);
                atkStat = baseAtkStat;
            }
        }
    }
    
    // === 策略模式：特殊攻防计算 (Foul Play, Body Press, Psyshock 等) ===
    if (handler && handler.modifyAtk) {
        atkStat = handler.modifyAtk(attacker, defender, isSpecial);
    }
    if (handler && handler.modifyDef) {
        defStat = handler.modifyDef(attacker, defender, isSpecial);
    }
    
    // === 灼伤减半物攻 (Burn halves physical attack) ===
    if (!isSpecial && attacker.status === 'brn') {
        atkStat = Math.floor(atkStat * 0.5);
    }
    
    // === 防御方属性判定修正 ===
    // 常规太晶：防御属性 = teraType
    // 星晶太晶：防御属性 = 原始属性 (不改变防御属性)
    let defensiveTypes = defender.types || ['Normal'];
    
    if (defender.isTerastallized) {
        if (defender.teraType === 'Stellar') {
            // 星晶防御特殊化：用回原属性
            defensiveTypes = defender.originalTypes || defender.types;
            console.log(`[STELLAR] ${defender.name} 是星晶状态，防御属性回归为: ${defensiveTypes.join('/')}`);
        } else {
            // 常规太晶：用太晶属性
            defensiveTypes = [defender.teraType];
        }
    }
    
    // 属性克制（传入技能名用于特殊克制规则如 Freeze-Dry）
    let effectiveness = getTypeEffectiveness(move.type, defensiveTypes, move.name);
    
    // =====================================================
    // === 本系加成 (STAB) - 支持太晶化双轨制 + 星晶特殊逻辑 ===
    // =====================================================
    let stab = 1;
    
    if (attacker.isTerastallized) {
        const teraType = attacker.teraType;
        const originalTypes = attacker.originalTypes || [];
        const moveType = move.type;
        
        // --- ★ 星晶 (Stellar) 特殊逻辑 ---
        if (teraType === 'Stellar') {
            // 星晶逻辑1：原始本系招式，加成提升到 2.0x (原1.5 -> 2.0)
            if (originalTypes.includes(moveType)) {
                stab = 2.0; 
                console.log(`[STELLAR STAB] ${attacker.name} 原生本系强化 (${moveType}) -> 2.0x`);
            } 
            // 星晶逻辑2：非本系招式，获得 1.2x 加成
            else {
                stab = 1.2;
                console.log(`[STELLAR STAB] ${attacker.name} 星晶全能强化 (${moveType}) -> 1.2x`);
            }

            // 星晶逻辑3：太晶爆发 (Tera Blast) 永远是 2.0x
            if (move.name === 'Tera Blast') {
                stab = 2.0; 
            }
        } 
        // --- 常规太晶逻辑 (双轨制) ---
        else {
            // 轨道1 (Tera Track): 技能属性 == 太晶属性
            let teraTrackBonus = 0;
            if (moveType === teraType) {
                teraTrackBonus = 1.5;
                // 适应力爆发：太晶属性 == 原始属性之一 -> 2.0倍
                if (originalTypes.includes(teraType)) {
                    teraTrackBonus = 2.0;
                }
            }
            
            // 轨道2 (Recall Track): 技能属性 == 原始属性之一（回溯 STAB）
            let recallTrackBonus = 0;
            if (originalTypes.includes(moveType)) {
                recallTrackBonus = 1.5;
            }
            
            // 取两个轨道的最高值
            stab = Math.max(teraTrackBonus, recallTrackBonus, 1);
            
            if (stab > 1) {
                console.log(`[TERA STAB] ${attacker.name} (Tera: ${teraType}, Original: ${originalTypes.join('/')}) 使用 ${moveType} 招式, STAB: ${stab}x`);
            }
        }
    } else {
        // 普通状态：标准 STAB
        stab = attacker.types.includes(move.type) ? 1.5 : 1;
    }
    
    // === 适应力特性 Hook (STAB 1.5 -> 2.0) ===
    // 注意：太晶化的适应力爆发已在上面处理，这里只处理非太晶状态
    if (!attacker.isTerastallized && stab > 1 && attacker.ability === 'Adaptability') {
        stab = 2;
    }
    
    // ============================================
    // ★ 星晶太晶爆发 (Tera Blast - Stellar) 特判
    // ============================================
    if (attacker.isTerastallized && attacker.teraType === 'Stellar' && move.name === 'Tera Blast') {
        // 效果1: 对【已太晶化】的敌人，无视属性，恒定造成克制伤害
        if (defender.isTerastallized) {
            console.log(`[STELLAR KILLER] 星晶爆发击中了太晶化的对手！强制效果拔群。`);
            // 覆盖之前的属性克制计算结果，强制 2.0x
            effectiveness = 2.0; 
        } else {
            // 对未太晶化的敌人：伤害变为中性 (1.0)，但会降低自身攻防（在 move-handlers 处理）
            if (effectiveness < 1 && effectiveness > 0) {
                effectiveness = 1;
            }
        }
    }
    
    // === 会心一击判定 ===
    let isCrit = false;
    // 必定暴击技能：从 MOVES 数据的 willCrit 字段判断（数据驱动）
    if (fullMoveData.willCrit) {
        isCrit = true;
    } else {
        // 根据 critRatio 计算暴击率
        // critRatio: 1 = 1/24 (~4.17%), 2 = 1/8 (12.5%), 3 = 1/2 (50%), 4+ = 100%
        let critRatio = fullMoveData.critRatio || 1;
        
        // =====================================================
        // === AVs: Passion (激情) - Adrenaline Rush 暴击加成 ===
        // =====================================================
        // 【平衡调整】降低暴击等级加成
        // Passion >= 200: critRatio +1（原 +2，约 50% 暴击率）
        // Passion >= 150: critRatio +0.5（原 +1，约 25% 暴击率）
        // Passion >= 100: critRatio +0（原 +0.5，仅保留基础概率）
        // 只有 isAce=true 的宝可梦才能触发 AVs 被动
        if (attacker.isAce && attacker.avs && attacker.avs.passion > 0) {
            const basePassion = attacker.getEffectiveAVs('passion');
            const effectivePassion = attacker.avsEvolutionBoost ? basePassion * 2 : basePassion;
            if (effectivePassion >= 200) critRatio += 1;       // 削弱：+2 -> +1
            else if (effectivePassion >= 150) critRatio += 0.5; // 削弱：+1 -> +0.5
            // 100+ 不再有加成
        }
        
        let critChance = 1 / 24; // 默认 ~4.17%
        if (critRatio >= 2 && critRatio < 3) critChance = 1 / 8;
        else if (critRatio >= 3 && critRatio < 4) critChance = 1 / 2;
        else if (critRatio >= 4) critChance = 1;
        if (Math.random() < critChance) isCrit = true;
    }
    const critMod = isCrit ? 1.5 : 1;
    
    // 乱数 (0.85 ~ 1.0)
    const random = 0.85 + Math.random() * 0.15;
    
    // 防止除以0
    const finalDef = Math.max(1, defStat);
    
    // 伤害公式 (单次伤害)
    // Damage = ((2*Level/5 + 2) * Power * A/D / 50 + 2) * Modifiers
    let singleHitDamage = Math.floor(
        ((2 * attacker.level / 5 + 2) * basePower * (atkStat / finalDef) / 50 + 2)
        * stab * effectiveness * critMod * random
    );
    
    // 最低伤害 1 (除非免疫)
    if (effectiveness > 0 && singleHitDamage < 1) singleHitDamage = 1;
    
    // 免疫时伤害为 0
    if (effectiveness === 0) singleHitDamage = 0;
    
    // === 防御方特性伤害修正 Hook (厚脂肪、多重鳞片、滤镜等) ===
    if (typeof AbilityHandlers !== 'undefined' && defender.ability && AbilityHandlers[defender.ability]) {
        const ahDef = AbilityHandlers[defender.ability];
        if (ahDef.onDefenderModifyDamage) {
            singleHitDamage = ahDef.onDefenderModifyDamage(singleHitDamage, attacker, defender, move, effectiveness);
        }
    }
    
    // === 双墙/极光幕减伤 (Screens) ===
    // 需要从全局 battle 对象获取场地状态
    if (typeof battle !== 'undefined' && battle) {
        // 判断防御方是玩家还是敌方
        const defenderSide = (defender === battle.getPlayer?.()) ? battle.playerSide : battle.enemySide;
        
        if (defenderSide) {
            // 极光幕：物理和特殊都减半
            if (defenderSide.auroraVeil > 0) {
                singleHitDamage = Math.floor(singleHitDamage * 0.5);
            }
            // 反射壁：物理减半
            else if (!isSpecial && defenderSide.reflect > 0) {
                singleHitDamage = Math.floor(singleHitDamage * 0.5);
            }
            // 光墙：特殊减半
            else if (isSpecial && defenderSide.lightScreen > 0) {
                singleHitDamage = Math.floor(singleHitDamage * 0.5);
            }
        }
    }
    
    // === 结实特性 Hook (满血锁1血) ===
    if (typeof AbilityHandlers !== 'undefined' && defender.ability && AbilityHandlers[defender.ability]) {
        const ahDef = AbilityHandlers[defender.ability];
        if (ahDef.onDamageHack) {
            singleHitDamage = ahDef.onDamageHack(singleHitDamage * hitCount, defender);
            // 如果被锁血，直接返回
            return { 
                damage: singleHitDamage, 
                singleHitDamage,
                effectiveness, 
                isCrit, 
                miss: false, 
                hitCount,
                sturdyActivated: singleHitDamage === defender.currHp - 1
            };
        }
    }
    
    // 总伤害 = 单次伤害 × 命中次数
    const totalDamage = singleHitDamage * hitCount;
    
    return { 
        damage: totalDamage, 
        singleHitDamage,
        effectiveness, 
        isCrit, 
        miss: false, 
        hitCount 
    };
}

/**
 * 处理技能带来的副作用（能力升降、反伤、吸血）
 * @param {Pokemon} user 攻击方
 * @param {Pokemon} target 受击方
 * @param {object} move 技能数据
 * @param {number} damageDealt 实际造成的伤害（用于计算反伤/吸血）
 * @returns {Array} 产生的日志文本数组
 */
function applyMoveSecondaryEffects(user, target, move, damageDealt = 0, battle = null, isPlayer = false) {
    let logs = [];
    
    // 获取完整技能数据
    const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const fullMoveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
    
    // === 策略模式：检查是否有特殊处理器 ===
    const handler = (typeof getMoveHandler === 'function') ? getMoveHandler(move.name) : null;
    console.log(`[MOVE HANDLER] Looking for handler: "${move.name}", found:`, handler ? 'YES' : 'NO', handler?.onUse ? '(has onUse)' : '');
    
    // === onUse 钩子 (变化技/天气/场地等，以及技能前置检查如 Fake Out) ===
    if (handler && handler.onUse) {
        console.log(`[MOVE HANDLER] Calling onUse for "${move.name}", battle:`, battle, 'isPlayer:', isPlayer);
        const result = handler.onUse(user, target, logs, battle, isPlayer);
        console.log(`[MOVE HANDLER] onUse returned, logs now:`, logs);
        if (result) {
            // 处理特殊返回值
            if (result.failed) {
                // 技能失败（如 Fake Out 非首回合使用）
                return { logs, pivot: false };
            }
            if (result.selfDestruct) {
                // 自爆类技能已在 handler 中处理 HP
            }
        }
    }
    
    // === onHit 钩子 (命中后效果) ===
    // 注意：变化技（如 Recover, Haze）也需要触发 onHit，即使 damageDealt === 0
    let pivotTriggered = false;
    if (handler && handler.onHit) {
        const hitResult = handler.onHit(user, target, damageDealt, logs, battle);
        if (hitResult && hitResult.pivot) {
            pivotTriggered = true;
        }
    }
    
    // === 场地状态技能处理 (sideCondition) ===
    // 包括：隐形岩、撒菱、毒菱、黏黏网、顺风、双墙等
    if (fullMoveData.sideCondition && battle) {
        if (typeof MoveEffects !== 'undefined' && MoveEffects.applySideCondition) {
            const sideLogs = MoveEffects.applySideCondition(user, move, battle);
            logs.push(...sideLogs);
        }
    }
    
    // 能力名称映射
    const statMap = {
        atk: "攻击", def: "防御", spa: "特攻", spd: "特防", spe: "速度",
        accuracy: "命中率", evasion: "闪避率"
    };
    
    // 变化幅度文案
    const getChangeText = (val) => {
        if (Math.abs(val) >= 3) return "极大幅";
        if (Math.abs(val) === 2) return "大幅";
        return "";
    };
    
    // helper：修改指定对象的能力
    const changeStats = (subject, boostsObj) => {
        if (!boostsObj) return;
        for (const [stat, val] of Object.entries(boostsObj)) {
            if (typeof val !== 'number') continue;
            const diff = subject.applyBoost(stat, val);
            if (diff === 0) {
                // 关键修复：根据当前能力等级判断是上限还是下限
                // Contrary 特性会导致 val 和实际方向相反，所以要看当前 boost 值
                const currentBoost = subject.boosts[stat] || 0;
                if (currentBoost >= 6) {
                    logs.push(`${subject.cnName} 的${statMap[stat] || stat}已经无法再提升了!`);
                } else if (currentBoost <= -6) {
                    logs.push(`${subject.cnName} 的${statMap[stat] || stat}已经无法再降低了!`);
                } else {
                    // 理论上不应该到这里，但保险起见
                    logs.push(`${subject.cnName} 的${statMap[stat] || stat}无法改变!`);
                }
            } else {
                // 关键修复：使用 diff（实际变化值）而不是 val（原始值）来生成日志
                // 这样 Contrary 特性的反转效果会正确显示
                const changeText = getChangeText(diff);
                if (diff > 0) {
                    logs.push(`${subject.cnName} 的${statMap[stat] || stat}${changeText}提升了!`);
                    if (typeof window.playSFX === 'function') window.playSFX('STAT_UP');
                } else {
                    logs.push(`${subject.cnName} 的${statMap[stat] || stat}${changeText}下降了!`);
                    if (typeof window.playSFX === 'function') window.playSFX('STAT_DOWN');
                }
            }
        }
    };
    
    // ========== 1. 能力变化 (Boosts) ==========
    
    // === 关键修复：判断技能目标是自己还是敌人 ===
    // target: 'self', 'allySide', 'adjacentAlly' -> 作用于自己 (如 Swords Dance, Agility)
    // target: 'normal', 'allAdjacentFoes', 'any' -> 作用于敌人 (如 Sand Attack, Growl, Tail Whip)
    const selfTargets = ['self', 'allySide', 'adjacentAlly', 'adjacentAllyOrSelf', 'allies'];
    const isTargetSelf = selfTargets.includes(fullMoveData.target);
    
    // 1.1 Status 招式的 boosts
    if (fullMoveData.category === 'Status' && fullMoveData.boosts) {
        if (isTargetSelf) {
            // 如 Swords Dance, Agility, Calm Mind -> Buff 自己
            changeStats(user, fullMoveData.boosts);
        } else {
            // 如 Sand Attack, Growl, Tail Whip, String Shot -> Debuff 敌人
            changeStats(target, fullMoveData.boosts);
        }
    }
    
    // 1.2 self.boosts（对自己生效的副作用）
    if (fullMoveData.self && fullMoveData.self.boosts) {
        changeStats(user, fullMoveData.self.boosts);
    }
    
    // 1.3 Secondary Effects（几率触发，通常对敌人）
    if (fullMoveData.secondary) {
        const chance = fullMoveData.secondary.chance || 100;
        if (Math.random() * 100 < chance) {
            if (fullMoveData.secondary.boosts) {
                changeStats(target, fullMoveData.secondary.boosts);
            }
            if (fullMoveData.secondary.self && fullMoveData.secondary.self.boosts) {
                changeStats(user, fullMoveData.secondary.self.boosts);
            }
            
            // === 状态异常：写入真实数据 + 日志 ===
            if (fullMoveData.secondary.status) {
                const s = fullMoveData.secondary.status;
                // 检查目标是否已有主要状态（主要状态互斥）
                if (!target.status) {
                    target.status = s;
                    if (s === 'slp') {
                        target.sleepTurns = Math.floor(Math.random() * 3) + 2; // 睡2-4回合
                    }
                    const statusMap = {
                        brn: "被灼伤了!", psn: "中毒了!", par: "麻痹了!",
                        tox: "中了剧毒!", slp: "睡着了!", frz: "被冻结了!"
                    };
                    const statusText = statusMap[s];
                    if (statusText) {
                        logs.push(`${target.cnName} ${statusText}`);
                    }
                }
            }
            
            // 畏缩效果：写入 volatile 状态
            if (fullMoveData.secondary.volatileStatus === 'flinch') {
                target.volatile = target.volatile || {};
                target.volatile.flinch = true;
                logs.push(`${target.cnName} 畏缩了!`);
            }
        }
    }
    
    // 1.4 Status 招式直接施加状态（如电磁波、鬼火、催眠粉）
    if (fullMoveData.status) {
        const s = fullMoveData.status;
        if (!target.status) {
            target.status = s;
            if (s === 'slp') {
                target.sleepTurns = Math.floor(Math.random() * 3) + 2;
            }
            const statusMap = {
                brn: "被灼伤了!", psn: "中毒了!", par: "麻痹了!",
                tox: "中了剧毒!", slp: "睡着了!", frz: "被冻结了!"
            };
            const statusText = statusMap[s];
            if (statusText) {
                logs.push(`${target.cnName} ${statusText}`);
            }
        }
    }
    
    // 1.4 自降能力副作用 - 数据驱动：从 MOVES 的 self.boosts 读取
    // 不再需要 boostPatches 硬编码补丁！
    // 示例：Close Combat 会从 moves-data.js 读取 self: { boosts: { def: -1, spd: -1 } }
    
    // === 1.5 Protect/Detect 守住类技能：设置 volatile 状态 ===
    // 数据驱动：检查 MOVES 的 stallingMove 字段或 volatileStatus 包含 protect
    const isProtectMove = fullMoveData.stallingMove || 
        (fullMoveData.volatileStatus && ['protect', 'banefulbunker', 'spikyshield', 'kingsshield', 'obstruct', 'silktrap', 'burningbulwark'].includes(fullMoveData.volatileStatus));
    if (isProtectMove) {
        user.volatile = user.volatile || {};
        user.volatile.protect = true;
        logs.push(`${user.cnName} 守住了自己!`);
    }
    
    // ========== 2. 反伤 (Recoil) ==========
    // 格式: recoil: [num, den] 表示反伤 num/den 的造成伤害
    // === 石头脑袋 / 魔法防守 免疫反伤 ===
    const noRecoilAbility = (typeof AbilityHandlers !== 'undefined' && user.ability && AbilityHandlers[user.ability]) 
        ? (AbilityHandlers[user.ability].noRecoil || AbilityHandlers[user.ability].noIndirectDamage) 
        : false;
    
    if (!noRecoilAbility) {
        if (fullMoveData.recoil && damageDealt > 0) {
            const [num, den] = fullMoveData.recoil;
            const recoilDmg = Math.max(1, Math.floor(damageDealt * num / den));
            user.takeDamage(recoilDmg);
            logs.push(`${user.cnName} 受到了 ${recoilDmg} 点反作用力伤害!`);
        } else if (damageDealt > 0) {
            // 从 move-constants.js 获取反伤数据
            const recoilPatches = (typeof RECOIL_MOVES !== 'undefined') ? RECOIL_MOVES : {};
            if (recoilPatches[move.name]) {
                const [num, den] = recoilPatches[move.name];
                const recoilDmg = Math.max(1, Math.floor(damageDealt * num / den));
                user.takeDamage(recoilDmg);
                logs.push(`${user.cnName} 受到了 ${recoilDmg} 点反作用力伤害!`);
            }
        }
    }
    
    // ========== 3. 吸血 (Drain) ==========
    // 格式: drain: [num, den] 表示恢复 num/den 的造成伤害
    if (fullMoveData.drain && damageDealt > 0) {
        const [num, den] = fullMoveData.drain;
        const healAmt = Math.max(1, Math.floor(damageDealt * num / den));
        const actualHeal = Math.min(healAmt, user.maxHp - user.currHp);
        if (actualHeal > 0) {
            user.heal(healAmt);
            logs.push(`${user.cnName} 吸取了对手的体力!`);
        }
    } else if (damageDealt > 0) {
        // 从 move-constants.js 获取吸血数据
        const drainPatches = (typeof DRAIN_MOVES !== 'undefined') ? DRAIN_MOVES : {};
        if (drainPatches[move.name]) {
            const [num, den] = drainPatches[move.name];
            const healAmt = Math.max(1, Math.floor(damageDealt * num / den));
            const actualHeal = Math.min(healAmt, user.maxHp - user.currHp);
            if (actualHeal > 0) {
                user.heal(healAmt);
                logs.push(`${user.cnName} 吸取了对手的体力!`);
            }
        }
    }
    
    // ========== 4. 特殊技能效果硬编码 ==========
    
    // 寄生种子 (Leech Seed)
    if (move.name === 'Leech Seed') {
        // 草系免疫寄生种子
        if (!target.types.includes('Grass')) {
            target.volatile = target.volatile || {};
            target.volatile['leechseed'] = true;
            logs.push(`寄生种子种在了 ${target.cnName} 身上!`);
        } else {
            logs.push(`对草系宝可梦没有效果!`);
        }
    }
    
    // 哈欠 (Yawn)
    if (move.name === 'Yawn') {
        if (!target.status && !(target.volatile && target.volatile['yawn'])) {
            target.volatile = target.volatile || {};
            target.volatile['yawn'] = 2; // 2回合后睡着
            logs.push(`${target.cnName} 打了个大大的哈欠...`);
        }
    }
    
    // 诅咒 (Curse) - 鬼系版本
    if (move.name === 'Curse' && user.types.includes('Ghost')) {
        const selfDmg = Math.floor(user.maxHp / 2);
        user.takeDamage(selfDmg);
        target.volatile = target.volatile || {};
        target.volatile['curse'] = true;
        logs.push(`${user.cnName} 削减了自己的体力，对 ${target.cnName} 施加了诅咒!`);
    }
    
    // 束缚类技能 - 数据驱动：检查 MOVES 的 volatileStatus === 'partiallytrapped'
    if (fullMoveData.volatileStatus === 'partiallytrapped') {
        target.volatile = target.volatile || {};
        target.volatile['partiallytrapped'] = true;
        logs.push(`${target.cnName} 被困住了!`);
    }
    
    // ========== 5. 自我牺牲技能 (Self-Destruct) ==========
    // 处理 selfdestruct 字段：Memento, Healing Wish, Lunar Dance 等
    // selfdestruct: "always" - 无论命中与否都濒死
    // selfdestruct: "ifHit" - 命中后才濒死
    if (fullMoveData.selfdestruct) {
        const shouldFaint = fullMoveData.selfdestruct === 'always' || 
                           (fullMoveData.selfdestruct === 'ifHit' && damageDealt >= 0);
        
        if (shouldFaint) {
            user.currHp = 0;
            logs.push(`${user.cnName} 倒下了!`);
            console.log(`[SELFDESTRUCT] ${user.cnName} used ${move.name} with selfdestruct: ${fullMoveData.selfdestruct}`);
        }
    }
    
    // 返回包含日志和 pivot 标记的对象
    return { logs, pivot: pivotTriggered };
}

/**
 * 核心：判断当前宝可梦能否行动
 * @param {Pokemon} pokemon
 * @returns {{ can: boolean, msg: string }}
 */
function checkCanMove(pokemon) {
    // 1. 畏缩 (Flinch) - 本回合无法行动，用完即清
    if (pokemon.volatile && pokemon.volatile.flinch) {
        pokemon.volatile.flinch = false;
        return { can: false, msg: `${pokemon.cnName} 因为畏缩而无法动弹!` };
    }
    
    // 2. 睡眠 (Sleep) - 每回合减少计数，到0醒来
    if (pokemon.status === 'slp') {
        pokemon.sleepTurns--;
        if (pokemon.sleepTurns <= 0) {
            pokemon.status = null;
            return { can: true, msg: `${pokemon.cnName} 醒过来了!` };
        }
        return { can: false, msg: `${pokemon.cnName} 正在熟睡中...` };
    }
    
    // 3. 麻痹 (Paralysis) - 25% 几率无法行动
    if (pokemon.status === 'par') {
        if (Math.random() < 0.25) {
            return { can: false, msg: `${pokemon.cnName} 因身体麻痹而无法行动!` };
        }
    }
    
    // 4. 冰冻 (Frozen) - 20% 几率解冻，否则无法行动
    if (pokemon.status === 'frz') {
        if (Math.random() < 0.2) {
            pokemon.status = null;
            return { can: true, msg: `${pokemon.cnName} 的冰冻解除了!` };
        }
        return { can: false, msg: `${pokemon.cnName} 被冻得动弹不得!` };
    }
    
    return { can: true, msg: '' };
}

/**
 * 清除回合结束时的临时状态（如畏缩）
 */
function clearVolatileStatus(pokemon) {
    if (pokemon.volatile) {
        pokemon.volatile.flinch = false;
    }
}

/**
 * 回合结束的结算 (End Phase)
 * 处理 异常扣血、寄生种子吸血、Yawn结算等
 * @param {Pokemon} poke 结算的目标
 * @param {Pokemon} opponent 对手 (用于吸血逻辑)
 * @param {boolean} isPlayerPoke 是否为玩家方的宝可梦（AVs 效果只对玩家方生效）
 * @returns {Array} logs
 */
function getEndTurnStatusLogs(poke, opponent, isPlayerPoke = false) {
    let logs = [];
    if (!poke || !poke.isAlive()) return logs;

    // ----------------------------------------
    // 1. 灼伤 (Burn): 扣 1/16 HP
    // ----------------------------------------
    if (poke.status === 'brn') {
        const dmg = Math.max(1, Math.floor(poke.maxHp / 16));
        poke.takeDamage(dmg);
        logs.push(`${poke.cnName} 受到灼伤的伤害! (-${dmg})`);
    }

    // ----------------------------------------
    // 2. 中毒 (Poison): 扣 1/8 HP
    // ----------------------------------------
    if (poke.status === 'psn') {
        const dmg = Math.max(1, Math.floor(poke.maxHp / 8));
        poke.takeDamage(dmg);
        logs.push(`${poke.cnName} 受到毒素的伤害! (-${dmg})`);
    }
    
    // 剧毒 (Toxic): 累加伤害 (简化为 1/8)
    if (poke.status === 'tox') {
        const dmg = Math.max(1, Math.floor(poke.maxHp / 8));
        poke.takeDamage(dmg);
        logs.push(`${poke.cnName} 受到剧毒的伤害! (-${dmg})`);
    }

    // ----------------------------------------
    // 3. 寄生种子 (Leech Seed): 被对方吸血 1/8
    // ----------------------------------------
    if (poke.volatile && poke.volatile['leechseed'] && opponent && opponent.isAlive()) {
        const drain = Math.max(1, Math.floor(poke.maxHp / 8));
        poke.takeDamage(drain);
        opponent.heal(drain);
        logs.push(`${poke.cnName} 的体力被寄生种子吸取了! (-${drain})`);
    }

    // ----------------------------------------
    // 4. 束缚状态 (Bind / Whirlpool / Fire Spin) -> 扣 1/8
    // ----------------------------------------
    if (poke.volatile && poke.volatile['partiallytrapped']) {
        const dmg = Math.max(1, Math.floor(poke.maxHp / 8));
        poke.takeDamage(dmg);
        logs.push(`${poke.cnName} 因束缚而受到伤害! (-${dmg})`);
    }

    // ----------------------------------------
    // 5. 诅咒 (Curse - Ghost使用): 每回合扣 1/4
    // ----------------------------------------
    if (poke.volatile && poke.volatile['curse']) {
        const dmg = Math.max(1, Math.floor(poke.maxHp / 4));
        poke.takeDamage(dmg);
        logs.push(`${poke.cnName} 受到了诅咒! (-${dmg})`);
    }

    // ----------------------------------------
    // 6. 哈欠 (Yawn): 倒计时，时间到睡着
    // ----------------------------------------
    if (poke.volatile && poke.volatile['yawn']) {
        poke.volatile['yawn'] -= 1;
        if (poke.volatile['yawn'] <= 0) {
            if (!poke.status) {
                poke.status = 'slp';
                poke.sleepTurns = Math.floor(Math.random() * 3) + 2;
                delete poke.volatile['yawn'];
                logs.push(`${poke.cnName} 的睡意袭来了! -> 睡着了!`);
            } else {
                delete poke.volatile['yawn'];
            }
        } else {
            logs.push(`${poke.cnName} 更加困倦了...`);
        }
    }

    // ----------------------------------------
    // 7. 水流环 (Aqua Ring): 每回合回复 1/16 HP
    // ----------------------------------------
    if (poke.volatile && poke.volatile.aquaring) {
        const heal = Math.max(1, Math.floor(poke.maxHp / 16));
        poke.heal(heal);
        logs.push(`${poke.cnName} 的水流环恢复了体力! (+${heal})`);
    }

    // ----------------------------------------
    // 8. 扎根 (Ingrain): 每回合回复 1/16 HP
    // ----------------------------------------
    if (poke.volatile && poke.volatile.ingrain) {
        const heal = Math.max(1, Math.floor(poke.maxHp / 16));
        poke.heal(heal);
        logs.push(`${poke.cnName} 从地面吸收了养分! (+${heal})`);
    }

    // =====================================================
    // === AVs: Devotion (献身) - 状态治愈 + 残血回复 ===
    // 【v3.4 重写】两个独立触发条件：
    //   1. 有异常状态 → 清除异常 + 回复 10% HP
    //   2. 残血（≤30%）→ 回复 40% HP
    // =====================================================
    // 【调试】检查 Devotion 触发条件
    console.log(`[AVs Devotion] 检查: ${poke.cnName}, isPlayerPoke=${isPlayerPoke}, isAce=${poke.isAce}, avs=`, poke.avs);
    
    // 只有【玩家方】的 isAce=true 宝可梦才能触发 AVs 被动
    if (isPlayerPoke && poke.isAce && poke.avs && poke.avs.devotion > 0) {
        const baseDevotion = poke.getEffectiveAVs ? poke.getEffectiveAVs('devotion') : poke.avs.devotion;
        const effectiveDevotion = poke.avsEvolutionBoost ? baseDevotion * 2 : baseDevotion;
        const hpRatio = poke.currHp / poke.maxHp;
        const isCritical = hpRatio <= 0.30;
        
        console.log(`[AVs Devotion] ${poke.cnName}: baseDevotion=${baseDevotion}, effective=${effectiveDevotion}, hpRatio=${hpRatio.toFixed(2)}, isCritical=${isCritical}, status=${poke.status}`);
        
        // 【修复】使用线性概率计算（基于 0-255 数值）
        // 255 满值 = 15% 基础概率
        // 0 = 0% 概率
        // 线性插值：baseChance = (effectiveDevotion / 255) * 0.15
        const baseChance = Math.min(0.15, (effectiveDevotion / 255) * 0.15);
        
        // 初始化全局触发标记（每只宝可梦只能触发一次残血回复）
        if (!poke.avsTriggered) poke.avsTriggered = {};
        if (poke.devotionStatusTriggered === undefined) poke.devotionStatusTriggered = -1;
        
        const currentTurn = (typeof battle !== 'undefined' && battle.turn) ? battle.turn : 0;
        
        console.log(`[AVs Devotion] baseChance=${(baseChance * 100).toFixed(1)}%, currentTurn=${currentTurn}`);
        
        // 【触发条件 1】有异常状态 → 清除异常 + 回复 10% HP
        if (poke.status && poke.devotionStatusTriggered !== currentTurn && baseChance > 0) {
            const roll = Math.random();
            console.log(`[AVs Devotion] 状态治愈检查: status=${poke.status}, roll=${roll.toFixed(3)}, chance=${baseChance.toFixed(3)}`);
            if (roll < baseChance) {
                const oldStatus = poke.status;
                poke.status = null;
                poke.sleepTurns = 0;
                // 清除异常后回复 10% HP
                const healAmount = Math.floor(poke.maxHp * 0.10);
                poke.heal(healAmount);
                logs.push(`<b style="color:#e91e63">💕 ${poke.cnName} 为了不让训练家担心，治好了自己的${oldStatus}！回复了 ${healAmount} HP！(Devotion${poke.avsEvolutionBoost ? ' x2' : ''})</b>`);
                poke.devotionStatusTriggered = currentTurn;
            }
        }
        
        // 【触发条件 2】残血（≤30%）→ 回复 40% HP（独立触发，不与状态治愈冲突）
        // 【修复】每只宝可梦只能触发一次残血回复（全局限制）
        if (isCritical && !poke.avsTriggered.devotionCritical && baseChance > 0) {
            // 残血时概率提升 +8%
            const criticalChance = Math.min(1.0, baseChance + 0.08);
            const roll = Math.random();
            console.log(`[AVs Devotion] 残血回复检查: roll=${roll.toFixed(3)}, chance=${criticalChance.toFixed(3)}, triggered=${poke.avsTriggered.devotionCritical}`);
            if (roll < criticalChance) {
                const healAmount = Math.floor(poke.maxHp * 0.40);
                poke.heal(healAmount);
                logs.push(`<b style="color:#e91e63">💕 ${poke.cnName} 的献身之心激发了生命力！回复了 ${healAmount} HP！[危机爆发] (Devotion${poke.avsEvolutionBoost ? ' x2' : ''})</b>`);
                poke.avsTriggered.devotionCritical = true; // 标记已触发，全局只能触发一次
            }
        }
    }

    return logs;
}

/**
 * 获取招式的优先级 (Priority)
 * @param {object} move - 招式对象
 * @returns {number} 优先级值 (-7 到 +5)
 */
function getMovePriority(move) {
    if (!move || !move.name) return 0;
    
    // 【古武系统】如果招式对象已有 priority 属性（被 style 修改过），直接使用
    if (typeof move.priority === 'number') {
        return move.priority;
    }
    
    const moveId = move.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const fullMoveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
    
    // 优先从 MOVES 数据获取
    if (fullMoveData.priority !== undefined) {
        return fullMoveData.priority;
    }
    
    // 从 move-constants.js 获取优先级映射 (作为后备)
    const priorityMap = (typeof PRIORITY_MAP !== 'undefined') ? PRIORITY_MAP : {};
    
    return priorityMap[move.name] || 0;
}

if (typeof window !== 'undefined') {
    window.checkCanMove = checkCanMove;
    window.clearVolatileStatus = clearVolatileStatus;
    window.getEndTurnStatusLogs = getEndTurnStatusLogs;
    window.getMovePriority = getMovePriority;
}

/**
 * =============================================
 * MEGA EVOLUTION SYSTEM
 * =============================================
 */

/**
 * 自动检测宝可梦的形态变化资格（Mega/Ultra/Primal/Dynamax 等）
 * 修复版 V2：
 * 1. 修复路卡利欧显示双 Mega 问题（增加 X/Y 白名单）
 * 2. 修复怪力无法极巨化问题（强制信任 explicitFormFlag 中的 gmax）
 * 
 * @param {Pokemon} pokemon - 宝可梦实例
 * @param {string|null} explicitFormFlag - JSON 中显式指定的形态 ('x', 'y', 'primal', 'ultra', 'crowned', 'machampgmax' 等)
 */
/* ==========================================================
 *  智能形态探测器 v3 : Zero-Config, Database-Driven
 *  基于 mechanic 字段和数据库自动检测可用形态
 * ========================================================== */ 
function autoDetectFormChangeEligibility(pokemon, explicitFormFlag = null) {
    // 使用规范化名称查找 POKEDEX
    const normalizedName = normalizePokemonName(pokemon.name);
    const baseId = normalizedName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const data = typeof POKEDEX !== 'undefined' ? POKEDEX[baseId] : null;
    
    // 获取玩家在 JSON 配置里指定的"意愿" (Mechanic Lock)
    const desiredMechanic = pokemon.mechanic || 'any'; // 'mega', 'dynamax', 'zmove', 'any'(Auto)
    
    console.log(`[FORM] Auto-Scan for ${pokemon.name} (baseId: ${baseId}), mechanic: ${desiredMechanic}, hasData: ${!!data}`);
    
    // ========================================
    // 步骤 1：扫描数据库的所有形态树
    // ========================================
    let avail = {
        mega: [],
        gmax: [],
        primal: null,
        ultra: null,
        crowned: null
    };
    
    // 从 otherFormes 收集
    if (data && data.otherFormes) {
        for (const formeName of data.otherFormes) {
            const formeId = formeName.toLowerCase().replace(/[^a-z0-9]/g, '');
            
            if (formeId.includes('gmax') || formeId.includes('gigantamax')) {
                avail.gmax.push(formeId);
            } else if (formeName.includes('Mega') && formeId.match(/mega[xy]?$/)) {
                avail.mega.push(formeId);
            } else if (formeName.includes('Primal')) {
                avail.primal = formeId;
            } else if (formeName.includes('Ultra')) {
                avail.ultra = formeId;
            } else if (formeName.includes('Crowned')) {
                avail.crowned = formeId;
            }
        }
    }
    
    // 激进探测：尝试拼接 ID（数据库可能没有 otherFormes 但有实际数据）
    const guessedGmaxId = baseId + 'gmax';
    const guessedMegaId = baseId + 'mega';
    if (avail.gmax.length === 0 && typeof POKEDEX !== 'undefined' && POKEDEX[guessedGmaxId]) {
        avail.gmax.push(guessedGmaxId);
    }
    if (avail.mega.length === 0 && typeof POKEDEX !== 'undefined' && POKEDEX[guessedMegaId]) {
        avail.mega.push(guessedMegaId);
    }
    
    // 双 Mega 白名单
    const KNOWN_DUAL_MEGAS = ['charizard', 'mewtwo'];
    const hasDualMega = (avail.mega.length >= 2) && KNOWN_DUAL_MEGAS.includes(baseId);
    
    console.log(`[FORM] Available forms:`, avail);
    
    // ========================================
    // 步骤 2：原始回归 / Crowned - 立即固化
    // ========================================
    if (avail.primal && typeof POKEDEX !== 'undefined' && POKEDEX[avail.primal]) {
        pokemon.isPrimal = true;
        pokemon.primalTargetId = avail.primal;
        pokemon.needsInitTransform = true;
        pokemon.initTransformTarget = avail.primal;
        pokemon.initTransformType = 'primal';
    }
    
    if (avail.crowned && typeof POKEDEX !== 'undefined' && POKEDEX[avail.crowned]) {
        pokemon.isCrowned = true;
        pokemon.crownedTargetId = avail.crowned;
        pokemon.needsInitTransform = true;
        pokemon.initTransformTarget = avail.crowned;
        pokemon.initTransformType = 'crowned';
    }
    
    // ===================================
    //  决策区: 根据 mechanic 决定 Target
    // ===================================
    
    // 👉 场景 A: 明确想要极巨化 (mechanic='dynamax')
    if (desiredMechanic === 'dynamax') {
        // 【修复】优先使用用户在 JSON 中显式指定的 mega/mega_target 字段
        if (pokemon.megaTargetId && pokemon.megaTargetId.includes('gmax')) {
            // 用户已经指定了 G-Max 形态，直接使用
            pokemon.canMegaEvolve = true;
            pokemon.canDynamax = true;
            pokemon.evolutionType = 'dynamax';
            console.log(`[FORM] Using explicit G-Max target: ${pokemon.megaTargetId}`);
        } else if (avail.gmax.length > 0) {
            // 找到正版 Gmax 数据
            pokemon.megaTargetId = avail.gmax[0];
            pokemon.canMegaEvolve = true;
            pokemon.canDynamax = true;
            pokemon.evolutionType = 'dynamax';
            console.log(`[FORM] Locked Dynamax target: ${pokemon.megaTargetId}`);
        } else {
            // 没有 GMax 数据，走通用极巨化 (Non-GMax Dynamax)
            // 每个宝可梦都可以通用变大，只是没有专属 G-Max 招式
            pokemon.megaTargetId = guessedGmaxId; // 虚拟 ID，供图片加载尝试
            pokemon.canMegaEvolve = true;
            pokemon.canDynamax = true;
            pokemon.evolutionType = 'dynamax';
            pokemon.isGenericDynamax = true; // 标记为通用极巨化
            console.log(`[FORM] Generic Dynamax (No G-Form in DB) target: ${pokemon.megaTargetId}`);
        }
        return;
    }
    
    // 👉 场景 B: 明确想要 Mega (mechanic='mega')
    if (desiredMechanic === 'mega') {
        if (avail.mega.length > 0) {
            const validMegaForms = avail.mega.filter(f => typeof POKEDEX !== 'undefined' && POKEDEX[f]);
            if (validMegaForms.length > 0) {
                if (hasDualMega && validMegaForms.length >= 2) {
                    pokemon.hasDualMega = true;
                    pokemon.megaFormsAvailable = validMegaForms;
                    pokemon.megaTargetId = validMegaForms.find(f => f.endsWith('x')) || validMegaForms[0];
                } else {
                    pokemon.megaTargetId = validMegaForms[0];
                }
                pokemon.canMegaEvolve = true;
                pokemon.evolutionType = 'mega';
                console.log(`[FORM] Locked Mega target: ${pokemon.megaTargetId}`);
                return;
            }
        }
        // 没有 Mega 数据，禁用
        pokemon.canMegaEvolve = false;
        console.log(`[FORM] ${pokemon.name} has no Mega form - Mega DISABLED`);
        return;
    }
    
    // 👉 场景 C: Z 招式模式 (mechanic='zmove')
    if (desiredMechanic === 'zmove') {
        // Z 招式不需要形态变化，但禁止 Mega/Dynamax
        pokemon.canMegaEvolve = false;
        pokemon.canDynamax = false;
        console.log(`[FORM] ${pokemon.name} locked to Z-Move - form changes DISABLED`);
        return;
    }
    
    if (desiredMechanic === 'tera') {
        // 太晶化不需要形态变化，禁止自动检测 Mega/Dynamax
        pokemon.canMegaEvolve = false;
        pokemon.canDynamax = false;
        console.log(`[FORM] ${pokemon.name} locked to Tera - form changes DISABLED`);
        return;
    }
    
    // 👉 场景 D: 自动挡 (mechanic 不填或 'any')
    // 优先 Mega（因为 Mega 改变种族特性更明显），没 Mega 看能不能 GMax
    if (avail.ultra && typeof POKEDEX !== 'undefined' && POKEDEX[avail.ultra]) {
        pokemon.megaTargetId = avail.ultra;
        pokemon.canMegaEvolve = true;
        pokemon.evolutionType = 'ultra';
        console.log(`[FORM] Auto-detected Ultra: ${pokemon.megaTargetId}`);
    } else if (avail.mega.length > 0) {
        const validMegaForms = avail.mega.filter(f => typeof POKEDEX !== 'undefined' && POKEDEX[f]);
        if (validMegaForms.length > 0) {
            if (hasDualMega && validMegaForms.length >= 2) {
                pokemon.hasDualMega = true;
                pokemon.megaFormsAvailable = validMegaForms;
            }
            pokemon.megaTargetId = validMegaForms.find(f => f.endsWith('x')) || validMegaForms[0];
            pokemon.canMegaEvolve = true;
            pokemon.evolutionType = 'mega';
            console.log(`[FORM] Auto-detected Mega: ${pokemon.megaTargetId}`);
        }
    } else if (avail.gmax.length > 0) {
        // 只有专属 GMax 的才自动激活，通用极巨化需要手动指定 mechanic
        pokemon.megaTargetId = avail.gmax[0];
        pokemon.canMegaEvolve = true;
        pokemon.canDynamax = true;
        pokemon.evolutionType = 'dynamax';
        console.log(`[FORM] Auto-detected GMax: ${pokemon.megaTargetId}`);
    } else {
        pokemon.canMegaEvolve = false;
        pokemon.canFormChange = false;
        console.log(`[FORM] ${pokemon.name} has NO form changes available`);
    }
}

// 向后兼容别名
const autoDetectMegaEligibility = autoDetectFormChangeEligibility;

/**
 * 检查是否为非官方 Mega（动态检测）
 * 不再使用硬编码列表！
 * 实际检测在 smartLoadSprite 中进行：当所有精灵图回退都失败时，自动判断为非官方 Mega
 * 这个函数现在只返回 false，让精灵图加载系统来决定
 */
function isUnofficialMega(megaTargetId) {
    // 不再预判，让 smartLoadSprite 的回退机制来动态检测
    // 如果所有 Mega 精灵图 URL 都失败，smartLoadSprite 会自动加载基础形态
    return false;
}

/**
 * 执行 Mega 进化 (引擎层面)
 * @param {Pokemon} pokemon - 要进化的宝可梦
 * @returns {object|null} - 进化结果信息，或 null 如果失败
 */
function performMegaEvolution(pokemon) {
    if (!pokemon.canMegaEvolve || pokemon.isMega || !pokemon.megaTargetId) {
        return null;
    }
    
    const megaData = getPokemonData(pokemon.megaTargetId);
    if (!megaData) {
        console.warn(`[MEGA] Mega form data not found: ${pokemon.megaTargetId}`);
        return null;
    }
    
    // 检测是否为非官方 Mega
    const isUnofficial = isUnofficialMega(pokemon.megaTargetId);
    if (isUnofficial) {
        console.log(`[MEGA] Detected unofficial Mega: ${pokemon.megaTargetId} (Radical Red / ROM Hack)`);
        pokemon.isUnofficialMega = true;
    }
    
    // 保存旧数据用于日志
    const oldName = pokemon.cnName;
    const oldTypes = [...pokemon.types];
    const oldAbility = pokemon.ability;
    
    // 更新基础数据
    pokemon.name = megaData.name;
    
    // [BUG FIX] 强制刷新中文名，防止变回英文
    if (typeof window !== 'undefined' && window.Locale) {
        // 先尝试查全名 "Lucario-Mega" => "超级路卡利欧"
        let cn = window.Locale.get(megaData.name);
        
        // 如果查不到翻译(还是英文)，尝试智能拼装: "超级" + 基础名
        if (cn === megaData.name) {
            const baseCn = window.Locale.get(pokemon.name.split('-')[0]);
            cn = `超级${baseCn}`;
        }
        pokemon.cnName = cn;
    } else {
        pokemon.cnName = megaData.name;
    }
    
    pokemon.types = megaData.types || pokemon.types;
    pokemon.baseStats = megaData.baseStats;
    
    // 获取 Mega 形态的特性
    const megaPokedexData = typeof POKEDEX !== 'undefined' ? POKEDEX[pokemon.megaTargetId] : null;
    if (megaPokedexData && megaPokedexData.abilities) {
        pokemon.ability = megaPokedexData.abilities['0'] || megaPokedexData.abilities['H'] || pokemon.ability;
    }
    
    // 重新计算能力值 (HP 不变!)
    const oldHp = pokemon.currHp;
    const oldMaxHp = pokemon.maxHp;
    
    let autoEv = Math.floor(pokemon.level * 1.5);
    if (autoEv > 85) autoEv = 85;
    
    const newStats = calcStats(megaData.baseStats, pokemon.level, 31, autoEv);
    
    // HP 保持不变 (Mega 进化的核心规则)
    // pokemon.maxHp = oldMaxHp; // 不变
    // pokemon.currHp = oldHp;   // 不变
    
    // 更新其他能力值
    pokemon.atk = newStats.atk;
    pokemon.def = newStats.def;
    pokemon.spa = newStats.spa;
    pokemon.spd = newStats.spd;
    pokemon.spe = newStats.spe;
    
    // 标记已 Mega 进化
    pokemon.isMega = true;
    pokemon.canMegaEvolve = false;
    
    // === 播放 Mega 进化叫声 ===
    if (typeof window.playPokemonCry === 'function') {
        window.playPokemonCry(pokemon.name);
    }
    
    return {
        oldName,
        newName: pokemon.cnName,
        oldTypes,
        newTypes: pokemon.types,
        oldAbility,
        newAbility: pokemon.ability,
        typeChanged: JSON.stringify(oldTypes) !== JSON.stringify(pokemon.types),
        abilityChanged: oldAbility !== pokemon.ability
    };
}

/**
 * 检查宝可梦是否可以 Mega 进化
 * @param {Pokemon} pokemon
 * @returns {boolean}
 */
function canMegaEvolve(pokemon) {
    return pokemon && pokemon.canMegaEvolve && !pokemon.isMega && pokemon.megaTargetId;
}

// 导出 Mega 相关函数
if (typeof window !== 'undefined') {
    window.autoDetectMegaEligibility = autoDetectMegaEligibility;
    window.performMegaEvolution = performMegaEvolution;
    window.canMegaEvolve = canMegaEvolve;
}

/**
 * 战斗状态管理器
 */
class BattleState {
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
        // =========================================================
        this.field = {
            trickRoom: 0,   // 戏法空间剩余回合 (0=未开启)
            gravity: 0,     // 重力剩余回合
            magicRoom: 0,   // 魔法空间剩余回合
            wonderRoom: 0   // 奇妙空间剩余回合
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
        
        // 全局场地
        if (this.field.trickRoom > 0) {
            this.field.trickRoom--;
            if (this.field.trickRoom === 0) {
                logs.push("扭曲的时空恢复了正常！");
            }
        }
        if (this.field.gravity > 0) {
            this.field.gravity--;
            if (this.field.gravity === 0) {
                logs.push("重力恢复了正常！");
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
            enable_tera: enemyUnlocksRaw.enable_tera === true         // 太晶化 (默认关闭)
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
        this.playerActive = 0;
        this.playerMegaUsed = false;
    }
    
    // 获取当前出战
    getPlayer() { return this.playerParty[this.playerActive]; }
    getEnemy() { return this.enemyParty[this.enemyActive]; }
    
    // 检查胜负
    checkBattleEnd() {
        const playerAlive = this.playerParty.some(p => p.isAlive());
        const enemyAlive = this.enemyParty.some(p => p.isAlive());
        
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
window.calcDamage = calcDamage;
window.applyMoveSecondaryEffects = applyMoveSecondaryEffects;
window.BattleState = BattleState;
// window.getAiMove - 已迁移到 ai-engine.js
