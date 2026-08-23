import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), '.'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/test/vitest/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test/vitest.setup.ts'],
  },
});
