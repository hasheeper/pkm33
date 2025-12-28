/**
 * ===========================================
 * ITEMS-DATA.JS - 道具数据库
 * ===========================================
 * 
 * 集中管理所有道具数据，消除硬编码
 * 参考 Showdown 的 items.ts 结构
 * 
 * 职责:
 * - 道具基础数据 (名称、类型、效果)
 * - 道具分类常量
 * - 道具效果处理器
 */

// ============================================
// 道具数据库
// ============================================

const ITEMS = {
    // ========== 战斗道具 (Battle Items) ==========
    
    // --- 气势披带 (Focus Sash) ---
    focussash: {
        id: 'focussash',
        name: 'Focus Sash',
        cnName: '气势披带',
        category: 'held',
        consumable: true,
        fling: { basePower: 10 },
        // 效果: 满血时，致命伤害只会让 HP 剩 1
        effect: 'surviveLethal',
        description: '当持有者HP满时，受到致命伤害会保留1点HP（一次性）',
    },
    
    // --- 讲究系列 (Choice Items) ---
    choiceband: {
        id: 'choiceband',
        name: 'Choice Band',
        cnName: '讲究头带',
        category: 'held',
        consumable: false,
        fling: { basePower: 10 },
        effect: 'choiceLock',
        statBoost: { atk: 1.5 },
        isChoice: true,
        description: '物攻x1.5，但只能使用第一个选择的招式',
    },
    choicescarf: {
        id: 'choicescarf',
        name: 'Choice Scarf',
        cnName: '讲究围巾',
        category: 'held',
        consumable: false,
        fling: { basePower: 10 },
        effect: 'choiceLock',
        statBoost: { spe: 1.5 },
        isChoice: true,
        description: '速度x1.5，但只能使用第一个选择的招式',
    },
    choicespecs: {
        id: 'choicespecs',
        name: 'Choice Specs',
        cnName: '讲究眼镜',
        category: 'held',
        consumable: false,
        fling: { basePower: 10 },
        effect: 'choiceLock',
        statBoost: { spa: 1.5 },
        isChoice: true,
        description: '特攻x1.5，但只能使用第一个选择的招式',
    },
    
    // --- 生命宝珠 (Life Orb) ---
    lifeorb: {
        id: 'lifeorb',
        name: 'Life Orb',
        cnName: '生命宝珠',
        category: 'held',
        consumable: false,
        fling: { basePower: 30 },
        effect: 'lifeOrb',
        damageBoost: 1.3,
        recoilPercent: 0.1, // 10% 最大HP
        description: '攻击伤害x1.3，但每次攻击损失10%最大HP',
    },
    
    // --- 剩饭 (Leftovers) ---
    leftovers: {
        id: 'leftovers',
        name: 'Leftovers',
        cnName: '剩饭',
        category: 'held',
        consumable: false,
        fling: { basePower: 10 },
        effect: 'endOfTurnHeal',
        healPercent: 1/16, // 每回合恢复 1/16 最大HP
        description: '每回合结束时恢复1/16最大HP',
    },
    
    // --- 黑色淤泥 (Black Sludge) ---
    blacksludge: {
        id: 'blacksludge',
        name: 'Black Sludge',
        cnName: '黑色淤泥',
        category: 'held',
        consumable: false,
        fling: { basePower: 30 },
        effect: 'blackSludge',
        healPercent: 1/16, // 毒系恢复
        damagePercent: 1/8, // 非毒系受伤
        description: '毒属性每回合恢复1/16HP，非毒属性每回合损失1/8HP',
    },
    
    // --- 进化奇石 (Eviolite) ---
    eviolite: {
        id: 'eviolite',
        name: 'Eviolite',
        cnName: '进化奇石',
        category: 'held',
        consumable: false,
        fling: { basePower: 40 },
        effect: 'eviolite',
        defBoost: 1.5,
        spdBoost: 1.5,
        requiresNFE: true, // 只对未完全进化的宝可梦有效
        description: '未完全进化的宝可梦防御和特防x1.5',
    },
    
    // --- 突击背心 (Assault Vest) ---
    assaultvest: {
        id: 'assaultvest',
        name: 'Assault Vest',
        cnName: '突击背心',
        category: 'held',
        consumable: false,
        fling: { basePower: 80 },
        effect: 'assaultVest',
        spdBoost: 1.5,
        disableStatus: true, // 禁止使用变化技
        description: '特防x1.5，但无法使用变化技',
    },
    
    // --- 气球 (Air Balloon) ---
    airballoon: {
        id: 'airballoon',
        name: 'Air Balloon',
        cnName: '气球',
        category: 'held',
        consumable: true,
        fling: { basePower: 10 },
        effect: 'airBalloon',
        immunity: ['Ground'], // 免疫地面
        popOnHit: true, // 被攻击后破裂
        description: '免疫地面系招式，被攻击后破裂',
    },
    
    // --- 光之黏土 (Light Clay) ---
    lightclay: {
        id: 'lightclay',
        name: 'Light Clay',
        cnName: '光之黏土',
        category: 'held',
        consumable: false,
        fling: { basePower: 30 },
        effect: 'extendScreens',
        screenDuration: 8, // 壁类招式持续8回合（默认5）
        description: '反射壁、光墙、极光幕持续8回合',
    },
    
    // --- 凸凸头盔 (Rocky Helmet) ---
    rockyhelmet: {
        id: 'rockyhelmet',
        name: 'Rocky Helmet',
        cnName: '凸凸头盔',
        category: 'held',
        consumable: false,
        fling: { basePower: 60 },
        effect: 'rockyHelmet',
        contactDamage: 1/6, // 接触攻击者损失 1/6 HP
        description: '被接触类招式攻击时，攻击者损失1/6最大HP',
    },
    
    // --- 达人带 (Expert Belt) ---
    expertbelt: {
        id: 'expertbelt',
        name: 'Expert Belt',
        cnName: '达人带',
        category: 'held',
        consumable: false,
        fling: { basePower: 10 },
        effect: 'expertBelt',
        superEffectiveBoost: 1.2, // 效果拔群时伤害x1.2
        description: '效果拔群的招式伤害x1.2',
    },
    
    // --- 弱点保险 (Weakness Policy) ---
    weaknesspolicy: {
        id: 'weaknesspolicy',
        name: 'Weakness Policy',
        cnName: '弱点保险',
        category: 'held',
        consumable: true,
        fling: { basePower: 80 },
        effect: 'weaknessPolicy',
        boosts: { atk: 2, spa: 2 }, // 被弱点攻击后攻击特攻+2
        description: '被效果拔群的招式攻击后，攻击和特攻各+2级',
    },
    
    // --- 火焰宝珠 (Flame Orb) ---
    flameorb: {
        id: 'flameorb',
        name: 'Flame Orb',
        cnName: '火焰宝珠',
        category: 'held',
        consumable: false,
        fling: { basePower: 30, status: 'brn' },
        effect: 'flameOrb',
        selfStatus: 'brn', // 回合结束时自己烧伤
        description: '回合结束时使自己陷入灼伤状态',
    },
    
    // --- 剧毒宝珠 (Toxic Orb) ---
    toxicorb: {
        id: 'toxicorb',
        name: 'Toxic Orb',
        cnName: '剧毒宝珠',
        category: 'held',
        consumable: false,
        fling: { basePower: 30, status: 'tox' },
        effect: 'toxicOrb',
        selfStatus: 'tox', // 回合结束时自己剧毒
        description: '回合结束时使自己陷入剧毒状态',
    },
    
    // --- 红牌 (Red Card) ---
    redcard: {
        id: 'redcard',
        name: 'Red Card',
        cnName: '红牌',
        category: 'held',
        consumable: true,
        fling: { basePower: 10 },
        effect: 'redCard',
        forceSwitch: true, // 被攻击后强制对方换人
        description: '被攻击后强制对方更换宝可梦',
    },
    
    // --- 逃脱按键 (Eject Button) ---
    ejectbutton: {
        id: 'ejectbutton',
        name: 'Eject Button',
        cnName: '逃脱按键',
        category: 'held',
        consumable: true,
        fling: { basePower: 30 },
        effect: 'ejectButton',
        selfSwitch: true, // 被攻击后自己换人
        description: '被攻击后可以更换自己的宝可梦',
    },
    
    // --- 携带逃跑包 (Eject Pack) ---
    ejectpack: {
        id: 'ejectpack',
        name: 'Eject Pack',
        cnName: '携带逃跑包',
        category: 'held',
        consumable: true,
        fling: { basePower: 50 },
        effect: 'ejectPack',
        switchOnStatDrop: true, // 能力下降时换人
        description: '能力下降时可以更换宝可梦',
    },
    
    // ========== 属性强化道具 (Type-Boosting Items) ==========
    
    charcoal: {
        id: 'charcoal',
        name: 'Charcoal',
        cnName: '木炭',
        category: 'held',
        consumable: false,
        fling: { basePower: 30 },
        effect: 'typeBoost',
        boostedType: 'Fire',
        boost: 1.2,
        description: '火属性招式威力x1.2',
    },
    mysticwater: {
        id: 'mysticwater',
        name: 'Mystic Water',
        cnName: '神秘水滴',
        category: 'held',
        consumable: false,
        fling: { basePower: 30 },
        effect: 'typeBoost',
        boostedType: 'Water',
        boost: 1.2,
        description: '水属性招式威力x1.2',
    },
    miracleseed: {
        id: 'miracleseed',
        name: 'Miracle Seed',
        cnName: '奇迹种子',
        category: 'held',
        consumable: false,
        fling: { basePower: 30 },
        effect: 'typeBoost',
        boostedType: 'Grass',
        boost: 1.2,
        description: '草属性招式威力x1.2',
    },
    magnet: {
        id: 'magnet',
        name: 'Magnet',
        cnName: '磁铁',
        category: 'held',
        consumable: false,
        fling: { basePower: 30 },
        effect: 'typeBoost',
        boostedType: 'Electric',
        boost: 1.2,
        description: '电属性招式威力x1.2',
    },
    nevermeltice: {
        id: 'nevermeltice',
        name: 'Never-Melt Ice',
        cnName: '不融冰',
        category: 'held',
        consumable: false,
        fling: { basePower: 30 },
        effect: 'typeBoost',
        boostedType: 'Ice',
        boost: 1.2,
        description: '冰属性招式威力x1.2',
    },
    blackbelt: {
        id: 'blackbelt',
        name: 'Black Belt',
        cnName: '黑带',
        category: 'held',
        consumable: false,
        fling: { basePower: 30 },
        effect: 'typeBoost',
        boostedType: 'Fighting',
        boost: 1.2,
        description: '格斗属性招式威力x1.2',
    },
    poisonbarb: {
        id: 'poisonbarb',
        name: 'Poison Barb',
        cnName: '毒针',
        category: 'held',
        consumable: false,
        fling: { basePower: 70, status: 'psn' },
        effect: 'typeBoost',
        boostedType: 'Poison',
        boost: 1.2,
        description: '毒属性招式威力x1.2',
    },
    softsand: {
        id: 'softsand',
        name: 'Soft Sand',
        cnName: '柔软沙子',
        category: 'held',
        consumable: false,
        fling: { basePower: 10 },
        effect: 'typeBoost',
        boostedType: 'Ground',
        boost: 1.2,
        description: '地面属性招式威力x1.2',
    },
    sharpbeak: {
        id: 'sharpbeak',
        name: 'Sharp Beak',
        cnName: '锐利鸟嘴',
        category: 'held',
        consumable: false,
        fling: { basePower: 50 },
        effect: 'typeBoost',
        boostedType: 'Flying',
        boost: 1.2,
        description: '飞行属性招式威力x1.2',
    },
    twistedspoon: {
        id: 'twistedspoon',
        name: 'Twisted Spoon',
        cnName: '弯曲的汤匙',
        category: 'held',
        consumable: false,
        fling: { basePower: 30 },
        effect: 'typeBoost',
        boostedType: 'Psychic',
        boost: 1.2,
        description: '超能力属性招式威力x1.2',
    },
    silverpowder: {
        id: 'silverpowder',
        name: 'Silver Powder',
        cnName: '银粉',
        category: 'held',
        consumable: false,
        fling: { basePower: 10 },
        effect: 'typeBoost',
        boostedType: 'Bug',
        boost: 1.2,
        description: '虫属性招式威力x1.2',
    },
    hardstone: {
        id: 'hardstone',
        name: 'Hard Stone',
        cnName: '硬石头',
        category: 'held',
        consumable: false,
        fling: { basePower: 100 },
        effect: 'typeBoost',
        boostedType: 'Rock',
        boost: 1.2,
        description: '岩石属性招式威力x1.2',
    },
    spelltag: {
        id: 'spelltag',
        name: 'Spell Tag',
        cnName: '诅咒之符',
        category: 'held',
        consumable: false,
        fling: { basePower: 30 },
        effect: 'typeBoost',
        boostedType: 'Ghost',
        boost: 1.2,
        description: '幽灵属性招式威力x1.2',
    },
    dragonfang: {
        id: 'dragonfang',
        name: 'Dragon Fang',
        cnName: '龙之牙',
        category: 'held',
        consumable: false,
        fling: { basePower: 70 },
        effect: 'typeBoost',
        boostedType: 'Dragon',
        boost: 1.2,
        description: '龙属性招式威力x1.2',
    },
    blackglasses: {
        id: 'blackglasses',
        name: 'Black Glasses',
        cnName: '黑色眼镜',
        category: 'held',
        consumable: false,
        fling: { basePower: 30 },
        effect: 'typeBoost',
        boostedType: 'Dark',
        boost: 1.2,
        description: '恶属性招式威力x1.2',
    },
    metalcoat: {
        id: 'metalcoat',
        name: 'Metal Coat',
        cnName: '金属膜',
        category: 'held',
        consumable: false,
        fling: { basePower: 30 },
        effect: 'typeBoost',
        boostedType: 'Steel',
        boost: 1.2,
        description: '钢属性招式威力x1.2',
    },
    silkscarf: {
        id: 'silkscarf',
        name: 'Silk Scarf',
        cnName: '丝绸围巾',
        category: 'held',
        consumable: false,
        fling: { basePower: 10 },
        effect: 'typeBoost',
        boostedType: 'Normal',
        boost: 1.2,
        description: '一般属性招式威力x1.2',
    },
    fairyfeather: {
        id: 'fairyfeather',
        name: 'Fairy Feather',
        cnName: '妖精之羽',
        category: 'held',
        consumable: false,
        fling: { basePower: 10 },
        effect: 'typeBoost',
        boostedType: 'Fairy',
        boost: 1.2,
        description: '妖精属性招式威力x1.2',
    },
    
    // ========== 太晶珠 (Tera Orbs) ==========
    
    teraorb: {
        id: 'teraorb',
        name: 'Tera Orb',
        cnName: '太晶珠',
        category: 'key',
        consumable: false,
        effect: 'enableTera',
        description: '允许宝可梦进行太晶化',
    },
    
    stellarteraorb: {
        id: 'stellarteraorb',
        name: 'Stellar Tera Orb',
        cnName: '星晶太晶珠',
        category: 'key',
        consumable: false,
        effect: 'enableStellarTera',
        teraType: 'Stellar',
        description: '特殊的太晶珠，允许宝可梦进行星晶太晶化。星晶状态下：原生本系招式2.0x加成，非本系招式1.2x加成，太晶爆发对太晶化目标恒定效果拔群',
    },
    
    // ========== 精灵球 (Poké Balls) ==========
    
    pokeball: {
        id: 'pokeball',
        name: 'Poké Ball',
        cnName: '精灵球',
        category: 'ball',
        catchRate: 1,
        isPokeball: true,
        description: '用于捕捉野生宝可梦的道具',
    },
    greatball: {
        id: 'greatball',
        name: 'Great Ball',
        cnName: '超级球',
        category: 'ball',
        catchRate: 1.5,
        isPokeball: true,
        description: '性能比精灵球好一些的球',
    },
    ultraball: {
        id: 'ultraball',
        name: 'Ultra Ball',
        cnName: '高级球',
        category: 'ball',
        catchRate: 2,
        isPokeball: true,
        description: '性能非常好的球',
    },
    masterball: {
        id: 'masterball',
        name: 'Master Ball',
        cnName: '大师球',
        category: 'ball',
        catchRate: 255, // 必定捕获
        isPokeball: true,
        description: '必定能捕捉到野生宝可梦的最高性能球',
    },
    premierball: {
        id: 'premierball',
        name: 'Premier Ball',
        cnName: '纪念球',
        category: 'ball',
        catchRate: 1,
        isPokeball: true,
        description: '某种纪念用的稀有球',
    },
    quickball: {
        id: 'quickball',
        name: 'Quick Ball',
        cnName: '速度球',
        category: 'ball',
        catchRate: 5, // 第一回合
        catchRateLater: 1, // 之后
        isPokeball: true,
        description: '战斗开始时使用效果拔群的球',
    },
    timerball: {
        id: 'timerball',
        name: 'Timer Ball',
        cnName: '计时球',
        category: 'ball',
        // 捕获率随回合增加
        isPokeball: true,
        description: '回合数越多效果越好的球',
    },
    duskball: {
        id: 'duskball',
        name: 'Dusk Ball',
        cnName: '黑暗球',
        category: 'ball',
        catchRate: 3, // 夜晚或洞穴
        catchRateDay: 1,
        isPokeball: true,
        description: '在黑暗的地方容易捕捉的球',
    },
    healball: {
        id: 'healball',
        name: 'Heal Ball',
        cnName: '治愈球',
        category: 'ball',
        catchRate: 1,
        healOnCatch: true,
        isPokeball: true,
        description: '捕捉后会立即恢复HP和状态的球',
    },
    netball: {
        id: 'netball',
        name: 'Net Ball',
        cnName: '捕网球',
        category: 'ball',
        catchRate: 3.5, // 水/虫属性
        catchRateOther: 1,
        isPokeball: true,
        description: '容易捕捉水属性和虫属性宝可梦的球',
    },
    diveball: {
        id: 'diveball',
        name: 'Dive Ball',
        cnName: '潜水球',
        category: 'ball',
        catchRate: 3.5, // 水中
        catchRateLand: 1,
        isPokeball: true,
        description: '在水中容易捕捉的球',
    },
    luxuryball: {
        id: 'luxuryball',
        name: 'Luxury Ball',
        cnName: '豪华球',
        category: 'ball',
        catchRate: 1,
        friendshipBoost: true,
        isPokeball: true,
        description: '捕捉后亲密度更容易上升的球',
    },
    repeatball: {
        id: 'repeatball',
        name: 'Repeat Ball',
        cnName: '重复球',
        category: 'ball',
        catchRate: 3.5, // 已捕获过的种类
        catchRateNew: 1,
        isPokeball: true,
        description: '容易捕捉曾经捕捉过的宝可梦的球',
    },
    beastball: {
        id: 'beastball',
        name: 'Beast Ball',
        cnName: '究极球',
        category: 'ball',
        catchRate: 5, // 究极异兽
        catchRateOther: 0.1,
        isPokeball: true,
        description: '用于捕捉究极异兽的特殊球',
    },
    dreamball: {
        id: 'dreamball',
        name: 'Dream Ball',
        cnName: '梦境球',
        category: 'ball',
        catchRate: 4, // 睡眠状态
        catchRateAwake: 1,
        isPokeball: true,
        description: '容易捕捉睡眠状态宝可梦的球',
    },
    
    // ========== 树果 (Berries) ==========
    
    // --- 回复树果 ---
    oranberry: {
        id: 'oranberry',
        name: 'Oran Berry',
        cnName: '橙橙果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'healOnLowHP',
        healAmount: 10,
        triggerHP: 0.5, // HP <= 50% 时触发
        naturalGift: { basePower: 80, type: 'Poison' },
        description: 'HP降到一半以下时恢复10点HP',
    },
    sitrusberry: {
        id: 'sitrusberry',
        name: 'Sitrus Berry',
        cnName: '文柚果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'healOnLowHP',
        healPercent: 0.25, // 恢复 25% 最大HP
        triggerHP: 0.5,
        naturalGift: { basePower: 80, type: 'Psychic' },
        description: 'HP降到一半以下时恢复25%最大HP',
    },
    
    // --- 1/3 HP 回复树果 (混乱树果) ---
    figyberry: {
        id: 'figyberry',
        name: 'Figy Berry',
        cnName: '勿花果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'healOnLowHP',
        healPercent: 1/3,
        triggerHP: 0.25,
        confuseNature: 'atk', // 减攻击性格会混乱
        naturalGift: { basePower: 80, type: 'Bug' },
        description: 'HP降到1/4以下时恢复1/3最大HP（减攻击性格会混乱）',
    },
    wikiberry: {
        id: 'wikiberry',
        name: 'Wiki Berry',
        cnName: '异奇果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'healOnLowHP',
        healPercent: 1/3,
        triggerHP: 0.25,
        confuseNature: 'spa',
        naturalGift: { basePower: 80, type: 'Rock' },
        description: 'HP降到1/4以下时恢复1/3最大HP（减特攻性格会混乱）',
    },
    magoberry: {
        id: 'magoberry',
        name: 'Mago Berry',
        cnName: '芒芒果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'healOnLowHP',
        healPercent: 1/3,
        triggerHP: 0.25,
        confuseNature: 'spe',
        naturalGift: { basePower: 80, type: 'Ghost' },
        description: 'HP降到1/4以下时恢复1/3最大HP（减速度性格会混乱）',
    },
    aguavberry: {
        id: 'aguavberry',
        name: 'Aguav Berry',
        cnName: '芭亚果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'healOnLowHP',
        healPercent: 1/3,
        triggerHP: 0.25,
        confuseNature: 'spd',
        naturalGift: { basePower: 80, type: 'Dragon' },
        description: 'HP降到1/4以下时恢复1/3最大HP（减特防性格会混乱）',
    },
    iapapaberry: {
        id: 'iapapaberry',
        name: 'Iapapa Berry',
        cnName: '乐芭果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'healOnLowHP',
        healPercent: 1/3,
        triggerHP: 0.25,
        confuseNature: 'def',
        naturalGift: { basePower: 80, type: 'Dark' },
        description: 'HP降到1/4以下时恢复1/3最大HP（减防御性格会混乱）',
    },
    
    // --- 状态回复树果 ---
    cheriberry: {
        id: 'cheriberry',
        name: 'Cheri Berry',
        cnName: '樱子果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'cureStatus',
        cures: 'par',
        naturalGift: { basePower: 80, type: 'Fire' },
        description: '治愈麻痹状态',
    },
    chestoberry: {
        id: 'chestoberry',
        name: 'Chesto Berry',
        cnName: '零余果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'cureStatus',
        cures: 'slp',
        naturalGift: { basePower: 80, type: 'Water' },
        description: '治愈睡眠状态',
    },
    pechaberry: {
        id: 'pechaberry',
        name: 'Pecha Berry',
        cnName: '桃桃果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'cureStatus',
        cures: 'psn',
        naturalGift: { basePower: 80, type: 'Electric' },
        description: '治愈中毒状态',
    },
    rawstberry: {
        id: 'rawstberry',
        name: 'Rawst Berry',
        cnName: '莓莓果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'cureStatus',
        cures: 'brn',
        naturalGift: { basePower: 80, type: 'Grass' },
        description: '治愈灼伤状态',
    },
    aspearberry: {
        id: 'aspearberry',
        name: 'Aspear Berry',
        cnName: '利木果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'cureStatus',
        cures: 'frz',
        naturalGift: { basePower: 80, type: 'Ice' },
        description: '治愈冰冻状态',
    },
    persimberry: {
        id: 'persimberry',
        name: 'Persim Berry',
        cnName: '柿仔果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'cureConfusion',
        naturalGift: { basePower: 80, type: 'Ground' },
        description: '治愈混乱状态',
    },
    lumberry: {
        id: 'lumberry',
        name: 'Lum Berry',
        cnName: '木子果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'cureAll',
        naturalGift: { basePower: 80, type: 'Flying' },
        description: '治愈所有异常状态',
    },
    
    // --- 半伤树果 (抗性树果) ---
    occaberry: {
        id: 'occaberry',
        name: 'Occa Berry',
        cnName: '枝荔果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'resistBerry',
        resistType: 'Fire',
        naturalGift: { basePower: 80, type: 'Fire' },
        description: '受到效果拔群的火属性招式时伤害减半',
    },
    passhoberry: {
        id: 'passhoberry',
        name: 'Passho Berry',
        cnName: '番荔果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'resistBerry',
        resistType: 'Water',
        naturalGift: { basePower: 80, type: 'Water' },
        description: '受到效果拔群的水属性招式时伤害减半',
    },
    wacanberry: {
        id: 'wacanberry',
        name: 'Wacan Berry',
        cnName: '莲蒲果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'resistBerry',
        resistType: 'Electric',
        naturalGift: { basePower: 80, type: 'Electric' },
        description: '受到效果拔群的电属性招式时伤害减半',
    },
    rindoberry: {
        id: 'rindoberry',
        name: 'Rindo Berry',
        cnName: '龙睛果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'resistBerry',
        resistType: 'Grass',
        naturalGift: { basePower: 80, type: 'Grass' },
        description: '受到效果拔群的草属性招式时伤害减半',
    },
    yacheberry: {
        id: 'yacheberry',
        name: 'Yache Berry',
        cnName: '雪莲果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'resistBerry',
        resistType: 'Ice',
        naturalGift: { basePower: 80, type: 'Ice' },
        description: '受到效果拔群的冰属性招式时伤害减半',
    },
    chopleberry: {
        id: 'chopleberry',
        name: 'Chople Berry',
        cnName: '罗子果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'resistBerry',
        resistType: 'Fighting',
        naturalGift: { basePower: 80, type: 'Fighting' },
        description: '受到效果拔群的格斗属性招式时伤害减半',
    },
    kebiaberry: {
        id: 'kebiaberry',
        name: 'Kebia Berry',
        cnName: '草蚕果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'resistBerry',
        resistType: 'Poison',
        naturalGift: { basePower: 80, type: 'Poison' },
        description: '受到效果拔群的毒属性招式时伤害减半',
    },
    shucaberry: {
        id: 'shucaberry',
        name: 'Shuca Berry',
        cnName: '沙鳞果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'resistBerry',
        resistType: 'Ground',
        naturalGift: { basePower: 80, type: 'Ground' },
        description: '受到效果拔群的地面属性招式时伤害减半',
    },
    cobaberry: {
        id: 'cobaberry',
        name: 'Coba Berry',
        cnName: '勿花果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'resistBerry',
        resistType: 'Flying',
        naturalGift: { basePower: 80, type: 'Flying' },
        description: '受到效果拔群的飞行属性招式时伤害减半',
    },
    payapaberry: {
        id: 'payapaberry',
        name: 'Payapa Berry',
        cnName: '芭乐果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'resistBerry',
        resistType: 'Psychic',
        naturalGift: { basePower: 80, type: 'Psychic' },
        description: '受到效果拔群的超能力属性招式时伤害减半',
    },
    tangaberry: {
        id: 'tangaberry',
        name: 'Tanga Berry',
        cnName: '扁樱果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'resistBerry',
        resistType: 'Bug',
        naturalGift: { basePower: 80, type: 'Bug' },
        description: '受到效果拔群的虫属性招式时伤害减半',
    },
    chartiberry: {
        id: 'chartiberry',
        name: 'Charti Berry',
        cnName: '岩荔果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'resistBerry',
        resistType: 'Rock',
        naturalGift: { basePower: 80, type: 'Rock' },
        description: '受到效果拔群的岩石属性招式时伤害减半',
    },
    kasibberry: {
        id: 'kasibberry',
        name: 'Kasib Berry',
        cnName: '幽灵果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'resistBerry',
        resistType: 'Ghost',
        naturalGift: { basePower: 80, type: 'Ghost' },
        description: '受到效果拔群的幽灵属性招式时伤害减半',
    },
    habanberry: {
        id: 'habanberry',
        name: 'Haban Berry',
        cnName: '哈密果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'resistBerry',
        resistType: 'Dragon',
        naturalGift: { basePower: 80, type: 'Dragon' },
        description: '受到效果拔群的龙属性招式时伤害减半',
    },
    colburberry: {
        id: 'colburberry',
        name: 'Colbur Berry',
        cnName: '霹霹果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'resistBerry',
        resistType: 'Dark',
        naturalGift: { basePower: 80, type: 'Dark' },
        description: '受到效果拔群的恶属性招式时伤害减半',
    },
    babiriberry: {
        id: 'babiriberry',
        name: 'Babiri Berry',
        cnName: '霸比果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'resistBerry',
        resistType: 'Steel',
        naturalGift: { basePower: 80, type: 'Steel' },
        description: '受到效果拔群的钢属性招式时伤害减半',
    },
    chilanberry: {
        id: 'chilanberry',
        name: 'Chilan Berry',
        cnName: '奇朗果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'resistBerry',
        resistType: 'Normal',
        naturalGift: { basePower: 80, type: 'Normal' },
        description: '受到一般属性招式时伤害减半',
    },
    roseliberry: {
        id: 'roseliberry',
        name: 'Roseli Berry',
        cnName: '蔷薇果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'resistBerry',
        resistType: 'Fairy',
        naturalGift: { basePower: 80, type: 'Fairy' },
        description: '受到效果拔群的妖精属性招式时伤害减半',
    },
    
    // ========== 神兽专属道具 ==========
    
    adamantorb: {
        id: 'adamantorb',
        name: 'Adamant Orb',
        cnName: '金刚玉',
        category: 'held',
        consumable: false,
        fling: { basePower: 60 },
        effect: 'typeBoostSpecies',
        itemUser: ['Dialga'],
        boostedTypes: ['Steel', 'Dragon'],
        boost: 1.2,
        description: '帝牙卢卡持有时钢和龙属性招式威力x1.2',
    },
    lustrousorb: {
        id: 'lustrousorb',
        name: 'Lustrous Orb',
        cnName: '白玉宝珠',
        category: 'held',
        consumable: false,
        fling: { basePower: 60 },
        effect: 'typeBoostSpecies',
        itemUser: ['Palkia'],
        boostedTypes: ['Water', 'Dragon'],
        boost: 1.2,
        description: '帕路奇亚持有时水和龙属性招式威力x1.2',
    },
    griseousorb: {
        id: 'griseousorb',
        name: 'Griseous Orb',
        cnName: '白金玉',
        category: 'held',
        consumable: false,
        fling: { basePower: 60 },
        effect: 'typeBoostSpecies',
        itemUser: ['Giratina'],
        boostedTypes: ['Ghost', 'Dragon'],
        boost: 1.2,
        forcedForme: 'Giratina-Origin',
        description: '骑拉帝纳持有时幽灵和龙属性招式威力x1.2，并变为起源形态',
    },
    souldew: {
        id: 'souldew',
        name: 'Soul Dew',
        cnName: '心之水滴',
        category: 'held',
        consumable: false,
        fling: { basePower: 30 },
        effect: 'typeBoostSpecies',
        itemUser: ['Latios', 'Latias'],
        boostedTypes: ['Psychic', 'Dragon'],
        boost: 1.2,
        description: '拉帝欧斯/拉帝亚斯持有时超能力和龙属性招式威力x1.2',
    },
    
    // --- 原始回归宝珠 ---
    redorb: {
        id: 'redorb',
        name: 'Red Orb',
        cnName: '红色宝珠',
        category: 'held',
        consumable: false,
        effect: 'primalReversion',
        itemUser: ['Groudon'],
        forcedForme: 'Groudon-Primal',
        isPrimalOrb: true,
        description: '固拉多持有时会进行原始回归',
    },
    blueorb: {
        id: 'blueorb',
        name: 'Blue Orb',
        cnName: '蓝色宝珠',
        category: 'held',
        consumable: false,
        effect: 'primalReversion',
        itemUser: ['Kyogre'],
        forcedForme: 'Kyogre-Primal',
        isPrimalOrb: true,
        description: '盖欧卡持有时会进行原始回归',
    },
    
    // --- 苍响/藏玛然特专属 ---
    rustedsword: {
        id: 'rustedsword',
        name: 'Rusted Sword',
        cnName: '腐朽的剑',
        category: 'held',
        consumable: false,
        effect: 'formeChange',
        itemUser: ['Zacian'],
        forcedForme: 'Zacian-Crowned',
        description: '苍响持有时会变为剑之王形态',
    },
    rustedshield: {
        id: 'rustedshield',
        name: 'Rusted Shield',
        cnName: '腐朽的盾',
        category: 'held',
        consumable: false,
        effect: 'formeChange',
        itemUser: ['Zamazenta'],
        forcedForme: 'Zamazenta-Crowned',
        description: '藏玛然特持有时会变为盾之王形态',
    },
    
    // ========== 专属强化道具 ==========
    
    lightball: {
        id: 'lightball',
        name: 'Light Ball',
        cnName: '电气球',
        category: 'held',
        consumable: false,
        fling: { basePower: 30, status: 'par' },
        effect: 'speciesBoost',
        itemUser: ['Pikachu'],
        statBoost: { atk: 2, spa: 2 },
        description: '皮卡丘持有时攻击和特攻翻倍',
    },
    thickclub: {
        id: 'thickclub',
        name: 'Thick Club',
        cnName: '粗骨头',
        category: 'held',
        consumable: false,
        fling: { basePower: 90 },
        effect: 'speciesBoost',
        itemUser: ['Cubone', 'Marowak', 'Marowak-Alola'],
        statBoost: { atk: 2 },
        description: '卡拉卡拉/嘎啦嘎啦持有时攻击翻倍',
    },
    leek: {
        id: 'leek',
        name: 'Leek',
        cnName: '大葱',
        category: 'held',
        consumable: false,
        fling: { basePower: 60 },
        effect: 'critBoost',
        itemUser: ['Farfetchd', 'Farfetchd-Galar', 'Sirfetchd'],
        critBoost: 2,
        description: "大葱鸭/葱游兵持有时容易击中要害",
    },
    luckypunch: {
        id: 'luckypunch',
        name: 'Lucky Punch',
        cnName: '幸运拳套',
        category: 'held',
        consumable: false,
        fling: { basePower: 40 },
        effect: 'critBoost',
        itemUser: ['Chansey'],
        critBoost: 2,
        description: '吉利蛋持有时容易击中要害',
    },
    metalpowder: {
        id: 'metalpowder',
        name: 'Metal Powder',
        cnName: '金属粉',
        category: 'held',
        consumable: false,
        fling: { basePower: 10 },
        effect: 'speciesBoost',
        itemUser: ['Ditto'],
        statBoost: { def: 2 },
        requiresUntransformed: true,
        description: '百变怪（未变身时）持有时防御翻倍',
    },
    quickpowder: {
        id: 'quickpowder',
        name: 'Quick Powder',
        cnName: '速度粉',
        category: 'held',
        consumable: false,
        fling: { basePower: 10 },
        effect: 'speciesBoost',
        itemUser: ['Ditto'],
        statBoost: { spe: 2 },
        requiresUntransformed: true,
        description: '百变怪（未变身时）持有时速度翻倍',
    },
};

// ============================================
// 道具分类常量
// ============================================

// 不可交换的道具 (Trick/Switcheroo 无效)
const UNSWAPPABLE_ITEMS = [
    // 神兽专属
    'rustedsword', 'rustedshield',
    'griseousorb', 'adamantorb', 'lustrousorb',
    'adamantcrystal', 'lustrousglobe', 'griseouscore',
    // 专属强化
    'souldew', 'lightball', 'thickclub', 'luckypunch', 'leek', 'stick',
    // 邮件
    'mail',
    // 原始回归
    'redorb', 'blueorb',
];

// Mega 石判定 (以 'ite' 结尾但不是 'eviolite')
function isMegaStone(itemId) {
    return itemId.endsWith('ite') && itemId !== 'eviolite';
}

// Z 水晶判定
function isZCrystal(itemId) {
    return itemId.endsWith('iumz') || itemId.endsWith('iniumz');
}

// 检查道具是否可交换
function isSwappable(itemId) {
    if (!itemId) return true;
    const id = itemId.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (UNSWAPPABLE_ITEMS.includes(id)) return false;
    if (isMegaStone(id)) return false;
    if (isZCrystal(id)) return false;
    return true;
}

// ============================================
// 道具效果处理器
// ============================================

const ItemEffects = {
    /**
     * 检查 Focus Sash 效果
     * @returns {boolean} 是否触发了气势披带
     */
    checkFocusSash(pokemon, damage) {
        const itemId = (pokemon.item || '').toLowerCase().replace(/[^a-z]/g, '');
        if (itemId !== 'focussash') return false;
        if (pokemon.currHp !== pokemon.maxHp) return false;
        if (damage < pokemon.currHp) return false;
        
        // 触发效果
        pokemon.currHp = 1;
        pokemon.item = null;
        pokemon.focusSashTriggered = true;
        return true;
    },
    
    /**
     * 检查 Choice 道具锁招
     */
    isChoiceLocked(pokemon) {
        const item = pokemon.item || '';
        const itemData = getItem(item);
        return itemData && itemData.isChoice;
    },
    
    /**
     * 获取 Light Clay 的壁持续回合数
     */
    getScreenDuration(pokemon) {
        const itemId = (pokemon.item || '').toLowerCase().replace(/[^a-z]/g, '');
        if (itemId === 'lightclay') return 8;
        return 5;
    },
    
    /**
     * 获取精灵球捕获率
     */
    getBallCatchRate(ballId, context = {}) {
        const ball = ITEMS[ballId];
        if (!ball || !ball.isPokeball) return 1;
        
        // 特殊球的条件判断
        if (ballId === 'quickball' && context.turn === 1) {
            return ball.catchRate;
        }
        if (ballId === 'quickball' && context.turn > 1) {
            return ball.catchRateLater || 1;
        }
        
        return ball.catchRate || 1;
    },
};

// ============================================
// 工具函数
// ============================================

/**
 * 根据 ID 获取道具数据
 * @param {string} itemName - 道具名称或 ID
 * @returns {Object|null} 道具数据对象
 */
function getItem(itemName) {
    if (!itemName) return null;
    const id = itemName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return ITEMS[id] || null;
}

/**
 * 根据道具名称获取 ID
 */
function getItemId(itemName) {
    if (!itemName) return null;
    return itemName.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * 获取所有精灵球
 */
function getAllPokeballs() {
    return Object.values(ITEMS).filter(item => item.isPokeball);
}

/**
 * 获取所有树果
 */
function getAllBerries() {
    return Object.values(ITEMS).filter(item => item.isBerry);
}

/**
 * 检查是否为 Choice 道具
 */
function isChoiceItem(itemName) {
    const item = getItem(itemName);
    return item && item.isChoice;
}

// ============================================
// 导出
// ============================================

// 浏览器环境
if (typeof window !== 'undefined') {
    window.ITEMS = ITEMS;
    window.UNSWAPPABLE_ITEMS = UNSWAPPABLE_ITEMS;
    window.ItemEffects = ItemEffects;
    window.getItem = getItem;
    window.getItemId = getItemId;
    window.getAllPokeballs = getAllPokeballs;
    window.getAllBerries = getAllBerries;
    window.isChoiceItem = isChoiceItem;
    window.isMegaStone = isMegaStone;
    window.isZCrystal = isZCrystal;
    window.isSwappable = isSwappable;
}

// Node.js 环境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ITEMS,
        UNSWAPPABLE_ITEMS,
        ItemEffects,
        getItem,
        getItemId,
        getAllPokeballs,
        getAllBerries,
        isChoiceItem,
        isMegaStone,
        isZCrystal,
        isSwappable,
    };
}
