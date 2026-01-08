# ES Module 重构路线图

> 分支: `refactor/es-modules`
> 目标: 消除全局变量污染，实现 ES Module 模块化

---

## 概览

| Phase | 目标 | 工作量 | 风险 |
|-------|------|--------|------|
| 1 | 数据层模块化 | 2-4h | 低 |
| 2 | 纯函数提取 | 4-8h | 低 |
| 3 | window.battle 单例化 | 1-2d | 中 |
| 4 | 依赖注入改造 | 3-5d | 高 |

---

## Phase 1: 数据层模块化

**目标**: 将 `POKEDEX`, `MOVES`, `ITEMS` 等静态数据改为 ES Module 导出

### 文件改动清单

| 文件 | 改动 |
|------|------|
| `data/pokedex-data.js` | `const POKEDEX = {...}` → `export const POKEDEX = {...}` |
| `data/moves-data.js` | `const MOVES = {...}` → `export const MOVES = {...}` |
| `data/move-constants.js` | 所有 `const` → `export const` |
| `engine/items-data.js` | `const ITEMS = {...}` → `export const ITEMS = {...}` |
| `data/trainer-data.js` | 所有 `const` → `export const` |

### 依赖更新

以下文件需要添加 `import` 语句：

| 文件 | 需要导入 |
|------|----------|
| `engine/battle-engine.js` | `POKEDEX`, `MOVES`, `FORM_SUFFIXES` |
| `engine/ability-handlers.js` | `MOVES` (用于 `window.Moves` 替换) |
| `engine/move-handlers.js` | `MOVES` |
| `engine/move-effects.js` | `MOVES` |
| `battle/battle-calc.js` | `MOVES`, `POKEDEX` |
| `battle/battle-damage.js` | `MOVES` |
| `mechanics/z-moves.js` | `MOVES`, `Z_MOVE_TABLE` |
| `mechanics/dynamax.js` | `MOVES`, `MAX_MOVE_TABLE` |
| `mechanics/mega-evolution.js` | `POKEDEX`, `ITEMS` |
| `systems/data-loader.js` | `POKEDEX`, `MOVES` |

### HTML 改动

```html
<!-- 旧 -->
<script src="./data/pokedex-data.js"></script>
<script src="./data/moves-data.js"></script>
...
<script src="./index.js"></script>

<!-- 新 -->
<script type="module" src="./main.js"></script>
```

---

## Phase 2: 纯函数提取

**目标**: 将不依赖 `window.battle` 的纯函数改为显式导出

### 文件改动清单

| 文件 | 导出函数 |
|------|----------|
| `engine/battle-engine.js` | `extractBaseFormId`, `resolveSpriteId`, `getFallbackSpriteId`, `getTypeEffectiveness`, `Pokemon` (class) |
| `battle/battle-calc.js` | `calcDamage`, `calcCritRate` |
| `battle/battle-effects.js` | `applySecondaryEffects` |
| `engine/ability-handlers.js` | `AbilityHandlers` |
| `mechanics/move-styles.js` | `applyMoveStyle`, `getStyleModifiers` |
| `mechanics/z-moves.js` | `getZMove`, `getZMovePower` |
| `mechanics/dynamax.js` | `getMaxMove`, `getMaxMovePower` |
| `mechanics/mega-evolution.js` | `canMegaEvolve`, `doMegaEvolution` |
| `systems/translations.js` | `t`, `TRANSLATIONS` |

### 移除 window.* 导出

```javascript
// 旧
window.calcDamage = calcDamage;

// 新
export function calcDamage(...) { ... }
```

---

## Phase 3: window.battle 单例模块化

**目标**: 将 `window.battle` 移入独立模块，消除全局污染

### 新建文件

| 文件 | 内容 |
|------|------|
| `core/GameState.js` | 导出 `battleInstance` 单例 |
| `core/BattleState.js` | `BattleState` 类定义 (从 `battle-engine.js` 迁移) |

### 改动模式

```javascript
// 旧 (16个文件, 47处)
const battle = window.battle;

// 新
import { battleInstance } from '../core/GameState.js';
const battle = battleInstance;
```

### 受影响文件 (按引用数排序)

| 文件 | window.battle 引用数 |
|------|---------------------|
| `battle/battle-switch.js` | 13 |
| `battle/battle-turns.js` | 6 |
| `engine/ability-handlers.js` | 4 |
| `ui/ui-menus.js` | 4 |
| `engine/move-effects.js` | 3 |
| `mechanics/move-styles.js` | 3 |
| `engine/battle-engine.js` | 2 |
| `index.js` | 2 |
| `systems/catch-system.js` | 2 |
| `ui/ui-trainer-hud.js` | 2 |
| `battle/battle-calc.js` | 1 |
| `battle/battle-damage.js` | 1 |
| `engine/ai-engine.js` | 1 |
| `engine/move-handlers.js` | 1 |
| `mechanics/z-moves.js` | 1 |
| `systems/data-loader.js` | 1 |

---

## Phase 4: 依赖注入改造 (可选)

**目标**: 函数签名改为接受 `battleContext` 参数，支持多实例和单元测试

### 改动模式

```javascript
// 旧
function handleAttack(moveIndex) {
    const p = window.battle.getPlayer();
    ...
}

// 新
export function handleAttack(battleContext, moveIndex) {
    const p = battleContext.getPlayer();
    ...
}
```

### 核心函数列表

| 函数 | 所在文件 |
|------|----------|
| `handleAttack` | `index.js` |
| `executeTurn` | `battle/battle-turns.js` |
| `handlePlayerPivot` | `battle/battle-switch.js` |
| `handleEnemyPivot` | `battle/battle-switch.js` |
| `handleFaintedSwitch` | `battle/battle-switch.js` |
| `applyDamage` | `battle/battle-damage.js` |
| `triggerAbility` | `engine/ability-handlers.js` |
| `aiChooseAction` | `engine/ai-engine.js` |

---

## 执行顺序建议

1. **Phase 1** 先做，风险最低，收益明显
2. **Phase 2** 紧随其后，为测试铺路
3. **Phase 3** 是核心改动，需要仔细测试
4. **Phase 4** 可选，仅在需要框架整合时进行

---

## 验证检查点

每个 Phase 完成后：

- [ ] `index.html` 能正常加载
- [ ] 战斗流程完整可玩
- [ ] 控制台无 `ReferenceError`
- [ ] 所有机制 (Mega/Z/Dynamax) 正常工作

---

## 回滚策略

如果重构出问题：

```bash
git checkout main
git branch -D refactor/es-modules
```
