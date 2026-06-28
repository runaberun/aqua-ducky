import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// On `vite build` we serve from the GitHub Pages project subpath
// (https://runaberun.github.io/aqua-ducky/); dev stays at root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/aqua-ducky/' : '/',
  plugins: [react()],
}))
