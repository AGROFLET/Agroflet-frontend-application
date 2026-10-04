import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import jsonServer from 'json-server'

/**
 * Serves the AgroFlet Fake API (json-server) at /api/v1, the mapping of server/routes.json, from the Vite server
 * itself, so `npm run dev` and `npm run preview` work without a second terminal, like the deployed application
 * (api/index.js). It loads server/db.json when the server starts and keeps every change in memory: restarting the
 * server restores the demo data and the file never changes. `npm run server` still starts the Fake API on its own at
 * http://localhost:3000/api/v1, for Swagger Editor or Postman.
 */
function fakeApi() {
  const mount = ({ config, middlewares }) => {
    const seed = path.join(config.root, 'server', 'db.json')
    if (!fs.existsSync(seed)) return
    const api = jsonServer.create()
    api.use(jsonServer.defaults({ logger: false, noGzip: true }))
    api.use(jsonServer.router(JSON.parse(fs.readFileSync(seed, 'utf8'))))
    middlewares.use('/api/v1', api)
  }
  return { name: 'agroflet-fake-api', configureServer: mount, configurePreviewServer: mount }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), fakeApi()],
  build: {
    chunkSizeWarningLimit: 1500
  }
})
