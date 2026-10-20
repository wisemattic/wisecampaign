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
            // main: the admin editor (ModuleManager); storefront: the [product_table] shortcode
            input: ['src/main.jsx', 'src/storefront.jsx'],
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
