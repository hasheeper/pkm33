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
    "module": "weather_status_logic"
  },
  "player": {
    "name": "YOTA (The Weather Master)",
    "party": [
      {
        "slot": 1,
        // 测试核心1：【状态盾 (Status Shield)】
        "name": "Gliscor",
        "nickname": "天蝎王",
        "lv": 100,
        "ability": "Poison Heal", // 毒疗：中毒回血
        "item": "Toxic Orb",      // 剧毒宝珠：第一回合末让自己剧毒
        "moves": ["Protect", "Facade", "Earthquake", "Swords Dance"],
        "//comment": "逻辑点：我甚至不管你有多少催眠技能，我自己先中毒了，你就睡不了我。"
      },
      {
        "slot": 2,
        // 测试核心2：【湿润之躯 (Hydration)】
        "name": "Goodra-Hisui",
        "nickname": "黏美龙",
        "lv": 100,
        "ability": "Hydration", 
        "item": "Damp Rock",
        "moves": ["Rain Dance", "Rest", "Dragon Pulse", "Flash Cannon"],
        "//comment": "逻辑点：这是最赖皮的【超级无限睡觉】。雨天开Rest -> 睡着回满 -> 回合结束Hydration触发 -> 秒醒。"
      },
      {
        "slot": 3,
        // 测试核心3：【叶子防守 (Leaf Guard)】 vs 哈欠
        "name": "Leafeon",
        "nickname": "叶伊布",
        "lv": 100,
        "ability": "Leaf Guard", 
        "moves": ["Leaf Blade", "Synthesis", "Sunny Day", "Swords Dance"],
        "stats_meta": { "ev_level": 252 },
        "//comment": "逻辑点：在晴天下，免疫所有异常状态（包括哈欠的后续生效）。"
      }
    ]
  },
  "enemy": {
    "name": "Hypno (催眠信徒)",
    "type": "trainer",
    "party": [
      {
        "name": "Breloom",
        "lv": 60,
        "ability": "Technician",
        "item": "Focus Sash",
        "moves": ["Spore", "Bullet Seed", "Mach Punch", "Rock Tomb"]
      },
      {
        "name": "Torkoal", // 开晴天的人
        "lv": 100,
        "ability": "Drought",
        "moves": ["Yawn", "Overheat", "Stealth Rock", "Rapid Spin"]
      },
      {
        "name": "Gengar",
        "lv": 100,
        "ability": "Cursed Body",
        "moves": ["Hypnosis", "Shadow Ball", "Sludge Bomb", "Destiny Bond"]
      }
    ],
    "lines": {
      "start": "不论天气如何，你们最终都会闭上眼睛。",
      "win": "在这个世界里，清醒的人最痛苦。",
      "lose": "好刺眼的...阳光...",
      "escape": "梦醒时分。"
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
