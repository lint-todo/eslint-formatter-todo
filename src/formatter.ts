import {
  applyTodoChanges,
  buildTodoData,
  getTodoBatches,
  getTodoStorageDirPath,
  readTodos,
  TodoData,
  todoFilePathFor,
  todoStorageDirExists,
  writeTodos,
  _buildTodoDatum,
} from '@ember-template-lint/todo-utils';
import type { ESLint, Linter } from 'eslint';
import { format } from './format';
import { TodoFormatterOptions, TodoResultMessage } from './types';
import { getBaseDir } from './get-base-dir';
import hasFlag from 'has-flag';
import { ERROR_SEVERITY, TODO_SEVERITY } from './constants';

export function formatter(results: ESLint.LintResult[]): void {
  // note: using async/await directly causes eslint to print `Promise { <pending> }`
  formatterAsync(results);
}

export async function formatterAsync(results: ESLint.LintResult[]): Promise<void> {
  const updateTodo = process.env.UPDATE_TODO === '1';
  const includeTodo = process.env.INCLUDE_TODO === '1';

  if (updateTodo) {
    await writeTodos(getBaseDir(), results);
  }

  await report(results, { includeTodo });
}

/**
 * Mutates all errors present in the todo dir to todos in the results array.
 *
 * @param results ESLint results array
 */
export async function transformResults(
  baseDir: string,
  results: ESLint.LintResult[],
  todoMap: Map<string, TodoData>
): Promise<void> {
  results.forEach((result) => {
    (result.messages as TodoResultMessage[]).forEach((message) => {
      if (message.severity !== ERROR_SEVERITY) {
        return;
      }

      // we only mutate errors that are present in the todo map, so check if it's there first
      const todoDatum = _buildTodoDatum(
        baseDir,
        result,
        message as Linter.LintMessage
      );

      const todoHash = todoFilePathFor(todoDatum);

      if (!todoMap.has(todoHash)) {
        return;
      }

      message.severity = TODO_SEVERITY;

      result.errorCount -= 1;
      result.todoCount = Number.isInteger(result.todoCount)
        ? result.todoCount + 1
        : 1;

      if (!message.fix) {
        return;
      }

      result.fixableErrorCount -= 1;
      result.fixableTodoCount = Number.isInteger(result.fixableTodoCount)
        ? result.fixableTodoCount + 1
        : 1;
    });
  });
}

async function report(
  results: ESLint.LintResult[],
  options: TodoFormatterOptions
) {
  const baseDir = getBaseDir();

  if (todoStorageDirExists(baseDir)) {
    const existingTodoFiles = await readTodos(baseDir);
    const [, itemsToRemoveFromTodos,] = await getTodoBatches(
      buildTodoData(baseDir, results),
      existingTodoFiles
    );

    if (itemsToRemoveFromTodos.size > 0) {
      if (hasFlag('fix')) {
        applyTodoChanges(getTodoStorageDirPath(baseDir), new Map(), itemsToRemoveFromTodos);
      } else {
        itemsToRemoveFromTodos.forEach((todo) => {
          pushResult(results, todo);
        });
      }
    }

    await transformResults(baseDir, results, existingTodoFiles);
  }

  process.stdout.write(format(results, options));
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