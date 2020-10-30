import { readFileSync } from 'fs';
import { join } from 'path';

const cache: Map<string, string> = new Map();

export function readFile(fileName: string): string {
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
