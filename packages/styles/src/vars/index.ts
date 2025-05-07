// packages/styles/src/vars/index.ts
import { ThemeCssVarsConfig } from './theme';
import { ButtonCssVarsConfig } from './button';
import { InputCssVarsConfig } from './input';
import { CollapseCssVarsConfig } from './collapse';

/** 导出组件库主题样式的整体类型 */
export interface NexfuromauiCssVarsConfig
  extends ThemeCssVarsConfig,
  ButtonCssVarsConfig,
  InputCssVarsConfig,
  CollapseCssVarsConfig {
  [key: string]: string | undefined;
}

export * from './theme';
export * from './button';
export * from './input';
export * from './collapse';
