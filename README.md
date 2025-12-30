
# 致谢名单 (Credits & Acknowledgments)

本项目 是一个基于 Web 技术的宝可梦对战模拟引擎。本项目的实现离不开开源社区的无私贡献、优秀的资源整理者以及原始版权所有者的创作。

以下是本项目引用的资源列表及致谢。

## 🛠️ 核心数据与引擎机制 / Core Data & Mechanics

本项目的大部分战斗数据、伤害计算公式及基础逻辑高度参考并移植自 **Pokémon Showdown** 项目。

*   **Pokémon Showdown**: [https://pokemonshowdown.com/](https://pokemonshowdown.com/)
:   **Github**: [smogon/pokemon-showdown](https://github.com/smogon/pokemon-showdown)
    *   引用了 `data/` 目录下的宝可梦种族值 (Pokedex)、招式数据 (Moves)、特性数据 (Abilities) 及道具信息 (Items)。
    *   参考了其伤害计算逻辑 (Damage Calc) 与状态机制处理。

## 🇨🇳 本地化与翻译 / Localization

本项目使用的中文技能、特性及描述文本，由 **PSChina (Pokemon Showdown China)** 社区及其贡献者整理制作。

*   **Showdown Translation (Tampermonkey Script)**
    *   **脚本作者 (Author)**: Ceca3
    *   **项目来源**: PSChina Server Translation (剑盾测试先行版)
    *   **贡献**: 核心的“中-英”映射字典（汉化数据库）直接取材于该项目的经过社区长期验证的翻译数据。
    *   特别感谢 PSChina 社区对宝可梦对战中文化做出的卓越贡献。

## 🎨 美术资源 / Visual Assets

本项目没有托管庞大的图片数据库，而是使用动态加载技术引用了以下优秀的公共资源库，以及部分 UI 设计灵感引用。

**精灵图与图标 (Sprites & Icons)**
*   **Pokémon Showdown Sprite Library**: [play.pokemonshowdown.com](https://play.pokemonshowdown.com/sprites/)
    *   提供了 Gen 1-5 的动态像素图 (Animated Sprites) 及 Gen 6+ 的静态模型图。
*   **PkParaiso**: [pkparaiso.com](https://www.pkparaiso.com/)
    *   提供了部分高世代的高质量 3D 模型动态 GIF，用于战斗演出。
*   **PokéSprite**: [github.com/msikma/pokesprite](https://github.com/msikma/pokesprite)
    *   提供了极其完善的宝可梦菜单图标 (PC Box Icons) 和道具图标数据。

**UI 设计 (interface Design)**
*   **风格致敬**:
    *   本项目 UI 风格混合了 **《宝可梦：剑/盾 (Pokémon Sword & Shield)》** 的扁平化竞技场风格与 **《女神异闻录5 (Persona 5)》** 的动态剪切风格。
    *   古武系统 (Styles) UI 致敬了 **《宝可梦传说：阿尔宙斯 (Pokémon Legends: Arceus)》**。

## 🎵 音效与音乐 / Audio & BGM

*   **宝可梦叫声 (Cries)**:
    *   音频文件动态请求自 `play.pokemonshowdown.com/audio/cries/`。
*   **背景音乐 (BGM) & 音效 (SFX)**:
    *   版权归属于 **Nintendo (任天堂)**, **Game Freak**, **The Pokémon Company** 及原作曲家（一之濑刚, 增田顺一等）。本项目仅做学习与演示用途使用。

## ⚖️ 免责声明 / Disclaimer

**Pokémon®**, **Pokémon Character Names**, **Nintendo®**, **Game Freak**, and **The Pokémon Company** are trademarks of **Nintendo**.

本项目 是一个非营利性的、开源的粉丝自制项目 (Fan-made Project)。
*   本软件完全免费，不用于任何商业目的。
*   所有与《宝可梦》相关的原文设定、图像、音频文件的版权均归版权方所有。
*   如有侵权，请联系开发者删除相关内容。

---

*This file was generated to respect and credit the hard work of the community.*