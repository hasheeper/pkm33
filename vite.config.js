import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    // 开发服务器配置
    server: {
        port: 3000,
        open: true
    },
    
    // 构建配置
    build: {
        outDir: 'dist',
        // 生成传统浏览器兼容的代码
        target: 'es2015',
        // 资源内联阈值
        assetsInlineLimit: 4096,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html')
            }
        }
    },
    
    // 解析配置
    resolve: {
        alias: {
            '@': resolve(__dirname, '.'),
            '@data': resolve(__dirname, 'data'),
            '@engine': resolve(__dirname, 'engine'),
            '@battle': resolve(__dirname, 'battle'),
            '@ui': resolve(__dirname, 'ui'),
            '@systems': resolve(__dirname, 'systems'),
            '@mechanics': resolve(__dirname, 'mechanics')
        }
    },
    
    // 静态资源处理 - 使用 public 目录（如果需要）
    // publicDir: 'public',
    
    // 排除 ST 目录（酒馆插件独立）
    // ST 目录不参与 Vite 构建
});
