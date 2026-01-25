/**
 * =============================================
 * Canvas 粒子天气系统
 * =============================================
 * 
 * 解决 CSS 摩尔纹问题，提供电影级质感
 * 支持：雨、大雨、雪、沙暴、大日照、乱气流
 */

let canvas = null;
let ctx = null;
let particles = [];
let weatherType = 'none';
let animationFrameId = null;

// 粒子配置参数
const CONFIG = {
    rain: { count: 180, speed: 12, angle: 0.1, color: '120, 160, 230' },
    heavyrain: { count: 400, speed: 22, angle: 0.15, color: '60, 80, 160' },
    snow: { count: 200, speed: 2.5, angle: 0, color: '255, 255, 255' },  // 增加雪花数量
    hail: { count: 120, speed: 8, angle: 0.05, color: '200, 220, 255' },
    sand: { count: 600, speed: 28, angle: -0.2, color: '210, 180, 120' },  // 增加沙粒数量和速度
    harshsun: { count: 80, speed: 0.8, angle: 0, color: '255, 200, 100' },
    deltastream: { count: 100, speed: 35, angle: -0.8, color: '80, 255, 200' },
    sun: { count: 50, speed: 0.5, angle: 0, color: '255, 210, 120' }  // 增加普通日照光斑数量
};

class Particle {
    constructor(type, w, h) {
        this.w = w;
        this.h = h;
        this.reset(type);
    }

    reset(type) {
        this.type = type;
        this.x = Math.random() * this.w;
        this.y = Math.random() * this.h;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.size = Math.random() * 2 + 1;
        this.alpha = 1;
      
        if (type === 'rain' || type === 'heavyrain') {
            this.y = Math.random() * -this.h;
            this.length = Math.random() * 20 + 10;
            const cfg = CONFIG[type];
            this.vy = cfg.speed + Math.random() * 5;
            this.vx = cfg.angle * this.vy; 
        } 
        else if (type === 'snow' || type === 'hail') {
            this.y = Math.random() * -this.h;
            const cfg = CONFIG[type];
            this.vy = cfg.speed + Math.random() * 2;
            this.vx = Math.sin(Math.random() * Math.PI) * 0.5;
            this.oscillation = Math.random() * 0.05;
            if (type === 'hail') {
                this.size = Math.random() * 3 + 2;
            } else {
                this.size = Math.random() * 3 + 1.5;  // 增大雪花尺寸
            }
        } 
        else if (type === 'sand' || type === 'deltastream') {
            const cfg = CONFIG[type];
            this.x = Math.random() * this.w + this.w;
            this.vx = -cfg.speed - Math.random() * 5;
            this.vy = (Math.random() - 0.5) * 2;
        }
        else if (type === 'harshsun' || type === 'sun') {
            this.size = Math.random() * 8 + 4;  // 更大的光斑
            this.vy = CONFIG[type].speed;
            this.opacity = Math.random() * 0.4 + 0.2;  // 更高的基础透明度
        }
    }

    update() {
        if (this.type === 'rain' || this.type === 'heavyrain') {
            this.x += this.vx;
            this.y += this.vy;
            if (this.y > this.h) this.y = -50; 
            if (this.x > this.w) this.x = 0; 
        } 
        else if (this.type === 'snow' || this.type === 'hail') {
            this.x += Math.sin(this.y * 0.01) * 0.5;
            this.y += this.vy;
            if (this.y > this.h) this.y = -10;
        } 
        else if (this.type === 'sand' || this.type === 'deltastream') {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0) this.x = this.w + Math.random() * 100;
        }
        else if (this.type === 'harshsun' || this.type === 'sun') {
            this.y -= this.vy;
            // 更强烈的呼吸闪烁效果
            this.alpha = Math.sin(Date.now() * 0.002 + this.x * 0.01) * 0.4 + 0.6;
            if (this.y < 0) this.y = this.h + 10;
        }
    }

    draw(ctx) {
        ctx.beginPath();
        let baseAlpha = (this.type === 'harshsun' || this.type === 'sun') ? this.alpha * 0.5 : this.opacity;
      
        const cfg = CONFIG[this.type] || CONFIG.rain;
        const color = cfg.color;

        ctx.fillStyle = `rgba(${color}, ${baseAlpha})`;
        ctx.strokeStyle = `rgba(${color}, ${baseAlpha})`;

        if (this.type === 'rain' || this.type === 'heavyrain') {
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + this.vx, this.y + this.length);
            ctx.lineWidth = 1.5; 
            ctx.stroke();
        } else if (this.type === 'snow') {
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'hail') {
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = `rgba(255, 255, 255, ${baseAlpha * 0.5})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        } else if (this.type === 'sand' || this.type === 'deltastream') {
            // 沙粒更粗更明显
            ctx.fillRect(this.x, this.y, this.size * 5, 2);
        } else if (this.type === 'harshsun' || this.type === 'sun') {
            ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function animate() {
    if (!ctx || !canvas) {
        animationFrameId = requestAnimationFrame(animate);
        return;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (weatherType === 'none' || weatherType === 'clear') {
        animationFrameId = requestAnimationFrame(animate);
        return;
    }

    for (let p of particles) {
        p.update();
        p.draw(ctx);
    }

    animationFrameId = requestAnimationFrame(animate);
}

/**
 * 初始化天气系统
 */
function initWeatherSystem() {
    canvas = document.getElementById('weather-canvas');
    if (!canvas) {
        console.warn('[WEATHER] Canvas not found, creating...');
        const stage = document.querySelector('.battle-stage');
        if (stage) {
            canvas = document.createElement('canvas');
            canvas.id = 'weather-canvas';
            canvas.width = 1100;
            canvas.height = 720;
            stage.insertBefore(canvas, stage.firstChild);
        } else {
            console.error('[WEATHER] Battle stage not found!');
            return;
        }
    }
    
    ctx = canvas.getContext('2d');
    
    if (!animationFrameId) {
        animate();
    }
    
    console.log('[WEATHER] Canvas weather system initialized');
}

/**
 * 设置天气视觉效果
 * @param {string} type - 天气类型
 */
function setWeatherVisuals(type) {
    console.log(`[WEATHER VISUAL] Setting weather to: ${type}`);
    
    if (!canvas || !ctx) {
        initWeatherSystem();
    }
    
    // 映射引擎天气值到视觉类型
    const typeMap = {
        'rain': 'rain',
        'sun': 'sun',
        'sandstorm': 'sand',
        'sand': 'sand',
        'snow': 'snow',
        'hail': 'hail',
        'harshsun': 'harshsun',
        'heavyrain': 'heavyrain',
        'deltastream': 'deltastream',
        'none': 'none',
        '': 'none'
    };
    
    weatherType = typeMap[type] || 'none';
    
    // 重新生成粒子池
    particles = [];
    if (weatherType !== 'none' && CONFIG[weatherType]) {
        const count = CONFIG[weatherType].count;
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(weatherType, canvas.width, canvas.height));
        }
    }
    
    // 更新背景色调
    const bgLayer = document.querySelector('.bg-gradient');
    if (bgLayer) {
        // 移除所有天气相关的 class
        bgLayer.classList.remove('bg-rain', 'bg-heavyrain', 'bg-sand', 'bg-snow', 'bg-hail', 'bg-harshsun', 'bg-deltastream', 'bg-sun');
        if (weatherType !== 'none') {
            bgLayer.classList.add(`bg-${weatherType}`);
        }
    }
    
    // 更新 canvas 可见性
    if (canvas) {
        canvas.style.opacity = weatherType === 'none' ? '0' : '0.8';
    }
}

/**
 * 清除天气效果
 */
function clearWeatherVisuals() {
    setWeatherVisuals('none');
}

// 立即导出到全局（ES 模块中必须在顶层执行）
window.initWeatherSystem = initWeatherSystem;
window.setWeatherVisuals = setWeatherVisuals;
window.clearWeatherVisuals = clearWeatherVisuals;

// 页面加载完成后自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initWeatherSystem, 100);
    });
} else {
    setTimeout(initWeatherSystem, 100);
}

console.log('[WEATHER] Canvas weather system module loaded');
