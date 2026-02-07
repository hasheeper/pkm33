/**
 * ===========================================
 * BATTLE-VFX.JS - 战斗视觉特效引擎
 * ===========================================
 * 
 * 从 battle/effect/debug-console.js 嫁接
 * 适配主项目 DOM 结构 (index.html)
 * 
 * 职责:
 * - 攻击命中特效 (属性图标爆裂 + 扩散环 + 全屏闪光)
 * - 接触类冲撞动画 (dash-strike 透视冲撞)
 * - 未命中/闪避动画
 * - 能力变化粒子 (BUFF↑ / DEBUFF↓ / HEAL+)
 * - 状态异常图标弹跳 (BRN / FRZ / PAR / PSN)
 * 
 * 依赖: index.css 中的 VFX 动画库
 */

const TYPE_COLORS = {
    Normal: '#a8a878',   Fire: '#f08030',    Water: '#6890f0',
    Grass: '#78c850',    Electric: '#f8d030', Ice: '#98d8d8',
    Fighting: '#c03028', Poison: '#a040a0',  Ground: '#e0c068',
    Flying: '#a890f0',   Psychic: '#f85888', Bug: '#a8b820',
    Rock: '#b8a038',     Ghost: '#705898',   Dragon: '#7038f8',
    Dark: '#705848',     Steel: '#b8b8d0',   Fairy: '#ee99ac',
    // lowercase aliases
    normal: '#a8a878',   fire: '#f08030',    water: '#6890f0',
    grass: '#78c850',    electric: '#f8d030', ice: '#98d8d8',
    fighting: '#c03028', poison: '#a040a0',  ground: '#e0c068',
    flying: '#a890f0',   psychic: '#f85888', bug: '#a8b820',
    rock: '#b8a038',     ghost: '#705898',   dragon: '#7038f8',
    dark: '#705848',     steel: '#b8b8d0',   fairy: '#ee99ac'
};

const CDN_TYPE_ICONS = 'https://cdn.jsdelivr.net/gh/duiker101/pokemon-type-svg-icons/icons/';

// ============================================
// 辅助：根据 spriteId 找到 wrapper 和 sprite
// ============================================

function _getElements(spriteId) {
    const sprite = document.getElementById(spriteId);
    if (!sprite) return null;
    const wrapper = sprite.closest('.sprite-wrapper');
    return { sprite, wrapper };
}

function _getSide(spriteId) {
    return spriteId === 'player-sprite' ? 'player' : 'enemy';
}

function _getWrapper(side) {
    return document.querySelector(`.${side}-pos`);
}

// ============================================
// 1. 远程攻击命中特效 (属性图标 + 扩散环 + 闪光)
// ============================================

function triggerRangedVFX(type, targetSpriteId, effectiveness, isCritical) {
    const typeLower = (type || 'normal').toLowerCase();
    const color = TYPE_COLORS[typeLower] || '#FFFFFF';

    const els = _getElements(targetSpriteId);
    if (!els) return;
    const { sprite: targetSprite, wrapper: targetWrapper } = els;

    // 效果强度
    let effKey = 'normal';
    if (effectiveness >= 2) effKey = 'super';
    else if (effectiveness > 0 && effectiveness <= 0.5) effKey = 'weak';

    let intensityMulti = 1.0;
    if (effKey === 'weak') intensityMulti = 0.6;
    if (effKey === 'super') intensityMulti = 1.6;
    if (isCritical) intensityMulti *= 1.25;

    // --- 全屏闪光 ---
    const flashDiv = document.createElement('div');
    flashDiv.className = 'flash-overlay';
    flashDiv.style.setProperty('--flash-color', isCritical ? '#ffffff' : color);

    let flashDuration = '0.3s';
    if (effKey === 'weak') flashDuration = '0.1s';
    if (effKey === 'super') flashDuration = '0.6s';
    flashDiv.style.animation = `screen-flash ${flashDuration} ease-out forwards`;
    if (effKey === 'weak') flashDiv.style.opacity = '0.3';

    const stage = document.querySelector('.battle-stage');
    if (stage) {
        stage.appendChild(flashDiv);
        setTimeout(() => flashDiv.remove(), 600);
    }

    // --- 精灵震动 (应用在 wrapper 上，不覆盖极巨化等精灵自身动画) ---
    if (targetWrapper) {
        const shakeDuration = effKey === 'weak' ? '0.2s' : '0.5s';
        targetWrapper.style.animation = `shake-hard ${shakeDuration} ease-out`;
        setTimeout(() => { targetWrapper.style.animation = ''; }, 600);
    }

    // --- 属性图标爆裂 + 扩散环 ---
    const vfxAnchor = document.createElement('div');
    vfxAnchor.className = 'vfx-hit-anchor';
    vfxAnchor.style.setProperty('--flash-color', color);
    vfxAnchor.style.transform = `scale(${intensityMulti})`;

    if (effKey === 'weak') vfxAnchor.classList.add('eff-weak');
    if (effKey === 'super') vfxAnchor.classList.add('eff-super');
    if (isCritical) vfxAnchor.classList.add('is-crit');

    const burstIcon = document.createElement('img');
    burstIcon.src = `${CDN_TYPE_ICONS}${typeLower}.svg`;
    burstIcon.className = 'vfx-icon';
    if (!isCritical) {
        burstIcon.style.animation = 'icon-burst 0.6s ease-out forwards';
    }

    const burstRing = document.createElement('div');
    burstRing.className = 'vfx-ring';
    burstRing.style.borderColor = color;
    burstRing.style.boxShadow = effKey !== 'weak' ? `0 0 20px ${color}` : 'none';
    burstRing.style.animation = 'ring-expand 0.5s ease-out forwards';

    vfxAnchor.appendChild(burstRing);

    if (effKey === 'super') {
        const echoRing = burstRing.cloneNode(true);
        echoRing.classList.add('echo-wave');
        vfxAnchor.appendChild(echoRing);
    }

    vfxAnchor.appendChild(burstIcon);
    targetWrapper.appendChild(vfxAnchor);

    setTimeout(() => vfxAnchor.remove(), 800);
}

// ============================================
// 2. 接触类冲撞动画 (dash-strike)
// ============================================

function triggerContactVFX(type, attackerSpriteId, effectiveness, isCritical) {
    const atkEls = _getElements(attackerSpriteId);
    if (!atkEls) return;
    const { sprite: atkSprite, wrapper: atkWrap } = atkEls;

    const defSpriteId = attackerSpriteId === 'player-sprite' ? 'enemy-sprite' : 'player-sprite';
    const defEls = _getElements(defSpriteId);
    if (!defEls) return;
    const { wrapper: defWrap } = defEls;

    const atkRect = atkWrap.getBoundingClientRect();
    const defRect = defWrap.getBoundingClientRect();

    let dx = (defRect.left + defRect.width / 2) - (atkRect.left + atkRect.width / 2);
    let dy = (defRect.top + defRect.height / 2) - (atkRect.top + atkRect.height / 2);

    const gapX = 100;
    const gapY = 0;
    let startScale, endScale;

    const isPlayer = attackerSpriteId === 'player-sprite';
    if (isPlayer) {
        dx -= gapX; dy -= gapY;
        startScale = 1.4; endScale = 0.7;
    } else {
        dx += gapX; dy += gapY - 40; // 【微调】敌方终点向上偏移 40px
        startScale = 1.0; endScale = 1.2;
    }

    atkSprite.style.setProperty('--atk-x', `${dx}px`);
    atkSprite.style.setProperty('--atk-y', `${dy}px`);
    atkSprite.style.setProperty('--scale-start', startScale);
    atkSprite.style.setProperty('--scale-end', endScale);

    atkSprite.classList.remove('anim-dash');
    void atkSprite.offsetWidth;
    atkSprite.classList.add('anim-dash');

    setTimeout(() => {
        // 接触命中音效（延迟到冲撞到位时播放）
        if (typeof window.playHitSFX === 'function') {
            window.playHitSFX(effectiveness, isCritical);
        }

        triggerRangedVFX(type, defSpriteId, effectiveness, isCritical);

        // 画面震动
        const stage = document.querySelector('.battle-stage');
        if (stage) {
            let shakePower = 5;
            if (effectiveness <= 0.5) shakePower = 2;
            if (effectiveness >= 2) shakePower = 10;
            if (isCritical) shakePower += 5;

            stage.style.transition = 'transform 0.05s';
            const sx = Math.random() * shakePower * 2 - shakePower;
            const sy = Math.random() * shakePower - shakePower / 2;
            stage.style.transform = `translate(${sx}px, ${sy}px)`;
            setTimeout(() => { stage.style.transform = 'none'; }, 60);
        }
    }, 350);

    // 清理（安全引用，防止 pivot 换人后精灵元素被替换）
    const atkSpriteRef = atkSprite;
    setTimeout(() => {
        try {
            atkSpriteRef.classList.remove('anim-dash');
            atkSpriteRef.style.removeProperty('--atk-x');
            atkSpriteRef.style.removeProperty('--atk-y');
            atkSpriteRef.style.removeProperty('--scale-start');
            atkSpriteRef.style.removeProperty('--scale-end');
        } catch(e) { /* sprite may have been replaced by pivot switch */ }
    }, 1050);
}

// ============================================
// 3. 未命中/闪避动画
// ============================================

function triggerMissVFX(targetSpriteId) {
    const els = _getElements(targetSpriteId);
    if (!els) return;
    const { sprite: targetSprite, wrapper: targetWrapper } = els;

    if (targetSprite) {
        targetSprite.classList.remove('anim-dodge');
        void targetSprite.offsetWidth;
        targetSprite.classList.add('anim-dodge');
    }

    const missText = document.createElement('div');
    missText.className = 'vfx-text-popup';
    missText.innerText = 'MISS';
    targetWrapper.appendChild(missText);

    setTimeout(() => {
        if (targetSprite) targetSprite.classList.remove('anim-dodge');
        missText.remove();
    }, 800);
}

// ============================================
// 4. 能力变化粒子 (BUFF / DEBUFF / HEAL)
// ============================================

function triggerStatVFX(mode, targetSpriteId) {
    const els = _getElements(targetSpriteId);
    if (!els) return;
    const { sprite: targetSprite, wrapper: targetWrap } = els;

    let color = '#ffffff';
    let animName = 'sc-rise';
    let className = 'vfx-arrow';

    if (mode === 'BUFF') {
        color = '#f0932b';
        animName = 'sc-rise';
    } else if (mode === 'DEBUFF') {
        color = '#33cfed';
        animName = 'sc-fall';
        className = 'vfx-arrow down';
    } else if (mode === 'HEAL') {
        color = '#2ed573';
        animName = 'sc-rise';
        className = 'vfx-plus';
    }

    // 光晕效果应用在 wrapper 上，不干扰精灵自身动画（极巨化等）
    if (targetWrap) {
        targetWrap.style.setProperty('--stat-color', color);
        targetWrap.style.animation = 'aura-pulse 1s ease-in-out';
    }

    const particleBox = document.createElement('div');
    particleBox.className = 'stat-particle-container';
    targetWrap.appendChild(particleBox);

    for (let i = 0; i < 3; i++) {
        const p = document.createElement('div');
        p.className = className;
        p.style.setProperty('--stat-color', color);
        p.style.backgroundColor = color;
        const randX = (Math.random() - 0.5) * 60;
        const delay = i * 0.15;
        p.style.left = `calc(50% + ${randX}px)`;
        p.style.animation = `${animName} 0.8s ease-out forwards`;
        p.style.animationDelay = `${delay}s`;
        particleBox.appendChild(p);
    }

    setTimeout(() => {
        particleBox.remove();
        if (targetWrap) targetWrap.style.animation = '';
    }, 1200);
}

// ============================================
// 5. 状态异常图标弹跳 (BRN / FRZ / PAR / PSN / SLP / CNF / FLINCH)
// ============================================

// 内联 SVG 图标 (无需 CDN)
const STATUS_INLINE_SVG = {
    SLP: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 25" fill="currentColor"><path d="M15.59848,10.838v.02a6.31,6.31,0,1,1-6.83-6.29.47821.47821,0,0,1,.49.28.50026.50026,0,0,1-.09.56,3.77067,3.77067,0,1,0,5.55,5.1.47652.47652,0,0,1,.55005-.14A.49612.49612,0,0,1,15.59848,10.838ZM10.9111,3.832h1.12305l-1.5376,2.27734a.50012.50012,0,0,0,.41455.77979h2.064a.5.5,0,0,0,0-1H11.852l1.53759-2.27734a.50012.50012,0,0,0-.41455-.77979h-2.064a.5.5,0,0,0,0,1Zm5.61035,3.98633h-.53076l.94531-1.3999a.50012.50012,0,0,0-.41455-.77979H14.88376a.5.5,0,0,0,0,1h.69677l-.94531,1.3999a.50012.50012,0,0,0,.41455.77979h1.47168a.5.5,0,0,0,0-1Z"/></svg>`,
    CNF: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M256 48C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48zm0 384c-97 0-176-79-176-176S159 80 256 80s176 79 176 176-79 176-176 176zm0-272c-17.7 0-32 14.3-32 32v80c0 17.7 14.3 32 32 32s32-14.3 32-32v-80c0-17.7-14.3-32-32-32zm0 192c-13.3 0-24 10.7-24 24s10.7 24 24 24 24-10.7 24-24-10.7-24-24-24z"/><path d="M176 211c0-8-6-15-14-16l-36-4-16-33c-4-7-14-7-18 0l-16 33-36 4c-8 1-14 8-14 16 0 4 1 7 4 10l26 25-6 36c-1 5 1 10 5 13s9 4 14 2l32-17 32 17c2 1 4 2 6 2 3 0 5-1 8-3 4-3 6-8 5-13l-6-36 26-25c3-3 4-6 4-10zm336 0c0-8-6-15-14-16l-36-4-16-33c-4-7-14-7-18 0l-16 33-36 4c-8 1-14 8-14 16 0 4 1 7 4 10l26 25-6 36c-1 5 1 10 5 13s9 4 14 2l32-17 32 17c2 1 4 2 6 2 3 0 5-1 8-3 4-3 6-8 5-13l-6-36 26-25c3-3 4-6 4-10z"/></svg>`,
    FLINCH: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm61.66-93.66a8,8,0,0,1-11.32,11.32L168,123.31l-10.34,10.35a8,8,0,0,1-11.32-11.32L156.69,112l-10.35-10.34a8,8,0,0,1,11.32-11.32L168,100.69l10.34-10.35a8,8,0,0,1,11.32,11.32L179.31,112Zm-80-20.68L99.31,112l10.35,10.34a8,8,0,0,1-11.32,11.32L88,123.31,77.66,133.66a8,8,0,0,1-11.32-11.32L76.69,112,66.34,101.66A8,8,0,0,1,77.66,90.34L88,100.69,98.34,90.34a8,8,0,0,1,11.32,11.32ZM140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180Z"/></svg>`
};

function triggerStatusVFX(statusType, targetSpriteId) {
    const els = _getElements(targetSpriteId);
    if (!els) return;
    const { sprite: targetSprite, wrapper: targetWrap } = els;

    const config = {
        BRN:    { file: 'fire.svg',     color: '#e15f41', shake: true,  anim: 'bounce-status' },
        FRZ:    { file: 'ice.svg',      color: '#74b9ff', shake: false, anim: 'bounce-status' },
        PAR:    { file: 'electric.svg', color: '#f9ca24', shake: true,  anim: 'bounce-status' },
        PSN:    { file: 'poison.svg',   color: '#a55eea', shake: false, anim: 'bounce-status' },
        TOX:    { file: 'poison.svg',   color: '#6c5ce7', shake: false, anim: 'bounce-status' },
        SLP:    { inline: true,         color: '#5b6abf', shake: false, anim: 'float-sleep',   duration: 1500 },
        CNF:    { inline: true,         color: '#f85888', shake: true,  anim: 'spin-confuse',  duration: 1200 },
        FLINCH: { inline: true,         color: '#ff6b6b', shake: true,  anim: 'shake-flinch',  duration: 1000 }
    };

    const cfg = config[statusType] || config.PSN;
    const duration = cfg.duration || 1000;

    // 光晕 + 震动应用在 wrapper 上，不干扰精灵自身动画（极巨化等）
    if (targetWrap) {
        targetWrap.style.setProperty('--stat-color', cfg.color);
        if (statusType === 'SLP') {
            // 睡眠：精灵变暗 + 轻微下沉
            targetWrap.style.animation = 'sleep-dim 1.5s ease-in-out';
        } else if (statusType === 'CNF') {
            // 混乱：精灵摇晃
            targetWrap.style.animation = 'aura-pulse 0.8s ease-in-out, confuse-wobble 1.2s ease-in-out';
        } else if (statusType === 'FLINCH') {
            // 畏缩：精灵后退震颤
            targetWrap.style.animation = 'aura-pulse 0.6s ease-in-out, flinch-recoil 0.5s ease-out';
        } else {
            targetWrap.style.animation = cfg.shake
                ? 'aura-pulse 0.8s ease-in-out, shake-hard 0.4s ease-out'
                : 'aura-pulse 0.8s ease-in-out';
        }
    }

    // 创建图标元素
    let iconEl;
    if (cfg.inline && STATUS_INLINE_SVG[statusType]) {
        // 使用内联 SVG
        iconEl = document.createElement('div');
        iconEl.innerHTML = STATUS_INLINE_SVG[statusType];
        iconEl.className = `vfx-status-icon vfx-status-${statusType.toLowerCase()}`;
        iconEl.style.color = cfg.color;
        iconEl.style.filter = `drop-shadow(0 0 6px ${cfg.color}) drop-shadow(0 0 12px ${cfg.color}80)`;
    } else {
        // 使用 CDN 图标
        iconEl = document.createElement('img');
        iconEl.src = `${CDN_TYPE_ICONS}${cfg.file}`;
        iconEl.className = 'vfx-status-icon';
        iconEl.style.filter = `drop-shadow(0 0 5px ${cfg.color}) drop-shadow(0 0 10px white)`;
    }

    targetWrap.appendChild(iconEl);

    setTimeout(() => {
        iconEl.remove();
        if (targetWrap) targetWrap.style.animation = '';
    }, duration);
}

// ============================================
// 6. 综合攻击 VFX 入口 (供 battle-damage.js 调用)
// ============================================

/**
 * 播放完整攻击 VFX
 * @param {string} attackerSpriteId - 攻击方精灵 ID
 * @param {string} defenderSpriteId - 防御方精灵 ID
 * @param {object} move - 招式数据
 * @param {object} result - 伤害计算结果 { effectiveness, isCrit }
 */
function playAttackVFX(attackerSpriteId, defenderSpriteId, move, result) {
    const moveType = (move.type || 'Normal').toLowerCase();
    const effectiveness = result.effectiveness || 1;
    const isCrit = result.isCrit || false;

    // 判断接触/非接触
    const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const fullMoveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
    const isContact = !!(fullMoveData.flags && fullMoveData.flags.contact);

    // 【折返/换人技】强制非接触，避免冲撞动画与换人流程冲突
    const isPivotMove = !!(result.pivot || fullMoveData.selfSwitch);

    // 物理技默认接触，特殊技默认非接触（除非 flags 明确标注）
    const cat = (move.cat || '').toLowerCase();
    const shouldContact = !isPivotMove && (isContact || (cat === 'phys' && !fullMoveData.flags));

    if (shouldContact) {
        triggerContactVFX(moveType, attackerSpriteId, effectiveness, isCrit);
    } else {
        triggerRangedVFX(moveType, defenderSpriteId, effectiveness, isCrit);
    }

    return { isContact: shouldContact };
}

// ============================================
// 导出到全局
// ============================================

window.BattleVFX = {
    triggerRangedVFX,
    triggerContactVFX,
    triggerMissVFX,
    triggerStatVFX,
    triggerStatusVFX,
    playAttackVFX,
    TYPE_COLORS
};
