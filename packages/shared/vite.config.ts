import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'FuromauiShared',
      fileName: 'furomaui-shared',
    },
    minify: false,
    rollupOptions: {
      external: [/lodash.*/],
      output: {
        globals: {
          lodash: 'lodash',
        },
      },
    },
  },
});
