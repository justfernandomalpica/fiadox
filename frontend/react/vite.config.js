import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  publicDir: "../../public",

  server: {
    // En desarrollo, reenvía /api y /auth al servidor PHP local.
    // Arrancar el backend con: cd public && php -S localhost:3000 router.php
    proxy: {
      '/api':  'http://localhost:3000',
      '/auth': 'http://localhost:3000',
    },
  },

  build: {
    // El build va directo a public/ para que Nginx lo sirva sin pasos extras.
    outDir: '../../public',

    // CRÍTICO: no borrar public/ antes de escribir.
    // Sin esto, Vite eliminaría index.php, router.php, el CSS y los favicons.
    emptyOutDir: false,
  },
})
