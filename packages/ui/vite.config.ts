import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'Nexfuromaui',
      fileName: 'furomaui-ui',
    },
    minify: false,
    rollupOptions: {
      external: [/@nexfuromaui.*/, 'vue'],

      output: {},
    },
  },
});
