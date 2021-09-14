import execa from 'execa';
import stripAnsi from 'strip-ansi';
import { differenceInDays, subDays } from 'date-fns';
import { readdirSync } from 'fs-extra';
import {
  DaysToDecay,
  DaysToDecayByRule,
  getTodoStorageDirPath,
  readTodoData,
  todoStorageDirExists,
  writeTodos,
} from '@ember-template-lint/todo-utils';
import { FakeProject } from '../__utils__/fake-project';
import { getObjectFixture, getStringFixture } from '../__utils__/get-fixture';
import { buildMaybeTodos } from '../../src/formatter';

describe('eslint with todo formatter', function () {
  let project: FakeProject;

  function runEslintWithFormatter(
    argsOrOptions?: string[] | execa.Options,
    options?: execa.Options
  ) {
    if (arguments.length > 0) {
      if (arguments.length === 1) {
        if (Array.isArray(argsOrOptions)) {
          options = {};
        } else {
          options = argsOrOptions as execa.Options;
          argsOrOptions = [];
        }
      }
    } else {
      argsOrOptions = [];
      options = {};
    }

    const mergedOptions = Object.assign(
      {
        reject: false,
        cwd: project.baseDir,
      },
      options
    );

    return execa(
      './node_modules/.bin/eslint',
      [
        'src',
        '-c',
        './eslint-config.json',
        '--no-eslintrc',
        '--format',
        require.resolve('../..'),
        ...(argsOrOptions as string[]),
      ],
      mergedOptions
    );
  }

  beforeEach(() => {
    project = FakeProject.getInstance();
  });

  afterEach(() => {
    // project.dispose();
  });

  it('errors if todo config exists in both package.json and .lint-todorc.js', async function () {
    project.write({
      src: {
        'no-problems.js': getStringFixture('with-no-problems.js'),
      },
    });

    project.setShorthandPackageJsonTodoConfig({
      warn: 5,
      error: 10,
    });

    project.setLintTodorc({
      warn: 5,
      error: 10,
    });

    const result = await runEslintWithFormatter();

    expect(result.exitCode).toBeGreaterThan(0);
    expect(result.stderr).toMatch(
      /You cannot have todo configurations in both package.json and .lint-todorc.js. Please move the configuration from the package.json to the .lint-todorc.js/
    );
  });

  it('should not emit anything when there are no errors or warnings', async () => {
    project.write({
      src: {
        'no-problems.js': getStringFixture('with-no-problems.js'),
      },
    });

    const result = await runEslintWithFormatter();

    expect(result.stdout).toEqual('');
    expect(result.exitCode).toEqual(0);
  });

  it('errors if using either TODO_DAYS_TO_WARN or TODO_DAYS_TO_ERROR without UPDATE_TODO', async () => {
    project.write({
      src: {
        'no-problems.js': getStringFixture('with-no-problems.js'),
      },
    });

    let result = await runEslintWithFormatter({
      env: { TODO_DAYS_TO_WARN: '10' },
    });

    expect(result.stderr).toContain(
      'Using `TODO_DAYS_TO_WARN` or `TODO_DAYS_TO_ERROR` is only valid when the `UPDATE_TODO` environment variable is being used.'
    );
    expect(result.exitCode).toBeGreaterThan(0);

    result = await runEslintWithFormatter({
      env: { TODO_DAYS_TO_ERROR: '10' },
    });

    expect(result.stderr).toContain(
      'Using `TODO_DAYS_TO_WARN` or `TODO_DAYS_TO_ERROR` is only valid when the `UPDATE_TODO` environment variable is being used.'
    );
    expect(result.exitCode).toBeGreaterThan(0);
  });

  it('with UPDATE_TODO but no todos, outputs todos created summary', async function () {
    project.write({
      src: {
        'no-problems.js': getStringFixture('with-no-problems.js'),
      },
    });

    const result = await runEslintWithFormatter({
      env: {
        UPDATE_TODO: '1',
      },
    });

    expect(result.exitCode).toEqual(0);
    expect(result.stdout).toMatch(/✔ 0 todos created, 0 todos removed/);
  });

  it('with UPDATE_TODO, outputs todos created summary', async () => {
    project.write({
      src: {
        'with-errors-0.js': getStringFixture('with-errors-0.js'),
        'with-errors-1.js': getStringFixture('with-errors-1.js'),
      },
    });

    const result = await runEslintWithFormatter({
      env: { UPDATE_TODO: '1' },
    });

    expect(result.exitCode).toEqual(0);
    expect(result.stdout).toMatch(/✔ 10 todos created, 0 todos removed/);
  });

  it('with UPDATE_TODO and INCLUDE_TODO, outputs todos created summary', async () => {
    project.write({
      src: {
        'with-errors-0.js': getStringFixture('with-errors-0.js'),
        'with-errors-1.js': getStringFixture('with-errors-1.js'),
      },
    });

    const result = await runEslintWithFormatter({
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
    project.write({
      src: {
        'with-errors-0.js': getStringFixture('with-errors-0.js'),
        'with-errors-1.js': getStringFixture('with-errors-1.js'),
      },
    });

    const result = await runEslintWithFormatter({
      env: { UPDATE_TODO: '1', TODO_DAYS_TO_WARN: '10' },
    });

    expect(result.exitCode).toEqual(0);
    expect(result.stdout).toMatch(
      /✔ 10 todos created, 0 todos removed \(warn after 10 days\)/
    );
  });

  it('with UPDATE_TODO, outputs todos created summary with error info', async () => {
    project.write({
      src: {
        'with-errors-0.js': getStringFixture('with-errors-0.js'),
        'with-errors-1.js': getStringFixture('with-errors-1.js'),
      },
    });

    const result = await runEslintWithFormatter({
      env: { UPDATE_TODO: '1', TODO_DAYS_TO_ERROR: '10' },
    });

    expect(result.exitCode).toEqual(0);
    expect(result.stdout).toMatch(
      /✔ 10 todos created, 0 todos removed \(error after 10 days\)/
    );
  });

  it('with UPDATE_TODO, outputs todos created summary with warn and error info', async () => {
    project.write({
      src: {
        'with-errors-0.js': getStringFixture('with-errors-0.js'),
        'with-errors-1.js': getStringFixture('with-errors-1.js'),
      },
    });

    const result = await runEslintWithFormatter({
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
    project.write({
      src: {
        'with-errors-and-warnings.js': getStringFixture(
          'with-errors-and-warnings.js'
        ),
      },
    });

    const result = await runEslintWithFormatter();
    const stdout = stripAnsi(result.stdout);

    expect(result.exitCode).toEqual(1);
    expect(stdout).toMatch(
      /1:10  error {4}'sayHi' is defined but never used  no-unused-vars/
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
    project.write({
      src: {
        'with-errors-0.js': getStringFixture('with-errors-0.js'),
      },
    });

    let result = await runEslintWithFormatter({
      env: {
        UPDATE_TODO: '1',
      },
    });

    expect(result.exitCode).toEqual(0);
    expect(todoStorageDirExists(project.baseDir)).toEqual(true);
    expect(readTodoData(project.baseDir)).toHaveLength(7);

    result = await runEslintWithFormatter();

    expect(result.exitCode).toEqual(0);
  });

  it('generates todos for existing errors, and correctly reports todo severity when file is edited to trigger fuzzy match', async function () {
    project.write({
      src: {
        'with-errors.js': getStringFixture('with-errors-0.js'),
      },
    });

    let result = await runEslintWithFormatter({
      env: {
        UPDATE_TODO: '1',
      },
    });

    expect(result.exitCode).toEqual(0);
    expect(todoStorageDirExists(project.baseDir)).toEqual(true);
    expect(readTodoData(project.baseDir)).toHaveLength(7);

    project.write({
      src: {
        'with-errors.js': getStringFixture('with-errors-for-fuzzy.js'),
      },
    });

    result = await runEslintWithFormatter();

    expect(result.exitCode).toEqual(0);
  });

  it('should not remove todos from another engine', async function () {
    project.write({
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
      )
    );

    const result = await runEslintWithFormatter({
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
    project.write({
      src: {
        'with-errors-0.js': getStringFixture('with-errors-0.js'),
        'with-errors-1.js': getStringFixture('with-errors-1.js'),
      },
    });

    const result = await runEslintWithFormatter({
      env: { UPDATE_TODO: '1', INCLUDE_TODO: '1' },
    });
    const stdout = stripAnsi(result.stdout);

    expect(result.exitCode).toEqual(0);
    expect(stdout).toMatch(
      /1:10  todo  'addOne' is defined but never used\s+no-unused-vars/
    );
    expect(stdout).toMatch(
      /1:10  todo  'fibonacci' is defined but never used\s+no-unused-vars/
    );
    expect(stdout).toMatch(/✖ 0 problems \(0 errors, 0 warnings, 10 todos\)/);
  });

  it('should emit todo items and count when INCLUDE_TODO=1 is set alone with prior todo items', async () => {
    project.write({
      src: {
        'with-errors-0.js': getStringFixture('with-errors-0.js'),
        'with-errors-1.js': getStringFixture('with-errors-1.js'),
      },
    });

    // run eslint to generate todo dir but don't capture the result because this is not what we're testing
    await runEslintWithFormatter({
      env: { UPDATE_TODO: '1' },
    });

    // run with INCLUDE_TODO (this is what we're testing)
    const result = await runEslintWithFormatter({
      env: { INCLUDE_TODO: '1' },
    });

    const stdout = stripAnsi(result.stdout);

    expect(result.exitCode).toEqual(0);
    expect(stdout).toMatch(
      /1:10  todo  'addOne' is defined but never used\s+no-unused-vars/
    );
    expect(stdout).toMatch(
      /1:10  todo  'fibonacci' is defined but never used\s+no-unused-vars/
    );
    expect(stdout).toMatch(/✖ 0 problems \(0 errors, 0 warnings, 10 todos\)/);
  });

  it('should emit errors, warnings, and todos when all of these are present and INCLUDE_TODO=1 is set', async () => {
    // first we generate project files with errors and convert them to todos
    project.write({
      src: {
        'with-errors-0.js': getStringFixture('with-errors-0.js'),
      },
    });

    await runEslintWithFormatter({
      env: { UPDATE_TODO: '1' },
    });

    // now we add new errors and warnings to test output with all problems
    project.write({
      src: {
        'with-errors-and-warnings.js': getStringFixture(
          'with-errors-and-warnings.js'
        ),
      },
    });

    const result = await runEslintWithFormatter({
      env: { INCLUDE_TODO: '1' },
    });

    const stdout = stripAnsi(result.stdout);

    expect(result.exitCode).toEqual(1);
    expect(stdout).toMatch(
      /1:10  todo  'addOne' is defined but never used\s+no-unused-vars/
    );
    expect(stdout).toMatch(
      /1:10  error    'sayHi' is defined but never used\s+no-unused-vars/
    );
    expect(stdout).toMatch(/2:3   warning  Unexpected alert\s+no-alert/);
    expect(stdout).toMatch(/✖ 3 problems \(2 errors, 1 warning, 7 todos\)/);
  });

  it('errors if a todo item is no longer valid when running without params, and fixes with --fix', async function () {
    project.write({
      src: {
        'with-fixable-error.js': getStringFixture('with-fixable-error.js'),
      },
    });

    // generate todo based on existing error
    await runEslintWithFormatter({
      env: { UPDATE_TODO: '1' },
    });

    // mimic fixing the error manually via user interaction
    project.write({
      src: {
        'with-fixable-error.js': getStringFixture('no-errors.js'),
      },
    });

    // run normally and expect an error for not running --fix
    let result = await runEslintWithFormatter();

    expect(result.exitCode).toEqual(1);
    const results = stripAnsi(result.stdout).trim().split(/\r?\n/);

    expect(results[1]).toMatch(
      /0:0  error  Todo violation passes `no-unused-vars` rule. Please run with `CLEAN_TODO=1` env var to remove this todo from the todo list  invalid-todo-violation-rule/
    );
    expect(results[3]).toMatch(/✖ 1 problem \(1 error, 0 warnings\)/);

    // run fix, and expect that this will delete the outstanding todo item
    await runEslintWithFormatter(['--fix']);

    // run normally again and expect no error
    result = await runEslintWithFormatter();

    const todoDirs = readdirSync(getTodoStorageDirPath(project.baseDir));

    expect(result.exitCode).toEqual(0);
    expect(stripAnsi(result.stdout).trim()).toEqual('');
    expect(todoDirs).toHaveLength(0);
  });

  it('errors if a todo item is no longer valid when running without params, and fixes with CLEAN_TODO=1', async function () {
    project.write({
      src: {
        'with-fixable-error.js': getStringFixture('with-fixable-error.js'),
      },
    });

    // generate todo based on existing error
    await runEslintWithFormatter({
      env: { UPDATE_TODO: '1' },
    });

    // mimic fixing the error manually via user interaction
    project.write({
      src: {
        'with-fixable-error.js': getStringFixture('no-errors.js'),
      },
    });

    // run normally and expect an error for not running --fix
    let result = await runEslintWithFormatter();

    expect(result.exitCode).toEqual(1);
    const results = stripAnsi(result.stdout).trim().split(/\r?\n/);

    expect(results[1]).toMatch(
      /0:0  error  Todo violation passes `no-unused-vars` rule. Please run with `CLEAN_TODO=1` env var to remove this todo from the todo list  invalid-todo-violation-rule/
    );
    expect(results[3]).toMatch(/✖ 1 problem \(1 error, 0 warnings\)/);

    // run fix, and expect that this will delete the outstanding todo item
    await runEslintWithFormatter({
      env: { CLEAN_TODO: '1' },
    });

    // run normally again and expect no error
    result = await runEslintWithFormatter();

    const todoDirs = readdirSync(getTodoStorageDirPath(project.baseDir));

    expect(result.exitCode).toEqual(0);
    expect(stripAnsi(result.stdout).trim()).toEqual('');
    expect(todoDirs).toHaveLength(0);
  });

  for (const { name, isLegacy, setTodoConfig } of [
    {
      name: 'Shorthand todo configuration',
      isLegacy: true,
      setTodoConfig: (daysToDecay: DaysToDecay) =>
        project.setShorthandPackageJsonTodoConfig(daysToDecay),
    },
    {
      name: 'Package.json todo configuration',
      isLegacy: false,
      setTodoConfig: (
        daysToDecay: DaysToDecay,
        daysToDecayByRule?: DaysToDecayByRule
      ) => project.setPackageJsonTodoConfig(daysToDecay, daysToDecayByRule),
    },
    {
      name: '.lint-todorc.js todo configuration',
      isLegacy: false,
      setTodoConfig: (
        daysToDecay: DaysToDecay,
        daysToDecayByRule?: DaysToDecayByRule
      ) => project.setLintTodorc(daysToDecay, daysToDecayByRule),
    },
  ]) {
    // eslint-disable-next-line jest/valid-title
    describe(name, () => {
      it('should error if daysToDecay.error is less than daysToDecay.warn in config', async function () {
        project.write({
          src: {
            'with-errors-0.js': getStringFixture('with-errors-0.js'),
          },
        });

        setTodoConfig({
          warn: 10,
          error: 5,
        });

        const result = await runEslintWithFormatter({
          env: { UPDATE_TODO: '1' },
        });

        expect(result.stderr).toMatch(
          'The provided todo configuration contains invalid values. The `warn` value (10) must be less than the `error` value (5).'
        );
      });

      it('should create todos with correct warn date set', async function () {
        project.write({
          src: {
            'with-errors-0.js': getStringFixture('with-errors-0.js'),
          },
        });

        setTodoConfig({
          warn: 10,
        });

        const result = await runEslintWithFormatter({
          env: { UPDATE_TODO: '1' },
        });

        const todos = readTodoData(project.baseDir);

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
        project.write({
          src: {
            'with-errors-0.js': getStringFixture('with-errors-0.js'),
          },
        });

        setTodoConfig({
          warn: 10,
        });

        const result = await runEslintWithFormatter({
          env: { UPDATE_TODO: '1', TODO_DAYS_TO_WARN: '30' },
        });

        const todos = readTodoData(project.baseDir);

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
        project.write({
          src: {
            'with-errors-0.js': getStringFixture('with-errors-0.js'),
          },
        });

        setTodoConfig({
          error: 10,
        });

        const result = await runEslintWithFormatter({
          env: { UPDATE_TODO: '1' },
        });

        const todos = readTodoData(project.baseDir);

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
        project.write({
          src: {
            'with-errors-0.js': getStringFixture('with-errors-0.js'),
          },
        });

        setTodoConfig({
          error: 10,
        });

        const result = await runEslintWithFormatter({
          env: { UPDATE_TODO: '1', TODO_DAYS_TO_ERROR: '30' },
        });

        const todos = readTodoData(project.baseDir);

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
        project.write({
          src: {
            'with-errors-0.js': getStringFixture('with-errors-0.js'),
          },
        });

        setTodoConfig({
          warn: 5,
          error: 10,
        });

        const result = await runEslintWithFormatter({
          env: { UPDATE_TODO: '1' },
        });

        const todos = readTodoData(project.baseDir);

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
        project.write({
          src: {
            'with-errors-0.js': getStringFixture('with-errors-0.js'),
          },
        });

        setTodoConfig({
          warn: 5,
          error: 10,
        });

        const result = await runEslintWithFormatter({
          env: {
            UPDATE_TODO: '1',
            TODO_DAYS_TO_WARN: '10',
            TODO_DAYS_TO_ERROR: '20',
          },
        });

        const todos = readTodoData(project.baseDir);

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
        project.write({
          src: {
            'with-errors-0.js': getStringFixture('with-errors-0.js'),
          },
        });

        setTodoConfig({
          warn: 5,
        });

        await runEslintWithFormatter({
          env: {
            UPDATE_TODO: '1',
          },
        });

        const result = await runEslintWithFormatter({
          env: {
            INCLUDE_TODO: '1',
          },
        });
        const stdout = stripAnsi(result.stdout);

        expect(result.exitCode).toEqual(0);
        expect(stdout).toMatch(
          /1:10  todo  'addOne' is defined but never used\s+no-unused-vars/
        );
        expect(stdout).toMatch(
          /2:7   todo  Use the isNaN function to compare with NaN\s+use-isnan/
        );
        expect(stdout).toMatch(
          /2:9   todo  Expected '!==' and instead saw '!='\s+eqeqeq/
        );
        expect(stdout).toMatch(
          /3:12  todo  Unary operator '\+\+' used\s+no-plusplus/
        );
        expect(stdout).toMatch(
          /3:12  todo  Assignment to function parameter 'i'\s+no-param-reassign/
        );
        expect(stdout).toMatch(
          /5:3   todo  Function 'addOne' expected a return value\s+consistent-return/
        );
        expect(stdout).toMatch(
          /5:3   todo  Unnecessary return statement\s+no-useless-return/
        );
        expect(stdout).toMatch(
          /✖ 0 problems \(0 errors, 0 warnings, 7 todos\)/
        );
      });

      it('should set to todo if errorDate is not expired', async function () {
        project.write({
          src: {
            'with-errors-0.js': getStringFixture('with-errors-0.js'),
          },
        });

        setTodoConfig({
          error: 5,
        });

        await runEslintWithFormatter({
          env: {
            UPDATE_TODO: '1',
          },
        });

        const result = await runEslintWithFormatter({
          env: {
            INCLUDE_TODO: '1',
          },
        });
        const stdout = stripAnsi(result.stdout);

        expect(result.exitCode).toEqual(0);
        expect(stdout).toMatch(
          /1:10  todo  'addOne' is defined but never used\s+no-unused-vars/
        );
        expect(stdout).toMatch(
          /2:7   todo  Use the isNaN function to compare with NaN\s+use-isnan/
        );
        expect(stdout).toMatch(
          /2:9   todo  Expected '!==' and instead saw '!='\s+eqeqeq/
        );
        expect(stdout).toMatch(
          /3:12  todo  Unary operator '\+\+' used\s+no-plusplus/
        );
        expect(stdout).toMatch(
          /3:12  todo  Assignment to function parameter 'i'\s+no-param-reassign/
        );
        expect(stdout).toMatch(
          /5:3   todo  Function 'addOne' expected a return value\s+consistent-return/
        );
        expect(stdout).toMatch(
          /5:3   todo  Unnecessary return statement\s+no-useless-return/
        );
        expect(stdout).toMatch(
          /✖ 0 problems \(0 errors, 0 warnings, 7 todos\)/
        );
      });

      it('should set todo to warn if warnDate has expired via config', async function () {
        project.write({
          src: {
            'with-errors-0.js': getStringFixture('with-errors-0.js'),
          },
        });

        setTodoConfig({
          warn: 5,
        });

        await runEslintWithFormatter({
          env: {
            UPDATE_TODO: '1',
            TODO_CREATED_DATE: subDays(new Date(), 10).toJSON(),
          },
        });

        const result = await runEslintWithFormatter();
        const stdout = stripAnsi(result.stdout);

        expect(result.exitCode).toEqual(0);
        expect(stdout).toMatch(
          /1:10  warning  'addOne' is defined but never used\s+no-unused-vars/
        );
        expect(stdout).toMatch(
          /2:7   warning  Use the isNaN function to compare with NaN\s+use-isnan/
        );
        expect(stdout).toMatch(
          /2:9   warning  Expected '!==' and instead saw '!='\s+eqeqeq/
        );
        expect(stdout).toMatch(
          /3:12  warning  Unary operator '\+\+' used\s+no-plusplus/
        );
        expect(stdout).toMatch(
          /3:12  warning  Assignment to function parameter 'i'\s+no-param-reassign/
        );
        expect(stdout).toMatch(
          /5:3   warning  Function 'addOne' expected a return value\s+consistent-return/
        );
        expect(stdout).toMatch(
          /5:3   warning  Unnecessary return statement\s+no-useless-return/
        );
        expect(stdout).toMatch(/✖ 7 problems \(0 errors, 7 warnings\)/);
      });

      it('should set todo to warn if warnDate has expired via env var', async function () {
        project.write({
          src: {
            'with-errors-0.js': getStringFixture('with-errors-0.js'),
          },
        });

        await runEslintWithFormatter({
          env: {
            UPDATE_TODO: '1',
            TODO_CREATED_DATE: subDays(new Date(), 10).toJSON(),
            TODO_DAYS_TO_WARN: '5',
          },
        });

        const result = await runEslintWithFormatter();
        const stdout = stripAnsi(result.stdout);

        expect(result.exitCode).toEqual(0);
        expect(stdout).toMatch(
          /1:10  warning  'addOne' is defined but never used\s+no-unused-vars/
        );
        expect(stdout).toMatch(
          /2:7   warning  Use the isNaN function to compare with NaN\s+use-isnan/
        );
        expect(stdout).toMatch(
          /2:9   warning  Expected '!==' and instead saw '!='\s+eqeqeq/
        );
        expect(stdout).toMatch(
          /3:12  warning  Unary operator '\+\+' used\s+no-plusplus/
        );
        expect(stdout).toMatch(
          /3:12  warning  Assignment to function parameter 'i'\s+no-param-reassign/
        );
        expect(stdout).toMatch(
          /5:3   warning  Function 'addOne' expected a return value\s+consistent-return/
        );
        expect(stdout).toMatch(
          /5:3   warning  Unnecessary return statement\s+no-useless-return/
        );
        expect(stdout).toMatch(/✖ 7 problems \(0 errors, 7 warnings\)/);
      });

      it('should set todo to warn if warnDate has expired but errorDate has not', async function () {
        project.write({
          src: {
            'with-errors-0.js': getStringFixture('with-errors-0.js'),
          },
        });

        setTodoConfig({
          warn: 5,
          error: 10,
        });

        await runEslintWithFormatter({
          env: {
            UPDATE_TODO: '1',
            TODO_CREATED_DATE: subDays(new Date(), 7).toJSON(),
          },
        });

        const result = await runEslintWithFormatter();
        const stdout = stripAnsi(result.stdout);

        expect(result.exitCode).toEqual(0);
        expect(stdout).toMatch(
          /1:10  warning  'addOne' is defined but never used\s+no-unused-vars/
        );
        expect(stdout).toMatch(
          /2:7   warning  Use the isNaN function to compare with NaN\s+use-isnan/
        );
        expect(stdout).toMatch(
          /2:9   warning  Expected '!==' and instead saw '!='\s+eqeqeq/
        );
        expect(stdout).toMatch(
          /3:12  warning  Unary operator '\+\+' used\s+no-plusplus/
        );
        expect(stdout).toMatch(
          /3:12  warning  Assignment to function parameter 'i'\s+no-param-reassign/
        );
        expect(stdout).toMatch(
          /5:3   warning  Function 'addOne' expected a return value\s+consistent-return/
        );
        expect(stdout).toMatch(
          /5:3   warning  Unnecessary return statement\s+no-useless-return/
        );
        expect(stdout).toMatch(/✖ 7 problems \(0 errors, 7 warnings\)/);
      });

      it('should set todo to error if errorDate has expired via config', async function () {
        project.write({
          src: {
            'with-errors-0.js': getStringFixture('with-errors-0.js'),
          },
        });

        setTodoConfig({
          error: 5,
        });

        await runEslintWithFormatter({
          env: {
            UPDATE_TODO: '1',
            TODO_CREATED_DATE: subDays(new Date(), 10).toJSON(),
          },
        });

        const result = await runEslintWithFormatter();
        const stdout = stripAnsi(result.stdout);

        expect(result.exitCode).toEqual(1);
        expect(stdout).toMatch(
          /1:10  error  'addOne' is defined but never used\s+no-unused-vars/
        );
        expect(stdout).toMatch(
          /2:7   error  Use the isNaN function to compare with NaN\s+use-isnan/
        );
        expect(stdout).toMatch(
          /2:9   error  Expected '!==' and instead saw '!='\s+eqeqeq/
        );
        expect(stdout).toMatch(
          /3:12  error  Unary operator '\+\+' used\s+no-plusplus/
        );
        expect(stdout).toMatch(
          /3:12  error  Assignment to function parameter 'i'\s+no-param-reassign/
        );
        expect(stdout).toMatch(
          /5:3   error  Function 'addOne' expected a return value\s+consistent-return/
        );
        expect(stdout).toMatch(
          /5:3   error  Unnecessary return statement\s+no-useless-return/
        );
        expect(stdout).toMatch(/✖ 7 problems \(7 errors, 0 warnings\)/);
      });

      it('should set todo to error if errorDate has expired via env var', async function () {
        project.write({
          src: {
            'with-errors-0.js': getStringFixture('with-errors-0.js'),
          },
        });

        await runEslintWithFormatter({
          env: {
            UPDATE_TODO: '1',
            TODO_CREATED_DATE: subDays(new Date(), 10).toJSON(),
            TODO_DAYS_TO_ERROR: '5',
          },
        });

        const result = await runEslintWithFormatter();
        const stdout = stripAnsi(result.stdout);

        expect(result.exitCode).toEqual(1);
        expect(stdout).toMatch(
          /1:10  error  'addOne' is defined but never used\s+no-unused-vars/
        );
        expect(stdout).toMatch(
          /2:7   error  Use the isNaN function to compare with NaN\s+use-isnan/
        );
        expect(stdout).toMatch(
          /2:9   error  Expected '!==' and instead saw '!='\s+eqeqeq/
        );
        expect(stdout).toMatch(
          /3:12  error  Unary operator '\+\+' used\s+no-plusplus/
        );
        expect(stdout).toMatch(
          /3:12  error  Assignment to function parameter 'i'\s+no-param-reassign/
        );
        expect(stdout).toMatch(
          /5:3   error  Function 'addOne' expected a return value\s+consistent-return/
        );
        expect(stdout).toMatch(
          /5:3   error  Unnecessary return statement\s+no-useless-return/
        );
        expect(stdout).toMatch(/✖ 7 problems \(7 errors, 0 warnings\)/);
      });

      it('should set todo to error if both warnDate and errorDate have expired via config', async function () {
        project.write({
          src: {
            'with-errors-0.js': getStringFixture('with-errors-0.js'),
          },
        });

        setTodoConfig({
          warn: 5,
          error: 10,
        });

        await runEslintWithFormatter({
          env: {
            UPDATE_TODO: '1',
            TODO_CREATED_DATE: subDays(new Date(), 11).toJSON(),
          },
        });

        const result = await runEslintWithFormatter();
        const stdout = stripAnsi(result.stdout);

        expect(result.exitCode).toEqual(1);
        expect(stdout).toMatch(
          /1:10  error  'addOne' is defined but never used\s+no-unused-vars/
        );
        expect(stdout).toMatch(
          /2:7   error  Use the isNaN function to compare with NaN\s+use-isnan/
        );
        expect(stdout).toMatch(
          /2:9   error  Expected '!==' and instead saw '!='\s+eqeqeq/
        );
        expect(stdout).toMatch(
          /3:12  error  Unary operator '\+\+' used\s+no-plusplus/
        );
        expect(stdout).toMatch(
          /3:12  error  Assignment to function parameter 'i'\s+no-param-reassign/
        );
        expect(stdout).toMatch(
          /5:3   error  Function 'addOne' expected a return value\s+consistent-return/
        );
        expect(stdout).toMatch(
          /5:3   error  Unnecessary return statement\s+no-useless-return/
        );
        expect(stdout).toMatch(/✖ 7 problems \(7 errors, 0 warnings\)/);
      });

      it('should set todo to error if both warnDate and errorDate have expired via env vars', async function () {
        project.write({
          src: {
            'with-errors-0.js': getStringFixture('with-errors-0.js'),
          },
        });

        await runEslintWithFormatter({
          env: {
            UPDATE_TODO: '1',
            TODO_CREATED_DATE: subDays(new Date(), 11).toJSON(),
            TODO_DAYS_TO_WARN: '5',
            TODO_DAYS_TO_ERROR: '10',
          },
        });

        const result = await runEslintWithFormatter();
        const stdout = stripAnsi(result.stdout);

        expect(result.exitCode).toEqual(1);
        expect(stdout).toMatch(
          /1:10  error  'addOne' is defined but never used\s+no-unused-vars/
        );
        expect(stdout).toMatch(
          /2:7   error  Use the isNaN function to compare with NaN\s+use-isnan/
        );
        expect(stdout).toMatch(
          /2:9   error  Expected '!==' and instead saw '!='\s+eqeqeq/
        );
        expect(stdout).toMatch(
          /3:12  error  Unary operator '\+\+' used\s+no-plusplus/
        );
        expect(stdout).toMatch(
          /3:12  error  Assignment to function parameter 'i'\s+no-param-reassign/
        );
        expect(stdout).toMatch(
          /5:3   error  Function 'addOne' expected a return value\s+consistent-return/
        );
        expect(stdout).toMatch(
          /5:3   error  Unnecessary return statement\s+no-useless-return/
        );
        expect(stdout).toMatch(/✖ 7 problems \(7 errors, 0 warnings\)/);
      });

      if (!isLegacy) {
        it('should set todos to correct dates for specific rules', async () => {
          project.write({
            src: {
              'one-error.js': `
              function addOne(i) {
                return i + 1;
              }`,
            },
          });

          setTodoConfig(
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

          const result = await runEslintWithFormatter({
            env: {
              UPDATE_TODO: '1',
            },
          });

          const todos = readTodoData(project.baseDir);

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
});
