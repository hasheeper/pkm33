/**
 * ===========================================
 * BATTLE-TURNS.JS - 回合执行
 * ===========================================
 * 
 * 职责:
 * - 执行玩家回合
 * - 执行敌方回合
 * - 独立敌方回合 (换人后)
 * - Z/Max 招式使用标记
 */

// ============================================
// 辅助函数
// ============================================

/**
 * 辅助函数：等待
 */
function wait(ms) { 
    return new Promise(r => setTimeout(r, ms)); 
}

/**
 * 辅助函数：日志输出
 */
function log(msg) {
    if (typeof window !== 'undefined' && typeof window.log === 'function') {
        window.log(msg);
    } else {
        console.log(msg);
    }
}

/**
 * 辅助函数：更新视觉
 */
function updateAllVisuals(forceSpriteAnim) {
    if (typeof window !== 'undefined' && typeof window.updateAllVisuals === 'function') {
        window.updateAllVisuals(forceSpriteAnim);
    }
}

// ============================================
// 玩家回合执行
// ============================================

/**
 * 执行玩家回合
 * @param {Object} p 玩家宝可梦
 * @param {Object} e 敌方宝可梦
 * @param {Object} move 招式
 * @returns {Object} 包含 pivot 标记的结果
 */
async function executePlayerTurn(p, e, move) {
    const battle = window.battle;
    
    // 状态阻断检测
    if (typeof window.checkCanMove === 'function') {
        const check = window.checkCanMove(p);
        if (check.msg) {
            log(`<span style="color:#e67e22">${check.msg}</span>`);
        }
        if (!check.can) {
            await wait(500);
            return { pivot: false };
        }
    }

    log(`[${p.cnName}] 使用了 <b>${move.cn}</b>!`);
    await wait(600);

    const result = applyDamage(p, e, move, 'enemy-sprite');
    
    // 记录本回合使用的技能
    p.lastMoveUsed = move.name;
    
    // =========================================================
    // Z-Move / Max Move 使用标记 (全场只能用一次)
    // =========================================================
    const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const moveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
    
    // 检测并标记 Z 招式使用
    const isZMove = moveData.isZ || 
        (moveData.pp === 1 && moveData.basePower >= 100 && moveData.isNonstandard === 'Past') ||
        (move.name || '').length > 25;
    if (isZMove && !battle.playerZUsed) {
        battle.playerZUsed = true;
        console.log(`[Z-MOVE] 玩家使用了 Z 招式: ${move.name}，本场不可再用`);
        
        log(`<div style="padding:8px; border:2px solid gold; background:linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,255,255,0.9)); text-align:center; border-radius:8px; margin:5px 0;">`);
        log(`<b style="font-size:1.1rem; background: linear-gradient(90deg, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">✨ Z-POWER UNLEASHED ✨</b>`);
        log(`<div style="color:#666; font-size:0.85em; margin-top:4px;">全力的姿态... Z力量已释放！</div>`);
        log(`</div>`);
        
        const stage = document.querySelector('.battle-stage');
        if (stage) {
            stage.classList.add('shake-hit-anim');
            setTimeout(() => stage.classList.remove('shake-hit-anim'), 500);
        }
    }
    
    // 检测并标记极巨招式使用
    const isMaxMove = moveData.isMax || 
        (move.name || '').startsWith('Max ') || (move.name || '').startsWith('G-Max ');
    if (isMaxMove && !battle.playerMaxUsed) {
        battle.playerMaxUsed = true;
        console.log(`[MAX MOVE] 玩家使用了极巨招式: ${move.name}，本场不可再用`);
        
        log(`<div style="padding:8px; border:2px solid #e11d48; background:linear-gradient(135deg, rgba(225,29,72,0.1), rgba(255,255,255,0.9)); text-align:center; border-radius:8px; margin:5px 0;">`);
        log(`<b style="font-size:1.1rem; color:#e11d48;">💥 MAX POWER 💥</b>`);
        log(`<div style="color:#666; font-size:0.85em; margin-top:4px;">极巨之力倾泻而出！</div>`);
        log(`</div>`);
    }
    
    updateAllVisuals();
    
    // === 检查危机 BGM 切换 (馆主战专用) ===
    if (typeof checkCrisisBgm === 'function') {
        checkCrisisBgm();
    }
    
    return { pivot: result?.pivot || false };
}

// ============================================
// 敌方回合执行
// ============================================

/**
 * 执行敌方回合
 * @param {Object} e 敌方宝可梦
 * @param {Object} p 玩家宝可梦
 * @param {Object} move 招式
 * @returns {Object} 包含 pivot 标记的结果
 */
async function executeEnemyTurn(e, p, move) {
    const battle = window.battle;
    
    console.log('[executeEnemyTurn] Starting:', { 
        enemy: e?.cnName, 
        player: p?.cnName, 
        move: move?.name || move?.cn 
    });
    
    if (!e || !e.isAlive()) {
        console.log('[executeEnemyTurn] Enemy invalid or dead');
        return { pivot: false };
    }
    
    // 如果没有招式（敌方换人场景），跳过攻击
    if (!move) {
        console.log('[executeEnemyTurn] No move provided, skipping');
        return { pivot: false };
    }

    await wait(800);
    
    // 状态阻断检测
    if (typeof window.checkCanMove === 'function') {
        const check = window.checkCanMove(e);
        if (check.msg) {
            log(`<span style="color:#e67e22">${check.msg}</span>`);
        }
        if (!check.can) {
            return { pivot: false };
        }
    }

    const moveName = move.cn || move.name || 'Unknown';
    log(`[${e.cnName}] 使出 <b>${moveName}</b>!`);
    await wait(500);

    const result = applyDamage(e, p, move, 'player-sprite');
    
    // 记录本回合使用的技能
    e.lastMoveUsed = move.name;
    
    // =========================================================
    // Choice 道具锁招（讲究头带/眼镜/围巾）
    // =========================================================
    const eItem = e.item || '';
    const eIsChoiceItem = eItem.includes('Choice') || eItem.includes('讲究');
    if (eIsChoiceItem && !e.choiceLockedMove) {
        e.choiceLockedMove = move.name;
        console.log(`[CHOICE] ${e.name} 被 ${eItem} 锁定在 ${move.name}`);
    }
    
    // =========================================================
    // Z-Move / Max Move 使用标记 (全场只能用一次)
    // =========================================================
    const eMoveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const eMoveData = (typeof MOVES !== 'undefined' && MOVES[eMoveId]) ? MOVES[eMoveId] : {};
    
    // 检测并标记 Z 招式使用
    const eIsZMove = eMoveData.isZ || move.isZ ||
        (eMoveData.pp === 1 && eMoveData.basePower >= 100 && eMoveData.isNonstandard === 'Past');
    if (eIsZMove && !battle.enemyZUsed) {
        battle.enemyZUsed = true;
        console.log(`[Z-MOVE] 敌方使用了 Z 招式: ${move.name}，本场不可再用`);
        log(`<b style="color:#fbbf24; text-shadow: 0 0 10px #fbbf24;">✨ Z-POWER UNLEASHED ✨</b>`);
        log(`<span style="color:#fbbf24">${e.cnName} 释放了全部的 Z 力量！</span>`);
    }
    
    // 检测并标记极巨招式使用
    const eIsMaxMove = eMoveData.isMax || 
        (move.name || '').startsWith('Max ') || (move.name || '').startsWith('G-Max ');
    if (eIsMaxMove && !battle.enemyMaxUsed) {
        battle.enemyMaxUsed = true;
        console.log(`[MAX MOVE] 敌方使用了极巨招式: ${move.name}，本场不可再用`);
    }
    
    updateAllVisuals();
    
    console.log('[executeEnemyTurn] Completed');
    return { pivot: result?.pivot || false };
}

// ============================================
// 独立敌方回合
// ============================================

/**
 * 独立敌方回合 (用于换人后敌方攻击)
 */
async function enemyTurn() {
    const battle = window.battle;
    const p = battle.getPlayer();
    const e = battle.getEnemy();

    if (!e || !e.isAlive()) {
        battle.locked = false;
        return;
    }

    // 获取敌方 AI 决策
    let move = null;
    let enemyAction = null;
    
    if (typeof window.getAiAction === 'function') {
        enemyAction = window.getAiAction(e, p, battle.aiDifficulty || 'normal', battle.enemyParty, {
            turnCount: battle.turnCount || 1
        });
    }
    
    // 处理 AI 换人决策
    if (enemyAction && enemyAction.type === 'switch' && typeof enemyAction.index === 'number') {
        const switchTarget = battle.enemyParty[enemyAction.index];
        if (switchTarget && switchTarget.isAlive() && switchTarget !== e) {
            log(`<span style="color:#ef4444">敌方收回了 ${e.cnName}！</span>`);
            
            if (e.choiceLockedMove) {
                console.log(`[CHOICE] ${e.name} 换下，解除 ${e.choiceLockedMove} 锁定`);
                delete e.choiceLockedMove;
            }
            
            if (e.isDynamaxed && typeof window.applyDynamaxState === 'function') {
                console.log(`[SWITCH] Enemy ${e.name} was Dynamaxed, restoring moves`);
                window.applyDynamaxState(e, false);
            }
            
            if (typeof e.resetBoosts === 'function') {
                e.resetBoosts();
            }
            
            battle.enemyActive = enemyAction.index;
            const newE = battle.getEnemy();
            log(`<span style="color:#ef4444">敌方派出了 ${newE.cnName}！</span>`);
            
            // 检查进场变形
            if (typeof window.checkInitTransform === 'function' && newE.needsInitTransform) {
                const result = window.checkInitTransform(newE);
                if (result) {
                    log(`<span style="color:#ef4444">✦ 敌方 ${result.oldName} 变为 ${result.newName}！</span>`);
                }
            }
            
            updateAllVisuals('enemy');
            
            if (typeof window.triggerEntryAbilities === 'function') {
                window.triggerEntryAbilities(newE, p);
            }
            
            // 结算敌方场地钉子伤害
            if (typeof MoveEffects !== 'undefined' && MoveEffects.applyEntryHazards) {
                const hazardLogs = MoveEffects.applyEntryHazards(newE, false, battle);
                hazardLogs.forEach(msg => log(msg));
                if (hazardLogs.length > 0) updateAllVisuals();
            }
            
            battle.locked = false;
            return;
        }
    }
    
    // 普通攻击
    if (enemyAction && enemyAction.move) {
        move = enemyAction.move;
    }
    
    // 回退到旧 AI
    if (!move && typeof window.getAiMove === 'function') {
        move = window.getAiMove(e, p, battle.aiDifficulty || 'normal');
    }
    if (!move) {
        move = e.moves[Math.floor(Math.random() * e.moves.length)];
    }

    // 执行敌方回合
    await executeEnemyTurn(e, p, move);

    // 检查玩家是否倒下
    if (!p.isAlive()) {
        if (typeof window.handlePlayerFainted === 'function') {
            await window.handlePlayerFainted(p);
        }
        return;
    }

    battle.locked = false;
}

// ============================================
// 导出
// ============================================

if (typeof window !== 'undefined') {
    window.executePlayerTurn = executePlayerTurn;
    window.executeEnemyTurn = executeEnemyTurn;
    window.enemyTurn = enemyTurn;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        executePlayerTurn,
        executeEnemyTurn,
        enemyTurn
    };
}
