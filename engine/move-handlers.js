/**
 * =============================================
 * MOVE HANDLERS - 技能处理器 (策略模式)
 * =============================================
 * 
 * 本文件使用策略模式处理特殊技能逻辑，
 * 避免在 battle-engine.js 中堆积大量 if-else。
 * 
 * 每个技能可以注册以下钩子：
 * - basePowerCallback: 动态计算威力
 * - damageCallback: 完全自定义伤害计算
 * - onHit: 命中后的额外效果
 * - onMiss: 未命中时的效果
 * - onUse: 使用时的效果（蓄力等）
 * - modifyAtk: 修改攻击力计算
 * - modifyDef: 修改防御力计算
 */

const MoveHandlers = {
    
    // ============================================
    // 1. 固定伤害技能 (Fixed Damage Moves)
    // ============================================
    
    'Night Shade': {
        damageCallback: (attacker, defender) => {
            return attacker.level;
        },
        description: '造成等于使用者等级的固定伤害'
    },
    
    'Seismic Toss': {
        damageCallback: (attacker, defender) => {
            return attacker.level;
        },
        description: '造成等于使用者等级的固定伤害'
    },
    
    'Psywave': {
        damageCallback: (attacker, defender) => {
            // 伤害 = 等级 × (0.5 ~ 1.5) 随机
            const multiplier = 0.5 + Math.random();
            return Math.floor(attacker.level * multiplier);
        },
        description: '造成等级相关的随机伤害'
    },
    
    'Dragon Rage': {
        damageCallback: (attacker, defender) => {
            return 40; // 固定 40 点伤害
        },
        description: '固定造成 40 点伤害'
    },
    
    'Sonic Boom': {
        damageCallback: (attacker, defender) => {
            return 20; // 固定 20 点伤害
        },
        description: '固定造成 20 点伤害'
    },
    
    'Super Fang': {
        damageCallback: (attacker, defender) => {
            return Math.max(1, Math.floor(defender.currHp / 2));
        },
        description: '造成目标当前 HP 一半的伤害'
    },
    
    'Nature\'s Madness': {
        damageCallback: (attacker, defender) => {
            return Math.max(1, Math.floor(defender.currHp / 2));
        },
        description: '造成目标当前 HP 一半的伤害'
    },
    
    'Guardian of Alola': {
        damageCallback: (attacker, defender) => {
            return Math.max(1, Math.floor(defender.currHp * 0.75));
        },
        description: '造成目标当前 HP 75% 的伤害'
    },
    
    // ============================================
    // 2. 动态威力技能 (Dynamic Power Moves)
    // ============================================
    
    'Gyro Ball': {
        basePowerCallback: (attacker, defender) => {
            // 威力 = 25 × (目标速度 / 自己速度) + 1，最高 150
            const userSpeed = Math.max(1, attacker.getStat('spe'));
            const targetSpeed = Math.max(1, defender.getStat('spe'));
            const power = Math.floor(25 * targetSpeed / userSpeed) + 1;
            return Math.min(150, power);
        },
        description: '速度越慢威力越高'
    },
    
    'Electro Ball': {
        basePowerCallback: (attacker, defender) => {
            // 威力根据速度比值
            const userSpeed = Math.max(1, attacker.getStat('spe'));
            const targetSpeed = Math.max(1, defender.getStat('spe'));
            const ratio = userSpeed / targetSpeed;
            if (ratio >= 4) return 150;
            if (ratio >= 3) return 120;
            if (ratio >= 2) return 80;
            if (ratio >= 1) return 60;
            return 40;
        },
        description: '速度越快威力越高'
    },
    
    'Grass Knot': {
        basePowerCallback: (attacker, defender) => {
            // 根据目标体重（简化：用 HP 基础值模拟）
            const weight = defender.maxHp; // 简化处理
            if (weight >= 200) return 120;
            if (weight >= 150) return 100;
            if (weight >= 100) return 80;
            if (weight >= 50) return 60;
            if (weight >= 25) return 40;
            return 20;
        },
        description: '目标越重威力越高'
    },
    
    'Low Kick': {
        basePowerCallback: (attacker, defender) => {
            const weight = defender.maxHp;
            if (weight >= 200) return 120;
            if (weight >= 150) return 100;
            if (weight >= 100) return 80;
            if (weight >= 50) return 60;
            if (weight >= 25) return 40;
            return 20;
        },
        description: '目标越重威力越高'
    },
    
    'Heavy Slam': {
        basePowerCallback: (attacker, defender) => {
            // 根据体重比
            const userWeight = attacker.maxHp;
            const targetWeight = Math.max(1, defender.maxHp);
            const ratio = userWeight / targetWeight;
            if (ratio >= 5) return 120;
            if (ratio >= 4) return 100;
            if (ratio >= 3) return 80;
            if (ratio >= 2) return 60;
            return 40;
        },
        description: '自己越重威力越高'
    },
    
    'Heat Crash': {
        basePowerCallback: (attacker, defender) => {
            const userWeight = attacker.maxHp;
            const targetWeight = Math.max(1, defender.maxHp);
            const ratio = userWeight / targetWeight;
            if (ratio >= 5) return 120;
            if (ratio >= 4) return 100;
            if (ratio >= 3) return 80;
            if (ratio >= 2) return 60;
            return 40;
        },
        description: '自己越重威力越高'
    },
    
    'Stored Power': {
        basePowerCallback: (attacker, defender) => {
            // 威力 = 20 + 20 × 能力提升总等级
            let totalBoosts = 0;
            for (const stat of ['atk', 'def', 'spa', 'spd', 'spe']) {
                if (attacker.boosts[stat] > 0) {
                    totalBoosts += attacker.boosts[stat];
                }
            }
            return 20 + 20 * totalBoosts;
        },
        description: '能力提升越多威力越高'
    },
    
    'Power Trip': {
        basePowerCallback: (attacker, defender) => {
            let totalBoosts = 0;
            for (const stat of ['atk', 'def', 'spa', 'spd', 'spe']) {
                if (attacker.boosts[stat] > 0) {
                    totalBoosts += attacker.boosts[stat];
                }
            }
            return 20 + 20 * totalBoosts;
        },
        description: '能力提升越多威力越高'
    },
    
    'Punishment': {
        basePowerCallback: (attacker, defender) => {
            // 威力 = 60 + 20 × 目标能力提升总等级，最高 200
            let totalBoosts = 0;
            for (const stat of ['atk', 'def', 'spa', 'spd', 'spe']) {
                if (defender.boosts[stat] > 0) {
                    totalBoosts += defender.boosts[stat];
                }
            }
            return Math.min(200, 60 + 20 * totalBoosts);
        },
        description: '目标能力提升越多威力越高'
    },
    
    'Reversal': {
        basePowerCallback: (attacker, defender) => {
            // 威力根据剩余 HP 百分比
            const hpPercent = attacker.currHp / attacker.maxHp;
            if (hpPercent <= 0.0417) return 200;
            if (hpPercent <= 0.1042) return 150;
            if (hpPercent <= 0.2083) return 100;
            if (hpPercent <= 0.3542) return 80;
            if (hpPercent <= 0.6875) return 40;
            return 20;
        },
        description: 'HP 越低威力越高'
    },
    
    'Flail': {
        basePowerCallback: (attacker, defender) => {
            const hpPercent = attacker.currHp / attacker.maxHp;
            if (hpPercent <= 0.0417) return 200;
            if (hpPercent <= 0.1042) return 150;
            if (hpPercent <= 0.2083) return 100;
            if (hpPercent <= 0.3542) return 80;
            if (hpPercent <= 0.6875) return 40;
            return 20;
        },
        description: 'HP 越低威力越高'
    },
    
    'Eruption': {
        basePowerCallback: (attacker, defender) => {
            // 威力 = 150 × (当前HP / 最大HP)
            return Math.max(1, Math.floor(150 * attacker.currHp / attacker.maxHp));
        },
        description: 'HP 越高威力越高'
    },
    
    'Water Spout': {
        basePowerCallback: (attacker, defender) => {
            return Math.max(1, Math.floor(150 * attacker.currHp / attacker.maxHp));
        },
        description: 'HP 越高威力越高'
    },
    
    'Crush Grip': {
        basePowerCallback: (attacker, defender) => {
            // 威力 = 120 × (目标当前HP / 目标最大HP)
            return Math.max(1, Math.floor(120 * defender.currHp / defender.maxHp));
        },
        description: '目标 HP 越高威力越高'
    },
    
    'Wring Out': {
        basePowerCallback: (attacker, defender) => {
            return Math.max(1, Math.floor(120 * defender.currHp / defender.maxHp));
        },
        description: '目标 HP 越高威力越高'
    },
    
    // ============================================
    // 3. 特殊攻防计算 (Modified Stat Moves)
    // ============================================
    
    'Foul Play': {
        modifyAtk: (attacker, defender, isSpecial) => {
            // 使用目标的攻击力
            return defender.getStat('atk');
        },
        description: '使用目标的攻击力计算伤害'
    },
    
    'Body Press': {
        modifyAtk: (attacker, defender, isSpecial) => {
            // 使用自己的防御力代替攻击力
            return attacker.getStat('def');
        },
        description: '使用自己的防御力计算伤害'
    },
    
    'Psyshock': {
        modifyDef: (attacker, defender, isSpecial) => {
            // 特殊攻击但打物防
            return defender.getStat('def');
        },
        description: '特殊攻击但计算物理防御'
    },
    
    'Psystrike': {
        modifyDef: (attacker, defender, isSpecial) => {
            return defender.getStat('def');
        },
        description: '特殊攻击但计算物理防御'
    },
    
    'Secret Sword': {
        modifyDef: (attacker, defender, isSpecial) => {
            return defender.getStat('def');
        },
        description: '特殊攻击但计算物理防御'
    },
    
    // ============================================
    // 4. 换人技能 (Pivot Moves) - 仅日志输出
    // ============================================
    
    'U-turn': {
        onHit: (attacker, defender, damage, logs) => {
            // 关键修复：只有造成伤害时才触发换人（免疫/未命中不触发）
            if (damage <= 0) {
                return { pivot: false };
            }
            // 日志移到 index.js 的换人逻辑中，避免误导
            return { pivot: true };
        },
        description: '攻击后可以换人（免疫时不触发）'
    },
    
    'Volt Switch': {
        onHit: (attacker, defender, damage, logs) => {
            // 关键修复：只有造成伤害时才触发换人（地面系免疫电系）
            if (damage <= 0) {
                return { pivot: false };
            }
            // 日志移到 index.js 的换人逻辑中，避免误导
            return { pivot: true };
        },
        description: '攻击后可以换人（免疫时不触发）'
    },
    
    'Flip Turn': {
        onHit: (attacker, defender, damage, logs) => {
            // 关键修复：只有造成伤害时才触发换人
            if (damage <= 0) {
                return { pivot: false };
            }
            // 日志移到 index.js 的换人逻辑中，避免误导
            return { pivot: true };
        },
        description: '攻击后可以换人（免疫时不触发）'
    },
    
    'Parting Shot': {
        onHit: (attacker, defender, damage, logs) => {
            // Parting Shot 是变化技，只要成功使用就触发（除非被挑衅等阻止）
            logs.push(`${attacker.cnName} 留下狠话后撤退了!`);
            return { pivot: true };
        },
        description: '降低对手能力后换人'
    },
    
    'Fake Out': {
        onUse: (attacker, defender, logs) => {
            // 关键修复：Fake Out 只能在上场第一回合使用
            console.log(`[Fake Out] ${attacker.cnName} turnsOnField: ${attacker.turnsOnField}`);
            if (attacker.turnsOnField > 0) {
                logs.push(`但是失败了!`);
                return { failed: true };
            }
            return {};
        },
        onHit: (attacker, defender, damage, logs) => {
            // 100% 畏缩效果
            if (damage > 0 && defender.volatile) {
                defender.volatile.flinch = true;
                logs.push(`${defender.cnName} 畏缩了!`);
            }
            return {};
        },
        description: '先制技，仅在上场第一回合有效，100%畏缩'
    },
    
    'First Impression': {
        onUse: (attacker, defender, logs) => {
            // First Impression 只能在上场第一回合使用
            console.log(`[First Impression] ${attacker.cnName} turnsOnField: ${attacker.turnsOnField}`);
            if (attacker.turnsOnField > 0) {
                logs.push(`但是失败了!`);
                return { failed: true };
            }
            return {};
        },
        description: '虫系先制大招，仅在上场第一回合有效'
    },
    
    'Mat Block': {
        onUse: (attacker, defender, logs) => {
            // Mat Block 只能在上场第一回合使用
            console.log(`[Mat Block] ${attacker.cnName} turnsOnField: ${attacker.turnsOnField}`);
            if (attacker.turnsOnField > 0) {
                logs.push(`但是失败了!`);
                return { failed: true };
            }
            logs.push(`${attacker.cnName} 掀起了榻榻米进行防御!`);
            if (attacker.volatile) attacker.volatile.protect = true;
            return {};
        },
        description: '仅在上场第一回合有效，防御物理和特殊攻击'
    },
    
    // ============================================
    // 守住类技能 (Protect Family) - 连续使用惩罚
    // ============================================
    
    'Protect': {
        onUse: (attacker, defender, logs) => {
            // 连续使用成功率衰减：1 -> 1/3 -> 1/9 -> ...
            const counter = attacker.protectCounter || 0;
            if (counter > 0) {
                const successChance = Math.pow(1/3, counter);
                if (Math.random() > successChance) {
                    logs.push(`但是失败了! (连续使用守住成功率降低)`);
                    return { failed: true };
                }
            }
            // 成功使用
            attacker.protectCounter = counter + 1;
            logs.push(`${attacker.cnName} 守住了自己!`);
            if (attacker.volatile) attacker.volatile.protect = true;
            return {};
        },
        description: '守住所有攻击，连续使用成功率降低'
    },
    
    'Detect': {
        onUse: (attacker, defender, logs) => {
            // 与 Protect 共享计数器
            const counter = attacker.protectCounter || 0;
            if (counter > 0) {
                const successChance = Math.pow(1/3, counter);
                if (Math.random() > successChance) {
                    logs.push(`但是失败了! (连续使用见切成功率降低)`);
                    return { failed: true };
                }
            }
            attacker.protectCounter = counter + 1;
            logs.push(`${attacker.cnName} 使用了见切!`);
            if (attacker.volatile) attacker.volatile.protect = true;
            return {};
        },
        description: '与守住效果相同，共享连续使用计数器'
    },
    
    'King\'s Shield': {
        onUse: (attacker, defender, logs) => {
            const counter = attacker.protectCounter || 0;
            if (counter > 0) {
                const successChance = Math.pow(1/3, counter);
                if (Math.random() > successChance) {
                    logs.push(`但是失败了!`);
                    return { failed: true };
                }
            }
            attacker.protectCounter = counter + 1;
            logs.push(`${attacker.cnName} 使用了王者盾牌!`);
            if (attacker.volatile) {
                attacker.volatile.protect = true;
                attacker.volatile.kingsShield = true; // 接触攻击降攻
            }
            return {};
        },
        description: '守住并降低接触攻击者的攻击'
    },
    
    'Spiky Shield': {
        onUse: (attacker, defender, logs) => {
            const counter = attacker.protectCounter || 0;
            if (counter > 0) {
                const successChance = Math.pow(1/3, counter);
                if (Math.random() > successChance) {
                    logs.push(`但是失败了!`);
                    return { failed: true };
                }
            }
            attacker.protectCounter = counter + 1;
            logs.push(`${attacker.cnName} 使用了尖刺防守!`);
            if (attacker.volatile) {
                attacker.volatile.protect = true;
                attacker.volatile.spikyShield = true; // 接触攻击反伤
            }
            return {};
        },
        description: '守住并对接触攻击者造成伤害'
    },
    
    'Baneful Bunker': {
        onUse: (attacker, defender, logs) => {
            const counter = attacker.protectCounter || 0;
            if (counter > 0) {
                const successChance = Math.pow(1/3, counter);
                if (Math.random() > successChance) {
                    logs.push(`但是失败了!`);
                    return { failed: true };
                }
            }
            attacker.protectCounter = counter + 1;
            logs.push(`${attacker.cnName} 躲进了碉堡!`);
            if (attacker.volatile) {
                attacker.volatile.protect = true;
                attacker.volatile.banefulBunker = true; // 接触攻击中毒
            }
            return {};
        },
        description: '守住并使接触攻击者中毒'
    },
    
    'Obstruct': {
        onUse: (attacker, defender, logs) => {
            const counter = attacker.protectCounter || 0;
            if (counter > 0) {
                const successChance = Math.pow(1/3, counter);
                if (Math.random() > successChance) {
                    logs.push(`但是失败了!`);
                    return { failed: true };
                }
            }
            attacker.protectCounter = counter + 1;
            logs.push(`${attacker.cnName} 使用了拦堵!`);
            if (attacker.volatile) {
                attacker.volatile.protect = true;
                attacker.volatile.obstruct = true; // 接触攻击降防
            }
            return {};
        },
        description: '守住并降低接触攻击者的防御'
    },
    
    'Silk Trap': {
        onUse: (attacker, defender, logs) => {
            const counter = attacker.protectCounter || 0;
            if (counter > 0) {
                const successChance = Math.pow(1/3, counter);
                if (Math.random() > successChance) {
                    logs.push(`但是失败了!`);
                    return { failed: true };
                }
            }
            attacker.protectCounter = counter + 1;
            logs.push(`${attacker.cnName} 使用了线阱!`);
            if (attacker.volatile) {
                attacker.volatile.protect = true;
                attacker.volatile.silkTrap = true; // 接触攻击降速
            }
            return {};
        },
        description: '守住并降低接触攻击者的速度'
    },
    
    'Endure': {
        onUse: (attacker, defender, logs) => {
            // 挺住：与守住共享计数器
            const counter = attacker.protectCounter || 0;
            if (counter > 0) {
                const successChance = Math.pow(1/3, counter);
                if (Math.random() > successChance) {
                    logs.push(`但是失败了!`);
                    return { failed: true };
                }
            }
            attacker.protectCounter = counter + 1;
            logs.push(`${attacker.cnName} 摆出了挺住的架势!`);
            if (attacker.volatile) attacker.volatile.endure = true;
            return {};
        },
        description: '本回合至少保留1HP，与守住共享计数器'
    },
    
    'Destiny Bond': {
        onUse: (attacker, defender, logs) => {
            // Gen 7+：连续使用必失败
            if (attacker.lastMoveUsed === 'Destiny Bond') {
                logs.push(`但是失败了! (同命不能连续使用)`);
                return { failed: true };
            }
            logs.push(`${attacker.cnName} 想要和对手同归于尽!`);
            if (attacker.volatile) attacker.volatile.destinyBond = true;
            return {};
        },
        description: '本回合被击倒时对手也会倒下，不能连续使用'
    },
    
    // ============================================
    // 僵直类技能 (Recharge Moves)
    // ============================================
    
    'Hyper Beam': {
        onUse: (attacker, defender, logs) => {
            if (attacker.mustRecharge) {
                logs.push(`${attacker.cnName} 因为上回合的反作用力无法动弹!`);
                attacker.mustRecharge = false;
                return { failed: true };
            }
            return {};
        },
        onHit: (attacker, defender, damage, logs) => {
            if (damage > 0) {
                attacker.mustRecharge = true;
                logs.push(`${attacker.cnName} 下回合需要休息!`);
            }
            return {};
        },
        description: '强力攻击，命中后下回合无法行动'
    },
    
    'Giga Impact': {
        onUse: (attacker, defender, logs) => {
            if (attacker.mustRecharge) {
                logs.push(`${attacker.cnName} 因为上回合的反作用力无法动弹!`);
                attacker.mustRecharge = false;
                return { failed: true };
            }
            return {};
        },
        onHit: (attacker, defender, damage, logs) => {
            if (damage > 0) {
                attacker.mustRecharge = true;
                logs.push(`${attacker.cnName} 下回合需要休息!`);
            }
            return {};
        },
        description: '强力物理攻击，命中后下回合无法行动'
    },
    
    'Frenzy Plant': {
        onUse: (attacker, defender, logs) => {
            if (attacker.mustRecharge) {
                logs.push(`${attacker.cnName} 因为上回合的反作用力无法动弹!`);
                attacker.mustRecharge = false;
                return { failed: true };
            }
            return {};
        },
        onHit: (attacker, defender, damage, logs) => {
            if (damage > 0) {
                attacker.mustRecharge = true;
                logs.push(`${attacker.cnName} 下回合需要休息!`);
            }
            return {};
        },
        description: '草系究极技，命中后下回合无法行动'
    },
    
    'Blast Burn': {
        onUse: (attacker, defender, logs) => {
            if (attacker.mustRecharge) {
                logs.push(`${attacker.cnName} 因为上回合的反作用力无法动弹!`);
                attacker.mustRecharge = false;
                return { failed: true };
            }
            return {};
        },
        onHit: (attacker, defender, damage, logs) => {
            if (damage > 0) {
                attacker.mustRecharge = true;
                logs.push(`${attacker.cnName} 下回合需要休息!`);
            }
            return {};
        },
        description: '火系究极技，命中后下回合无法行动'
    },
    
    'Hydro Cannon': {
        onUse: (attacker, defender, logs) => {
            if (attacker.mustRecharge) {
                logs.push(`${attacker.cnName} 因为上回合的反作用力无法动弹!`);
                attacker.mustRecharge = false;
                return { failed: true };
            }
            return {};
        },
        onHit: (attacker, defender, damage, logs) => {
            if (damage > 0) {
                attacker.mustRecharge = true;
                logs.push(`${attacker.cnName} 下回合需要休息!`);
            }
            return {};
        },
        description: '水系究极技，命中后下回合无法行动'
    },
    
    'Prismatic Laser': {
        onUse: (attacker, defender, logs) => {
            if (attacker.mustRecharge) {
                logs.push(`${attacker.cnName} 因为上回合的反作用力无法动弹!`);
                attacker.mustRecharge = false;
                return { failed: true };
            }
            return {};
        },
        onHit: (attacker, defender, damage, logs) => {
            if (damage > 0) {
                attacker.mustRecharge = true;
                logs.push(`${attacker.cnName} 下回合需要休息!`);
            }
            return {};
        },
        description: '超能力系大招，命中后下回合无法行动'
    },
    
    'Meteor Assault': {
        onUse: (attacker, defender, logs) => {
            if (attacker.mustRecharge) {
                logs.push(`${attacker.cnName} 因为上回合的反作用力无法动弹!`);
                attacker.mustRecharge = false;
                return { failed: true };
            }
            return {};
        },
        onHit: (attacker, defender, damage, logs) => {
            if (damage > 0) {
                attacker.mustRecharge = true;
                logs.push(`${attacker.cnName} 下回合需要休息!`);
            }
            return {};
        },
        description: '格斗系大招，命中后下回合无法行动'
    },
    
    'Eternabeam': {
        onUse: (attacker, defender, logs) => {
            if (attacker.mustRecharge) {
                logs.push(`${attacker.cnName} 因为上回合的反作用力无法动弹!`);
                attacker.mustRecharge = false;
                return { failed: true };
            }
            return {};
        },
        onHit: (attacker, defender, damage, logs) => {
            if (damage > 0) {
                attacker.mustRecharge = true;
                logs.push(`${attacker.cnName} 下回合需要休息!`);
            }
            return {};
        },
        description: '龙系究极技，命中后下回合无法行动'
    },
    
    'Baton Pass': {
        onUse: (attacker, defender, logs) => {
            logs.push(`${attacker.cnName} 使用了接力棒!`);
            return { pivot: true, passBoosts: true };
        },
        description: '换人并传递能力变化'
    },
    
    'Teleport': {
        onUse: (attacker, defender, logs) => {
            logs.push(`${attacker.cnName} 使用瞬间移动撤退了!`);
            return { pivot: true };
        },
        description: '撤退换人'
    },
    
    // ============================================
    // 5. 强制换人技能 (Phazing Moves)
    // ============================================
    
    'Roar': {
        onHit: (attacker, defender, damage, logs) => {
            logs.push(`${defender.cnName} 被吓跑了!`);
            return { phaze: true };
        },
        description: '强制对手换人'
    },
    
    'Whirlwind': {
        onHit: (attacker, defender, damage, logs) => {
            logs.push(`${defender.cnName} 被吹走了!`);
            return { phaze: true };
        },
        description: '强制对手换人'
    },
    
    'Dragon Tail': {
        onHit: (attacker, defender, damage, logs) => {
            logs.push(`${defender.cnName} 被甩飞了!`);
            return { phaze: true };
        },
        description: '造成伤害并强制换人'
    },
    
    'Circle Throw': {
        onHit: (attacker, defender, damage, logs) => {
            logs.push(`${defender.cnName} 被摔出去了!`);
            return { phaze: true };
        },
        description: '造成伤害并强制换人'
    },
    
    // ============================================
    // 6. 天气技能 (Weather Moves)
    // ============================================
    
    'Rain Dance': {
        onUse: (attacker, defender, logs, battle) => {
            if (battle) battle.weather = 'rain';
            logs.push('天空下起了大雨!');
            logs.push('<span style="color:#3498db">水系技能威力提升，火系技能威力下降!</span>');
            return { weather: 'rain' };
        },
        description: '召唤雨天'
    },
    
    'Sunny Day': {
        onUse: (attacker, defender, logs, battle) => {
            if (battle) battle.weather = 'sun';
            logs.push('阳光变得强烈了!');
            logs.push('<span style="color:#e67e22">火系技能威力提升，水系技能威力下降!</span>');
            return { weather: 'sun' };
        },
        description: '召唤晴天'
    },
    
    'Sandstorm': {
        onUse: (attacker, defender, logs, battle) => {
            if (battle) battle.weather = 'sand';
            logs.push('沙暴刮起来了!');
            logs.push('<span style="color:#d4ac0d">岩石系特防提升，非岩/地/钢系每回合受伤!</span>');
            return { weather: 'sand' };
        },
        description: '召唤沙暴'
    },
    
    'Hail': {
        onUse: (attacker, defender, logs, battle) => {
            if (battle) battle.weather = 'hail';
            logs.push('开始下冰雹了!');
            logs.push('<span style="color:#5dade2">非冰系每回合受伤!</span>');
            return { weather: 'hail' };
        },
        description: '召唤冰雹'
    },
    
    'Snowscape': {
        onUse: (attacker, defender, logs, battle) => {
            if (battle) battle.weather = 'snow';
            logs.push('下起了雪!');
            logs.push('<span style="color:#85c1e9">冰系防御提升!</span>');
            return { weather: 'snow' };
        },
        description: '召唤雪天'
    },
    
    // ============================================
    // 7. 场地技能 (Terrain/Hazard Moves) - 简化版
    // ============================================
    
    'Stealth Rock': {
        onUse: (attacker, defender, logs, battle) => {
            logs.push('尖锐的岩石漂浮在对方场地周围!');
            if (battle) {
                battle.hazards = battle.hazards || {};
                battle.hazards.stealthRock = true;
            }
            return { hazard: 'stealthRock' };
        },
        description: '设置隐形岩'
    },
    
    'Spikes': {
        onUse: (attacker, defender, logs, battle) => {
            logs.push('撒菱散布在对方场地上!');
            if (battle) {
                battle.hazards = battle.hazards || {};
                battle.hazards.spikes = (battle.hazards.spikes || 0) + 1;
            }
            return { hazard: 'spikes' };
        },
        description: '设置撒菱'
    },
    
    'Toxic Spikes': {
        onUse: (attacker, defender, logs, battle) => {
            logs.push('毒菱散布在对方场地上!');
            if (battle) {
                battle.hazards = battle.hazards || {};
                battle.hazards.toxicSpikes = (battle.hazards.toxicSpikes || 0) + 1;
            }
            return { hazard: 'toxicSpikes' };
        },
        description: '设置毒菱'
    },
    
    'Sticky Web': {
        onUse: (attacker, defender, logs, battle) => {
            logs.push('黏黏网铺设在对方场地上!');
            if (battle) {
                battle.hazards = battle.hazards || {};
                battle.hazards.stickyWeb = true;
            }
            return { hazard: 'stickyWeb' };
        },
        description: '设置黏黏网'
    },
    
    'Rapid Spin': {
        onHit: (attacker, defender, damage, logs, battle) => {
            logs.push(`${attacker.cnName} 急速旋转，扫除了场上的障碍!`);
            if (battle && battle.hazards) {
                battle.hazards = {};
            }
            // 清除自身的束缚状态
            if (attacker.volatile) {
                delete attacker.volatile.partiallytrapped;
                delete attacker.volatile.leechseed;
            }
            return { clearHazards: true };
        },
        description: '清除己方场地障碍'
    },
    
    'Defog': {
        onHit: (attacker, defender, damage, logs, battle) => {
            logs.push('场地上的障碍物被吹散了!');
            if (battle) {
                battle.hazards = {};
            }
            return { clearHazards: true };
        },
        description: '清除双方场地障碍'
    },
    
    // ============================================
    // 8. 蓄力技能 (Two-Turn Moves) - 简化为单回合
    // ============================================
    
    'Solar Beam': {
        onUse: (attacker, defender, logs, battle) => {
            // 简化：直接发射，不需要蓄力
            if (battle && battle.weather === 'sun') {
                logs.push(`${attacker.cnName} 借助强烈的阳光，瞬间发射了日光束!`);
            } else {
                logs.push(`${attacker.cnName} 迅速聚集能量发射了日光束!`);
            }
            return { skipCharge: true };
        },
        description: '晴天下无需蓄力'
    },
    
    'Solar Blade': {
        onUse: (attacker, defender, logs, battle) => {
            if (battle && battle.weather === 'sun') {
                logs.push(`${attacker.cnName} 借助阳光的力量挥出了日光刃!`);
            } else {
                logs.push(`${attacker.cnName} 聚集光芒挥出了日光刃!`);
            }
            return { skipCharge: true };
        },
        description: '晴天下无需蓄力'
    },
    
    'Hyper Beam': {
        onHit: (attacker, defender, damage, logs) => {
            logs.push(`<span style="color:#e74c3c">${attacker.cnName} 需要休息恢复!</span>`);
            // 简化：不实际跳过回合，只是提示
            return { recharge: true };
        },
        description: '使用后需要休息'
    },
    
    'Giga Impact': {
        onHit: (attacker, defender, damage, logs) => {
            logs.push(`<span style="color:#e74c3c">${attacker.cnName} 需要休息恢复!</span>`);
            return { recharge: true };
        },
        description: '使用后需要休息'
    },
    
    // ============================================
    // 9. 其他特殊技能
    // ============================================
    
    'Explosion': {
        onUse: (attacker, defender, logs) => {
            logs.push(`${attacker.cnName} 引爆了自己!`);
            // 自爆：使用者倒下
            attacker.currHp = 0;
            return { selfDestruct: true };
        },
        description: '使用者倒下'
    },
    
    'Self-Destruct': {
        onUse: (attacker, defender, logs) => {
            logs.push(`${attacker.cnName} 自爆了!`);
            attacker.currHp = 0;
            return { selfDestruct: true };
        },
        description: '使用者倒下'
    },
    
    'Final Gambit': {
        damageCallback: (attacker, defender) => {
            const damage = attacker.currHp;
            attacker.currHp = 0; // 使用者倒下
            return damage;
        },
        description: '造成等于自身剩余 HP 的伤害，使用者倒下'
    },
    
    'Endeavor': {
        damageCallback: (attacker, defender) => {
            // 将目标 HP 降到与自己相同
            if (defender.currHp > attacker.currHp) {
                return defender.currHp - attacker.currHp;
            }
            return 0;
        },
        description: '将目标 HP 降到与自己相同'
    },
    
    'Pain Split': {
        onUse: (attacker, defender, logs) => {
            const avgHp = Math.floor((attacker.currHp + defender.currHp) / 2);
            attacker.currHp = Math.min(avgHp, attacker.maxHp);
            defender.currHp = Math.min(avgHp, defender.maxHp);
            logs.push(`${attacker.cnName} 和 ${defender.cnName} 平分了痛苦!`);
            return { hpShared: true };
        },
        description: '平分双方 HP'
    },
    
    'Destiny Bond': {
        onUse: (attacker, defender, logs) => {
            attacker.volatile = attacker.volatile || {};
            attacker.volatile.destinyBond = true;
            logs.push(`${attacker.cnName} 想要同归于尽!`);
            return { destinyBond: true };
        },
        description: '如果倒下则带走对手'
    },
    
    'Perish Song': {
        onUse: (attacker, defender, logs) => {
            logs.push('灭亡之歌响起了! 3 回合后场上的宝可梦都会倒下!');
            // 简化：只是提示，不实际实现计数器
            return { perishSong: true };
        },
        description: '3 回合后双方倒下'
    },
    
    'Metronome': {
        onUse: (attacker, defender, logs) => {
            // 简化：随机选择一个常见攻击技能
            const randomMoves = ['Flamethrower', 'Thunderbolt', 'Ice Beam', 'Psychic', 
                                'Shadow Ball', 'Energy Ball', 'Earthquake', 'Surf'];
            const chosen = randomMoves[Math.floor(Math.random() * randomMoves.length)];
            logs.push(`${attacker.cnName} 挥动手指... 使出了 ${chosen}!`);
            return { metronome: chosen };
        },
        description: '随机使用一个技能'
    },
    
    // ============================================
    // 10. 属性变化类技能 (Type Changing Moves)
    // ============================================
    
    // 【纹理】：变成自己第一招的属性
    'Conversion': {
        onUse: (attacker, defender, logs) => {
            // 获取第一招
            const firstMove = attacker.moves[0];
            if (!firstMove) return;

            const targetType = firstMove.type;
            
            // 检查是否已经是该属性（如果是，则招式失败）
            // 注意：attacker.types 是数组，比如 ['Normal', 'Flying']
            if (attacker.types.length === 1 && attacker.types[0] === targetType) {
                logs.push(`但是在 ${targetType} 属性下无法再变化了!`);
                return;
            }

            // 修改属性
            attacker.types = [targetType];
            logs.push(`${attacker.cnName} 的纹理变得和 ${firstMove.name} 一样了!`);
            logs.push(`<span style="color:#a855f7">✦ 变成了 ${targetType} 属性!</span>`);
            
            return { typeChange: true };
        },
        description: '将自身属性变为第一招式的属性'
    },

    // 【镜面属性】：复制对手的属性
    'Reflect Type': {
        onUse: (attacker, defender, logs) => {
            if (!defender.types || defender.types.length === 0) return;

            // 复制属性数组（使用扩展运算符 ... 防止引用传递）
            attacker.types = [...defender.types];
            
            const typeStr = attacker.types.join('/');
            logs.push(`${attacker.cnName} 复制了对手的属性!`);
            logs.push(`<span style="color:#a855f7">✦ 变成了 ${typeStr} 属性!</span>`);
            
            return { typeChange: true };
        },
        description: '将自身属性变为和目标相同'
    },

    // 【浸水】：把对手变成纯水系
    'Soak': {
        onHit: (attacker, defender, damage, logs) => {
            // 无法对替身生效（简化处理忽略替身），无法对阿尔宙斯/银伴战兽生效
            if (defender.ability === 'Multitype' || defender.ability === 'RKS System') {
                logs.push(`但是失败了!`);
                return;
            }

            defender.types = ['Water'];
            logs.push(`${attacker.cnName} 向对手喷射了特殊的水!`);
            logs.push(`<span style="color:#3498db">✦ ${defender.cnName} 变成了 水 属性!</span>`);
            
            return { typeChange: true };
        },
        description: '将目标变为水属性'
    },

    // ============================================
    // 11. 究极技能：变身 (Transform)
    // ============================================
    'Transform': {
        onUse: (attacker, defender, logs) => {
            if (attacker.isTransformed) {
                logs.push(`但是 ${attacker.cnName} 已经变身过了!`);
                return;
            }

            // 1. 复制属性
            attacker.types = [...defender.types];
            
            // 2. 复制能力值 (除HP外)
            // 注意：这里我们直接覆盖 current stats。
            // 正规逻辑应该复制 baseStats 然后重新计算，但为了简化 RP 效果，直接复制数值即可。
            attacker.atk = defender.atk;
            attacker.def = defender.def;
            attacker.spa = defender.spa;
            attacker.spd = defender.spd;
            attacker.spe = defender.spe;
            
            // 复制能力等级 (Boosts)
            attacker.boosts = { ...defender.boosts };

            // 3. 复制技能 (简化：直接引用对象的技能数组，原本应该只有5PP，这里简化为无限)
            // 必须深拷贝技能数组，否则一方消耗PP会影响另一方（虽然目前没做PP系统）
            attacker.moves = defender.moves.map(m => ({...m}));

            // 4. 复制特性
            attacker.ability = defender.ability;

            // 5. 标记变身状态 (防止套娃)
            attacker.isTransformed = true;
            attacker.dittoOriginalName = attacker.cnName; // 记住原名
            attacker.cnName = defender.cnName; // 改名

            logs.push(`${attacker.dittoOriginalName} 变身成了 ${defender.cnName}!`);
            
            // 尝试更新图片为对手的图片 (这是一个高级视觉效果)
            // 注意：这需要前端 index.js 支持，通过 id 查找 DOM 更新 src
            if (typeof document !== 'undefined') {
                const playerSprite = document.getElementById('player-sprite');
                const enemySprite = document.getElementById('enemy-sprite');
                // 简单的图片交换逻辑（仅视觉）
                if (playerSprite && enemySprite) {
                    // 如果我是玩家，我变身成敌人
                    // 这种简单的 src 复制在 Showdown 图库下是有效的（正反面可能不一致，但能看）
                    // 更好的做法是去获取对手的正反面 ID
                    /* 这里不做复杂 DOM 操作，以免报错，仅文字提示 */
                }
            }

            return { transform: true };
        },
        description: '变身成对手的样子'
    },
    
    // ============================================
    // 回复技能 (Recovery Moves)
    // ============================================
    
    'Recover': {
        onHit: (attacker, defender, damage, logs) => {
            const healAmount = Math.floor(attacker.maxHp / 2);
            const actualHeal = Math.min(healAmount, attacker.maxHp - attacker.currHp);
            if (actualHeal > 0) {
                attacker.currHp += actualHeal;
                logs.push(`${attacker.cnName} 恢复了体力!`);
            } else {
                logs.push(`${attacker.cnName} 的体力已满!`);
            }
            return { heal: actualHeal };
        },
        description: '恢复最大HP的50%'
    },
    
    'Soft-Boiled': {
        onHit: (attacker, defender, damage, logs) => {
            const healAmount = Math.floor(attacker.maxHp / 2);
            const actualHeal = Math.min(healAmount, attacker.maxHp - attacker.currHp);
            if (actualHeal > 0) {
                attacker.currHp += actualHeal;
                logs.push(`${attacker.cnName} 恢复了体力!`);
            } else {
                logs.push(`${attacker.cnName} 的体力已满!`);
            }
            return { heal: actualHeal };
        },
        description: '恢复最大HP的50%'
    },
    
    'Slack Off': {
        onHit: (attacker, defender, damage, logs) => {
            const healAmount = Math.floor(attacker.maxHp / 2);
            const actualHeal = Math.min(healAmount, attacker.maxHp - attacker.currHp);
            if (actualHeal > 0) {
                attacker.currHp += actualHeal;
                logs.push(`${attacker.cnName} 偷懒恢复了体力!`);
            } else {
                logs.push(`${attacker.cnName} 的体力已满!`);
            }
            return { heal: actualHeal };
        },
        description: '恢复最大HP的50%'
    },
    
    'Roost': {
        onHit: (attacker, defender, damage, logs) => {
            const healAmount = Math.floor(attacker.maxHp / 2);
            const actualHeal = Math.min(healAmount, attacker.maxHp - attacker.currHp);
            if (actualHeal > 0) {
                attacker.currHp += actualHeal;
                logs.push(`${attacker.cnName} 降落休息恢复了体力!`);
                // 羽栖效果：本回合失去飞行属性（简化处理，不实现）
            } else {
                logs.push(`${attacker.cnName} 的体力已满!`);
            }
            return { heal: actualHeal };
        },
        description: '恢复最大HP的50%，本回合失去飞行属性'
    },
    
    'Synthesis': {
        onHit: (attacker, defender, damage, logs, battle) => {
            let healRatio = 0.5;
            // 天气影响
            if (battle) {
                if (battle.weather === 'sunnyday' || battle.weather === 'desolateland') {
                    healRatio = 2/3;
                } else if (battle.weather && battle.weather !== 'none') {
                    healRatio = 0.25;
                }
            }
            const healAmount = Math.floor(attacker.maxHp * healRatio);
            const actualHeal = Math.min(healAmount, attacker.maxHp - attacker.currHp);
            if (actualHeal > 0) {
                attacker.currHp += actualHeal;
                logs.push(`${attacker.cnName} 通过光合作用恢复了体力!`);
            } else {
                logs.push(`${attacker.cnName} 的体力已满!`);
            }
            return { heal: actualHeal };
        },
        description: '恢复HP，晴天恢复更多'
    },
    
    'Morning Sun': {
        onHit: (attacker, defender, damage, logs, battle) => {
            let healRatio = 0.5;
            if (battle) {
                if (battle.weather === 'sunnyday' || battle.weather === 'desolateland') {
                    healRatio = 2/3;
                } else if (battle.weather && battle.weather !== 'none') {
                    healRatio = 0.25;
                }
            }
            const healAmount = Math.floor(attacker.maxHp * healRatio);
            const actualHeal = Math.min(healAmount, attacker.maxHp - attacker.currHp);
            if (actualHeal > 0) {
                attacker.currHp += actualHeal;
                logs.push(`${attacker.cnName} 沐浴晨光恢复了体力!`);
            } else {
                logs.push(`${attacker.cnName} 的体力已满!`);
            }
            return { heal: actualHeal };
        },
        description: '恢复HP，晴天恢复更多'
    },
    
    'Moonlight': {
        onHit: (attacker, defender, damage, logs, battle) => {
            let healRatio = 0.5;
            if (battle) {
                if (battle.weather === 'sunnyday' || battle.weather === 'desolateland') {
                    healRatio = 2/3;
                } else if (battle.weather && battle.weather !== 'none') {
                    healRatio = 0.25;
                }
            }
            const healAmount = Math.floor(attacker.maxHp * healRatio);
            const actualHeal = Math.min(healAmount, attacker.maxHp - attacker.currHp);
            if (actualHeal > 0) {
                attacker.currHp += actualHeal;
                logs.push(`${attacker.cnName} 沐浴月光恢复了体力!`);
            } else {
                logs.push(`${attacker.cnName} 的体力已满!`);
            }
            return { heal: actualHeal };
        },
        description: '恢复HP，晴天恢复更多'
    },
    
    // ============================================
    // 能力变化清除技能 (Stat Reset Moves)
    // ============================================
    
    'Haze': {
        onHit: (attacker, defender, damage, logs, battle) => {
            // 重置双方所有能力变化
            const resetBoosts = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, accuracy: 0, evasion: 0 };
            
            if (attacker.boosts) {
                attacker.boosts = { ...resetBoosts };
            }
            if (defender.boosts) {
                defender.boosts = { ...resetBoosts };
            }
            
            logs.push(`场上所有的能力变化由于黑雾都消失了!`);
            return { haze: true };
        },
        description: '清除场上所有宝可梦的能力变化'
    },
    
    'Clear Smog': {
        onHit: (attacker, defender, damage, logs) => {
            // 只重置对手的能力变化
            const resetBoosts = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, accuracy: 0, evasion: 0 };
            
            if (defender.boosts) {
                defender.boosts = { ...resetBoosts };
            }
            
            logs.push(`${defender.cnName} 的强化被清除之烟抵消了!`);
            return { clearSmog: true };
        },
        description: '造成伤害并清除对手的能力变化'
    },
    
    // ============================================
    // 能力变化操控技能 (Stat Manipulation Moves)
    // ============================================
    
    'Topsy-Turvy': {
        onHit: (attacker, defender, damage, logs) => {
            // 颠倒对手的能力变化（+3 变 -3，-1 变 +1）
            const stats = ['atk', 'def', 'spa', 'spd', 'spe', 'accuracy', 'evasion'];
            let reversed = false;
            
            if (defender.boosts) {
                stats.forEach(key => {
                    if (defender.boosts[key] && defender.boosts[key] !== 0) {
                        defender.boosts[key] *= -1;
                        reversed = true;
                    }
                });
            }
            
            if (reversed) {
                logs.push(`${defender.cnName} 的能力变化被完全颠倒了!`);
            } else {
                logs.push(`但是没有效果...`);
            }
            return { topsyTurvy: true };
        },
        description: '将对手的能力变化数值反转'
    },
    
    'Spectral Thief': {
        onHit: (attacker, defender, damage, logs) => {
            // 偷取对手的正面能力变化
            const stats = ['atk', 'def', 'spa', 'spd', 'spe', 'accuracy', 'evasion'];
            let stolen = false;
            
            if (defender.boosts && attacker.boosts) {
                stats.forEach(key => {
                    if (defender.boosts[key] && defender.boosts[key] > 0) {
                        // 自己加上对手的增益
                        attacker.boosts[key] = Math.min(6, (attacker.boosts[key] || 0) + defender.boosts[key]);
                        // 对手清零
                        defender.boosts[key] = 0;
                        stolen = true;
                    }
                });
            }
            
            if (stolen) {
                logs.push(`${attacker.cnName} 夺取了对手的强化能力!`);
            }
            return { spectralThief: true };
        },
        description: '偷取对手的正面能力变化后造成伤害'
    },
    
    'Psych Up': {
        onHit: (attacker, defender, damage, logs) => {
            // 复制对手的能力变化
            if (defender.boosts) {
                attacker.boosts = { ...defender.boosts };
                logs.push(`${attacker.cnName} 复制了 ${defender.cnName} 的能力变化!`);
            } else {
                logs.push(`但是没有效果...`);
            }
            return { psychUp: true };
        },
        description: '复制对手的能力变化覆盖自己'
    },
    
    'Heart Swap': {
        onHit: (attacker, defender, damage, logs) => {
            // 交换双方的能力变化
            if (attacker.boosts && defender.boosts) {
                const temp = { ...attacker.boosts };
                attacker.boosts = { ...defender.boosts };
                defender.boosts = temp;
                logs.push(`${attacker.cnName} 和 ${defender.cnName} 的能力变化互换了!`);
            }
            return { heartSwap: true };
        },
        description: '交换双方的能力变化'
    },
    
    'Power Swap': {
        onHit: (attacker, defender, damage, logs) => {
            // 交换双方的攻击和特攻能力变化
            if (attacker.boosts && defender.boosts) {
                const tempAtk = attacker.boosts.atk || 0;
                const tempSpa = attacker.boosts.spa || 0;
                attacker.boosts.atk = defender.boosts.atk || 0;
                attacker.boosts.spa = defender.boosts.spa || 0;
                defender.boosts.atk = tempAtk;
                defender.boosts.spa = tempSpa;
                logs.push(`双方的攻击和特攻能力变化互换了!`);
            }
            return { powerSwap: true };
        },
        description: '交换双方的攻击和特攻能力变化'
    },
    
    'Guard Swap': {
        onHit: (attacker, defender, damage, logs) => {
            // 交换双方的防御和特防能力变化
            if (attacker.boosts && defender.boosts) {
                const tempDef = attacker.boosts.def || 0;
                const tempSpd = attacker.boosts.spd || 0;
                attacker.boosts.def = defender.boosts.def || 0;
                attacker.boosts.spd = defender.boosts.spd || 0;
                defender.boosts.def = tempDef;
                defender.boosts.spd = tempSpd;
                logs.push(`双方的防御和特防能力变化互换了!`);
            }
            return { guardSwap: true };
        },
        description: '交换双方的防御和特防能力变化'
    },
    
    'Speed Swap': {
        onHit: (attacker, defender, damage, logs) => {
            // 交换双方的实际速度值
            const tempSpe = attacker.spe;
            attacker.spe = defender.spe;
            defender.spe = tempSpe;
            logs.push(`${attacker.cnName} 和 ${defender.cnName} 的速度互换了!`);
            return { speedSwap: true };
        },
        description: '交换双方的实际速度值'
    },
    
    // ============================================
    // 状态治疗技能 (Status Healing Moves)
    // ============================================
    
    'Aromatherapy': {
        onHit: (attacker, defender, damage, logs, battle) => {
            // 治愈己方全队的异常状态（简化：只治愈自己）
            let cured = false;
            if (attacker.status) {
                attacker.status = null;
                attacker.statusTurns = 0;
                cured = true;
            }
            
            // 尝试治愈队友（如果有 battle 对象）
            if (battle && battle.playerParty) {
                battle.playerParty.forEach(pm => {
                    if (pm && pm.status && pm.isAlive && pm.isAlive()) {
                        pm.status = null;
                        pm.statusTurns = 0;
                        cured = true;
                    }
                });
            }
            
            if (cured) {
                logs.push(`芳香治疗的香气治愈了异常状态!`);
            } else {
                logs.push(`芳香四溢... 但好像没什么效果。`);
            }
            return { aromatherapy: true };
        },
        description: '治愈己方全队的异常状态'
    },
    
    'Heal Bell': {
        onHit: (attacker, defender, damage, logs, battle) => {
            // 治愈己方全队的异常状态（简化：只治愈自己）
            let cured = false;
            if (attacker.status) {
                attacker.status = null;
                attacker.statusTurns = 0;
                cured = true;
            }
            
            // 尝试治愈队友
            if (battle && battle.playerParty) {
                battle.playerParty.forEach(pm => {
                    if (pm && pm.status && pm.isAlive && pm.isAlive()) {
                        pm.status = null;
                        pm.statusTurns = 0;
                        cured = true;
                    }
                });
            }
            
            if (cured) {
                logs.push(`治愈铃声回荡，异常状态被治愈了!`);
            } else {
                logs.push(`铃声回荡... 但好像没什么效果。`);
            }
            return { healBell: true };
        },
        description: '治愈己方全队的异常状态'
    },
    
    'Refresh': {
        onHit: (attacker, defender, damage, logs) => {
            // 治愈自己的中毒、麻痹、灼伤
            const curableStatus = ['psn', 'tox', 'par', 'brn'];
            if (attacker.status && curableStatus.includes(attacker.status)) {
                attacker.status = null;
                attacker.statusTurns = 0;
                logs.push(`${attacker.cnName} 的异常状态被治愈了!`);
            } else {
                logs.push(`但是没有效果...`);
            }
            return { refresh: true };
        },
        description: '治愈自己的中毒、麻痹、灼伤'
    },
    
    'Purify': {
        onHit: (attacker, defender, damage, logs) => {
            // 治愈对手的异常状态，自己回复50%HP
            if (defender.status) {
                defender.status = null;
                defender.statusTurns = 0;
                logs.push(`${defender.cnName} 的异常状态被治愈了!`);
                
                // 自己回复HP
                const healAmount = Math.floor(attacker.maxHp / 2);
                const actualHeal = Math.min(healAmount, attacker.maxHp - attacker.currHp);
                if (actualHeal > 0) {
                    attacker.currHp += actualHeal;
                    logs.push(`${attacker.cnName} 恢复了体力!`);
                }
            } else {
                logs.push(`但是失败了!`);
            }
            return { purify: true };
        },
        description: '治愈对手的异常状态，自己回复50%HP'
    },
    
    // ============================================
    // 特殊回复技能 (Special Recovery Moves)
    // ============================================
    
    'Rest': {
        onHit: (attacker, defender, damage, logs) => {
            // 完全回复HP，但陷入睡眠2回合
            if (attacker.currHp >= attacker.maxHp) {
                logs.push(`但是失败了!`);
                return { rest: false };
            }
            
            attacker.currHp = attacker.maxHp;
            attacker.status = 'slp';
            attacker.statusTurns = 0;
            // 睡眠回合数（Rest 固定睡2回合，第3回合醒来）
            attacker.sleepTurns = 3;
            
            logs.push(`${attacker.cnName} 睡着了并恢复了全部体力!`);
            return { rest: true };
        },
        description: '完全回复HP，但陷入睡眠2回合'
    },
    
    'Wish': {
        onHit: (attacker, defender, damage, logs, battle) => {
            // 下回合结束时回复50%HP（简化：立即回复）
            // 完整实现需要延迟效果系统
            if (battle) {
                battle.wishPending = {
                    target: 'player',
                    amount: Math.floor(attacker.maxHp / 2),
                    turnsLeft: 1
                };
            }
            logs.push(`${attacker.cnName} 许下了愿望!`);
            return { wish: true };
        },
        description: '下回合结束时回复50%HP'
    },
    
    'Healing Wish': {
        onHit: (attacker, defender, damage, logs, battle) => {
            // 自己倒下，完全治愈下一只出场的宝可梦
            attacker.currHp = 0;
            if (battle) {
                battle.healingWishPending = true;
            }
            logs.push(`${attacker.cnName} 牺牲自己许下了治愈之愿!`);
            return { healingWish: true, selfKO: true };
        },
        description: '自己倒下，完全治愈下一只出场的宝可梦'
    },
    
    'Lunar Dance': {
        onHit: (attacker, defender, damage, logs, battle) => {
            // 自己倒下，完全治愈下一只出场的宝可梦（包括PP）
            attacker.currHp = 0;
            if (battle) {
                battle.lunarDancePending = true;
            }
            logs.push(`${attacker.cnName} 跳起了新月之舞!`);
            return { lunarDance: true, selfKO: true };
        },
        description: '自己倒下，完全治愈下一只出场的宝可梦'
    },
    
    'Shore Up': {
        onHit: (attacker, defender, damage, logs, battle) => {
            // 沙暴天气下回复2/3，否则回复1/2
            let healRatio = 0.5;
            if (battle && battle.weather === 'sandstorm') {
                healRatio = 2/3;
            }
            const healAmount = Math.floor(attacker.maxHp * healRatio);
            const actualHeal = Math.min(healAmount, attacker.maxHp - attacker.currHp);
            if (actualHeal > 0) {
                attacker.currHp += actualHeal;
                logs.push(`${attacker.cnName} 集沙恢复了体力!`);
            } else {
                logs.push(`${attacker.cnName} 的体力已满!`);
            }
            return { heal: actualHeal };
        },
        description: '恢复HP，沙暴天气下恢复更多'
    },
    
    'Strength Sap': {
        onHit: (attacker, defender, damage, logs) => {
            // 回复等于对手攻击力的HP，并降低对手攻击
            const healAmount = defender.atk;
            const actualHeal = Math.min(healAmount, attacker.maxHp - attacker.currHp);
            if (actualHeal > 0) {
                attacker.currHp += actualHeal;
                logs.push(`${attacker.cnName} 吸取了 ${defender.cnName} 的力量!`);
            }
            
            // 降低对手攻击
            if (defender.boosts) {
                const oldAtk = defender.boosts.atk || 0;
                defender.boosts.atk = Math.max(-6, oldAtk - 1);
                if (oldAtk > -6) {
                    logs.push(`${defender.cnName} 的攻击下降了!`);
                }
            }
            return { strengthSap: true };
        },
        description: '回复等于对手攻击力的HP，并降低对手攻击'
    },
    
    'Leech Seed': {
        onHit: (attacker, defender, damage, logs) => {
            // 种下寄生种子
            if (defender.types && defender.types.includes('Grass')) {
                logs.push(`对草属性宝可梦没有效果!`);
                return { leechSeed: false };
            }
            
            if (!defender.volatile) defender.volatile = {};
            defender.volatile.leechSeed = true;
            logs.push(`${defender.cnName} 被种下了寄生种子!`);
            return { leechSeed: true };
        },
        description: '每回合吸取对手1/8HP'
    },
    
    'Pain Split': {
        onHit: (attacker, defender, damage, logs) => {
            // 平分双方HP
            const totalHp = attacker.currHp + defender.currHp;
            const splitHp = Math.floor(totalHp / 2);
            
            attacker.currHp = Math.min(splitHp, attacker.maxHp);
            defender.currHp = Math.min(splitHp, defender.maxHp);
            
            logs.push(`双方平分了痛苦!`);
            return { painSplit: true };
        },
        description: '平分双方当前HP'
    },
    
    // ============================================
    // 吸血/反伤技能补充 (Drain/Recoil Moves)
    // ============================================
    
    'Giga Drain': {
        onHit: (attacker, defender, damage, logs) => {
            const drainAmount = Math.floor(damage / 2);
            const actualHeal = Math.min(drainAmount, attacker.maxHp - attacker.currHp);
            if (actualHeal > 0) {
                attacker.currHp += actualHeal;
                logs.push(`${attacker.cnName} 吸取了对手的体力!`);
            }
            return { drain: actualHeal };
        },
        description: '造成伤害并回复伤害的50%'
    },
    
    'Drain Punch': {
        onHit: (attacker, defender, damage, logs) => {
            const drainAmount = Math.floor(damage / 2);
            const actualHeal = Math.min(drainAmount, attacker.maxHp - attacker.currHp);
            if (actualHeal > 0) {
                attacker.currHp += actualHeal;
                logs.push(`${attacker.cnName} 吸取了对手的体力!`);
            }
            return { drain: actualHeal };
        },
        description: '造成伤害并回复伤害的50%'
    },
    
    'Horn Leech': {
        onHit: (attacker, defender, damage, logs) => {
            const drainAmount = Math.floor(damage / 2);
            const actualHeal = Math.min(drainAmount, attacker.maxHp - attacker.currHp);
            if (actualHeal > 0) {
                attacker.currHp += actualHeal;
                logs.push(`${attacker.cnName} 吸取了对手的体力!`);
            }
            return { drain: actualHeal };
        },
        description: '造成伤害并回复伤害的50%'
    },
    
    'Leech Life': {
        onHit: (attacker, defender, damage, logs) => {
            const drainAmount = Math.floor(damage / 2);
            const actualHeal = Math.min(drainAmount, attacker.maxHp - attacker.currHp);
            if (actualHeal > 0) {
                attacker.currHp += actualHeal;
                logs.push(`${attacker.cnName} 吸取了对手的体力!`);
            }
            return { drain: actualHeal };
        },
        description: '造成伤害并回复伤害的50%'
    },
    
    'Oblivion Wing': {
        onHit: (attacker, defender, damage, logs) => {
            // 回复伤害的75%
            const drainAmount = Math.floor(damage * 0.75);
            const actualHeal = Math.min(drainAmount, attacker.maxHp - attacker.currHp);
            if (actualHeal > 0) {
                attacker.currHp += actualHeal;
                logs.push(`${attacker.cnName} 吸取了对手的体力!`);
            }
            return { drain: actualHeal };
        },
        description: '造成伤害并回复伤害的75%'
    },
    
    'Draining Kiss': {
        onHit: (attacker, defender, damage, logs) => {
            // 回复伤害的75%
            const drainAmount = Math.floor(damage * 0.75);
            const actualHeal = Math.min(drainAmount, attacker.maxHp - attacker.currHp);
            if (actualHeal > 0) {
                attacker.currHp += actualHeal;
                logs.push(`${attacker.cnName} 吸取了对手的体力!`);
            }
            return { drain: actualHeal };
        },
        description: '造成伤害并回复伤害的75%'
    },
    
    'Absorb': {
        onHit: (attacker, defender, damage, logs) => {
            const drainAmount = Math.floor(damage / 2);
            const actualHeal = Math.min(drainAmount, attacker.maxHp - attacker.currHp);
            if (actualHeal > 0) {
                attacker.currHp += actualHeal;
                logs.push(`${attacker.cnName} 吸取了对手的体力!`);
            }
            return { drain: actualHeal };
        },
        description: '造成伤害并回复伤害的50%'
    },
    
    'Mega Drain': {
        onHit: (attacker, defender, damage, logs) => {
            const drainAmount = Math.floor(damage / 2);
            const actualHeal = Math.min(drainAmount, attacker.maxHp - attacker.currHp);
            if (actualHeal > 0) {
                attacker.currHp += actualHeal;
                logs.push(`${attacker.cnName} 吸取了对手的体力!`);
            }
            return { drain: actualHeal };
        },
        description: '造成伤害并回复伤害的50%'
    },
    
    'Dream Eater': {
        onHit: (attacker, defender, damage, logs) => {
            // 只对睡眠状态的对手有效（伤害计算已在别处处理）
            const drainAmount = Math.floor(damage / 2);
            const actualHeal = Math.min(drainAmount, attacker.maxHp - attacker.currHp);
            if (actualHeal > 0) {
                attacker.currHp += actualHeal;
                logs.push(`${attacker.cnName} 吃掉了对手的梦!`);
            }
            return { drain: actualHeal };
        },
        description: '吃掉睡眠中对手的梦，回复伤害的50%'
    },

    // ============================================
    // 道具交换技能 (Item Swap Moves)
    // ============================================

    'Trick': {
        onUse: (user, target, logs, battle) => {
            // 检查双方道具
            const userItem = user.item || null;
            const targetItem = target.item || null;
            
            // 如果双方都没有道具，技能失败
            if (!userItem && !targetItem) {
                logs.push(`但是失败了！`);
                return { failed: true };
            }
            
            const userItemId = userItem ? userItem.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
            const targetItemId = targetItem ? targetItem.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
            
            // 使用 items-data.js 的 isSwappable 函数检查
            const checkSwappable = typeof isSwappable === 'function' ? isSwappable : (id) => {
                // Fallback: 硬编码检查
                const unswappableItems = [
                    'rustedsword', 'rustedshield', 'griseousorb', 'adamantorb', 'lustrousorb',
                    'souldew', 'lightball', 'thickclub', 'luckypunch', 'leek', 'stick', 'mail'
                ];
                if (unswappableItems.includes(id)) return false;
                if (id.endsWith('ite') && id !== 'eviolite') return false; // Mega 石
                if (id.endsWith('iumz') || id.endsWith('iniumz')) return false; // Z 水晶
                return true;
            };
            
            if (!checkSwappable(userItemId) || !checkSwappable(targetItemId)) {
                logs.push(`但是失败了！`);
                return { failed: true };
            }
            
            // 检查黏着特性
            if (target.ability === 'Sticky Hold') {
                logs.push(`${target.cnName} 的黏着特性阻止了道具交换！`);
                return { failed: true };
            }
            
            // 执行交换
            user.item = targetItem;
            target.item = userItem;
            
            // 记录交换（用于 AI 判断锁招）- 使用 items-data.js 的 isChoiceItem
            const checkChoice = typeof isChoiceItem === 'function' ? isChoiceItem : 
                (item) => item && (item.includes('Choice') || item.includes('讲究'));
            
            if (checkChoice(targetItem)) {
                target.choiceLocked = true;
                target.choiceLockedMove = null;
            }
            if (checkChoice(userItem)) {
                user.choiceLocked = true;
                user.choiceLockedMove = null;
            }
            
            // 生成日志 - 尝试获取中文名
            const getItemCnName = (item) => {
                if (!item) return '无';
                if (typeof getItem === 'function') {
                    const data = getItem(item);
                    if (data && data.cnName) return data.cnName;
                }
                return item;
            };
            const userItemName = getItemCnName(userItem);
            const targetItemName = getItemCnName(targetItem);
            logs.push(`<b style="color:#a855f7">✦ ${user.cnName} 和 ${target.cnName} 交换了道具！</b>`);
            logs.push(`${user.cnName} 获得了 ${targetItemName}！`);
            logs.push(`${target.cnName} 获得了 ${userItemName}！`);
            
            console.log(`[TRICK] ${user.name}: ${userItem} -> ${targetItem}, ${target.name}: ${targetItem} -> ${userItem}`);
        },
        description: '和对手交换持有的道具'
    },

    'Switcheroo': {
        onUse: (user, target, logs, battle) => {
            // Switcheroo 和 Trick 效果完全相同
            const trickHandler = MoveHandlers['Trick'];
            if (trickHandler && trickHandler.onUse) {
                return trickHandler.onUse(user, target, logs, battle);
            }
        },
        description: '和对手交换持有的道具'
    },

    // ============================================
    // 场地状态技能 (Field Condition Moves)
    // ============================================

    'Trick Room': {
        onUse: (user, target, logs, battle) => {
            console.log('[TRICK ROOM] onUse called, battle:', battle, 'field:', battle?.field);
            
            // 如果 battle 或 field 不存在，尝试从全局获取
            if (!battle) {
                battle = (typeof window !== 'undefined' && window.battle) ? window.battle : null;
                console.log('[TRICK ROOM] Using global battle:', battle);
            }
            
            if (!battle) {
                console.warn('[TRICK ROOM] No battle object available!');
                logs.push(`<b style="color:#a855f7">✦ ${user.cnName} 扭曲了时空！</b>`);
                logs.push(`<span style="color:#c084fc">戏法空间展开！速度慢的宝可梦将先行动！</span>`);
                return;
            }
            
            // 确保 field 对象存在
            if (!battle.field) {
                battle.field = { trickRoom: 0 };
            }
            
            if (battle.field.trickRoom > 0) {
                // 已经有空间，再用会关闭
                battle.field.trickRoom = 0;
                logs.push(`${user.cnName} 让扭曲的时空恢复了正常！`);
                console.log('[TRICK ROOM] Closed! trickRoom =', battle.field.trickRoom);
            } else {
                // 开启空间，持续5回合
                battle.field.trickRoom = 5;
                logs.push(`<b style="color:#a855f7">✦ ${user.cnName} 扭曲了时空！</b>`);
                logs.push(`<span style="color:#c084fc">戏法空间展开！速度慢的宝可梦将先行动！</span>`);
                console.log('[TRICK ROOM] Opened! trickRoom =', battle.field.trickRoom);
            }
        },
        priority: -7,
        description: '5回合内速度慢的先动'
    },

    'Tailwind': {
        onUse: (user, target, logs, battle, isPlayer) => {
            if (!battle) return;
            
            const side = isPlayer ? battle.playerSide : battle.enemySide;
            if (!side) return;
            
            if (side.tailwind > 0) {
                logs.push(`顺风已经在吹了！`);
                return { failed: true };
            }
            
            side.tailwind = 4; // 持续4回合
            const sideText = isPlayer ? '我方' : '敌方';
            logs.push(`<b style="color:#38bdf8">🌬️ ${sideText}刮起了顺风！</b>`);
        },
        description: '4回合内我方速度翻倍'
    },

    'Reflect': {
        onUse: (user, target, logs, battle, isPlayer) => {
            if (!battle) return;
            
            const side = isPlayer ? battle.playerSide : battle.enemySide;
            if (!side) return;
            
            if (side.reflect > 0) {
                logs.push(`反射壁已经存在！`);
                return { failed: true };
            }
            
            // 光之黏土延长到8回合 - 使用 items-data.js 的 ItemEffects
            const screenDuration = (typeof ItemEffects !== 'undefined' && ItemEffects.getScreenDuration) 
                ? ItemEffects.getScreenDuration(user) 
                : ((user.item || '').toLowerCase().includes('lightclay') ? 8 : 5);
            side.reflect = screenDuration;
            
            const sideText = isPlayer ? '我方' : '敌方';
            logs.push(`<b style="color:#f97316">🛡️ ${sideText}建起了反射壁！</b>`);
        },
        description: '5回合内物理伤害减半'
    },

    'Light Screen': {
        onUse: (user, target, logs, battle, isPlayer) => {
            if (!battle) return;
            
            const side = isPlayer ? battle.playerSide : battle.enemySide;
            if (!side) return;
            
            if (side.lightScreen > 0) {
                logs.push(`光墙已经存在！`);
                return { failed: true };
            }
            
            // 光之黏土延长到8回合 - 使用 items-data.js 的 ItemEffects
            const screenDuration = (typeof ItemEffects !== 'undefined' && ItemEffects.getScreenDuration) 
                ? ItemEffects.getScreenDuration(user) 
                : ((user.item || '').toLowerCase().includes('lightclay') ? 8 : 5);
            side.lightScreen = screenDuration;
            
            const sideText = isPlayer ? '我方' : '敌方';
            logs.push(`<b style="color:#facc15">✨ ${sideText}建起了光墙！</b>`);
        },
        description: '5回合内特殊伤害减半'
    },

    'Aurora Veil': {
        onUse: (user, target, logs, battle, isPlayer) => {
            if (!battle) return;
            
            const side = isPlayer ? battle.playerSide : battle.enemySide;
            if (!side) return;
            
            // 极光幕需要冰雹/雪天气
            // 简化：暂时不检查天气，直接允许使用
            
            if (side.auroraVeil > 0) {
                logs.push(`极光幕已经存在！`);
                return { failed: true };
            }
            
            // 光之黏土延长到8回合 - 使用 items-data.js 的 ItemEffects
            const screenDuration = (typeof ItemEffects !== 'undefined' && ItemEffects.getScreenDuration) 
                ? ItemEffects.getScreenDuration(user) 
                : ((user.item || '').toLowerCase().includes('lightclay') ? 8 : 5);
            side.auroraVeil = screenDuration;
            
            const sideText = isPlayer ? '我方' : '敌方';
            logs.push(`<b style="color:#22d3ee">❄️ ${sideText}展开了极光幕！</b>`);
        },
        description: '5回合内物理和特殊伤害都减半'
    },
    
    // ============================================
    // 反弹技能 (Counter / Mirror Coat)
    // ============================================
    // 这两个技能需要检查本回合受到的伤害类型
    // Counter: 反弹物理伤害的两倍
    // Mirror Coat: 反弹特殊伤害的两倍
    
    'Counter': {
        // 标记为反弹技能，不是普通变化技
        isReflectMove: true,
        reflectCategory: 'physical',
        
        damageCallback: (attacker, defender) => {
            // 检查本回合受到的伤害
            const takenDamage = attacker.turnData?.lastDamageTaken;
            if (!takenDamage || takenDamage.amount <= 0) {
                return 0; // 没受伤，反弹失败
            }
            
            // 必须是物理伤害
            const cat = takenDamage.category || '';
            if (cat !== 'physical' && cat !== 'phys') {
                return 0; // 类型不对
            }
            
            // 双倍返还
            return takenDamage.amount * 2;
        },
        
        onUse: (user, target, logs, battle, isPlayer) => {
            const takenDamage = user.turnData?.lastDamageTaken;
            
            if (!takenDamage || takenDamage.amount <= 0) {
                logs.push(`<b style="color:#888">但是失败了！(本回合没有受到伤害)</b>`);
                return { failed: true };
            }
            
            const cat = takenDamage.category || '';
            if (cat !== 'physical' && cat !== 'phys') {
                logs.push(`<b style="color:#888">但是失败了！(没有受到物理攻击)</b>`);
                return { failed: true };
            }
            
            logs.push(`<b style="color:#c0392b">💥 ${user.cnName} 将物理伤害双倍奉还！</b>`);
            return { damage: takenDamage.amount * 2 };
        },
        description: '将本回合受到的物理伤害双倍返还'
    },
    
    'Mirror Coat': {
        // 标记为反弹技能，不是普通变化技
        isReflectMove: true,
        reflectCategory: 'special',
        
        damageCallback: (attacker, defender) => {
            // 检查本回合受到的伤害
            const takenDamage = attacker.turnData?.lastDamageTaken;
            if (!takenDamage || takenDamage.amount <= 0) {
                return 0; // 没受伤，反弹失败
            }
            
            // 必须是特殊伤害
            const cat = takenDamage.category || '';
            if (cat !== 'special' && cat !== 'spec') {
                return 0; // 类型不对
            }
            
            // 双倍返还
            return takenDamage.amount * 2;
        },
        
        onUse: (user, target, logs, battle, isPlayer) => {
            const takenDamage = user.turnData?.lastDamageTaken;
            
            if (!takenDamage || takenDamage.amount <= 0) {
                logs.push(`<b style="color:#888">但是失败了！(本回合没有受到伤害)</b>`);
                return { failed: true };
            }
            
            const cat = takenDamage.category || '';
            if (cat !== 'special' && cat !== 'spec') {
                logs.push(`<b style="color:#888">但是失败了！(没有受到特殊攻击)</b>`);
                return { failed: true };
            }
            
            logs.push(`<b style="color:#9b59b6">✨ ${user.cnName} 将特殊伤害双倍奉还！</b>`);
            return { damage: takenDamage.amount * 2 };
        },
        description: '将本回合受到的特殊伤害双倍返还'
    },
    
    // Metal Burst: 反弹最后受到伤害的 1.5 倍（不分物理特殊）
    'Metal Burst': {
        isReflectMove: true,
        reflectCategory: 'any',
        
        damageCallback: (attacker, defender) => {
            const takenDamage = attacker.turnData?.lastDamageTaken;
            if (!takenDamage || takenDamage.amount <= 0) {
                return 0;
            }
            // 1.5 倍返还
            return Math.floor(takenDamage.amount * 1.5);
        },
        
        onUse: (user, target, logs, battle, isPlayer) => {
            const takenDamage = user.turnData?.lastDamageTaken;
            
            if (!takenDamage || takenDamage.amount <= 0) {
                logs.push(`<b style="color:#888">但是失败了！(本回合没有受到伤害)</b>`);
                return { failed: true };
            }
            
            logs.push(`<b style="color:#7f8c8d">⚔️ ${user.cnName} 以金属爆发反击！</b>`);
            return { damage: Math.floor(takenDamage.amount * 1.5) };
        },
        description: '将本回合受到的伤害 1.5 倍返还'
    },
    
    // ============================================
    // 太晶爆发 (Tera Blast) - 星晶特殊效果
    // ============================================
    'Tera Blast': {
        onHit: (attacker, defender, damage, logs) => {
            // 只有在星晶太晶化状态下才有副作用
            if (attacker.isTerastallized && attacker.teraType === 'Stellar') {
                if (typeof attacker.applyBoost === 'function') {
                    attacker.applyBoost('atk', -1);
                    attacker.applyBoost('spa', -1);
                    logs.push(`<span style="color:#d400ff">✦ 因为这股能量过于庞大，${attacker.cnName} 的攻击和特攻下降了! (星晶反噬)</span>`);
                    if (typeof window.playSFX === 'function') window.playSFX('STAT_DOWN');
                }
            }
            return {};
        },
        description: '太晶化时改变属性。若是星晶属性，威力强大但会降低双攻。'
    }
};

// ============================================
// 辅助函数：获取技能处理器
// ============================================

function getMoveHandler(moveName) {
    return MoveHandlers[moveName] || null;
}

function hasMoveHandler(moveName) {
    return moveName in MoveHandlers;
}

// ============================================
// 导出到全局
// ============================================

if (typeof window !== 'undefined') {
    window.MoveHandlers = MoveHandlers;
    window.getMoveHandler = getMoveHandler;
    window.hasMoveHandler = hasMoveHandler;
}
