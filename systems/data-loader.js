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
  "settings": {
    "enableAVS": true,
    "enableCommander": true,
    "enableEVO": false,
    "enableBGM": true,
    "enableSFX": true,
    "enableClash": false
  },
  "player": {
    "name": "DirtyPlayer",
    "trainerProficiency": 200,
    "unlocks": {
      "enable_mega": true,
      "enable_z_move": true,
      "enable_styles": true,
      "enable_tera": true
    },
    "party": [
      {
        "slot": 1,
        "name": "Gliscor",
        "nickname": "天蝎王(永动)",
        "species": "Gliscor",
        "lv": 65,
        "isLead": true,
        "isAce": true,
        "gender": "M",
        "shiny": true,
        "ability": "Poison Heal",
        "item": "Toxic Orb",
        "nature": "Jolly",
        "intro": "【操作指引】T1: 替身/剧毒 -> T2: 守住(蹭回合) -> T3: 地震(打钢系)或循环。",
        "moves": ["Substitute", "Toxic", "Protect", "Earthquake"],
        "stats_meta": { "ev_level": 252 },
        "friendship": { "avs": { "devotion": 255, "trust": 200 } }
      },
      {
        "slot": 2,
        "name": "Whimsicott",
        "nickname": "风妖精(恶作剧)",
        "species": "Whimsicott",
        "lv": 65,
        "ability": "Prankster",
        "item": "Leftovers",
        "nature": "Timid",
        "intro": "【机制测试】你的<寄生种子>和<替身>应该总是先手(优先度+1)。AI如果换人会被种子吸血。",
        "moves": ["Leech Seed", "Substitute", "Moonblast", "Encore"],
        "stats_meta": { "ev_level": 252 }
      },
      {
        "slot": 3,
        "name": "Toxapex",
        "nickname": "超坏星(再生力)",
        "species": "Toxapex",
        "lv": 65,
        "ability": "Regenerator",
        "item": "Black Sludge",
        "moves": ["Scald", "Haze", "Recover", "Baneful Bunker"],
        "_check": "测试【再生力】, 换人下场应回复1/3 HP。"
      },
      {
        "slot": 4,
        "name": "Chansey",
        "nickname": "吉利蛋(进化奇石)",
        "species": "Chansey",
        "lv": 65,
        "ability": "Natural Cure",
        "item": "Eviolite",
        "moves": ["Seismic Toss", "Soft-Boiled", "Heal Bell", "Stealth Rock"],
        "_check": "纯数值肉盾，测试进化奇石硬度。"
      }
    ]
  },
  "enemy": {
    "name": "StallBreaker",
    "type": "ACE_TRAINER",
    "trainerProficiency": 250,
    "unlocks": { "enable_mega": true, "enable_tera": true },
    "party": [
      {
        "name": "Grimmsnarl",
        "species": "Grimmsnarl",
        "lv": 66,
        "isLead": true,
        "ability": "Prankster",
        "item": "Light Clay",
        "moves": ["Taunt", "Spirit Break", "Reflect", "Thunder Wave"],
        "_ai_logic": "Opening with Taunt to stop Player's Toxic/Substitute.",
        "_intro": "小心：它有先手【挑衅】，如果你第一回合点变化技会直接失败！"
      },
      {
        "name": "Gholdengo",
        "species": "Gholdengo",
        "lv": 66,
        "ability": "Good as Gold",
        "item": "Choice Specs",
        "mechanic": "tera",
        "teraType": "Steel",
        "moves": ["Make It Rain", "Shadow Ball", "Nasty Plot", "Trick"],
        "_intro": "【黄金之躯】免疫你的剧毒和寄生种子。"
      },
      {
        "name": "Ursaluna",
        "species": "Ursaluna",
        "lv": 66,
        "ability": "Guts",
        "item": "Flame Orb",
        "moves": ["Facade", "Headlong Rush", "Fire Punch", "Swords Dance"],
        "_intro": "毅力特性。如果你对它用剧毒，它的攻击力会翻倍(x1.5)，反而变得更强！不要对它用剧毒！"
      },
      {
        "name": "Dragapult",
        "species": "Dragapult",
        "lv": 67,
        "isAce": true,
        "ability": "Infiltrator",
        "moves": ["Dragon Darts", "Hex", "U-turn", "Will-O-Wisp"],
        "_intro": "【穿透】特性无视你的替身直接攻击本体。"
      }
    ],
    "lines": {
      "start": "想用消耗战术？我的队伍可是专门为了拆墙而生的！",
      "win": "你的替身纸糊一样脆弱。",
      "lose": "可恶……根本碰不到本体……这种战术太赖皮了！"
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
 * 解析环境天气配置
 * 
 * 新版 JSON 格式:
 * {
 *   "environment": {
 *     "weather": "chronalrift",      // 环境天气 ID
 *     "weatherTurns": 0,             // 持续回合 (0 = 无限)
 *     "revertMessage": "...",        // 天气回归时的消息
 *     "suppression": {
 *       // 方式一: 全局设置
 *       "all": "blocked" | "suppressed" | "normal",
 *       // 方式二: 按天气设置 (优先级高于 all)
 *       "blocked": ["rain", "sun"],      // 完全阻止的天气
 *       "suppressed": ["sandstorm"]      // 回合减半的天气
 *     },
 *     "effects": { ... }             // 环境特效开关
 *   }
 * }
 * 
 * 旧版兼容:
 * {
 *   "environment": {
 *     "suppressionTier": 3           // 1=normal, 2=suppressed, 3=blocked
 *   }
 * }
 * 
 * @param {Object} envConfig 环境配置对象
 * @returns {Object} 标准化的环境配置
 */
function parseEnvironmentConfig(envConfig = {}) {
    const result = {
        weather: envConfig.weather || null,
        weatherTurns: envConfig.weatherTurns ?? 0,
        revertMessage: envConfig.revertMessage || null,
        suppression: {},
        effects: envConfig.effects || {}
    };
    
    // 解析 suppression 配置
    if (envConfig.suppression) {
        const supp = envConfig.suppression;
        
        // all 字段: 全局设置
        if (supp.all) {
            result.suppression.all = supp.all;
        }
        
        // blocked 数组: 完全阻止的天气
        if (Array.isArray(supp.blocked)) {
            result.suppression.blocked = supp.blocked.map(w => w.toLowerCase());
        }
        
        // suppressed 数组: 回合减半的天气
        if (Array.isArray(supp.suppressed)) {
            result.suppression.suppressed = supp.suppressed.map(w => w.toLowerCase());
        }
    }
    // 旧版兼容: suppressionTier
    else if (envConfig.suppressionTier !== undefined) {
        const tier = envConfig.suppressionTier;
        if (tier === 3) {
            result.suppression.all = 'blocked';
        } else if (tier === 2) {
            result.suppression.all = 'suppressed';
        }
        // tier 1 = normal, 不需要设置
    }
    
    console.log('[DATA-LOADER] 环境配置解析:', result);
    return result;
}

/**
 * 应用环境配置到战斗实例
 * @param {Object} battle 战斗实例
 * @param {Object} envConfig 环境配置 (已解析)
 */
function applyEnvironmentConfig(battle, envConfig) {
    if (!battle || !envConfig) return;
    
    // 设置环境天气
    if (envConfig.weather) {
        battle.environmentWeather = envConfig.weather;
        battle.environmentConfig = envConfig;
        
        // 如果没有普通天气，环境天气也作为当前天气
        if (!battle.weather) {
            battle.weather = envConfig.weather;
            battle.weatherTurns = envConfig.weatherTurns;
        }
        
        // 更新视觉效果
        if (typeof window !== 'undefined' && window.setWeatherVisuals) {
            window.setWeatherVisuals(envConfig.weather);
        }
        
        console.log(`[DATA-LOADER] 环境天气已设置: ${envConfig.weather}`);
    }
}

// ============================================
// 环境图层 API
// ============================================

/**
 * 注入环境图层效果
 * @param {Object|string} envJSON - 环境 JSON 对象或字符串
 * @returns {Object|null} 解析后的环境对象
 */
function injectEnvironmentOverlay(envJSON) {
    if (typeof window === 'undefined' || !window.envOverlay) {
        console.error('[ENV OVERLAY] envOverlay 未初始化');
        return null;
    }
    
    const env = window.envOverlay.inject(envJSON);
    if (env) {
        console.log(`[ENV OVERLAY] 注入环境: ${env.env_name}`);
    }
    return env;
}

/**
 * 清除所有环境图层
 */
function clearEnvironmentOverlay() {
    if (typeof window !== 'undefined' && window.envOverlay) {
        window.envOverlay.clear();
        console.log('[ENV OVERLAY] 已清除所有环境');
    }
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
    window.parseEnvironmentConfig = parseEnvironmentConfig;
    window.applyEnvironmentConfig = applyEnvironmentConfig;
    window.validateBattleJSON = validateBattleJSON;
    // 环境图层 API
    window.injectEnvironmentOverlay = injectEnvironmentOverlay;
    window.clearEnvironmentOverlay = clearEnvironmentOverlay;
}

// Node.js 环境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getDefaultBattleData,
        loadBattleFromJSON,
        parseUnlocks,
        parseEnvironmentConfig,
        applyEnvironmentConfig,
        validateBattleJSON,
        injectEnvironmentOverlay,
        clearEnvironmentOverlay
    };
}
