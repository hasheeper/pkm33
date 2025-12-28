/**
 * =============================================
 * MOVE CONSTANTS - 招式硬编码数据
 * =============================================
 * 
 * 本文件存放所有招式相关的硬编码数据，
 * 作为 MOVES 数据库的补充/后备。
 * 
 * battle-engine.js 中的核心逻辑会优先读取 MOVES 数据，
 * 如果 MOVES 中没有对应数据，则使用这里的硬编码。
 */

// ============================================
// 1. 招式优先级映射 (Priority Map)
// ============================================
// 用于 getMovePriority() 函数的后备数据
const PRIORITY_MAP = {
    // +5
    'Helping Hand': 5,
    
    // +4 (守住类)
    'Protect': 4, 
    'Detect': 4, 
    'Endure': 4, 
    'Magic Coat': 4, 
    'Snatch': 4,
    'King\'s Shield': 4, 
    'Spiky Shield': 4, 
    'Baneful Bunker': 4, 
    'Obstruct': 4, 
    'Silk Trap': 4,
    
    // +3
    'Fake Out': 3, 
    'Quick Guard': 3, 
    'Wide Guard': 3, 
    'Crafty Shield': 3,
    
    // +2
    'Extreme Speed': 2, 
    'Feint': 2, 
    'First Impression': 2, 
    'Accelerock': 2,
    
    // +1 (常见先制技)
    'Aqua Jet': 1, 
    'Bullet Punch': 1, 
    'Ice Shard': 1, 
    'Mach Punch': 1,
    'Quick Attack': 1, 
    'Shadow Sneak': 1, 
    'Sucker Punch': 1, 
    'Vacuum Wave': 1,
    'Water Shuriken': 1, 
    'Jet Punch': 1, 
    'Grassy Glide': 1,
    
    // -1
    'Vital Throw': -1,
    
    // -3
    'Focus Punch': -3,
    
    // -4
    'Avalanche': -4, 
    'Revenge': -4,
    
    // -5
    'Counter': -5, 
    'Mirror Coat': -5,
    
    // -6
    'Circle Throw': -6, 
    'Dragon Tail': -6, 
    'Roar': -6, 
    'Whirlwind': -6,
    
    // -7
    'Trick Room': -7
};

// ============================================
// 2. 反伤技能映射 (Recoil Moves)
// ============================================
// 格式: { 招式名: [分子, 分母] } 表示反伤 = 伤害 * 分子/分母
const RECOIL_MOVES = {
    'Brave Bird': [1, 3],
    'Double-Edge': [1, 3],
    'Flare Blitz': [1, 3],
    'Head Smash': [1, 2],
    'Wood Hammer': [1, 3],
    'Take Down': [1, 4],
    'Wild Charge': [1, 4],
    'Volt Tackle': [1, 3],
    'Submission': [1, 4],
    'Wave Crash': [1, 3],
    'Light of Ruin': [1, 2],
    'Head Charge': [1, 4]
};

// ============================================
// 3. 吸血技能映射 (Drain Moves)
// ============================================
// 格式: { 招式名: [分子, 分母] } 表示回复 = 伤害 * 分子/分母
const DRAIN_MOVES = {
    'Giga Drain': [1, 2],
    'Drain Punch': [1, 2],
    'Horn Leech': [1, 2],
    'Absorb': [1, 2],
    'Mega Drain': [1, 2],
    'Leech Life': [1, 2],
    'Draining Kiss': [3, 4],
    'Oblivion Wing': [3, 4],
    'Parabolic Charge': [1, 2],
    'Dream Eater': [1, 2],
    'Bitter Blade': [1, 2],
    'Bouncy Bubble': [1, 2]
};

// ============================================
// 4. 束缚类技能 (Trapping Moves)
// ============================================
// 这些技能会让目标进入 partiallytrapped 状态
const TRAPPING_MOVES = [
    'Fire Spin',
    'Whirlpool',
    'Bind',
    'Wrap',
    'Sand Tomb',
    'Magma Storm',
    'Infestation',
    'Clamp',
    'Snap Trap',
    'Thunder Cage'
];

// ============================================
// 5. 必定暴击技能 (Always Crit Moves)
// ============================================
const ALWAYS_CRIT_MOVES = [
    'Surging Strikes',
    'Wicked Blow',
    'Frost Breath',
    'Storm Throw',
    'Zippy Zap',
    'Flower Trick'
];

// ============================================
// 6. AI 评分用 - 强化技能列表 (Boost Moves)
// ============================================
const AI_BOOST_MOVES = [
    'Swords Dance',
    'Calm Mind',
    'Dragon Dance',
    'Nasty Plot',
    'Quiver Dance',
    'Shell Smash',
    'Bulk Up',
    'Hone Claws',
    'Work Up',
    'Agility',
    'Rock Polish',
    'Autotomize',
    'Coil',
    'Shift Gear',
    'Cotton Guard',
    'Iron Defense',
    'Amnesia',
    'Acid Armor',
    'Barrier',
    'Cosmic Power',
    'Defend Order',
    'Stockpile'
];

// ============================================
// 7. AI 评分用 - 状态技能列表 (Status Inflict Moves)
// ============================================
const AI_STATUS_MOVES = [
    'Thunder Wave',
    'Will-O-Wisp',
    'Toxic',
    'Spore',
    'Sleep Powder',
    'Hypnosis',
    'Sing',
    'Stun Spore',
    'Glare',
    'Nuzzle',
    'Lovely Kiss',
    'Dark Void',
    'Grass Whistle',
    'Yawn'
];

// ============================================
// 8. AI 评分用 - 睡眠技能列表 (Sleep Moves)
// ============================================
const AI_SLEEP_MOVES = [
    'Spore',
    'Sleep Powder',
    'Hypnosis',
    'Sing',
    'Lovely Kiss',
    'Dark Void',
    'Grass Whistle'
];

// ============================================
// 9. AI 评分用 - 麻痹技能列表 (Paralyze Moves)
// ============================================
const AI_PARALYZE_MOVES = [
    'Thunder Wave',
    'Glare',
    'Stun Spore',
    'Nuzzle'
];

// ============================================
// 10. AI 评分用 - 回复技能列表 (Heal Moves)
// ============================================
const AI_HEAL_MOVES = [
    'Recover',
    'Roost',
    'Soft-Boiled',
    'Slack Off',
    'Moonlight',
    'Morning Sun',
    'Synthesis',
    'Wish',
    'Rest',
    'Milk Drink',
    'Shore Up',
    'Strength Sap',
    'Jungle Healing',
    'Life Dew'
];

// ============================================
// 11. AI 评分用 - 守住技能列表 (Protect Moves)
// ============================================
const AI_PROTECT_MOVES = [
    'Protect',
    'Detect',
    'King\'s Shield',
    'Spiky Shield',
    'Baneful Bunker',
    'Obstruct',
    'Silk Trap',
    'Max Guard'
];

// ============================================
// 12. 宝可梦形态后缀 (Form Suffixes)
// ============================================
// 用于 extractBaseFormId() 函数
const FORM_SUFFIXES = [
    'starter',      // 搭档形态 (Let's Go)
    'gmax',         // 极巨化
    'megax', 'megay', 'mega',  // Mega进化
    'alola', 'galar', 'hisui', 'paldea',  // 地区形态
    'therian', 'incarnate',  // 灵兽/化身
    'origin', 'altered',     // 起源/另一形态
    'crowned', 'hero',       // 王冠/英雄
    'eternamax',    // 无极巨化
    'primal',       // 原始回归
    'ultra',        // 究极
    'ash',          // 小智版
    'totem',        // 霸主
    'cosplay', 'phd', 'libre', 'popstar', 'rockstar', 'belle', // 皮卡丘换装
    'original', 'hoenn', 'sinnoh', 'unova', 'kalos', 'partner', 'world'  // 帽子皮卡丘
];

// ============================================
// 13. 默认后备招式 (Fallback Moves)
// ============================================
const FALLBACK_MOVES = [
    'Tackle',
    'Quick Attack',
    'Ember',
    'Water Gun',
    'Vine Whip'
];

// ============================================
// 导出到全局 (Export to Window)
// ============================================
if (typeof window !== 'undefined') {
    window.MOVE_CONSTANTS = {
        PRIORITY_MAP,
        RECOIL_MOVES,
        DRAIN_MOVES,
        TRAPPING_MOVES,
        ALWAYS_CRIT_MOVES,
        AI_BOOST_MOVES,
        AI_STATUS_MOVES,
        AI_SLEEP_MOVES,
        AI_PARALYZE_MOVES,
        AI_HEAL_MOVES,
        AI_PROTECT_MOVES,
        FORM_SUFFIXES,
        FALLBACK_MOVES
    };
    
    // 也单独导出常用的
    window.PRIORITY_MAP = PRIORITY_MAP;
    window.RECOIL_MOVES = RECOIL_MOVES;
    window.DRAIN_MOVES = DRAIN_MOVES;
    window.TRAPPING_MOVES = TRAPPING_MOVES;
    window.ALWAYS_CRIT_MOVES = ALWAYS_CRIT_MOVES;
    window.FORM_SUFFIXES = FORM_SUFFIXES;
}
