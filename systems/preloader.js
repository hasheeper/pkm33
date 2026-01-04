/**
 * ===========================================
 * PRELOADER.JS - 资源预加载系统
 * ===========================================
 */

const PreloadCache = {
    sprites: {},
    cries: {},
    bgm: null,
    trainerAvatars: {},
    pokemonIcons: {}
};

/**
 * 预加载精灵图
 */
function preloadSprite(name, isBack = false) {
    return new Promise((resolve) => {
        const id = name.toLowerCase().replace(/[^a-z0-9-]/g, '');
        const cacheKey = `${id}_${isBack ? 'back' : 'front'}`;
        
        if (PreloadCache.sprites[cacheKey]) {
            resolve(PreloadCache.sprites[cacheKey]);
            return;
        }
        
        const suffix = isBack ? '-back' : '';
        const url = `https://play.pokemonshowdown.com/sprites/ani${suffix}/${id}.gif`;
        
        const img = new Image();
        img.onload = () => {
            PreloadCache.sprites[cacheKey] = img;
            resolve(img);
        };
        img.onerror = () => resolve(null);
        img.src = url;
        
        setTimeout(() => resolve(null), 5000);
    });
}

/**
 * 预加载叫声
 */
function preloadCry(name) {
    return new Promise((resolve) => {
        let id = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        if (typeof POKEDEX !== 'undefined' && POKEDEX[id] && POKEDEX[id].baseSpecies) {
            id = POKEDEX[id].baseSpecies.toLowerCase().replace(/[^a-z0-9]/g, '');
        }
        
        const suffixes = ['mega', 'megax', 'megay', 'gmax', 'alola', 'hisui', 'paldea', 'galar'];
        for (const s of suffixes) {
            if (id.endsWith(s) && id.length > s.length) {
                id = id.replace(s, '');
                break;
            }
        }
        
        if (PreloadCache.cries[id]) {
            resolve(PreloadCache.cries[id]);
            return;
        }
        
        const url = `https://play.pokemonshowdown.com/audio/cries/${id}.mp3`;
        const audio = new Audio();
        audio.preload = 'auto';
        
        audio.oncanplaythrough = () => {
            PreloadCache.cries[id] = audio;
            resolve(audio);
        };
        audio.onerror = () => resolve(null);
        audio.src = url;
        
        setTimeout(() => resolve(null), 5000);
    });
}

/**
 * 预加载训练家头像
 */
function preloadTrainerAvatar(trainerId) {
    return new Promise((resolve) => {
        if (!trainerId || trainerId === 'wild') {
            resolve(null);
            return;
        }
        
        if (PreloadCache.trainerAvatars[trainerId]) {
            resolve(PreloadCache.trainerAvatars[trainerId]);
            return;
        }
        
        const url = `./data/trainers/${trainerId}.png`;
        const img = new Image();
        img.onload = () => {
            PreloadCache.trainerAvatars[trainerId] = img;
            resolve(img);
        };
        img.onerror = () => resolve(null);
        img.src = url;
        
        setTimeout(() => resolve(null), 3000);
    });
}

/**
 * 预加载宝可梦头像 sprite sheet (所有宝可梦共享)
 */
function preloadPokemonIconSheet() {
    return new Promise((resolve) => {
        if (PreloadCache.pokemonIcons['sheet']) {
            resolve(PreloadCache.pokemonIcons['sheet']);
            return;
        }
        
        const url = `https://play.pokemonshowdown.com/sprites/pokemonicons-sheet.png`;
        const img = new Image();
        img.onload = () => {
            PreloadCache.pokemonIcons['sheet'] = img;
            console.log('[PRELOAD] Pokemon icon sheet loaded');
            resolve(img);
        };
        img.onerror = () => {
            console.warn('[PRELOAD] Failed to load pokemon icon sheet');
            resolve(null);
        };
        img.src = url;
        
        setTimeout(() => resolve(null), 5000);
    });
}

/**
 * 预加载本局所有资源
 */
async function preloadBattleResources(playerParty, enemyParty, trainerId, onProgress) {
    const tasks = [];
    // 计算总数: 玩家队伍(精灵图+叫声) + 敌方队伍(精灵图+叫声) + 训练家头像 + 宝可梦头像sheet
    const total = (playerParty.length + enemyParty.length) * 2 + 2;
    let loaded = 0;
    
    const updateProgress = () => {
        loaded++;
        if (onProgress) onProgress(loaded, total);
    };
    
    // 玩家队伍
    for (const p of playerParty) {
        const name = p.name || p;
        tasks.push(preloadSprite(name, true).then(updateProgress));
        tasks.push(preloadCry(name).then(updateProgress));
    }
    
    // 敌方队伍
    for (const e of enemyParty) {
        const name = e.name || e;
        tasks.push(preloadSprite(name, false).then(updateProgress));
        tasks.push(preloadCry(name).then(updateProgress));
    }
    
    // 训练家头像
    tasks.push(preloadTrainerAvatar(trainerId).then(updateProgress));
    
    // 宝可梦头像 sprite sheet (只加载一次)
    tasks.push(preloadPokemonIconSheet().then(updateProgress));
    
    await Promise.all(tasks);
    console.log('[PRELOAD] All resources loaded');
}

/**
 * 获取缓存的叫声并播放
 */
function playCachedCry(name, volume = 0.45) {
    // 【全局开关】SFX 系统关闭时不播放叫声
    if (typeof window !== 'undefined' && window.GAME_SETTINGS && !window.GAME_SETTINGS.enableSFX) {
        return;
    }
    
    let id = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (typeof POKEDEX !== 'undefined' && POKEDEX[id] && POKEDEX[id].baseSpecies) {
        id = POKEDEX[id].baseSpecies.toLowerCase().replace(/[^a-z0-9]/g, '');
    }
    
    const suffixes = ['mega', 'megax', 'megay', 'gmax', 'alola', 'hisui', 'paldea', 'galar'];
    for (const s of suffixes) {
        if (id.endsWith(s) && id.length > s.length) {
            id = id.replace(s, '');
            break;
        }
    }
    
    const cached = PreloadCache.cries[id];
    if (cached) {
        const clone = cached.cloneNode();
        clone.volume = volume;
        clone.play().catch(() => {});
        console.log(`[CRY] Playing cached: ${name} -> ${id}`);
    } else {
        // Fallback: 直接在线加载 (避免递归调用 playPokemonCry)
        const url = `https://play.pokemonshowdown.com/audio/cries/${id}.mp3`;
        const cryAudio = new Audio(url);
        cryAudio.volume = volume;
        cryAudio.play().catch(() => {});
        console.log(`[CRY] Playing online (cache miss): ${name} -> ${id}`);
    }
}

// 导出
window.preloadBattleResources = preloadBattleResources;
window.preloadTrainerAvatar = preloadTrainerAvatar;
window.preloadPokemonIconSheet = preloadPokemonIconSheet;
window.playCachedCry = playCachedCry;
window.PreloadCache = PreloadCache;
