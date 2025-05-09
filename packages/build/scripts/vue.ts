import { mergeConfig, UserConfig } from 'vite';
import { presetUno, PresetUnoOptions } from 'unocss/preset-uno';
import unocss from 'unocss/vite';
import transformerDirectives from '@unocss/transformer-directives';
import { generateConfig } from './common';
import { absCwd, relCwd, GenerateConfigOptions } from '../src';
import { nexfuromauiPreset, NexfuromauiPresetOptions } from '../../styles/src/unoPreset';

/** 拓展构建选项 */
export interface GenerateVueConfigOptions extends GenerateConfigOptions {
  /** 是否启用UnoCSS插件 */
  pluginUno?: boolean;

  /** 传递给 unocss/preset-uno 预设的配置 */
  presetUnoOptions?: PresetUnoOptions;

  /** 传递给组件库 UnoCSS 预设的选项 */
  presetNexfuromauiOptions?: NexfuromauiPresetOptions;
}

export async function generateVueConfig(
  customOptions?: GenerateVueConfigOptions,
  viteConfig?: UserConfig,
) {
  const { pluginUno = true, presetNexfuromauiOptions, presetUnoOptions } = customOptions || {};

  const configPreset: UserConfig = {
    plugins: [
      pluginUno ?
        unocss({
          /** 不应用 uno.config.ts 文件，所有配置直接传给插件 */
          configFile: false,
          presets: [
            presetUno({
              // 除了主题样式 theme，一般情况下，不打包 unocss/preset-uno 的预设
              preflight: false,
              ...presetUnoOptions,
            }),
            // 集成组件库UnoCSS预设，组件的部份样式
            nexfuromauiPreset(presetNexfuromauiOptions),
          ],
          transformers: [
            // 支持在 css 中使用 @apply 语法聚合多个原子类
            transformerDirectives(),
          ],
        }) :
        null,
    ],
  };

  const optionsPreset: GenerateConfigOptions = {
    pluginVue: true,
    // 将组件样式文件的入口写入 package.json 的 exports 字段
    onSetPkg: (pkg, options) => {
      const exports: Record<string, string> = {
        './style.css': relCwd(absCwd(options.outDir, 'style.css'), false),
      };
      Object.assign(pkg.exports as Record<string, any>, exports);
    },
  };

  const res = await generateConfig(
    {
      ...optionsPreset,
      ...customOptions,
    },
    mergeConfig(configPreset, viteConfig || {}),
  );

  return res;
}
