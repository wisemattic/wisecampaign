import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: './../stock-bar-dist',
    // watch for changes:
    // https://vitejs.dev/config/build-options.html#build-watch
    watch: {},
    sourcemap: true,
    rollupOptions: {
      // no hash in filenames, so it's always the same name
      output: {
        entryFileNames: 'assets/js/[name].js',
        chunkFileNames: 'assets/js/[name].js',
        assetFileNames: 'assets/css/[name].[ext]'
      }
    }
  }
})
