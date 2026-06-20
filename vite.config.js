import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'spoty.png', 'paragua.jfif'],
      manifest: {
        name: 'OS Chiikawa',
        short_name: 'ChiikawaOS',
        description: 'Un sistema operativo interactivo de Chiikawa con música, juegos y agenda de ventas.',
        theme_color: '#ffecf9',
        background_color: '#ffecf9',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        icons: [
          {
            src: 'paragua.jfif',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: 'paragua.jfif',
            sizes: '512x512',
            type: 'image/jpeg'
          }
        ]
      }
    })
  ],
  server: {
    host: '127.0.0.1',
    port: 8000,
  }
})
