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
function onTurnStart() {
    const battle = window.battle;
    if (!battle) return;
    
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

    // === 特性 onBeforeMove 钩子 (懒惰、变幻自如等) ===
    if (typeof AbilityHandlers !== 'undefined' && p.ability) {
        const abilityHandler = AbilityHandlers[p.ability];
        if (abilityHandler && abilityHandler.onBeforeMove) {
            const beforeMoveLogs = [];
            const canMove = abilityHandler.onBeforeMove(p, move, beforeMoveLogs);
            beforeMoveLogs.forEach(txt => log(txt));
            if (canMove === false) {
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
        await wait(500);
        return { pivot: false };
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

    // === 特性 onBeforeMove 钩子 (懒惰、变幻自如等) ===
    if (typeof AbilityHandlers !== 'undefined' && e.ability) {
        const abilityHandler = AbilityHandlers[e.ability];
        if (abilityHandler && abilityHandler.onBeforeMove) {
            const beforeMoveLogs = [];
            const canMove = abilityHandler.onBeforeMove(e, move, beforeMoveLogs);
            beforeMoveLogs.forEach(txt => log(txt));
            if (canMove === false) {
                return { pivot: false };
            }
        }
    }

    // === 硬直检查 (破坏光线/爆炸烈焰等) ===
    // 【修复】在输出"使出xxx"之前检查，避免误导性日志
    if (e.mustRecharge) {
        log(`<span style="color:#e74c3c">${e.cnName} 因为上回合的反作用力无法动弹!</span>`);
        e.mustRecharge = false;
        return { pivot: false };
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
    return { 
        pivot: result?.pivot || false,
        passBoosts: result?.passBoosts || false  // 【Baton Pass】传递能力变化标记
    };
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
function getEndTurnStatusLogs(poke, opponent, isPlayerPoke = false) {
    let logs = [];
    if (!poke || !poke.isAlive()) return logs;

    // ----------------------------------------
    // 1. 灼伤 (Burn): 扣 1/16 HP
    // ----------------------------------------
    if (poke.status === 'brn') {
        const dmg = Math.max(1, Math.floor(poke.maxHp / 16));
        poke.takeDamage(dmg);
        logs.push(`${poke.cnName} 受到灼伤的伤害! (-${dmg})`);
    }

    // ----------------------------------------
    // 2. 中毒 (Poison): 扣 1/8 HP
    // ----------------------------------------
    if (poke.status === 'psn') {
        const dmg = Math.max(1, Math.floor(poke.maxHp / 8));
        poke.takeDamage(dmg);
        logs.push(`${poke.cnName} 受到毒素的伤害! (-${dmg})`);
    }
    
    // 剧毒 (Toxic): 累加伤害 (简化为 1/8)
    if (poke.status === 'tox') {
        const dmg = Math.max(1, Math.floor(poke.maxHp / 8));
        poke.takeDamage(dmg);
        logs.push(`${poke.cnName} 受到剧毒的伤害! (-${dmg})`);
    }

    // ----------------------------------------
    // 3. 寄生种子 (Leech Seed): 被对方吸血 1/8
    // ----------------------------------------
    if (poke.volatile && poke.volatile['leechseed'] && opponent && opponent.isAlive()) {
        const drain = Math.max(1, Math.floor(poke.maxHp / 8));
        poke.takeDamage(drain);
        opponent.heal(drain);
        logs.push(`${poke.cnName} 的体力被寄生种子吸取了! (-${drain})`);
    }

    // ----------------------------------------
    // 4. 束缚状态 (Bind / Whirlpool / Fire Spin) -> 扣 1/8
    // ----------------------------------------
    if (poke.volatile && poke.volatile['partiallytrapped']) {
        const dmg = Math.max(1, Math.floor(poke.maxHp / 8));
        poke.takeDamage(dmg);
        logs.push(`${poke.cnName} 因束缚而受到伤害! (-${dmg})`);
    }

    // ----------------------------------------
    // 5. 诅咒 (Curse - Ghost使用): 每回合扣 1/4
    // ----------------------------------------
    if (poke.volatile && poke.volatile['curse']) {
        const dmg = Math.max(1, Math.floor(poke.maxHp / 4));
        poke.takeDamage(dmg);
        logs.push(`${poke.cnName} 受到了诅咒! (-${dmg})`);
    }

    // ----------------------------------------
    // 6. 哈欠 (Yawn): 倒计时，时间到睡着
    // ----------------------------------------
    if (poke.volatile && poke.volatile['yawn']) {
        poke.volatile['yawn'] -= 1;
        if (poke.volatile['yawn'] <= 0) {
            if (!poke.status) {
                poke.status = 'slp';
                poke.sleepTurns = Math.floor(Math.random() * 3) + 2;
                delete poke.volatile['yawn'];
                logs.push(`${poke.cnName} 的睡意袭来了! -> 睡着了!`);
            } else {
                delete poke.volatile['yawn'];
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
    }

    // ----------------------------------------
    // 8. 扎根 (Ingrain): 每回合回复 1/16 HP
    // ----------------------------------------
    if (poke.volatile && poke.volatile.ingrain) {
        const heal = Math.max(1, Math.floor(poke.maxHp / 16));
        poke.heal(heal);
        logs.push(`${poke.cnName} 从地面吸收了养分! (+${heal})`);
    }

    // ----------------------------------------
    // 9. 天气伤害 (Weather Damage)
    // ----------------------------------------
    const battle = window.battle;
    const currentWeather = battle ? battle.weather : null;
    const pokeAbility = (poke.ability || '').toLowerCase().replace(/[^a-z]/g, '');
    const hasMagicGuard = pokeAbility === 'magicguard';
    const hasOvercoat = pokeAbility === 'overcoat';
    
    if (currentWeather && !hasMagicGuard && !hasOvercoat) {
        if (currentWeather === 'sandstorm') {
            const immuneToSand = poke.types && (poke.types.includes('Rock') || poke.types.includes('Ground') || poke.types.includes('Steel'));
            const sandAbilityImmune = ['sandveil', 'sandforce', 'sandrush'].includes(pokeAbility);
            if (!immuneToSand && !sandAbilityImmune) {
                const dmg = Math.max(1, Math.floor(poke.maxHp / 16));
                poke.takeDamage(dmg);
                logs.push(`${poke.cnName} 受到沙暴的伤害! (-${dmg})`);
            }
        }
        if (currentWeather === 'hail') {
            const immuneToHail = poke.types && poke.types.includes('Ice');
            const hailAbilityImmune = ['icebody', 'snowcloak', 'slushrush'].includes(pokeAbility);
            if (!immuneToHail && !hailAbilityImmune) {
                const dmg = Math.max(1, Math.floor(poke.maxHp / 16));
                poke.takeDamage(dmg);
                logs.push(`${poke.cnName} 受到冰雹的伤害! (-${dmg})`);
            }
        }
    }

    // =====================================================
    // === AVs: Devotion (献身) - 状态治愈 + 残血回复 ===
    // =====================================================
    // 只有【玩家方】的 isAce=true 宝可梦才能触发 AVs 被动
    if (isPlayerPoke && poke.isAce && poke.avs && poke.avs.devotion > 0) {
        const baseDevotion = poke.getEffectiveAVs ? poke.getEffectiveAVs('devotion') : poke.avs.devotion;
        const effectiveDevotion = poke.avsEvolutionBoost ? baseDevotion * 2 : baseDevotion;
        const hpRatio = poke.currHp / poke.maxHp;
        const isCritical = hpRatio <= 0.30;
        
        // 线性概率计算（基于 0-255 数值）
        const baseChance = Math.min(0.15, (effectiveDevotion / 255) * 0.15);
        
        // 初始化全局触发标记
        if (!poke.avsTriggered) poke.avsTriggered = {};
        if (poke.devotionStatusTriggered === undefined) poke.devotionStatusTriggered = -1;
        
        const currentTurn = battle && battle.turn ? battle.turn : 0;
        
        // 【触发条件 1】有异常状态 → 清除异常 + 回复 10% HP
        if (poke.status && poke.devotionStatusTriggered !== currentTurn && baseChance > 0) {
            if (Math.random() < baseChance) {
                const oldStatus = poke.status;
                poke.status = null;
                poke.sleepTurns = 0;
                const healAmount = Math.floor(poke.maxHp * 0.10);
                poke.heal(healAmount);
                logs.push(`<b style="color:#e91e63">💕 ${poke.cnName} 为了不让训练家担心，治好了自己的${oldStatus}！回复了 ${healAmount} HP！(Devotion${poke.avsEvolutionBoost ? ' x2' : ''})</b>`);
                poke.devotionStatusTriggered = currentTurn;
            }
        }
        
        // 【触发条件 2】残血（≤30%）→ 回复 40% HP（全局只能触发一次）
        if (isCritical && !poke.avsTriggered.devotionCritical && baseChance > 0) {
            const criticalChance = Math.min(1.0, baseChance + 0.08);
            if (Math.random() < criticalChance) {
                const healAmount = Math.floor(poke.maxHp * 0.40);
                poke.heal(healAmount);
                logs.push(`<b style="color:#e91e63">💕 ${poke.cnName} 的献身之心激发了生命力！回复了 ${healAmount} HP！[危机爆发] (Devotion${poke.avsEvolutionBoost ? ' x2' : ''})</b>`);
                poke.avsTriggered.devotionCritical = true;
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
