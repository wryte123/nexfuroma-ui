import { cssVarToRgba, getCssVar } from '../utils';
import { ThemeCssVarsConfig } from './theme';

export const collapseVars = {
  'collapse-color': cssVarToRgba<ThemeCssVarsConfig>('color-regular'),
  'collapse-bg-color': cssVarToRgba<ThemeCssVarsConfig>('color-card'),
  'collapse-header-color': cssVarToRgba<ThemeCssVarsConfig>('color-regular'),
  'collapse-header-bg-color': cssVarToRgba<ThemeCssVarsConfig>('color-card'),
  'collapse-border-color': cssVarToRgba<ThemeCssVarsConfig>('color-bd_base'),
  'collapse-header-active-color': cssVarToRgba<ThemeCssVarsConfig>('color-primary'),
  'collapse-header-height': '48px',
  'collapse-content-color': cssVarToRgba<ThemeCssVarsConfig>('color-secondary'),
  'collapse-content-bg-color': cssVarToRgba<ThemeCssVarsConfig>('color-card'),
  'collapse-disabled-color': cssVarToRgba<ThemeCssVarsConfig>('color-disabled'),
  'collapse-padding-x': getCssVar<ThemeCssVarsConfig>('spacing-md'),
  'collapse-padding-y': getCssVar<ThemeCssVarsConfig>('spacing-xs'),
  'collapse-border-radius': getCssVar<ThemeCssVarsConfig>('border-radius-xs'),
};

/** 折叠面板组件主题变量类型 */
export type CollapseCssVarsConfig = Partial<typeof collapseVars>;
