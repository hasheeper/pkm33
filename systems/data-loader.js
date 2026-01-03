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
    return {"difficulty":"expert","player":{"name":"player","party":[{"slot":1,"name":"Delphox","nickname":null,"species":null,"gender":"F","lv":40,"quality":"high","nature":"Sassy","ability":"Magician","shiny":false,"item":null,"mechanic":null,"teraType":null,"isAce":true,"isLead":true,"moves":["Flamethrower","Flame Charge","Mystical Fire","Howl"],"stats_meta":{"ivs":{"hp":31,"atk":31,"def":12,"spa":31,"spd":31,"spe":31},"ev_level":177,"ev_up":0},"notes":null,"avs":{"trust":217,"passion":255,"insight":61,"devotion":255}},{"slot":2,"name":"Wimpod","nickname":null,"species":null,"gender":"M","lv":28,"quality":"medium","nature":"Timid","ability":"Wimp Out","shiny":false,"item":null,"mechanic":null,"teraType":null,"isAce":true,"isLead":false,"moves":["Struggle Bug","Sand Attack","Defense Curl","Aqua Jet"],"stats_meta":{"ivs":{"hp":7,"atk":15,"def":28,"spa":18,"spd":21,"spe":31},"ev_level":78,"ev_up":0},"notes":null,"avs":{"trust":91,"passion":34,"insight":37,"devotion":28}},{"slot":3,"name":"Kirlia","nickname":null,"species":null,"gender":"F","lv":24,"quality":"high","nature":"Timid","ability":"Telepathy","shiny":false,"item":"Soothe Bell","mechanic":null,"teraType":null,"isAce":true,"isLead":false,"moves":["Disarming Voice","Double Team","Confusion","Life Dew"],"stats_meta":{"ivs":{"hp":12,"atk":31,"def":31,"spa":31,"spd":31,"spe":31},"ev_level":83,"ev_up":0},"notes":null,"avs":{"trust":251,"passion":12,"insight":52,"devotion":255}},{"slot":4,"name":"Floragato","nickname":null,"species":null,"gender":"F","lv":33,"quality":"high","nature":"Adamant","ability":"Protean","shiny":false,"item":null,"mechanic":"tera","teraType":"Steel","isAce":true,"isLead":false,"moves":["Metal Claw","Leafage","Sucker Punch","Hone Claws"],"stats_meta":{"ivs":{"hp":1,"atk":31,"def":31,"spa":31,"spd":31,"spe":31},"ev_level":107,"ev_up":0},"notes":null,"avs":{"trust":25,"passion":69,"insight":38,"devotion":0}}],"unlocks":{"enable_bond":false,"enable_styles":false,"enable_insight":false,"enable_mega":false,"enable_z_move":false,"enable_dynamax":false,"enable_tera":true}},"enemy":{"id":"Gloria","type":"trainer","name":"Gloria","lines":{"start":"Don't blink! Or you'll miss the taste of defeat!","win":"Haha! Looks like you're on dish duty!","lose":"Eh?! Greedent got stuffed?! ...Fine, a deal's a deal!","escape":"Hey! Where are you going?! The dishes are this way!"},"unlocks":{"enable_bond":false,"enable_styles":false,"enable_insight":false,"enable_mega":false,"enable_z_move":false,"enable_dynamax":true,"enable_tera":false}},"party":[{"name":"Greedent","gender":"M","lv":40,"nature":"Impish","ability":"Cheek Pouch","shiny":false,"item":"Sitrus Berry","mechanic":null,"teraType":null,"stats_meta":{"ivs":{"hp":31,"atk":31,"def":31,"spa":31,"spd":31,"spe":31},"ev_level":252},"moves":["Belch","Body Slam","Bullet Seed","Stockpile"],"mega":null,"avs":{"trust":0,"passion":0,"insight":0,"devotion":0}}],"script":null}








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
