import { readFileSync } from 'fs';
import { join } from 'path';

export function readFile(fileName: string): string {
  const cache: Map<string, string> = new Map();

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
