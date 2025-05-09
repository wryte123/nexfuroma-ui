import { UserConfig } from 'unocss';
import { Theme } from 'unocss/preset-mini';
import {
  themeColors, themeColorLevelsEnabledKeys, themeSpacing, themeBorders,
} from '../vars';
import { toTheme } from '../utils';

export const baseConfig: UserConfig<Theme> = {
  // 需要全局生效的主题
  theme: {
    // 颜色主题
    colors: toTheme(themeColors, {
      type: 'color',
      colorLevelsEnabledKeys: themeColorLevelsEnabledKeys,
      colorLevels: 9,
    }),
    // 边距相关主题
    spacing: toTheme(themeSpacing, {
      type: 'spacing',
    }),
    //
    borderRadius: toTheme(themeBorders, {
      type: 'border-radius',
    }),
  },
};
