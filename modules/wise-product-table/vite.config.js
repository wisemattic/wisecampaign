import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
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
        port: 5175,
        hmr: {
            host: 'localhost',
        },
    },
})
