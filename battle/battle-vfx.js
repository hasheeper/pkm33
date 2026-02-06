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

    const gapX = 220;
    const gapY = 20;
    let startScale, endScale;

    const isPlayer = attackerSpriteId === 'player-sprite';
    if (isPlayer) {
        dx -= gapX; dy -= gapY;
        startScale = 1.5; endScale = 0.85;
    } else {
        dx += gapX; dy += gapY;
        startScale = 1.0; endScale = 1.5;
    }

    atkSprite.style.setProperty('--atk-x', `${dx}px`);
    atkSprite.style.setProperty('--atk-y', `${dy}px`);
    atkSprite.style.setProperty('--scale-start', startScale);
    atkSprite.style.setProperty('--scale-end', endScale);

    atkSprite.classList.remove('anim-dash');
    void atkSprite.offsetWidth;
    atkSprite.classList.add('anim-dash');

    // 冲撞到位后触发命中特效 (延迟匹配更慢的动画)
    setTimeout(() => {
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
    }, 280);

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
    }, 700);
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
// 5. 状态异常图标弹跳 (BRN / FRZ / PAR / PSN)
// ============================================

function triggerStatusVFX(statusType, targetSpriteId) {
    const els = _getElements(targetSpriteId);
    if (!els) return;
    const { sprite: targetSprite, wrapper: targetWrap } = els;

    const config = {
        BRN: { file: 'fire.svg',     color: '#e15f41', shake: true },
        FRZ: { file: 'ice.svg',      color: '#74b9ff', shake: false },
        PAR: { file: 'electric.svg', color: '#f9ca24', shake: true },
        PSN: { file: 'poison.svg',   color: '#a55eea', shake: false },
        TOX: { file: 'poison.svg',   color: '#6c5ce7', shake: false },
        SLP: { file: 'psychic.svg',  color: '#fd79a8', shake: false }
    };

    const cfg = config[statusType] || config.PSN;

    // 光晕 + 震动应用在 wrapper 上，不干扰精灵自身动画（极巨化等）
    if (targetWrap) {
        targetWrap.style.setProperty('--stat-color', cfg.color);
        targetWrap.style.animation = cfg.shake
            ? 'aura-pulse 0.8s ease-in-out, shake-hard 0.4s ease-out'
            : 'aura-pulse 0.8s ease-in-out';
    }

    const iconImg = document.createElement('img');
    iconImg.src = `${CDN_TYPE_ICONS}${cfg.file}`;
    iconImg.className = 'vfx-status-icon';
    iconImg.style.filter = `drop-shadow(0 0 5px ${cfg.color}) drop-shadow(0 0 10px white)`;
    targetWrap.appendChild(iconImg);

    setTimeout(() => {
        iconImg.remove();
        if (targetWrap) targetWrap.style.animation = '';
    }, 1000);
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
