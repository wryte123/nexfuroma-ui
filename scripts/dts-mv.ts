import { join } from 'node:path';
import { readdir, cp } from 'node:fs/promises';

// 以根目录为基础解析路径
const fromRoot = (...paths: string[]) => join(__dirname, '..', ...paths);

// 包的产物目录
const PKGS_DTS_DIR = fromRoot('dist/packages');

// 包目录
const PKGS_DIR = fromRoot('packages');

// 单个包相对产物
const PKG_DTS_RELATIVE_DIR = 'dist';

/** 包的代码入口相对目录 */
const PKG_ENTRY_RELATIVE_DIR = 'src';

async function main() {
  const pkgs = await match();
  const tasks = pkgs.map(resolve);
  await Promise.all(tasks);
}

async function match() {
  const res = await readdir(PKGS_DTS_DIR, { withFileTypes: true });
  return res.filter((item) => item.isDirectory()).map((item) => item.name);
}

async function resolve(pkgName: string) {
  try {
    const sourceDir = join(PKGS_DTS_DIR, pkgName, PKG_ENTRY_RELATIVE_DIR);
    const targetDir = join(PKGS_DIR, pkgName, PKG_DTS_RELATIVE_DIR);
    const sourceFiles = await readdir(sourceDir);
    const cpTasks = sourceFiles.map((file) => {
      const source = join(sourceDir, file);
      const target = join(targetDir, file);
      console.log(`[${pkgName}]: moving: ${source} => ${target}`);
      return cp(source, target, {
        force: true,
        recursive: true,
      });
    });
    await Promise.all(cpTasks);
    console.log(`[${pkgName}]: done`);
  } catch (e) {
    console.error(`[${pkgName}]: failed`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
