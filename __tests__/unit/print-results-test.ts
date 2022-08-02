import stripAnsi from 'strip-ansi';
import { printResults } from '../../src/print-results';
import fixtures from '../__fixtures__/fixtures';

function getOptions(options = {}) {
  return Object.assign(
    {},
    {
      formatTodoAs: undefined,
      updateTodo: false,
      includeTodo: false,
      shouldCleanTodos: true,
      todoInfo: undefined,
      writeTodoOptions: {},
    },
    options
  );
}

describe('print-results', () => {
  it('should return all errors', async () => {
    const results = fixtures.eslintWithErrors('/stable/path');

    expect(stripAnsi(await printResults(results, getOptions())))
      .toMatchInlineSnapshot(`
      "
      /stable/path/app/controllers/settings.js
         25:21  error  Do not access Object.prototype method 'hasOwnProperty' from target object  no-prototype-builtins
         26:19  error  Do not access Object.prototype method 'hasOwnProperty' from target object  no-prototype-builtins
         32:34  error  Do not access Object.prototype method 'hasOwnProperty' from target object  no-prototype-builtins

      /stable/path/app/initializers/tracer.js
         1:11  error  'window' is already defined as a built-in global variable          no-redeclare
         1:19  error  'XMLHttpRequest' is already defined as a built-in global variable  no-redeclare

      /stable/path/app/models/build.js
         108:50  error  Do not access Object.prototype method 'hasOwnProperty' from target object  no-prototype-builtins
         120:25  error  Do not access Object.prototype method 'hasOwnProperty' from target object  no-prototype-builtins

      /stable/path/app/services/insights.js
         287:17  error  Do not access Object.prototype method 'hasOwnProperty' from target object  no-prototype-builtins
         296:17  error  Do not access Object.prototype method 'hasOwnProperty' from target object  no-prototype-builtins
         307:17  error  Do not access Object.prototype method 'hasOwnProperty' from target object  no-prototype-builtins
         317:17  error  Do not access Object.prototype method 'hasOwnProperty' from target object  no-prototype-builtins

      /stable/path/app/utils/traverse-payload.js
         18:18  error  Do not access Object.prototype method 'hasOwnProperty' from target object  no-prototype-builtins

      /stable/path/tests/unit/services/insights-test.js
          65:27  error  Do not access Object.prototype method 'hasOwnProperty' from target object  no-prototype-builtins
          80:27  error  Do not access Object.prototype method 'hasOwnProperty' from target object  no-prototype-builtins
          97:27  error  Do not access Object.prototype method 'hasOwnProperty' from target object  no-prototype-builtins
         116:27  error  Do not access Object.prototype method 'hasOwnProperty' from target object  no-prototype-builtins
         134:27  error  Do not access Object.prototype method 'hasOwnProperty' from target object  no-prototype-builtins
         158:32  error  Do not access Object.prototype method 'hasOwnProperty' from target object  no-prototype-builtins

      ✖ 18 problems (18 errors, 0 warnings)
        1 error and 0 warnings potentially fixable with the \`--fix\` option.

      "
    `);
  });

  it('should not return anything when includeTodo is false and there are only todo items', async () => {
    const results = fixtures.eslintWithTodos('/stable/path');

    expect(stripAnsi(await printResults(results, getOptions())).trim()).toEqual(
      ''
    );
  });

  it('should return all todo items when includeTodo is true', async () => {
    const results = fixtures.eslintWithTodos('/stable/path');

    expect(
      stripAnsi(
        await printResults(
          results,
          getOptions({
            includeTodo: true,
          })
        )
      )
    ).toMatchInlineSnapshot(`
      "
      /stable/path/app/controllers/settings.js
         25:21  todo  Do not access Object.prototype method 'hasOwnProperty' from target object  no-prototype-builtins
         26:19  todo  Do not access Object.prototype method 'hasOwnProperty' from target object  no-prototype-builtins
         32:34  todo  Do not access Object.prototype method 'hasOwnProperty' from target object  no-prototype-builtins

      /stable/path/app/initializers/tracer.js
         1:11  todo  'window' is already defined as a built-in global variable          no-redeclare
         1:19  todo  'XMLHttpRequest' is already defined as a built-in global variable  no-redeclare

      /stable/path/app/models/build.js
         108:50  todo  Do not access Object.prototype method 'hasOwnProperty' from target object  no-prototype-builtins
         120:25  todo  Do not access Object.prototype method 'hasOwnProperty' from target object  no-prototype-builtins

      /stable/path/app/services/insights.js
         287:17  todo  Do not access Object.prototype method 'hasOwnProperty' from target object  no-prototype-builtins
         296:17  todo  Do not access Object.prototype method 'hasOwnProperty' from target object  no-prototype-builtins
         307:17  todo  Do not access Object.prototype method 'hasOwnProperty' from target object  no-prototype-builtins
         317:17  todo  Do not access Object.prototype method 'hasOwnProperty' from target object  no-prototype-builtins

      /stable/path/app/utils/traverse-payload.js
         18:18  todo  Do not access Object.prototype method 'hasOwnProperty' from target object  no-prototype-builtins

      /stable/path/tests/unit/services/insights-test.js
          65:27  todo  Do not access Object.prototype method 'hasOwnProperty' from target object  no-prototype-builtins
          80:27  todo  Do not access Object.prototype method 'hasOwnProperty' from target object  no-prototype-builtins
          97:27  todo  Do not access Object.prototype method 'hasOwnProperty' from target object  no-prototype-builtins
         116:27  todo  Do not access Object.prototype method 'hasOwnProperty' from target object  no-prototype-builtins
         134:27  todo  Do not access Object.prototype method 'hasOwnProperty' from target object  no-prototype-builtins
         158:32  todo  Do not access Object.prototype method 'hasOwnProperty' from target object  no-prototype-builtins

      ✖ 0 problems (0 errors, 0 warnings, 18 todos)
        0 errors, 0 warnings, and 1 todo potentially fixable with the \`--fix\` option.

      "
    `);
  });

  it('should only return errors and warnings if includeTodo is false and there are errors, warnings, and todo items', async () => {
    const results = fixtures.eslintWithErrorsWarningsTodos('/stable/path');

    expect(stripAnsi(await printResults(results, getOptions())))
      .toMatchInlineSnapshot(`
      "
      /stable/path/app/errors-only.js
         25:21  error  Do not access Object.prototype method 'hasOwnProperty' from target object  no-prototype-builtins
         26:19  error  Do not access Object.prototype method 'hasOwnProperty' from target object  no-prototype-builtins
         32:34  error  Do not access Object.prototype method 'hasOwnProperty' from target object  no-prototype-builtins

      /stable/path/app/warnings-only.js
         3:3  warning  Unexpected alert  no-alert

      /stable/path/app/errors-warnings-todo.js
         1:11  error    'window' is already defined as a built-in global variable  no-redeclare
         3:3   warning  Unexpected alert                                           no-alert

      ✖ 6 problems (4 errors, 2 warnings)
        1 error and 0 warnings potentially fixable with the \`--fix\` option.

      "
    `);
  });

  it('should format errors and warnings to with formatter when using formatTodoAs', async () => {
    const results = fixtures.eslintWithErrorsWarningsTodos('/stable/path');

    const formattedResults = await printResults(
      results,
      getOptions({
        formatTodoAs: 'html',
      })
    );

    expect(formattedResults).toMatch('<!DOCTYPE html>');
    expect(formattedResults).toMatch('6 problems (4 errors, 2 warnings)');
  });
});
