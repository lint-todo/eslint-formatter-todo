import {
  readTodos,
  todoStorageDirExists,
  writeTodos,
} from '@ember-template-lint/todo-utils';
import type { ESLint } from 'eslint';
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
  const includeTodo = process.env.INCLUDE_TODO === '1';

  if (shouldUpdateTodo) {
    await writeTodos(getBasePath(), results);
  }

  await report(results, { includeTodo });
}

async function report(
  results: ESLint.LintResult[],
  options: TodoFormatterOptions
) {
  const basePath = getBasePath();

  if (todoStorageDirExists(basePath)) {
    const todos = await readTodos(basePath);
    await mutateTodoErrorsToTodos(results, todos);
  }

  process.stdout.write(formatter(results, options));
}

export { formatResults, formatResultsAsync };
