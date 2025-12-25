import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use environment VITE_BASE if provided; otherwise fall back to relative paths so
  // the build works when served from a repo subpath (like GitHub Pages)
  base: process.env.VITE_BASE || './',
  build: {
    sourcemap: true,
    minify: false,
    // keep a modern target to avoid transpilation issues in minifiers if needed
    target: 'es2020',
  },
})
