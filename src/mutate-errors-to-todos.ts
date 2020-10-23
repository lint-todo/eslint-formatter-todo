import {
  TodoData,
  todoDirFor,
  todoFileNameFor,
  _buildTodoDatum,
} from '@ember-template-lint/todo-utils';
import { ESLint } from 'eslint';

/**
 * Mutates all errors present in the todo dir to todos in the results array.
 * @param results ESLint results array
 */
export async function mutateTodoErrorsToTodos(
  results: ESLint.LintResult[],
  todoMap: Map<string, TodoData>
) {
  results.forEach((result) => {
    result.messages.forEach((message) => {
      if (message.severity !== 2) {
        return;
      }

      // we only mutate errors that are present in the todo map, so check if it's there first
      const todoDatum = _buildTodoDatum(result, message);
      
      const todoHash = todoFilePathFor(todoDatum);

      if (!todoMap.has(todoHash)) {
        return;
      }

      (message.severity as any) = -1;

      result.errorCount -= 1;
      result.todoCount = Number.isInteger(result.todoCount)
        ? result.todoCount + 1
        : 1;

      if (!message.fix) {
        return;
      }

      result.fixableErrorCount -= 1;
    });
  });
}
