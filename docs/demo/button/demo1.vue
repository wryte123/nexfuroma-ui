<!-- docs/demo/button/demo1.vue -->
<script setup lang="ts">
import { ref, reactive } from 'vue';
import {
  Button,
  ConfigProvider,
  useTheme,
  tinyThemeVars,
  themeVars,
  NexfuromauiCssVarsConfig,
} from '@nexfuromaui/ui';

const { setTheme } = useTheme();

const currentGlobalTheme = ref<'default' | 'tiny'>('default');

function switchGlobalTheme() {
  if (currentGlobalTheme.value === 'tiny') {
    currentGlobalTheme.value = 'default';
    setTheme(themeVars);
  } else {
    currentGlobalTheme.value = 'tiny';
    setTheme(tinyThemeVars);
  }
}

const currentSecondLineTheme = ref<'default' | 'tiny'>('default');
const secondLineThemeVars: NexfuromauiCssVarsConfig = reactive({});
function switchSecondLineTheme() {
  if (currentSecondLineTheme.value === 'tiny') {
    currentSecondLineTheme.value = 'default';
    Object.assign(secondLineThemeVars, themeVars);
  } else {
    currentSecondLineTheme.value = 'tiny';
    Object.assign(secondLineThemeVars, tinyThemeVars);
  }
}
</script>

<template>
  <div>
    <div class="btns">
      <Button>Button</Button>
      <Button type="primary">
        Button
      </Button>
      <Button type="success">
        Button
      </Button>
      <Button type="danger">
        Button
      </Button>
      <Button type="warning">
        Button
      </Button>
      <Button type="info">
        Button
      </Button>
    </div>
    <div class="btns">
      <ConfigProvider class="btns" :theme-vars="secondLineThemeVars">
        <Button plain>
          Button
        </Button>
        <Button type="primary" plain>
          Button
        </Button>
        <Button type="success" plain>
          Button
        </Button>
        <Button type="danger" plain>
          Button
        </Button>
        <Button type="warning" plain>
          Button
        </Button>
        <Button type="info" plain>
          Button
        </Button>
      </ConfigProvider>
    </div>
    <div class="btns">
      <Button disabled>
        Button
      </Button>
      <Button type="primary" disabled>
        Button
      </Button>
      <Button type="success" disabled>
        Button
      </Button>
      <Button type="danger" disabled>
        Button
      </Button>
      <Button type="warning" disabled>
        Button
      </Button>
      <Button type="info" disabled>
        Button
      </Button>
    </div>
    <div class="btns">
      <Button @click="switchGlobalTheme">
        切换全局主题，当前：{{ currentGlobalTheme }}
      </Button>
      <Button @click="switchSecondLineTheme">
        切换第二行主题，当前：{{ currentSecondLineTheme }}
      </Button>
    </div>
  </div>
</template>

<style scoped>
.deep(.nx-button:not(:first-child)) {
  margin-left: 10px;
}

:deep(.nx-button) {
  margin-bottom: 10px;
}
</style>
