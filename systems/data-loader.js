/**
 * ===========================================
 * DATA-LOADER.JS - 数据加载系统
 * ===========================================
 * 
 * 职责:
 * - 默认战斗数据
 * - JSON 数据解析与加载
 * - 战斗初始化数据处理
 */

// ============================================
// 默认战斗数据
// ============================================

/**
 * 获取默认战斗数据 (当没有外部JSON注入时使用)
 * 
 * 新版格式支持：
 * - stats_meta: { ivs: {...}, ev_level: 0~252 }
 * - nature: 性格名称
 * - ability: 特性名称
 * - gender: 'M' | 'F' | null
 * - shiny: boolean
 * - mechanic: 'mega' | 'dynamax' | 'zmove' | 'tera' (互斥机制锁)
 * - dynamax_moves: string[] (极巨化时的招式列表)
 * - z_move_config: { base_move, target_move, is_unique }
 */
function getDefaultBattleData() {
    return {
  "difficulty": "expert",
  "settings": {
    "enableAVS": true,
    "enableCommander": true,
    "enableEVO": true,
    "enableEnvironment": true,
    "enableSFX": true,
    "enableClash": true,
    "enableStyles": true
  },
  "environment": {
    "weather": "chronalrift",
    "weatherTurns": 0,
    "suppressionTier": 3,
    "revertMessage": "Space distorts violently, rejecting the enforced order.",
    "effects": {
      "autoParadox": true,
      "unboundArts": true,
      "speedEntropy": true,
      "digitalGlitch": true,
      "weatherLock": true
    }
  },
  "player": {
    "name": "Subject_Delta",
    "trainerProficiency": 230,
    "comment": "测试未来种自动充能、人造宝可梦的数据溢出/丢失",
    "unlocks": {
      "enable_mega": true,
      "enable_tera": true,
      "enable_dynamax": true
    },
    // Subject_Delta 也是一个生化/机械改造狂热者
    "party": [
      {
        "slot": 1,
        "name": "Iron Valiant",
        "nickname": "铁武者",
        "lv": 90,
        "isLead": true,
        "ability": "Quark Drive",
        "nature": "Naive",
        "item": "Booster Energy",
        "mechanic": "tera",
        "teraType": "Fairy",
        "moves": ["Moonblast", "Close Combat", "Spirit Break", "Shadow Sneak"],
        "stats_meta": { "ev_level": 252 },
        "friendship": { "avs": { "passion": 200 } },
        "test_objective": "验证[Auto-Paradox]: 进场时无需电气场地，Quark Drive 应自动激活 (Resonance with Rift)。道具 Booster Energy 不应被消耗(环境供能)。"
      },
      {
        "slot": 2,
        "name": "Porygon-Z",
        "nickname": "多边兽Z-故障测试",
        "lv": 90,
        "ability": "Adaptability",
        "nature": "Modest",
        "item": "Choice Scarf",
        "isAce": true,
        "moves": ["Hyper Beam", "Tri Attack", "Thunderbolt", "Conversion"],
        "stats_meta": { "ev_level": 252 },
        "test_objective": "验证[Move Glitch]: 作为 Artificial Pokemon 使用科技招式，检查是否有概率触发 dmg x2.0 (CRIT OVERFLOW) 或 dmg x0 (SEGFAULT)。"
      },
      {
        "slot": 3,
        "name": "Genesect",
        "nickname": "盖诺赛克特",
        "lv": 90,
        "ability": "Download",
        "nature": "Hasty",
        "item": "Choice Band",
        "moves": ["Techno Blast", "U-turn", "Iron Head", "Extreme Speed"],
        "stats_meta": { "ev_level": 255 },
        "test_objective": "验证[Cyborg Stability]: 半生化单位是否较少受到 Glitch 影响，同时享受钢系对恶劣环境的抗性。"
      },
      {
        "slot": 4,
        "name": "Miraidon",
        "nickname": "密勒顿-模式监视",
        "lv": 90,
        "ability": "Hadron Engine",
        "nature": "Timid",
        "mechanic": "tera",
        "teraType": "Dragon",
        "item": "Life Orb",
        "moves": ["Electro Drift", "Draco Meteor", "Volt Switch", "Parabolic Charge"],
        "stats_meta": { "ev_level": 255 },
        "test_objective": "验证[Tier 3 Dominion]: Hadron Engine 召唤的 Electric Terrain 虽生效，但环境视觉效果应仍为主导的 Chronal Rift。"
      },
      {
        "slot": 5,
        "name": "Magnezone",
        "nickname": "自爆磁怪",
        "lv": 89,
        "ability": "Analytic",
        "nature": "Quiet",
        "item": "Leftovers",
        "moves": ["Flash Cannon", "Thunderbolt", "Body Press", "Iron Defense"],
        "stats_meta": { "ev_level": 252 },
        "test_objective": "验证[Speed Entropy]: 作为超低速单位，在系统随机触发 Trick Room (Dimension Shift) 时的战术地位逆转。"
      },
      {
        "slot": 6,
        "name": "Dragapult",
        "nickname": "多龙-速度受害",
        "lv": 89,
        "ability": "Infiltrator",
        "nature": "Jolly",
        "mechanic": "dynamax",
        "item": "Spell Tag",
        "moves": ["Dragon Darts", "Phantom Force", "U-turn", "Will-O-Wisp"],
        "stats_meta": { "ev_level": 252 },
        "test_objective": "验证[Entropy Risk]: 超高速单位在 RNG 空间下的暴毙风险。"
      }
    ]
  },
  "enemy": {
    "name": "Akari (Time Traveler)",
    "type": "WARDEN",
    "trainerProficiency": 260,
    "unlocks": {
      "enable_styles": true,
      "enable_z_move": true,
      "enable_insight": true
    },
    "party": [
      {
        "name": "Samurott-Hisui",
        "id": "samurotthisui",
        "lv": 90,
        "isLead": true,
        "ability": "Sharpness",
        "nature": "Jolly",
        "item": "Focus Sash",
        "moves": ["Ceaseless Edge", "Razor Shell", "Aqua Jet", "Swords Dance"],
        "stats_meta": { "ev_level": 255 },
        "friendship": { "avs": { "insight": 255 } },
        "test_objective": "验证[Unbound Arts]: 洗翠种使用 Unbound Agile Style (迅疾) 是否优先度+1 且无冷却。Ceaseless Edge 撒菱是否每回合都能用。"
      },
      {
        "name": "Kleavor",
        "id": "kleavor",
        "lv": 90,
        "ability": "Sharpness",
        "nature": "Adamant",
        "item": "Choice Scarf",
        "moves": ["Stone Axe", "X-Scissor", "Close Combat", "Quick Attack"],
        "stats_meta": { "ev_level": 255 },
        "test_objective": "验证[Forceful Strike]: Unbound Strong Style (刚猛) 是否威力 x1.5 且无冷却。"
      },
      {
        "name": "Roaring Moon",
        "id": "roaringmoon",
        "lv": 91,
        "isAce": true,
        "ability": "Protosynthesis",
        "nature": "Adamant",
        "mechanic": "tera",
        "teraType": "Flying",
        "item": "Booster Energy",
        "moves": ["Acrobatics", "Dragon Dance", "Crunch", "Earthquake"],
        "stats_meta": { "ev_level": 255 },
        "friendship": { "avs": { "passion": 255, "trust": 220 } },
        "test_objective": "验证[Ancient Resonance]: 在 Chronal Rift 中 Protosynthesis 自动激活攻击提升，且不受 RNG 速度削弱(Paradox Immunity)。"
      },
      {
        "name": "Ursaluna",
        "id": "ursalunabloodmoon",
        "lv": 90,
        "ability": "Mind's Eye",
        "nature": "Quiet",
        "item": "Silk Scarf",
        "moves": ["Blood Moon", "Earth Power", "Hyper Voice", "Calm Mind"],
        "stats_meta": { "ev_level": 252 },
        "test_objective": "在 Trick Room 随机开启时的毁灭性测试。"
      },
      {
        "name": "Dialga-Origin",
        "id": "dialgaorigin",
        "lv": 92,
        "ability": "Telepathy",
        "nature": "Modest",
        "item": "Adamant Diamond",
        "moves": ["Roar of Time", "Flash Cannon", "Draco Meteor", "Earth Power"],
        "stats_meta": { "ev_level": 255 },
        "test_objective": "验证[Timeline Stability]: 原始形态(Origin Form) 免疫场地的 Entropy Flip / Trick Room 随机翻转效果。"
      },
      {
        "name": "Zoroark-Hisui",
        "id": "zoroarkhisui",
        "lv": 89,
        "ability": "Illusion",
        "nature": "Timid",
        "item": "Life Orb",
        "moves": ["Bitter Malice", "Hyper Voice", "Nasty Plot", "Extrasensory"],
        "stats_meta": { "ev_level": 252 }
      }
    ],
    "lines": {
      "start": "不论是神奥还是洗翠...这个裂缝的气息，我再熟悉不过了。在那边，慢一步就会死。",
      "style_switch": "动作太慢了！让你看看古时的战斗方式！",
      "time_distortion": "重力反转了吗？呵，正好，刚猛连打的机会来了！",
      "porygon_glitch": "那些人造的灵体...似乎在裂缝里很不稳定啊。",
      "win": "在这个错乱的时间里，唯有直觉才是永恒的。",
      "lose": "原来未来也有如此凌厉的战斗风格吗..."
    }
  }
}



}

// ============================================
// JSON 数据加载
// ============================================

/**
 * 从外部 JSON 字符串加载对战 (供 AI RP 调用)
 * JSON 格式:
 * {
 *   "player": { "name": "主角名", "party": [...] },  // 可选
 *   "trainer": { "name": "训练家", "id": "xxx", "line": "台词" },
 *   "party": [...],  // 敌方队伍
 *   "script": "loss" | "win" | null
 * }
 */
function loadBattleFromJSON(jsonString) {
    const battle = typeof window !== 'undefined' ? window.battle : null;
    if (!battle) {
        console.error('[DATA-LOADER] battle object not found');
        return false;
    }
    
    try {
        const json = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
        
        // 加载玩家队伍 (如果有)
        if (json.player && json.player.party) {
            const unlocks = json.player.unlocks || {};
            battle.playerUnlocks = {
                enable_bond: unlocks.enable_bond !== false,
                enable_styles: unlocks.enable_styles !== false,
                enable_insight: unlocks.enable_insight !== false,
                enable_mega: unlocks.enable_mega !== false,
                enable_z_move: unlocks.enable_z_move !== false,
                enable_dynamax: unlocks.enable_dynamax !== false,
                enable_tera: unlocks.enable_tera !== false
            };
            const playerCanMega = battle.playerUnlocks.enable_mega;
            battle.setPlayerParty(json.player.party, playerCanMega);
            battle.playerName = json.player.name || '主角';
        }
        
        // 加载敌方数据
        battle.loadFromJSON(json);
        
        // 更新视觉
        if (typeof updateAllVisuals === 'function') {
            updateAllVisuals();
        }
        
        return true;
    } catch (e) {
        console.error('Invalid battle JSON:', e);
        return false;
    }
}

/**
 * 解析玩家解锁配置
 * @param {Object} unlocks 解锁配置对象
 * @returns {Object} 标准化的解锁配置
 */
function parseUnlocks(unlocks = {}) {
    return {
        enable_bond: unlocks.enable_bond !== false,
        enable_styles: unlocks.enable_styles !== false,
        enable_insight: unlocks.enable_insight !== false,
        enable_mega: unlocks.enable_mega !== false,
        enable_z_move: unlocks.enable_z_move !== false,
        enable_dynamax: unlocks.enable_dynamax !== false,
        enable_tera: unlocks.enable_tera !== false
    };
}

/**
 * 验证战斗 JSON 格式
 * @param {Object} json 战斗数据
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateBattleJSON(json) {
    const errors = [];
    
    if (!json) {
        errors.push('JSON data is null or undefined');
        return { valid: false, errors };
    }
    
    // 检查敌方队伍
    if (!json.party || !Array.isArray(json.party) || json.party.length === 0) {
        errors.push('Missing or empty enemy party');
    }
    
    // 检查每个宝可梦的必要字段
    const checkPokemon = (pokemon, index, side) => {
        if (!pokemon.name) {
            errors.push(`${side} Pokemon #${index + 1}: missing name`);
        }
        if (typeof pokemon.lv !== 'number' || pokemon.lv < 1 || pokemon.lv > 100) {
            errors.push(`${side} Pokemon #${index + 1}: invalid level`);
        }
        if (!pokemon.moves || !Array.isArray(pokemon.moves) || pokemon.moves.length === 0) {
            errors.push(`${side} Pokemon #${index + 1}: missing moves`);
        }
    };
    
    if (json.party) {
        json.party.forEach((p, i) => checkPokemon(p, i, 'Enemy'));
    }
    
    if (json.player && json.player.party) {
        json.player.party.forEach((p, i) => checkPokemon(p, i, 'Player'));
    }
    
    return { valid: errors.length === 0, errors };
}

// ============================================
// 导出
// ============================================

// 浏览器环境
if (typeof window !== 'undefined') {
    window.getDefaultBattleData = getDefaultBattleData;
    window.loadBattleFromJSON = loadBattleFromJSON;
    window.parseUnlocks = parseUnlocks;
    window.validateBattleJSON = validateBattleJSON;
}

// Node.js 环境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getDefaultBattleData,
        loadBattleFromJSON,
        parseUnlocks,
        validateBattleJSON
    };
}
