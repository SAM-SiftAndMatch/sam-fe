import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: ['cmaps', 'standard_fonts', 'wasm', 'iccs'].map((folder) => ({
        src: `node_modules/pdfjs-dist/${folder}`,
        dest: 'pdfjs',
      })),
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // sockjs-client 1.x dùng biến `global` của Node — map sang globalThis của browser,
  // nếu không app sập ngay khi load bundle (ReferenceError: global is not defined).
  define: {
    global: 'globalThis',
  },
});
