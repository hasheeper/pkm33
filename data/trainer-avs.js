/**
 * =============================================
 * TRAINER AVs PROFILES - 训练家情感努力值配置
 * =============================================
 * 
 * 洛迪亚特区 (Rhodia Region) 专属系统
 * 受神馔粉雾 (Ambrosia) 影响，每位训练家都有独特的 AVs 倾向
 * 
 * 四大维度：
 * - Trust (信赖): 防守向，致命伤害时锁血
 * - Passion (激情): 进攻向，暴击率提升
 * - Insight (灵犀): 回避向，闪避率提升
 * - Devotion (献身): 回复向，回合末治愈异常
 */

const TRAINER_AVS_PROFILES = {
    // =====================================================
    // 霓虹商业区 (Neon District) - 电/毒
    // 馆主: Iono & Roxie
    // 专精: Passion (激情)
    // =====================================================
    'iono': {
        name: 'Iono',
        cnName: '奇树',
        district: 'Neon',
        specialty: 'Passion',
        description: '直播女王的战斗风格如同她的节目一样热烈刺激',
        aura: {
            name: 'Adrenaline Rush',
            effect: '全队暴击率提升，击杀后速度+1'
        },
        defaultAVs: {
            trust: 80,
            passion: 220,    // 专精
            insight: 120,
            devotion: 60
        }
    },
    'roxie': {
        name: 'Roxie',
        cnName: '霍米加',
        district: 'Neon',
        specialty: 'Passion',
        description: '摇滚女孩的毒系攻势如同她的音乐一样狂暴',
        aura: {
            name: 'Toxic Rush',
            effect: '毒系招式暴击率额外+1'
        },
        defaultAVs: {
            trust: 60,
            passion: 200,    // 专精
            insight: 100,
            devotion: 80
        }
    },

    // =====================================================
    // 繁花海滨区 (Bloom District) - 草/水
    // 馆主: Erika & Nessa
    // 专精: Devotion (献身)
    // =====================================================
    'erika': {
        name: 'Erika',
        cnName: '莉佳',
        district: 'Bloom',
        specialty: 'Devotion',
        description: '优雅的花道大师，她的宝可梦如同花朵般坚韧',
        aura: {
            name: 'Floral Blessing',
            effect: '回复技能效果+20%，异常状态抗性提升'
        },
        defaultAVs: {
            trust: 120,
            passion: 60,
            insight: 80,
            devotion: 220    // 专精
        }
    },
    'nessa': {
        name: 'Nessa',
        cnName: '露璃娜',
        district: 'Bloom',
        specialty: 'Devotion',
        description: '超模兼馆主，她的水系宝可梦拥有惊人的恢复力',
        aura: {
            name: 'Tidal Recovery',
            effect: '水系宝可梦每回合恢复少量HP'
        },
        defaultAVs: {
            trust: 100,
            passion: 80,
            insight: 100,
            devotion: 200    // 专精
        }
    },

    // =====================================================
    // 暗影旧街区 (Shadow District) - 恶/幽灵
    // 馆主: Marnie & Hex Maniac
    // 专精: Insight (灵犀)
    // =====================================================
    'marnie': {
        name: 'Marnie',
        cnName: '玛俐',
        district: 'Shadow',
        specialty: 'Insight',
        description: '冷静的暗系使者，总能预判对手的行动',
        aura: {
            name: 'Dark Foresight',
            effect: 'AI预读准确率提升，更容易使用正确的保护/换人'
        },
        defaultAVs: {
            trust: 100,
            passion: 100,
            insight: 220,    // 专精
            devotion: 80
        }
    },
    'hexmaniac': {
        name: 'Hex Maniac',
        cnName: '灵异迷',
        district: 'Shadow',
        specialty: 'Insight',
        description: '神秘的灵媒，她的幽灵系宝可梦如同幻影般难以捕捉',
        aura: {
            name: 'Phantom Sense',
            effect: '幽灵系宝可梦闪避率额外提升'
        },
        defaultAVs: {
            trust: 60,
            passion: 80,
            insight: 200,    // 专精
            devotion: 100
        }
    },

    // =====================================================
    // 极诣竞技区 (Apex District) - 格斗/全能
    // 馆主: Bea & Cynthia
    // 专精: 全维度 (Total Trust)
    // =====================================================
    'bea': {
        name: 'Bea',
        cnName: '彩豆',
        district: 'Apex',
        specialty: 'Balanced',
        description: '空手道大师，追求极致的战斗艺术',
        aura: {
            name: 'Fighting Spirit',
            effect: '格斗系宝可梦拥有 Second Wind（首次濒死时锁血+全属性+1）'
        },
        defaultAVs: {
            trust: 180,
            passion: 180,
            insight: 160,
            devotion: 160
        },
        // 特殊机制：Second Wind
        secondWind: true
    },
    'cynthia': {
        name: 'Cynthia',
        cnName: '竹兰',
        district: 'Apex',
        specialty: 'Total',
        description: '神奥冠军，传说中的最强训练家',
        aura: {
            name: 'Champion\'s Resolve',
            effect: '王牌宝可梦拥有 Second Wind（首次濒死时锁血+全属性+1）'
        },
        defaultAVs: {
            trust: 200,
            passion: 200,
            insight: 200,
            devotion: 200
        },
        // 特殊机制：Second Wind (仅限王牌)
        secondWind: true,
        aceOnly: true
    },

    // =====================================================
    // 管理与科研人员
    // =====================================================
    'lusamine': {
        name: 'Lusamine',
        cnName: '露莎米奈',
        role: 'Executive Director',
        description: '以太基金会执行董事，对宝可梦有着扭曲的爱',
        defaultAVs: {
            trust: 60,
            passion: 120,
            insight: 160,
            devotion: 240    // 极端的献身
        }
    },
    'sonia': {
        name: 'Sonia',
        cnName: '索妮亚',
        role: 'Chief Researcher',
        description: '首席博士，负责御三家选择和初期引导',
        defaultAVs: {
            trust: 140,
            passion: 80,
            insight: 180,
            devotion: 100
        }
    },

    // =====================================================
    // 特邀代表
    // =====================================================
    'gloria': {
        name: 'Gloria',
        cnName: '优莉',
        role: 'Camping Expert',
        description: '露营技术与咖喱料理推广大使',
        defaultAVs: {
            trust: 160,
            passion: 120,
            insight: 100,
            devotion: 140
        }
    },
    'rosa': {
        name: 'Rosa',
        cnName: '梅依',
        role: 'Idol Trainer',
        description: '偶像艺人与练习生导师',
        defaultAVs: {
            trust: 200,
            passion: 100,
            insight: 80,
            devotion: 180
        }
    },
    'dawn': {
        name: 'Dawn',
        cnName: '小光',
        role: 'Contest Judge',
        description: '华丽大赛常驻评委',
        defaultAVs: {
            trust: 140,
            passion: 140,
            insight: 140,
            devotion: 140
        }
    },
    'serena': {
        name: 'Serena',
        cnName: '瑟蕾娜',
        role: 'Media Queen',
        description: '短视频与新媒体女王',
        defaultAVs: {
            trust: 120,
            passion: 160,
            insight: 120,
            devotion: 120
        }
    },

    // =====================================================
    // 洗翠时空难民
    // =====================================================
    'irida': {
        name: 'Irida',
        cnName: '伊蕾达',
        role: 'Pearl Clan Leader',
        description: '珍珠团首领，与宝可梦有着原始的默契',
        defaultAVs: {
            trust: 180,
            passion: 80,
            insight: 200,
            devotion: 120
        }
    },
    'akari': {
        name: 'Akari',
        cnName: '小照',
        role: 'Refugee Coordinator',
        description: '时空难民接待处主任',
        defaultAVs: {
            trust: 160,
            passion: 100,
            insight: 160,
            devotion: 140
        }
    }
};

/**
 * 获取训练家的 AVs 配置
 * @param {string} trainerId - 训练家ID
 * @returns {object|null} AVs 配置对象
 */
function getTrainerAVsProfile(trainerId) {
    if (!trainerId) return null;
    const id = trainerId.toLowerCase().replace(/[^a-z0-9]/g, '');
    return TRAINER_AVS_PROFILES[id] || null;
}

/**
 * 为宝可梦应用训练家的 AVs 配置
 * @param {Pokemon} pokemon - 宝可梦实例
 * @param {string} trainerId - 训练家ID
 * @param {boolean} isAce - 是否为王牌宝可梦
 */
function applyTrainerAVs(pokemon, trainerId, isAce = false) {
    const profile = getTrainerAVsProfile(trainerId);
    if (!profile || !pokemon) return;
    
    // 应用默认 AVs
    if (profile.defaultAVs) {
        pokemon.avs = { ...profile.defaultAVs };
    }
    
    // Second Wind 特殊机制（仅限 Apex 区馆主）
    if (profile.secondWind) {
        if (!profile.aceOnly || isAce) {
            pokemon.hasSecondWind = true;
        }
    }
}

// 导出
if (typeof window !== 'undefined') {
    window.TRAINER_AVS_PROFILES = TRAINER_AVS_PROFILES;
    window.getTrainerAVsProfile = getTrainerAVsProfile;
    window.applyTrainerAVs = applyTrainerAVs;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TRAINER_AVS_PROFILES,
        getTrainerAVsProfile,
        applyTrainerAVs
    };
}
