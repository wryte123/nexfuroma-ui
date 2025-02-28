// packages/styles/src/theme/index.ts
import { inject, App, Plugin } from 'vue';
import { isObjectLike } from '@nexfuromaui/shared';
import { generateCssVars } from '../utils';
import { themeColorLevelsEnabledKeys, NexfuromauiCssVarsConfig } from '../vars';

const THEME_PROVIDE_KEY = '__NexfuromaUITheme__';

function useGlobalTheme(app: App, options?: NexfuromauiCssVarsConfig) {
  /** 设置全局主题变量的方法 */
  function setTheme(styleObj: NexfuromauiCssVarsConfig) {
    // 设置主题变量时，兼顾主题色的色阶
    const cssVars = generateCssVars(styleObj, {
      colorLevelsEnabledKeys: themeColorLevelsEnabledKeys,
      colorLevels: 9,
    });
    Object.entries(cssVars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }

  const result = { setTheme };

  app.provide(THEME_PROVIDE_KEY, result);

  if (isObjectLike(options) && Object.keys(options).length > 0) {
    setTheme(options);
  }

  return result;
}

type NexfuromaUITheme = ReturnType<typeof useGlobalTheme>;

export function useTheme() {
  const result = inject<NexfuromaUITheme>(THEME_PROVIDE_KEY);
  if (!result) {
    throw new Error('useTheme() must be used after app.use(Theme)!');
  }
  return result;
}

export const Theme: Plugin<NexfuromauiCssVarsConfig[]> = {
  install: (app, ...options) => {
    const finalOptions: NexfuromauiCssVarsConfig = {};
    options.forEach((item) => {
      Object.assign(finalOptions, item);
    });
    useGlobalTheme(app, finalOptions);
  },
};

export * from './presets';
