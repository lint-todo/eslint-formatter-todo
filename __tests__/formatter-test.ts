import { getTodoDirPath } from '@ember-template-lint/todo-utils';
import { existsSync, readdirSync } from 'fs';
import { DirResult, dirSync } from 'tmp'; // eslint-disable-line node/no-unpublished-import
import { formatResultsAsync } from '../src/formatter';
import { readJson } from './__utils__/read-json';

describe('formatter', () => {
  const INITIAL_ENV = process.env;
  let tmpDir: DirResult;

  beforeEach(() => {
    tmpDir = dirSync({ unsafeCleanup: true });
    process.env = { ...INITIAL_ENV, ESLINT_TODO_DIR: tmpDir.name };
  });

  afterEach(() => {
    tmpDir.removeCallback();
  });

  afterAll(() => {
    process.env = INITIAL_ENV;
  });

  it('SHOULD NOT generate a TODO dir with todo files when UPDATE_TODO is set to 0', async () => {
    process.env.UPDATE_TODO = '0';
    const results = await readJson(require.resolve('./__fixtures__/eslint-with-errors.json'));

    await formatResultsAsync(results);

    const todoDir = getTodoDirPath(tmpDir.name);
    expect(existsSync(todoDir)).toBe(false);
  });

  it('SHOULD generate a TODO dir with todo files when UPDATE_TODO is set to 1', async () => {
    process.env.UPDATE_TODO = '1';
    const results = await readJson(require.resolve('./__fixtures__/eslint-with-errors.json'));

    await formatResultsAsync(results);

    const todoDir = getTodoDirPath(tmpDir.name);
    expect(existsSync(todoDir)).toBe(true);
    expect(readdirSync(todoDir)).toHaveLength(18);
  });
});
