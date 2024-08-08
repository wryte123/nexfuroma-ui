import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "./src/index.ts",
      name: "NexfuromauiUI",
      fileName: "nexfuromaui-ui",
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
