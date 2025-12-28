/**
 * 显示 Mega 形态选择对话框（喷火龙/超梦 X/Y 选择）
 * [UI重构 V2]：局部磨砂玻璃风格 (Container Glassmorphism)
 * 去除了全屏模糊，只让卡片本身有半透明磨砂感
 * 
 * @param {Pokemon} pokemon - 宝可梦实例
 * @param {Function} callback - 选择完成后的回调函数，参数为选中的形态 ID
 */
function showMegaFormSelectionDialog(pokemon, callback) {
    // 1. 注入动画样式
    if (!document.getElementById('mega-selection-modern-style')) {
        const style = document.createElement('style');
        style.id = 'mega-selection-modern-style';
        style.textContent = `
            :root {
                --mega-x-color: #3b82f6; 
                --mega-y-color: #ef4444; 
                --mega-base-color: #a855f7;
            }
            .mega-overlay-simple {
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
            /* 背景纹理微调 */
            .mega-bg-grid {
                background-image: 
                    linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
                background-size: 20px 20px;
            }
        `;
        document.head.appendChild(style);
    }

    // 2. 创建遮罩层 (纯粹的半透明黑底层，无模糊)
    const overlay = document.createElement('div');
    overlay.className = 'mega-selection-overlay mega-overlay-simple';
    overlay.style.cssText = `
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.45); /* 稍微加深遮罩，突出中间的玻璃卡片 */
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 12000;
    `;

    // 3. 创建 UI 不规则容器 (这才是带高斯模糊的主体)
    const dialogShape = document.createElement('div');
    dialogShape.className = 'mega-dialog-shape';
    dialogShape.style.cssText = `
        position: relative;
        /* 改动点：背景设为半透明，打开 Backdrop Filter */
        background: rgba(255, 255, 255, 0.85); 
        backdrop-filter: blur(20px) saturate(1.8);
        -webkit-backdrop-filter: blur(20px) saturate(1.8);
        
        border: 1px solid rgba(255, 255, 255, 0.6);
        box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.4), /* 投影也更深一点以增加立体感 */
            inset 0 0 0 1px rgba(255, 255, 255, 0.5);
        
        padding: 40px 60px;
        border-radius: 20px;
        max-width: 620px;
        
        /* 保持斜切风格，但角度稍微温和一点 */
        transform: skewX(-10deg);
        animation: glassUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); /* 有弹性的入场 */
        overflow: hidden;
    `;

    // 3.1 装饰性网格背景 (让玻璃质感更明显)
    const bgDecor = document.createElement('div');
    bgDecor.className = 'mega-bg-grid';
    bgDecor.style.cssText = `
        position: absolute;
        top: -50%; left: -50%; width: 200%; height: 200%;
        z-index: 0;
        pointer-events: none;
        transform: skewX(10deg); /* 抵消父级斜切 */
        opacity: 0.6;
    `;
    dialogShape.appendChild(bgDecor);
    
    // 3.2 顶部彩色装饰条 (保留，增加视觉重心)
    const topBar = document.createElement('div');
    topBar.style.cssText = `
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 6px;
        background: linear-gradient(90deg, #3b82f6 0%, #a855f7 50%, #ef4444 100%);
        z-index: 2;
        /* 给一点光泽 */
        box-shadow: 0 1px 1px rgba(0,0,0,0.1);
    `;
    dialogShape.appendChild(topBar);

    // 4. 内容容器 (反向斜切 10度 扶正)
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

    // 5. 标题与信息
    const title = document.createElement('h2');
    title.innerHTML = `MEGA EVOLUTION`;
    title.style.cssText = `
        color: #1e293b;
        font-family: inherit;
        font-size: 36px;
        font-weight: 900;
        font-style: italic;
        margin: 0;
        letter-spacing: -1.5px;
        line-height: 1;
        text-shadow: 2px 2px 0px rgba(255,255,255,0.4);
    `;

    const subTitle = document.createElement('div');
    subTitle.textContent = `Select form for ${pokemon.cnName || pokemon.name}`;
    subTitle.style.cssText = `
        color: #64748b;
        font-size: 15px;
        font-weight: 600;
        margin-top: 5px;
        margin-bottom: 35px;
        text-transform: uppercase;
        letter-spacing: 1px;
    `;

    // 6. 选项按钮容器
    const optionsContainer = document.createElement('div');
    optionsContainer.style.cssText = `
        display: flex;
        gap: 24px;
        width: 100%;
        justify-content: center;
        flex-wrap: wrap;
    `;

    // 7. 形态处理逻辑
    const forms = pokemon.megaFormsAvailable || [];
    if(forms.length === 0) {
        const base = pokemon.name.toLowerCase();
        if(base.includes('mewtwo') || base.includes('charizard')) {
            forms.push(base.endsWith('mega') ? base + 'x' : base + 'megax');
            forms.push(base.endsWith('mega') ? base + 'y' : base + 'megay');
        } else {
            forms.push('default'); 
        }
    }

    forms.forEach(formId => {
        const isX = formId.toLowerCase().includes('x');
        const isY = formId.toLowerCase().includes('y');
        
        let labelLarge = isX ? 'X' : isY ? 'Y' : '∞';
        let subText = isX ? 'ATTACK' : isY ? 'SPECIAL' : 'POWER'; // 简单的描述
        if (formId === 'default') subText = 'UNLOCK';
        
        let themeColor = isX ? '#3b82f6' : isY ? '#ef4444' : '#a855f7';

        // 按钮 (纯白背景卡片，可以微微透出一点底色)
        const btn = document.createElement('div');
        btn.style.cssText = `
            flex: 1;
            min-width: 130px;
            background: rgba(255, 255, 255, 0.7);
            border: 1px solid rgba(255,255,255,0.8);
            border-bottom: 4px solid ${themeColor}15; /* 极淡彩色底边 */
            border-radius: 16px;
            padding: 25px 15px;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            align-items: center;
            /* 内部不需要模糊，保持清晰 */
        `;

        btn.innerHTML = `
            <div style="font-size: 12px; font-weight: 800; color: ${themeColor}; opacity: 0.8; letter-spacing: 1.5px; margin-bottom: 4px;">MEGA</div>
            <div style="font-size: 56px; font-weight: 900; color: #1e293b; line-height:1; font-style: italic; position: relative; z-index:2;">${labelLarge}</div>
            <div style="font-size: 11px; font-weight: 700; color: #94a3b8; margin-top: 4px; letter-spacing: 0.5px;">${subText}</div>
            <div class="fill-anim" style="
                position: absolute; bottom: 0; left: 0; right: 0; height: 0; 
                background: ${themeColor}; z-index: 1;
                transition: height 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            "></div>
        `;

        // 悬停交互 (卡片上浮 + 填色)
        btn.onmouseenter = () => {
             btn.style.transform = 'translateY(-6px)';
             // 下边框消失，变成整体颜色
             btn.style.borderBottomColor = themeColor; 
             // 投影加深
             btn.style.boxShadow = `0 12px 25px -5px ${themeColor}40`;
             // 文字变白
             btn.children[0].style.color = 'rgba(255,255,255,0.8)';
             btn.children[1].style.color = '#fff'; 
             btn.children[2].style.color = 'rgba(255,255,255,0.6)';
             // 填充背景
             btn.querySelector('.fill-anim').style.height = '100%';
        };
        btn.onmouseleave = () => {
             btn.style.transform = 'translateY(0)';
             btn.style.borderBottomColor = `${themeColor}15`;
             btn.style.boxShadow = 'none';
             btn.children[0].style.color = themeColor;
             btn.children[1].style.color = '#1e293b';
             btn.children[2].style.color = '#94a3b8';
             btn.querySelector('.fill-anim').style.height = '0';
        };

        btn.onclick = () => {
            overlay.style.transition = 'opacity 0.2s';
            overlay.style.opacity = '0';
            setTimeout(() => document.body.removeChild(overlay), 200);
            callback(formId);
        };

        optionsContainer.appendChild(btn);
    });

    // 8. 取消按钮
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'CANCEL';
    cancelBtn.style.cssText = `
        margin-top: 35px;
        background: transparent;
        border: 2px solid #cbd5e1;
        color: #94a3b8;
        font-weight: 800;
        font-size: 13px;
        letter-spacing: 1px;
        cursor: pointer;
        padding: 8px 32px;
        border-radius: 50px;
        transition: all 0.2s;
        font-family: inherit;
    `;
    cancelBtn.onmouseenter = () => {
        cancelBtn.style.borderColor = '#94a3b8';
        cancelBtn.style.color = '#64748b';
        cancelBtn.style.background = '#fff';
    };
    cancelBtn.onmouseleave = () => {
        cancelBtn.style.borderColor = '#cbd5e1';
        cancelBtn.style.color = '#94a3b8';
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
    
    // 一定要先挂载到 body，Backdrop Filter 才会生效
    document.body.appendChild(overlay);

    overlay.onclick = (e) => {
        if(e.target === overlay) {
            cancelBtn.click();
        }
    };
}
