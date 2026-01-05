# 已实现特性列表 (Implemented Abilities)

> 生成日期: 2026-01-06
> 来源文件: `engine/ability-handlers.js`
> 总计: **138个特性**

---

## 一、特性分类总览

| 分类 | 数量 | 说明 |
|------|------|------|
| A. 暴力数值修正 | 5 | 攻击力/威力翻倍类 |
| B. 御三家专属 | 4 | 红血爆发类 |
| C. 特殊防御/开眼 | 20+ | 免疫/吸收/减伤类 |
| D. 入场效果 | 12 | 威吓/天气/场地类 |
| E. 机制怪 | 10+ | 变幻自如/异兽提升等 |
| F. 招式大师 | 6 | 铁拳/强颚/锋锐等 |
| G. 抗性/状态 | 15+ | 免疫异常状态类 |
| H. 天气加速 | 6 | 叶绿素/悠游自如等 |
| I. 吸收系 | 3 | 食土/焦香身躯等 |
| J. 免疫类 | 10+ | 石头脑袋/魔法防守等 |
| K. 画皮 | 1 | Mimikyu 专属 |
| L. 抓人特性 | 3 | 踩影/磁力/沙穴 |
| M. 恶作剧之心 | 1 | 优先度修正 |
| N. 纯朴 | 1 | 忽略能力变化 |
| O. 其他重要 | 5 | 魔法反射/破格等 |
| P. 先制免疫 | 4 | 鲜艳之躯/黄金之躯等 |
| Q. 能力保护 | 8 | 怪力钳/镜甲等 |

---

## 二、详细特性列表

### A. 暴力数值修正 (Stat Modifiers)
| 特性名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Huge Power | 大力士 | 物攻翻倍 |
| Pure Power | 瑜伽之力 | 物攻翻倍 |
| Technician | 技术高手 | 威力≤60的招式威力×1.5 |
| Adaptability | 适应力 | 本系加成从1.5→2.0 |
| Tinted Lens | 有色眼镜 | 效果不好时伤害×2 |

### B. 御三家专属 - 绝境爆发 (Starter Abilities)
| 特性名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Blaze | 猛火 | 红血时火系威力×1.5 |
| Torrent | 激流 | 红血时水系威力×1.5 |
| Overgrow | 茂盛 | 红血时草系威力×1.5 |
| Swarm | 虫之预感 | 红血时虫系威力×1.5 |

### C. 特殊防御/开眼 (Defensive/Immunity)
| 特性名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Levitate | 漂浮 | 免疫地面系 |
| Flash Fire | 引火 | 免疫火系+火系威力×1.5 |
| Water Absorb | 蓄水 | 免疫水系+回复1/4HP |
| Lightning Rod | 避雷针 | 免疫电系+特攻+1 |
| Volt Absorb | 蓄电 | 免疫电系+回复1/4HP |
| Motor Drive | 电气引擎 | 免疫电系+速度+1 |
| Sap Sipper | 食草 | 免疫草系+攻击+1 |
| Storm Drain | 引水 | 免疫水系+特攻+1 |
| Dry Skin | 干燥皮肤 | 免疫水系回复，火系×1.25 |
| Marvel Scale | 神奇鳞片 | 异常状态时防御×1.5 |
| Sturdy | 结实 | 满血时至少保留1HP |
| Wonder Guard | 神奇守护 | 只能被效果绝佳的招式打中 |
| Thick Fat | 厚脂肪 | 火/冰伤害减半 |
| Fur Coat | 毛皮大衣 | 物防翻倍 |
| Filter | 滤镜 | 克制伤害减少25% |
| Solid Rock | 坚硬岩石 | 克制伤害减少25% |
| Multiscale | 多重鳞片 | 满血时伤害减半 |
| Shadow Shield | 暗影盾牌 | 满血时伤害减半 |

### D. 接触类招式反馈 (Contact Reactions)
| 特性名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Rough Skin | 粗糙皮肤 | 接触时反伤1/8 |
| Iron Barbs | 铁刺 | 接触时反伤1/8 |
| Static | 静电 | 接触时30%麻痹 |
| Flame Body | 火焰身躯 | 接触时30%灼伤 |
| Poison Point | 毒刺 | 接触时30%中毒 |
| Cute Charm | 可爱迷人 | 接触时30%着迷 |
| Effect Spore | 孢子 | 接触时30%随机状态 |
| Weak Armor | 碎裂铠甲 | 被物理攻击时防御-1速度+2 |

### E. 入场效果 (On-Start Effects)
| 特性名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Intimidate | 威吓 | 入场降低对手攻击 |
| Drizzle | 降雨 | 入场设置雨天 |
| Drought | 日照 | 入场设置晴天 |
| Sand Stream | 扬沙 | 入场设置沙暴 |
| Snow Warning | 降雪 | 入场设置雪天 |
| Electric Surge | 电气制造者 | 入场设置电气场地 |
| Psychic Surge | 精神制造者 | 入场设置精神场地 |
| Grassy Surge | 青草制造者 | 入场设置青草场地 |
| Misty Surge | 薄雾制造者 | 入场设置薄雾场地 |

### F. 机制怪 (Special Mechanics)
| 特性名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Protean | 变幻自如 | 使用招式前变为该属性 |
| Libero | 利贝罗 | 使用招式前变为该属性 |
| Beast Boost | 异兽提升 | 击杀后提升最高能力 |
| Moxie | 自信过剩 | 击杀后攻击+1 |
| Quark Drive | 夸克充能 | 电气场地/驱劲能量时提升最高能力 |
| Protosynthesis | 古代活性 | 晴天/驱劲能量时提升最高能力 |
| Speed Boost | 加速 | 回合结束速度+1 |
| Slow Start | 慢启动 | 前5回合攻击/速度减半 |
| Truant | 懒惰 | 每隔一回合才能行动 |
| Stall | 慢出 | 永远最后行动 |
| Regenerator | 再生力 | 换下时回复1/3HP |
| Natural Cure | 自然回复 | 换下时治愈异常状态 |
| Unburden | 轻装 | 失去道具后速度翻倍 |
| Trace | 复制 | 入场时复制对手特性 |
| Download | 下载 | 入场时根据对手耐久提升攻击/特攻 |
| Imposter | 变身者 | 入场时自动变身为对手（复制能力值、招式、属性） |
| Illusion | 幻觉 | 伪装成队伍最后一只存活的宝可梦，受伤后破解 |

### G. 招式大师类 (Move Boosters)
| 特性名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Iron Fist | 铁拳 | 拳头类招式威力×1.2 |
| Strong Jaw | 强壮之颚 | 咬类招式威力×1.5 |
| Tough Claws | 硬爪 | 接触类招式威力×1.3 |
| Sheer Force | 蛮力 | 有副作用的招式威力×1.3 |
| Sand Force | 沙之力 | 沙暴中岩/地/钢威力×1.3 |
| Sniper | 狙击手 | 暴击伤害×1.5 |
| Serene Grace | 天恩 | 副作用概率翻倍 |
| Sharpness | 锋锐 | 切割类招式威力×1.5 |
| Mega Launcher | 超级发射器 | 波导/波动类招式威力×1.5 |
| Skill Link | 连续攻击 | 多段攻击固定为最大次数 |
| Reckless | 舍身 | 反伤/撞飞类招式威力×1.2 |
| Infiltrator | 穿透 | 无视光墙/反射壁/替身 |

### H. 能力保护类 (Stat Protection)
| 特性名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Clear Body | 清除之躯 | 免疫能力下降 |
| White Smoke | 白色烟雾 | 免疫能力下降 |
| Full Metal Body | 金属防护 | 免疫能力下降 |
| Defiant | 不服输 | 被降能力时攻击+2 |
| Competitive | 竞争心 | 被降能力时特攻+2 |
| Hyper Cutter | 怪力钳 | 防止攻击降低 |
| Big Pecks | 健壮胸肌 | 防止防御降低 |
| Keen Eye | 锐利目光 | 防止命中率降低+忽略闪避 |
| Mirror Armor | 镜甲 | 反射能力下降给对方 |

### I. 天气加速类 (Weather Speed)
| 特性名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Chlorophyll | 叶绿素 | 晴天速度翻倍 |
| Swift Swim | 悠游自如 | 雨天速度翻倍 |
| Sand Rush | 拨沙 | 沙暴速度翻倍 |
| Slush Rush | 拨雪 | 雪天速度翻倍 |
| Solar Power | 太阳之力 | 晴天特攻×1.5 |
| Quick Feet | 飞毛腿 | 异常状态时速度×1.5 |

### J. 吸收系 (Absorption)
| 特性名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Earth Eater | 食土 | 被地面打回复1/4HP |
| Well-Baked Body | 焦香身躯 | 被火系打防御+2 |

### K. 免疫类 (Immunity)
| 特性名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Rock Head | 石头脑袋 | 不受反伤 |
| Magic Guard | 魔法防守 | 不受天气/状态伤害 |
| Poison Heal | 毒疗 | 中毒时回复HP而非受伤 |
| Soundproof | 隔音 | 免疫声音招式 |
| Guts | 毅力 | 异常状态下物攻×1.5 |
| Defeatist | 软弱 | 半血以下攻击/特攻减半 |
| Damp | 湿气 | 禁止自爆/大爆炸 |
| Overcoat | 防尘 | 免疫粉尘类招式 |
| Bulletproof | 防弹 | 免疫球类招式 |

### L. 状态免疫类 (Status Immunity)
| 特性名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Inner Focus | 精神力 | 免疫畏缩 |
| Own Tempo | 我行我素 | 免疫混乱 |
| Limber | 柔软 | 免疫麻痹 |
| Immunity | 免疫 | 免疫中毒 |
| Water Veil | 水之面纱 | 免疫灼伤 |
| Magma Armor | 熔岩铠甲 | 免疫冰冻 |
| Insomnia | 不眠 | 免疫睡眠 |
| Vital Spirit | 干劲 | 免疫睡眠 |
| Sweet Veil | 甘幕 | 己方全员免疫睡眠 |
| Early Bird | 早起 | 睡眠回合减半 |
| Shed Skin | 蜕皮 | 每回合30%治愈异常状态 |
| Pastel Veil | 粉彩护幕 | 免疫中毒 |
| Purifying Salt | 洁净之盐 | 免疫所有异常状态+幽灵伤害减半 |
| Comatose | 绝对睡眠 | 视为睡眠状态（无法被覆盖） |
| Shields Down | 界限盾壳 | HP>50%时免疫异常状态 |
| Leaf Guard | 叶子防守 | 晴天时免疫异常状态 |
| Corrosion | 腐蚀 | 可以让钢/毒系中毒 |
| Bad Dreams | 梦魇 | 对手睡眠时每回合扣1/8HP |

### M. 画皮 (Disguise)
| 特性名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Disguise | 画皮 | 第一次受伤免疫，自损1/8HP |

### N. 抓人特性 (Trapping)
| 特性名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Shadow Tag | 踩影 | 对手无法换人（幽灵系除外） |
| Magnet Pull | 磁力 | 钢属性无法换人 |
| Arena Trap | 沙穴 | 地面上的对手无法换人 |

### O. 优先度修正 (Priority Modifiers)
| 特性名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Prankster | 恶作剧之心 | 变化技优先度+1（恶系免疫） |

### P. 忽略能力变化 (Ignore Boosts)
| 特性名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Unaware | 纯朴 | 攻击时忽略对手防御提升，防御时忽略对手攻击提升 |

### Q. 其他重要特性 (Other Important)
| 特性名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Magic Bounce | 魔法反射 | 反弹变化技 |
| Mold Breaker | 破格 | 无视对手特性 |
| Teravolt | 兆级电压 | 无视对手特性 |
| Turboblaze | 涡轮火焰 | 无视对手特性 |

### R. 先制免疫 (Priority Immunity)
| 特性名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Dazzling | 鲜艳之躯 | 免疫先制攻击 |
| Queenly Majesty | 女王的威严 | 免疫先制攻击 |
| Armor Tail | 尾甲 | 免疫先制攻击 |
| Good as Gold | 黄金之躯 | 免疫变化招式 |
| Wind Rider | 乘风 | 免疫风类招式+攻击+1 |

### S. 换人保护 (Switch Protection)
| 特性名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Suction Cups | 吸盘 | 防止被强制换下 |
| Sticky Hold | 黏着 | 防止道具被偷/被拍落 |
| Oblivious | 迟钝 | 防止被挑衅和着迷 |

### T. 声音系特性 (Sound-based)
| 特性名 | 中文名 | 效果说明 |
|--------|--------|----------|
| Liquid Voice | 湿润之声 | 声音招式变为水属性 |
| Liquid Voice Pro | 湿润之声Pro | 声音招式变为水属性+威力×1.3（魔改版） |

---

## 三、特性钩子系统说明

### 可用钩子列表
| 钩子名 | 触发时机 | 参数 |
|--------|----------|------|
| `onStart` | 入场时 | (self, enemy, logs, battle) |
| `onEndTurn` | 回合结束时 | (pokemon, logs) |
| `onBeforeMove` | 使用招式前 | (user, move, logs) |
| `onBasePower` | 计算威力时 | (power, attacker, defender, move) |
| `onModifyStat` | 计算能力值时 | (stats, poke, battle) |
| `onModifySTAB` | 计算本系加成时 | (stab) |
| `onModifyEffectiveness` | 计算属性克制时 | (effectiveness) |
| `onModifyPriority` | 计算优先度时 | (priority, user, target, move) |
| `onModifyMove` | 修改招式属性时 | (move, attacker) |
| `onImmunity` | 属性免疫检查 | (atkType, move) |
| `onImmunityStatus` | 状态免疫检查 | (status, pokemon, battle) |
| `onAbsorbHit` | 吸收攻击时 | (pokemon, move, logs) |
| `onTryHit` | 尝试命中时 | (attacker, defender, move, effectiveness) |
| `onTryBoost` | 尝试改变能力时 | (boost, pokemon, source, stat) |
| `onDamageHack` | 伤害修正时 | (damage, defender) |
| `onDefenderModifyDamage` | 防御方伤害修正 | (damage, attacker, defender, move, effectiveness) |
| `onContactDamage` | 接触伤害反馈 | (attacker, defender) |
| `onContactStatus` | 接触状态反馈 | (attacker, defender) |
| `onContactVolatile` | 接触异常状态反馈 | (attacker, defender) |
| `onPhysicalHit` | 被物理攻击时 | (attacker, defender, logs) |
| `onKill` | 击杀对手时 | (attacker, logs) |
| `onAfterStatDrop` | 能力下降后 | (pokemon, stat, stages, logs) |
| `onSwitchOut` | 换下时 | (pokemon) |
| `onStatusDamage` | 状态伤害时 | (pokemon, status) |
| `onCritDamage` | 暴击伤害时 | (damage) |
| `onMoveHitCount` | 决定多段攻击次数 | (move, user) |
| `onModifySecondaryChance` | 修改副作用概率 | (chance, move, user) |
| `onItemLost` | 道具被消耗/拍落时 | (pokemon, item, logs) |
| `onDamageTaken` | 受到伤害后 | (pokemon, damage, source, logs) |

### 特性标记属性
| 属性名 | 说明 |
|--------|------|
| `groundImmune` | 免疫地面系 |
| `wonderGuard` | 神奇守护标记 |
| `noRecoil` | 不受反伤 |
| `noIndirectDamage` | 不受间接伤害 |
| `noFlinch` | 免疫畏缩 |
| `noConfusion` | 免疫混乱 |
| `preventExplosion` | 禁止爆炸 |
| `isTrapping` | 抓人特性 |
| `canTrap` | 抓人条件函数 |
| `ignoreAbility` | 无视对手特性 |
| `ignoreDefenderBoosts` | 忽略防御方能力提升 |
| `ignoreAttackerBoosts` | 忽略攻击方能力提升 |
| `ignoreEvasion` | 忽略闪避 |
| `ignoreScreens` | 无视光墙/反射壁/极光幕 |
| `ignoreSubstitute` | 无视替身 |
| `reflectStatus` | 反弹变化技 |
| `pranksterImmunity` | 恶作剧之心免疫标记 |
| `preventPhazing` | 防止被强制换下 |
| `preventItemTheft` | 防止道具被偷 |
| `preventFlinch` | 防止畏缩 |
| `preventTaunt` | 防止被挑衅 |
| `preventAttract` | 防止被着迷 |
| `canPoisonAny` | 可以让任何属性中毒 |
| `teamSleepImmune` | 队友也免疫睡眠 |
| `earlyBird` | 睡眠回合消耗加倍 |
| `alwaysAsleep` | 视为睡眠状态 |

---

## 四、统计汇总

| 分类 | 数量 |
|------|------|
| 数值修正类 | 9 |
| 免疫/吸收类 | 25+ |
| 入场效果类 | 12 |
| 机制特性类 | 17 |
| 招式增强类 | 12 |
| 能力保护类 | 9 |
| 天气加速类 | 6 |
| 状态免疫类 | 18 |
| 抓人特性 | 3 |
| 其他特性 | 27+ |
| **总计** | **138** |

---

## 五、待检查/潜在问题

1. 部分特性的参数顺序已修复，但需要确认所有调用点都正确
2. 天气值已统一为标准值（sun/rain/sandstorm/snow）
3. ~~**Serene Grace** 目前是空实现~~ ✅ 已实现 `onModifySecondaryChance` 钩子
4. ~~**Imposter/Illusion** 需要在 UI 层支持~~ ✅ 已实现 `displaySpriteId` 和 `displayCnName`
5. ~~**Infiltrator** 标记未使用~~ ✅ 已在 `battle-calc.js` 和 `move-effects.js` 中实现
6. ~~**Damp** 标记未使用~~ ✅ 已在 `move-handlers.js` 中实现

---

## 六、2024-01 新增特性

### 核心攻击组件 (The Powerhouses)
| 特性名 | 中文名 | 效果说明 | 代表宝可梦 |
|--------|--------|----------|-----------|
| Skill Link | 连续攻击 | 多段攻击固定为最大次数 | 刺甲贝、赫拉克罗斯 |
| Infiltrator | 穿透 | 无视光墙/反射壁/替身 | 多龙巴鲁托 |
| Serene Grace | 天恩 | 副作用概率翻倍 | 波克基斯、基拉祈 |
| Reckless | 舍身 | 反伤/撞飞类招式威力×1.2 | 姆克鹰 |
| Unburden | 轻装 | 失去道具后速度翻倍 | 摔角鹰人 |

### 信息读取类 (Surveillance & Reaction)
| 特性名 | 中文名 | 效果说明 | 代表宝可梦 |
|--------|--------|----------|-----------|
| Trace | 复制 | 入场时复制对手特性 | 沙奈朵、多边兽2 |
| Download | 下载 | 入场时根据对手耐久提升攻击/特攻 | 多边兽Z、盖诺赛克特 |

### 受队与回复 (Stall & Protection)
| 特性名 | 中文名 | 效果说明 | 代表宝可梦 |
|--------|--------|----------|-----------|
| Natural Cure | 自然回复 | 换下时治愈异常状态 | 幸福蛋、宝石海星 |

### 极高难度机制 (Complexity Nightmare)
| 特性名 | 中文名 | 效果说明 | 代表宝可梦 |
|--------|--------|----------|-----------|
| Imposter | 变身者 | 入场时自动变身为对手（复制能力值、招式、属性，HP保留） | 百变怪 |
| Illusion | 幻觉 | 伪装成队伍最后一只存活的宝可梦，受伤后破解 | 索罗亚克 |

### 新增钩子
| 钩子名 | 触发时机 | 用途 |
|--------|----------|------|
| `onMoveHitCount` | 决定多段攻击次数 | Skill Link |
| `onModifySecondaryChance` | 修改副作用概率 | Serene Grace |
| `onItemLost` | 道具被消耗/拍落时 | Unburden |
| `onDamageTaken` | 受到伤害后 | Illusion 幻觉破解 |

### 新增标记属性
| 属性名 | 说明 | 用途 |
|--------|------|------|
| `ignoreScreens` | 无视光墙/反射壁/极光幕 | Infiltrator |
| `ignoreSubstitute` | 无视替身 | Infiltrator |

### UI 支持
- `displaySpriteId`: 伪装精灵图 ID（Imposter/Illusion）
- `displayCnName`: 伪装中文名（Imposter/Illusion）
- `window.updateBattleSprites()`: 刷新战斗精灵图显示

