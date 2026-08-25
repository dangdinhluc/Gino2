import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';

export default defineConfig(() => ({
  // Cho phép CI đặt base path riêng cho preview. Nếu không có thì giữ hành vi production cũ.
  base: process.env.VITE_BASE_PATH || (process.env.GITHUB_PAGES === 'true' ? '/Gino2/' : '/'),
  plugins: [
    react(),
    tailwindcss(),
    ...(process.env.ANALYZE === 'true'
      ? [
          visualizer({ filename: 'dist/bundle-stats.html', template: 'treemap', gzipSize: true, brotliSize: true, open: false }),
          visualizer({ filename: 'dist/bundle-stats.json', template: 'raw-data', gzipSize: true, brotliSize: true, open: false }),
        ]
      : []),
  ],
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
