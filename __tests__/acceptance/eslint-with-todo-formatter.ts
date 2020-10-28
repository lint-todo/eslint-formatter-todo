import execa from 'execa';
import stripAnsi from 'strip-ansi';
import { FakeProject } from '../__utils__/fake-project';
import { readFile as readFixture } from '../__utils__/read-file-cached';

describe('eslint with todo formatter', function () {
  let project: FakeProject;

  function runEslintWithFormatter(args: string[], options: execa.Options = {}) {
    const defaultOptions = Object.assign(options);
    defaultOptions.reject = false;
    defaultOptions.cwd = options.cwd || project.baseDir;

    return execa(
      './node_modules/.bin/eslint',
      ['src', '--format', require.resolve('../..')],
      defaultOptions
    );
  }

  beforeEach(() => {
    project = FakeProject.getInstance();
  });

  afterEach(async () => {
    // await project.dispose();
  });

  it('should not emit anything when there are no errors or warnings', async () => {
    project.files = {
      ...project.files,
      src: {
        'no-problems.js': readFixture('with-no-problems.js'),
      },
    };

    project.writeSync();
    project.install();

    const result = await runEslintWithFormatter([]);

    expect(result.stdout).toEqual('');
  });

  it('should only emit todo count when UPDATE_TODO has been set', async () => {
    project.files = {
      ...project.files,
      src: {
        'with-errors-0.js': readFixture('with-errors-0.js'),
        'with-errors-1.js': readFixture('with-errors-1.js'),
      },
    };

    project.writeSync();
    project.install();

    const result = await runEslintWithFormatter([], {
      env: { UPDATE_TODO: '1' },
    });

    expect(stripAnsi(result.stdout).trim()).toEqual(
      '✖ 17 problems (0 errors, 0 warnings, 17 todos)'
    );
  });

  it('should emit todo items and count when INCLUDE_TODO is 1', async () => {
    project.files = {
      ...project.files,
      src: {
        'with-errors-0.js': readFixture('with-errors-0.js'),
        'with-errors-1.js': readFixture('with-errors-1.js'),
      },
    };

    project.writeSync();
    project.install();

    // run eslint to generate TODO dir but don't capture the result because this is not what we're testing
    await runEslintWithFormatter([], {
      env: { UPDATE_TODO: '1' },
    });

    // run with INCLUDE_TODO (this is what we're testing)
    const result = await runEslintWithFormatter([], {
      env: { INCLUDE_TODO: '1' },
    });

    const stdout = stripAnsi(result.stdout);

    expect(stdout).toMatch(
      /1:10  todo  'addOne' is defined but never used\s+no-unused-vars/
    );
    expect(stdout).toMatch(
      /1:10  todo  'fibonacci' is defined but never used\s+no-unused-vars/
    );
    expect(stdout).toMatch(/✖ 17 problems \(0 errors, 0 warnings, 17 todos\)/);
  });

  it('should emit errors and warnings as normal', async () => {
    project.files = {
      ...project.files,
      src: {
        'with-errors-0.js': readFixture('with-errors-0.js'),
        'with-errors-and-warnings.js': readFixture(
          'with-errors-and-warnings.js'
        ),
      },
    };

    project.writeSync();
    project.install();

    const result = await runEslintWithFormatter([]);
    const stdout = stripAnsi(result.stdout);

    expect(stdout).toMatch(
      /1:10  error  'addOne' is defined but never used\s+no-unused-vars/
    );
    expect(stdout).toMatch(
      /2:3 {3}warning {2}Unexpected alert {19}no-alert/
    );
    expect(stdout).toMatch(/✖ 10 problems \(9 errors, 1 warning, 0 todos\)/);
  });

  it('should emit errors, warnings, and todos', async () => {
    // first we generate project files with errors and convert them to todos
    project.files = {
      ...project.files,
      src: {
        'with-errors-0.js': readFixture('with-errors-0.js'),
      },
    };

    project.writeSync();
    project.install();

    await runEslintWithFormatter([], {
      env: { UPDATE_TODO: '1' },
    });

    // now we add new errors and warnings to test output with all problems
    project.files = {
      ...project.files,
      src: {
        'with-errors-and-warnings.js': readFixture(
          'with-errors-and-warnings.js'
        ),
      },
    };

    project.writeSync();
    project.install();

    const result = await runEslintWithFormatter([], {
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
    expect(stdout).toMatch(/✖ 10 problems \(2 errors, 1 warning, 7 todos\)/);
  });
});
