// packages/input/src/props.ts
/** @module Input */
import { Ref } from 'vue';
import { InferVueDefaults } from '@nexfuromaui/shared';
import { ButtonProps, defaultButtonProps } from '@nexfuromaui/button';
import type Input from './input.vue';

/** 输入框组件的属性 */
export interface InputProps extends ButtonProps {
  /**
   * 输入值，支持 v-model 双向绑定
   * @default ''
   */
  modelValue?: string;
}

/** @hidden */
export function defaultInputProps(): Required<InferVueDefaults<InputProps>> {
  return {
    ...defaultButtonProps(),
    modelValue: '',
  };
}

/** 输入框组件的事件 */
export interface InputEmits {
  /**
   * 输入框的值改变时触发
   * @param val 输入框的值
   */
  (event: 'update:modelValue', val: string): void;

  /** 输入 */
  (event: 'input', val: string): void;
}

/** 输入框对外暴露的方法 */
export interface InputExpose {
  /** 清空输入框 */
  clear: () => void;

  /** 响应式变量 */
  a: Ref<number>;
}

export type InputInstance = InstanceType<typeof Input>;
