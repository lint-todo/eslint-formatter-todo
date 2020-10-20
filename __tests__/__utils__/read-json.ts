import { ESLint } from 'eslint';
import { promises } from 'fs';

export async function readJson(path: string): Promise<ESLint.LintResult[]> {
  const results = await promises.readFile(path, 'utf-8');
  return JSON.parse(results);
}
