import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'FuromauiButton',
      fileName: 'furomaui-button',
    },
    minify: false,
    rollupOptions: {
      external: [/@nexfuromaui.*/, 'vue'],
    },
  },
});
