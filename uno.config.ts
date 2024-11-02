import { defineConfig, presetUno } from 'unocss';
import transformerDirectives from '@unocss/transformer-directives';
import presetLegacyCompat from '@unocss/preset-legacy-compat';
import { nexfuromauiPreset } from './packages/styles/src/unoPreset';

export default defineConfig({
  presets: [
    presetUno(),
    presetLegacyCompat({
      commaStyleColorFunction: true,
    }),
    nexfuromauiPreset(),
  ],
  transformers: [transformerDirectives()],
});
