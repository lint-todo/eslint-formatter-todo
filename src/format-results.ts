import {
  getTodoStorageDirPath,
  readTodos,
  writeTodos,
} from '@ember-template-lint/todo-utils';
import type { ESLint } from 'eslint';
import { existsSync } from 'fs';
import { formatter } from './formatter';
import { mutateTodoErrorsToTodos } from './mutate-errors-to-todos';
import { TodoFormatterOptions } from './types';
import { getBasePath } from './utils';

function formatResults(results: ESLint.LintResult[]): void {
  // note: using async/await directly causes eslint to print `Promise { <pending> }`
  formatResultsAsync(results);
}

async function formatResultsAsync(results: ESLint.LintResult[]): Promise<void> {
  const shouldUpdateTodo = process.env.UPDATE_TODO === '1';
  const shouldIncludeTodo = process.env.INCLUDE_TODO === '1';

  if (shouldUpdateTodo) {
    await writeTodos(getBasePath(), results);
  }

  await report(results, { shouldIncludeTodo });
}

async function report(
  results: ESLint.LintResult[],
  options: TodoFormatterOptions
) {
  const todoDir = getTodoStorageDirPath(getBasePath());

  if (existsSync(todoDir)) {
    const todos = await readTodos(todoDir);
    await mutateTodoErrorsToTodos(results, todos);
  }

  process.stdout.write(formatter(results, options));
}

export { formatResults, formatResultsAsync };
