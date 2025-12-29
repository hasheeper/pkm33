/**
 * =============================================
 * FORM CHANGE SYSTEM - 通用形态变化系统
 * =============================================
 * 
 * 支持的形态变化类型：
 * 1. Mega Evolution（超进化）- 按钮触发
 * 2. Ultra Burst（究极爆发）- 按钮触发，复用 Mega 按钮
 * 3. Primal Reversion（原始回归）- 进场自动触发
 * 4. Crowned Form（剑盾之王）- 进场自动触发
 * 5. Battle Bond（羁绊进化）- 击杀触发
 * 6. HP-Threshold Forms（血量阈值形态）- HP 变化触发
 */

/**
 * 执行通用形态变化（引擎层面）
 * @param {Pokemon} pokemon - 要变形的宝可梦
 * @param {string} targetFormId - 目标形态 ID（如 'charizardmegax', 'kyogreprimal'）
 * @param {string} formType - 形态类型（'mega', 'primal', 'ultra', 'crowned' 等）
 * @returns {object|null} - 变化结果信息，或 null 如果失败
 */
function performFormChange(pokemon, targetFormId, formType = 'mega') {
    if (!targetFormId) {
        console.warn(`[FORM] No target form ID provided for ${pokemon.name}`);
        return null;
    }
    
    const formData = getPokemonData(targetFormId);
    if (!formData) {
        console.warn(`[FORM] Form data not found: ${targetFormId}`);
        return null;
    }
    
    // 保存旧数据用于日志
    const oldName = pokemon.cnName;
    const oldTypes = [...pokemon.types];
    const oldAbility = pokemon.ability;
    
    // 更新基础数据
    pokemon.name = formData.name;
    
    // [BUG FIX] 重新翻译新形态的名字
    if (typeof window !== 'undefined' && window.Locale) {
        const transName = window.Locale.get(formData.name);
        
        // 智能后备：如果翻译库里没有这个形态的专有名词
        if (transName === formData.name && formType === 'minior') {
            // 小陨星内核，强行翻译
            pokemon.cnName = `小陨星-${transName.split('-')[1] || '核心'}`;
        } 
        else if (transName === formData.name && formData.name.includes("-Hisui")) {
            // 洗翠形态智能拼装
            const baseName = window.Locale.get(formData.name.split('-')[0]);
            pokemon.cnName = `${baseName}-洗翠`;
        }
        else {
            pokemon.cnName = transName;
        }
    } else {
        pokemon.cnName = formData.name;
    }
    
    pokemon.types = formData.types || pokemon.types;
    pokemon.baseStats = formData.baseStats;
    
    // 获取新形态的特性
    const formPokedexData = typeof POKEDEX !== 'undefined' ? POKEDEX[targetFormId] : null;
    if (formPokedexData && formPokedexData.abilities) {
        pokemon.ability = formPokedexData.abilities['0'] || formPokedexData.abilities['H'] || pokemon.ability;
    }
    
    // 重新计算能力值
    const oldHp = pokemon.currHp;
    const oldMaxHp = pokemon.maxHp;
    
    let autoEv = Math.floor(pokemon.level * 1.5);
    if (autoEv > 85) autoEv = 85;
    
    const newStats = calcStats(formData.baseStats, pokemon.level, 31, autoEv);
    
    // HP 处理：大部分形态变化保持 HP 不变，但基格尔德完全体例外
    const isZygardeComplete = targetFormId === 'zygardecomplete';
    if (isZygardeComplete) {
        // 基格尔德完全体：HP 最大值增加，当前 HP 按比例增加
        const hpRatio = oldHp / oldMaxHp;
        pokemon.maxHp = newStats.hp;
        pokemon.currHp = Math.floor(pokemon.maxHp * hpRatio);
    } else {
        // 其他形态：HP 保持不变
        pokemon.maxHp = oldMaxHp;
        pokemon.currHp = oldHp;
    }
    
    // 更新其他能力值
    pokemon.atk = newStats.atk;
    pokemon.def = newStats.def;
    pokemon.spa = newStats.spa;
    pokemon.spd = newStats.spd;
    pokemon.spe = newStats.spe;
    
    // 标记已变形
    pokemon.isTransformed = true;
    pokemon.currentForm = targetFormId;
    pokemon.formType = formType;
    
    // 向后兼容：如果是 Mega/Ultra，也标记 isMega
    if (formType === 'mega' || formType === 'ultra') {
        pokemon.isMega = true;
    }
    
    // 返回变化信息
    const typeChanged = JSON.stringify(oldTypes) !== JSON.stringify(pokemon.types);
    const abilityChanged = oldAbility !== pokemon.ability;
    
    return {
        success: true,
        oldName,
        newName: pokemon.cnName,
        formType,
        typeChanged,
        newTypes: pokemon.types,
        abilityChanged,
        newAbility: pokemon.ability
    };
}

/**
 * 检查并执行进场时的自动形态变化（Init-Transform）
 * 用于：Primal Reversion, Crowned Form
 * @param {Pokemon} pokemon - 宝可梦实例
 * @returns {object|null} - 变化结果
 */
function checkInitTransform(pokemon) {
    // 使用新的 needsInitTransform 标记
    if (pokemon.needsInitTransform && pokemon.initTransformTarget && !pokemon.isTransformed) {
        console.log(`[FORM] Init-Transform triggered for ${pokemon.name} -> ${pokemon.initTransformTarget} (type: ${pokemon.initTransformType})`);
        const result = performFormChange(pokemon, pokemon.initTransformTarget, pokemon.initTransformType);
        pokemon.needsInitTransform = false; // 标记已完成
        return result;
    }
    
    return null;
}

/**
 * 检查并执行击杀触发的形态变化（Battle Bond）
 * 用于：Greninja (Ash-Greninja)
 * @param {Pokemon} pokemon - 宝可梦实例
 * @returns {object|null} - 变化结果
 */
function checkBattleBondTransform(pokemon) {
    // 检查是否是甲贺忍蛙且有羁绊特性
    if (pokemon.ability !== 'Battle Bond') {
        return null;
    }
    
    // 检查是否已经是 Ash 形态
    const baseId = pokemon.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (baseId === 'greninjaash' || pokemon.isTransformed) {
        return null;
    }
    
    // 变为 Ash-Greninja
    const targetId = 'greninjaash';
    const targetData = getPokemonData(targetId);
    if (!targetData) {
        return null;
    }
    
    console.log(`[FORM] Battle Bond triggered: ${pokemon.name} -> Ash-Greninja`);
    return performFormChange(pokemon, targetId, 'battlebond');
}

/**
 * 检查并执行血量阈值触发的形态变化
 * 用于：Wishiwashi (School/Solo), Zygarde (Complete), Minior (Shields Down)
 * @param {Pokemon} pokemon - 宝可梦实例
 * @returns {object|null} - 变化结果
 */
function checkHPThresholdTransform(pokemon) {
    const baseId = pokemon.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const hpRatio = pokemon.currHp / pokemon.maxHp;
    
    // 弱丁鱼 (Wishiwashi) - 鱼群特性
    if (pokemon.ability === 'Schooling' && baseId.includes('wishiwashi')) {
        const currentlySchool = baseId === 'wishiwashischool';
        
        if (hpRatio > 0.25 && !currentlySchool) {
            // 变为鱼群形态
            console.log(`[FORM] Schooling: ${pokemon.name} -> School Form`);
            return performFormChange(pokemon, 'wishiwashischool', 'schooling');
        } else if (hpRatio <= 0.25 && currentlySchool) {
            // 变回单独形态
            console.log(`[FORM] Schooling: ${pokemon.name} -> Solo Form`);
            return performFormChange(pokemon, 'wishiwashi', 'schooling');
        }
    }
    
    // 基格尔德 (Zygarde) - 群聚变形特性
    if (pokemon.ability === 'Power Construct' && baseId.includes('zygarde')) {
        const currentlyComplete = baseId === 'zygardecomplete';
        
        // 只有 10% 或 50% 形态可以变为完全体，且只能变一次
        if (hpRatio < 0.5 && !currentlyComplete && !pokemon._zygardeTransformed) {
            console.log(`[FORM] Power Construct: ${pokemon.name} -> Complete Forme`);
            pokemon._zygardeTransformed = true; // 标记已变形，不可逆
            return performFormChange(pokemon, 'zygardecomplete', 'powerconstruct');
        }
    }
    
    // 小陨星 (Minior) - 界限盾特性
    if (pokemon.ability === 'Shields Down' && baseId.includes('minior')) {
        const currentlyShielded = !baseId.includes('core');
        
        if (hpRatio > 0.5 && !currentlyShielded) {
            // 变回流星形态（有盾）
            console.log(`[FORM] Shields Down: ${pokemon.name} -> Meteor Form`);
            return performFormChange(pokemon, 'minior', 'shieldsdown');
        } else if (hpRatio <= 0.5 && currentlyShielded) {
            // 变为核心形态（无盾）
            console.log(`[FORM] Shields Down: ${pokemon.name} -> Core Form`);
            // Minior 有多种颜色，这里简化为红色核心
            return performFormChange(pokemon, 'miniorcoreform', 'shieldsdown');
        }
    }
    
    return null;
}

// 导出到全局（如果在浏览器环境）
if (typeof window !== 'undefined') {
    window.performFormChange = performFormChange;
    window.checkInitTransform = checkInitTransform;
    window.checkBattleBondTransform = checkBattleBondTransform;
    window.checkHPThresholdTransform = checkHPThresholdTransform;
}

// 导出到 Node.js 环境（如果需要）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        performFormChange,
        checkInitTransform,
        checkBattleBondTransform,
        checkHPThresholdTransform
    };
}
