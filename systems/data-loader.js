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
    "module": "status_monitor",
    "log_sleep_turns": true // 开启睡眠回合数详细日志追踪
  },

  "player": {
    "name": "YOTA (Sleep Master)",
    // 玩家采用【催眠控制 + 梦魇削血 + 睡觉满血复活】战术
    "party": [
      {
        "slot": 1,
        "name": "Breloom", 
        "nickname": "蘑漫",
        "lv": 100,
        "gender": "M",
        "nature": "Jolly",
        "ability": "Technician",
        "item": "Focus Sash", // 气势披带：确保能活下来放出一发必中的蘑菇孢子
        "moves": ["Spore", "Yawn", "Bullet Seed", "Rock Tomb"],
        "avs": { "insight": 200 }, // 提升命中相关判定，虽孢子是必中
        "stats_meta": { "ev_level": 252 },
        "//comment": "核心机制：【蘑菇孢子 (Spore)】- 唯一的100%命中率睡眠技"
      },
      {
        "slot": 2,
        "name": "Darkrai",
        "lv": 100,
        "gender": "N",
        "nature": "Timid",
        "ability": "Bad Dreams", // 核心特性：梦魇 - 每回合扣除睡眠对手 1/8 HP
        "item": "Wide Lens", // 广角镜：提升神出鬼没的【黑洞/催眠术】命中率
        "mechanic": "tera",
        "teraType": "Poison", // 既然是恶魔，太晶毒防格斗
        "moves": ["Dark Void", "Dream Eater", "Nasty Plot", "Sludge Bomb"],
        "//comment": "核心机制：【梦魇 + 食梦】 - 睡眠Combo流"
      },
      {
        "slot": 3,
        "name": "Snorlax",
        "lv": 100,
        "gender": "M",
        "nature": "Adamant",
        "ability": "Thick Fat",
        "item": "Chesto Berry", // 核心道具：零余果
        "mechanic": "dynamax", // 极巨化卡比兽超硬
        "moves": ["Rest", "Belly Drum", "Body Slam", "Heavy Slam"],
        "avs": { "devotion": 255 }, // 根性极高
        "stats_meta": { "ev_level": 252 },
        "//comment": "核心机制：【睡觉 (Rest) + 零余果 (Chesto Berry)】 - 瞬间满血苏醒Buff"
      }
    ]
  },

  "enemy": {
    "name": "Awakened Guardian (守夜人)",
    "type": "trainer",
    "lines": {
      "start": "在此领域之中，无人可以闭眼沉睡。",
      "win": "永远的警惕是生存的代价。",
      "lose": "好吧……我想我也该……休息一下了……(Zzz)",
      "escape": "就算是噩梦也无法追上我。"
    },
    // 敌方配置完全针对睡眠免疫构建
    "party": [
      {
        "name": "Primeape",
        "lv": 100,
        "gender": "M",
        "ability": "Vital Spirit", // [特质] 干劲：100%免疫睡眠，蘑菇孢子无效
        "item": "Choice Scarf", // 讲究围巾：高速压制
        "moves": ["Close Combat", "U-turn", "Ice Punch", "Gunk Shot"],
        "stats_meta": { "ev_level": 252 },
        "//comment": "Counter机制 1：【干劲】特性"
      },
      {
        "name": "Tapu Koko",
        "lv": 100,
        "gender": "N",
        "ability": "Electric Surge", // [场地] 电气制造者：开场布置电气场地，地面的大家都不准睡觉
        "item": "Life Orb",
        "moves": ["Thunderbolt", "Dazzling Gleam", "U-turn", "Roost"],
        "mechanic": "zmove", // 允许这种守卫神使用Z
        "stats_meta": { "ev_level": 252 },
        "//comment": "Counter机制 2：【电气场地】 - 环境锁死睡眠状态"
      },
      {
        "name": "Garganacl", 
        "lv": 100,
        "gender": "M",
        "nature": "Careful",
        "ability": "Purifying Salt", // [特质] 洁净之盐：Gen9新特性，免疫所有异常状态（含睡眠）
        "item": "Leftovers",
        "mechanic": "tera", 
        "teraType": "Ghost", // 著名的太晶鬼盐石巨灵
        "moves": ["Salt Cure", "Recover", "Iron Defense", "Body Press"],
        "stats_meta": { "ev_level": 252 },
        "//comment": "Counter机制 3：【洁净之盐】 - 异常状态免疫"
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
