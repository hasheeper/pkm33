/* 
 * 角色: 小优 (Gloria)
 * 身份: 伽勒尔冠军 / 咖喱大师
 */
const GLORIA_DATA = {
    // 【Tier 4 - 极巨化全开·冠军模式】
    4: {
        "trainerProficiency": 255,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": true, // Galar 核心机制
            "enable_tera": false
        },
        "party": [
            {
                "name": "Zacian-Crowned", 
                "lv": 99, 
                "gender": "N", 
                // 苍响本身无法极巨化，所以不设置 mechanic
                "nature": "Adamant", 
                "ability": "Intrepid Sword", 
                "item": "Rusted Sword", 
                "isAce": true, 
                "stats_meta": {
                    "is_perfect": true, // 假设引擎支持或保留 ivs 写法
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 },
                    "ev_level": 252
                },
                "moves": [
                    "Behemoth Blade", // 巨兽斩：针对极巨化双倍伤害
                    "Play Rough",     // 嬉闹：以本系输出覆盖龙/格斗
                    "Close Combat",   // 近身战：钢铁/普通打击面
                    "Swords Dance"    // 剑舞：一旦让它强化一次，就是推队节奏
                ],
                // 王牌满配情感值：不仅有输出(Passion)还有无敌的回避(Insight)与耐性(Trust)
                "friendship": { "trust": 255, "passion": 255, "insight": 200, "devotion": 150 }
            },
            {
                "name": "Cinderace", 
                "lv": 97, 
                "gender": "M",
                "nature": "Jolly", 
                "ability": "Libero", // 自由者：变换属性，极其灵活
                "item": "Life Orb", 
                // 核心极巨位
                "mechanic": "dynamax", 
                "mega_target": "cinderacegmax", // 确保通过 autoDetect 拿到 G-Max 形态
                "stats_meta": { "ev_level": 252 },
                "moves": [
                    "Pyro Ball",    // 极巨后变成 G-Max Fireball (160威力+破格)
                    "Bounce",       // 极巨后变成 Max Airstream (全队提速，核心推队技)
                    "High Jump Kick", // 变成 Max Knuckle (全队加攻)
                    "Court Change"    // 换场：虽然是变化技，但在普通状态下可反去玩家的墙/钉
                ],
                "avs": { "trust": 150, "passion": 230 }
            },
            {
                "name": "Rillaboom", 
                "lv": 95, 
                "gender": "M",
                "nature": "Adamant",
                "ability": "Grassy Surge", 
                "item": "Grassy Seed", // 上场防物防+1
                "mechanic": "dynamax",
                "mega_target": "rillaboomgmax", // 即使不是ACE，如果作为最后一只上场也能G-Max
                "stats_meta": { "ev_level": 252 },
                "moves": [
                    "Grassy Glide", // 青草滑梯：场地下先制
                    "Drum Beating", // 控速
                    "High Horsepower", // 补盲打火/电
                    "U-turn"         // 灵活轮转
                ]
            },
            {
                "name": "Urshifu-Rapid-Strike", 
                "lv": 94, 
                "gender": "M",
                "nature": "Jolly", // 加速度
                "ability": "Unseen Fist", 
                "item": "Focus Sash", // 气腰防止被玩家的 Flying 招式确一，保证输出
                "mechanic": "dynamax",
                "mega_target": "urshifurapidstrikegmax",
                "stats_meta": { "ev_level": 252 },
                "moves": [
                    "Surging Strikes", // 必暴击
                    "Close Combat", 
                    "Ice Punch",      // 冰拳：针对处理不了的飞行/草/龙系
                    "Aqua Jet"        // 先制收割
                ]
            },
            {
                "name": "Corviknight", 
                "lv": 94, 
                "gender": "M",
                "nature": "Impish", // 加物防，减特攻
                "ability": "Mirror Armor", 
                "item": "Leftovers", 
                "mechanic": "dynamax",
                "mega_target": "corviknightgmax",
                "stats_meta": { "ev_level": 252 },
                "moves": [
                    "Brave Bird",
                    "Body Press",   // 扑击：配合铁壁伤害极高
                    "Iron Defense", // 铁壁：强化防御
                    "Roost"         // 羽栖：续航
                ],
                // 高信赖 = 哪怕血量危险也有概率为了不让训练家担心而锁血
                "avs": { "trust": 220, "devotion": 200 }
            },
            {
                "name": "Skwovet",
                "lv": 99, 
                "gender": "F",
                "nature": "Relaxed", // 加防，减速
                "ability": "Cheek Pouch", // 颊囊：吃果子额外回血 1/3 HP
                "item": "Sitrus Berry",   // 文柚果：HP<50% 回复 1/4 -> 配合特性一口奶满
                "mechanic": "dynamax",     // 甚至可以让这只松鼠极巨化增加血量上限
                "stats_meta": { "ev_level": 252 },
                "moves": [
                    "Super Fang",    // 愤怒门牙：无视防御扣除一半血量
                    "Stuff Cheeks",  // 狂吞：防御+2 并吃掉果子 (主动触发回复)
                    "Body Slam",     // 泰山压顶：麻痹对手
                    "Stockpile"      // 蓄力：增加双防，变得极硬
                ],
                // 全满 AVs 参数，极其难以击杀 (高闪避、高锁血概率)
                "avs": { "trust": 255, "insight": 255, "devotion": 255, "passion": 255 } 
            }
        ]
    }
};
/* 
 * 角色: 小照 (Akari)
 * 身份: 银河队调查员 / 时空穿越者 / 镇抚者
 * 核心机制: 刚猛/迅疾 (PLA Styles) + 地板流 (Ceaseless Edge / Stone Axe)
 */
const AKARI_DATA = {
    // 【Tier 4 - 镇抚宝可梦的古法技艺·全盛期】
    4: {
        "trainerProficiency": 230,
        // ==============================================================
        // [Tier Specific Unlocks]
        // ==============================================================
        "unlocks": {
            "enable_bond": false,
            "enable_styles": true,       // ✅ 唯一的 Style 使用者：允许切换技能的「刚/迅」形态
            "enable_insight": false,     // 同样是神奥之前的时代，尚未掌握心眼 (上限155)
            "enable_mega": false,        // 古代没有 Mega
            "enable_z_move": false,      // 古代没有 Z
            "enable_dynamax": false,     // 古代没有 极巨
            "enable_tera": false
        },

        // ==============================================================
        // [Party Data] 满编复古强队
        // ==============================================================
        "party": [
            {
                // [王牌] 撒菱核心
                "name": "Samurott-Hisui", 
                "lv": 99,
                "gender": "F",
                "nature": "Adamant", // 固执
                "ability": "Sharpness", // 锋锐 (+50% 切割威力)
                "item": "Choice Scarf", // 专爱围巾 (在迅疾风格还没开启前，先手撒菱)
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 战术: 秘剑·千重浪是必带招式，每次攻击都撒菱。
                // 配合 style: 迅疾千重浪 = 极速铺场；刚猛本身没意义因为不加特效
                "moves": ["Ceaseless Edge", "Razor Shell", "X-Scissor", "Sacred Sword"],
                
                "isAce": true,
                "friendship": { "trust": 150, "passion": 200, "insight": 220, "devotion": 100 }
            },
            {
                // [补位/首发] 隐形岩核心
                "name": "Kleavor", // 劈斧螳螂
                "lv": 97,
                "gender": "M",
                "nature": "Jolly", // 爽朗
                "ability": "Sharpness", // 锋锐
                "item": "Focus Sash", // 气势披带 (保证出岩斧)
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Stone Axe", "X-Scissor", "Close Combat", "Quick Attack"] 
                // 岩斧 (Stone Axe): 攻击同时铺隐形岩。古代人的钉子都是打出来的。
            },
            {
                // [诡计刺客] 免除普通/格斗/幽灵 三系攻击
                "name": "Zoroark-Hisui", // 洗翠索罗亚克
                "lv": 95,
                "gender": "M",
                "nature": "Timid", // 胆小
                "ability": "Illusion", // 幻觉：伪装成队伍最后的精灵
                "item": "Life Orb", 
                "stats_meta": { "ivs": { "hp": 31, "atk": 0,  "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Shadow Ball", "Hyper Voice", "Flamethrower", "Nasty Plot"]
            },
            {
                // [重装坦克] 刚猛风格代表
                "name": "Ursaluna", // 月月熊
                "lv": 96,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Guts", // 毅力
                "item": "Flame Orb", // 火焰宝珠
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 战术: 刚猛+硬撑 (Strong Style Facade) = 毁灭级伤害
                // AI会倾向于在对手半血以下时切这一只收割
                "moves": ["Facade", "Headlong Rush", "Fire Punch", "Swords Dance"] 
            },
            {
                // [古代伙伴] 
                "name": "Pikachu",
                "lv": 100, // 虽然没进化，但是陪伴最久的
                "gender": "M",
                "nature": "Naive", // 还原动画/游戏中那种灵活的性格
                "ability": "Static", 
                "item": "Light Ball", // 在现代捡到的增幅器
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Volt Tackle", "Iron Tail", "Play Rough", "Swift"] // Swift 是迅疾风格的体现
            },
            {
                // [飞行打击] 舍身鸟
                "name": "Staraptor", 
                "lv": 94, 
                "gender": "F",
                "nature": "Jolly", 
                "ability": "Reckless", 
                "item": "Choice Band", // 专爱头带
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Brave Bird", "Double-Edge", "Close Combat", "U-turn"] 
            }
        ]
    }
};

/* 
 * 角色: 鸣依 (Rosa)
 * 身份: 合众英雄 / 宝可梦好莱坞偶像
 * 核心机制: 羁绊共鸣 (全员 ACE 将)
 */
const ROSA_DATA = {
    // 【Tier 4 - 合众的奇迹·全员主角】
    4: {
        "trainerProficiency": 240,
        // ==============================================================
        // [Tier Specific Unlocks: Unova's Peak]
        // ==============================================================
        "unlocks": {
            "enable_bond": true,         // ✅ 灵魂共鸣已开启
            "enable_styles": false,
            "enable_insight": true,      // ✅ 洞察力开启：修正大蛇瞪眼、暴风雪、活力信使鸟的命中
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false
        },

        // ==============================================================
        // [Party Data]
        // ==============================================================
        "party": [
            {
                // [御三家·草 | 只有我能逆流而上]
                "name": "Serperior", // 君主蛇
                "lv": 99,
                "gender": "F",
                "nature": "Timid", // 胆小 (+速)
                "ability": "Contrary", 
                "item": "Leftovers", 
                
                "stats_meta": { 
                    "ev_level": 252, // 统一觉醒 EV
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 } // 6V
                },
                
                "moves": ["Leaf Storm", "Dragon Pulse", "Glare", "Substitute"],
                
                "isAce": true, 
                // Devotion 极高：配合 Substitute + Leftovers 形成恐怖的回血循环
                "friendship": { "trust": 150, "passion": 150, "insight": 150, "devotion": 255 }
            },
            {
                // [御三家·火 | 舍身战车]
                "name": "Emboar", // 炎武王
                "lv": 96,
                "gender": "M",
                "nature": "Brave", // 勇敢 (+攻 -速)：放弃速度拼耐久和超高爆发
                "ability": "Reckless", // 舍身：反作用力招式威力提升
                "item": "Choice Band", // 专爱头带：攻击力 x1.5
                
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 } // 6V撑满HP吃反伤
                },
                
                // Head Smash (150岩) + Flare Blitz (120火) + Wild Charge (90电) + Superpower (120斗)
                // 打击面无死角，只要打中人，要么对面死，要么反伤把自己弹死
                "moves": ["Flare Blitz", "Superpower", "Wild Charge", "Head Smash"],
                
                "isAce": true,
                "friendship": { "trust": 100, "passion": 255, "insight": 100, "devotion": 120 }
            },
            {
                // [御三家·水 | 锐利剑客]
                "name": "Samurott", // 大剑鬼
                "lv": 96,
                "gender": "M",
                "nature": "Adamant", // 固执
                "ability": "Shell Armor", // 硬壳盔甲：不会被CT爆死，稳
                "item": "Life Orb", // 命玉：增强先制技能斩杀线
                
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 } // 6V双刀面板充实
                },
                
                // 修正：将 Liquidation 换回经典 Megahorn 覆盖草系，加入 Sacred Sword (如果有) 或 Knock Off
                // 这里用 Knock Off 对抗道具流
                "moves": ["Liquidation", "Aqua Jet", "Knock Off", "Megahorn"],
                
                "isAce": true,
                "friendship": { "trust": 200, "passion": 150, "insight": 150, "devotion": 100 }
            },
            {
                // [暴力法师]
                "name": "Simisear", // 爆香猿
                "lv": 93, 
                "gender": "M",
                "nature": "Timid",
                "ability": "Blaze", // 猛火：残血爆发
                "item": "Focus Sash", // 气腰：为了稳定强化以此 Nasty Plot
                
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 } 
                },
                
                "moves": ["Fire Blast", "Grass Knot", "Nasty Plot", "Focus Blast"],
                
                "isAce": false,
                "friendship": { "trust": 100, "passion": 200 }
            },
            {
                // [广域高速控场]
                "name": "Simipour", // 冷水猿
                "lv": 93, 
                "gender": "M",
                "nature": "Timid",
                "ability": "Torrent", 
                "item": "Expert Belt", // 达人带，因为技能属性丰富
                
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }
                },
                
                "moves": ["Hydro Pump", "Ice Beam", "Scald", "Taunt"],
                
                "isAce": false,
                "friendship": { "trust": 100, "passion": 100, "insight": 150 }
            },
            {
                // [合众好莱坞影星 | 必中强攻]
                "name": "Delibird", // 信使鸟
                "lv": 92, // 拉平等级
                "gender": "F",
                "nature": "Jolly", // 极速
                "ability": "Hustle", // 【活力】：物理威力 x1.5，命中 x0.8
                "item": "Focus Sash", // 绑带同命流
                
                // 必须全部拉满31，本身种族值低，但这只有点HP/Def可能有奇迹生还
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }
                },
                
                // 战术核心：Destiny Bond(同命) + Ice Shard(先制)。
                // Sky Attack(神鸟猛击) 如果带强力香草最好，这里用 Brave Bird 替代稳定输出
                "moves": ["Ice Shard", "Destiny Bond", "Brave Bird", "Drill Run"],
                
                "isAce": false,
                // Insight 255 是关键：修正 Hustle 特性掉的 20% 命中，实现此怪 "招招烈火" 的强度
                "friendship": { "trust": 80, "passion": 200, "insight": 255, "devotion": 50 }
            }
        ]
    }
};


/* 
 * 角色: 莎莉娜 (Serena)
 * 身份: 卡洛斯英雄 / 舞台上的女王
 * 核心机制: Mega 进化 (Absolite)
 */
const SERENA_DATA = {
    // 【Tier 4 - 华丽与力量的终极舞台】
    4: {
        "trainerProficiency": 235,
        // ==============================================================
        // [Tier Specific Unlocks]
        // ==============================================================
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": true,         // ✅ 唯一的钥匙：开启 Mega 进化按钮
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false
        },

        // ==============================================================
        // [Party Data]
        // ==============================================================
        "party": [
            {
                // [Mega 手/特攻手]
                // 注意：名字改回基础形态 "Absol"，装备 Mega 石，加上 mechanic:'mega'
                "name": "Absol", 
                "lv": 99,
                "gender": "F",
                "nature": "Jolly", // 爽朗 (Mega后115速度 + 魔法镜反弹，非常极端的破受配置)
                "ability": "Justified", // 进化前特性：正义之心 (防恶系联防)
                "item": "Absolite",     // 关键道具：阿勃梭鲁进化石
                
                // === 触发器 ===
                "mechanic": "mega",     // 告诉 AI 和 UI：这也是 Mega 进化的执行者
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 魔法镜特性下，可以放心强化；突袭收割
                "moves": ["Sucker Punch", "Play Rough", "Knock Off", "Swords Dance"]
            },
            {
                "name": "Delphox",
                "lv": 99,
                "gender": "F",
                "nature": "Timid", // 胆小
                "ability": "Blaze", // 猛火 (配合高 Trust 的锁血，残血猛火更适合此时的场景)
                // 或者用 "Magician" 也可以，但猛火作为 Ace 的翻盘能力更强
                "item": "Life Orb", 
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                "isAce": true, 
                // 表演家的热情(Passion) 和 羁绊(Trust) 极高
                "friendship": { "trust": 150, "passion": 255, "insight": 120, "devotion": 100 },
                
                "moves": ["Fire Blast", "Psychic", "Dazzling Gleam", "Calm Mind"]
            },
            {
                // [高速刺客]
                "name": "Greninja",
                "lv": 93,
                "gender": "M",
                "nature": "Naive", // 天真
                "ability": "Protean", // 变幻自如 (卡洛斯的代表性神特性)
                "item": "Choice Scarf", // 围巾 (速度线控制)
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Ice Beam", "Dark Pulse", "Gunk Shot", "U-turn"]
            },
            {
                // [神兽位 / 物理核心]
                "name": "Zygarde",
                "lv": 95,
                "gender": "N",
                "nature": "Adamant", // 固执
                // Power Construct (群聚变形) 是被动触发 (HP<50%)，不需 'mechanic' 控制
                "ability": "Power Construct", 
                "item": "Leftovers", 
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Thousand Arrows", "Dragon Dance", "Substitute", "Extreme Speed"] 
            },
            {
                // [特攻爆破] 妖精女王
                "name": "Sylveon", 
                "lv": 88, // 稍微拉高等级
                "gender": "F",
                "nature": "Modest",
                "ability": "Pixilate", // 妖精皮肤
                "item": "Choice Specs", // 眼镜高音，简单粗暴
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Hyper Voice", "Psyshock", "Shadow Ball", "Quick Attack"] 
            },
            {
                // [水盾] 对应原来的 Vaporeon，但等级修复
                "name": "Vaporeon",
                "lv": 85, // 修正了原本 Lv.31 的问题
                "gender": "F",
                "nature": "Bold", 
                "ability": "Water Absorb",
                "item": "Leftovers",
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Scald", "Wish", "Protect", "Toxic"] // 用 wish 奶队友
            }
        ]
    }
};

/* 
 * 角色: 小光 (Dawn)
 * 身份: 神奥协调大师 / 华丽大赛庆典冠军
 * 风格: 华丽与实力的完美结合 (Insight Stream)
 * 核心变化: 全员 Ace + Mega + 极致闪避/命中修正
 */
/* 
 * 角色: 小光 (Dawn)
 * 优化点：
 * 1. 引入 Togekiss 替换 Froslass (致敬动画/游戏主力，且强度更高)
 * 2. Infernape 换用大字爆 (Fire Blast)，依赖 Insight 修正命中
 * 3. Torterra 增加突击背心(Assault Vest)增强对攻能力，或保持剩饭
 * 4. Empoleon 确认为 Competitive (好胜) + 弱点保险或突击背心
 */
const DAWN_DATA = {
    // 【Tier 4 - 神奥的永恒光辉】
    4: {
        "trainerProficiency": 235,
        "unlocks": {
            "enable_bond": false, 
            "enable_styles": false, 
            "enable_insight": true,      // ✅ 华丽大赛的观察力：大幅修正低命中技能
            "enable_mega": true,         
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false
        },
        "party": [
            {   // [Mega 战姬 - 不变]
                "name": "Lopunny",
                "lv": 98, // 王牌等级微调
                "gender": "F",
                "nature": "Jolly", 
                "ability": "Scrappy", // 胆量
                "item": "Lopunnite",
                "mechanic": "mega",
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Fake Out", "Return", "High Jump Kick", "Ice Punch"], // Insight 让飞膝踢必中且不撞墙，非常强暴力
                "isAce": true, 
                "friendship": { "trust": 150, "passion": 200, "insight": 255, "devotion": 120 }
            },
            {   // [天恩 + 心眼 = 绝对畏缩] -> 替换掉 Froslass
                // 波克基斯是小光绝对的主力之一，且是 Insight 机制的最大受益者
                "name": "Togekiss", 
                "lv": 94,
                "gender": "F",
                "nature": "Timid", // 胆小 +速
                "ability": "Serene Grace", // 天恩：追加效果翻倍 (空气切 60% 畏缩)
                "item": "Kings Rock",      // 王者之证 (如果想更加做人，不带也可以；带了就是近 70% 畏缩)
                                           // 或者带 "Leftovers" / "Babiri Berry" (抗钢果)
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 战术：Air Slash (畏缩) + Insight (保证必中/易暴击)。
                // 只要速度慢于她，基本上很难动弹。
                "moves": ["Air Slash", "Dazzling Gleam", "Aura Sphere", "Nasty Plot"]
            },
            {   // [烈焰猴 - 技能优化]
                "name": "Infernape",
                "lv": 95,
                "gender": "M",
                "nature": "Naive", 
                "ability": "Iron Fist", 
                "item": "Life Orb", 
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 修改：Overheat -> Fire Blast
                // 原因：Overheat 打一发就废了特攻。有 Insight 加持，大字爆(Fire Blast) 的命中不是问题，持续输出更强。
                // 增加 Grass Knot (打断自己的水/地弱点) 也是好选择，或者保留 Mach Punch 收残。
                "moves": ["Fire Blast", "Close Combat", "Mach Punch", "Grass Knot"],
                "isAce": true
            },
            {   // [帝王拿波 - 特盾强化]
                "name": "Empoleon",
                "lv": 95,
                "gender": "M",
                "nature": "Modest", 
                "ability": "Competitive", // 好胜 (SV版本才有，如果是Gen8之前的环境可能没有，模拟器通常允许)
                // 如果不能用 Competitive，建议改回 Torrent + Petaya Berry (特攻果)
                
                "item": "Assault Vest",   // 修改：突击背心。这给了它极高的特耐，可以和特殊攻击手硬刚。
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 水炮在 Insight 下必中
                "moves": ["Hydro Pump", "Flash Cannon", "Ice Beam", "Jet Punch"], 
                // Jet Punch 是个玩笑它学不会，但也用 Aqua Jet 凑合；或者 Vacuum Wave
                "moves": ["Hydro Pump", "Flash Cannon", "Ice Beam", "Aqua Jet"] 
            },
            {   // [土台龟 - 物理堡垒]
                "name": "Torterra", 
                "lv": 94,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Shell Armor", // 防CT
                "item": "Yache Berry",    // 修改：抗冰果。土台龟4倍弱冰，这是唯一的暴毙点。
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                 // 既然带了木槌，Synthesis 回血节奏可能跟不上 Tier4 的伤害，依然保留吧
                 // 或者 Rock Polish (岩磨) 强化速度推队
                "moves": ["Wood Hammer", "Earthquake", "Stone Edge", "Synthesis"]
            },
            {   // [白色恶魔 - 维持原样]
                // 这一只是完美的。
                "name": "Pachirisu",
                "lv": 98, 
                "gender": "F",
                "nature": "Impish", 
                "ability": "Volt Absorb", 
                "item": "Sitrus Berry", 
                
                "stats_meta": { 
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, 
                    "ev_level": 252
                },
                "moves": ["Nuzzle", "Super Fang", "Charm", "Protect"],
                "isAce": true,
                "friendship": { "trust": 255, "passion": 80, "insight": 200, "devotion": 200 }
            }
        ]
    }
};


/* 
 * 角色: 美月 (Selene)
 * 身份: 阿罗拉初代冠军 / 从异次元归来的诸岛巡礼者
 * 难度: Expert / Tier 4
 */
const SELENE_DATA = {
    // 【Tier 4 - 全力姿态·阿罗拉的太阳与月亮】
    4: {
        "trainerProficiency": 250,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": true,
            "enable_dynamax": false,
            "enable_tera": false
        },
        "party": [
            {
                "name": "Decidueye", // 狙射树枭 (ACE - Z招式使用者)
                "lv": 98,
                "gender": "M",
                "nature": "Adamant", // 固执
                "ability": "Long Reach", // 远隔
                "item": "Decidium Z", // Z纯晶
                "mechanic": "zmove", // ✅ Z招式机制标记
                "isAce": true,
                "friendship": { "trust": 255, "passion": 180, "insight": 180, "devotion": 120 },
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 } // 6V
                },
                "moves": ["Spirit Shackle", "Leaf Blade", "Brave Bird", "Sucker Punch"]
            },
            {
                "name": "Incineroar", // 炽焰咆哮虎
                "lv": 94,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Intimidate", // 威吓
                "item": "Sitrus Berry",
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 } // 6V
                },
                "moves": ["Darkest Lariat", "Flare Blitz", "Fake Out", "Parting Shot"]
            },
            {
                "name": "Snorlax", // 卡比兽
                "lv": 95,
                "gender": "M",
                "nature": "Impish", // 淘气 (+防 -特攻)
                "ability": "Thick Fat", // 厚脂肪
                "item": "Leftovers", 
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 } // 6V
                },
                "moves": ["Giga Impact", "Body Slam", "Rest", "Sleep Talk"]
            },
            {
                "name": "Lycanroc-Dusk", // 鬃岩狼人-黄昏
                "lv": 96,
                "gender": "M",
                "nature": "Jolly", // 爽朗 (+速 -特攻)
                "ability": "Tough Claws", // 硬爪
                "item": "Life Orb",
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 } // 6V，虽然特攻无用但为了HP偶数等微调通常拉满
                },
                "moves": ["Stone Edge", "Accelerock", "Close Combat", "Psychic Fangs"]
            },
            {
                "name": "Scizor", // 巨钳螳螂
                "lv": 95,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Technician", // 技术高手
                "item": "Choice Band", 
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 } // 6V
                },
                "moves": ["Bullet Punch", "U-turn", "Dual Wingbeat", "Superpower"]
            },
            {
                "name": "Umbreon",
                "lv": 92,
                "gender": "M",
                "nature": "Calm", // 温和 (+特防 -攻)
                "ability": "Synchronize", // 同步
                "item": "Rocky Helmet",
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 } // 5V0A，为了减少欺诈和混乱伤害
                },
                "moves": ["Foul Play", "Moonlight", "Toxic", "Protect"]
            }
        ]
    }
};

/* 
 * 角色: 小青 (Juliana)
 * 身份: 帕底亚转校生 / 零之秘宝探索者 / 悖论种驯服者
 * 难度: Expert / Tier 4 (UBER)
 */
const JULIANA_DATA = {
    // 【Tier 4 - 帕底亚的第零区生态灾害】
    4: {
        "trainerProficiency": 245,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": true    // ✅ 解锁 太晶化 (核心机制: 亮晶晶的收藏癖)
        },
        "party": [
            // 1. [坐骑/真·神兽] 
            // 帕底亚的守护神，也是她在这个特区横冲直撞的资本。
            {
                "name": "Miraidon", // 密勒顿
                "lv": 99,
                "gender": "N", // 无性别
                "nature": "Modest", // 内敛 (+特攻 -攻)
                "ability": "Hadron Engine", // 强子引擎 (出场开电场+特攻提升)
                "item": "Choice Specs", // 讲究眼镜 (追求极致的暴力输出)
                "mechanic": "tera",
                "teraType": "Electric", // 太晶电 (电上加电)
                "isAce": true, // 核心王牌
                // [羁绊]: 特别高的 Passion (冲动) 和 Trust (长期骑乘的信任)
                "friendship": { "trust": 255, "passion": 255, "insight": 100, "devotion": 120 },
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 } 
                },
                // 闪电猛冲(专属) + 龙波 + 抛物面(吸血续航) + 伏特替换(游走)
                "moves": ["Electro Drift", "Dragon Pulse", "Parabolic Charge", "Volt Switch"]
            },
            // 2. [首发/游击] 
            // 像魔术师一样的猫，和主人一样擅长变手指戏法。
            {
                "name": "Meowscarada", // 魔幻假面喵
                "lv": 98,
                "gender": "F",
                "nature": "Jolly", // 爽朗 (+速 -特攻)
                "ability": "Protean", // 变幻自如 (帕底亚虽然被削但也够用)
                "item": "Focus Sash", // 气势披带 (保证必出一招)
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }
                },
                // 千变万花(必中必爆) + 拍落(没收道具) + 急速折返 + 嬉闹
                "moves": ["Flower Trick", "Knock Off", "U-turn", "Play Rough"]
            },
            // 3. [大将]
            // 需要队友献祭才能变强的将军，符合她“把别人当做资源”的性格。
            {
                "name": "Kingambit", // 仆刀将军
                "lv": 97,
                "gender": "M",
                "nature": "Adamant", // 固执
                "ability": "Supreme Overlord", // 大将 (队友倒下越多越强)
                "item": "Black Glasses", // 黑色眼镜
                "mechanic": "tera",
                "teraType": "Dark", // 太晶恶 (加强仆刀)
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }
                },
                // 仆刀(必中) + 突袭(心理博弈) + 铁头 + 剑舞
                "moves": ["Kowtow Cleave", "Sucker Punch", "Iron Head", "Swords Dance"]
            },
            // 4. [资源回收者]
            // 拿着巨锤到处抢东西的粉色恶魔，巨锻匠。
            {
                "name": "Tinkaton", // 巨锻匠
                "lv": 96,
                "gender": "F",
                "nature": "Jolly", // 爽朗 (为了能先手电磁波)
                "ability": "Mold Breaker", // 破格 (无视特性砸下去)
                "item": "Leftovers", // 剩饭
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }
                },
                // 巨力锤(160威力) + 嬉闹 + 拍落(还是抢劫) + 电磁波(恶心人)
                "moves": ["Gigaton Hammer", "Play Rough", "Knock Off", "Thunder Wave"]
            },
            // 5. [吸血鬼骑士]
            // 又帅又强，悔念剑吸取生命符合“榨取”的主题。
            {
                "name": "Ceruledge", // 苍炎刃鬼
                "lv": 95,
                "gender": "M",
                "nature": "Jolly", 
                "ability": "Weak Armor", // 碎裂铠甲 (被打加速，反杀)
                "item": "Life Orb", // 命玉
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }
                },
                // 悔念剑(回血) + 暗影偷袭(先制) + 近身战 + 剑舞
                "moves": ["Bitter Blade", "Shadow Sneak", "Close Combat", "Swords Dance"]
            },
            // 6. [规则破坏者]
            // 巴布土拨，这只看起来毛绒绒的老鼠拥有游戏里最Bug的技能：复活队友。
            // 即使你打倒了密勒顿，她也会笑着让它复活。
            {
                "name": "Pawmot", // 巴布土拨
                "lv": 94,
                "gender": "F",
                "nature": "Jolly",
                "ability": "Iron Fist", // 铁拳
                "item": "Leppa Berry", // PP果 (甚至想复活两次???)
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }
                },
                // 复生祈祷(核心) + 电光双击(必须钛晶用) + 近身战 + 音速拳
                "moves": ["Revival Blessing", "Double Shock", "Close Combat", "Mach Punch"]
            }
        ]
    }
};



/* 
 * 角色: 露莎米奈 (Lusamine)
 * 身份: 以太基金会理事长 / 究极异兽狂热者
 * 核心机制: Z招式 (Z-Moves)
 */
const LUSAMINE_DATA = {
    // 【Tier 4 - 虚无世界的母爱】
    4: {
        "trainerProficiency": 220,
        // ==============================================================
        // [Tier Specific Unlocks]
        // ==============================================================
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": true,       // ✅ 核心：解锁 Z 手环权限
            "enable_dynamax": false,
            "enable_tera": false
        },

        // ==============================================================
        // [Party Data]
        // ==============================================================
        "party": [
            {
                // [异兽王牌 / Z-Move Core]
                "name": "Nihilego", // 虚吾伊德
                "lv": 99,
                "gender": "N",
                "nature": "Timid", // 胆小 (+速 -攻)
                "ability": "Beast Boost", // 发动后滚雪球
                
                // === 机制核心 ===
                "item": "Rockium Z",    // 携带岩石 Z 纯晶
                "mechanic": "zmove",    // 锁定：本场 Z 招式由它释放
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 战术: Power Gem (力量宝石) -> 转化 -> Continental Crush (威力160)
                "moves": ["Power Gem", "Sludge Wave", "Stealth Rock", "Thunderbolt"],
                
                "isAce": true,
                "friendship": { "trust": 80, "passion": 120, "insight": 140, "devotion": 255 }
            },
            {
                // [极速收割机]
                "name": "Pheromosa", // 费洛美螂
                "lv": 98,
                "gender": "N",
                "nature": "Naughty",
                "ability": "Beast Boost",
                "item": "Focus Sash", // 脆皮必备其实披带
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["High Jump Kick", "U-turn", "Ice Beam", "Poison Jab"] 
            },
            {
                // [物理攻坚]
                "name": "Bewear", // 穿着熊
                "lv": 92,
                "gender": "F",
                "nature": "Adamant",
                "ability": "Fluffy", // 毛茸茸 (物耐恐怖)
                "item": "Assault Vest", // 突击背心 (补特防)
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Double-Edge", "Superpower", "Darkest Lariat", "Ice Punch"] 
            },
            {
                // [特耐选中 / 异常状态手]
                "name": "Milotic", // 美纳斯
                "lv": 82,
                "gender": "F",
                "nature": "Bold", 
                "ability": "Marvel Scale", 
                "item": "Flame Orb", // 主动烧伤加防御
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Scald", "Recover", "Haze", "Ice Beam"] 
            },
            {
                // [特攻强化手]
                "name": "Lilligant", // 裙儿小姐
                "lv": 75,
                "gender": "F",
                "nature": "Modest",
                "ability": "Own Tempo", // 我行我素
                "item": "Kee Berry", // 受到物攻提升防御（比第二条气腰更实用些）/或者 Life Orb
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 200 },
                "moves": ["Quiver Dance", "Petal Dance", "Sleep Powder", "Giga Drain"]
            },
            {
                // [魔法盾牌 / 补充]
                "name": "Clefable", // 皮可西
                "lv": 85,
                "gender": "F",
                "nature": "Calm",
                "ability": "Magic Guard", 
                "item": "Leftovers",
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Moonblast", "Soft-Boiled", "Cosmic Power", "Stored Power"]
            }
        ]
    }
};


/* 
 * 角色: 莉莉艾 (Lillie)
 * 修正: 等级回调至 [世界锦标赛标准] (Lv. 80 ~ 85)
 * 核心: 用最无害的外表，打最扎实的辉石与Z爆发
 */
const LILLIE_DATA = {
    // 【Tier 4 - 全力姿态·世界锦标赛配置】
    4: {
        "trainerProficiency": 180,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": true,
            "enable_dynamax": false,
            "enable_tera": false
        },

        "party": [
            {
                // [肉盾 ACE]
                // 即使是 Lv.85，配合满努力值辉石，耐久也超过大多数 Lv.100 的脆皮
                "name": "Clefairy", 
                "lv": 85, // 修正为 85 （一般是一队的最高等级）
                "gender": "F",
                "nature": "Bold", 
                "ability": "Magic Guard", 
                "item": "Eviolite", // 辉石是核心
                "mechanic": "zmove",
                "isAce": true, 
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 恶心战术不变：宇宙力量+变小
                "moves": ["Moonblast", "Moonlight", "Cosmic Power", "Minimize"],
                "friendship": { "trust": 220, "passion": 60, "insight": 120, "devotion": 255 }
            },
            {
                // [Z招式爆发点]
                "name": "Ninetales-Alola", 
                "lv": 84, // 紧跟ACE的等级
                "gender": "F",
                "nature": "Timid", 
                "ability": "Snow Warning", 
                "item": "Icium Z", 
                "mechanic": "zmove",
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0,  "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Blizzard", "Aurora Veil", "Freeze-Dry", "Moonblast"]
            },
            {
                // [传说外援]
                "name": "Magearna", 
                "lv": 82, // 幻兽基础面板高，等级稍微给一点"后来加入"的感觉
                "gender": "N",
                "nature": "Modest",
                "ability": "Soul-Heart", 
                "item": "Assault Vest", // 突击背心增加对拼能力
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Fleur Cannon", "Flash Cannon", "Aura Sphere", "Volt Switch"]
            },
            {
                // [干扰控速]
                "name": "Ribombee", 
                "lv": 82,
                "gender": "F",
                "nature": "Timid",
                "ability": "Shield Dust",
                "item": "Focus Sash", // 气腰保底
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Sticky Web", "Moonblast", "U-turn", "Pollen Puff"]
            },
            {
                // [特攻炮台]
                // 裙儿小姐如果特性是用我行我素，可以防威吓防混乱
                "name": "Lilligant", 
                "lv": 80,
                "gender": "F",
                "nature": "Modest",
                "ability": "Own Tempo", 
                "item": "Life Orb", 
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 200 },
                // 蝶舞强化流
                "moves": ["Quiver Dance", "Petal Dance", "Giga Drain", "Hidden Power Fire"] 
                // 关于觉醒火(Hidden Power Fire)，虽然新世代取消了，但在数据构建里可以作为一个"补盲手段"写入
                // 或者换成 Pollen Puff (花粉团)
            },
            {
                // [强力回复/辅助]
                "name": "Comfey", 
                "lv": 80,
                "gender": "F",
                "nature": "Bold",
                "ability": "Triage", 
                "item": "Leftovers",
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Draining Kiss", "Giga Drain", "Synthesis", "Calm Mind"] 
            }
        ]
    }
};


/* 
 * 角色: 玛奥 (Mallow)
 * 身份: 阿罗拉草系队长 / 美味之原有人的大厨
 * 核心机制: Z招式 (Grassium Z)
 */
const MALLOW_DATA = {
    // 【Tier 4 - 满汉全席·主厨推荐】
    4: {
        "trainerProficiency": 200,
        // ==============================================================
        // [Tier Specific Unlocks]
        // ==============================================================
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": true,       // ✅ 队长即是 Z 力量的引导者
            "enable_dynamax": false,
            "enable_tera": false
        },

        // ==============================================================
        // [Party Data]
        // ==============================================================
        "party": [
            {
                // [厨师长 / Z爆发核心]
                "name": "Tsareena", // 甜冷美后
                "lv": 85,
                "gender": "F",
                "nature": "Adamant", // 固执 (+攻 -特攻)
                "ability": "Queenly Majesty", // 女王的威严：封锁先制技（不管是神速还是突袭）
                
                // === 机制核心 ===
                "item": "Grassium Z",   // 携带草 Z
                "mechanic": "zmove",    // 绑定 Z 招式
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 战术: Using Power Whip -> Bloom Doom (威力 190) 强行突破
                // High Jump Kick 补盲打钢，U-turn 灵活轮转
                "moves": ["Power Whip", "High Jump Kick", "Trop Kick", "U-turn"],
                
                "isAce": true,
                // 充满热情的性格，注重献身服务食客(队友)
                "friendship": { "trust": 140, "passion": 200, "insight": 100, "devotion": 180 }
            },
            {
                // [霸主风味 / 唱反调流]
                "name": "Lurantis", // 兰螳花 (她试炼中的霸主)
                "lv": 84,
                "gender": "F",
                "nature": "Brave", // 勇敢 (+攻 -速, 甚至可能带空间？)
                "ability": "Contrary", // 唱反调：能力下降变为提升
                "item": "Leftovers",   // 剩饭续航
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 核心战术: 飞叶风暴 (+2 特攻) + 蛮力 (+1 物攻/防御)
                "moves": ["Leaf Storm", "Superpower", "Synthesis", "Poison Jab"] 
            },
            {
                // [万圣节特供 / 物理盾牌]
                "name": "Trevenant", // 朽木妖
                "lv": 83,
                "gender": "M",
                "nature": "Impish", // 淘气 (+防 -特攻)
                "ability": "Harvest", // 收获：晴天必定回收树果，平时50%
                "item": "Sitrus Berry", // 文柚果 (配合收获几乎无限回血)
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 经典的无限鬼火消耗流
                "moves": ["Will-O-Wisp", "Poltergeist", "Horn Leech", "Leech Seed"] 
            },
            {
                // [招牌甜点 / 厚脂坦克]
                "name": "Appletun", // 丰蜜龙
                "lv": 82,
                "gender": "M",
                "nature": "Bold", 
                "ability": "Thick Fat", // 厚脂肪：减半火/冰伤害 (作为草系极其重要)
                "item": "Rocky Helmet", // 凸凸头
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 专门溶解钢系
                "moves": ["Apple Acid", "Dragon Pulse", "Recover", "Body Press"] 
            },
            {
                // [餐后奶油 / 双打辅助]
                "name": "Alcremie", // 霜奶仙
                "lv": 80,
                "gender": "F",
                "nature": "Calm",
                "ability": "Sweet Veil", // 甜幕：防睡眠
                "item": "Wiki Berry", // 混乱果
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Dazzling Gleam", "Mystical Fire", "Calm Mind", "Recover"]
            },
            {
                // [阿罗拉的风 / 地区特产]
                "name": "Exeggutor-Alola", // 阿罗拉椰蛋树
                "lv": 82,
                "gender": "M",
                "nature": "Quiet", // 冷静 (空间打手)
                "ability": "Frisk", // 察觉
                "item": "Sitrus Berry",
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 也是能用龙系 Z 招式的 potential unit
                "moves": ["Draco Meteor", "Flamethrower", "Giga Drain", "Sludge Bomb"]
            }
        ]
    }
};


/* 
 * 角色: 水莲 (Lana)
 * 身份: 阿罗拉水系队长 / 传说中的钓鱼大师
 * 核心机制: Z招式 (Waterium Z) + 水泡核弹
 */
const LANA_DATA = {
    // 【Tier 4 - 滔天巨浪·海神钓手】
    4: {
        "trainerProficiency": 200,
        // ==============================================================
        // [Tier Specific Unlocks]
        // ==============================================================
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": true,       // ✅ 你的队伍就是我的鱼塘
            "enable_dynamax": false,
            "enable_tera": false
        },

        // ==============================================================
        // [Party Data]
        // ==============================================================
        "party": [
            {
                // [水泡核弹 / 绝对王牌]
                "name": "Araquanid", // 滴蛛霸
                "lv": 85,
                "gender": "F",
                "nature": "Adamant", // 固执 (+攻 -特攻)
                "ability": "Water Bubble", // 水泡：火系伤害减半，免烧伤，水系威力x2 (自带讲究头带效果且无负面)
                
                // === 机制核心 ===
                "item": "Waterium Z",   // 携带水 Z
                "mechanic": "zmove",    // 绑定 Z 招式
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 战术: Liquidation + Water Bubble + Z-Power = 毁天灭地的 Hydro Vortex (威力160的基础伤害修正后极高)
                // Lunge 降攻，Sticky Web 控速保障后续队友
                "moves": ["Liquidation", "Leech Life", "Lunge", "Sticky Web"],
                
                "isAce": true, 
                // "别看我这样，我可是钓上来过盖欧卡的 (笑)"
                "friendship": { "trust": 160, "passion": 200, "insight": 120, "devotion": 120 }
            },
            {
                // [物理屠夫 / 破壳推队]
                "name": "Cloyster", // 刺甲贝
                "lv": 84,
                "gender": "M",
                "nature": "Jolly", // 爽朗 (极速)
                "ability": "Skill Link", // 连续攻击：必定5连
                "item": "Focus Sash",    // 气势披带：唯一的弱点是特防，这就需要气腰来保证破壳成功
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // AI 逻辑：只要气腰还在，直接 Shell Smash，然后 Icicle Spear 推队
                "moves": ["Shell Smash", "Icicle Spear", "Rock Blast", "Ice Shard"] 
            },
            {
                // [鱼群领主 (?) / 重炮台]
                "name": "Wishiwashi", // 弱丁鱼 (鱼群样子)
                "lv": 83,
                "gender": "M",
                "nature": "Quiet", // 冷静 (接球用，双刀)
                "ability": "Schooling", // 鱼群：HP>25% 时种族如同神兽
                "item": "Sitrus Berry", // 文柚果：维持鱼群形态的生命线
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 0 }, "ev_level": 252 },
                
                // 极慢的速度适合后手 U-turn，或者硬吃一发后双刀反杀
                "moves": ["Hydro Pump", "Earthquake", "Ice Beam", "U-turn"] 
            },
            {
                // [第一印象 / 战略撤退]
                "name": "Golisopod", // 具甲武者
                "lv": 83,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Emergency Exit", // 危险回避：半血强制退场 (战略价值)
                "item": "Assault Vest", // 突击背心
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // First Impression (迎头一击) 威力90先制
                "moves": ["First Impression", "Aqua Jet", "Liquidation", "Sucker Punch"] 
            },
            {
                // [水/电 联防核心]
                "name": "Lanturn", // 电灯怪
                "lv": 82,
                "gender": "F",
                "nature": "Calm", 
                "ability": "Volt Absorb", // 蓄电
                "item": "Leftovers", 
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Scald", "Volt Switch", "Thunder Wave", "Heal Bell"] // 假如需要队医
            },
            {
                // [阿罗拉歌姬 / 补盲]
                "name": "Primarina", // 西狮海壬
                "lv": 82,
                "gender": "F",
                "nature": "Modest",
                "ability": "Torrent", // 激流
                "item": "Choice Specs", // 讲究眼镜
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 主要负责处理龙系和格斗系
                "moves": ["Moonblast", "Hydro Pump", "Psychic", "Energy Ball"] 
            }
        ]
    }
};


/* 
 * 角色: 珠贝 (Irida)
 * 身份: 珍珠队首领 / 帕路奇亚信仰者
 * 核心机制: 刚猛/迅疾 (PLA Styles) + 雪天防御队
 */
const IRIDA_DATA = {
    // 【Tier 4 - 珍珠所照耀的广阔空间】
    4: {
        "trainerProficiency": 215,
        // ==============================================================
        // [Tier Specific Unlocks]
        // ==============================================================
        "unlocks": {
            "enable_bond": false,
            "enable_styles": true,   
            "enable_insight": true,      
            "enable_mega": false, 
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false
        },

        // ==============================================================
        // [Party Data]
        // ==============================================================
        "party": [
            {
                // [绝对王牌 / 冰原之花]
                "name": "Glaceon", // 冰伊布
                "lv": 86,
                "gender": "F",
                "nature": "Modest", // 内敛 (特攻极限)
                "ability": "Snow Cloak", // 雪隐 (雪天里配合 AVs Insight 极高闪避)
                
                // 携带光粉 (BrightPowder) + 雪隐 + Insight = 极其难以命中的“空间折叠”感
                "item": "Bright Powder", 
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 战术: 迅疾·冥想 (贪强化) / 刚猛·暴风雪 (必中高伤)
                "moves": ["Blizzard", "Freeze-Dry", "Calm Mind", "Shadow Ball"],
                
                "isAce": true, 
                // 极高的 Insight 代表了珍珠队对于"空间/距离"的感知
                "friendship": { "trust": 160, "passion": 100, "insight": 255, "devotion": 120 }
            },
            {
                // [空间使者 / 魔法反射]
                "name": "Espeon", // 太阳伊布
                "lv": 84,
                "gender": "F",
                "nature": "Timid", // 胆小
                "ability": "Magic Bounce", // 魔法镜 (反弹状态)
                "item": "Light Clay", // 光之黏土
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 开双墙，利用迅疾风格可以连续行动开墙
                "moves": ["Psychic", "Dazzling Gleam", "Reflect", "Light Screen"] 
            },
            {
                // [雪原巨兽 / 物理坦克]
                "name": "Avalugg-Hisui", // 洗翠冰岩怪 (雪原的王)
                "lv": 85,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Strong Jaw", // 强壮之颚
                "item": "Assault Vest", // 突击背心 (弥补稀烂的特防，依靠雪天+50%物防硬吃物理)
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 专属技 冰山之风 (Mountain Gale) + 岩崩
                "moves": ["Mountain Gale", "Stone Edge", "Earthquake", "Body Press"]
            },
            {
                // [火系爆破 / 逆属性位]
                "name": "Flareon", // 火伊布 (作为由于怕热而养的火系，处理钢系敌人)
                "lv": 84,
                "gender": "F",
                "nature": "Adamant",
                "ability": "Guts", // 毅力
                "item": "Toxic Orb", // 剧毒宝珠
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 刚猛·硬撑 / 迅疾·电光一闪
                "moves": ["Flare Blitz", "Facade", "Superpower", "Quick Attack"]
            },
            {
                // [高速刺客 / 剧毒手]
                "name": "Sneasler", // 大纽拉 (也属于珍珠队照看的王)
                "lv": 83,
                "gender": "F",
                "nature": "Jolly", 
                "ability": "Unburden", // 轻装 (配合力量香草或气脊)
                "item": "White Herb", // 配合近身战解Debuff，或者气势披带
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 专属技 露爪 (Dire Claw) 异常状态赌狗
                "moves": ["Dire Claw", "Close Combat", "Acrobatics", "Swords Dance"]
            },
            {
                // [雪天启动 / 干扰]
                // 选用冷门但符合设定的雪妖女，契合洗翠的灵异氛围
                "name": "Froslass", // 雪妖女
                "lv": 82,
                "gender": "F",
                "nature": "Timid",
                "ability": "Cursed Body", 
                "item": "Focus Sash",
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Aurora Veil", "Destiny Bond", "Icy Wind", "Spikes"] 
                // 极光幕+同命，典型的死士
            }
        ]
    }
};
/* 
 * 角色: 索妮亚 (Sonia)
 * 身份: 伽勒尔地区博士 / 传说的记录者
 * 核心概念: 理论派 (The Theorist) - 机制全解禁，道具完美适配，但等级克制
 */
const SONIA_DATA = {
    // 【Tier 4 - 博士的论文答辩】
    4: {
        "trainerProficiency": 190,
        // ==============================================================
        // [Tier Specific Unlocks] 全知全能 (Omnisurvey)
        // 只有身为博士的她，才拥有所有地区现象的研究许可
        // ==============================================================
        "unlocks": {
            "enable_bond": true,         // 为了以此证明“英雄”的心
            "enable_styles": true,       // 考据了洗翠的历史文献
            "enable_insight": true,      // 完美的战术理论 (心眼已开，AVs突破155)
            "enable_mega": true,         // 卡洛斯留学的纪念
            "enable_z_move": true,       // 阿罗拉交流的成果
            "enable_dynamax": true,      // 本土伽勒尔的能量
            "enable_tera": true          // 最新的帕底亚论文课题
        },

        // ==============================================================
        // [Party Data] 少而精的理论验证队
        // ==============================================================
        "party": [
            {
                // [绝对核心 / 奇迹吉祥物]
                // 没进化不是因为弱，是因为“进化奇石 (Eviolite)”在计算上防御更高
                "name": "Yamper", 
                "lv": 75, 
                "gender": "M",
                "nature": "Impish", // 淘气 (+防 -特攻) - 极限物理肉盾
                "ability": "Ball Fetch", 
                "item": "Eviolite", // 进化奇石：Def/SpD x1.5，配合下面满的EV，硬度堪比神兽
                
                // === 机制实验：太晶化研究 ===
                "mechanic": "tera",
                "teraType": "Electric", // 纯电太晶，消除弱点并提升本系抗打
                
                "stats_meta": {
                    // 身为博士，当然懂得怎么给宝可梦【磕药】打满 6V 和最合理的 510 努力值
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, 
                    "ev_level": { "hp": 252, "atk": 0, "def": 252, "spa": 0, "spd": 4, "spe": 0 } 
                },
                
                // 战术：蹭蹭麻烦(控速/控场) + 愤怒门牙(无视等级差强行削血)
                "moves": ["Nuzzle", "Super Fang", "Play Rough", "Rest"],
                
                "isAce": true,
                // 高 Insight (读书多预判准) + 高 Devotion (这只狗真的很忠诚)
                "friendship": { "trust": 150, "passion": 100, "insight": 255, "devotion": 200 }
            },
            {
                // [强力输出 / Z 论文演示]
                "name": "Tsareena", // 甜冷美后
                "lv": 72,
                "gender": "F",
                "nature": "Adamant",
                "ability": "Queenly Majesty", // 女王的威严：封锁对面的先制技能 (如神速/击掌奇袭)
                
                "mechanic": "zmove",    // 使用 Z 招式
                "item": "Grassium Z",   // 草 Z
                
                // 依然是满努力值的暴力输出分配
                "stats_meta": {
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 },
                    "ev_level": { "hp": 0, "atk": 252, "def": 4, "spa": 0, "spd": 0, "spe": 252 }
                },
                "moves": ["Power Whip", "High Jump Kick", "Trop Kick", "U-turn"]
            },
            {
                // [本土特产 / 极巨化展示对象]
                // 乘龙 (Lapras) - 可能是丹帝送的那个级别或者以前自己抓的遗留
                "name": "Lapras", 
                "lv": 70,
                "gender": "F",
                "nature": "Modest", // 内敛
                "ability": "Shell Armor", // 硬壳盔甲：不被击中要害 (理论最优解)
                
                "mechanic": "dynamax", // 超极巨化
                "item": "Weakness Policy", // 弱点保险：吃一发克制技能特攻物攻+2，典型的对战党配置
                
                // Max HP / Max SpA
                "stats_meta": {
                    "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 },
                    "ev_level": { "hp": 252, "atk": 0, "def": 0, "spa": 252, "spd": 0, "spe": 4 }
                },
                // G-Max Resonance (超极巨极光声) 会直接开极光幕，战略价值极大
                "moves": ["Freeze-Dry", "Hydro Pump", "Thunder", "Protect"]
            }
        ]
    }
};


/* 
 * 馆主: 霍米加 (Roxie)
 * 属性: 毒 (Poison)
 * 风格: 摇滚乐手 / 猛毒快攻
 * 难度曲线: Level 1 (车库乐队) -> Level 3 (灵魂共鸣) -> Level 4 (世界巡演)
 */
const ROXIE_DATA = {
    // 【Tier 1 - 车库里的杂音】
    // Lv.25 左右，未进化，基础连招，没有任何特殊系统解锁。
    1: {
        "trainerProficiency": 50,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false
        },
        "party": [
            {
                "name": "Venipede", // 百足蜈蚣 (高速干扰手雏形)
                "lv": 24,
                "gender": "F",
                "nature": "Hasty",
                "ability": "Poison Point", // 毒刺
                "item": "Poison Barb", // 毒针
                "stats_meta": { "ivs": { "hp": 20, "atk": 20, "def": 20, "spa": 20, "spd": 20, "spe": 20 }, "ev_level": 5 },
                "moves": ["Bug Bite", "Poison Tail", "Iron Defense", "Screech"] // 刺耳声配合物理
            },
            {
                "name": "Koffing", // 瓦斯弹 (飘浮地联防)
                "lv": 24,
                "gender": "M",
                "nature": "Bold",
                "ability": "Levitate",
                "stats_meta": { "ivs": { "hp": 20, "atk": 20, "def": 20, "spa": 20, "spd": 20, "spe": 20 }, "ev_level": 5 },
                "moves": ["Smog", "Assurance", "Clear Smog", "Will-O-Wisp"]
            },
            {
                "name": "Trubbish", // 破破袋 (未来的王牌)
                "lv": 25,
                "gender": "F",
                "nature": "Adamant",
                "ability": "Stench", // 恶臭 (偶尔畏缩)
                "item": "Oran Berry", // 橙橙果
                "isAce": true, // 初始Ace
                "stats_meta": { "ivs": { "hp": 25, "atk": 25, "def": 25, "spa": 25, "spd": 25, "spe": 25 }, "ev_level": 20 },
                "moves": ["Sludge", "Toxic Spikes", "Acid Spray", "Double Slap"] // 撒毒菱干扰
            }
        ]
    },

    // 【Tier 2 - 地下 Live House 的实力派】
    // Lv.50，辉石防御体系，初步的战术雏形。
    2: {
        "trainerProficiency": 100,
        "unlocks": {
            "enable_bond": false, // 尚未达到灵魂共鸣
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false
        },
        "party": [
            {
                "name": "Whirlipede", // 车轮球 (进化奇石战术)
                "lv": 48,
                "gender": "F",
                "nature": "Jolly",
                "ability": "Speed Boost", // 梦特：加速特性开始启用
                "item": "Eviolite",     // 辉石：硬度极高
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 }, "ev_level": 120 },
                // 守住加速 + 铁壁防御，很难打动
                "moves": ["Protect", "Poison Jab", "Iron Defense", "Bug Bite"]
            },
            {
                "name": "Golbat", // 大嘴蝠 (为了以后的战术位)
                "lv": 48,
                "gender": "M",
                "nature": "Jolly",
                "ability": "Inner Focus",
                "item": "Sitrus Berry",
                "stats_meta": { "ivs": { "hp": 25, "atk": 31, "def": 25, "spa": 25, "spd": 25, "spe": 31 }, "ev_level": 85 },
                "moves": ["Cross Poison", "Confuse Ray", "Bite", "U-turn"]
            },
            {
                "name": "Toxtricity", // 颤弦蝾螈 (新队员入队，特攻手)
                "lv": 49,
                "gender": "M",
                "nature": "Modest",
                "ability": "Punk Rock", // 庞克摇滚
                "item": "Magnet", // 磁铁
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 25, "spa": 31, "spd": 25, "spe": 31 }, "ev_level": 120 },
                "moves": ["Overdrive", "Venoshock", "Snarl", "Noble Roar"] // 声音招式配合特性
            },
            {
                "name": "Garbodor", // 灰尘山 (进化完全，物理主力)
                "lv": 50,
                "gender": "F",
                "nature": "Adamant",
                "ability": "Weak Armor", // 碎裂铠甲
                "item": "Black Sludge", // 黑色污泥
                "isAce": true, 
                "friendship": { "trust": 100, "passion": 150, "insight": 80, "devotion": 100 }, // 羁绊渐深
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Gunk Shot", "Body Slam", "Drain Punch", "Toxic"]
            }
        ]
    },

    // 【Tier 3 - 震撼灵魂的巡演 · 羁绊觉醒】
    // Lv.70+，开启 enable_bond。
    // 战术核心：利用 Toxtricity 的声音爆发，以及最后 Garbodor 的“羁绊共鸣”。
    3: {
        "trainerProficiency": 160,
        "unlocks": {
            "enable_bond": true,         // ✅ 核心差异：点亮绿色 EVO 按钮
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,     // T3 还没有去伽勒尔，不会极巨化
            "enable_tera": false
        },
        "party": [
            {
                // [起点核心] 
                "name": "Scolipede", // 蜈蚣王 (完全体接棒手)
                "lv": 75,
                "gender": "F",
                "nature": "Jolly",
                "ability": "Speed Boost",
                "item": "Focus Sash", // 确保必定能强化一轮
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 200 },
                // 经典的接棒战术，可能会接给后面的颤弦蝾螈或灰尘山
                "moves": ["Swords Dance", "Iron Defense", "Baton Pass", "Megahorn"]
            },
            {
                // [干扰中转]
                "name": "Crobat", // 叉字蝠
                "lv": 74,
                "gender": "M",
                "nature": "Jolly",
                "ability": "Infiltrator", // 穿透
                "item": "Black Sludge", 
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 180 },
                "moves": ["Brave Bird", "Cross Poison", "U-turn", "Defog"] // 清钉工具人
            },
            {
                // [特攻爆破] 
                "name": "Toxtricity", 
                "lv": 74,
                "gender": "M",
                "nature": "Timid", // 胆小 (+速)
                "ability": "Punk Rock", 
                "item": "Throat Spray", // 处刑曲的节奏
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Boomburst", "Overdrive", "Sludge Wave", "Shift Gear"] //Boomburst 是声音核弹
            },
            {
                // [盲点补全]
                "name": "Drapion", // 龙王蝎 (抗超能 只有地弱点)
                "lv": 73,
                "gender": "M",
                "nature": "Careful", // 慎重 (+特防)
                "ability": "Sniper", // 狙击手
                "item": "Scope Lens", // 焦点镜
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 180 },
                "moves": ["Night Slash", "Cross Poison", "Fell Stinger", "Earthquake"] // 暴击流
            },
            {
                // [绝对王牌 / 羁绊对点]
                "name": "Garbodor", // 灰尘山
                "lv": 77, // 等级压制
                "gender": "F",
                "nature": "Adamant",
                "ability": "Weak Armor", // 碎裂铠甲
                "item": "Rocky Helmet", // 凸凸头
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                "moves": ["Gunk Shot", "Seed Bomb", "Drain Punch", "Stomping Tantrum"],
                
                "isAce": true,
                // [AVs 解锁状态]
                // 到了 T3，通过音乐与特训，她的 Passion 已经突破界限，达到 255
                // 由于 enable_bond = true，如果灰尘山红血，玩家（如果是玩家侧）或 AI 将尝试点击绿色 EVO 按钮
                "friendship": { "trust": 150, "passion": 255, "insight": 120, "devotion": 120 }
            }
        ]
    },
    // 【Tier 4 - 为毒而狂·最后的 Live】
    4: {
        "trainerProficiency": 210,
        // ==============================================================
        // [Tier Specific Unlocks]
        // ==============================================================
        "unlocks": {
            "enable_bond": true,         // ✅ 摇滚精神的灵魂共鸣！
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": true,      // ✅ 超极巨灰尘山 & 颤弦蝾螈的舞台
            "enable_tera": false
        },

        // ==============================================================
        // [Party Data]
        // ==============================================================
        "party": [
            // [接棒发动机 / 起点]
            {
                "name": "Scolipede", // 蜈蚣王
                "lv": 92,
                "gender": "F",
                "nature": "Jolly", 
                "ability": "Speed Boost", // 加速特性
                "item": "Focus Sash", // 气腰保证至少甚至强化一次
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 战术: 守住(加速) -> 剑舞 -> 接棒 -> 换上暴力打手
                // 或者直接 Megahorn 杀出去
                "moves": ["Protect", "Swords Dance", "Baton Pass", "Megahorn"]
            },
            // [乐队外援 / 迦勒尔摇滚代表]
            // 为了弥补毒系打击面，也为了呼应极巨化，加入同样是摇滚风的 Toxtricity
            {
                "name": "Toxtricity", // 颤弦蝾螈 (低调样子/高调样子均可)
                "lv": 90,
                "gender": "M",
                "nature": "Timid",
                "ability": "Punk Rock", // 庞克摇滚：声音类招式威力提升 (Boomburst核弹)
                "item": "Throat Spray", // 爽喉喷雾：用声音招式加特攻
                
                "mechanic": "dynamax", // 极巨化核心之一
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 唯一的特攻爆发点
                "moves": ["Overdrive", "Sludge Wave", "Boomburst", "Shift Gear"]
            },
            // [空间特盾]
            {
                "name": "Amoonguss", // 败露球菇
                "lv": 89,
                "gender": "F",
                "nature": "Sassy", // 狂妄 (+特防 -速)
                "ability": "Regenerator", // 再生力
                "item": "Black Sludge", 
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 0 }, "ev_level": 252 },
                "moves": ["Spore", "Giga Drain", "Clear Smog", "Foul Play"] // 用于清除对手的强化 (Clear Smog)
            },
            // [双刀强攻]
            {
                "name": "Seviper", // 饭匙蛇
                "lv": 88,
                "gender": "M",
                "nature": "Rash", // 马虎 (+特攻 -特防)
                "ability": "Infiltrator", // 穿透
                "item": "Life Orb", 
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Poison Jab", "Flamethrower", "Earthquake", "Sucker Punch"]
            },
            // [高速游击]
            {
                "name": "Crobat", // 叉字蝠
                "lv": 88,
                "gender": "M",
                "nature": "Jolly",
                "ability": "Infiltrator",
                "item": "Choice Band", // 专爱头带
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Brave Bird", "Cross Poison", "U-turn", "Zen Headbutt"]
            },
            // [超极巨王牌 / 灵魂歌姬 (?)]
            {
                "name": "Garbodor", // 灰尘山
                "lv": 95,
                "gender": "F", // 设定上也许是雌性比较酷？
                "nature": "Adamant",
                "ability": "Weak Armor", // 碎裂铠甲：被打防降速升。配合极巨化变大后的耐久，能在挨打中变成高速怪物。
                "item": "Rocky Helmet", // 既然要挨打，那就反伤
                
                // === 机制核心 ===
                "mechanic": "dynamax", // 锁定极巨化：变身为 G-Max Garbodor
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // G-Max Malodor (恶臭毒气): 造成伤害 + 必定中毒
                // Stomping Tantrum (泄愤): 上回合招式失败威力翻倍，极巨地加防
                // Explosion (大爆炸): 极巨化变为威力150的 Max Strike，平时是退场技
                "moves": ["Gunk Shot", "Seed Bomb", "Stomping Tantrum", "Explosion"],
                
                "isAce": true,
                // [AVs] 激情 (Passion) 极高，摇滚无需多言
                "friendship": { "trust": 100, "passion": 255, "insight": 140, "devotion": 120 }
            }
        ]
    }
};

/* 
 * 角色: 奇树 (Iono)
 * 身份: 酿光道馆馆主 / 电网直播主 / 奇树奇述主播
 * 核心机制: 太晶化 (Tera: Electric) + 漂浮战术
 */
const IONO_DATA = {
    // 【Tier 1 - 没什么人看的首播】
    // Lv.25 左右，未进化，注重节目效果而非强度
    1: {
        "trainerProficiency": 45,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false
        },
        "party": [
            {
                "name": "Wattrel", // 电海燕 (刚抓的飞行宠)
                "lv": 24,
                "gender": "F",
                "nature": "Bashful", // 害羞 (有些怯场)
                "ability": "Wind Power", 
                "stats_meta": { "ivs": { "hp": 20, "atk": 20, "def": 20, "spa": 20, "spd": 20, "spe": 20 }, "ev_level": 0 },
                "moves": ["Spark", "Peck", "Quick Attack", "Roost"]
            },
            {
                "name": "Tadbulb", // 光蚪仔 (还没进化成电灵)
                "lv": 25,
                "gender": "M",
                "nature": "Modest",
                "ability": "Static", // 静电 (因为还没完全掌握电力转换)
                "item": "Oran Berry",
                "stats_meta": { "ivs": { "hp": 25, "atk": 15, "def": 25, "spa": 25, "spd": 25, "spe": 15 }, "ev_level": 20 },
                "moves": ["Thunder Shock", "Water Gun", "Round", "Charge"]
            },
            {
                "name": "Luxio", // 勒克猫 (因为帅气所以养了)
                "lv": 25,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Intimidate", // 威吓 (唯一的亮点)
                "isAce": true, 
                "stats_meta": { "ivs": { "hp": 25, "atk": 25, "def": 25, "spa": 25, "spd": 25, "spe": 25 }, "ev_level": 30 },
                "moves": ["Spark", "Bite", "Thunder Wave", "Roar"]
            }
        ]
    },

    // 【Tier 2 - 崭露头角的电网偶像】
    // Lv.50，全员进化，开始构筑以“电力转换”为核心的受队雏形。
    2: {
        "trainerProficiency": 95,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false // 此阶段还未获得太晶珠
        },
        "party": [
            {
                "name": "Kilowattrel", // 大电海燕 (高速干扰)
                "lv": 48,
                "gender": "F",
                "nature": "Timid",
                "ability": "Volt Absorb", // 蓄电 (用来联防)
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 20, "spa": 31, "spd": 20, "spe": 31 }, "ev_level": 85 },
                "moves": ["U-turn", "Air Slash", "Electro Ball", "Roost"]
            },
            {
                "name": "Luxray", // 伦琴猫
                "lv": 49,
                "gender": "M",
                "nature": "Jolly",
                "ability": "Intimidate", // 威吓
                "item": "Sitrus Berry",
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 25, "spa": 10, "spd": 25, "spe": 31 }, "ev_level": 85 },
                "moves": ["Wild Charge", "Crunch", "Ice Fang", "Thunder Wave"]
            },
            {
                "name": "Mismagius", // 梦妖魔 (新成员入队)
                "lv": 49,
                "gender": "F",
                "nature": "Timid",
                "ability": "Levitate",
                "stats_meta": { "ivs": { "hp": 25, "atk": 0, "def": 25, "spa": 31, "spd": 25, "spe": 31 }, "ev_level": 85 },
                "moves": ["Magical Leaf", "Shadow Ball", "Mystical Fire", "Hex"]
            },
            {
                "name": "Bellibolt", // 电肚蛙 (招牌ACE)
                "lv": 52,
                "gender": "F",
                "nature": "Modest",
                "ability": "Electromorphosis", // 电力转换开启
                "item": "Magnet",
                "isAce": true,
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 120 },
                "moves": ["Discharge", "Sucker Punch", "Wait... Sucker Punch is physical", "Muddy Water", "Slack Off"] 
                // Wait... Sucker Punch (突袭) 对 Bellibolt 是个奇怪的选择，修正为 Acid Spray (酸液炸弹)
            }
        ]
    },

    // 【Tier 3 - 百万订阅企划·太晶化初披露】
    // Lv.75，解锁太晶化。
    // 战术核心：第一次向挑战者展示"没有弱点的神奇宝可梦" (Levitate + Tera Electric)。
    3: {
        "trainerProficiency": 155,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": true          // ✅ 粉丝回馈：闪闪发光的太晶化解锁！
        },
        "party": [
            {
                // [高速首发]
                "name": "Electrode-Hisui", // 顽皮雷弹(洗翠) 
                // 为了直播效果搞来的古代种，速度极快
                "lv": 75,
                "gender": "N",
                "nature": "Timid", 
                "ability": "Static",
                "item": "Focus Sash", // 气腰保底
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 180 },
                "moves": ["Volt Switch", "Energy Ball", "Taunt", "Thunder Wave"]
            },
            {
                // [控场手]
                "name": "Kilowattrel", 
                "lv": 74,
                "gender": "F",
                "nature": "Timid",
                "ability": "Wind Power", // 开始玩风电战术
                "item": "Sharp Beak", 
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 180 },
                "moves": ["Tailwind", "Thunderbolt", "Hurricane", "Roost"] // 顺风必中暴风
            },
            {
                // [物理破盾]
                "name": "Luxray",
                "lv": 74,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Guts", // 毅力 (此时还没带火珠，通常是靠蹭死状态)
                "item": "Expert Belt", // 达人带
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 180 },
                "moves": ["Wild Charge", "Psychic Fangs", "Crunch", "Play Rough"]
            },
            {
                // [超级肉盾]
                "name": "Bellibolt", 
                "lv": 76, 
                "gender": "F",
                "nature": "Modest",
                "ability": "Electromorphosis",
                "item": "Leftovers", // 剩饭开始安排上
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Parabolic Charge", "Acid Spray", "Muddy Water", "Slack Off"]
            },
            {
                // [无弱点 ACE / 太晶化首秀]
                // 鬼+梦妖魔本来弱幽灵/恶，太晶电后变成电单属性，弱地面。
                // 但因为有漂浮特性，地面无效 -> 达成【无弱点】成就。
                "name": "Mismagius", 
                "lv": 78,
                "gender": "F",
                "nature": "Timid",
                "ability": "Levitate", // 核心：飘浮
                "item": "Sitrus Berry", // 文柚果保容错
                
                // === 机制核心 ===
                "mechanic": "tera",
                "teraType": "Electric", // 太晶电
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                "isAce": true, // 直播中的绝对C位
                "friendship": { "trust": 120, "passion": 200, "insight": 100, "devotion": 100 },
                
                // 太晶电后，Shadow Ball 打面广，Charge Beam (充电光束) 会因为太晶STAB威力增加且加特攻
                "moves": ["Shadow Ball", "Dazzling Gleam", "Charge Beam", "Pain Split"] 
            }
        ]
    },
    // 【Tier 4 - 网络大爆炸·流量巅峰】
    4: {
        "trainerProficiency": 205,
        // ==============================================================
        // [Tier Specific Unlocks]
        // ==============================================================
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": true,         // ✅ 奇树的招牌：亮晶晶的太晶化！
        },

        // ==============================================================
        // [Party Data]
        // ==============================================================
        "party": [
            {
                // [控场先锋]
                "name": "Kilowattrel", // 大电海燕
                "lv": 92,
                "gender": "F",
                "nature": "Timid", // 胆小 (+速)
                "ability": "Wind Power", // 风力发电 (被风打中或开顺风后充电)
                "item": "Focus Sash",    // 气腰保顺风
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 战术：Tailwind (顺风) + Electric Terrain (如果是隐藏特性 Competitive 就反威吓)
                // 这里利用 Wind Power，顺风后下一个电磁炮必中且威力加强
                "moves": ["Tailwind", "Thunder", "Hurricane", "Volt Switch"] 
            },
            {
                // [直播吉祥物 / 顶级耐久]
                "name": "Bellibolt", // 电肚蛙
                "lv": 94,
                "gender": "F",
                "nature": "Modest", // 内敛 
                "ability": "Electromorphosis", // 电力转换：挨打充电
                "item": "Leftovers",   // 剩饭
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                "isAce": true, 
                // "谁是奇树的小可爱？当然是... Bellibolt!"
                "friendship": { "trust": 140, "passion": 255, "insight": 100, "devotion": 120 },
                
                "moves": ["Parabolic Charge", "Muddy Water", "Acid Spray", "Slack Off"] 
                // 抛物面充电 (电系吸血) 是配合特性的神技
            },
            {
                // [无弱点 ACE / 太晶化核心]
                "name": "Mismagius", // 梦妖魔
                "lv": 95,
                "gender": "F",
                "nature": "Timid", 
                "ability": "Levitate", // 飘浮：天生免疫地
                
                // === 机制核心 ===
                "mechanic": "tera",
                "teraType": "Electric", // 太晶电：只有地弱点 -> 配合飘浮 = 无弱点
                
                "item": "Wise Glasses", // 命玉或者博识眼镜
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // Tera Blast (太晶爆发) 会变成单体高强本系
                "moves": ["Tera Blast", "Shadow Ball", "Dazzling Gleam", "Mystical Fire"]
            },
            {
                // [物理爆破]
                "name": "Luxray", // 伦琴猫
                "lv": 90,
                "gender": "M",
                "nature": "Jolly",
                "ability": "Guts", // 毅力：异常状态下攻击力 x1.5
                "item": "Flame Orb", // 火焰宝珠：回合末自烧，稳定触发毅力
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Facade", "Wild Charge", "Superpower", "Play Rough"] // Facade(硬撑)威力翻倍
            },
            {
                // [双刀游击 / 天气手?]
                "name": "Electivire", // 电击魔兽
                "lv": 91,
                "gender": "M",
                "nature": "Naive", // 天真
                "ability": "Motor Drive", // 电气引擎
                "item": "Expert Belt", // 达人带
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Plasma Fists", "Ice Punch", "Earthquake", "Flamethrower"]
            },
            {
                // [未来悖谬 / 压轴嘉宾]
                "name": "Iron Hands", // 铁臂膀
                "lv": 90,
                "gender": "N",
                "nature": "Adamant", // 固执
                // Quark Drive 需要夸克充能 (电场或驱劲能量)
                "ability": "Quark Drive",
                "item": "Booster Energy", // 驱劲能量：上场自动触发特性 (物攻+30%)
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Drain Punch", "Thunder Punch", "Heavy Slam", "Fake Out"] // 下马威控场
            }
        ]
    }
};


/* 
 * 角色: 莉佳 (Erika)
 * 身份: 玉虹市道馆馆主 / 自负的自然爱好者
 * 核心机制: Mega进化 +心眼 (Insight) — 在花香中迷失方向吧。
 */
const ERIKA_DATA = {
    // 【Tier 1 - 茶室里的插花课】
    // Lv.25，未进化，撒粉干扰为主的初级课程。
    1: {
        "trainerProficiency": 55,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false, // T1 还是睁着眼睛打的
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false
        },
        "party": [
            {
                "name": "Oddish", // 走路草
                "lv": 24,
                "gender": "F",
                "nature": "Calm",
                "ability": "Chlorophyll",
                "stats_meta": { "ivs": { "hp": 15, "atk": 15, "def": 15, "spa": 15, "spd": 15, "spe": 15 }, "ev_level": 0 },
                "moves": ["Absorb", "Acid", "Sleep Powder", "Mega Drain"]
            },
            {
                "name": "Bellsprout", // 喇叭芽
                "lv": 24,
                "gender": "F",
                "nature": "Modest",
                "ability": "Chlorophyll",
                "stats_meta": { "ivs": { "hp": 20, "atk": 20, "def": 20, "spa": 20, "spd": 20, "spe": 20 }, "ev_level": 0 },
                "moves": ["Vine Whip", "Growth", "Wrap", "Poison Powder"]
            },
            {
                "name": "Tangela", // 蔓藤怪
                "lv": 25, // Ace
                "gender": "F",
                "nature": "Bold",
                "ability": "Regenerator", // 再生力
                "isAce": true,
                "stats_meta": { "ivs": { "hp": 25, "atk": 25, "def": 25, "spa": 25, "spd": 25, "spe": 25 }, "ev_level": 10 },
                "moves": ["Mega Drain", "Bind", "Stun Spore", "Leech Seed"]
            }
        ]
    },

    // 【Tier 2 - 盛开的御苑】
    // Lv.50，进化型，晴天轴初步启动。
    2: {
        "trainerProficiency": 105,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false, // T2 还没进入冥想状态
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false
        },
        "party": [
            {
                "name": "Jumpluff", // 毽子棉 (高速干扰首发)
                "lv": 48,
                "gender": "F",
                "nature": "Jolly",
                "ability": "Chlorophyll",
                "stats_meta": { "ivs": { "hp": 31, "atk": 20, "def": 20, "spa": 10, "spd": 20, "spe": 31 }, "ev_level": 85 },
                "moves": ["Sleep Powder", "U-turn", "Acrobatics", "Leech Seed"]
            },
            {
                "name": "Vileplume", // 霸王花 (晴天手)
                "lv": 49,
                "gender": "F",
                "nature": "Modest",
                "ability": "Chlorophyll",
                "item": "Heat Rock", // 晴天岩石
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 25, "spa": 31, "spd": 25, "spe": 31 }, "ev_level": 85 },
                "moves": ["Solar Beam", "Sludge Bomb", "Moonlight", "Sunny Day"]
            },
            {
                "name": "Tangrowth", // 巨蔓藤
                "lv": 49,
                "gender": "F",
                "nature": "Relaxed",
                "ability": "Regenerator", // 轮转回复
                "item": "Leftovers",
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 20 }, "ev_level": 85 },
                "moves": ["Giga Drain", "Knock Off", "Earthquake", "Ancient Power"] // 打击面覆盖火/飞
            },
            {
                "name": "Venusaur", // 妙蛙花 (普通Ace)
                "lv": 50,
                "gender": "F",
                "nature": "Modest",
                "ability": "Chlorophyll",
                "item": "Miracle Seed",
                "isAce": true,
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 120 },
                "moves": ["Giga Drain", "Sludge Bomb", "Earth Power", "Growth"]
            }
        ]
    },

    // 【Tier 3 - 沉醉的花粉香】
    // Lv.70，全员恶人，催眠粉/蝶舞强化，Mega进化解禁（T3）。
    3: {
        "trainerProficiency": 165,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false, // 依旧未开启心眼
            "enable_mega": true,     // ✅ T3 解锁 Mega，作为过渡
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false
        },
        "party": [
            {
                "name": "Victreebel", // 大食花 (双刀破盾)
                "lv": 73,
                "gender": "F",
                "nature": "Naughty", // 顽皮 (+攻 -特防)
                "ability": "Chlorophyll",
                "item": "Life Orb",
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 180 },
                "moves": ["Leaf Blade", "Sludge Bomb", "Sucker Punch", "Weather Ball"]
            },
            {
                "name": "Bellossom", // 美丽花 (强化点/接棒终点)
                "lv": 74,
                "gender": "F",
                "nature": "Modest",
                "ability": "Chlorophyll",
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 180 },
                "moves": ["Quiver Dance", "Giga Drain", "Moonblast", "Strength Sap"]
            },
            {
                "name": "Tangrowth", 
                "lv": 74,
                "gender": "F",
                "nature": "Sassy",
                "ability": "Regenerator",
                "item": "Assault Vest", // 突击背心
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 }, "ev_level": 180 },
                "moves": ["Power Whip", "Knock Off", "Earthquake", "Sludge Bomb"]
            },
            // Venusaur 这里是 Mega 位
            {
                "name": "Venusaur", 
                "lv": 76,
                "gender": "F",
                "nature": "Modest",
                "ability": "Chlorophyll", // 没变之前是叶绿素
                "item": "Venusaurite",
                "mechanic": "mega",
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 180 },
                "moves": ["Giga Drain", "Sludge Bomb", "Target", "Synthesis"] // Target换成具体伤害技
            },
            {
                "name": "Vileplume",
                "lv": 72,
                "gender": "F",
                "nature": "Bold",
                "ability": "Effect Spore",
                "item": "Black Sludge",
                "isAce": true,
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 10, "spd": 31, "spe": 31 }, "ev_level": 180 },
                "moves": ["Giga Drain", "Sludge Bomb", "Strength Sap", "Sleep Powder"]
            }
        ]
    },

    // 【Tier 4 - 永恒的梦境与腐殖土 · 心眼全开】
    // Lv.85+，顶级恶心配置。Mega 妙蛙花 + 再生力巨蔓藤。
    // 核心特色：开启 enable_insight。
    4: {
        "trainerProficiency": 215,
        // ==============================================================
        // [Tier Specific Unlocks]
        // ==============================================================
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": true,      // ✅ 核心：花道的心眼，闪避率提升！
            "enable_mega": true,         // ✅ 保留 Mega
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false
        },

        // ==============================================================
        // [Party Data]
        // ==============================================================
        "party": [
            {
                // [晴天启动机 / 睡杀先锋]
                "name": "Jumpluff", // 毽子棉
                "lv": 88,
                "gender": "F",
                "nature": "Jolly", 
                "ability": "Infiltrator", // 穿透替身，防止对面想用替身挡催眠
                "item": "Focus Sash", // 气腰，保证至少能撒一次粉或开一次天气
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 战术: 开启 Sunny Day 激活队友叶绿素，或者 Sleep Powder 逼换
                "moves": ["Sleep Powder", "Strength Sap", "U-turn", "Sunny Day"]
            },
            {
                // [绝对堡垒 / Mega 王牌]
                "name": "Venusaur", // 进化后名字变成 Venusaur-Mega
                "lv": 90,
                "gender": "F",
                "nature": "Bold", // 大胆（耐久向）
                "ability": "Chlorophyll", // Mega 后变成 Thick Fat (厚脂肪)，减半火/冰两大弱点
                "item": "Venusaurite",
                "mechanic": "mega",
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 技能配置: 纯消耗，打不动
                "moves": ["Giga Drain", "Sludge Bomb", "Synthesis", "Leech Seed"],
                
                "isAce": true, 
                // [AVs Limit Break]
                // 开启 Insight (>200) 后，配合厚脂肪，简直就是不死的存在
                // 敌方的命中率修正为 战术上的下降
                "friendship": { "trust": 160, "passion": 100, "insight": 255, "devotion": 120 }
            },
            {
                // [物理铜墙]
                "name": "Tangrowth", 
                "lv": 89,
                "gender": "F",
                "nature": "Relaxed", 
                "ability": "Regenerator", // 强大的中转
                "item": "Rocky Helmet", // 凸凸头盔
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 0 }, "ev_level": 252 },
                
                // 拥有觉醒火(这里用Incinerate/HP Fire逻辑)用于打钢
                // 如果没有觉火可以用 Earthquake
                "moves": ["Giga Drain", "Knock Off", "Earthquake", "Sleep Powder"] 
            },
            {
                // [双刀游击]
                "name": "Victreebel", 
                "lv": 88,
                "gender": "F",
                "nature": "Naughty", 
                "ability": "Chlorophyll", 
                "item": "Life Orb",
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 天气球 (Weather Ball) 在晴天下变 100 威力火系招式 >> 很好的补盲
                "moves": ["Leaf Blade", "Sludge Bomb", "Weather Ball", "Sucker Punch"]
            },
            {
                // [特殊强化推队]
                "name": "Bellossom", 
                "lv": 88,
                "gender": "F",
                "nature": "Modest", 
                "ability": "Chlorophyll", 
                "item": "Leftovers", // 或者 Kee Berry
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 蝶舞强化 + 月亮之力补盲
                "moves": ["Quiver Dance", "Moonblast", "Energy Ball", "Safeguard"] 
            },
            {
                // [猛毒控场]
                "name": "Vileplume", 
                "lv": 88,
                "gender": "F",
                "nature": "Calm", // +特防
                "ability": "Effect Spore", // 上异常状态的神技
                "item": "Black Sludge",
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 猛毒/吸取力量
                "moves": ["Strength Sap", "Moonblast", "Sludge Bomb", "Aromatherapy"] 
            }
        ]
    }
};

/* 
 * 馆主: 露璃娜 (Nessa)
 * 属性: 水 (Water)
 * 风格: 激流超模 / 雨天猛攻
 * 难度曲线: T1 (业余) -> T4 (超模/极诣)
 */
const NESSA_DATA = {
    // 【Tier 1 - 泳池水枪战】
    // Lv.25，可爱风格，用来教属性相克
    1: {
        "trainerProficiency": 50,
        "unlocks": { 
            "enable_bond": false, "enable_styles": false, "enable_insight": false, "enable_mega": false, "enable_z_move": false,
            "enable_dynamax": false, "enable_tera": false 
        },
        "party": [
            {
                "name": "Goldeen", // 角金鱼
                "lv": 24, "gender": "F", "nature": "Naughty",
                "ability": "Water Veil", 
                "stats_meta": { "ivs": { "hp":15,"atk":15,"def":15,"spa":15,"spd":15,"spe":15 }, "ev_level": 5 },
                "moves": ["Water Pulse", "Horn Attack", "Supersonic", "Rain Dance"]
            },
            {
                "name": "Arrokuda", // 刺梭鱼
                "lv": 25, "gender": "M", "nature": "Hasty",
                "ability": "Swift Swim", 
                "stats_meta": { "ivs": { "hp":20,"atk":20,"def":20,"spa":20,"spd":20,"spe":20 }, "ev_level": 5 },
                "moves": ["Aqua Jet", "Bite", "Fury Attack", "Laser Focus"]
            },
            {
                "name": "Chewtle", // 咬咬龟 (Ace)
                "lv": 26, "gender": "M", "nature": "Adamant",
                "ability": "Strong Jaw", 
                "isAce": true,
                "stats_meta": { "ivs": { "hp":25,"atk":25,"def":25,"spa":25,"spd":25,"spe":25 }, "ev_level": 30 },
                "moves": ["Water Gun", "Bite", "Headbutt", "Protect"]
            }
        ]
    },

    // 【Tier 2 - 时尚大片拍摄现场】
    // Lv.50，雨天初现，暴噬龟进化，速度开始提起来了
    2: {
        "trainerProficiency": 100,
        "unlocks": { 
            "enable_bond": false, "enable_styles": false, "enable_insight": false, "enable_mega": false, "enable_z_move": false,
            "enable_dynamax": true, // T2 初次解锁极巨(道馆战强度)
            "enable_tera": false 
        },
        "party": [
            {
                "name": "Pelipper", // 大嘴鸥 (降雨起点)
                "lv": 48, "gender": "M", "nature": "Modest",
                "ability": "Drizzle", // 降雨!
                "stats_meta": { "ivs": { "hp":31,"atk":0,"def":25,"spa":31,"spd":25,"spe":31 }, "ev_level": 85 },
                "moves": ["Scald", "Hurricane", "Water Pulse", "Roost"]
            },
            {
                "name": "Barraskewda", // 斗尖梭 (雨天子弹)
                "lv": 49, "gender": "F", "nature": "Adamant",
                "ability": "Swift Swim",
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":20,"spa":10,"spd":20,"spe":31 }, "ev_level": 120 },
                "moves": ["Liquidation", "Aqua Jet", "Bite", "Flip Turn"]
            },
            {
                "name": "Araquanid", // 滴蛛霸
                "lv": 49, "gender": "F", "nature": "Adamant",
                "ability": "Water Bubble",
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":25,"spa":10,"spd":25,"spe":20 }, "ev_level": 85 },
                "moves": ["Liquidation", "Bug Bite", "Crunch", "Mirror Coat"]
            },
            {
                "name": "Drednaw", // 暴噬龟 (GMAX 可能)
                "lv": 52, "gender": "M", "nature": "Adamant",
                "ability": "Strong Jaw",
                "mechanic": "dynamax", // 极巨化核心
                "item": "Hard Stone", 
                "isAce": true, 
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31 }, "ev_level": 180 },
                "moves": ["Razor Shell", "Rock Tomb", "Jaw Lock", "Crunch"]
            }
        ]
    },

    // 【Tier 3 - 海洋广告代言】
    // Lv.75，完备雨天队，也是对战塔水准
    3: {
        "trainerProficiency": 160,
        "unlocks": { false:false, "enable_dynamax":true }, // 省略写法
        "party": [
            {
                "name": "Pelipper",
                "lv": 75, "gender": "F", "nature": "Modest",
                "ability": "Drizzle",
                "item": "Damp Rock", // 8回合雨天
                "stats_meta": { "ivs": { "hp":31,"atk":0,"def":31,"spa":31,"spd":31,"spe":31 }, "ev_level": 180 },
                "moves": ["Hurricane", "Hydro Pump", "U-turn", "Roost"]
            },
            {
                "name": "Ludicolo", // 乐天河童 (新面孔，雨天特攻手)
                "lv": 74, "gender": "M", "nature": "Modest",
                "ability": "Swift Swim", 
                "item": "Life Orb", 
                "stats_meta": { "ivs": { "hp":31,"atk":0,"def":31,"spa":31,"spd":31,"spe":31 }, "ev_level": 252 },
                "moves": ["Hydro Pump", "Giga Drain", "Ice Beam", "Rain Dance"]
            },
            {
                "name": "Golisopod", // 具甲武者
                "lv": 76, "gender": "M", "nature": "Adamant",
                "ability": "Emergency Exit",
                "item": "Sitrus Berry", 
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31 }, "ev_level": 180 },
                "moves": ["First Impression", "Liquidation", "Aqua Jet", "Sucker Punch"]
            },
            {
                "name": "Drednaw", 
                "lv": 78, "gender": "M", "nature": "Adamant",
                "mechanic": "dynamax", // G-Max
                "ability": "Swift Swim", // 雨天加速+GMAX
                "item": "White Herb", 
                "isAce": true,
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31 }, "ev_level": 252 },
                "moves": ["Liquidation", "Stone Edge", "Superpower", "Swords Dance"]
            },
            { /* 5th - Seaking/Lanturn 可放这里 */ 
                "name": "Toxapex",
                "lv": 73, "gender": "F", "nature": "Bold", "ability": "Regenerator", "item": "Black Sludge",
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 200 },
                "moves": ["Scald", "Recover", "Haze", "Toxic"]
            }
        ]
    },

    // 【Tier 4 - 惊涛骸浪·冠军杯全开】
    // Lv.85+，顶级控速强攻受，极巨化全开
    4: {
        "trainerProficiency": 210,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": true,      // ✅ 露璃娜的T台！
            "enable_tera": false
        },
        "party": [
            {
                // [控场手 / 雨天核心]
                "name": "Pelipper",
                "lv": 88,
                "gender": "F",
                "nature": "Bold", // 转为物防，毕竟岩崩多
                "ability": "Drizzle",
                "item": "Damp Rock",
                "stats_meta": { "ivs": { "hp":31,"atk":0,"def":31,"spa":31,"spd":31,"spe":31 }, "ev_level": 252 },
                "moves": ["Scald", "Hurricane", "U-turn", "Roost"] // 后手U-turn让出安全上场位
            },
            {
                // [雨天刺客]
                "name": "Barraskewda", 
                "lv": 89,
                "gender": "M",
                "nature": "Adamant", // 在雨旗下速度已足够，固执修威力
                "ability": "Swift Swim", 
                "item": "Choice Band", // 专爱头带：确一力度
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31 }, "ev_level": 252 },
                "moves": ["Liquidation", "Close Combat", "Psychic Fangs", "Flip Turn"]
            },
            {
                // [首发/反先制]
                "name": "Golisopod",
                "lv": 88,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Emergency Exit",
                "item": "Assault Vest", // 突击背心
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31 }, "ev_level": 252 },
                "moves": ["First Impression", "Aqua Jet", "Leech Life", "Close Combat"]
            },
            {
                // [超极巨王牌 / 控场]
                // 只有小优和她能完美利用极巨化
                "name": "Drednaw", 
                "lv": 90,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Swift Swim", // 如果场面有雨，极巨暴噬龟将快过所有人
                
                "mechanic": "dynamax", // G-Max Stonesurge
                "item": "Life Orb", 
                
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31 }, "ev_level": 252 },
                "moves": ["Liquidation", "Stone Edge", "Superpower", "Ice Fang"],
                // G-Max Stonesurge: 攻击同时撒下 "隐形岩" 并且是水系大招，配合雨天伤害加倍
                
                "isAce": true, 
                "friendship": { "trust": 140, "passion": 180, "insight": 100, "devotion": 120 }
            },
            {
                // [功能性联防]
                "name": "Seaking", // 金鱼王
                "lv": 85,
                "gender": "F",
                "nature": "Careful", 
                "ability": "Lightning Rod", // 避雷针：完美联防雨天队的电系弱点
                "item": "Leftovers", 
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31 }, "ev_level": 252 },
                "moves": ["Waterfall", "Knock Off", "Drill Run", "Horn Drill"] // 角钻 (Horn Drill) 是最后的惊喜
            },
            {
                // [最后一道防线]
                "name": "Toxapex",
                "lv": 86,
                "gender": "F",
                "nature": "Bold",
                "ability": "Regenerator", 
                "item": "Black Sludge", 
                "stats_meta": { "ivs": { "hp":31,"atk":0,"def":31,"spa":31,"spd":31,"spe":0 }, "ev_level": 252 },
                "moves": ["Scald", "Recover", "Haze", "Toxic Spikes"] // 剧毒钉折磨
            }
        ]
    }
};


/* 
 * 馆主: 玛俐 (Marnie)
 * 属性: 恶 (Dark)
 * 风格: 酷妹偶像 / 恶作剧开墙 + 极巨爆发
 */
const MARNIE_DATA = {
        // 【Tier 1 - 旷野地带初遭遇】
    // Lv.24-26，刚获得莫鲁贝不久，配招和努力值都很基础
    1: {
        "trainerProficiency": 55,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false
        },
        "party": [
            {
                "name": "Croagunk", // 不良蛙
                "lv": 24,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Dry Skin", // 干燥皮肤 (防一手水系技能)
                "stats_meta": { "ivs": { "hp": 20, "atk": 20, "def": 20, "spa": 20, "spd": 20, "spe": 20 }, "ev_level": 20 },
                "moves": ["Poison Sting", "Revenge", "Sucker Punch", "Venoshock"]
            },
            {
                "name": "Scraggy", // 滑滑小子
                "lv": 24,
                "gender": "M",
                "nature": "Impish",
                "ability": "Shed Skin",
                "item": "Eviolite", // 既然是富家大小姐，这种道具还是拿得到的
                "stats_meta": { "ivs": { "hp": 25, "atk": 25, "def": 25, "spa": 25, "spd": 25, "spe": 25 }, "ev_level": 40 },
                "moves": ["Headbutt", "Brick Break", "Payback", "Work Up"]
            },
            {
                // [招牌]
                "name": "Morpeko", // 莫鲁贝可
                "lv": 26,
                "gender": "F",
                "nature": "Jolly",
                "ability": "Hunger Switch", // 即使低等级，气场轮的威力也不容小觑
                "item": "Oran Berry",
                "isAce": true,
                "stats_meta": { "ivs": { "hp": 25, "atk": 25, "def": 25, "spa": 25, "spd": 25, "spe": 25 }, "ev_level": 50 },
                "moves": ["Aura Wheel", "Bite", "Quick Attack", "Protect"] // 利用 Protect 让饱腹感/空腹感切换
            }
        ]
    },
    // 【Tier 2 - 尖钉镇的试练】
    // Lv.48-52，队伍除了Grimmsnarl还未进化完全，其他已经基本成型
    2: {
        "trainerProficiency": 105,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false, // T2 的场地通常是在地下街道，无法极巨化
            "enable_tera": false
        },
        "party": [
            {
                "name": "Liepard", // 酷豹
                "lv": 48,
                "gender": "F",
                "nature": "Jolly",
                "ability": "Prankster", // 恶作剧之心开始恶心人
                "stats_meta": { "ivs": { "hp": 31, "atk": 25, "def": 25, "spa": 10, "spd": 25, "spe": 31 }, "ev_level": 120 },
                "moves": ["Fake Out", "Torment", "Sucker Punch", "U-turn"] // Torment 折磨
            },
            {
                "name": "Toxicroak", // 毒骷蛙
                "lv": 49,
                "gender": "M",
                "nature": "Jolly",
                "stats_meta": { "ivs": { "hp": 25, "atk": 31, "def": 25, "spa": 25, "spd": 25, "spe": 31 }, "ev_level": 85 },
                "moves": ["Poison Jab", "Drain Punch", "Sucker Punch", "Venoshock"]
            },
            {
                "name": "Scrafty", // 头巾混混
                "lv": 49,
                "gender": "M",
                "nature": "Careful",
                "ability": "Intimidate", // 威吓耐久流
                "item": "Sitrus Berry",
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 20, "spd": 31, "spe": 20 }, "ev_level": 120 },
                "moves": ["Brick Break", "Crunch", "Ice Punch", "Headbutt"]
            },
            {
                "name": "Morpeko",
                "lv": 51,
                "gender": "F",
                "nature": "Jolly",
                "item": "Silk Scarf", // 丝绸围铿 加强普通系招式（如果带电光一闪）或者磁铁
                "isAce": true,
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 180 },
                // 气场轮变成 110 威力，这个阶段很痛
                "moves": ["Aura Wheel", "Crunch", "Seed Bomb", "Quick Attack"]
            }
        ]
    },
    // 【Tier 3 - 冠军杯准决赛 · 极巨首秀】
    // Lv.75，解锁 `enable_dynamax`，这是她在这一代最经典的配置。
    3: {
        "trainerProficiency": 165,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": true,      // ✅ 冠军杯：在这里不留遗憾！
            "enable_tera": false
        },
        "party": [
            {
                "name": "Liepard",
                "lv": 73,
                "gender": "F",
                "nature": "Jolly",
                "ability": "Prankster",
                "item": "Light Clay", // 光之黏土 -> 这里也许不合适，因为它不开墙
                "item": "Focus Sash", // 确保能恶心到人
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 击掌奇袭 + 挑衅 + 假哭 + 咬碎
                "moves": ["Fake Out", "Taunt", "Sucker Punch", "Play Rough"]
            },
            {
                "name": "Toxicroak",
                "lv": 74,
                "gender": "M",
                "nature": "Jolly",
                "ability": "Dry Skin",
                "item": "Black Sludge", 
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 180 },
                "moves": ["Sludge Bomb", "Drain Punch", "Nasty Plot", "Vacuum Wave"] // 阴险的特攻毒骷蛙？或者双刀
            },
            {
                "name": "Scrafty",
                "lv": 74,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Moxie", // 自信过剩：如果给它收割了残血，后果很严重
                "item": "Assault Vest",
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 20, "spd": 31, "spe": 31 }, "ev_level": 180 },
                "moves": ["Close Combat", "Crunch", "Ice Punch", "Poison Jab"]
            },
            {
                "name": "Morpeko",
                "lv": 75,
                "gender": "F",
                "nature": "Jolly",
                "item": "Choice Band", // 专爱头带：纯粹的速度与威力
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 200 },
                "moves": ["Aura Wheel", "Psychic Fangs", "Seed Bomb", "Parting Shot"]
            },
            {
                // [真正的 Ace / G-Max核心]
                "name": "Grimmsnarl",  
                "lv": 76,
                "gender": "M",
                "nature": "Impish",
                "ability": "Prankster",
                "item": "Leftovers", // 剩饭
                
                // === 机制核心 ===
                "mechanic": "dynamax", // G-Max
                
                "isAce": true,
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 20, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // Spirit Break (灵魂冲击) 降特攻 + Confide (密语) 进一步削弱
                // 变身后 G-Max Snooze 控场
                "moves": ["Spirit Break", "Darkest Lariat", "Bulk Up", "Play Rough"]
            }
        ]
    },
    // 【Tier 4 - 为了尖钉镇，赌上一切的安可】
    4: {
        "trainerProficiency": 220,
        // ==============================================================
        // [Tier Specific Unlocks]
        // ==============================================================
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": true,      // ✅ 尖钉镇的骄傲，超极巨化！
            "enable_tera": false
        },

        // ==============================================================
        // [Party Data]
        // ==============================================================
        "party": [
            {
                // [开墙先锋 / G-Max 领衔]
                "name": "Grimmsnarl",  
                "lv": 95,
                "gender": "M",
                "nature": "Adamant", // 固执
                // 虽然恶作剧之心开墙很经典，但如果要打极巨化输出，这种配置更凶
                "ability": "Prankster", 
                "item": "Leftovers",   // 剩饭续航
                
                // === 机制核心 ===
                "mechanic": "dynamax", // 超极巨长毛巨魔
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // G-Max Snooze (打瞌睡)：伤害+50%几率让对手睡着。
                // 没变身前 Spirit Break(灵魂冲击) 降特攻，Thunder Wave 控速
                "moves": ["Spirit Break", "Darkest Lariat", "Thunder Wave", "Bulk Up"],
                
                "isAce": true,
                "friendship": { "trust": 180, "passion": 200, "insight": 140, "devotion": 120 }
            },
            {
                // [可爱又迷人的反派角色]
                "name": "Morpeko", 
                "lv": 92,
                "gender": "F",
                "nature": "Jolly", // 爽朗 (极速)
                "ability": "Hunger Switch", // 饿了么
                "item": "Focus Sash", // 气腰 (作为脆皮的保险)
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // Aura Wheel (气场轮): 威力110，速度+1，还会变属性。神技。
                "moves": ["Aura Wheel", "Psychic Fangs", "Seed Bomb", "Protect"]
            },
            {
                // [硬汉拦路]
                "name": "Obstagoon", // 堵拦熊
                "lv": 90,
                "gender": "M",
                "nature": "Jolly",
                "ability": "Guts", // 毅力：典型的火珠流
                "item": "Flame Orb", 
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // Facade(硬撑) 威力翻倍 + STAB；Obstruct(拦堵) 安全火珠触发 + 降对手防御
                "moves": ["Facade", "Knock Off", "Obstruct", "Close Combat"]
            },
            {
                // [龙舞推手]
                "name": "Scrafty", // 头巾混混
                "lv": 90,
                "gender": "M",
                "nature": "Careful", // 慎重
                "ability": "Shed Skin", // 蜕皮：配合睡觉
                "item": "Chesto Berry", // 睡醒果
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 龙舞强化后，吸取拳续航
                "moves": ["Dragon Dance", "Drain Punch", "Crunch", "Rest"]
            },
            {
                // [雨天与毒的克星]
                "name": "Toxicroak", // 毒骷蛙
                "lv": 88,
                "gender": "M",
                "nature": "Jolly",
                "ability": "Dry Skin", // 干燥皮肤：完全免疫水系，还回血
                "item": "Life Orb", 
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Gunk Shot", "Drain Punch", "Sucker Punch", "Swords Dance"]
            },
            {
                // [恶作剧干扰]
                "name": "Liepard", // 酷豹
                "lv": 88,
                "gender": "F",
                "nature": "Jolly",
                "ability": "Prankster", 
                "item": "Eject Button", // 逃脱按键 (配合恶作剧先手) 或者 Lagging Tailx戏法
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // Copycat (仿效) + Encore (再来一次) 很脏
                "moves": ["Encore", "Thunder Wave", "Foul Play", "U-turn"]
            }
        ]
    }
};
/* 
 * 角色: 灵异迷 (Hex Maniac / Alice?)
 * 身份: 徘徊于各地的对战发烧友 / 诅咒载体
 * 核心机制: Mega 进化 + 极致 Insight (直感诅咒)
 */
const HEX_DATA = {
        // 【Tier 1 - 古宅里的恶作剧】
    // Lv.24-26，未进化，单纯的幽灵系干扰
    1: {
        "trainerProficiency": 45,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false
        },
        "party": [
            {
                "name": "Duskull", // 夜巡灵
                "lv": 24,
                "gender": "F",
                "nature": "Sassy", // 狂妄 (+特防)
                "ability": "Levitate",
                "stats_meta": { "ivs": { "hp": 20, "atk": 15, "def": 25, "spa": 15, "spd": 25, "spe": 10 }, "ev_level": 10 },
                "moves": ["Night Shade", "Disable", "Will-O-Wisp", "Shadow Sneak"] // 经典的定身法+鬼火
            },
            {
                "name": "Litwick", // 烛光灵
                "lv": 24,
                "gender": "F",
                "nature": "Modest",
                "ability": "Flash Fire", // 引火
                "stats_meta": { "ivs": { "hp": 20, "atk": 15, "def": 15, "spa": 25, "spd": 15, "spe": 20 }, "ev_level": 20 },
                "moves": ["Ember", "Hex", "Minimize", "Smog"] // 变小恶心人
            },
            {
                "name": "Shuppet", // 怨影娃娃 (娃娃控)
                "lv": 26,
                "gender": "F",
                "nature": "Adamant", // 固执
                "ability": "Insomnia",
                "isAce": true, 
                "item": "Spell Tag", // 诅咒之符
                "stats_meta": { "ivs": { "hp": 25, "atk": 25, "def": 20, "spa": 15, "spd": 20, "spe": 25 }, "ev_level": 40 },
                "moves": ["Shadow Sneak", "Knock Off", "Curse", "Screech"] // 先制技收割
            }
        ]
    },
    // 【Tier 2 - 墓园的守望者】
    // Lv.48-52，进化奇石体系成型，难以突破的耐久
    2: {
        "trainerProficiency": 95,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false, // 这个阶段还没有拿到 Key Stone
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false
        },
        "party": [
            {
                "name": "Dusclops", // 彷徨夜灵
                "lv": 49,
                "gender": "F",
                "nature": "Relaxed", // 悠闲
                "ability": "Pressure",
                "item": "Eviolite", // 辉石出现，硬度质变
                "stats_meta": { "ivs": { "hp": 31, "atk": 25, "def": 31, "spa": 20, "spd": 31, "spe": 0 }, "ev_level": 120 },
                // 空间开局 -> 诅咒 -> 痛平分
                "moves": ["Trick Room", "Curse", "Pain Split", "Ice Punch"]
            },
            {
                "name": "Lampent", // 灯火幽灵
                "lv": 48,
                "gender": "F",
                "nature": "Modest",
                "ability": "Flame Body", // 没什么物防，靠火焰躯体碰瓷
                "stats_meta": { "ivs": { "hp": 25, "atk": 0, "def": 25, "spa": 31, "spd": 25, "spe": 31 }, "ev_level": 85 },
                "moves": ["Shadow Ball", "Flamethrower", "Confuse Ray", "Energy Ball"]
            },
            {
                "name": "Doublade", // 双剑鞘 (另一位物防大神)
                "lv": 48,
                "gender": "F",
                "nature": "Brave",
                "ability": "No Guard", // 无防守
                "item": "Eviolite", // 如果规则允许双辉石(同人规则)最好，不然带气势披带
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 25, "spe": 0 }, "ev_level": 85 },
                "moves": ["Swords Dance", "Shadow Sneak", "Sacred Sword", "Gyro Ball"] // 配合空间打输出
            },
            {
                "name": "Banette", // 诅咒娃娃 (转为强攻)
                "lv": 51,
                "gender": "F",
                "nature": "Adamant",
                "ability": "Frisk", // 察觉
                "item": "Colbur Berry", // 杭斑果 (抗恶)
                "isAce": true,
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 25, "spa": 10, "spd": 25, "spe": 31 }, "ev_level": 180 },
                "moves": ["Phantom Force", "Sucker Punch", "Will-O-Wisp", "Destiny Bond"]
            }
        ]
    },
    // 【Tier 3 - 不该被打开的封印 · Mega 降临】
    // Lv.70+，解锁 Mega。
    // 特点：王牌虽然换成了 Mega 诅咒娃娃，但这玩意的 "恶作剧之心 + 同命" 可能是游戏里最脏的 Combo 之一。
    3: {
        "trainerProficiency": 155,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": true,         // ✅ 核心：Mega 诅咒娃娃登场
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false
        },
        "party": [
            {
                // [不死的空间手]
                "name": "Dusclops", 
                "lv": 74,
                "gender": "F",
                "nature": "Sassy", // 狂妄
                "ability": "Pressure",
                "item": "Eviolite", 
                "stats_meta": { "ivs": { "hp": 31, "atk": 25, "def": 31, "spa": 25, "spd": 31, "spe": 0 }, "ev_level": 252 },
                "moves": ["Night Shade", "Will-O-Wisp", "Trick Room", "Memento"] // 开完空间临别礼物退场，甚至不加敌方击杀数
            },
            {
                // [重炮手]
                "name": "Chandelure", // 水晶灯火灵
                "lv": 75,
                "gender": "F",
                "nature": "Modest",
                "ability": "Infiltrator", // 穿透
                "item": "Choice Specs", // 讲究眼镜火抗极高
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Overheat", "Shadow Ball", "Energy Ball", "Trick"]
            },
            {
                // [物理防御组]
                "name": "Cofagrigus", // 只有合众/伽勒尔的 迭失棺
                "lv": 72,
                "gender": "M",
                "nature": "Bold", 
                "ability": "Mummy", // 木乃伊 (接触这只怪会让对方特性失效，专门克制物理手)
                "item": "Leftovers",
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 200 },
                "moves": ["Hex", "Toxic Spikes", "Protect", "Body Press"] 
            },
            {
                // [超能爆破 / 控速]
                "name": "Gothitelle", // 哥德小姐
                "lv": 73,
                "gender": "F",
                "nature": "Calm",
                "ability": "Competitive", // 蹭威吓可以加特攻
                "item": "Sitrus Berry", 
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 200 },
                "moves": ["Psychic", "Thunder Wave", "Fake Out", "Heal Pulse"]
            },
            {
                // [怨念的化身 / Prankster Ace]
                "name": "Banette", 
                "lv": 78,
                "gender": "F",
                "nature": "Adamant", // 固执 (+攻 -特)
                "ability": "Frisk", // 进化前看道具
                
                // === 机制核心 ===
                "mechanic": "mega",     // 锁定：Mega 诅咒娃娃
                "item": "Banettite", 
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                "isAce": true,
                "friendship": { "trust": 100, "passion": 80, "insight": 220, "devotion": 120 }, // 她的玩偶
                
                // 战术核心: Prankster (进化后恶作剧之心) 带来的先制 
                // Destiny Bond (同命) 先手施放：我不死你死，我还手你就死
                // Gunk Shot 打妖精
                "moves": ["Destiny Bond", "Gunk Shot", "Phantom Force", "Knock Off"]
            }
        ]
    },
    // 【Tier 4 - 欢迎来到我的灵界】
    4: {
        "trainerProficiency": 210,
        // ==============================================================
        // [Tier Specific Unlocks]
        // ==============================================================
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": true,      // ✅ 灵媒的第六感全开！
            "enable_mega": true,         // ✅ 她的 Mega 石来自墓地...
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false
        },

        // ==============================================================
        // [Party Data]
        // ==============================================================
        "party": [
            {
                // [绝对核心 / 魔法镜要塞]
                "name": "Sableye", // 勾魂眼
                // 虽然她是 Mega 核心，但上场时是普通状态，通过 mechanic:'mega' 触发变身
                "lv": 90,
                "gender": "F",
                "nature": "Bold", // 大胆（极限物耐）
                "ability": "Prankster", // 进化前恶作剧之心：先手鬼火/冥想
                // 进化后 Magic Bounce：反弹一切变化技
                
                // === 机制核心 ===
                "item": "Sablenite",    // 勾魂眼进化石
                "mechanic": "mega",     // 锁定：本场 Mega 手
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 常见的恶心人配置: 冥想强化，自我再生续航。
                // 攻击主要靠其实不低的暗影球或者欺诈 (Foul Play)。
                "moves": ["Calm Mind", "Recover", "Will-O-Wisp", "Shadow Ball"],
                
                "isAce": true, 
                // 顶级的 Insight (255) + Trust (120) → 对训练家绝对服从，且能看穿所有替身/闪避
                "friendship": { "trust": 120, "passion": 80, "insight": 255, "devotion": 120 }
            },
            {
                // [不死的灰夜灵]
                "name": "Dusclops", // 彷徨夜灵
                "lv": 88,
                "gender": "F",
                "nature": "Relaxed", // 悠闲 (空间底速)
                "ability": "Pressure", // 压迫感 (消耗PP)
                "item": "Eviolite", // 辉石 (双防1.5倍，不可摧毁)
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 0 }, "ev_level": 252 },
                
                // 黑夜魔影(固定伤害) + 痛平分(强制修血) + 空间
                "moves": ["Night Shade", "Pain Split", "Will-O-Wisp", "Trick Room"] 
            },
            {
                // [强力破盾 / 补盲]
                "name": "Chandelure", // 水晶灯火灵
                "lv": 88,
                "gender": "F",
                "nature": "Timid", // 胆小 (+速)
                "ability": "Infiltrator", // 穿透替身和光墙
                "item": "Choice Scarf", // 围巾 (速度修正是关键，不然容易被秒)
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Fire Blast", "Shadow Ball", "Energy Ball", "Trick"] // 这里其实也有戏法干扰
            },
            {
                // [诅咒死士]
                "name": "Banette", // 诅咒娃娃 (虽然不Mega，但也配恶作剧相关)
                "lv": 87,
                "gender": "F",
                "nature": "Adamant", // 固执
                "ability": "Insomnia", // 不眠 (防止被催眠对策)
                "item": "Focus Sash", // 气腰 (即使不Mega，也要保证必出一招诅咒或同命)
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 垃圾射击补盲打妖精，同命硬换，魅影奇袭破保护
                "moves": ["Gunk Shot", "Destiny Bond", "Knock Off", "Phantom Force"]
            },
            {
                // [物理防御组]
                "name": "Gourgeist-Super", // 特大南瓜怪人
                "lv": 86,
                "gender": "F",
                "nature": "Impish", // 淘气 (+防)
                "ability": "Frisk", // 察觉 (看道具方便做Trick)
                "item": "Leftovers",
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 寄生种子+保护+潜灵奇袭 (经典的消耗连)
                "moves": ["Leech Seed", "Protect", "Poltergeist", "Shadow Sneak"]
            },
            {
                // [精神干扰]
                "name": "Meowstic-F", // 超能妙喵 (雌性 - 好胜) 
                "name": "Gothitelle", // 哥德小姐
                "lv": 86,
                "gender": "F",
                "nature": "Calm", // 温和
                "ability": "Competitive", // 好胜 (反威吓)
                // 原设定有 Shadow Tag (踩影)，如果允许用那就是神。这里用好胜保守一点。
                "item": "Sitrus Berry",
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Psychic", "Thunder Wave", "Cosmic Power", "Stored Power"] // 辅助力量流
            }
        ]
    }
};

/* 
 * 馆主: 彩豆 (Bea)
 * 属性: 格斗 (Fighting)
 * 风格: 极真空手道 / G-Max 暴击队
 * 难度曲线: Level 1 (体验) -> Level 4 (修罗)
 */
const BEA_DATA = {
    // 【Tier 1 - 道场的早间晨练】
    // Lv.25 左右，严谨但尚未成熟
    1: {
        "trainerProficiency": 55,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false
        },
        "party": [
            {
                "name": "Tyrogue", // 无畏小子
                "lv": 24,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Guts", // 毅力 (此时还没火珠，靠运气)
                "stats_meta": { "ivs": { "hp": 20, "atk": 25, "def": 20, "spa": 15, "spd": 20, "spe": 20 }, "ev_level": 10 },
                "moves": ["Mach Punch", "Fake Out", "Tackle", "Focus Energy"] 
            },
            {
                "name": "Pancham", // 顽皮熊猫
                "lv": 25,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Iron Fist", // 铁拳
                "item": "Muscle Band", // 肌肉羽毛
                "stats_meta": { "ivs": { "hp": 25, "atk": 25, "def": 25, "spa": 15, "spd": 25, "spe": 20 }, "ev_level": 20 },
                "moves": ["Comet Punch", "Circle Throw", "Karate Chop", "Work Up"]
            },
            {
                "name": "Farfetch'd-Galar", // 大葱鸭 (伽勒尔)
                "lv": 26, // 下只 Ace
                "gender": "M",
                "nature": "Brave",
                "ability": "Scrappy", // 胆量
                "item": "Leek", // 大葱
                "isAce": true,
                "stats_meta": { "ivs": { "hp": 25, "atk": 25, "def": 25, "spa": 15, "spd": 25, "spe": 20 }, "ev_level": 40 },
                "moves": ["Rock Smash", "Peck", "Fury Cutter", "Focus Energy"]
            }
        ]
    },

    // 【Tier 2 - 黑带考核段位战】
    // Lv.50，进化完全，战术初现
    2: {
        "trainerProficiency": 110,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false, // T2 的普通道馆赛不极巨化
            "enable_tera": false
        },
        "party": [
            {
                "name": "Hitmontop", // 战舞郎
                "lv": 48,
                "gender": "M",
                "nature": "Impish",
                "ability": "Intimidate", // 威吓手
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 20 }, "ev_level": 85 },
                "moves": ["Fake Out", "Rapid Spin", "Close Combat", "Sucker Punch"]
            },
            {
                "name": "Pangoro", // 霸道熊猫
                "lv": 49,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Iron Fist",
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 25, "spa": 10, "spd": 25, "spe": 20 }, "ev_level": 85 },
                "moves": ["Hammer Arm", "Bullet Punch", "Crunch", "Ice Punch"]
            },
            {
                "name": "Sirfetch'd", // 葱游兵
                "lv": 50,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Scrappy", 
                "item": "Leek",
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 25, "spa": 10, "spd": 25, "spe": 31 }, "ev_level": 120 },
                "moves": ["Brick Break", "Poison Jab", "Leaf Blade", "Swords Dance"]
            },
            {
                "name": "Machamp", // 怪力 
                "lv": 52,
                "gender": "M",
                "nature": "Example",
                "ability": "Guts", // 毅力 - 还未携带火珠，靠对面施舍异常
                "item": "Sitrus Berry", 
                "isAce": true,
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 }, "ev_level": 120 },
                "moves": ["Cross Chop", "Bullet Punch", "Ice Punch", "Knock Off"]
            }
        ]
    },

    // 【Tier 3 - 不败的极诣门槛】
    // Lv.70+，解锁极巨化。这时候她已经是一般人无法战胜的格斗大师。
    3: {
        "trainerProficiency": 170,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": true,      // ✅ 为冠军杯赛做准备
            "enable_tera": false
        },
        "party": [
            {
                "name": "Falinks", // 列阵兵
                "lv": 73,
                "gender": "N",
                "nature": "Jolly",
                "ability": "Defiant", // 不服输
                "item": "Sitrus Berry",
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 180 },
                "moves": ["No Retreat", "Close Combat", "Iron Head", "Throat Chop"] // 背水一战
            },
            {
                "name": "Grapploct", // 八爪武师
                "lv": 74,
                "gender": "M",
                "nature": "Careful",
                "ability": "Technician",
                "item": "Leftovers", 
                // 八爪固定 (Octolock)
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 20 }, "ev_level": 180 },
                "moves": ["Octolock", "Drain Punch", "Sucker Punch", "Protect"]
            },
            {
                "name": "Hawlucha", // 摔角鹰人
                "lv": 75,
                "gender": "M",
                "nature": "Jolly",
                "ability": "Unburden", // 轻装
                "item": "White Herb", // 配合近身战解Debuff触发轻装
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 180 },
                "moves": ["Close Combat", "Acrobatics", "Poison Jab", "Swords Dance"]
            },
            {
                // [极巨化王牌]
                "name": "Machamp", 
                "lv": 78,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Guts", 
                "item": "Flame Orb", // 火珠
                
                "mechanic": "dynamax", // G-Max
                
                "isAce": true, 
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Facade", "Close Combat", "Thunder Punch", "Bullet Punch"], // G-Max Chi Strike (会心流)
                "friendship": { "trust": 160, "passion": 180, "insight": 100, "devotion": 120 }
            }
        ]
    },

    // 【Tier 4 - 修罗之道 · Boss 降临】
    // Lv.85+，Second Wind 全面释放，G-Max 破坏力拉满。
    4: {
        "trainerProficiency": 225,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": true,      // ✅ 力量的极致体验
            "enable_tera": false
        },
        "party": [
            {
                // [控制坦克]
                "name": "Grapploct", 
                "lv": 88, 
                "gender": "M",
                "nature": "Careful", 
                "ability": "Limber", 
                "item": "Leftovers",
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Octolock", "Protect", "Drain Punch", "Sucker Punch"]
            },
            {
                // [破盾重锤]
                "name": "Pangoro",
                "lv": 89,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Scrappy", // 胆量：格斗打鬼，解决最大盲点
                "item": "Choice Band", // 专爱头带
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Gunk Shot", "Close Combat", "Knock Off", "Bullet Punch"]
            },
            {
                // [会心神话]
                "name": "Sirfetch'd", 
                "lv": 90,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Scrappy", 
                "item": "Leek", // 50% 暴击率基底，待会吃了 G-Max 的 Buff 就是刀刀暴击
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Meteor Assault", "Brave Bird", "Close Combat", "Thousand Arrows (?)"] 
                // Leaf Blade 平替 First Impression
            },
            {
                // [高速爆发]
                "name": "Hawlucha", 
                "lv": 90,
                "gender": "M",
                "nature": "Jolly",
                "ability": "Mold Breaker", // 破格
                "item": "Life Orb", 
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Swords Dance", "Close Combat", "Brave Bird", "Roost"]
            },
            {
                // [背水一战]
                "name": "Falinks", 
                "lv": 87,
                "gender": "N",
                "nature": "Jolly",
                "ability": "Defiant", 
                "item": "Focus Sash", // 强行背水
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["No Retreat", "Close Combat", "Throat Chop", "Megahorn"]
            },
            {
                // [极诣王牌 / 修罗]
                "name": "Machamp", 
                "lv": 95, 
                "gender": "M",
                "nature": "Adamant",
                "ability": "Guts", // 毅力
                "item": "Flame Orb", // 火珠
                
                // === 机制核心 ===
                "mechanic": "dynamax", // G-Max Machamp
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // G-Max Chi Strike (超极巨会心一击): 攻击后全队暴击率 +1
                // 队伍里的葱游兵和这只怪力本身会非常享受这个效果
                "moves": ["Facade", "Close Combat", "Heavy Slam", "Stone Edge"],
                
                "isAce": true,
                "hasSecondWind": true, // 【BOSS 机制】: 首次致死伤害锁1血 + 全属性提升1级
                "friendship": { "trust": 100, "passion": 200, "insight": 140, "devotion": 120 }
            }
        ]
    }
};

/* 
 * 角色: 竹兰 (Cynthia)
 * 身份: 神奥冠军 / 乃至全世代最强的王者之一
 * 核心机制: Mega进化 + Second Wind (二阶段变身)
 */
const CYNTHIA_DATA = {
    // 【Tier 2 - 这只是热身运动】
    // Lv.60+，已经可以使用 Mega 进化了。对于其他馆主这是底牌，对她只是起手式。
    2: {
        "trainerProficiency": 180,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": true,         // ✅ T2 就可以 Mega
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false
        },
        "party": [
            {
                // [无弱点首发]
                "name": "Spiritomb", 
                "lv": 61,
                "gender": "F",
                "nature": "Quiet",
                "ability": "Pressure",
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 0 }, "ev_level": 85 },
                "moves": ["Sucker Punch", "Psychic", "Shadow Ball", "Embargo"]
            },
            {
                // [特攻爆破]
                "name": "Roserade", 
                "lv": 60,
                "gender": "F",
                "nature": "Timid",
                "ability": "Natural Cure",
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 85 },
                "moves": ["Sludge Bomb", "Energy Ball", "Shadow Ball", "Extrasensory"]
            },
            {
                // [水地联防]
                "name": "Gastrodon", 
                "lv": 60,
                "gender": "F",
                "nature": "Modest",
                "item": "Leftovers",
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 85 },
                "moves": ["Muddy Water", "Earth Power", "Sludge Bomb", "Stone Edge"]
            },
            {
                // [双刀波导]
                "name": "Lucario",
                "lv": 63,
                "gender": "M",
                "nature": "Naive",
                "ability": "Inner Focus",
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 120 },
                "moves": ["Aura Sphere", "Dragon Pulse", "Extreme Speed", "Close Combat"]
            },
            {
                // [特殊的肉]
                "name": "Milotic",
                "lv": 63,
                "gender": "F",
                "nature": "Bold",
                "item": "Flame Orb", // Marvel Scale
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 120 },
                "moves": ["Hydro Pump", "Ice Beam", "Mirror Coat", "Recover"]
            },
            {
                // [准神] 在 T2 还没携带 Mega 石，普通形态足够强了... 哦不，既然开启了 Mega，这里就是 Garchomp-Mega
                "name": "Garchomp",
                "lv": 66,
                "gender": "F",
                "nature": "Jolly",
                "ability": "Rough Skin",
                "item": "Garchompite", // 鲨鱼皮 -> 变身 Sand Force
                "mechanic": "mega",
                "isAce": true, 
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 180 },
                "moves": ["Dragon Rush", "Earthquake", "Brick Break", "Giga Impact"]
            }
        ]
    },

    // 【Tier 3 - 世锦赛八大师】
    // Lv.80+，仍然是 Mega 核心，但全员数值大幅强化。
    3: {
        "trainerProficiency": 220,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": true,         // ✅ 依然是 Mega
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false
        },
        "party": [
            {
                // [催眠战术]
                "name": "Spiritomb",
                "lv": 80,
                "gender": "F",
                "nature": "Bold",
                "ability": "Infiltrator", 
                "item": "Leftovers",
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 0 }, "ev_level": 180 },
                // 恶心的睡梦流
                "moves": ["Dream Eater", "Dark Pulse", "Hypnosis", "Shadow Ball"] 
            },
            {
                // [天恩飞机]
                "name": "Togekiss", 
                "lv": 83,
                "gender": "M",
                "nature": "Timid",
                "ability": "Serene Grace", // 天恩
                "item": "Leftovers", // 或者弱测
                "item": "Weakness Policy",
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 180 },
                // 可怕的空气切畏缩 + 极巨飞冲潜力
                "moves": ["Air Slash", "Dazzling Gleam", "Aura Sphere", "Nasty Plot"]
            },
            {
                // [无弱点电免]
                "name": "Eelektross", // 麻麻鳗鱼王
                "lv": 83,
                "gender": "M",
                "nature": "Quiet",
                "item": "Assault Vest",
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Wild Charge", "Flamethrower", "Giga Drain", "Dragon Claw"]
            },
            {
                // [好胜美纳斯]
                "name": "Milotic",
                "lv": 84,
                "gender": "F",
                "nature": "Bold",
                "ability": "Competitive", // 蹭威吓加特攻
                "item": "Flame Orb", 
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Scald", "Recover", "Ice Beam", "Mirror Coat"]
            },
            {
                // [适应力路卡]
                "name": "Lucario",
                "lv": 84,
                "gender": "M",
                "nature": "Naive",
                "item": "Focus Sash", // 气腰保命爆发
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Close Combat", "Meteor Mash", "Extreme Speed", "Swords Dance"]
            },
            {
                // [噩梦烈咬]
                "name": "Garchomp",
                "lv": 88,
                "gender": "F",
                "nature": "Jolly",
                "mechanic": "mega",
                "item": "Garchompite",
                "isAce": true, 
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 毒刺补盲打妖精 / 剑舞流
                "moves": ["Dragon Claw", "Earthquake", "Poison Jab", "Swords Dance"]
            }
        ]
    },
    4: {
        "trainerProficiency": 255,
        "unlocks": {
            "enable_bond": true,         // ✅ 激活王牌的 Second Wind 与属性修正
            "enable_styles": true,       // ✅ 补充：作为接触过神奥神话的人，她必然懂得“刚/迅”
            "enable_insight": true,      // ✅ 核心：修正所有低命中技能至必中前
            "enable_mega": true,         // ✅ 破坏神降临
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false
        },
        "party": [
            {
                // [无解首发 / 催眠陷阱]
                "name": "Spiritomb",
                "lv": 95, 
                "gender": "F",
                "nature": "Bold", // +防御
                "ability": "Infiltrator", // 穿透：无视此时玩家可能会开的替身/墙
                "item": "Kee Berry", // 受到物理攻击提升防御 (给对面一种打不动的错觉)
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 战术: Insight加持下Hypnosis几乎必中。
                // 睡掉首发 -> 临别礼物废掉对方攻击 -> 安全换人强化
                "moves": ["Hypnosis", "Memento", "Foul Play", "Will-O-Wisp"] 
            },
            {
                // [白色恶魔 / 空切地狱]
                // 道具改为【讲究围巾】，先手空切 60% 畏缩，动都动不了
                "name": "Togekiss", 
                "lv": 95,
                "gender": "M",
                "nature": "Timid", // 胆小 + 围巾 = 极速
                "ability": "Serene Grace", // 天恩
                "item": "Choice Scarf", // 🔒 讲究围巾
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                "moves": ["Air Slash", "Dazzling Gleam", "Aura Sphere", "Fire Blast"] 
                // 大字爆 (Fire Blast) 即使命中只有85，在Insight加持下就是必中火系核弹
            },
            {
                // [催眠好胜 / 针对威吓]
                "name": "Milotic",
                "lv": 95,
                "gender": "F",
                "nature": "Bold",
                "ability": "Competitive", // 谁敢威吓烈咬陆鲨就切美纳斯上来+2特攻
                "item": "Leftovers",
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 依靠 Insight 随意使用水炮 (Hydro Pump) 和 暴风雪 (Blizzard)
                "moves": ["Hydro Pump", "Blizzard", "Recover", "Mirror Coat"]
            },
            {
                // [物理清场 / 节奏核心]
                "name": "Lucario",
                "lv": 96, // 等级提升
                "gender": "M",
                "nature": "Naughty", // 孤独 (+攻 -特防)，为了双刀
                "ability": "Justified", 
                "item": "Focus Sash", // 气腰：保证能剑舞一次
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 吃到临别礼物后上场 -> 剑舞 -> 子弹拳/神速清场
                // 精神强念 (Psychic) 打击格斗盲点
                "moves": ["Swords Dance", "Close Combat", "Extreme Speed", "Psychic"]
            },
            {
                // [特殊定点爆破]
                "name": "Volcarona", // 火神蛾
                "lv": 96,
                "gender": "F",
                "nature": "Modest",
                "ability": "Flame Body", 
                "item": "Heavy-Duty Boots", // 防止隐形岩
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 蝶舞强化 + 亿万吸续航
                "moves": ["Quiver Dance", "Fiery Dance", "Bug Buzz", "Giga Drain"]
            },
            {
                // [绝望的代在词 / 终焉]
                "name": "Garchomp", 
                "lv": 100, 
                "gender": "F",
                "nature": "Naughty", // 顽皮 (+攻 -特防)，双刀流性格，确保流星群威力
                
                "mechanic": "mega",
                "item": "Garchompite",
                
                "isAce": true,
                "hasSecondWind": true, // Boss 机制开关
                
                "stats_meta": { 
                    // 完美的双攻 6V
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, 
                    "ev_level": { "hp": 0, "atk": 252, "def": 0, "spa": 100, "spd": 0, "spe": 158 } // 将部分努力给特攻 
                },
                
                // 配招优化：双刀针对性打击
                // 1. Earthquake: 没有任何理由换掉的本系
                // 2. Stone Edge (尖石攻击): Insight 修正后必中，打飞行的神技
                // 3. Draco Meteor (流星群): 专杀那些以为物防高就能挡烈咬陆鲨的人（比如土猫、钢鸟）
                // 4. Poison Jab (毒击): 杀妖精
                "moves": ["Earthquake", "Stone Edge", "Draco Meteor", "Poison Jab"],
                
                "friendship": { 
                    "trust": 255,   // 锁血概率 Max
                    "passion": 255, // 暴击率 Boost -> 配合Mega的高攻非常危险
                    "insight": 255, // 回避率 Max + 命中修正 Max
                    "devotion": 200 // 自愈能力
                }
            }
        ]
    }
};


// ================================================================
//  挂载到 window 对象，供插件内部访问
// ================================================================
if (typeof window !== 'undefined') {
    window.GLORIA_DATA = GLORIA_DATA;
    window.SELENE_DATA = SELENE_DATA;
    window.ROSA_DATA = ROSA_DATA;
    window.DAWN_DATA = DAWN_DATA;
    window.AKARI_DATA = AKARI_DATA;
    window.SERENA_DATA = SERENA_DATA;
    window.LUSAMINE_DATA = LUSAMINE_DATA;
    window.LILLIE_DATA = LILLIE_DATA;
    window.MALLOW_DATA = MALLOW_DATA;
    window.LANA_DATA = LANA_DATA;
    window.IRIDA_DATA = IRIDA_DATA;
    window.SONIA_DATA = SONIA_DATA;
    window.ROXIE_DATA = ROXIE_DATA;
    window.IONO_DATA = IONO_DATA;
    window.ERIKA_DATA = ERIKA_DATA;
    window.NESSA_DATA = NESSA_DATA;
    window.MARNIE_DATA = MARNIE_DATA;
    window.HEX_DATA = HEX_DATA;
    window.BEA_DATA = BEA_DATA;
    window.CYNTHIA_DATA = CYNTHIA_DATA;
    window.JULIANA_DATA = JULIANA_DATA;
    
    window.TRAINER_GLOBALS = {
        gloria: GLORIA_DATA,
        selene: SELENE_DATA,
        rosa: ROSA_DATA,
        dawn: DAWN_DATA,
        akari: AKARI_DATA,
        serena: SERENA_DATA,
        juliana: JULIANA_DATA,
        lusamine: LUSAMINE_DATA,
        lillie: LILLIE_DATA,
        mallow: MALLOW_DATA,
        lana: LANA_DATA,
        irida: IRIDA_DATA,
        sonia: SONIA_DATA,
        roxie: ROXIE_DATA,
        iono: IONO_DATA,
        erika: ERIKA_DATA,
        nessa: NESSA_DATA,
        marnie: MARNIE_DATA,
        hex: HEX_DATA,
        bea: BEA_DATA,
        cynthia: CYNTHIA_DATA
    };
}