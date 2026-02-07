# 竹兰 (Cynthia) 战斗测试文档

本文档包含竹兰对战的 JSON 测试用例，用于验证伤害计算管线修复。

---

## 测试重点

- **伤害计算管线**: 验证 `calcDamage` → `applyDamage` 完整流程
- **特性交互**: Sand Force (沙之力) 在沙暴中的威力加成
- **能力特性**: Thick Fat (厚脂肪) 减半火/冰伤害
- **Flag 检测**: Iron Fist (铁拳) / Tough Claws (硬爪) 的 contact/punch flag
- **动态威力**: basePowerCallback 参数传递 (move, battle)
- **NaN 保护**: 伤害公式异常值兜底

---

## 测试用例 1: 竹兰经典队 (Lv.100 满级对战)

**场景**: 巨人遗迹，雨天环境，无环境图层
**验证**: 基础伤害计算、STAB、属性克制、特性交互

```json
{
  "player": {
    "name": "挑战者",
    "trainerProficiency": 100,
    "party": [
      {
        "name": "Snorlax",
        "lv": 100,
        "gender": "M",
        "nature": "Adamant",
        "ability": "Thick Fat",
        "item": "Leftovers",
        "isAce": false,
        "isLead": true,
        "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 } },
        "moves": ["Body Slam", "Ice Punch", "Earthquake", "Rest"]
      },
      {
        "name": "Lucario",
        "lv": 100,
        "gender": "M",
        "nature": "Jolly",
        "ability": "Inner Focus",
        "item": "Life Orb",
        "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 } },
        "moves": ["Close Combat", "Meteor Mash", "Extreme Speed", "Swords Dance"]
      },
      {
        "name": "Togekiss",
        "lv": 100,
        "gender": "F",
        "nature": "Timid",
        "ability": "Serene Grace",
        "item": "Choice Scarf",
        "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 10, "def": 31, "spa": 31, "spd": 31, "spe": 31 } },
        "moves": ["Air Slash", "Dazzling Gleam", "Flamethrower", "Trick"]
      }
    ],
    "unlocks": {
      "enable_bond": true,
      "enable_styles": true,
      "enable_insight": true,
      "enable_mega": true,
      "enable_z_move": false,
      "enable_dynamax": false,
      "enable_tera": true
    }
  },
  "enemy": {
    "id": "cynthia_champion",
    "type": "trainer",
    "name": "竹兰",
    "trainerProficiency": 100,
    "lines": {
      "intro": "我是竹兰。作为冠军，我将全力以赴！",
      "win": "你还需要更多的磨练。",
      "lose": "精彩的战斗！你的宝可梦真的很出色。"
    }
  },
  "party": [
    {
      "name": "Garchomp",
      "lv": 100,
      "gender": "F",
      "nature": "Jolly",
      "ability": "Rough Skin",
      "item": "Garchompite",
      "isLead": true,
      "mechanic": "mega",
      "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 } },
      "moves": ["Earthquake", "Dragon Claw", "Stone Edge", "Swords Dance"]
    },
    {
      "name": "Milotic",
      "lv": 100,
      "gender": "F",
      "nature": "Bold",
      "ability": "Marvel Scale",
      "item": "Leftovers",
      "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 10, "def": 31, "spa": 31, "spd": 31, "spe": 31 } },
      "moves": ["Scald", "Ice Beam", "Recover", "Toxic"]
    },
    {
      "name": "Lucario",
      "lv": 100,
      "gender": "M",
      "nature": "Timid",
      "ability": "Inner Focus",
      "item": "Life Orb",
      "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 10, "def": 31, "spa": 31, "spd": 31, "spe": 31 } },
      "moves": ["Aura Sphere", "Flash Cannon", "Dragon Pulse", "Nasty Plot"]
    },
    {
      "name": "Roserade",
      "lv": 100,
      "gender": "F",
      "nature": "Timid",
      "ability": "Natural Cure",
      "item": "Focus Sash",
      "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 10, "def": 31, "spa": 31, "spd": 31, "spe": 31 } },
      "moves": ["Sludge Bomb", "Energy Ball", "Shadow Ball", "Toxic Spikes"]
    },
    {
      "name": "Spiritomb",
      "lv": 100,
      "gender": "F",
      "nature": "Calm",
      "ability": "Pressure",
      "item": "Sitrus Berry",
      "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 10, "def": 31, "spa": 31, "spd": 31, "spe": 31 } },
      "moves": ["Shadow Ball", "Dark Pulse", "Will-O-Wisp", "Calm Mind"]
    },
    {
      "name": "Togekiss",
      "lv": 100,
      "gender": "F",
      "nature": "Timid",
      "ability": "Serene Grace",
      "item": "Choice Scarf",
      "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 10, "def": 31, "spa": 31, "spd": 31, "spe": 31 } },
      "moves": ["Air Slash", "Dazzling Gleam", "Flamethrower", "Aura Sphere"]
    }
  ],
  "environment": {
    "weather": "rain",
    "weatherTurns": 0
  },
  "settings": {
    "enableAVS": true,
    "enableEnvironment": false
  }
}
```

---

## 测试用例 2: 竹兰 Sand Force 特性测试

**场景**: 沙暴天气，验证 Sand Force 特性在修复后正确加成
**验证**: `onBasePower` 第5参数 `battle` 传递修复

```json
{
  "player": {
    "name": "测试玩家",
    "trainerProficiency": 100,
    "party": [
      {
        "name": "Excadrill",
        "lv": 100,
        "gender": "M",
        "nature": "Jolly",
        "ability": "Sand Force",
        "item": "Life Orb",
        "isAce": false,
        "isLead": true,
        "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 } },
        "moves": ["Earthquake", "Iron Head", "Rock Slide", "Swords Dance"]
      },
      {
        "name": "Hippowdon",
        "lv": 100,
        "gender": "M",
        "nature": "Impish",
        "ability": "Sand Stream",
        "item": "Leftovers",
        "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 } },
        "moves": ["Earthquake", "Stone Edge", "Slack Off", "Stealth Rock"]
      }
    ],
    "unlocks": {
      "enable_bond": true,
      "enable_styles": false,
      "enable_insight": false,
      "enable_mega": false,
      "enable_z_move": false,
      "enable_dynamax": false,
      "enable_tera": false
    }
  },
  "enemy": {
    "id": "cynthia_sand",
    "type": "trainer",
    "name": "竹兰 (沙暴)",
    "trainerProficiency": 100,
    "lines": { "intro": "沙暴中的战斗，才是真正的考验！" }
  },
  "party": [
    {
      "name": "Garchomp",
      "lv": 100,
      "gender": "F",
      "nature": "Jolly",
      "ability": "Sand Force",
      "item": "Choice Band",
      "isLead": true,
      "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 } },
      "moves": ["Earthquake", "Dragon Claw", "Stone Edge", "Iron Head"]
    },
    {
      "name": "Tyranitar",
      "lv": 100,
      "gender": "M",
      "nature": "Adamant",
      "ability": "Sand Stream",
      "item": "Assault Vest",
      "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 } },
      "moves": ["Stone Edge", "Crunch", "Earthquake", "Ice Punch"]
    },
    {
      "name": "Gastrodon",
      "lv": 100,
      "gender": "F",
      "nature": "Bold",
      "ability": "Storm Drain",
      "item": "Leftovers",
      "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 10, "def": 31, "spa": 31, "spd": 31, "spe": 31 } },
      "moves": ["Scald", "Earth Power", "Recover", "Toxic"]
    }
  ],
  "environment": {
    "weather": "sandstorm",
    "weatherTurns": 0
  },
  "settings": {
    "enableAVS": false,
    "enableEnvironment": false
  }
}
```

---

## 测试用例 3: 特性 Flag 检测测试

**场景**: 验证 Iron Fist / Tough Claws / Strong Jaw / Sharpness 等 flag 特性
**验证**: `moveHasFlag` 修复后正确从 MOVES 数据库读取 flags

```json
{
  "player": {
    "name": "Flag测试",
    "trainerProficiency": 100,
    "party": [
      {
        "name": "Pangoro",
        "lv": 100,
        "gender": "M",
        "nature": "Adamant",
        "ability": "Iron Fist",
        "item": "Choice Band",
        "isLead": true,
        "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 } },
        "moves": ["Ice Punch", "Thunder Punch", "Drain Punch", "Mach Punch"]
      },
      {
        "name": "Dracovish",
        "lv": 100,
        "gender": null,
        "nature": "Jolly",
        "ability": "Strong Jaw",
        "item": "Choice Scarf",
        "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 } },
        "moves": ["Fishious Rend", "Crunch", "Psychic Fangs", "Ice Fang"]
      },
      {
        "name": "Gallade",
        "lv": 100,
        "gender": "M",
        "nature": "Jolly",
        "ability": "Sharpness",
        "item": "Life Orb",
        "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 } },
        "moves": ["Sacred Sword", "Psycho Cut", "Leaf Blade", "Night Slash"]
      }
    ],
    "unlocks": {
      "enable_bond": false,
      "enable_styles": false,
      "enable_insight": false,
      "enable_mega": false,
      "enable_z_move": false,
      "enable_dynamax": false,
      "enable_tera": false
    }
  },
  "enemy": {
    "id": "flag_test_enemy",
    "type": "trainer",
    "name": "特性测试员",
    "trainerProficiency": 80,
    "lines": { "intro": "来测试特性的效果吧！" }
  },
  "party": [
    {
      "name": "Blissey",
      "lv": 100,
      "gender": "F",
      "nature": "Bold",
      "ability": "Natural Cure",
      "item": "Leftovers",
      "isLead": true,
      "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 10, "def": 31, "spa": 31, "spd": 31, "spe": 31 } },
      "moves": ["Soft-Boiled", "Seismic Toss", "Thunder Wave", "Toxic"]
    },
    {
      "name": "Skarmory",
      "lv": 100,
      "gender": "M",
      "nature": "Impish",
      "ability": "Sturdy",
      "item": "Rocky Helmet",
      "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 } },
      "moves": ["Brave Bird", "Iron Head", "Roost", "Whirlwind"]
    }
  ],
  "environment": {
    "weather": null
  },
  "settings": {
    "enableAVS": false,
    "enableEnvironment": false
  }
}
```

---

## 修复清单

本测试文档对应以下修复:

| # | 文件 | 修复内容 |
|---|------|---------|
| 1 | `move-handlers.js` | Magnitude `damageCallback` 返回 null → 改用 `basePowerCallback` |
| 2 | `battle-calc.js` | `onBasePower` 缺少第5参数 `battle` → Sand Force 等特性静默失效 |
| 3 | `battle-calc.js` | `basePowerCallback` 缺少 `move`/`battle` 参数 → Fishious Rend 等无法访问 |
| 4 | `ability-handlers.js` | `moveHasFlag` 正则 `/[^a-z]/` 丢失数字 + 缺少 MOVES 直接查找 |
| 5 | `ability-handlers.js` | Tough Claws 用 `move.cat` 代替 `contact` flag → 非接触物理技也加成 |
| 6 | `ability-handlers.js` | Sheer Force 检查 `move.secondary` 但构造器 move 对象无此字段 |
| 7 | `ability-handlers.js` | Reckless 检查 `move.recoil` 但构造器 move 对象无此字段 |
| 8 | `move-handlers.js` | Present 用 `damageCallback` 绕过伤害公式 → 改用 `basePowerCallback` |
| 9 | `battle-damage.js` | `applyDamage` 无 try-catch → 运行时错误静默吞没 |
| 10 | `battle-damage.js` | 攻击技 damage=0 + effectiveness>0 时无任何日志输出 (静默路径) |
| 11 | `battle-calc.js` | 伤害公式 NaN 保护 + atkStat 防零保护 |
| 12 | `battle-damage.js` | `onAbsorbHit` 从未被调用 → 引火/蓄水/蓄电等回复/加成缺失 |
