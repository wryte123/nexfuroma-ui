<script setup lang="ts">
import { ref } from 'vue';
import { Input, hello } from '@nexfuromaui/ui';

const inputValue = ref('');

const keydownHandle = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    const { value } = inputValue;
    hello(value);
  }
};
</script>

<template>
  <div class="forms">
    <Input placeholder="请输入内容" />
    <Input v-model="inputValue" placeholder="请输入内容" clearable @keydown="keydownHandle" />
    <Input placeholder="禁止输入内容" disabled />
  </div>
</template>

<style scoped>
:deep(.nx-input) {
  margin-bottom: 10px;
}
</style>
