import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        manifest: true,
        rollupOptions: {
            input: 'src/main.jsx',
        },
    },
    server: {
        cors: true,
        strictPort: true,
        port: 5173,
        hmr: {
            host: 'localhost',
        },
    }
})
