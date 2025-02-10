// uno.config.ts
import {
  defineConfig, presetIcons, presetUno, UserConfig,
} from 'unocss';
import transformerDirectives from '@unocss/transformer-directives';
import presetLegacyCompat from '@unocss/preset-legacy-compat';
import { nexfuromauiPreset } from './packages/styles/src/unoPreset';

export default <UserConfig>defineConfig({
  presets: [
    presetUno(),
    nexfuromauiPreset(),
    presetLegacyCompat({
      commaStyleColorFunction: true,
    }),
    presetIcons({
      collections: {
        // Iconify json 集成，后续支持通过 <i class="i-nx-xxx"> 来使用图标原子类，并支持按需打包
        nx: () => import('./packages/icons/dist/icons.json').then((i) => i.default),
      },
    }),
  ],
  transformers: [transformerDirectives()],
});
