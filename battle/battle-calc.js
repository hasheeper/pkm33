/**
 * ===========================================
 * BATTLE-CALC.JS - 伤害计算引擎
 * ===========================================
 * 
 * 从 engine/battle-engine.js 迁移
 * 
 * 职责:
 * - 纯伤害数值计算
 * - 属性克制计算
 * - 暴击/命中判定
 * - 多段攻击
 * - 特性/道具修正
 * 
 * 依赖: pokedex-data.js, moves-data.js, ability-handlers.js, items-data.js
 */

/**
 * 伤害计算 (含能力等级修正、命中判定、多段攻击、暴击率)
 * @param {Pokemon} attacker 
 * @param {Pokemon} defender 
 * @param {object} move - { type, power, cat, accuracy }
 * @param {object} options - { isSimulation: boolean } 可选参数
 * @returns {object} - { damage, effectiveness, isCrit, miss, hitCount, blocked }
 */
export function calcDamage(attacker, defender, move, options = {}) {
    // 获取完整技能数据
    const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const fullMoveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
    
    // === 【特性钩子】onModifyMove - 修改招式属性/威力 (Liquid Voice 等) ===
    if (typeof AbilityHandlers !== 'undefined' && attacker.ability) {
        const abilityHandler = AbilityHandlers[attacker.ability];
        if (abilityHandler && abilityHandler.onModifyMove) {
            abilityHandler.onModifyMove(move, attacker);
        }
    }
    
    const accuracy = move.accuracy ?? fullMoveData.accuracy;
    let category = fullMoveData.category || (move.cat === 'spec' ? 'Special' : (move.cat === 'phys' ? 'Physical' : 'Status'));
    let basePower = move.power ?? fullMoveData.basePower ?? 0;
    
    // =====================================================
    // === 【极巨化/Z招式威力修正补丁】 ===
    // =====================================================
    const moveName = move.name || '';
    const isMaxMoveName = moveName.startsWith('Max ') || moveName.startsWith('G-Max ');
    const isZMoveName = moveName.includes('10,000,000') || 
                        moveName.includes('Catastropika') || 
                        moveName.includes('Stoked Sparksurfer') ||
                        moveName.includes('Pulverizing Pancake') ||
                        (fullMoveData.isZ && basePower < 100);
    
    if (isMaxMoveName && basePower < 100) {
        const oldPower = basePower;
        basePower = 130;
        console.warn(`[ENGINE FIX] Max/G-Max 威力修正: ${moveName} (${oldPower} -> ${basePower})`);
    }
    
    if (isZMoveName && basePower < 100) {
        const oldPower = basePower;
        basePower = 180;
        console.warn(`[ENGINE FIX] Z-Move 威力修正: ${moveName} (${oldPower} -> ${basePower})`);
    }
    
    // =====================================================
    // === 【Tera Blast 特判】 ===
    // =====================================================
    if (moveName === 'Tera Blast' && attacker.isTerastallized) {
        move.type = attacker.teraType;
        const atkStat = attacker.getStat ? attacker.getStat('atk') : attacker.atk;
        const spaStat = attacker.getStat ? attacker.getStat('spa') : attacker.spa;
        
        if (atkStat > spaStat) {
            move.cat = 'phys';
            category = 'Physical';
        } else {
            move.cat = 'spec';
            category = 'Special';
        }
        
        console.log(`[TERA BLAST] ${attacker.name} 使用 Tera Blast: 属性=${move.type}, 分类=${category} (Atk=${atkStat}, SpA=${spaStat})`);
    }
    
    // === 策略模式：检查是否有特殊处理器 ===
    const handler = (typeof getMoveHandler === 'function') ? getMoveHandler(move.name) : null;
    
    // === 【招式钩子】onModifyType - 动态修改招式属性 (Aura Wheel, Weather Ball 等) ===
    if (handler && handler.onModifyType) {
        const newType = handler.onModifyType(move, attacker, window.battle);
        if (newType) {
            move.type = newType;
            console.log(`[MOVE TYPE] ${move.name} 属性变为 ${newType}`);
        }
    }
    
    // === 【特性钩子】onModifyType - 皮肤系特性属性转换 (Pixilate, Aerilate 等) ===
    if (typeof AbilityHandlers !== 'undefined' && attacker.ability && AbilityHandlers[attacker.ability]) {
        const ah = AbilityHandlers[attacker.ability];
        if (ah.onModifyType) {
            const typeResult = ah.onModifyType(move, attacker, window.battle);
            if (typeResult && typeResult.newType) {
                move.type = typeResult.newType;
                // 皮肤系特性的威力加成标记
                if (typeResult.powerBoost) {
                    move._ateBoost = typeResult.powerBoost;
                }
                console.log(`[ABILITY TYPE] ${attacker.ability} 将 ${move.name} 属性变为 ${typeResult.newType}`);
            }
        }
    }
    
    // === 固定伤害技能 (damageCallback) ===
    if (handler && handler.damageCallback) {
        const fixedDamage = handler.damageCallback(attacker, defender);
        return { 
            damage: fixedDamage, 
            effectiveness: 1, 
            isCrit: false, 
            miss: false, 
            hitCount: 1,
            fixedDamage: true
        };
    }
    
    // === 动态威力技能 (basePowerCallback) ===
    if (handler && handler.basePowerCallback) {
        basePower = handler.basePowerCallback(attacker, defender);
    }
    
    // === 特性威力加成 Hook (技师、猛火、激流等) ===
    if (typeof AbilityHandlers !== 'undefined' && attacker.ability && AbilityHandlers[attacker.ability]) {
        const ah = AbilityHandlers[attacker.ability];
        if (ah.onBasePower) {
            basePower = ah.onBasePower(basePower, attacker, defender, move);
        }
    }
    
    // === 【皮肤系特性】属性转换后的威力加成 (x1.2) ===
    if (move._ateBoost) {
        basePower = Math.floor(basePower * move._ateBoost);
        console.log(`[ATE BOOST] 皮肤系特性威力加成 x${move._ateBoost}`);
    }
    
    // === 【充电 Charge】电系招式威力翻倍 ===
    const chargeMoveType = move.type || fullMoveData.type || 'Normal';
    if (attacker.volatile && attacker.volatile.charge && chargeMoveType === 'Electric') {
        basePower = Math.floor(basePower * 2);
        console.log(`[CHARGE] ${attacker.cnName} 的充电使电系招式威力翻倍！(${basePower / 2} -> ${basePower})`);
        // 使用后消耗
        delete attacker.volatile.charge;
    }
    
    // === 【磨砺 Laser Focus】下回合必定暴击 ===
    // 在暴击判定处处理，这里只做标记检查
    
    // === Mirror Coat / Counter 简化处理 ===
    if (move.name === 'Mirror Coat') {
        basePower = 100;
        move.cat = 'spec';
    } else if (move.name === 'Counter') {
        basePower = 80;
        move.cat = 'phys';
    }
    
    // === 【睡眠相关招式检查】 ===
    // 辅助函数：检查宝可梦是否处于睡眠状态（包括绝对睡眠特性）
    const isAsleep = (poke) => {
        if (poke.status === 'slp') return true;
        const ability = (poke.ability || '').toLowerCase().replace(/[^a-z]/g, '');
        return ability === 'comatose'; // 绝对睡眠视为永久睡眠
    };
    
    // 【梦话/打鼾 (Sleep Talk/Snore)】需要使用者睡眠才能使用
    const isSleepTalkOrSnore = moveName === 'Sleep Talk' || moveName === 'Snore';
    if (isSleepTalkOrSnore && !isAsleep(attacker)) {
        console.log(`[SLEEP CHECK] ${move.name} 失败：${attacker.cnName} 没有睡眠`);
        return { 
            damage: 0, 
            effectiveness: 0, 
            isCrit: false, 
            miss: false, 
            hitCount: 0, 
            failed: true,
            failMessage: `但是招式失败了！`
        };
    }
    
    // 【食梦 (Dream Eater)】需要目标睡眠才能使用
    const isDreamEater = moveName === 'Dream Eater';
    if (isDreamEater && !isAsleep(defender)) {
        console.log(`[SLEEP CHECK] ${move.name} 失败：${defender.cnName} 没有睡眠`);
        return { 
            damage: 0, 
            effectiveness: 0, 
            isCrit: false, 
            miss: false, 
            hitCount: 0, 
            failed: true,
            failMessage: `但是招式失败了！`
        };
    }
    
    // === Protect/Detect 守住判定 ===
    // 【严重BUG修复】守住应该阻挡所有攻击和变化技（除了特定穿透技能）
    // 原逻辑错误：只检查 basePower > 0，导致变化技（如蘑菇孢子）不被阻挡
    if (defender.volatile && defender.volatile.protect) {
        const isContact = fullMoveData.flags && fullMoveData.flags.contact;
        let protectEffect = null;
        
        // 检查是否为穿透守住的招式（佯攻 Feint、暗影袭击 Shadow Force 等）
        const bypassProtectMoves = ['feint', 'shadowforce', 'phantomforce', 'hyperspacefury', 'hyperspacehole'];
        const canBypassProtect = bypassProtectMoves.includes(moveId);
        
        if (canBypassProtect) {
            console.log(`[PROTECT BYPASS] ${move.name} 穿透了守住！`);
            // 穿透守住的招式，继续执行
        } else {
            // 【无形拳 (Unseen Fist)】接触类招式穿透守住（但只对攻击技有效，变化技仍被挡）
            const attackerAbility = (attacker.ability || '').toLowerCase().replace(/[^a-z]/g, '');
            const isStatusMove = basePower === 0 || category === 'Status';
            
            if (isContact && attackerAbility === 'unseenfist' && !isStatusMove) {
                console.log(`[Unseen Fist] ${attacker.cnName} 的无形拳穿透了守住！`);
                // 不 return blocked，继续计算伤害
                // 但仍然触发守住的接触副作用（如王盾降攻）
                if (defender.volatile.kingsShield) {
                    if (!attacker.boosts) attacker.boosts = {};
                    attacker.boosts.atk = Math.max(-6, (attacker.boosts.atk || 0) - 2);
                    protectEffect = { type: 'statDrop', msg: `${attacker.cnName} 的攻击大幅下降！` };
                }
                // 无形拳穿透后继续执行伤害计算，不在这里 return
            } else if (isContact && !isStatusMove) {
                // 碉堡 (Baneful Bunker): 接触攻击者中毒
                if (defender.volatile.banefulBunker) {
                    const attackerTypes = attacker.types || [];
                    const canPoison = !attackerTypes.includes('Poison') && !attackerTypes.includes('Steel');
                    if (canPoison && !attacker.status) {
                        attacker.status = 'psn';
                        protectEffect = { type: 'poison', msg: `${attacker.cnName} 接触了碉堡，中毒了！` };
                    }
                }
                // 尖刺防守 (Spiky Shield)
                else if (defender.volatile.spikyShield) {
                    const spikeDmg = Math.floor(attacker.maxHp / 8);
                    attacker.takeDamage(spikeDmg);
                    protectEffect = { type: 'damage', msg: `${attacker.cnName} 被尖刺刺伤了！(-${spikeDmg})` };
                }
                // 王者盾牌 (King's Shield)
                else if (defender.volatile.kingsShield) {
                    if (!attacker.boosts) attacker.boosts = {};
                    attacker.boosts.atk = Math.max(-6, (attacker.boosts.atk || 0) - 2);
                    protectEffect = { type: 'statDrop', msg: `${attacker.cnName} 的攻击大幅下降！` };
                }
                // 拦堵 (Obstruct)
                else if (defender.volatile.obstruct) {
                    if (!attacker.boosts) attacker.boosts = {};
                    attacker.boosts.def = Math.max(-6, (attacker.boosts.def || 0) - 2);
                    protectEffect = { type: 'statDrop', msg: `${attacker.cnName} 的防御大幅下降！` };
                }
                // 丝绸陷阱 (Silk Trap)
                else if (defender.volatile.silkTrap) {
                    if (!attacker.boosts) attacker.boosts = {};
                    attacker.boosts.spe = Math.max(-6, (attacker.boosts.spe || 0) - 1);
                    protectEffect = { type: 'statDrop', msg: `${attacker.cnName} 的速度下降了！` };
                }
                // 火焰守护 (Burning Bulwark)
                else if (defender.volatile.burningBulwark) {
                    const attackerTypes = attacker.types || [];
                    const canBurn = !attackerTypes.includes('Fire');
                    if (canBurn && !attacker.status) {
                        attacker.status = 'brn';
                        protectEffect = { type: 'burn', msg: `${attacker.cnName} 被灼伤了！` };
                    }
                }
                
                // 接触类攻击技被守住
                return { 
                    damage: 0, effectiveness: 0, isCrit: false, miss: false, hitCount: 0, blocked: true,
                    protectEffect 
                };
            } else {
                // 【关键修复】非接触类招式（包括变化技如蘑菇孢子）也被守住挡住
                console.log(`[PROTECT] ${defender.cnName} 的守住阻挡了 ${move.name}！`);
                return { 
                    damage: 0, effectiveness: 0, isCrit: false, miss: false, hitCount: 0, blocked: true,
                    protectEffect: null,
                    protectBlocked: true // 标记被守住阻挡
                };
            }
        }
    }
    
    // === 【破格系特性】判定 ===
    const attackerAbilityId = (attacker.ability || '').toLowerCase().replace(/[^a-z]/g, '');
    const moldBreakerAbilities = ['moldbreaker', 'teravolt', 'turboblaze'];
    const moldBreakerMoves = ['sunsteelstrike', 'moongeistbeam', 'photongeyser', 'menacingmoonrazemaelstrom', 'searingsunrazesmash'];
    const ignoresAbilities = moldBreakerAbilities.includes(attackerAbilityId) || 
                             moldBreakerMoves.includes(moveId);
    
    // === 特性免疫判定 Hook ===
    if (!ignoresAbilities && typeof AbilityHandlers !== 'undefined' && defender.ability && AbilityHandlers[defender.ability]) {
        const ahDef = AbilityHandlers[defender.ability];
        if (ahDef.onImmunity && ahDef.onImmunity(move.type, move)) {
            console.log(`[ABILITY IMMUNE] ${defender.cnName} 的 ${defender.ability} 免疫了 ${move.name}！`);
            return { damage: 0, effectiveness: 0, isCrit: false, miss: false, hitCount: 0, blocked: true, abilityImmune: defender.ability };
        }
        // 【修复】onTryHit 需要预计算 effectiveness 用于 Wonder Guard 等特性
        if (ahDef.onTryHit) {
            // 预计算属性克制倍率
            const defensiveTypes = defender.types || ['Normal'];
            const preEffectiveness = getTypeEffectiveness(move.type || 'Normal', defensiveTypes, move.name);
            const tryHitResult = ahDef.onTryHit(attacker, defender, move, preEffectiveness);
            if (tryHitResult && tryHitResult.blocked) {
                console.log(`[ABILITY BLOCK] ${tryHitResult.message || defender.ability + ' 阻止了攻击'}`);
                return { damage: 0, effectiveness: 0, isCrit: false, miss: false, hitCount: 0, blocked: true, abilityImmune: defender.ability };
            }
        }
    }
    if (ignoresAbilities && defender.ability) {
        console.log(`[MOLD BREAKER] ${attacker.cnName} 的特性/招式无视了 ${defender.cnName} 的 ${defender.ability}！`);
    }
    
    // 变化技不造成伤害
    if (basePower === 0 || category === 'Status') {
        // === 【恶作剧之心】恶系免疫检查 ===
        const isPrankster = attackerAbilityId === 'prankster';
        const defenderTypes = defender.types || [];
        const defenderIsDark = defenderTypes.includes('Dark');
        const moveTarget = fullMoveData.target || 'normal';
        const targetsOpponent = ['normal', 'randomNormal', 'allAdjacentFoes', 'foeSide', 'any', 'adjacentFoe'].includes(moveTarget);
        
        if (isPrankster && defenderIsDark && targetsOpponent) {
            console.log(`[PRANKSTER IMMUNITY] ${defender.cnName} 是恶系，免疫了 ${attacker.cnName} 的恶作剧之心变化技！`);
            return { 
                damage: 0, effectiveness: 0, isCrit: false, miss: false, hitCount: 0, blocked: true, 
                pranksterImmune: true,
                message: `${defender.cnName} 是恶属性，免疫了恶作剧之心的效果！`
            };
        }
        
        // 变化技命中判定
        let statusAcc = (accuracy === true || accuracy === undefined) ? 100 : accuracy;
        const accStage = attacker.boosts.accuracy;
        const evaStage = defender.boosts.evasion;
        const finalStage = Math.min(6, Math.max(-6, accStage - evaStage));
        let accMult = 1.0;
        if (finalStage >= 0) accMult = (3 + finalStage) / 3;
        else accMult = 3 / (3 + Math.abs(finalStage));
        const finalAcc = statusAcc * accMult;
        
        if (statusAcc < 100 && Math.random() * 100 >= finalAcc) {
            return { damage: 0, effectiveness: 1, isCrit: false, miss: true, hitCount: 0 };
        }
        return { damage: 0, effectiveness: 1, isCrit: false, miss: false, hitCount: 0 };
    }
    
    // === 命中判定 ===
    let moveAcc = (accuracy === true || accuracy === undefined) ? 100 : accuracy;
    
    // 无防守 (No Guard)
    const attackerHasNoGuard = attackerAbilityId === 'noguard';
    const defenderHasNoGuard = (defender.ability || '').toLowerCase().replace(/[^a-z]/g, '') === 'noguard';
    const alwaysHit = accuracy === true || attackerHasNoGuard || defenderHasNoGuard;
    
    // 必中招式列表
    const neverMissMoves = ['aerialace', 'aurasphere', 'clearsmog', 'disarmingvoice', 'feintattack', 
        'magicalleaf', 'magnetbomb', 'shadowpunch', 'shockwave', 'smartstrike', 'swift', 'vitalthrow'];
    const isNeverMiss = neverMissMoves.includes(moveId);
    
    // 命中/闪避修正
    const accStage = attacker.boosts.accuracy || 0;
    const evaStage = defender.boosts.evasion || 0;
    
    const getAccuracyMultiplier = (stage) => {
        const clampedStage = Math.min(6, Math.max(-6, stage));
        if (clampedStage >= 0) return (3 + clampedStage) / 3;
        return 3 / (3 - clampedStage);
    };
    
    const accMult = getAccuracyMultiplier(accStage);
    const evaMult = getAccuracyMultiplier(-evaStage);
    
    // 【广角镜 Wide Lens】命中率x1.1
    let itemAccMod = 1;
    if (typeof ItemEffects !== 'undefined' && ItemEffects.getAccuracyMod) {
        itemAccMod = ItemEffects.getAccuracyMod(attacker);
    }
    
    let hitRate = moveAcc * accMult / evaMult * itemAccMod;
    
    if (alwaysHit || isNeverMiss) {
        hitRate = 100;
    }
    
    // Z 招式和极巨招式必中
    const isZMove = move.isZ || (move.name && (
        move.name.includes('10,000,000') ||
        move.name.includes('Catastropika') ||
        move.name.includes('Breakneck Blitz') ||
        move.name.includes('Inferno Overdrive') ||
        move.name.includes('Hydro Vortex') ||
        move.name.includes('Gigavolt Havoc')
    ));
    const isMaxMove = move.isMax || (move.name && (
        move.name.startsWith('Max ') ||
        move.name.startsWith('G-Max ')
    ));
    const isSureHit = isZMove || isMaxMove || accuracy === true;
    
    // === Insight 奇迹闪避 ===
    if (isSureHit && defender.isAce && defender.avs && defender.avs.insight >= 250) {
        const baseInsight = defender.getEffectiveAVs('insight');
        const effectiveInsight = defender.avsEvolutionBoost ? baseInsight * 2 : baseInsight;
        const miracleChance = effectiveInsight >= 255 ? 10 : 5;
        
        if (Math.random() * 100 < miracleChance) {
            console.log(`[Insight] MIRACLE DODGE TRIGGERED! Bypassed Sure-Hit.`);
            return {
                damage: 0, effectiveness: 0, isCrit: false, miss: true, hitCount: 0,
                insightMiracle: true
            };
        }
    }
    
    // === AVs: Insight 闪避加成 ===
    // 【线性机制】闪避加成 = (effectiveInsight / 255) * 20
    // 满值 255 时 20% 闪避加成，100 时约 8% 闪避加成
    if (defender.isAce && defender.avs && !isSureHit) {
        const baseInsight = defender.getEffectiveAVs('insight');
        // 【全局开关】AVS 关闭时 getEffectiveAVs 返回 0，跳过计算
        if (baseInsight > 0) {
            const effectiveInsight = defender.avsEvolutionBoost ? baseInsight * 2 : baseInsight;
            // 线性闪避加成：满值 10%（从 20% 下调），最低 1%
            let evasionBonus = Math.max(1, Math.floor((Math.min(effectiveInsight, 255) / 255) * 10));
            
            hitRate = Math.max(50, hitRate - evasionBonus); // 最低命中率提高至 50%
            console.log(`[AVs] Insight 闪避加成: -${evasionBonus}% (Insight: ${baseInsight}${defender.avsEvolutionBoost ? ' x2' : ''})`);
        }
    }
    
    // 【战术指挥】DODGE! 指令：基础 30% 闪避 + Insight AVS 加成
    // 点击后仅当回合生效
    // 【平衡调整】DODGE 指令与被动 Insight 闪避不叠加，取较高值
    if (defender.commandDodgeActive && !isSureHit) {
        let dodgeBonus = 30; // 基础 30% 闪避（从 40% 下调）
        
        // Insight AVS 加成：满值 255 时 +30%（总计 60%）
        // 【全局开关】使用 getEffectiveAVs 检查有效值
        if (defender.isAce && defender.avs && defender.getEffectiveAVs) {
            const baseInsight = defender.getEffectiveAVs('insight');
            if (baseInsight > 0) {
                const effectiveInsight = defender.avsEvolutionBoost ? baseInsight * 2 : baseInsight;
                const insightBonus = (Math.min(effectiveInsight, 255) / 255) * 30;
                dodgeBonus += insightBonus;
                console.log(`[COMMANDER] DODGE! Insight 加成: +${insightBonus.toFixed(1)}% (Insight: ${baseInsight})`);
            }
        }
        
        dodgeBonus = Math.min(dodgeBonus, 60); // 上限 60%（保证至少 40% 命中率）
        // DODGE 指令覆盖被动闪避，不叠加（重置 hitRate 后再减）
        hitRate = Math.max(40, 100 - dodgeBonus);
        console.log(`[COMMANDER] DODGE! 指令激活！闪避 -${dodgeBonus.toFixed(1)}% (命中率: ${hitRate}%)`);
    }
    
    // Miss 检测
    if (typeof accuracy === 'number' && !isSureHit) {
        if (Math.random() * 100 > hitRate) {
            // 【路痴保险 Blunder Policy】Miss后速度+2
            // 注意：这里只返回 miss 标记，实际触发在 battle-damage.js 中处理
            return { damage: 0, effectiveness: 0, isCrit: false, miss: true, hitCount: 0, insightDodge: defender.avs?.insight >= 100, triggerBlunderPolicy: true };
        }
    }
    
    // === 多段攻击 (Multi-Hit) ===
    let hitCount = 1;
    const multihit = fullMoveData.multihit;
    if (multihit) {
        if (Array.isArray(multihit)) {
            const [min, max] = multihit;
            if (attackerAbilityId === 'skilllink') {
                hitCount = max;
                console.log(`[SKILL LINK] ${attacker.cnName} 的连续攻击特性发动！强制命中 ${max} 次！`);
            } else {
                // 【均等之骰 Loaded Dice】保底4-5次
                if (typeof ItemEffects !== 'undefined' && ItemEffects.getMultiHitCount) {
                    hitCount = ItemEffects.getMultiHitCount(attacker, min, max);
                } else {
                    hitCount = Math.floor(Math.random() * (max - min + 1)) + min;
                }
            }
        } else {
            hitCount = multihit;
        }
    }
    
    // === 选择攻击/防御能力 ===
    const isSpecial = (move.cat === 'spec' || category === 'Special');
    let atkStat = isSpecial ? attacker.getStat('spa') : attacker.getStat('atk');
    let defStat = isSpecial ? defender.getStat('spd') : defender.getStat('def');
    
    
    // === 【纯朴 Unaware】特性处理 ===
    if (typeof AbilityHandlers !== 'undefined') {
        const attackerHandler = attacker.ability ? AbilityHandlers[attacker.ability] : null;
        const defenderHandler = defender.ability ? AbilityHandlers[defender.ability] : null;
        
        if (attackerHandler && attackerHandler.ignoreDefenderBoosts) {
            const baseDefStat = isSpecial ? defender.spd : defender.def;
            if (defStat > baseDefStat) {
                console.log(`[UNAWARE] ${attacker.cnName} 的纯朴无视了 ${defender.cnName} 的防御提升`);
                defStat = baseDefStat;
            }
        }
        
        if (defenderHandler && defenderHandler.ignoreAttackerBoosts) {
            const baseAtkStat = isSpecial ? attacker.spa : attacker.atk;
            if (atkStat > baseAtkStat) {
                console.log(`[UNAWARE] ${defender.cnName} 的纯朴无视了 ${attacker.cnName} 的攻击提升`);
                atkStat = baseAtkStat;
            }
        }
    }
    
    // === 策略模式：特殊攻防计算 ===
    if (handler && handler.modifyAtk) {
        atkStat = handler.modifyAtk(attacker, defender, isSpecial);
    }
    if (handler && handler.modifyDef) {
        defStat = handler.modifyDef(attacker, defender, isSpecial);
    }
    
    // === 灼伤减半物攻 ===
    const ignoresBurnDrop = attacker.ability === 'Guts';
    if (!isSpecial && attacker.status === 'brn' && !ignoresBurnDrop) {
        atkStat = Math.floor(atkStat * 0.5);
    }
    
    // === 防御方属性判定 ===
    let defensiveTypes = defender.types || ['Normal'];
    
    if (defender.isTerastallized) {
        if (defender.teraType === 'Stellar') {
            defensiveTypes = defender.originalTypes || defender.types;
            console.log(`[STELLAR] ${defender.name} 是星晶状态，防御属性回归为: ${defensiveTypes.join('/')}`);
        } else {
            defensiveTypes = [defender.teraType];
        }
    }
    
    // 属性克制
    // 【修复】确保 moveType 有效，优先使用 move.type，回退到 fullMoveData.type
    const moveType = move.type || fullMoveData.type || 'Normal';
    let effectiveness = getTypeEffectiveness(moveType, defensiveTypes, move.name);
    
    // === 本系加成 (STAB) ===
    let stab = 1;
    
    if (attacker.isTerastallized) {
        const teraType = attacker.teraType;
        const originalTypes = attacker.originalTypes || [];
        const stabMoveType = moveType; // 使用上面已修复的 moveType
        
        if (teraType === 'Stellar') {
            if (originalTypes.includes(moveType)) {
                stab = 2.0; 
                console.log(`[STELLAR STAB] ${attacker.name} 原生本系强化 (${moveType}) -> 2.0x`);
            } else {
                stab = 1.2;
                console.log(`[STELLAR STAB] ${attacker.name} 星晶全能强化 (${moveType}) -> 1.2x`);
            }
            if (move.name === 'Tera Blast') {
                stab = 2.0; 
            }
        } else {
            let teraTrackBonus = 0;
            if (moveType === teraType) {
                teraTrackBonus = 1.5;
                if (originalTypes.includes(teraType)) {
                    teraTrackBonus = 2.0;
                }
            }
            
            let recallTrackBonus = 0;
            if (originalTypes.includes(moveType)) {
                recallTrackBonus = 1.5;
            }
            
            stab = Math.max(teraTrackBonus, recallTrackBonus, 1);
            
            if (stab > 1) {
                console.log(`[TERA STAB] ${attacker.name} (Tera: ${teraType}, Original: ${originalTypes.join('/')}) 使用 ${moveType} 招式, STAB: ${stab}x`);
            }
        }
    } else {
        // 防护：确保 attacker.types 是有效数组，使用修复后的 moveType
        stab = (Array.isArray(attacker.types) && attacker.types.includes(moveType)) ? 1.5 : 1;
    }
    
    // === 适应力特性 ===
    if (!attacker.isTerastallized && stab > 1 && attacker.ability === 'Adaptability') {
        stab = 2;
    }
    
    // === 生命宝珠 ===
    let lifeOrbBoost = 1;
    const attackerItem = (attacker.item || '').toLowerCase().replace(/[^a-z]/g, '');
    if (attackerItem === 'lifeorb') {
        lifeOrbBoost = 1.3;
    }
    
    // === 星晶太晶爆发特判 ===
    if (attacker.isTerastallized && attacker.teraType === 'Stellar' && move.name === 'Tera Blast') {
        if (defender.isTerastallized) {
            console.log(`[STELLAR KILLER] 星晶爆发击中了太晶化的对手！强制效果拔群。`);
            effectiveness = 2.0; 
        } else {
            if (effectiveness < 1 && effectiveness > 0) {
                effectiveness = 1;
            }
        }
    }
    
    // === 会心一击判定 ===
    let isCrit = false;
    let commandCritTriggered = false;
    
    // =====================================================
    // 【防暴击判定】优先级最高
    // =====================================================
    const defenderAbility = defender.ability || '';
    const defenderAh = (typeof AbilityHandlers !== 'undefined' && AbilityHandlers[defenderAbility]) || {};
    const preventCrit = defenderAh.preventCrit === true; // Battle Armor / Shell Armor
    
    if (preventCrit) {
        isCrit = false;
        console.log(`[CRIT BLOCKED] ${defender.cnName} 的 ${defenderAbility} 阻止了暴击！`);
    }
    // =====================================================
    // 【强制暴击判定】
    // =====================================================
    else if (attacker.volatile && attacker.volatile.laserfocus) {
        // 【磨砺 Laser Focus】必定暴击
        isCrit = true;
        console.log(`[LASER FOCUS] ${attacker.cnName} 的磨砺使攻击必定暴击！`);
        delete attacker.volatile.laserfocus;
    } else if (fullMoveData.willCrit) {
        // 【必暴招式】冰息、山岚摔、暗冥强击、水流连打、千变万花
        isCrit = true;
        console.log(`[WILL CRIT] ${fullMoveData.name} 必定暴击！`);
    } else {
        // 【不仁不义 Merciless】攻击中毒目标必暴
        const attackerAbility = attacker.ability || '';
        const attackerAh = (typeof AbilityHandlers !== 'undefined' && AbilityHandlers[attackerAbility]) || {};
        if (attackerAh.onCheckCrit) {
            const forceCrit = attackerAh.onCheckCrit(attacker, defender);
            if (forceCrit === true) {
                isCrit = true;
            }
        }
        
        if (!isCrit) {
            // =====================================================
            // === 暴击等级计算（正版机制） ===
            // Stage 0: 1/24 (~4.17%), 1: 1/8 (12.5%), 2: 1/2 (50%), 3+: 100%
            // =====================================================
            let critStage = 0;
            
            // 1. 招式自带暴击等级 (critRatio - 1)
            const moveCritRatio = fullMoveData.critRatio || 1;
            critStage += (moveCritRatio - 1);
            
            // 2. 聚气状态 (+2)
            if (attacker.volatile && attacker.volatile.focusenergy) {
                critStage += 2;
                console.log(`[Focus Energy] ${attacker.cnName} 处于聚气状态，暴击等级 +2`);
            }
            
            // 3. 特性加成 (Super Luck +1)
            if (attackerAh.critStageBoost) {
                critStage += attackerAh.critStageBoost;
                console.log(`[${attackerAbility}] 暴击等级 +${attackerAh.critStageBoost}`);
            }
            
            // 4. 道具加成 (Scope Lens/Razor Claw +1, Leek/Lucky Punch +2)
            const itemId = (attacker.item || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const itemData = (typeof ITEMS !== 'undefined' && ITEMS[itemId]) || {};
            if (itemData.critBoost) {
                // 检查专属道具限制
                let canUseCritBoost = true;
                if (itemData.itemUser && itemData.itemUser.length > 0) {
                    const pokemonName = (attacker.name || '').replace(/-/g, '');
                    canUseCritBoost = itemData.itemUser.some(user => 
                        pokemonName.toLowerCase().includes(user.toLowerCase().replace(/-/g, ''))
                    );
                }
                if (canUseCritBoost) {
                    critStage += itemData.critBoost;
                    console.log(`[${itemData.name}] 暴击等级 +${itemData.critBoost}`);
                }
            }
            
            // 5. 暴击等级上限为 3
            critStage = Math.min(3, critStage);
            
            // 6. 根据暴击等级计算概率
            // Stage 0: 1/24, 1: 1/8, 2: 1/2, 3+: 1/1
            const critRates = [1/24, 1/8, 1/2, 1];
            let critChance = critRates[critStage] || critRates[0];
            
            // 7. AVs: Passion 暴击加成（仅限 isAce 宝可梦，额外叠加）
            if (attacker.isAce && attacker.avs) {
                const basePassion = attacker.getEffectiveAVs('passion');
                if (basePassion > 0) {
                    const effectivePassion = attacker.avsEvolutionBoost ? basePassion * 2 : basePassion;
                    const passionBonus = (Math.min(effectivePassion, 255) / 255) * 0.20;
                    critChance += passionBonus;
                    console.log(`[AVs] Passion 暴击加成: +${(passionBonus * 100).toFixed(1)}% (Passion: ${basePassion}${attacker.avsEvolutionBoost ? ' x2' : ''})`);
                }
            }
            
            // 8. 【战术指挥】FOCUS! 指令：当回合 +40% 暴击率
            if (attacker.commandCritActive) {
                critChance += 0.40;
                commandCritTriggered = true;
                console.log(`[COMMANDER] FOCUS! 指令激活！+40% 暴击率！`);
                if (!options.isSimulation) {
                    attacker.commandCritActive = false;
                }
            }
            
            critChance = Math.min(critChance, 1.0);
            console.log(`[CRIT CHECK] 暴击等级=${critStage}, 最终概率=${(critChance * 100).toFixed(1)}%`);
            
            if (Math.random() < critChance) isCrit = true;
        }
    }
    
    // === 暴击伤害倍率 ===
    let critMod = isCrit ? 1.5 : 1;
    
    // 【狙击手 Sniper】暴击伤害 x1.5 (总计 2.25x)
    if (isCrit) {
        const attackerAbility = attacker.ability || '';
        const attackerAh = (typeof AbilityHandlers !== 'undefined' && AbilityHandlers[attackerAbility]) || {};
        if (attackerAh.onCritDamage) {
            const baseCritDamage = 100; // 用于计算倍率
            const modifiedDamage = attackerAh.onCritDamage(baseCritDamage);
            critMod = critMod * (modifiedDamage / baseCritDamage);
            console.log(`[${attackerAbility}] 暴击伤害修正: ${critMod.toFixed(2)}x`);
        }
    }
    
    // 乱数
    const random = 0.85 + Math.random() * 0.15;
    
    // 防止除以0
    const finalDef = Math.max(1, defStat);
    
    // 伤害公式
    let singleHitDamage = Math.floor(
        ((2 * attacker.level / 5 + 2) * basePower * (atkStat / finalDef) / 50 + 2)
        * stab * effectiveness * critMod * random * lifeOrbBoost
    );
    
    if (effectiveness > 0 && singleHitDamage < 1) singleHitDamage = 1;
    if (effectiveness === 0) singleHitDamage = 0;
    
    // === 防御方特性伤害修正 ===
    // 【重要】传递 isSimulation 标记，避免 AI 模拟时触发形态变化等副作用
    if (!ignoresAbilities && typeof AbilityHandlers !== 'undefined' && defender.ability && AbilityHandlers[defender.ability]) {
        const ahDef = AbilityHandlers[defender.ability];
        if (ahDef.onDefenderModifyDamage) {
            singleHitDamage = ahDef.onDefenderModifyDamage(singleHitDamage, attacker, defender, move, effectiveness, options.isSimulation);
        }
    }
    
    // === 双墙/极光幕减伤 ===
    // 【Infiltrator】穿透特性无视光墙/反射壁/极光幕
    const attackerIgnoresScreens = (typeof AbilityHandlers !== 'undefined' && attacker.ability && AbilityHandlers[attacker.ability])
        ? AbilityHandlers[attacker.ability].ignoreScreens
        : false;
    
    if (typeof battle !== 'undefined' && battle && !attackerIgnoresScreens) {
        const defenderSide = (defender === battle.getPlayer?.()) ? battle.playerSide : battle.enemySide;
        
        if (defenderSide) {
            if (defenderSide.auroraVeil > 0) {
                singleHitDamage = Math.floor(singleHitDamage * 0.5);
            }
            else if (!isSpecial && defenderSide.reflect > 0) {
                singleHitDamage = Math.floor(singleHitDamage * 0.5);
            }
            else if (isSpecial && defenderSide.lightScreen > 0) {
                singleHitDamage = Math.floor(singleHitDamage * 0.5);
            }
        }
    }

    // === 抗性树果减伤 ===
    let resistBerryTriggered = false;
    let resistBerryMessage = '';
    if (typeof ItemEffects !== 'undefined' && ItemEffects.checkResistBerry && effectiveness >= 2) {
        const berryResult = ItemEffects.checkResistBerry(defender, move.type, effectiveness);
        if (berryResult.triggered) {
            singleHitDamage = Math.floor(singleHitDamage * berryResult.damageMultiplier);
            resistBerryTriggered = true;
            resistBerryMessage = berryResult.message;
            console.log(`[RESIST BERRY] ${resistBerryMessage}`);
        }
    }
    
    // === 结实特性 Hook ===
    if (typeof AbilityHandlers !== 'undefined' && defender.ability && AbilityHandlers[defender.ability]) {
        const ahDef = AbilityHandlers[defender.ability];
        if (ahDef.onDamageHack) {
            singleHitDamage = ahDef.onDamageHack(singleHitDamage * hitCount, defender);
            return { 
                damage: singleHitDamage, 
                singleHitDamage,
                effectiveness, 
                isCrit, 
                miss: false, 
                hitCount,
                sturdyActivated: singleHitDamage === defender.currHp - 1
            };
        }
    }
    
    // 总伤害
    let totalDamage = singleHitDamage * hitCount;
    
    // 【对冲系统】应用对冲伤害倍率
    if (move.clashDamageMultiplier !== undefined && move.clashDamageMultiplier < 1) {
        const originalDamage = totalDamage;
        totalDamage = Math.floor(totalDamage * move.clashDamageMultiplier);
        console.log(`[CLASH] 对冲伤害削减: ${originalDamage} × ${move.clashDamageMultiplier} = ${totalDamage}`);
    }
    
    return { 
        damage: totalDamage, 
        singleHitDamage,
        effectiveness, 
        isCrit, 
        miss: false, 
        hitCount,
        resistBerryTriggered,
        resistBerryMessage,
        commandCritTriggered
    };
}

// ============================================
// 导出到全局
// ============================================

if (typeof window !== 'undefined') {
    window.calcDamage = calcDamage;
}
