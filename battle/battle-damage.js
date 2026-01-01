/**
 * ===========================================
 * BATTLE-DAMAGE.JS - 伤害系统
 * ===========================================
 * 
 * 职责:
 * - 伤害计算与应用
 * - 命中/Miss 处理
 * - 特性免疫检测
 * - Protect 守住拦截
 * - 替身吸收
 * - 副作用触发
 */

// ============================================
// 伤害计算与应用
// ============================================

/**
 * 伤害计算与应用 (含多段攻击、反伤、吸血、能力变化)
 * @param {Object} attacker 攻击方
 * @param {Object} defender 防御方
 * @param {Object} move 招式
 * @param {string} spriteIdRef 目标精灵图 ID ('player-sprite' 或 'enemy-sprite')
 * @returns {Object} 伤害结果
 */
function applyDamage(attacker, defender, move, spriteIdRef) {
    const battle = window.battle;
    
    // === 关键修复：在计算伤害前检查 onUse（如 Fake Out 首回合限制） ===
    const handler = (typeof getMoveHandler === 'function') ? getMoveHandler(move.name) : null;
    const isPlayerAttacking = spriteIdRef !== 'player-sprite';
    
    // 只对攻击技做前置检查，变化技的 onUse 在后面处理
    const moveCategory = move.cat || '';
    const isStatusMove = moveCategory === 'status' || move.power === 0;
    
    if (handler && handler.onUse && !isStatusMove) {
        let preLogs = [];
        const preCheck = handler.onUse(attacker, defender, preLogs, battle, isPlayerAttacking);
        if (preCheck && preCheck.failed) {
            preLogs.forEach(txt => log(`<span style="color:#e74c3c">${txt}</span>`));
            return { damage: 0, effectiveness: 0, miss: false, failed: true };
        }
        preLogs.forEach(txt => log(txt));
    }
    
    // 使用 battle-engine 的伤害计算
    const result = calcDamage(attacker, defender, move);
    
    // 0. 处理特性免疫 (漂浮、避雷针等)
    if (result.abilityImmune) {
        log(`<b style='color:#9b59b6'>${defender.cnName} 的 ${result.abilityImmune} 吸收/免疫了攻击!</b>`);
        return result;
    }
    
    // 0. 处理恶作剧之心免疫 (恶系免疫变化技)
    if (result.pranksterImmune) {
        log(`<b style='color:#8b5cf6'>${result.message || defender.cnName + ' 是恶属性，免疫了恶作剧之心的效果！'}</b>`);
        return result;
    }
    
    // 0. 处理 Protect 守住拦截
    if (result.blocked) {
        log(`<b style='color:#3498db'>${defender.cnName} 守住了自己，免受了攻击!</b>`);
        
        // 守住类招式的接触反制效果
        if (result.protectEffect) {
            log(`<b style='color:#e74c3c'>${result.protectEffect.msg}</b>`);
            updateAllVisuals();
        }
        
        // 清除守住状态（已使用）
        if (defender.volatile) {
            defender.volatile.protect = false;
            defender.volatile.banefulBunker = false;
            defender.volatile.spikyShield = false;
            defender.volatile.kingsShield = false;
            defender.volatile.obstruct = false;
            defender.volatile.silkTrap = false;
            defender.volatile.burningBulwark = false;
        }
        // High Jump Kick / Jump Kick 失败反伤
        if (move.name === 'High Jump Kick' || move.name === 'Jump Kick') {
            const crashDmg = Math.floor(attacker.maxHp / 2);
            attacker.takeDamage(crashDmg);
            log(`<b style='color:#e74c3c'>${attacker.cnName} 失去了平衡，摔倒受到了 ${crashDmg} 点伤害!</b>`);
        }
        return result;
    }
    
    // I. 处理 MISS
    if (result.miss) {
        if (result.insightMiracle) {
            log(`<b style="color:#d4ac0d; text-shadow:0 0 5px gold;">✨ 不可能的奇迹！${defender.cnName} 看穿了绝对命中的轨迹！(Insight EX)</b>`);
        } else if (result.insightDodge && defender.avs && defender.avs.insight >= 100) {
            log(`<b style='color:#aaa'>但是攻击没有命中!</b>`);
            log(`<b style="color:#a78bfa">✨ ${defender.cnName} 凭借灵犀感应预判了攻击轨迹! (Insight${defender.avsEvolutionBoost ? ' x2' : ''})</b>`);
        } else {
            log(`<b style='color:#aaa'>但是攻击没有命中!</b>`);
        }
        // High Jump Kick / Jump Kick 失败反伤
        if (move.name === 'High Jump Kick' || move.name === 'Jump Kick') {
            const crashDmg = Math.floor(attacker.maxHp / 2);
            attacker.takeDamage(crashDmg);
            log(`<b style='color:#e74c3c'>${attacker.cnName} 失去了平衡，摔倒受到了 ${crashDmg} 点伤害!</b>`);
        }
        return result;
    }
    
    // II. 变化技 (Power=0, Status Move)
    if (result.damage === 0 && move.power === 0) {
        // 检查是否为反弹技能（Counter/Mirror Coat/Metal Burst）
        const reflectHandler = (typeof getMoveHandler === 'function') ? getMoveHandler(move.name) : null;
        if (reflectHandler && reflectHandler.isReflectMove) {
            let reflectLogs = [];
            const reflectResult = reflectHandler.onUse(attacker, defender, reflectLogs, battle, spriteIdRef !== 'player-sprite');
            reflectLogs.forEach(txt => log(txt));
            
            if (reflectResult && reflectResult.failed) {
                return result;
            }
            
            if (reflectResult && reflectResult.damage > 0) {
                defender.takeDamage(reflectResult.damage);
                log(`造成了 <b style="color:#e74c3c">${reflectResult.damage}</b> 伤害！`);
                
                const targetEl = document.getElementById(spriteIdRef);
                if (targetEl) {
                    targetEl.classList.remove('shake-hit-anim');
                    void targetEl.offsetWidth;
                    targetEl.classList.add('shake-hit-anim');
                    if (defender.currHp <= 0) {
                        targetEl.classList.add('fainting');
                    }
                }
                
                result.damage = reflectResult.damage;
                updateAllVisuals();
            }
            return result;
        }
        
        // 变化技 Miss 判定
        if (result.miss) {
            log(`<b style='color:#aaa'>但是没有命中!</b>`);
            return result;
        }
        
        // 处理 Volatile 状态技能 (Taunt, Substitute 等)
        if (typeof MoveEffects !== 'undefined' && MoveEffects.applyVolatileStatus) {
            const volatileResult = MoveEffects.applyVolatileStatus(attacker, defender, move);
            if (volatileResult.success) {
                volatileResult.logs.forEach(txt => log(txt));
                return result;
            } else if (volatileResult.logs.length > 0) {
                volatileResult.logs.forEach(txt => log(txt));
                return result;
            }
        }
        
        // 处理变化技的能力变化
        const fxResult = applyMoveSecondaryEffects(attacker, defender, move, 0, battle, spriteIdRef !== 'player-sprite');
        const fxLogs = Array.isArray(fxResult) ? fxResult : (fxResult.logs || []);
        if (fxLogs.length > 0) {
            fxLogs.forEach(txt => log(txt));
        } else {
            log(`...${move.cn}! (变化技能)`);
        }
        result.pivot = fxResult.pivot || false;
        return result;
    }
    
    // === Disguise (画皮) 特性处理 ===
    if (defender.disguiseBustDamage && defender.disguiseBustDamage > 0) {
        log(`<b style="color:#9b59b6">🎭 ${defender.cnName} 的画皮破损了!</b>`);
        log(`<b style="color:#3498db">${defender.cnName} 免疫了这次攻击!</b>`);
        defender.takeDamage(defender.disguiseBustDamage);
        log(`<span style="color:#e67e22">${defender.cnName} 受到了画皮破损的伤害! (-${defender.disguiseBustDamage})</span>`);
        defender.disguiseBustDamage = 0;
        updateAllVisuals();
        return result;
    }
    
    // III. 如果有伤害 -> 扣血
    const dmgCategory = (move.cat || result.category || 'physical').toLowerCase();
    
    if (result.damage > 0) {
        // 检查替身是否吸收伤害
        if (typeof MoveEffects !== 'undefined' && MoveEffects.checkSubstitute) {
            const subResult = MoveEffects.checkSubstitute(defender, result.damage, move);
            if (subResult.absorbed) {
                subResult.logs.forEach(txt => log(txt));
                result.damage = 0;
                updateAllVisuals();
                return result;
            }
        }
        
        // 【修复】记录实际造成的伤害（不超过目标当前HP）用于日志显示
        const actualDamage = Math.min(result.damage, defender.currHp);
        defender.takeDamage(result.damage, dmgCategory);
        result.displayDamage = actualDamage; // 用于日志显示的实际伤害
        
        // === 播放打击音效 ===
        if (typeof window.playHitSFX === 'function') {
            window.playHitSFX(result.effectiveness, result.isCrit);
        }
        
        // Focus Sash 触发日志
        if (defender.focusSashTriggered) {
            log(`<b style="color:#f1c40f">🛡️ ${defender.cnName} 的气势披带发动了！勉强撑住了攻击！</b>`);
            defender.focusSashTriggered = false;
        }
        
        // AVs: Trust (信赖) 锁血触发日志
        if (defender.trustEndureTriggered) {
            log(`<b style="color:#e91e63">💖 ${defender.cnName} 凭借与训练家的羁绊，用脸接下了致命一击! (Trust)</b>`);
            defender.trustEndureTriggered = false;
        }
        
        // Second Wind (第二气息) 触发日志
        if (defender.secondWindActivated) {
            log(`<b style="color:#ff6b35">🔥 ${defender.cnName} 的第二气息觉醒了!</b>`);
            log(`<b style="color:#ff6b35">💪 全属性提升! 攻击+1 防御+1 特攻+1 特防+1 速度+1!</b>`);
            defender.secondWindActivated = false;
        }
        
        // === HP 阈值树果检查（文柚果、混乱果等）===
        // 【修复】先检查树果触发，但延迟输出日志，确保在伤害日志之后显示
        let berryLogs = [];
        let berryTriggered = false;
        let cheekPouchHeal = 0;
        if (defender.currHp > 0 && typeof ItemEffects !== 'undefined' && ItemEffects.checkHPBerry) {
            berryTriggered = ItemEffects.checkHPBerry(defender, berryLogs);
            if (berryTriggered) {
                // 颊囊特性：吃树果时额外回复 33% HP
                const abilityId = (defender.ability || '').toLowerCase().replace(/[^a-z]/g, '');
                if (abilityId === 'cheekpouch') {
                    cheekPouchHeal = Math.floor(defender.maxHp * 0.33);
                    defender.currHp = Math.min(defender.maxHp, defender.currHp + cheekPouchHeal);
                }
            }
        }

        // 播放受击动画
        const targetEl = document.getElementById(spriteIdRef);
        if (targetEl) {
            targetEl.classList.remove('shake-hit-anim');
            targetEl.classList.remove('fainting');
            void targetEl.offsetWidth;
            targetEl.classList.add('shake-hit-anim');
            if (defender.currHp <= 0) {
                targetEl.classList.add('fainting');
                setTimeout(() => {
                    targetEl.classList.remove('fainting');
                    targetEl.classList.add('fainted-hidden');
                }, 750);
            }
        }

        // 构建伤害文本
        let infoParts = [];
        
        if (result.hitCount > 1) {
            infoParts.push(`<span style="color:#9b59b6">(命中 ${result.hitCount} 次)</span>`);
        }
        
        if (result.effectiveness >= 2) infoParts.push('<b style="color:#e74c3c">(效果拔群!)</b>');
        else if (result.effectiveness <= 0.5 && result.effectiveness > 0) infoParts.push('(效果不好...)');

        // 抗性树果触发消息
        if (result.resistBerryTriggered && result.resistBerryMessage) {
            log(`<span style="color:#27ae60">🍇 ${result.resistBerryMessage}</span>`);
        }
        
        if (result.isCrit) {
            infoParts.push('<b class="hl-crit">击中要害!</b>');
            if (attacker.avs && attacker.avs.passion >= 100) {
                infoParts.push(`<b style="color:#f59e0b">🔥 (Passion${attacker.avsEvolutionBoost ? ' x2' : ''})</b>`);
            }
        }
        
        const infoStr = infoParts.join(' ');
        
        // 【修复】使用 displayDamage 显示实际造成的伤害，避免显示超过目标HP的数值
        const shownDamage = result.displayDamage !== undefined ? result.displayDamage : result.damage;
        // 【修复】如果是致命一击（击杀目标），不显示嘲讽文本
        const isKillingBlow = defender.currHp <= 0;
        if (shownDamage <= 2 && result.effectiveness > 0 && !isKillingBlow) {
            log(`造成了 <span style="color:#95a5a6">${shownDamage}</span> 伤害... (仿佛是在给对手挠痒痒) ${infoStr}`);
        } else {
            log(`造成了 ${shownDamage} 伤害 ${infoStr}`);
        }
        
        // 【修复】在伤害日志之后输出树果触发日志
        if (berryTriggered && berryLogs.length > 0) {
            berryLogs.forEach(txt => log(txt));
            if (cheekPouchHeal > 0) {
                log(`<span style="color:#27ae60">🐿️ ${defender.cnName} 的颊囊发动了！额外回复了 ${cheekPouchHeal} 点体力！</span>`);
            }
            updateAllVisuals();
        }
        
        // 【弱点保险 (Weakness Policy)】被效果拔群攻击后，攻击和特攻各+2
        const defenderItem = (defender.item || '').toLowerCase().replace(/[^a-z]/g, '');
        if (result.effectiveness >= 2 && defenderItem === 'weaknesspolicy' && defender.currHp > 0) {
            log(`<b style="color:#e67e22">📄 ${defender.cnName} 的弱点保险生效了！</b>`);
            if (!defender.boosts) defender.boosts = {};
            defender.boosts.atk = Math.min(6, (defender.boosts.atk || 0) + 2);
            defender.boosts.spa = Math.min(6, (defender.boosts.spa || 0) + 2);
            log(`<span style="color:#ef4444">💪 ${defender.cnName} 的攻击大幅提升！</span>`);
            log(`<span style="color:#a855f7">✨ ${defender.cnName} 的特攻大幅提升！</span>`);
            defender.item = null; // 消耗品
            if (typeof window !== 'undefined' && typeof window.playSFX === 'function') {
                window.playSFX('STAT_UP');
            }
            updateAllVisuals();
        }
    } else if (result.effectiveness === 0) {
        log(`<b>对其没有效果!</b>`);
        // High Jump Kick / Jump Kick 打到免疫属性时的反伤
        if (move.name === 'High Jump Kick' || move.name === 'Jump Kick') {
            const crashDmg = Math.floor(attacker.maxHp / 2);
            attacker.takeDamage(crashDmg);
            log(`<b style='color:#e74c3c'>${attacker.cnName} 失去了平衡，摔倒受到了 ${crashDmg} 点伤害!</b>`);
        }
        result.pivot = false;
        return result;
    }
    
    // IV. 触发副作用
    // 【修复】使用 actualDamage（实际造成的伤害）而不是 result.damage（理论伤害）
    // 这样反作用力计算才会基于实际伤害，避免锁血后反伤过高的BUG
    const actualDamageForRecoil = result.displayDamage !== undefined ? result.displayDamage : result.damage;
    let pivotTriggered = false;
    if (defender.currHp > 0) {
        const fxResult = applyMoveSecondaryEffects(attacker, defender, move, actualDamageForRecoil, battle, spriteIdRef !== 'player-sprite');
        const fxLogs = Array.isArray(fxResult) ? fxResult : (fxResult.logs || []);
        pivotTriggered = fxResult.pivot || false;
        fxLogs.forEach(txt => log(`<span style="font-size:0.95em;color:#e67e22">${txt}</span>`));
        
        // === 【拍落 Knock Off】处理 ===
        if (typeof MoveEffects !== 'undefined' && MoveEffects.applyKnockOff) {
            const knockOffResult = MoveEffects.applyKnockOff(attacker, defender, move);
            knockOffResult.logs.forEach(txt => log(`<span style="color:#8b5cf6">${txt}</span>`));
        }
        
        // === 【束缚招式】处理 (Fire Spin, Magma Storm 等) ===
        if (typeof MoveEffects !== 'undefined' && MoveEffects.applyTrappingMove) {
            const trapResult = MoveEffects.applyTrappingMove(attacker, defender, move);
            trapResult.logs.forEach(txt => log(`<span style="color:#dc2626">${txt}</span>`));
        }
        
        // === 【黑色目光/缝影】处理 ===
        if (typeof MoveEffects !== 'undefined' && MoveEffects.applyMeanLook) {
            const meanLookResult = MoveEffects.applyMeanLook(attacker, defender, move);
            meanLookResult.logs.forEach(txt => log(`<span style="color:#7c3aed">${txt}</span>`));
        }
    } else {
        // 防御方被击倒
        const fxResult = applyMoveSecondaryEffects(attacker, defender, move, actualDamageForRecoil, battle, spriteIdRef !== 'player-sprite');
        const fxLogs = Array.isArray(fxResult) ? fxResult : (fxResult.logs || []);
        pivotTriggered = fxResult.pivot || false;
        const attackerOnlyLogs = fxLogs.filter(txt => 
            txt.includes(attacker.cnName) || 
            txt.includes('反作用力') || 
            txt.includes('吸取')
        );
        attackerOnlyLogs.forEach(txt => log(`<span style="font-size:0.95em;color:#e67e22">${txt}</span>`));
        
        // === 【同命 Destiny Bond】判定 ===
        // 如果被击倒的宝可梦处于同命状态，攻击者也会被击倒
        if (defender.volatile && defender.volatile.destinyBond && attacker.isAlive()) {
            log(`<b style="color:#9b59b6">💀 ${defender.cnName} 拉着 ${attacker.cnName} 同归于尽了！</b>`);
            attacker.takeDamage(attacker.currHp);
            updateAllVisuals();
            result.destinyBondTriggered = true;
        }
    }
    
    // V. 更新攻击方血条
    updateAllVisuals();
    
    // VI. 返回结果
    result.pivot = pivotTriggered;
    return result;
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
// 导出
// ============================================

if (typeof window !== 'undefined') {
    window.applyDamage = applyDamage;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { applyDamage };
}
