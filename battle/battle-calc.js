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
    // 获取 battle 对象
    const battle = (typeof window !== 'undefined') ? window.battle : null;
    
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
    
    // === 【Chronal Rift 技能黑箱】科技类招式RNG ===
    let moveGlitchLog = null;
    if (typeof window.WeatherEffects !== 'undefined' && window.WeatherEffects.checkMoveGlitch) {
        const weather = (typeof battle !== 'undefined' && battle) ? (battle.weather || battle.environmentWeather || '') : '';
        const glitchResult = window.WeatherEffects.checkMoveGlitch(weather, move, attacker);
        if (glitchResult.triggered) {
            if (glitchResult.effect === 'fail') {
                // 招式失败
                moveGlitchLog = glitchResult.message;
                return {
                    damage: 0,
                    effectiveness: 1,
                    isCrit: false,
                    miss: false,
                    hitCount: 0,
                    moveGlitchLog: moveGlitchLog
                };
            } else if (glitchResult.effect === 'critical') {
                // 威力翻倍
                basePower = Math.floor(basePower * glitchResult.powerMultiplier);
                moveGlitchLog = glitchResult.message;
                console.log(`[CHRONAL RIFT] 💥 技能黑箱：威力 x${glitchResult.powerMultiplier} -> ${basePower}`);
            }
        }
    }
    
    // === 【充电 Charge】电系招式威力翻倍 ===
    const chargeMoveType = move.type || fullMoveData.type || 'Normal';
    if (attacker.volatile && attacker.volatile.charge && chargeMoveType === 'Electric') {
        basePower = Math.floor(basePower * 2);
        console.log(`[CHARGE] ${attacker.cnName} 的充电使电系招式威力翻倍！(${basePower / 2} -> ${basePower})`);
        // 使用后消耗
        delete attacker.volatile.charge;
    }
    
    // === 【天气威力修正】使用 MoveEffects 模块 ===
    const currentWeather = (typeof window !== 'undefined' && window.battle && window.battle.weather) || '';
    const moveType = move.type || fullMoveData.type || 'Normal';
    
    if (currentWeather && typeof MoveEffects !== 'undefined' && MoveEffects.getWeatherModifier) {
        const weatherResult = MoveEffects.getWeatherModifier(currentWeather, moveType, move.name);
        if (weatherResult.modifier !== 1) {
            const oldPower = basePower;
            basePower = Math.floor(basePower * weatherResult.modifier);
            console.log(`[WEATHER] ${weatherResult.log} (${oldPower} -> ${basePower})`);
            if (!options.isSimulation && weatherResult.log) {
                move._weatherPowerLog = weatherResult.log;
            }
            
            // 【始源天气】威力归零 = 招式失效，立即返回并显示日志
            if (weatherResult.modifier === 0 && oldPower > 0) {
                const blockMsg = (currentWeather === 'harshsun') 
                    ? `<span style="color:#f59e0b">🔥 水被强烈的阳光蒸发了！</span>`
                    : `<span style="color:#3b82f6">🌊 火被暴风雨浇灭了！</span>`;
                return { 
                    damage: 0, 
                    effectiveness: 0, 
                    isCrit: false, 
                    miss: false, 
                    hitCount: 0, 
                    blocked: true,
                    weatherBlocked: true,
                    weatherBlockMessage: blockMsg
                };
            }
        }
        
        // 天气球 (Weather Ball) 威力变化
        if (move.name === 'Weather Ball' && currentWeather !== 'none') {
            const oldPower = basePower;
            basePower = 100;
            console.log(`[WEATHER BALL] 天气 ${currentWeather}，威力翻倍！(${oldPower} -> ${basePower})`);
        }
    }
    
    // === 【玩水 Water Sport】火系招式威力减半 ===
    if (battle && battle.field && battle.field.waterSport > 0 && moveType === 'Fire') {
        const oldPower = basePower;
        basePower = Math.floor(basePower * 0.5);
        console.log(`[WATER SPORT] 玩水效果：火系招式威力减半 (${oldPower} -> ${basePower})`);
    }
    
    // === 【玩泥巴 Mud Sport】电系招式威力减半 ===
    if (battle && battle.field && battle.field.mudsport > 0 && moveType === 'Electric') {
        const oldPower = basePower;
        basePower = Math.floor(basePower * 0.5);
        console.log(`[MUD SPORT] 玩泥巴效果：电系招式威力减半 (${oldPower} -> ${basePower})`);
    }
    
    // === 【场地 Terrain】威力修正 ===
    // 电气场地: 电系x1.3, 青草场地: 草系x1.3, 精神场地: 超能x1.3, 薄雾场地: 龙系x0.5
    const currentTerrain = battle?.terrain || '';
    if (currentTerrain && typeof MoveEffects !== 'undefined' && MoveEffects.getTerrainModifier) {
        // 检查攻击方是否接地（飞行系/浮游不受场地影响）
        const attackerTypes = attacker.types || [];
        const attackerAbility = (attacker.ability || '').toLowerCase().replace(/[^a-z]/g, '');
        const isGrounded = !attackerTypes.includes('Flying') && attackerAbility !== 'levitate';
        
        const terrainMod = MoveEffects.getTerrainModifier(currentTerrain, moveType, isGrounded);
        if (terrainMod !== 1) {
            const oldPower = basePower;
            basePower = Math.floor(basePower * terrainMod);
            console.log(`[TERRAIN] 场地威力修正: ${moveType} x${terrainMod} (${oldPower} -> ${basePower})`);
        }
    }
    
    // === 【青草场地】地震/重踏/震级 伤害减半 ===
    if (currentTerrain === 'grassyterrain') {
        const groundMoveId = moveId || '';
        const grassyHalvedMoves = ['earthquake', 'bulldoze', 'magnitude'];
        if (grassyHalvedMoves.includes(groundMoveId)) {
            const oldPower = basePower;
            basePower = Math.floor(basePower * 0.5);
            console.log(`[GRASSY TERRAIN] 青草场地减半地面技: ${moveName} (${oldPower} -> ${basePower})`);
        }
    }
    
    // === 【区域天气威力修正已迁移至 Environment Overlay API】===
    // 参见: systems/environment-overlay.js 的 getDamageMod()
    
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
    
    // === 半无敌状态检测 (Semi-Invulnerable) ===
    // 检查目标是否处于飞翔/挖洞/潜水等半无敌状态
    // 【重要】跳过不针对特定目标的技能：
    // - self: 对自己使用（如 Geomancy, Swords Dance）
    // - allySide/allyTeam: 对己方场地使用（如 Light Screen, Reflect）
    // - all: 场地技能（如 Rain Dance, Sunny Day, Trick Room）
    // - foeSide: 对敌方场地使用（如 Stealth Rock, Spikes）
    // - allAdjacent/allAdjacentFoes: 范围攻击（如 Earthquake, Surf）- 这些仍需检测
    const moveTarget = fullMoveData.target || move.target || 'normal';
    const nonTargetingMoves = ['self', 'allySide', 'allyTeam', 'all', 'foeSide', 'adjacentAlly', 'adjacentAllyOrSelf'];
    const isNonTargeting = nonTargetingMoves.includes(moveTarget);
    const isStatusMove = fullMoveData.category === 'Status' || move.cat === 'status';
    
    if (defender.volatile && typeof checkInvulnerability === 'function' && !isNonTargeting) {
        const invulnResult = checkInvulnerability(defender, move);
        if (invulnResult.invulnerable && !invulnResult.canHit) {
            console.log(`[INVULN] ${defender.cnName} 处于 ${invulnResult.status} 状态，${move.name} 无法命中`);
            return {
                damage: 0,
                effectiveness: 1,
                isCrit: false,
                miss: true,
                hitCount: 0,
                invulnerableMiss: true,
                invulnStatus: invulnResult.status
            };
        }
        // 如果可以命中且双倍伤害，标记在 move 上
        if (invulnResult.doubleDamage) {
            move._invulnDoubleDamage = true;
            console.log(`[INVULN] ${move.name} 对 ${invulnResult.status} 状态的目标造成双倍伤害`);
        }
    }
    
    // === Protect/Detect 守住判定 ===
    // 【严重BUG修复】守住应该阻挡所有攻击和变化技（除了特定穿透技能）
    // 原逻辑错误：只检查 basePower > 0，导致变化技（如蘑菇孢子）不被阻挡
    // 【修复】守住不应该阻挡 target: "self" 的招式（如磨爪、剑舞等自我强化技）
    if (defender.volatile && defender.volatile.protect) {
        const isContact = fullMoveData.flags && fullMoveData.flags.contact;
        let protectEffect = null;
        
        // 【关键修复】检查招式目标 - 自我强化技和场地技不应被守住阻挡
        // target: "self" 表示招式目标是使用者自己，不指向对手
        // target: "all" 表示影响整个场地（如天气技能 Sandstorm、Rain Dance 等）
        const moveTarget = fullMoveData.target || 'normal';
        const nonTargetingMoves = ['self', 'allySide', 'allyTeam', 'adjacentAllyOrSelf', 'all'];
        const isNonTargeting = nonTargetingMoves.includes(moveTarget);
        
        if (isNonTargeting) {
            // 自我强化技（如磨爪、剑舞、龙舞等）和场地技（如沙暴、祈雨等）不被守住阻挡
            // 这些招式不指向对手，守住只能防御指向自己的招式
            console.log(`[PROTECT IGNORE] ${move.name} 目标是 ${moveTarget}，不受守住影响`);
            // 不 return，继续执行招式
        }
        
        // 检查是否为穿透守住的招式（佯攻 Feint、暗影袭击 Shadow Force 等）
        const bypassProtectMoves = ['feint', 'shadowforce', 'phantomforce', 'hyperspacefury', 'hyperspacehole'];
        const canBypassProtect = bypassProtectMoves.includes(moveId);
        
        if (isNonTargeting) {
            // 已在上面处理，跳过守住判定
        } else if (canBypassProtect) {
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
    
    // =========================================================
    // 【始源天气】招式失效判定
    // Desolate Land (harshsun): 水系攻击招式失效
    // Primordial Sea (heavyrain): 火系攻击招式失效
    // =========================================================
    if (battle && basePower > 0) {
        const attackMoveType = move.type || fullMoveData.type || 'Normal';
        
        // 【终结之地 Desolate Land】水系攻击招式失效
        if (battle.weather === 'harshsun' && attackMoveType === 'Water') {
            console.log(`[DESOLATE LAND] 🔥 水系招式 ${move.name} 被强烈的阳光蒸发了！`);
            return { 
                damage: 0, 
                effectiveness: 0, 
                isCrit: false, 
                miss: false, 
                hitCount: 0, 
                blocked: true,
                weatherBlocked: true,
                weatherBlockMessage: `<span style="color:#f59e0b">🔥 水被强烈的阳光蒸发了！</span>`
            };
        }
        
        // 【始源之海 Primordial Sea】火系攻击招式失效
        if (battle.weather === 'heavyrain' && attackMoveType === 'Fire') {
            console.log(`[PRIMORDIAL SEA] 🌊 火系招式 ${move.name} 被暴风雨浇灭了！`);
            return { 
                damage: 0, 
                effectiveness: 0, 
                isCrit: false, 
                miss: false, 
                hitCount: 0, 
                blocked: true,
                weatherBlocked: true,
                weatherBlockMessage: `<span style="color:#3b82f6">🌊 火被暴风雨浇灭了！</span>`
            };
        }
    }
    
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
    
    // === 【天气命中率修正】使用 MoveEffects 模块 ===
    // 【关键】weatherGuaranteedHit 标记天气导致的必中（如雪天暴风雪）
    let weatherGuaranteedHit = false;
    const weatherForAcc = (typeof window !== 'undefined' && window.battle && window.battle.weather) || '';
    if (weatherForAcc && typeof MoveEffects !== 'undefined' && MoveEffects.getWeatherAccuracyModifier) {
        const accResult = MoveEffects.getWeatherAccuracyModifier(weatherForAcc, move.name);
        if (accResult.accuracy !== null) {
            moveAcc = accResult.accuracy;
            // 如果天气返回 100 命中率，标记为必中
            if (accResult.accuracy === 100 || accResult.accuracy === true) {
                weatherGuaranteedHit = true;
            }
            console.log(`[WEATHER ACC] ${accResult.log}`);
        }
    }
    
    
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
    let evaStage = defender.boosts.evasion || 0;
    
    // === 【环境图层系统】闪避等级修正 ===
    if (typeof window !== 'undefined' && window.envOverlay) {
        const envEvasionBoost = window.envOverlay.getEvasionStage(defender);
        if (envEvasionBoost !== 0) {
            evaStage += envEvasionBoost;
            console.log(`[ENV OVERLAY] 闪避等级修正: ${defender.cnName || defender.name} +${envEvasionBoost}`);
        }
    }
    
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
    
    // 【环境图层系统】命中率修正
    let envAccMod = 1;
    if (typeof window !== 'undefined' && window.envOverlay) {
        envAccMod = window.envOverlay.getAccuracyMod(attacker, move);
        if (envAccMod !== 1) {
            console.log(`[ENV OVERLAY] 命中率修正: x${envAccMod}`);
        }
    }
    
    // 【重力 Gravity】命中率 x5/3 (约1.67倍)
    let gravityAccMod = 1;
    if (battle && battle.field && battle.field.gravity > 0) {
        gravityAccMod = 5 / 3;
        console.log(`[GRAVITY] 重力场命中率提升 x${gravityAccMod.toFixed(2)}`);
    }
    
    // 计算命中率
    let hitRate = moveAcc * accMult / evaMult * itemAccMod * envAccMod * gravityAccMod;
    
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
    // 【关键修复】加入 weatherGuaranteedHit 判断天气必中
    const isSureHit = isZMove || isMaxMove || accuracy === true || weatherGuaranteedHit;
    
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
    // 【Ambrosia】神之琼浆天气下 AVS 效果 x2
    if (defender.isAce && defender.avs && !isSureHit) {
        const baseInsight = defender.getEffectiveAVs('insight');
        // 【全局开关】AVS 关闭时 getEffectiveAVs 返回 0，跳过计算
        if (baseInsight > 0) {
            const effectiveInsight = defender.avsEvolutionBoost ? baseInsight * 2 : baseInsight;
            // 线性闪避加成：满值 10%（从 20% 下调），最低 1%
            let evasionBonus = Math.max(1, Math.floor((Math.min(effectiveInsight, 255) / 255) * 10));
            
            // 【Ambrosia 神之琼浆】AVS 效果 x2
            if (typeof window.WeatherEffects !== 'undefined' && window.WeatherEffects.getAVSMultiplier) {
                const avsMultiplier = window.WeatherEffects.getAVSMultiplier(weatherForAcc);
                if (avsMultiplier > 1) {
                    evasionBonus = Math.floor(evasionBonus * avsMultiplier);
                    console.log(`[AMBROSIA] 💫 神之琼浆：Insight 闪避加成 x${avsMultiplier}`);
                }
            }
            
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
    // 【关键】isSureHit 包含 weatherGuaranteedHit，天气必中招式跳过 miss 检测
    if (!isSureHit && !alwaysHit && !isNeverMiss) {
        if (Math.random() * 100 > hitRate) {
            // 【路痴保险 Blunder Policy】Miss后速度+2
            // 注意：这里只返回 miss 标记，实际触发在 battle-damage.js 中处理
            console.log(`[MISS] 命中率=${hitRate.toFixed(1)}%, 招式MISS`);
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
    
    // === 【奇迹空间 Wonder Room】防御和特防互换 ===
    if (battle && battle.field && battle.field.wonderRoom > 0) {
        defStat = isSpecial ? defender.getStat('def') : defender.getStat('spd');
        console.log(`[WONDER ROOM] 奇迹空间：防御和特防互换！使用 ${isSpecial ? 'def' : 'spd'} 作为防御`);
    }
    
    // === 【天气防御加成】使用 MoveEffects 模块 ===
    const weatherForDef = (typeof window !== 'undefined' && window.battle && window.battle.weather) || '';
    const defenderTypesForWeather = defender.types || [];
    if (weatherForDef && typeof MoveEffects !== 'undefined' && MoveEffects.getWeatherDefenseBoost) {
        const defResult = MoveEffects.getWeatherDefenseBoost(weatherForDef, defenderTypesForWeather, isSpecial);
        if (defResult.multiplier !== 1) {
            const oldDef = defStat;
            defStat = Math.floor(defStat * defResult.multiplier);
            console.log(`[WEATHER DEF] ${defResult.log} (${oldDef} -> ${defStat})`);
        }
    }
    
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
    
    // === 【环境图层系统】防御修正 ===
    if (typeof window !== 'undefined' && window.envOverlay) {
        const statKey = isSpecial ? 'spd' : 'def';
        const envDefMod = window.envOverlay.getStatMod(defender, statKey);
        if (envDefMod !== 1) {
            const oldDef = defStat;
            defStat = Math.floor(defStat * envDefMod);
            console.log(`[ENV OVERLAY] 防御修正: ${defender.cnName || defender.name} ${statKey} x${envDefMod} (${oldDef} -> ${defStat})`);
        }
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
    // 注意：moveType 已在天气威力修正处声明，此处直接使用
    let effectiveMoveType = move.type || fullMoveData.type || 'Normal';
    
    // === 【环境图层系统】类型转换 (ToType:Src>Dest) ===
    if (typeof window !== 'undefined' && window.envOverlay && window.envOverlay.getMoveTypeConversion) {
        const convertedType = window.envOverlay.getMoveTypeConversion(move);
        if (convertedType !== effectiveMoveType) {
            console.log(`[ENV OVERLAY] 🔄 技能类型转换: ${move.cn || move.name} ${effectiveMoveType} → ${convertedType}`);
            effectiveMoveType = convertedType;
        }
    }
    
    let effectiveness = getTypeEffectiveness(effectiveMoveType, defensiveTypes, move.name);
    
    // === 【环境图层系统】类型覆盖 (免疫/弱点) ===
    if (typeof window !== 'undefined' && window.envOverlay) {
        const typeOverrides = window.envOverlay.getTypeOverrides(defender);
        
        // 免疫覆盖：如果环境赋予免疫，effectiveness = 0
        if (typeOverrides.immuneTypes.includes(effectiveMoveType)) {
            console.log(`[ENV OVERLAY] 🛡️ 环境免疫: ${defender.cnName || defender.name} 免疫 ${effectiveMoveType}`);
            effectiveness = 0;
        }
        // 弱点追加：如果环境追加弱点，effectiveness x2
        else if (typeOverrides.weakTypes.includes(effectiveMoveType)) {
            const oldEff = effectiveness;
            effectiveness *= 2;
            console.log(`[ENV OVERLAY] ⚡ 环境弱点: ${defender.cnName || defender.name} 对 ${effectiveMoveType} 弱点 (${oldEff} -> ${effectiveness})`);
        }
    }
    
    // =========================================================
    // 【Delta Stream 德尔塔气流】飞行系克制伤害变为 1 倍
    // 电/冰/岩 对飞行系的效果绝佳 -> 强制变为 1 倍
    // =========================================================
    if (battle && battle.weather === 'deltastream') {
        const defenderTypes = defender.types || [];
        const isFlying = defenderTypes.includes('Flying');
        const isSuperEffectiveAgainstFlying = ['Electric', 'Ice', 'Rock'].includes(effectiveMoveType);
        
        if (isFlying && isSuperEffectiveAgainstFlying && effectiveness > 1) {
            // 计算飞行系被克制的倍率贡献
            // 例如：冰打龙飞 = 2(龙) * 2(飞) = 4，需要除以 2 变成 2
            // 例如：岩打飞 = 2(飞) = 2，需要除以 2 变成 1
            const flyingWeakness = ['Electric', 'Ice', 'Rock'].includes(effectiveMoveType) ? 2 : 1;
            const originalEffectiveness = effectiveness;
            effectiveness = effectiveness / flyingWeakness;
            console.log(`[DELTA STREAM] 🌪️ 德尔塔气流保护了飞行系！${effectiveMoveType} 克制倍率: ${originalEffectiveness} -> ${effectiveness}`);
        }
    }
    
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
            
            // 5. 【环境图层系统】暴击等级修正
            if (typeof window !== 'undefined' && window.envOverlay) {
                // 确保 move 对象包含完整的 flags 数据
                const moveWithFlags = { ...move, flags: move.flags || fullMoveData.flags || {} };
                const envCritBoost = window.envOverlay.getCritStage(attacker, moveWithFlags);
                if (envCritBoost !== 0) {
                    critStage += envCritBoost;
                    console.log(`[ENV OVERLAY] 暴击等级修正: +${envCritBoost}`);
                }
            }
            
            // 5.6 【Ambrosia 唯心实体化】全员暴击率 +1
            if (currentWeather && typeof window.WeatherEffects !== 'undefined' && window.WeatherEffects.getPsychicMindCritBoost) {
                const psychicMindBoost = window.WeatherEffects.getPsychicMindCritBoost(currentWeather);
                if (psychicMindBoost > 0) {
                    critStage += psychicMindBoost;
                    console.log(`[AMBROSIA] 🌸 唯心实体化：全员暴击等级 +${psychicMindBoost}`);
                }
            }
            
            // 6. 暴击等级上限为 3
            critStage = Math.min(3, critStage);
            
            // 7. 根据暴击等级计算概率
            // Stage 0: 1/24, 1: 1/8, 2: 1/2, 3+: 1/1
            const critRates = [1/24, 1/8, 1/2, 1];
            let critChance = critRates[critStage] || critRates[0];
            
            // 8. AVs: Passion 暴击加成（仅限 isAce 宝可梦，额外叠加）
            // 【Ambrosia】神之琼浆天气下 AVS 效果 x2
            if (attacker.isAce && attacker.avs) {
                const basePassion = attacker.getEffectiveAVs('passion');
                if (basePassion > 0) {
                    const effectivePassion = attacker.avsEvolutionBoost ? basePassion * 2 : basePassion;
                    let passionBonus = (Math.min(effectivePassion, 255) / 255) * 0.20;
                    
                    // 【Ambrosia 神之琼浆】AVS 效果 x2
                    if (typeof window.WeatherEffects !== 'undefined' && window.WeatherEffects.getAVSMultiplier) {
                        const avsMultiplier = window.WeatherEffects.getAVSMultiplier(currentWeather);
                        if (avsMultiplier > 1) {
                            passionBonus *= avsMultiplier;
                            console.log(`[AMBROSIA] 💫 神之琼浆：Passion 暴击加成 x${avsMultiplier}`);
                        }
                    }
                    
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
    
    // === 【环境图层系统】伤害修正 ===
    if (typeof window !== 'undefined' && window.envOverlay) {
        // 确保 move 对象包含完整的 flags 数据（用于 Flag:Pulse 等选择器）
        const moveWithFlags = { ...move, flags: move.flags || fullMoveData.flags || {} };
        const envDmgMod = window.envOverlay.getDamageMod(attacker, defender, moveWithFlags);
        if (envDmgMod !== 1) {
            const oldDmg = singleHitDamage;
            singleHitDamage = Math.floor(singleHitDamage * envDmgMod);
            console.log(`[ENV OVERLAY] 🌍 伤害修正: ${oldDmg} × ${envDmgMod} = ${singleHitDamage}`);
        }
    }
    
    // === 防御方特性伤害修正 ===
    // 【重要】传递 isSimulation 标记，避免 AI 模拟时触发形态变化等副作用
    let defenderAbilityLog = null;
    if (!ignoresAbilities && typeof AbilityHandlers !== 'undefined' && defender.ability && AbilityHandlers[defender.ability]) {
        const ahDef = AbilityHandlers[defender.ability];
        if (ahDef.onDefenderModifyDamage) {
            const originalDamage = singleHitDamage;
            const result = ahDef.onDefenderModifyDamage(singleHitDamage, attacker, defender, move, effectiveness, options.isSimulation);
            // 支持返回对象 { damage, log } 或直接返回数字
            if (typeof result === 'object' && result !== null) {
                singleHitDamage = result.damage;
                defenderAbilityLog = result.log || null;
            } else {
                singleHitDamage = result;
            }
            // 【干燥皮肤等特性】如果伤害增加且没有自定义日志，生成默认日志
            if (!options.isSimulation && singleHitDamage > originalDamage && !defenderAbilityLog) {
                const abilityName = defender.ability;
                if (abilityName === 'Dry Skin' && move.type === 'Fire') {
                    defenderAbilityLog = `🔥 ${defender.cnName} 的干燥皮肤让火系伤害增加了!`;
                }
            }
        }
    }
    
    // === 【Chronal Rift 异兽气场】Ultra Beast 伤害减免 ===
    let beastAuraLog = null;
    if (typeof window.WeatherEffects !== 'undefined' && window.WeatherEffects.checkBeastAura) {
        const weather = (typeof battle !== 'undefined' && battle) ? (battle.weather || battle.environmentWeather || '') : '';
        const auraResult = window.WeatherEffects.checkBeastAura(weather, defender, attacker);
        if (auraResult.hasAura) {
            singleHitDamage = Math.floor(singleHitDamage * auraResult.damageMultiplier);
            beastAuraLog = auraResult.message;
            console.log(`[CHRONAL RIFT] 🛡️ 异兽气场：伤害 ${singleHitDamage}`);
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
    
    // 【半无敌状态双倍伤害】地震对挖洞、冲浪对潜水等
    if (move._invulnDoubleDamage) {
        totalDamage = totalDamage * 2;
        console.log(`[INVULN] 双倍伤害生效: ${totalDamage / 2} × 2 = ${totalDamage}`);
        delete move._invulnDoubleDamage; // 清除标记
    }
    
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
        commandCritTriggered,
        defenderAbilityLog,
        moveGlitchLog    // Chronal Rift 技能黑箱日志
    };
}

// ============================================
// 导出到全局
// ============================================

if (typeof window !== 'undefined') {
    window.calcDamage = calcDamage;
}
