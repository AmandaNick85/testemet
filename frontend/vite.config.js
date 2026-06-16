import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true, // Libera o acesso externo para o Docker mapear a porta
    port: 3000  // Trava na porta padrão que vamos usar no Docker Compose
  }
})