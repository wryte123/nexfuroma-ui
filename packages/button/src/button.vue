<script setup lang="ts">
import { computed } from 'vue';
import { defaultButtonProps, ButtonProps } from './button';

const props = withDefaults(defineProps<ButtonProps>(), defaultButtonProps());

const classes = computed(() => {
  const result: string[] = [];
  if (props.type) {
    result.push(`nx-button--${props.type}`);
  }

  if (props.plain) {
    result.push('nx-button--plain');
  }

  if (props.disabled) {
    result.push('nx-button--disabled');
  }

  return result;
});
</script>

<template>
  <button class="nx-button" :class="classes">
    <slot />
  </button>
</template>
