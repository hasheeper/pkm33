# 战斗数据示例 - 环境图层测试用

> 以下 JSON 可直接复制到 `getDefaultBattleData()` 的 return 语句中使用

---

## 示例 1：重力塌缩 - 飞行系 vs 地面系

**测试重点**：速度减半、飞行系防御降低、HP跳动

```json
{"settings":{"enableAVS":true,"enableCommander":true,"enableEVO":true,"enableBGM":true,"enableSFX":true,"enableClash":false,"enableEnvironment":true},"difficulty":"hard","player":{"name":"Sky Trainer","trainerProficiency":100,"party":[{"name":"Corviknight","lv":75,"gender":"M","nature":"Impish","ability":"Mirror Armor","item":"Leftovers","isAce":true,"isLead":true,"stats_meta":{"ev_level":200,"ivs":{"hp":31,"atk":31,"def":31,"spa":15,"spd":31,"spe":31}},"moves":["Brave Bird","Iron Head","Roost","Bulk Up"],"avs":{"trust":150,"passion":120,"insight":80,"devotion":100}},{"name":"Dragonite","lv":78,"gender":"F","nature":"Adamant","ability":"Multiscale","item":"Choice Band","isAce":true,"stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":31,"def":31,"spa":20,"spd":31,"spe":31}},"moves":["Outrage","Extreme Speed","Earthquake","Fire Punch"],"avs":{"trust":200,"passion":180,"insight":100,"devotion":150}}],"unlocks":{"enable_bond":false,"enable_styles":true,"enable_insight":true,"enable_mega":false,"enable_z_move":false,"enable_dynamax":false,"enable_tera":true,"enable_proficiency_cap":true}},"enemy":{"id":"Ground Master","type":"trainer","name":"Ground Master","trainerProficiency":120,"lines":{"intro":"重力场已经启动，你的飞行系在这里毫无优势！"},"unlocks":{"enable_bond":false,"enable_styles":true,"enable_insight":false,"enable_mega":false,"enable_z_move":false,"enable_dynamax":false,"enable_tera":false,"enable_proficiency_cap":false}},"party":[{"name":"Garchomp","lv":80,"gender":"M","nature":"Jolly","ability":"Rough Skin","item":"Life Orb","stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31}},"moves":["Earthquake","Dragon Claw","Stone Edge","Swords Dance"]},{"name":"Excadrill","lv":78,"gender":"M","nature":"Adamant","ability":"Sand Rush","item":"Focus Sash","stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31}},"moves":["Earthquake","Iron Head","Rock Slide","Rapid Spin"]}],"script":null,"environment":{"weather":null,"weatherTurns":0,"overlay":{"env_name":"重力塌缩","narrative":"异常强大的重力场笼罩着战场，飞行变得异常困难...","rules":[{"target":"ALL","eff":["Spd:0.5"]},{"target":"Type:Flying","eff":["Def:0.7","HP:-0.0625"]}]}}}
```

---

## 示例 2：辐射酸雨 - 毒系 vs 钢系

**测试重点**：钢系被腐蚀、毒系增强、火系技能减弱

```json
{"settings":{"enableAVS":true,"enableCommander":true,"enableEVO":true,"enableBGM":true,"enableSFX":true,"enableClash":false,"enableEnvironment":true},"difficulty":"hard","player":{"name":"Steel Commander","trainerProficiency":130,"party":[{"name":"Metagross","lv":80,"gender":null,"nature":"Adamant","ability":"Clear Body","item":"Assault Vest","isAce":true,"isLead":true,"stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":31,"def":31,"spa":31,"spd":31,"spe":31}},"moves":["Meteor Mash","Zen Headbutt","Earthquake","Bullet Punch"],"avs":{"trust":180,"passion":200,"insight":120,"devotion":160}},{"name":"Scizor","lv":78,"gender":"M","nature":"Adamant","ability":"Technician","item":"Choice Band","isAce":true,"mechanic":"mega","stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31}},"moves":["Bullet Punch","U-turn","Superpower","Knock Off"],"avs":{"trust":160,"passion":180,"insight":100,"devotion":140}}],"unlocks":{"enable_bond":false,"enable_styles":true,"enable_insight":true,"enable_mega":true,"enable_z_move":false,"enable_dynamax":false,"enable_tera":false,"enable_proficiency_cap":true}},"enemy":{"id":"Toxic Queen","type":"trainer","name":"Toxic Queen","trainerProficiency":140,"lines":{"intro":"在这片辐射酸雨中，你的钢铁只会慢慢腐蚀..."},"unlocks":{"enable_bond":false,"enable_styles":true,"enable_insight":false,"enable_mega":false,"enable_z_move":false,"enable_dynamax":false,"enable_tera":false,"enable_proficiency_cap":false}},"party":[{"name":"Toxapex","lv":78,"gender":"F","nature":"Bold","ability":"Regenerator","item":"Black Sludge","stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":10,"def":31,"spa":31,"spd":31,"spe":31}},"moves":["Scald","Toxic","Recover","Haze"]},{"name":"Gengar","lv":80,"gender":"M","nature":"Timid","ability":"Cursed Body","item":"Life Orb","stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":10,"def":31,"spa":31,"spd":31,"spe":31}},"moves":["Shadow Ball","Sludge Wave","Focus Blast","Nasty Plot"]}],"script":null,"environment":{"weather":"rain","weatherTurns":0,"overlay":{"env_name":"辐射酸雨","narrative":"腐蚀性的绿色酸雨从天而降，钢铁在溶解...","rules":[{"target":"Type:Steel","eff":["Def:0.7","HP:-0.125"]},{"target":"Type:Poison","eff":["Spd:1.5","HP:0.0625"]},{"target":"MoveType:Fire","eff":["Dmg:0.5"]}]}}}
```

---

## 示例 3：幽冥结界 - 幽灵系主场

**测试重点**：一般系免疫、幽灵系增强、类型覆盖

```json
{"settings":{"enableAVS":true,"enableCommander":true,"enableEVO":true,"enableBGM":true,"enableSFX":true,"enableClash":false,"enableEnvironment":true},"difficulty":"expert","player":{"name":"Ghost Hunter","trainerProficiency":100,"party":[{"name":"Obstagoon","lv":75,"gender":"M","nature":"Adamant","ability":"Guts","item":"Flame Orb","isAce":true,"isLead":true,"stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31}},"moves":["Facade","Knock Off","Close Combat","Obstruct"],"avs":{"trust":140,"passion":160,"insight":80,"devotion":120}},{"name":"Grimmsnarl","lv":78,"gender":"M","nature":"Adamant","ability":"Prankster","item":"Light Clay","isAce":true,"stats_meta":{"ev_level":200,"ivs":{"hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31}},"moves":["Spirit Break","Darkest Lariat","Thunder Wave","Reflect"],"avs":{"trust":120,"passion":140,"insight":100,"devotion":110}}],"unlocks":{"enable_bond":false,"enable_styles":true,"enable_insight":true,"enable_mega":false,"enable_z_move":false,"enable_dynamax":true,"enable_tera":true,"enable_proficiency_cap":true}},"enemy":{"id":"Phantom Lord","type":"trainer","name":"Phantom Lord","trainerProficiency":160,"lines":{"intro":"欢迎来到幽冥结界...在这里，生者的力量毫无意义。"},"unlocks":{"enable_bond":false,"enable_styles":true,"enable_insight":true,"enable_mega":false,"enable_z_move":false,"enable_dynamax":false,"enable_tera":false,"enable_proficiency_cap":false}},"party":[{"name":"Gengar","lv":82,"gender":"M","nature":"Timid","ability":"Cursed Body","item":"Choice Specs","stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":10,"def":31,"spa":31,"spd":31,"spe":31}},"moves":["Shadow Ball","Sludge Wave","Focus Blast","Trick"]},{"name":"Dragapult","lv":80,"gender":"F","nature":"Naive","ability":"Infiltrator","item":"Life Orb","stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":31,"def":31,"spa":31,"spd":31,"spe":31}},"moves":["Shadow Ball","Draco Meteor","Fire Blast","U-turn"]},{"name":"Mimikyu","lv":78,"gender":"F","nature":"Jolly","ability":"Disguise","item":"Life Orb","stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31}},"moves":["Play Rough","Shadow Claw","Shadow Sneak","Swords Dance"]}],"script":null,"environment":{"weather":null,"weatherTurns":0,"overlay":{"env_name":"幽冥结界","narrative":"阴森的灵气弥漫，生者的力量被削弱...","rules":[{"target":"Type:Ghost","eff":["SpA:1.4","Spd:1.2","HP:0.0625"]},{"target":"Type:Normal","eff":["Atk:0.7","SpA:0.7"]},{"target":"ALL","eff":["Immune:Normal"]},{"target":"MoveType:Ghost","eff":["Dmg:1.3"]}]}}}
```

---

## 示例 4：治愈圣域 - 回复增强测试

**测试重点**：全员回血、回复效果增强 (Heal:1.5)、毒系技能削弱

```json
{"settings":{"enableAVS":true,"enableCommander":true,"enableEVO":true,"enableBGM":true,"enableSFX":true,"enableClash":false,"enableEnvironment":true},"difficulty":"normal","player":{"name":"Healer","trainerProficiency":80,"party":[{"name":"Blissey","lv":70,"gender":"F","nature":"Bold","ability":"Natural Cure","item":"Leftovers","isAce":true,"isLead":true,"stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":10,"def":31,"spa":31,"spd":31,"spe":31}},"moves":["Soft-Boiled","Seismic Toss","Thunder Wave","Aromatherapy"],"avs":{"trust":200,"passion":80,"insight":60,"devotion":220}},{"name":"Clefable","lv":72,"gender":"F","nature":"Calm","ability":"Magic Guard","item":"Leftovers","isAce":true,"stats_meta":{"ev_level":200,"ivs":{"hp":31,"atk":10,"def":31,"spa":31,"spd":31,"spe":31}},"moves":["Moonblast","Soft-Boiled","Calm Mind","Thunder Wave"],"avs":{"trust":180,"passion":100,"insight":80,"devotion":200}}],"unlocks":{"enable_bond":false,"enable_styles":true,"enable_insight":true,"enable_mega":false,"enable_z_move":false,"enable_dynamax":false,"enable_tera":true,"enable_proficiency_cap":true}},"enemy":{"id":"Poison Master","type":"trainer","name":"Poison Master","trainerProficiency":100,"lines":{"intro":"即使在圣域中，毒素依然会侵蚀你...虽然效果减弱了。"},"unlocks":{"enable_bond":false,"enable_styles":false,"enable_insight":false,"enable_mega":false,"enable_z_move":false,"enable_dynamax":false,"enable_tera":false,"enable_proficiency_cap":false}},"party":[{"name":"Nidoking","lv":75,"gender":"M","nature":"Modest","ability":"Sheer Force","item":"Life Orb","stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":10,"def":31,"spa":31,"spd":31,"spe":31}},"moves":["Sludge Wave","Earth Power","Ice Beam","Thunderbolt"]},{"name":"Crobat","lv":73,"gender":"M","nature":"Jolly","ability":"Infiltrator","item":"Choice Band","stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31}},"moves":["Brave Bird","Cross Poison","U-turn","Defog"]}],"script":null,"environment":{"weather":null,"weatherTurns":0,"overlay":{"env_name":"治愈圣域","narrative":"神圣的光芒治愈一切伤痛...","rules":[{"target":"ALL","eff":["HP:0.0625","Heal:1.5"]},{"target":"MoveType:Poison","eff":["Dmg:0.3"]},{"target":"Type:Fairy","eff":["SpD:1.3"]}]}}}
```

---

## 示例 5：腐蚀烟霾 - 回复减半测试

**测试重点**：回复效果减半 (Heal:0.5)、持续扣血、毒系免疫毒

```json
{"settings":{"enableAVS":true,"enableCommander":true,"enableEVO":true,"enableBGM":true,"enableSFX":true,"enableClash":false,"enableEnvironment":true},"difficulty":"hard","player":{"name":"Survivor","trainerProficiency":120,"party":[{"name":"Chansey","lv":70,"gender":"F","nature":"Bold","ability":"Natural Cure","item":"Eviolite","isAce":true,"isLead":true,"stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":10,"def":31,"spa":31,"spd":31,"spe":31}},"moves":["Soft-Boiled","Seismic Toss","Toxic","Stealth Rock"],"avs":{"trust":180,"passion":60,"insight":40,"devotion":200}},{"name":"Slowbro","lv":75,"gender":"M","nature":"Bold","ability":"Regenerator","item":"Heavy-Duty Boots","isAce":true,"stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":10,"def":31,"spa":31,"spd":31,"spe":31}},"moves":["Scald","Slack Off","Psyshock","Thunder Wave"],"avs":{"trust":160,"passion":80,"insight":100,"devotion":180}}],"unlocks":{"enable_bond":false,"enable_styles":true,"enable_insight":true,"enable_mega":false,"enable_z_move":false,"enable_dynamax":false,"enable_tera":true,"enable_proficiency_cap":true}},"enemy":{"id":"Smog Lord","type":"trainer","name":"Smog Lord","trainerProficiency":140,"lines":{"intro":"在这片腐蚀烟霾中，你的回复手段将毫无用处..."},"unlocks":{"enable_bond":false,"enable_styles":true,"enable_insight":false,"enable_mega":false,"enable_z_move":false,"enable_dynamax":false,"enable_tera":false,"enable_proficiency_cap":false}},"party":[{"name":"Weezing-Galar","lv":78,"gender":"M","nature":"Bold","ability":"Neutralizing Gas","item":"Black Sludge","stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":10,"def":31,"spa":31,"spd":31,"spe":31}},"moves":["Strange Steam","Sludge Bomb","Will-O-Wisp","Pain Split"]},{"name":"Salazzle","lv":76,"gender":"F","nature":"Timid","ability":"Corrosion","item":"Focus Sash","stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":10,"def":31,"spa":31,"spd":31,"spe":31}},"moves":["Sludge Wave","Fire Blast","Nasty Plot","Toxic"]}],"script":null,"environment":{"weather":null,"weatherTurns":0,"overlay":{"env_name":"腐蚀烟霾","narrative":"有毒的烟雾阻碍了生命的恢复...","rules":[{"target":"ALL","eff":["Heal:0.5","HP:-0.0625"]},{"target":"Type:Poison","eff":["Immune:Poison","HP:0.0625"]},{"target":"Type:Steel","eff":["Def:0.8"]}]}}}
```

---

## 示例 6：电磁风暴 - 电系 vs 飞行/钢

**测试重点**：电系增强、钢系被磁化、飞行系追加电弱点

```json
{"settings":{"enableAVS":true,"enableCommander":true,"enableEVO":true,"enableBGM":true,"enableSFX":true,"enableClash":false,"enableEnvironment":true},"difficulty":"expert","player":{"name":"Storm Rider","trainerProficiency":150,"party":[{"name":"Zapdos","lv":85,"gender":null,"nature":"Timid","ability":"Static","item":"Heavy-Duty Boots","isAce":true,"isLead":true,"stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":10,"def":31,"spa":31,"spd":31,"spe":31}},"moves":["Thunderbolt","Hurricane","Heat Wave","Roost"],"avs":{"trust":200,"passion":220,"insight":150,"devotion":180}},{"name":"Raikou","lv":83,"gender":null,"nature":"Timid","ability":"Inner Focus","item":"Choice Specs","isAce":true,"stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":10,"def":31,"spa":31,"spd":31,"spe":31}},"moves":["Thunderbolt","Volt Switch","Shadow Ball","Aura Sphere"],"avs":{"trust":180,"passion":200,"insight":120,"devotion":160}}],"unlocks":{"enable_bond":false,"enable_styles":true,"enable_insight":true,"enable_mega":false,"enable_z_move":false,"enable_dynamax":false,"enable_tera":true,"enable_proficiency_cap":true}},"enemy":{"id":"Metal Guardian","type":"trainer","name":"Metal Guardian","trainerProficiency":130,"lines":{"intro":"电磁风暴？我的钢铁战士不惧任何风暴！...等等，为什么我动不了？"},"unlocks":{"enable_bond":false,"enable_styles":true,"enable_insight":false,"enable_mega":false,"enable_z_move":false,"enable_dynamax":false,"enable_tera":false,"enable_proficiency_cap":false}},"party":[{"name":"Corviknight","lv":82,"gender":"M","nature":"Impish","ability":"Mirror Armor","item":"Leftovers","stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31}},"moves":["Brave Bird","Iron Head","Roost","Bulk Up"]},{"name":"Skarmory","lv":80,"gender":"F","nature":"Impish","ability":"Sturdy","item":"Rocky Helmet","stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31}},"moves":["Brave Bird","Iron Head","Roost","Spikes"]},{"name":"Ferrothorn","lv":80,"gender":"M","nature":"Relaxed","ability":"Iron Barbs","item":"Leftovers","stats_meta":{"ev_level":252,"ivs":{"hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":0}},"moves":["Power Whip","Gyro Ball","Leech Seed","Stealth Rock"]}],"script":null,"environment":{"weather":null,"weatherTurns":0,"overlay":{"env_name":"电磁风暴","narrative":"强烈的电磁脉冲席卷战场，金属被磁化...","rules":[{"target":"Type:Electric","eff":["SpA:1.5","Spd:1.3"]},{"target":"Type:Steel","eff":["Spd:0.5","Def:0.8"]},{"target":"MoveType:Electric","eff":["Dmg:1.2"]},{"target":"Type:Flying","eff":["Weak:Electric"]}]}}}
```

---

## 使用说明

1. 复制上面任意一个 JSON 块（不含 \`\`\`json 标记）
2. 替换 `data-loader.js` 中 `getDefaultBattleData()` 的 return 内容
3. 刷新游戏即可测试

### 环境效果验证点

| 示例 | 验证点 |
|------|--------|
| 重力塌缩 | 速度是否减半、飞行系是否每回合扣血 |
| 辐射酸雨 | 钢系防御是否降低、毒系是否回血 |
| 幽冥结界 | 一般系技能是否无效、幽灵系是否增强 |
| 治愈圣域 | 回复技能是否 x1.5、毒系技能伤害是否 x0.3 |
| 腐蚀烟霾 | 回复技能是否 x0.5、毒系是否免疫毒 |
| 电磁风暴 | 电系是否增强、钢系速度是否减半、飞行系是否被电克 |

---

*文档版本: 1.0*
