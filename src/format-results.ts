import {
  getTodoStorageDirPath,
  readTodos,
  writeTodos,
} from '@ember-template-lint/todo-utils'; // eslint-disable-line node/no-unpublished-import
import { ESLint } from 'eslint';
import { existsSync } from 'fs-extra';
import { formatter } from './formatter';
import { mutateTodoErrorsToTodos } from './mutate-errors-to-todos';
import { getBasePath } from './utils';

function formatResults(results: ESLint.LintResult[]): void {
  // note: using async/await directly causes eslint to print `Promise { <pending> }`
  formatResultsAsync(results);
}

async function formatResultsAsync(results: ESLint.LintResult[]): Promise<void> {
  const shouldUpdateTodo = process.env.UPDATE_TODO === '1';
  const shouldIncludeTodo = process.env.INCLUDE_TODO === '1';

  if (shouldUpdateTodo || process.argv.includes('--fix')) {
    await writeTodos(getBasePath(), results);
  }

  await report(results, shouldIncludeTodo);
}

async function report(
  results: ESLint.LintResult[],
  shouldIncludeTodo?: boolean
) {
  const todoDir = getTodoStorageDirPath(getBasePath());

  if (existsSync(todoDir)) {
    const todoMap = await readTodos(todoDir);
    await mutateTodoErrorsToTodos(results, todoMap);
  }

  process.stdout.write(formatter(results, shouldIncludeTodo));
}

export { formatResults, formatResultsAsync };
