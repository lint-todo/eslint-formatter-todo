import {
  applyTodoChanges,
  buildTodoData,
  getTodoBatches,
  getTodoStorageDirPath,
  readTodos,
  TodoData,
  todoStorageDirExists,
  writeTodos,
} from '@ember-template-lint/todo-utils';
import type { ESLint, Linter } from 'eslint';
import { formatter } from './formatter';
import { mutateTodoErrorsToTodos } from './mutate-errors-to-todos';
import { TodoFormatterOptions } from './types';
import { getBaseDir } from './get-base-dir';
import hasFlag from 'has-flag';

function formatResults(results: ESLint.LintResult[]): void {
  // note: using async/await directly causes eslint to print `Promise { <pending> }`
  formatResultsAsync(results);
}

async function formatResultsAsync(results: ESLint.LintResult[]): Promise<void> {
  const updateTodo = process.env.UPDATE_TODO === '1';
  const includeTodo = process.env.INCLUDE_TODO === '1';

  if (updateTodo) {
    await writeTodos(getBaseDir(), results);
  }

  await report(results, { includeTodo });
}

async function report(
  results: ESLint.LintResult[],
  options: TodoFormatterOptions
) {
  const baseDir = getBaseDir();

  if (todoStorageDirExists(baseDir)) {
    const existingTodoFiles = await readTodos(baseDir);
    console.log(JSON.stringify(results, undefined, 2));
    const [, itemsToRemoveFromTodos,] = await getTodoBatches(
      buildTodoData(baseDir, results),
      existingTodoFiles
    );

    console.log('Items to remove:', itemsToRemoveFromTodos.size);
    console.log('Fix:', hasFlag('fix'));

    if (itemsToRemoveFromTodos.size > 0) {
      if (hasFlag('fix')) {
        applyTodoChanges(getTodoStorageDirPath(baseDir), new Map(), itemsToRemoveFromTodos);
      } else {
        itemsToRemoveFromTodos.forEach((todo) => {
          pushResult(results, todo);
        });
      }
    }

    await mutateTodoErrorsToTodos(baseDir, results, existingTodoFiles);
  }

  process.stdout.write(formatter(results, options));
}

function pushResult(results: ESLint.LintResult[], todo: TodoData) {
  const resultForFile = results.find((r: ESLint.LintResult) => r.filePath === todo.filePath);
  const result: Linter.LintMessage = {
    ruleId: 'invalid-todo-violation-rule',
    message: `Todo violation passes \`${todo.ruleId}\` rule. Please run \`--fix\` to remove this todo from the todo list.`,
    severity: 2,
    column: 0,
    line: 0,
  }

  if (resultForFile) {
    resultForFile.messages.push(result);
    resultForFile.errorCount += 1;
  } else {
    results.push({
      filePath: todo.filePath,
      messages: [result],
      errorCount: 1,
      warningCount: 0,
      todoCount: 0,
      fixableErrorCount: 0,
      fixableWarningCount: 0,
      fixableTodoCount: 0,
      usedDeprecatedRules: [],
    });
  }
}

export { formatResults, formatResultsAsync };
