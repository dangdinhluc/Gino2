import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // File watching ignores Codex/browser runtime folders to prevent reload loops.
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: {
      ignored: [
        '**/.codex-screens/**',
        '**/.git/**',
        '**/dist/**',
        '**/node_modules/**',
      ],
    },
  },
}));
