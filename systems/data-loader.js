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
    "name": "{{user}}",
    "unlocks": {
      "enable_bond": true,
      "enable_styles": true,
      "enable_insight": true,
      "enable_mega": true,
      "enable_z_move": true,
      "enable_dynamax": true,
      "enable_tera": true
    },
    "//comment": "为您配备了针对玛俐恶毒队的打击面均衡队伍，平均等级 LV.80",
    "party": [
      {
        "name": "Lucario",
        "lv": 82,
        "gender": "M",
        "item": "Lucarionite",
        "mechanic": "mega",
        "isAce": true,
        "ability": "Justified",
        "nature": "Jolly",
        "stats_meta": { "ev_level": 252 },
        "moves": ["Close Combat", "Meteor Mash", "Bullet Punch", "Swords Dance"]
      },
      {
        "name": "Gardevoir",
        "lv": 80,
        "gender": "F",
        "item": "Choice Scarf",
        "ability": "Pixilate",
        "nature": "Timid",
        "stats_meta": { "ev_level": 252 },
        "moves": ["Hyper Voice", "Psychic", "Moonblast", "Shadow Ball"]
      },
      {
        "name": "Pikachu-Partner",
        "lv": 80,
        "gender": "M",
        "item": "Light Ball",
        "ability": "Static",
        "stats_meta": { "ev_level": 252 },
        "moves": ["Zippy Zap", "Rising Voltage", "Play Rough", "Fake Out"]
      },
      {
        "name": "Togekiss",
        "lv": 78,
        "gender": "F",
        "item": "Leftovers",
        "ability": "Serene Grace",
        "stats_meta": { "ev_level": 200 },
        "moves": ["Air Slash", "Dazzling Gleam", "Thunder Wave", "Roost"]
      },
      {
        "name": "Garchomp",
        "lv": 78,
        "gender": "F",
        "item": "Rocky Helmet",
        "ability": "Rough Skin",
        "nature": "Jolly",
        "stats_meta": { "ev_level": 252 },
        "moves": ["Earthquake", "Dragon Claw", "Stealth Rock", "Stone Edge"]
      },
      {
        "name": "Volcarona",
        "lv": 79,
        "gender": "M",
        "item": "Heavy-Duty Boots",
        "ability": "Flame Body",
        "nature": "Modest", 
        "moves": ["Quiver Dance", "Fiery Dance", "Bug Buzz", "Giga Drain"]
      }
    ]
  },
  "enemy": {
    "id": "marnie_gym",
    "name": "Gym Leader Marnie",
    "type": "trainer", 
    "tier": 3, 
    "lines": {
      "start": "想在尖钉镇撒野？我和我的伙伴们可不会袖手旁观！",
      "gmax_trigger": "还没完呢……虽然有点丢人，但这招是为了赢！去吧，极巨化！",
      "win": "看来你也只是这种程度而已……没受伤吧？",
      "lose": "呜……居然还是输了……（不甘心地咬着嘴唇）",
      "escape": "怎么？被这里的气势吓到了？"
    },
    "unlocks": {
        "enable_mega": false,
        "enable_z_move": false,
        "enable_dynamax": true, // 核心机制：G-Max
        "enable_tera": false
    }
  },
  
  "//comment": "玛俐经典的 6v6 阵容 (Shadow/Dark Core)",
  "party": [
    {
      "name": "Liepard",
      "lv": 76,
      "gender": "F",
      "ability": "Prankster",
      "item": "Focus Sash", // 气腰首发
      "nature": "Jolly",
      "stats_meta": { "ev_level": 252 },
      "moves": ["Fake Out", "Thunder Wave", "Ensore", "Play Rough"]
    },
    {
      "name": "Scrafty",
      "lv": 77,
      "gender": "M",
      "ability": "Intimidate",
      "item": "Roseli Berry", // 抗妖果
      "stats_meta": { "ev_level": 200 },
      "moves": ["Close Combat", "Crunch", "Ice Punch", "Poison Jab"]
    },
    {
      "name": "Toxicroak",
      "lv": 77,
      "gender": "M",
      "ability": "Dry Skin",
      "item": "Life Orb",
      "moves": ["Gunk Shot", "Drain Punch", "Sucker Punch", "Swords Dance"]
    },
    {
      "name": "Morpeko",
      "lv": 78,
      "gender": "F",
      "ability": "Hunger Switch",
      "item": "Choice Band",
      "moves": ["Aura Wheel", "Seed Bomb", "Pseudon", "Parting Shot"]
    },
    {
      "name": "Umbreon",
      "lv": 79,
      "gender": "M",
      "ability": "Synchronize",
      "item": "Leftovers",
      "moves": ["Foul Play", "Wish", "Protect", "Yawn"]
    },
    {
      "//comment": "最后的底牌：超极巨长毛巨魔",
      "name": "Grimmsnarl",
      "lv": 80,
      "gender": "M",
      "isAce": true, 
      "mechanic": "dynamax",
      "mega_target": "grimmsnarlgmax",
      "ability": "Prankster",
      "item": "Light Clay", 
      "stats_meta": { "ev_level": 252 }, 
      "//comment": "精神冲击 -> G-Max Snooze; 全力一击 -> Max Starfall",
      "moves": ["Spirit Break", "Darkest Lariat", "Thunder Wave", "Bulk Up"]
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
