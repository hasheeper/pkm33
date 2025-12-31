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
// 14. 超极巨化因子速查表 (G-Max Species Data)
// ============================================
// Key: 宝可梦 Species ID (小写无符号)
// Value: { move: 专属招式名, type: 触发属性, cn: 中文招式名 }
const GMAX_SPECIES_DATA = {
    // ================= 关都地区 (Gen 1) =================
    'venusaur':         { move: 'G-Max Vine Lash',    type: 'Grass',    cn: '超极巨灰飞鞭灭' },   // 妙蛙花
    'charizard':        { move: 'G-Max Wildfire',     type: 'Fire',     cn: '超极巨深渊灭焰' },   // 喷火龙
    'blastoise':        { move: 'G-Max Cannonade',    type: 'Water',    cn: '超极巨水炮轰灭' },   // 水箭龟
    'butterfree':       { move: 'G-Max Befuddle',     type: 'Bug',      cn: '超极巨蝶影蛊惑' },   // 巴大蝶
    'pikachu':          { move: 'G-Max Volt Crash',   type: 'Electric', cn: '超极巨万雷轰顶' },   // 皮卡丘
    'meowth':           { move: 'G-Max Gold Rush',    type: 'Normal',   cn: '超极巨特大金币' },   // 喵喵
    'machamp':          { move: 'G-Max Chi Strike',   type: 'Fighting', cn: '超极巨会心一击' },   // 怪力
    'gengar':           { move: 'G-Max Terror',       type: 'Ghost',    cn: '超极巨幻影幽魂' },   // 耿鬼
    'kingler':          { move: 'G-Max Foam Burst',   type: 'Water',    cn: '超极巨激漩泡涡' },   // 巨钳蟹
    'lapras':           { move: 'G-Max Resonance',    type: 'Ice',      cn: '超极巨极光旋律' },   // 拉普拉斯 (冰系触发)
    'eevee':            { move: 'G-Max Cuddle',       type: 'Normal',   cn: '超极巨热情拥抱' },   // 伊布
    'snorlax':          { move: 'G-Max Replenish',    type: 'Normal',   cn: '超极巨资源再生' },   // 卡比兽

    // ================= 合众地区 (Gen 5) =================
    'garbodor':         { move: 'G-Max Malodor',      type: 'Poison',   cn: '超极巨臭气冲天' },   // 灰尘山

    // ================= 阿罗拉地区 (Gen 7) =================
    'melmetal':         { move: 'G-Max Meltdown',     type: 'Steel',    cn: '超极巨液金熔击' },   // 美录梅塔

    // ================= 伽勒尔地区 (Gen 8) =================
    'rillaboom':        { move: 'G-Max Drum Solo',    type: 'Grass',    cn: '超极巨狂擂乱打' },   // 轰擂金刚猩
    'cinderace':        { move: 'G-Max Fireball',     type: 'Fire',     cn: '超极巨破阵火球' },   // 闪焰王牌
    'inteleon':         { move: 'G-Max Hydrosnipe',   type: 'Water',    cn: '超极巨狙击神射' },   // 千面避役
    'corviknight':      { move: 'G-Max Wind Rage',    type: 'Flying',   cn: '超极巨旋风袭卷' },   // 钢铠鸦
    'orbeetle':         { move: 'G-Max Gravitas',     type: 'Psychic',  cn: '超极巨天道七星' },   // 以欧路普
    'drednaw':          { move: 'G-Max Stonesurge',   type: 'Water',    cn: '超极巨岩阵以待' },   // 暴噬龟
    'coalossal':        { move: 'G-Max Volcalith',    type: 'Rock',     cn: '超极巨炎石喷发' },   // 巨炭山
    'flapple':          { move: 'G-Max Tartness',     type: 'Grass',    cn: '超极巨酸不溜丢' },   // 苹裹龙
    'appletun':         { move: 'G-Max Sweetness',    type: 'Grass',    cn: '超极巨琼浆玉液' },   // 丰蜜龙
    'sandaconda':       { move: 'G-Max Sandblast',    type: 'Ground',   cn: '超极巨沙尘漫天' },   // 沙螺蟒
    'toxtricity':       { move: 'G-Max Stun Shock',   type: 'Electric', cn: '超极巨异毒电场' },   // 颤弦蝾螈 (高调)
    'toxtricitylowkey': { move: 'G-Max Stun Shock',   type: 'Electric', cn: '超极巨异毒电场' },   // 颤弦蝾螈 (低调)
    'centiskorch':      { move: 'G-Max Centiferno',   type: 'Fire',     cn: '超极巨百火焚野' },   // 焚焰蚣
    'hatterene':        { move: 'G-Max Smite',        type: 'Fairy',    cn: '超极巨天谴雷诛' },   // 布莉姆温
    'grimmsnarl':       { move: 'G-Max Snooze',       type: 'Dark',     cn: '超极巨睡魔降临' },   // 长毛巨魔
    'alcremie':         { move: 'G-Max Finale',       type: 'Fairy',    cn: '超极巨幸福圆满' },   // 霜奶仙
    'copperajah':       { move: 'G-Max Steelsurge',   type: 'Steel',    cn: '超极巨钢铁阵法' },   // 大王铜象
    'duraludon':        { move: 'G-Max Depletion',    type: 'Dragon',   cn: '超极巨劣化衰变' },   // 铝钢龙

    // ================= 武道熊师 (Urshifu) =================
    'urshifu':             { move: 'G-Max One Blow',   type: 'Dark',    cn: '超极巨夺命一击' },   // 一击流 (默认)
    'urshifusinglestrike': { move: 'G-Max One Blow',   type: 'Dark',    cn: '超极巨夺命一击' },   // 一击流
    'urshifurapidstrike':  { move: 'G-Max Rapid Flow', type: 'Water',   cn: '超极巨流水连击' }    // 连击流
};

// ============================================
// 15. 通用极巨招式映射表 (Generic Max Moves by Type)
// ============================================
const GENERIC_MAX_BY_TYPE = {
    'Normal':   'Max Strike',
    'Fire':     'Max Flare',
    'Water':    'Max Geyser',
    'Electric': 'Max Lightning',
    'Grass':    'Max Overgrowth',
    'Ice':      'Max Hailstorm',
    'Fighting': 'Max Knuckle',
    'Poison':   'Max Ooze',
    'Ground':   'Max Quake',
    'Flying':   'Max Airstream',
    'Psychic':  'Max Mindstorm',
    'Bug':      'Max Flutterby',
    'Rock':     'Max Rockfall',
    'Ghost':    'Max Phantasm',
    'Dragon':   'Max Wyrmwind',
    'Dark':     'Max Darkness',
    'Steel':    'Max Steelspike',
    'Fairy':    'Max Starfall'
};

// ============================================
// 16. 通用极巨招式中文名映射
// ============================================
const GENERIC_MAX_CN = {
    'Max Strike':    '极巨攻击',
    'Max Flare':     '极巨火爆',
    'Max Geyser':    '极巨水流',
    'Max Lightning': '极巨闪电',
    'Max Overgrowth':'极巨草原',
    'Max Hailstorm': '极巨寒冰',
    'Max Knuckle':   '极巨拳斗',
    'Max Ooze':      '极巨酸毒',
    'Max Quake':     '极巨大地',
    'Max Airstream': '极巨飞冲',
    'Max Mindstorm': '极巨超能',
    'Max Flutterby': '极巨虫蛊',
    'Max Rockfall':  '极巨岩石',
    'Max Phantasm':  '极巨幽魂',
    'Max Wyrmwind':  '极巨龙骑',
    'Max Darkness':  '极巨恶霸',
    'Max Steelspike':'极巨钢铁',
    'Max Starfall':  '极巨妖精',
    'Max Guard':     '极巨防壁'
};

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
        FALLBACK_MOVES,
        GMAX_SPECIES_DATA,
        GENERIC_MAX_BY_TYPE,
        GENERIC_MAX_CN
    };
    
    // 也单独导出常用的
    window.PRIORITY_MAP = PRIORITY_MAP;
    window.RECOIL_MOVES = RECOIL_MOVES;
    window.DRAIN_MOVES = DRAIN_MOVES;
    window.TRAPPING_MOVES = TRAPPING_MOVES;
    window.ALWAYS_CRIT_MOVES = ALWAYS_CRIT_MOVES;
    window.FORM_SUFFIXES = FORM_SUFFIXES;
    window.GMAX_SPECIES_DATA = GMAX_SPECIES_DATA;
    window.GENERIC_MAX_BY_TYPE = GENERIC_MAX_BY_TYPE;
    window.GENERIC_MAX_CN = GENERIC_MAX_CN;
}
