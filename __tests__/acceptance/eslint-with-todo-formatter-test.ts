import execa from 'execa';
import stripAnsi from 'strip-ansi';
import { posix } from 'path';
import { getTodoStorageDirPath } from '@ember-template-lint/todo-utils';
import { FakeProject } from '../__utils__/fake-project';
import { readFile as readFixture } from '../__utils__/read-file-cached';
import { readdirSync } from 'fs-extra';

describe('eslint with todo formatter', function () {
  let project: FakeProject;

  function runEslintWithFormatter(
    argsOrOptions?: string[] | execa.Options,
    options?: execa.Options
  ) {
    if (arguments.length > 0) {
      if (arguments.length === 1) {
        if (typeof argsOrOptions === 'object') {
          options = argsOrOptions as execa.Options;
          argsOrOptions = [];
        } else {
          options = {};
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
    project.dispose();
  });

  it('should not emit anything when there are no errors or warnings', async () => {
    project.write({
      src: {
        'no-problems.js': readFixture('with-no-problems.js'),
      },
    });
    project.install();

    const result = await runEslintWithFormatter();

    expect(result.stdout).toEqual('');
  });

  it('should emit errors and warnings as normal', async () => {
    project.write({
      src: {
        'with-errors-and-warnings.js': readFixture(
          'with-errors-and-warnings.js'
        ),
      },
    });
    project.install();

    const result = await runEslintWithFormatter();

    const stdout = stripAnsi(result.stdout);

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

  it('should not emit anything when only UPDATE_TODO=1 is set', async () => {
    project.write({
      src: {
        'with-errors-0.js': readFixture('with-errors-0.js'),
        'with-errors-1.js': readFixture('with-errors-1.js'),
      },
    });
    project.install();

    const result = await runEslintWithFormatter({
      env: { UPDATE_TODO: '1' },
    });

    expect(stripAnsi(result.stdout).trim()).toEqual('');
  });

  it('should emit todo items and count when UPDATE_TODO=1 and INCLUDE_TODO=1 are set', async () => {
    project.write({
      src: {
        'with-errors-0.js': readFixture('with-errors-0.js'),
        'with-errors-1.js': readFixture('with-errors-1.js'),
      },
    });
    project.install();

    const result = await runEslintWithFormatter({
      env: { UPDATE_TODO: '1', INCLUDE_TODO: '1' },
    });

    const stdout = stripAnsi(result.stdout);

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
        'with-errors-0.js': readFixture('with-errors-0.js'),
        'with-errors-1.js': readFixture('with-errors-1.js'),
      },
    });
    project.install();

    // run eslint to generate TODO dir but don't capture the result because this is not what we're testing
    await runEslintWithFormatter({
      env: { UPDATE_TODO: '1' },
    });

    // run with INCLUDE_TODO (this is what we're testing)
    const result = await runEslintWithFormatter({
      env: { INCLUDE_TODO: '1' },
    });

    const stdout = stripAnsi(result.stdout);

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
        'with-errors-0.js': readFixture('with-errors-0.js'),
      },
    });
    project.install();

    await runEslintWithFormatter({
      env: { UPDATE_TODO: '1' },
    });

    // now we add new errors and warnings to test output with all problems
    project.write({
      src: {
        'with-errors-and-warnings.js': readFixture(
          'with-errors-and-warnings.js'
        ),
      },
    });

    const result = await runEslintWithFormatter({
      env: { INCLUDE_TODO: '1' },
    });

    const stdout = stripAnsi(result.stdout);

    expect(stdout).toMatch(
      /1:10  todo  'addOne' is defined but never used\s+no-unused-vars/
    );
    expect(stdout).toMatch(
      /1:10  error    'sayHi' is defined but never used\s+no-unused-vars/
    );
    expect(stdout).toMatch(/2:3   warning  Unexpected alert\s+no-alert/);
    expect(stdout).toMatch(/✖ 3 problems \(2 errors, 1 warning, 7 todos\)/);
  });

  it('errors if a todo item is no longer valid when running without params', async function () {
    project.write({
      src: {
        'with-fixable-error.js': readFixture('with-fixable-error.js'),
      },
    });
    project.install();

    debugger;
    // generate todo based on existing error
    await runEslintWithFormatter({
      env: { UPDATE_TODO: '1' },
    });

    // mimic fixing the error manually via user interaction
    project.write({
      src: {
        'with-fixable-error.js': readFixture('no-errors.js'),
      },
    });

    // run normally and expect an error for not running --fix
    let result = await runEslintWithFormatter();
    let stdout = stripAnsi(result.stdout);

    expect(stdout).toMatchInlineSnapshot(`
      "
      src/with-fixable-error.js
         0:0  error  Todo violation passes \`no-unused-vars\` rule. Please run \`--fix\` to remove this todo from the todo list  invalid-todo-violation-rule

      ✖ 1 problem (1 error, 0 warnings)

      "
    `);

    // run fix, and expect that this will delete the outstanding todo item
    await runEslintWithFormatter(['--fix']);

    // run normally again and expect no error
    result = await runEslintWithFormatter();
    stdout = stripAnsi(result.stdout);

    const todoStorageDir = getTodoStorageDirPath(project.baseDir);
    const todos = readdirSync(
      posix.join(todoStorageDir, readdirSync(todoStorageDir)[0])
    );

    expect(result.exitCode).toEqual(0);
    expect(stdout).toEqual('');
    expect(todos).toHaveLength(0);
  });
});
