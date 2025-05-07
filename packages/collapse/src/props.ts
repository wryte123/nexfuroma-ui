// packages/collapse/src/props.ts
/** @module Collapse */
import { InferVueDefaults } from '@nexfuromaui/shared';
import { InjectionKey, Ref } from 'vue';

/** 折叠面板组件的属性 */
export interface CollapseProps {
  /**
   * 当前激活的面板(如果是手风琴模式，则是字符串，否则为数组)
   * @default []
   */
  modelValue?: string | string[];

  /**
   * 是否手风琴
   * @default false
   */
  accordion?: boolean;
}

export function defaultCollapseProps() {
  return {

    modelValue: () => [],
    accordion: false,
  } satisfies Required<InferVueDefaults<CollapseProps>>;
}

/** 折叠面板项的属性 */
export interface CollapseItemProps {
  /**
   * 唯一标识符，对应 activeNames 的值
   * @default ''
   */
  name: string;

  /**
   * 标题
   * @default ''
   */
  title?: string;

  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean;
}

export function defaultCollapseItemProps() {
  return {
    name: '',
    title: '',
    disabled: false,
  } satisfies Required<CollapseItemProps>;
}

/** 折叠面板组件事件 */
export interface CollapseEmits {
  /**
   * 当前激活面板改变时触发
   * @param activeNames 当前激活的面板
   */
  (event: 'update:modelValue', activeNames: string | string[]): void;

  /**
   * 当前激活面板改变时触发
   * @param activeNames 当前激活的面板
   */
  (event: 'change', activeNames: string | string[]): void;
}

/** 折叠面板组件的插槽 */
export interface CollapseSlots {
  /**
   * 默认插槽
   */
  default(): any;
}

/** 折叠面板项组件的插槽 */
export interface CollapseItemSlots {
  /**
   * 默认插槽，面板内容
   */
  default(): any;

  /**
   * 标题插槽
   */
  title(): any;
}

/** 注入的折叠面板上下文 */
export interface CollapseContext {
  /**
   * 当前激活的面板
   */
  activeNames: Ref<string[]>;

  /**
   * 是否为手风琴模式
   */
  accordion: Ref<boolean>;

  /**
   * 处理面板切换的方法
   */
  handleItemClick: (name: string) => void;
}

/** 折叠面板注入的key */
export const collapseContextKey: InjectionKey<CollapseContext> = Symbol('CollapseContext');
