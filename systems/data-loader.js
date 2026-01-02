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
    return {"difficulty":"hard","player":{"name":"YOTA","party":[{"slot":1,"name":"Braixen","nickname":null,"species":null,"gender":"F","lv":32,"quality":"high","nature":"Sassy","ability":null,"shiny":false,"item":null,"mechanic":null,"teraType":null,"isAce":true,"isLead":true,"moves":["Flamethrower","Flame Charge","Psybeam","Howl"],"stats_meta":{"ivs":{"hp":29,"atk":31,"def":12,"spa":31,"spd":31,"spe":31},"ev_level":113,"ev_up":0},"notes":null,"avs":{"trust":147,"passion":152,"insight":51,"devotion":128}},{"slot":2,"name":"Wimpod","nickname":null,"species":null,"gender":"M","lv":21,"quality":"medium","nature":"Timid","ability":"Wimp Out","shiny":false,"item":null,"mechanic":null,"teraType":null,"isAce":true,"isLead":false,"moves":["Struggle Bug","Sand Attack","Defense Curl","Aqua Jet"],"stats_meta":{"ivs":{"hp":7,"atk":15,"def":28,"spa":18,"spd":21,"spe":31},"ev_level":52,"ev_up":0},"notes":null,"avs":{"trust":69,"passion":10,"insight":30,"devotion":28}},{"slot":3,"name":"Ralts","nickname":null,"species":null,"gender":"F","lv":14,"quality":"high","nature":"Timid","ability":"Telepathy","shiny":false,"item":"Soothe Bell","mechanic":null,"teraType":null,"isAce":true,"isLead":false,"moves":["Disarming Voice","Double Team","Confusion","Life Dew"],"stats_meta":{"ivs":{"hp":12,"atk":31,"def":31,"spa":31,"spd":31,"spe":31},"ev_level":33,"ev_up":0},"notes":null,"avs":{"trust":200,"passion":10,"insight":20,"devotion":255}}],"unlocks":{"enable_bond":false,"enable_styles":false,"enable_insight":false,"enable_mega":false,"enable_z_move":false,"enable_dynamax":false,"enable_tera":false}},"enemy":{"id":"Marnie","type":"trainer","name":"Marnie","lines":{"start":"あたしが鍛えたあくタイプ……ちとヤバイけんね！（我培育的恶属性……可是有点危险的喔！）","win":"……ん。まあ、こんなもんたい。約束通り、あいつらは帰らせるけん。（……嗯。嘛，也就这种程度。照约定，我会让那群家伙回去的。）","lose":"……負けたぁ。あんた、うわさ以上にすごか人やね……。（……输了啊。你这个人，比传闻中还要厉害呢……）","escape":"えっ？逃げると？……つまらんね。（哎？要逃吗？……真没意思。）"},"unlocks":{"enable_bond":false,"enable_styles":false,"enable_insight":false,"enable_mega":false,"enable_z_move":false,"enable_dynamax":false,"enable_tera":false}},"party":[{"name":"Morpeko","lv":26,"gender":"F","nature":"Jolly","ability":"Hunger Switch","item":"Oran Berry","isAce":true,"stats_meta":{"ivs":{"hp":25,"atk":25,"def":25,"spa":25,"spd":25,"spe":25},"ev_level":50},"moves":["Aura Wheel","Bite","Quick Attack","Protect"],"avs":{"trust":0,"passion":0,"insight":0,"devotion":0}},{"name":"Scraggy","lv":24,"gender":"M","nature":"Impish","ability":"Shed Skin","item":"Eviolite","stats_meta":{"ivs":{"hp":25,"atk":25,"def":25,"spa":25,"spd":25,"spe":25},"ev_level":40},"moves":["Headbutt","Brick Break","Payback","Work Up"],"avs":{"trust":0,"passion":0,"insight":0,"devotion":0}},{"name":"Croagunk","lv":24,"gender":"M","nature":"Adamant","ability":"Dry Skin","stats_meta":{"ivs":{"hp":20,"atk":20,"def":20,"spa":20,"spd":20,"spe":20},"ev_level":20},"moves":["Poison Sting","Revenge","Sucker Punch","Venoshock"],"avs":{"trust":0,"passion":0,"insight":0,"devotion":0}}],"script":null}







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
