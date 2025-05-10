<script setup lang="ts">
import { ref } from 'vue';
import { Collapse, CollapseItem } from '@nexfuromaui/ui';

const activeNames = ref<string[]>([]);
</script>

<template>
  <div class="collapses">
    <Collapse v-model="activeNames" accordion>
      <CollapseItem title="标题1" name="1">
        内容1
      </CollapseItem>
      <CollapseItem title="标题2" name="2">
        内容2
      </CollapseItem>
      <CollapseItem title="标题3" name="3" disabled>
        内容3
      </CollapseItem>
    </Collapse>
  </div>
</template>

<style scoped>
.collapses {
  margin: 16px 0;
}
</style>
