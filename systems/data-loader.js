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
  "difficulty": "normal",
  "settings": {
    "enableAVS": true,
    "enableEVO": true,
    "enableSFX": true,
    "enableBGM": true,
    "enableClash": false,
    "debugMode": true
  },
  "player": {
    "name": "Mechanic Tester",
    "trainerProficiency": 255,
    "unlocks": {
      "enable_mega": true,
      "enable_z_move": true,
      "enable_dynamax": true,
      "enable_tera": true
    },
    "party": [
      {
        "slot": 1,
        "name": "Morpeko",
        "nickname": "饿饿鼠",
        "lv": 100,
        "isLead": true,
        "ability": "Hunger Switch",
        "item": "Focus Sash",
        "nature": "Jolly",
        "isAce": true,
        "moves": ["Aura Wheel", "Protect", "Seed Bomb", "Parting Shot"],
        "stats_meta": { "ev_level": 252 },
        "friendship": { "avs": { "insight": 200 } }
      },
      {
        "slot": 2,
        "name": "Palafin",
        "nickname": "想做英雄",
        "lv": 100,
        "ability": "Zero to Hero",
        "item": "Mystic Water",
        "mechanic": "tera",
        "teraType": "Water",
        "moves": ["Flip Turn", "Jet Punch", "Wave Crash", "Protect"],
        "stats_meta": { "ev_level": 252 }
      },
      {
        "slot": 3,
        "name": "Darmanitan-Galar",
        "nickname": "达摩不倒",
        "lv": 100,
        "ability": "Zen Mode",
        "item": "Salac Berry",
        "nature": "Jolly",
        "moves": ["Belly Drum", "Ice Punch", "Earthquake", "Flare Blitz"],
        "stats_meta": { "ev_level": 252 },
        "friendship": { "avs": { "passion": 255 } }
      },
      {
        "slot": 4,
        "name": "Aegislash",
        "nickname": "圣剑",
        "lv": 100,
        "ability": "Stance Change",
        "item": "Leftovers",
        "nature": "Quiet",
        "moves": ["Shadow Ball", "King's Shield", "Flash Cannon", "Close Combat"],
        "stats_meta": { "ev_level": 252 },
        "friendship": { "avs": { "trust": 255 } }
      },
      {
        "slot": 5,
        "name": "Eiscue",
        "nickname": "物理免疫盾",
        "lv": 100,
        "ability": "Ice Face",
        "item": "Sitrus Berry",
        "mechanic": "dynamax",
        "nature": "Jolly",
        "moves": ["Belly Drum", "Liquidation", "Icicle Crash", "Reversal"],
        "stats_meta": { "ev_level": 252 }
      }
    ]
  },
  "enemy": {
    "name": "System QA",
    "type": "TEST_BOT",
    "difficulty": "expert",
    "trainerProficiency": 100,
    "unlocks": { "enable_mega": true },
    "party": [
      {
        "name": "Abomasnow",
        "nickname": "雪天测试员",
        "lv": 100,
        "isLead": true,
        "ability": "Snow Warning",
        "item": "Icy Rock",
        "moves": ["Ice Shard", "Wood Hammer", "Aurora Veil", "Blizzard"],
        "//comment": "Ice Shard 用于测试冰砌鹅的物理破防，Snow Warning 用于测试冰砌鹅的头部恢复"
      },
      {
        "name": "Weavile",
        "nickname": "高速测试员",
        "lv": 100,
        "ability": "Pickpocket",
        "moves": ["Fake Out", "Knock Off", "Ice Spinner", "Low Kick"]
      }
    ],
    "lines": {
      "start": "系统测试模式启动。主要测试目标：状态变化逻辑、特性触发时机。",
      "win": "功能测试结束。所有逻辑判定均已完成。",
      "lose": "系统错误？...不，这只是机制被完美利用了。"
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
