// demo/vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import unocss from 'unocss/vite';
import { join } from 'node:path';

export default defineConfig({
  plugins: [vue(), unocss()],
  resolve: {
    alias: [
      {
        find: /^@nexfuromaui\/(.+)$/,
        replacement: join(__dirname, '..', 'packages', '$1', 'src'),
      },
    ],
  },
});
