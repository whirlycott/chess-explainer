import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Relative base so the built `dist/` folder works from any static host path.
  base: './',
  build: {
    target: 'es2023',
    chunkSizeWarningLimit: 800,
  },
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
