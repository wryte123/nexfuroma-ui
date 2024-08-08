<script setup lang="ts">
import { hello } from "@nexfuromaui/shared";

withDefaults(
  defineProps<{
    modelValue: string;
  }>(),
  {
    modelValue: "",
  }
);

const emit = defineEmits<{
  (event: "update:modelValue", val: string): void;
}>();

function inputHandler(e: any) {
  const value: string = e.target.value;
  emit("update:modelValue", value);
  hello(value);
}
</script>
<template>
  <input
    class="nexfor-input"
    type="text"
    :value="modelValue"
    @input="inputHandler"
  />
</template>
