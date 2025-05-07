<script setup lang="ts">
import {
  ref, provide, watch, computed,
} from 'vue';
import {
  CollapseProps,
  CollapseEmits,
  collapseContextKey,
  defaultCollapseProps,
} from './props';

// 定义props和emits
const props = withDefaults(defineProps<CollapseProps>(), defaultCollapseProps());
const emit = defineEmits<CollapseEmits>();

// 激活的面板列表
const activeNames = ref<string[]>([]);

// 计算初始值
const setActiveNames = (value: string | string[]) => {
  if (props.accordion) {
    if (Array.isArray(value)) {
      activeNames.value = value.length ? [value[0]] : [];
    } else {
      activeNames.value = [value];
    }
  } else {
    activeNames.value = Array.isArray(value) ? value : [value];
  }
};

// 监听父组件传入的激活值变化
watch(
  () => props.modelValue,
  (value) => {
    if (!value || value === activeNames.value) return;
    setActiveNames(value);
  },
  { immediate: true },
);

// 处理面板切换
const handleItemClick = (name: string) => {
  if (props.accordion) {
    activeNames.value = activeNames.value[0] === name ? [] : [name];
  } else {
    const index = activeNames.value.indexOf(name);
    if (index > -1) {
      activeNames.value.splice(index, 1);
    } else {
      activeNames.value.push(name);
    }
  }

  // 同步更新
  const value = props.accordion ? activeNames.value[0] || '' : activeNames.value;
  emit('update:modelValue', value);
  emit('change', value);
};

// 提供上下文给子组件
provide(collapseContextKey, {
  activeNames,
  accordion: computed(() => props.accordion),
  handleItemClick,
});
</script>

<template>
  <div class="nx-collapse">
    <slot />
  </div>
</template>
