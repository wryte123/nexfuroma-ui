# 快速开始

## 介绍

Nexfuroma UI 是一个现代化的用户界面库，旨在提供高效、美观且易于使用的组件。本指南将帮助您快速上手并开始使用我们的组件库。

## 安装

使用 npm 安装:

```bash
npm install nexfuroma-ui
```

或使用 pnpm 安装:

```bash
pnpm add nexfuroma-ui
```

## 基础使用

### 引入组件

在您的 Vue 项目中，您可以通过以下方式引入 Nexfuroma UI 组件：

```html
<script setup lang="ts">
import { Button, hello } from '@nexfuromaui/ui';
</script>

<template>
  <Button @click="hello">Hello</Button>
</template>
```

## 常见问题

### 浏览器兼容性

Nexfuroma UI 支持所有现代浏览器和 IE11+。

### 服务端渲染

Nexfuroma UI 完全支持服务端渲染 (SSR)。

## 下一步

- 查看[组件文档](/components)了解所有可用组件
- 参考[API 文档](/api)获取详细的接口说明
- 访问[演练场](/playground)查看实际使用案例·
