<script lang="ts" setup>
import {
  inject, computed, ref,
} from 'vue';
import { CollapseItemProps, collapseContextKey, defaultCollapseItemProps } from './props';

// 定义props
const props = withDefaults(defineProps<CollapseItemProps>(), defaultCollapseItemProps());

// 获取注入的上下文
const collapseContext = inject(collapseContextKey);
if (!collapseContext) {
  throw new Error('CollapseItem 必须在 Collapse 内使用');
}

// 面板内容区域DOM引用
const contentRef = ref<HTMLDivElement | null>(null);
// 面板内容区域高度
// const contentHeight = ref<string>('0px');

// 计算当前面板是否处于激活状态
const isActive = computed(() => collapseContext.activeNames.value.includes(props.name));

// 处理面板标题点击
const handleHeaderClick = () => {
  if (props.disabled) return;
  collapseContext.handleItemClick(props.name);
};

// 处理面板展开前的动画
const beforeEnter = (el: Element) => {
  const element = el as HTMLElement;
  element.style.height = '0';
  element.style.overflow = 'hidden';
};

// 处理面板展开中的动画
const enter = (el: Element) => {
  const element = el as HTMLElement;
  element.style.height = `${contentRef.value?.scrollHeight || 0}px`;
  element.style.overflow = 'hidden';
  element.style.transition = 'height 0.3s ease';
};

// 处理面板展开后的动画
const afterEnter = (el: Element) => {
  const element = el as HTMLElement;
  element.style.height = '';
  element.style.overflow = '';
  element.style.transition = '';
};

// 处理面板收起前的动画
const beforeLeave = (el: Element) => {
  const element = el as HTMLElement;
  element.style.height = `${contentRef.value?.scrollHeight || 0}px`;
  element.style.overflow = 'hidden';
};

// 处理面板收起中的动画
const leave = (el: Element) => {
  const element = el as HTMLElement;
  element.style.height = '0';
  element.style.overflow = 'hidden';
  element.style.transition = 'height 0.3s ease';
};

// 处理面板收起后的动画
const afterLeave = (el: Element) => {
  const element = el as HTMLElement;
  element.style.height = '';
  element.style.overflow = '';
  element.style.transition = '';
};
</script>

<template>
  <div class="nx-collapse-item" :class="{ 'is-active': isActive, 'is-disabled': disabled }">
    <div class="nx-collapse-item__header" @click="handleHeaderClick">
      <slot name="title">
        {{ title }}
      </slot>
      <i class="i-nx-arrow-down nx-collapse-item__arrow" :class="{ 'is-active': isActive }" />
    </div>
    <Transition
      @before-enter="beforeEnter"
      @enter="enter"
      @after-enter="afterEnter"
      @before-leave="beforeLeave"
      @leave="leave"
      @after-leave="afterLeave"
    >
      <div v-show="isActive" ref="contentRef" class="nx-collapse-item__content">
        <div class="nx-collapse-item__content-box">
          <slot />
        </div>
      </div>
    </Transition>
  </div>
</template>
