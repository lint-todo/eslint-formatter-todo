import { getTodoStorageDirPath } from '@ember-template-lint/todo-utils';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { DirResult, dirSync } from 'tmp';
import { formatResultsAsync } from '../src/format-results';
import fixtures from './__fixtures__/fixtures';
import { deepCopy } from './__utils__/deep-copy';
import { setUpdateTodoEnv } from './__utils__/set-env';

describe('format-results', () => {
  const INITIAL_ENV = process.env;

  let tmpDir: DirResult;

  beforeEach(() => {
    tmpDir = dirSync({ unsafeCleanup: true });
    process.stdout.write = jest.fn();
    process.env = { ...INITIAL_ENV, ESLINT_TODO_DIR: tmpDir.name };
  });

  afterEach(() => {
    tmpDir.removeCallback();
  });

  afterAll(() => {
    process.env = INITIAL_ENV;
  });

  it('SHOULD NOT generate a TODO dir with todo files when UPDATE_TODO is set to 0', async () => {
    setUpdateTodoEnv(false);

    const results = fixtures.eslintWithErrors(tmpDir.name);

    await formatResultsAsync(results);

    const todoDir = getTodoStorageDirPath(tmpDir.name);
    expect(existsSync(todoDir)).toBe(false);
    expect(process.stdout.write).toHaveBeenCalledTimes(1);
  });

  it('SHOULD generate a TODO dir with todo files when UPDATE_TODO is set to 1', async () => {
    setUpdateTodoEnv(true);

    const results = fixtures.eslintWithErrors(tmpDir.name);

    await formatResultsAsync(results);

    const todoDir = getTodoStorageDirPath(tmpDir.name);
    expect(existsSync(todoDir)).toBe(true);

    const todoSubdirs = readdirSync(todoDir);
    expect(todoSubdirs).toHaveLength(6);

    todoSubdirs.forEach((subdir) => {
      const files = readdirSync(join(todoDir, subdir));
      expect(files.length).toBeGreaterThan(0);
    });

    expect(process.stdout.write).toHaveBeenCalledTimes(1);
  });

  it('SHOULD not mutate errors if a todo dir is not present', async () => {
    setUpdateTodoEnv(false);

    const results = fixtures.eslintWithErrors(tmpDir.name);
    const expected = deepCopy(results);

    await formatResultsAsync(results);

    expect(results).toEqual(expected);
  });

  it('SHOULD mutate errors when a todo dir is present', async () => {
    setUpdateTodoEnv(true);

    const results = fixtures.eslintWithErrors(tmpDir.name);
    const notExpected = deepCopy(results);

    await formatResultsAsync(results);

    expect(results).not.toEqual(notExpected);
  });
});
