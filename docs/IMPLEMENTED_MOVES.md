# 已实现技能列表 (Implemented Moves)

> 生成日期: 2026-01-05
> 来源文件: `engine/move-handlers.js` + `engine/move-effects.js`

---

## 一、move-handlers.js 中的技能处理器 (209个)

### 1. 固定伤害技能 (Fixed Damage Moves)
| 技能名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Night Shade | 黑夜魔影 | 造成等于使用者等级的固定伤害 |
| Seismic Toss | 地球上投 | 造成等于使用者等级的固定伤害 |
| Psywave | 精神波 | 造成等级相关的随机伤害 |
| Dragon Rage | 龙之怒 | 固定造成 40 点伤害 |
| Sonic Boom | 音爆 | 固定造成 20 点伤害 |
| Super Fang | 愤怒门牙 | 造成目标当前 HP 一半的伤害 |
| Nature's Madness | 自然之怒 | 造成目标当前 HP 一半的伤害 |
| Guardian of Alola | 阿罗拉守护神 | 造成目标当前 HP 75% 的伤害 |

### 2. 动态威力技能 (Dynamic Power Moves)
| 技能名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Gyro Ball | 陀螺球 | 速度越慢威力越高 |
| Electro Ball | 电球 | 速度越快威力越高 |
| Grass Knot | 打草结 | 目标越重威力越高 |
| Low Kick | 踢倒 | 目标越重威力越高 |
| Heavy Slam | 重磅冲撞 | 自己越重威力越高 |
| Heat Crash | 高温重压 | 自己越重威力越高 |
| Stored Power | 辅助力量 | 能力提升越多威力越高 |
| Power Trip | 嚣张 | 能力提升越多威力越高 |
| Punishment | 惩罚 | 目标能力提升越多威力越高 |
| Reversal | 起死回生 | HP 越低威力越高 |
| Flail | 抓狂 | HP 越低威力越高 |
| Eruption | 喷火 | HP 越高威力越高 |
| Water Spout | 喷水 | HP 越高威力越高 |
| Crush Grip | 握碎 | 目标 HP 越高威力越高 |
| Wring Out | 绞紧 | 目标 HP 越高威力越高 |
| Fishious Rend | 鳃咬 | 先手威力翻倍 |
| Bolt Beak | 电喙 | 先手威力翻倍 |

### 2.5 条件倍率技能 (Conditional Power Moves) - 2026-01 新增
| 技能名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Knock Off | 落拳 | 目标持有道具时威力x1.5，攻击后打落道具 |
| Acrobatics | 杂技 | 不持有道具时威力翻倍 (110) |
| Facade | 硬撑 | 异常状态时威力翻倍 (140)，无视烧伤减攻 |
| Hex | 祸不单行 | 目标有异常状态时威力翻倍 (130) |
| Payback | 报复 | 后手时威力翻倍 (100) |
| Revenge | 报仇 | 本回合受伤后威力翻倍 (120) |
| Wake-Up Slap | 唤醒巴掌 | 目标睡眠时威力翻倍并唤醒 |

### 3. 特殊攻防计算 (Modified Stat Moves)
| 技能名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Photon Geyser | 光子喷涌 | 使用物攻和特攻中较高的一方 |
| Light That Burns the Sky | 焚天灭世炽光爆 | 使用物攻和特攻中较高的一方 |
| Foul Play | 欺诈 | 使用目标的攻击力计算伤害 |
| Body Press | 扑击 | 使用自己的防御力计算伤害 |
| Psyshock | 精神冲击 | 特攻打物防 |
| Psystrike | 精神击破 | 特攻打物防 |
| Secret Sword | 神秘之剑 | 特攻打物防 |
| Tera Blast | 太晶爆发 | 太晶化时使用较高的攻击/特攻 |

### 4. 吸血/回复技能 (Draining Moves)
| 技能名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Absorb | 吸取 | 吸收 50% 伤害 |
| Mega Drain | 超级吸取 | 吸收 50% 伤害 |
| Giga Drain | 终极吸取 | 吸收 50% 伤害 |
| Drain Punch | 吸取拳 | 吸收 50% 伤害 |
| Leech Life | 吸血 | 吸收 50% 伤害 |
| Horn Leech | 木角 | 吸收 50% 伤害 |
| Draining Kiss | 吸取之吻 | 吸收 75% 伤害 |
| Dream Eater | 食梦 | 吸收 50% 伤害（仅对睡眠目标） |
| Oblivion Wing | 死亡之翼 | 吸收 75% 伤害 |
| Strength Sap | 吸取力量 | 回复等于目标攻击力的 HP |

### 5. 自我回复技能 (Self-Healing Moves)
| 技能名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Recover | 自我再生 | 回复 50% HP |
| Soft-Boiled | 生蛋 | 回复 50% HP |
| Slack Off | 偷懒 | 回复 50% HP |
| Roost | 羽栖 | 回复 50% HP |
| Moonlight | 月光 | 天气影响回复量 |
| Morning Sun | 晨光 | 天气影响回复量 |
| Synthesis | 光合作用 | 天气影响回复量 |
| Shore Up | 集沙 | 沙暴时回复 2/3 |
| Rest | 睡眠 | 完全回复但睡眠 |
| Wish | 祈愿 | 下回合回复 50% HP |
| Purify | 净化 | 治愈目标异常状态并回复自己 50% HP |

### 6. 天气技能 (Weather Moves)
| 技能名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Rain Dance | 求雨 | 设置雨天 |
| Sunny Day | 大晴天 | 设置晴天 |
| Sandstorm | 沙暴 | 设置沙暴 |
| Hail | 冰雹 | 设置冰雹 |
| Snowscape | 雪景 | 设置雪景 |

### 7. 场地技能 (Field/Hazard Moves)
| 技能名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Stealth Rock | 隐形岩 | 设置隐形岩 |
| Spikes | 撒菱 | 设置撒菱 |
| Toxic Spikes | 毒菱 | 设置毒菱 |
| Sticky Web | 黏黏网 | 设置黏黏网 |
| Rapid Spin | 高速旋转 | 清除场地障碍 |
| Defog | 清除浓雾 | 清除所有场地效果 |
| Court Change | 换场 | 交换双方场地效果 |
| Trick Room | 戏法空间 | 设置戏法空间 |

### 8. 屏障技能 (Screen Moves)
| 技能名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Light Screen | 光墙 | 减少特殊伤害 |
| Reflect | 反射壁 | 减少物理伤害 |
| Aurora Veil | 极光幕 | 减少所有伤害（需冰雹/雪景） |

### 9. 守住类技能 (Protection Moves)
| 技能名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Protect | 守住 | 保护自己免受攻击 |
| Detect | 看穿 | 保护自己免受攻击 |
| Endure | 挺住 | 保证至少剩 1 HP |
| Baneful Bunker | 碉堡 | 守住+接触者中毒 |
| Spiky Shield | 尖刺防守 | 守住+接触者受伤 |
| King's Shield | 王者盾牌 | 守住+接触者降攻 |
| Obstruct | 拦堵 | 守住+接触者降防 |
| Silk Trap | 丝绸陷阱 | 守住+接触者降速 |
| Mat Block | 掀榻榻米 | 首回合保护队友 |

### 10. 换人技能 (Pivot Moves)
| 技能名 | 中文名 | 效果说明 |
|--------|--------|----------|
| U-turn | 急速折返 | 攻击后换人 |
| Volt Switch | 伏特替换 | 攻击后换人 |
| Flip Turn | 快速折返 | 攻击后换人 |
| Parting Shot | 临别赠言 | 降低对方能力后换人 |
| Teleport | 瞬间移动 | 直接换人 |
| Baton Pass | 接棒 | 传递能力变化换人 |

### 11. 强制换人技能 (Phazing Moves)
| 技能名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Roar | 吼叫 | 强制对方换人 |
| Whirlwind | 吹飞 | 强制对方换人 |
| Dragon Tail | 龙尾 | 攻击+强制换人 |
| Circle Throw | 巴投 | 攻击+强制换人 |

### 12. 反击技能 (Counter Moves)
| 技能名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Counter | 双倍奉还 | 反弹物理伤害 2 倍 |
| Mirror Coat | 镜面反射 | 反弹特殊伤害 2 倍 |
| Metal Burst | 金属爆炸 | 反弹最后受到伤害 1.5 倍 |

### 13. 能力交换技能 (Stat Swap Moves)
| 技能名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Power Swap | 力量互换 | 交换攻击/特攻等级 |
| Guard Swap | 防守互换 | 交换防御/特防等级 |
| Speed Swap | 速度互换 | 交换速度 |
| Heart Swap | 心灵互换 | 交换所有能力等级 |
| Psych Up | 自我暗示 | 复制对方能力等级 |

### 14. 道具相关技能 (Item Moves)
| 技能名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Trick | 戏法 | 交换道具 |
| Switcheroo | 掉包 | 交换道具 |
| Stuff Cheeks | 大快朵颐 | 吃树果+大幅提升防御 |

### 15. 特殊效果技能 (Special Effect Moves)
| 技能名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Destiny Bond | 同命 | 被击倒时带走对方 |
| Perish Song | 灭亡之歌 | 3 回合后双方倒下 |
| Pain Split | 痛苦平分 | 平分双方 HP |
| Endeavor | 蛮干 | 将对方 HP 降到与自己相同 |
| Final Gambit | 搏命 | 自杀造成等于自己 HP 的伤害 |
| Explosion | 大爆炸 | 自杀造成大伤害 |
| Self-Destruct | 自爆 | 自杀造成大伤害 |
| Mind Blown | 惊爆大头 | 消耗 50% HP 攻击 |
| Steel Beam | 铁蹄光线 | 消耗 50% HP 攻击 |

### 16. 属性/类型相关技能 (Type Moves)
| 技能名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Soak | 浸水 | 将目标变为水属性 |
| Magic Powder | 魔法粉 | 将目标变为超能力属性 |
| Trick-or-Treat | 万圣夜 | 给目标添加幽灵属性 |
| Burn Up | 燃尽 | 使用后失去火属性 |
| Double Shock | 电光双击 | 使用后失去电属性 |
| Conversion | 转换 | 变为第一个招式的属性 |
| Reflect Type | 镜面属性 | 复制目标属性 |

### 17. 状态清除技能 (Status Cure Moves)
| 技能名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Aromatherapy | 芳香治疗 | 治愈队伍异常状态 |
| Heal Bell | 治愈铃声 | 治愈队伍异常状态 |
| Refresh | 焕然一新 | 治愈自己异常状态 |
| Haze | 黑雾 | 清除所有能力变化 |
| Clear Smog | 清除之烟 | 清除目标能力变化 |
| Topsy-Turvy | 颠倒 | 反转目标能力变化 |

### 18. 能力提升技能 (Stat Boost Moves)
| 技能名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Belly Drum | 腹鼓 | 消耗 50% HP，攻击+6 |
| Clangorous Soul | 魂舞烈音爆 | 消耗 33% HP，全能力+1 |
| Fillet Away | 甩肉 | 消耗 50% HP，攻击/特攻/速度+2 |
| Stockpile | 蓄力 | 蓄力（最多3次） |
| Spit Up | 喷出 | 根据蓄力次数攻击 |
| Swallow | 吞下 | 根据蓄力次数回复 |
| Defense Curl | 变圆 | 防御+1，滚动威力翻倍 |
| Charge | 充电 | 特防+1，下次电系威力翻倍 |
| Laser Focus | 磨砺 | 下次攻击必定会心 |

### 19. 睡眠相关技能 (Sleep Moves)
| 技能名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Sleep Talk | 梦话 | 睡眠时随机使用招式 |
| Snore | 打鼾 | 睡眠时攻击 |

### 20. 蓄力技能 (Charging Moves)
| 技能名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Solar Beam | 日光束 | 晴天无需蓄力 |
| Solar Blade | 日光刃 | 晴天无需蓄力 |
| Hyper Beam | 破坏光线 | 使用后需休息 |
| Giga Impact | 终极冲击 | 使用后需休息 |
| Blast Burn | 爆炸烈焰 | 使用后需休息 |
| Hydro Cannon | 加农水炮 | 使用后需休息 |
| Frenzy Plant | 疯狂植物 | 使用后需休息 |
| Prismatic Laser | 棱镜激光 | 使用后需休息 |
| Eternabeam | 无极光束 | 使用后需休息 |
| Meteor Assault | 流星突击 | 使用后需休息 |
| Rollout | 滚动 | 连续使用威力递增 |
| Ice Ball | 冰球 | 连续使用威力递增 |

### 21. 特殊机制技能 (Special Mechanic Moves)
| 技能名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Metronome | 挥指 | 随机使用招式 |
| Transform | 变身 | 复制目标 |
| Spectral Thief | 暗影偷盗 | 偷取目标能力提升 |
| Fake Out | 击掌奇袭 | 首回合使用必定畏缩 |
| First Impression | 迎头一击 | 首回合使用威力翻倍 |
| Last Resort | 珍藏 | 其他招式用完后才能用 |
| Uproar | 吵闹 | 持续 3 回合，阻止睡眠 |
| Struggle | 挣扎 | PP 用尽时使用 |
| Leech Seed | 寄生种子 | 每回合吸取 HP |
| Curse | 诅咒 | 幽灵系/非幽灵系效果不同 |
| Healing Wish | 治愈之愿 | 自杀治愈换上场的队友 |
| Lunar Dance | 新月舞 | 自杀治愈换上场的队友 |

### 22. 极巨招式 (Max Moves) - 18个
| 技能名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Max Strike | 极巨攻击 | 降低对方速度 |
| Max Knuckle | 极巨拳斗 | 提升我方攻击 |
| Max Airstream | 极巨飞冲 | 提升我方速度 |
| Max Ooze | 极巨酸毒 | 提升我方特攻 |
| Max Quake | 极巨大地 | 提升我方特防 |
| Max Steelspike | 极巨钢铁 | 提升我方防御 |
| Max Flare | 极巨火爆 | 设置晴天 |
| Max Geyser | 极巨水流 | 设置雨天 |
| Max Rockfall | 极巨岩石 | 设置沙暴 |
| Max Hailstorm | 极巨寒冰 | 设置冰雹 |
| Max Overgrowth | 极巨草原 | 设置青草场地 |
| Max Lightning | 极巨闪电 | 设置电气场地 |
| Max Mindstorm | 极巨超能 | 设置精神场地 |
| Max Starfall | 极巨妖精 | 设置薄雾场地 |
| Max Wyrmwind | 极巨龙骑 | 降低对方攻击 |
| Max Phantasm | 极巨幽魂 | 降低对方防御 |
| Max Darkness | 极巨恶霸 | 降低对方特防 |
| Max Flutterby | 极巨虫蛀 | 降低对方特攻 |
| Max Guard | 极巨防壁 | 守住 |

### 23. 超极巨招式 (G-Max Moves) - 32个
| 技能名 | 中文名 | 效果说明 |
|--------|--------|----------|
| G-Max Wildfire | 超极巨地狱灭焰 | 4回合持续伤害（非火系） |
| G-Max Vine Lash | 超极巨藤鞭 | 4回合持续伤害（非草系） |
| G-Max Cannonade | 超极巨水炮 | 4回合持续伤害（非水系） |
| G-Max Volcalith | 超极巨岩阵 | 4回合持续伤害（非岩系） |
| G-Max Befuddle | 超极巨蝶影 | 随机异常状态 |
| G-Max Stun Shock | 超极巨异毒电场 | 随机中毒/麻痹 |
| G-Max Malodor | 超极巨臭气 | 中毒 |
| G-Max Smite | 超极巨天谴 | 混乱 |
| G-Max Cuddle | 超极巨热情拥抱 | 着迷 |
| G-Max Terror | 超极巨幻影 | 无法逃走 |
| G-Max Snooze | 超极巨睡魔 | 下回合睡眠 |
| G-Max Centiferno | 超极巨百火焚野 | 束缚 |
| G-Max Chi Strike | 超极巨会心一击 | 提升会心率 |
| G-Max Depletion | 超极巨劣化 | 减少PP |
| G-Max Meltdown | 超极巨熔毁 | 封印 |
| G-Max Foam Burst | 超极巨激漩泡 | 大幅降速 |
| G-Max Gravitas | 超极巨天陨 | 重力 |
| G-Max Stonesurge | 超极巨岩阵以待 | 隐形岩 |
| G-Max Steelsurge | 超极巨钢铁阵法 | 钢钉 |
| G-Max Wind Rage | 超极巨旋风 | 清除场地 |
| G-Max Resonance | 超极巨极光旋律 | 极光幕 |
| G-Max Finale | 超极巨幸福圆满 | 回复HP |
| G-Max Sweetness | 超极巨蜜糖雨 | 治愈异常状态 |
| G-Max Replenish | 超极巨资源再生 | 回收树果 |
| G-Max Gold Rush | 超极巨特大金币 | 混乱+金钱 |
| G-Max Tartness | 超极巨酸不溜丢 | 降低闪避 |
| G-Max Drum Solo | 超极巨狂擂乱打 | 无视特性 |
| G-Max Fireball | 超极巨九天炎击 | 无视特性 |
| G-Max Hydrosnipe | 超极巨狙击神射 | 无视特性 |
| G-Max One Blow | 超极巨夺命一击 | 穿透守住 |
| G-Max Rapid Flow | 超极巨连环攻击 | 穿透守住 |
| G-Max Sandblast | 超极巨沙尘漫天 | 束缚 |

---

## 二、move-effects.js 中的技能效果

### 1. 优先度定义 (Priority)
| 优先度 | 技能列表 |
|--------|----------|
| +5 | Helping Hand |
| +4 | Protect, Detect, Endure, Magic Coat, Snatch, Baneful Bunker, Spiky Shield, King's Shield, Obstruct, Silk Trap, Burning Bulwark |
| +3 | Fake Out, Quick Guard, Wide Guard, Crafty Shield |
| +2 | Extreme Speed, Feint, First Impression, Accelerock |
| +1 | Aqua Jet, Baby-Doll Eyes, Bullet Punch, Ice Shard, Mach Punch, Quick Attack, Shadow Sneak, Sucker Punch, Vacuum Wave, Water Shuriken, Grassy Glide, Jet Punch |
| -1 | Vital Throw |
| -3 | Focus Punch |
| -4 | Avalanche, Revenge |
| -5 | Counter, Mirror Coat |
| -6 | Circle Throw, Dragon Tail, Roar, Whirlwind, Teleport |
| -7 | Trick Room |

### 2. 状态技能效果 (Status Effects)
| 技能名 | 状态 | 命中率 |
|--------|------|--------|
| Thunder Wave | 麻痹 | 100% |
| Stun Spore | 麻痹 | 100% |
| Glare | 麻痹 | 100% |
| Nuzzle | 麻痹 | 100% |
| Will-O-Wisp | 灼伤 | 100% |
| Toxic | 剧毒 | 100% |
| Poison Powder | 中毒 | 100% |
| Poison Gas | 中毒 | 100% |
| Spore | 睡眠 | 100% |
| Sleep Powder | 睡眠 | 75% |
| Hypnosis | 睡眠 | 60% |
| Sing | 睡眠 | 55% |

### 3. 附带状态的攻击技能
| 技能名 | 状态 | 概率 |
|--------|------|------|
| Thunderbolt | 麻痹 | 10% |
| Thunder | 麻痹 | 30% |
| Discharge | 麻痹 | 30% |
| Body Slam | 麻痹 | 30% |
| Flamethrower | 灼伤 | 10% |
| Fire Blast | 灼伤 | 10% |
| Scald | 灼伤 | 30% |
| Lava Plume | 灼伤 | 30% |
| Ice Beam | 冰冻 | 10% |
| Blizzard | 冰冻 | 10% |
| Sludge Bomb | 中毒 | 30% |
| Poison Jab | 中毒 | 30% |

### 4. 一击必杀技能 (OHKO Moves)
| 技能名 | 中文名 |
|--------|--------|
| Fissure | 地裂 |
| Horn Drill | 角钻 |
| Guillotine | 断头钳 |
| Sheer Cold | 绝对零度 |

### 5. 束缚技能 (Trapping Moves)
| 技能名 | 中文名 |
|--------|--------|
| Bind | 绑紧 |
| Wrap | 紧束 |
| Fire Spin | 火焰旋涡 |
| Whirlpool | 潮旋 |
| Sand Tomb | 流沙地狱 |
| Magma Storm | 熔岩风暴 |
| Infestation | 纠缠不休 |
| Clamp | 贝壳夹击 |
| Snap Trap | 捕兽夹 |

### 6. 异常状态技能 (Volatile Status)
| 技能名 | 效果 |
|--------|------|
| Confuse Ray | 混乱 |
| Supersonic | 混乱 |
| Sweet Kiss | 混乱 |
| Teeter Dance | 混乱 |
| Swagger | 混乱+攻击+2 |
| Flatter | 混乱+特攻+2 |
| Attract | 着迷 |
| Taunt | 挑衅 |
| Torment | 无理取闹 |
| Disable | 定身法 |
| Encore | 再来一次 |
| Heal Block | 回复封锁 |
| Embargo | 查封 |
| Yawn | 哈欠 |
| Curse | 诅咒 |
| Leech Seed | 寄生种子 |
| Perish Song | 灭亡之歌 |
| Destiny Bond | 同命 |
| Focus Energy | 聚气 |
| Substitute | 替身 |
| Ingrain | 扎根 |
| Aqua Ring | 水流环 |
| Imprison | 封印 |

---

## 三、统计汇总

| 分类 | 数量 |
|------|------|
| move-handlers.js 技能处理器 | 209 |
| 极巨招式 (Max Moves) | 18 |
| 超极巨招式 (G-Max Moves) | 32 |
| 状态技能 | 12 |
| 附带状态攻击技能 | 12 |
| 一击必杀技能 | 4 |
| 束缚技能 | 9 |
| 异常状态技能 | 23 |
| **总计（去重后估计）** | **~250+** |

---

## 四、待检查/潜在问题

1. **King's Shield** - 在代码中可能存在引号问题 (`'King\'s Shield'`)
2. **Nature's Madness** - 同上
3. 部分技能可能在两个文件中都有定义，需要确认优先级
4. ~~极巨招式的天气值需要与天气系统统一~~ ✅ 已统一

---

## 五、2026-01 新增技能

### 条件倍率技能 (Conditional Power Moves)
| 技能名 | 中文名 | 效果说明 | 代表宝可梦 |
|--------|--------|----------|-----------|
| Knock Off | 落拳 | 目标持有道具时威力x1.5，攻击后打落道具 | 万金油 |
| Acrobatics | 杂技 | 不持有道具时威力翻倍 (110) | 音速蝙蝠 |
| Facade | 硬撑 | 异常状态时威力翻倍，无视烧伤减攻 | 火焰宝珠流 |
| Hex | 祸不单行 | 目标有异常状态时威力翻倍 (130) | 鬼火流 |

### 环境动态技能 (Environment-Based Moves)
| 技能名 | 中文名 | 效果说明 | 代表宝可梦 |
|--------|--------|----------|-----------|
| Weather Ball | 天气球 | 根据天气改变属性和威力 | 天气队 |
| Expanding Force | 广域战力 | 精神场地下威力x1.5 | 超能场地队 |
| Rising Voltage | 电涌 | 电气场地下威力翻倍 | 电气场地队 |
| Grassy Glide | 青草滑梯 | 青草场地下先制 | 轰擂金刚猩 |
| Terrain Pulse | 大地之力 | 根据场地改变属性和威力 | 场地队 |

### 半无敌状态技能 (Semi-Invulnerable Moves)
| 技能名 | 中文名 | 效果说明 | 代表宝可梦 |
|--------|--------|----------|-----------|
| Phantom Force | 潜灵奇袭 | 穿透守住 | 多龙巴鲁托 |
| Shadow Force | 暗影潜袭 | 穿透守住 | 骑拉帝纳 |
| Fly | 飞翔 | 飞上高空后攻击 | 通用 |
| Dig | 挖洞 | 钻入地下后攻击 | 通用 |
| Dive | 潜水 | 潜入水中后攻击 | 通用 |
| Bounce | 弹跳 | 跳到高空后攻击，30%麻痹 | 通用 |

### 延迟伤害技能 (Future Moves) - 简化版
| 技能名 | 中文名 | 效果说明 | 代表宝可梦 |
|--------|--------|----------|-----------|
| Future Sight | 预知未来 | 无视一般免疫（简化为立即伤害） | 呆壳兽 |
| Doom Desire | 破灭之愿 | 无视一般免疫（简化为立即伤害） | 基拉祈 |

### 新增辅助函数
- `canKnockOff(pokemon)`: 检查道具是否可被打落（排除 Mega 石、Z 纯晶、专属道具）

### 待实现（需要引擎支持）
| 技能名 | 中文名 | 缺失原因 |
|--------|--------|----------|
| Pursuit | 追打 | 需要 Action Queue 优先度中断支持 |
| Future Sight (完整版) | 预知未来 | 需要 futureMove 队列支持 |

