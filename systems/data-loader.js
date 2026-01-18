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
  "difficulty": "pvp_sim", 
  "settings": {
    "enableAVS": false,
    "enableCommander": false,
    "enableEVO": true,
    "enableBGM": true,
    "enableSFX": true,
    "enableClash": true
  },
  "player": {
    "name": "ConfusedTrainer",
    "trainerProficiency": 150,
    "unlocks": {
      "enable_mega": false,
      "enable_z_move": false,
      "enable_styles": false,
      "enable_bond": false,
      "enable_tera": true,
      "enable_dynamax": false
    },
    "party": [
      {
        "slot": 1,
        "name": "Incineroar",
        "nickname": "宇宙第一虎",
        "lv": 50,
        "item": "Sitrus Berry",
        "mechanic": "none",
        "ability": "Intimidate",
        "nature": "Adamant",
        "isAce": true,
        "moves": [
          "Fake Out",
          "Flare Blitz",
          "Knock Off",
          "Parting Shot"
        ],
        "stats_meta": {
          "ev_level": 252,
          "ivs": { "spe": 31 }
        },
        "friendship": {
          "avs": {
            "passion": 200,
            "trust": 200
          }
        }
      }
    ]
  },
  "enemy": {
    "name": "Ranked Opponent",
    "type": "VETERAN",
    "trainerProficiency": 200,
    "unlocks": {
      "enable_mega": false,
      "enable_z_move": false,
      "enable_bond": false,
      "enable_styles": false,
      "enable_tera": true,
      "enable_dynamax": false
    },
    "party": [
      {
        "name": "Mismagius",
        "nickname": "梦妖魔",
        "lv": 50,
        "ability": "Levitate",
        "nature": "Timid",
        "mechanic": "tera",
        "teraType": "Fairy",
        "forceTeraTurn": 1,
        "moves": [
            "Dazzling Gleam", 
            "Shadow Ball", 
            "Mystical Fire", 
            "Protect"
        ],
        "stats_meta": { 
            "ev_level": 252,
            "evs": { "spe": 252, "spa": 252, "hp": 4 }
        },
        "friendship": { "avs": { "trust": 255 } }
      }
    ],
    "lines": {
      "start": "如果你以为仅仅是属性克制关系就能获胜，那就大错特错了！",
      "lose": "好吧，这就是威吓加击掌奇袭的威力吗……",
      "win": "这就是道具隐密斗篷的效果，长见识了吗？"
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
