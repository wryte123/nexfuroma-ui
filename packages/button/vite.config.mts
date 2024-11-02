// packages/build/vite.config.ts
import { generateVueConfig } from '../build/scripts';

export default generateVueConfig({
  presetNexfuromauiOptions: {
    include: ['button'],
  },
});
