import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  server: { host: '0.0.0.0', https: false },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});
