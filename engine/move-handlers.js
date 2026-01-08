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
 * - onAfterHit: 命中后的额外效果（带伤害参数）
 * - modifyAtk: 修改攻击力计算
 * - modifyDef: 修改防御力计算
 */

// ============================================
// 辅助函数
// ============================================

/**
 * 检查道具是否可以被 Knock Off 打落
 * 不能打落：Mega 石、Z 纯晶、专属道具（朱红色宝珠等）
 */
function canKnockOff(pokemon) {
    if (!pokemon.item) return false;
    
    const itemId = pokemon.item.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Mega 石不能打落
    if (itemId.endsWith('ite') || itemId.endsWith('itex') || itemId.endsWith('itey')) {
        // 检查是否是对应宝可梦的 Mega 石
        const pokemonId = pokemon.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (itemId.includes(pokemonId) || itemId.includes('mega')) {
            return false;
        }
    }
    
    // Z 纯晶不能打落
    if (itemId.endsWith('z') && itemId.includes('ium')) {
        return false;
    }
    
    // 专属道具不能打落（朱红色宝珠、靛蓝色宝珠等）
    const unremovableItems = [
        'redorb', 'blueorb', // 固拉多/盖欧卡
        'griseousorb', 'griseouscore', // 骑拉帝纳
        'adamantorb', 'lustrousorb', // 帝牙卢卡/帕路奇亚
        'souldew', // 拉帝亚斯/拉帝欧斯（Gen6 前）
        'rustedsword', 'rustedshield', // 苍响/藏玛然特
        'boosterenergy', // 悖谬种（不能打落）
    ];
    if (unremovableItems.includes(itemId)) {
        return false;
    }
    
    // Sticky Hold 特性防止道具被打落
    if (typeof AbilityHandlers !== 'undefined' && pokemon.ability) {
        const handler = AbilityHandlers[pokemon.ability];
        if (handler && handler.preventItemTheft) {
            return false;
        }
    }
    
    return true;
}

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
    
    // 【鳃咬】先手威力翻倍 (Gen 8 化石龙核心招式)
    'Fishious Rend': {
        basePowerCallback: (attacker, defender, move, battle) => {
            // 如果使用者比目标先行动，威力翻倍 (85 -> 170)
            const mySpeed = attacker.getStat ? attacker.getStat('spe') : attacker.spe;
            const enemySpeed = defender.getStat ? defender.getStat('spe') : defender.spe;
            // 简化判定：速度快的视为先行动
            if (mySpeed >= enemySpeed) {
                console.log(`[Fishious Rend] 先手威力翻倍！170`);
                return 170;
            }
            return 85;
        },
        description: '如果比对手先出手，威力翻倍 (170)'
    },
    
    // 【电喙】先手威力翻倍 (Gen 8 化石龙核心招式)
    'Bolt Beak': {
        basePowerCallback: (attacker, defender, move, battle) => {
            const mySpeed = attacker.getStat ? attacker.getStat('spe') : attacker.spe;
            const enemySpeed = defender.getStat ? defender.getStat('spe') : defender.spe;
            if (mySpeed >= enemySpeed) {
                console.log(`[Bolt Beak] 先手威力翻倍！170`);
                return 170;
            }
            return 85;
        },
        description: '如果比对手先出手，威力翻倍 (170)'
    },
    
    // ============================================
    // 2.5 条件倍率技能 (Conditional Power Moves)
    // ============================================
    
    // 【落拳 Knock Off】竞技环境万金油
    // 如果目标持有可移除道具，威力 x1.5，攻击后移除道具
    'Knock Off': {
        basePowerCallback: (attacker, defender, move, battle) => {
            // 检查目标是否持有可移除道具
            if (defender.item && canKnockOff(defender)) {
                console.log(`[Knock Off] 目标持有 ${defender.item}，威力 x1.5`);
                return 97; // 65 * 1.5 = 97.5
            }
            return 65;
        },
        onAfterHit: (attacker, defender, move, damage, logs) => {
            // 攻击后移除道具
            if (defender.item && canKnockOff(defender) && damage > 0) {
                const removedItem = defender.item;
                defender.item = null;
                logs.push(`<b style="color:#8b5cf6">🔨 ${defender.cnName} 的 ${removedItem} 被打落了！</b>`);
                
                // 触发 Unburden 等特性
                if (typeof defender.consumeItem === 'function') {
                    // consumeItem 已经处理了 item = null，这里只触发钩子
                    if (typeof AbilityHandlers !== 'undefined' && defender.ability) {
                        const handler = AbilityHandlers[defender.ability];
                        if (handler && handler.onItemLost) {
                            handler.onItemLost(defender, removedItem, logs);
                        }
                    }
                }
            }
        },
        description: '如果目标持有道具，威力x1.5并打落道具'
    },
    
    // 【杂技 Acrobatics】消耗流飞行系核心
    // 不持有道具时威力翻倍 (55 -> 110)
    'Acrobatics': {
        basePowerCallback: (attacker, defender, move, battle) => {
            if (!attacker.item) {
                console.log(`[Acrobatics] 无道具，威力翻倍！110`);
                return 110;
            }
            return 55;
        },
        description: '不持有道具时威力翻倍 (110)'
    },
    
    // 【硬撑 Facade】异常状态物攻手核心
    // 烧伤/麻痹/中毒时威力翻倍，且无视烧伤的物攻减半
    'Facade': {
        basePowerCallback: (attacker, defender, move, battle) => {
            if (attacker.status === 'brn' || attacker.status === 'par' || 
                attacker.status === 'psn' || attacker.status === 'tox') {
                console.log(`[Facade] 异常状态，威力翻倍！140`);
                return 140;
            }
            return 70;
        },
        ignoreBurn: true, // 标记：无视烧伤的物攻减半
        description: '异常状态时威力翻倍 (140)，无视烧伤减攻'
    },
    
    // 【祸不单行 Hex】鬼火流特攻手核心
    // 目标有异常状态时威力翻倍
    'Hex': {
        basePowerCallback: (attacker, defender, move, battle) => {
            if (defender.status) {
                console.log(`[Hex] 目标有异常状态，威力翻倍！130`);
                return 130;
            }
            return 65;
        },
        description: '目标有异常状态时威力翻倍 (130)'
    },
    
    // 【报复 Payback】被打后威力翻倍
    'Payback': {
        basePowerCallback: (attacker, defender, move, battle) => {
            // 简化：如果速度比对手慢，视为后手，威力翻倍
            const mySpeed = attacker.getStat ? attacker.getStat('spe') : attacker.spe;
            const enemySpeed = defender.getStat ? defender.getStat('spe') : defender.spe;
            if (mySpeed < enemySpeed) {
                return 100;
            }
            return 50;
        },
        description: '后手时威力翻倍 (100)'
    },
    
    // 【报仇 Revenge】被打后威力翻倍
    'Revenge': {
        basePowerCallback: (attacker, defender, move, battle) => {
            // 如果本回合受到过伤害，威力翻倍
            if (attacker.turnData && attacker.turnData.lastDamageTaken && attacker.turnData.lastDamageTaken.amount > 0) {
                return 120;
            }
            return 60;
        },
        description: '本回合受伤后威力翻倍 (120)'
    },
    
    // 【觉醒力量 Wake-Up Slap】目标睡眠时威力翻倍并唤醒
    'Wake-Up Slap': {
        basePowerCallback: (attacker, defender, move, battle) => {
            if (defender.status === 'slp') {
                return 140;
            }
            return 70;
        },
        onAfterHit: (attacker, defender, move, damage, logs) => {
            if (defender.status === 'slp' && damage > 0) {
                defender.status = null;
                defender.sleepTurns = 0;
                logs.push(`${defender.cnName} 被打醒了！`);
            }
        },
        description: '目标睡眠时威力翻倍并唤醒'
    },
    
    // 【光子喷涌】使用物攻和特攻中较高的一方计算伤害
    'Photon Geyser': {
        modifyAtk: (attacker, defender, isSpecial) => {
            const atkStat = attacker.getStat ? attacker.getStat('atk') : attacker.atk;
            const spaStat = attacker.getStat ? attacker.getStat('spa') : attacker.spa;
            // 使用较高的攻击能力
            const usedStat = Math.max(atkStat, spaStat);
            console.log(`[Photon Geyser] 物攻=${atkStat}, 特攻=${spaStat}, 使用=${usedStat}`);
            return usedStat;
        },
        description: '使用物攻和特攻中较高的一方计算伤害，无视目标特性'
    },
    
    // 【焚天灭世炽光爆】同样使用物攻和特攻中较高的一方
    'Light That Burns the Sky': {
        modifyAtk: (attacker, defender, isSpecial) => {
            const atkStat = attacker.getStat ? attacker.getStat('atk') : attacker.atk;
            const spaStat = attacker.getStat ? attacker.getStat('spa') : attacker.spa;
            const usedStat = Math.max(atkStat, spaStat);
            console.log(`[Light That Burns the Sky] 物攻=${atkStat}, 特攻=${spaStat}, 使用=${usedStat}`);
            return usedStat;
        },
        description: '使用物攻和特攻中较高的一方计算伤害，无视目标特性'
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
        // 【修复】移除 onHit 钩子，畏缩效果由 battle-effects.js 的 secondary 处理统一处理
        // 避免重复输出"畏缩了!"日志
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
    
    'Max Guard': {
        onUse: (attacker, defender, logs) => {
            // 与守住共享计数器
            const counter = attacker.protectCounter || 0;
            if (counter > 0) {
                const successChance = Math.pow(1/3, counter);
                if (Math.random() > successChance) {
                    logs.push(`但是失败了! (连续使用成功率降低)`);
                    return { failed: true };
                }
            }
            attacker.protectCounter = counter + 1;
            logs.push(`${attacker.cnName} 守住了自己!`);
            if (attacker.volatile) attacker.volatile.protect = true;
            return {};
        },
        description: '极巨化时的守住，与普通守住共享计数器'
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
            if (battle) battle.weather = 'rain'; // 标准值: rain
            logs.push('天空下起了大雨!');
            logs.push('<span style="color:#3498db">水系技能威力提升，火系技能威力下降!</span>');
            return { weather: 'rain' };
        },
        description: '召唤雨天'
    },
    
    'Sunny Day': {
        onUse: (attacker, defender, logs, battle) => {
            if (battle) battle.weather = 'sun'; // 标准值: sun
            logs.push('阳光变得强烈了!');
            logs.push('<span style="color:#e67e22">火系技能威力提升，水系技能威力下降!</span>');
            return { weather: 'sun' };
        },
        description: '召唤晴天'
    },
    
    'Sandstorm': {
        onUse: (attacker, defender, logs, battle) => {
            if (battle) battle.weather = 'sandstorm'; // 标准值: sandstorm
            logs.push('沙暴刮起来了!');
            logs.push('<span style="color:#d4ac0d">岩石系特防提升，非岩/地/钢系每回合受伤!</span>');
            return { weather: 'sandstorm' };
        },
        description: '召唤沙暴'
    },
    
    'Hail': {
        onUse: (attacker, defender, logs, battle) => {
            if (battle) battle.weather = 'hail'; // 标准值: hail
            logs.push('开始下冰雹了!');
            logs.push('<span style="color:#5dade2">非冰系每回合受伤!</span>');
            return { weather: 'hail' };
        },
        description: '召唤冰雹'
    },
    
    'Snowscape': {
        onUse: (attacker, defender, logs, battle) => {
            if (battle) battle.weather = 'snow'; // 标准值: snow
            logs.push('下起了雪!');
            logs.push('<span style="color:#85c1e9">冰系防御提升!</span>');
            return { weather: 'snow' };
        },
        description: '召唤雪天'
    },
    
    // ============================================
    // 6.5 环境动态技能 (Environment-Based Moves)
    // ============================================
    
    // 【天气球 Weather Ball】天气队核心补盲技能
    // 根据天气改变属性和威力
    'Weather Ball': {
        basePowerCallback: (attacker, defender, move, battle) => {
            // 有天气时威力翻倍
            if (battle && battle.weather && battle.weather !== 'none') {
                console.log(`[Weather Ball] 天气 ${battle.weather}，威力翻倍！100`);
                return 100;
            }
            return 50;
        },
        onModifyType: (move, attacker, battle) => {
            if (!battle || !battle.weather || battle.weather === 'none') return 'Normal';
            
            switch (battle.weather) {
                case 'sun':
                case 'harshsun':
                    return 'Fire';
                case 'rain':
                case 'heavyrain':
                    return 'Water';
                case 'sandstorm':
                    return 'Rock';
                case 'hail':
                case 'snow':
                    return 'Ice';
                default:
                    return 'Normal';
            }
        },
        description: '根据天气改变属性和威力'
    },
    
    // 【广域战力 Expanding Force】精神场地核心技能
    // 精神场地下威力提升，且变为全体攻击
    'Expanding Force': {
        basePowerCallback: (attacker, defender, move, battle) => {
            if (battle && battle.terrain === 'psychicterrain') {
                console.log(`[Expanding Force] 精神场地，威力提升！120`);
                return 120; // 80 * 1.5
            }
            return 80;
        },
        description: '精神场地下威力x1.5'
    },
    
    // 【冲浪 Rising Voltage】电气场地下威力翻倍
    'Rising Voltage': {
        basePowerCallback: (attacker, defender, move, battle) => {
            if (battle && battle.terrain === 'electricterrain') {
                console.log(`[Rising Voltage] 电气场地，威力翻倍！140`);
                return 140;
            }
            return 70;
        },
        description: '电气场地下威力翻倍'
    },
    
    // 【青草滑梯 Grassy Glide】青草场地下先制
    'Grassy Glide': {
        priority: 0, // 默认优先度
        onModifyPriority: (priority, user, target, move, battle) => {
            if (battle && battle.terrain === 'grassyterrain') {
                console.log(`[Grassy Glide] 青草场地，先制+1！`);
                return 1;
            }
            return priority;
        },
        description: '青草场地下先制'
    },
    
    // 【薄雾爆发 Misty Explosion】薄雾场地下威力x1.5
    'Misty Explosion': {
        basePowerCallback: (attacker, defender, move, battle) => {
            if (battle && battle.terrain === 'mistyterrain') {
                console.log(`[Misty Explosion] 薄雾场地，威力x1.5！150`);
                return 150;
            }
            return 100;
        },
        onUse: (attacker, defender, logs, battle) => {
            // 使用者倒下
            attacker.currHp = 0;
            logs.push(`${attacker.cnName} 引发了薄雾爆发！`);
            return { selfDestruct: true };
        },
        description: '薄雾场地下威力x1.5，使用者倒下'
    },
    
    // 【大地之力 Terrain Pulse】根据场地改变属性
    'Terrain Pulse': {
        basePowerCallback: (attacker, defender, move, battle) => {
            if (battle && battle.terrain && battle.terrain !== 'none') {
                return 100; // 威力翻倍
            }
            return 50;
        },
        onModifyType: (move, attacker, battle) => {
            if (!battle || !battle.terrain || battle.terrain === 'none') return 'Normal';
            
            switch (battle.terrain) {
                case 'electricterrain':
                    return 'Electric';
                case 'grassyterrain':
                    return 'Grass';
                case 'mistyterrain':
                    return 'Fairy';
                case 'psychicterrain':
                    return 'Psychic';
                default:
                    return 'Normal';
            }
        },
        description: '根据场地改变属性和威力'
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
            // 【天气统一】兼容 sun 和 harshsun
            if (battle && (battle.weather === 'sun' || battle.weather === 'harshsun')) {
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
            // 【天气统一】兼容 sun 和 harshsun
            if (battle && (battle.weather === 'sun' || battle.weather === 'harshsun')) {
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
    // 8.5 半无敌状态技能 (Semi-Invulnerable Moves)
    // ============================================
    // 注意：完整的两回合逻辑需要引擎支持 isCharging 状态
    // 这里简化为单回合版本，但保留 breaksProtect 等关键属性
    
    // 【潜灵奇袭 Phantom Force】多龙巴鲁托核心技能
    // 穿透守住，拖极巨化回合
    'Phantom Force': {
        breaksProtect: true, // 穿透守住
        onUse: (attacker, defender, logs, battle) => {
            // 简化：单回合版本
            logs.push(`${attacker.cnName} 消失在了异次元中...`);
            logs.push(`${attacker.cnName} 从异次元发动了攻击！`);
            return {};
        },
        description: '穿透守住'
    },
    
    // 【暗影潜袭 Shadow Force】骑拉帝纳专属
    'Shadow Force': {
        breaksProtect: true,
        onUse: (attacker, defender, logs, battle) => {
            logs.push(`${attacker.cnName} 消失在了暗影中...`);
            logs.push(`${attacker.cnName} 从暗影中发动了攻击！`);
            return {};
        },
        description: '穿透守住'
    },
    
    // 【飞翔 Fly】
    'Fly': {
        onUse: (attacker, defender, logs, battle) => {
            logs.push(`${attacker.cnName} 飞上了高空！`);
            logs.push(`${attacker.cnName} 俯冲攻击！`);
            return {};
        },
        description: '飞上高空后攻击'
    },
    
    // 【挖洞 Dig】
    'Dig': {
        onUse: (attacker, defender, logs, battle) => {
            logs.push(`${attacker.cnName} 钻入了地下！`);
            logs.push(`${attacker.cnName} 从地下发动攻击！`);
            return {};
        },
        description: '钻入地下后攻击'
    },
    
    // 【潜水 Dive】
    'Dive': {
        onUse: (attacker, defender, logs, battle) => {
            logs.push(`${attacker.cnName} 潜入了水中！`);
            logs.push(`${attacker.cnName} 从水中发动攻击！`);
            return {};
        },
        description: '潜入水中后攻击'
    },
    
    // 【弹跳 Bounce】
    'Bounce': {
        onUse: (attacker, defender, logs, battle) => {
            logs.push(`${attacker.cnName} 跳到了高空！`);
            logs.push(`${attacker.cnName} 落下攻击！`);
            return {};
        },
        secondary: { chance: 30, status: 'par' },
        description: '跳到高空后攻击，30%麻痹'
    },
    
    // 【天空落下 Sky Drop】
    'Sky Drop': {
        onUse: (attacker, defender, logs, battle) => {
            logs.push(`${attacker.cnName} 抓住 ${defender.cnName} 飞上了高空！`);
            logs.push(`${attacker.cnName} 将 ${defender.cnName} 摔落！`);
            return {};
        },
        description: '抓住对手飞上高空后摔落'
    },
    
    // ============================================
    // 8.6 延迟伤害技能 (Future Moves)
    // ============================================
    // 注意：完整的延迟伤害需要引擎支持 futureMove 队列
    // 这里简化为立即造成伤害，但保留无视免疫等关键属性
    
    // 【预知未来 Future Sight】再生力受队核心
    'Future Sight': {
        ignoreImmunity: true, // 无视一般免疫（恶系仍可被命中）
        onUse: (attacker, defender, logs, battle) => {
            logs.push(`${attacker.cnName} 预见了未来！`);
            // 简化：立即造成伤害而非延迟
            // 完整实现需要 battle.futureMove 队列
            return {};
        },
        description: '预见未来的攻击（简化为立即伤害）'
    },
    
    // 【破灭之愿 Doom Desire】基拉祈专属
    'Doom Desire': {
        ignoreImmunity: true,
        onUse: (attacker, defender, logs, battle) => {
            logs.push(`${attacker.cnName} 许下了破灭之愿！`);
            return {};
        },
        description: '许下破灭之愿（简化为立即伤害）'
    },
    
    // ============================================
    // 9. 其他特殊技能
    // ============================================
    
    'Explosion': {
        onUse: (attacker, defender, logs, battle) => {
            // 【Damp 湿气】检查场上是否有湿气特性
            const hasDamp = [attacker, defender].some(p => {
                if (!p || !p.ability) return false;
                const handler = typeof AbilityHandlers !== 'undefined' ? AbilityHandlers[p.ability] : null;
                return handler && handler.preventExplosion;
            });
            if (hasDamp) {
                logs.push(`<b style="color:#3498db">💧 湿气阻止了爆炸！</b>`);
                return { failed: true };
            }
            
            logs.push(`${attacker.cnName} 引爆了自己!`);
            // 自爆：使用者倒下
            attacker.currHp = 0;
            return { selfDestruct: true };
        },
        description: '使用者倒下'
    },
    
    'Self-Destruct': {
        onUse: (attacker, defender, logs, battle) => {
            // 【Damp 湿气】检查场上是否有湿气特性
            const hasDamp = [attacker, defender].some(p => {
                if (!p || !p.ability) return false;
                const handler = typeof AbilityHandlers !== 'undefined' ? AbilityHandlers[p.ability] : null;
                return handler && handler.preventExplosion;
            });
            if (hasDamp) {
                logs.push(`<b style="color:#3498db">💧 湿气阻止了自爆！</b>`);
                return { failed: true };
            }
            
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
            // 已经是纯水系则失败
            if (defender.types && defender.types.length === 1 && defender.types[0] === 'Water') {
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
    
    // 【魔法粉】：把对手变成纯超能力系
    'Magic Powder': {
        onHit: (attacker, defender, damage, logs) => {
            if (defender.ability === 'Multitype' || defender.ability === 'RKS System') {
                logs.push(`但是失败了!`);
                return;
            }
            // 已经是纯超能力系则失败
            if (defender.types && defender.types.length === 1 && defender.types[0] === 'Psychic') {
                logs.push(`但是失败了!`);
                return;
            }
            // 草系免疫粉末类招式
            if (defender.types && defender.types.includes('Grass')) {
                logs.push(`但是失败了! (草系免疫粉末)`);
                return;
            }
            if (defender.ability === 'Overcoat') {
                logs.push(`${defender.cnName} 的防尘特性使其免疫了粉末!`);
                return;
            }

            defender.types = ['Psychic'];
            logs.push(`${attacker.cnName} 撒下了魔法粉!`);
            logs.push(`<span style="color:#a855f7">✦ ${defender.cnName} 变成了 超能力 属性!</span>`);
            
            return { typeChange: true };
        },
        description: '将目标变为超能力属性'
    },
    
    // 【万圣夜】：给对手追加幽灵属性
    'Trick-or-Treat': {
        onHit: (attacker, defender, damage, logs) => {
            // 已经有幽灵属性则失败
            if (defender.types && defender.types.includes('Ghost')) {
                logs.push(`但是失败了!`);
                return;
            }

            defender.types = [...(defender.types || ['Normal']), 'Ghost'];
            logs.push(`${attacker.cnName} 邀请对手参加万圣夜派对!`);
            logs.push(`<span style="color:#9b59b6">✦ ${defender.cnName} 追加了 幽灵 属性!</span>`);
            
            return { typeChange: true };
        },
        description: '给目标追加幽灵属性'
    },
    
    // 【森林诅咒】：给对手追加草属性
    "Forest's Curse": {
        onHit: (attacker, defender, damage, logs) => {
            // 已经有草属性则失败
            if (defender.types && defender.types.includes('Grass')) {
                logs.push(`但是失败了!`);
                return;
            }

            defender.types = [...(defender.types || ['Normal']), 'Grass'];
            logs.push(`${attacker.cnName} 施加了森林的诅咒!`);
            logs.push(`<span style="color:#27ae60">✦ ${defender.cnName} 追加了 草 属性!</span>`);
            
            return { typeChange: true };
        },
        description: '给目标追加草属性'
    },
    
    // 【燃尽】：强力火系攻击，使用后失去火属性
    'Burn Up': {
        onHit: (attacker, defender, damage, logs) => {
            // 不是火系则失败（伤害仍然造成，但不会失去属性）
            if (!attacker.types || !attacker.types.includes('Fire')) {
                logs.push(`但是 ${attacker.cnName} 不是火属性，无法燃尽!`);
                return { failed: true };
            }

            // 移除火属性
            attacker.types = attacker.types.filter(t => t !== 'Fire');
            if (attacker.types.length === 0) {
                attacker.types = ['Normal']; // 变成无属性（游戏中显示为???，这里简化为Normal）
            }
            logs.push(`<span style="color:#e74c3c">🔥 ${attacker.cnName} 燃烧殆尽，失去了火属性!</span>`);
            
            return { typeChange: true, lostType: 'Fire' };
        },
        description: '强力火系攻击，使用后失去火属性'
    },
    
    // 【电光双击】：强力电系攻击，使用后失去电属性
    'Double Shock': {
        onHit: (attacker, defender, damage, logs) => {
            // 不是电系则失败
            if (!attacker.types || !attacker.types.includes('Electric')) {
                logs.push(`但是 ${attacker.cnName} 不是电属性，无法释放电光双击!`);
                return { failed: true };
            }

            // 移除电属性
            attacker.types = attacker.types.filter(t => t !== 'Electric');
            if (attacker.types.length === 0) {
                attacker.types = ['Normal'];
            }
            logs.push(`<span style="color:#f1c40f">⚡ ${attacker.cnName} 释放了全部电力，失去了电属性!</span>`);
            
            return { typeChange: true, lostType: 'Electric' };
        },
        description: '强力电系攻击，使用后失去电属性'
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
            // 【天气统一】兼容 sun 和 harshsun
            if (battle) {
                if (battle.weather === 'sun' || battle.weather === 'harshsun') {
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
            // 【天气统一】兼容 sun 和 harshsun
            if (battle) {
                if (battle.weather === 'sun' || battle.weather === 'harshsun') {
                    healRatio = 2/3;
                } else if (battle.weather && battle.weather !== 'none') {
                    healRatio = 0.25;
                }
            }
            const healAmount = Math.floor(attacker.maxHp * healRatio);
            const actualHeal = Math.min(healAmount, attacker.maxHp - attacker.currHp);
            if (actualHeal > 0) {
                attacker.currHp += actualHeal;
                logs.push(`${attacker.cnName} 吸收了清晨的露水恢复了体力!`);
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
            // 【天气统一】兼容 sun 和 harshsun
            if (battle) {
                if (battle.weather === 'sun' || battle.weather === 'harshsun') {
                    healRatio = 2/3;
                } else if (battle.weather && battle.weather !== 'none') {
                    healRatio = 0.25;
                }
            }
            const healAmount = Math.floor(attacker.maxHp * healRatio);
            const actualHeal = Math.min(healAmount, attacker.maxHp - attacker.currHp);
            if (actualHeal > 0) {
                attacker.currHp += actualHeal;
                logs.push(`${attacker.cnName} 吸收了月光恢复了体力!`);
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
    
    // 【换场 (Court Change)】交换双方场地效果 - 闪焰王牌专属
    'Court Change': {
        onHit: (attacker, defender, damage, logs, battle, isPlayer) => {
            if (!battle) return {};
            
            // 确保场地对象存在
            if (!battle.playerSide) battle.playerSide = {};
            if (!battle.enemySide) battle.enemySide = {};
            
            const pSide = battle.playerSide;
            const eSide = battle.enemySide;
            
            // 需要交换的场地效果
            const fieldsToSwap = [
                // 入场危害
                'spikes', 'toxicSpikes', 'stealthRock', 'stickyWeb',
                // 墙/屏障
                'auroraVeil', 'reflect', 'lightScreen',
                // 顺风/逆风
                'tailwind',
                // G-Max DOT 效果
                'gmaxWildfire', 'gmaxCannonade', 'gmaxVineLash', 'gmaxVolcalith'
            ];
            
            let swapped = false;
            fieldsToSwap.forEach(key => {
                const temp = pSide[key];
                if (pSide[key] || eSide[key]) swapped = true;
                pSide[key] = eSide[key];
                eSide[key] = temp;
            });
            
            if (swapped) {
                logs.push(`🔁 <b>${attacker.cnName}</b> 互换了双方的场地状态！(换场)`);
            } else {
                logs.push(`${attacker.cnName} 使用了换场，但场上没有可交换的效果...`);
            }
            
            // 视觉更新
            if (typeof window !== 'undefined' && typeof window.updateAllVisuals === 'function') {
                window.updateAllVisuals();
            }
            
            return { courtChange: true };
        },
        description: '互换双方场地的效果（钉子、墙、顺风、G-Max DOT）'
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
            attacker.sleepDuration = 3;
            
            logs.push(`${attacker.cnName} 睡着了并恢复了全部体力!`);
            
            // 【修复】立即检查状态治愈树果（零余果/木子果）
            if (typeof ItemEffects !== 'undefined' && ItemEffects.checkStatusBerry) {
                const berryLogs = [];
                const triggered = ItemEffects.checkStatusBerry(attacker, berryLogs);
                if (triggered) {
                    berryLogs.forEach(txt => logs.push(txt));
                }
            }
            
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

    // 【已移除】Tailwind 由 MoveEffects.applySideCondition 统一处理
    // 避免重复处理导致"成功后又显示失败"的 Bug

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
    },

    // ============================================
    // 生命置换系统 (HP Cost Mechanics)
    // ============================================

    // 【腹鼓】消耗50%HP，攻击直接+6
    'Belly Drum': {
        onUse: (user, target, logs) => {
            const cost = Math.floor(user.maxHp / 2);
            // 失败判定：血量不足 50%
            if (user.currHp <= cost) {
                logs.push(`<b style="color:#e74c3c">但是失败了！(体力不足)</b>`);
                return { failed: true };
            }
            // 失败判定：攻击等级已满 (+6)
            if (!user.boosts) user.boosts = {};
            if (user.boosts.atk >= 6) {
                logs.push(`<b style="color:#e74c3c">但是失败了！(攻击已经到了极限)</b>`);
                return { failed: true };
            }
            // 执行效果：扣血
            user.takeDamage(cost);
            // 强制将攻击等级设为 +6
            user.boosts.atk = 6;
            logs.push(`<b style="color:#e74c3c">🥁 ${user.cnName} 削减了体力，敲响腹鼓，将攻击提升到了极点！(Atk MAX)</b>`);
            if (typeof window.playSFX === 'function') window.playSFX('STAT_UP');

            // 【修复】强制触发一次 HP 阈值类道具检查 (文柚果/混乱果等)
            if (user.item) {
                const itemId = user.item.toLowerCase().replace(/[^a-z0-9]/g, '');
                const hpPercent = user.currHp / user.maxHp;
                
                // 文柚果: HP <= 50% 时回复 25%
                if (itemId === 'sitrusberry' && hpPercent <= 0.5) {
                    const heal = Math.floor(user.maxHp * 0.25);
                    user.currHp = Math.min(user.maxHp, user.currHp + heal);
                    user.item = null;
                    logs.push(`<span style="color:#27ae60">🍊 ${user.cnName} 吃掉了文柚果，回复了 ${heal} 点体力！</span>`);
                    if (typeof window.playSFX === 'function') window.playSFX('HEAL');
                }
                // 混乱果系列 (勿花果/异奇果/芒芒果/芭亚果/乐芭果): HP <= 25% 时回复 33%
                // 贪吃鬼特性: 触发线提升到 50%
                const confuseBerries = ['figyberry', 'wikiberry', 'magoberry', 'aguavberry', 'iapapaberry'];
                const isGluttony = user.ability && user.ability.toLowerCase().replace(/[^a-z]/g, '') === 'gluttony';
                const confuseTrigger = isGluttony ? 0.5 : 0.25;
                
                if (confuseBerries.includes(itemId) && hpPercent <= confuseTrigger) {
                    const heal = Math.floor(user.maxHp / 3);
                    user.currHp = Math.min(user.maxHp, user.currHp + heal);
                    const berryName = user.item;
                    user.item = null;
                    logs.push(`<span style="color:#27ae60">🍇 ${user.cnName} 吃掉了${berryName}，回复了 ${heal} 点体力！</span>`);
                    if (typeof window.playSFX === 'function') window.playSFX('HEAL');
                    // TODO: 性格不合时混乱判定
                }
            }

            if (typeof window.updateAllVisuals === 'function') window.updateAllVisuals(false);
            return { bellyDrum: true, success: true };
        },
        description: '消耗最大HP的一半，将攻击力提升至最大(+6)'
    },

    // 【甩肉/轻身】消耗50%HP，攻/特攻/速度+2
    'Fillet Away': {
        onUse: (user, target, logs) => {
            const cost = Math.floor(user.maxHp / 2);
            if (user.currHp <= cost) {
                logs.push(`<b style="color:#e74c3c">但是失败了！(体力不足以甩掉肉身)</b>`);
                return { failed: true };
            }
            // 检查是否所有能力都已满级
            if (!user.boosts) user.boosts = {};
            if (user.boosts.atk >= 6 && user.boosts.spa >= 6 && user.boosts.spe >= 6) {
                logs.push(`<b style="color:#e74c3c">但是失败了！(能力已经到了极限)</b>`);
                return { failed: true };
            }
            user.takeDamage(cost);
            logs.push(`<b style="color:#e91e63">🔪 ${user.cnName} 削减了自己的体力，身体变得轻盈了！</b>`);
            if (typeof user.applyBoost === 'function') {
                user.applyBoost('atk', 2);
                user.applyBoost('spa', 2);
                user.applyBoost('spe', 2);
            }
            if (typeof window.playSFX === 'function') window.playSFX('STAT_UP');
            if (typeof window.updateAllVisuals === 'function') window.updateAllVisuals(false);
            return { success: true };
        },
        description: '消耗50%体力，大幅提升攻击/特攻/速度(+2)'
    },

    // 【魂舞烈音爆】消耗33%HP，全属性+1
    'Clangorous Soul': {
        onUse: (user, target, logs) => {
            const cost = Math.floor(user.maxHp / 3);
            if (user.currHp <= cost) {
                logs.push(`<b style="color:#e74c3c">但是失败了！(体力不足以发出吼叫)</b>`);
                return { failed: true };
            }
            // 检查是否所有能力都已满级
            if (!user.boosts) user.boosts = {};
            const allMaxed = ['atk', 'def', 'spa', 'spd', 'spe'].every(s => (user.boosts[s] || 0) >= 6);
            if (allMaxed) {
                logs.push(`<b style="color:#e74c3c">但是失败了！(能力已经到了极限)</b>`);
                return { failed: true };
            }
            user.takeDamage(cost);
            logs.push(`<b style="color:#f1c40f">🐉 ${user.cnName} 跳起了战舞，浑身充满力量！</b>`);
            ['atk', 'def', 'spa', 'spd', 'spe'].forEach(stat => {
                if (typeof user.applyBoost === 'function') user.applyBoost(stat, 1);
            });
            if (typeof window.playSFX === 'function') window.playSFX('STAT_UP');
            if (typeof window.updateAllVisuals === 'function') window.updateAllVisuals(false);
            return { success: true };
        },
        description: '消耗1/3体力，全属性提升(+1)'
    },

    // 【惊爆大头】威力150火系特殊，使用后自损50%最大HP
    'Mind Blown': {
        onHit: (attacker, defender, damage, logs) => {
            const recoil = Math.ceil(attacker.maxHp / 2);
            attacker.takeDamage(recoil);
            logs.push(`<span style="color:#e11d48">💥 ${attacker.cnName} 的头炸裂了！受到了 ${recoil} 点反作用伤害！</span>`);
            if (typeof window.updateAllVisuals === 'function') window.updateAllVisuals(false);
            return {};
        },
        description: '威力150火系特殊，使用后自损50%最大HP'
    },

    // 【铁蹄光线】威力140钢系特殊，使用后自损50%最大HP
    'Steel Beam': {
        onHit: (attacker, defender, damage, logs) => {
            const recoil = Math.ceil(attacker.maxHp / 2);
            attacker.takeDamage(recoil);
            logs.push(`<span style="color:#95a5a6">⚡ ${attacker.cnName} 浑身射出了光芒！受到了 ${recoil} 点反作用伤害！</span>`);
            if (typeof window.updateAllVisuals === 'function') window.updateAllVisuals(false);
            return {};
        },
        description: '威力140钢系特殊，使用后自损50%最大HP'
    },

    // ============================================
    // 诅咒 (Curse) - 幽灵/非幽灵双模式
    // ============================================
    'Curse': {
        onUse: (user, target, logs) => {
            const isGhost = user.types && user.types.includes('Ghost');
            
            if (isGhost) {
                // 幽灵系：扣50%血，让对手每回合掉1/4
                const cost = Math.floor(user.maxHp / 2);
                if (user.currHp <= cost) {
                    logs.push(`<b style="color:#7c3aed">但是没法再削减体力了...</b>`);
                    return { failed: true };
                }
                user.takeDamage(cost);
                logs.push(`<b style="color:#7c3aed">👻 ${user.cnName} 削减体力诅咒了 ${target.cnName}！</b>`);
                // 给对手施加诅咒状态
                if (!target.volatile) target.volatile = {};
                target.volatile.curse = true;
                if (typeof window.updateAllVisuals === 'function') window.updateAllVisuals(false);
                return { success: true, ghostCurse: true };
            } else {
                // 非幽灵系：速度-1，攻防+1 (白诅咒)
                if (!user.boosts) user.boosts = {};
                // 检查攻防是否都已满级
                if ((user.boosts.atk || 0) >= 6 && (user.boosts.def || 0) >= 6) {
                    logs.push(`<b style="color:#e74c3c">但是失败了！(能力已经到了极限)</b>`);
                    return { failed: true };
                }
                if (typeof user.applyBoost === 'function') {
                    user.applyBoost('spe', -1);
                    user.applyBoost('atk', 1);
                    user.applyBoost('def', 1);
                }
                logs.push(`${user.cnName} 的速度降低，但肌肉膨胀了！(攻防提升)`);
                return { success: true, whiteCurse: true };
            }
        },
        description: '幽灵系削血诅咒对手；非幽灵系降低速度换攻防'
    },

    // ============================================
    // 挥指 (Metronome) - 随机招式
    // ============================================
    'Metronome': {
        onUse: (user, target, logs, battle, isPlayer) => {
            // 安全招式池（避免摇出复杂递归或自爆）
            const safePool = [
                'Flamethrower', 'Ice Beam', 'Thunderbolt', 'Psychic', 'Earthquake',
                'Surf', 'Shadow Ball', 'Dazzling Gleam', 'Hyper Beam', 'Air Slash',
                'Dark Pulse', 'Flash Cannon', 'Energy Ball', 'Sludge Bomb', 'Stone Edge',
                'Close Combat', 'Brave Bird', 'Draco Meteor', 'Moonblast', 'Play Rough'
            ];
            const rndMoveName = safePool[Math.floor(Math.random() * safePool.length)];
            
            logs.push(`${user.cnName} 摆动了手指...`);
            logs.push(`<b style="color:#d4ac0d">✨ 使出了 ${rndMoveName}！</b>`);
            
            // 返回随机招式名，让引擎执行
            return { metronome: true, randomMove: rndMoveName };
        },
        description: '随机使出1种招式'
    },

    // ============================================
    // 终极冲击类 (Final Gambit / Explosion)
    // ============================================

    // 【搏命】造成等于自身当前HP的伤害，自己濒死
    'Final Gambit': {
        damageCallback: (attacker, defender) => {
            return attacker.currHp; // 造成等于自身当前HP的伤害
        },
        onHit: (attacker, defender, damage, logs) => {
            // 自己濒死
            attacker.currHp = 0;
            logs.push(`<span style="color:#e74c3c">💀 ${attacker.cnName} 拼尽全力后倒下了！</span>`);
            if (typeof window.updateAllVisuals === 'function') window.updateAllVisuals(false);
            return {};
        },
        description: '造成等于自身当前HP的伤害，自己濒死'
    },

    // 【治愈之愿】自己濒死，完全治愈下一只出场的宝可梦
    'Healing Wish': {
        onUse: (user, target, logs) => {
            user.currHp = 0;
            // 标记治愈之愿效果
            if (!user.side) user.side = {};
            user.side.healingWish = true;
            logs.push(`<b style="color:#ff69b4">💖 ${user.cnName} 化作了治愈之光！</b>`);
            if (typeof window.updateAllVisuals === 'function') window.updateAllVisuals(false);
            return { success: true, selfKO: true };
        },
        description: '自己濒死，完全治愈下一只出场的宝可梦'
    },

    // 【新月祈祷】自己濒死，完全治愈下一只出场的宝可梦（含PP）
    'Lunar Dance': {
        onUse: (user, target, logs) => {
            user.currHp = 0;
            if (!user.side) user.side = {};
            user.side.lunarDance = true;
            logs.push(`<b style="color:#9b59b6">🌙 ${user.cnName} 化作了月光！</b>`);
            if (typeof window.updateAllVisuals === 'function') window.updateAllVisuals(false);
            return { success: true, selfKO: true };
        },
        description: '自己濒死，完全治愈下一只出场的宝可梦（含PP）'
    },

    // 【同命】如果这回合被击倒，击倒自己的对手也会倒下
    'Destiny Bond': {
        onUse: (user, target, logs) => {
            // 连续使用检测
            if (user.lastMoveUsed === 'Destiny Bond') {
                logs.push(`<b style="color:#e74c3c">但是失败了！</b>`);
                return { failed: true };
            }
            if (!user.volatile) user.volatile = {};
            user.volatile.destinyBond = true;
            logs.push(`<b style="color:#7c3aed">💀 ${user.cnName} 想要和对手同归于尽！</b>`);
            return { success: true };
        },
        description: '如果这回合被击倒，击倒自己的对手也会倒下'
    },

    // 【挣扎】PP耗尽时的最后手段
    'Struggle': {
        onHit: (attacker, defender, damage, logs) => {
            // 反伤 1/4 最大HP
            const recoil = Math.max(1, Math.floor(attacker.maxHp / 4));
            attacker.takeDamage(recoil);
            logs.push(`<span style="color:#e74c3c">${attacker.cnName} 受到了反作用伤害！(-${recoil})</span>`);
            if (typeof window.updateAllVisuals === 'function') window.updateAllVisuals(false);
            return {};
        },
        description: 'PP耗尽时的最后手段，会受到反伤'
    },

    // ============================================
    // 治愈类招式 (Healing Moves)
    // ============================================

    // 【治愈铃声】治愈队伍所有异常状态
    'Heal Bell': {
        onUse: (user, target, logs, battle, isPlayer) => {
            logs.push(`<b style="color:#27ae60">🔔 治愈铃声响起！队伍的异常状态被治愈了！</b>`);
            user.status = null;
            return { success: true };
        },
        description: '治愈队伍所有宝可梦的异常状态'
    },

    // 【芳香治疗】同治愈铃声
    'Aromatherapy': {
        onUse: (user, target, logs, battle, isPlayer) => {
            logs.push(`<b style="color:#27ae60">🌸 芳香弥漫！队伍的异常状态被治愈了！</b>`);
            user.status = null;
            return { success: true };
        },
        description: '治愈队伍所有宝可梦的异常状态'
    },

    // ============================================
    // 场地清除招式 (Hazard Removal)
    // 注意：场地钉子设置由 move-effects.js 的 applySideCondition 处理
    // 这里只处理清除逻辑
    // ============================================

    // 【高速旋转】清除己方场地钉子 + 速度+1
    'Rapid Spin': {
        onHit: (attacker, defender, damage, logs, battle, isPlayer) => {
            if (!battle) return {};
            const userSide = isPlayer ? battle.playerSide : battle.enemySide;
            if (!userSide) return {};
            
            // 使用 move-effects.js 的 clearEntryHazards 函数
            if (typeof MoveEffects !== 'undefined' && MoveEffects.clearEntryHazards) {
                const clearLogs = MoveEffects.clearEntryHazards(userSide);
                clearLogs.forEach(l => logs.push(l));
            }
            
            // 速度+1 (第8世代新增效果)
            if (!attacker.boosts) attacker.boosts = {};
            attacker.boosts.spe = Math.min(6, (attacker.boosts.spe || 0) + 1);
            logs.push(`${attacker.cnName} 的速度提升了！`);
            
            return {};
        },
        description: '清除己方场地钉子，速度+1'
    },

    // 【清除浓雾】清除双方场地效果
    'Defog': {
        onUse: (user, target, logs, battle, isPlayer) => {
            if (!battle) return { failed: true };
            const userSide = isPlayer ? battle.playerSide : battle.enemySide;
            const targetSide = isPlayer ? battle.enemySide : battle.playerSide;
            
            let cleared = false;
            
            // 使用 move-effects.js 的 clearEntryHazards 函数
            if (typeof MoveEffects !== 'undefined' && MoveEffects.clearEntryHazards) {
                const userClearLogs = MoveEffects.clearEntryHazards(userSide);
                const targetClearLogs = MoveEffects.clearEntryHazards(targetSide);
                if (userClearLogs.length > 0 || targetClearLogs.length > 0) cleared = true;
            }
            
            // 清除对方壁
            if (targetSide) {
                if (targetSide.reflect > 0) { targetSide.reflect = 0; cleared = true; }
                if (targetSide.lightScreen > 0) { targetSide.lightScreen = 0; cleared = true; }
                if (targetSide.auroraVeil > 0) { targetSide.auroraVeil = 0; cleared = true; }
            }
            
            if (cleared) {
                logs.push(`<b style="color:#87ceeb">💨 浓雾散去，场地效果被清除了！</b>`);
            } else {
                logs.push(`浓雾散去...但是没有什么效果。`);
            }
            
            // 降低对手闪避
            if (!target.boosts) target.boosts = {};
            target.boosts.evasion = Math.max(-6, (target.boosts.evasion || 0) - 1);
            
            return { success: true };
        },
        description: '清除双方场地效果，降低对手闪避'
    },

    // ============================================
    // 通用 Max 极巨招式 (天气/场地效果)
    // ============================================
    
    'Max Flare': {
        isMax: true,
        onHit: (user, target, damage, logs, battle) => {
            if (battle && battle.weather !== 'sun') {
                battle.weather = 'sun'; // 标准值: sun
                battle.weatherTurns = 5;
                logs.push(`<span style="color:#f59e0b">☀️ 阳光变得强烈了！</span>`);
            }
            return {};
        },
        description: '造成伤害并召唤晴天'
    },
    
    'Max Geyser': {
        isMax: true,
        onHit: (user, target, damage, logs, battle) => {
            if (battle && battle.weather !== 'rain') {
                battle.weather = 'rain'; // 标准值: rain
                battle.weatherTurns = 5;
                logs.push(`<span style="color:#3b82f6">🌧️ 天空下起了大雨！</span>`);
            }
            return {};
        },
        description: '造成伤害并召唤雨天'
    },
    
    'Max Hailstorm': {
        isMax: true,
        onHit: (user, target, damage, logs, battle) => {
            if (battle && battle.weather !== 'hail') {
                battle.weather = 'hail'; // 标准值: hail
                battle.weatherTurns = 5;
                logs.push(`<span style="color:#a5f3fc">❄️ 冰雹开始下了！</span>`);
            }
            return {};
        },
        description: '造成伤害并召唤冰雹'
    },
    
    'Max Rockfall': {
        isMax: true,
        onHit: (user, target, damage, logs, battle) => {
            if (battle && battle.weather !== 'sandstorm') {
                battle.weather = 'sandstorm'; // 标准值: sandstorm
                battle.weatherTurns = 5;
                logs.push(`<span style="color:#d97706">🏜️ 沙暴刮起来了！</span>`);
            }
            return {};
        },
        description: '造成伤害并召唤沙暴'
    },
    
    'Max Overgrowth': {
        isMax: true,
        onHit: (user, target, damage, logs, battle) => {
            if (battle) {
                battle.terrain = 'grassyterrain';
                battle.terrainTurns = 5;
                logs.push(`<span style="color:#22c55e">🌿 脚下长出了青草！</span>`);
            }
            return {};
        },
        description: '造成伤害并展开青草场地'
    },
    
    'Max Lightning': {
        isMax: true,
        onHit: (user, target, damage, logs, battle) => {
            if (battle) {
                battle.terrain = 'electricterrain';
                battle.terrainTurns = 5;
                logs.push(`<span style="color:#facc15">⚡ 电流在脚下奔涌！</span>`);
            }
            return {};
        },
        description: '造成伤害并展开电气场地'
    },
    
    'Max Starfall': {
        isMax: true,
        onHit: (user, target, damage, logs, battle) => {
            if (battle) {
                battle.terrain = 'mistyterrain';
                battle.terrainTurns = 5;
                logs.push(`<span style="color:#f472b6">✨ 薄雾笼罩了战场！</span>`);
            }
            return {};
        },
        description: '造成伤害并展开薄雾场地'
    },
    
    'Max Mindstorm': {
        isMax: true,
        onHit: (user, target, damage, logs, battle) => {
            if (battle) {
                battle.terrain = 'psychicterrain';
                battle.terrainTurns = 5;
                logs.push(`<span style="color:#a78bfa">🔮 奇妙的感觉笼罩了战场！</span>`);
            }
            return {};
        },
        description: '造成伤害并展开精神场地'
    },
    
    'Max Airstream': {
        isMax: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!user.boosts) user.boosts = {};
            user.boosts.spe = Math.min(6, (user.boosts.spe || 0) + 1);
            logs.push(`<span style="color:#60a5fa">💨 ${user.cnName} 的速度提升了！</span>`);
            return {};
        },
        description: '造成伤害并提升己方速度'
    },
    
    'Max Knuckle': {
        isMax: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!user.boosts) user.boosts = {};
            user.boosts.atk = Math.min(6, (user.boosts.atk || 0) + 1);
            logs.push(`<span style="color:#ef4444">💪 ${user.cnName} 的攻击提升了！</span>`);
            return {};
        },
        description: '造成伤害并提升己方攻击'
    },
    
    'Max Ooze': {
        isMax: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!user.boosts) user.boosts = {};
            user.boosts.spa = Math.min(6, (user.boosts.spa || 0) + 1);
            logs.push(`<span style="color:#a855f7">🧪 ${user.cnName} 的特攻提升了！</span>`);
            return {};
        },
        description: '造成伤害并提升己方特攻'
    },
    
    'Max Steelspike': {
        isMax: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!user.boosts) user.boosts = {};
            user.boosts.def = Math.min(6, (user.boosts.def || 0) + 1);
            logs.push(`<span style="color:#94a3b8">🛡️ ${user.cnName} 的防御提升了！</span>`);
            return {};
        },
        description: '造成伤害并提升己方防御'
    },
    
    'Max Quake': {
        isMax: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!user.boosts) user.boosts = {};
            user.boosts.spd = Math.min(6, (user.boosts.spd || 0) + 1);
            logs.push(`<span style="color:#d97706">🌍 ${user.cnName} 的特防提升了！</span>`);
            return {};
        },
        description: '造成伤害并提升己方特防'
    },
    
    'Max Wyrmwind': {
        isMax: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!target.boosts) target.boosts = {};
            target.boosts.atk = Math.max(-6, (target.boosts.atk || 0) - 1);
            logs.push(`<span style="color:#7c3aed">🐉 ${target.cnName} 的攻击下降了！</span>`);
            return {};
        },
        description: '造成伤害并降低目标攻击'
    },
    
    'Max Phantasm': {
        isMax: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!target.boosts) target.boosts = {};
            target.boosts.def = Math.max(-6, (target.boosts.def || 0) - 1);
            logs.push(`<span style="color:#6366f1">👻 ${target.cnName} 的防御下降了！</span>`);
            return {};
        },
        description: '造成伤害并降低目标防御'
    },
    
    'Max Darkness': {
        isMax: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!target.boosts) target.boosts = {};
            target.boosts.spd = Math.max(-6, (target.boosts.spd || 0) - 1);
            logs.push(`<span style="color:#1f2937">🌑 ${target.cnName} 的特防下降了！</span>`);
            return {};
        },
        description: '造成伤害并降低目标特防'
    },
    
    'Max Flutterby': {
        isMax: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!target.boosts) target.boosts = {};
            target.boosts.spa = Math.max(-6, (target.boosts.spa || 0) - 1);
            logs.push(`<span style="color:#84cc16">🦋 ${target.cnName} 的特攻下降了！</span>`);
            return {};
        },
        description: '造成伤害并降低目标特攻'
    },
    
    'Max Strike': {
        isMax: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!target.boosts) target.boosts = {};
            target.boosts.spe = Math.max(-6, (target.boosts.spe || 0) - 1);
            logs.push(`<span style="color:#6b7280">⚡ ${target.cnName} 的速度下降了！</span>`);
            return {};
        },
        description: '造成伤害并降低目标速度'
    },

    // ============================================
    // G-Max 超极巨招式处理器 (不触发天气/场地)
    // ============================================
    
    // === 1. 持续伤害类 (DOT Field) - 4回合非对应属性扣 1/6 HP ===
    'G-Max Wildfire': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!battle) return {};
            const targetSide = (user === battle.getPlayer()) ? battle.enemySide : battle.playerSide;
            if (!targetSide.gmaxWildfire) {
                targetSide.gmaxWildfire = { turns: 4 };
                logs.push(`<span style="color:#ef4444">🔥 烈焰包围了战场！非火属性宝可梦将持续受到伤害！</span>`);
            }
            return {};
        },
        description: '造成伤害，4回合内非火属性宝可梦每回合受到1/6最大HP伤害'
    },
    
    'G-Max Vine Lash': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!battle) return {};
            const targetSide = (user === battle.getPlayer()) ? battle.enemySide : battle.playerSide;
            if (!targetSide.gmaxVineLash) {
                targetSide.gmaxVineLash = { turns: 4 };
                logs.push(`<span style="color:#22c55e">🌿 致命藤蔓缠绕了战场！非草属性宝可梦将持续受到伤害！</span>`);
            }
            return {};
        },
        description: '造成伤害，4回合内非草属性宝可梦每回合受到1/6最大HP伤害'
    },
    
    'G-Max Cannonade': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!battle) return {};
            const targetSide = (user === battle.getPlayer()) ? battle.enemySide : battle.playerSide;
            if (!targetSide.gmaxCannonade) {
                targetSide.gmaxCannonade = { turns: 4 };
                logs.push(`<span style="color:#3b82f6">💧 激流在战场上翻涌！非水属性宝可梦将持续受到伤害！</span>`);
            }
            return {};
        },
        description: '造成伤害，4回合内非水属性宝可梦每回合受到1/6最大HP伤害'
    },
    
    'G-Max Volcalith': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!battle) return {};
            const targetSide = (user === battle.getPlayer()) ? battle.enemySide : battle.playerSide;
            if (!targetSide.gmaxVolcalith) {
                targetSide.gmaxVolcalith = { turns: 4 };
                logs.push(`<span style="color:#f97316">�ite 炽热岩石散落战场！非岩属性宝可梦将持续受到伤害！</span>`);
            }
            return {};
        },
        description: '造成伤害，4回合内非岩属性宝可梦每回合受到1/6最大HP伤害'
    },
    
    // === 2. 场地/墙类 ===
    'G-Max Resonance': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!battle) return {};
            const userSide = (user === battle.getPlayer()) ? battle.playerSide : battle.enemySide;
            // 【道具统一】使用规范化 ID 比较
            const userItemId = (user.item || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const itemExt = (userItemId === 'lightclay') ? 3 : 0;
            if (!userSide.auroraVeil || userSide.auroraVeil <= 0) {
                userSide.auroraVeil = 5 + itemExt;
                logs.push(`<b style="color:#a5f3fc">❄️ 极光旋律开启了极光幕！物理和特殊伤害都将减半！</b>`);
            }
            return {};
        },
        description: '造成伤害并开启极光幕(无视天气)'
    },
    
    'G-Max Steelsurge': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!battle) return {};
            const targetSide = (user === battle.getPlayer()) ? battle.enemySide : battle.playerSide;
            if (!targetSide.gmaxSteelsurge) {
                targetSide.gmaxSteelsurge = true;
                logs.push(`<span style="color:#94a3b8">⚙️ 尖锐的钢刺散布在对手场地！</span>`);
            }
            return {};
        },
        description: '造成伤害并在对方场地设置钢之撒菱'
    },
    
    'G-Max Stonesurge': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!battle) return {};
            const targetSide = (user === battle.getPlayer()) ? battle.enemySide : battle.playerSide;
            if (!targetSide.stealthRock) {
                targetSide.stealthRock = true;
                logs.push(`<span style="color:#a8a29e">🪨 尖锐的岩石漂浮在对手场地周围！</span>`);
            }
            return {};
        },
        description: '造成伤害并设置隐形岩'
    },
    
    // === 3. 状态异常类 ===
    'G-Max Befuddle': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (target.status) return {};
            const rand = Math.random();
            let status = 'psn';
            if (rand < 0.33) status = 'slp';
            else if (rand < 0.66) status = 'par';
            
            if (typeof MoveEffects !== 'undefined' && MoveEffects.tryInflictStatus) {
                const res = MoveEffects.tryInflictStatus(target, status);
                if (res && res.success) logs.push(res.message);
            }
            return {};
        },
        description: '造成伤害并随机使目标陷入睡眠/麻痹/中毒'
    },
    
    'G-Max Volt Crash': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (typeof MoveEffects !== 'undefined' && MoveEffects.tryInflictStatus) {
                const res = MoveEffects.tryInflictStatus(target, 'par');
                if (res && res.success) logs.push(res.message);
            }
            return {};
        },
        description: '造成伤害并使目标麻痹'
    },
    
    'G-Max Stun Shock': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (target.status) return {};
            const status = Math.random() < 0.5 ? 'par' : 'psn';
            if (typeof MoveEffects !== 'undefined' && MoveEffects.tryInflictStatus) {
                const res = MoveEffects.tryInflictStatus(target, status);
                if (res && res.success) logs.push(res.message);
            }
            return {};
        },
        description: '造成伤害并随机使目标麻痹或中毒'
    },
    
    'G-Max Malodor': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (typeof MoveEffects !== 'undefined' && MoveEffects.tryInflictStatus) {
                const res = MoveEffects.tryInflictStatus(target, 'psn');
                if (res && res.success) logs.push(res.message);
            }
            return {};
        },
        description: '造成伤害并使目标中毒'
    },
    
    'G-Max Snooze': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!target.volatile) target.volatile = {};
            if (!target.volatile.yawn) {
                target.volatile.yawn = 2;
                logs.push(`<span style="color:#a78bfa">😴 ${target.cnName} 开始打哈欠了...</span>`);
            }
            return {};
        },
        description: '造成伤害并使目标进入哈欠状态(下回合睡着)'
    },
    
    // === 4. 资源回复类 ===
    'G-Max Replenish': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!user.item && user._consumedBerry && Math.random() < 0.5) {
                user.item = user._consumedBerry;
                logs.push(`<span style="color:#22c55e">🍎 ${user.cnName} 捡回了${user._consumedBerry}！</span>`);
            }
            return {};
        },
        description: '造成伤害，50%概率恢复已消耗的树果'
    },
    
    'G-Max Finale': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            const heal = Math.floor(user.maxHp / 6);
            user.currHp = Math.min(user.maxHp, user.currHp + heal);
            logs.push(`<span style="color:#f472b6">🎂 ${user.cnName} 回复了 ${heal} HP！</span>`);
            return {};
        },
        description: '造成伤害并回复己方1/6最大HP'
    },
    
    // === 5. 能力变化类 ===
    'G-Max Chi Strike': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!user.volatile) user.volatile = {};
            user.volatile.focusenergy = true;
            logs.push(`<span style="color:#ef4444">💪 ${user.cnName} 气势高涨！暴击率大幅提升！</span>`);
            return {};
        },
        description: '造成伤害并大幅提升暴击率'
    },
    
    'G-Max Terror': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!target.volatile) target.volatile = {};
            target.volatile.trapped = true;
            logs.push(`<span style="color:#7c3aed">👻 ${target.cnName} 被恐惧笼罩，无法逃走！</span>`);
            return {};
        },
        description: '造成伤害并使目标无法逃走'
    },
    
    'G-Max Cuddle': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!target.volatile) target.volatile = {};
            target.volatile.infatuated = true;
            logs.push(`<span style="color:#ec4899">💕 ${target.cnName} 被迷住了！</span>`);
            return {};
        },
        description: '造成伤害并使目标着迷'
    },
    
    // === 6. 御三家/武道熊师 破格类 ===
    'G-Max Fireball': {
        isGMax: true,
        noWeather: true,
        ignoreAbility: true,
        description: '造成伤害，无视目标特性'
    },
    
    'G-Max Hydrosnipe': {
        isGMax: true,
        noWeather: true,
        ignoreAbility: true,
        description: '造成伤害，无视目标特性'
    },
    
    'G-Max Drum Solo': {
        isGMax: true,
        noWeather: true,
        ignoreAbility: true,
        description: '造成伤害，无视目标特性'
    },
    
    'G-Max One Blow': {
        isGMax: true,
        noWeather: true,
        bypassProtect: true,
        description: '造成伤害，无视守住'
    },
    
    'G-Max Rapid Flow': {
        isGMax: true,
        noWeather: true,
        bypassProtect: true,
        description: '造成伤害，无视守住'
    },
    
    // === 7. 其他 G-Max 招式 (基础效果) ===
    'G-Max Gold Rush': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (typeof MoveEffects !== 'undefined' && MoveEffects.tryInflictStatus) {
                const res = MoveEffects.tryInflictStatus(target, 'confusion');
                if (res && res.success) logs.push(res.message);
            }
            return {};
        },
        description: '造成伤害并使目标混乱'
    },
    
    'G-Max Smite': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (typeof MoveEffects !== 'undefined' && MoveEffects.tryInflictStatus) {
                const res = MoveEffects.tryInflictStatus(target, 'confusion');
                if (res && res.success) logs.push(res.message);
            }
            return {};
        },
        description: '造成伤害并使目标混乱'
    },
    
    'G-Max Foam Burst': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!target.boosts) target.boosts = {};
            target.boosts.spe = Math.max(-6, (target.boosts.spe || 0) - 2);
            logs.push(`<span style="color:#3b82f6">🫧 ${target.cnName} 的速度大幅下降！</span>`);
            return {};
        },
        description: '造成伤害并大幅降低目标速度'
    },
    
    'G-Max Centiferno': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!target.volatile) target.volatile = {};
            target.volatile.partiallytrapped = { turns: 4, source: user };
            logs.push(`<span style="color:#ef4444">🔥 ${target.cnName} 被烈焰缠绕了！</span>`);
            return {};
        },
        description: '造成伤害并束缚目标4-5回合'
    },
    
    'G-Max Sandblast': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!target.volatile) target.volatile = {};
            target.volatile.partiallytrapped = { turns: 4, source: user };
            logs.push(`<span style="color:#d97706">🏜️ ${target.cnName} 被沙暴缠绕了！</span>`);
            return {};
        },
        description: '造成伤害并束缚目标4-5回合'
    },
    
    'G-Max Wind Rage': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!battle) return {};
            const targetSide = (user === battle.getPlayer()) ? battle.enemySide : battle.playerSide;
            let cleared = false;
            if (targetSide) {
                if (targetSide.reflect > 0) { targetSide.reflect = 0; cleared = true; }
                if (targetSide.lightScreen > 0) { targetSide.lightScreen = 0; cleared = true; }
                if (targetSide.auroraVeil > 0) { targetSide.auroraVeil = 0; cleared = true; }
            }
            if (cleared) {
                logs.push(`<span style="color:#60a5fa">💨 对手的壁被吹散了！</span>`);
            }
            return {};
        },
        description: '造成伤害并清除对手的壁'
    },
    
    'G-Max Gravitas': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!battle) return {};
            // 【修复】使用 battle.field 而不是 battle.pseudoWeather
            if (!battle.field) battle.field = {};
            battle.field.gravity = 5;
            logs.push(`<b style="color:#a78bfa">🌌 重力场展开了！</b>`);
            return {};
        },
        description: '造成伤害并展开重力场'
    },
    
    'G-Max Depletion': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (target.moves && target.moves.length > 0) {
                const lastMove = target.lastMove;
                if (lastMove) {
                    const move = target.moves.find(m => m.name === lastMove || m.cn === lastMove);
                    if (move && move.pp > 0) {
                        move.pp = Math.max(0, move.pp - 2);
                        logs.push(`<span style="color:#7c3aed">⚡ ${target.cnName} 的 ${move.cn || move.name} PP减少了！</span>`);
                    }
                }
            }
            return {};
        },
        description: '造成伤害并减少目标最后使用招式的PP'
    },
    
    'G-Max Tartness': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!target.boosts) target.boosts = {};
            target.boosts.evasion = Math.max(-6, (target.boosts.evasion || 0) - 1);
            logs.push(`<span style="color:#84cc16">🍏 ${target.cnName} 的闪避率下降了！</span>`);
            return {};
        },
        description: '造成伤害并降低目标闪避率'
    },
    
    'G-Max Sweetness': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (user.status) {
                user.status = null;
                logs.push(`<span style="color:#22c55e">🍯 ${user.cnName} 的异常状态被治愈了！</span>`);
            }
            return {};
        },
        description: '造成伤害并治愈己方异常状态'
    },
    
    'G-Max Meltdown': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!target.volatile) target.volatile = {};
            target.volatile.torment = true;
            logs.push(`<span style="color:#94a3b8">🔩 ${target.cnName} 无法连续使用相同招式了！</span>`);
            return {};
        },
        description: '造成伤害并使目标无法连续使用相同招式'
    },
    
    // ============================================
    // 蓄力系列技能 (Stockpile / Spit Up / Swallow)
    // ============================================
    
    'Stockpile': {
        onUse: (user, target, logs, battle, isPlayer) => {
            if (!user.volatile) user.volatile = {};
            const currentStacks = user.volatile.stockpile || 0;
            
            // 最多蓄力 3 次
            if (currentStacks >= 3) {
                logs.push(`${user.cnName} 已经蓄满了！无法继续蓄力！`);
                return { failed: true };
            }
            
            user.volatile.stockpile = currentStacks + 1;
            const newStacks = user.volatile.stockpile;
            
            // 每次蓄力提升 1 级防御和特防
            const defDiff = user.applyBoost('def', 1);
            const spdDiff = user.applyBoost('spd', 1);
            
            logs.push(`${user.cnName} 蓄力了！(${newStacks}/3)`);
            if (defDiff > 0) logs.push(`${user.cnName} 的防御提升了！`);
            if (spdDiff > 0) logs.push(`${user.cnName} 的特防提升了！`);
            
            return {};
        },
        description: '蓄力（最多3次），每次提升1级防御和特防'
    },
    
    'Spit Up': {
        basePowerCallback: (attacker, defender) => {
            const stacks = (attacker.volatile && attacker.volatile.stockpile) || 0;
            // 威力 = 100 × 蓄力层数
            return stacks * 100;
        },
        onUse: (user, target, logs, battle, isPlayer) => {
            if (!user.volatile) user.volatile = {};
            const stacks = user.volatile.stockpile || 0;
            
            if (stacks === 0) {
                logs.push(`${user.cnName} 没有蓄力，喷出失败了！`);
                return { failed: true };
            }
            
            return {};
        },
        onHit: (user, target, damage, logs, battle) => {
            // 使用后清空蓄力层数并降低对应的防御/特防
            const stacks = (user.volatile && user.volatile.stockpile) || 0;
            if (stacks > 0) {
                user.applyBoost('def', -stacks);
                user.applyBoost('spd', -stacks);
                user.volatile.stockpile = 0;
                logs.push(`${user.cnName} 的蓄力消耗殆尽！防御和特防下降了！`);
            }
            return {};
        },
        description: '消耗蓄力层数造成伤害（100/200/300威力）'
    },
    
    'Swallow': {
        onUse: (user, target, logs, battle, isPlayer) => {
            if (!user.volatile) user.volatile = {};
            const stacks = user.volatile.stockpile || 0;
            
            if (stacks === 0) {
                logs.push(`${user.cnName} 没有蓄力，吞下失败了！`);
                return { failed: true };
            }
            
            // 回复量根据蓄力层数：1层=25%, 2层=50%, 3层=100%
            const healPercent = stacks === 1 ? 0.25 : (stacks === 2 ? 0.50 : 1.00);
            const healAmount = Math.floor(user.maxHp * healPercent);
            const actualHeal = Math.min(healAmount, user.maxHp - user.currHp);
            
            user.currHp = Math.min(user.maxHp, user.currHp + healAmount);
            logs.push(`${user.cnName} 吞下了蓄力！回复了 ${actualHeal} HP！`);
            
            // 消耗蓄力层数并降低对应的防御/特防
            user.applyBoost('def', -stacks);
            user.applyBoost('spd', -stacks);
            user.volatile.stockpile = 0;
            logs.push(`${user.cnName} 的蓄力消耗殆尽！防御和特防下降了！`);
            
            return {};
        },
        description: '消耗蓄力层数回复HP（25%/50%/100%）'
    },
    
    'Stuff Cheeks': {
        onUse: (user, target, logs, battle, isPlayer) => {
            // 检查是否持有树果
            const item = user.item || '';
            const isBerry = item.toLowerCase().includes('berry') || 
                           item.includes('果') ||
                           (typeof window !== 'undefined' && typeof window.isBerry === 'function' && window.isBerry(item));
            
            if (!item || !isBerry) {
                logs.push(`${user.cnName} 没有持有树果，大快朵颐失败了！`);
                return { failed: true };
            }
            
            // 强制吃掉树果
            const berryName = user.item;
            logs.push(`${user.cnName} 吃掉了 ${berryName}！`);
            
            // 触发树果效果（如果有 consumeItem 函数）
            if (typeof window !== 'undefined' && typeof window.consumeItem === 'function') {
                const itemLogs = window.consumeItem(user, battle);
                if (itemLogs && itemLogs.length) {
                    logs.push(...itemLogs);
                }
            } else {
                // 简化处理：直接清除道具
                user.item = null;
            }
            
            // 防御大幅提升 (+2)
            const defDiff = user.applyBoost('def', 2);
            if (defDiff > 0) {
                logs.push(`${user.cnName} 的防御大幅提升了！`);
            } else {
                logs.push(`${user.cnName} 的防御已经无法再提升了！`);
            }
            
            return {};
        },
        description: '吃掉持有的树果并大幅提升防御'
    },
    
    // ============================================
    // 刷新型 Volatile 技能 (Refreshable Volatile Moves)
    // 这些技能重复使用会刷新效果，不会失败
    // ============================================
    
    'Charge': {
        onUse: (user, target, logs, battle, isPlayer) => {
            if (!user.volatile) user.volatile = {};
            user.volatile.charge = true;
            
            // 充电还会提升特防
            const spdDiff = user.applyBoost('spd', 1);
            
            logs.push(`${user.cnName} 开始充电！`);
            if (spdDiff > 0) logs.push(`${user.cnName} 的特防提升了！`);
            logs.push(`<span style="color:#f59e0b">下回合电系招式威力翻倍！</span>`);
            
            return {};
        },
        description: '充电，下回合电系招式威力翻倍，特防+1'
    },
    
    'Defense Curl': {
        onUse: (user, target, logs, battle, isPlayer) => {
            if (!user.volatile) user.volatile = {};
            user.volatile.defensecurl = true;
            
            // 变圆提升防御
            const defDiff = user.applyBoost('def', 1);
            
            logs.push(`${user.cnName} 蜷缩起身体！`);
            if (defDiff > 0) {
                logs.push(`${user.cnName} 的防御提升了！`);
            } else {
                logs.push(`${user.cnName} 的防御已经无法再提升了！`);
            }
            
            return {};
        },
        description: '变圆，防御+1，滚动/冰球威力翻倍'
    },
    
    'Laser Focus': {
        onUse: (user, target, logs, battle, isPlayer) => {
            if (!user.volatile) user.volatile = {};
            user.volatile.laserfocus = true;
            
            logs.push(`${user.cnName} 集中精神！`);
            logs.push(`<span style="color:#ef4444">下回合攻击必定暴击！</span>`);
            
            return {};
        },
        description: '磨砺，下回合攻击必定暴击'
    },
    
    // ============================================
    // 滚动/冰球 (Rollout / Ice Ball)
    // 威力递增，变圆后威力翻倍
    // ============================================
    
    'Rollout': {
        basePowerCallback: (attacker, defender) => {
            // 基础威力 30，每次翻倍，最多5次 (30->60->120->240->480)
            const rolloutCount = attacker.volatile?.rolloutCount || 1;
            let power = 30 * Math.pow(2, rolloutCount - 1);
            
            // 变圆后威力翻倍
            if (attacker.volatile?.defensecurl) {
                power *= 2;
            }
            
            return Math.min(480, power);
        },
        onHit: (user, target, damage, logs, battle) => {
            if (!user.volatile) user.volatile = {};
            user.volatile.rolloutCount = (user.volatile.rolloutCount || 0) + 1;
            
            // 最多5次
            if (user.volatile.rolloutCount >= 5) {
                user.volatile.rolloutCount = 0;
                user.volatile.lockedMove = null;
            } else {
                user.volatile.lockedMove = 'Rollout';
            }
            
            return {};
        },
        onMiss: (user, target, logs) => {
            // 未命中则重置
            if (user.volatile) {
                user.volatile.rolloutCount = 0;
                user.volatile.lockedMove = null;
            }
            return {};
        },
        description: '滚动，威力递增，变圆后翻倍'
    },
    
    'Ice Ball': {
        basePowerCallback: (attacker, defender) => {
            const rolloutCount = attacker.volatile?.iceballCount || 1;
            let power = 30 * Math.pow(2, rolloutCount - 1);
            
            if (attacker.volatile?.defensecurl) {
                power *= 2;
            }
            
            return Math.min(480, power);
        },
        onHit: (user, target, damage, logs, battle) => {
            if (!user.volatile) user.volatile = {};
            user.volatile.iceballCount = (user.volatile.iceballCount || 0) + 1;
            
            if (user.volatile.iceballCount >= 5) {
                user.volatile.iceballCount = 0;
                user.volatile.lockedMove = null;
            } else {
                user.volatile.lockedMove = 'Ice Ball';
            }
            
            return {};
        },
        onMiss: (user, target, logs) => {
            if (user.volatile) {
                user.volatile.iceballCount = 0;
                user.volatile.lockedMove = null;
            }
            return {};
        },
        description: '冰球，威力递增，变圆后翻倍'
    },

    // ============================================
    // 梦话 (Sleep Talk) - 睡眠中随机使用其他招式
    // ============================================
    'Sleep Talk': {
        onUse: (user, target, logs, battle) => {
            // 检查使用者是否睡眠（包括绝对睡眠特性）
            const userAbility = (user.ability || '').toLowerCase().replace(/[^a-z]/g, '');
            const isAsleep = user.status === 'slp' || userAbility === 'comatose';
            
            if (!isAsleep) {
                logs.push(`但是招式失败了！`);
                return { failed: true };
            }
            
            // 获取可用招式（排除梦话自身和不能被梦话调用的招式）
            const availableMoves = [];
            const userMoves = user.moves || [];
            
            for (const moveSlot of userMoves) {
                const moveName = moveSlot.name || moveSlot;
                if (moveName === 'Sleep Talk') continue; // 排除梦话自身
                
                // 检查招式是否有 nosleeptalk 标记
                const moveId = moveName.toLowerCase().replace(/[^a-z0-9]/g, '');
                const moveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
                if (moveData.flags && moveData.flags.nosleeptalk) continue;
                
                availableMoves.push(moveSlot);
            }
            
            if (availableMoves.length === 0) {
                logs.push(`但是招式失败了！`);
                return { failed: true };
            }
            
            // 随机选择一个招式
            const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
            const selectedMoveName = randomMove.name || randomMove;
            
            logs.push(`梦话选择了 ${selectedMoveName}！`);
            
            // 返回要执行的招式
            return { 
                callMove: randomMove,
                skipDamage: true // 跳过梦话本身的伤害计算
            };
        },
        description: '睡眠中随机使用其他招式'
    },

    // ============================================
    // 打鼾 (Snore) - 睡眠中使用的音波攻击
    // ============================================
    'Snore': {
        onUse: (user, target, logs, battle) => {
            // 检查使用者是否睡眠（包括绝对睡眠特性）
            const userAbility = (user.ability || '').toLowerCase().replace(/[^a-z]/g, '');
            const isAsleep = user.status === 'slp' || userAbility === 'comatose';
            
            if (!isAsleep) {
                logs.push(`但是招式失败了！`);
                return { failed: true };
            }
            
            // 打鼾可以正常使用，不需要特殊处理
            return {};
        },
        description: '睡眠中使用的音波攻击，可能使对手畏缩'
    },

    // ============================================
    // 珍藏 (Last Resort) - 必须已使用过其他所有招式
    // ============================================
    'Last Resort': {
        onUse: (user, target, logs, battle, isPlayer) => {
            const userMoves = user.moves || [];
            const usedMoves = user.usedMoves || new Set();
            
            // 统计需要使用的其他招式数量
            let otherMoveCount = 0;
            let usedOtherMoveCount = 0;
            
            for (const moveSlot of userMoves) {
                const moveName = moveSlot.name || moveSlot;
                if (moveName === 'Last Resort') continue;
                
                otherMoveCount++;
                if (usedMoves.has(moveName)) {
                    usedOtherMoveCount++;
                }
            }
            
            // 如果没有其他招式，或者还有招式没用过，则失败
            if (otherMoveCount === 0 || usedOtherMoveCount < otherMoveCount) {
                logs.push(`但是招式失败了！`);
                console.log(`[LAST RESORT] 失败：已用 ${usedOtherMoveCount}/${otherMoveCount} 个其他招式`);
                return { failed: true };
            }
            
            console.log(`[LAST RESORT] 成功：已用 ${usedOtherMoveCount}/${otherMoveCount} 个其他招式`);
            return {};
        },
        description: '必须已使用过其他所有招式才能发动'
    },

    // 注意：以下招式由 move-effects.js 统一处理，不需要在这里重复定义：
    // - Taunt, Encore, Disable -> MoveEffects.applyVolatileStatus
    // - Stealth Rock, Spikes, Toxic Spikes, Sticky Web -> MoveEffects.applySideCondition
    // - Haze -> MoveEffects (已有 onHit 处理器在上方)
    
    // ============================================
    // 【气场轮 Aura Wheel】- 莫鲁贝可专属，属性随形态变化
    // ============================================
    'Aura Wheel': {
        // 动态修改属性：满腹=电系，空腹=恶系
        onModifyType: (move, attacker, battle) => {
            const currentId = attacker.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            // 空腹模式(morpekohangry)变为恶系，否则为电系
            if (currentId.includes('hangry')) {
                return 'Dark';
            }
            return 'Electric';
        },
        // 只有莫鲁贝可能使用此招式
        onUse: (user, target, logs, battle, isPlayer) => {
            const currentId = user.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (!currentId.includes('morpeko')) {
                logs.push(`但是招式失败了！`);
                return { failed: true };
            }
            return {};
        },
        description: '莫鲁贝可专属，属性随形态变化(电/恶)，必定提升速度'
    },
    
    // ============================================
    // 【三重攻击 Tri Attack】- 20% 几率随机施加麻痹/灼伤/冰冻
    // ============================================
    'Tri Attack': {
        onHit: (user, target, damageDealt, logs, battle) => {
            // 20% 几率触发状态
            if (Math.random() * 100 >= 20) return {};
            
            // 目标已有状态则不施加
            if (target.status) return {};
            
            // 随机选择状态：麻痹/灼伤/冰冻
            const statuses = ['par', 'brn', 'frz'];
            const statusNames = { par: '麻痹', brn: '灼伤', frz: '冰冻' };
            const randomStatus = statuses[Math.floor(Math.random() * 3)];
            
            // 使用 MoveEffects.tryInflictStatus 进行状态免疫检查
            if (typeof MoveEffects !== 'undefined' && MoveEffects.tryInflictStatus) {
                const result = MoveEffects.tryInflictStatus(target, randomStatus, user, battle);
                if (result.success) {
                    logs.push(result.message);
                }
            } else {
                target.status = randomStatus;
                logs.push(`${target.cnName} ${statusNames[randomStatus]}了!`);
            }
            
            return {};
        },
        description: '20% 几率随机施加麻痹/灼伤/冰冻之一'
    },
    
    // ============================================
    // 【吵闹 Uproar】- 持续3回合，期间全场无法入睡
    // ============================================
    'Uproar': {
        onUse: (user, target, logs, battle, isPlayer) => {
            // 初始化或继续吵闹状态
            if (!user.volatile) user.volatile = {};
            
            if (!user.volatile.uproar) {
                // 开始吵闹，持续3回合
                user.volatile.uproar = 3;
                logs.push(`<span style="color:#f39c12">📢 ${user.cnName} 开始大吵大闹了！</span>`);
            } else {
                // 继续吵闹
                logs.push(`<span style="color:#f39c12">📢 ${user.cnName} 继续大吵大闹！</span>`);
            }
            
            // 唤醒场上所有睡着的宝可梦
            if (battle) {
                const playerPoke = battle.playerParty?.[battle.playerActive];
                const enemyPoke = battle.enemyParty?.[battle.enemyActive];
                
                if (playerPoke && playerPoke.status === 'slp' && playerPoke !== user) {
                    playerPoke.status = null;
                    playerPoke.statusTurns = 0;
                    logs.push(`${playerPoke.cnName} 被吵醒了！`);
                }
                if (enemyPoke && enemyPoke.status === 'slp' && enemyPoke !== user) {
                    enemyPoke.status = null;
                    enemyPoke.statusTurns = 0;
                    logs.push(`${enemyPoke.cnName} 被吵醒了！`);
                }
            }
            
            return {};
        },
        onEndTurn: (pokemon, logs, battle) => {
            // 回合结束时减少吵闹计数
            if (pokemon.volatile?.uproar) {
                pokemon.volatile.uproar--;
                if (pokemon.volatile.uproar <= 0) {
                    delete pokemon.volatile.uproar;
                    logs.push(`${pokemon.cnName} 停止了吵闹。`);
                }
            }
        },
        description: '持续3回合大吵大闹，期间全场无法入睡，已睡着的会被吵醒'
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
