<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import {
  InputProps, InputEmits, InputExpose, defaultInputProps,
} from './props';

// 定义 props
const props = withDefaults(
  defineProps<InputProps>(),
  defaultInputProps(),
);
const emits = defineEmits<InputEmits>();

// 输入框引用
const inputRef = ref<HTMLInputElement | null>(null);
// 聚焦状态
const isFocused = ref(false);
// 本地值
const localValue = ref(props.modelValue);

// / 监听外部 modelValue 变化
watch(() => props.modelValue, (newValue) => {
  localValue.value = newValue;
}, { immediate: true });
// 计算类名
const inputClass = computed(() => ({
  'is-disabled': props.disabled,
  'is-focused': isFocused.value,
}));

// 处理输入事件
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const { value } = target;

  localValue.value = value; // 更新本地值
  emits('update:modelValue', value);
  emits('input', value);
};

// 处理聚焦事件
const handleFocus = (event: FocusEvent) => {
  isFocused.value = true;
  emits('focus', event);
};

// 处理失焦事件
const handleBlur = (event: FocusEvent) => {
  isFocused.value = false;
  emits('blur', event);
};

// 处理清除事件
const handleClear = () => {
  emits('update:modelValue', '');
  emits('clear', '');
  localValue.value = '';
  focus();
};

// 对外暴露方法
const clear = () => handleClear();

const focus = () => {
  inputRef.value?.focus();
};

const blur = () => {
  inputRef.value?.blur();
};

// 暴露方法供父组件调用
defineExpose<InputExpose>({
  clear,
  focus,
  blur,
  inputRef,
});
</script>

<template>
  <div
    class="nx-input"
    :class="inputClass"
  >
    <div class="nx-input__wrapper">
      <!-- 输入框 -->
      <input
        ref="inputRef"
        type="text"
        class="nx-input__inner"
        :value="localValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :aria-disabled="disabled"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      >
      <!-- 清除按钮 -->
      <i v-if="clearable && localValue" class="i-nx-clean" @click="handleClear" />
    </div>
  </div>
</template>
