/**
 * ===========================================
 * DYNAMAX.JS - 极巨化系统
 * ===========================================
 * 
 * 职责:
 * - 极巨化状态管理
 * - 招式转换（普通招式 <-> 极巨招式）
 * - HP 倍增/恢复
 */

// ============================================
// 核心函数
// ============================================

/**
 * 应用极巨化状态变换（招式替换/回退）
 * @param {Pokemon} pokemon 宝可梦对象
 * @param {boolean} isActive true=开启极巨化, false=关闭极巨化
 */
function applyDynamaxState(pokemon, isActive) {
    if (!pokemon) return;
    
    // 获取 getMaxMoveTarget 函数（从 z-moves.js）
    const getMaxMoveTargetFn = typeof window !== 'undefined' && window.getMaxMoveTarget 
        ? window.getMaxMoveTarget 
        : null;
    
    if (isActive) {
        // [ON] 开启极巨化
        console.log(`[DYNAMAX] ${pokemon.name} 招式转换为极巨招式`);
        
        // === 播放极巨化叫声 ===
        if (typeof window.playPokemonCry === 'function') {
            window.playPokemonCry(pokemon.name);
        }
        
        // 1. 备份原始技能 (非常重要！为了回退)
        pokemon._originalMoves = JSON.parse(JSON.stringify(pokemon.moves));
        
        // 2. 使用自动推导系统生成极巨招式
        pokemon.moves = pokemon._originalMoves.map(m => {
            const maxTarget = getMaxMoveTargetFn ? getMaxMoveTargetFn(m, pokemon) : null;
            
            if (!maxTarget) {
                // 无法推导，保持原样
                return { ...m, isMax: true };
            }
            
            const maxMoveId = maxTarget.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            const MOVES = typeof window !== 'undefined' ? window.MOVES : null;
            const maxMoveData = (MOVES && MOVES[maxMoveId]) ? MOVES[maxMoveId] : {};
            const inheritedCat = m.cat || (maxMoveData.category === 'Physical' ? 'phys' : 'spec');
            
            return {
                name: maxTarget.name,
                cn: maxMoveData.cn || maxTarget.name,
                type: maxTarget.type,
                power: maxTarget.power,
                basePower: maxTarget.power,
                accuracy: 100,
                pp: 5,
                cat: inheritedCat,
                category: maxMoveData.category || (inheritedCat === 'phys' ? 'Physical' : 'Special'),
                isMax: true,
                isGMax: maxTarget.isGMax
            };
        });
        
        console.log(`[DYNAMAX] 自动推导极巨招式:`, pokemon.moves.map(m => `${m.name}(${m.type}, pow:${m.power}, gmax:${m.isGMax})`));
        
    } else {
        // [OFF] 关闭极巨化
        console.log(`[DYNAMAX] ${pokemon.name} 招式恢复为普通招式`);
        
        // 还原技能
        if (pokemon._originalMoves) {
            pokemon.moves = pokemon._originalMoves;
            delete pokemon._originalMoves;
            console.log(`[DYNAMAX] 招式已恢复:`, pokemon.moves.map(m => m.name));
        }
    }
}

/**
 * 应用极巨化 HP 变化
 * @param {Pokemon} pokemon 宝可梦对象
 * @param {boolean} isActive true=开启极巨化, false=关闭极巨化
 * @param {number} multiplier HP 倍率（默认 2）
 */
function applyDynamaxHP(pokemon, isActive, multiplier = 2) {
    if (!pokemon) return;
    
    if (isActive) {
        // 备份原始 HP
        pokemon._originalMaxHp = pokemon.maxHp;
        pokemon._originalCurrHp = pokemon.currHp;
        
        // HP 翻倍
        const hpRatio = pokemon.currHp / pokemon.maxHp;
        pokemon.maxHp = Math.floor(pokemon.maxHp * multiplier);
        pokemon.currHp = Math.floor(pokemon.maxHp * hpRatio);
        
        console.log(`[DYNAMAX] ${pokemon.name} HP: ${pokemon._originalCurrHp}/${pokemon._originalMaxHp} -> ${pokemon.currHp}/${pokemon.maxHp}`);
    } else {
        // 恢复原始 HP
        if (pokemon._originalMaxHp) {
            const hpRatio = pokemon.currHp / pokemon.maxHp;
            pokemon.maxHp = pokemon._originalMaxHp;
            pokemon.currHp = Math.max(1, Math.floor(pokemon.maxHp * hpRatio));
            
            delete pokemon._originalMaxHp;
            delete pokemon._originalCurrHp;
            
            console.log(`[DYNAMAX] ${pokemon.name} HP 恢复: ${pokemon.currHp}/${pokemon.maxHp}`);
        }
    }
}

/**
 * 完整的极巨化切换（招式 + HP）
 * @param {Pokemon} pokemon 宝可梦对象
 * @param {boolean} isActive true=开启极巨化, false=关闭极巨化
 */
function toggleDynamax(pokemon, isActive) {
    if (!pokemon) return;
    
    applyDynamaxState(pokemon, isActive);
    applyDynamaxHP(pokemon, isActive);
    
    pokemon.isDynamaxed = isActive;
    
    if (isActive) {
        pokemon.dynamaxTurns = 3; // 极巨化持续 3 回合
    } else {
        pokemon.dynamaxTurns = 0;
    }
}

/**
 * 减少极巨化回合数
 * @param {Pokemon} pokemon 宝可梦对象
 * @returns {boolean} 是否应该结束极巨化
 */
function tickDynamaxTurn(pokemon) {
    if (!pokemon || !pokemon.isDynamaxed) return false;
    
    pokemon.dynamaxTurns = (pokemon.dynamaxTurns || 0) - 1;
    
    if (pokemon.dynamaxTurns <= 0) {
        console.log(`[DYNAMAX] ${pokemon.name} 极巨化结束`);
        return true;
    }
    
    console.log(`[DYNAMAX] ${pokemon.name} 极巨化剩余 ${pokemon.dynamaxTurns} 回合`);
    return false;
}

// ============================================
// 导出
// ============================================

// 浏览器环境
if (typeof window !== 'undefined') {
    window.applyDynamaxState = applyDynamaxState;
    window.applyDynamaxHP = applyDynamaxHP;
    window.toggleDynamax = toggleDynamax;
    window.tickDynamaxTurn = tickDynamaxTurn;
}

// Node.js 环境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        applyDynamaxState,
        applyDynamaxHP,
        toggleDynamax,
        tickDynamaxTurn
    };
}
