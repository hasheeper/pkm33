# 📚 PKM Battle Engine - 开发参考文档

> 本目录包含战斗引擎的开发参考文档，用于防止参数顺序错误等常见 BUG。

---

## 📁 文档列表

| 文件 | 说明 | 用途 |
|------|------|------|
| `HOOKS_REFERENCE.md` | 钩子函数完整参考 | 详细的钩子函数签名、示例、常见错误 |
| `HOOKS_QUICK_REF.md` | 钩子函数快速参考卡 | 开发时快速查阅参数顺序 |
| `ABILITY_TEMPLATE.js` | 特性开发模板 | 复制粘贴即可使用的特性模板 |
| `MOVE_HANDLERS_REFERENCE.md` | 招式处理器参考 | 招式效果开发指南 |

---

## 🚨 重要提醒

### 2026-01-03 修复的严重 BUG

以下特性因**参数顺序错误**导致伤害计算返回 `NaN`：

| 特性 | 问题 | 修复 |
|------|------|------|
| Dry Skin | `onDefenderModifyDamage` 参数顺序错误 | ✅ |
| Flash Fire | `onBasePower` 参数顺序错误 | ✅ |
| Purifying Salt | `onDefenderModifyDamage` 参数顺序错误 | ✅ |
| Quick Feet | `onModifyStat` 参数顺序完全错误 | ✅ |
| Stall | `onModifyPriority` 缺少参数 | ✅ |

**教训**: 开发新特性前必须参考 `HOOKS_REFERENCE.md` 确认参数顺序！

---

## ✅ 开发检查清单

在添加新特性/招式前，请确认：

- [ ] 参数顺序与文档一致
- [ ] 返回值类型正确
- [ ] 所有分支都有返回值（如果需要）
- [ ] 使用 `Math.floor()` 处理数值计算
- [ ] 测试时检查控制台是否有 `NaN` 或 `undefined`

---

## 🔧 快速参考

### 伤害类钩子参数顺序

```javascript
onBasePower:            (power, attacker, defender, move)
onDefenderModifyDamage: (damage, attacker, defender, move, effectiveness)
onDamageHack:           (damage, defender)
```

### 能力值类钩子参数顺序

```javascript
onModifyStat: (stats, poke, battle)  // 直接修改 stats，不返回
```

### 其他常用钩子

```javascript
onTryHit:         (attacker, defender, move, effectiveness)
onModifyPriority: (priority, user, target, move)
onStart:          (self, enemy, logs, battle)
onEndTurn:        (pokemon, logs)
onKill:           (attacker, logs)
```

---

## 📝 更新日志

- **2026-01-03**: 创建文档目录，修复 6 个参数顺序 BUG

---

*维护者: PKM Battle Engine Team*
