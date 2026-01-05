/**
 * ===========================================
 * NECROZMA-FUSION.JS - 奈克洛兹玛合体系统
 * ===========================================
 * 
 * 职责:
 * - 开局检测队伍中的 Necrozma + Solgaleo/Lunala 组合
 * - 自动执行合体变形（日骡子/月骡子）
 * - 处理双选择时的 XY 菜单
 * - Ultra Burst 后支持专属 Z 招式
 * 
 * 合体规则:
 * - Necrozma + Lunala → Necrozma-Dawn-Wings (月骡子)
 * - Necrozma + Solgaleo → Necrozma-Dusk-Mane (日骡子)
 * - 合体后原始宝可梦（Lunala/Solgaleo）血量减半但仍可出战
 * - 如果同时有 Lunala 和 Solgaleo，弹出选择菜单
 * 
 * Ultra Burst:
 * - 当 mechanic === 'zmove' 时，日/月骡子可以 Ultra Burst
 * - Ultra Burst 后变成 Necrozma-Ultra (究极奈克洛兹玛)
 * - 可以使用专属 Z 招式 "Light That Burns the Sky"
 */

// ============================================
// 合体检测与执行
// ============================================

/**
 * 检测队伍中是否存在 Necrozma 合体条件
 * @param {Array} party - 队伍数组
 * @returns {Object} { necrozmaIndex, lunalaIndex, solgaleoIndex, canFuse }
 */
function detectNecrozmaFusion(party) {
    if (!party || !Array.isArray(party)) return { canFuse: false };
    
    let necrozmaIndex = -1;
    let lunalaIndex = -1;
    let solgaleoIndex = -1;
    
    party.forEach((poke, index) => {
        if (!poke) return;
        const name = (poke.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // 检测原始形态的 Necrozma（不是已经合体的形态）
        if (name === 'necrozma') {
            necrozmaIndex = index;
        }
        // 检测 Lunala
        if (name === 'lunala') {
            lunalaIndex = index;
        }
        // 检测 Solgaleo
        if (name === 'solgaleo') {
            solgaleoIndex = index;
        }
    });
    
    const hasLunala = lunalaIndex !== -1;
    const hasSolgaleo = solgaleoIndex !== -1;
    const hasNecrozma = necrozmaIndex !== -1;
    
    return {
        necrozmaIndex,
        lunalaIndex,
        solgaleoIndex,
        hasLunala,
        hasSolgaleo,
        hasNecrozma,
        canFuse: hasNecrozma && (hasLunala || hasSolgaleo),
        hasBothOptions: hasNecrozma && hasLunala && hasSolgaleo
    };
}

/**
 * 执行 Necrozma 合体
 * @param {Array} party - 队伍数组
 * @param {string} fusionType - 'dusk' (日骡子) 或 'dawn' (月骡子)
 * @param {Object} detection - detectNecrozmaFusion 的返回值
 * @returns {Object} { success, logs, fusedPokemon }
 */
function executeNecrozmaFusion(party, fusionType, detection) {
    const logs = [];
    
    if (!detection.canFuse) {
        return { success: false, logs: ['合体条件不满足'], fusedPokemon: null };
    }
    
    const necrozma = party[detection.necrozmaIndex];
    let fusionPartner = null;
    let fusionPartnerIndex = -1;
    let newFormName = '';
    let newFormCnName = '';
    
    if (fusionType === 'dawn' && detection.hasLunala) {
        fusionPartner = party[detection.lunalaIndex];
        fusionPartnerIndex = detection.lunalaIndex;
        newFormName = 'Necrozma-Dawn-Wings';
        newFormCnName = '拂晓之翼·奈克洛兹玛';
    } else if (fusionType === 'dusk' && detection.hasSolgaleo) {
        fusionPartner = party[detection.solgaleoIndex];
        fusionPartnerIndex = detection.solgaleoIndex;
        newFormName = 'Necrozma-Dusk-Mane';
        newFormCnName = '黄昏之鬃·奈克洛兹玛';
    } else {
        return { success: false, logs: ['无效的合体类型'], fusedPokemon: null };
    }
    
    // 记录原始数据
    const originalNecrozmaName = necrozma.cnName || necrozma.name;
    const originalPartnerName = fusionPartner.cnName || fusionPartner.name;
    
    // 1. 变形 Necrozma 为合体形态
    necrozma.name = newFormName;
    necrozma.cnName = newFormCnName;
    
    // 更新属性（从 pokedex 获取）
    if (typeof POKEDEX !== 'undefined') {
        const formId = newFormName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const formData = POKEDEX[formId];
        if (formData) {
            necrozma.types = formData.types || necrozma.types;
            // 更新种族值
            if (formData.baseStats) {
                necrozma.baseStats = { ...formData.baseStats };
            }
        }
    }
    
    // 添加 Photon Geyser 招式（如果没有的话）
    const hasPhotonGeyser = (necrozma.moves || []).some(m => {
        const moveName = (m.name || m || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return moveName === 'photongeyser';
    });
    
    if (!hasPhotonGeyser) {
        // 从招式数据库获取 Photon Geyser
        const photonGeyserData = (typeof MOVES !== 'undefined' && MOVES.photongeyser) 
            ? { ...MOVES.photongeyser, name: 'Photon Geyser' }
            : { name: 'Photon Geyser', type: 'Psychic', power: 100, cat: 'spec', accuracy: 100 };
        
        // 替换最后一个招式或添加
        if (necrozma.moves && necrozma.moves.length >= 4) {
            necrozma.moves[3] = photonGeyserData;
        } else if (necrozma.moves) {
            necrozma.moves.push(photonGeyserData);
        }
        logs.push(`${newFormCnName} 习得了 光子喷涌！`);
    }
    
    // 标记为已合体，保存原始信息
    necrozma.isFused = true;
    necrozma.fusionType = fusionType;
    necrozma.fusionPartnerIndex = fusionPartnerIndex;
    necrozma.originalNecrozmaData = {
        name: 'Necrozma',
        cnName: originalNecrozmaName
    };
    
    // 注意：不自动设置 mechanic，保留原始 Necrozma 的 mechanic 设置
    // 只有当原始 Necrozma 的 mechanic === 'zmove' 时才能 Ultra Burst
    
    // 2. 处理合体伙伴（血量减半）
    fusionPartner.fusedIntoNecrozma = true;
    fusionPartner.fusionNecrozmaIndex = detection.necrozmaIndex;
    
    // 血量减半（同时更新 maxHp 和 currHp）
    const originalMaxHp = fusionPartner.maxHp;
    const originalCurrHp = fusionPartner.currHp;
    fusionPartner.maxHp = Math.floor(fusionPartner.maxHp / 2);
    fusionPartner.currHp = Math.min(fusionPartner.currHp, fusionPartner.maxHp);
    
    logs.push(`✦ ${originalNecrozmaName} 与 ${originalPartnerName} 合体！`);
    logs.push(`✦ ${originalNecrozmaName} 变为 ${newFormCnName}！`);
    logs.push(`✦ ${originalPartnerName} 的力量被分享，HP 减半 (${originalCurrHp}/${originalMaxHp} → ${fusionPartner.currHp}/${fusionPartner.maxHp})！`);
    
    console.log(`[NECROZMA FUSION] ${originalNecrozmaName} + ${originalPartnerName} → ${newFormName}`);
    
    return {
        success: true,
        logs,
        fusedPokemon: necrozma,
        fusionPartner
    };
}

// ============================================
// Ultra Burst 系统
// ============================================

/**
 * 检测是否可以 Ultra Burst
 * @param {Object} pokemon - 宝可梦对象
 * @returns {boolean}
 */
function canUltraBurst(pokemon) {
    if (!pokemon) return false;
    
    const name = (pokemon.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // 只有日骡子和月骡子可以 Ultra Burst
    const isEligible = name === 'necrozmaduskmane' || name === 'necrozmadawnwings';
    
    // 需要 mechanic === 'zmove'
    const hasZMechanic = pokemon.mechanic === 'zmove';
    
    // 还没有 Ultra Burst 过
    const notBursted = !pokemon.isUltraBursted;
    
    return isEligible && hasZMechanic && notBursted;
}

/**
 * 执行 Ultra Burst
 * @param {Object} pokemon - 宝可梦对象
 * @returns {Object} { success, logs }
 */
function executeUltraBurst(pokemon) {
    const logs = [];
    
    if (!canUltraBurst(pokemon)) {
        return { success: false, logs: ['无法执行 Ultra Burst'] };
    }
    
    const originalName = pokemon.cnName || pokemon.name;
    
    // 变形为究极奈克洛兹玛
    pokemon.name = 'Necrozma-Ultra';
    pokemon.cnName = '究极奈克洛兹玛';
    pokemon.isUltraBursted = true;
    
    // 【关键】清除 Z 招式缓存，让系统重新计算专属 Z
    delete pokemon._cachedBestZ;
    
    // 更新属性
    pokemon.types = ['Psychic', 'Dragon'];
    
    // 更新特性为脑核之力
    pokemon.ability = 'Neuroforce';
    pokemon.abilityName = '脑核之力';
    
    // 更新种族值（从 pokedex 获取或使用默认值）
    if (typeof POKEDEX !== 'undefined' && POKEDEX.necrozmaultra) {
        const ultraData = POKEDEX.necrozmaultra;
        if (ultraData.baseStats) {
            pokemon.baseStats = { ...ultraData.baseStats };
        }
    } else {
        // 默认究极奈克洛兹玛种族值
        pokemon.baseStats = { hp: 97, atk: 167, def: 97, spa: 167, spd: 97, spe: 129 };
    }
    
    // 重新计算实际能力值
    if (typeof pokemon.recalculateStats === 'function') {
        pokemon.recalculateStats();
    }
    
    logs.push(`<b style="color:#fbbf24; text-shadow: 0 0 10px #fbbf24;">☀ ULTRA BURST ☀</b>`);
    logs.push(`<span style="color:#fbbf24">${originalName} 释放了光辉的力量！</span>`);
    logs.push(`<span style="color:#fbbf24">✦ ${originalName} 变为 究极奈克洛兹玛！</span>`);
    logs.push(`<span style="color:#fbbf24">✦ 特性变为 脑核之力 (Neuroforce)！</span>`);
    
    console.log(`[ULTRA BURST] ${originalName} → Necrozma-Ultra`);
    
    return { success: true, logs };
}

// ============================================
// 合体选择对话框 (复用 Mega 选择框风格)
// ============================================

/**
 * 显示 Necrozma 合体选择对话框
 * @param {Object} necrozma - Necrozma 宝可梦对象
 * @param {Object} options - 选项配置 { hasZMechanic, hasLunala, hasSolgaleo }
 * @param {Function} callback - 选择完成后的回调，参数为 'ultra' | 'dusk' | 'dawn' | null
 */
function showNecrozmaFusionDialog(necrozma, options, callback) {
    const { hasZMechanic, hasLunala, hasSolgaleo } = options;
    
    // 注入动画样式
    if (!document.getElementById('necrozma-fusion-style')) {
        const style = document.createElement('style');
        style.id = 'necrozma-fusion-style';
        style.textContent = `
            :root {
                --fusion-dusk-color: #f59e0b;
                --fusion-dawn-color: #8b5cf6;
                --fusion-ultra-color: #fbbf24;
                --fusion-base-color: #1e293b;
            }
            .fusion-overlay-simple {
                animation: fadeInOpacity 0.3s ease-out forwards;
            }
            @keyframes fadeInOpacity {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes glassUp {
                from { opacity: 0; transform: translateY(30px) skewX(-10deg); }
                to { opacity: 1; transform: translateY(0) skewX(-10deg); }
            }
            .fusion-bg-grid {
                background-image: 
                    linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
                background-size: 20px 20px;
            }
        `;
        document.head.appendChild(style);
    }

    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.className = 'necrozma-fusion-overlay fusion-overlay-simple';
    overlay.style.cssText = `
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.55);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 12000;
    `;

    // 创建对话框容器
    const dialogShape = document.createElement('div');
    dialogShape.className = 'fusion-dialog-shape';
    dialogShape.style.cssText = `
        position: relative;
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(20px) saturate(1.8);
        -webkit-backdrop-filter: blur(20px) saturate(1.8);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.6),
            inset 0 0 0 1px rgba(255, 255, 255, 0.1),
            0 0 100px rgba(251, 191, 36, 0.2);
        padding: 40px 60px;
        border-radius: 20px;
        max-width: 800px;
        transform: skewX(-10deg);
        animation: glassUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        overflow: hidden;
    `;

    // 背景网格
    const bgDecor = document.createElement('div');
    bgDecor.className = 'fusion-bg-grid';
    bgDecor.style.cssText = `
        position: absolute;
        top: -50%; left: -50%; width: 200%; height: 200%;
        z-index: 0;
        pointer-events: none;
        transform: skewX(10deg);
        opacity: 0.3;
    `;
    dialogShape.appendChild(bgDecor);
    
    // 顶部彩色装饰条
    const topBar = document.createElement('div');
    topBar.style.cssText = `
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 6px;
        background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 50%, #8b5cf6 100%);
        z-index: 2;
        box-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
    `;
    dialogShape.appendChild(topBar);

    // 内容容器
    const content = document.createElement('div');
    content.style.cssText = `
        transform: skewX(10deg);
        position: relative;
        z-index: 5;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
    `;

    // 标题
    const title = document.createElement('h2');
    title.innerHTML = `NECROZMA FUSION`;
    title.style.cssText = `
        color: #fbbf24;
        font-family: inherit;
        font-size: 32px;
        font-weight: 900;
        font-style: italic;
        margin: 0;
        letter-spacing: -1px;
        line-height: 1;
        text-shadow: 0 0 30px rgba(251, 191, 36, 0.5);
    `;

    const subTitle = document.createElement('div');
    subTitle.textContent = hasZMechanic ? `选择合体形态 (Z-MOVE 已启用)` : `选择合体形态`;
    subTitle.style.cssText = `
        color: #94a3b8;
        font-size: 14px;
        font-weight: 600;
        margin-top: 8px;
        margin-bottom: 35px;
        text-transform: uppercase;
        letter-spacing: 2px;
    `;

    // 主容器 - 2x2 网格布局
    const mainContainer = document.createElement('div');
    mainContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 16px;
        width: 100%;
    `;

    // 创建按钮的辅助函数
    const createOptionButton = (opt, isLarge) => {
        const btn = document.createElement('div');
        const padding = isLarge ? '24px 20px' : '16px 12px';
        const minHeight = isLarge ? '140px' : '80px';
        
        btn.style.cssText = `
            flex: 1;
            min-height: ${minHeight};
            background: rgba(30, 41, 59, 0.8);
            border: 1px solid rgba(255,255,255,0.1);
            border-bottom: 4px solid ${opt.color}30;
            border-radius: 16px;
            padding: ${padding};
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        `;

        const labelSize = isLarge ? '48px' : '32px';
        const subLabelSize = isLarge ? '11px' : '9px';
        const descSize = isLarge ? '13px' : '10px';
        const noteSize = isLarge ? '10px' : '8px';
        
        btn.innerHTML = `
            <div style="font-size: ${subLabelSize}; font-weight: 800; color: ${opt.color}; opacity: 0.8; letter-spacing: 1.5px; margin-bottom: 4px;">${opt.subLabel}</div>
            <div style="font-size: ${labelSize}; font-weight: 900; color: #f1f5f9; line-height:1; font-style: italic; position: relative; z-index:2;">${opt.label}</div>
            <div style="font-size: ${descSize}; font-weight: 700; color: #64748b; margin-top: 6px; letter-spacing: 0.5px;">${opt.desc}</div>
            <div style="font-size: ${noteSize}; color: #475569; margin-top: 4px;">${opt.note}</div>
            <div class="fill-anim" style="
                position: absolute; bottom: 0; left: 0; right: 0; height: 0; 
                background: ${opt.color}; z-index: 1;
                transition: height 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            "></div>
        `;

        btn.onmouseenter = () => {
            btn.style.transform = 'translateY(-4px)';
            btn.style.borderBottomColor = opt.color;
            btn.style.boxShadow = `0 12px 25px -5px ${opt.color}40, 0 0 30px ${opt.color}20`;
            btn.children[0].style.color = 'rgba(255,255,255,0.9)';
            btn.children[1].style.color = '#fff';
            btn.children[2].style.color = 'rgba(255,255,255,0.7)';
            btn.children[3].style.color = 'rgba(255,255,255,0.5)';
            btn.querySelector('.fill-anim').style.height = '100%';
        };
        
        btn.onmouseleave = () => {
            btn.style.transform = 'translateY(0)';
            btn.style.borderBottomColor = `${opt.color}30`;
            btn.style.boxShadow = 'none';
            btn.children[0].style.color = opt.color;
            btn.children[1].style.color = '#f1f5f9';
            btn.children[2].style.color = '#64748b';
            btn.children[3].style.color = '#475569';
            btn.querySelector('.fill-anim').style.height = '0';
        };

        btn.onclick = () => {
            overlay.style.transition = 'opacity 0.2s';
            overlay.style.opacity = '0';
            setTimeout(() => document.body.removeChild(overlay), 200);
            callback(opt.id);
        };

        return btn;
    };

    // 上排：究极选项（大按钮）
    if (hasZMechanic) {
        const ultraRow = document.createElement('div');
        ultraRow.style.cssText = `
            display: flex;
            gap: 16px;
            width: 100%;
        `;

        if (hasSolgaleo) {
            ultraRow.appendChild(createOptionButton({ 
                id: 'ultra_dusk', 
                label: '☀', 
                subLabel: 'ULTRA BURST',
                desc: '究极奈克洛兹玛',
                note: 'Solgaleo → 黄昏之鬃 → Ultra',
                color: '#fbbf24'
            }, true));
        }
        if (hasLunala) {
            ultraRow.appendChild(createOptionButton({ 
                id: 'ultra_dawn', 
                label: '☽', 
                subLabel: 'ULTRA BURST',
                desc: '究极奈克洛兹玛',
                note: 'Lunala → 拂晓之翼 → Ultra',
                color: '#fbbf24'
            }, true));
        }
        
        if (ultraRow.children.length > 0) {
            mainContainer.appendChild(ultraRow);
        }
    }

    // 下排：日/月骡子选项（小按钮）
    const normalRow = document.createElement('div');
    normalRow.style.cssText = `
        display: flex;
        gap: 16px;
        width: 100%;
    `;

    if (hasSolgaleo) {
        normalRow.appendChild(createOptionButton({ 
            id: 'dusk', 
            label: '日', 
            subLabel: 'DUSK MANE',
            desc: '黄昏之鬃',
            note: '+ Solgaleo',
            color: '#f59e0b'
        }, false));
    }
    
    if (hasLunala) {
        normalRow.appendChild(createOptionButton({ 
            id: 'dawn', 
            label: '月', 
            subLabel: 'DAWN WINGS',
            desc: '拂晓之翼',
            note: '+ Lunala',
            color: '#8b5cf6'
        }, false));
    }

    if (normalRow.children.length > 0) {
        mainContainer.appendChild(normalRow);
    }

    // 兼容旧变量名
    const optionsContainer = mainContainer;

    // 取消按钮
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '不合体';
    cancelBtn.style.cssText = `
        margin-top: 35px;
        background: transparent;
        border: 2px solid #475569;
        color: #64748b;
        font-weight: 800;
        font-size: 12px;
        letter-spacing: 1px;
        cursor: pointer;
        padding: 8px 32px;
        border-radius: 50px;
        transition: all 0.2s;
        font-family: inherit;
    `;
    cancelBtn.onmouseenter = () => {
        cancelBtn.style.borderColor = '#64748b';
        cancelBtn.style.color = '#94a3b8';
        cancelBtn.style.background = 'rgba(255,255,255,0.05)';
    };
    cancelBtn.onmouseleave = () => {
        cancelBtn.style.borderColor = '#475569';
        cancelBtn.style.color = '#64748b';
        cancelBtn.style.background = 'transparent';
    };
    
    cancelBtn.onclick = () => {
        overlay.style.transition = 'opacity 0.2s';
        overlay.style.opacity = '0';
        setTimeout(() => document.body.removeChild(overlay), 200);
        callback(null);
    };

    // 组装结构
    content.appendChild(title);
    content.appendChild(subTitle);
    content.appendChild(optionsContainer);
    content.appendChild(cancelBtn);

    dialogShape.appendChild(content);
    overlay.appendChild(dialogShape);
    
    document.body.appendChild(overlay);

    overlay.onclick = (e) => {
        if (e.target === overlay) {
            cancelBtn.click();
        }
    };
}

// ============================================
// 战斗开始时的合体检测入口
// ============================================

/**
 * 战斗开始时检测并处理 Necrozma 合体
 * @param {Array} party - 玩家队伍
 * @param {Function} logFn - 日志输出函数
 * @param {Function} onComplete - 完成回调
 */
function checkAndProcessNecrozmaFusion(party, logFn, onComplete) {
    const log = logFn || console.log;
    const detection = detectNecrozmaFusion(party);
    
    if (!detection.canFuse) {
        console.log('[NECROZMA FUSION] 队伍中没有可合体的组合');
        if (onComplete) onComplete();
        return;
    }
    
    console.log('[NECROZMA FUSION] 检测到合体条件:', detection);
    
    const necrozma = party[detection.necrozmaIndex];
    const hasZMechanic = necrozma.mechanic === 'zmove';
    
    // 处理选择结果的函数
    const handleChoice = (choice) => {
        if (!choice) {
            log(`<span style="color:#94a3b8">奈克洛兹玛 选择不进行合体。</span>`);
            if (onComplete) onComplete();
            return;
        }
        
        // 解析选择
        let fusionType = choice;
        let shouldUltraBurst = false;
        
        if (choice.startsWith('ultra_')) {
            shouldUltraBurst = true;
            fusionType = choice.replace('ultra_', ''); // 'ultra_dusk' -> 'dusk'
        }
        
        // 执行合体
        const result = executeNecrozmaFusion(party, fusionType, detection);
        if (result.success) {
            result.logs.forEach(msg => log(msg));
            
            // 如果选择了究极形态，立即执行 Ultra Burst（不更新中间状态的精灵图）
            if (shouldUltraBurst && hasZMechanic) {
                const burstResult = executeUltraBurst(necrozma);
                if (burstResult.success) {
                    burstResult.logs.forEach(msg => log(msg));
                }
                // 只更新最终形态的精灵图
                updateNecrozmaSprite(necrozma);
                if (onComplete) onComplete();
                return;
            }
            
            // 只选择日/月骡子，更新精灵图
            updateNecrozmaSprite(necrozma);
        }
        if (onComplete) onComplete();
    };
    
    // 判断是否需要显示选择菜单
    const needsDialog = detection.hasBothOptions || hasZMechanic;
    
    if (needsDialog) {
        // 显示选择菜单
        showNecrozmaFusionDialog(necrozma, {
            hasZMechanic,
            hasLunala: detection.hasLunala,
            hasSolgaleo: detection.hasSolgaleo
        }, handleChoice);
    } else {
        // 只有一个选项且没有 Z 机制，自动合体
        const fusionType = detection.hasLunala ? 'dawn' : 'dusk';
        const result = executeNecrozmaFusion(party, fusionType, detection);
        if (result.success) {
            result.logs.forEach(msg => log(msg));
            // 更新精灵图
            updateNecrozmaSprite(necrozma);
        }
        if (onComplete) onComplete();
    }
}

/**
 * 更新 Necrozma 的精灵图
 * @param {Object} pokemon - 宝可梦对象
 */
function updateNecrozmaSprite(pokemon) {
    if (!pokemon) return;
    
    // 尝试更新玩家精灵图
    if (typeof window !== 'undefined' && typeof window.updateAllVisuals === 'function') {
        window.updateAllVisuals('player');
    }
    
    // 如果有 smartLoadSprite 函数，直接更新
    if (typeof window !== 'undefined' && typeof window.smartLoadSprite === 'function') {
        const spriteUrl = pokemon.getSprite ? pokemon.getSprite(true) : null;
        if (spriteUrl) {
            window.smartLoadSprite('player-sprite', spriteUrl, true);
        }
    }
    
    console.log(`[NECROZMA FUSION] 精灵图已更新: ${pokemon.name}`);
}

// ============================================
// 导出
// ============================================

if (typeof window !== 'undefined') {
    window.detectNecrozmaFusion = detectNecrozmaFusion;
    window.executeNecrozmaFusion = executeNecrozmaFusion;
    window.canUltraBurst = canUltraBurst;
    window.executeUltraBurst = executeUltraBurst;
    window.showNecrozmaFusionDialog = showNecrozmaFusionDialog;
    window.checkAndProcessNecrozmaFusion = checkAndProcessNecrozmaFusion;
    window.updateNecrozmaSprite = updateNecrozmaSprite;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        detectNecrozmaFusion,
        executeNecrozmaFusion,
        canUltraBurst,
        executeUltraBurst,
        showNecrozmaFusionDialog,
        checkAndProcessNecrozmaFusion,
        updateNecrozmaSprite
    };
}

console.log('[NECROZMA FUSION] 奈克洛兹玛合体系统已加载');
