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
  "player": {
    "name": "player",
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
        "name": "Lucario",
        "lv": 100,
        "gender": "M",
        "item": "Lucarionite",
        "isAce": true, 
        "mechanic": "mega",
        "ability": "Justified",
        "moves": ["Close Combat", "Meteor Mash", "Bullet Punch", "Aura Sphere"],
        "stats_meta": { "ev_level": 252 },
        "avs": { "trust": 255, "passion": 255, "insight": 255, "devotion": 255 }
      },
      {
        "name": "Pikachu-Partner",
        "lv": 100,
        "gender": "M",
        "item": "Pikashunium Z",
        "isAce": true,
        "mechanic": "zmove",
        "ability": "Static",
        "//comment": "Thunderbolt 将被这里的 Z 纯晶自动升级为 10,000,000 Volt Thunderbolt",
        "moves": ["Thunderbolt", "Quick Attack", "Iron Tail", "Electroweb"], 
        "stats_meta": { "ev_level": 252 },
        "avs": { "trust": 255, "passion": 255, "insight": 255, "devotion": 255 }
      },
      {
        "name": "Charizard",
        "lv": 100,
        "gender": "M",
        "item": "Life Orb",
        "isAce": true,
        "mechanic": "dynamax",
        "mega_target": "charizardgmax",
        "ability": "Solar Power",
        "moves": ["Blast Burn", "Hurricane", "Solar Beam", "Ancient Power"],
        "stats_meta": { "ev_level": 252 },
        "avs": { "trust": 255, "passion": 255, "insight": 255, "devotion": 255 }
      },
      {
        "name": "Dragonite",
        "lv": 100,
        "gender": "F",
        "item": "Leftovers",
        "isAce": true,
        "mechanic": "tera",
        "teraType": "Normal",
        "ability": "Multiscale",
        "moves": ["Extreme Speed", "Dragon Dance", "Earthquake", "Thunder Punch"],
        "stats_meta": { "ev_level": 252 },
        "avs": { "trust": 255, "passion": 255, "insight": 255, "devotion": 255 }
      },
      {
        "name": "Zoroark-Hisui",
        "lv": 100,
        "gender": "M",
        "item": "Focus Sash",
        "isAce": true,
        "mechanic": null,
        "ability": "Illusion",
        "moves": ["Bitter Malice", "Nasty Plot", "Hyper Voice", "Grass Knot"],
        "stats_meta": { "ev_level": 252 },
        "avs": { "trust": 255, "passion": 255, "insight": 255, "devotion": 255 }
      },
      {
        "name": "Greninja",
        "lv": 100,
        "gender": "M",
        "item": "Choice Specs",
        "isAce": true,
        "mechanic": null,
        "ability": "Battle Bond",
        "moves": ["Water Shuriken", "Dark Pulse", "Ice Beam", "U-turn"],
        "stats_meta": { "ev_level": 252 },
        "avs": { "trust": 255, "passion": 255, "insight": 255, "devotion": 255 }
      }
    ]
  },
  "enemy": {
    "id": "Red",
    "name": "Trainer Legend Red",
    "type": "trainer",
     "lines": {
      "start": "...",
      "win": "...!",
      "lose": "...",
      "escape": "..."
    },
    "unlocks": {
        "enable_bond": true,
        "enable_styles": true,
        "enable_insight": true,
        "enable_mega": true,
        "enable_z_move": true,
        "enable_dynamax": true,
        "enable_tera": true
    }
  },
  "party": [
    {
      "name": "Koraidon",
      "lv": 100,
      "item": "Clear Amulet",
      "mechanic": "tera",
      "teraType": "Fire",
      "ability": "Orichalcum Pulse",
      "moves": ["Collision Course", "Flare Blitz", "Dragon Claw", "Swords Dance"],
      "stats_meta": { "ev_level": 252 }
    },
    {
      "name": "Groudon-Primal",
      "lv": 100,
      "item": "Red Orb",
      "mechanic": null,
      "ability": "Desolate Land",
      "moves": ["Precipice Blades", "Fire Punch", "Solar Beam", "Stone Edge"],
      "stats_meta": { "ev_level": 252 }
    },
    {
      "name": "Necrozma-Ultra",
      "lv": 100,
      "item": "Ultranecrozium Z",
      "mechanic": "zmove",
      "ability": "Neuroforce",
      "moves": ["Photon Geyser", "Dragon Pulse", "Heat Wave", "Calm Mind"],
      "stats_meta": { "ev_level": 252 }
    },
    {
      "name": "Snorlax",
      "lv": 100,
      "item": "Figy Berry",
      "mechanic": "dynamax",
      "mega_target": "snorlaxgmax",
      "ability": "Gluttony",
      "moves": ["Body Slam", "Darkest Lariat", "Curse", "Recycle"],
      "stats_meta": { "ev_level": 252 },
      "avs": { "trust": 150, "passion": 100, "insight": 100, "devotion": 200 }
    },
    {
      "name": "Zacian-Crowned",
      "lv": 100,
      "item": "Rusted Sword",
      "ability": "Intrepid Sword",
      "moves": ["Behemoth Blade", "Play Rough", "Sacred Sword", "Swords Dance"],
      "stats_meta": { "ev_level": 252 }
    },
    {
      "name": "Mewtwo",
      "lv": 100,
      "item": "Mewtwonite Y",
      "mechanic": "mega",
      "ability": "Insomnia",
      "moves": ["Psystrike", "Ice Beam", "Focus Blast", "Recover"],
      "isAce": true, 
      "avs": { "passion": 200, "insight": 200, "trust": 200, "devotion": 200 }
    }
  ]
};

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
