import { mergeConfigs, Preset, UserConfig } from 'unocss';
import { Theme } from 'unocss/preset-mini';
import {
  baseConfig,
  themeConfig,
  buttonConfig,
  inputConfig,
  collapseConfig,
} from './unocss';

/** 组件名字和预设对象的关系表 */
const configMaps = {
  theme: themeConfig,
  button: buttonConfig,
  input: inputConfig,
  collapse: collapseConfig,
} satisfies Record<string, UserConfig<Theme>>;

type ConfigKeys = keyof typeof configMaps;

/** 组件库预设选项 */
export interface NexfuromauiPresetOptions {
  /** 指定集成哪些组件的 UnoCSS 预设，不设置时默认全部集成 */
  include?: ConfigKeys[];

  /** 指定剔除哪些组件的 UnoCSS 预设 */
  exclude?: ConfigKeys[];
}

/** Nexfuromaui 预设 */
export function nexfuromauiPreset(options: NexfuromauiPresetOptions = {}): Preset {
  const { include = Object.keys(configMaps) as ConfigKeys[], exclude = [] } = options;

  // 根据 include 和 exclude 选项决定哪些组件的 UnoCSS 预设将要被集成
  const components = new Set<ConfigKeys>();
  include.forEach((key) => components.add(key));
  exclude.forEach((key) => components.delete(key));
  const configs = Array.from(components)
    .map((component) => configMaps[component])
    .filter((item) => item);

  // 基础预设任何时候都会生效
  configs.unshift(baseConfig);

  // 合并所有预设
  const mergedConfig = mergeConfigs(configs);

  return {
    name: 'nexfuromaui-preset',
    ...mergedConfig,
  };
}
