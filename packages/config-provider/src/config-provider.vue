<script setup lang="ts">
import { computed } from 'vue';
import { generateCssVars, themeColorLevelsEnabledKeys } from '@nexfuromaui/styles';
import { ConfigProviderProps, defaultConfigProviderProps } from './props';

const props = withDefaults(
  defineProps<ConfigProviderProps>(),
  defaultConfigProviderProps(),
);

const cssVars = computed(() => generateCssVars(props.themeVars, {
  colorLevelsEnabledKeys: themeColorLevelsEnabledKeys,
  colorLevels: 9,
}));
</script>

<template>
  <component :is="tag" :style="cssVars">
    <slot />
  </component>
</template>
