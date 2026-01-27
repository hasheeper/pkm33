/**
 * ===========================================
 * ENVIRONMENT OVERLAY SYSTEM - 环境图层系统
 * ===========================================
 * 
 * 核心理念: 让 AI 用"文学描述"生成"数学原子"，JS 引擎只负责执行
 * 
 * 三大原子类型:
 * - A类: 数值修正 (Stat Mod) - Atk/Def/SpA/SpD/Spd/Acc/Crit/Dmg × N
 * - B类: 资源跳动 (HP/Resource) - HP ± N% 每回合
 * - C类: 类型与免控 (Tags) - Immune/Weak/Ban/Grant
 * 
 * JSON 协议示例:
 * {
 *   "env_id": "radiation_rain",
 *   "env_name": "辐射酸雨",
 *   "narrative": "腐蚀性的绿色酸雨从天而降...",
 *   "duration": 5,
 *   "rules": [
 *     { "target": "Type:Steel", "eff": ["Def:0.7", "HP:-0.125"] },
 *     { "target": "Type:Poison", "eff": ["Spd:1.5", "HP:0.06"] },
 *     { "target": "MoveType:Fire", "eff": ["Dmg:0.5"] }
 *   ]
 * }
 */

// ============================================
// 环境图层管理器
// ============================================

class EnvironmentOverlay {
    constructor() {
        this.activeEnvs = [];      // 当前激活的环境列表
        this.envCounter = 0;       // 环境 ID 计数器
        
        // 效果原子别名映射 (支持模糊匹配)
        this.statAliases = {
            // 攻击
            'atk': 'atk', 'attack': 'atk', '攻击': 'atk', '物攻': 'atk',
            // 防御
            'def': 'def', 'defense': 'def', '防御': 'def', '物防': 'def',
            // 特攻
            'spa': 'spa', 'spatk': 'spa', 'specialattack': 'spa', '特攻': 'spa',
            // 特防
            'spd': 'spd', 'spdef': 'spd', 'specialdefense': 'spd', '特防': 'spd',
            // 速度
            'spe': 'spe', 'spd': 'spe', 'speed': 'spe', '速度': 'spe',
            // 命中
            'acc': 'accuracy', 'accuracy': 'accuracy', '命中': 'accuracy',
            // 暴击
            'crit': 'crit', 'critical': 'crit', '暴击': 'crit',
            // 伤害
            'dmg': 'dmg', 'damage': 'dmg', '伤害': 'dmg', '威力': 'dmg',
            // HP
            'hp': 'hp', '血量': 'hp', '生命': 'hp'
        };
        
        // 属性别名映射
        this.typeAliases = {
            'normal': 'Normal', '一般': 'Normal',
            'fire': 'Fire', '火': 'Fire',
            'water': 'Water', '水': 'Water',
            'electric': 'Electric', '电': 'Electric',
            'grass': 'Grass', '草': 'Grass',
            'ice': 'Ice', '冰': 'Ice',
            'fighting': 'Fighting', '格斗': 'Fighting',
            'poison': 'Poison', '毒': 'Poison',
            'ground': 'Ground', '地面': 'Ground',
            'flying': 'Flying', '飞行': 'Flying',
            'psychic': 'Psychic', '超能': 'Psychic',
            'bug': 'Bug', '虫': 'Bug',
            'rock': 'Rock', '岩石': 'Rock',
            'ghost': 'Ghost', '幽灵': 'Ghost',
            'dragon': 'Dragon', '龙': 'Dragon',
            'dark': 'Dark', '恶': 'Dark',
            'steel': 'Steel', '钢': 'Steel',
            'fairy': 'Fairy', '妖精': 'Fairy'
        };
    }
    
    // ============================================
    // 核心 API
    // ============================================
    
    /**
     * 注入新环境
     * @param {Object|string} envJSON - 环境 JSON 对象或字符串
     * @returns {Object} 解析后的环境对象
     */
    inject(envJSON) {
        const env = this.parse(envJSON);
        if (!env) {
            console.error('[ENV OVERLAY] 环境解析失败');
            return null;
        }
        
        // 分配唯一 ID
        env._id = ++this.envCounter;
        env._startTurn = this._getCurrentTurn();
        
        this.activeEnvs.push(env);
        console.log(`[ENV OVERLAY] ✨ 环境注入: ${env.env_name || env.env_id || 'Unknown'}`);
        console.log(`[ENV OVERLAY] 规则数: ${env.rules?.length || 0}`);
        
        return env;
    }
    
    /**
     * 移除环境
     * @param {number|string} envIdOrIndex - 环境 ID 或索引
     */
    remove(envIdOrIndex) {
        if (typeof envIdOrIndex === 'number' && envIdOrIndex < 100) {
            // 按索引移除
            this.activeEnvs.splice(envIdOrIndex, 1);
        } else {
            // 按 ID 移除
            this.activeEnvs = this.activeEnvs.filter(e => e._id !== envIdOrIndex && e.env_id !== envIdOrIndex);
        }
    }
    
    /**
     * 清空所有环境
     */
    clear() {
        this.activeEnvs = [];
        console.log('[ENV OVERLAY] 所有环境已清空');
    }
    
    // ============================================
    // JSON 解析器 (容错设计)
    // ============================================
    
    /**
     * 解析环境 JSON
     * @param {Object|string} input - JSON 对象或字符串
     * @returns {Object|null} 解析后的环境对象
     */
    parse(input) {
        let json;
        
        // 字符串解析
        if (typeof input === 'string') {
            try {
                // 尝试提取 JSON 块 (支持 AI 输出中的 ```json ... ```)
                const jsonMatch = input.match(/```(?:json)?\s*([\s\S]*?)```/);
                const jsonStr = jsonMatch ? jsonMatch[1] : input;
                json = JSON.parse(jsonStr.trim());
            } catch (e) {
                console.error('[ENV OVERLAY] JSON 解析失败:', e.message);
                return null;
            }
        } else {
            json = input;
        }
        
        if (!json || typeof json !== 'object') {
            return null;
        }
        
        // 构建标准化环境对象
        const env = {
            env_id: json.env_id || json.id || `env_${Date.now()}`,
            env_name: json.env_name || json.name || json.env_ui_name || '未知环境',
            narrative: json.narrative || json.description || '',
            duration: json.duration ?? 0,  // 0 = 永久
            rules: []
        };
        
        // 解析规则
        const rawRules = json.rules || json.effects || [];
        for (const rule of rawRules) {
            const parsed = this._parseRule(rule);
            if (parsed) {
                env.rules.push(parsed);
            }
        }
        
        return env;
    }
    
    /**
     * 解析单条规则
     * @private
     */
    _parseRule(rule) {
        if (!rule) return null;
        
        const parsed = {
            target: this._normalizeTarget(rule.target || 'ALL'),
            effects: {
                statMods: {},    // { atk: 1.5, def: 0.7 }
                hpChange: 0,     // 每回合 HP 变化 (正数回血，负数扣血)
                hpOnce: 0,       // 一次性 HP 变化
                dmgMod: 1,       // 伤害倍率
                accMod: 1,       // 命中倍率
                critMod: 1,      // 暴击倍率
                healMod: 1,      // 回复效果倍率 (<1 减弱, >1 增强)
                immuneTypes: [], // 免疫属性
                weakTypes: [],   // 追加弱点
                banTypes: [],    // 禁用属性
                banMoves: [],    // 禁用技能
                grantTypes: []   // 获得属性
            }
        };
        
        // 解析效果数组
        const effs = rule.eff || rule.effects || rule.effect_atoms || [];
        const effArray = Array.isArray(effs) ? effs : [effs];
        
        for (const eff of effArray) {
            this._parseEffect(eff, parsed.effects);
        }
        
        return parsed;
    }
    
    /**
     * 解析单个效果原子
     * @private
     */
    _parseEffect(eff, effects) {
        if (!eff || typeof eff !== 'string') return;
        
        // 格式: "Stat:Value" 或 "Stat * Value" 或 "Stat x Value"
        // 例如: "Atk:1.5", "HP:-0.125", "Immune:Ground", "Ban:Flying"
        
        const normalized = eff.trim().toLowerCase();
        
        // 匹配 "stat:value" 或 "stat*value" 或 "stat x value"
        const match = normalized.match(/^([a-z\u4e00-\u9fa5]+)\s*[:*x×]\s*(-?[\d.]+)(:once)?$/i);
        
        if (match) {
            const [, statRaw, valueStr, once] = match;
            const stat = this._normalizeStat(statRaw);
            const value = parseFloat(valueStr);
            
            if (isNaN(value)) return;
            
            // HP 变化特殊处理：允许负值（扣血），范围 -0.5 ~ 0.5
            if (stat === 'hp') {
                const clampedHP = Math.max(-0.5, Math.min(0.5, value));
                if (once) {
                    effects.hpOnce = clampedHP;
                } else {
                    effects.hpChange = clampedHP;
                }
                return;
            }
            
            // 其他数值限制 (防止破坏平衡)
            const clampedValue = Math.max(0.1, Math.min(10, value));
            
            if (stat === 'dmg') {
                effects.dmgMod = clampedValue;
            } else if (stat === 'accuracy') {
                effects.accMod = clampedValue;
            } else if (stat === 'crit') {
                effects.critMod = clampedValue;
            } else if (stat === 'heal' || stat === '回复' || stat === '治愈') {
                // 回复效果修正: Heal:0.5 = 回复减半, Heal:1.5 = 回复增强
                effects.healMod = clampedValue;
            } else if (['atk', 'def', 'spa', 'spd', 'spe'].includes(stat)) {
                effects.statMods[stat] = clampedValue;
            }
            return;
        }
        
        // 匹配类型效果: "Immune:Type", "Weak:Type", "Ban:Type", "Grant:Type"
        const typeMatch = normalized.match(/^(immune|weak|ban|grant|禁用|免疫|弱点|获得)\s*[:：]\s*(.+)$/i);
        if (typeMatch) {
            const [, action, typeRaw] = typeMatch;
            const type = this._normalizeType(typeRaw);
            
            if (!type) return;
            
            const actionLower = action.toLowerCase();
            if (actionLower === 'immune' || actionLower === '免疫') {
                effects.immuneTypes.push(type);
            } else if (actionLower === 'weak' || actionLower === '弱点') {
                effects.weakTypes.push(type);
            } else if (actionLower === 'ban' || actionLower === '禁用') {
                // 判断是禁用属性还是禁用技能
                if (this.typeAliases[typeRaw.toLowerCase()]) {
                    effects.banTypes.push(type);
                } else {
                    effects.banMoves.push(typeRaw);
                }
            } else if (actionLower === 'grant' || actionLower === '获得') {
                effects.grantTypes.push(type);
            }
            return;
        }
        
        // 匹配类型转换: "ToType:Src>Dest" (例如 "ToType:Normal>Electric")
        const toTypeMatch = normalized.match(/^totype\s*[:：]\s*(\w+)\s*[>→]\s*(\w+)$/i);
        if (toTypeMatch) {
            const [, srcRaw, destRaw] = toTypeMatch;
            const srcType = this._normalizeType(srcRaw);
            const destType = this._normalizeType(destRaw);
            
            if (srcType && destType) {
                if (!effects.typeConversions) {
                    effects.typeConversions = [];
                }
                effects.typeConversions.push({ from: srcType, to: destType });
            }
        }
    }
    
    /**
     * 标准化目标选择器
     * @private
     */
    _normalizeTarget(target) {
        if (!target) return { type: 'all' };
        
        const t = target.toString().trim();
        
        // ALL
        if (t.toUpperCase() === 'ALL' || t === '全部' || t === '所有') {
            return { type: 'all' };
        }
        
        // Type:X
        const typeMatch = t.match(/^type\s*[:：]\s*(.+)$/i);
        if (typeMatch) {
            return { type: 'pokemonType', value: this._normalizeType(typeMatch[1]) };
        }
        
        // MoveType:X
        const moveTypeMatch = t.match(/^movetype\s*[:：]\s*(.+)$/i);
        if (moveTypeMatch) {
            return { type: 'moveType', value: this._normalizeType(moveTypeMatch[1]) };
        }
        
        // Side:Player / Side:Enemy
        const sideMatch = t.match(/^side\s*[:：]\s*(player|enemy|玩家|敌方)$/i);
        if (sideMatch) {
            const side = sideMatch[1].toLowerCase();
            return { type: 'side', value: (side === 'player' || side === '玩家') ? 'player' : 'enemy' };
        }
        
        // NOT:X
        const notMatch = t.match(/^not\s*[:：]\s*(.+)$/i);
        if (notMatch) {
            const inner = this._normalizeTarget(notMatch[1]);
            return { type: 'not', inner };
        }
        
        // HasAbility:X
        const abilityMatch = t.match(/^hasability\s*[:：]\s*(.+)$/i);
        if (abilityMatch) {
            return { type: 'hasAbility', value: abilityMatch[1] };
        }
        
        // Flag:X (技能标记，如 Contact, Pulse, Sound, Punch, Bite, Slicing, Bullet)
        const flagMatch = t.match(/^flag\s*[:：]\s*(.+)$/i);
        if (flagMatch) {
            return { type: 'moveFlag', value: flagMatch[1].toLowerCase().trim() };
        }
        
        // 默认当作属性处理
        const maybeType = this._normalizeType(t);
        if (maybeType) {
            return { type: 'pokemonType', value: maybeType };
        }
        
        return { type: 'all' };
    }
    
    /**
     * 标准化属性名
     * @private
     */
    _normalizeType(raw) {
        if (!raw) return null;
        const key = raw.toString().trim().toLowerCase();
        return this.typeAliases[key] || (key.charAt(0).toUpperCase() + key.slice(1));
    }
    
    /**
     * 标准化能力名
     * @private
     */
    _normalizeStat(raw) {
        if (!raw) return null;
        const key = raw.toString().trim().toLowerCase();
        return this.statAliases[key] || key;
    }
    
    /**
     * 获取当前回合数
     * @private
     */
    _getCurrentTurn() {
        if (typeof window !== 'undefined' && window.battle) {
            return window.battle.turn || 0;
        }
        return 0;
    }
    
    // ============================================
    // 效果查询 API (供引擎调用)
    // ============================================
    
    /**
     * 获取宝可梦的数值修正
     * @param {Pokemon} pokemon - 宝可梦实例
     * @param {string} statName - 能力名 (atk/def/spa/spd/spe)
     * @returns {number} 倍率 (默认 1, 范围 0.1 ~ 6.0)
     * 
     * 【叠加规则】多重环境采用乘算叠加 (Multiplicative Stacking)
     * 例如: 环境A Atk:2.0 + 环境B Atk:0.5 = 2.0 * 0.5 = 1.0
     */
    getStatMod(pokemon, statName) {
        let multiplier = 1;
        
        for (const env of this.activeEnvs) {
            for (const rule of env.rules || []) {
                if (this._matchTarget(rule.target, pokemon, null)) {
                    const mod = rule.effects?.statMods?.[statName];
                    if (mod !== undefined) {
                        multiplier *= mod;
                    }
                }
            }
        }
        
        // 【安全限制】防止极端数值，范围 0.1 ~ 6.0
        return Math.max(0.1, Math.min(6.0, multiplier));
    }
    
    /**
     * 获取技能伤害修正
     * @param {Pokemon} attacker - 攻击方
     * @param {Pokemon} defender - 防御方
     * @param {Object} move - 技能对象
     * @returns {number} 倍率 (默认 1, 范围 0.1 ~ 6.0)
     * 
     * 【叠加规则】多重环境采用乘算叠加 (Multiplicative Stacking)
     */
    getDamageMod(attacker, defender, move) {
        let multiplier = 1;
        const moveType = move?.type || 'Normal';
        
        for (const env of this.activeEnvs) {
            for (const rule of env.rules || []) {
                // 检查 MoveType 目标
                if (rule.target?.type === 'moveType') {
                    if (rule.target.value === moveType) {
                        multiplier *= rule.effects?.dmgMod ?? 1;
                    }
                }
                // 检查 MoveFlag 目标 (如 Flag:Contact, Flag:Pulse)
                else if (rule.target?.type === 'moveFlag') {
                    if (this._matchTarget(rule.target, attacker, move)) {
                        multiplier *= rule.effects?.dmgMod ?? 1;
                    }
                }
                // 检查攻击方属性
                else if (this._matchTarget(rule.target, attacker, move)) {
                    multiplier *= rule.effects?.dmgMod ?? 1;
                }
            }
        }
        
        // 【安全限制】防止极端数值，范围 0.1 ~ 6.0
        return Math.max(0.1, Math.min(6.0, multiplier));
    }
    
    /**
     * 获取回合末 HP 变化
     * @param {Pokemon} pokemon - 宝可梦实例
     * @returns {number} HP 变化量 (正数回血，负数扣血，基于 maxHp 的比例)
     */
    getTurnEndHPChange(pokemon) {
        let totalChange = 0;
        
        for (const env of this.activeEnvs) {
            for (const rule of env.rules || []) {
                if (this._matchTarget(rule.target, pokemon, null)) {
                    const hpChange = rule.effects?.hpChange ?? 0;
                    if (hpChange !== 0) {
                        totalChange += hpChange;
                    }
                }
            }
        }
        
        // 返回基于 maxHp 的实际变化量
        if (totalChange !== 0 && pokemon.maxHp) {
            return Math.floor(pokemon.maxHp * totalChange);
        }
        
        return 0;
    }
    
    /**
     * 获取命中率修正
     * @param {Pokemon} attacker - 攻击方
     * @param {Object} move - 技能对象
     * @returns {number} 倍率 (默认 1)
     */
    getAccuracyMod(attacker, move) {
        let multiplier = 1;
        
        for (const env of this.activeEnvs) {
            for (const rule of env.rules || []) {
                if (this._matchTarget(rule.target, attacker, null)) {
                    multiplier *= rule.effects?.accMod ?? 1;
                }
            }
        }
        
        return multiplier;
    }
    
    /**
     * 检查技能是否被禁用
     * @param {Pokemon} pokemon - 使用技能的宝可梦
     * @param {Object} move - 技能对象
     * @returns {boolean} 是否被禁用
     */
    isMoveBanned(pokemon, move) {
        const moveType = move?.type || 'Normal';
        const moveName = move?.name || '';
        
        for (const env of this.activeEnvs) {
            for (const rule of env.rules || []) {
                // 全局禁用检查
                if (rule.target?.type === 'all' || this._matchTarget(rule.target, pokemon, null)) {
                    // 检查属性禁用
                    if (rule.effects?.banTypes?.includes(moveType)) {
                        return true;
                    }
                    // 检查技能名禁用
                    const bannedMoves = rule.effects?.banMoves || [];
                    if (bannedMoves.some(m => m.toLowerCase() === moveName.toLowerCase())) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    /**
     * 获取回复效果修正 (Heal Mod)
     * @param {Pokemon} pokemon - 宝可梦实例
     * @returns {number} 倍率 (默认 1, <1 减弱回复, >1 增强回复)
     */
    getHealMod(pokemon) {
        let multiplier = 1;
        
        for (const env of this.activeEnvs) {
            for (const rule of env.rules || []) {
                if (this._matchTarget(rule.target, pokemon, null)) {
                    const mod = rule.effects?.healMod;
                    if (mod !== undefined) {
                        multiplier *= mod;
                    }
                }
            }
        }
        
        // 限制范围 0.1 ~ 3.0
        return Math.max(0.1, Math.min(3.0, multiplier));
    }
    
    /**
     * 获取类型覆盖 (免疫/弱点)
     * @param {Pokemon} pokemon - 宝可梦实例
     * @returns {Object} { immuneTypes: [], weakTypes: [], grantTypes: [] }
     */
    getTypeOverrides(pokemon) {
        const result = {
            immuneTypes: [],
            weakTypes: [],
            grantTypes: []
        };
        
        for (const env of this.activeEnvs) {
            for (const rule of env.rules || []) {
                if (this._matchTarget(rule.target, pokemon, null)) {
                    result.immuneTypes.push(...(rule.effects?.immuneTypes || []));
                    result.weakTypes.push(...(rule.effects?.weakTypes || []));
                    result.grantTypes.push(...(rule.effects?.grantTypes || []));
                }
            }
        }
        
        return result;
    }
    
    /**
     * 获取技能类型转换
     * @param {Object} move - 技能对象
     * @returns {string} 转换后的类型，如果没有转换则返回原类型
     * 
     * 用法示例: "ToType:Normal>Electric" 将普通系技能转换为电系
     */
    getMoveTypeConversion(move) {
        const originalType = move?.type || 'Normal';
        
        for (const env of this.activeEnvs) {
            for (const rule of env.rules || []) {
                const conversions = rule.effects?.typeConversions || [];
                for (const conv of conversions) {
                    if (conv.from === originalType) {
                        console.log(`[ENV OVERLAY] 类型转换: ${originalType} → ${conv.to}`);
                        return conv.to;
                    }
                }
            }
        }
        
        return originalType;
    }
    
    // ============================================
    // 目标匹配器
    // ============================================
    
    /**
     * 检查目标是否匹配
     * @param {Object} selector - 目标选择器
     * @param {Pokemon} pokemon - 宝可梦实例
     * @param {Object} move - 技能对象 (可选)
     * @returns {boolean}
     */
    _matchTarget(selector, pokemon, move) {
        if (!selector || !pokemon) return false;
        
        switch (selector.type) {
            case 'all':
                return true;
                
            case 'pokemonType':
                const pokeTypes = pokemon.types || [];
                return pokeTypes.includes(selector.value);
                
            case 'moveType':
                return move?.type === selector.value;
                
            case 'side':
                // 需要 battle 上下文判断
                if (typeof window !== 'undefined' && window.battle) {
                    const isPlayer = window.battle.playerParty?.includes(pokemon);
                    return selector.value === 'player' ? isPlayer : !isPlayer;
                }
                return false;
                
            case 'not':
                return !this._matchTarget(selector.inner, pokemon, move);
                
            case 'hasAbility':
                const abilityId = (pokemon.ability || '').toLowerCase().replace(/[^a-z]/g, '');
                const targetAbility = (selector.value || '').toLowerCase().replace(/[^a-z]/g, '');
                return abilityId === targetAbility;
            
            case 'moveFlag':
                // 检查技能是否具有指定的 flag (如 contact, pulse, sound, punch, bite, slicing, bullet)
                if (!move) return false;
                const moveFlags = move.flags || {};
                const targetFlag = selector.value;
                return !!moveFlags[targetFlag];
                
            default:
                return false;
        }
    }
    
    // ============================================
    // 回合末处理
    // ============================================
    
    /**
     * 处理回合末效果 (HP 跳动等)
     * @param {Pokemon} pokemon - 宝可梦实例
     * @returns {Object} { hpChange: number, logs: string[] }
     */
    processTurnEnd(pokemon) {
        const result = {
            hpChange: 0,
            logs: []
        };
        
        const hpDelta = this.getTurnEndHPChange(pokemon);
        
        if (hpDelta !== 0) {
            result.hpChange = hpDelta;
            
            if (hpDelta > 0) {
                result.logs.push(`${pokemon.cnName || pokemon.name} 受到环境影响，回复了 ${hpDelta} HP！`);
            } else {
                result.logs.push(`${pokemon.cnName || pokemon.name} 受到环境影响，损失了 ${Math.abs(hpDelta)} HP！`);
            }
        }
        
        return result;
    }
    
    /**
     * 处理环境持续时间
     */
    tickDuration() {
        const currentTurn = this._getCurrentTurn();
        
        this.activeEnvs = this.activeEnvs.filter(env => {
            if (env.duration <= 0) return true; // 永久环境
            
            const elapsed = currentTurn - (env._startTurn || 0);
            if (elapsed >= env.duration) {
                console.log(`[ENV OVERLAY] ⏰ 环境结束: ${env.env_name}`);
                return false;
            }
            return true;
        });
    }
    
    // ============================================
    // 调试 API
    // ============================================
    
    /**
     * 获取当前所有激活环境的摘要
     */
    getSummary() {
        return this.activeEnvs.map(env => ({
            id: env._id,
            name: env.env_name,
            rules: env.rules?.length || 0,
            duration: env.duration,
            elapsed: this._getCurrentTurn() - (env._startTurn || 0)
        }));
    }
    
    /**
     * 打印调试信息
     */
    debug() {
        console.log('=== Environment Overlay Debug ===');
        console.log('Active Environments:', this.activeEnvs.length);
        for (const env of this.activeEnvs) {
            console.log(`  [${env._id}] ${env.env_name}`);
            for (const rule of env.rules || []) {
                console.log(`    Target: ${JSON.stringify(rule.target)}`);
                console.log(`    Effects:`, rule.effects);
            }
        }
    }
}

// ============================================
// UI 更新函数
// ============================================

/**
 * 更新环境图层 HUD 显示
 */
function updateEnvOverlayHUD() {
    if (typeof document === 'undefined') return;
    
    const hud = document.getElementById('env-overlay-hud');
    const nameEl = document.getElementById('env-overlay-name');
    const descEl = document.getElementById('env-overlay-desc');
    
    if (!hud) return;
    
    const envs = envOverlay.activeEnvs;
    
    if (envs.length === 0) {
        hud.classList.add('hidden');
        return;
    }
    
    // 显示第一个环境（或合并显示）
    const env = envs[0];
    if (nameEl) nameEl.textContent = env.env_name || '环境效果';
    if (descEl) descEl.textContent = env.narrative || `${env.rules?.length || 0} 条规则生效中`;
    
    hud.classList.remove('hidden');
}

// ============================================
// 全局单例 & 导出
// ============================================

const envOverlay = new EnvironmentOverlay();

// 重写 inject 方法以自动更新 UI
const originalInject = envOverlay.inject.bind(envOverlay);
envOverlay.inject = function(envJSON) {
    const result = originalInject(envJSON);
    updateEnvOverlayHUD();
    return result;
};

// 重写 remove 和 clear 方法以自动更新 UI
const originalRemove = envOverlay.remove.bind(envOverlay);
envOverlay.remove = function(envIdOrIndex) {
    originalRemove(envIdOrIndex);
    updateEnvOverlayHUD();
};

const originalClear = envOverlay.clear.bind(envOverlay);
envOverlay.clear = function() {
    originalClear();
    updateEnvOverlayHUD();
};

// 浏览器环境
if (typeof window !== 'undefined') {
    window.envOverlay = envOverlay;
    window.EnvironmentOverlay = EnvironmentOverlay;
    window.updateEnvOverlayHUD = updateEnvOverlayHUD;
}

// Node.js 环境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EnvironmentOverlay, envOverlay };
}

export { EnvironmentOverlay, envOverlay };
