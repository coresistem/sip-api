import { defineConfig } from 'vite'; // config-touch-1
import react from '@vitejs/plugin-react';
import path from 'path';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        // VitePWA plugin removed due to build issues. Manual manifest used.
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 5173,
        hmr: {
            host: 'localhost',
            port: 5173,
        },
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            },
            '/socket.io': {
                target: 'http://localhost:5000',
                ws: true,
            },
            '/uploads': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            },
        },
    },
    build: {
        chunkSizeWarningLimit: 1600,
        rollupOptions: {
            // manualChunks config removed to fix production build circular dependency issues
            // letting Vite handle chunking automatically
            output: {
                entryFileNames: 'assets/[name]-[hash].js',
                chunkFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]',
            },
        },
    },
});
