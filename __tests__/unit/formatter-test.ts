import stripAnsi from 'strip-ansi';
import { formatter } from '../../src/formatter';
import fixtures from '../__fixtures__/fixtures';

describe('formatter', () => {
  it('should return all errors', async () => {
    const results = fixtures.eslintWithErrors('/stable/path');

    expect(stripAnsi(formatter(results))).toMatchInlineSnapshot(`
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
        1 error and warnings potentially fixable with the \`--fix\` option.

      "
    `);
  });

  it('should not return anything when includeTodo is false and there are only todo items', async () => {
    const results = fixtures.eslintWithTodos('/stable/path');

    expect(stripAnsi(formatter(results)).trim()).toEqual('');
  });

  it('should return all todo items when includeTodo is true', async () => {
    const results = fixtures.eslintWithTodos('/stable/path');

    expect(stripAnsi(formatter(results, { includeTodo: true })))
      .toMatchInlineSnapshot(`
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

      "
    `);
  });
});
