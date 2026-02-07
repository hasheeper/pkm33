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
// 回合开始处理
// ============================================

/**
 * 回合开始时的统一处理
 * - 递减风格冷却
 * - 其他回合开始钩子
 */
export function onTurnStart() {
    const battle = window.battle;
    if (!battle) return;
    
    const logs = [];
    
    // 【Chronal Rift 速度熵增】回合开始时检查时空翻转
    if (typeof window.WeatherEffects !== 'undefined' && window.WeatherEffects.checkEntropyFlux) {
        const weather = battle?.weather || battle?.environmentWeather || '';
        const entropyResult = window.WeatherEffects.checkEntropyFlux(weather);
        if (entropyResult.shouldTrigger) {
            // 翻转戏法空间状态
            battle.field = battle.field || {};
            if (battle.field.trickRoom > 0) {
                // 关闭戏法空间
                battle.field.trickRoom = 0;
                logs.push(entropyResult.message);
                logs.push(`<span style="color:#a855f7">🌀 戏法空间崩塌！速度恢复正常！</span>`);
                console.log(`[CHRONAL RIFT] ⚡ 速度熵增：戏法空间关闭`);
            } else {
                // 开启戏法空间（无限持续）
                battle.field.trickRoom = 999; // 无限持续
                battle.field.chronalTrickRoom = true; // 标记为时空裂隙产生的
                logs.push(entropyResult.message);
                logs.push(`<span style="color:#a855f7">🌀 戏法空间展开！速度的概念被扭曲了！</span>`);
                console.log(`[CHRONAL RIFT] ⚡ 速度熵增：戏法空间开启（无限）`);
            }
            // 输出日志
            if (typeof window.log === 'function') {
                logs.forEach(l => window.log(l));
            }
        }
    }
    
    // 【古武系统】回合开始时递减冷却
    if (battle.playerStyleCooldown > 0) {
        battle.playerStyleCooldown--;
        console.log(`[STYLES] 玩家风格冷却递减: ${battle.playerStyleCooldown + 1} -> ${battle.playerStyleCooldown}`);
        if (typeof window.updateStyleButtonCooldown === 'function') {
            window.updateStyleButtonCooldown();
        }
    }
    if (battle.enemyStyleCooldown > 0) {
        battle.enemyStyleCooldown--;
        console.log(`[STYLES] 敌方风格冷却递减: ${battle.enemyStyleCooldown + 1} -> ${battle.enemyStyleCooldown}`);
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
export async function executePlayerTurn(p, e, move) {
    const battle = window.battle;
    
    // === 【官方机制】同命/怨恨状态清除逻辑 ===
    // 关键：状态在使用者"尝试出招"时清除，不管出什么招
    // 例外：如果因为睡眠/冰冻/畏缩等无法行动，状态保留
    
    // 状态阻断检测
    if (typeof window.checkCanMove === 'function') {
        const check = window.checkCanMove(p);
        if (check.msg) {
            log(`<span style="color:#e67e22">${check.msg}</span>`);
        }
        if (!check.can) {
            // 【关键】无法行动时，同命/怨恨等状态保留！
            console.log(`[STATUS BLOCK] ${p.cnName} 无法行动 (${check.msg || '未知原因'})，同命等状态保留`);
            await wait(500);
            return { pivot: false };
        }
    }
    
    // === 【混乱自伤检查】===
    if (typeof window.MoveEffects !== 'undefined' && window.MoveEffects.checkConfusion) {
        const confusionCheck = window.MoveEffects.checkConfusion(p);
        confusionCheck.logs.forEach(txt => log(`<span style="color:#e67e22">${txt}</span>`));
        if (confusionCheck.selfHit) {
            // 混乱自伤，无法行动
            console.log(`[CONFUSION] ${p.cnName} 混乱自伤，无法行动`);
            await wait(500);
            return { pivot: false };
        }
    }

    // === 特性 onBeforeMove 钩子 (懒惰、变幻自如等) ===
    if (typeof AbilityHandlers !== 'undefined' && p.ability) {
        const abilityHandler = AbilityHandlers[p.ability];
        if (abilityHandler && abilityHandler.onBeforeMove) {
            const beforeMoveLogs = [];
            const canMove = abilityHandler.onBeforeMove(p, move, beforeMoveLogs);
            beforeMoveLogs.forEach(txt => log(txt));
            if (canMove === false) {
                // 【关键】特性阻止行动时，同命状态保留！
                console.log(`[DESTINY BOND] ${p.cnName} 被特性阻止行动，同命状态保留`);
                await wait(500);
                return { pivot: false };
            }
        }
    }

    // === 硬直检查 (破坏光线/爆炸烈焰等) ===
    // 【修复】在输出"使用了xxx"之前检查，避免误导性日志
    if (p.mustRecharge) {
        log(`<span style="color:#e74c3c">${p.cnName} 因为上回合的反作用力无法动弹!</span>`);
        p.mustRecharge = false;
        // 【关键】硬直时，同命状态保留！
        console.log(`[DESTINY BOND] ${p.cnName} 硬直中，同命状态保留`);
        await wait(500);
        return { pivot: false };
    }

    // === 【精神场地】阻止先制技能对地面目标生效 ===
    // 【重要】只阻止"以对手为目标"的先制技能，不阻止 self/allySide 等
    const getMovePriorityFn = (typeof window.getMovePriority === 'function') ? window.getMovePriority : (m => m?.priority || 0);
    const movePriority = getMovePriorityFn(move, p, e);
    if (movePriority > 0 && battle?.terrain === 'psychicterrain') {
        // 检查招式目标类型：只有以对手为目标的招式才会被阻止
        const moveTarget = move.target || 'normal';
        const targetsOpponent = !['self', 'allySide', 'allyTeam', 'allies', 'adjacentAlly', 'adjacentAllyOrSelf'].includes(moveTarget);
        
        if (targetsOpponent) {
            // 检查目标是否接地（Flying 类型或 Levitate 特性不受影响）
            const targetAbility = (e.ability || '').toLowerCase().replace(/[^a-z]/g, '');
            const targetIsGrounded = !e.types?.includes('Flying') && targetAbility !== 'levitate';
            
            if (targetIsGrounded) {
                log(`<span style="color:#9b59b6">🔮 ${e.cnName} 被精神场地保护了！先制技能无效！</span>`);
                console.log(`[PSYCHIC TERRAIN] ${p.cnName} 的先制技能 ${move.name} (priority=${movePriority}, target=${moveTarget}) 被精神场地阻止`);
                await wait(500);
                return { pivot: false };
            }
        }
    }

    // === 【官方机制】在尝试出招时立即清除同命/怨恨状态 ===
    // 不管这回合用什么招（攻击/变化/守住），只要开始行动就清除
    if (p.volatile && p.volatile.destinyBond) {
        delete p.volatile.destinyBond;
        console.log(`[DESTINY BOND CLEAR] ${p.cnName} 尝试出招，同命状态清除`);
    }
    if (p.volatile && p.volatile.grudge) {
        delete p.volatile.grudge;
        console.log(`[GRUDGE CLEAR] ${p.cnName} 尝试出招，怨恨状态清除`);
    }

    log(`[${p.cnName}] 使用了 <b>${move.cn}</b>!`);
    await wait(400);

    const result = applyDamage(p, e, move, 'enemy-sprite');
    
    // 等待VFX动画播完（若击倒则额外等待倒下动画）
    if (e.currHp <= 0) {
        await wait(1500);
    } else {
        await wait(800);
    }
    
    // 记录本回合使用的技能
    p.lastMoveUsed = move.name;
    
    // 【Gen7同命机制】使用其他招式时清除同命成功标记，重置连锁
    if (move.name !== 'Destiny Bond') {
        p.lastDestinyBondSuccess = false;
    }
    // 【怨恨同理】
    if (move.name !== 'Grudge') {
        p.lastGrudgeSuccess = false;
    }
    
    // 【珍藏(Last Resort)支持】追踪所有成功使用过的招式
    if (!result?.failed) {
        if (!p.usedMoves) p.usedMoves = new Set();
        p.usedMoves.add(move.name);
    }
    
    // =========================================================
    // Choice 道具锁招（讲究头带/眼镜/围巾）- 玩家
    // =========================================================
    const pItem = p.item || '';
    const pIsChoiceItem = pItem.includes('Choice') || pItem.includes('讲究');
    if (pIsChoiceItem && !p.choiceLockedMove) {
        p.choiceLockedMove = move.name;
        console.log(`[CHOICE] ${p.name} 被 ${pItem} 锁定在 ${move.name}`);
    }
    
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
    
    // 【VFX修复】pivot 换人技（折返/伏特替换等）需要等动画播完再刷新精灵图
    if (result?.pivot) {
        await wait(700);
    }
    updateAllVisuals();
    
    // === 检查危机 BGM 切换 (馆主战专用) ===
    if (typeof checkCrisisBgm === 'function') {
        checkCrisisBgm();
    }
    
    // 【已移除】旧的招式执行后清除逻辑
    // 现在同命/怨恨状态在"尝试出招时"立即清除（见上方代码）
    
    return { 
        pivot: result?.pivot || false,
        passSub: result?.passSub || false,  // 【修复】传递替身传递标记 (Shed Tail)
        passBoosts: result?.passBoosts || false,  // 【修复】传递能力变化标记 (Baton Pass)
        phaze: result?.phaze || false  // 【新增】强制换人标记 (Roar/Dragon Tail/Circle Throw)
    };
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
export async function executeEnemyTurn(e, p, move) {
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

    // === 【官方机制】同命/怨恨状态清除逻辑 ===
    // 关键：状态在使用者"尝试出招"时清除，不管出什么招
    // 例外：如果因为睡眠/冰冻/畏缩等无法行动，状态保留

    await wait(800);
    
    // 状态阻断检测
    if (typeof window.checkCanMove === 'function') {
        const check = window.checkCanMove(e);
        if (check.msg) {
            log(`<span style="color:#e67e22">${check.msg}</span>`);
        }
        if (!check.can) {
            // 【关键】无法行动时，同命/怨恨等状态保留！
            console.log(`[STATUS BLOCK] ${e.cnName} 无法行动 (${check.msg || '未知原因'})，同命等状态保留`);
            return { pivot: false };
        }
    }
    
    // === 【混乱自伤检查】===
    if (typeof window.MoveEffects !== 'undefined' && window.MoveEffects.checkConfusion) {
        const confusionCheck = window.MoveEffects.checkConfusion(e);
        confusionCheck.logs.forEach(txt => log(`<span style="color:#e67e22">${txt}</span>`));
        if (confusionCheck.selfHit) {
            // 混乱自伤，无法行动
            console.log(`[CONFUSION] ${e.cnName} 混乱自伤，无法行动`);
            return { pivot: false };
        }
    }

    // === 特性 onBeforeMove 钩子 (懒惰、变幻自如等) ===
    if (typeof AbilityHandlers !== 'undefined' && e.ability) {
        const abilityHandler = AbilityHandlers[e.ability];
        if (abilityHandler && abilityHandler.onBeforeMove) {
            const beforeMoveLogs = [];
            const canMove = abilityHandler.onBeforeMove(e, move, beforeMoveLogs);
            beforeMoveLogs.forEach(txt => log(txt));
            if (canMove === false) {
                // 【关键】特性阻止行动时，同命状态保留！
                console.log(`[DESTINY BOND] ${e.cnName} 被特性阻止行动，同命状态保留`);
                return { pivot: false };
            }
        }
    }

    // === 硬直检查 (破坏光线/爆炸烈焰等) ===
    // 【修复】在输出"使出xxx"之前检查，避免误导性日志
    if (e.mustRecharge) {
        log(`<span style="color:#e74c3c">${e.cnName} 因为上回合的反作用力无法动弹!</span>`);
        e.mustRecharge = false;
        // 【关键】硬直时，同命状态保留！
        console.log(`[DESTINY BOND] ${e.cnName} 硬直中，同命状态保留`);
        return { pivot: false };
    }

    // === 【精神场地】阻止先制技能对地面目标生效 ===
    // 【重要】只阻止"以对手为目标"的先制技能，不阻止 self/allySide 等
    const getMovePriorityFnE = (typeof window.getMovePriority === 'function') ? window.getMovePriority : (m => m?.priority || 0);
    const movePriorityE = getMovePriorityFnE(move, e, p);
    if (movePriorityE > 0 && battle?.terrain === 'psychicterrain') {
        // 检查招式目标类型：只有以对手为目标的招式才会被阻止
        const moveTargetE = move.target || 'normal';
        const targetsOpponentE = !['self', 'allySide', 'allyTeam', 'allies', 'adjacentAlly', 'adjacentAllyOrSelf'].includes(moveTargetE);
        
        if (targetsOpponentE) {
            // 检查目标是否接地（Flying 类型或 Levitate 特性不受影响）
            const targetAbility = (p.ability || '').toLowerCase().replace(/[^a-z]/g, '');
            const targetIsGrounded = !p.types?.includes('Flying') && targetAbility !== 'levitate';
            
            if (targetIsGrounded) {
                log(`<span style="color:#9b59b6">🔮 ${p.cnName} 被精神场地保护了！先制技能无效！</span>`);
                console.log(`[PSYCHIC TERRAIN] ${e.cnName} 的先制技能 ${move.name} (priority=${movePriorityE}, target=${moveTargetE}) 被精神场地阻止`);
                return { pivot: false };
            }
        }
    }

    // === 【官方机制】在尝试出招时立即清除同命/怨恨状态 ===
    // 不管这回合用什么招（攻击/变化/守住），只要开始行动就清除
    if (e.volatile && e.volatile.destinyBond) {
        delete e.volatile.destinyBond;
        console.log(`[DESTINY BOND CLEAR] ${e.cnName} 尝试出招，同命状态清除`);
    }
    if (e.volatile && e.volatile.grudge) {
        delete e.volatile.grudge;
        console.log(`[GRUDGE CLEAR] ${e.cnName} 尝试出招，怨恨状态清除`);
    }

    const moveName = move.cn || move.name || 'Unknown';
    log(`[${e.cnName}] 使出 <b>${moveName}</b>!`);
    await wait(400);

    const result = applyDamage(e, p, move, 'player-sprite');
    
    // 等待VFX动画播完（若击倒则额外等待倒下动画）
    if (p.currHp <= 0) {
        await wait(1500);
    } else {
        await wait(800);
    }
    
    // 记录本回合使用的技能
    e.lastMoveUsed = move.name;
    
    // 【Gen7同命机制】使用其他招式时清除同命成功标记，重置连锁
    if (move.name !== 'Destiny Bond') {
        e.lastDestinyBondSuccess = false;
    }
    // 【怨恨同理】
    if (move.name !== 'Grudge') {
        e.lastGrudgeSuccess = false;
    }
    
    // 【珍藏(Last Resort)支持】追踪所有成功使用过的招式
    if (!result?.failed) {
        if (!e.usedMoves) e.usedMoves = new Set();
        e.usedMoves.add(move.name);
    }
    
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
    
    // 【VFX修复】pivot 换人技（折返/伏特替换等）需要等动画播完再刷新精灵图
    if (result?.pivot) {
        await wait(700);
    }
    updateAllVisuals();
    
    // 【已移除】旧的招式执行后清除逻辑
    // 现在同命/怨恨状态在"尝试出招时"立即清除（见上方代码）
    
    console.log('[executeEnemyTurn] Completed');
    return { 
        pivot: result?.pivot || false,
        passBoosts: result?.passBoosts || false,  // 【Baton Pass】传递能力变化标记
        phaze: result?.phaze || false  // 【新增】强制换人标记 (Roar/Dragon Tail/Circle Throw)
    };
}

// ============================================
// 独立敌方回合
// ============================================

/**
 * 独立敌方回合 (用于换人后敌方攻击)
 */
export async function enemyTurn() {
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
            
            // 【标记换人】用于重复精灵图修复
            if (typeof window.markEnemySwitch === 'function') {
                window.markEnemySwitch();
            }
            
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
        // 【修复】玩家倒下换人后，仍需执行回合末结算（敌方极巨化 tick 等）
        const newP = battle.getPlayer();
        const currentE = battle.getEnemy();
        if (newP && newP.isAlive() && currentE && currentE.isAlive()) {
            if (typeof window.executeEndPhase === 'function') {
                await window.executeEndPhase(newP, currentE);
            }
        }
        return;
    }

    battle.locked = false;
}

// ============================================
// 回合结束状态结算
// ============================================

/**
 * 回合结束时的状态伤害/回复结算
 * @param {Pokemon} poke 要结算的宝可梦
 * @param {Pokemon} opponent 对手宝可梦（用于寄生种子吸血）
 * @param {boolean} isPlayerPoke 是否为玩家方的宝可梦（AVs 效果只对玩家方生效）
 * @returns {Array} logs
 */
export function getEndTurnStatusLogs(poke, opponent, isPlayerPoke = false) {
    let logs = [];
    if (!poke || !poke.isAlive()) return logs;

    // 【魔法防守 Magic Guard】免疫所有非直接攻击伤害（包括状态伤害、寄生种子、束缚等）
    const pokeAbilityBase = (poke.ability || '').toLowerCase().replace(/[^a-z]/g, '');
    const hasMagicGuard = pokeAbilityBase === 'magicguard';

    // ----------------------------------------
    // 1. 灼伤 (Burn): 扣 1/16 HP
    // ----------------------------------------
    if (poke.status === 'brn' && !hasMagicGuard) {
        const dmg = Math.max(1, Math.floor(poke.maxHp / 16));
        poke.takeDamage(dmg);
        logs.push(`${poke.cnName} 受到灼伤的伤害! (-${dmg})`);
        // 播放灼伤 VFX
        if (typeof window !== 'undefined' && typeof window.BattleVFX !== 'undefined') {
            window.BattleVFX.triggerStatusVFX('BRN', isPlayerPoke ? 'player-sprite' : 'enemy-sprite');
        }
    }

    // ----------------------------------------
    // 2. 中毒 (Poison): 扣 1/8 HP
    // 【修复】检查 Poison Heal (毒疗) 特性
    // ----------------------------------------
    if (poke.status === 'psn' || poke.status === 'tox') {
        const pokeAbilityId = (poke.ability || '').toLowerCase().replace(/[^a-z]/g, '');
        
        // 检查魔法防守
        if (hasMagicGuard) {
            // Magic Guard 免疫状态伤害（但剧毒计数器仍然递增）
            if (poke.status === 'tox') {
                poke.statusTurns = (poke.statusTurns || 0) + 1;
            }
        // 检查毒疗特性
        } else if (pokeAbilityId === 'poisonheal') {
            // 毒疗：回复 1/8 HP
            const baseHeal = Math.max(1, Math.floor(poke.maxHp / 8));
            let actualHeal = baseHeal;
            if (typeof poke.heal === 'function') {
                actualHeal = poke.heal(baseHeal);
            } else {
                poke.currHp = Math.min(poke.maxHp, poke.currHp + baseHeal);
            }
            logs.push(`<span style="color:#4cd137">💚 ${poke.cnName} 的毒疗特性发动，回复了 ${actualHeal} 点体力!</span>`);
            if (typeof window !== 'undefined' && typeof window.playSFX === 'function') window.playSFX('HEAL');
            if (typeof window !== 'undefined' && typeof window.BattleVFX !== 'undefined') {
                window.BattleVFX.triggerStatVFX('HEAL', isPlayerPoke ? 'player-sprite' : 'enemy-sprite');
            }
        } else {
            let dmg;
            let vfxType;
            if (poke.status === 'tox') {
                // 【剧毒】递增伤害: maxHp * N/16，N 每回合 +1
                poke.statusTurns = (poke.statusTurns || 0) + 1;
                dmg = Math.max(1, Math.floor(poke.maxHp * poke.statusTurns / 16));
                poke.takeDamage(dmg);
                logs.push(`${poke.cnName} 受到剧毒的伤害! (-${dmg})`);
                vfxType = 'TOX';
            } else {
                // 【普通中毒】固定 1/8 HP
                dmg = Math.max(1, Math.floor(poke.maxHp / 8));
                poke.takeDamage(dmg);
                logs.push(`${poke.cnName} 受到毒素的伤害! (-${dmg})`);
                vfxType = 'PSN';
            }
            // 播放中毒/剧毒 VFX
            if (typeof window !== 'undefined' && typeof window.BattleVFX !== 'undefined') {
                window.BattleVFX.triggerStatusVFX(vfxType, isPlayerPoke ? 'player-sprite' : 'enemy-sprite');
            }
        }
    }

    // ----------------------------------------
    // 3. 寄生种子 (Leech Seed): 被对方吸血 1/8
    // ----------------------------------------
    if (poke.volatile && poke.volatile['leechseed'] && opponent && opponent.isAlive() && !hasMagicGuard) {
        const baseDrain = Math.max(1, Math.floor(poke.maxHp / 8));
        let actualHeal = baseDrain;
        
        // 【环境图层系统】吸血效率修正
        if (typeof window !== 'undefined' && window.envOverlay) {
            const drainMod = window.envOverlay.getDrainMod(opponent, null);
            if (drainMod !== 1) {
                actualHeal = Math.max(1, Math.floor(baseDrain * drainMod));
                console.log(`[ENV OVERLAY] 寄生种子吸血效率修正: ${baseDrain} × ${drainMod} = ${actualHeal}`);
            }
        }
        
        poke.takeDamage(baseDrain);
        opponent.heal(actualHeal);
        if (typeof window !== 'undefined' && typeof window.playSFX === 'function') window.playSFX('HEAL');
        if (typeof window !== 'undefined' && typeof window.BattleVFX !== 'undefined') {
            window.BattleVFX.triggerStatVFX('HEAL', isPlayerPoke ? 'enemy-sprite' : 'player-sprite');
        }
        if (actualHeal !== baseDrain) {
            logs.push(`${poke.cnName} 的体力被寄生种子吸取了! (-${baseDrain}, 回复${actualHeal})`);
        } else {
            logs.push(`${poke.cnName} 的体力被寄生种子吸取了! (-${baseDrain})`);
        }
    }

    // ----------------------------------------
    // 4. 束缚状态 (Bind / Whirlpool / Fire Spin) -> 扣 1/8
    // ----------------------------------------
    if (poke.volatile && poke.volatile['partiallytrapped'] && !hasMagicGuard) {
        const dmg = Math.max(1, Math.floor(poke.maxHp / 8));
        poke.takeDamage(dmg);
        logs.push(`${poke.cnName} 因束缚而受到伤害! (-${dmg})`);
    }

    // ----------------------------------------
    // 5. 诅咒 (Curse - Ghost使用): 每回合扣 1/4
    // ----------------------------------------
    if (poke.volatile && poke.volatile['curse'] && !hasMagicGuard) {
        const dmg = Math.max(1, Math.floor(poke.maxHp / 4));
        poke.takeDamage(dmg);
        logs.push(`${poke.cnName} 受到了诅咒! (-${dmg})`);
    }

    // ----------------------------------------
    // 5.5 盐腌 (Salt Cure): 每回合扣 1/8 HP，水/钢系扣 1/4
    // 【Gen 9】盐石巨灵核心招式
    // ----------------------------------------
    if (poke.volatile && poke.volatile['saltcure'] && !hasMagicGuard) {
        // 检查是否为水系或钢系
        const isWaterOrSteel = poke.types && (poke.types.includes('Water') || poke.types.includes('Steel'));
        const dmgRatio = isWaterOrSteel ? 4 : 8; // 水/钢系 1/4，其他 1/8
        const dmg = Math.max(1, Math.floor(poke.maxHp / dmgRatio));
        poke.takeDamage(dmg);
        if (isWaterOrSteel) {
            logs.push(`<span style="color:#9b59b6">🧂 ${poke.cnName} 因盐腌受到了严重伤害! (-${dmg})</span>`);
        } else {
            logs.push(`<span style="color:#9b59b6">🧂 ${poke.cnName} 因盐腌受到伤害! (-${dmg})</span>`);
        }
    }

    // ----------------------------------------
    // 5.6 糖浆炸弹 (Syrup Bomb): 每回合速度-1，持续3回合
    // 【Gen 9】
    // ----------------------------------------
    if (poke.volatile && poke.volatile['syrupbomb'] && poke.volatile['syrupbomb'] > 0) {
        // 降低速度1级
        if (typeof poke.applyBoost === 'function') {
            const diff = poke.applyBoost('spe', -1);
            if (diff !== 0) {
                logs.push(`<span style="color:#f39c12">🍯 ${poke.cnName} 因糖浆而速度下降了!</span>`);
            } else {
                logs.push(`<span style="color:#f39c12">🍯 ${poke.cnName} 的速度已经无法再降低了!</span>`);
            }
        }
        poke.volatile['syrupbomb']--;
        if (poke.volatile['syrupbomb'] <= 0) {
            delete poke.volatile['syrupbomb'];
            logs.push(`${poke.cnName} 身上的糖浆脱落了!`);
        }
    }

    // ----------------------------------------
    // 6. 哈欠 (Yawn): 倒计时，时间到睡着
    // 【修复】使用 tryInflictStatus 进行特性/场地免疫检查
    // ----------------------------------------
    if (poke.volatile && poke.volatile['yawn']) {
        poke.volatile['yawn'] -= 1;
        if (poke.volatile['yawn'] <= 0) {
            delete poke.volatile['yawn'];
            if (!poke.status) {
                // 【关键修复】检查电气场地防睡
                const battle = window.battle;
                const currentTerrain = battle?.terrain;
                const pokeAbility = (poke.ability || '').toLowerCase().replace(/[^a-z]/g, '');
                const isGrounded = !poke.types?.includes('Flying') && pokeAbility !== 'levitate';
                
                if (currentTerrain === 'electricterrain' && isGrounded) {
                    logs.push(`电气场地保护了 ${poke.cnName}，无法入睡！`);
                } else if (typeof MoveEffects !== 'undefined' && MoveEffects.tryInflictStatus) {
                    // 使用 tryInflictStatus 检查特性免疫（不眠/干劲/绝对睡眠等）
                    const result = MoveEffects.tryInflictStatus(poke, 'slp', null, battle);
                    if (result.success) {
                        poke.sleepTurns = Math.floor(Math.random() * 3) + 2;
                        logs.push(`${poke.cnName} 的睡意袭来了! -> 睡着了!`);
                    } else {
                        logs.push(result.message || `${poke.cnName} 无法入睡！`);
                    }
                } else {
                    // 回退逻辑：直接设置睡眠
                    poke.status = 'slp';
                    poke.sleepTurns = Math.floor(Math.random() * 3) + 2;
                    logs.push(`${poke.cnName} 的睡意袭来了! -> 睡着了!`);
                }
            }
        } else {
            logs.push(`${poke.cnName} 更加困倦了...`);
        }
    }

    // ----------------------------------------
    // 7. 水流环 (Aqua Ring): 每回合回复 1/16 HP
    // ----------------------------------------
    if (poke.volatile && poke.volatile.aquaring) {
        const heal = Math.max(1, Math.floor(poke.maxHp / 16));
        poke.heal(heal);
        logs.push(`${poke.cnName} 的水流环恢复了体力! (+${heal})`);
        if (typeof window !== 'undefined' && typeof window.playSFX === 'function') window.playSFX('HEAL');
        if (typeof window !== 'undefined' && typeof window.BattleVFX !== 'undefined') {
            window.BattleVFX.triggerStatVFX('HEAL', isPlayerPoke ? 'player-sprite' : 'enemy-sprite');
        }
    }

    // ----------------------------------------
    // 8. 扎根 (Ingrain): 每回合回复 1/16 HP
    // ----------------------------------------
    if (poke.volatile && poke.volatile.ingrain) {
        const heal = Math.max(1, Math.floor(poke.maxHp / 16));
        poke.heal(heal);
        logs.push(`${poke.cnName} 从地面吸收了养分! (+${heal})`);
        if (typeof window !== 'undefined' && typeof window.playSFX === 'function') window.playSFX('HEAL');
        if (typeof window !== 'undefined' && typeof window.BattleVFX !== 'undefined') {
            window.BattleVFX.triggerStatVFX('HEAL', isPlayerPoke ? 'player-sprite' : 'enemy-sprite');
        }
    }

    // ----------------------------------------
    // 8.5 【环境图层系统】HP 跳动 + 状态治愈
    // ----------------------------------------
    if (typeof window !== 'undefined' && window.envOverlay) {
        const envResult = window.envOverlay.processTurnEnd(poke);
        
        // HP 变化
        if (envResult.hpChange !== 0) {
            if (envResult.hpChange > 0) {
                poke.heal(envResult.hpChange);
            } else {
                poke.takeDamage(Math.abs(envResult.hpChange));
            }
        }
        
        // 状态治愈
        if (envResult.curedStatus) {
            poke.status = null;
            poke.statusTurns = 0;
        }
        
        // 输出日志
        envResult.logs.forEach(log => logs.push(`<span style="color:#a855f7">🌍 ${log}</span>`));
    }

    // ----------------------------------------
    // 9. 天气伤害 (Weather Damage)
    // 【重构】使用 weather-effects.js 模块
    // ----------------------------------------
    const battle = window.battle;
    const currentWeather = battle ? battle.weather : null;
    
    if (currentWeather && typeof window.WeatherEffects !== 'undefined') {
        // 使用新模块计算天气伤害
        const weatherDmg = window.WeatherEffects.getWeatherDamage(poke, currentWeather);
        if (weatherDmg > 0) {
            poke.takeDamage(weatherDmg);
            const weatherLog = window.WeatherEffects.getWeatherDamageLog(poke, currentWeather, weatherDmg);
            logs.push(weatherLog);
        }
    } else if (currentWeather) {
        // Fallback: 旧逻辑（仅在模块未加载时使用）
        const pokeAbility = (poke.ability || '').toLowerCase().replace(/[^a-z]/g, '');
        const hasMagicGuard = pokeAbility === 'magicguard';
        const hasOvercoat = pokeAbility === 'overcoat';
        const pokeItem = (poke.item || '').toLowerCase().replace(/[^a-z]/g, '');
        const hasSafetyGoggles = pokeItem === 'safetygoggles';
        
        if (!hasMagicGuard && !hasOvercoat && !hasSafetyGoggles) {
            if (currentWeather === 'sandstorm') {
                const immuneToSand = poke.types && (poke.types.includes('Rock') || poke.types.includes('Ground') || poke.types.includes('Steel'));
                const sandAbilityImmune = ['sandveil', 'sandforce', 'sandrush'].includes(pokeAbility);
                if (!immuneToSand && !sandAbilityImmune) {
                    const dmg = Math.max(1, Math.floor(poke.maxHp / 16));
                    poke.takeDamage(dmg);
                    logs.push(`${poke.cnName} 受到沙暴的伤害! (-${dmg})`);
                }
            }
        }
    }

    // ----------------------------------------
    // 10. 天气相关特性回合末效果
    // ----------------------------------------
    const pokeAbilityForWeather = (poke.ability || '').toLowerCase().replace(/[^a-z]/g, '');
    const currentWeatherForAbility = battle?.weather;
    
    // 【湿润之躯 Hydration】雨天时回合末治愈所有异常状态
    // 【天气统一】标准值: rain, 极端值: heavyrain
    if (pokeAbilityForWeather === 'hydration' && poke.status) {
        const isRainy = currentWeatherForAbility === 'rain' || currentWeatherForAbility === 'heavyrain';
        if (isRainy) {
            const oldStatus = poke.status;
            const statusNames = { slp: '睡眠', psn: '中毒', tox: '剧毒', brn: '灼伤', par: '麻痹', frz: '冰冻' };
            poke.status = null;
            poke.statusTurns = 0;
            poke.sleepTurns = 0;
            logs.push(`<span style="color:#3498db">💧 ${poke.cnName} 的湿润之躯发动，${statusNames[oldStatus] || '异常状态'}痊愈了!</span>`);
        }
    }
    
    // 【蜕皮 Shed Skin】每回合 30% 概率治愈异常状态
    if (pokeAbilityForWeather === 'shedskin' && poke.status) {
        if (Math.random() < 0.30) {
            const oldStatus = poke.status;
            const statusNames = { slp: '睡眠', psn: '中毒', tox: '剧毒', brn: '灼伤', par: '麻痹', frz: '冰冻' };
            poke.status = null;
            poke.statusTurns = 0;
            poke.sleepTurns = 0;
            logs.push(`<span style="color:#9b59b6">✨ ${poke.cnName} 的蜕皮发动，${statusNames[oldStatus] || '异常状态'}痊愈了!</span>`);
        }
    }
    
    // 【冰冻之躯 Ice Body】冰雹/雪天时回复 1/16 HP
    // 【天气统一】兼容 hail 和 snow
    if (pokeAbilityForWeather === 'icebody' && (currentWeatherForAbility === 'hail' || currentWeatherForAbility === 'snow')) {
        if (poke.currHp < poke.maxHp) {
            const healAmount = Math.max(1, Math.floor(poke.maxHp / 16));
            poke.heal(healAmount);
            logs.push(`<span style="color:#74b9ff">${poke.cnName} 的冰冻之躯恢复了 ${healAmount} 点体力!</span>`);
        }
    }
    
    // 【干燥皮肤 Dry Skin】雨天回复 1/8 HP，晴天扣 1/8 HP
    // 【天气统一】标准值: rain/sun, 极端值: heavyrain/harshsun
    if (pokeAbilityForWeather === 'dryskin') {
        const isRainyDry = currentWeatherForAbility === 'rain' || currentWeatherForAbility === 'heavyrain';
        const isSunnyDry = currentWeatherForAbility === 'sun' || currentWeatherForAbility === 'harshsun';
        if (isRainyDry) {
            if (poke.currHp < poke.maxHp) {
                const healAmount = Math.max(1, Math.floor(poke.maxHp / 8));
                poke.heal(healAmount);
                logs.push(`<span style="color:#3498db">${poke.cnName} 的干燥皮肤在雨中恢复了 ${healAmount} 点体力!</span>`);
            }
        } else if (isSunnyDry) {
            const dmg = Math.max(1, Math.floor(poke.maxHp / 8));
            poke.takeDamage(dmg);
            logs.push(`<span style="color:#e74c3c">${poke.cnName} 的干燥皮肤在阳光下受到了 ${dmg} 点伤害!</span>`);
        }
    }
    
    // 【雨盘 Rain Dish】雨天回复 1/16 HP
    // 【天气统一】标准值: rain, 极端值: heavyrain
    if (pokeAbilityForWeather === 'raindish') {
        const isRainyDish = currentWeatherForAbility === 'rain' || currentWeatherForAbility === 'heavyrain';
        if (isRainyDish) {
            if (poke.currHp < poke.maxHp) {
                const healAmount = Math.max(1, Math.floor(poke.maxHp / 16));
                poke.heal(healAmount);
                logs.push(`<span style="color:#3498db">${poke.cnName} 的雨盘恢复了 ${healAmount} 点体力!</span>`);
            }
        }
    }
    
    // 【太阳之力 Solar Power】晴天时回合末扣 1/8 HP（特攻加成在 onModifyStat 中处理）
    // 【天气统一】标准值: sun, 极端值: harshsun
    if (pokeAbilityForWeather === 'solarpower') {
        const isSunnySolar = currentWeatherForAbility === 'sun' || currentWeatherForAbility === 'harshsun';
        if (isSunnySolar) {
            const dmg = Math.max(1, Math.floor(poke.maxHp / 8));
            poke.takeDamage(dmg);
            logs.push(`<span style="color:#f39c12">☀️ ${poke.cnName} 的太阳之力在阳光下消耗了 ${dmg} 点体力!</span>`);
        }
    }
    
    // 【收获 Harvest】回合末回收已使用的树果（晴天 100%，其他 50%）
    if (pokeAbilityForWeather === 'harvest' && poke.usedBerry && !poke.item) {
        const isSunnyHarvest = currentWeatherForAbility === 'sun' || currentWeatherForAbility === 'harshsun';
        const harvestChance = isSunnyHarvest ? 1.0 : 0.5;
        if (Math.random() < harvestChance) {
            poke.item = poke.usedBerry;
            logs.push(`<span style="color:#27ae60">🍇 ${poke.cnName} 的收获特性回收了 ${poke.usedBerry}!</span>`);
            
            // 【关键】获得道具后取消 Unburden 效果
            if (poke.unburdenActive) {
                poke.unburdenActive = false;
                console.log(`[HARVEST -> UNBURDEN] ${poke.cnName} 回收道具，轻装效果解除`);
            }
            poke.usedBerry = null;
            
            // 【关键修复】回收后立即检查是否满足吃果子条件
            if (typeof ItemEffects !== 'undefined' && ItemEffects.checkHPBerry) {
                let berryLogs = [];
                const berryTriggered = ItemEffects.checkHPBerry(poke, berryLogs, opponent);
                if (berryTriggered) {
                    berryLogs.forEach(txt => logs.push(txt));
                    console.log(`[HARVEST] ${poke.cnName} 回收后立即吃掉了果子`);
                }
            }
        }
    }
    
    // 【反刍 Cud Chew】回合末再吃一次上回合的树果
    if (pokeAbilityForWeather === 'cudchew' && poke.cudChewBerry) {
        if (poke.cudChewReady) {
            // 触发树果效果
            const berry = poke.cudChewBerry;
            logs.push(`<b style="color:#27ae60">🐄 ${poke.cnName} 的反刍特性发动！再次享用了 ${berry} 的效果！</b>`);
            
            // 根据树果类型触发效果
            if (typeof window.triggerBerryEffect === 'function') {
                window.triggerBerryEffect(poke, berry, logs);
            } else {
                // 简化版：直接回复 HP（大部分树果都是回复类）
                const itemId = berry.toLowerCase().replace(/[^a-z0-9]/g, '');
                if (itemId === 'sitrusberry') {
                    const baseHeal = Math.floor(poke.maxHp * 0.25);
                    let actualHeal = baseHeal;
                    if (typeof poke.heal === 'function') {
                        actualHeal = poke.heal(baseHeal);
                    } else {
                        poke.currHp = Math.min(poke.maxHp, poke.currHp + baseHeal);
                    }
                    logs.push(`<span style="color:#27ae60">回复了 ${actualHeal} 点体力！</span>`);
                }
            }
            poke.cudChewBerry = null;
            poke.cudChewReady = false;
        } else {
            // 标记下回合可以触发
            poke.cudChewReady = true;
        }
    }

    // =====================================================
    // === AVs: Devotion (献身) - 状态治愈 + 残血回复 ===
    // =====================================================
    // 【线性机制】概率 = (effectiveDevotion / 255) * 0.35
    // 满值 255 时约 35% 概率，100 时约 14% 概率
    // 只有【玩家方】的 isAce=true 宝可梦才能触发 AVs 被动
    // 【Ambrosia】神之琼浆天气下 AVS 触发率 x2
    if (isPlayerPoke && poke.isAce && poke.avs) {
        const baseDevotion = poke.getEffectiveAVs ? poke.getEffectiveAVs('devotion') : poke.avs.devotion;
        // 【全局开关】AVS 关闭时 getEffectiveAVs 返回 0，跳过计算
        if (baseDevotion > 0) {
            const effectiveDevotion = poke.avsEvolutionBoost ? baseDevotion * 2 : baseDevotion;
            const hpRatio = poke.currHp / poke.maxHp;
            const isCritical = hpRatio <= 0.30;
            
            // 线性概率计算：满值 35%，无保底（低 AVS 就是低概率）
            // Devotion 10 → 1.37%, Devotion 100 → 13.7%, Devotion 255 → 35%
            let baseChance = (effectiveDevotion / 255) * 0.35;
            
            // 【Ambrosia 神之琼浆】AVS 触发率 x2
            if (typeof window.WeatherEffects !== 'undefined' && window.WeatherEffects.getAVSMultiplier) {
                const currentWeather = battle?.weather || '';
                const avsMultiplier = window.WeatherEffects.getAVSMultiplier(currentWeather);
                if (avsMultiplier > 1) {
                    baseChance *= avsMultiplier;
                    baseChance = Math.min(baseChance, 1.0); // 上限 100%
                    console.log(`[AMBROSIA] 💫 神之琼浆：Devotion 触发率 x${avsMultiplier}`);
                }
            }
            
            // 初始化全局触发标记
            if (!poke.avsTriggered) poke.avsTriggered = {};
            if (poke.devotionStatusTriggered === undefined) poke.devotionStatusTriggered = -1;
            
            const currentTurn = battle && battle.turn ? battle.turn : 0;
            
            // 【触发条件 1】有异常状态 → 清除异常 + 回复 15% HP
            if (poke.status && poke.devotionStatusTriggered !== currentTurn) {
                if (Math.random() < baseChance) {
                    const oldStatus = poke.status;
                    poke.status = null;
                    poke.sleepTurns = 0;
                    const healAmount = Math.floor(poke.maxHp * 0.15);
                    poke.heal(healAmount);
                    logs.push(`<b style="color:#e91e63">💕 ${poke.cnName} 为了不让训练家担心，治好了自己的${oldStatus}！回复了 ${healAmount} HP！(Devotion: ${baseDevotion}${poke.avsEvolutionBoost ? ' x2' : ''})</b>`);
                    poke.devotionStatusTriggered = currentTurn;
                    console.log(`[AVs] Devotion 状态治愈触发 (Chance: ${Math.round(baseChance * 100)}%, Devotion: ${baseDevotion})`);
                }
            }
            
            // 【触发条件 2】残血（≤30%）→ 回复 35% HP（全局只能触发一次）
            // 危机爆发概率 = 基础概率 * 1.5（而不是固定 +15%）
            // Devotion 10 → 2.06%, Devotion 100 → 20.6%, Devotion 255 → 52.5%
            if (isCritical && !poke.avsTriggered.devotionCritical) {
                const criticalChance = Math.min(0.60, baseChance * 1.5);
                if (Math.random() < criticalChance) {
                    const healAmount = Math.floor(poke.maxHp * 0.35);
                    poke.heal(healAmount);
                    logs.push(`<b style="color:#e91e63">💕 ${poke.cnName} 的献身之心激发了生命力！回复了 ${healAmount} HP！[危机爆发] (Devotion: ${baseDevotion}${poke.avsEvolutionBoost ? ' x2' : ''})</b>`);
                    poke.avsTriggered.devotionCritical = true;
                    console.log(`[AVs] Devotion 危机爆发触发 (Chance: ${Math.round(criticalChance * 100)}%, Devotion: ${baseDevotion})`);
                }
            }
        }
    }

    return logs;
}

// ============================================
// 导出
// ============================================

if (typeof window !== 'undefined') {
    window.onTurnStart = onTurnStart;
    window.executePlayerTurn = executePlayerTurn;
    window.executeEnemyTurn = executeEnemyTurn;
    window.enemyTurn = enemyTurn;
    window.getEndTurnStatusLogs = getEndTurnStatusLogs;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        executePlayerTurn,
        executeEnemyTurn,
        enemyTurn
    };
}
