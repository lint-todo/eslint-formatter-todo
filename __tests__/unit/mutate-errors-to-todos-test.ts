import { buildTodoData } from '@ember-template-lint/todo-utils';
import { dirSync } from 'tmp';
import { TODO_SEVERITY } from '../../src/constants';
import { mutateTodoErrorsToTodos } from '../../src/mutate-errors-to-todos';
import fixtures from '../__fixtures__/fixtures';

describe('mutate-errors-to-todos', () => {
  it('changes only the errors that are also present in the todo map to todos', async () => {
    const tmp = dirSync({ unsafeCleanup: true });
    const results = fixtures.eslintWithErrors(tmp.name);

    // build todo map but without the last result in the results array (so they differ)
    const todoResults = [...results];
    const lastResult = todoResults.pop();
    const todos = buildTodoData(tmp.name, todoResults);

    mutateTodoErrorsToTodos(tmp.name, results, todos);

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
