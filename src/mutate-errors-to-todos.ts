import {
  TodoData,
  todoFilePathFor,
  _buildTodoDatum,
} from '@ember-template-lint/todo-utils';
import type { ESLint, Linter } from 'eslint';
import type { TodoResultMessage } from './types';

/**
 * Mutates all errors present in the todo dir to todos in the results array.
 * @param results ESLint results array
 */
export async function mutateTodoErrorsToTodos(
  baseDir: string,
  results: ESLint.LintResult[],
  todoMap: Map<string, TodoData>
): Promise<void> {
  results.forEach((result) => {
    (result.messages as TodoResultMessage[]).forEach((message) => {
      if (message.severity !== 2) {
        return;
      }

      // we only mutate errors that are present in the todo map, so check if it's there first
      const todoDatum = _buildTodoDatum(baseDir, result, message as Linter.LintMessage);

      const todoHash = todoFilePathFor(todoDatum);

      if (!todoMap.has(todoHash)) {
        return;
      }

      message.severity = -1;

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
