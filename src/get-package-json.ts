import { join, resolve } from 'path';
import { readJsonSync } from 'fs-extra';
import type { LintTodoPackageJson } from './types';

export function getPackageJson(
  basePath: string = process.cwd()
): LintTodoPackageJson {
  let package_ = {};
  const packageJsonPath = join(resolve(basePath), 'package.json');

  try {
    package_ = readJsonSync(packageJsonPath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(
        `The ${resolve(
          basePath
        )} directory does not contain a package.json file.`
      );
    }
  }

  return package_;
}
