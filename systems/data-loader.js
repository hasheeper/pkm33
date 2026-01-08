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
    "enableBGM": true,
    "enableSFX": true,
    "enableClash": true,
    "enableStyles": true,
    "debugMode": false
  },
  "player": {
    "name": "Challenger",
    "trainerProficiency": 230,
    "unlocks": {
      "enable_mega": true,
      "enable_z_move": true,
      "enable_dynamax": true,
      "enable_tera": true,
      "enable_bond": true,
      "enable_styles": false
    },
    "party": [
      {
        "slot": 1,
        "name": "Dragapult",
        "nickname": "多龙巴鲁托",
        "lv": 95,
        "isLead": true,
        "ability": "Infiltrator",
        "nature": "Jolly",
        "item": "Choice Specs",
        "teratype": "Ghost",
        "mechanic": "tera",
        "moves": ["Shadow Ball", "Draco Meteor", "U-turn", "Flamethrower"],
        "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 } },
        "help": "高速游击手，用于测试首发速度线和对冲机制"
      },
      {
        "slot": 2,
        "name": "Lucario",
        "nickname": "路卡利欧",
        "lv": 95,
        "ability": "Justified",
        "nature": "Naïve",
        "item": "Lucarionite",
        "mechanic": "mega",
        "mega_target": "lucariomega",
        "moves": ["Close Combat", "Meteor Mash", "Bullet Punch", "Extreme Speed"],
        "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 } },
        "friendship": { "avs": { "passion": 255 } },
         "help": "通过适应力测试与刚猛月月熊的正面对攻"
      },
      {
        "slot": 3,
        "name": "Ting-Lu",
        "nickname": "鼎鹿",
        "lv": 94,
        "ability": "Vessel of Ruin",
        "item": "Leftovers",
        "nature": "Impish",
        "moves": ["Earthquake", "Ruination", "Stealth Rock", "Whirlwind"],
        "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 } },
        "help": "极高耐久，用于测试硬解洗翠黏美龙"
      },
      {
        "slot": 4,
        "name": "Iron Bundle",
        "nickname": "铁包袱",
        "lv": 94,
        "ability": "Quark Drive",
        "item": "Booster Energy",
        "nature": "Timid",
        "moves": ["Freeze-Dry", "Hydro Pump", "Ice Beam", "Flip Turn"],
        "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 } },
        "help": "以快制快，针对劈斧螳螂和大剑鬼"
      },
      {
        "slot": 5,
        "name": "Volcarona",
        "nickname": "火神蛾",
        "lv": 95,
        "ability": "Flame Body",
        "item": "Heavy-Duty Boots",
        "nature": "Modest",
        "mechanic": "zmove",
        "moves": ["Quiver Dance", "Fire Blast", "Bug Buzz", "Giga Drain"],
        "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 } },
        "help": "Z招式爆发点，尝试突破特盾"
      },
      {
        "slot": 6,
        "name": "Dragonite",
        "nickname": "快龙",
        "lv": 96,
        "isAce": true,
        "ability": "Multiscale",
        "item": "Weakness Policy",
        "mechanic": "dynamax",
        "nature": "Adamant",
        "moves": ["Outrage", "Dual Wingbeat", "Extreme Speed", "Dragon Dance"],
        "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 } },
        "friendship": { "avs": { "trust": 250, "devotion": 200 } }
      }
    ]
  },
  "enemy": {
    "name": "Akari (Hisui)",
    "type": "SURVEY_CORPS",
    "id": "akari", 
    "trainerProficiency": 255, 
    "lines": {
      "start": "这种感觉……就像是面对拿着神阖之笛挑战阿尔宙斯的时候一样！来吧！",
      "win": "看来现代的宝可梦对战也很有趣呢！",
      "lose": "多么精彩的配合……你和你的宝可梦之间有着不可思议的纽带。"
    },
    "unlocks": {
      "enable_bond": false,
      "enable_styles": true,
      "enable_insight": true,
      "enable_mega": false,
      "enable_z_move": false,
      "enable_dynamax": false,
      "enable_tera": false
    },
    "party": [
      {
        "name": "Kleavor",
        "lv": 97,
        "isLead": true,
        "gender": "M",
        "nature": "Jolly",
        "ability": "Sharpness",
        "item": "Focus Sash",
        "moves": ["Stone Axe", "X-Scissor", "Close Combat", "Accelerock"],
        "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 } },
        "friendship": { "insight": 200 }
      },
      {
        "name": "Zoroark-Hisui",
        "lv": 95,
        "nature": "Timid",
        "ability": "Illusion",
        "item": "Wise Glasses",
        "moveStylePreference": "agile",
        "moves": ["Shadow Ball", "Hyper Voice", "Sludge Bomb", "Nasty Plot"],
        "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 } },
        "help": "幻觉特性测试：首发时应该会伪装这只队伍的第6只宝可梦(大剑鬼)"
      },
      {
        "name": "Goodra-Hisui",
        "lv": 96,
        "gender": "F",
        "nature": "Calm",
        "ability": "Gooey",
        "item": "Assault Vest",
        "moveStylePreference": "strong",
        "moves": ["Draco Meteor", "Flash Cannon", "Flamethrower", "Dragon Tail"],
        "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 } },
        "friendship": { "trust": 255, "devotion": 200 }
      },
      {
        "name": "Sneasler", 
        "lv": 95,
        "gender": "F",
        "nature": "Jolly", 
        "ability": "Poison Touch",
        "item": "Life Orb",    
        "moveStylePreference": "agile", 
        "moves": ["Dire Claw", "Close Combat", "Shadow Claw", "Fake Out"], 
        "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 } },
        "friendship": { "passion": 230 }
      },
      {
        "name": "Ursaluna",
        "lv": 98,
        "nature": "Brave",
        "ability": "Guts",
        "item": "Flame Orb",
        "moveStylePreference": "strong",
        "moves": ["Facade", "Headlong Rush", "Earthquake", "Fire Punch"],
        "stats_meta": { 
          "ev_level": 252, 
          "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 0 }
        },
        "friendship": { "trust": 200, "passion": 255 } 
      },
      {
        "name": "Samurott-Hisui", 
        "lv": 99,
        "isAce": true,
        "gender": "F",
        "nature": "Adamant",    
        "ability": "Sharpness", 
        "item": "Scope Lens",
        "moves": ["Ceaseless Edge", "Razor Shell", "Sacred Sword", "Aqua Jet"],
        "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 } },
        "friendship": { "trust": 150, "passion": 255, "insight": 255, "devotion": 120 }
      }
    ]
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
