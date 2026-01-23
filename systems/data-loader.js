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
    return {"settings":{"enableAVS":true,"enableCommander":true,"enableEVO":true,"enableBGM":true,"enableSFX":true,"enableClash":false},"difficulty":"normal","player":{"name":"player","trainerProficiency":0,"party":[{"slot":1,"name":"Latios","nickname":null,"species":null,"gender":"M","lv":10,"quality":"high","nature":"Hasty","ability":"Levitate","shiny":false,"item":"Soul Dew","mechanic":null,"teraType":null,"isAce":true,"isLead":false,"moves":["Dragon Breath","Protect","Stored Power","Helping Hand"],"stats_meta":{"ivs":{"hp":29,"atk":31,"def":1,"spa":28,"spd":30,"spe":31},"ev_level":25,"ev_up":0},"notes":null,"avs":{"trust":20,"passion":10,"insight":0,"devotion":0}},{"slot":2,"name":"Latias","nickname":null,"species":null,"gender":"F","lv":10,"quality":"high","nature":"Timid","ability":"Levitate","shiny":false,"item":"Soul Dew","mechanic":null,"teraType":null,"isAce":true,"isLead":false,"moves":["Mist Ball","Charm","Psywave","Wish"],"stats_meta":{"ivs":{"hp":6,"atk":20,"def":31,"spa":31,"spd":31,"spe":31},"ev_level":25,"ev_up":0},"notes":null,"avs":{"trust":20,"passion":10,"insight":1,"devotion":0}}],"unlocks":{"enable_bond":false,"enable_styles":false,"enable_insight":false,"enable_mega":false,"enable_z_move":false,"enable_dynamax":false,"enable_tera":false,"enable_proficiency_cap":false}},"enemy":{"id":"Nemona","type":"trainer","name":"Nemona","trainerProficiency":0,"lines":{"start":"あたしの『実り』になってくれるかな？　全力で来て！(能成为我的『果实』吗？全—力攻过来吧！)","win":"あははっ！　まだまだ『未熟』だね、でもそこが可愛い！(啊哈哈！还很『青涩』呢，不过那一点也很可爱！)","lose":"ゾクゾクしちゃう……！　キミ、本当に初心者！？(忍不住要颤抖了……！你，真的是新手吗！？)","escape":"えっ！？　逃げるの？　待って待って、まだ終わってないよ！(欸！？要逃跑吗？等下等下，还没结束呢！)"},"unlocks":{"enable_bond":false,"enable_styles":false,"enable_insight":false,"enable_mega":false,"enable_z_move":false,"enable_dynamax":false,"enable_tera":false,"enable_proficiency_cap":false}},"party":[{"name":"Sprigatito","lv":16,"gender":"F","nature":"Jolly","ability":"Overgrow","item":"Oran Berry","isAce":true,"stats_meta":{"ivs":{"hp":31,"atk":31,"def":31,"spa":31,"spd":31,"spe":31},"ev_level":100},"moves":["Leafage","Scratch","Bite","Hone Claws"],"avs":{"trust":100,"passion":100,"insight":120,"devotion":120}},{"name":"Pawmi","lv":14,"gender":"F","nature":"Jolly","ability":"Static","stats_meta":{"ivs":{"hp":25,"atk":25,"def":20,"spa":25,"spd":20,"spe":31},"ev_level":50},"moves":["Nuzzle","Thunder Shock","Scratch","Quick Attack"],"avs":{"trust":0,"passion":0,"insight":0,"devotion":0}},{"name":"Rockruff","lv":14,"gender":"F","nature":"Jolly","ability":"Vital Spirit","stats_meta":{"ivs":{"hp":25,"atk":25,"def":25,"spa":10,"spd":25,"spe":31},"ev_level":50},"moves":["Rock Throw","Bite","Tackle","Leer"],"avs":{"trust":0,"passion":0,"insight":0,"devotion":0}}],"script":null}







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
