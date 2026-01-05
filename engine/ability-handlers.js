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
        onImmunity: (atkType) => atkType === 'Ground',
        groundImmune: true
    },
    // 【引火】免疫火系+威力提升50%
    'Flash Fire': {
        onImmunity: (atkType) => atkType === 'Fire',
        onAbsorbHit: (pokemon, move, logs) => {
            if (move.type === 'Fire') {
                pokemon.flashFireBoost = true;
                logs.push(`🔥 ${pokemon.cnName} 的引火特性发动！`);
                return { absorbed: true };
            }
            return { absorbed: false };
        },
        // 【修复】参数顺序：(power, attacker, defender, move)
        onBasePower: (power, attacker, defender, move) => {
            if (move.type === 'Fire' && attacker.flashFireBoost) return Math.floor(power * 1.5);
            return power;
        }
    },
    // 【蓄水】免疫水系+回复1/4HP
    'Water Absorb': {
        onImmunity: (atkType) => atkType === 'Water',
        onAbsorbHit: (pokemon, move, logs) => {
            if (move.type === 'Water') {
                const heal = Math.floor(pokemon.maxHp / 4);
                pokemon.currHp = Math.min(pokemon.maxHp, pokemon.currHp + heal);
                logs.push(`💧 ${pokemon.cnName} 的蓄水回复了 ${heal} HP！`);
                return { absorbed: true, heal };
            }
            return { absorbed: false };
        }
    },
    // 【避雷针】免疫电系+特攻+1
    'Lightning Rod': {
        onImmunity: (atkType) => atkType === 'Electric',
        onAbsorbHit: (pokemon, move, logs) => {
            if (move.type === 'Electric') {
                if (pokemon.applyBoost) pokemon.applyBoost('spa', 1);
                logs.push(`⚡ ${pokemon.cnName} 的避雷针发动！特攻提升！`);
                return { absorbed: true };
            }
            return { absorbed: false };
        }
    },
    // 【蓄电】免疫电系+回复1/4HP
    'Volt Absorb': {
        onImmunity: (atkType) => atkType === 'Electric',
        onAbsorbHit: (pokemon, move, logs) => {
            if (move.type === 'Electric') {
                const heal = Math.floor(pokemon.maxHp / 4);
                pokemon.currHp = Math.min(pokemon.maxHp, pokemon.currHp + heal);
                logs.push(`⚡ ${pokemon.cnName} 的蓄电回复了 ${heal} HP！`);
                return { absorbed: true, heal };
            }
            return { absorbed: false };
        }
    },
    // 【电气引擎】免疫电系+速度+1
    'Motor Drive': {
        onImmunity: (atkType) => atkType === 'Electric',
        onAbsorbHit: (pokemon, move, logs) => {
            if (move.type === 'Electric') {
                if (pokemon.applyBoost) pokemon.applyBoost('spe', 1);
                logs.push(`⚡ ${pokemon.cnName} 的电气引擎发动！速度提升！`);
                return { absorbed: true };
            }
            return { absorbed: false };
        }
    },
    // 【食草】免疫草系+攻击+1
    'Sap Sipper': {
        onImmunity: (atkType) => atkType === 'Grass',
        onAbsorbHit: (pokemon, move, logs) => {
            if (move.type === 'Grass') {
                if (pokemon.applyBoost) pokemon.applyBoost('atk', 1);
                logs.push(`🌿 ${pokemon.cnName} 的食草发动！攻击提升！`);
                return { absorbed: true };
            }
            return { absorbed: false };
        }
    },
    // 【引水】免疫水系+特攻+1
    'Storm Drain': {
        onImmunity: (atkType) => atkType === 'Water',
        onAbsorbHit: (pokemon, move, logs) => {
            if (move.type === 'Water') {
                if (pokemon.applyBoost) pokemon.applyBoost('spa', 1);
                logs.push(`💧 ${pokemon.cnName} 的引水发动！特攻提升！`);
                return { absorbed: true };
            }
            return { absorbed: false };
        }
    },
    // 【干燥皮肤】免疫水系回复，火系x1.25
    'Dry Skin': {
        onImmunity: (atkType) => atkType === 'Water',
        onAbsorbHit: (pokemon, move, logs) => {
            if (move.type === 'Water') {
                const heal = Math.floor(pokemon.maxHp / 4);
                pokemon.currHp = Math.min(pokemon.maxHp, pokemon.currHp + heal);
                logs.push(`💧 ${pokemon.cnName} 的干燥皮肤回复了 ${heal} HP！`);
                return { absorbed: true, heal };
            }
            return { absorbed: false };
        },
        // 【修复】参数顺序：(damage, attacker, defender, move, effectiveness)
        onDefenderModifyDamage: (damage, attacker, defender, move, effectiveness) => {
            return move.type === 'Fire' ? Math.floor(damage * 1.25) : damage;
        }
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
  
    // 【神奇守护】鬼蝉：只能被效果绝佳的招式打中
    'Wonder Guard': {
        onTryHit: (attacker, defender, move, effectiveness) => {
            // 只有效果绝佳（>1）的招式才能命中
            if (effectiveness <= 1) {
                return { blocked: true, message: `${defender.cnName} 的神奇守护让攻击无效了！` };
            }
            return { blocked: false };
        },
        wonderGuard: true // 标记：需要在伤害计算时检查
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
    // 接触类招式反馈特性 (Contact Move Reactions)
    // 注意：这些特性只在接触类招式命中时触发
    // ============================================

    // 【粗糙皮肤】接触时反伤1/8
    'Rough Skin': {
        onContactDamage: (attacker, defender) => {
            return { damage: Math.floor(attacker.maxHp / 8), message: `${attacker.cnName} 被粗糙皮肤伤害了！` };
        }
    },
    // 【铁刺】接触时反伤1/8
    'Iron Barbs': {
        onContactDamage: (attacker, defender) => {
            return { damage: Math.floor(attacker.maxHp / 8), message: `${attacker.cnName} 被铁刺伤害了！` };
        }
    },
    // 【静电】接触时30%麻痹
    'Static': {
        onContactStatus: (attacker, defender) => {
            if (Math.random() < 0.3) return { status: 'par', message: `${attacker.cnName} 被静电麻痹了！` };
            return null;
        }
    },
    // 【火焰身躯】接触时30%灼伤
    'Flame Body': {
        onContactStatus: (attacker, defender) => {
            if (Math.random() < 0.3) return { status: 'brn', message: `${attacker.cnName} 被火焰身躯灼伤了！` };
            return null;
        }
    },
    // 【毒刺】接触时30%中毒
    'Poison Point': {
        onContactStatus: (attacker, defender) => {
            if (Math.random() < 0.3) return { status: 'psn', message: `${attacker.cnName} 被毒刺毒到了！` };
            return null;
        }
    },
    // 【可爱迷人】接触时30%着迷
    'Cute Charm': {
        onContactVolatile: (attacker, defender) => {
            if (Math.random() < 0.3 && attacker.gender !== defender.gender) {
                return { volatile: 'attract', message: `${attacker.cnName} 被迷住了！` };
            }
            return null;
        }
    },
    // 【碎裂铠甲】被物理攻击时防御-1速度+2
    'Weak Armor': {
        onPhysicalHit: (attacker, defender, logs) => {
            if (defender.applyBoost) {
                defender.applyBoost('def', -1);
                defender.applyBoost('spe', 2);
            }
            logs.push(`${defender.cnName} 的碎裂铠甲发动！防御下降，速度大幅提升！`);
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

    // ============================================
    // 悖谬种特性 (Paradox Pokémon Abilities)
    // ============================================
    
    // 【夸克充能】Quark Drive - 未来悖谬种
    // 电气场地或携带驱劲能量时，提升最高能力 30%（速度为 50%）
    'Quark Drive': {
        onStart: (self, enemy, logs, battle) => {
            // 检查是否有电气场地
            const hasElectricTerrain = battle && battle.field && battle.field.terrain === 'electricterrain';
            // 检查是否携带驱劲能量
            const hasBoosterEnergy = self.item === 'Booster Energy';
            
            if (hasElectricTerrain || hasBoosterEnergy) {
                // 找最高能力
                const stats = { atk: self.atk, def: self.def, spa: self.spa, spd: self.spd, spe: self.spe };
                let bestStat = 'atk';
                let bestValue = 0;
                for (const [stat, val] of Object.entries(stats)) {
                    if (val > bestValue) {
                        bestValue = val;
                        bestStat = stat;
                    }
                }
                
                // 标记激活状态
                self.quarkDriveActive = true;
                self.quarkDriveStat = bestStat;
                
                // 消耗驱劲能量（如果是通过道具激活）
                if (hasBoosterEnergy && !hasElectricTerrain) {
                    self.item = null;
                    logs.push(`${self.cnName} 消耗了驱劲能量！`);
                }
                
                const statNames = { atk: '攻击', def: '防御', spa: '特攻', spd: '特防', spe: '速度' };
                logs.push(`<b style="color:#f1c40f">⚡ ${self.cnName} 的夸克充能启动了！${statNames[bestStat]}提升！</b>`);
                if (typeof window.playSFX === 'function') window.playSFX('STAT_UP');
            }
        },
        onModifyStat: (stats, poke) => {
            if (poke.quarkDriveActive && poke.quarkDriveStat) {
                const stat = poke.quarkDriveStat;
                const multiplier = (stat === 'spe') ? 1.5 : 1.3;
                stats[stat] = Math.floor(stats[stat] * multiplier);
            }
        }
    },
    
    // 【古代活性】Protosynthesis - 古代悖谬种
    // 大晴天或携带驱劲能量时，提升最高能力 30%（速度为 50%）
    'Protosynthesis': {
        onStart: (self, enemy, logs, battle) => {
            // 检查是否有大晴天
            const hasSun = battle && (battle.weather === 'sunnyday' || battle.weather === 'desolateland');
            // 检查是否携带驱劲能量
            const hasBoosterEnergy = self.item === 'Booster Energy';
            
            if (hasSun || hasBoosterEnergy) {
                // 找最高能力
                const stats = { atk: self.atk, def: self.def, spa: self.spa, spd: self.spd, spe: self.spe };
                let bestStat = 'atk';
                let bestValue = 0;
                for (const [stat, val] of Object.entries(stats)) {
                    if (val > bestValue) {
                        bestValue = val;
                        bestStat = stat;
                    }
                }
                
                // 标记激活状态
                self.protosynthesisActive = true;
                self.protosynthesisstat = bestStat;
                
                // 消耗驱劲能量（如果是通过道具激活）
                if (hasBoosterEnergy && !hasSun) {
                    self.item = null;
                    logs.push(`${self.cnName} 消耗了驱劲能量！`);
                }
                
                const statNames = { atk: '攻击', def: '防御', spa: '特攻', spd: '特防', spe: '速度' };
                logs.push(`<b style="color:#e67e22">☀️ ${self.cnName} 的古代活性启动了！${statNames[bestStat]}提升！</b>`);
                if (typeof window.playSFX === 'function') window.playSFX('STAT_UP');
            }
        },
        onModifyStat: (stats, poke) => {
            if (poke.protosynthesisActive && poke.protosynthesisstat) {
                const stat = poke.protosynthesisstat;
                const multiplier = (stat === 'spe') ? 1.5 : 1.3;
                stats[stat] = Math.floor(stats[stat] * multiplier);
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

    // 【慢启动】出场5回合内，攻击减半，速度减半 (雷吉奇卡斯专属)
    'Slow Start': {
        // 进场时初始化计数器
        onStart: (self, enemy, logs) => {
            self.slowStartTurns = 0;
            self.isSlowStarting = true;
            logs.push(`<b style="color:#636e72">${self.cnName} 的慢启动！依然没能拿出真本事！</b>`);
        },
        // 实时修改面板数值
        onModifyStat: (stats, poke) => {
            if (poke.isSlowStarting) {
                stats.atk = Math.floor(stats.atk * 0.5);
                stats.spe = Math.floor(stats.spe * 0.5);
            }
        },
        // 回合结束：计数器递增 + 解除封印判断
        onEndTurn: (pokemon, logs) => {
            if (pokemon.isSlowStarting) {
                pokemon.slowStartTurns = (pokemon.slowStartTurns || 0) + 1;
                if (pokemon.slowStartTurns >= 5) {
                    pokemon.isSlowStarting = false;
                    pokemon.slowStartTurns = 0;
                    logs.push(`<b style="color:#e91e63; font-size:1.1em">🔥 ${pokemon.cnName} 终于拿出了真本事！</b>`);
                    if (typeof window.playSFX === 'function') window.playSFX('STAT_UP');
                } else {
                    logs.push(`<span style="color:#aaa">${pokemon.cnName} 还没有拿出真本事... (${pokemon.slowStartTurns}/5)</span>`);
                }
            }
        }
    },

    // 【懒惰】每隔一回合才能行动 (请假王专属)
    'Truant': {
        onStart: (self, enemy, logs) => {
            // 进场时重置状态，第一回合可以行动
            self.truantNextTurn = false;
        },
        // 行动前检查：如果是休息回合则跳过
        onBeforeMove: (self, move, logs) => {
            if (self.truantNextTurn) {
                logs.push(`<b style="color:#95a5a6">${self.cnName} 正在偷懒！</b>`);
                self.truantNextTurn = false; // 下回合可以行动
                return false; // 禁止行动
            } else {
                self.truantNextTurn = true; // 下回合休息
                return true; // 允许行动
            }
        }
    },

    // 【慢出】永远最后行动 (优先度 -6)
    // 【修复】参数顺序统一为：(priority, user, target, move)
    'Stall': {
        onModifyPriority: (priority, user, target, move) => {
            // 返回一个极低的优先度修正，确保最后行动
            return -6;
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

    // ============================================
    // 声音系特性 (Sound-based Abilities)
    // ============================================
    
    // 【湿润之声】声音招式变为水属性
    'Liquid Voice': {
        onModifyMove: (move, attacker) => {
            const soundMoves = ['Boomburst', 'Bug Buzz', 'Chatter', 'Clanging Scales', 
                'Clangorous Soul', 'Disarming Voice', 'Echoed Voice', 'Eerie Spell', 
                'Growl', 'Hyper Voice', 'Metal Sound', 'Noble Roar', 'Overdrive', 
                'Parting Shot', 'Relic Song', 'Round', 'Screech', 'Sing', 'Snarl', 
                'Snore', 'Sparkling Aria', 'Supersonic', 'Uproar', 'Torch Song'];
            if (soundMoves.includes(move.name)) {
                move.type = 'Water';
            }
        }
    },
    
    // 【湿润之声 Pro】声音招式变为水属性 + 威力x1.3 (RPG 魔改版)
    // 【修复】使用 _liquidVoiceApplied 标记防止威力累积
    'Liquid Voice Pro': {
        onModifyMove: (move, attacker) => {
            const soundMoves = ['Boomburst', 'Bug Buzz', 'Chatter', 'Clanging Scales', 
                'Clangorous Soul', 'Disarming Voice', 'Echoed Voice', 'Eerie Spell', 
                'Growl', 'Hyper Voice', 'Metal Sound', 'Noble Roar', 'Overdrive', 
                'Parting Shot', 'Relic Song', 'Round', 'Screech', 'Sing', 'Snarl', 
                'Snore', 'Sparkling Aria', 'Supersonic', 'Uproar', 'Torch Song'];
            if (soundMoves.includes(move.name)) {
                move.type = 'Water';
                // 【关键修复】只在首次应用时修改威力，防止累积
                if (!move._liquidVoiceApplied) {
                    const originalPower = move._originalBasePower || move.basePower || move.power || 0;
                    move._originalBasePower = originalPower; // 保存原始威力
                    move.basePower = Math.floor(originalPower * 1.3);
                    move.power = move.basePower;
                    move._liquidVoiceApplied = true;
                }
            }
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

    // 【食土】被地面打回血1/4HP（大王铜象）
    'Earth Eater': {
        onImmunity: (atkType) => atkType === 'Ground',
        onAbsorbHit: (pokemon, move, logs) => {
            if (move.type === 'Ground') {
                const heal = Math.floor(pokemon.maxHp / 4);
                pokemon.currHp = Math.min(pokemon.maxHp, pokemon.currHp + heal);
                logs.push(`🌍 ${pokemon.cnName} 的食土回复了 ${heal} HP！`);
                return { absorbed: true, heal };
            }
            return { absorbed: false };
        }
    },

    // 【焦香身躯】被火系打防御+2（麻花犬）
    'Well-Baked Body': {
        onImmunity: (atkType) => atkType === 'Fire',
        onAbsorbHit: (pokemon, move, logs) => {
            if (move.type === 'Fire') {
                if (pokemon.applyBoost) pokemon.applyBoost('def', 2);
                logs.push(`🔥 ${pokemon.cnName} 的焦香身躯发动！防御大幅提升！`);
                return { absorbed: true };
            }
            return { absorbed: false };
        }
    },

    // 【湿气】禁止自爆/大爆炸
    'Damp': {
        preventExplosion: true
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

    // 【毒疗】中毒时回复HP而非受伤
    'Poison Heal': {
        onStatusDamage: (pokemon, status) => {
            if (status === 'psn' || status === 'tox') {
                // 回复 1/8 HP
                const healAmount = Math.max(1, Math.floor(pokemon.maxHp / 8));
                if (typeof pokemon.heal === 'function') {
                    pokemon.heal(healAmount);
                } else {
                    pokemon.currHp = Math.min(pokemon.maxHp, pokemon.currHp + healAmount);
                }
                return { 
                    blocked: true, 
                    healed: true,
                    message: `<span style="color:#4cd137">💚 ${pokemon.cnName} 的毒疗特性发动，回复了 ${healAmount} 点体力!</span>`
                };
            }
            return { blocked: false };
        }
    },

    // 【毅力】异常状态时速度x1.5 (Quick Feet)
    // 【修复】参数顺序：(stats, poke, battle)
    'Quick Feet': {
        onModifyStat: (stats, poke, battle) => {
            if (poke.status) {
                stats.spe = Math.floor(stats.spe * 1.5);
            }
        }
    },

    // 注意：Marvel Scale 已在第 192 行定义，此处删除重复定义

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
    
    // 【甘幕 Sweet Veil】己方全员免疫睡眠（包括队友）
    'Sweet Veil': {
        onImmunityStatus: (status) => status === 'slp',
        // 标记：队友也免疫睡眠（双打用）
        teamSleepImmune: true
    },
    
    // 【早起 Early Bird】睡眠回合减半
    'Early Bird': {
        // 标记：睡眠回合消耗速度加倍
        earlyBird: true
    },
    
    // 【蜕皮 Shed Skin】每回合结束时30%概率治愈异常状态
    'Shed Skin': {
        onEndTurn: (pokemon, logs) => {
            if (pokemon.status && Math.random() < 0.3) {
                const oldStatus = pokemon.status;
                pokemon.status = null;
                pokemon.statusTurns = 0;
                pokemon.sleepTurns = 0;
                const statusNames = { par: '麻痹', brn: '灶伤', psn: '中毒', tox: '剧毒', slp: '睡眠', frz: '冰冻' };
                logs.push(`${pokemon.cnName} 的蜕皮治愈了${statusNames[oldStatus] || '异常状态'}！`);
            }
        }
    },
    
    // 【梦魇 Bad Dreams】对手睡眠时每回合扣除1/8HP（达克莱伊专属）
    'Bad Dreams': {
        onEndTurn: (pokemon, logs) => {
            // 梦魇是对对手生效，需要在回合结束时检查对手
            const battle = window.battle;
            if (!battle) return;
            
            // 确定对手
            const isPlayer = battle.playerParty && battle.playerParty.includes(pokemon);
            const opponent = isPlayer ? battle.getEnemy() : battle.getPlayer();
            
            if (opponent && opponent.isAlive() && opponent.status === 'slp') {
                const damage = Math.max(1, Math.floor(opponent.maxHp / 8));
                opponent.takeDamage(damage);
                logs.push(`<span style="color:#8b5cf6">👻 ${opponent.cnName} 被 ${pokemon.cnName} 的梦魇侵蚀了 ${damage} HP！</span>`);
            }
        }
    },
    
    // 【孢子 Effect Spore】接触时有概率让对手中毒、麻痹或睡眠
    'Effect Spore': {
        onContactStatus: (attacker, defender) => {
            // 草系免疫孢子
            if (attacker.types && attacker.types.includes('Grass')) {
                return null;
            }
            // 防尘护目镜免疫
            const attackerItem = (attacker.item || '').toLowerCase().replace(/[^a-z]/g, '');
            if (attackerItem === 'safetygoggles') {
                return null;
            }
            // 防尘特性免疫
            const attackerAbility = (attacker.ability || '').toLowerCase().replace(/[^a-z]/g, '');
            if (attackerAbility === 'overcoat') {
                return null;
            }
            
            // 30%概率触发，平分三种状态
            if (Math.random() < 0.3) {
                const rand = Math.random();
                if (rand < 0.33) {
                    return { status: 'slp', message: `${attacker.cnName} 被孢子催眠了！` };
                } else if (rand < 0.66) {
                    return { status: 'par', message: `${attacker.cnName} 被孢子麻痹了！` };
                } else {
                    return { status: 'psn', message: `${attacker.cnName} 被孢子毒到了！` };
                }
            }
            return null;
        }
    },

    // 【粉彩护幕】免疫中毒（伽勒尔小火马/烈焰马）
    'Pastel Veil': {
        onImmunityStatus: (status) => status === 'psn' || status === 'tox',
        onStart: (pokemon, logs) => {
            // 入场时治愈己方中毒状态
            if (pokemon.status === 'psn' || pokemon.status === 'tox') {
                pokemon.status = null;
                logs.push(`${pokemon.cnName} 的粉彩护幕治愈了中毒状态!`);
            }
        }
    },

    // 【洁净之盐】免疫所有异常状态（盐石巨灵）
    'Purifying Salt': {
        onImmunityStatus: () => true, // 免疫所有异常状态
        // 【修复】参数顺序：(damage, attacker, defender, move, effectiveness)
        onDefenderModifyDamage: (damage, attacker, defender, move, effectiveness) => {
            // 幽灵系招式伤害减半
            if (move.type === 'Ghost') {
                return Math.floor(damage * 0.5);
            }
            return damage;
        }
    },

    // 【绝对睡眠】视为睡眠状态（树枕尾熊）
    'Comatose': {
        onImmunityStatus: () => true, // 无法被覆盖其他状态
        alwaysAsleep: true // 视为睡眠状态
    },

    // 【界限盾壳】HP > 50% 时免疫异常状态（小陨星）
    'Shields Down': {
        onImmunityStatus: (status, pokemon) => {
            return pokemon && pokemon.currHp > pokemon.maxHp / 2;
        }
    },

    // 【叶子防守】大晴天时免疫异常状态
    'Leaf Guard': {
        onImmunityStatus: (status, pokemon, battle) => {
            const weather = battle?.weather || (typeof window.battle !== 'undefined' ? window.battle.weather : null);
            return weather === 'sun' || weather === 'harshsun';
        }
    },

    // 【腐蚀】可以让钢/毒系中毒（夜盗火蜥、焰后蜥）
    'Corrosion': {
        canPoisonAny: true // 标记：可以让任何属性中毒
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
    },

    // ============================================
    // L. 抓人特性 (Trapping Abilities)
    // ============================================

    // 【踩影】对手无法换人（幽灵系除外，对方也是踩影则可逃）
    'Shadow Tag': {
        isTrapping: true,
        canTrap: (self, target) => {
            // 幽灵系免疫
            if (target.types && target.types.includes('Ghost')) return false;
            // 对方也是踩影则不困
            if (target.ability === 'Shadow Tag') return false;
            return true;
        }
    },

    // 【磁力】钢属性无法换人
    'Magnet Pull': {
        isTrapping: true,
        canTrap: (self, target) => {
            // 幽灵系免疫
            if (target.types && target.types.includes('Ghost')) return false;
            // 只困住钢系
            if (target.types && target.types.includes('Steel')) return true;
            return false;
        }
    },

    // 【沙穴】地面上的对手无法换人
    'Arena Trap': {
        isTrapping: true,
        canTrap: (self, target) => {
            // 幽灵系免疫
            if (target.types && target.types.includes('Ghost')) return false;
            // 飞行系免疫
            if (target.types && target.types.includes('Flying')) return false;
            // 漂浮特性免疫
            if (target.ability === 'Levitate') return false;
            // 气球道具免疫
            if (target.item === 'Air Balloon') return false;
            return true;
        }
    },

    // ============================================
    // M. 恶作剧之心 (Prankster) - 优先度修正
    // ============================================

    // 【恶作剧之心】变化技优先度+1，但对恶系无效
    'Prankster': {
        onModifyPriority: (priority, user, target, move) => {
            // 只对变化技生效
            if (move.cat === 'status' || move.category === 'Status') {
                return priority + 1;
            }
            return priority;
        },
        // 恶系免疫恶作剧之心的变化技
        pranksterImmunity: true
    },

    // ============================================
    // N. 纯朴 (Unaware) - 忽略能力变化
    // ============================================

    // 【纯朴】攻击时忽略对手防御/特防提升，防御时忽略对手攻击/特攻提升
    'Unaware': {
        ignoreDefenderBoosts: true,  // 攻击时忽略对手防御提升
        ignoreAttackerBoosts: true   // 防御时忽略对手攻击提升
    },

    // ============================================
    // O. 其他重要特性补充
    // ============================================

    // 【魔法反射】反弹变化技
    'Magic Bounce': {
        reflectStatus: true
    },

    // 【破格】无视对手特性
    'Mold Breaker': {
        ignoreAbility: true
    },
    'Teravolt': {
        ignoreAbility: true
    },
    'Turboblaze': {
        ignoreAbility: true
    },

    // ============================================
    // P. 重要补充 - 先制免疫 & 黄金之躯
    // ============================================

    // 【鲜艳之躯】免疫先制攻击
    'Dazzling': {
        onTryHit: (attacker, defender, move) => {
            if (move.priority && move.priority > 0) {
                return { blocked: true, message: `${defender.cnName} 的特性让先制攻击无效了！` };
            }
            return { blocked: false };
        }
    },

    // 【女王的威严】免疫先制攻击
    'Queenly Majesty': {
        onTryHit: (attacker, defender, move) => {
            if (move.priority && move.priority > 0) {
                return { blocked: true, message: `${defender.cnName} 的威严让对手无法使出先制招式！` };
            }
            return { blocked: false };
        }
    },

    // 【尾甲】免疫先制攻击
    'Armor Tail': {
        onTryHit: (attacker, defender, move) => {
            if (move.priority && move.priority > 0) {
                return { blocked: true, message: `${defender.cnName} 的铠甲之尾挡下了先制攻击！` };
            }
            return { blocked: false };
        }
    },

    // 【黄金之躯】免疫变化招式 (赛富豪专属)
    'Good as Gold': {
        onTryHit: (attacker, defender, move) => {
            if (move.cat === 'status' || move.category === 'Status') {
                return { blocked: true, message: `${defender.cnName} 的黄金之躯免疫了变化招式！` };
            }
            return { blocked: false };
        }
    },

    // 【乘风】免疫风类招式+攻击+1
    'Wind Rider': {
        onImmunity: (atkType, move) => {
            const windMoves = [
                'Aeroblast', 'Air Cutter', 'Air Slash', 'Bleakwind Storm', 'Blizzard', 
                'Fairy Wind', 'Gust', 'Heat Wave', 'Hurricane', 'Icy Wind', 
                'Petal Blizzard', 'Springtide Storm', 'Tailwind', 
                'Twister', 'Whirlwind', 'Wildbolt Storm'
            ];
            if (move && windMoves.includes(move.name)) return true;
            return false;
        }
    },

    // ============================================
    // Q. 补充 - 特定能力保护 & 换人保护
    // ============================================

    // 【怪力钳】防止攻击降低
    'Hyper Cutter': {
        onTryBoost: (boost, pokemon, source, stat) => {
            if (stat === 'atk' && boost < 0 && source !== pokemon) return 0;
            return boost;
        }
    },

    // 【健壮胸肌】防止防御降低
    'Big Pecks': {
        onTryBoost: (boost, pokemon, source, stat) => {
            if (stat === 'def' && boost < 0 && source !== pokemon) return 0;
            return boost;
        }
    },

    // 【锐利目光】防止命中率降低 + 忽略对方闪避
    'Keen Eye': {
        onTryBoost: (boost, pokemon, source, stat) => {
            if (stat === 'accuracy' && boost < 0 && source !== pokemon) return 0;
            return boost;
        },
        ignoreEvasion: true
    },

    // 【镜甲】反射能力下降给对方
    'Mirror Armor': {
        onTryBoost: (boost, pokemon, source, stat, logs) => {
            // 如果是自身造成的下降（如近身战），不反弹
            if (source === pokemon || !source) return boost;
            // 只有负面效果才反弹
            if (boost < 0) {
                // 反弹给对方
                if (typeof source.applyBoost === 'function') {
                    source.applyBoost(stat, boost);
                } else if (source.boosts) {
                    source.boosts[stat] = Math.max(-6, (source.boosts[stat] || 0) + boost);
                }
                if (logs && Array.isArray(logs)) {
                    logs.push(`🪞 ${pokemon.cnName} 的镜甲将 ${stat} 下降反弹给了 ${source.cnName}！`);
                }
                console.log(`[MIRROR ARMOR] ${pokemon.cnName} 将 ${stat} 下降反弹给了 ${source.cnName}!`);
                return 0; // 自己不受影响
            }
            return boost;
        }
    },

    // 【吸盘】防止被吼叫/龙尾强制换下
    'Suction Cups': {
        preventPhazing: true
    },

    // 【黏着】防止道具被偷/被拍落
    'Sticky Hold': {
        preventItemTheft: true
    },

    // 【精神力】防止畏缩
    'Inner Focus': {
        preventFlinch: true
    },

    // 【我行我素】防止混乱
    'Own Tempo': {
        onImmunityStatus: (status) => status === 'confusion'
    },

    // 【迟钝】防止被挑衅和挑拨
    'Oblivious': {
        preventTaunt: true,
        preventAttract: true
    }
};

// ============================================
// 换人阻断校验函数
// ============================================

/**
 * 校验当前宝可梦是否可以主动换人
 * @param {Object} pokemon - 想要换人的宝可梦
 * @param {Object} opponent - 对手宝可梦
 * @param {Object} battle - 战斗对象
 * @returns {Object} { canSwitch: boolean, reason?: string }
 */
function checkCanSwitch(pokemon, opponent, battle) {
    // 0. 特殊状态直接放行
    // 如果使用了 U-turn 等 Pivot 招式，或者携带漂亮外壳，无视一切锁定
    if (pokemon.isPivoting) return { canSwitch: true };
    if (pokemon.item === 'Shed Shell') return { canSwitch: true };

    // 1. 幽灵系特权：想走就走（六代后）
    if (pokemon.types && pokemon.types.includes('Ghost')) return { canSwitch: true };

    // 2. 检查自身的异常状态 (Volatile)
    if (pokemon.volatile) {
        // 黑色目光/挡路等造成的 cantEscape 状态
        if (pokemon.volatile.cantEscape) {
            return { canSwitch: false, reason: `${pokemon.cnName} 被困住了，无法逃走！` };
        }
        // 束缚状态（熔岩风暴、火焰旋涡等）
        if (pokemon.volatile.partiallyTrapped) {
            return { canSwitch: false, reason: `${pokemon.cnName} 正处于束缚状态，无法逃走！` };
        }
    }

    // 3. 检查对手特性 (Abilities)
    if (opponent && opponent.isAlive && opponent.isAlive()) {
        const ability = opponent.ability || '';
        const handler = AbilityHandlers[ability];

        if (handler && handler.isTrapping && handler.canTrap) {
            if (handler.canTrap(opponent, pokemon)) {
                // 根据特性返回不同的提示
                if (ability === 'Shadow Tag') {
                    return { canSwitch: false, reason: `${opponent.cnName} 的踩影让脚因为恐惧而无法移动！` };
                }
                if (ability === 'Magnet Pull') {
                    return { canSwitch: false, reason: `${opponent.cnName} 的强力磁场吸住了钢属性！` };
                }
                if (ability === 'Arena Trap') {
                    return { canSwitch: false, reason: `${opponent.cnName} 封锁了地面，无法逃走！` };
                }
                return { canSwitch: false, reason: `被对手的特性困住了！` };
            }
        }
    }

    return { canSwitch: true };
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.AbilityHandlers = AbilityHandlers;
    window.checkCanSwitch = checkCanSwitch;
}
