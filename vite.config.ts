import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';

function manualChunks(id: string): string | undefined {
  const normalizedId = id.replace(/\\/g, '/');
  if (!normalizedId.includes('/node_modules/')) return undefined;

  if (
    normalizedId.includes('/node_modules/react/')
    || normalizedId.includes('/node_modules/react-dom/')
    || normalizedId.includes('/node_modules/react-router/')
    || normalizedId.includes('/node_modules/react-router-dom/')
    || normalizedId.includes('/node_modules/scheduler/')
  ) {
    return 'vendor-react';
  }

  if (normalizedId.includes('/node_modules/@supabase/')) return 'vendor-supabase';
  if (normalizedId.includes('/node_modules/motion/') || normalizedId.includes('/node_modules/framer-motion/')) return 'vendor-motion';
  if (normalizedId.includes('/node_modules/zustand/') || normalizedId.includes('/node_modules/use-sync-external-store/')) return 'vendor-state';

  return undefined;
}

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
  build: {
    rollupOptions: {
      output: {
        // Keep the genuinely heavy shared libraries cacheable without forcing
        // tree-shakeable icon modules into one eager shared chunk.
        manualChunks,
      },
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
