import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // bind to all interfaces so both localhost (IPv6 ::1) and 127.0.0.1 work
  server: { host: true, port: 5173, strictPort: true },
  preview: { host: true, port: 5173, strictPort: true },
})
