// docs/.vitepress/env.d.ts
declare module 'markdown-it-container' {
  import type { PluginWithParams } from 'markdown-it';

  const container: PluginWithParams;
  export = container;
}
