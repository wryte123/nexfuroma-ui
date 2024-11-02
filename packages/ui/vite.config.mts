/* eslint-disable no-await-in-loop */
import { defineConfig, PluginOption, ConfigEnv } from 'vite';
import {
  readdir, readFile, writeFile, cp,
} from 'node:fs/promises';
import { resolve, join } from 'node:path';
import {
  usePathAbs, absCwd, relCwd, GenerateConfigOptions,
} from '../build/src';
import { generateVueConfig } from '../build/scripts';

/** 本包产物相对本包根目录的路径 */
const OUT_REL = 'dist';

/** 本包样式相对本包根目录的路径 */
const STYLE_OUT_REL = join(OUT_REL, 'style');

/** 子包产物相对目录 */
const PACKAGE_OUT_REL = 'dist';

export default defineConfig(({ mode }: ConfigEnv) => generateVueConfig(
  {
    outDir: OUT_REL,
    mode: mode as GenerateConfigOptions['mode'],
    // 样式都来自构建好的子包，无需 UnoCSS 生成样式
    pluginUno: false,
    // 在 package.json 的 exports 字段声明样式文件的人口
    onSetPkg: (pkg, options) => {
      const exports: Record<string, string> = {
        './styles/*': relCwd(absCwd(options.outDir, 'styles/*'), false),
      };
      Object.assign(pkg.exports as Record<string, any>, exports);
    },
  },
  {
    plugins: [
      // 使用 Vite 插件处理 css 移动的行为
      pluginMoveStyles(mode),
    ],
  },
));

function pluginMoveStyles(mode: string): PluginOption {
  if (mode !== 'package') return null;

  const absPackages = usePathAbs(resolve(process.cwd(), '..'));

  return {
    name: 'move-styles',
    // 只在构建时执行
    apply: 'build',
    async closeBundle() {
      // 遍历所有子包
      const packages = await readdir(absPackages());
      // 待处理子包中排除自己
      const uiIndex = packages.findIndex((pkg) => pkg === 'ui');
      if (uiIndex > 0) {
        packages.splice(uiIndex, 1);
      }

      // 主题样式放到队首，在合并CSSs时优先
      const themeIndex = packages.findIndex((pkg) => pkg === 'theme');
      if (themeIndex > 0) {
        packages.splice(themeIndex, 1);
        packages.unshift('theme');
      }

      // 一边移动每个组件各自的样式，一边拼接全量样式 index.css
      let indexCss = '';
      for (let i = 0; i < packages.length; i++) {
        const pkg = packages[i];

        console.log(`moving css of package: ${pkg}...`);
        const source = absPackages(pkg, PACKAGE_OUT_REL, 'style.css');
        const target = absCwd(STYLE_OUT_REL, `${pkg}.css`);
        try {
          const styleCss = await readFile(source, 'utf-8');
          indexCss += styleCss;
          await cp(source, target, { recursive: true, force: true });
          console.log(`${source} moved successfully!`);
        } catch (err) {
          console.log(`${source} not found`);
        }
      }

      console.log('generating index.css...');
      await writeFile(absCwd(STYLE_OUT_REL, 'index.css'), indexCss, 'utf-8');
    },
  };
}
