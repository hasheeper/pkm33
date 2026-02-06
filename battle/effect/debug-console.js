// ---------- DEBUG CONSOLE LOGIC ----------

// 全局状态变量
const globalSettings = {
    selectedType: 'normal',
    target: 'enemy',
    attackerSide: 'player',
    defenderSide: 'enemy',
    effectiveness: 'normal',
    isCritical: false
};

const TYPE_COLORS = {
    normal: '#a8a878',
    fire: '#f08030',
    water: '#6890f0',
    grass: '#78c850',
    electric: '#f8d030',
    ice: '#98d8d8',
    fighting: '#c03030',
    poison: '#a040a0',
    ground: '#e0c068',
    flying: '#a890f0',
    psychic: '#f85888',
    bug: '#a8b820',
    rock: '#b8a038',
    ghost: '#705898',
    dragon: '#7038f8',
    dark: '#705848',
    steel: '#b8b8d0',
    fairy: '#ee99ac'
};

// 【初始化属性图标】
// 页面加载时自动给所有带 data-type 的按钮注入 GitHub 图标资源
(function initTypeIcons() {
    const CDN_BASE = 'https://cdn.jsdelivr.net/gh/duiker101/pokemon-type-svg-icons/icons/';

    document.querySelectorAll('.type-btn').forEach(btn => {
        const type = btn.getAttribute('data-type');
        if (type) {
            btn.innerHTML = `<img src="${CDN_BASE}${type}.svg" alt="${type}">`;
        }
    });
})();

function triggerStatVFX(mode, targetSide) {
    const targetWrap = document.querySelector(`.${targetSide}-pos`);
    if (!targetWrap) return;

    const targetSprite = targetWrap.querySelector('.p-sprite');

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

    if (targetSprite) {
        targetSprite.style.setProperty('--stat-color', color);
        targetSprite.style.animation = 'none';
        targetSprite.offsetHeight;
        targetSprite.style.animation = 'aura-pulse 1s ease-in-out';
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
        if (targetSprite) {
            targetSprite.style.animation = '';
        }
    }, 1200);
}

function triggerStatusVFX(statusType, targetSide) {
    const targetWrap = document.querySelector(`.${targetSide}-pos`);
    if (!targetWrap) return;

    const targetSprite = targetWrap.querySelector('.p-sprite');
    const CDN_BASE = 'https://cdn.jsdelivr.net/gh/duiker101/pokemon-type-svg-icons/icons/';

    const config = {
        BRN: { file: 'fire.svg', color: '#e15f41', shake: true },
        FRZ: { file: 'ice.svg', color: '#74b9ff', shake: false },
        PAR: { file: 'electric.svg', color: '#f9ca24', shake: true },
        PSN: { file: 'poison.svg', color: '#a55eea', shake: false }
    };

    const cfg = config[statusType] || config.PSN;

    if (targetSprite) {
        targetSprite.style.setProperty('--stat-color', cfg.color);
        targetSprite.style.animation = 'none';
        targetSprite.offsetHeight;
        targetSprite.style.animation = cfg.shake
            ? 'aura-pulse 0.8s ease-in-out, shake-hard 0.4s ease-out'
            : 'aura-pulse 0.8s ease-in-out';
    }

    const iconImg = document.createElement('img');
    iconImg.src = `${CDN_BASE}${cfg.file}`;
    iconImg.className = 'vfx-status-icon';
    iconImg.style.filter = `drop-shadow(0 0 5px ${cfg.color}) drop-shadow(0 0 10px white)`;
    targetWrap.appendChild(iconImg);

    setTimeout(() => {
        iconImg.remove();
        if (targetSprite) {
            targetSprite.style.animation = '';
        }
    }, 1000);
}

function triggerContactVFX(type, attackerSide, effectiveness = 'normal', isCritical = false) {
    const defenderSide = attackerSide === 'player' ? 'enemy' : 'player';

    const atkWrap = document.querySelector(`.${attackerSide}-pos`);
    const defWrap = document.querySelector(`.${defenderSide}-pos`);
    const atkSprite = atkWrap && atkWrap.querySelector('.p-sprite');

    if (!atkWrap || !defWrap || !atkSprite) {
        console.error('Attacker or defender element missing');
        return;
    }

    const atkRect = atkWrap.getBoundingClientRect();
    const defRect = defWrap.getBoundingClientRect();

    let dx = (defRect.left + defRect.width / 2) - (atkRect.left + atkRect.width / 2);
    let dy = (defRect.top + defRect.height / 1.2) - (atkRect.top + atkRect.height / 1.2);

    const gapX = 270;
    const gapY = -10;

    let startScale;
    let endScale;

    if (attackerSide === 'player') {
        dx -= gapX;
        dy -= gapY;
        startScale = 1.5;
        endScale = 0.85;
    } else {
        dx += gapX;
        dy += gapY;
        startScale = 1.0;
        endScale = 1.5;
    }

    atkSprite.style.setProperty('--atk-x', `${dx}px`);
    atkSprite.style.setProperty('--atk-y', `${dy}px`);
    atkSprite.style.setProperty('--scale-start', startScale);
    atkSprite.style.setProperty('--scale-end', endScale);

    atkSprite.classList.remove('anim-dash');
    void atkSprite.offsetWidth;
    atkSprite.classList.add('anim-dash');

    setTimeout(() => {
        triggerRangedVFX(type, defenderSide, effectiveness, isCritical);

        const uiRoot = document.querySelector('.ui-root');
        if (uiRoot) {
            let shakePower = 5;
            if (effectiveness === 'weak') shakePower = 2;
            if (effectiveness === 'super') shakePower = 10;
            if (isCritical) shakePower += 5;

            uiRoot.style.transition = 'transform 0.05s';
            const shakeDirX = Math.random() * shakePower * 2 - shakePower;
            const shakeDirY = Math.random() * shakePower - shakePower / 2;
            uiRoot.style.transform = `translate(${shakeDirX}px, ${shakeDirY}px)`;
            setTimeout(() => {
                uiRoot.style.transform = 'none';
            }, 60);
        }
    }, 180);

    setTimeout(() => {
        atkSprite.classList.remove('anim-dash');
        atkSprite.style.removeProperty('--atk-x');
        atkSprite.style.removeProperty('--atk-y');
        atkSprite.style.removeProperty('--scale-start');
        atkSprite.style.removeProperty('--scale-end');
    }, 500);
}

function setEffectiveness(eff) {
    globalSettings.effectiveness = eff;

    document.querySelectorAll('.eff-btn').forEach(btn => btn.classList.remove('active'));
    const selector = eff === 'normal' ? '.e-inv' : `.e-${eff}`;
    const targetBtn = document.querySelector(selector);
    if (targetBtn) {
        targetBtn.classList.add('active');
    }

    console.log(`[Result Config] Effectiveness fixed to: ${eff.toUpperCase()}`);
}

function updateCritUI() {
    const btn = document.getElementById('btn-crit-toggle');
    const status = document.getElementById('crit-status');
    if (!btn || !status) return;

    if (globalSettings.isCritical) {
        btn.classList.add('active');
        status.innerText = 'ON';
        status.style.color = '#ff6b6b';
    } else {
        btn.classList.remove('active');
        status.innerText = 'OFF';
        status.style.color = '#aaa';
    }
}

function toggleCrit() {
    globalSettings.isCritical = !globalSettings.isCritical;
    updateCritUI();
    console.log(`[Result Config] Critical Hit forced: ${globalSettings.isCritical}`);
}

function setTurn(side) {
    globalSettings.attackerSide = side;
    globalSettings.defenderSide = side === 'player' ? 'enemy' : 'player';

    document.querySelectorAll('.turn-btn').forEach(btn => btn.classList.remove('active'));
    const toggleBtn = document.getElementById(`btn-turn-${side}`);
    if (toggleBtn) {
        toggleBtn.classList.add('active');
    }

    console.log(`[Turn Switch] Attacker is now: ${side.toUpperCase()} (Target: ${globalSettings.defenderSide.toUpperCase()})`);

    const container = document.getElementById('debug-layer');
    if (container) {
        container.style.border = side === 'enemy'
            ? '1px solid rgba(255, 50, 50, 0.3)'
            : '1px solid rgba(255, 255, 255, 0.2)';
    }
}

// UI 折叠开关
function toggleDebug() {
    const overlay = document.getElementById('debug-layer');
    const icon = document.getElementById('debug-toggle-icon');
    overlay.classList.toggle('collapsed');
    icon.innerText = overlay.classList.contains('collapsed') ? '▲' : '▼';
}

// 设置属性颜色
function setType(type) {
    globalSettings.selectedType = type;

    const display = document.getElementById('cur-type-text');
    display.innerText = type.charAt(0).toUpperCase() + type.slice(1);

    document.querySelectorAll('.type-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`.type-btn[data-type="${type}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            activeBtn.style.transform = '';
        }, 100);
    }

    console.log(`[Setting] Type switched to: ${type}`);
}

// 触发攻击动作调试
function debugAction(category) {
    const type = globalSettings.selectedType;
    const attacker = globalSettings.attackerSide;
    const defender = globalSettings.defenderSide;
    const eff = globalSettings.effectiveness;
    const crit = globalSettings.isCritical;

    console.group('🎬 ACTION DEBUG W/ MODIFIERS');
    console.log(`Mode: ${category}`);
    console.log(`Attacker: ${attacker} -> Target: ${defender}`);
    console.log(`Type: ${type}`);
    console.log(`⚡ Result: [${eff.toUpperCase()}] ${crit ? '+ [CRIT!]' : ''}`);

    if (category === 'RANGED') {
        triggerRangedVFX(type, defender, eff, crit);
    } else if (category === 'CONTACT') {
        triggerContactVFX(type, attacker, eff, crit);
    } else if (category === 'MISS') {
        console.log(`Action: ${attacker} attacks but MISSES ${defender}!`);
        triggerMissVFX(defender);
    } else {
        console.log('Unknown category, no action.');
    }

    console.groupEnd();
}

// 触发状态效果调试
function debugEffect(effectType) {
    const target = globalSettings.defenderSide;
    console.log(`🎬 EFFECT: ${effectType} on ${target}`);
    triggerStatVFX(effectType, target);
}

// 触发异常状态调试
function debugStatus(statusName) {
    const target = globalSettings.defenderSide;
    console.log(`🎬 STATUS: ${statusName} on ${target}`);
    triggerStatusVFX(statusName, target);
}

// 简单视觉反馈
function pulseBorder(color = 'white') {
    document.body.style.boxShadow = `inset 0 0 20px ${color}`;
    setTimeout(() => {
        document.body.style.boxShadow = 'none';
    }, 100);
}

/* ================= VFX ENGINE ================= */
function triggerRangedVFX(type, targetSide, effectiveness = 'normal', isCritical = false) {
    const color = TYPE_COLORS[type] || '#FFFFFF';
    const CDN_BASE = 'https://cdn.jsdelivr.net/gh/duiker101/pokemon-type-svg-icons/icons/';

    const targetWrapper = document.querySelector(`.${targetSide.toLowerCase()}-pos`);
    if (!targetWrapper) return;

    const targetSprite = targetWrapper.querySelector('.p-sprite');

    let intensityMulti = 1.0;
    if (effectiveness === 'weak') intensityMulti = 0.6;
    if (effectiveness === 'super') intensityMulti = 1.6;
    if (isCritical) intensityMulti *= 1.25;

    const flashDiv = document.createElement('div');
    flashDiv.className = 'flash-overlay';
    flashDiv.style.setProperty('--flash-color', isCritical ? '#ffffff' : color);

    let flashDuration = '0.3s';
    if (effectiveness === 'weak') flashDuration = '0.1s';
    if (effectiveness === 'super') flashDuration = '0.6s';

    flashDiv.style.animation = `screen-flash ${flashDuration} ease-out forwards`;
    if (effectiveness === 'weak') {
        flashDiv.style.opacity = '0.3';
    }

    const flashParent = document.querySelector('.ui-root');
    if (flashParent) {
        flashParent.appendChild(flashDiv);
        setTimeout(() => flashDiv.remove(), 600);
    }

    if (targetSprite) {
        targetSprite.style.animation = 'none';
        targetSprite.offsetHeight;
        const shakeDuration = effectiveness === 'weak' ? '0.2s' : '0.5s';
        targetSprite.style.animation = `shake-hard ${shakeDuration} ease-out`;
    }

    const vfxAnchor = document.createElement('div');
    vfxAnchor.className = 'vfx-hit-anchor';
    vfxAnchor.style.setProperty('--flash-color', color);
    vfxAnchor.style.transform = `scale(${intensityMulti})`;

    if (effectiveness === 'weak') vfxAnchor.classList.add('eff-weak');
    if (effectiveness === 'super') vfxAnchor.classList.add('eff-super');
    if (isCritical) vfxAnchor.classList.add('is-crit');

    const burstIcon = document.createElement('img');
    burstIcon.src = `${CDN_BASE}${type}.svg`;
    burstIcon.className = 'vfx-icon';
    if (!isCritical) {
        burstIcon.style.animation = 'icon-burst 0.6s ease-out forwards';
    }

    const burstRing = document.createElement('div');
    burstRing.className = 'vfx-ring';
    burstRing.style.borderColor = color;
    if (effectiveness !== 'weak') {
        burstRing.style.boxShadow = `0 0 20px ${color}`;
    } else {
        burstRing.style.boxShadow = 'none';
    }
    burstRing.style.animation = 'ring-expand 0.5s ease-out forwards';

    vfxAnchor.appendChild(burstRing);

    if (effectiveness === 'super') {
        const echoRing = burstRing.cloneNode(true);
        echoRing.classList.add('echo-wave');
        vfxAnchor.appendChild(echoRing);
    }

    vfxAnchor.appendChild(burstIcon);
    targetWrapper.appendChild(vfxAnchor);

    setTimeout(() => {
        vfxAnchor.remove();
        if (targetSprite) {
            targetSprite.style.animation = '';
        }
    }, 800);
}

function triggerMissVFX(defenderSide) {
    const targetWrap = document.querySelector(`.${defenderSide}-pos`);
    if (!targetWrap) return;

    const targetSprite = targetWrap.querySelector('.p-sprite');

    if (targetSprite) {
        targetSprite.classList.remove('anim-dodge');
        void targetSprite.offsetWidth;
        targetSprite.classList.add('anim-dodge');
    }

    const missText = document.createElement('div');
    missText.className = 'vfx-text-popup';
    missText.innerText = 'MISS';
    targetWrap.appendChild(missText);

    setTimeout(() => {
        if (targetSprite) {
            targetSprite.classList.remove('anim-dodge');
        }
        missText.remove();
    }, 800);
}

// 默认初始化
window.addEventListener('DOMContentLoaded', () => {
    setType(globalSettings.selectedType);
    setTurn(globalSettings.attackerSide);
    setEffectiveness(globalSettings.effectiveness);
    updateCritUI();
});
