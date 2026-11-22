import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

const LOCAL_BACKEND = 'http://localhost/sistema-vendedor/backend'

/**
 * Build de la demo estática (GitHub Pages): `vite build --mode demo`.
 * - Cambia la URL del backend local por <base>backend, que intercepta src/demo/mockBackend.js.
 * - Copia las fotos de los productos de demostración a dist/backend/uploads/productos.
 */
function demoBackend(base) {
  const target = `${base}backend`
  return {
    name: 'demo-backend',
    enforce: 'pre',
    transform(code, id) {
      if (id.includes('/src/') && code.includes(LOCAL_BACKEND)) {
        return { code: code.replaceAll(LOCAL_BACKEND, target), map: null }
      }
    },
    closeBundle() {
      const from = resolve('backend/uploads/productos')
      const to = resolve('dist/backend/uploads/productos')
      if (!existsSync(from)) return
      mkdirSync(to, { recursive: true })
      for (const f of readdirSync(from)) {
        if (/^demo_.*\.(jpe?g|png|webp)$/i.test(f) || f === 'CREDITOS.md') cpSync(resolve(from, f), resolve(to, f))
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isDemo = mode === 'demo'
  const base = isDemo ? env.VITE_BASE || '/sistema-vendedor/' : '/'
  return {
    base,
    plugins: [react(), isDemo && demoBackend(base)].filter(Boolean),
  }
})
