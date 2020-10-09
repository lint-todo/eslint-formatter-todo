import { generateFileName, _buildTodoDatum } from '@ember-template-lint/todo-utils';
import { TodoData } from '@ember-template-lint/todo-utils/lib/types'; // TODO: https://github.com/ember-template-lint/ember-template-lint-todo-utils/issues/18
import { ESLint } from 'eslint';

/**
 * Mutates all errors present in the todo map to warnings in the results array.
 * If todo map is not passed, all errors are converted to warnings.
 * @param results ESLint results array
 * @param todoMap Optional map of a todoDatum hash and its data.
 */
export function mutateTodoErrorsToWarnings(
  results: ESLint.LintResult[],
  todoMap?: Map<string, TodoData>
): void {
  results.forEach((result: ESLint.LintResult) => {
    result.messages.forEach((message) => {
      if (message.severity !== 2) {
        return;
      }

      const todoDatum = _buildTodoDatum(result, message);
      const todoHash = generateFileName(todoDatum);

      if (todoMap && !todoMap.get(todoHash)) {
        return;
      }

      message.severity = 1;
      result.errorCount -= 1;
      result.warningCount += 1;

      if (!message.fix) {
        return;
      }

      result.fixableErrorCount -= 1;
      result.fixableWarningCount += 1;
    }); // result.messages.forEach
  }); // results.forEach
}
