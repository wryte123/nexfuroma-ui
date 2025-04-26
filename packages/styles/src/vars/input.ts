import { getCssVar, cssVarToRgba } from '../utils';
import { ThemeCssVarsConfig } from './theme';

/** 输入组件的主题变量定义 */
export const inputVars = {
  'input-color': cssVarToRgba<ThemeCssVarsConfig>('color-regular'),
  'input-bg-color': cssVarToRgba<ThemeCssVarsConfig>('color-card'),
  'input-border-color': cssVarToRgba<ThemeCssVarsConfig>('color-bd_base'),
  'input-hover-bd-color': cssVarToRgba<ThemeCssVarsConfig>('color-secondary'),
  'input-focus-bd-color': cssVarToRgba<ThemeCssVarsConfig>('color-primary'),
  'input-disabled-color': cssVarToRgba<ThemeCssVarsConfig>('color-placeholder'),
  'input-disabled-bg-color': cssVarToRgba<ThemeCssVarsConfig>('color-card'),
  'input-active-bg-color': cssVarToRgba<ThemeCssVarsConfig>('color-header'),
  'input-placeholder-color': cssVarToRgba<ThemeCssVarsConfig>('color-placeholder'),
  'input-padding-x': getCssVar<ThemeCssVarsConfig>('spacing-md'),
  'input-padding-y': getCssVar<ThemeCssVarsConfig>('spacing-xs'),
  'input-border-radius': getCssVar<ThemeCssVarsConfig>('border-radius-xs'),
};

/** 输入组件主题变量类型 */
export type InputCssVarsConfig = Partial<typeof inputVars>;
