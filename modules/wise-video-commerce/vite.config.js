import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    // ../shared imports react and lucide-react: resolve them from this project
    resolve: {
        dedupe: ['react', 'react-dom', 'lucide-react'],
    },
    base: './',
    build: {
        manifest: true,
        outDir: 'dist',
        rollupOptions: {
            input: 'src/main.jsx',
        },
    },
    server: {
        cors: true,
        strictPort: true,
        port: 5174, // Using a different port than stock-bar
        hmr: {
            host: 'localhost',
        },
    },
})
