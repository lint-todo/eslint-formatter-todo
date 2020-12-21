import {
  buildTodoData,
  getTodoStorageDirPath,
  readTodos,
  todoStorageDirExists,
} from '@ember-template-lint/todo-utils';
import { existsSync } from 'fs';
import { DirResult, dirSync } from 'tmp';
import { TODO_SEVERITY } from '../../src/constants';
import { formatterAsync, transformResults } from '../../src/formatter';
import fixtures from '../__fixtures__/fixtures';
import { deepCopy } from '../__utils__/deep-copy';
import { setUpdateTodoEnv } from '../__utils__/set-env';

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
    process.env = INITIAL_ENV;
  });

  it('SHOULD NOT generate a TODO dir with todo files when UPDATE_TODO is set to 0', async () => {
    setUpdateTodoEnv(false);

    const results = fixtures.eslintWithErrors(tmpDir.name);

    await formatterAsync(results);

    const todoDir = getTodoStorageDirPath(tmpDir.name);
    expect(existsSync(todoDir)).toBe(false);
  });

  it('SHOULD generate a TODO dir with todo files when UPDATE_TODO is set to 1', async () => {
    setUpdateTodoEnv(true);

    const results = fixtures.eslintWithErrors(tmpDir.name);

    await formatterAsync(results);

    expect(todoStorageDirExists(tmpDir.name)).toBe(true);

    const todos = await readTodos(tmpDir.name);

    expect(todos.size).toEqual(18);
  });

  it('SHOULD not mutate errors if a todo dir is not present', async () => {
    setUpdateTodoEnv(false);

    const results = fixtures.eslintWithErrors(tmpDir.name);
    const expected = deepCopy(results);

    await formatterAsync(results);

    expect(results).toEqual(expected);
  });

  it('SHOULD mutate errors when a todo dir is present', async () => {
    setUpdateTodoEnv(true);

    const results = fixtures.eslintWithErrors(tmpDir.name);
    const notExpected = deepCopy(results);

    await formatterAsync(results);

    expect(results).not.toEqual(notExpected);
  });

  it('changes only the errors that are also present in the todo map to todos', async () => {
    const results = fixtures.eslintWithErrors(tmpDir.name);

    // build todo map but without the last result in the results array (so they differ)
    const todoResults = [...results];
    const lastResult = todoResults.pop();
    const todos = buildTodoData(tmpDir.name, todoResults);

    transformResults(tmpDir.name, results, todos);

    // last result should stay unchanged
    expect(results[results.length - 1]).toEqual(lastResult);

    // everything else should be mutated
    results.forEach((result, resultIndex) => {
      if (resultIndex === results.length - 1) {
        return;
      }

      expect(result.errorCount).toEqual(0);
      expect(result.warningCount).toEqual(
        result.warningCount + result.errorCount
      );
      expect(result.fixableErrorCount).toEqual(0);
      expect(result.fixableWarningCount).toEqual(
        result.fixableWarningCount + result.fixableErrorCount
      );

      result.messages.forEach((message) => {
        expect(message.severity).toEqual(TODO_SEVERITY);
      });
    });
  });
});
