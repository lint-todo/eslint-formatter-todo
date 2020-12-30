import {
  applyTodoChanges,
  buildTodoData,
  getTodoBatchesSync,
  getTodoStorageDirPath,
  readTodosSync,
  TodoData,
  todoFilePathFor,
  todoStorageDirExists,
  writeTodosSync,
  _buildTodoDatum,
} from '@ember-template-lint/todo-utils';

import { format } from './format';
import { getBaseDir } from './get-base-dir';
import { getDaysToDecay } from './get-todo-config';
import hasFlag from 'has-flag';

import type { ESLint, Linter } from 'eslint';
import { Severity, TodoFormatterOptions, TodoResultMessage } from './types';

export function formatter(results: ESLint.LintResult[]): string {
  const updateTodo = process.env.UPDATE_TODO === '1';
  const includeTodo = process.env.INCLUDE_TODO === '1';

  if (updateTodo) {
    writeTodosSync(getBaseDir(), results, getDaysToDecay());
  }

  return report(results, { includeTodo });
}

/**
 * Mutates all errors present in the todo dir to todos in the results array.
 *
 * @param results ESLint results array
 */
export function transformResults(
  baseDir: string,
  results: ESLint.LintResult[],
  todoMap: Map<string, TodoData>
): void {
  const today = new Date();

  results.forEach((result) => {
    (result.messages as TodoResultMessage[]).forEach((message) => {
      if (message.severity !== Severity.error) {
        return;
      }

      // we only mutate errors that are present in the todo map, so check if it's there first
      const todoDatum = _buildTodoDatum(
        baseDir,
        result,
        message as Linter.LintMessage
      );
      const todo = todoMap.get(todoFilePathFor(todoDatum));

      if (todo === undefined) {
        return;
      }

      if (todo.errorDate instanceof Date && today > todo.errorDate) {
        return;
      }

      if (todo.warnDate instanceof Date && today > todo.warnDate) {
        message.severity = Severity.warn;
        result.warningCount = result.warningCount + 1;

        if (message.fix) {
          result.fixableWarningCount = result.fixableWarningCount + 1;
          result.fixableErrorCount -= 1;
        }
      } else {
        message.severity = Severity.todo;
        result.todoCount = Number.isInteger(result.todoCount)
          ? result.todoCount + 1
          : 1;

        if (message.fix) {
          result.fixableTodoCount = Number.isInteger(result.fixableTodoCount)
            ? result.fixableTodoCount + 1
            : 1;
          result.fixableErrorCount -= 1;
        }
      }

      result.errorCount -= 1;
    });
  });
}

function report(results: ESLint.LintResult[], options: TodoFormatterOptions) {
  const baseDir = getBaseDir();

  if (todoStorageDirExists(baseDir)) {
    const existingTodoFiles = readTodosSync(baseDir);
    const [, todosToRemove, existingTodos] = getTodoBatchesSync(
      buildTodoData(baseDir, results),
      existingTodoFiles
    );

    if (todosToRemove.size > 0) {
      if (hasFlag('fix')) {
        applyTodoChanges(
          getTodoStorageDirPath(baseDir),
          new Map(),
          todosToRemove
        );
      } else {
        todosToRemove.forEach((todo) => {
          pushResult(results, todo);
        });
      }
    }

    transformResults(baseDir, results, existingTodos);
  }

  return format(results, options);
}

function pushResult(results: ESLint.LintResult[], todo: TodoData) {
  const resultForFile = results.find(
    (r: ESLint.LintResult) => r.filePath === todo.filePath
  );
  const result: Linter.LintMessage = {
    ruleId: 'invalid-todo-violation-rule',
    message: `Todo violation passes \`${todo.ruleId}\` rule. Please run \`--fix\` to remove this todo from the todo list.`,
    severity: 2,
    column: 0,
    line: 0,
  };

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
