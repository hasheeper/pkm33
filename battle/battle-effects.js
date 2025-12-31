/**
 * ===========================================
 * BATTLE-EFFECTS.JS - 招式副作用处理
 * ===========================================
 * 
 * 从 engine/battle-engine.js 迁移
 * 
 * 职责:
 * - 能力变化 (Boosts)
 * - 反伤 (Recoil)
 * - 吸血 (Drain)
 * - 状态异常
 * - 接触类招式反馈
 * - 特殊技能效果
 * 
 * 依赖: moves-data.js, move-handlers.js, move-effects.js, ability-handlers.js
 */

/**
 * 处理技能带来的副作用（能力升降、反伤、吸血）
 * @param {Pokemon} user 攻击方
 * @param {Pokemon} target 受击方
 * @param {object} move 技能数据
 * @param {number} damageDealt 实际造成的伤害（用于计算反伤/吸血）
 * @param {object} battle 战斗状态
 * @param {boolean} isPlayer 是否为玩家
 * @returns {object} { logs: Array, pivot: boolean }
 */
function applyMoveSecondaryEffects(user, target, move, damageDealt = 0, battle = null, isPlayer = false) {
    let logs = [];
    
    // 获取完整技能数据
    const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const fullMoveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
    
    // === 策略模式：检查是否有特殊处理器 ===
    const handler = (typeof getMoveHandler === 'function') ? getMoveHandler(move.name) : null;
    console.log(`[MOVE HANDLER] Looking for handler: "${move.name}", found:`, handler ? 'YES' : 'NO', handler?.onUse ? '(has onUse)' : '');
    
    // === onUse 钩子 (变化技/天气/场地等，以及技能前置检查如 Fake Out) ===
    if (handler && handler.onUse) {
        console.log(`[MOVE HANDLER] Calling onUse for "${move.name}", battle:`, battle, 'isPlayer:', isPlayer);
        const result = handler.onUse(user, target, logs, battle, isPlayer);
        console.log(`[MOVE HANDLER] onUse returned, logs now:`, logs);
        if (result) {
            if (result.failed) {
                return { logs, pivot: false };
            }
            if (result.selfDestruct) {
                // 自爆类技能已在 handler 中处理 HP
            }
        }
    }
    
    // === onHit 钩子 (命中后效果) ===
    let pivotTriggered = false;
    if (handler && handler.onHit) {
        const hitResult = handler.onHit(user, target, damageDealt, logs, battle);
        if (hitResult && hitResult.pivot) {
            pivotTriggered = true;
        }
    }
    
    // === 场地状态技能处理 (sideCondition) ===
    if (fullMoveData.sideCondition && battle) {
        if (typeof MoveEffects !== 'undefined' && MoveEffects.applySideCondition) {
            const sideLogs = MoveEffects.applySideCondition(user, move, battle);
            logs.push(...sideLogs);
        }
    }
    
    // 能力名称映射
    const statMap = {
        atk: "攻击", def: "防御", spa: "特攻", spd: "特防", spe: "速度",
        accuracy: "命中率", evasion: "闪避率"
    };
    
    // 变化幅度文案
    const getChangeText = (val) => {
        if (Math.abs(val) >= 3) return "极大幅";
        if (Math.abs(val) === 2) return "大幅";
        return "";
    };
    
    // helper：修改指定对象的能力
    const changeStats = (subject, boostsObj) => {
        if (!boostsObj) return;
        for (const [stat, val] of Object.entries(boostsObj)) {
            if (typeof val !== 'number') continue;
            const diff = subject.applyBoost(stat, val);
            if (diff === 0) {
                const currentBoost = subject.boosts[stat] || 0;
                if (currentBoost >= 6) {
                    logs.push(`${subject.cnName} 的${statMap[stat] || stat}已经无法再提升了!`);
                } else if (currentBoost <= -6) {
                    logs.push(`${subject.cnName} 的${statMap[stat] || stat}已经无法再降低了!`);
                } else {
                    logs.push(`${subject.cnName} 的${statMap[stat] || stat}无法改变!`);
                }
            } else {
                const changeText = getChangeText(diff);
                if (diff > 0) {
                    logs.push(`${subject.cnName} 的${statMap[stat] || stat}${changeText}提升了!`);
                    if (typeof window !== 'undefined' && typeof window.playSFX === 'function') window.playSFX('STAT_UP');
                } else {
                    logs.push(`${subject.cnName} 的${statMap[stat] || stat}${changeText}下降了!`);
                    if (typeof window !== 'undefined' && typeof window.playSFX === 'function') window.playSFX('STAT_DOWN');
                }
            }
        }
    };
    
    // ========== 1. 能力变化 (Boosts) ==========
    const selfTargets = ['self', 'allySide', 'adjacentAlly', 'adjacentAllyOrSelf', 'allies'];
    const isTargetSelf = selfTargets.includes(fullMoveData.target);
    
    // 1.1 Status 招式的 boosts
    if (fullMoveData.category === 'Status' && fullMoveData.boosts) {
        if (isTargetSelf) {
            changeStats(user, fullMoveData.boosts);
        } else {
            changeStats(target, fullMoveData.boosts);
        }
    }
    
    // 1.2 self.boosts（对自己生效的副作用）
    if (fullMoveData.self && fullMoveData.self.boosts) {
        changeStats(user, fullMoveData.self.boosts);
    }
    
    // 1.3 Secondary Effects（几率触发，通常对敌人）
    if (fullMoveData.secondary) {
        const chance = fullMoveData.secondary.chance || 100;
        if (Math.random() * 100 < chance) {
            if (fullMoveData.secondary.boosts) {
                changeStats(target, fullMoveData.secondary.boosts);
            }
            if (fullMoveData.secondary.self && fullMoveData.secondary.self.boosts) {
                changeStats(user, fullMoveData.secondary.self.boosts);
            }
            
            // 状态异常
            if (fullMoveData.secondary.status) {
                const s = fullMoveData.secondary.status;
                if (!target.status) {
                    if (typeof MoveEffects !== 'undefined' && MoveEffects.tryInflictStatus) {
                        const result = MoveEffects.tryInflictStatus(target, s, user, battle);
                        if (result.success) {
                            if (s === 'slp') {
                                target.sleepTurns = Math.floor(Math.random() * 3) + 2;
                            }
                            logs.push(result.message);
                        }
                    } else {
                        target.status = s;
                        if (s === 'slp') {
                            target.sleepTurns = Math.floor(Math.random() * 3) + 2;
                        }
                        const statusMap = {
                            brn: "被灼伤了!", psn: "中毒了!", par: "麻痹了!",
                            tox: "中了剧毒!", slp: "睡着了!", frz: "被冻结了!"
                        };
                        const statusText = statusMap[s];
                        if (statusText) {
                            logs.push(`${target.cnName} ${statusText}`);
                        }
                    }
                }
            }
            
            // 畏缩效果
            if (fullMoveData.secondary.volatileStatus === 'flinch') {
                target.volatile = target.volatile || {};
                target.volatile.flinch = true;
                logs.push(`${target.cnName} 畏缩了!`);
            }
        }
    }
    
    // 1.4 Status 招式直接施加状态
    if (fullMoveData.status) {
        const s = fullMoveData.status;
        if (!target.status) {
            if (typeof MoveEffects !== 'undefined' && MoveEffects.tryInflictStatus) {
                const result = MoveEffects.tryInflictStatus(target, s, user, battle);
                if (result.success) {
                    if (s === 'slp') {
                        target.sleepTurns = Math.floor(Math.random() * 3) + 2;
                    }
                    logs.push(result.message);
                } else {
                    logs.push(result.message);
                }
            } else {
                target.status = s;
                if (s === 'slp') {
                    target.sleepTurns = Math.floor(Math.random() * 3) + 2;
                }
                const statusMap = {
                    brn: "被灼伤了!", psn: "中毒了!", par: "麻痹了!",
                    tox: "中了剧毒!", slp: "睡着了!", frz: "被冻结了!"
                };
                const statusText = statusMap[s];
                if (statusText) {
                    logs.push(`${target.cnName} ${statusText}`);
                }
            }
        }
    }
    
    // === 1.5 Protect/Detect 守住类技能 ===
    const isProtectMove = fullMoveData.stallingMove || 
        (fullMoveData.volatileStatus && ['protect', 'banefulbunker', 'spikyshield', 'kingsshield', 'obstruct', 'silktrap', 'burningbulwark'].includes(fullMoveData.volatileStatus));
    if (isProtectMove) {
        user.volatile = user.volatile || {};
        user.volatile.protect = true;
        logs.push(`${user.cnName} 守住了自己!`);
    }
    
    // ========== 2. 反伤 (Recoil) ==========
    const noRecoilAbility = (typeof AbilityHandlers !== 'undefined' && user.ability && AbilityHandlers[user.ability]) 
        ? (AbilityHandlers[user.ability].noRecoil || AbilityHandlers[user.ability].noIndirectDamage) 
        : false;
    
    if (!noRecoilAbility) {
        if (fullMoveData.recoil && damageDealt > 0) {
            const [num, den] = fullMoveData.recoil;
            const recoilDmg = Math.max(1, Math.floor(damageDealt * num / den));
            user.takeDamage(recoilDmg);
            logs.push(`${user.cnName} 受到了 ${recoilDmg} 点反作用力伤害!`);
        } else if (damageDealt > 0) {
            const recoilPatches = (typeof RECOIL_MOVES !== 'undefined') ? RECOIL_MOVES : {};
            if (recoilPatches[move.name]) {
                const [num, den] = recoilPatches[move.name];
                const recoilDmg = Math.max(1, Math.floor(damageDealt * num / den));
                user.takeDamage(recoilDmg);
                logs.push(`${user.cnName} 受到了 ${recoilDmg} 点反作用力伤害!`);
            }
        }
        
        // 生命宝珠反伤
        const userItem = (user.item || '').toLowerCase().replace(/[^a-z]/g, '');
        if (userItem === 'lifeorb' && damageDealt > 0) {
            const lifeOrbRecoil = Math.max(1, Math.floor(user.maxHp * 0.1));
            user.takeDamage(lifeOrbRecoil);
            logs.push(`${user.cnName} 受到了生命宝珠的反噬!`);
        }
    }
    
    // ========== 3. 吸血 (Drain) ==========
    if (fullMoveData.drain && damageDealt > 0) {
        const [num, den] = fullMoveData.drain;
        const healAmt = Math.max(1, Math.floor(damageDealt * num / den));
        const actualHeal = Math.min(healAmt, user.maxHp - user.currHp);
        if (actualHeal > 0) {
            user.heal(healAmt);
            logs.push(`${user.cnName} 吸取了对手的体力!`);
        }
    } else if (damageDealt > 0) {
        const drainPatches = (typeof DRAIN_MOVES !== 'undefined') ? DRAIN_MOVES : {};
        if (drainPatches[move.name]) {
            const [num, den] = drainPatches[move.name];
            const healAmt = Math.max(1, Math.floor(damageDealt * num / den));
            const actualHeal = Math.min(healAmt, user.maxHp - user.currHp);
            if (actualHeal > 0) {
                user.heal(healAmt);
                logs.push(`${user.cnName} 吸取了对手的体力!`);
            }
        }
    }
    
    // ========== 4. 特殊技能效果 ==========
    
    // 寄生种子
    if (move.name === 'Leech Seed') {
        if (!target.types.includes('Grass')) {
            target.volatile = target.volatile || {};
            target.volatile['leechseed'] = true;
            logs.push(`寄生种子种在了 ${target.cnName} 身上!`);
        } else {
            logs.push(`对草系宝可梦没有效果!`);
        }
    }
    
    // 哈欠
    if (move.name === 'Yawn') {
        if (!target.status && !(target.volatile && target.volatile['yawn'])) {
            target.volatile = target.volatile || {};
            target.volatile['yawn'] = 2;
            logs.push(`${target.cnName} 打了个大大的哈欠...`);
        }
    }
    
    // 诅咒 (鬼系)
    if (move.name === 'Curse' && user.types.includes('Ghost')) {
        const selfDmg = Math.floor(user.maxHp / 2);
        user.takeDamage(selfDmg);
        target.volatile = target.volatile || {};
        target.volatile['curse'] = true;
        logs.push(`${user.cnName} 削减了自己的体力，对 ${target.cnName} 施加了诅咒!`);
    }
    
    // 束缚类技能
    if (fullMoveData.volatileStatus === 'partiallytrapped') {
        target.volatile = target.volatile || {};
        target.volatile['partiallytrapped'] = true;
        logs.push(`${target.cnName} 被困住了!`);
    }
    
    // ========== 5. 自我牺牲技能 ==========
    if (fullMoveData.selfdestruct) {
        const shouldFaint = fullMoveData.selfdestruct === 'always' || 
                           (fullMoveData.selfdestruct === 'ifHit' && damageDealt >= 0);
        
        if (shouldFaint) {
            user.currHp = 0;
            logs.push(`${user.cnName} 倒下了!`);
            console.log(`[SELFDESTRUCT] ${user.cnName} used ${move.name} with selfdestruct: ${fullMoveData.selfdestruct}`);
        }
    }
    
    // ========== 6. 接触类招式反馈效果 ==========
    const isContact = fullMoveData.flags && fullMoveData.flags.contact;
    
    const userAbilityId = (user.ability || '').toLowerCase().replace(/[^a-z]/g, '');
    let hitCount = 1;
    if (fullMoveData.multihit) {
        if (Array.isArray(fullMoveData.multihit)) {
            const [min, max] = fullMoveData.multihit;
            if (userAbilityId === 'skilllink') {
                hitCount = max;
            } else {
                hitCount = Math.floor(Math.random() * (max - min + 1)) + min;
            }
        } else {
            hitCount = fullMoveData.multihit;
        }
    }
    
    if (isContact && damageDealt > 0 && target.isAlive() && typeof AbilityHandlers !== 'undefined') {
        const defenderAbility = target.ability;
        const ah = defenderAbility ? AbilityHandlers[defenderAbility] : null;
        
        for (let hit = 0; hit < hitCount; hit++) {
            if (!user.isAlive() || !target.isAlive()) break;
            
            // 接触反伤特性
            if (ah && ah.onContactDamage && user.isAlive()) {
                const result = ah.onContactDamage(user, target);
                if (result && result.damage > 0) {
                    user.takeDamage(result.damage);
                    if (hit === 0) logs.push(result.message);
                }
            }
            
            // 接触状态特性
            if (ah && ah.onContactStatus && user.isAlive() && !user.status) {
                const result = ah.onContactStatus(user, target);
                if (result && result.status) {
                    const statusResult = (typeof MoveEffects !== 'undefined' && MoveEffects.tryInflictStatus) 
                        ? MoveEffects.tryInflictStatus(user, result.status)
                        : { success: true };
                    if (statusResult.success) {
                        user.status = result.status;
                        logs.push(result.message);
                    }
                }
            }
            
            // 凸凸头盔
            if (target.item === 'Rocky Helmet' && user.isAlive()) {
                const helmetDmg = Math.floor(user.maxHp / 6);
                user.takeDamage(helmetDmg);
                if (hit === 0) logs.push(`${user.cnName} 被凸凸头盔伤害了！`);
            }
        }
        
        if (!user.isAlive()) {
            logs.push(`${user.cnName} 被反伤击倒了！`);
        }
    }
    
    // ========== 7. 碎裂铠甲等被攻击触发特性 ==========
    if (damageDealt > 0 && target.isAlive() && typeof AbilityHandlers !== 'undefined') {
        const ah = target.ability ? AbilityHandlers[target.ability] : null;
        const moveCategory = fullMoveData.category || (move.cat === 'phys' ? 'Physical' : (move.cat === 'spec' ? 'Special' : 'Status'));
        const isPhysical = move.cat === 'phys' || moveCategory === 'Physical';
        
        if (ah && ah.onPhysicalHit && isPhysical) {
            ah.onPhysicalHit(user, target, logs);
        }
    }
    
    // 返回日志和 pivot 状态
    return { logs, pivot: pivotTriggered };
}

// ============================================
// 导出到全局
// ============================================

if (typeof window !== 'undefined') {
    window.applyMoveSecondaryEffects = applyMoveSecondaryEffects;
}
