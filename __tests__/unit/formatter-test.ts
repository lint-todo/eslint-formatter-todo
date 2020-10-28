import { formatter } from '../../src/formatter';
import fixtures from '../__fixtures__/fixtures';

describe('formatter', () => {
  it('matches error snapshot (all errors are visible)', async () => {
    const results = fixtures.eslintWithErrors();
    expect(formatter(results)).toMatchInlineSnapshot(`
      "[0m[0m
      [0m[4m/Users/fake/app/controllers/settings.js[24m[0m
      [0m   [2m25:21[22m  [31merror[39m  Do not access Object.prototype method 'hasOwnProperty' from target object  [2mno-prototype-builtins[22m[0m
      [0m   [2m26:19[22m  [31merror[39m  Do not access Object.prototype method 'hasOwnProperty' from target object  [2mno-prototype-builtins[22m[0m
      [0m   [2m32:34[22m  [31merror[39m  Do not access Object.prototype method 'hasOwnProperty' from target object  [2mno-prototype-builtins[22m[0m
      [0m[0m
      [0m[4m/Users/fake/app/initializers/tracer.js[24m[0m
      [0m   [2m1:11[22m  [31merror[39m  'window' is already defined as a built-in global variable          [2mno-redeclare[22m[0m
      [0m   [2m1:19[22m  [31merror[39m  'XMLHttpRequest' is already defined as a built-in global variable  [2mno-redeclare[22m[0m
      [0m[0m
      [0m[4m/Users/fake/app/models/build.js[24m[0m
      [0m   [2m108:50[22m  [31merror[39m  Do not access Object.prototype method 'hasOwnProperty' from target object  [2mno-prototype-builtins[22m[0m
      [0m   [2m120:25[22m  [31merror[39m  Do not access Object.prototype method 'hasOwnProperty' from target object  [2mno-prototype-builtins[22m[0m
      [0m[0m
      [0m[4m/Users/fake/app/services/insights.js[24m[0m
      [0m   [2m287:17[22m  [31merror[39m  Do not access Object.prototype method 'hasOwnProperty' from target object  [2mno-prototype-builtins[22m[0m
      [0m   [2m296:17[22m  [31merror[39m  Do not access Object.prototype method 'hasOwnProperty' from target object  [2mno-prototype-builtins[22m[0m
      [0m   [2m307:17[22m  [31merror[39m  Do not access Object.prototype method 'hasOwnProperty' from target object  [2mno-prototype-builtins[22m[0m
      [0m   [2m317:17[22m  [31merror[39m  Do not access Object.prototype method 'hasOwnProperty' from target object  [2mno-prototype-builtins[22m[0m
      [0m[0m
      [0m[4m/Users/fake/app/utils/traverse-payload.js[24m[0m
      [0m   [2m18:18[22m  [31merror[39m  Do not access Object.prototype method 'hasOwnProperty' from target object  [2mno-prototype-builtins[22m[0m
      [0m[0m
      [0m[4m/Users/fake/tests/unit/services/insights-test.js[24m[0m
      [0m    [2m65:27[22m  [31merror[39m  Do not access Object.prototype method 'hasOwnProperty' from target object  [2mno-prototype-builtins[22m[0m
      [0m    [2m80:27[22m  [31merror[39m  Do not access Object.prototype method 'hasOwnProperty' from target object  [2mno-prototype-builtins[22m[0m
      [0m    [2m97:27[22m  [31merror[39m  Do not access Object.prototype method 'hasOwnProperty' from target object  [2mno-prototype-builtins[22m[0m
      [0m   [2m116:27[22m  [31merror[39m  Do not access Object.prototype method 'hasOwnProperty' from target object  [2mno-prototype-builtins[22m[0m
      [0m   [2m134:27[22m  [31merror[39m  Do not access Object.prototype method 'hasOwnProperty' from target object  [2mno-prototype-builtins[22m[0m
      [0m   [2m158:32[22m  [31merror[39m  Do not access Object.prototype method 'hasOwnProperty' from target object  [2mno-prototype-builtins[22m[0m
      [0m[0m
      [0m[31m[1m✖ 18 problems (18 errors, 0 warnings, 0 todos)[22m[39m[0m
      [0m[31m[1m[22m[39m[31m[1m  1 error and 0 warnings potentially fixable with the \`--fix\` option.[22m[39m[0m
      [0m[31m[1m[22m[39m[0m
      [0m[0m"
    `);
  });

  it('matches todo snapshot with no INCLUDE_TODO (nothing is visible except summary)', async () => {
    const results = fixtures.eslintWithTodos();

    expect(formatter(results)).toMatchInlineSnapshot(`
      "[0m[0m
      [0m[33m[1m✖ 18 problems (0 errors, 0 warnings, 18 todos)[22m[39m[0m
      [0m[33m[1m[22m[39m[33m[1m  1 error and 0 warnings potentially fixable with the \`--fix\` option.[22m[39m[0m
      [0m[33m[1m[22m[39m[0m
      [0m[0m"
    `);
  });

  it('matches todo snapshot with INCLUDE_TODO (all todo items are visible)', async () => {
    const results = fixtures.eslintWithTodos();

    expect(formatter(results, true)).toMatchInlineSnapshot(`
      "[0m[0m
      [0m[4m/Users/fake/app/controllers/settings.js[24m[0m
      [0m   [2m25:21[22m  [35mtodo[39m  Do not access Object.prototype method 'hasOwnProperty' from target object  [2mno-prototype-builtins[22m[0m
      [0m   [2m26:19[22m  [35mtodo[39m  Do not access Object.prototype method 'hasOwnProperty' from target object  [2mno-prototype-builtins[22m[0m
      [0m   [2m32:34[22m  [35mtodo[39m  Do not access Object.prototype method 'hasOwnProperty' from target object  [2mno-prototype-builtins[22m[0m
      [0m[0m
      [0m[4m/Users/fake/app/initializers/tracer.js[24m[0m
      [0m   [2m1:11[22m  [35mtodo[39m  'window' is already defined as a built-in global variable          [2mno-redeclare[22m[0m
      [0m   [2m1:19[22m  [35mtodo[39m  'XMLHttpRequest' is already defined as a built-in global variable  [2mno-redeclare[22m[0m
      [0m[0m
      [0m[4m/Users/fake/app/models/build.js[24m[0m
      [0m   [2m108:50[22m  [35mtodo[39m  Do not access Object.prototype method 'hasOwnProperty' from target object  [2mno-prototype-builtins[22m[0m
      [0m   [2m120:25[22m  [35mtodo[39m  Do not access Object.prototype method 'hasOwnProperty' from target object  [2mno-prototype-builtins[22m[0m
      [0m[0m
      [0m[4m/Users/fake/app/services/insights.js[24m[0m
      [0m   [2m287:17[22m  [35mtodo[39m  Do not access Object.prototype method 'hasOwnProperty' from target object  [2mno-prototype-builtins[22m[0m
      [0m   [2m296:17[22m  [35mtodo[39m  Do not access Object.prototype method 'hasOwnProperty' from target object  [2mno-prototype-builtins[22m[0m
      [0m   [2m307:17[22m  [35mtodo[39m  Do not access Object.prototype method 'hasOwnProperty' from target object  [2mno-prototype-builtins[22m[0m
      [0m   [2m317:17[22m  [35mtodo[39m  Do not access Object.prototype method 'hasOwnProperty' from target object  [2mno-prototype-builtins[22m[0m
      [0m[0m
      [0m[4m/Users/fake/app/utils/traverse-payload.js[24m[0m
      [0m   [2m18:18[22m  [35mtodo[39m  Do not access Object.prototype method 'hasOwnProperty' from target object  [2mno-prototype-builtins[22m[0m
      [0m[0m
      [0m[4m/Users/fake/tests/unit/services/insights-test.js[24m[0m
      [0m    [2m65:27[22m  [35mtodo[39m  Do not access Object.prototype method 'hasOwnProperty' from target object  [2mno-prototype-builtins[22m[0m
      [0m    [2m80:27[22m  [35mtodo[39m  Do not access Object.prototype method 'hasOwnProperty' from target object  [2mno-prototype-builtins[22m[0m
      [0m    [2m97:27[22m  [35mtodo[39m  Do not access Object.prototype method 'hasOwnProperty' from target object  [2mno-prototype-builtins[22m[0m
      [0m   [2m116:27[22m  [35mtodo[39m  Do not access Object.prototype method 'hasOwnProperty' from target object  [2mno-prototype-builtins[22m[0m
      [0m   [2m134:27[22m  [35mtodo[39m  Do not access Object.prototype method 'hasOwnProperty' from target object  [2mno-prototype-builtins[22m[0m
      [0m   [2m158:32[22m  [35mtodo[39m  Do not access Object.prototype method 'hasOwnProperty' from target object  [2mno-prototype-builtins[22m[0m
      [0m[0m
      [0m[33m[1m✖ 18 problems (0 errors, 0 warnings, 18 todos)[22m[39m[0m
      [0m[33m[1m[22m[39m[33m[1m  1 error and 0 warnings potentially fixable with the \`--fix\` option.[22m[39m[0m
      [0m[33m[1m[22m[39m[0m
      [0m[0m"
    `);
  });
});
