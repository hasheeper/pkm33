# isLead 功能实现总结

## 功能说明
`isLead` 字段用于标记哪只宝可梦应该作为首发出战。当某只宝可梦的 `isLead` 设置为 `true` 时，系统会自动将其移动到队伍的第一个位置（在战斗UI中）。

## 实现细节

### 1. Pokemon 构造函数 (battle-engine.js:602-603)
```javascript
// 首发标记 (isLead) - 标记该宝可梦是否为首发出战
this.isLead = config.isLead || false;
```

### 2. ST插件支持 (pkm-tavern-plugin.js:7007-7018)
在 `normalizePokemonFormat` 函数中添加了 `isLead` 和 `isAce` 字段的保留逻辑：
```javascript
// === 确保 isAce 和 isLead 被保留 ===
// isAce: 标记王牌宝可梦（用于羁绊共鸣等特殊机制）
// isLead: 标记首发宝可梦（自动移到队伍第一位）
if (pokemon.isAce !== undefined) {
  pokemon.isAce = Boolean(pokemon.isAce);
}
if (pokemon.isLead !== undefined) {
  pokemon.isLead = Boolean(pokemon.isLead);
  if (pokemon.isLead) {
    console.log(`${PLUGIN_NAME} [LEAD] ${pokemon.name} marked as lead Pokemon`);
  }
}
```

### 3. 玩家队伍处理 (battle-engine.js:1368-1380)
在 `setPlayerParty` 方法中添加了自动交换逻辑：
- 查找标记为 `isLead: true` 的宝可梦
- 如果找到且不在第一位，自动与第一位交换
- 如果已在第一位，保持不变
- 如果都为 `false`，使用默认顺序

### 4. 敌方队伍处理 (battle-engine.js:1328-1340)
在 `loadFromJSON` 方法中添加了相同的自动交换逻辑，确保敌方训练家的首发宝可梦也能正确处理。

### 5. JSON 数据格式示例
```json
"party": [
  {
    "name": "Zacian-Crowned",
    "lv": 99,
    "isAce": true,
    "isLead": false,
    "moves": [...]
  },
  {
    "name": "Cinderace",
    "lv": 97,
    "isLead": true,
    "mechanic": "dynamax",
    "moves": [...]
  },
  {
    "name": "Rillaboom",
    "lv": 95,
    "isLead": false,
    "moves": [...]
  }
]
```

## 逻辑规则
1. **只能有一只首发**：系统会查找第一个 `isLead: true` 的宝可梦
2. **自动交换位置**：找到后会与第一位交换，确保首发在第一个位置
3. **默认行为**：如果所有宝可梦都是 `false`，则使用 JSON 中的原始顺序
4. **控制台日志**：系统会输出 `[LEAD]` 标签的日志，方便调试
5. **ST插件支持**：PKM_FRONTEND 会自动保留 `isLead` 字段并输出日志

## 示例场景
在 Gloria 的队伍中：
- 原始顺序：Zacian-Crowned (第1位), Cinderace (第2位), Rillaboom (第3位)...
- Cinderace 标记为 `isLead: true`
- 战斗开始时自动交换：Cinderace (第1位), Zacian-Crowned (第2位), Rillaboom (第3位)...
- 战斗UI中 Cinderace 会作为首发出战

## 命名理由
- **术语准确性**：在竞技对战（VGC/Pokemon Showdown）中，首发宝可梦称为 "Lead"
- **语义清晰**：相比 `isFirst` 或 `active`，`isLead` 明确指代"领头"的位置逻辑
- **命名一致性**：与现有的 `isAce` 字段保持相同的驼峰命名风格

## 完整实现文件列表
1. ✅ `engine/battle-engine.js` - Pokemon构造函数 + 队伍交换逻辑
2. ✅ `ST/pkm-tavern-plugin.js` - PKM_FRONTEND 字段保留
3. ✅ `data/trainer-data.js` - 示例数据（Gloria Tier 4）
