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
  "mode": "6v6",
  "difficulty": "expert",
  
  "script": {
    "backgroundId": "bg_pwt_finals_stage",
    "bgm": "music_rosa_champion_remix", 
    "weather": null
  },

  // ===================================
  // PLAYER SIDE: 主角的全明星阵容
  // ===================================
  "player": {
    "name": "Challenger",
    "title": "World Coronation Champ",
    "avatar": "player_master_style",
    
    "unlocks": {
        "enable_bond": true,         // 对等原则：对抗罗莎的Devotion
        "enable_styles": true,       // 需要利用迅疾战术破 Delibird 的气腰同命
        "enable_insight": true,      // 必须开启命中修正，否则打不中回避流君主蛇
        "enable_mega": true,         // 解锁 Mega 烈咬陆鲨/路卡利欧对抗数值怪
        "enable_tera": true,
        "enable_dynamax": false
    },

    "party": [
      {
        // [MVP 刺客 - 专门处理超高速和气腰]
        "index": 0,
        "name": "Meowscarada",
        "cnName": "魔幻假面喵",
        "lv": 95,
        "item": "Focus Sash", // 气腰针对罗莎的高爆发
        "ability": "Protean (Legacy)",
        "nature": "Jolly",
        "moves": ["Flower Trick", "Triple Axel", "U-turn", "Sucker Punch"], 
        "//comment": "Triple Axel 多段破气腰是打 Emboar 和 Delibird 的神器。",
        "stats_meta": { "ev_level": 252 },
        "avs": { "trust": 220, "passion": 220 }
      },
      {
        // [特攻核弹 - 强杀君主蛇]
        "index": 1,
        "name": "Delphox",
        "cnName": "妖火红狐",
        "lv": 95,
        "ability": "Magic Guard", 
        "item": "Life Orb", 
        "nature": "Timid",
        "moves": ["Mind Blown", "Psychic", "Mystical Fire", "Dazzling Gleam"],
        "//comment": "专门留给 Serperior 的。火抗草，魔法火焰降特攻。",
        "stats_meta": { "ev_level": 252 }
      },
      {
        // [御三家内战 - 水盾]
        "index": 2,
        "name": "Primarina",
        "cnName": "西狮海壬",
        "lv": 94,
        "item": "Leftovers",
        "ability": "Liquid Voice Pro", 
        "nature": "Modest",
        "moves": ["Boomburst", "Moonblast", "Calm Mind", "Aqua Jet"],
        "stats_meta": { "ev_level": 252 }
      },
      {
        // [物理反制 / 终结者]
        "index": 3,
        "name": "Lucario",
        "cnName": "路卡利欧",
        "lv": 94,
        "ability": "Justified", 
        "item": "Lucarionite", // Mega手之一
        "nature": "Jolly",
        "moves": ["Close Combat", "Meteor Mash", "Bullet Punch", "Extreme Speed"], 
        "//comment": "Mega后的适应力(Adaptability)神速，收割合众的脆皮猴子。",
        "stats_meta": { "ev_level": 252 }
      },
      {
        // [龙神降临 / 应对炎武王]
        "index": 4,
        "name": "Garchomp",
        "cnName": "烈咬陆鲨",
        "lv": 95,
        "ability": "Rough Skin",
        "item": "Rocky Helmet", // 专门让炎武王(Reckless)撞死
        "nature": "Jolly",
        "moves": ["Earthquake", "Dragon Claw", "Stealth Rock", "Roar"],
        "//comment": "Stealth Rock (隐形岩) 对信使鸟和炎武王是毁灭性的打击。Roar 强制要把强化起来的君主蛇吼下去。",
        "stats_meta": { "ev_level": 252 }
      },
      {
        // [反太晶 / 信仰]
        "index": 5,
        "name": "Charizard",
        "cnName": "喷火龙",
        "lv": 94,
        "ability": "Solar Power",
        "item": "Heavy-Duty Boots", 
        "mechanic": "tera",
        "teraType": "Dragon",
        "nature": "Timid",
        "moves": ["Flamethrower", "Hurricane", "Tera Blast", "Roost"],
        "stats_meta": { "ev_level": 252 }
      }
    ]
  },

  // ===================================
  // ENEMY SIDE: ROSA 鸣依
  // ===================================
  "enemy": {
    "id": "rosa_bw2_final",
    "name": "Rosa",
    "title": "Unova Icon",
    "avatar": "rosa_bw2_animated", 
    "difficulty": "expert", // AI 不会留情

    "lines": {
      "start": "合众的宝可梦才不止这点实力！来吧！大家，Full Power!",
      "ace_damage": "这种程度的伤痕... 只会让君主蛇变得更加高傲！",
      "ace_faint": "这... 也是一种可能性的未来吗？",
      "win": "这就是我们的最佳链接！合众最强！",
      "lose": "好强...！就像N先生和黑次前辈说的那样强！"
    },

    "unlocks": {
        "enable_bond": true,         
        "enable_styles": false,
        "enable_insight": true,      // 命中率作弊：开启
        "enable_mega": false,
        "enable_dynamax": false
    },

    "party": [
      {
        // 1. [御三家·草 BOSS]Lv.99
        // 超级回复流 + 唱反调越打越痛
        "name": "Serperior", 
        "lv": 99,
        "item": "Leftovers", 
        "ability": "Contrary", 
        "nature": "Timid",
        "stats_meta": { 
          "ev_level": 252, // 模拟觉醒数值
          "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 } 
        },
        "moves": ["Leaf Storm", "Dragon Pulse", "Glare", "Substitute"],
        "//ai_logic": "开局若对方威胁小，先 Substitute。否则直接 Leaf Storm 强化。半血以下 Glare 控制。",
        "avs": { "devotion": 255 } // 疯狂回血
      },
      {
        // 2. [御三家·火 敢死队]
        // 只有气腰才能阻止它的秒杀
        "name": "Emboar",
        "lv": 96,
        "item": "Choice Band", // 攻击 x1.5
        "ability": "Reckless", // 反伤招式 x1.2
        "nature": "Brave",
        "stats_meta": { "ev_level": 252, "ivs_fixed": 31 },
        // Head Smash (150岩) = 150 * 1.5 * 1.2 = 270 威力非本系导弹
        // Flare Blitz (120火) = 120 * 1.5 * 1.2 * 1.5(Stub) = 324 威力本系核弹
        "moves": ["Flare Blitz", "Superpower", "Head Smash", "Wild Charge"],
        "avs": { "passion": 255 } // 暴击光环
      },
      {
        // 3. [冷库杀手]
        "name": "Simipour", 
        "lv": 93, 
        "ability": "Torrent", 
        "item": "Expert Belt", 
        "nature": "Timid",
        "stats_meta": { "ev_level": 252, "ivs_fixed": 31 },
        "moves": ["Hydro Pump", "Ice Beam", "Scald", "Taunt"],
        "//ai_logic": "Taunt 阻止你的队伍强化或撒钉。冰光针对你的地龙。"
      },
      {
        // 4. [御三家·水 收割者]
        "name": "Samurott",
        "lv": 96,
        "item": "Life Orb", 
        "ability": "Shell Armor", // 稳如老狗，不出意外
        "nature": "Adamant",
        "stats_meta": { "ev_level": 252, "ivs_fixed": 31 },
        "moves": ["Liquidation", "Aqua Jet", "Knock Off", "Megahorn"],
        "//ai_logic": "如果对面残血，必用 Aqua Jet (先制) 收人头。"
      },
      {
        // 5. [点火装置]
        "name": "Simisear", 
        "lv": 93, 
        "item": "Focus Sash", // 气腰保证出招
        "ability": "Blaze", 
        "nature": "Timid",
        "stats_meta": { "ev_level": 252, "ivs_fixed": 31 },
        "moves": ["Fire Blast", "Grass Knot", "Nasty Plot", "Focus Blast"],
        "avs": {  "passion": 150 }
      },
      {
        // 6. [GENG 2 奇迹 / 隐藏BOSS]
        // 圣诞老人来收割你了
        "name": "Delibird",
        "lv": 92,
        "item": "Focus Sash", // 它必须有气腰才能换掉一只
        "ability": "Hustle",  // 物理伤害 x1.5 (Insight 修正掉命中惩罚)
        "nature": "Jolly",    // 极速
        "stats_meta": { "ev_level": 252, "ivs_fixed": 31 },
        
        // 恐怖的 combo:
        // Insight 让 hustle 不丢失命中。
        // Destiny Bond (同命) 先手带走慢速怪。
        // Ice Shard (先制) 抢人头。
        // Drill Run (钻孔直冲) 在 x1.5 下打钢系极其痛。
        "moves": ["Ice Shard", "Destiny Bond", "Brave Bird", "Drill Run"],
        "avs": { "insight": 255 } // 命中修正的核心
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
