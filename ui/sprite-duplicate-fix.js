/**
 * ===========================================
 * SPRITE-DUPLICATE-FIX.JS - 重复精灵图修复
 * ===========================================
 * 
 * 问题：当多只相同宝可梦出现时，浏览器缓存 GIF 导致
 *       后续相同 URL 的精灵图不会重新播放动画
 * 
 * 解决方案：销毁并重建 img 元素，强制浏览器重新渲染 GIF
 */

(function() {
    'use strict';
    
    // 记录当前显示的精灵图 URL（去除查询参数后的基础 URL）
    let currentEnemySpriteUrl = null;
    
    /**
     * 销毁并重建精灵图元素（终极方案）
     * @param {string} spriteId - DOM 元素 ID
     * @param {string} url - 图片 URL
     */
    function recreateSpriteElement(spriteId, url) {
        const oldImg = document.getElementById(spriteId);
        if (!oldImg) return;
        
        const parent = oldImg.parentNode;
        if (!parent) return;
        
        console.log(`[SPRITE-FIX] Recreating element for: ${url}`);
        
        // 创建新的 img 元素
        const newImg = document.createElement('img');
        newImg.id = spriteId;
        newImg.className = 'p-sprite'; // 基础类
        newImg.alt = oldImg.alt || '';
        
        // 添加唯一参数确保不使用缓存
        const separator = url.includes('?') ? '&' : '?';
        const uniqueUrl = `${url}${separator}_t=${Date.now()}`;
        
        // 设置加载回调
        newImg.onload = function() {
            newImg.classList.add('loaded');
            newImg.classList.remove('entering');
            void newImg.offsetWidth;
            newImg.classList.add('entering');
            setTimeout(() => newImg.classList.remove('entering'), 650);
            console.log(`[SPRITE-FIX] Recreate complete: ${spriteId}`);
        };
        
        newImg.onerror = function() {
            console.error(`[SPRITE-FIX] Failed to load: ${uniqueUrl}`);
        };
        
        // 替换旧元素
        parent.replaceChild(newImg, oldImg);
        
        // 设置 src 触发加载
        newImg.src = uniqueUrl;
    }
    
    /**
     * 包装原始的 smartLoadSprite 函数
     * 检测重复 URL 并重建元素
     */
    function wrapSmartLoadSprite() {
        const originalSmartLoadSprite = window.smartLoadSprite;
        if (!originalSmartLoadSprite) {
            console.warn('[SPRITE-FIX] smartLoadSprite not found, retrying...');
            setTimeout(wrapSmartLoadSprite, 100);
            return;
        }
        
        window.smartLoadSprite = function(id, url, forceAnim = false) {
            // 只处理敌方精灵图的重复问题
            if (id === 'enemy-sprite') {
                const baseUrl = url.split('?')[0];
                
                // 检测是否是相同 URL（重复宝可梦换入）
                if (forceAnim && currentEnemySpriteUrl === baseUrl) {
                    console.log(`[SPRITE-FIX] Duplicate enemy sprite detected: ${baseUrl}`);
                    recreateSpriteElement(id, url);
                    return;
                }
                
                // 记录当前 URL
                currentEnemySpriteUrl = baseUrl;
            }
            
            // 调用原始函数
            originalSmartLoadSprite.call(this, id, url, forceAnim);
        };
        
        console.log('[SPRITE-FIX] smartLoadSprite wrapped successfully');
    }
    
    /**
     * 重置状态（战斗结束时调用）
     */
    function resetDuplicateFix() {
        currentEnemySpriteUrl = null;
        console.log('[SPRITE-FIX] State reset');
    }
    
    // 导出重置函数
    window.resetSpriteDuplicateFix = resetDuplicateFix;
    
    // 初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', wrapSmartLoadSprite);
    } else {
        setTimeout(wrapSmartLoadSprite, 50);
    }
    
    console.log('[SPRITE-FIX] Module loaded');
})();
