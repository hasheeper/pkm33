# 已实现道具列表 (Implemented Items)

> 生成日期: 2026-01-05
> 来源文件: `engine/items-data.js`
> 总计: **~120个道具**

---

## 一、道具分类总览

| 分类 | 数量 | 说明 |
|------|------|------|
| 战斗道具 | 20+ | 气势披带、讲究系列、生命宝珠等 |
| 属性强化道具 | 18 | 木炭、神秘水滴等 |
| 太晶珠 | 2 | 太晶珠、星晶太晶珠 |
| 精灵球 | 15 | 各类精灵球 |
| 树果 - 回复类 | 7 | 橙橙果、文柚果、混乱果等 |
| 树果 - 状态治愈 | 7 | 樱子果、零余果、木子果等 |
| 树果 - 抗性类 | 18 | 各属性半伤果 |
| 树果 - 危机强化 | 8 | 枝荔果、星桃果等 |
| 神兽专属道具 | 8 | 金刚玉、腐朽的剑等 |
| 专属强化道具 | 6 | 电气球、粗骨头等 |

---

## 二、详细道具列表

### A. 战斗道具 (Battle Items)

| 道具ID | 英文名 | 中文名 | 效果说明 |
|--------|--------|--------|----------|
| focussash | Focus Sash | 气势披带 | 满血时致命伤害保留1HP（一次性） |
| choiceband | Choice Band | 讲究头带 | 物攻×1.5，锁招 |
| choicescarf | Choice Scarf | 讲究围巾 | 速度×1.5，锁招 |
| choicespecs | Choice Specs | 讲究眼镜 | 特攻×1.5，锁招 |
| lifeorb | Life Orb | 生命宝珠 | 伤害×1.3，每次攻击损失10%HP |
| leftovers | Leftovers | 剩饭 | 每回合恢复1/16HP |
| blacksludge | Black Sludge | 黑色淤泥 | 毒系恢复1/16HP，非毒系损失1/8HP |
| eviolite | Eviolite | 进化奇石 | 未完全进化时防御/特防×1.5 |
| assaultvest | Assault Vest | 突击背心 | 特防×1.5，禁用变化技 |
| airballoon | Air Balloon | 气球 | 免疫地面，被攻击后破裂 |
| lightclay | Light Clay | 光之黏土 | 壁类招式持续8回合 |
| rockyhelmet | Rocky Helmet | 凸凸头盔 | 接触攻击者损失1/6HP |
| safetygoggles | Safety Goggles | 防尘护目镜 | 免疫粉末招式和天气伤害 |
| expertbelt | Expert Belt | 达人带 | 效果拔群时伤害×1.2 |
| weaknesspolicy | Weakness Policy | 弱点保险 | 被弱点攻击后攻击/特攻+2（一次性） |
| flameorb | Flame Orb | 火焰宝珠 | 回合结束时自己灼伤 |
| toxicorb | Toxic Orb | 剧毒宝珠 | 回合结束时自己剧毒 |
| heavydutyboots | Heavy-Duty Boots | 厚底靴 | 免疫入场危害 |
| redcard | Red Card | 红牌 | 被攻击后强制对方换人（一次性） |
| ejectbutton | Eject Button | 逃脱按键 | 被攻击后自己换人（一次性） |
| ejectpack | Eject Pack | 携带逃跑包 | 能力下降时换人（一次性） |

### B. 属性强化道具 (Type-Boosting Items)

| 道具ID | 英文名 | 中文名 | 强化属性 |
|--------|--------|--------|----------|
| charcoal | Charcoal | 木炭 | 火 ×1.2 |
| mysticwater | Mystic Water | 神秘水滴 | 水 ×1.2 |
| miracleseed | Miracle Seed | 奇迹种子 | 草 ×1.2 |
| magnet | Magnet | 磁铁 | 电 ×1.2 |
| nevermeltice | Never-Melt Ice | 不融冰 | 冰 ×1.2 |
| blackbelt | Black Belt | 黑带 | 格斗 ×1.2 |
| poisonbarb | Poison Barb | 毒针 | 毒 ×1.2 |
| softsand | Soft Sand | 柔软沙子 | 地面 ×1.2 |
| sharpbeak | Sharp Beak | 锐利鸟嘴 | 飞行 ×1.2 |
| twistedspoon | Twisted Spoon | 弯曲的汤匙 | 超能力 ×1.2 |
| silverpowder | Silver Powder | 银粉 | 虫 ×1.2 |
| hardstone | Hard Stone | 硬石头 | 岩石 ×1.2 |
| spelltag | Spell Tag | 诅咒之符 | 幽灵 ×1.2 |
| dragonfang | Dragon Fang | 龙之牙 | 龙 ×1.2 |
| blackglasses | Black Glasses | 黑色眼镜 | 恶 ×1.2 |
| metalcoat | Metal Coat | 金属膜 | 钢 ×1.2 |
| silkscarf | Silk Scarf | 丝绸围巾 | 一般 ×1.2 |
| fairyfeather | Fairy Feather | 妖精之羽 | 妖精 ×1.2 |

### C. 太晶珠 (Tera Orbs)

| 道具ID | 英文名 | 中文名 | 效果说明 |
|--------|--------|--------|----------|
| teraorb | Tera Orb | 太晶珠 | 允许太晶化 |
| stellarteraorb | Stellar Tera Orb | 星晶太晶珠 | 星晶太晶化（本系2.0x，非本系1.2x） |

### D. 精灵球 (Poké Balls)

| 道具ID | 英文名 | 中文名 | 捕获率 |
|--------|--------|--------|--------|
| pokeball | Poké Ball | 精灵球 | 1x |
| greatball | Great Ball | 超级球 | 1.5x |
| ultraball | Ultra Ball | 高级球 | 2x |
| masterball | Master Ball | 大师球 | 必定捕获 |
| premierball | Premier Ball | 纪念球 | 1x |
| quickball | Quick Ball | 速度球 | 第一回合5x |
| timerball | Timer Ball | 计时球 | 随回合增加 |
| duskball | Dusk Ball | 黑暗球 | 夜晚/洞穴3x |
| healball | Heal Ball | 治愈球 | 捕获后回复 |
| netball | Net Ball | 捕网球 | 水/虫3.5x |
| diveball | Dive Ball | 潜水球 | 水中3.5x |
| luxuryball | Luxury Ball | 豪华球 | 亲密度加成 |
| repeatball | Repeat Ball | 重复球 | 已捕获种类3.5x |
| beastball | Beast Ball | 究极球 | 究极异兽5x |
| dreamball | Dream Ball | 梦境球 | 睡眠状态4x |

### E. 树果 - 回复类 (Healing Berries)

| 道具ID | 英文名 | 中文名 | 效果说明 |
|--------|--------|--------|----------|
| oranberry | Oran Berry | 橙橙果 | HP≤50%时回复10HP |
| sitrusberry | Sitrus Berry | 文柚果 | HP≤50%时回复25%HP |
| figyberry | Figy Berry | 勿花果 | HP≤25%时回复1/3HP（减攻击性格混乱） |
| wikiberry | Wiki Berry | 异奇果 | HP≤25%时回复1/3HP（减特攻性格混乱） |
| magoberry | Mago Berry | 芒芒果 | HP≤25%时回复1/3HP（减速度性格混乱） |
| aguavberry | Aguav Berry | 芭亚果 | HP≤25%时回复1/3HP（减特防性格混乱） |
| iapapaberry | Iapapa Berry | 乐芭果 | HP≤25%时回复1/3HP（减防御性格混乱） |

### F. 树果 - 状态治愈 (Status Cure Berries)

| 道具ID | 英文名 | 中文名 | 治愈状态 |
|--------|--------|--------|----------|
| cheriberry | Cheri Berry | 樱子果 | 麻痹 |
| chestoberry | Chesto Berry | 零余果 | 睡眠 |
| pechaberry | Pecha Berry | 桃桃果 | 中毒 |
| rawstberry | Rawst Berry | 莓莓果 | 灼伤 |
| aspearberry | Aspear Berry | 利木果 | 冰冻 |
| persimberry | Persim Berry | 柿仔果 | 混乱 |
| lumberry | Lum Berry | 木子果 | 所有异常状态 |

### G. 树果 - 抗性类 (Resist Berries)

| 道具ID | 英文名 | 中文名 | 抗性属性 |
|--------|--------|--------|----------|
| occaberry | Occa Berry | 枝荔果 | 火 |
| passhoberry | Passho Berry | 番荔果 | 水 |
| wacanberry | Wacan Berry | 莲蒲果 | 电 |
| rindoberry | Rindo Berry | 龙睛果 | 草 |
| yacheberry | Yache Berry | 雪莲果 | 冰 |
| chopleberry | Chople Berry | 罗子果 | 格斗 |
| kebiaberry | Kebia Berry | 草蚕果 | 毒 |
| shucaberry | Shuca Berry | 沙鳞果 | 地面 |
| cobaberry | Coba Berry | 勿花果 | 飞行 |
| payapaberry | Payapa Berry | 芭乐果 | 超能力 |
| tangaberry | Tanga Berry | 扁樱果 | 虫 |
| chartiberry | Charti Berry | 岩荔果 | 岩石 |
| kasibberry | Kasib Berry | 幽灵果 | 幽灵 |
| habanberry | Haban Berry | 哈密果 | 龙 |
| colburberry | Colbur Berry | 霹霹果 | 恶 |
| babiriberry | Babiri Berry | 霸比果 | 钢 |
| chilanberry | Chilan Berry | 奇朗果 | 一般 |
| roseliberry | Roseli Berry | 蔷薇果 | 妖精 |

### H. 树果 - 危机强化 (Pinch Berries)

| 道具ID | 英文名 | 中文名 | 效果说明 |
|--------|--------|--------|----------|
| liechiberry | Liechi Berry | 枝荔果 | HP≤25%时攻击+1 |
| ganlonberry | Ganlon Berry | 龙睛果 | HP≤25%时防御+1 |
| salacberry | Salac Berry | 沙鳞果 | HP≤25%时速度+1 |
| petayaberry | Petaya Berry | 龙火果 | HP≤25%时特攻+1 |
| apicotberry | Apicot Berry | 杏仔果 | HP≤25%时特防+1 |
| starfberry | Starf Berry | 星桃果 | HP≤25%时随机能力+2 |
| lansatberry | Lansat Berry | 兰萨果 | HP≤25%时聚气状态 |
| custapberry | Custap Berry | 释陀果 | HP≤25%时下次先制 |

### I. 神兽专属道具 (Legendary Items)

| 道具ID | 英文名 | 中文名 | 专属宝可梦 | 效果 |
|--------|--------|--------|------------|------|
| adamantorb | Adamant Orb | 金刚玉 | 帝牙卢卡 | 钢/龙×1.2 |
| lustrousorb | Lustrous Orb | 白玉宝珠 | 帕路奇亚 | 水/龙×1.2 |
| griseousorb | Griseous Orb | 白金玉 | 骑拉帝纳 | 幽灵/龙×1.2，起源形态 |
| souldew | Soul Dew | 心之水滴 | 拉帝欧斯/拉帝亚斯 | 超能力/龙×1.2 |
| redorb | Red Orb | 红色宝珠 | 固拉多 | 原始回归 |
| blueorb | Blue Orb | 蓝色宝珠 | 盖欧卡 | 原始回归 |
| rustedsword | Rusted Sword | 腐朽的剑 | 苍响 | 剑之王形态 |
| rustedshield | Rusted Shield | 腐朽的盾 | 藏玛然特 | 盾之王形态 |

### J. 专属强化道具 (Species-Specific Items)

| 道具ID | 英文名 | 中文名 | 专属宝可梦 | 效果 |
|--------|--------|--------|------------|------|
| lightball | Light Ball | 电气球 | 皮卡丘 | 攻击/特攻×2 |
| thickclub | Thick Club | 粗骨头 | 卡拉卡拉/嘎啦嘎啦 | 攻击×2 |
| leek | Leek | 大葱 | 大葱鸭/葱游兵 | 会心率+2 |
| luckypunch | Lucky Punch | 幸运拳套 | 吉利蛋 | 会心率+2 |
| metalpowder | Metal Powder | 金属粉 | 百变怪（未变身） | 防御×2 |
| quickpowder | Quick Powder | 速度粉 | 百变怪（未变身） | 速度×2 |

---

## 三、道具效果处理器 (ItemEffects)

| 函数名 | 说明 |
|--------|------|
| `checkFocusSash(pokemon, damage)` | 检查气势披带效果 |
| `isChoiceLocked(pokemon)` | 检查是否被讲究道具锁招 |
| `getScreenDuration(pokemon)` | 获取壁持续回合数（光之黏土） |
| `getBallCatchRate(ballId, context)` | 获取精灵球捕获率 |
| `checkResistBerry(pokemon, moveType, effectiveness)` | 检查抗性树果减伤 |
| `checkHPBerry(pokemon, logs)` | 检查HP阈值触发的树果 |
| `checkStatusBerry(pokemon, logs)` | 检查状态治愈树果 |

---

## 四、工具函数

| 函数名 | 说明 |
|--------|------|
| `getItem(itemName)` | 根据名称/ID获取道具数据 |
| `getItemId(itemName)` | 获取规范化道具ID |
| `getAllPokeballs()` | 获取所有精灵球 |
| `getAllBerries()` | 获取所有树果 |
| `isChoiceItem(itemName)` | 检查是否为讲究道具 |
| `isMegaStone(itemId)` | 检查是否为Mega石 |
| `isZCrystal(itemId)` | 检查是否为Z水晶 |
| `isSwappable(itemId)` | 检查道具是否可交换 |

---

## 五、统计汇总

| 分类 | 数量 |
|------|------|
| 战斗道具 | 21 |
| 属性强化道具 | 18 |
| 太晶珠 | 2 |
| 精灵球 | 15 |
| 树果 | 40 |
| 神兽专属道具 | 8 |
| 专属强化道具 | 6 |
| **总计** | **~160** |

---

## 六、2026-01 新增道具

### 消耗型香草 (Consumable Herbs) - 强化战术核心
| 道具ID | 英文名 | 中文名 | 效果说明 | 代表战术 |
|--------|--------|--------|----------|----------|
| whiteherb | White Herb | 白色香草 | 能力下降时自动还原（一次性） | 破壳梦 |
| powerherb | Power Herb | 强力香草 | 蓄力技能瞬发（一次性） | 大地掌控/流星光束 |
| mentalherb | Mental Herb | 精神香草 | 解除挑衅/再来一次等（一次性） | 空间队 |

### 天气岩石 (Weather Rocks) - 天气队核心
| 道具ID | 英文名 | 中文名 | 效果说明 |
|--------|--------|--------|----------|
| heatrock | Heat Rock | 热岩石 | 晴天持续8回合 |
| damprock | Damp Rock | 潮湿岩石 | 雨天持续8回合 |
| smoothrock | Smooth Rock | 沙沙岩石 | 沙暴持续8回合 |
| icyrock | Icy Rock | 冰冷岩石 | 雪天持续8回合 |

### 场地种子 (Terrain Seeds) - 场地队/轻装核心
| 道具ID | 英文名 | 中文名 | 效果说明 |
|--------|--------|--------|----------|
| electricseed | Electric Seed | 电气种子 | 电气场地时防御+1 |
| grassyseed | Grassy Seed | 青草种子 | 青草场地时防御+1 |
| mistyseed | Misty Seed | 薄雾种子 | 薄雾场地时特防+1 |
| psychicseed | Psychic Seed | 精神种子 | 精神场地时特防+1 |
| terrainextender | Terrain Extender | 大地膜 | 场地持续8回合 |

### 战术针对型道具 (Niche Tech Items)
| 道具ID | 英文名 | 中文名 | 效果说明 | 代表战术 |
|--------|--------|--------|----------|----------|
| shedshell | Shed Shell | 漂亮外壳 | 无视踩影/磁力换人 | 反制抓人 |
| normalgem | Normal Gem | 一般宝石 | 一般招式威力×1.3（一次性） | 大爆炸 |
| flyinggem | Flying Gem | 飞行宝石 | 飞行招式威力×1.3（一次性） | 杂技 |
| metronomeitem | Metronome | 节拍器 | 连续同招威力递增（最高×2.0） | 连打战术 |
| boosterenergy | Booster Energy | 驱劲能量 | 激活古代活性/夸克充能 | 悖谬种 |

### 属性石板 (Plates) - 阿尔宙斯专属 (17块)
| 道具ID | 英文名 | 中文名 | 对应属性 |
|--------|--------|--------|----------|
| flameplate | Flame Plate | 火之石板 | Fire |
| splashplate | Splash Plate | 水之石板 | Water |
| meadowplate | Meadow Plate | 草之石板 | Grass |
| zapplate | Zap Plate | 雷之石板 | Electric |
| icicleplate | Icicle Plate | 冰之石板 | Ice |
| fistplate | Fist Plate | 拳之石板 | Fighting |
| toxicplate | Toxic Plate | 毒之石板 | Poison |
| earthplate | Earth Plate | 地之石板 | Ground |
| skyplate | Sky Plate | 天之石板 | Flying |
| mindplate | Mind Plate | 心之石板 | Psychic |
| insectplate | Insect Plate | 虫之石板 | Bug |
| stoneplate | Stone Plate | 岩之石板 | Rock |
| spookyplate | Spooky Plate | 妖之石板 | Ghost |
| dracoplate | Draco Plate | 龙之石板 | Dragon |
| dreadplate | Dread Plate | 恶之石板 | Dark |
| ironplate | Iron Plate | 钢之石板 | Steel |
| pixieplate | Pixie Plate | 妖之石板 | Fairy |

### 新增 ItemEffects 函数
| 函数名 | 说明 |
|--------|------|
| `checkWhiteHerb(pokemon, stat, stages, logs)` | 白色香草触发检查 |
| `checkMentalHerb(pokemon, condition, logs)` | 精神香草触发检查 |
| `getWeatherDuration(pokemon, weather)` | 获取天气持续回合数 |
| `checkTerrainSeed(pokemon, terrain, logs)` | 场地种子触发检查 |
| `getTerrainDuration(pokemon)` | 获取场地持续回合数 |
| `checkTypeGem(pokemon, moveType, logs)` | 属性宝石触发检查 |
| `canEscapeTrapping(pokemon)` | 漂亮外壳换人检查 |
| `getMetronomeBoost(pokemon, moveName)` | 节拍器威力加成 |
| `getPlateBoost(pokemon, moveType)` | 石板威力加成 |

---

## 七、战术完成度评估

| 战术类型 | 完成度 | 说明 |
|----------|--------|------|
| 纯攻队 | 95% | 命玉、围巾、头带齐全 |
| 天气队 | 90% | 天气岩石已添加 |
| 场地队 | 90% | 场地种子+大地膜已添加 |
| 强化接力/空间队 | 85% | 白色香草+精神香草已添加 |
| 阿尔宙斯 | 100% | 17块石板齐全 |

---
