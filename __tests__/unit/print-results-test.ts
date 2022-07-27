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
  describe('when formatTodoAs is present', () => {
    it('throws an error when module not found', () => {
      const results = fixtures.eslintWithErrors('/stable/path');
      expect(() =>
        printResults(
          results,
          getOptions({ formatTodoAs: '@lint-todo/not-found' })
        )
      ).toThrow(
        "Unable to find formatter `@lint-todo/not-found`. Must declare explicit dependency on package. Try 'npm install @lint-todo/not-found --save-dev' or 'yarn add @lint-todo/not-found --dev'"
      );
    });

    describe('when module is found', () => {
      const formatterSpy = jest.fn().mockReturnValue('mock formatted results');

      beforeAll(() => {
        jest.mock('@lint-todo/alternate-formatter', () => formatterSpy, {
          virtual: true,
        });
      });

      afterEach(() => {
        jest.clearAllMocks();
      });

      it('passes all errors to formatting module', () => {
        const results = fixtures.eslintWithErrors('/stable/path');
        expect(
          printResults(
            results,
            getOptions({ formatTodoAs: '@lint-todo/alternate-formatter' })
          )
        ).toEqual('mock formatted results');

        expect(formatterSpy).toHaveBeenCalledWith([
          {
            errorCount: 3,
            filePath: '/stable/path/app/controllers/settings.js',
            fixableErrorCount: 0,
            fixableWarningCount: 0,
            messages: [
              {
                column: 21,
                endColumn: 35,
                endLine: 25,
                line: 25,
                message:
                  "Do not access Object.prototype method 'hasOwnProperty' from target object.",
                messageId: 'prototypeBuildIn',
                nodeType: 'CallExpression',
                ruleId: 'no-prototype-builtins',
                severity: 2,
              },
              {
                column: 19,
                endColumn: 33,
                endLine: 26,
                line: 26,
                message:
                  "Do not access Object.prototype method 'hasOwnProperty' from target object.",
                messageId: 'prototypeBuildIn',
                nodeType: 'CallExpression',
                ruleId: 'no-prototype-builtins',
                severity: 2,
              },
              {
                column: 34,
                endColumn: 48,
                endLine: 32,
                line: 32,
                message:
                  "Do not access Object.prototype method 'hasOwnProperty' from target object.",
                messageId: 'prototypeBuildIn',
                nodeType: 'CallExpression',
                ruleId: 'no-prototype-builtins',
                severity: 2,
              },
            ],
            source: '',
            warningCount: 0,
          },
          {
            errorCount: 2,
            filePath: '/stable/path/app/initializers/tracer.js',
            fixableErrorCount: 1,
            fixableWarningCount: 0,
            messages: [
              {
                column: 11,
                endColumn: 17,
                endLine: 1,
                fix: { range: [0, 1], text: '' },
                line: 1,
                message:
                  "'window' is already defined as a built-in global variable.",
                messageId: 'redeclaredAsBuiltin',
                nodeType: 'Block',
                ruleId: 'no-redeclare',
                severity: 2,
              },
              {
                column: 19,
                endColumn: 33,
                endLine: 1,
                line: 1,
                message:
                  "'XMLHttpRequest' is already defined as a built-in global variable.",
                messageId: 'redeclaredAsBuiltin',
                nodeType: 'Block',
                ruleId: 'no-redeclare',
                severity: 2,
              },
            ],
            source: '',
            warningCount: 0,
          },
          {
            errorCount: 2,
            filePath: '/stable/path/app/models/build.js',
            fixableErrorCount: 0,
            fixableWarningCount: 0,
            messages: [
              {
                column: 50,
                endColumn: 64,
                endLine: 108,
                line: 108,
                message:
                  "Do not access Object.prototype method 'hasOwnProperty' from target object.",
                messageId: 'prototypeBuildIn',
                nodeType: 'CallExpression',
                ruleId: 'no-prototype-builtins',
                severity: 2,
              },
              {
                column: 25,
                endColumn: 39,
                endLine: 120,
                line: 120,
                message:
                  "Do not access Object.prototype method 'hasOwnProperty' from target object.",
                messageId: 'prototypeBuildIn',
                nodeType: 'CallExpression',
                ruleId: 'no-prototype-builtins',
                severity: 2,
              },
            ],
            source: '',
            warningCount: 0,
          },
          {
            errorCount: 4,
            filePath: '/stable/path/app/services/insights.js',
            fixableErrorCount: 0,
            fixableWarningCount: 0,
            messages: [
              {
                column: 17,
                endColumn: 31,
                endLine: 287,
                line: 287,
                message:
                  "Do not access Object.prototype method 'hasOwnProperty' from target object.",
                messageId: 'prototypeBuildIn',
                nodeType: 'CallExpression',
                ruleId: 'no-prototype-builtins',
                severity: 2,
              },
              {
                column: 17,
                endColumn: 31,
                endLine: 296,
                line: 296,
                message:
                  "Do not access Object.prototype method 'hasOwnProperty' from target object.",
                messageId: 'prototypeBuildIn',
                nodeType: 'CallExpression',
                ruleId: 'no-prototype-builtins',
                severity: 2,
              },
              {
                column: 17,
                endColumn: 31,
                endLine: 307,
                line: 307,
                message:
                  "Do not access Object.prototype method 'hasOwnProperty' from target object.",
                messageId: 'prototypeBuildIn',
                nodeType: 'CallExpression',
                ruleId: 'no-prototype-builtins',
                severity: 2,
              },
              {
                column: 17,
                endColumn: 31,
                endLine: 317,
                line: 317,
                message:
                  "Do not access Object.prototype method 'hasOwnProperty' from target object.",
                messageId: 'prototypeBuildIn',
                nodeType: 'CallExpression',
                ruleId: 'no-prototype-builtins',
                severity: 2,
              },
            ],
            source: '',
            warningCount: 0,
          },
          {
            errorCount: 1,
            filePath: '/stable/path/app/utils/traverse-payload.js',
            fixableErrorCount: 0,
            fixableWarningCount: 0,
            messages: [
              {
                column: 18,
                endColumn: 32,
                endLine: 18,
                line: 18,
                message:
                  "Do not access Object.prototype method 'hasOwnProperty' from target object.",
                messageId: 'prototypeBuildIn',
                nodeType: 'CallExpression',
                ruleId: 'no-prototype-builtins',
                severity: 2,
              },
            ],
            source: '',
            warningCount: 0,
          },
          {
            errorCount: 6,
            filePath: '/stable/path/tests/unit/services/insights-test.js',
            fixableErrorCount: 0,
            fixableWarningCount: 0,
            messages: [
              {
                column: 27,
                endColumn: 41,
                endLine: 65,
                line: 65,
                message:
                  "Do not access Object.prototype method 'hasOwnProperty' from target object.",
                messageId: 'prototypeBuildIn',
                nodeType: 'CallExpression',
                ruleId: 'no-prototype-builtins',
                severity: 2,
              },
              {
                column: 27,
                endColumn: 41,
                endLine: 80,
                line: 80,
                message:
                  "Do not access Object.prototype method 'hasOwnProperty' from target object.",
                messageId: 'prototypeBuildIn',
                nodeType: 'CallExpression',
                ruleId: 'no-prototype-builtins',
                severity: 2,
              },
              {
                column: 27,
                endColumn: 41,
                endLine: 97,
                line: 97,
                message:
                  "Do not access Object.prototype method 'hasOwnProperty' from target object.",
                messageId: 'prototypeBuildIn',
                nodeType: 'CallExpression',
                ruleId: 'no-prototype-builtins',
                severity: 2,
              },
              {
                column: 27,
                endColumn: 41,
                endLine: 116,
                line: 116,
                message:
                  "Do not access Object.prototype method 'hasOwnProperty' from target object.",
                messageId: 'prototypeBuildIn',
                nodeType: 'CallExpression',
                ruleId: 'no-prototype-builtins',
                severity: 2,
              },
              {
                column: 27,
                endColumn: 41,
                endLine: 134,
                line: 134,
                message:
                  "Do not access Object.prototype method 'hasOwnProperty' from target object.",
                messageId: 'prototypeBuildIn',
                nodeType: 'CallExpression',
                ruleId: 'no-prototype-builtins',
                severity: 2,
              },
              {
                column: 32,
                endColumn: 46,
                endLine: 158,
                line: 158,
                message:
                  "Do not access Object.prototype method 'hasOwnProperty' from target object.",
                messageId: 'prototypeBuildIn',
                nodeType: 'CallExpression',
                ruleId: 'no-prototype-builtins',
                severity: 2,
              },
            ],
            source: '',
            warningCount: 0,
          },
        ]);
      });

      it('should not pass anything to formatting module when includeTodo is false and there are only todo items', () => {
        const results = fixtures.eslintWithTodos('/stable/path');

        expect(
          printResults(
            results,
            getOptions({ formatTodoAs: '@lint-todo/alternate-formatter' })
          )
        ).toEqual('mock formatted results');
        expect(formatterSpy).toHaveBeenCalledWith([]);
      });

      it('should pass all todo items to formatting module when includeTodo is true', () => {
        const results = fixtures.eslintWithTodos('/stable/path');

        expect(
          printResults(
            results,
            getOptions({
              formatTodoAs: '@lint-todo/alternate-formatter',
              includeTodo: true,
            })
          )
        ).toEqual('mock formatted results');
        expect(formatterSpy).toHaveBeenCalledWith([
          {
            filePath: '/stable/path/app/controllers/settings.js',
            messages: [
              {
                ruleId: 'no-prototype-builtins',
                severity: -1,
                message:
                  "Do not access Object.prototype method 'hasOwnProperty' from target object.",
                line: 25,
                column: 21,
                nodeType: 'CallExpression',
                messageId: 'prototypeBuildIn',
                endLine: 25,
                endColumn: 35,
              },
              {
                ruleId: 'no-prototype-builtins',
                severity: -1,
                message:
                  "Do not access Object.prototype method 'hasOwnProperty' from target object.",
                line: 26,
                column: 19,
                nodeType: 'CallExpression',
                messageId: 'prototypeBuildIn',
                endLine: 26,
                endColumn: 33,
              },
              {
                ruleId: 'no-prototype-builtins',
                severity: -1,
                message:
                  "Do not access Object.prototype method 'hasOwnProperty' from target object.",
                line: 32,
                column: 34,
                nodeType: 'CallExpression',
                messageId: 'prototypeBuildIn',
                endLine: 32,
                endColumn: 48,
              },
            ],
            errorCount: 0,
            warningCount: 0,
            todoCount: 3,
            fixableErrorCount: 0,
            fixableWarningCount: 0,
            source: '',
          },
          {
            filePath: '/stable/path/app/initializers/tracer.js',
            messages: [
              {
                ruleId: 'no-redeclare',
                severity: -1,
                message:
                  "'window' is already defined as a built-in global variable.",
                line: 1,
                column: 11,
                nodeType: 'Block',
                messageId: 'redeclaredAsBuiltin',
                endLine: 1,
                endColumn: 17,
                fix: { range: [0, 1], text: '' },
              },
              {
                ruleId: 'no-redeclare',
                severity: -1,
                message:
                  "'XMLHttpRequest' is already defined as a built-in global variable.",
                line: 1,
                column: 19,
                nodeType: 'Block',
                messageId: 'redeclaredAsBuiltin',
                endLine: 1,
                endColumn: 33,
              },
            ],
            errorCount: 0,
            warningCount: 0,
            todoCount: 2,
            fixableErrorCount: 0,
            fixableWarningCount: 0,
            fixableTodoCount: 1,
            source: '',
          },
          {
            filePath: '/stable/path/app/models/build.js',
            messages: [
              {
                ruleId: 'no-prototype-builtins',
                severity: -1,
                message:
                  "Do not access Object.prototype method 'hasOwnProperty' from target object.",
                line: 108,
                column: 50,
                nodeType: 'CallExpression',
                messageId: 'prototypeBuildIn',
                endLine: 108,
                endColumn: 64,
              },
              {
                ruleId: 'no-prototype-builtins',
                severity: -1,
                message:
                  "Do not access Object.prototype method 'hasOwnProperty' from target object.",
                line: 120,
                column: 25,
                nodeType: 'CallExpression',
                messageId: 'prototypeBuildIn',
                endLine: 120,
                endColumn: 39,
              },
            ],
            errorCount: 0,
            warningCount: 0,
            todoCount: 2,
            fixableErrorCount: 0,
            fixableWarningCount: 0,
            source: '',
          },
          {
            filePath: '/stable/path/app/services/insights.js',
            messages: [
              {
                ruleId: 'no-prototype-builtins',
                severity: -1,
                message:
                  "Do not access Object.prototype method 'hasOwnProperty' from target object.",
                line: 287,
                column: 17,
                nodeType: 'CallExpression',
                messageId: 'prototypeBuildIn',
                endLine: 287,
                endColumn: 31,
              },
              {
                ruleId: 'no-prototype-builtins',
                severity: -1,
                message:
                  "Do not access Object.prototype method 'hasOwnProperty' from target object.",
                line: 296,
                column: 17,
                nodeType: 'CallExpression',
                messageId: 'prototypeBuildIn',
                endLine: 296,
                endColumn: 31,
              },
              {
                ruleId: 'no-prototype-builtins',
                severity: -1,
                message:
                  "Do not access Object.prototype method 'hasOwnProperty' from target object.",
                line: 307,
                column: 17,
                nodeType: 'CallExpression',
                messageId: 'prototypeBuildIn',
                endLine: 307,
                endColumn: 31,
              },
              {
                ruleId: 'no-prototype-builtins',
                severity: -1,
                message:
                  "Do not access Object.prototype method 'hasOwnProperty' from target object.",
                line: 317,
                column: 17,
                nodeType: 'CallExpression',
                messageId: 'prototypeBuildIn',
                endLine: 317,
                endColumn: 31,
              },
            ],
            errorCount: 0,
            warningCount: 0,
            todoCount: 4,
            fixableErrorCount: 0,
            fixableWarningCount: 0,
            source: '',
          },
          {
            filePath: '/stable/path/app/utils/traverse-payload.js',
            messages: [
              {
                ruleId: 'no-prototype-builtins',
                severity: -1,
                message:
                  "Do not access Object.prototype method 'hasOwnProperty' from target object.",
                line: 18,
                column: 18,
                nodeType: 'CallExpression',
                messageId: 'prototypeBuildIn',
                endLine: 18,
                endColumn: 32,
              },
            ],
            errorCount: 0,
            warningCount: 0,
            todoCount: 1,
            fixableErrorCount: 0,
            fixableWarningCount: 0,
            source: '',
          },
          {
            filePath: '/stable/path/tests/unit/services/insights-test.js',
            messages: [
              {
                ruleId: 'no-prototype-builtins',
                severity: -1,
                message:
                  "Do not access Object.prototype method 'hasOwnProperty' from target object.",
                line: 65,
                column: 27,
                nodeType: 'CallExpression',
                messageId: 'prototypeBuildIn',
                endLine: 65,
                endColumn: 41,
              },
              {
                ruleId: 'no-prototype-builtins',
                severity: -1,
                message:
                  "Do not access Object.prototype method 'hasOwnProperty' from target object.",
                line: 80,
                column: 27,
                nodeType: 'CallExpression',
                messageId: 'prototypeBuildIn',
                endLine: 80,
                endColumn: 41,
              },
              {
                ruleId: 'no-prototype-builtins',
                severity: -1,
                message:
                  "Do not access Object.prototype method 'hasOwnProperty' from target object.",
                line: 97,
                column: 27,
                nodeType: 'CallExpression',
                messageId: 'prototypeBuildIn',
                endLine: 97,
                endColumn: 41,
              },
              {
                ruleId: 'no-prototype-builtins',
                severity: -1,
                message:
                  "Do not access Object.prototype method 'hasOwnProperty' from target object.",
                line: 116,
                column: 27,
                nodeType: 'CallExpression',
                messageId: 'prototypeBuildIn',
                endLine: 116,
                endColumn: 41,
              },
              {
                ruleId: 'no-prototype-builtins',
                severity: -1,
                message:
                  "Do not access Object.prototype method 'hasOwnProperty' from target object.",
                line: 134,
                column: 27,
                nodeType: 'CallExpression',
                messageId: 'prototypeBuildIn',
                endLine: 134,
                endColumn: 41,
              },
              {
                ruleId: 'no-prototype-builtins',
                severity: -1,
                message:
                  "Do not access Object.prototype method 'hasOwnProperty' from target object.",
                line: 158,
                column: 32,
                nodeType: 'CallExpression',
                messageId: 'prototypeBuildIn',
                endLine: 158,
                endColumn: 46,
              },
            ],
            errorCount: 0,
            warningCount: 0,
            todoCount: 6,
            fixableErrorCount: 0,
            fixableWarningCount: 0,
            source: '',
          },
        ]);
      });

      it('should only pass errors and warnings to formatting module if includeTodo is false and there are errors, warnings, and todo items', () => {
        const results = fixtures.eslintWithErrorsWarningsTodos('/stable/path');
        expect(
          printResults(
            results,
            getOptions({
              formatTodoAs: '@lint-todo/alternate-formatter',
            })
          )
        ).toEqual('mock formatted results');
        expect(formatterSpy).toHaveBeenCalledWith([
          {
            filePath: '/stable/path/app/errors-only.js',
            messages: [
              {
                ruleId: 'no-prototype-builtins',
                severity: 2,
                message:
                  "Do not access Object.prototype method 'hasOwnProperty' from target object.",
                line: 25,
                column: 21,
                nodeType: 'CallExpression',
                messageId: 'prototypeBuildIn',
                endLine: 25,
                endColumn: 35,
              },
              {
                ruleId: 'no-prototype-builtins',
                severity: 2,
                message:
                  "Do not access Object.prototype method 'hasOwnProperty' from target object.",
                line: 26,
                column: 19,
                nodeType: 'CallExpression',
                messageId: 'prototypeBuildIn',
                endLine: 26,
                endColumn: 33,
              },
              {
                ruleId: 'no-prototype-builtins',
                severity: 2,
                message:
                  "Do not access Object.prototype method 'hasOwnProperty' from target object.",
                line: 32,
                column: 34,
                nodeType: 'CallExpression',
                messageId: 'prototypeBuildIn',
                endLine: 32,
                endColumn: 48,
              },
            ],
            errorCount: 3,
            warningCount: 0,
            fixableErrorCount: 0,
            fixableWarningCount: 0,
            source: '',
          },
          {
            filePath: '/stable/path/app/warnings-only.js',
            messages: [
              {
                ruleId: 'no-alert',
                severity: 1,
                message: 'Unexpected alert.',
                line: 3,
                column: 3,
                nodeType: 'CallExpression',
                messageId: 'unexpected',
                endLine: 2,
                endColumn: 14,
              },
            ],
            errorCount: 0,
            warningCount: 1,
            fixableErrorCount: 0,
            fixableWarningCount: 0,
            source: '',
          },
          {
            filePath: '/stable/path/app/errors-warnings-todo.js',
            messages: [
              {
                ruleId: 'no-redeclare',
                severity: 2,
                message:
                  "'window' is already defined as a built-in global variable.",
                line: 1,
                column: 11,
                nodeType: 'Block',
                messageId: 'redeclaredAsBuiltin',
                endLine: 1,
                endColumn: 17,
                fix: { range: [0, 1], text: '' },
              },
              {
                ruleId: 'no-alert',
                severity: 1,
                message: 'Unexpected alert.',
                line: 3,
                column: 3,
                nodeType: 'CallExpression',
                messageId: 'unexpected',
                endLine: 2,
                endColumn: 14,
              },
            ],
            errorCount: 1,
            warningCount: 1,
            todoCount: 1,
            fixableErrorCount: 1,
            fixableWarningCount: 0,
            source: '',
          },
        ]);
      });
    });
  });

  it('should return all errors', () => {
    const results = fixtures.eslintWithErrors('/stable/path');

    expect(stripAnsi(printResults(results, getOptions())))
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

  it('should not return anything when includeTodo is false and there are only todo items', () => {
    const results = fixtures.eslintWithTodos('/stable/path');

    expect(stripAnsi(printResults(results, getOptions())).trim()).toEqual('');
  });

  it('should return all todo items when includeTodo is true', () => {
    const results = fixtures.eslintWithTodos('/stable/path');

    expect(
      stripAnsi(
        printResults(
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

  it('should only return errors and warnings if includeTodo is false and there are errors, warnings, and todo items', () => {
    const results = fixtures.eslintWithErrorsWarningsTodos('/stable/path');

    expect(stripAnsi(printResults(results, getOptions())))
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
});
