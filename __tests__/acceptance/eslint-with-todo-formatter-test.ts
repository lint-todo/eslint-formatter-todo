import '@microsoft/jest-sarif';
import stripAnsi from 'strip-ansi';
import { differenceInDays, subDays } from 'date-fns';
import {
  DaysToDecay,
  DaysToDecayByRule,
  getTodoConfig,
  getTodoStorageFilePath,
  readTodoData,
  readTodoStorageFile,
  todoStorageFileExists,
  writeTodos,
} from '@lint-todo/utils';
import { createBinTester } from '@scalvert/bin-tester';
import { FakeProject } from '../__utils__/fake-project';
import { getObjectFixture, getStringFixture } from '../__utils__/get-fixture';
import { buildReadOptions } from '../__utils__/build-read-options';
import { buildMaybeTodos } from '../../src/formatter';

describe('eslint with todo formatter', function () {
  let project: FakeProject;

  const { runBin, setupProject, teardownProject } = createBinTester({
    binPath: './node_modules/.bin/eslint',
    staticArgs: [
      'src',
      '-c',
      './eslint-config.json',
      '--no-eslintrc',
      '--format',
      require.resolve('../..'),
    ],
    createProject: async () => FakeProject.getInstance(),
  });

  beforeEach(async () => {
    project = await setupProject();
  });

  afterEach(() => {
    teardownProject();
  });

  it('errors if todo config exists in both package.json and .lint-todorc.js', async function () {
    await project.write({
      src: {
        'no-problems.js': getStringFixture('with-no-problems.js'),
      },
    });

    await project.setShorthandPackageJsonTodoConfig({
      warn: 5,
      error: 10,
    });

    await project.setLintTodorc({
      warn: 5,
      error: 10,
    });

    const result = await runBin();

    expect(result.exitCode).toBeGreaterThan(0);
    expect(result.stderr).toMatch(
      /You cannot have todo configurations in both package.json and .lint-todorc.js. Please move the configuration from the package.json to the .lint-todorc.js/
    );
  });

  it('should not emit anything when there are no errors or warnings', async () => {
    await project.write({
      src: {
        'no-problems.js': getStringFixture('with-no-problems.js'),
      },
    });

    const result = await runBin();

    expect(result.stdout).toEqual('');
    expect(result.exitCode).toEqual(0);
  });

  it('errors if using either TODO_DAYS_TO_WARN or TODO_DAYS_TO_ERROR without UPDATE_TODO', async () => {
    await project.write({
      src: {
        'no-problems.js': getStringFixture('with-no-problems.js'),
      },
    });

    let result = await runBin({
      env: { TODO_DAYS_TO_WARN: '10' },
    });

    expect(result.stderr).toContain(
      'Using `TODO_DAYS_TO_WARN` or `TODO_DAYS_TO_ERROR` is only valid when the `UPDATE_TODO` environment variable is being used.'
    );
    expect(result.exitCode).toBeGreaterThan(0);

    result = await runBin({
      env: { TODO_DAYS_TO_ERROR: '10' },
    });

    expect(result.stderr).toContain(
      'Using `TODO_DAYS_TO_WARN` or `TODO_DAYS_TO_ERROR` is only valid when the `UPDATE_TODO` environment variable is being used.'
    );
    expect(result.exitCode).toBeGreaterThan(0);
  });

  it('with UPDATE_TODO but no todos, outputs todos created summary', async function () {
    await project.write({
      src: {
        'no-problems.js': getStringFixture('with-no-problems.js'),
      },
    });

    const result = await runBin({
      env: {
        UPDATE_TODO: '1',
      },
    });

    expect(result.exitCode).toEqual(0);
    expect(result.stdout).toMatch(/✔ 0 todos created, 0 todos removed/);
  });

  it('with UPDATE_TODO, outputs todos created summary', async () => {
    await project.write({
      src: {
        'with-errors-0.js': getStringFixture('with-errors-0.js'),
        'with-errors-1.js': getStringFixture('with-errors-1.js'),
      },
    });

    const result = await runBin({
      env: { UPDATE_TODO: '1' },
    });

    expect(result.exitCode).toEqual(0);
    expect(result.stdout).toMatch(/✔ 10 todos created, 0 todos removed/);
  });

  it('with UPDATE_TODO and INCLUDE_TODO, outputs todos created summary', async () => {
    await project.write({
      src: {
        'with-errors-0.js': getStringFixture('with-errors-0.js'),
        'with-errors-1.js': getStringFixture('with-errors-1.js'),
      },
    });

    const result = await runBin({
      env: { UPDATE_TODO: '1', INCLUDE_TODO: '1' },
    });

    expect(result.exitCode).toEqual(0);
    expect(result.stdout).toMatch(
      /✖ 0 problems \(0 errors, 0 warnings, 10 todos/
    );
    expect(result.stdout).toMatch(
      /0 errors, 0 warnings, and 1 todo potentially fixable with the `--fix` option./
    );
    expect(result.stdout).toMatch(/✔ 10 todos created, 0 todos removed/);
  });

  it('with UPDATE_TODO, outputs todos created summary with warn info', async () => {
    await project.write({
      src: {
        'with-errors-0.js': getStringFixture('with-errors-0.js'),
        'with-errors-1.js': getStringFixture('with-errors-1.js'),
      },
    });

    const result = await runBin({
      env: { UPDATE_TODO: '1', TODO_DAYS_TO_WARN: '10' },
    });

    expect(result.exitCode).toEqual(0);
    expect(result.stdout).toMatch(
      /✔ 10 todos created, 0 todos removed \(warn after 10 days\)/
    );
  });

  it('with UPDATE_TODO, outputs todos created summary with error info', async () => {
    await project.write({
      src: {
        'with-errors-0.js': getStringFixture('with-errors-0.js'),
        'with-errors-1.js': getStringFixture('with-errors-1.js'),
      },
    });

    const result = await runBin({
      env: { UPDATE_TODO: '1', TODO_DAYS_TO_ERROR: '10' },
    });

    expect(result.exitCode).toEqual(0);
    expect(result.stdout).toMatch(
      /✔ 10 todos created, 0 todos removed \(error after 10 days\)/
    );
  });

  it('with UPDATE_TODO, outputs todos created summary with warn and error info', async () => {
    await project.write({
      src: {
        'with-errors-0.js': getStringFixture('with-errors-0.js'),
        'with-errors-1.js': getStringFixture('with-errors-1.js'),
      },
    });

    const result = await runBin({
      env: {
        UPDATE_TODO: '1',
        TODO_DAYS_TO_WARN: '5',
        TODO_DAYS_TO_ERROR: '10',
      },
    });

    expect(result.exitCode).toEqual(0);
    expect(result.stdout).toMatch(
      /✔ 10 todos created, 0 todos removed \(warn after 5, error after 10 days\)/
    );
  });

  it('should emit errors and warnings as normal', async () => {
    await project.write({
      src: {
        'with-errors-and-warnings.js': getStringFixture(
          'with-errors-and-warnings.js'
        ),
      },
    });

    const result = await runBin();
    const stdout = stripAnsi(result.stdout);

    expect(result.exitCode).toEqual(1);
    expect(stdout).toMatch(
      /1:10 {2}error {4}'sayHi' is defined but never used {2}no-unused-vars/
    );
    expect(stdout).toMatch(/2:3 {3}warning {2}Unexpected alert {19}no-alert/);
    expect(stdout).toMatch(
      /2:9 {3}error {4}Strings must use singlequote {7}quotes/
    );
    expect(stdout).toMatch(/✖ 3 problems \(2 errors, 1 warning\)/);
    expect(stdout).toMatch(
      /1 error and 0 warnings potentially fixable with the `--fix` option\./
    );
  });

  it('generates todos for existing errors', async function () {
    await project.write({
      src: {
        'with-errors-0.js': getStringFixture('with-errors-0.js'),
      },
    });

    let result = await runBin({
      env: {
        UPDATE_TODO: '1',
      },
    });

    expect(result.exitCode).toEqual(0);
    expect(todoStorageFileExists(project.baseDir)).toEqual(true);
    expect(readTodoData(project.baseDir, buildReadOptions()).size).toEqual(7);

    result = await runBin();

    expect(result.exitCode).toEqual(0);
  });

  it('generates todos for existing errors, and correctly reports todo severity when file is edited to trigger fuzzy match', async function () {
    await project.write({
      src: {
        'with-errors.js': getStringFixture('with-errors-0.js'),
      },
    });

    let result = await runBin({
      env: {
        UPDATE_TODO: '1',
      },
    });

    expect(result.exitCode).toEqual(0);
    expect(todoStorageFileExists(project.baseDir)).toEqual(true);
    expect(readTodoData(project.baseDir, buildReadOptions()).size).toEqual(7);

    await project.write({
      src: {
        'with-errors.js': getStringFixture('with-errors-for-fuzzy.js'),
      },
    });

    result = await runBin();

    expect(result.exitCode).toEqual(0);
  });

  it('should not remove todos from another engine', async function () {
    await project.write({
      src: {
        'with-errors-0.js': getStringFixture('with-errors-0.js'),
        'with-errors-1.js': getStringFixture('with-errors-1.js'),
      },
    });

    writeTodos(
      project.baseDir,
      buildMaybeTodos(
        project.baseDir,
        getObjectFixture(
          'ember-template-lint-single-error.json',
          project.baseDir
        ),
        undefined,
        'ember-template-lint'
      ),
      {
        engine: 'eslint',
        filePath: '',
        todoConfig: getTodoConfig(project.baseDir, 'eslint'),
        shouldRemove: () => true,
      }
    );

    const result = await runBin({
      env: {
        UPDATE_TODO: '1',
      },
    });

    expect(result.exitCode).toEqual(0);
    expect(result.stdout).toMatch(
      /.*✔ 10 todos created, 0 todos removed \(warn after 30, error after 60 days\)/
    );
  });

  it('should emit todo items and count when UPDATE_TODO=1 and INCLUDE_TODO=1 are set', async () => {
    await project.write({
      src: {
        'with-errors-0.js': getStringFixture('with-errors-0.js'),
        'with-errors-1.js': getStringFixture('with-errors-1.js'),
      },
    });

    const result = await runBin({
      env: { UPDATE_TODO: '1', INCLUDE_TODO: '1' },
    });
    const stdout = stripAnsi(result.stdout);

    expect(result.exitCode).toEqual(0);
    expect(stdout).toMatch(
      /1:10 {2}todo {2}'addOne' is defined but never used\s+no-unused-vars/
    );
    expect(stdout).toMatch(
      /1:10 {2}todo {2}'fibonacci' is defined but never used\s+no-unused-vars/
    );
    expect(stdout).toMatch(/✖ 0 problems \(0 errors, 0 warnings, 10 todos\)/);
  });

  it('should emit todo items and count when INCLUDE_TODO=1 is set alone with prior todo items', async () => {
    await project.write({
      src: {
        'with-errors-0.js': getStringFixture('with-errors-0.js'),
        'with-errors-1.js': getStringFixture('with-errors-1.js'),
      },
    });

    // run eslint to generate todo dir but don't capture the result because this is not what we're testing
    await runBin({
      env: { UPDATE_TODO: '1' },
    });

    // run with INCLUDE_TODO (this is what we're testing)
    const result = await runBin({
      env: { INCLUDE_TODO: '1' },
    });

    const stdout = stripAnsi(result.stdout);

    expect(result.exitCode).toEqual(0);
    expect(stdout).toMatch(
      /1:10 {2}todo {2}'addOne' is defined but never used\s+no-unused-vars/
    );
    expect(stdout).toMatch(
      /1:10 {2}todo {2}'fibonacci' is defined but never used\s+no-unused-vars/
    );
    expect(stdout).toMatch(/✖ 0 problems \(0 errors, 0 warnings, 10 todos\)/);
  });

  it('should emit errors, warnings, and todos when all of these are present and INCLUDE_TODO=1 is set', async () => {
    // first we generate project files with errors and convert them to todos
    await project.write({
      src: {
        'with-errors-0.js': getStringFixture('with-errors-0.js'),
      },
    });

    await runBin({
      env: { UPDATE_TODO: '1' },
    });

    // now we add new errors and warnings to test output with all problems
    await project.write({
      src: {
        'with-errors-and-warnings.js': getStringFixture(
          'with-errors-and-warnings.js'
        ),
      },
    });

    const result = await runBin({
      env: { INCLUDE_TODO: '1' },
    });

    const stdout = stripAnsi(result.stdout);

    expect(result.exitCode).toEqual(1);
    expect(stdout).toMatch(
      /1:10 {2}todo {2}'addOne' is defined but never used\s+no-unused-vars/
    );
    expect(stdout).toMatch(
      /1:10 {2}error {4}'sayHi' is defined but never used\s+no-unused-vars/
    );
    expect(stdout).toMatch(/2:3 {3}warning {2}Unexpected alert\s+no-alert/);
    expect(stdout).toMatch(/✖ 3 problems \(2 errors, 1 warning, 7 todos\)/);
  });

  it('errors if a todo item is no longer valid when running without params, and fixes with --fix', async function () {
    await project.write({
      src: {
        'with-fixable-error.js': getStringFixture('with-fixable-error.js'),
      },
    });

    // generate todo based on existing error
    await runBin({
      env: { UPDATE_TODO: '1' },
    });

    // mimic fixing the error manually via user interaction
    await project.write({
      src: {
        'with-fixable-error.js': getStringFixture('no-errors.js'),
      },
    });

    // run normally and expect an error for not running --fix
    let result = await runBin({
      env: { CI: '1' },
    });

    expect(result.exitCode).toEqual(1);
    const results = stripAnsi(result.stdout).trim().split(/\r?\n/);

    expect(results[1]).toMatch(
      /0:0 {2}error {2}Todo violation passes `no-unused-vars` rule. Please run with `CLEAN_TODO=1` env var to remove this todo from the todo list {2}invalid-todo-violation-rule/
    );
    expect(results[3]).toMatch(/✖ 1 problem \(1 error, 0 warnings\)/);

    // run fix, and expect that this will delete the outstanding todo item
    await runBin('--fix');

    // run normally again and expect no error
    result = await runBin();

    const todoContents = readTodoStorageFile(
      getTodoStorageFilePath(project.baseDir)
    );

    expect(result.exitCode).toEqual(0);
    expect(stripAnsi(result.stdout).trim()).toEqual('');
    expect(todoContents).toHaveLength(2);
  });

  it('can compact todo storage file', async function () {
    await project.write({
      src: {
        'with-fixable-error.js': getStringFixture('with-fixable-error.js'),
      },
    });

    // generate todo based on existing error
    await runBin({
      env: {
        UPDATE_TODO: '1',
        TODO_CREATED_DATE: new Date('12/01/21').toJSON(),
      },
    });

    // mimic fixing the error manually via user interaction
    await project.write({
      src: {
        'with-fixable-error.js': getStringFixture('no-errors.js'),
      },
    });

    // normally we wouldn't need to use the --fix flag, since todos are auto-cleaned. Auto cleaning by default isn't
    // enabled in CI, however, so we need to force the fix in order to mimic the default behavior.
    const result = await runBin('--fix');

    expect(result.exitCode).toEqual(0);

    expect(readTodoStorageFile(getTodoStorageFilePath(project.baseDir)))
      .toMatchInlineSnapshot(`
      Array [
        "add|eslint|no-unused-vars|1|10|1|16|50f2c7b9dac0a4af1cde42fe5be7963201d0504d|1638316800000|1640908800000|1643500800000|src/with-fixable-error.js",
        "remove|eslint|no-unused-vars|1|10|1|16|50f2c7b9dac0a4af1cde42fe5be7963201d0504d|1638316800000|1640908800000|1643500800000|src/with-fixable-error.js",
      ]
    `);

    await runBin({
      env: {
        COMPACT_TODO: '1',
      },
    });

    expect(readTodoStorageFile(getTodoStorageFilePath(project.baseDir)))
      .toMatchInlineSnapshot(`
      Array [
        "add|eslint|no-unused-vars|1|10|1|16|50f2c7b9dac0a4af1cde42fe5be7963201d0504d|1638316800000|1640908800000|1643500800000|src/with-fixable-error.js",
      ]
    `);

    expect(result.exitCode).toEqual(0);
  });

  for (const { name, isLegacy, setTodoConfig } of [
    {
      name: 'Shorthand todo configuration',
      isLegacy: true,
      setTodoConfig: async (daysToDecay: DaysToDecay) =>
        await project.setShorthandPackageJsonTodoConfig(daysToDecay),
    },
    {
      name: 'Package.json todo configuration',
      isLegacy: false,
      setTodoConfig: async (
        daysToDecay: DaysToDecay,
        daysToDecayByRule?: DaysToDecayByRule
      ) =>
        await project.setPackageJsonTodoConfig(daysToDecay, daysToDecayByRule),
    },
    {
      name: '.lint-todorc.js todo configuration',
      isLegacy: false,
      setTodoConfig: async (
        daysToDecay: DaysToDecay,
        daysToDecayByRule?: DaysToDecayByRule
      ) => await project.setLintTodorc(daysToDecay, daysToDecayByRule),
    },
  ]) {
    // eslint-disable-next-line jest/valid-title
    describe(name, () => {
      it('should error if daysToDecay.error is less than daysToDecay.warn in config', async function () {
        await project.write({
          src: {
            'with-errors-0.js': getStringFixture('with-errors-0.js'),
          },
        });

        await setTodoConfig({
          warn: 10,
          error: 5,
        });

        const result = await runBin({
          env: { UPDATE_TODO: '1' },
        });

        expect(result.stderr).toMatch(
          'The provided todo configuration contains invalid values. The `warn` value (10) must be less than the `error` value (5).'
        );
      });

      it('should create todos with correct warn date set', async function () {
        await project.write({
          src: {
            'with-errors-0.js': getStringFixture('with-errors-0.js'),
          },
        });

        await setTodoConfig({
          warn: 10,
        });

        const result = await runBin({
          env: { UPDATE_TODO: '1' },
        });

        const todos = readTodoData(project.baseDir, buildReadOptions());

        expect(result.exitCode).toEqual(0);

        todos.forEach((todo) => {
          expect(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            differenceInDays(
              new Date(todo.warnDate!),
              new Date(todo.createdDate)
            )
          ).toEqual(10);
        });
      });

      it('should create todos with correct warn date set via env var (overrides config value)', async function () {
        await project.write({
          src: {
            'with-errors-0.js': getStringFixture('with-errors-0.js'),
          },
        });

        await setTodoConfig({
          warn: 10,
        });

        const result = await runBin({
          env: { UPDATE_TODO: '1', TODO_DAYS_TO_WARN: '30' },
        });

        const todos = readTodoData(project.baseDir, buildReadOptions());

        expect(result.exitCode).toEqual(0);

        todos.forEach((todo) => {
          expect(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            differenceInDays(
              new Date(todo.warnDate!),
              new Date(todo.createdDate)
            )
          ).toEqual(30);
        });
      });

      it('should create todos with correct error date set', async function () {
        await project.write({
          src: {
            'with-errors-0.js': getStringFixture('with-errors-0.js'),
          },
        });

        await setTodoConfig({
          error: 10,
        });

        const result = await runBin({
          env: { UPDATE_TODO: '1' },
        });

        const todos = readTodoData(project.baseDir, buildReadOptions());

        expect(result.exitCode).toEqual(0);

        todos.forEach((todo) => {
          expect(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            differenceInDays(
              new Date(todo.errorDate!),
              new Date(todo.createdDate)
            )
          ).toEqual(10);
        });
      });

      it('should create todos with correct error date set via env var (overrides config value)', async function () {
        await project.write({
          src: {
            'with-errors-0.js': getStringFixture('with-errors-0.js'),
          },
        });

        await setTodoConfig({
          error: 10,
        });

        const result = await runBin({
          env: { UPDATE_TODO: '1', TODO_DAYS_TO_ERROR: '30' },
        });

        const todos = readTodoData(project.baseDir, buildReadOptions());

        expect(result.exitCode).toEqual(0);

        todos.forEach((todo) => {
          expect(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            differenceInDays(
              new Date(todo.errorDate!),
              new Date(todo.createdDate)
            )
          ).toEqual(30);
        });
      });

      it('should create todos with correct dates set for warn and error', async function () {
        await project.write({
          src: {
            'with-errors-0.js': getStringFixture('with-errors-0.js'),
          },
        });

        await setTodoConfig({
          warn: 5,
          error: 10,
        });

        const result = await runBin({
          env: { UPDATE_TODO: '1' },
        });

        const todos = readTodoData(project.baseDir, buildReadOptions());

        expect(result.exitCode).toEqual(0);

        todos.forEach((todo) => {
          expect(
            differenceInDays(
              new Date(todo.warnDate!),
              new Date(todo.createdDate)
            )
          ).toEqual(5);
          expect(
            differenceInDays(
              new Date(todo.errorDate!),
              new Date(todo.createdDate)
            )
          ).toEqual(10);
        });
      });

      it('should create todos with correct dates set for warn and error via env var (overrides config value)', async function () {
        await project.write({
          src: {
            'with-errors-0.js': getStringFixture('with-errors-0.js'),
          },
        });

        await setTodoConfig({
          warn: 5,
          error: 10,
        });

        const result = await runBin({
          env: {
            UPDATE_TODO: '1',
            TODO_DAYS_TO_WARN: '10',
            TODO_DAYS_TO_ERROR: '20',
          },
        });

        const todos = readTodoData(project.baseDir, buildReadOptions());

        expect(result.exitCode).toEqual(0);

        todos.forEach((todo) => {
          expect(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            differenceInDays(
              new Date(todo.warnDate!),
              new Date(todo.createdDate)
            )
          ).toEqual(10);
          expect(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            differenceInDays(
              new Date(todo.errorDate!),
              new Date(todo.createdDate)
            )
          ).toEqual(20);
        });
      });

      it('should set to todo if warnDate is not expired', async function () {
        await project.write({
          src: {
            'with-errors-0.js': getStringFixture('with-errors-0.js'),
          },
        });

        await setTodoConfig({
          warn: 5,
        });

        await runBin({
          env: {
            UPDATE_TODO: '1',
          },
        });

        const result = await runBin({
          env: {
            INCLUDE_TODO: '1',
          },
        });
        const stdout = stripAnsi(result.stdout);

        expect(result.exitCode).toEqual(0);
        expect(stdout).toMatch(
          /1:10 {2}todo {2}'addOne' is defined but never used\s+no-unused-vars/
        );
        expect(stdout).toMatch(
          /2:7 {3}todo {2}Use the isNaN function to compare with NaN\s+use-isnan/
        );
        expect(stdout).toMatch(
          /2:9 {3}todo {2}Expected '!==' and instead saw '!='\s+eqeqeq/
        );
        expect(stdout).toMatch(
          /3:12 {2}todo {2}Unary operator '\+\+' used\s+no-plusplus/
        );
        expect(stdout).toMatch(
          /3:12 {2}todo {2}Assignment to function parameter 'i'\s+no-param-reassign/
        );
        expect(stdout).toMatch(
          /5:3 {3}todo {2}Function 'addOne' expected a return value\s+consistent-return/
        );
        expect(stdout).toMatch(
          /5:3 {3}todo {2}Unnecessary return statement\s+no-useless-return/
        );
        expect(stdout).toMatch(
          /✖ 0 problems \(0 errors, 0 warnings, 7 todos\)/
        );
      });

      it('should set to todo if errorDate is not expired', async function () {
        await project.write({
          src: {
            'with-errors-0.js': getStringFixture('with-errors-0.js'),
          },
        });

        await setTodoConfig({
          error: 5,
        });

        await runBin({
          env: {
            UPDATE_TODO: '1',
          },
        });

        const result = await runBin({
          env: {
            INCLUDE_TODO: '1',
          },
        });
        const stdout = stripAnsi(result.stdout);

        expect(result.exitCode).toEqual(0);
        expect(stdout).toMatch(
          /1:10 {2}todo {2}'addOne' is defined but never used\s+no-unused-vars/
        );
        expect(stdout).toMatch(
          /2:7 {3}todo {2}Use the isNaN function to compare with NaN\s+use-isnan/
        );
        expect(stdout).toMatch(
          /2:9 {3}todo {2}Expected '!==' and instead saw '!='\s+eqeqeq/
        );
        expect(stdout).toMatch(
          /3:12 {2}todo {2}Unary operator '\+\+' used\s+no-plusplus/
        );
        expect(stdout).toMatch(
          /3:12 {2}todo {2}Assignment to function parameter 'i'\s+no-param-reassign/
        );
        expect(stdout).toMatch(
          /5:3 {3}todo {2}Function 'addOne' expected a return value\s+consistent-return/
        );
        expect(stdout).toMatch(
          /5:3 {3}todo {2}Unnecessary return statement\s+no-useless-return/
        );
        expect(stdout).toMatch(
          /✖ 0 problems \(0 errors, 0 warnings, 7 todos\)/
        );
      });

      it('should set todo to warn if warnDate has expired via config', async function () {
        await project.write({
          src: {
            'with-errors-0.js': getStringFixture('with-errors-0.js'),
          },
        });

        await setTodoConfig({
          warn: 5,
        });

        await runBin({
          env: {
            UPDATE_TODO: '1',
            TODO_CREATED_DATE: subDays(new Date(), 10).toJSON(),
          },
        });

        const result = await runBin();
        const stdout = stripAnsi(result.stdout);

        expect(result.exitCode).toEqual(0);
        expect(stdout).toMatch(
          /1:10 {2}warning {2}'addOne' is defined but never used\s+no-unused-vars/
        );
        expect(stdout).toMatch(
          /2:7 {3}warning {2}Use the isNaN function to compare with NaN\s+use-isnan/
        );
        expect(stdout).toMatch(
          /2:9 {3}warning {2}Expected '!==' and instead saw '!='\s+eqeqeq/
        );
        expect(stdout).toMatch(
          /3:12 {2}warning {2}Unary operator '\+\+' used\s+no-plusplus/
        );
        expect(stdout).toMatch(
          /3:12 {2}warning {2}Assignment to function parameter 'i'\s+no-param-reassign/
        );
        expect(stdout).toMatch(
          /5:3 {3}warning {2}Function 'addOne' expected a return value\s+consistent-return/
        );
        expect(stdout).toMatch(
          /5:3 {3}warning {2}Unnecessary return statement\s+no-useless-return/
        );
        expect(stdout).toMatch(/✖ 7 problems \(0 errors, 7 warnings\)/);
      });

      it('should set todo to warn if warnDate has expired via env var', async function () {
        await project.write({
          src: {
            'with-errors-0.js': getStringFixture('with-errors-0.js'),
          },
        });

        await runBin({
          env: {
            UPDATE_TODO: '1',
            TODO_CREATED_DATE: subDays(new Date(), 10).toJSON(),
            TODO_DAYS_TO_WARN: '5',
          },
        });

        const result = await runBin();
        const stdout = stripAnsi(result.stdout);

        expect(result.exitCode).toEqual(0);
        expect(stdout).toMatch(
          /1:10 {2}warning {2}'addOne' is defined but never used\s+no-unused-vars/
        );
        expect(stdout).toMatch(
          /2:7 {3}warning {2}Use the isNaN function to compare with NaN\s+use-isnan/
        );
        expect(stdout).toMatch(
          /2:9 {3}warning {2}Expected '!==' and instead saw '!='\s+eqeqeq/
        );
        expect(stdout).toMatch(
          /3:12 {2}warning {2}Unary operator '\+\+' used\s+no-plusplus/
        );
        expect(stdout).toMatch(
          /3:12 {2}warning {2}Assignment to function parameter 'i'\s+no-param-reassign/
        );
        expect(stdout).toMatch(
          /5:3 {3}warning {2}Function 'addOne' expected a return value\s+consistent-return/
        );
        expect(stdout).toMatch(
          /5:3 {3}warning {2}Unnecessary return statement\s+no-useless-return/
        );
        expect(stdout).toMatch(/✖ 7 problems \(0 errors, 7 warnings\)/);
      });

      it('should set todo to warn if warnDate has expired but errorDate has not', async function () {
        await project.write({
          src: {
            'with-errors-0.js': getStringFixture('with-errors-0.js'),
          },
        });

        await setTodoConfig({
          warn: 5,
          error: 10,
        });

        await runBin({
          env: {
            UPDATE_TODO: '1',
            TODO_CREATED_DATE: subDays(new Date(), 7).toJSON(),
          },
        });

        const result = await runBin();
        const stdout = stripAnsi(result.stdout);

        expect(result.exitCode).toEqual(0);
        expect(stdout).toMatch(
          /1:10 {2}warning {2}'addOne' is defined but never used\s+no-unused-vars/
        );
        expect(stdout).toMatch(
          /2:7 {3}warning {2}Use the isNaN function to compare with NaN\s+use-isnan/
        );
        expect(stdout).toMatch(
          /2:9 {3}warning {2}Expected '!==' and instead saw '!='\s+eqeqeq/
        );
        expect(stdout).toMatch(
          /3:12 {2}warning {2}Unary operator '\+\+' used\s+no-plusplus/
        );
        expect(stdout).toMatch(
          /3:12 {2}warning {2}Assignment to function parameter 'i'\s+no-param-reassign/
        );
        expect(stdout).toMatch(
          /5:3 {3}warning {2}Function 'addOne' expected a return value\s+consistent-return/
        );
        expect(stdout).toMatch(
          /5:3 {3}warning {2}Unnecessary return statement\s+no-useless-return/
        );
        expect(stdout).toMatch(/✖ 7 problems \(0 errors, 7 warnings\)/);
      });

      it('should set todo to error if errorDate has expired via config', async function () {
        await project.write({
          src: {
            'with-errors-0.js': getStringFixture('with-errors-0.js'),
          },
        });

        await setTodoConfig({
          error: 5,
        });

        await runBin({
          env: {
            UPDATE_TODO: '1',
            TODO_CREATED_DATE: subDays(new Date(), 10).toJSON(),
          },
        });

        const result = await runBin();
        const stdout = stripAnsi(result.stdout);

        expect(result.exitCode).toEqual(1);
        expect(stdout).toMatch(
          /1:10 {2}error {2}'addOne' is defined but never used\s+no-unused-vars/
        );
        expect(stdout).toMatch(
          /2:7 {3}error {2}Use the isNaN function to compare with NaN\s+use-isnan/
        );
        expect(stdout).toMatch(
          /2:9 {3}error {2}Expected '!==' and instead saw '!='\s+eqeqeq/
        );
        expect(stdout).toMatch(
          /3:12 {2}error {2}Unary operator '\+\+' used\s+no-plusplus/
        );
        expect(stdout).toMatch(
          /3:12 {2}error {2}Assignment to function parameter 'i'\s+no-param-reassign/
        );
        expect(stdout).toMatch(
          /5:3 {3}error {2}Function 'addOne' expected a return value\s+consistent-return/
        );
        expect(stdout).toMatch(
          /5:3 {3}error {2}Unnecessary return statement\s+no-useless-return/
        );
        expect(stdout).toMatch(/✖ 7 problems \(7 errors, 0 warnings\)/);
      });

      it('should set todo to error if errorDate has expired via env var', async function () {
        await project.write({
          src: {
            'with-errors-0.js': getStringFixture('with-errors-0.js'),
          },
        });

        await runBin({
          env: {
            UPDATE_TODO: '1',
            TODO_CREATED_DATE: subDays(new Date(), 10).toJSON(),
            TODO_DAYS_TO_ERROR: '5',
          },
        });

        const result = await runBin();
        const stdout = stripAnsi(result.stdout);

        expect(result.exitCode).toEqual(1);
        expect(stdout).toMatch(
          /1:10 {2}error {2}'addOne' is defined but never used\s+no-unused-vars/
        );
        expect(stdout).toMatch(
          /2:7 {3}error {2}Use the isNaN function to compare with NaN\s+use-isnan/
        );
        expect(stdout).toMatch(
          /2:9 {3}error {2}Expected '!==' and instead saw '!='\s+eqeqeq/
        );
        expect(stdout).toMatch(
          /3:12 {2}error {2}Unary operator '\+\+' used\s+no-plusplus/
        );
        expect(stdout).toMatch(
          /3:12 {2}error {2}Assignment to function parameter 'i'\s+no-param-reassign/
        );
        expect(stdout).toMatch(
          /5:3 {3}error {2}Function 'addOne' expected a return value\s+consistent-return/
        );
        expect(stdout).toMatch(
          /5:3 {3}error {2}Unnecessary return statement\s+no-useless-return/
        );
        expect(stdout).toMatch(/✖ 7 problems \(7 errors, 0 warnings\)/);
      });

      it('should set todo to error if both warnDate and errorDate have expired via config', async function () {
        await project.write({
          src: {
            'with-errors-0.js': getStringFixture('with-errors-0.js'),
          },
        });

        await setTodoConfig({
          warn: 5,
          error: 10,
        });

        await runBin({
          env: {
            UPDATE_TODO: '1',
            TODO_CREATED_DATE: subDays(new Date(), 11).toJSON(),
          },
        });

        const result = await runBin();
        const stdout = stripAnsi(result.stdout);

        expect(result.exitCode).toEqual(1);
        expect(stdout).toMatch(
          /1:10 {2}error {2}'addOne' is defined but never used\s+no-unused-vars/
        );
        expect(stdout).toMatch(
          /2:7 {3}error {2}Use the isNaN function to compare with NaN\s+use-isnan/
        );
        expect(stdout).toMatch(
          /2:9 {3}error {2}Expected '!==' and instead saw '!='\s+eqeqeq/
        );
        expect(stdout).toMatch(
          /3:12 {2}error {2}Unary operator '\+\+' used\s+no-plusplus/
        );
        expect(stdout).toMatch(
          /3:12 {2}error {2}Assignment to function parameter 'i'\s+no-param-reassign/
        );
        expect(stdout).toMatch(
          /5:3 {3}error {2}Function 'addOne' expected a return value\s+consistent-return/
        );
        expect(stdout).toMatch(
          /5:3 {3}error {2}Unnecessary return statement\s+no-useless-return/
        );
        expect(stdout).toMatch(/✖ 7 problems \(7 errors, 0 warnings\)/);
      });

      it('should set todo to error if both warnDate and errorDate have expired via env vars', async function () {
        await project.write({
          src: {
            'with-errors-0.js': getStringFixture('with-errors-0.js'),
          },
        });

        await runBin({
          env: {
            UPDATE_TODO: '1',
            TODO_CREATED_DATE: subDays(new Date(), 11).toJSON(),
            TODO_DAYS_TO_WARN: '5',
            TODO_DAYS_TO_ERROR: '10',
          },
        });

        const result = await runBin();
        const stdout = stripAnsi(result.stdout);

        expect(result.exitCode).toEqual(1);
        expect(stdout).toMatch(
          /1:10 {2}error {2}'addOne' is defined but never used\s+no-unused-vars/
        );
        expect(stdout).toMatch(
          /2:7 {3}error {2}Use the isNaN function to compare with NaN\s+use-isnan/
        );
        expect(stdout).toMatch(
          /2:9 {3}error {2}Expected '!==' and instead saw '!='\s+eqeqeq/
        );
        expect(stdout).toMatch(
          /3:12 {2}error {2}Unary operator '\+\+' used\s+no-plusplus/
        );
        expect(stdout).toMatch(
          /3:12 {2}error {2}Assignment to function parameter 'i'\s+no-param-reassign/
        );
        expect(stdout).toMatch(
          /5:3 {3}error {2}Function 'addOne' expected a return value\s+consistent-return/
        );
        expect(stdout).toMatch(
          /5:3 {3}error {2}Unnecessary return statement\s+no-useless-return/
        );
        expect(stdout).toMatch(/✖ 7 problems \(7 errors, 0 warnings\)/);
      });

      if (!isLegacy) {
        it('should set todos to correct dates for specific rules', async () => {
          await project.write({
            src: {
              'one-error.js': `
              function addOne(i) {
                return i + 1;
              }`,
            },
          });

          await setTodoConfig(
            {
              warn: 5,
              error: 10,
            },
            {
              'no-unused-vars': {
                warn: 10,
                error: 20,
              },
            }
          );

          const result = await runBin({
            env: {
              UPDATE_TODO: '1',
            },
          });

          const todos = readTodoData(project.baseDir, buildReadOptions());

          expect(result.exitCode).toEqual(0);

          for (const todo of todos) {
            expect(
              differenceInDays(
                new Date(todo.warnDate!),
                new Date(todo.createdDate)
              )
            ).toEqual(10);
            expect(
              differenceInDays(
                new Date(todo.errorDate!),
                new Date(todo.createdDate)
              )
            ).toEqual(20);
          }
        });
      }
    });
  }

  it('when given FORMAT_TODO_AS will output with that formatters format', async () => {
    await project.write({
      src: {
        'with-errors-0.js': getStringFixture('with-errors-0.js'),
      },
    });

    const result = await runBin({
      env: {
        FORMAT_TODO_AS: '@microsoft/eslint-formatter-sarif',
      },
    });

    expect(JSON.parse(result.stdout)).toBeValidSarifLog();
  });

  it('when given FORMAT_TODO_AS will ensure that results provided to that formatter do not include todos', async () => {
    await project.write({
      src: {
        'with-errors-0.js': getStringFixture('with-errors-0.js'),
      },
    });

    let result = await runBin();

    expect(result.stdout).toMatch('7 problems (7 errors, 0 warnings)');

    result = await runBin({
      env: {
        UPDATE_TODO: '1',
      },
    });

    // we should have created todos for all of the errors
    expect(result.stdout).toMatch(
      '7 todos created, 0 todos removed (warn after 30, error after 60 days)'
    );

    result = await runBin({
      env: {
        FORMAT_TODO_AS: '@microsoft/eslint-formatter-sarif',
      },
    });

    // extract errors from SARIF results, we should continue to have no errors (todos are respected with external formatter)
    const potentialErrors = JSON.parse(result.stdout).runs[0].results.reduce(
      (acc: string[], result: any) =>
        result.level === 'error' ? [...acc, result.message.text] : acc,
      []
    );

    expect(potentialErrors).toHaveLength(0);
  });
});
