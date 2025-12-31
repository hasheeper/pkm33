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
  "script": null,

  "//PLAYER_SECTION": " (Player section kept as is from your prompt) ",
  "player": {
    "name": "Red",
    "unlocks": {
      "enable_bond": true,
      "enable_styles": true,
      "enable_insight": true,
      "enable_mega": true,
      "enable_z_move": true,
      "enable_dynamax": true,
      "enable_tera": true
    },
    "party": [
      {
        "name": "Pikachu-Partner",
        "lv": 100,
        "gender": "M",
        "item": "Pikashunium Z",
        "mechanic": "zmove",
        "ability": "Static",
        "isAce": true,
        "moves": ["Thunderbolt", "Quick Attack", "Iron Tail", "Electroweb"],
        "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 } },
        "avs": { "trust": 255, "passion": 255, "insight": 255, "devotion": 255 }
      },
      {
        "name": "Mewtwo",
        "lv": 100,
        "gender": "N",
        "item": "Mewtwonite Y",
        "mechanic": "mega",
        "mega_target": "mewtwomegay",
        "ability": "Unnerve",
        "moves": ["Psystrike", "Ice Beam", "Focus Blast", "Recover"],
        "stats_meta": { "ev_level": 252 },
        "avs": { "trust": 200, "passion": 200 }
      },
      {
        "name": "Greninja",
        "lv": 100,
        "gender": "M",
        "item": "Choice Specs",
        "mechanic": null,
        "ability": "Battle Bond",
        "moves": ["Water Shuriken", "Dark Pulse", "Ice Beam", "U-turn"],
        "stats_meta": { "ev_level": 252 },
        "avs": { "trust": 220, "insight": 200 }
      },
      {
        "name": "Koraidon",
        "lv": 100,
        "gender": "N",
        "item": "Clear Amulet",
        "mechanic": "tera",
        "teraType": "Fire",
        "ability": "Orichalcum Pulse",
        "moves": ["Collision Course", "Flare Blitz", "Dragon Claw", "Swords Dance"],
        "stats_meta": { "ev_level": 252 },
        "avs": { "passion": 255 }
      },
      {
        "name": "Necrozma-Dusk-Mane",
        "lv": 100,
        "gender": "N",
        "item": "Ultranecrozium Z",
        "mechanic": "mega",
        "mega_target": "necrozmaultra",
        "ability": "Prism Armor",
        "moves": ["Photon Geyser", "Sunsteel Strike", "Earthquake", "Swords Dance"],
        "stats_meta": { "ev_level": 252 },
        "avs": { "devotion": 200, "trust": 200 }
      },
      {
        "name": "Charizard",
        "lv": 100,
        "gender": "M",
        "nature": "Timid",
        "item": "Heavy-Duty Boots",
        "mechanic": "dynamax",
        "mega_target": "charizardgmax",
        "ability": "Solar Power",
        "moves": ["Blast Burn", "Hurricane", "Solar Beam", "Roost"],
        "stats_meta": { "ev_level": 252 },
        "avs": { "passion": 255, "insight": 100 }
      }
    ]
  },

  "//ENEMY_SECTION": "================ 敌方(Gloria)配置 [OPTIMIZED] ==================",
  "enemy": {
    "id": "gloria",
    "name": "Champion Gloria",
    "title": "Galar Champion",
    "lines": {
      "start": "Let's seem them... the bonds we've forged in Galar!",
      "win": "That was a proper good battle! Let's make some curry to celebrate!",
      "lose": "What a shocker... You really are strong!",
      "escape": "Off to camp, are we?",
      "gmax_trigger": "Time to go big or go home! Dynamax!"
    },
    "unlocks": {
        "enable_bond": false,
        "enable_styles": false,
        "enable_insight": false,
        "enable_mega": false,
        "enable_z_move": false,
        "//note": "Gloria is restricted to Dynamax only to match her region gimmick",
        "enable_dynamax": true,
        "enable_tera": false
    }
  },
  "party": [
    {
      "name": "Zacian-Crowned",
      "lv": 100,
      "gender": "N",
      "nature": "Adamant",
      "ability": "Intrepid Sword",
      "item": "Rusted Sword",
      "isAce": true, 
      "mechanic": null,
      "stats_meta": {
        "is_perfect": true,
        "ev_level": 252
      },
      "moves": [
        "Behemoth Blade", 
        "Play Rough", 
        "Close Combat", 
        "Swords Dance"
      ],
      "avs": { "trust": 255, "passion": 255, "insight": 200, "devotion": 150 }
    },
    {
      "name": "Cinderace",
      "lv": 100,
      "gender": "M",
      "nature": "Jolly",
      "ability": "Libero",
      "item": "Life Orb",
      "mechanic": "dynamax",
      "//mega_target": "Force G-Max form to access G-Max Fireball (ignores abilities)",
      "mega_target": "cinderacegmax",
      "stats_meta": { "ev_level": 252 },
      "moves": [
        "Pyro Ball", 
        "Bounce", 
        "Court Change", 
        "Sucker Punch"
      ],
      "avs": { "trust": 150, "passion": 230 }
    },
    {
      "name": "Urshifu-Rapid-Strike",
      "lv": 100,
      "gender": "M",
      "nature": "Jolly",
      "ability": "Unseen Fist",
      "item": "Focus Sash",
      "//note": "Changed to Sash to guarantee at least one hit or trade",
      "mechanic": "dynamax",
      "mega_target": "urshifugmax",
      "stats_meta": { "ev_level": 252 },
      "moves": [
        "Surging Strikes", 
        "Close Combat", 
        "Ice Punch", 
        "Aqua Jet"
      ],
      "avs": { "passion": 180, "trust": 80 }
    },
    {
      "name": "Rillaboom",
      "lv": 100,
      "gender": "M",
      "nature": "Adamant",
      "ability": "Grassy Surge",
      "item": "Grassy Seed",
      "mechanic": "dynamax",
      "mega_target": "rillaboomgmax",
      "stats_meta": { "ev_level": 252 },
      "moves": [
        "Grassy Glide", 
        "Drum Beating", 
        "High Horsepower", 
        "U-turn"
      ],
      "avs": { "devotion": 150 }
    },
    {
      "name": "Corviknight",
      "lv": 100,
      "gender": "M",
      "nature": "Impish",
      "ability": "Mirror Armor",
      "item": "Leftovers",
      "mechanic": "dynamax",
      "mega_target": "corviknightgmax",
      "stats_meta": { "ev_level": 252 },
      "moves": [
        "Brave Bird", 
        "Body Press", 
        "Roost", 
        "Iron Defense"
      ],
      "avs": { "trust": 220, "devotion": 200 }
    },
    {
      "name": "Skwovet",
      "lv": 100,
      "gender": "F",
      "nature": "Relaxed",
      "ability": "Cheek Pouch",
      "item": "Sitrus Berry",
      "mechanic": "dynamax",
      "//note": "The ultimate defensive wall meme bracket",
      "stats_meta": { "ev_level": 255 },
      "moves": [
        "Super Fang", 
        "Stuff Cheeks", 
        "Body Slam", 
        "Stockpile"
      ],
      "avs": { "insight": 255, "devotion": 255, "trust": 255, "passion": 255 }
    }
  ]
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
