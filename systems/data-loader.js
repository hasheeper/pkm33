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
  "script": {
    "module": "status_logic_v2"
  },
  "player": {
    "name": "YOTA (Sleep Walker)",
    "party": [
      {
        "slot": 1,
        "name": "Komala",
        "nickname": "睡神🐨",
        "lv": 100,
        "ability": "Comatose", 
        "item": "Leftovers", 
        "moves": ["Last Resort", "Sleep Talk", "Sucker Punch", "Wood Hammer"],
        "stats_meta": { "ev_level": 252 },
        "//comment": "测试核心1：【绝对睡眠 (Comatose)】- 能行动，但也被视为睡着（应吃食梦伤害，应吃如梦魇伤害，免疫哈欠）"
      },
      {
        "slot": 2,
        "name": "Milotic",
        "lv": 100,
        "item": "Flame Orb", 
        "ability": "Marvel Scale", 
        "moves": ["Rest", "Sleep Talk", "Scald", "Dragon Tail"],
        "//comment": "测试核心2：【睡觉+梦话】Combo，以及【神奇鳞片】睡着加防御"
      },
      {
        "slot": 3,
        "name": "Ursaluna",
        "lv": 100,
        "item": "Flame Orb",
        "ability": "Guts",
        "moves": ["Facade", "Rest", "Sleep Talk", "Headlong Rush"],
        "mechanic": "tera",
        "teraType": "Normal",
        "//comment": "测试核心3：毅力特性(Guts)下烧伤变睡觉，攻击力是否保持？"
      }
    ]
  },
  "enemy": {
    "name": "The Nightmare Host (梦境吞噬者)",
    "type": "trainer",
    "party": [
      {
        "name": "Darkrai",
        "lv": 100,
        "ability": "Bad Dreams", 
        "item": "Wide Lens",
        "moves": ["Dream Eater", "Dark Void", "Nasty Plot", "Sludge Bomb"],
        "//comment": "判定点：特性【梦魇】每回合末是否扣Komala血？【食梦】打Komala是否生效？"
      },
      {
        "name": "Exploud",
        "lv": 100,
        "ability": "Scrappy",
        "item": "Choice Specs",
        "mechanic": "tera",
        "teraType": "Normal",
        "moves": ["Boomburst", "Uproar", "Overheat", "Focus Blast"],
        "//comment": "判定点：使用【吵闹 (Uproar)】后，我方睡觉的单位是否被强制唤醒？Komala是否不受影响？"
      },
      {
        "name": "Gengar",
        "lv": 100,
        "ability": "Cursed Body", 
        "item": "Black Sludge",
        "mechanic": "mega",
        "mega_target": "gengarmega",
        "moves": ["Hypnosis", "Hex", "Sludge Wave", "Destiny Bond"],
        "//comment": "判定点：【祸不单行 (Hex)】打睡着的伤害加倍判定"
      }
    ],
    "lines": {
      "start": "在永恒者面前，清醒是最大的诅咒。",
      "win": "嘘……那是永远的长眠。",
      "lose": "太吵了……把灯关上……",
      "escape": "你逃不出梦境的边缘。"
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
