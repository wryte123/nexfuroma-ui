// packages/input/src/props.ts
/** @module Input */
import { Ref } from 'vue';
import { InferVueDefaults } from '@nexfuromaui/shared';

/** 输入框组件的属性 */
export interface InputProps {

  /**
   * 输入值，支持 v-model 双向绑定
   * @default ''
   */
  modelValue?: string;

  /**
   * 输入框的占位符
   * @default ''
   */
  placeholder?: string;

  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean;

  /**
   * 是否显示清除按钮
   * @default false
   */
  clearable?: boolean;
}

/** @hidden */
export function defaultInputProps() {
  return {
    modelValue: '',
    placeholder: '',
    disabled: false,
    clearable: false,
  } satisfies Required<InferVueDefaults<InputProps>>;
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

  /** 聚焦 */
  (event: 'focus', val: FocusEvent): void;

  /** 失去焦点 */
  (event: 'blur', val: FocusEvent): void;

  /** 清除 */
  (event: 'clear', val: string): void;
}

/** 输入框对外暴露的方法 */
export interface InputExpose {
  /** 清空输入框 */
  clear: () => void;

  /** 获取输入框焦点 */
  focus: () => void;

  /** 失去输入框焦点 */
  blur: () => void;

  /** 原生输入框元素 */
  inputRef: Ref<HTMLInputElement | null>;
}
