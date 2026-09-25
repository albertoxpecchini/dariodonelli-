import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import prerender from './plugins/prerender.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), prerender()],
  build:
    mode === 'ssr'
      ? {
          // Build separata, in Node, usata solo dal prerender.
          ssr: 'src/entry-server.jsx',
          outDir: 'dist-ssr',
          emptyOutDir: true,
        }
      : {},
}))
