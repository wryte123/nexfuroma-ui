// packages/styles/src/unocss/input/index.ts
import { UserConfig } from 'unocss';
import { collapseVars } from '../../vars';
import { cssVarsToString, generateCssVars } from '../../utils';

export const collapseConfig: UserConfig = {
  preflights: [
    {
      getCSS: () => cssVarsToString(generateCssVars(collapseVars)),
    },
  ],
};
