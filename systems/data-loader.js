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
    "name": "TEST_Regigigas",
    "unlocks": { "enable_mega": false, "enable_z_move": false, "enable_dynamax": true, "enable_tera": true },
    "party": [
      {
        "name": "Regigigas",
        "lv": 100,
        "gender": "N",
        "item": "Life Orb",
        "ability": "Slow Start",
        "//comment": "代码没实现特性=当前为全盛状态。物攻160，速度100。携带生命玉暴力输出。",
        "moves": ["Crush Grip", "Earthquake", "Thunder Punch", "Drain Punch"],
        "stats_meta": { "ev_level": 252 },
        "avs": { "kindness": 0, "passion": 200, "insight": 200 }
      }
    ]
  },
  "enemy": {
    "id": "Meta_Slaves",
    "name": "Tournament Champ",
    "type": "trainer",
    "lines": {
      "start": "Regigigas? That Pokemon is useless garbage! Easy win!",
      "win": "See? Too slow.",
      "lose": "Wait... why were you faster than my Urshifu?!",
      "escape": "Running away?"
    },
    "unlocks": { "enable_dynamax": false, "enable_tera": true },
    "party": [
      {
        "name": "Urshifu-Rapid-Strike",
        "lv": 80,
        "gender": "M",
        "item": "Choice Scarf",
        "//comment": "恶熊速度种族97。马桶王速度种族100。如果没有没慢启动，马桶王竟然比恶熊快！这是决定性的。",
        "moves": ["Surging Strikes", "Close Combat", "Aqua Jet", "U-turn"],
        "stats_meta": { "ev_level": 252 }
      },
      {
        "name": "Gholdengo",
        "lv": 70,
        "gender": "N",
        "Item": "Leftovers",
        "ability": "Good as Gold",
        "//comment": "赛富豪速度84。会被一发地震直接带走。",
        "moves": ["Make It Rain", "Shadow Ball", "Nasty Plot", "Recover"],
        "stats_meta": { "ev_level": 252 }
      },
      {
        "name": "Ting-Lu",
        "lv": 75,
        "gender": "N",
        "item": "Leftovers",
        "ability": "Vessel of Ruin",
        "//comment": "古鼎鹿，超级肉盾。但在 160 物攻的吸收拳下也是血包。",
        "moves": ["Earthquake", "Ruination", "Stealth Rock", "Whirlwind"],
        "stats_meta": { "ev_level": 252 }
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
