/**
 * =============================================
 * ABILITY HANDLERS - 特性处理器
 * =============================================
 * 
 * 仅收录 Top 25 + 常见 RP 特性。
 * 使用 Hook 系统注入到 battle-engine.js 的各个环节。
 */

// 简单的辅助工具
function isPinching(poke) {
    return poke.currHp > 0 && poke.currHp <= poke.maxHp / 3;
}

const AbilityHandlers = {
    // ============================================
    // A. 暴力数值修正
    // ============================================
  
    // 【大力士/瑜伽之力】物攻翻倍
    'Huge Power': { onModifyStat: (stats) => stats.atk *= 2 },
    'Pure Power': { onModifyStat: (stats) => stats.atk *= 2 },

    // 【技术高手】低威力(<=60)招式 x1.5
    'Technician': {
        onBasePower: (power, attacker, defender, move) => {
            if (power <= 60) return power * 1.5;
            return power;
        }
    },

    // 【适应力】本系加成从 1.5 -> 2.0
    'Adaptability': {
        // 这一条比较特殊，我们通过修改 stab 倍率实现，需在 calcDamage 里特别判断
        onModifySTAB: (stab) => 2
    },

    // 【有色眼镜】效果不好(X0.5)时变为正常(X1)
    'Tinted Lens': {
        onModifyEffectiveness: (eff) => {
            if (eff < 1 && eff > 0) return eff * 2;
            return eff;
        }
    },

    // ============================================
    // B. 御三家专属 - 绝境爆发 (红血变身)
    // ============================================
    'Blaze': {
        onBasePower: (power, attacker, defender, move) => {
            if (move.type === 'Fire' && isPinching(attacker)) return power * 1.5;
            return power;
        }
    },
    'Torrent': {
        onBasePower: (power, attacker, defender, move) => {
            if (move.type === 'Water' && isPinching(attacker)) return power * 1.5;
            return power;
        }
    },
    'Overgrow': {
        onBasePower: (power, attacker, defender, move) => {
            if (move.type === 'Grass' && isPinching(attacker)) return power * 1.5;
            return power;
        }
    },
    'Swarm': {
        onBasePower: (power, attacker, defender, move) => {
            if (move.type === 'Bug' && isPinching(attacker)) return power * 1.5;
            return power;
        }
    },

    // ============================================
    // C. 特殊防御/开眼
    // ============================================

    // 【漂浮】免疫地面
    'Levitate': {
        onImmunity: (atkType) => atkType === 'Ground'
    },
    // 【引火】免疫火系
    'Flash Fire': {
        onImmunity: (atkType) => atkType === 'Fire'
    },
    // 【储水】免疫水系
    'Water Absorb': {
        onImmunity: (atkType) => atkType === 'Water'
    },
    // 【避雷针】免疫电系
    'Lightning Rod': {
        onImmunity: (atkType) => atkType === 'Electric'
    },
    // 【蓄电】免疫电系
    'Volt Absorb': {
        onImmunity: (atkType) => atkType === 'Electric'
    },
    // 【电气引擎】免疫电系
    'Motor Drive': {
        onImmunity: (atkType) => atkType === 'Electric'
    },
    // 【食草】免疫草系
    'Sap Sipper': {
        onImmunity: (atkType) => atkType === 'Grass'
    },
    // 【干燥皮肤】免疫水系
    'Dry Skin': {
        onImmunity: (atkType) => atkType === 'Water'
    },
  
    // 【神奇鳞片】异常状态时防御 x1.5 (此处简化为物防)
    'Marvel Scale': {
        onModifyStat: (stats, poke) => { 
            if (poke.status) stats.def = Math.floor(stats.def * 1.5); 
        }
    },
  
    // 【坚硬/结实】满血时至少保留1血
    'Sturdy': {
        onDamageHack: (damage, defender) => {
            if (defender.currHp === defender.maxHp && damage >= defender.currHp) {
                return defender.currHp - 1; // 锁血1
            }
            return damage;
        }
    },
  
    // 【神奇守护】鬼蝉：只能被克制技能打中（在 calcDamage 里特判）
    'Wonder Guard': {
        // 这个逻辑太深，稍后在引擎里写一个 flag 检查
    },

    // 【厚脂肪】减半火/冰伤害
    'Thick Fat': {
        onDefenderModifyDamage: (damage, attacker, defender, move) => {
            if (move.type === 'Fire' || move.type === 'Ice') {
                return Math.floor(damage * 0.5);
            }
            return damage;
        }
    },

    // 【毛皮大衣】物防翻倍
    'Fur Coat': {
        onModifyStat: (stats) => stats.def *= 2
    },

    // 【滤镜/坚硬岩石】克制伤害减少25%
    'Filter': {
        onDefenderModifyDamage: (damage, attacker, defender, move, effectiveness) => {
            if (effectiveness > 1) return Math.floor(damage * 0.75);
            return damage;
        }
    },
    'Solid Rock': {
        onDefenderModifyDamage: (damage, attacker, defender, move, effectiveness) => {
            if (effectiveness > 1) return Math.floor(damage * 0.75);
            return damage;
        }
    },

    // 【多重鳞片】满血时伤害减半
    'Multiscale': {
        onDefenderModifyDamage: (damage, attacker, defender, move) => {
            if (defender.currHp === defender.maxHp) {
                return Math.floor(damage * 0.5);
            }
            return damage;
        }
    },
    // 【暗影盾牌】满血时伤害减半
    'Shadow Shield': {
        onDefenderModifyDamage: (damage, attacker, defender, move) => {
            if (defender.currHp === defender.maxHp) {
                return Math.floor(damage * 0.5);
            }
            return damage;
        }
    },

    // ============================================
    // D. 入场效果 (Intimidate / Weather)
    // ============================================
  
    // 【威吓】
    'Intimidate': {
        onStart: (self, enemy, logs) => {
            if (!enemy || !enemy.isAlive()) return;
            // 检查对方是否有防止下降的特性
            const safe = ['Clear Body', 'White Smoke', 'Full Metal Body', 'Inner Focus', 'Oblivious', 'Hyper Cutter', 'Scrappy', 'Own Tempo'];
            if (enemy.ability && safe.includes(enemy.ability)) {
                logs.push(`(对方的 ${enemy.ability} 免疫了威吓!)`);
                return;
            }
            if (typeof enemy.applyBoost === 'function') {
                enemy.applyBoost('atk', -1);
                logs.push(`${self.cnName} 的威吓让对手稍微退缩了! (攻击降低)`);
                if (typeof window.playSFX === 'function') window.playSFX('STAT_DOWN');
            }
        }
    },

    // 【降雨】
    'Drizzle': {
        onStart: (self, enemy, logs, battle) => {
            if (battle) battle.weather = 'raindance';
            logs.push(`🌧️ ${self.cnName} 带来了降雨!`);
        }
    },
    // 【日照】
    'Drought': {
        onStart: (self, enemy, logs, battle) => {
            if (battle) battle.weather = 'sunnyday';
            logs.push(`☀️ ${self.cnName} 让阳光变得强烈了!`);
        }
    },
    // 【扬沙】
    'Sand Stream': {
        onStart: (self, enemy, logs, battle) => {
            if (battle) battle.weather = 'sandstorm';
            logs.push(`🌪️ ${self.cnName} 扬起了沙暴!`);
        }
    },
    // 【降雪】
    'Snow Warning': {
        onStart: (self, enemy, logs, battle) => {
            if (battle) battle.weather = 'snow';
            logs.push(`❄️ ${self.cnName} 让天空开始下雪了!`);
        }
    },

    // 【电气制造者】
    'Electric Surge': {
        onStart: (self, enemy, logs, battle) => {
            if (battle) battle.terrain = 'electricterrain';
            logs.push(`⚡ ${self.cnName} 脚下电流涌动!`);
        }
    },
    // 【精神制造者】
    'Psychic Surge': {
        onStart: (self, enemy, logs, battle) => {
            if (battle) battle.terrain = 'psychicterrain';
            logs.push(`🔮 ${self.cnName} 脚下奇妙的感觉蔓延开来!`);
        }
    },
    // 【青草制造者】
    'Grassy Surge': {
        onStart: (self, enemy, logs, battle) => {
            if (battle) battle.terrain = 'grassyterrain';
            logs.push(`🌿 ${self.cnName} 脚下青草茂盛!`);
        }
    },
    // 【薄雾制造者】
    'Misty Surge': {
        onStart: (self, enemy, logs, battle) => {
            if (battle) battle.terrain = 'mistyterrain';
            logs.push(`🌫️ ${self.cnName} 脚下薄雾弥漫!`);
        }
    },

    // ============================================
    // E. 机制怪
    // ============================================

    // 【变幻自如 / 利贝罗】
    'Protean': {
        onBeforeMove: (user, move, logs) => {
            if (move.type && move.type !== 'Normal' && !user.types.includes(move.type)) {
                if (user.types[0] !== move.type) { 
                    user.types = [move.type];
                    logs.push(`[变幻自如] ${user.cnName} 变成了 ${move.type} 属性!`);
                }
            }
        }
    },
    'Libero': {
        onBeforeMove: (user, move, logs) => {
            if (move.type && user.types[0] !== move.type) {
                user.types = [move.type];
                logs.push(`[利贝罗] ${user.cnName} 变成了 ${move.type} 属性!`);
            }
        }
    },

    // 【异兽提升】击杀后提升最高能力
    'Beast Boost': {
        onKill: (attacker, logs) => {
            // 找最高基础能力
            const stats = ['atk', 'def', 'spa', 'spd', 'spe'];
            let best = 'atk';
            let bestVal = attacker.atk || 0;
            for (const s of stats) {
                if (attacker[s] > bestVal) {
                    bestVal = attacker[s];
                    best = s;
                }
            }
            if (typeof attacker.applyBoost === 'function') {
                attacker.applyBoost(best, 1);
                logs.push(`${attacker.cnName} 的 ${best} 提升了! (异兽提升)`);
                if (typeof window.playSFX === 'function') window.playSFX('STAT_UP');
            }
        }
    },
    // 【自信过剩】击杀后攻击+1
    'Moxie': {
        onKill: (attacker, logs) => {
            if (typeof attacker.applyBoost === 'function') {
                attacker.applyBoost('atk', 1);
                logs.push(`${attacker.cnName} 的攻击提升了! (自信过剩)`);
                if (typeof window.playSFX === 'function') window.playSFX('STAT_UP');
            }
        }
    },

    // 【加速】回合结束速度+1
    'Speed Boost': {
        onEndTurn: (pokemon, logs) => {
            if (pokemon.boosts && pokemon.boosts.spe < 6) {
                if (typeof pokemon.applyBoost === 'function') {
                    pokemon.applyBoost('spe', 1);
                    logs.push(`${pokemon.cnName} 的速度提升了! (加速)`);
                    if (typeof window.playSFX === 'function') window.playSFX('STAT_UP');
                }
            }
        }
    },
  
    // 【再生力】换下时回复1/3血
    'Regenerator': {
        onSwitchOut: (pokemon) => {
            if (pokemon.currHp < pokemon.maxHp && pokemon.currHp > 0) {
                const heal = Math.floor(pokemon.maxHp / 3);
                pokemon.currHp = Math.min(pokemon.maxHp, pokemon.currHp + heal);
            }
        }
    },

    // 【铁拳】拳头类招式威力x1.2
    'Iron Fist': {
        onBasePower: (power, attacker, defender, move) => {
            const punchMoves = ['Bullet Punch', 'Comet Punch', 'Dizzy Punch', 'Drain Punch', 
                'Dynamic Punch', 'Fire Punch', 'Focus Punch', 'Hammer Arm', 'Ice Punch', 
                'Mach Punch', 'Mega Punch', 'Meteor Mash', 'Power-Up Punch', 'Shadow Punch', 
                'Sky Uppercut', 'Thunder Punch', 'Close Combat'];
            if (punchMoves.includes(move.name)) {
                return Math.floor(power * 1.2);
            }
            return power;
        }
    },

    // 【强壮之颚】咬类招式威力x1.5
    'Strong Jaw': {
        onBasePower: (power, attacker, defender, move) => {
            const biteMoves = ['Bite', 'Crunch', 'Fire Fang', 'Ice Fang', 'Thunder Fang', 
                'Poison Fang', 'Psychic Fangs', 'Hyper Fang', 'Jaw Lock', 'Fishious Rend'];
            if (biteMoves.includes(move.name)) {
                return Math.floor(power * 1.5);
            }
            return power;
        }
    },

    // 【硬爪】接触类招式威力x1.3
    'Tough Claws': {
        onBasePower: (power, attacker, defender, move) => {
            // 简化：物理招式大多是接触类
            if (move.cat === 'phys' || move.category === 'Physical') {
                return Math.floor(power * 1.3);
            }
            return power;
        }
    },

    // 【蛮力】攻击后降低自身攻防
    'Sheer Force': {
        // 取消副作用但威力x1.3，这里简化处理
        onBasePower: (power, attacker, defender, move) => {
            // 如果招式有副作用，威力x1.3
            if (move.secondary || move.secondaries) {
                return Math.floor(power * 1.3);
            }
            return power;
        }
    },

    // 【沙之力】沙暴中岩/地/钢威力x1.3
    'Sand Force': {
        onBasePower: (power, attacker, defender, move, battle) => {
            if (battle && battle.weather === 'sandstorm') {
                if (['Rock', 'Ground', 'Steel'].includes(move.type)) {
                    return Math.floor(power * 1.3);
                }
            }
            return power;
        }
    },

    // 【狙击手】暴击伤害x1.5
    'Sniper': {
        onCritDamage: (damage) => Math.floor(damage * 1.5)
    },

    // 【天恩】副作用概率翻倍 (简化：不实现)
    'Serene Grace': {},

    // 【清除之躯】免疫能力下降
    'Clear Body': {
        onTryBoost: (boost, pokemon, source) => {
            // 阻止负面能力变化
            if (boost < 0 && source !== pokemon) return 0;
            return boost;
        }
    },
    'White Smoke': {
        onTryBoost: (boost, pokemon, source) => {
            if (boost < 0 && source !== pokemon) return 0;
            return boost;
        }
    },
    'Full Metal Body': {
        onTryBoost: (boost, pokemon, source) => {
            if (boost < 0 && source !== pokemon) return 0;
            return boost;
        }
    },

    // ============================================
    // F. 第二梯队补充 - 招式大师类
    // ============================================

    // 【锋锐】切割类招式威力x1.5
    'Sharpness': {
        onBasePower: (power, attacker, defender, move) => {
            const slicingMoves = ['Air Cutter', 'Air Slash', 'Aqua Cutter', 'Behemoth Blade', 
                'Cross Poison', 'Cut', 'Fury Cutter', 'Kowtow Cleave', 'Leaf Blade', 
                'Night Slash', 'Psycho Cut', 'Razor Leaf', 'Razor Shell', 'Sacred Sword', 
                'Secret Sword', 'Slash', 'Solar Blade', 'Stone Axe', 'X-Scissor', 'Ceaseless Edge'];
            if (slicingMoves.includes(move.name)) {
                return Math.floor(power * 1.5);
            }
            return power;
        }
    },

    // 【超级发射器】波导/波动类招式威力x1.5
    'Mega Launcher': {
        onBasePower: (power, attacker, defender, move) => {
            const pulseMoves = ['Aura Sphere', 'Dark Pulse', 'Dragon Pulse', 'Heal Pulse', 
                'Origin Pulse', 'Terrain Pulse', 'Water Pulse'];
            if (pulseMoves.includes(move.name)) {
                return Math.floor(power * 1.5);
            }
            return power;
        }
    },

    // ============================================
    // G. 第二梯队补充 - 抗性/状态类
    // ============================================

    // 【隔音】免疫声音招式
    'Soundproof': {
        onImmunity: (atkType, move) => {
            const soundMoves = ['Boomburst', 'Bug Buzz', 'Chatter', 'Clanging Scales', 
                'Clangorous Soul', 'Clangorous Soulblaze', 'Confide', 'Disarming Voice', 
                'Echoed Voice', 'Eerie Spell', 'Grass Whistle', 'Growl', 'Heal Bell', 
                'Hyper Voice', 'Metal Sound', 'Noble Roar', 'Overdrive', 'Parting Shot', 
                'Perish Song', 'Relic Song', 'Roar', 'Round', 'Screech', 'Shadow Panic', 
                'Sing', 'Snarl', 'Snore', 'Sparkling Aria', 'Supersonic', 'Uproar'];
            if (move && soundMoves.includes(move.name)) return true;
            return false;
        }
    },

    // 【毅力】异常状态下物攻x1.5
    'Guts': {
        onModifyStat: (stats, poke) => { 
            if (poke.status) stats.atk = Math.floor(stats.atk * 1.5); 
        }
    },

    // 【软弱】半血以下攻击/特攻减半
    'Defeatist': {
        onModifyStat: (stats, poke) => {
            if (poke.currHp <= poke.maxHp / 2) {
                stats.atk = Math.floor(stats.atk * 0.5);
                stats.spa = Math.floor(stats.spa * 0.5);
            }
        }
    },

    // ============================================
    // H. 第二梯队补充 - 天气加速类
    // ============================================

    // 【叶绿素】晴天速度翻倍
    'Chlorophyll': {
        onModifyStat: (stats, poke, battle) => {
            if (battle && (battle.weather === 'sunnyday' || battle.weather === 'desolateland')) {
                stats.spe *= 2;
            }
        }
    },

    // 【悠游自如】雨天速度翻倍
    'Swift Swim': {
        onModifyStat: (stats, poke, battle) => {
            if (battle && (battle.weather === 'raindance' || battle.weather === 'primordialsea')) {
                stats.spe *= 2;
            }
        }
    },

    // 【拨沙】沙暴速度翻倍
    'Sand Rush': {
        onModifyStat: (stats, poke, battle) => {
            if (battle && battle.weather === 'sandstorm') {
                stats.spe *= 2;
            }
        }
    },

    // 【拨雪】雪天速度翻倍
    'Slush Rush': {
        onModifyStat: (stats, poke, battle) => {
            if (battle && (battle.weather === 'snow' || battle.weather === 'hail')) {
                stats.spe *= 2;
            }
        }
    },

    // 【太阳之力】晴天特攻x1.5
    'Solar Power': {
        onModifyStat: (stats, poke, battle) => {
            if (battle && (battle.weather === 'sunnyday' || battle.weather === 'desolateland')) {
                stats.spa = Math.floor(stats.spa * 1.5);
            }
        }
    },

    // ============================================
    // I. 第二梯队补充 - 吸收系
    // ============================================

    // 【食土】被地面打回血
    'Earth Eater': {
        onImmunity: (atkType) => atkType === 'Ground',
        onTryHitHeal: (target, move) => {
            if (move.type === 'Ground') {
                return Math.floor(target.maxHp / 4);
            }
            return 0;
        }
    },

    // ============================================
    // J. 第二梯队补充 - 免疫类
    // ============================================

    // 【石头脑袋】不受反伤
    'Rock Head': {
        noRecoil: true
    },

    // 【魔法防守】不受天气/状态伤害 (简化)
    'Magic Guard': {
        noIndirectDamage: true
    },

    // 【不服输】被降能力时攻击+2
    'Defiant': {
        onAfterStatDrop: (pokemon, stat, stages, logs) => {
            if (typeof pokemon.applyBoost === 'function') {
                pokemon.applyBoost('atk', 2);
                logs.push(`${pokemon.cnName} 的攻击大幅提升了! (不服输)`);
                if (typeof window.playSFX === 'function') window.playSFX('STAT_UP');
            }
        }
    },

    // 【竞争心】被降能力时特攻+2
    'Competitive': {
        onAfterStatDrop: (pokemon, stat, stages, logs) => {
            if (typeof pokemon.applyBoost === 'function') {
                pokemon.applyBoost('spa', 2);
                logs.push(`${pokemon.cnName} 的特攻大幅提升了! (竞争心)`);
                if (typeof window.playSFX === 'function') window.playSFX('STAT_UP');
            }
        }
    },

    // 【精神力】免疫畏缩
    'Inner Focus': {
        noFlinch: true
    },

    // 【我行我素】免疫混乱
    'Own Tempo': {
        noConfusion: true
    },

    // 【柔软】免疫麻痹
    'Limber': {
        onImmunityStatus: (status) => status === 'par'
    },

    // 【免疫】免疫中毒
    'Immunity': {
        onImmunityStatus: (status) => status === 'psn' || status === 'tox'
    },

    // 【水之面纱】免疫烧伤
    'Water Veil': {
        onImmunityStatus: (status) => status === 'brn'
    },

    // 【熔岩铠甲】免疫冰冻
    'Magma Armor': {
        onImmunityStatus: (status) => status === 'frz'
    },

    // 【不眠】免疫睡眠
    'Insomnia': {
        onImmunityStatus: (status) => status === 'slp'
    },
    'Vital Spirit': {
        onImmunityStatus: (status) => status === 'slp'
    },

    // 【鳞粉】免疫粉尘类招式
    'Overcoat': {
        onImmunity: (atkType, move) => {
            const powderMoves = ['Cotton Spore', 'Poison Powder', 'Powder', 'Rage Powder', 
                'Sleep Powder', 'Spore', 'Stun Spore'];
            if (move && powderMoves.includes(move.name)) return true;
            return false;
        }
    },

    // 【防弹】免疫球类招式
    'Bulletproof': {
        onImmunity: (atkType, move) => {
            const ballMoves = ['Acid Spray', 'Aura Sphere', 'Barrage', 'Beak Blast', 
                'Bullet Seed', 'Egg Bomb', 'Electro Ball', 'Energy Ball', 'Focus Blast', 
                'Gyro Ball', 'Ice Ball', 'Magnet Bomb', 'Mist Ball', 'Mud Bomb', 
                'Octazooka', 'Pollen Puff', 'Pyro Ball', 'Rock Blast', 'Rock Wrecker', 
                'Searing Shot', 'Seed Bomb', 'Shadow Ball', 'Sludge Bomb', 'Weather Ball', 'Zap Cannon'];
            if (move && ballMoves.includes(move.name)) return true;
            return false;
        }
    },

    // ============================================
    // K. 画皮 (Disguise) - Mimikyu 专属
    // ============================================

    // 【画皮】第一次受到攻击伤害时免疫，但自身损失 1/8 HP
    'Disguise': {
        onDefenderModifyDamage: (damage, attacker, defender, move) => {
            // 如果画皮已经破损，正常受伤
            if (defender.disguiseBroken) return damage;
            
            // 画皮完好时，免疫这次伤害
            if (damage > 0) {
                defender.disguiseBroken = true;
                // 画皮破损后自身损失 1/8 HP
                const bustDamage = Math.floor(defender.maxHp / 8);
                defender.disguiseBustDamage = bustDamage; // 标记需要扣血
                return 0; // 伤害变为 0
            }
            return damage;
        }
    }
};

// 导出到全局
if (typeof window !== 'undefined') {
    window.AbilityHandlers = AbilityHandlers;
}
