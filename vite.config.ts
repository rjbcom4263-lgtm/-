import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Interpretation packs are intentionally loaded as a separate report chunk.
    chunkSizeWarningLimit: 900,
  },
})
