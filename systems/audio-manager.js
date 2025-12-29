/**
 * ===========================================
 * AUDIO-MANAGER.JS - 音效管理系统
 * ===========================================
 * 
 * 职责:
 * - 预加载短音效 (提高响应速度)
 * - 实现并发播放 (cloneNode)
 * - 与 BGM 系统协同工作
 */

// ============================================
// 路径兼容 (GitHub Pages)
// ============================================

function getSfxBasePath() {
    const path = window.location.pathname;
    if (path.includes('/pkm12/')) {
        return path.substring(0, path.indexOf('/pkm12/') + 7);
    }
    return './';
}

const SFX_BASE_PATH = getSfxBasePath();

// ============================================
// SFX 配置表
// ============================================

const SFX_CONFIG = {
    // UI 类
    'CONFIRM':    `${SFX_BASE_PATH}data/sfx/ui_01_confirm.mp3`,
    'CANCEL':     `${SFX_BASE_PATH}data/sfx/ui_01_confirm.mp3`,
  
    // 战斗反馈类
    'HIT_NORMAL': `${SFX_BASE_PATH}data/sfx/hit_00_normal.mp3`,
    'HIT_SUPER':  `${SFX_BASE_PATH}data/sfx/Hit_Super_Effective_XY.mp3`,
    'HIT_WEAK':   `${SFX_BASE_PATH}data/sfx/hit_02_weak.mp3`,
  
    // 能力变化类
    'STAT_UP':    `${SFX_BASE_PATH}data/sfx/stat_up.mp3`,
    'STAT_DOWN':  `${SFX_BASE_PATH}data/sfx/stat_down.mp3`,
  
    // 事件类
    'FAINT':      `${SFX_BASE_PATH}data/sfx/battle_faint.mp3`,
    'HEAL':       `${SFX_BASE_PATH}data/sfx/battle_heal.mp3`,
    'THROW':      `${SFX_BASE_PATH}data/sfx/ball_throw.mp3`,
    'BALL_OPEN':  `${SFX_BASE_PATH}data/sfx/ball_open.mp3`
};

// ============================================
// SFX 音量配置表 (0.0 - 1.0)
// ============================================

const SFX_VOLUME_CONFIG = {
    'CONFIRM':    0.5,
    'CANCEL':     0.5,
    'HIT_NORMAL': 0.6,
    'HIT_SUPER':  0.7,
    'HIT_WEAK':   0.5,
    'STAT_UP':    0.3,
    'STAT_DOWN':  0.3,
    'FAINT':      0.6,
    'HEAL':       0.5,
    'THROW':      0.6,
    'BALL_OPEN':  0.6
};

// 音频缓存池
const sfxCache = {};

// ============================================
// 预加载 SFX
// ============================================

(function preloadSFX() {
    console.log('[SFX] Starting preload...');
    let loadedCount = 0;
    const totalCount = Object.keys(SFX_CONFIG).length;
    
    for (const [key, path] of Object.entries(SFX_CONFIG)) {
        const audio = new Audio();
        audio.src = path;
        audio.preload = 'auto';
        audio.volume = SFX_VOLUME_CONFIG[key] || 0.6;
        
        audio.addEventListener('canplaythrough', () => {
            loadedCount++;
            if (loadedCount === totalCount) {
                console.log(`[SFX] All ${loadedCount} files preloaded.`);
            }
        }, { once: true });
        
        audio.addEventListener('error', () => {
            console.warn(`[SFX] Failed to load: ${key} (${path})`);
            loadedCount++; // 计入失败的也算完成
        }, { once: true });
        
        sfxCache[key] = audio;
        
        // 【强制预加载】调用 load() 确保浏览器开始加载
        audio.load();
    }
    
    console.log(`[SFX] Queued ${Object.keys(sfxCache).length} files for preload.`);
})();

// ============================================
// 播放 SFX (支持并发)
// ============================================

/**
 * 播放短音效 (支持并发)
 * @param {string} key - SFX_CONFIG 中的键名
 * @param {number} volumeOverride - 可选的音量覆盖 (0.0 - 1.0)
 */
function playSFX(key, volumeOverride = null) {
    const original = sfxCache[key];
    if (!original) {
        return;
    }

    try {
        const clone = original.cloneNode();
        clone.volume = volumeOverride !== null 
            ? volumeOverride 
            : (SFX_VOLUME_CONFIG[key] || 0.6);
        
        clone.play().catch(() => {
            // 忽略浏览器自动播放限制错误
        });
    } catch (e) {
        console.error('[SFX] Play error:', e);
    }
}

/**
 * 根据伤害效果播放对应打击音效
 * @param {number} effectiveness - 克制倍率
 * @param {boolean} isCrit - 是否暴击
 */
function playHitSFX(effectiveness, isCrit = false) {
    if (isCrit || effectiveness >= 2) {
        playSFX('HIT_SUPER');
    } else if (effectiveness > 0 && effectiveness <= 0.5) {
        playSFX('HIT_WEAK');
    } else {
        playSFX('HIT_NORMAL');
    }
}

// ============================================
// 导出到全局
// ============================================

window.playSFX = playSFX;
window.playHitSFX = playHitSFX;
window.SFX_CONFIG = SFX_CONFIG;

// ============================================
// 宝可梦叫声系统
// ============================================

const CRY_VOLUME = 0.45;

/**
 * 播放宝可梦叫声 (在线拉取 Showdown 音频库)
 * @param {string} speciesName - 宝可梦名字 (如 "Pikachu", "Charizard-Mega-Y")
 */
window.playPokemonCry = function(speciesName) {
    if (!speciesName) return;
    
    // 优先使用预加载缓存
    if (typeof playCachedCry === 'function') {
        playCachedCry(speciesName, CRY_VOLUME);
        return;
    }
    
    // Fallback: 在线加载
    let id = speciesName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (typeof POKEDEX !== 'undefined' && POKEDEX[id]) {
        if (POKEDEX[id].baseSpecies) {
            id = POKEDEX[id].baseSpecies.toLowerCase().replace(/[^a-z0-9]/g, '');
        }
    }
    
    const suffixes = ['mega', 'megax', 'megay', 'gmax', 'alola', 'hisui', 'paldea', 'galar'];
    for (const s of suffixes) {
        if (id.endsWith(s) && id.length > s.length) {
            id = id.replace(s, '');
            break;
        }
    }
    
    const url = `https://play.pokemonshowdown.com/audio/cries/${id}.mp3`;
    const cryAudio = new Audio(url);
    cryAudio.volume = CRY_VOLUME;
    cryAudio.play().catch(() => {});
    
    console.log(`[CRY] Playing online: ${speciesName} -> ${id}`);
};
