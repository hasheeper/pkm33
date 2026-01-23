# 战斗引擎文档索引

> **文档版本**: v2.0  
> **最后更新**: 2026-01-22

---

## 📚 文档导航

### 核心文档

1. **[战斗引擎完整文档](./BATTLE_ENGINE_DOCUMENTATION.md)** ⭐
   - 项目概述与技术栈
   - 核心功能详解
   - 系统架构说明
   - 战斗机制详解
   - 特色系统介绍
   - 用户指南
   - 开发文档
   - 数据结构与 API 参考
   - **推荐**: 首次阅读从这里开始

2. **[开发者指南](./DEVELOPER_GUIDE.md)** 🔧
   - 开发环境搭建
   - 代码架构详解
   - 核心模块解析
   - 扩展开发指南
   - 调试与测试
   - 性能优化
   - 最佳实践
   - **推荐**: 开发者必读

3. **[代码总结](./CODE_SUMMARY.md)** 📊
   - 项目统计数据
   - 架构概览
   - 核心机制实现
   - 关键数据结构
   - 扩展点与钩子
   - 性能指标
   - 已知问题与未来规划
   - **推荐**: 快速了解代码库

---

## 🎯 快速导航

### 按角色查找

#### 👤 普通用户
- [用户指南](./BATTLE_ENGINE_DOCUMENTATION.md#用户指南) - 基础操作与进阶技巧
- [核心功能](./BATTLE_ENGINE_DOCUMENTATION.md#核心功能) - 系统功能介绍

#### 💻 开发者
- [开发环境搭建](./DEVELOPER_GUIDE.md#开发环境搭建)
- [扩展开发指南](./DEVELOPER_GUIDE.md#扩展开发指南)
- [API 参考](./BATTLE_ENGINE_DOCUMENTATION.md#api-参考)

#### 🔍 研究者
- [战斗机制详解](./BATTLE_ENGINE_DOCUMENTATION.md#战斗机制详解)
- [核心机制实现](./CODE_SUMMARY.md#核心机制实现)
- [数据结构](./BATTLE_ENGINE_DOCUMENTATION.md#数据结构)

---

## 📖 主题索引

### 战斗系统

| 主题 | 文档位置 |
|------|---------|
| 伤害计算公式 | [战斗机制详解](./BATTLE_ENGINE_DOCUMENTATION.md#伤害计算公式) |
| 属性克制系统 | [战斗机制详解](./BATTLE_ENGINE_DOCUMENTATION.md#属性克制表) |
| 能力等级修正 | [战斗机制详解](./BATTLE_ENGINE_DOCUMENTATION.md#能力等级修正) |
| 回合执行流程 | [代码总结](./CODE_SUMMARY.md#2-回合执行流程) |
| 换人系统 | [核心功能](./BATTLE_ENGINE_DOCUMENTATION.md#14-换人系统) |

### 世代机制

| 主题 | 文档位置 |
|------|---------|
| Mega 进化 | [核心功能](./BATTLE_ENGINE_DOCUMENTATION.md#21-mega-进化系统) |
| Z 招式 | [核心功能](./BATTLE_ENGINE_DOCUMENTATION.md#22-z-招式系统) |
| 极巨化 | [核心功能](./BATTLE_ENGINE_DOCUMENTATION.md#23-极巨化系统) |
| 太晶化 | [核心功能](./BATTLE_ENGINE_DOCUMENTATION.md#24-太晶化系统) |

### 特色系统

| 主题 | 文档位置 |
|------|---------|
| 对冲系统 | [核心功能](./BATTLE_ENGINE_DOCUMENTATION.md#31-对冲系统-clash-system) |
| 杀意感知 | [核心功能](./BATTLE_ENGINE_DOCUMENTATION.md#32-杀意感知系统-insight-system) |
| 古武系统 | [核心功能](./BATTLE_ENGINE_DOCUMENTATION.md#33-古武系统-move-styles) |
| 训练家指挥 | [核心功能](./BATTLE_ENGINE_DOCUMENTATION.md#34-训练家战术指挥系统) |
| 成长系统 | [核心功能](./BATTLE_ENGINE_DOCUMENTATION.md#5-成长系统) |

### AI 系统

| 主题 | 文档位置 |
|------|---------|
| AI 难度等级 | [核心功能](./BATTLE_ENGINE_DOCUMENTATION.md#41-四档难度) |
| AI 评分系统 | [核心功能](./BATTLE_ENGINE_DOCUMENTATION.md#42-ai-评分系统) |
| AI 决策流程 | [代码总结](./CODE_SUMMARY.md#3-ai-决策流程) |

### 开发指南

| 主题 | 文档位置 |
|------|---------|
| 添加新招式 | [开发者指南](./DEVELOPER_GUIDE.md#添加新招式) |
| 添加新特性 | [开发者指南](./DEVELOPER_GUIDE.md#添加新特性) |
| 添加新道具 | [开发者指南](./DEVELOPER_GUIDE.md#添加新道具) |
| 添加新机制 | [开发者指南](./DEVELOPER_GUIDE.md#添加新世代机制) |
| 调试技巧 | [开发者指南](./DEVELOPER_GUIDE.md#调试技巧) |
| 性能优化 | [开发者指南](./DEVELOPER_GUIDE.md#性能优化) |

---

## 🔧 代码模块索引

### 核心引擎 (`engine/`)

| 文件 | 功能 | 文档链接 |
|------|------|---------|
| `battle-engine.js` | 战斗引擎核心、Pokemon 类 | [核心模块解析](./DEVELOPER_GUIDE.md#1-战斗引擎核心) |
| `ability-handlers.js` | 特性处理器 | [扩展点与钩子](./CODE_SUMMARY.md#特性钩子列表) |
| `move-handlers.js` | 招式处理器 | [扩展点与钩子](./CODE_SUMMARY.md#招式钩子列表) |
| `move-effects.js` | 招式效果系统 | [战斗机制详解](./BATTLE_ENGINE_DOCUMENTATION.md#战斗机制详解) |
| `items-data.js` | 道具数据与效果 | [添加新道具](./DEVELOPER_GUIDE.md#添加新道具) |
| `ai-engine.js` | AI 引擎 | [AI 系统](./BATTLE_ENGINE_DOCUMENTATION.md#4-ai-系统) |

### 战斗系统 (`battle/`)

| 文件 | 功能 | 文档链接 |
|------|------|---------|
| `battle-calc.js` | 伤害计算引擎 | [伤害计算引擎](./DEVELOPER_GUIDE.md#2-伤害计算引擎) |
| `battle-damage.js` | 伤害应用系统 | [伤害系统](./BATTLE_ENGINE_DOCUMENTATION.md#12-招式效果系统) |
| `battle-effects.js` | 副作用处理 | [副作用处理](./BATTLE_ENGINE_DOCUMENTATION.md#12-招式效果系统) |
| `battle-turns.js` | 回合执行 | [回合执行系统](./BATTLE_ENGINE_DOCUMENTATION.md#13-回合执行系统) |
| `battle-switch.js` | 换人系统 | [换人系统](./BATTLE_ENGINE_DOCUMENTATION.md#14-换人系统) |

### 世代机制 (`mechanics/`)

| 文件 | 功能 | 文档链接 |
|------|------|---------|
| `mega-evolution.js` | Mega 进化 | [Mega 进化系统](./BATTLE_ENGINE_DOCUMENTATION.md#21-mega-进化系统) |
| `z-moves.js` | Z 招式 | [Z 招式系统](./BATTLE_ENGINE_DOCUMENTATION.md#22-z-招式系统) |
| `dynamax.js` | 极巨化 | [极巨化系统](./BATTLE_ENGINE_DOCUMENTATION.md#23-极巨化系统) |
| `clash-system.js` | 对冲系统 | [对冲系统](./BATTLE_ENGINE_DOCUMENTATION.md#31-对冲系统-clash-system) |
| `move-styles.js` | 古武系统 | [古武系统](./BATTLE_ENGINE_DOCUMENTATION.md#33-古武系统-move-styles) |

### 辅助系统 (`systems/`)

| 文件 | 功能 | 文档链接 |
|------|------|---------|
| `catch-system.js` | 捕获系统 | [捕获系统](./BATTLE_ENGINE_DOCUMENTATION.md#6-捕获系统) |
| `growth-system.js` | 成长系统 | [成长系统](./BATTLE_ENGINE_DOCUMENTATION.md#5-成长系统) |
| `audio-manager.js` | 音频管理 | - |
| `bgm-system.js` | BGM 系统 | - |
| `translations.js` | 翻译系统 | - |

---

## 🎓 学习路径

### 初学者路径

1. 阅读 [项目概述](./BATTLE_ENGINE_DOCUMENTATION.md#项目概述)
2. 了解 [核心功能](./BATTLE_ENGINE_DOCUMENTATION.md#核心功能)
3. 查看 [用户指南](./BATTLE_ENGINE_DOCUMENTATION.md#用户指南)
4. 尝试 [基础操作](./BATTLE_ENGINE_DOCUMENTATION.md#基础操作)

### 开发者路径

1. 搭建 [开发环境](./DEVELOPER_GUIDE.md#开发环境搭建)
2. 理解 [代码架构](./DEVELOPER_GUIDE.md#代码架构详解)
3. 学习 [核心模块](./DEVELOPER_GUIDE.md#核心模块解析)
4. 实践 [扩展开发](./DEVELOPER_GUIDE.md#扩展开发指南)
5. 掌握 [调试技巧](./DEVELOPER_GUIDE.md#调试与测试)

### 深入研究路径

1. 研究 [伤害计算流程](./CODE_SUMMARY.md#1-伤害计算流程)
2. 分析 [AI 决策流程](./CODE_SUMMARY.md#3-ai-决策流程)
3. 探索 [对冲系统实现](./CODE_SUMMARY.md#1-对冲系统-clash-system)
4. 理解 [扩展点与钩子](./CODE_SUMMARY.md#扩展点与钩子)

---

## 🔍 常见问题快速查找

| 问题 | 答案位置 |
|------|---------|
| 如何添加新招式？ | [添加新招式](./DEVELOPER_GUIDE.md#添加新招式) |
| 如何添加新特性？ | [添加新特性](./DEVELOPER_GUIDE.md#添加新特性) |
| 如何调整 AI 难度？ | [自定义 AI 难度](./DEVELOPER_GUIDE.md#自定义-ai-难度) |
| 如何使用古武风格？ | [使用古武风格](./BATTLE_ENGINE_DOCUMENTATION.md#1-使用古武风格) |
| 如何触发对冲？ | [触发对冲](./BATTLE_ENGINE_DOCUMENTATION.md#2-触发对冲) |
| 伤害计算公式是什么？ | [伤害计算公式](./BATTLE_ENGINE_DOCUMENTATION.md#伤害计算公式) |
| 如何优化性能？ | [性能优化](./DEVELOPER_GUIDE.md#性能优化) |
| 如何调试代码？ | [调试技巧](./DEVELOPER_GUIDE.md#调试技巧) |

---

## 📊 文档统计

- **总文档数**: 4 个
- **总字数**: ~50,000 字
- **代码示例**: 100+ 个
- **API 接口**: 50+ 个
- **覆盖模块**: 38 个文件

---

## 🔄 更新日志

### v2.0 (2026-01-22)
- ✨ 创建完整文档体系
- 📝 添加战斗引擎完整文档
- 📝 添加开发者指南
- 📝 添加代码总结
- 📝 添加文档索引

---

## 📞 获取帮助

如果您在使用过程中遇到问题：

1. 查看 [常见问题](./BATTLE_ENGINE_DOCUMENTATION.md#常见问题)
2. 搜索本文档索引
3. 查看 [调试技巧](./DEVELOPER_GUIDE.md#调试技巧)
4. 提交 Issue 或联系开发者

---

**祝您使用愉快！**
