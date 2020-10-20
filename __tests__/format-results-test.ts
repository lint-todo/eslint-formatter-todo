import { getTodoStorageDirPath } from '@ember-template-lint/todo-utils';
import { existsSync, readdirSync } from 'fs';
import { DirResult, dirSync } from 'tmp'; // eslint-disable-line node/no-unpublished-import
import { formatResultsAsync } from '../src/format-results';
import * as mutateErrorsToTodos from '../src/mutate-errors-to-todos';
import { readJson } from './__utils__/read-json';

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
    process.env.UPDATE_TODO = '0';

    const results = await readJson(
      require.resolve('./__fixtures__/eslint-with-errors.json')
    );

    await formatResultsAsync(results);

    const todoDir = getTodoStorageDirPath(tmpDir.name);
    expect(existsSync(todoDir)).toBe(false);
    expect(process.stdout.write).toHaveBeenCalledTimes(1);
  });

  it('SHOULD generate a TODO dir with todo files when UPDATE_TODO is set to 1', async () => {
    process.env.UPDATE_TODO = '1';

    const results = await readJson(
      require.resolve('./__fixtures__/eslint-with-errors.json')
    );

    await formatResultsAsync(results);

    const todoDir = getTodoStorageDirPath(tmpDir.name);
    expect(existsSync(todoDir)).toBe(true);
    expect(readdirSync(todoDir)).toHaveLength(6);
    expect(process.stdout.write).toHaveBeenCalledTimes(1);
  });

  it('SHOULD not call for mutation of errors if a todo dir is not present', async () => {
    process.env.UPDATE_TODO = '0';

    const results = await readJson(
      require.resolve('./__fixtures__/eslint-with-errors.json')
    );

    const spy = jest.spyOn(mutateErrorsToTodos, 'mutateTodoErrorsToTodos');

    await formatResultsAsync(results);

    expect(spy).not.toHaveBeenCalled();
  });

  it('SHOULD call for mutation of errors when a todo dir is present', async () => {
    process.env.UPDATE_TODO = '1';

    const results = await readJson(
      require.resolve('./__fixtures__/eslint-with-errors.json')
    );

    const spy = jest.spyOn(mutateErrorsToTodos, 'mutateTodoErrorsToTodos');

    await formatResultsAsync(results);

    expect(spy).toHaveBeenCalled();
  });
});
