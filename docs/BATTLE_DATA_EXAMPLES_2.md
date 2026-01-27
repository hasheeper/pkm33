# 战斗数据示例 (第二组) - 高级环境功能测试

> 以下 JSON 可直接复制到 `getDefaultBattleData()` 的 return 语句中使用

---

## 示例 6：类型转换测试 - 电离风暴

**测试重点**：`ToType:Normal>Electric` 类型转换、电系增强

```json
{"settings":{"enableAVS":true,"enableCommander":true,"enableEVO":true,"enableBGM":true,"enableSFX":true,"enableClash":false,"enableEnvironment":true},"difficulty":"hard","player":{"name":"Normal Master","trainerProficiency":120,"party":[{"name":"Snorlax","lv":78,"gender":"M","nature":"Adamant","ability":"Thick Fat","item":"Leftovers","isAce":true,"isLead":true,"stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31}},"moves":["Body Slam","Earthquake","Crunch","Rest"],"avs":{"trust":180,"passion":100,"insight":60,"devotion":200}},{"name":"Porygon-Z","lv":80,"gender":null,"nature":"Modest","ability":"Adaptability","item":"Choice Specs","isAce":true,"stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":10,"def":31,"spa":31,"spd":31,"spe":31}},"moves":["Tri Attack","Thunderbolt","Ice Beam","Shadow Ball"],"avs":{"trust":140,"passion":180,"insight":120,"devotion":100}}],"unlocks":{"enable_bond":false,"enable_styles":true,"enable_insight":true,"enable_mega":false,"enable_z_move":false,"enable_dynamax":false,"enable_tera":true,"enable_proficiency_cap":true}},"enemy":{"id":"Ground Fortress","type":"trainer","name":"Ground Fortress","trainerProficiency":130,"lines":{"intro":"地面系免疫电系？在这片电离风暴中，你的普通系技能都会变成电系！"},"unlocks":{"enable_bond":false,"enable_styles":true,"enable_insight":false,"enable_mega":false,"enable_z_move":false,"enable_dynamax":false,"enable_tera":false,"enable_proficiency_cap":false}},"party":[{"name":"Hippowdon","lv":78,"gender":"M","nature":"Impish","ability":"Sand Stream","item":"Leftovers","stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31}},"moves":["Earthquake","Stone Edge","Slack Off","Stealth Rock"]},{"name":"Gastrodon","lv":76,"gender":"F","nature":"Bold","ability":"Storm Drain","item":"Leftovers","stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":10,"def":31,"spa":31,"spd":31,"spe":31}},"moves":["Scald","Earth Power","Recover","Toxic"]}],"script":null,"environment":{"weather":null,"weatherTurns":0,"overlay":{"env_name":"电离风暴","narrative":"空气中充满了电离子，普通系招式被电化...","rules":[{"target":"ALL","eff":["ToType:Normal>Electric"]},{"target":"Type:Electric","eff":["SpA:1.3","Spe:1.2"]},{"target":"MoveType:Electric","eff":["Dmg:1.2"]}]}}}
```

**验证点**：
- Body Slam (普通系) 应该变成电系，对地面系无效
- Tri Attack (普通系) 应该变成电系
- 控制台应显示 `[ENV OVERLAY] 🔄 技能类型转换`

---

## 示例 7：技能禁用测试 - 封印结界

**测试重点**：`Ban:Type` 技能禁用、挣扎后备机制

```json
{"settings":{"enableAVS":true,"enableCommander":true,"enableEVO":true,"enableBGM":true,"enableSFX":true,"enableClash":false,"enableEnvironment":true},"difficulty":"hard","player":{"name":"Fire Trainer","trainerProficiency":100,"party":[{"name":"Charizard","lv":75,"gender":"M","nature":"Timid","ability":"Blaze","item":"Choice Specs","isAce":true,"isLead":true,"stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":10,"def":31,"spa":31,"spd":31,"spe":31}},"moves":["Flamethrower","Air Slash","Dragon Pulse","Focus Blast"],"avs":{"trust":160,"passion":200,"insight":80,"devotion":120}},{"name":"Arcanine","lv":73,"gender":"M","nature":"Adamant","ability":"Intimidate","item":"Life Orb","isAce":true,"stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31}},"moves":["Flare Blitz","Extreme Speed","Wild Charge","Close Combat"],"avs":{"trust":180,"passion":160,"insight":60,"devotion":140}}],"unlocks":{"enable_bond":false,"enable_styles":true,"enable_insight":true,"enable_mega":false,"enable_z_move":false,"enable_dynamax":false,"enable_tera":false,"enable_proficiency_cap":true}},"enemy":{"id":"Seal Master","type":"trainer","name":"Seal Master","trainerProficiency":140,"lines":{"intro":"在这片封印结界中，火焰和飞行的力量都被封印了..."},"unlocks":{"enable_bond":false,"enable_styles":true,"enable_insight":false,"enable_mega":false,"enable_z_move":false,"enable_dynamax":false,"enable_tera":false,"enable_proficiency_cap":false}},"party":[{"name":"Blastoise","lv":78,"gender":"M","nature":"Bold","ability":"Torrent","item":"Leftovers","stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":10,"def":31,"spa":31,"spd":31,"spe":31}},"moves":["Scald","Ice Beam","Rapid Spin","Toxic"]},{"name":"Swampert","lv":80,"gender":"M","nature":"Adamant","ability":"Torrent","item":"Choice Band","stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31}},"moves":["Earthquake","Waterfall","Ice Punch","Stone Edge"]}],"script":null,"environment":{"weather":null,"weatherTurns":0,"overlay":{"env_name":"封印结界","narrative":"古老的封印阵法压制着火焰与飞行的力量...","rules":[{"target":"ALL","eff":["Ban:Fire","Ban:Flying"]},{"target":"Type:Water","eff":["Def:1.3","SpD:1.3"]}]}}}
```

**验证点**：
- Charizard 的 Flamethrower 和 Air Slash 应该被禁用（按钮变灰）
- 如果所有技能都被禁用，应该出现"挣扎"按钮
- 控制台应显示 `[ENV BAN UI]` 日志

---

## 示例 8：属性免疫测试 - 虚空领域

**测试重点**：`Immune:Type` 属性免疫、`Weak:Type` 追加弱点

```json
{"settings":{"enableAVS":true,"enableCommander":true,"enableEVO":true,"enableBGM":true,"enableSFX":true,"enableClash":false,"enableEnvironment":true},"difficulty":"expert","player":{"name":"Dragon Tamer","trainerProficiency":140,"party":[{"name":"Dragonite","lv":82,"gender":"M","nature":"Adamant","ability":"Multiscale","item":"Lum Berry","isAce":true,"isLead":true,"stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":31,"def":31,"spa":20,"spd":31,"spe":31}},"moves":["Dragon Dance","Outrage","Earthquake","Extreme Speed"],"avs":{"trust":200,"passion":220,"insight":100,"devotion":180}},{"name":"Salamence","lv":80,"gender":"F","nature":"Naive","ability":"Intimidate","item":"Life Orb","isAce":true,"mechanic":"mega","stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":31,"def":31,"spa":31,"spd":31,"spe":31}},"moves":["Draco Meteor","Fire Blast","Earthquake","Roost"],"avs":{"trust":180,"passion":200,"insight":80,"devotion":160}}],"unlocks":{"enable_bond":false,"enable_styles":true,"enable_insight":true,"enable_mega":true,"enable_z_move":false,"enable_dynamax":false,"enable_tera":false,"enable_proficiency_cap":true}},"enemy":{"id":"Void Walker","type":"trainer","name":"Void Walker","trainerProficiency":150,"lines":{"intro":"虚空领域扭曲了属性法则...龙系在这里变得脆弱，而冰系的威胁被消除了。"},"unlocks":{"enable_bond":false,"enable_styles":true,"enable_insight":true,"enable_mega":false,"enable_z_move":false,"enable_dynamax":false,"enable_tera":false,"enable_proficiency_cap":false}},"party":[{"name":"Togekiss","lv":80,"gender":"F","nature":"Timid","ability":"Serene Grace","item":"Choice Scarf","stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":10,"def":31,"spa":31,"spd":31,"spe":31}},"moves":["Air Slash","Dazzling Gleam","Ice Beam","Aura Sphere"]},{"name":"Clefable","lv":78,"gender":"F","nature":"Bold","ability":"Magic Guard","item":"Leftovers","stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":10,"def":31,"spa":31,"spd":31,"spe":31}},"moves":["Moonblast","Soft-Boiled","Calm Mind","Thunder Wave"]}],"script":null,"environment":{"weather":null,"weatherTurns":0,"overlay":{"env_name":"虚空领域","narrative":"空间扭曲，属性法则被改写...","rules":[{"target":"Type:Dragon","eff":["Immune:Ice","Weak:Fairy","Def:0.8"]},{"target":"Type:Fairy","eff":["SpA:1.4","Spe:1.2"]},{"target":"MoveType:Dragon","eff":["Dmg:0.7"]}]}}}
```

**验证点**：
- 龙系应该免疫冰系攻击
- 龙系对妖精系弱点 x2（叠加原本弱点变成 x4）
- 龙系技能伤害 -30%

---

## 示例 9：复合环境测试 - 混沌风暴

**测试重点**：多重效果叠加、乘算验证

```json
{"settings":{"enableAVS":true,"enableCommander":true,"enableEVO":true,"enableBGM":true,"enableSFX":true,"enableClash":false,"enableEnvironment":true},"difficulty":"expert","player":{"name":"Chaos Rider","trainerProficiency":150,"party":[{"name":"Tyranitar","lv":85,"gender":"M","nature":"Adamant","ability":"Sand Stream","item":"Choice Band","isAce":true,"isLead":true,"stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31}},"moves":["Stone Edge","Crunch","Earthquake","Fire Punch"],"avs":{"trust":180,"passion":220,"insight":100,"devotion":160}},{"name":"Hydreigon","lv":83,"gender":"M","nature":"Timid","ability":"Levitate","item":"Life Orb","isAce":true,"stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":10,"def":31,"spa":31,"spd":31,"spe":31}},"moves":["Dark Pulse","Draco Meteor","Flash Cannon","Fire Blast"],"avs":{"trust":160,"passion":200,"insight":120,"devotion":140}}],"unlocks":{"enable_bond":false,"enable_styles":true,"enable_insight":true,"enable_mega":false,"enable_z_move":false,"enable_dynamax":false,"enable_tera":true,"enable_proficiency_cap":true}},"enemy":{"id":"Order Knight","type":"trainer","name":"Order Knight","trainerProficiency":145,"lines":{"intro":"混沌风暴中，恶与龙的力量被削弱，而钢与妖精则获得祝福！"},"unlocks":{"enable_bond":false,"enable_styles":true,"enable_insight":true,"enable_mega":false,"enable_z_move":false,"enable_dynamax":false,"enable_tera":false,"enable_proficiency_cap":false}},"party":[{"name":"Mawile","lv":82,"gender":"F","nature":"Adamant","ability":"Intimidate","item":"Mawilite","mechanic":"mega","stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31}},"moves":["Play Rough","Iron Head","Sucker Punch","Swords Dance"]},{"name":"Scizor","lv":80,"gender":"M","nature":"Adamant","ability":"Technician","item":"Choice Band","stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31}},"moves":["Bullet Punch","U-turn","Superpower","Knock Off"]},{"name":"Gardevoir","lv":80,"gender":"F","nature":"Timid","ability":"Trace","item":"Choice Scarf","stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":10,"def":31,"spa":31,"spd":31,"spe":31}},"moves":["Moonblast","Psychic","Focus Blast","Shadow Ball"]}],"script":null,"environment":{"weather":null,"weatherTurns":0,"overlay":{"env_name":"混沌风暴","narrative":"秩序与混沌的力量在此交锋...","rules":[{"target":"Type:Dark","eff":["Atk:0.7","SpA:0.7","Spe:0.8"]},{"target":"Type:Dragon","eff":["Def:0.8","SpD:0.8"]},{"target":"Type:Steel","eff":["Def:1.3","Atk:1.2"]},{"target":"Type:Fairy","eff":["SpA:1.4","Spe:1.2","HP:0.0625"]},{"target":"MoveType:Dark","eff":["Dmg:0.6"]},{"target":"MoveType:Fairy","eff":["Dmg:1.3"]}]}}}
```

**验证点**：
- 恶系攻击/特攻/速度都被削弱
- 钢系防御和攻击增强
- 妖精系每回合回复 6.25% HP
- 恶系技能伤害 -40%，妖精系技能伤害 +30%

---

## 示例 10：极端环境测试 - 绝对零度

**测试重点**：极端数值修正、上下限验证

```json
{"settings":{"enableAVS":true,"enableCommander":true,"enableEVO":true,"enableBGM":true,"enableSFX":true,"enableClash":false,"enableEnvironment":true},"difficulty":"expert","player":{"name":"Ice Queen","trainerProficiency":160,"party":[{"name":"Kyurem","lv":88,"gender":null,"nature":"Timid","ability":"Pressure","item":"Choice Specs","isAce":true,"isLead":true,"stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":10,"def":31,"spa":31,"spd":31,"spe":31}},"moves":["Ice Beam","Draco Meteor","Earth Power","Flash Cannon"],"avs":{"trust":200,"passion":180,"insight":140,"devotion":160}},{"name":"Weavile","lv":85,"gender":"F","nature":"Jolly","ability":"Pressure","item":"Focus Sash","isAce":true,"stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31}},"moves":["Triple Axel","Knock Off","Ice Shard","Low Kick"],"avs":{"trust":160,"passion":220,"insight":100,"devotion":120}}],"unlocks":{"enable_bond":false,"enable_styles":true,"enable_insight":true,"enable_mega":false,"enable_z_move":false,"enable_dynamax":false,"enable_tera":true,"enable_proficiency_cap":true}},"enemy":{"id":"Flame Emperor","type":"trainer","name":"Flame Emperor","trainerProficiency":155,"lines":{"intro":"绝对零度领域？火焰的意志不会被冻结！"},"unlocks":{"enable_bond":false,"enable_styles":true,"enable_insight":true,"enable_mega":false,"enable_z_move":false,"enable_dynamax":false,"enable_tera":false,"enable_proficiency_cap":false}},"party":[{"name":"Blaziken","lv":85,"gender":"M","nature":"Adamant","ability":"Speed Boost","item":"Life Orb","stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31}},"moves":["Flare Blitz","Close Combat","Thunder Punch","Swords Dance"]},{"name":"Volcarona","lv":83,"gender":"F","nature":"Timid","ability":"Flame Body","item":"Heavy-Duty Boots","stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":10,"def":31,"spa":31,"spd":31,"spe":31}},"moves":["Quiver Dance","Fire Blast","Bug Buzz","Giga Drain"]},{"name":"Heatran","lv":85,"gender":"M","nature":"Modest","ability":"Flash Fire","item":"Leftovers","stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":10,"def":31,"spa":31,"spd":31,"spe":31}},"moves":["Magma Storm","Earth Power","Flash Cannon","Stealth Rock"]}],"script":null,"environment":{"weather":"hail","weatherTurns":0,"overlay":{"env_name":"绝对零度","narrative":"极寒的冰霜覆盖一切，火焰在此处被压制...","rules":[{"target":"Type:Ice","eff":["SpA:1.5","Spe:1.3","Def:1.2","HP:0.0625"]},{"target":"Type:Fire","eff":["SpA:0.5","Atk:0.5","Spe:0.7","HP:-0.125"]},{"target":"MoveType:Ice","eff":["Dmg:1.5","Crit:1.5"]},{"target":"MoveType:Fire","eff":["Dmg:0.3"]},{"target":"ALL","eff":["Heal:0.7"]}]}}}
```

**验证点**：
- 冰系大幅增强（SpA +50%, Spe +30%, Def +20%）
- 火系大幅削弱（SpA/Atk -50%, Spe -30%）
- 火系每回合损失 12.5% HP
- 冰系每回合回复 6.25% HP
- 冰系技能伤害 +50%，火系技能伤害 -70%
- 全场回复效果 -30%
- 天气为冰雹

---

## 使用说明

1. 复制上面任意一个 JSON 块（不含 \`\`\`json 标记）
2. 替换 `data-loader.js` 中 `getDefaultBattleData()` 的 return 内容
3. 刷新游戏即可测试

### 功能验证清单

| 示例 | 功能 | 验证方法 |
|------|------|----------|
| 6 | 类型转换 | 控制台查看 `[ENV OVERLAY] 🔄 技能类型转换` |
| 7 | 技能禁用 | 技能按钮变灰，出现挣扎按钮 |
| 8 | 属性免疫/弱点 | 伤害计算日志验证 |
| 9 | 多重效果叠加 | 控制台查看多个修正日志 |
| 10 | 极端数值 | 验证上下限 (0.1~6.0) 是否生效 |
