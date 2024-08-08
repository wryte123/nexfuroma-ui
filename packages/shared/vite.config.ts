import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "./src/index.ts",
      name: "NexfuromauiShared",
      fileName: "nexfuromaui-shared",
    },
    minify: false,
    rollupOptions: {
      external: [/lodash.*/],
      output: {
        globals: {
          lodash: "lodash",
        },
      },
    },
  },
});
