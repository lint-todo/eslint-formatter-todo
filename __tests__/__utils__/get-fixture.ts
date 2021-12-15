import { join, resolve } from 'path';
import { ESLint } from 'eslint';
import { readFileSync, readJsonSync } from 'fs-extra';

const cache: Map<string, string> = new Map();

export function getStringFixture(fileName: string): string {
  if (cache.has(fileName)) {
    return cache.get(fileName) || '';
  }

  const contents = readFileSync(
    require.resolve(join('../__fixtures__/', fileName)),
    {
      encoding: 'utf8',
    }
  );

  cache.set(fileName, contents);

  return contents;
}

export function getObjectFixture<T extends ESLint.LintResult>(
  fileName: string,
  tmp: string
): T[] {
  const fixture = readJsonSync(
    resolve(join('./__tests__/__fixtures__/', fileName))
  );

  return updatePaths(
    tmp,
    Object.prototype.hasOwnProperty.call(fixture, 'results')
      ? fixture.results
      : fixture
  );
}

function updatePaths<T extends { filePath: string }>(
  path: string,
  data: T[]
): T[] {
  data.forEach((d) => (d.filePath = d.filePath.replace('{{path}}', path)));

  return data;
}
