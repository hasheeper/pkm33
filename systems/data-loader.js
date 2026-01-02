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
  // ==================== 我方配置 (高人气全明星) ====================
  // 设想为一个集齐了各世代高光宝可梦的“梦之队”
  "player": {
    "name": "Red", // 或者你的角色名
    "unlocks": {
      "enable_bond": true,    // 启用牵绊系统 (给甲贺忍蛙)
      "enable_styles": true,  // 启用刚猛/迅疾
      "enable_insight": true, // 启用心眼 (修正命中)
      "enable_mega": true,
      "enable_z_move": true,
      "enable_dynamax": true,
      "enable_tera": true
    },
    
    "party": [
      // 1. [高速起手/Mega位]
      {
        "name": "Sceptile", 
        "lv": 100, 
        "gender": "M",
        "item": "Sceptilite",
        "mechanic": "mega", // Mega 进化
        "nature": "Timid",  // 胆小 (+速 -攻)
        "ability": "Lightning Rod", // Mega后避雷针
        "isLead": false,
        // 配合 Insight 保证 飞叶风暴 必中
        "moves": ["Leaf Storm", "Dragon Pulse", "Focus Blast", "Giga Drain"],
        "stats_meta": { "ev_level": 252 }, 
        "avs": { "trust": 220, "passion": 255 }
      },
      
      // 2. [特功爆破/羁绊位]
      {
        "name": "Greninja-Ash", // 牵绊变身形态
        "lv": 100,
        "gender": "M",
        "item": "Choice Specs", // 讲究眼镜
        "ability": "Battle Bond",
        "nature": "Timid",
        "isLead": false,
        // 黄金手里剑 + 这种高速高攻在这个环境下很强
        "moves": ["Water Shuriken", "Dark Pulse", "Ice Beam", "U-turn"],
        "stats_meta": { "ev_level": 252 },
        "avs": { "trust": 255, "devotion": 200 } // 极高羁绊
      },
      // 3. [双刀/Z招式位]
      {
        "name": "Lucario",
        "lv": 100,
        "gender": "M",
        "item": "Fightinium Z",
        "mechanic": "zmove", // Z 招式
        "nature": "Naive",   // 天真 (双刀)
        "ability": "Justified",
        "isLead": true,
        "moves": ["Close Combat", "Meteor Mash", "Extreme Speed", "Swords Dance"],
        "stats_meta": { "ev_level": 252 },
        "avs": { "insight": 255 } // 波导心眼
      },
      // 4. [超人气大核/太晶]
      {
        "name": "Charizard",
        "lv": 100,
        "gender": "M",
        "item": "Life Orb",
        "mechanic": "tera",
        "teraType": "Dragon", // 太晶龙 X
        "nature": "Adamant",
        "isLead": false,
        "ability": "Solar Power",
        "moves": ["Flare Blitz", "Dragon Claw", "Thunder Punch", "Dragon Dance"],
        "stats_meta": { "ev_level": 252 },
        "avs": { "passion": 255 } 
      },
      // 5. [环境准神/地龙]
      {
        "name": "Garchomp",
        "lv": 100,
        "gender": "F",
        "item": "Rocky Helmet", // 凸凸头
        "nature": "Jolly",
        "ability": "Rough Skin",
        "isLead": false,
        "moves": ["Earthquake", "Scale Shot", "Iron Head", "Swords Dance"],
        "stats_meta": { "ev_level": 252 },
        "avs": { "trust": 200 }
      },
      // 6. [妖精/吉祥物/屠龙者]
      {
        "name": "Sylveon",
        "lv": 100,
        "gender": "F",
        "item": "Throat Spray", // 爽喉喷雾
        "nature": "Modest",
        "ability": "Pixilate",
        "isLead": false,
        // Insight 修正高音暴击与命中
        "moves": ["Hyper Voice", "Psyshock", "Shadow Ball", "Calm Mind"],
        "stats_meta": { "ev_level": 180 }, // 混耐分布
        "avs": { "devotion": 255 }
      }
    ]
  },
  // ==================== 敌方 (DAWN_DATA T4) ====================
  "enemy": {
    "id": "dawn",
    "name": "Top Coordinator Dawn",
    "lines": {
      "start": "Spotlight, please! Let's show them a performance that shines even brighter than the sun!",
      "win": "No need to worry! My Pokémon are always the stars of the show.",
      "lose": "Oh wow... What a tough battle! You really dimmed our lights...",
	  "turn1": "Everyone is watching! Move with elegance and grace!",
	  "ace_out": "Lopunny! Show them the true meaning of beauty and power! Mega Evolve!",
      "gmax_trigger": "Make it encompass the whole stage! Use minimal evasive movements!"
    },
    // 基于 Tier 4 数据自动映射的配置解锁
    "unlocks": {
        "enable_bond": false, 
        "enable_styles": false,  
        "enable_insight": true,  // 核心：心眼开启 (命中回避↑)
        "enable_mega": true,    // 核心：Mega长耳兔
        "enable_z_move": false,
        "enable_dynamax": false,
        "enable_tera": false
    }
  },
  // 直接引用了 DAWN_DATA Tier 4 中的完整队伍与AVs配置
  "party": [
    {
        // 1. [Mega手] 高速与强攻的完美结合
        "name": "Lopunny",
        "lv": 100, 
        "gender": "F",
        "nature": "Jolly", 
        "ability": "Limber", 
        "item": "Lopunnite",
        "mechanic": "mega", 
        // 极高 avs: Insight 使飞膝踢必中；Passion 使报恩威力最大化
        "stats_meta": { "is_perfect": true, "ev_level": 252 }, 
        "moves": ["Fake Out", "Return", "High Jump Kick", "Ice Punch"],
        "avs": { "trust": 150, "passion": 200, "insight": 255, "devotion": 120 },
        "isAce": true
    },
    {
        // 2. [飞机] 天恩畏缩与 Insight暴击流
        "name": "Togekiss", 
        "lv": 100,
        "gender": "F",
        "nature": "Timid", 
        "ability": "Serene Grace", 
        "item": "Kings Rock", // 王者之证 (素质拉满)
        "stats_meta": { "ev_level": 252 },
        // 空气切 60% 畏缩 + 高概率暴击
        "moves": ["Air Slash", "Dazzling Gleam", "Aura Sphere", "Nasty Plot"],
        "avs": { "trust": 200, "insight": 220 }
    },
    {
        // 3. [坦克] 标志性防御手
        "name": "Torterra", 
        "lv": 100,
        "gender": "M",
        "nature": "Adamant",
        "ability": "Shell Armor", // 硬壳 (免疫CT)
        "item": "Yache Berry",    // 抗冰果
        "stats_meta": { "ev_level": 252 },
        "moves": ["Wood Hammer", "Earthquake", "Stone Edge", "Synthesis"],
        "avs": { "trust": 220, "devotion": 150 }
    },
    {
        // 4. [特盾] 好胜反威吓
        "name": "Empoleon",
        "lv": 100,
        "gender": "M",
        "nature": "Modest", 
        "ability": "Competitive",
        "item": "Assault Vest",   // 突击背心，配合Insight几乎打不动的特耐
        "stats_meta": { "ev_level": 252 },
        "moves": ["Hydro Pump", "Flash Cannon", "Ice Beam", "Aqua Jet"],
        "avs": { "trust": 150, "devotion": 200 }
    },
    {
        // 5. [双刀] 
        "name": "Infernape",
        "lv": 100,
        "gender": "M",
        "nature": "Naive", 
        "ability": "Iron Fist", 
        "item": "Life Orb", 
        "stats_meta": { "ev_level": 252 },
        // Insight 让大字爆必中
        "moves": ["Fire Blast", "Close Combat", "Mach Punch", "Grass Knot"],
        "avs": { "passion": 255 }
    },
    {
        // 6. [世界冠军的证明] 恶心人的白色恶魔
        "name": "Pachirisu",
        "lv": 100, 
        "gender": "F",
        "nature": "Impish", 
        "ability": "Volt Absorb", // 蓄电
        "item": "Sitrus Berry", 
        "stats_meta": { "ev_level": 252 },
        // Nuzzle(必麻) + Super Fang(半血)
        "moves": ["Nuzzle", "Super Fang", "Charm", "Protect"],
        "avs": { "trust": 255, "insight": 255, "devotion": 200 }
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
