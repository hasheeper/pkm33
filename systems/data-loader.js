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
  "mode": "1v1",
  "difficulty": "expert",
  
  "script": {
    "backgroundId": "bg_gym_fighting",
    "bgm": "battle_gym_leader", 
    "battleMsg": "对手看穿了'球'类技能的轨迹！"
  },

  // ===================================
  // PLAYER SIDE: 幽灵系特攻手
  // ===================================
  "player": {
    "name": "Ghost Hunter",
    "title": "Elite Trainer",
    "avatar": "visual_hex_maniac",
    
    "unlocks": {
        "enable_bond": false,
        "enable_styles": true,       
        "enable_insight": false,
        "enable_mega": true,         // 允许 Mega 进化改变战局
        "enable_tera": true,
        "enable_dynamax": false
    },

    "party": [
      {
        "index": 0,
        "name": "Gengar",
        "cnName": "耿鬼",
        "lv": 50,
        "item": "Gengarite",  // 携带了 Mega 石
        "ability": "Cursed Body", 
        "nature": "Timid",
        "stats_meta": { "ev_level": 252, "ivs_fixed": 31 },
        
        // 【陷阱配置】
        // 这是一个非常经典的萌新杀手配招。
        // 看起来打击面还可以，但在特定特性面前会完全哑火。
        "moves": [
            "Shadow Ball",   // 暗影球 (鬼) - 有效但被防弹免疫
            "Sludge Bomb",   // 污泥炸弹 (毒) - 本系克制，但因为也是Bomb类及其被防弹免疫
            "Focus Blast",   // 真气弹 (斗) - 很多耿鬼带这个补盲，但Blast也是球类，免疫！
            "Dazzling Gleam" // 魔法闪耀 (妖) - 非球类技能 (唯一解！或者 Mega 后赌踩影换其他机制？不，仅仅是由于 Mega 提升了特攻暴力突破)
        ]
      }
    ]
  },

  // ===================================
  // ENEMY SIDE: “防弹”要塞图
  // ===================================
  "enemy": {
    "id": "veteran_wikstrom",
    "name": "Wikstrom",
    "title": "Anti-Ball Expert",
    "avatar": "elite_four_wikstrom", 
    "difficulty": "expert",

    "lines": {
      "start": "不论是炮弹还是暗影之球，我的铠甲都坚不可摧！",
      "win": "看来你的火力还无法穿透名为‘特性’的绝对防御。",
      "lose": "什么？竟然绕过了正面的防御判定？！",
      "ability_trigger": "哼... 这种球技对防弹铠甲是无效的！"
    },

    // 敌人不需要花里胡哨的解锁，只需要硬数值和特性
    "unlocks": {
        "enable_bond": false,         
        "enable_styles": true,
        "enable_insight": true, // 增加他的回避底数，更难打
        "enable_mega": false,
        "enable_dynamax": false
    },

    "party": [
      {
        // [绝对防御墙 - 防弹布里卡隆]
        "index": 0,
        "name": "Chesnaught",
        "cnName": "布里卡隆",
        // Lv.55 稍微压制你 Lv.50，让你不能依赖等级碾压
        "lv": 55, 
        "item": "Leftovers",     // 剩饭回血
        "ability": "Bulletproof", // 【核心机制】免疫球/弹类技能
        "nature": "Impish",      //  加物防，特防修正一般，引诱你用特攻打
        
        // 努力值为全耐久向，让你用 Dazzling Gleam 这种非本系也要打几下
        "stats_meta": { 
            "evs": { "hp": 252, "atk": 4, "def": 128, "spa": 0, "spd": 124, "spe": 0 }
        },

        // AVs 系统：高度信赖(加硬度) + Devotion (回血)
        // 让你即使换了技能也像是在打BOSS
        "avs": { 
            "trust": 200,    // 极高概率锁血 1HP
            "devotion": 150  // 偶尔解除异常并回血
        }, 

        "moves": [
            "Leech Seed",    // 寄生种子 - 让你掉血回他血，增加在此场战斗的时长
            "Spiky Shield",  // 尖刺防守 - 摸我就扣血
            "Body Press",    // 扑击 - 用超高的物防计算伤害
            "Synthesis"      // 光合作用 - 绝望的回复
        ],
        
        "//ai_logic": "这是一道考题。如果玩家一直用 Shadow Ball / Sludge Bomb，就在他们PP耗尽前磨死他们。"
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
