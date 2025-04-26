// ../build/src/generateConfig/index.ts
import { mergeConfig } from "file:///Users/wryte/work/nexfuroma-ui/node_modules/.pnpm/vite@5.4.2_@types+node@22.5.0_sass@1.77.8/node_modules/vite/dist/node/index.js";

// ../build/src/utils/formatVar.ts
function splitVar(Varname) {
  const reg = /[A-Z]{2,}(?=[A-Z][a-z]+|[0-9]|[^a-zA-Z0-9])|[A-Z]?[a-z]+|[A-Z]|[0-9]/g;
  return Varname.match(reg) || [];
}
function kebabCase(varName) {
  const nameArr = splitVar(varName);
  return nameArr.map((item) => item.toLowerCase()).join("-");
}
function camelCase(varName, isFirstWordUpperCase = false) {
  const nameArr = splitVar(varName);
  return nameArr.map((item, index) => {
    if (index === 0 && !isFirstWordUpperCase) {
      return item.toLowerCase();
    }
    return item.charAt(0).toUpperCase() + item.slice(1).toLowerCase();
  }).join("");
}

// ../build/src/utils/typeCheck.ts
function isObjectLike(val) {
  return val !== null && typeof val === "object";
}
function isFunction(val) {
  return typeof val === "function";
}

// ../build/src/utils/resolvePath.ts
import { relative, resolve, sep } from "node:path";
function usePathAbs(basePath) {
  return (...paths) => normalizePath(resolve(basePath, ...paths));
}
var absCwd = usePathAbs(process.cwd());
function usePathRel(basePath) {
  return (path, ignoreLocalSignal = true) => {
    const result = normalizePath(relative(basePath, path));
    if (result.slice(0, 2) === "..") {
      return result;
    }
    return ignoreLocalSignal ? result : `./${result}`;
  };
}
var relCwd = usePathRel(process.cwd());
function normalizePath(path) {
  if (sep === "/") {
    return path;
  }
  return path.replace(new RegExp(`\\${sep}`, "g"), "/");
}

// ../build/src/utils/json.ts
import { readFile, writeFile } from "node:fs/promises";
async function readJsonFile(filePath) {
  const buffer = await readFile(filePath, "utf-8");
  return JSON.parse(buffer);
}
async function writeJsonFile(filePath, ...rests) {
  await writeFile(filePath, JSON.stringify(...rests), "utf-8");
}

// ../build/src/generateConfig/options.ts
function defaultOptions() {
  return {
    entry: "src/index.ts",
    outDir: "dist",
    fileName: "",
    mode: "package",
    exports: ".",
    dts: "",
    onSetPkg: () => {
    },
    pluginVue: false,
    pluginInspect: false,
    pluginVisualizer: false,
    pluginReplace: false
  };
}
function getOptions(options) {
  return { ...defaultOptions(), ...options };
}

// ../build/src/generateConfig/plugins.ts
import inspect from "file:///Users/wryte/work/nexfuroma-ui/node_modules/.pnpm/vite-plugin-inspect@0.8.7_rollup@4.21.0_vite@5.4.2_@types+node@22.5.0_sass@1.77.8_/node_modules/vite-plugin-inspect/dist/index.mjs";
import { visualizer } from "file:///Users/wryte/work/nexfuroma-ui/node_modules/.pnpm/rollup-plugin-visualizer@5.12.0_rollup@4.21.0/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import vue from "file:///Users/wryte/work/nexfuroma-ui/node_modules/.pnpm/@vitejs+plugin-vue@5.1.2_vite@5.4.2_@types+node@22.5.0_sass@1.77.8__vue@3.4.38_typescript@5.5.4_/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import replace from "file:///Users/wryte/work/nexfuroma-ui/node_modules/.pnpm/@rollup+plugin-replace@5.0.7_rollup@4.21.0/node_modules/@rollup/plugin-replace/dist/es/index.js";

// ../build/src/generateConfig/pluginSetPackageJson.ts
import { basename } from "node:path";

// ../build/src/generateConfig/lib.ts
import { statSync } from "node:fs";
import { join } from "node:path";
function getLib(packageJson = {}, options = {}) {
  const {
    entry,
    outDir,
    mode,
    fileName
  } = getOptions(options);
  const finalName = fileName || kebabCase(packageJson.name || "");
  const libOptions = {
    entry,
    formats: ["es", "umd"],
    name: camelCase(finalName),
    fileName: (format) => {
      const formatName = format;
      return getOutFileName(finalName, formatName, mode);
    }
  };
  return {
    lib: libOptions,
    // full-min 模式下全量构建，需要混淆代码，生成 sourcemap 文件，且不清空产物目录
    minify: mode === "full-min" ? "esbuild" : false,
    sourcemap: mode === "full-min",
    emptyOutDir: mode === "package",
    outDir
  };
}
function getOutFileName(fileName, format, buildMode = "package") {
  const formatName = format;
  const ext = formatName === "es" ? ".mjs" : ".umd.js";
  let tail = "";
  if (buildMode === "full") {
    tail += ".full";
  } else if (buildMode === "full-min") {
    tail += ".full.min";
  }
  tail += ext;
  return `${fileName}${tail}`;
}
function resolveEntry(entry) {
  const absEntry = absCwd(entry);
  const isEntryFile = statSync(absEntry).isFile();
  const absEntryFolder = isEntryFile ? join(absEntry, "..") : absEntry;
  return {
    abs: absEntry,
    rel: relCwd(absEntryFolder),
    isFile: isEntryFile
  };
}

// ../build/src/generateConfig/pluginSetPackageJson.ts
function pluginSetPackageJson(packageJson = {}, options = {}) {
  const finalOptions = getOptions(options);
  const {
    onSetPkg,
    mode,
    fileName,
    outDir,
    exports
  } = finalOptions;
  if (mode !== "package") {
    return null;
  }
  const finalName = fileName || kebabCase(packageJson.name || "");
  return {
    name: "set-package-json",
    // 只在构建模式下执行
    apply: "build",
    async closeBundle() {
      const packageJsonObj = packageJson || {};
      const exportsData = {};
      const umd = relCwd(absCwd(outDir, getOutFileName(finalName, "umd", mode)), false);
      exportsData.require = umd;
      if (exports === ".") {
        packageJsonObj.main = umd;
      }
      const es = relCwd(absCwd(outDir, getOutFileName(finalName, "es", mode)), false);
      exportsData.import = es;
      if (exports === ".") {
        packageJsonObj.module = es;
      }
      const dtsEntry = getDtsPath(options);
      exportsData.types = dtsEntry;
      if (exports === ".") {
        packageJsonObj.types = dtsEntry;
      }
      if (!isObjectLike(packageJsonObj.exports)) {
        packageJsonObj.exports = {};
      }
      Object.assign(packageJsonObj.exports, {
        [exports]: exportsData,
        // 默认暴露的出口
        "./*": "./*"
      });
      if (isFunction(onSetPkg)) {
        await onSetPkg(packageJsonObj, finalOptions);
      }
      await writeJsonFile(absCwd("package.json"), packageJsonObj, null, 2);
    }
  };
}
function getDtsPath(options = {}) {
  const { entry, outDir } = getOptions(options);
  const { rel, isFile } = resolveEntry(entry);
  const entryFileName = isFile ? basename(entry).replace(/\..*$/, ".d.ts") : "index.d.ts";
  return relCwd(absCwd(outDir, rel, entryFileName), false);
}

// ../build/src/generateConfig/pluginMoveDts.ts
import { getParsedCommandLineOfConfigFile, sys } from "file:///Users/wryte/work/nexfuroma-ui/node_modules/.pnpm/typescript@5.5.4/node_modules/typescript/lib/typescript.js";
import { cp } from "node:fs/promises";
function pluginMoveDts(options = {}) {
  const {
    entry,
    outDir,
    mode,
    dts
  } = getOptions(options);
  if (mode !== "package" || !dts) {
    return null;
  }
  const tsconfigs = getParsedCommandLineOfConfigFile(dts, {}, sys);
  if (!tsconfigs) {
    throw new Error(`Could not find tsconfig file: ${dts}`);
  }
  const { rootDir, outDir: tsOutDir } = tsconfigs.options;
  if (!rootDir || !tsOutDir) {
    throw new Error(`Could not find rootDir or outDir in tsconfig file: ${dts}`);
  }
  const relRoot = usePathRel(rootDir);
  const absRoot = usePathAbs(rootDir);
  const relPackagePath = relRoot(process.cwd());
  const { rel: relEntryPath } = resolveEntry(entry);
  return {
    name: "move-dts",
    apply: "build",
    async closeBundle() {
      const source = absRoot(tsOutDir, relPackagePath, relEntryPath);
      const target = absCwd(outDir, relEntryPath);
      try {
        await cp(source, target, {
          force: true,
          recursive: true
        });
      } catch (err) {
        console.log(`[${relPackagePath}]: failed to move dts!`);
        console.error(err);
      }
    }
  };
}

// ../build/src/generateConfig/plugins.ts
function getPlugins(packageJson = {}, options = {}) {
  const { mode, dts } = options;
  const result = getPresetPlugins(options);
  if (mode === "package") {
    result.push(pluginSetPackageJson(packageJson, options));
    if (dts) {
      result.push(pluginMoveDts(options));
    }
  }
  return result;
}
function getPresetPlugins(options = {}) {
  const result = [];
  result.push(
    getPresetPlugin(options, "pluginVue", vue),
    getPresetPlugin(options, "pluginInspect", inspect),
    getPresetPlugin(options, "pluginVisualizer", visualizer),
    getPresetPlugin(options, "pluginReplace", replace)
  );
  return result;
}
function getPresetPlugin(options, key, plugin, defaultOptions2) {
  const value = options[key];
  if (!value) {
    return null;
  }
  return plugin(isObjectLike(value) ? value : defaultOptions2);
}

// ../build/src/generateConfig/external.ts
function getExternal(packageJson = {}, options = {}) {
  const { dependencies = {}, peerDependencies = {} } = packageJson;
  const { mode } = getOptions(options);
  const defaultExternal = [
    // 将所有的node原生模块都进行外部化处理
    /^node:.*/
  ];
  const toReg = (item) => new RegExp(`^${item}`);
  return defaultExternal.concat(
    Object.keys(peerDependencies).map(toReg),
    // 全量构建时，依赖不进行外部化，一并打包进来
    mode === "package" ? Object.keys(dependencies).map(toReg) : []
  );
}

// ../build/src/generateConfig/index.ts
async function generateConfig(customOptions, viteConfig) {
  const options = getOptions(customOptions);
  const packageJson = await readJsonFile(absCwd("package.json"));
  const libOptions = getLib(packageJson, options);
  const external = getExternal(packageJson, options);
  const plugins = getPlugins(packageJson, options);
  const result = {
    plugins,
    build: {
      ...libOptions,
      rollupOptions: {
        external
      }
    }
  };
  return mergeConfig(result, viteConfig || {});
}

// ../build/scripts/common.ts
function generateConfig2(customOptions, viteConfig) {
  return generateConfig(
    { dts: absCwd("../../tsconfig.src.json"), ...customOptions },
    viteConfig
  );
}

// ../build/scripts/vue.ts
import { mergeConfig as mergeConfig2 } from "file:///Users/wryte/work/nexfuroma-ui/node_modules/.pnpm/vite@5.4.2_@types+node@22.5.0_sass@1.77.8/node_modules/vite/dist/node/index.js";
import { presetUno } from "file:///Users/wryte/work/nexfuroma-ui/node_modules/.pnpm/unocss@0.63.4_postcss@8.4.41_rollup@4.21.0_vite@5.4.2_@types+node@22.5.0_sass@1.77.8_/node_modules/unocss/dist/preset-uno.mjs";
import unocss from "file:///Users/wryte/work/nexfuroma-ui/node_modules/.pnpm/unocss@0.63.4_postcss@8.4.41_rollup@4.21.0_vite@5.4.2_@types+node@22.5.0_sass@1.77.8_/node_modules/unocss/dist/vite.mjs";
import transformerDirectives from "file:///Users/wryte/work/nexfuroma-ui/node_modules/.pnpm/@unocss+transformer-directives@0.63.4/node_modules/@unocss/transformer-directives/dist/index.mjs";

// ../styles/src/unoPreset.ts
import { mergeConfigs } from "file:///Users/wryte/work/nexfuroma-ui/node_modules/.pnpm/unocss@0.63.4_postcss@8.5.1_rollup@4.21.0_vite@5.4.14_@types+node@22.5.0_sass@1.77.8_/node_modules/unocss/dist/index.mjs";

// ../styles/src/vars/theme.ts
var themeColors = {
  "color-primary": "#1680B1",
  "color-success": "#50d4ab",
  "color-warning": "#fbb175",
  "color-danger": "#f66f6a",
  "color-info": "#526ecc",
  "color-transparent": "transparent",
  "color-black": "#000",
  "color-white": "#fff",
  // 背景色
  "color-page": "#f5f5f6",
  "color-card": "#fff",
  // 文字主色
  "color-header": "#252b3a",
  "color-regular": "#575d6c",
  "color-secondary": "#8a8e99",
  "color-placeholder": "#abb0b8",
  "color-disabled": "#c0c4cc",
  "color-reverse": "#fff",
  // 边框主色
  "color-bd_darker": "#cdd0d6",
  "color-bd_dark": "#d4d7de",
  "color-bd_base": "#dcdfe6",
  "color-bd_light": "#dfe1e6",
  "color-bd_lighter": "#ebeff5",
  "color-bd_lightest": "#f2f6fc"
};
var themeColorLevelsEnabledKeys = [
  "color-primary",
  "color-success",
  "color-warning",
  "color-danger",
  "color-info"
];
var themeSpacing = {
  "spacing-xs": "8px",
  "spacing-sm": "12px",
  "spacing-md": "16px",
  "spacing-lg": "24px",
  "spacing-xl": "32px"
};
var themeBorders = {
  "border-radius-xs": "2px",
  "border-radius-sm": "4px",
  "border-radius-md": "6px",
  "border-radius-lg": "8px",
  "border-radius-xl": "12px"
};
var themeVars = {
  ...themeColors,
  ...themeSpacing,
  ...themeBorders
};

// ../styles/src/utils/colors.ts
function toRgba(str) {
  return hexToRgba(str) || parseCssFunc(str);
}
function hexToRgba(str) {
  if (str.charAt(0) !== "#") return null;
  if (str.length !== 4 && str.length !== 7) return null;
  let colorStr = str.slice(1);
  if (colorStr.length === 3) {
    colorStr = colorStr[0] + colorStr[0] + colorStr[1] + colorStr[1] + colorStr[2] + colorStr[2];
  }
  const r = parseInt(colorStr.slice(0, 2), 16);
  const g = parseInt(colorStr.slice(2, 4), 16);
  const b = parseInt(colorStr.slice(4, 6), 16);
  return createRgbaColor(r, g, b, 1);
}
var cssColorFuncs = ["rgb", "rgba"];
function parseCssFunc(str) {
  const match = str.match(/^(.*)\((.+)\)$/i);
  if (!match) return null;
  const [, func, argsTxt] = match;
  if (!cssColorFuncs.includes(func)) {
    return null;
  }
  let argsArr = argsTxt.split(",");
  if (argsArr.length === 1) {
    argsArr = argsTxt.split(" ");
  }
  const args = argsArr.map(parseFloat).filter((item) => item);
  if (func === "rgb" || func === "rgba") {
    const [r, g, b, a] = args;
    return createRgbaColor(r, g, b, a || 1);
  }
  return null;
}
function createRgbaColor(r, g, b, a = 1) {
  return {
    args: [r, g, b, a],
    get rgbTxt() {
      const [rr, gg, bb] = this.args;
      return `${rr}, ${gg}, ${bb}`;
    },
    get rgba() {
      return `rgba(${this.rgbTxt}, ${this.args[3] || 1})`;
    }
  };
}
function mixRgbColor(source, target, percent) {
  const res = [
    source.args[0] + (target.args[0] - source.args[0]) * (percent / 100),
    source.args[1] + (target.args[1] - source.args[1]) * (percent / 100),
    source.args[2] + (target.args[2] - source.args[2]) * (percent / 100)
  ].map((item) => Math.round(item));
  const [rr, gg, bb] = res;
  return createRgbaColor(rr, gg, bb, source.args[3] || 1);
}
function generateRgbColorLevels(color, levels = 9) {
  const result = {
    light: [],
    dark: []
  };
  if (color.rgbTxt === "0, 0, 0" || color.rgbTxt === "255, 255, 255") {
    return result;
  }
  const percent = 100 / (levels + 1);
  for (let i = 1; i < levels + 1; i++) {
    result.light.push(mixRgbColor(color, createRgbaColor(255, 255, 255), i * percent));
    result.dark.push(mixRgbColor(color, createRgbaColor(0, 0, 0), i * percent));
  }
  return result;
}

// ../styles/src/utils/cssVars.ts
var DEFAULT_PREFIX = "nx-";
function generateCssVars(origin, options) {
  const { prefix = DEFAULT_PREFIX, colorLevelsEnabledKeys = [], colorLevels = 9 } = options || {};
  const result = {};
  Object.entries(origin).forEach(([key, value]) => {
    const csskey = `--${prefix}${key}`;
    const valueToRgba = toRgba(value);
    const finalValue = valueToRgba ? valueToRgba.rgbTxt : value;
    result[csskey] = finalValue;
    if (valueToRgba && colorLevelsEnabledKeys.includes(key)) {
      const rgbLevels = generateRgbColorLevels(valueToRgba, colorLevels);
      rgbLevels.light.forEach((light, index) => {
        const dark = rgbLevels.dark[index];
        result[`${csskey}-light-${index + 1}`] = light.rgbTxt;
        result[`${csskey}-dark-${index + 1}`] = dark.rgbTxt;
      });
    }
  });
  return result;
}
function cssVarsToString(cssVars, selector = ":root") {
  let result = `${selector}{`;
  Object.entries(cssVars).forEach(([key, value]) => {
    result += `${key}: ${value};`;
  });
  result += "}";
  return result;
}
function getCssVar(name, prefix = DEFAULT_PREFIX) {
  return `var(--${prefix}${name})`;
}
function cssVarToRgba(name, alpha = 1, prefix = DEFAULT_PREFIX) {
  return `rgba(${getCssVar(name, prefix)},${alpha})`;
}

// ../styles/src/utils/toTheme.ts
function toTheme(origin, options) {
  const {
    type = "color",
    prefix = DEFAULT_PREFIX,
    colorLevelsEnabledKeys = [],
    colorLevels = 9
  } = options || {};
  const themeReg = new RegExp(`${type}-(.*)$`);
  const keys = Object.keys(origin).filter((key) => themeReg.test(key)).map((key) => key.replace(themeReg, "$1"));
  const result = {};
  keys.forEach((key) => {
    result[key] = `rgb(${getCssVar(`${type}-${key}`, prefix)})`;
    if (type === "color" && colorLevelsEnabledKeys.includes(`${type}-${key}`)) {
      const lightColors = {};
      const darkColors = {};
      for (let i = 1; i < colorLevels + 1; i++) {
        lightColors[`${i}`] = `rgb(${getCssVar(`${type}-${key}-light-${i}`, prefix)})`;
        darkColors[`${i}`] = `rgb(${getCssVar(`${type}-${key}-dark-${i}`, prefix)})`;
      }
      result[`${key}_light`] = lightColors;
      result[`${key}_dark`] = darkColors;
    }
  });
  return result;
}

// ../styles/src/vars/button.ts
var buttonVars = {
  "button-color": cssVarToRgba("color-regular"),
  "button-bg-color": cssVarToRgba("color-card"),
  "button-border-color": cssVarToRgba("color-bd_base"),
  "button-hover-color": cssVarToRgba("color-primary"),
  "button-hover-bg-color": cssVarToRgba("color-primary-light-9"),
  "button-hover-border-color": cssVarToRgba("color-primary-light-7"),
  "button-active-color": cssVarToRgba("color-primary"),
  "button-active-bg-color": cssVarToRgba("color-primary-light-9"),
  "button-active-border-color": cssVarToRgba("color-primary"),
  "button-disabled-color": cssVarToRgba("color-placeholder"),
  "button-disabled-bg-color": cssVarToRgba("color-card"),
  "button-disabled-border-color": cssVarToRgba("color-bd_light"),
  "button-padding-x": getCssVar("spacing-md"),
  "button-padding-y": getCssVar("spacing-xs")
};

// ../styles/src/vars/input.ts
var inputVars = {
  "input-color": cssVarToRgba("color-regular"),
  "input-bg-color": cssVarToRgba("color-card"),
  "input-border-color": cssVarToRgba("color-bd_base"),
  "input-hover-bd-color": cssVarToRgba("color-secondary"),
  "input-focus-bd-color": cssVarToRgba("color-primary"),
  "input-disabled-color": cssVarToRgba("color-placeholder"),
  "input-disabled-bg-color": cssVarToRgba("color-card"),
  "input-active-bg-color": cssVarToRgba("color-header"),
  "input-placeholder-color": cssVarToRgba("color-placeholder"),
  "input-padding-x": getCssVar("spacing-md"),
  "input-padding-y": getCssVar("spacing-xs"),
  "input-border-radius": getCssVar("border-radius-xs")
};

// ../styles/src/unocss/base.ts
var baseConfig = {
  // 需要全局生效的主题
  theme: {
    // 颜色主题
    colors: toTheme(themeColors, {
      type: "color",
      colorLevelsEnabledKeys: themeColorLevelsEnabledKeys,
      colorLevels: 9
    }),
    // 边距相关主题
    spacing: toTheme(themeSpacing, {
      type: "spacing"
    })
  }
};

// ../styles/src/unocss/theme.ts
var themeConfig = {
  preflights: [
    {
      // 在生成的 css 样式文件中填入所有主题变量的定义
      getCSS: () => cssVarsToString(
        generateCssVars(themeVars, {
          colorLevelsEnabledKeys: themeColorLevelsEnabledKeys,
          colorLevels: 9
        })
      )
    }
  ]
};

// ../styles/src/unocss/button/index.ts
var buttonConfig = {
  /*
  rules: buttonRules,
  shortcuts: buttonShortcuts,
  safelist: [
    ...toSafeList(buttonRules),
    ...toSafeList(buttonShortcuts),
  ],
  */
  preflights: [
    {
      getCSS: () => cssVarsToString(
        generateCssVars(buttonVars)
      )
    }
  ]
};

// ../styles/src/unocss/input/index.ts
var inputConfig = {
  preflights: [
    {
      getCSS: () => cssVarsToString(generateCssVars(inputVars))
    }
  ]
};

// ../styles/src/unoPreset.ts
var configMaps = {
  theme: themeConfig,
  button: buttonConfig,
  input: inputConfig
};
function nexfuromauiPreset(options = {}) {
  const { include = Object.keys(configMaps), exclude = [] } = options;
  const components = /* @__PURE__ */ new Set();
  include.forEach((key) => components.add(key));
  exclude.forEach((key) => components.delete(key));
  const configs = Array.from(components).map((component) => configMaps[component]).filter((item) => item);
  configs.unshift(baseConfig);
  const mergedConfig = mergeConfigs(configs);
  return {
    name: "nexfuromaui-preset",
    ...mergedConfig
  };
}

// ../build/scripts/vue.ts
async function generateVueConfig(customOptions, viteConfig) {
  const { pluginUno = true, presetNexfuromauiOptions, presetUnoOptions } = customOptions || {};
  const configPreset = {
    plugins: [
      pluginUno ? unocss({
        /** 不应用 uno.config.ts 文件，所有配置直接传给插件 */
        configFile: false,
        presets: [
          presetUno({
            // 除了主题样式 theme，一般情况下，不打包 unocss/preset-uno 的预设
            preflight: false,
            ...presetUnoOptions
          }),
          // 集成组件库UnoCSS预设，组件的部份样式
          nexfuromauiPreset(presetNexfuromauiOptions)
        ],
        transformers: [
          // 支持在 css 中使用 @apply 语法聚合多个原子类
          transformerDirectives()
        ]
      }) : null
    ]
  };
  const optionsPreset = {
    pluginVue: true,
    // 将组件样式文件的入口写入 package.json 的 exports 字段
    onSetPkg: (pkg, options) => {
      const exports = {
        "./style.css": relCwd(absCwd(options.outDir, "style.css"), false)
      };
      Object.assign(pkg.exports, exports);
    }
  };
  const res = await generateConfig2(
    {
      ...optionsPreset,
      ...customOptions
    },
    mergeConfig2(configPreset, viteConfig || {})
  );
  return res;
}

// vite.config.mts
var vite_config_default = generateVueConfig({
  presetNexfuromauiOptions: {
    // config-provider 组件暂时没有 UnoCSS 样式预设
    include: []
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vYnVpbGQvc3JjL2dlbmVyYXRlQ29uZmlnL2luZGV4LnRzIiwgIi4uL2J1aWxkL3NyYy91dGlscy9mb3JtYXRWYXIudHMiLCAiLi4vYnVpbGQvc3JjL3V0aWxzL3R5cGVDaGVjay50cyIsICIuLi9idWlsZC9zcmMvdXRpbHMvcmVzb2x2ZVBhdGgudHMiLCAiLi4vYnVpbGQvc3JjL3V0aWxzL2pzb24udHMiLCAiLi4vYnVpbGQvc3JjL2dlbmVyYXRlQ29uZmlnL29wdGlvbnMudHMiLCAiLi4vYnVpbGQvc3JjL2dlbmVyYXRlQ29uZmlnL3BsdWdpbnMudHMiLCAiLi4vYnVpbGQvc3JjL2dlbmVyYXRlQ29uZmlnL3BsdWdpblNldFBhY2thZ2VKc29uLnRzIiwgIi4uL2J1aWxkL3NyYy9nZW5lcmF0ZUNvbmZpZy9saWIudHMiLCAiLi4vYnVpbGQvc3JjL2dlbmVyYXRlQ29uZmlnL3BsdWdpbk1vdmVEdHMudHMiLCAiLi4vYnVpbGQvc3JjL2dlbmVyYXRlQ29uZmlnL2V4dGVybmFsLnRzIiwgIi4uL2J1aWxkL3NjcmlwdHMvY29tbW9uLnRzIiwgIi4uL2J1aWxkL3NjcmlwdHMvdnVlLnRzIiwgIi4uL3N0eWxlcy9zcmMvdW5vUHJlc2V0LnRzIiwgIi4uL3N0eWxlcy9zcmMvdmFycy90aGVtZS50cyIsICIuLi9zdHlsZXMvc3JjL3V0aWxzL2NvbG9ycy50cyIsICIuLi9zdHlsZXMvc3JjL3V0aWxzL2Nzc1ZhcnMudHMiLCAiLi4vc3R5bGVzL3NyYy91dGlscy90b1RoZW1lLnRzIiwgIi4uL3N0eWxlcy9zcmMvdmFycy9idXR0b24udHMiLCAiLi4vc3R5bGVzL3NyYy92YXJzL2lucHV0LnRzIiwgIi4uL3N0eWxlcy9zcmMvdW5vY3NzL2Jhc2UudHMiLCAiLi4vc3R5bGVzL3NyYy91bm9jc3MvdGhlbWUudHMiLCAiLi4vc3R5bGVzL3NyYy91bm9jc3MvYnV0dG9uL2luZGV4LnRzIiwgIi4uL3N0eWxlcy9zcmMvdW5vY3NzL2lucHV0L2luZGV4LnRzIiwgInZpdGUuY29uZmlnLm10cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy93cnl0ZS93b3JrL25leGZ1cm9tYS11aS9wYWNrYWdlcy9idWlsZC9zcmMvZ2VuZXJhdGVDb25maWdcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy93cnl0ZS93b3JrL25leGZ1cm9tYS11aS9wYWNrYWdlcy9idWlsZC9zcmMvZ2VuZXJhdGVDb25maWcvaW5kZXgudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3dyeXRlL3dvcmsvbmV4ZnVyb21hLXVpL3BhY2thZ2VzL2J1aWxkL3NyYy9nZW5lcmF0ZUNvbmZpZy9pbmRleC50c1wiO2ltcG9ydCB7IG1lcmdlQ29uZmlnLCBVc2VyQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyBQYWNrYWdlSnNvbiB9IGZyb20gJ3R5cGUtZmVzdCc7XG5pbXBvcnQgeyByZWFkSnNvbkZpbGUsIGFic0N3ZCB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB7IGdldE9wdGlvbnMsIEdlbmVyYXRlQ29uZmlnT3B0aW9ucyB9IGZyb20gJy4vb3B0aW9ucyc7XG5pbXBvcnQgeyBnZXRQbHVnaW5zIH0gZnJvbSAnLi9wbHVnaW5zJztcbmltcG9ydCB7IGdldEV4dGVybmFsIH0gZnJvbSAnLi9leHRlcm5hbCc7XG5pbXBvcnQgeyBnZXRMaWIgfSBmcm9tICcuL2xpYic7XG5cbi8qKlxuICogXHU3NTFGXHU2MjEwIFZpdGUgXHU2Nzg0XHU1RUZBXHU5MTREXHU3RjZFXG4gKiBAcGFyYW0gY3VzdG9tT3B0aW9ucyBcdTgxRUFcdTVCOUFcdTRFNDlcdTY3ODRcdTVFRkFcdTkwMDlcdTk4NzlcbiAqIEBwYXJhbSB2aXRlQ29uZmlnIFx1ODFFQVx1NUI5QVx1NEU0OSB2aXRlIFx1OTE0RFx1N0Y2RVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVDb25maWcoXG4gIGN1c3RvbU9wdGlvbnM/OiBHZW5lcmF0ZUNvbmZpZ09wdGlvbnMsXG4gIHZpdGVDb25maWc/OiBVc2VyQ29uZmlnLFxuKSB7XG4gIC8qKiBcdTgzQjdcdTUzRDZcdTkxNERcdTdGNkVcdTkwMDlcdTk4NzkgKi9cbiAgY29uc3Qgb3B0aW9ucyA9IGdldE9wdGlvbnMoY3VzdG9tT3B0aW9ucyk7XG5cbiAgLy8gXHU4M0I3XHU1M0Q2XHU2QkNGXHU0RTJBXHU1QjUwXHU1MzA1XHU3Njg0IHBhY2thZ2UuanNvbiBcdTVCRjlcdThDNjFcbiAgY29uc3QgcGFja2FnZUpzb24gPSBhd2FpdCByZWFkSnNvbkZpbGU8UGFja2FnZUpzb24+KGFic0N3ZCgncGFja2FnZS5qc29uJykpO1xuXG4gIC8vIFx1NzUxRlx1NjIxMFx1NEVBN1x1NzI2OVx1NzZGOFx1NTE3M1x1OTE0RFx1N0Y2RSBidWlsZC5saWJcbiAgY29uc3QgbGliT3B0aW9ucyA9IGdldExpYihwYWNrYWdlSnNvbiwgb3B0aW9ucyk7XG5cbiAgLy8gXHU3NTFGXHU2MjEwXHU0RjlEXHU4RDU2XHU1OTE2XHU5MEU4XHU1MzE2XHU3NkY4XHU1MTczXHU5MTREXHU3RjZFIGJ1aWxkLnJvbGx1cE9wdGlvbnMuZXh0ZXJuYWxcbiAgY29uc3QgZXh0ZXJuYWwgPSBnZXRFeHRlcm5hbChwYWNrYWdlSnNvbiwgb3B0aW9ucyk7XG5cbiAgLy8gXHU2M0QyXHU0RUY2XHU3NkY4XHU1MTczXHVGRjBDXHU4M0I3XHU1M0Q2XHU2Nzg0XHU1RUZBXHU5MTREXHU3RjZFXHU3Njg0IHBsdWdpbnMgXHU1QjU3XHU2QkI1XG4gIGNvbnN0IHBsdWdpbnMgPSBnZXRQbHVnaW5zKHBhY2thZ2VKc29uLCBvcHRpb25zKTtcblxuICAvLyBcdTYyRkNcdTYzQTVcdTU0MDRcdTk4NzlcdTkxNERcdTdGNkVcbiAgY29uc3QgcmVzdWx0OiBVc2VyQ29uZmlnID0ge1xuICAgIHBsdWdpbnMsXG4gICAgYnVpbGQ6IHtcbiAgICAgIC4uLmxpYk9wdGlvbnMsXG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIGV4dGVybmFsLFxuICAgICAgfSxcbiAgICB9LFxuICB9O1xuXG4gIC8vIFx1NEUwRVx1ODFFQVx1NUI5QVx1NEU0OSBWaXRlIFx1OTE0RFx1N0Y2RVx1NkRGMVx1NUVBNlx1NTQwOFx1NUU3Nlx1RkYwQ1x1NzUxRlx1NjIxMFx1NjcwMFx1N0VDOFx1OTE0RFx1N0Y2RVxuICByZXR1cm4gbWVyZ2VDb25maWcocmVzdWx0LCB2aXRlQ29uZmlnIHx8IHt9KSBhcyBVc2VyQ29uZmlnO1xufVxuXG4vLyBcdTVCRkNcdTUxRkFcdTUxNzZcdTRFRDZcdTZBMjFcdTU3NTdcbmV4cG9ydCAqIGZyb20gJy4vcGx1Z2lucyc7XG5leHBvcnQgKiBmcm9tICcuL29wdGlvbnMnO1xuZXhwb3J0ICogZnJvbSAnLi9saWInO1xuZXhwb3J0ICogZnJvbSAnLi9leHRlcm5hbCc7XG5leHBvcnQgKiBmcm9tICcuL3BsdWdpbk1vdmVEdHMnO1xuZXhwb3J0ICogZnJvbSAnLi9wbHVnaW5TZXRQYWNrYWdlSnNvbic7XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy93cnl0ZS93b3JrL25leGZ1cm9tYS11aS9wYWNrYWdlcy9idWlsZC9zcmMvdXRpbHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy93cnl0ZS93b3JrL25leGZ1cm9tYS11aS9wYWNrYWdlcy9idWlsZC9zcmMvdXRpbHMvZm9ybWF0VmFyLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy93cnl0ZS93b3JrL25leGZ1cm9tYS11aS9wYWNrYWdlcy9idWlsZC9zcmMvdXRpbHMvZm9ybWF0VmFyLnRzXCI7ZnVuY3Rpb24gc3BsaXRWYXIoVmFybmFtZTogc3RyaW5nKSB7XG4gIGNvbnN0IHJlZyA9IC9bQS1aXXsyLH0oPz1bQS1aXVthLXpdK3xbMC05XXxbXmEtekEtWjAtOV0pfFtBLVpdP1thLXpdK3xbQS1aXXxbMC05XS9nO1xuICByZXR1cm4gVmFybmFtZS5tYXRjaChyZWcpIHx8IDxzdHJpbmdbXT5bXTtcbn1cblxuLyoqIFx1NUMwNlx1NTNEOFx1OTFDRlx1NTQwRFx1OEY2Q1x1NjM2Mlx1NEUzQVx1ODA4OVx1NEUzMlx1NUY2Mlx1NUYwRlx1RkYxQUBuZXhmdXJvbWF1aS9idWlsZCAtPiBuZXhmdXJvbWF1aS1idWlsZCAqL1xuZXhwb3J0IGZ1bmN0aW9uIGtlYmFiQ2FzZSh2YXJOYW1lOiBzdHJpbmcpIHtcbiAgY29uc3QgbmFtZUFyciA9IHNwbGl0VmFyKHZhck5hbWUpO1xuICByZXR1cm4gbmFtZUFyci5tYXAoKGl0ZW0pID0+IGl0ZW0udG9Mb3dlckNhc2UoKSkuam9pbignLScpO1xufVxuXG4vKiogXHU1QzA2XHU1M0Q4XHU5MUNGXHU1NDBEXHU4RjZDXHU2MzYyXHU0RTNBXHU5QTdDXHU1Q0YwXHU1RjYyXHU1RjBGXHVGRjFBbmV4ZnVyb21hdWktYnVpbGQgLT4gbmV4ZnVyb21hdWlCdWlsZCAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhbWVsQ2FzZSh2YXJOYW1lOiBzdHJpbmcsIGlzRmlyc3RXb3JkVXBwZXJDYXNlID0gZmFsc2UpIHtcbiAgY29uc3QgbmFtZUFyciA9IHNwbGl0VmFyKHZhck5hbWUpO1xuICByZXR1cm4gbmFtZUFyclxuICAgIC5tYXAoKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICBpZiAoaW5kZXggPT09IDAgJiYgIWlzRmlyc3RXb3JkVXBwZXJDYXNlKSB7XG4gICAgICAgIHJldHVybiBpdGVtLnRvTG93ZXJDYXNlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gaXRlbS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGl0ZW0uc2xpY2UoMSkudG9Mb3dlckNhc2UoKTtcbiAgICB9KVxuICAgIC5qb2luKCcnKTtcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3dyeXRlL3dvcmsvbmV4ZnVyb21hLXVpL3BhY2thZ2VzL2J1aWxkL3NyYy91dGlsc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3dyeXRlL3dvcmsvbmV4ZnVyb21hLXVpL3BhY2thZ2VzL2J1aWxkL3NyYy91dGlscy90eXBlQ2hlY2sudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3dyeXRlL3dvcmsvbmV4ZnVyb21hLXVpL3BhY2thZ2VzL2J1aWxkL3NyYy91dGlscy90eXBlQ2hlY2sudHNcIjtleHBvcnQgZnVuY3Rpb24gaXNPYmplY3RMaWtlKHZhbDogdW5rbm93bikge1xuICByZXR1cm4gdmFsICE9PSBudWxsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNGdW5jdGlvbih2YWw6IHVua25vd24pOiB2YWwgaXMgRnVuY3Rpb24ge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJztcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3dyeXRlL3dvcmsvbmV4ZnVyb21hLXVpL3BhY2thZ2VzL2J1aWxkL3NyYy91dGlsc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3dyeXRlL3dvcmsvbmV4ZnVyb21hLXVpL3BhY2thZ2VzL2J1aWxkL3NyYy91dGlscy9yZXNvbHZlUGF0aC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvd3J5dGUvd29yay9uZXhmdXJvbWEtdWkvcGFja2FnZXMvYnVpbGQvc3JjL3V0aWxzL3Jlc29sdmVQYXRoLnRzXCI7LyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVzZS1iZWZvcmUtZGVmaW5lICovXG5pbXBvcnQgeyByZWxhdGl2ZSwgcmVzb2x2ZSwgc2VwIH0gZnJvbSAnbm9kZTpwYXRoJztcblxuLyoqIFx1N0VEOVx1NEU4OFx1NTdGQVx1Nzg0MFx1OERFRlx1NUY4NFx1RkYwQ1x1ODNCN1x1NTNENlx1NTIzMFx1NEVFNVx1NkI2NFx1NEUzQVx1NTdGQVx1NTFDNlx1OEJBMVx1N0I5N1x1N0VERFx1NUJGOVx1OERFRlx1NUY4NFx1NzY4NFx1NjVCOVx1NkNENSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZVBhdGhBYnMoYmFzZVBhdGg6IHN0cmluZykge1xuICByZXR1cm4gKC4uLnBhdGhzOiBzdHJpbmdbXSkgPT4gbm9ybWFsaXplUGF0aChyZXNvbHZlKGJhc2VQYXRoLCAuLi5wYXRocykpO1xufVxuXG4vKiogXHU4M0I3XHU1M0Q2XHU1RjUzXHU1MjREXHU4MTFBXHU2NzJDXHU2MjY3XHU4ODRDXHU3Njg0XHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0ICovXG5leHBvcnQgY29uc3QgYWJzQ3dkID0gdXNlUGF0aEFicyhwcm9jZXNzLmN3ZCgpKTtcblxuLyoqIFx1N0VEOVx1NEU4OFx1NEUwMFx1NEUyQVx1NTdGQVx1Nzg0MFx1OERFRlx1NUY4NFx1RkYwQ1x1ODNCN1x1NTNENlx1NTIzMFx1NEUwMFx1NEUyQVx1NEVFNVx1NkI2NFx1NEUzQVx1NTdGQVx1NTFDNlx1OEJBMVx1N0I5N1x1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFx1NzY4NFx1NjVCOVx1NkNENSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZVBhdGhSZWwoYmFzZVBhdGg6IHN0cmluZykge1xuICByZXR1cm4gKHBhdGg6IHN0cmluZywgaWdub3JlTG9jYWxTaWduYWw6IGJvb2xlYW4gPSB0cnVlKSA9PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gbm9ybWFsaXplUGF0aChyZWxhdGl2ZShiYXNlUGF0aCwgcGF0aCkpO1xuICAgIGlmIChyZXN1bHQuc2xpY2UoMCwgMikgPT09ICcuLicpIHtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIHJldHVybiBpZ25vcmVMb2NhbFNpZ25hbCA/IHJlc3VsdCA6IGAuLyR7cmVzdWx0fWA7XG4gIH07XG59XG5cbi8qKiBcdTgzQjdcdTUzRDZcdTc2RjhcdTVCRjlcdTRFOEVcdTVGNTNcdTUyNERcdTgxMUFcdTY3MkNcdTYyNjdcdTg4NENcdTRGNERcdTdGNkVcdTc2ODRcdTc2RjhcdTVCRjlcdThERUZcdTVGODQgKi9cbmV4cG9ydCBjb25zdCByZWxDd2QgPSB1c2VQYXRoUmVsKHByb2Nlc3MuY3dkKCkpO1xuXG4vKiogXHU2RDg4XHU5NjY0XHU1REVFXHU1RjAyICovXG5mdW5jdGlvbiBub3JtYWxpemVQYXRoKHBhdGg6IHN0cmluZykge1xuICBpZiAoc2VwID09PSAnLycpIHtcbiAgICByZXR1cm4gcGF0aDtcbiAgfVxuICByZXR1cm4gcGF0aC5yZXBsYWNlKG5ldyBSZWdFeHAoYFxcXFwke3NlcH1gLCAnZycpLCAnLycpO1xufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvd3J5dGUvd29yay9uZXhmdXJvbWEtdWkvcGFja2FnZXMvYnVpbGQvc3JjL3V0aWxzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvd3J5dGUvd29yay9uZXhmdXJvbWEtdWkvcGFja2FnZXMvYnVpbGQvc3JjL3V0aWxzL2pzb24udHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3dyeXRlL3dvcmsvbmV4ZnVyb21hLXVpL3BhY2thZ2VzL2J1aWxkL3NyYy91dGlscy9qc29uLnRzXCI7aW1wb3J0IHsgcmVhZEZpbGUsIHdyaXRlRmlsZSB9IGZyb20gJ25vZGU6ZnMvcHJvbWlzZXMnO1xuXG4vKipcbiAqIFx1NEVDRVx1NjU4N1x1NEVGNlx1NEUyRFx1OEJGQlx1NTFGQUpzb25cdTVCRjlcdThDNjFcbiAqIEBwYXJhbSBmaWxlUGF0aCBcdTY1ODdcdTRFRjZcdThERUZcdTVGODRcbiAqIEByZXR1cm5zIEpzb25cdTVCRjlcdThDNjFcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlYWRKc29uRmlsZTxUIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgYW55PiA9IFJlY29yZDxzdHJpbmcsIGFueT4+KFxuICBmaWxlUGF0aDogc3RyaW5nLFxuKTogUHJvbWlzZTxUPiB7XG4gIGNvbnN0IGJ1ZmZlciA9IGF3YWl0IHJlYWRGaWxlKGZpbGVQYXRoLCAndXRmLTgnKTtcbiAgcmV0dXJuIEpTT04ucGFyc2UoYnVmZmVyKTtcbn1cblxuLyoqXG4gKiBcdTVDMDZKc29uXHU1QkY5XHU4QzYxXHU1MTk5XHU1MTY1XHU2NTg3XHU0RUY2XG4gKiBAcGFyYW0gZmlsZVBhdGggXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0XG4gKiBAcGFyYW0gcmVzdHMge0BsaW5rIEpTT04uc3RyaW5naWZ5fSBcdTc2ODRcdTUzQzJcdTY1NzBcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdyaXRlSnNvbkZpbGUoZmlsZVBhdGg6IHN0cmluZywgLi4ucmVzdHM6IFBhcmFtZXRlcnM8dHlwZW9mIEpTT04uc3RyaW5naWZ5Pikge1xuICBhd2FpdCB3cml0ZUZpbGUoZmlsZVBhdGgsIEpTT04uc3RyaW5naWZ5KC4uLnJlc3RzKSwgJ3V0Zi04Jyk7XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy93cnl0ZS93b3JrL25leGZ1cm9tYS11aS9wYWNrYWdlcy9idWlsZC9zcmMvZ2VuZXJhdGVDb25maWdcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy93cnl0ZS93b3JrL25leGZ1cm9tYS11aS9wYWNrYWdlcy9idWlsZC9zcmMvZ2VuZXJhdGVDb25maWcvb3B0aW9ucy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvd3J5dGUvd29yay9uZXhmdXJvbWEtdWkvcGFja2FnZXMvYnVpbGQvc3JjL2dlbmVyYXRlQ29uZmlnL29wdGlvbnMudHNcIjtpbXBvcnQgeyBQYWNrYWdlSnNvbiB9IGZyb20gJ3R5cGUtZmVzdCc7XG5pbXBvcnQgdHlwZSB7IEdlbmVyYXRlQ29uZmlnUGx1Z2luc09wdGlvbnMgfSBmcm9tICcuL3BsdWdpbnMnO1xuXG4vKiogXHU4MUVBXHU1QjlBXHU0RTQ5XHU2Nzg0XHU1RUZBXHU5MDA5XHU5ODc5ICovXG5leHBvcnQgaW50ZXJmYWNlIEdlbmVyYXRlQ29uZmlnT3B0aW9ucyBleHRlbmRzIEdlbmVyYXRlQ29uZmlnUGx1Z2luc09wdGlvbnMge1xuICAvKipcbiAgICogXHU0RUUzXHU3ODAxXHU1MTY1XHU1M0UzXG4gICAqIEBkZWZhdWx0ICdzcmMvaW5kZXgudHMnXG4gICAqL1xuICBlbnRyeT86IHN0cmluZztcblxuICAvKipcbiAgICogXHU0RUE3XHU3MjY5XHU4RjkzXHU1MUZBXHU4REVGXHU1Rjg0XG4gICAqIEBkZWZhdWx0ICdkaXN0J1xuICAgKi9cbiAgb3V0RGlyPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBcdTc1MUZcdTYyMTBcdTc2ODRcdTY1ODdcdTRFRjZcdTU0MERcdTVCNTdcbiAgICovXG4gIGZpbGVOYW1lPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBcdTYyNTNcdTUzMDVcdTZBMjFcdTVGMEZcbiAgICogLSBwYWNrYWdlIC0gXHU1RTM4XHU4OUM0XHU2Nzg0XHU1RUZBXHUzMDAyXHU0RjFBXHU1QzA2XHU2MjQwXHU2NzA5XHU0RjlEXHU4RDU2XHU1OTE2XHU5MEU4XHU1MzE2XHU1OTA0XHU3NDA2XHVGRjBDXHU2MjUzXHU1MzA1XHU1MUZBXHU5MDAyXHU3NTI4XHU0RThFXHU2Nzg0XHU1RUZBXHU1NzNBXHU2NjZGXHU3Njg0IGBlc2BcdTMwMDFgdW1kYCBcdTY4M0NcdTVGMEZcdTRFQTdcdTcyNjlcdTMwMDJcdTVFNzZcdTU3MjhcdTY3ODRcdTVFRkFcdTdFRDNcdTY3NUZcdTU0MEVcdTVDMDZcdTRFQTdcdTcyNjlcdThERUZcdTVGODRcdTU2REVcdTUxOTlcdTUxNjUgcGFja2FnZS5qc29uIFx1NzY4NFx1NTE2NVx1NTNFM1x1NUI1N1x1NkJCNVx1NEUyRFx1MzAwMlxuICAgKiAtIGZ1bGwgLSBcdTUxNjhcdTkxQ0ZcdTY3ODRcdTVFRkFcdTMwMDJcdTU5MjdcdTkwRThcdTUyMDZcdTRGOURcdThENTZcdTkwRkRcdTRFMERcdTUwNUFcdTU5MTZcdTkwRThcdTUzMTZcdTU5MDRcdTc0MDZcdUZGMENcdTYyNTNcdTUzMDVcdTUxRkFcdTkwMDJcdTc1MjhcdTRFOEVcdTk3NUVcdTY3ODRcdTVFRkFcdTU3M0FcdTY2NkZcdTc2ODQgYHVtZGAgXHU2ODNDXHU1RjBGXHU0RUE3XHU3MjY5XHUzMDAyXHU0RTBEXHU1M0MyXHU0RTBFIGQudHMgXHU3Njg0XHU3OUZCXHU1MkE4XHVGRjFCXHU0RTBEXHU1M0MyXHU0RTBFXHU2Nzg0XHU1RUZBXHU1QjhDXHU2MjEwXHU1NDBFXHU3Njg0XHU0RUE3XHU3MjY5XHU4REVGXHU1Rjg0XHU1NkRFXHU1MTk5XHUzMDAyXG4gICAqIC0gZnVsbC1taW4gLSBcdTU3MjhcdTUxNjhcdTkxQ0ZcdTY3ODRcdTVFRkFcdTc2ODRcdTU3RkFcdTc4NDBcdTRFMEFcdUZGMENcdTVDMDZcdTRFQTdcdTcyNjlcdTRFRTNcdTc4MDFcdTZERjdcdTZEQzZcdTUzOEJcdTdGMjlcdUZGMENcdTVFNzZcdTc1MUZcdTYyMTAgc291cmNlbWFwIFx1NjU4N1x1NEVGNlx1MzAwMlxuICAgKiBAZGVmYXVsdCAncGFja2FnZSdcbiAgICovXG4gIG1vZGU/OiAncGFja2FnZScgfCAnZnVsbCcgfCAnZnVsbC1taW4nO1xuXG4gIC8qKlxuICAgKiBcdTY2MkZcdTU0MjZcdThCQjJcdTY3ODRcdTVFRkFcdTRFQTdcdTcyNjlcdTc2ODRcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdTU2REVcdTUxOTlcdTUyMzAgcGFja2FnZS5qc29uIFx1NzY4NCBleHBvcnRzIFx1NUI1N1x1NkJCNVx1NUJGOVx1NUU5NFx1NzY4NCBrZXkgXHU0RTJEXHUzMDAyXG4gICAqXG4gICAqIFx1NUZDNVx1OTg3Qlx1NTcyOCBtb2RlIFx1NEUzQSBwYWNrYWdlcyBcdTY1RjZcdTc1MUZcdTY1NDhcdTMwMDJcbiAgICpcbiAgICogXHU1RjUzXHU1M0Q2XHU1MDNDXHU0RTNBICcuJyBcdTY1RjZcdUZGMENcdThGRDhcdTRGMUFcdTU0MENcdTZCNjVcdTUxOTlcdTUxNjUgbWFpblx1MzAwMW1vZHVsZVx1MzAwMXR5cGVzIFx1NUI1N1x1NkJCNVxuICAgKi9cbiAgZXhwb3J0cz86IHN0cmluZztcblxuICAvKipcbiAgICogXHU2NjJGXHU1NDI2XHU1QzA2IGQudHMgXHU3QzdCXHU1NzhCXHU1OEYwXHU2NjBFXHU2NTg3XHU0RUY2XHU3Njg0XHU0RUE3XHU3MjY5XHU0RUNFXHU5NkM2XHU0RTJEXHU3NkVFXHU1RjU1XHU3OUZCXHU1MkE4XHU1MjMwXHU0RUE3XHU3MjY5XHU3NkVFXHU1RjU1XHVGRjBDXHU1RTc2XHU1QzA2XHU3QzdCXHU1NzhCXHU1MTY1XHU1M0UzXHU1NkRFXHU1MTk5XHU1MjMwIHBhY2thZ2UuanNvbiBcdTc2ODQgdHlwZXMgXHU1QjU3XHU2QkI1XHUzMDAyXG4gICAqXG4gICAqIFx1NUZDNVx1OTg3Qlx1NTcyOCBtb2RlIFx1NEUzQSBwYWNrYWdlcyBcdTY1RjZcdTc1MUZcdTY1NDhcdTMwMDJcbiAgICpcbiAgICogXHU4RjkzXHU1MTY1IHRzYyBcdTdGMTZcdThCRDFcdTc1MUZcdTYyMTAgZC50cyBcdTY1ODdcdTRFRjZcdTY1RjZcdTYyNDBcdThCRkJcdTUzRDZcdTc2ODQgdHNjb25maWcgXHU2NTg3XHU0RUY2XHU3Njg0XHU4REVGXHU1Rjg0XHUzMDAyXG4gICAqIEBkZWZhdWx0ICcnXG4gICAqL1xuICBkdHM/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFx1NUI4Q1x1NjIxMFx1Njc4NFx1NUVGQVx1NTQwRVx1RkYwQ1x1NTFDNlx1NTkwN1x1NTZERVx1NTE5OSBwYWNrYWdlLmpzb24gXHU2NTg3XHU0RUY2XHU1MjREXHU1QkY5XHU1MTc2XHU1QkY5XHU4QzYxXHU4RkRCXHU4ODRDXHU2NkY0XHU2NTM5XHU3Njg0XHU5NEE5XHU1QjUwXHUzMDAyXG4gICAqXG4gICAqIFx1NUZDNVx1OTg3Qlx1NTcyOCBtb2RlIFx1NEUzQSBwYWNrYWdlcyBcdTY1RjZcdTc1MUZcdTY1NDhcdTMwMDJcbiAgICovXG4gIG9uU2V0UGtnPzogKHBrZzogUGFja2FnZUpzb24sIG9wdGlvbnM6IFJlcXVpcmVkPEdlbmVyYXRlQ29uZmlnT3B0aW9ucz4pID0+IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xufVxuXG4vKiogXHU2Nzg0XHU1RUZBXHU5MDA5XHU5ODc5XHU5RUQ4XHU4QkE0XHU1MDNDICovXG5leHBvcnQgZnVuY3Rpb24gZGVmYXVsdE9wdGlvbnMoKTogUmVxdWlyZWQ8R2VuZXJhdGVDb25maWdPcHRpb25zPiB7XG4gIHJldHVybiB7XG4gICAgZW50cnk6ICdzcmMvaW5kZXgudHMnLFxuICAgIG91dERpcjogJ2Rpc3QnLFxuICAgIGZpbGVOYW1lOiAnJyxcbiAgICBtb2RlOiAncGFja2FnZScsXG4gICAgZXhwb3J0czogJy4nLFxuICAgIGR0czogJycsXG4gICAgb25TZXRQa2c6ICgpID0+IHt9LFxuICAgIHBsdWdpblZ1ZTogZmFsc2UsXG4gICAgcGx1Z2luSW5zcGVjdDogZmFsc2UsXG4gICAgcGx1Z2luVmlzdWFsaXplcjogZmFsc2UsXG4gICAgcGx1Z2luUmVwbGFjZTogZmFsc2UsXG4gIH07XG59XG5cbi8qKiBcdTg5RTNcdTY3OTBcdTY3ODRcdTVFRkFcdTkwMDlcdTk4NzkgKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRPcHRpb25zKG9wdGlvbnM/OiBHZW5lcmF0ZUNvbmZpZ09wdGlvbnMpOiBSZXF1aXJlZDxHZW5lcmF0ZUNvbmZpZ09wdGlvbnM+IHtcbiAgcmV0dXJuIHsgLi4uZGVmYXVsdE9wdGlvbnMoKSwgLi4ub3B0aW9ucyB9O1xufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvd3J5dGUvd29yay9uZXhmdXJvbWEtdWkvcGFja2FnZXMvYnVpbGQvc3JjL2dlbmVyYXRlQ29uZmlnXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvd3J5dGUvd29yay9uZXhmdXJvbWEtdWkvcGFja2FnZXMvYnVpbGQvc3JjL2dlbmVyYXRlQ29uZmlnL3BsdWdpbnMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3dyeXRlL3dvcmsvbmV4ZnVyb21hLXVpL3BhY2thZ2VzL2J1aWxkL3NyYy9nZW5lcmF0ZUNvbmZpZy9wbHVnaW5zLnRzXCI7aW1wb3J0IGluc3BlY3QsIHsgT3B0aW9ucyBhcyBJbnNwZWN0T3B0aW9ucyB9IGZyb20gJ3ZpdGUtcGx1Z2luLWluc3BlY3QnO1xuaW1wb3J0IHsgdmlzdWFsaXplciwgUGx1Z2luVmlzdWFsaXplck9wdGlvbnMgfSBmcm9tICdyb2xsdXAtcGx1Z2luLXZpc3VhbGl6ZXInO1xuaW1wb3J0IHZ1ZSwgeyBPcHRpb25zIGFzIFZ1ZU9wdGlvbnMgfSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnO1xuaW1wb3J0IHJlcGxhY2UsIHsgUm9sbHVwUmVwbGFjZU9wdGlvbnMgfSBmcm9tICdAcm9sbHVwL3BsdWdpbi1yZXBsYWNlJztcbmltcG9ydCB7IFBsdWdpbk9wdGlvbiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgUGFja2FnZUpzb24gfSBmcm9tICd0eXBlLWZlc3QnO1xuaW1wb3J0IHsgaXNPYmplY3RMaWtlIH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHR5cGUgeyBHZW5lcmF0ZUNvbmZpZ09wdGlvbnMgfSBmcm9tICcuL29wdGlvbnMnO1xuaW1wb3J0IHsgcGx1Z2luU2V0UGFja2FnZUpzb24gfSBmcm9tICcuL3BsdWdpblNldFBhY2thZ2VKc29uJztcbmltcG9ydCB7IHBsdWdpbk1vdmVEdHMgfSBmcm9tICcuL3BsdWdpbk1vdmVEdHMnO1xuXG4vKiogXHU5ODg0XHU4QkJFXHU2M0QyXHU0RUY2XHU3NkY4XHU1MTczXHU5MTREXHU3RjZFXHU5MDA5XHU5ODc5ICovXG5leHBvcnQgaW50ZXJmYWNlIEdlbmVyYXRlQ29uZmlnUGx1Z2luc09wdGlvbnMge1xuICAvKipcbiAgICogXHU2NjJGXHU1NDI2XHU1NDJGXHU3NTI4IEB2aXRlanMvcGx1Z2luLXZ1ZSBcdThGREJcdTg4NEMgdnVlIFx1NkEyMVx1Njc3Rlx1ODlFM1x1Njc5MFx1MzAwMlx1OTE0RFx1N0Y2RVx1ODlDNFx1NTIxOVx1NTk4Mlx1NEUwQlx1RkYwQ1x1NUJGOVx1NEU4RVx1NTE3Nlx1NEVENlx1NjNEMlx1NEVGNlx1NEU1Rlx1OTAwMlx1NzUyOFx1MzAwMlxuICAgKiAtIGZhbHNlIC8gdW5kZWZpbmVkIFx1NEUwRFx1NTQyRlx1NzUyOFx1OEJFNVx1NjNEMlx1NEVGNlxuICAgKiAtIHRydWUgXHU1NDJGXHU3NTI4XHU4QkU1XHU2M0QyXHU0RUY2XHVGRjBDXHU5MUM3XHU3NTI4XHU5RUQ4XHU4QkE0XHU5MTREXHU3RjZFXG4gICAqIC0gT3B0aW9ucyBcdTU0MkZcdTc1MjhcdThCRTVcdTYzRDJcdTRFRjZcdUZGMENcdTVFOTRcdTc1MjhcdTUxNzdcdTRGNTNcdTkxNERcdTdGNkVcbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIHBsdWdpblZ1ZT86IGJvb2xlYW4gfCBWdWVPcHRpb25zO1xuXG4gIC8qKlxuICAgKiBcdTY2MkZcdTU0MjZcdTU0MkZcdTc1Mjggdml0ZS1wbHVnaW4taW5zcGVjdCBcdThGREJcdTg4NENcdTRFQTdcdTcyNjlcdTUyMDZcdTY3OTBcdTMwMDJcbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIHBsdWdpbkluc3BlY3Q/OiBib29sZWFuIHwgSW5zcGVjdE9wdGlvbnM7XG5cbiAgLyoqXG4gICAqIFx1NjYyRlx1NTQyNlx1NTQyRlx1NzUyOCByb2xsdXAtcGx1Z2luLXZpc3VhbGl6ZXIgXHU4RkRCXHU4ODRDXHU0RUE3XHU3MjY5XHU1MjA2XHU2NzkwXHUzMDAyXG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBwbHVnaW5WaXN1YWxpemVyPzogYm9vbGVhbiB8IFBsdWdpblZpc3VhbGl6ZXJPcHRpb25zO1xuXG4gIC8qKlxuICAgKiBcdTY2MkZcdTU0MjZcdTU0MkZcdTc1MjggQHJvbGx1cC9wbHVnaW4tcmVwbGFjZSBcdThGREJcdTg4NENcdTRFQTdcdTcyNjlcdTUxODVcdTVCQjlcdTY2RkZcdTYzNjJcdTMwMDJcbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIHBsdWdpblJlcGxhY2U/OiBib29sZWFuIHwgUm9sbHVwUmVwbGFjZU9wdGlvbnM7XG59XG5cbi8qKlxuICogXHU4M0I3XHU1M0Q2XHU1QjhDXHU2NTc0XHU3Njg0XHU2M0QyXHU0RUY2XHU5MTREXHU3RjZFXG4gKiBAcGFyYW0gcGFja2FnZUpzb24gcGFja2FnZS5qc29uIFx1NjU4N1x1NEVGNlx1NTE4NVx1NUJCOVxuICogQHBhcmFtIG9wdGlvbnMgXHU2Nzg0XHU1RUZBXHU5MDA5XHU5ODc5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRQbHVnaW5zKHBhY2thZ2VKc29uOiBQYWNrYWdlSnNvbiA9IHt9LCBvcHRpb25zOiBHZW5lcmF0ZUNvbmZpZ09wdGlvbnMgPSB7fSkge1xuICBjb25zdCB7IG1vZGUsIGR0cyB9ID0gb3B0aW9ucztcbiAgY29uc3QgcmVzdWx0ID0gZ2V0UHJlc2V0UGx1Z2lucyhvcHRpb25zKTtcblxuICBpZiAobW9kZSA9PT0gJ3BhY2thZ2UnKSB7XG4gICAgLy8gXHU1RTM4XHU4OUM0XHU2Nzg0XHU1RUZBXHU3Njg0XHU2MEM1XHU1MUI1XHU0RTBCXHVGRjBDXHU5NkM2XHU2MjEwXHU4MUVBXHU1QjlBXHU0RTQ5XHU2M0QyXHU0RUY2XHVGRjBDXHU1NkRFXHU1MTk5IHBhY2thZ2UuanNvbiBcdTc2ODRcdTUxNjVcdTUzRTNcdTVCNTdcdTZCQjVcbiAgICByZXN1bHQucHVzaChwbHVnaW5TZXRQYWNrYWdlSnNvbihwYWNrYWdlSnNvbiwgb3B0aW9ucykpO1xuXG4gICAgaWYgKGR0cykge1xuICAgICAgLy8gXHU1RTM4XHU4OUM0XHU2Nzg0XHU1RUZBXHU3Njg0XHU2MEM1XHU1MUI1XHU0RTBCXHVGRjBDXHU5NkM2XHU2MjEwXHU4MUVBXHU1QjlBXHU0RTQ5XHU2M0QyXHU0RUY2XHVGRjBDXHU3OUZCXHU1MkE4IGQudHMgXHU0RUE3XHU3MjY5XG4gICAgICByZXN1bHQucHVzaChwbHVnaW5Nb3ZlRHRzKG9wdGlvbnMpKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuLyoqXG4gKiBcdTgzQjdcdTUzRDZcdTk4ODRcdThCQkVcdTYzRDJcdTRFRjZcdTkxNERcdTdGNkVcbiAqIEBwYXJhbSBvcHRpb25zIFx1OTg4NFx1OEJCRVx1NjNEMlx1NEVGNlx1NzZGOFx1NTE3M1x1OTE0RFx1N0Y2RVx1OTAwOVx1OTg3OVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJlc2V0UGx1Z2lucyhvcHRpb25zOiBHZW5lcmF0ZUNvbmZpZ1BsdWdpbnNPcHRpb25zID0ge30pIHtcbiAgY29uc3QgcmVzdWx0OiBQbHVnaW5PcHRpb25bXSA9IFtdO1xuXG4gIHJlc3VsdC5wdXNoKFxuICAgIGdldFByZXNldFBsdWdpbihvcHRpb25zLCAncGx1Z2luVnVlJywgdnVlKSxcbiAgICBnZXRQcmVzZXRQbHVnaW4ob3B0aW9ucywgJ3BsdWdpbkluc3BlY3QnLCBpbnNwZWN0KSxcbiAgICBnZXRQcmVzZXRQbHVnaW4ob3B0aW9ucywgJ3BsdWdpblZpc3VhbGl6ZXInLCB2aXN1YWxpemVyKSxcbiAgICBnZXRQcmVzZXRQbHVnaW4ob3B0aW9ucywgJ3BsdWdpblJlcGxhY2UnLCByZXBsYWNlKSxcbiAgKTtcblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFx1NTkwNFx1NzQwNlx1NTM1NVx1NEUyQVx1OTg4NFx1OEJCRVx1NjNEMlx1NEVGNlxuICogQHBhcmFtIG9wdGlvbnMgXHU5ODg0XHU4QkJFXHU2M0QyXHU0RUY2XHU3NkY4XHU1MTczXHU5MTREXHU3RjZFXHU5MDA5XHU5ODc5XG4gKiBAcGFyYW0ga2V5IFx1NzZFRVx1NjgwN1x1OTAwOVx1OTg3OVx1NTQwRFx1NzlGMFxuICogQHBhcmFtIHBsdWdpbiBcdTVCRjlcdTVFOTRcdTc2ODRcdTYzRDJcdTRFRjZcdTUxRkRcdTY1NzBcbiAqIEBwYXJhbSBkZWZhdWx0T3B0aW9ucyBcdTYzRDJcdTRFRjZcdTlFRDhcdThCQTRcdTkwMDlcdTk4NzlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFByZXNldFBsdWdpbjxLIGV4dGVuZHMga2V5b2YgR2VuZXJhdGVDb25maWdQbHVnaW5zT3B0aW9ucz4oXG4gIG9wdGlvbnM6IEdlbmVyYXRlQ29uZmlnUGx1Z2luc09wdGlvbnMsXG4gIGtleTogSyxcbiAgcGx1Z2luOiAoLi4uYXJnczogYW55W10pID0+IFBsdWdpbk9wdGlvbixcbiAgZGVmYXVsdE9wdGlvbnM/OiBHZW5lcmF0ZUNvbmZpZ1BsdWdpbnNPcHRpb25zW0tdLFxuKSB7XG4gIGNvbnN0IHZhbHVlID0gb3B0aW9uc1trZXldO1xuICBpZiAoIXZhbHVlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4gcGx1Z2luKGlzT2JqZWN0TGlrZSh2YWx1ZSkgPyB2YWx1ZSA6IGRlZmF1bHRPcHRpb25zKTtcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3dyeXRlL3dvcmsvbmV4ZnVyb21hLXVpL3BhY2thZ2VzL2J1aWxkL3NyYy9nZW5lcmF0ZUNvbmZpZ1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3dyeXRlL3dvcmsvbmV4ZnVyb21hLXVpL3BhY2thZ2VzL2J1aWxkL3NyYy9nZW5lcmF0ZUNvbmZpZy9wbHVnaW5TZXRQYWNrYWdlSnNvbi50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvd3J5dGUvd29yay9uZXhmdXJvbWEtdWkvcGFja2FnZXMvYnVpbGQvc3JjL2dlbmVyYXRlQ29uZmlnL3BsdWdpblNldFBhY2thZ2VKc29uLnRzXCI7aW1wb3J0IHsgUGx1Z2luT3B0aW9uIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyBQYWNrYWdlSnNvbiB9IGZyb20gJ3R5cGUtZmVzdCc7XG5pbXBvcnQgeyBiYXNlbmFtZSB9IGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQge1xuICBpc0Z1bmN0aW9uLCBpc09iamVjdExpa2UsIGFic0N3ZCwgcmVsQ3dkLCBrZWJhYkNhc2UsIHdyaXRlSnNvbkZpbGUsXG59IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB7IGdldE91dEZpbGVOYW1lLCByZXNvbHZlRW50cnkgfSBmcm9tICcuL2xpYic7XG5pbXBvcnQgeyBnZXRPcHRpb25zLCBHZW5lcmF0ZUNvbmZpZ09wdGlvbnMgfSBmcm9tICcuL29wdGlvbnMnO1xuXG4vKipcbiAqIFx1ODFFQVx1NUI5QVx1NEU0OVx1NjNEMlx1NEVGNlx1RkYwQ1x1NUI5RVx1NzNCMFx1NUJGOSBwYWNrYWdlLmpzb24gXHU1MTg1XHU1QkI5XHU3Njg0XHU0RkVFXHU2NTM5XHU0RTBFXHU1NkRFXHU1MTk5XHUzMDAyXG4gKiBAcGFyYW0gcGFja2FnZUpzb24gcGFja2FnZS5qc29uIFx1NjU4N1x1NEVGNlx1NTE4NVx1NUJCOVxuICogQHBhcmFtIG9wdGlvbnMgXHU2Nzg0XHU1RUZBXHU5MDA5XHU5ODc5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwbHVnaW5TZXRQYWNrYWdlSnNvbihcbiAgcGFja2FnZUpzb246IFBhY2thZ2VKc29uID0ge30sXG4gIG9wdGlvbnM6IEdlbmVyYXRlQ29uZmlnT3B0aW9ucyA9IHt9LFxuKTogUGx1Z2luT3B0aW9uIHtcbiAgY29uc3QgZmluYWxPcHRpb25zID0gZ2V0T3B0aW9ucyhvcHRpb25zKTtcbiAgY29uc3Qge1xuICAgIG9uU2V0UGtnLCBtb2RlLCBmaWxlTmFtZSwgb3V0RGlyLCBleHBvcnRzLFxuICB9ID0gZmluYWxPcHRpb25zO1xuXG4gIGlmIChtb2RlICE9PSAncGFja2FnZScpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IGZpbmFsTmFtZSA9IGZpbGVOYW1lIHx8IGtlYmFiQ2FzZShwYWNrYWdlSnNvbi5uYW1lIHx8ICcnKTtcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdzZXQtcGFja2FnZS1qc29uJyxcbiAgICAvLyBcdTUzRUFcdTU3MjhcdTY3ODRcdTVFRkFcdTZBMjFcdTVGMEZcdTRFMEJcdTYyNjdcdTg4NENcbiAgICBhcHBseTogJ2J1aWxkJyxcbiAgICBhc3luYyBjbG9zZUJ1bmRsZSgpIHtcbiAgICAgIGNvbnN0IHBhY2thZ2VKc29uT2JqID0gcGFja2FnZUpzb24gfHwge307XG5cbiAgICAgIC8vIFx1NUMwNiB0eXBlcyBtYWluIG1vZHVsZSBleHBvcnRzIFx1NEVBN1x1NzI2OVx1OERFRlx1NUY4NFx1NTE5OVx1NTE2NSBwYWNrYWdlLmpzb25cbiAgICAgIGNvbnN0IGV4cG9ydHNEYXRhOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge307XG5cbiAgICAgIC8vIFx1ODNCN1x1NTNENlx1NUU3Nlx1OEJCRVx1N0Y2RXVtZFx1NEVBN1x1NzI2OVx1NzY4NFx1OERFRlx1NUY4NFxuICAgICAgY29uc3QgdW1kID0gcmVsQ3dkKGFic0N3ZChvdXREaXIsIGdldE91dEZpbGVOYW1lKGZpbmFsTmFtZSwgJ3VtZCcsIG1vZGUpKSwgZmFsc2UpO1xuICAgICAgZXhwb3J0c0RhdGEucmVxdWlyZSA9IHVtZDtcbiAgICAgIGlmIChleHBvcnRzID09PSAnLicpIHtcbiAgICAgICAgcGFja2FnZUpzb25PYmoubWFpbiA9IHVtZDtcbiAgICAgIH1cblxuICAgICAgLy8gXHU4M0I3XHU1M0Q2XHU1RTc2XHU4QkJFXHU3RjZFZXNcdTRFQTdcdTcyNjlcdTc2ODRcdThERUZcdTVGODRcbiAgICAgIGNvbnN0IGVzID0gcmVsQ3dkKGFic0N3ZChvdXREaXIsIGdldE91dEZpbGVOYW1lKGZpbmFsTmFtZSwgJ2VzJywgbW9kZSkpLCBmYWxzZSk7XG4gICAgICBleHBvcnRzRGF0YS5pbXBvcnQgPSBlcztcbiAgICAgIGlmIChleHBvcnRzID09PSAnLicpIHtcbiAgICAgICAgcGFja2FnZUpzb25PYmoubW9kdWxlID0gZXM7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1ODNCN1x1NTNENlx1NUU3Nlx1OEJCRVx1N0Y2RWQudHNcdTRFQTdcdTcyNjlcdTc2ODRcdThERUZcdTVGODRcbiAgICAgIGNvbnN0IGR0c0VudHJ5ID0gZ2V0RHRzUGF0aChvcHRpb25zKTtcbiAgICAgIGV4cG9ydHNEYXRhLnR5cGVzID0gZHRzRW50cnk7XG4gICAgICBpZiAoZXhwb3J0cyA9PT0gJy4nKSB7XG4gICAgICAgIHBhY2thZ2VKc29uT2JqLnR5cGVzID0gZHRzRW50cnk7XG4gICAgICB9XG5cbiAgICAgIGlmICghaXNPYmplY3RMaWtlKHBhY2thZ2VKc29uT2JqLmV4cG9ydHMpKSB7XG4gICAgICAgIHBhY2thZ2VKc29uT2JqLmV4cG9ydHMgPSB7fTtcbiAgICAgIH1cbiAgICAgIE9iamVjdC5hc3NpZ24ocGFja2FnZUpzb25PYmouZXhwb3J0cywge1xuICAgICAgICBbZXhwb3J0c106IGV4cG9ydHNEYXRhLFxuICAgICAgICAvLyBcdTlFRDhcdThCQTRcdTY2QjRcdTk3MzJcdTc2ODRcdTUxRkFcdTUzRTNcbiAgICAgICAgJy4vKic6ICcuLyonLFxuICAgICAgfSk7XG5cbiAgICAgIC8vIFx1NjUyRlx1NjMwMVx1NTcyOFx1Njc4NFx1NUVGQVx1OTAwOVx1OTg3OVx1NEUyRFx1NzY4NCBvblNldFBrZyBcdTk0QTlcdTVCNTBcdTRFMkRcdTVCRjkgcGFja2FnZS5qc29uIFx1NUJGOVx1OEM2MVx1OEZEQlx1ODg0Q1x1OEZEQlx1NEUwMFx1NkI2NVx1NEZFRVx1NjUzOVxuICAgICAgaWYgKGlzRnVuY3Rpb24ob25TZXRQa2cpKSB7XG4gICAgICAgIGF3YWl0IG9uU2V0UGtnKHBhY2thZ2VKc29uT2JqLCBmaW5hbE9wdGlvbnMpO1xuICAgICAgfVxuXG4gICAgICAvLyBcdTU2REVcdTUxOTlcdTUxNjVwYWNrYWdlLmpzb25cdTY1ODdcdTRFRjZcbiAgICAgIGF3YWl0IHdyaXRlSnNvbkZpbGUoYWJzQ3dkKCdwYWNrYWdlLmpzb24nKSwgcGFja2FnZUpzb25PYmosIG51bGwsIDIpO1xuICAgIH0sXG4gIH07XG59XG5cbi8qKlxuICogXHU2ODM5XHU2MzZFXHU2RTkwXHU3ODAxXHU1MTY1XHU1M0UzXHU1NDhDXHU0RUE3XHU3MjY5XHU3NkVFXHU1RjU1XHVGRjBDXHU4QkExXHU3Qjk3XHU1MUZBZC50c1x1N0M3Qlx1NTc4Qlx1NThGMFx1NjYwRVx1NzY4NFx1NTE2NVx1NTNFM1x1NzY4NFx1NzZGOFx1NUJGOVx1NTczMFx1NTc0MFxuICovXG5mdW5jdGlvbiBnZXREdHNQYXRoKG9wdGlvbnM6IEdlbmVyYXRlQ29uZmlnT3B0aW9ucyA9IHt9KSB7XG4gIGNvbnN0IHsgZW50cnksIG91dERpciB9ID0gZ2V0T3B0aW9ucyhvcHRpb25zKTtcblxuICBjb25zdCB7IHJlbCwgaXNGaWxlIH0gPSByZXNvbHZlRW50cnkoZW50cnkpO1xuXG4gIC8qKiBcdTUxNjVcdTUzRTNcdTY1ODdcdTRFRjZkLnRzXHU0RUE3XHU3MjY5XHU1NDBEXHU3OUYwICovXG4gIGNvbnN0IGVudHJ5RmlsZU5hbWUgPSBpc0ZpbGUgPyBiYXNlbmFtZShlbnRyeSkucmVwbGFjZSgvXFwuLiokLywgJy5kLnRzJykgOiAnaW5kZXguZC50cyc7XG5cbiAgcmV0dXJuIHJlbEN3ZChhYnNDd2Qob3V0RGlyLCByZWwsIGVudHJ5RmlsZU5hbWUpLCBmYWxzZSk7XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy93cnl0ZS93b3JrL25leGZ1cm9tYS11aS9wYWNrYWdlcy9idWlsZC9zcmMvZ2VuZXJhdGVDb25maWdcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy93cnl0ZS93b3JrL25leGZ1cm9tYS11aS9wYWNrYWdlcy9idWlsZC9zcmMvZ2VuZXJhdGVDb25maWcvbGliLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy93cnl0ZS93b3JrL25leGZ1cm9tYS11aS9wYWNrYWdlcy9idWlsZC9zcmMvZ2VuZXJhdGVDb25maWcvbGliLnRzXCI7aW1wb3J0IHsgUGFja2FnZUpzb24gfSBmcm9tICd0eXBlLWZlc3QnO1xuaW1wb3J0IHsgTGlicmFyeU9wdGlvbnMsIExpYnJhcnlGb3JtYXRzLCBCdWlsZE9wdGlvbnMgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IHN0YXRTeW5jIH0gZnJvbSAnbm9kZTpmcyc7XG5pbXBvcnQgeyBqb2luIH0gZnJvbSAnbm9kZTpwYXRoJztcbmltcG9ydCB7XG4gIGtlYmFiQ2FzZSwgY2FtZWxDYXNlLCBhYnNDd2QsIHJlbEN3ZCxcbn0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHsgZ2V0T3B0aW9ucywgR2VuZXJhdGVDb25maWdPcHRpb25zIH0gZnJvbSAnLi9vcHRpb25zJztcblxuLyoqXG4gKiBcdTgzQjdcdTUzRDYgYnVpbGQubGliIFx1NEVBN1x1NzI2OVx1NzZGOFx1NTE3M1x1OTE0RFx1N0Y2RVxuICogQHBhcmFtIHBhY2thZ2VKc29uIHBhY2thZ2UuanNvbiBcdTY1ODdcdTRFRjZcdTUxODVcdTVCQjlcbiAqIEBwYXJhbSBvcHRpb25zIFx1Njc4NFx1NUVGQVx1OTAwOVx1OTg3OVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TGliKFxuICBwYWNrYWdlSnNvbjogUGFja2FnZUpzb24gPSB7fSxcbiAgb3B0aW9uczogR2VuZXJhdGVDb25maWdPcHRpb25zID0ge30sXG4pOiBQaWNrPEJ1aWxkT3B0aW9ucywgJ2xpYicgfCAnbWluaWZ5JyB8ICdzb3VyY2VtYXAnIHwgJ291dERpcicgfCAnZW1wdHlPdXREaXInPiB7XG4gIGNvbnN0IHtcbiAgICBlbnRyeSwgb3V0RGlyLCBtb2RlLCBmaWxlTmFtZSxcbiAgfSA9IGdldE9wdGlvbnMob3B0aW9ucyk7XG5cbiAgLy8gXHU2NTg3XHU0RUY2XHU1NDBEXHU3OUYwXHVGRjBDXHU5RUQ4XHU4QkE0XHU1M0Q2IHBhY2thZ2UuanNvbiBcdTc2ODQgbmFtZSBcdTVCNTdcdTZCQjVcdThGNkNcdTYzNjJcdTYyMTAga2ViYWItY2FzZVx1RkYxQUBvcGVueHVpL2J1aWxkID0+IG9wZW54dWktYnVpbGRcbiAgY29uc3QgZmluYWxOYW1lID0gZmlsZU5hbWUgfHwga2ViYWJDYXNlKHBhY2thZ2VKc29uLm5hbWUgfHwgJycpO1xuXG4gIGNvbnN0IGxpYk9wdGlvbnM6IExpYnJhcnlPcHRpb25zID0ge1xuICAgIGVudHJ5LFxuICAgIGZvcm1hdHM6IFsnZXMnLCAndW1kJ10sXG4gICAgbmFtZTogY2FtZWxDYXNlKGZpbmFsTmFtZSksXG4gICAgZmlsZU5hbWU6IChmb3JtYXQpID0+IHtcbiAgICAgIGNvbnN0IGZvcm1hdE5hbWUgPSBmb3JtYXQgYXMgTGlicmFyeUZvcm1hdHM7XG4gICAgICByZXR1cm4gZ2V0T3V0RmlsZU5hbWUoZmluYWxOYW1lLCBmb3JtYXROYW1lLCBtb2RlKTtcbiAgICB9LFxuICB9O1xuXG4gIHJldHVybiB7XG4gICAgbGliOiBsaWJPcHRpb25zLFxuICAgIC8vIGZ1bGwtbWluIFx1NkEyMVx1NUYwRlx1NEUwQlx1NTE2OFx1OTFDRlx1Njc4NFx1NUVGQVx1RkYwQ1x1OTcwMFx1ODk4MVx1NkRGN1x1NkRDNlx1NEVFM1x1NzgwMVx1RkYwQ1x1NzUxRlx1NjIxMCBzb3VyY2VtYXAgXHU2NTg3XHU0RUY2XHVGRjBDXHU0RTE0XHU0RTBEXHU2RTA1XHU3QTdBXHU0RUE3XHU3MjY5XHU3NkVFXHU1RjU1XG4gICAgbWluaWZ5OiBtb2RlID09PSAnZnVsbC1taW4nID8gJ2VzYnVpbGQnIDogZmFsc2UsXG4gICAgc291cmNlbWFwOiBtb2RlID09PSAnZnVsbC1taW4nLFxuICAgIGVtcHR5T3V0RGlyOiBtb2RlID09PSAncGFja2FnZScsXG4gICAgb3V0RGlyLFxuICB9O1xufVxuXG4vKipcbiAqIFx1ODNCN1x1NTNENlx1NEVBN1x1NzI2OVx1NjU4N1x1NEVGNlx1NTQwRFx1NzlGMFxuICogQHBhcmFtIGZpbGVOYW1lIFx1NjU4N1x1NEVGNlx1NTQwRFx1NzlGMFxuICogQHBhcmFtIGZvcm1hdCBcdTRFQTdcdTcyNjlcdTY4M0NcdTVGMEZcbiAqIEBwYXJhbSBidWlsZE1vZGUgXHU2Nzg0XHU1RUZBXHU2QTIxXHU1RjBGXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRPdXRGaWxlTmFtZShcbiAgZmlsZU5hbWU6IHN0cmluZyxcbiAgZm9ybWF0OiBMaWJyYXJ5Rm9ybWF0cyxcbiAgYnVpbGRNb2RlOiBHZW5lcmF0ZUNvbmZpZ09wdGlvbnNbJ21vZGUnXSA9ICdwYWNrYWdlJyxcbikge1xuICBjb25zdCBmb3JtYXROYW1lID0gZm9ybWF0IGFzICgnZXMnIHwgJ3VtZCcpO1xuICBjb25zdCBleHQgPSBmb3JtYXROYW1lID09PSAnZXMnID8gJy5tanMnIDogJy51bWQuanMnO1xuICBsZXQgdGFpbCA9ICcnO1xuICAvLyBcdTUxNjhcdTkxQ0ZcdTY3ODRcdTVFRkFcdTY1RjZcdUZGMENcdTY1ODdcdTRFRjZcdTU0MERcdTU0MEVcdTdGMDBcdTc2ODRcdTUzM0FcdTUyMkJcbiAgaWYgKGJ1aWxkTW9kZSA9PT0gJ2Z1bGwnKSB7XG4gICAgdGFpbCArPSAnLmZ1bGwnO1xuICB9IGVsc2UgaWYgKGJ1aWxkTW9kZSA9PT0gJ2Z1bGwtbWluJykge1xuICAgIHRhaWwgKz0gJy5mdWxsLm1pbic7XG4gIH1cbiAgdGFpbCArPSBleHQ7XG4gIHJldHVybiBgJHtmaWxlTmFtZX0ke3RhaWx9YDtcbn1cblxuaW50ZXJmYWNlIEVudHJ5SW5mbyB7XG4gIC8qKiBcdTVCNTBcdTUzMDVcdTZFOTBcdTc4MDFcdTUxNjVcdTUzRTNcdTY1ODdcdTRFRjZcdTc2ODRcdTdFRERcdTVCRjlcdThERUZcdTVGODQgKi9cbiAgYWJzOiBzdHJpbmc7XG5cbiAgLyoqIFx1NUI1MFx1NTMwNVx1NkU5MFx1NzgwMVx1NTE2NVx1NTNFM1x1NjU4N1x1NEVGNlx1NzZGOFx1NUJGOVx1NEU4RVx1ODExQVx1NjcyQ1x1NjI2N1x1ODg0Q1x1NEY0RFx1N0Y2RVx1NzY4NFx1OERFRlx1NUY4NCAqL1xuICByZWw6IHN0cmluZztcblxuICAvKiogXHU1QjUwXHU1MzA1XHU2RTkwXHU3ODAxXHU2NjJGXHU0RTBEXHU2NjJGXHU2NTg3XHU0RUY2ICovXG4gIGlzRmlsZTogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBcdTg5RTNcdTY3OTBcdTVCNTBcdTUzMDVcdTZFOTBcdTc4MDFcdTUxNjVcdTUzRTNcbiAqIEBwYXJhbSBlbnRyeSBcdTZFOTBcdTc4MDFcdTUxNjVcdTUzRTNcdThERUZcdTVGODRcbiAqIEByZXR1cm5zIFx1NUI1MFx1NTMwNVx1NkU5MFx1NzgwMVx1NTE2NVx1NTNFM1x1NEZFMVx1NjA2Rlx1RkYwQ1x1ODlFM1x1Njc5MFx1N0VEM1x1Njc5Q1xuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZUVudHJ5KGVudHJ5OiBzdHJpbmcpOiBFbnRyeUluZm8ge1xuICAvKiogXHU1MTY1XHU1M0UzXHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0ICovXG4gIGNvbnN0IGFic0VudHJ5ID0gYWJzQ3dkKGVudHJ5KTtcblxuICAvKiogXHU1MTY1XHU1M0UzXHU2NjJGXHU1NDI2XHU0RTNBXHU2NTg3XHU0RUY2ICovXG4gIGNvbnN0IGlzRW50cnlGaWxlID0gc3RhdFN5bmMoYWJzRW50cnkpLmlzRmlsZSgpO1xuXG4gIC8qKiBcdTUxNjVcdTUzRTNcdTY1ODdcdTRFRjZcdTU5MzlcdTdFRERcdTVCRjlcdThERUZcdTVGODQgKi9cbiAgY29uc3QgYWJzRW50cnlGb2xkZXIgPSBpc0VudHJ5RmlsZSA/IGpvaW4oYWJzRW50cnksICcuLicpIDogYWJzRW50cnk7XG5cbiAgcmV0dXJuIHtcbiAgICBhYnM6IGFic0VudHJ5LFxuICAgIHJlbDogcmVsQ3dkKGFic0VudHJ5Rm9sZGVyKSxcbiAgICBpc0ZpbGU6IGlzRW50cnlGaWxlLFxuICB9O1xufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvd3J5dGUvd29yay9uZXhmdXJvbWEtdWkvcGFja2FnZXMvYnVpbGQvc3JjL2dlbmVyYXRlQ29uZmlnXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvd3J5dGUvd29yay9uZXhmdXJvbWEtdWkvcGFja2FnZXMvYnVpbGQvc3JjL2dlbmVyYXRlQ29uZmlnL3BsdWdpbk1vdmVEdHMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3dyeXRlL3dvcmsvbmV4ZnVyb21hLXVpL3BhY2thZ2VzL2J1aWxkL3NyYy9nZW5lcmF0ZUNvbmZpZy9wbHVnaW5Nb3ZlRHRzLnRzXCI7aW1wb3J0IHsgUGx1Z2luT3B0aW9uIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyBnZXRQYXJzZWRDb21tYW5kTGluZU9mQ29uZmlnRmlsZSwgc3lzIH0gZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQgeyBjcCB9IGZyb20gJ25vZGU6ZnMvcHJvbWlzZXMnO1xuaW1wb3J0IHsgZ2V0T3B0aW9ucywgR2VuZXJhdGVDb25maWdPcHRpb25zIH0gZnJvbSAnLi9vcHRpb25zJztcbmltcG9ydCB7IGFic0N3ZCwgdXNlUGF0aEFicywgdXNlUGF0aFJlbCB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB7IHJlc29sdmVFbnRyeSB9IGZyb20gJy4vbGliJztcblxuLyoqXG4gKiBcdTgxRUFcdTVCOUFcdTRFNDlcdTYzRDJcdTRFRjZcdUZGMENcdTVDMDYgZC50cyBcdTRFQTdcdTcyNjlcdTRFQ0VcdTk2QzZcdTRFMkRcdTc2RUVcdTVGNTVcdTc5RkJcdTUyQThcdTUyMzBcdTVCNTBcdTUzMDVcdTc2ODRcdTRFQTdcdTcyNjlcdTc2RUVcdTVGNTVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBsdWdpbk1vdmVEdHMob3B0aW9uczogR2VuZXJhdGVDb25maWdPcHRpb25zID0ge30pOiBQbHVnaW5PcHRpb24ge1xuICBjb25zdCB7XG4gICAgZW50cnksIG91dERpciwgbW9kZSwgZHRzLFxuICB9ID0gZ2V0T3B0aW9ucyhvcHRpb25zKTtcblxuICBpZiAobW9kZSAhPT0gJ3BhY2thZ2UnIHx8ICFkdHMpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIFx1ODlFM1x1Njc5MFx1NzUyOFx1NEU4RVx1NzUxRlx1NjIxMCBkLnRzIFx1NjAzQlx1NEY1M1x1NEVBN1x1NzI2OVx1NzY4NCB0c2NvbmZpZyBcdTY1ODdcdTRFRjZcdUZGMENcdTVFNzZcdTgzQjdcdTUzRDZcdTg5RTNcdTY3OTBcdTU0MEVcdTc2ODRcdTkxNERcdTdGNkVcbiAgY29uc3QgdHNjb25maWdzID0gZ2V0UGFyc2VkQ29tbWFuZExpbmVPZkNvbmZpZ0ZpbGUoZHRzLCB7fSwgc3lzIGFzIGFueSk7XG5cbiAgaWYgKCF0c2NvbmZpZ3MpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCBmaW5kIHRzY29uZmlnIGZpbGU6ICR7ZHRzfWApO1xuICB9XG5cbiAgLy8gXHU4OUUzXHU2NzkwXHU1MUZBXHU2NzY1XHU3Njg0XHU4REVGXHU1Rjg0XHU5MEZEXHU2NjJGXHU3RUREXHU1QkY5XHU4REVGXHU1Rjg0XG4gIGNvbnN0IHsgcm9vdERpciwgb3V0RGlyOiB0c091dERpciB9ID0gdHNjb25maWdzLm9wdGlvbnM7XG5cbiAgaWYgKCFyb290RGlyIHx8ICF0c091dERpcikge1xuICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IGZpbmQgcm9vdERpciBvciBvdXREaXIgaW4gdHNjb25maWcgZmlsZTogJHtkdHN9YCk7XG4gIH1cblxuICBjb25zdCByZWxSb290ID0gdXNlUGF0aFJlbChyb290RGlyKTtcbiAgY29uc3QgYWJzUm9vdCA9IHVzZVBhdGhBYnMocm9vdERpcik7XG5cbiAgLyoqIFx1NUY1M1x1NTI0RFx1NTMwNVx1NzZGOFx1NUJGOVx1NEU4RVx1NjgzOVx1NzZFRVx1NUY1NVx1NzY4NFx1OERFRlx1NUY4NCAqL1xuICBjb25zdCByZWxQYWNrYWdlUGF0aCA9IHJlbFJvb3QocHJvY2Vzcy5jd2QoKSk7XG5cbiAgLy8gXHU2RTkwXHU3ODAxXHU1MTY1XHU1M0UzXHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XG4gIGNvbnN0IHsgcmVsOiByZWxFbnRyeVBhdGggfSA9IHJlc29sdmVFbnRyeShlbnRyeSk7XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnbW92ZS1kdHMnLFxuICAgIGFwcGx5OiAnYnVpbGQnLFxuICAgIGFzeW5jIGNsb3NlQnVuZGxlKCkge1xuICAgICAgY29uc3Qgc291cmNlID0gYWJzUm9vdCh0c091dERpciwgcmVsUGFja2FnZVBhdGgsIHJlbEVudHJ5UGF0aCk7XG4gICAgICBjb25zdCB0YXJnZXQgPSBhYnNDd2Qob3V0RGlyLCByZWxFbnRyeVBhdGgpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gXHU3OUZCXHU1MkE4XHU0RUE3XHU3MjY5XG4gICAgICAgIGF3YWl0IGNwKHNvdXJjZSwgdGFyZ2V0LCB7XG4gICAgICAgICAgZm9yY2U6IHRydWUsXG4gICAgICAgICAgcmVjdXJzaXZlOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICBjb25zb2xlLmxvZyhgWyR7cmVsUGFja2FnZVBhdGh9XTogZmFpbGVkIHRvIG1vdmUgZHRzIWApO1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICB9XG4gICAgfSxcbiAgfTtcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3dyeXRlL3dvcmsvbmV4ZnVyb21hLXVpL3BhY2thZ2VzL2J1aWxkL3NyYy9nZW5lcmF0ZUNvbmZpZ1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3dyeXRlL3dvcmsvbmV4ZnVyb21hLXVpL3BhY2thZ2VzL2J1aWxkL3NyYy9nZW5lcmF0ZUNvbmZpZy9leHRlcm5hbC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvd3J5dGUvd29yay9uZXhmdXJvbWEtdWkvcGFja2FnZXMvYnVpbGQvc3JjL2dlbmVyYXRlQ29uZmlnL2V4dGVybmFsLnRzXCI7aW1wb3J0IHsgUGFja2FnZUpzb24gfSBmcm9tICd0eXBlLWZlc3QnO1xuaW1wb3J0IHsgZ2V0T3B0aW9ucywgR2VuZXJhdGVDb25maWdPcHRpb25zIH0gZnJvbSAnLi9vcHRpb25zJztcblxuLyoqXG4gKiBcdTgzQjdcdTUzRDYgYnVpbGQucm9sbHVwT3B0aW9ucy5leHRlcm5hbCBcdTRGOURcdThENTZcdTU5MTZcdTkwRThcdTUzMTZcdTc2RjhcdTUxNzNcdTc2ODRcdTkxNERcdTdGNkVcbiAqIEBwYXJhbSBwYWNrYWdlSnNvbiBwYWNrYWdlLmpzb24gXHU2NTg3XHU0RUY2XHU1MTg1XHU1QkI5XG4gKiBAcGFyYW0gb3B0aW9ucyBcdTY3ODRcdTVFRkFcdTkwMDlcdTk4NzlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEV4dGVybmFsKHBhY2thZ2VKc29uOiBQYWNrYWdlSnNvbiA9IHt9LCBvcHRpb25zOiBHZW5lcmF0ZUNvbmZpZ09wdGlvbnMgPSB7fSkge1xuICBjb25zdCB7IGRlcGVuZGVuY2llcyA9IHt9LCBwZWVyRGVwZW5kZW5jaWVzID0ge30gfSA9IHBhY2thZ2VKc29uO1xuXG4gIGNvbnN0IHsgbW9kZSB9ID0gZ2V0T3B0aW9ucyhvcHRpb25zKTtcblxuICBjb25zdCBkZWZhdWx0RXh0ZXJuYWw6IChzdHJpbmcgfCBSZWdFeHApW10gPSBbXG4gICAgLy8gXHU1QzA2XHU2MjQwXHU2NzA5XHU3Njg0bm9kZVx1NTM5Rlx1NzUxRlx1NkEyMVx1NTc1N1x1OTBGRFx1OEZEQlx1ODg0Q1x1NTkxNlx1OTBFOFx1NTMxNlx1NTkwNFx1NzQwNlxuICAgIC9ebm9kZTouKi8sXG4gIF07XG5cbiAgY29uc3QgdG9SZWcgPSAoaXRlbTogc3RyaW5nKSA9PiBuZXcgUmVnRXhwKGBeJHtpdGVtfWApO1xuXG4gIHJldHVybiBkZWZhdWx0RXh0ZXJuYWwuY29uY2F0KFxuICAgIE9iamVjdC5rZXlzKHBlZXJEZXBlbmRlbmNpZXMpLm1hcCh0b1JlZyksXG5cbiAgICAvLyBcdTUxNjhcdTkxQ0ZcdTY3ODRcdTVFRkFcdTY1RjZcdUZGMENcdTRGOURcdThENTZcdTRFMERcdThGREJcdTg4NENcdTU5MTZcdTkwRThcdTUzMTZcdUZGMENcdTRFMDBcdTVFNzZcdTYyNTNcdTUzMDVcdThGREJcdTY3NjVcbiAgICBtb2RlID09PSAncGFja2FnZScgPyBPYmplY3Qua2V5cyhkZXBlbmRlbmNpZXMpLm1hcCh0b1JlZykgOiBbXSxcbiAgKTtcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3dyeXRlL3dvcmsvbmV4ZnVyb21hLXVpL3BhY2thZ2VzL2J1aWxkL3NjcmlwdHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy93cnl0ZS93b3JrL25leGZ1cm9tYS11aS9wYWNrYWdlcy9idWlsZC9zY3JpcHRzL2NvbW1vbi50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvd3J5dGUvd29yay9uZXhmdXJvbWEtdWkvcGFja2FnZXMvYnVpbGQvc2NyaXB0cy9jb21tb24udHNcIjtpbXBvcnQgeyBVc2VyQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyBhYnNDd2QsIGdlbmVyYXRlQ29uZmlnIGFzIGJhc2VHZW5lcmF0ZUNvbmZpZywgR2VuZXJhdGVDb25maWdPcHRpb25zIH0gZnJvbSAnLi4vc3JjJztcblxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlQ29uZmlnKGN1c3RvbU9wdGlvbnM/OiBHZW5lcmF0ZUNvbmZpZ09wdGlvbnMsIHZpdGVDb25maWc/OiBVc2VyQ29uZmlnKSB7XG4gIHJldHVybiBiYXNlR2VuZXJhdGVDb25maWcoXG4gICAgeyBkdHM6IGFic0N3ZCgnLi4vLi4vdHNjb25maWcuc3JjLmpzb24nKSwgLi4uY3VzdG9tT3B0aW9ucyB9LFxuICAgIHZpdGVDb25maWcsXG4gICk7XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy93cnl0ZS93b3JrL25leGZ1cm9tYS11aS9wYWNrYWdlcy9idWlsZC9zY3JpcHRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvd3J5dGUvd29yay9uZXhmdXJvbWEtdWkvcGFja2FnZXMvYnVpbGQvc2NyaXB0cy92dWUudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3dyeXRlL3dvcmsvbmV4ZnVyb21hLXVpL3BhY2thZ2VzL2J1aWxkL3NjcmlwdHMvdnVlLnRzXCI7aW1wb3J0IHsgbWVyZ2VDb25maWcsIFVzZXJDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IHByZXNldFVubywgUHJlc2V0VW5vT3B0aW9ucyB9IGZyb20gJ3Vub2Nzcy9wcmVzZXQtdW5vJztcbmltcG9ydCB1bm9jc3MgZnJvbSAndW5vY3NzL3ZpdGUnO1xuaW1wb3J0IHRyYW5zZm9ybWVyRGlyZWN0aXZlcyBmcm9tICdAdW5vY3NzL3RyYW5zZm9ybWVyLWRpcmVjdGl2ZXMnO1xuaW1wb3J0IHsgZ2VuZXJhdGVDb25maWcgfSBmcm9tICcuL2NvbW1vbic7XG5pbXBvcnQgeyBhYnNDd2QsIHJlbEN3ZCwgR2VuZXJhdGVDb25maWdPcHRpb25zIH0gZnJvbSAnLi4vc3JjJztcbmltcG9ydCB7IG5leGZ1cm9tYXVpUHJlc2V0LCBOZXhmdXJvbWF1aVByZXNldE9wdGlvbnMgfSBmcm9tICcuLi8uLi9zdHlsZXMvc3JjL3Vub1ByZXNldCc7XG5cbi8qKiBcdTYyRDNcdTVDNTVcdTY3ODRcdTVFRkFcdTkwMDlcdTk4NzkgKi9cbmV4cG9ydCBpbnRlcmZhY2UgR2VuZXJhdGVWdWVDb25maWdPcHRpb25zIGV4dGVuZHMgR2VuZXJhdGVDb25maWdPcHRpb25zIHtcbiAgLyoqIFx1NjYyRlx1NTQyNlx1NTQyRlx1NzUyOFVub0NTU1x1NjNEMlx1NEVGNiAqL1xuICBwbHVnaW5Vbm8/OiBib29sZWFuO1xuXG4gIC8qKiBcdTRGMjBcdTkwMTJcdTdFRDkgdW5vY3NzL3ByZXNldC11bm8gXHU5ODg0XHU4QkJFXHU3Njg0XHU5MTREXHU3RjZFICovXG4gIHByZXNldFVub09wdGlvbnM/OiBQcmVzZXRVbm9PcHRpb25zO1xuXG4gIC8qKiBcdTRGMjBcdTkwMTJcdTdFRDlcdTdFQzRcdTRFRjZcdTVFOTMgVW5vQ1NTIFx1OTg4NFx1OEJCRVx1NzY4NFx1OTAwOVx1OTg3OSAqL1xuICBwcmVzZXROZXhmdXJvbWF1aU9wdGlvbnM/OiBOZXhmdXJvbWF1aVByZXNldE9wdGlvbnM7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZW5lcmF0ZVZ1ZUNvbmZpZyhcbiAgY3VzdG9tT3B0aW9ucz86IEdlbmVyYXRlVnVlQ29uZmlnT3B0aW9ucyxcbiAgdml0ZUNvbmZpZz86IFVzZXJDb25maWcsXG4pIHtcbiAgY29uc3QgeyBwbHVnaW5Vbm8gPSB0cnVlLCBwcmVzZXROZXhmdXJvbWF1aU9wdGlvbnMsIHByZXNldFVub09wdGlvbnMgfSA9IGN1c3RvbU9wdGlvbnMgfHwge307XG5cbiAgY29uc3QgY29uZmlnUHJlc2V0OiBVc2VyQ29uZmlnID0ge1xuICAgIHBsdWdpbnM6IFtcbiAgICAgIHBsdWdpblVubyA/XG4gICAgICAgIHVub2Nzcyh7XG4gICAgICAgICAgLyoqIFx1NEUwRFx1NUU5NFx1NzUyOCB1bm8uY29uZmlnLnRzIFx1NjU4N1x1NEVGNlx1RkYwQ1x1NjI0MFx1NjcwOVx1OTE0RFx1N0Y2RVx1NzZGNFx1NjNBNVx1NEYyMFx1N0VEOVx1NjNEMlx1NEVGNiAqL1xuICAgICAgICAgIGNvbmZpZ0ZpbGU6IGZhbHNlLFxuICAgICAgICAgIHByZXNldHM6IFtcbiAgICAgICAgICAgIHByZXNldFVubyh7XG4gICAgICAgICAgICAgIC8vIFx1OTY2NFx1NEU4Nlx1NEUzQlx1OTg5OFx1NjgzN1x1NUYwRiB0aGVtZVx1RkYwQ1x1NEUwMFx1ODIyQ1x1NjBDNVx1NTFCNVx1NEUwQlx1RkYwQ1x1NEUwRFx1NjI1M1x1NTMwNSB1bm9jc3MvcHJlc2V0LXVubyBcdTc2ODRcdTk4ODRcdThCQkVcbiAgICAgICAgICAgICAgcHJlZmxpZ2h0OiBmYWxzZSxcbiAgICAgICAgICAgICAgLi4ucHJlc2V0VW5vT3B0aW9ucyxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgLy8gXHU5NkM2XHU2MjEwXHU3RUM0XHU0RUY2XHU1RTkzVW5vQ1NTXHU5ODg0XHU4QkJFXHVGRjBDXHU3RUM0XHU0RUY2XHU3Njg0XHU5MEU4XHU0RUZEXHU2ODM3XHU1RjBGXG4gICAgICAgICAgICBuZXhmdXJvbWF1aVByZXNldChwcmVzZXROZXhmdXJvbWF1aU9wdGlvbnMpLFxuICAgICAgICAgIF0sXG4gICAgICAgICAgdHJhbnNmb3JtZXJzOiBbXG4gICAgICAgICAgICAvLyBcdTY1MkZcdTYzMDFcdTU3MjggY3NzIFx1NEUyRFx1NEY3Rlx1NzUyOCBAYXBwbHkgXHU4QkVEXHU2Q0Q1XHU4MDVBXHU1NDA4XHU1OTFBXHU0RTJBXHU1MzlGXHU1QjUwXHU3QzdCXG4gICAgICAgICAgICB0cmFuc2Zvcm1lckRpcmVjdGl2ZXMoKSxcbiAgICAgICAgICBdLFxuICAgICAgICB9KSA6XG4gICAgICAgIG51bGwsXG4gICAgXSxcbiAgfTtcblxuICBjb25zdCBvcHRpb25zUHJlc2V0OiBHZW5lcmF0ZUNvbmZpZ09wdGlvbnMgPSB7XG4gICAgcGx1Z2luVnVlOiB0cnVlLFxuICAgIC8vIFx1NUMwNlx1N0VDNFx1NEVGNlx1NjgzN1x1NUYwRlx1NjU4N1x1NEVGNlx1NzY4NFx1NTE2NVx1NTNFM1x1NTE5OVx1NTE2NSBwYWNrYWdlLmpzb24gXHU3Njg0IGV4cG9ydHMgXHU1QjU3XHU2QkI1XG4gICAgb25TZXRQa2c6IChwa2csIG9wdGlvbnMpID0+IHtcbiAgICAgIGNvbnN0IGV4cG9ydHM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICAgICAgICcuL3N0eWxlLmNzcyc6IHJlbEN3ZChhYnNDd2Qob3B0aW9ucy5vdXREaXIsICdzdHlsZS5jc3MnKSwgZmFsc2UpLFxuICAgICAgfTtcbiAgICAgIE9iamVjdC5hc3NpZ24ocGtnLmV4cG9ydHMgYXMgUmVjb3JkPHN0cmluZywgYW55PiwgZXhwb3J0cyk7XG4gICAgfSxcbiAgfTtcblxuICBjb25zdCByZXMgPSBhd2FpdCBnZW5lcmF0ZUNvbmZpZyhcbiAgICB7XG4gICAgICAuLi5vcHRpb25zUHJlc2V0LFxuICAgICAgLi4uY3VzdG9tT3B0aW9ucyxcbiAgICB9LFxuICAgIG1lcmdlQ29uZmlnKGNvbmZpZ1ByZXNldCwgdml0ZUNvbmZpZyB8fCB7fSksXG4gICk7XG5cbiAgcmV0dXJuIHJlcztcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3dyeXRlL3dvcmsvbmV4ZnVyb21hLXVpL3BhY2thZ2VzL3N0eWxlcy9zcmNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy93cnl0ZS93b3JrL25leGZ1cm9tYS11aS9wYWNrYWdlcy9zdHlsZXMvc3JjL3Vub1ByZXNldC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvd3J5dGUvd29yay9uZXhmdXJvbWEtdWkvcGFja2FnZXMvc3R5bGVzL3NyYy91bm9QcmVzZXQudHNcIjtpbXBvcnQgeyBtZXJnZUNvbmZpZ3MsIFByZXNldCwgVXNlckNvbmZpZyB9IGZyb20gJ3Vub2Nzcyc7XG5pbXBvcnQgeyBUaGVtZSB9IGZyb20gJ3Vub2Nzcy9wcmVzZXQtbWluaSc7XG5pbXBvcnQge1xuICBiYXNlQ29uZmlnLCB0aGVtZUNvbmZpZywgYnV0dG9uQ29uZmlnLCBpbnB1dENvbmZpZyxcbn0gZnJvbSAnLi91bm9jc3MnO1xuXG4vKiogXHU3RUM0XHU0RUY2XHU1NDBEXHU1QjU3XHU1NDhDXHU5ODg0XHU4QkJFXHU1QkY5XHU4QzYxXHU3Njg0XHU1MTczXHU3Q0ZCXHU4ODY4ICovXG5jb25zdCBjb25maWdNYXBzID0ge1xuICB0aGVtZTogdGhlbWVDb25maWcsXG4gIGJ1dHRvbjogYnV0dG9uQ29uZmlnLFxuICBpbnB1dDogaW5wdXRDb25maWcsXG59IHNhdGlzZmllcyBSZWNvcmQ8c3RyaW5nLCBVc2VyQ29uZmlnPFRoZW1lPj47XG5cbnR5cGUgQ29uZmlnS2V5cyA9IGtleW9mIHR5cGVvZiBjb25maWdNYXBzO1xuXG4vKiogXHU3RUM0XHU0RUY2XHU1RTkzXHU5ODg0XHU4QkJFXHU5MDA5XHU5ODc5ICovXG5leHBvcnQgaW50ZXJmYWNlIE5leGZ1cm9tYXVpUHJlc2V0T3B0aW9ucyB7XG4gIC8qKiBcdTYzMDdcdTVCOUFcdTk2QzZcdTYyMTBcdTU0RUFcdTRFOUJcdTdFQzRcdTRFRjZcdTc2ODQgVW5vQ1NTIFx1OTg4NFx1OEJCRVx1RkYwQ1x1NEUwRFx1OEJCRVx1N0Y2RVx1NjVGNlx1OUVEOFx1OEJBNFx1NTE2OFx1OTBFOFx1OTZDNlx1NjIxMCAqL1xuICBpbmNsdWRlPzogQ29uZmlnS2V5c1tdO1xuXG4gIC8qKiBcdTYzMDdcdTVCOUFcdTUyNTRcdTk2NjRcdTU0RUFcdTRFOUJcdTdFQzRcdTRFRjZcdTc2ODQgVW5vQ1NTIFx1OTg4NFx1OEJCRSAqL1xuICBleGNsdWRlPzogQ29uZmlnS2V5c1tdO1xufVxuXG4vKiogTmV4ZnVyb21hdWkgXHU5ODg0XHU4QkJFICovXG5leHBvcnQgZnVuY3Rpb24gbmV4ZnVyb21hdWlQcmVzZXQob3B0aW9uczogTmV4ZnVyb21hdWlQcmVzZXRPcHRpb25zID0ge30pOiBQcmVzZXQge1xuICBjb25zdCB7IGluY2x1ZGUgPSBPYmplY3Qua2V5cyhjb25maWdNYXBzKSBhcyBDb25maWdLZXlzW10sIGV4Y2x1ZGUgPSBbXSB9ID0gb3B0aW9ucztcblxuICAvLyBcdTY4MzlcdTYzNkUgaW5jbHVkZSBcdTU0OEMgZXhjbHVkZSBcdTkwMDlcdTk4NzlcdTUxQjNcdTVCOUFcdTU0RUFcdTRFOUJcdTdFQzRcdTRFRjZcdTc2ODQgVW5vQ1NTIFx1OTg4NFx1OEJCRVx1NUMwNlx1ODk4MVx1ODhBQlx1OTZDNlx1NjIxMFxuICBjb25zdCBjb21wb25lbnRzID0gbmV3IFNldDxDb25maWdLZXlzPigpO1xuICBpbmNsdWRlLmZvckVhY2goKGtleSkgPT4gY29tcG9uZW50cy5hZGQoa2V5KSk7XG4gIGV4Y2x1ZGUuZm9yRWFjaCgoa2V5KSA9PiBjb21wb25lbnRzLmRlbGV0ZShrZXkpKTtcbiAgY29uc3QgY29uZmlncyA9IEFycmF5LmZyb20oY29tcG9uZW50cylcbiAgICAubWFwKChjb21wb25lbnQpID0+IGNvbmZpZ01hcHNbY29tcG9uZW50XSlcbiAgICAuZmlsdGVyKChpdGVtKSA9PiBpdGVtKTtcblxuICAvLyBcdTU3RkFcdTc4NDBcdTk4ODRcdThCQkVcdTRFRkJcdTRGNTVcdTY1RjZcdTUwMTlcdTkwRkRcdTRGMUFcdTc1MUZcdTY1NDhcbiAgY29uZmlncy51bnNoaWZ0KGJhc2VDb25maWcpO1xuXG4gIC8vIFx1NTQwOFx1NUU3Nlx1NjI0MFx1NjcwOVx1OTg4NFx1OEJCRVxuICBjb25zdCBtZXJnZWRDb25maWcgPSBtZXJnZUNvbmZpZ3MoY29uZmlncyk7XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnbmV4ZnVyb21hdWktcHJlc2V0JyxcbiAgICAuLi5tZXJnZWRDb25maWcsXG4gIH07XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy93cnl0ZS93b3JrL25leGZ1cm9tYS11aS9wYWNrYWdlcy9zdHlsZXMvc3JjL3ZhcnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy93cnl0ZS93b3JrL25leGZ1cm9tYS11aS9wYWNrYWdlcy9zdHlsZXMvc3JjL3ZhcnMvdGhlbWUudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3dyeXRlL3dvcmsvbmV4ZnVyb21hLXVpL3BhY2thZ2VzL3N0eWxlcy9zcmMvdmFycy90aGVtZS50c1wiOy8qKiBcdTU3RkFcdTc4NDBcdTk4OUNcdTgyNzJcdTRFM0JcdTk4OThcdTUzRDhcdTkxQ0YgKi9cbmV4cG9ydCBjb25zdCB0aGVtZUNvbG9ycyA9IHtcbiAgJ2NvbG9yLXByaW1hcnknOiAnIzE2ODBCMScsXG4gICdjb2xvci1zdWNjZXNzJzogJyM1MGQ0YWInLFxuICAnY29sb3Itd2FybmluZyc6ICcjZmJiMTc1JyxcbiAgJ2NvbG9yLWRhbmdlcic6ICcjZjY2ZjZhJyxcbiAgJ2NvbG9yLWluZm8nOiAnIzUyNmVjYycsXG4gICdjb2xvci10cmFuc3BhcmVudCc6ICd0cmFuc3BhcmVudCcsXG4gICdjb2xvci1ibGFjayc6ICcjMDAwJyxcbiAgJ2NvbG9yLXdoaXRlJzogJyNmZmYnLFxuXG4gIC8vIFx1ODBDQ1x1NjY2Rlx1ODI3MlxuICAnY29sb3ItcGFnZSc6ICcjZjVmNWY2JyxcbiAgJ2NvbG9yLWNhcmQnOiAnI2ZmZicsXG5cbiAgLy8gXHU2NTg3XHU1QjU3XHU0RTNCXHU4MjcyXG4gICdjb2xvci1oZWFkZXInOiAnIzI1MmIzYScsXG4gICdjb2xvci1yZWd1bGFyJzogJyM1NzVkNmMnLFxuICAnY29sb3Itc2Vjb25kYXJ5JzogJyM4YThlOTknLFxuICAnY29sb3ItcGxhY2Vob2xkZXInOiAnI2FiYjBiOCcsXG4gICdjb2xvci1kaXNhYmxlZCc6ICcjYzBjNGNjJyxcbiAgJ2NvbG9yLXJldmVyc2UnOiAnI2ZmZicsXG5cbiAgLy8gXHU4RkI5XHU2ODQ2XHU0RTNCXHU4MjcyXG4gICdjb2xvci1iZF9kYXJrZXInOiAnI2NkZDBkNicsXG4gICdjb2xvci1iZF9kYXJrJzogJyNkNGQ3ZGUnLFxuICAnY29sb3ItYmRfYmFzZSc6ICcjZGNkZmU2JyxcbiAgJ2NvbG9yLWJkX2xpZ2h0JzogJyNkZmUxZTYnLFxuICAnY29sb3ItYmRfbGlnaHRlcic6ICcjZWJlZmY1JyxcbiAgJ2NvbG9yLWJkX2xpZ2h0ZXN0JzogJyNmMmY2ZmMnLFxufTtcblxuLyoqXG4gKiBcdTk3MDBcdTg5ODFcdTc1MUZcdTYyMTBcdTgyNzJcdTk2MzZcdTc2ODRcdTk4OUNcdTgyNzJcbiAqXG4gKiBcdTRGOEJcdTU5ODIgY29sb3ItcHJpbWFyeSBcdTVDMDZcdTRGMUFcdTc1MUZcdTYyMTAgY29sb3ItcHJpbWFyeS1saWdodC1bMS05XSBcdTRFRTVcdTUzQ0EgY29sb3ItcHJpbWFyeS1kYXJrLVsxLTldIFx1N0NGQlx1NTIxN1x1NkQ0NVx1ODI3Mlx1NEUwRVx1NkRGMVx1ODI3Mlx1NzY4NFx1NTNEOFx1OTFDRlx1MzAwMlxuICovXG5leHBvcnQgY29uc3QgdGhlbWVDb2xvckxldmVsc0VuYWJsZWRLZXlzOiAoa2V5b2YgdHlwZW9mIHRoZW1lQ29sb3JzKVtdID0gW1xuICAnY29sb3ItcHJpbWFyeScsXG4gICdjb2xvci1zdWNjZXNzJyxcbiAgJ2NvbG9yLXdhcm5pbmcnLFxuICAnY29sb3ItZGFuZ2VyJyxcbiAgJ2NvbG9yLWluZm8nLFxuXTtcblxuLyoqIFx1NTdGQVx1Nzg0MFx1OEZCOVx1OERERFx1NEUzQlx1OTg5OFx1NTNEOFx1OTFDRiAqL1xuZXhwb3J0IGNvbnN0IHRoZW1lU3BhY2luZyA9IHtcbiAgJ3NwYWNpbmcteHMnOiAnOHB4JyxcbiAgJ3NwYWNpbmctc20nOiAnMTJweCcsXG4gICdzcGFjaW5nLW1kJzogJzE2cHgnLFxuICAnc3BhY2luZy1sZyc6ICcyNHB4JyxcbiAgJ3NwYWNpbmcteGwnOiAnMzJweCcsXG59O1xuXG4vKiogXHU1N0ZBXHU3ODQwXHU4RkI5XHU2ODQ2XHU0RTNCXHU5ODk4XHU1M0Q4XHU5MUNGICovXG5leHBvcnQgY29uc3QgdGhlbWVCb3JkZXJzID0ge1xuICAnYm9yZGVyLXJhZGl1cy14cyc6ICcycHgnLFxuICAnYm9yZGVyLXJhZGl1cy1zbSc6ICc0cHgnLFxuICAnYm9yZGVyLXJhZGl1cy1tZCc6ICc2cHgnLFxuICAnYm9yZGVyLXJhZGl1cy1sZyc6ICc4cHgnLFxuICAnYm9yZGVyLXJhZGl1cy14bCc6ICcxMnB4Jyxcbn07XG5cbi8qKiBcdTU3RkFcdTc4NDBcdTRFM0JcdTk4OThcdTUzRDhcdTkxQ0YgKi9cbmV4cG9ydCBjb25zdCB0aGVtZVZhcnMgPSB7XG4gIC4uLnRoZW1lQ29sb3JzLFxuICAuLi50aGVtZVNwYWNpbmcsXG4gIC4uLnRoZW1lQm9yZGVycyxcbn07XG5cbmV4cG9ydCB0eXBlIFRoZW1lQ3NzVmFyc0NvbmZpZyA9IFBhcnRpYWw8dHlwZW9mIHRoZW1lVmFycz47XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy93cnl0ZS93b3JrL25leGZ1cm9tYS11aS9wYWNrYWdlcy9zdHlsZXMvc3JjL3V0aWxzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvd3J5dGUvd29yay9uZXhmdXJvbWEtdWkvcGFja2FnZXMvc3R5bGVzL3NyYy91dGlscy9jb2xvcnMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3dyeXRlL3dvcmsvbmV4ZnVyb21hLXVpL3BhY2thZ2VzL3N0eWxlcy9zcmMvdXRpbHMvY29sb3JzLnRzXCI7LyoqIFJHQkFcdTk4OUNcdTgyNzJcdTVCRjlcdThDNjEgKi9cbmludGVyZmFjZSBSR0JBQ29sb3Ige1xuICAvKiogclx1MzAwMWdcdTMwMDFiXHUzMDAxYVx1NTNDMlx1NjU3MCAqL1xuICBhcmdzOiBbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXTtcblxuICAvKiogXHU4M0I3XHU1M0Q2UkdCXHU1MDNDICovXG4gIGdldCByZ2JUeHQoKTogc3RyaW5nO1xuXG4gIC8qKiBcdTgzQjdcdTUzRDZSR0JBXHU1QjhDXHU2NTc0XHU1MDNDICovXG4gIGdldCByZ2JhKCk6IHN0cmluZztcbn1cblxuLyoqIFx1N0VEOVx1NEUwRVx1NEUwMFx1NEUyQSBDU1MgXHU4ODY4XHU4RkJFXHU1RjBGXHVGRjBDXHU4QkQ1XHU1NkZFXHU1QzA2XHU1MTc2XHU4RjZDXHU1MzE2XHU0RTNBIFJHQkEgXHU5ODlDXHU4MjcyXHU1QkY5XHU4QzYxICovXG5leHBvcnQgZnVuY3Rpb24gdG9SZ2JhKHN0cjogc3RyaW5nKTogUkdCQUNvbG9yIHwgbnVsbCB7XG4gIHJldHVybiBoZXhUb1JnYmEoc3RyKSB8fCBwYXJzZUNzc0Z1bmMoc3RyKTtcbn1cblxuLyoqIFx1NUMwNiAxNiBcdThGREJcdTUyMzZcdTk4OUNcdTgyNzJcdTg4NjhcdThGQkVcdTVGMEZcdThGNkNcdTYzNjJcdTRFM0EgUkdCQSBcdTk4OUNcdTgyNzJcdTVCRjlcdThDNjFcdTMwMDIgKi9cbmZ1bmN0aW9uIGhleFRvUmdiYShzdHI6IHN0cmluZyk6IFJHQkFDb2xvciB8IG51bGwge1xuICBpZiAoc3RyLmNoYXJBdCgwKSAhPT0gJyMnKSByZXR1cm4gbnVsbDtcblxuICBpZiAoc3RyLmxlbmd0aCAhPT0gNCAmJiBzdHIubGVuZ3RoICE9PSA3KSByZXR1cm4gbnVsbDtcblxuICBsZXQgY29sb3JTdHIgPSBzdHIuc2xpY2UoMSk7XG4gIGlmIChjb2xvclN0ci5sZW5ndGggPT09IDMpIHtcbiAgICBjb2xvclN0ciA9IGNvbG9yU3RyWzBdICsgY29sb3JTdHJbMF0gKyBjb2xvclN0clsxXSArIGNvbG9yU3RyWzFdICsgY29sb3JTdHJbMl0gKyBjb2xvclN0clsyXTtcbiAgfVxuICBjb25zdCByID0gcGFyc2VJbnQoY29sb3JTdHIuc2xpY2UoMCwgMiksIDE2KTtcbiAgY29uc3QgZyA9IHBhcnNlSW50KGNvbG9yU3RyLnNsaWNlKDIsIDQpLCAxNik7XG4gIGNvbnN0IGIgPSBwYXJzZUludChjb2xvclN0ci5zbGljZSg0LCA2KSwgMTYpO1xuXG4gIHJldHVybiBjcmVhdGVSZ2JhQ29sb3IociwgZywgYiwgMSk7XG59XG5cbi8qKlxuICogXHU2NjgyXHU2NUY2XHU1M0VBXHU2NTJGXHU2MzAxIHJnYiBcdTU0OEMgcmdiYVxuICogQHRvZG8gXHU1QjlFXHU3M0IwXHU1QkY5IGhzbCBcdTU0OEMgaHNsYSBcdTRFRTVcdTUzQ0FcdTUxNzZcdTRFRDZcdTUxRkRcdTY1NzBcdTc2ODRcdTY1MkZcdTYzMDFcbiAqL1xuXG4vKiogXHU2NTJGXHU2MzAxXHU3Njg0IGNzcyBcdTk4OUNcdTgyNzJcdTUxRkRcdTY1NzBcdTdDN0JcdTU3OEIgKi9cbmNvbnN0IGNzc0NvbG9yRnVuY3MgPSBbJ3JnYicsICdyZ2JhJ107XG5cbi8qKiBcdTVDMDZcdTUxRkRcdTY1NzBcdTVGNjJcdTVGMEZcdTc2ODQgQ1NTIFx1ODg2OFx1OEZCRVx1NUYwRlx1OEY2Q1x1NjM2Mlx1NEUzQSBSR0JBIFx1OTg5Q1x1ODI3Mlx1NUJGOVx1OEM2MVx1MzAwMiAqL1xuZnVuY3Rpb24gcGFyc2VDc3NGdW5jKHN0cjogc3RyaW5nKTogUkdCQUNvbG9yIHwgbnVsbCB7XG4gIGNvbnN0IG1hdGNoID0gc3RyLm1hdGNoKC9eKC4qKVxcKCguKylcXCkkL2kpO1xuICBpZiAoIW1hdGNoKSByZXR1cm4gbnVsbDtcblxuICBjb25zdCBbLCBmdW5jLCBhcmdzVHh0XSA9IG1hdGNoO1xuICBpZiAoIWNzc0NvbG9yRnVuY3MuaW5jbHVkZXMoZnVuYykpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGxldCBhcmdzQXJyID0gYXJnc1R4dC5zcGxpdCgnLCcpO1xuICBpZiAoYXJnc0Fyci5sZW5ndGggPT09IDEpIHtcbiAgICBhcmdzQXJyID0gYXJnc1R4dC5zcGxpdCgnICcpO1xuICB9XG4gIGNvbnN0IGFyZ3MgPSBhcmdzQXJyLm1hcChwYXJzZUZsb2F0KS5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0pO1xuXG4gIGlmIChmdW5jID09PSAncmdiJyB8fCBmdW5jID09PSAncmdiYScpIHtcbiAgICBjb25zdCBbciwgZywgYiwgYV0gPSBhcmdzO1xuICAgIHJldHVybiBjcmVhdGVSZ2JhQ29sb3IociwgZywgYiwgYSB8fCAxKTtcbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuXG4vKiogXHU3RUQ5XHU0RTBFIHJcdTMwMDFnXHUzMDAxYlx1MzAwMWEgXHU1MDNDXHVGRjBDXHU2Nzg0XHU5MDIwXHU0RTAwXHU0RTJBIFJHQkEgXHU5ODlDXHU4MjcyXHU1QkY5XHU4QzYxXHUzMDAyICovXG5mdW5jdGlvbiBjcmVhdGVSZ2JhQ29sb3IocjogbnVtYmVyLCBnOiBudW1iZXIsIGI6IG51bWJlciwgYTogbnVtYmVyID0gMSk6IFJHQkFDb2xvciB7XG4gIHJldHVybiB7XG4gICAgYXJnczogW3IsIGcsIGIsIGFdLFxuICAgIGdldCByZ2JUeHQoKSB7XG4gICAgICBjb25zdCBbcnIsIGdnLCBiYl0gPSB0aGlzLmFyZ3M7XG4gICAgICByZXR1cm4gYCR7cnJ9LCAke2dnfSwgJHtiYn1gO1xuICAgIH0sXG4gICAgZ2V0IHJnYmEoKSB7XG4gICAgICByZXR1cm4gYHJnYmEoJHt0aGlzLnJnYlR4dH0sICR7dGhpcy5hcmdzWzNdIHx8IDF9KWA7XG4gICAgfSxcbiAgfTtcbn1cblxuLyoqXG4gKiBcdTk4OUNcdTgyNzJcdTZERjdcdTU0MDhcbiAqIEBwYXJhbSBzb3VyY2UgXHU4RDc3XHU1OUNCXHU4MjcyXG4gKiBAcGFyYW0gdGFyZ2V0IFx1NzZFRVx1NjgwN1x1ODI3MlxuICogQHBhcmFtIHBlcmNlbnQgXHU2REY3XHU1NDA4XHU2QkQ0XHU0RjhCXHU3NjdFXHU1MjA2XHU2QkQ0XG4gKiBAcmV0dXJucyBcdTZERjdcdTU0MDhcdTU0MEVcdTc2ODRcdTk4OUNcdTgyNzJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1peFJnYkNvbG9yKHNvdXJjZTogUkdCQUNvbG9yLCB0YXJnZXQ6IFJHQkFDb2xvciwgcGVyY2VudDogbnVtYmVyKTogUkdCQUNvbG9yIHtcbiAgY29uc3QgcmVzID0gW1xuICAgIHNvdXJjZS5hcmdzWzBdICsgKHRhcmdldC5hcmdzWzBdIC0gc291cmNlLmFyZ3NbMF0pICogKHBlcmNlbnQgLyAxMDApLFxuICAgIHNvdXJjZS5hcmdzWzFdICsgKHRhcmdldC5hcmdzWzFdIC0gc291cmNlLmFyZ3NbMV0pICogKHBlcmNlbnQgLyAxMDApLFxuICAgIHNvdXJjZS5hcmdzWzJdICsgKHRhcmdldC5hcmdzWzJdIC0gc291cmNlLmFyZ3NbMl0pICogKHBlcmNlbnQgLyAxMDApLFxuICBdLm1hcCgoaXRlbSkgPT4gTWF0aC5yb3VuZChpdGVtKSk7XG4gIGNvbnN0IFtyciwgZ2csIGJiXSA9IHJlcztcbiAgcmV0dXJuIGNyZWF0ZVJnYmFDb2xvcihyciwgZ2csIGJiLCBzb3VyY2UuYXJnc1szXSB8fCAxKTtcbn1cblxuLyoqXG4gKiBcdTc1MUZcdTYyMTBcdTgyNzJcdTk2MzZcdTVCRjlcdThDNjFcdTMwMDJsaWdodCBcdTdDRkJcdTUyMTdcdTRFMEVcdTc2N0RcdTgyNzJcdTRFMDBcdTZCNjVcdTZCNjVcdTZERjdcdTU0MDhcdUZGMENkYXJrIFx1N0NGQlx1NTIxN1x1NEUwRVx1OUVEMVx1ODI3Mlx1NEUwMFx1NkI2NVx1NkI2NVx1NkRGN1x1NTQwOFx1MzAwMlxuICogQHBhcmFtIGNvbG9yIFx1NTdGQVx1NTFDNlx1ODI3MlxuICogQHBhcmFtIGxldmVscyBcdTgyNzJcdTk2MzZcdTY1NzBcdTkxQ0ZcbiAqIEByZXR1cm5zIFx1ODI3Mlx1OTYzNlx1NUJGOVx1OEM2MVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVSZ2JDb2xvckxldmVscyhjb2xvcjogUkdCQUNvbG9yLCBsZXZlbHM6IG51bWJlciA9IDkpIHtcbiAgY29uc3QgcmVzdWx0ID0ge1xuICAgIGxpZ2h0OiA8UkdCQUNvbG9yW10+W10sXG4gICAgZGFyazogPFJHQkFDb2xvcltdPltdLFxuICB9O1xuXG4gIGlmIChjb2xvci5yZ2JUeHQgPT09ICcwLCAwLCAwJyB8fCBjb2xvci5yZ2JUeHQgPT09ICcyNTUsIDI1NSwgMjU1Jykge1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBjb25zdCBwZXJjZW50ID0gMTAwIC8gKGxldmVscyArIDEpO1xuICBmb3IgKGxldCBpID0gMTsgaSA8IGxldmVscyArIDE7IGkrKykge1xuICAgIHJlc3VsdC5saWdodC5wdXNoKG1peFJnYkNvbG9yKGNvbG9yLCBjcmVhdGVSZ2JhQ29sb3IoMjU1LCAyNTUsIDI1NSksIGkgKiBwZXJjZW50KSk7XG4gICAgcmVzdWx0LmRhcmsucHVzaChtaXhSZ2JDb2xvcihjb2xvciwgY3JlYXRlUmdiYUNvbG9yKDAsIDAsIDApLCBpICogcGVyY2VudCkpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy93cnl0ZS93b3JrL25leGZ1cm9tYS11aS9wYWNrYWdlcy9zdHlsZXMvc3JjL3V0aWxzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvd3J5dGUvd29yay9uZXhmdXJvbWEtdWkvcGFja2FnZXMvc3R5bGVzL3NyYy91dGlscy9jc3NWYXJzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy93cnl0ZS93b3JrL25leGZ1cm9tYS11aS9wYWNrYWdlcy9zdHlsZXMvc3JjL3V0aWxzL2Nzc1ZhcnMudHNcIjtpbXBvcnQgeyB0b1JnYmEsIGdlbmVyYXRlUmdiQ29sb3JMZXZlbHMgfSBmcm9tICcuL2NvbG9ycyc7XG5cbmV4cG9ydCB0eXBlIERlZmF1bHRQcmVmaXggPSAnbngtJztcbi8qKiBcdTlFRDhcdThCQTRcdTYwQzVcdTUxQjVcdTRFMEJcdUZGMENcdTc1MUZcdTYyMTAgQ1NTIFx1NTNEOFx1OTFDRlx1NjVGNlx1NTg5RVx1NTJBMFx1NzY4NFx1NTI0RFx1N0YwMCAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfUFJFRklYOiBEZWZhdWx0UHJlZml4ID0gJ254LSc7XG5cbi8qKlxuICogXHU3NTFGXHU2MjEwIENTUyBcdTUzRDhcdTkxQ0ZcdTVCRjlcdThDNjFcdTc2ODRcdTkwMDlcdTk4NzlcbiAqIEB0eXBlUGFyYW0gSyBcdTk3MDBcdTg5ODFcdTc1MUZcdTYyMTBcdTgyNzJcdTk2MzZcdTc2ODRcdTk1MkVcdTU0MERcbiAqIEB0eXBlUGFyYW0gUCBDU1MgXHU1M0Q4XHU5MUNGXHU1MjREXHU3RjAwXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR2VuZXJhdGVDc3NWYXJzT3B0aW9uczxLID0gc3RyaW5nLCBQIGV4dGVuZHMgc3RyaW5nID0gRGVmYXVsdFByZWZpeD4ge1xuICAvKipcbiAgICogXHU2MzA3XHU1QjlBXHU3Njg0XHU5NTJFXHU1NDBEXHU2MjQwXHU1QkY5XHU1RTk0XHU3Njg0IENTUyBcdTUzRDhcdTkxQ0ZcdTVDMDZcdTRGMUFcdTk4OURcdTU5MTZcdTc1MUZcdTYyMTBcdTgyNzJcdTk2MzZcdTUzRDhcdTkxQ0ZcdTMwMDJcbiAgICpcbiAgICogXHU0RjhCXHU1OTgyIGNvbG9yLXByaW1hcnkgXHU1QzA2XHU0RjFBXHU3NTFGXHU2MjEwIGNvbG9yLXByaW1hcnktbGlnaHQtWzEtOV0gXHU0RUU1XHU1M0NBIGNvbG9yLXByaW1hcnktZGFyay1bMS05XSBcdTdDRkJcdTUyMTdcdTZENDVcdTgyNzJcdTRFMEVcdTZERjFcdTgyNzJcdTc2ODRcdTUzRDhcdTkxQ0ZcdTMwMDJcbiAgICovXG4gIGNvbG9yTGV2ZWxzRW5hYmxlZEtleXM/OiBLW107XG5cbiAgLyoqIFx1NzUxRlx1NjIxMFx1ODI3Mlx1OTYzNlx1NTNEOFx1OTFDRlx1NzY4NFx1OTYzNlx1NjU3MCAqL1xuICBjb2xvckxldmVscz86IG51bWJlcjtcblxuICAvKiogQ1NTIFx1NTNEOFx1OTFDRlx1NTI0RFx1N0YwMCAqL1xuICBwcmVmaXg/OiBQO1xufVxuXG4vKipcbiAqIENTUyBcdTUzRDhcdTkxQ0ZcdTVCRjlcdThDNjFcdTc2ODRcdTdDN0JcdTU3OEJcbiAqIEB0eXBlUGFyYW0gVCBcdTUzOUZcdTU5Q0JcdTVCRjlcdThDNjFcdTc2ODRcdTdDN0JcdTU3OEJcbiAqIEB0eXBlUGFyYW0ge0BsaW5rIEdlbmVyYXRlQ3NzVmFyc09wdGlvbnN9XG4gKi9cbmV4cG9ydCB0eXBlIENzc1Zhck9iamVjdDxcbiAgVCBleHRlbmRzIFJlY29yZDxzdHJpbmcsIGFueT4gPSBSZWNvcmQ8c3RyaW5nLCBhbnk+LFxuICBLIGV4dGVuZHMga2V5b2YgVCA9IGtleW9mIFQsXG4gIFAgZXh0ZW5kcyBzdHJpbmcgPSBEZWZhdWx0UHJlZml4LFxuPiA9IHtcbiAgW2tleSBpbiBgLS0ke1B9JHtzdHJpbmcgJiBrZXlvZiBUfWBdOiBhbnk7XG59ICYge1xuICBba2V5IGluIGAtLSR7UH0ke3N0cmluZyAmIEt9LWxpZ2h0LSR7bnVtYmVyfWBdOiBhbnk7XG59ICYge1xuICBba2V5IGluIGAtLSR7UH0ke3N0cmluZyAmIEt9LWRhcmstJHtudW1iZXJ9YF06IGFueTtcbn07XG5cbi8qKlxuICogXHU3NTFGXHU2MjEwIENTUyBcdTUzRDhcdTkxQ0ZcdTVCRjlcdThDNjFcbiAqIEB0eXBlUGFyYW0ge0BsaW5rIENzc1Zhck9iamVjdH1cbiAqIEBwYXJhbSBvcmlnaW4gXHU1MzlGXHU1OUNCXHU0RTNCXHU5ODk4XHU1M0Q4XHU5MUNGXHU1QkY5XHU4QzYxXG4gKiBAcGFyYW0gb3B0aW9ucyBcdTkwMDlcdTk4Nzkge0BsaW5rIEdlbmVyYXRlQ3NzVmFyc09wdGlvbnN9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZUNzc1ZhcnM8XG4gIFQgZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0gUmVjb3JkPHN0cmluZywgYW55PixcbiAgSyBleHRlbmRzIGtleW9mIFQgPSBrZXlvZiBULFxuICBQIGV4dGVuZHMgc3RyaW5nID0gRGVmYXVsdFByZWZpeCxcbj4ob3JpZ2luOiBULCBvcHRpb25zPzogR2VuZXJhdGVDc3NWYXJzT3B0aW9uczxLLCBQPik6IENzc1Zhck9iamVjdDxULCBLLCBQPiB7XG4gIGNvbnN0IHsgcHJlZml4ID0gREVGQVVMVF9QUkVGSVgsIGNvbG9yTGV2ZWxzRW5hYmxlZEtleXMgPSBbXSwgY29sb3JMZXZlbHMgPSA5IH0gPSBvcHRpb25zIHx8IHt9O1xuXG4gIGNvbnN0IHJlc3VsdDogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9O1xuICBPYmplY3QuZW50cmllcyhvcmlnaW4pLmZvckVhY2goKFtrZXksIHZhbHVlXSkgPT4ge1xuICAgIGNvbnN0IGNzc2tleSA9IGAtLSR7cHJlZml4fSR7a2V5fWA7XG4gICAgY29uc3QgdmFsdWVUb1JnYmEgPSB0b1JnYmEodmFsdWUpO1xuXG4gICAgLy8gXHU5ODlDXHU4MjcyIENTUyBcdTUzRDhcdTkxQ0ZcdTc1MjggcmdiIFx1NUI1N1x1N0IyNlx1NEUzMigyNTUsMjU1LDI1NSlcdTc2ODRcdTY1QjlcdTVGMEZcdTg4NjhcdTc5M0FcdUZGMENcdTk3NUVcdTk4OUNcdTgyNzIgQ1NTIFx1NTNEOFx1OTFDRlx1NEUwRFx1NTA1QVx1OEY2Q1x1NTMxNlx1MzAwMlxuICAgIGNvbnN0IGZpbmFsVmFsdWUgPSB2YWx1ZVRvUmdiYSA/IHZhbHVlVG9SZ2JhLnJnYlR4dCA6IHZhbHVlO1xuICAgIHJlc3VsdFtjc3NrZXldID0gZmluYWxWYWx1ZTtcblxuICAgIC8vIFx1NUJGOVx1NjMwN1x1NUI5QVx1NzY4NFx1OTUyRVx1NTQwRFx1NzUxRlx1NjIxMFx1ODI3Mlx1OTYzNlx1NTNEOFx1OTFDRlxuICAgIGlmICh2YWx1ZVRvUmdiYSAmJiBjb2xvckxldmVsc0VuYWJsZWRLZXlzLmluY2x1ZGVzKGtleSBhcyBLKSkge1xuICAgICAgY29uc3QgcmdiTGV2ZWxzID0gZ2VuZXJhdGVSZ2JDb2xvckxldmVscyh2YWx1ZVRvUmdiYSwgY29sb3JMZXZlbHMpO1xuICAgICAgcmdiTGV2ZWxzLmxpZ2h0LmZvckVhY2goKGxpZ2h0LCBpbmRleCkgPT4ge1xuICAgICAgICBjb25zdCBkYXJrID0gcmdiTGV2ZWxzLmRhcmtbaW5kZXhdO1xuICAgICAgICByZXN1bHRbYCR7Y3Nza2V5fS1saWdodC0ke2luZGV4ICsgMX1gXSA9IGxpZ2h0LnJnYlR4dDtcbiAgICAgICAgcmVzdWx0W2Ake2Nzc2tleX0tZGFyay0ke2luZGV4ICsgMX1gXSA9IGRhcmsucmdiVHh0O1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gcmVzdWx0IGFzIENzc1Zhck9iamVjdDxULCBLLCBQPjtcbn1cblxuLyoqXG4gKiBcdTVDMDYgY3NzIFx1NTNEOFx1OTFDRlx1NUJGOVx1OEM2MVx1OEY2Q1x1NjM2Mlx1NEUzQSBjc3MgXHU2ODM3XHU1RjBGXHU1QjU3XHU3QjI2XHU0RTMyXG4gKiBAcGFyYW0gY3NzVmFycyBDU1MgXHU1M0Q4XHU5MUNGXHU1QkY5XHU4QzYxXG4gKiBAcGFyYW0gc2VsZWN0b3IgXHU1RTk0XHU3NTI4XHU2ODM3XHU1RjBGXHU3Njg0XHU5MDA5XHU2MkU5XHU1NjY4XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjc3NWYXJzVG9TdHJpbmcoY3NzVmFyczogUmVjb3JkPHN0cmluZywgYW55Piwgc2VsZWN0b3I6IHN0cmluZyA9ICc6cm9vdCcpIHtcbiAgbGV0IHJlc3VsdCA9IGAke3NlbGVjdG9yfXtgO1xuXG4gIE9iamVjdC5lbnRyaWVzKGNzc1ZhcnMpLmZvckVhY2goKFtrZXksIHZhbHVlXSkgPT4ge1xuICAgIHJlc3VsdCArPSBgJHtrZXl9OiAke3ZhbHVlfTtgO1xuICB9KTtcbiAgcmVzdWx0ICs9ICd9JztcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqIFx1ODNCN1x1NTNENiBjc3MgXHU1M0Q4XHU5MUNGXHU1QjU3XHU3QjI2XHU0RTMyIHZhcih4eHh4eCkgKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDc3NWYXI8VCBleHRlbmRzIFJlY29yZDxzdHJpbmcsIGFueT4gPSBSZWNvcmQ8c3RyaW5nLCBhbnk+PihcbiAgbmFtZToga2V5b2YgVCxcbiAgcHJlZml4OiBzdHJpbmcgPSBERUZBVUxUX1BSRUZJWCxcbikge1xuICByZXR1cm4gYHZhcigtLSR7cHJlZml4fSR7bmFtZSBhcyBzdHJpbmd9KWA7XG59XG5cbi8qKiBcdTVDMDZcdTk4OUNcdTgyNzIgY3NzIFx1NTNEOFx1OTFDRlx1OEY2Q1x1NjM2Mlx1NEUzQVx1NjcwOVx1NjU0OFx1OTg5Q1x1ODI3Mlx1RkYxQTI1NSwyNTUsMjU1ID0+IHJnYmEoMjU1LDI1NSwyNTUsMSkgKi9cbmV4cG9ydCBmdW5jdGlvbiBjc3NWYXJUb1JnYmE8VCBleHRlbmRzIFJlY29yZDxzdHJpbmcsIGFueT4gPSBSZWNvcmQ8c3RyaW5nLCBhbnk+PihcbiAgbmFtZToga2V5b2YgVCxcbiAgYWxwaGE6IG51bWJlciA9IDEsXG4gIHByZWZpeDogc3RyaW5nID0gREVGQVVMVF9QUkVGSVgsXG4pIHtcbiAgcmV0dXJuIGByZ2JhKCR7Z2V0Q3NzVmFyKG5hbWUsIHByZWZpeCl9LCR7YWxwaGF9KWA7XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy93cnl0ZS93b3JrL25leGZ1cm9tYS11aS9wYWNrYWdlcy9zdHlsZXMvc3JjL3V0aWxzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvd3J5dGUvd29yay9uZXhmdXJvbWEtdWkvcGFja2FnZXMvc3R5bGVzL3NyYy91dGlscy90b1RoZW1lLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy93cnl0ZS93b3JrL25leGZ1cm9tYS11aS9wYWNrYWdlcy9zdHlsZXMvc3JjL3V0aWxzL3RvVGhlbWUudHNcIjtpbXBvcnQge1xuICBHZW5lcmF0ZUNzc1ZhcnNPcHRpb25zLCBEZWZhdWx0UHJlZml4LCBERUZBVUxUX1BSRUZJWCwgZ2V0Q3NzVmFyLFxufSBmcm9tICcuL2Nzc1ZhcnMnO1xuXG4vKipcbiAqIFx1NEUzQlx1OTg5OFx1NzUxRlx1NjIxMFx1OTAwOVx1OTg3OVxuICogQHR5cGVQYXJhbSB7QGxpbmsgR2VuZXJhdGVDc3NWYXJzT3B0aW9uc31cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBUb1RoZW1lT3B0aW9uczxLID0gc3RyaW5nLCBQIGV4dGVuZHMgc3RyaW5nID0gRGVmYXVsdFByZWZpeD5cbiAgZXh0ZW5kcyBHZW5lcmF0ZUNzc1ZhcnNPcHRpb25zPEssIFA+IHtcbiAgLyoqIFx1NEUzQlx1OTg5OFx1NzY4NFx1N0M3Qlx1NTIyQiAqL1xuICB0eXBlPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIFx1NjgzOVx1NjM2RVx1NEUzQlx1OTg5OFx1NTNEOFx1OTFDRlx1NzY4NFx1NTM5Rlx1NTlDQlx1NUJGOVx1OEM2MVx1RkYwQ1x1NzUxRlx1NjIxMCBVbm9DU1MgXHU3Njg0IFRoZW1lIFx1NUJGOVx1OEM2MVxuICogQHBhcmFtIG9yaWdpbiBcdTUzOUZcdTU5Q0JcdTRFM0JcdTk4OThcdTUzRDhcdTkxQ0ZcdTVCRjlcdThDNjFcbiAqIEBwYXJhbSBvcHRpb25zIFx1OTAwOVx1OTg3OSB7QGxpbmsgVG9UaGVtZU9wdGlvbnN9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b1RoZW1lPFxuICBUIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgYW55PiA9IFJlY29yZDxzdHJpbmcsIGFueT4sXG4gIEsgZXh0ZW5kcyBrZXlvZiBUID0ga2V5b2YgVCxcbiAgUCBleHRlbmRzIHN0cmluZyA9IERlZmF1bHRQcmVmaXgsXG4+KG9yaWdpbjogVCwgb3B0aW9ucz86IFRvVGhlbWVPcHRpb25zPEssIFA+KSB7XG4gIGNvbnN0IHtcbiAgICB0eXBlID0gJ2NvbG9yJyxcbiAgICBwcmVmaXggPSBERUZBVUxUX1BSRUZJWCxcbiAgICBjb2xvckxldmVsc0VuYWJsZWRLZXlzID0gW10sXG4gICAgY29sb3JMZXZlbHMgPSA5LFxuICB9ID0gb3B0aW9ucyB8fCB7fTtcblxuICAvLyBcdTRFQ0VcdTUzOUZcdTU5Q0JcdTVCRjlcdThDNjFcdTRFMkRcdThGQzdcdTZFRTRcdTUxRkFcdTdCMjZcdTU0MDhcdTY4M0NcdTVGMEZcdTc2ODRcdTk1MkVcdTUwM0NcbiAgY29uc3QgdGhlbWVSZWcgPSBuZXcgUmVnRXhwKGAke3R5cGV9LSguKikkYCk7XG4gIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhvcmlnaW4pXG4gICAgLmZpbHRlcigoa2V5KSA9PiB0aGVtZVJlZy50ZXN0KGtleSkpXG4gICAgLm1hcCgoa2V5KSA9PiBrZXkucmVwbGFjZSh0aGVtZVJlZywgJyQxJykpO1xuXG4gIGNvbnN0IHJlc3VsdDogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9O1xuICBrZXlzLmZvckVhY2goKGtleSkgPT4ge1xuICAgIC8vIFx1NEUzQlx1OTg5OFx1NUZDNVx1OTg3Qlx1N0IyNlx1NTQwOFx1N0M3Qlx1NEYzQyByZ2IodmFyKC0tbngtY29sb3ItcHJpbWFyeSkpIFx1NzY4NFx1NjgzQ1x1NUYwRlx1RkYwQ1x1OEZEOVx1NjgzNyBVbm9DU1MgXHU4MEZEXHU3NTFGXHU2MjEwXHU3Njg0XHU1MzlGXHU1QjUwXHU3QzdCXHU2NUUyXHU4MEZEXHU2NTJGXHU2MzAxIENTUyBcdTUzRDhcdTkxQ0ZcdUZGMENcdTUzQzhcdTgwRkRcdTY1MkZcdTYzMDFcdTkwMEZcdTY2MEVcdTVFQTZcdTRGRUVcdTY1MzlcbiAgICByZXN1bHRba2V5XSA9IGByZ2IoJHtnZXRDc3NWYXIoYCR7dHlwZX0tJHtrZXl9YCwgcHJlZml4KX0pYDtcblxuICAgIC8vIFx1NTkwNFx1NzQwNlx1ODI3Mlx1OTYzNlx1NEUzQlx1OTg5OFxuICAgIGlmICh0eXBlID09PSAnY29sb3InICYmIGNvbG9yTGV2ZWxzRW5hYmxlZEtleXMuaW5jbHVkZXMoYCR7dHlwZX0tJHtrZXl9YCBhcyBLKSkge1xuICAgICAgY29uc3QgbGlnaHRDb2xvcnM6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fTtcbiAgICAgIGNvbnN0IGRhcmtDb2xvcnM6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fTtcbiAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgY29sb3JMZXZlbHMgKyAxOyBpKyspIHtcbiAgICAgICAgbGlnaHRDb2xvcnNbYCR7aX1gXSA9IGByZ2IoJHtnZXRDc3NWYXIoYCR7dHlwZX0tJHtrZXl9LWxpZ2h0LSR7aX1gLCBwcmVmaXgpfSlgO1xuICAgICAgICBkYXJrQ29sb3JzW2Ake2l9YF0gPSBgcmdiKCR7Z2V0Q3NzVmFyKGAke3R5cGV9LSR7a2V5fS1kYXJrLSR7aX1gLCBwcmVmaXgpfSlgO1xuICAgICAgfVxuICAgICAgcmVzdWx0W2Ake2tleX1fbGlnaHRgXSA9IGxpZ2h0Q29sb3JzO1xuICAgICAgcmVzdWx0W2Ake2tleX1fZGFya2BdID0gZGFya0NvbG9ycztcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvd3J5dGUvd29yay9uZXhmdXJvbWEtdWkvcGFja2FnZXMvc3R5bGVzL3NyYy92YXJzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvd3J5dGUvd29yay9uZXhmdXJvbWEtdWkvcGFja2FnZXMvc3R5bGVzL3NyYy92YXJzL2J1dHRvbi50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvd3J5dGUvd29yay9uZXhmdXJvbWEtdWkvcGFja2FnZXMvc3R5bGVzL3NyYy92YXJzL2J1dHRvbi50c1wiO2ltcG9ydCB7IGdldENzc1ZhciwgY3NzVmFyVG9SZ2JhIH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHsgVGhlbWVDc3NWYXJzQ29uZmlnIH0gZnJvbSAnLi90aGVtZSc7XG5cbi8qKiBcdTYzMDlcdTk0QUVcdTdFQzRcdTRFRjZcdTc2ODRcdTRFM0JcdTk4OThcdTUzRDhcdTkxQ0ZcdTVCOUFcdTRFNDkgKi9cbmV4cG9ydCBjb25zdCBidXR0b25WYXJzID0ge1xuICAnYnV0dG9uLWNvbG9yJzogY3NzVmFyVG9SZ2JhPFRoZW1lQ3NzVmFyc0NvbmZpZz4oJ2NvbG9yLXJlZ3VsYXInKSxcbiAgJ2J1dHRvbi1iZy1jb2xvcic6IGNzc1ZhclRvUmdiYTxUaGVtZUNzc1ZhcnNDb25maWc+KCdjb2xvci1jYXJkJyksXG4gICdidXR0b24tYm9yZGVyLWNvbG9yJzogY3NzVmFyVG9SZ2JhPFRoZW1lQ3NzVmFyc0NvbmZpZz4oJ2NvbG9yLWJkX2Jhc2UnKSxcbiAgJ2J1dHRvbi1ob3Zlci1jb2xvcic6IGNzc1ZhclRvUmdiYTxUaGVtZUNzc1ZhcnNDb25maWc+KCdjb2xvci1wcmltYXJ5JyksXG4gICdidXR0b24taG92ZXItYmctY29sb3InOiBjc3NWYXJUb1JnYmEoJ2NvbG9yLXByaW1hcnktbGlnaHQtOScpLFxuICAnYnV0dG9uLWhvdmVyLWJvcmRlci1jb2xvcic6IGNzc1ZhclRvUmdiYSgnY29sb3ItcHJpbWFyeS1saWdodC03JyksXG4gICdidXR0b24tYWN0aXZlLWNvbG9yJzogY3NzVmFyVG9SZ2JhPFRoZW1lQ3NzVmFyc0NvbmZpZz4oJ2NvbG9yLXByaW1hcnknKSxcbiAgJ2J1dHRvbi1hY3RpdmUtYmctY29sb3InOiBjc3NWYXJUb1JnYmEoJ2NvbG9yLXByaW1hcnktbGlnaHQtOScpLFxuICAnYnV0dG9uLWFjdGl2ZS1ib3JkZXItY29sb3InOiBjc3NWYXJUb1JnYmE8VGhlbWVDc3NWYXJzQ29uZmlnPignY29sb3ItcHJpbWFyeScpLFxuICAnYnV0dG9uLWRpc2FibGVkLWNvbG9yJzogY3NzVmFyVG9SZ2JhPFRoZW1lQ3NzVmFyc0NvbmZpZz4oJ2NvbG9yLXBsYWNlaG9sZGVyJyksXG4gICdidXR0b24tZGlzYWJsZWQtYmctY29sb3InOiBjc3NWYXJUb1JnYmE8VGhlbWVDc3NWYXJzQ29uZmlnPignY29sb3ItY2FyZCcpLFxuICAnYnV0dG9uLWRpc2FibGVkLWJvcmRlci1jb2xvcic6IGNzc1ZhclRvUmdiYTxUaGVtZUNzc1ZhcnNDb25maWc+KCdjb2xvci1iZF9saWdodCcpLFxuICAnYnV0dG9uLXBhZGRpbmcteCc6IGdldENzc1ZhcjxUaGVtZUNzc1ZhcnNDb25maWc+KCdzcGFjaW5nLW1kJyksXG4gICdidXR0b24tcGFkZGluZy15JzogZ2V0Q3NzVmFyPFRoZW1lQ3NzVmFyc0NvbmZpZz4oJ3NwYWNpbmcteHMnKSxcbn07XG5cbi8qKiBcdTYzMDlcdTk0QUVcdTdFQzRcdTRFRjZcdTRFM0JcdTk4OThcdTUzRDhcdTkxQ0ZcdTdDN0JcdTU3OEIgKi9cbmV4cG9ydCB0eXBlIEJ1dHRvbkNzc1ZhcnNDb25maWcgPSBQYXJ0aWFsPHR5cGVvZiBidXR0b25WYXJzPjtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3dyeXRlL3dvcmsvbmV4ZnVyb21hLXVpL3BhY2thZ2VzL3N0eWxlcy9zcmMvdmFyc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3dyeXRlL3dvcmsvbmV4ZnVyb21hLXVpL3BhY2thZ2VzL3N0eWxlcy9zcmMvdmFycy9pbnB1dC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvd3J5dGUvd29yay9uZXhmdXJvbWEtdWkvcGFja2FnZXMvc3R5bGVzL3NyYy92YXJzL2lucHV0LnRzXCI7aW1wb3J0IHsgZ2V0Q3NzVmFyLCBjc3NWYXJUb1JnYmEgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgeyBUaGVtZUNzc1ZhcnNDb25maWcgfSBmcm9tICcuL3RoZW1lJztcblxuLyoqIFx1OEY5M1x1NTE2NVx1N0VDNFx1NEVGNlx1NzY4NFx1NEUzQlx1OTg5OFx1NTNEOFx1OTFDRlx1NUI5QVx1NEU0OSAqL1xuZXhwb3J0IGNvbnN0IGlucHV0VmFycyA9IHtcbiAgJ2lucHV0LWNvbG9yJzogY3NzVmFyVG9SZ2JhPFRoZW1lQ3NzVmFyc0NvbmZpZz4oJ2NvbG9yLXJlZ3VsYXInKSxcbiAgJ2lucHV0LWJnLWNvbG9yJzogY3NzVmFyVG9SZ2JhPFRoZW1lQ3NzVmFyc0NvbmZpZz4oJ2NvbG9yLWNhcmQnKSxcbiAgJ2lucHV0LWJvcmRlci1jb2xvcic6IGNzc1ZhclRvUmdiYTxUaGVtZUNzc1ZhcnNDb25maWc+KCdjb2xvci1iZF9iYXNlJyksXG4gICdpbnB1dC1ob3Zlci1iZC1jb2xvcic6IGNzc1ZhclRvUmdiYTxUaGVtZUNzc1ZhcnNDb25maWc+KCdjb2xvci1zZWNvbmRhcnknKSxcbiAgJ2lucHV0LWZvY3VzLWJkLWNvbG9yJzogY3NzVmFyVG9SZ2JhPFRoZW1lQ3NzVmFyc0NvbmZpZz4oJ2NvbG9yLXByaW1hcnknKSxcbiAgJ2lucHV0LWRpc2FibGVkLWNvbG9yJzogY3NzVmFyVG9SZ2JhPFRoZW1lQ3NzVmFyc0NvbmZpZz4oJ2NvbG9yLXBsYWNlaG9sZGVyJyksXG4gICdpbnB1dC1kaXNhYmxlZC1iZy1jb2xvcic6IGNzc1ZhclRvUmdiYTxUaGVtZUNzc1ZhcnNDb25maWc+KCdjb2xvci1jYXJkJyksXG4gICdpbnB1dC1hY3RpdmUtYmctY29sb3InOiBjc3NWYXJUb1JnYmE8VGhlbWVDc3NWYXJzQ29uZmlnPignY29sb3ItaGVhZGVyJyksXG4gICdpbnB1dC1wbGFjZWhvbGRlci1jb2xvcic6IGNzc1ZhclRvUmdiYTxUaGVtZUNzc1ZhcnNDb25maWc+KCdjb2xvci1wbGFjZWhvbGRlcicpLFxuICAnaW5wdXQtcGFkZGluZy14JzogZ2V0Q3NzVmFyPFRoZW1lQ3NzVmFyc0NvbmZpZz4oJ3NwYWNpbmctbWQnKSxcbiAgJ2lucHV0LXBhZGRpbmcteSc6IGdldENzc1ZhcjxUaGVtZUNzc1ZhcnNDb25maWc+KCdzcGFjaW5nLXhzJyksXG4gICdpbnB1dC1ib3JkZXItcmFkaXVzJzogZ2V0Q3NzVmFyPFRoZW1lQ3NzVmFyc0NvbmZpZz4oJ2JvcmRlci1yYWRpdXMteHMnKSxcbn07XG5cbi8qKiBcdThGOTNcdTUxNjVcdTdFQzRcdTRFRjZcdTRFM0JcdTk4OThcdTUzRDhcdTkxQ0ZcdTdDN0JcdTU3OEIgKi9cbmV4cG9ydCB0eXBlIElucHV0Q3NzVmFyc0NvbmZpZyA9IFBhcnRpYWw8dHlwZW9mIGlucHV0VmFycz47XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy93cnl0ZS93b3JrL25leGZ1cm9tYS11aS9wYWNrYWdlcy9zdHlsZXMvc3JjL3Vub2Nzc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3dyeXRlL3dvcmsvbmV4ZnVyb21hLXVpL3BhY2thZ2VzL3N0eWxlcy9zcmMvdW5vY3NzL2Jhc2UudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3dyeXRlL3dvcmsvbmV4ZnVyb21hLXVpL3BhY2thZ2VzL3N0eWxlcy9zcmMvdW5vY3NzL2Jhc2UudHNcIjtpbXBvcnQgeyBVc2VyQ29uZmlnIH0gZnJvbSAndW5vY3NzJztcbmltcG9ydCB7IFRoZW1lIH0gZnJvbSAndW5vY3NzL3ByZXNldC1taW5pJztcbmltcG9ydCB7IHRoZW1lQ29sb3JzLCB0aGVtZUNvbG9yTGV2ZWxzRW5hYmxlZEtleXMsIHRoZW1lU3BhY2luZyB9IGZyb20gJy4uL3ZhcnMnO1xuaW1wb3J0IHsgdG9UaGVtZSB9IGZyb20gJy4uL3V0aWxzJztcblxuZXhwb3J0IGNvbnN0IGJhc2VDb25maWc6IFVzZXJDb25maWc8VGhlbWU+ID0ge1xuICAvLyBcdTk3MDBcdTg5ODFcdTUxNjhcdTVDNDBcdTc1MUZcdTY1NDhcdTc2ODRcdTRFM0JcdTk4OThcbiAgdGhlbWU6IHtcbiAgICAvLyBcdTk4OUNcdTgyNzJcdTRFM0JcdTk4OThcbiAgICBjb2xvcnM6IHRvVGhlbWUodGhlbWVDb2xvcnMsIHtcbiAgICAgIHR5cGU6ICdjb2xvcicsXG4gICAgICBjb2xvckxldmVsc0VuYWJsZWRLZXlzOiB0aGVtZUNvbG9yTGV2ZWxzRW5hYmxlZEtleXMsXG4gICAgICBjb2xvckxldmVsczogOSxcbiAgICB9KSxcbiAgICAvLyBcdThGQjlcdThERERcdTc2RjhcdTUxNzNcdTRFM0JcdTk4OThcbiAgICBzcGFjaW5nOiB0b1RoZW1lKHRoZW1lU3BhY2luZywge1xuICAgICAgdHlwZTogJ3NwYWNpbmcnLFxuICAgIH0pLFxuICB9LFxufTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3dyeXRlL3dvcmsvbmV4ZnVyb21hLXVpL3BhY2thZ2VzL3N0eWxlcy9zcmMvdW5vY3NzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvd3J5dGUvd29yay9uZXhmdXJvbWEtdWkvcGFja2FnZXMvc3R5bGVzL3NyYy91bm9jc3MvdGhlbWUudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3dyeXRlL3dvcmsvbmV4ZnVyb21hLXVpL3BhY2thZ2VzL3N0eWxlcy9zcmMvdW5vY3NzL3RoZW1lLnRzXCI7aW1wb3J0IHsgVXNlckNvbmZpZyB9IGZyb20gJ3Vub2Nzcyc7XG5pbXBvcnQgeyBUaGVtZSB9IGZyb20gJ3Vub2Nzcy9wcmVzZXQtbWluaSc7XG5pbXBvcnQgeyB0aGVtZVZhcnMsIHRoZW1lQ29sb3JMZXZlbHNFbmFibGVkS2V5cyB9IGZyb20gJy4uL3ZhcnMnO1xuaW1wb3J0IHsgZ2VuZXJhdGVDc3NWYXJzLCBjc3NWYXJzVG9TdHJpbmcgfSBmcm9tICcuLi91dGlscyc7XG5cbi8qKiBcdTRFM0JcdTk4OThcdTkwRThcdTUyMDZcdTk4ODRcdThCQkUgKi9cbmV4cG9ydCBjb25zdCB0aGVtZUNvbmZpZzogVXNlckNvbmZpZzxUaGVtZT4gPSB7XG4gIHByZWZsaWdodHM6IFtcbiAgICB7XG4gICAgICAvLyBcdTU3MjhcdTc1MUZcdTYyMTBcdTc2ODQgY3NzIFx1NjgzN1x1NUYwRlx1NjU4N1x1NEVGNlx1NEUyRFx1NTg2Qlx1NTE2NVx1NjI0MFx1NjcwOVx1NEUzQlx1OTg5OFx1NTNEOFx1OTFDRlx1NzY4NFx1NUI5QVx1NEU0OVxuICAgICAgZ2V0Q1NTOiAoKSA9PiBjc3NWYXJzVG9TdHJpbmcoXG4gICAgICAgIGdlbmVyYXRlQ3NzVmFycyh0aGVtZVZhcnMsIHtcbiAgICAgICAgICBjb2xvckxldmVsc0VuYWJsZWRLZXlzOiB0aGVtZUNvbG9yTGV2ZWxzRW5hYmxlZEtleXMsXG4gICAgICAgICAgY29sb3JMZXZlbHM6IDksXG4gICAgICAgIH0pLFxuICAgICAgKSxcbiAgICB9LFxuICBdLFxufTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3dyeXRlL3dvcmsvbmV4ZnVyb21hLXVpL3BhY2thZ2VzL3N0eWxlcy9zcmMvdW5vY3NzL2J1dHRvblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3dyeXRlL3dvcmsvbmV4ZnVyb21hLXVpL3BhY2thZ2VzL3N0eWxlcy9zcmMvdW5vY3NzL2J1dHRvbi9pbmRleC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvd3J5dGUvd29yay9uZXhmdXJvbWEtdWkvcGFja2FnZXMvc3R5bGVzL3NyYy91bm9jc3MvYnV0dG9uL2luZGV4LnRzXCI7Ly8gcGFja2FnZXMvc3R5bGVzL3NyYy91bm9jc3MvYnV0dG9uL2luZGV4LnRzXG5pbXBvcnQgeyBVc2VyQ29uZmlnIH0gZnJvbSAndW5vY3NzJztcbmltcG9ydCB7IGJ1dHRvblZhcnMgfSBmcm9tICcuLi8uLi92YXJzJztcbmltcG9ydCB7XG4gIGNzc1ZhcnNUb1N0cmluZyxcbiAgZ2VuZXJhdGVDc3NWYXJzLFxufSBmcm9tICcuLi8uLi91dGlscyc7XG4vLyBpbXBvcnQgeyB0b1NhZmVMaXN0IH0gZnJvbSAnLi4vdXRpbHMnO1xuLy8gaW1wb3J0IHsgYnV0dG9uU2hvcnRjdXRzIH0gZnJvbSAnLi9zaG9ydGN1dHMnO1xuLy8gaW1wb3J0IHsgYnV0dG9uUnVsZXMgfSBmcm9tICcuL3J1bGVzJztcblxuZXhwb3J0IGNvbnN0IGJ1dHRvbkNvbmZpZzogVXNlckNvbmZpZyA9IHtcbiAgLypcbiAgcnVsZXM6IGJ1dHRvblJ1bGVzLFxuICBzaG9ydGN1dHM6IGJ1dHRvblNob3J0Y3V0cyxcbiAgc2FmZWxpc3Q6IFtcbiAgICAuLi50b1NhZmVMaXN0KGJ1dHRvblJ1bGVzKSxcbiAgICAuLi50b1NhZmVMaXN0KGJ1dHRvblNob3J0Y3V0cyksXG4gIF0sXG4gICovXG4gIHByZWZsaWdodHM6IFtcbiAgICB7XG4gICAgICBnZXRDU1M6ICgpID0+IGNzc1ZhcnNUb1N0cmluZyhcbiAgICAgICAgZ2VuZXJhdGVDc3NWYXJzKGJ1dHRvblZhcnMpLFxuICAgICAgKSxcbiAgICB9LFxuICBdLFxufTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3dyeXRlL3dvcmsvbmV4ZnVyb21hLXVpL3BhY2thZ2VzL3N0eWxlcy9zcmMvdW5vY3NzL2lucHV0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvd3J5dGUvd29yay9uZXhmdXJvbWEtdWkvcGFja2FnZXMvc3R5bGVzL3NyYy91bm9jc3MvaW5wdXQvaW5kZXgudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3dyeXRlL3dvcmsvbmV4ZnVyb21hLXVpL3BhY2thZ2VzL3N0eWxlcy9zcmMvdW5vY3NzL2lucHV0L2luZGV4LnRzXCI7Ly8gcGFja2FnZXMvc3R5bGVzL3NyYy91bm9jc3MvaW5wdXQvaW5kZXgudHNcbmltcG9ydCB7IFVzZXJDb25maWcgfSBmcm9tICd1bm9jc3MnO1xuaW1wb3J0IHsgaW5wdXRWYXJzIH0gZnJvbSAnLi4vLi4vdmFycyc7XG5pbXBvcnQgeyBjc3NWYXJzVG9TdHJpbmcsIGdlbmVyYXRlQ3NzVmFycyB9IGZyb20gJy4uLy4uL3V0aWxzJztcblxuZXhwb3J0IGNvbnN0IGlucHV0Q29uZmlnOiBVc2VyQ29uZmlnID0ge1xuICBwcmVmbGlnaHRzOiBbXG4gICAge1xuICAgICAgZ2V0Q1NTOiAoKSA9PiBjc3NWYXJzVG9TdHJpbmcoZ2VuZXJhdGVDc3NWYXJzKGlucHV0VmFycykpLFxuICAgIH0sXG4gIF0sXG59O1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvd3J5dGUvd29yay9uZXhmdXJvbWEtdWkvcGFja2FnZXMvY29uZmlnLXByb3ZpZGVyXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvd3J5dGUvd29yay9uZXhmdXJvbWEtdWkvcGFja2FnZXMvY29uZmlnLXByb3ZpZGVyL3ZpdGUuY29uZmlnLm10c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvd3J5dGUvd29yay9uZXhmdXJvbWEtdWkvcGFja2FnZXMvY29uZmlnLXByb3ZpZGVyL3ZpdGUuY29uZmlnLm10c1wiOy8vIHBhY2thZ2VzL2NvbmZpZy1wcm92aWRlci92aXRlLmNvbmZpZy50c1xuaW1wb3J0IHsgZ2VuZXJhdGVWdWVDb25maWcgfSBmcm9tICcuLi9idWlsZC9zY3JpcHRzJztcblxuZXhwb3J0IGRlZmF1bHQgZ2VuZXJhdGVWdWVDb25maWcoe1xuICBwcmVzZXROZXhmdXJvbWF1aU9wdGlvbnM6IHtcbiAgICAvLyBjb25maWctcHJvdmlkZXIgXHU3RUM0XHU0RUY2XHU2NjgyXHU2NUY2XHU2Q0ExXHU2NzA5IFVub0NTUyBcdTY4MzdcdTVGMEZcdTk4ODRcdThCQkVcbiAgICBpbmNsdWRlOiBbXSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFzVyxTQUFTLG1CQUErQjs7O0FDQTNELFNBQVMsU0FBUyxTQUFpQjtBQUNwWCxRQUFNLE1BQU07QUFDWixTQUFPLFFBQVEsTUFBTSxHQUFHLEtBQWUsQ0FBQztBQUMxQztBQUdPLFNBQVMsVUFBVSxTQUFpQjtBQUN6QyxRQUFNLFVBQVUsU0FBUyxPQUFPO0FBQ2hDLFNBQU8sUUFBUSxJQUFJLENBQUMsU0FBUyxLQUFLLFlBQVksQ0FBQyxFQUFFLEtBQUssR0FBRztBQUMzRDtBQUdPLFNBQVMsVUFBVSxTQUFpQix1QkFBdUIsT0FBTztBQUN2RSxRQUFNLFVBQVUsU0FBUyxPQUFPO0FBQ2hDLFNBQU8sUUFDSixJQUFJLENBQUMsTUFBTSxVQUFVO0FBQ3BCLFFBQUksVUFBVSxLQUFLLENBQUMsc0JBQXNCO0FBQ3hDLGFBQU8sS0FBSyxZQUFZO0FBQUEsSUFDMUI7QUFDQSxXQUFPLEtBQUssT0FBTyxDQUFDLEVBQUUsWUFBWSxJQUFJLEtBQUssTUFBTSxDQUFDLEVBQUUsWUFBWTtBQUFBLEVBQ2xFLENBQUMsRUFDQSxLQUFLLEVBQUU7QUFDWjs7O0FDdEIwVixTQUFTLGFBQWEsS0FBYztBQUM1WCxTQUFPLFFBQVEsUUFBUSxPQUFPLFFBQVE7QUFDeEM7QUFFTyxTQUFTLFdBQVcsS0FBK0I7QUFDeEQsU0FBTyxPQUFPLFFBQVE7QUFDeEI7OztBQ0xBLFNBQVMsVUFBVSxTQUFTLFdBQVc7QUFHaEMsU0FBUyxXQUFXLFVBQWtCO0FBQzNDLFNBQU8sSUFBSSxVQUFvQixjQUFjLFFBQVEsVUFBVSxHQUFHLEtBQUssQ0FBQztBQUMxRTtB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QSxVQUVaLHNCQUFzQjtBQUFBLFFBQ3hCO0FBQUEsTUFDRixDQUFDLElBQ0Q7QUFBQSxJQUNKO0FBQUEsRUFDRjtBQUVBLFFBQU0sZ0JBQXVDO0FBQUEsSUFDM0MsV0FBVztBQUFBO0FBQUEsSUFFWCxVQUFVLENBQUMsS0FBSyxZQUFZO0FBQzFCLFlBQU0sVUFBa0M7QUFBQSxRQUN0QyxlQUFlLE9BQU8sT0FBTyxRQUFRLFFBQVEsV0FBVyxHQUFHLEtBQUs7QUFBQSxNQUNsRTtBQUNBLGFBQU8sT0FBTyxJQUFJLFNBQWdDLE9BQU87QUFBQSxJQUMzRDtBQUFBLEVBQ0Y7QUFFQSxRQUFNLE1BQU0sTUFBTUM7QUFBQSxJQUNoQjtBQUFBLE1BQ0UsR0FBRztBQUFBLE1BQ0gsR0FBRztBQUFBLElBQ0w7QUFBQSxJQUNBQyxhQUFZLGNBQWMsY0FBYyxDQUFDLENBQUM7QUFBQSxFQUM1QztBQUVBLFNBQU87QUFDVDs7O0FZbkVBLElBQU8sc0JBQVEsa0JBQWtCO0FBQUEsRUFDL0IsMEJBQTBCO0FBQUE7QUFBQSxJQUV4QixTQUFTLENBQUM7QUFBQSxFQUNaO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFsiZGVmYXVsdE9wdGlvbnMiLCAiZ2VuZXJhdGVDb25maWciLCAibWVyZ2VDb25maWciLCAiZ2VuZXJhdGVDb25maWciLCAibWVyZ2VDb25maWciXQp9Cg==
