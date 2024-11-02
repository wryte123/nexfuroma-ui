import { InferVueDefaults } from '@nexfuromaui/shared';
import type Button from './button.vue';

export interface ButtonProps {
  /** 按钮类型 */
  type?: '' | 'primary' | 'success' | 'info' | 'warning' | 'danger';

  /** 按钮是否为朴素模式 */
  plain?: boolean;

  /** 按钮是否不可用 */
  disabled?: boolean;
}

export function defaultButtonProps(): Required<InferVueDefaults<ButtonProps>> {
  return {
    type: '',
    plain: false,
    disabled: false,
  };
}

export type ButtonInstance = InstanceType<typeof Button>;
