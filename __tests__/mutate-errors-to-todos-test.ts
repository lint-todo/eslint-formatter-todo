import { buildTodoData } from '@ember-template-lint/todo-utils';
import '../src/estlint-type-extension.d.ts';
import { mutateTodoErrorsToTodos } from '../src/mutate-errors-to-todos';
import { readJson } from './__utils__/read-json';

describe('mutate-errors-to-todos', () => {
  it('changes only the errors that are also present in the todo map to todos', async () => {
    const results = await readJson(
      require.resolve('./__fixtures__/eslint-with-errors.json')
    );

    // build todo map but without the last result in the results array (so they differ)
    const todoResults = [...results];
    const lastResult = todoResults.pop();
    const todoMap = buildTodoData(todoResults);

    mutateTodoErrorsToTodos(results, todoMap);

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
        expect(message.severity).toEqual(-1);
      });
    });
  });
});
