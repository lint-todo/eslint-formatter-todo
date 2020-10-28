import { getBasePath } from '../../src/utils';

describe('utils', () => {
  const INITIAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...INITIAL_ENV };
  });

  afterAll(() => {
    process.env = INITIAL_ENV;
  });

  it('returns the path passed as ENV variable', () => {
    const eslintTodoDir = 'eslint-todo-dir';
    process.env.ESLINT_TODO_DIR = eslintTodoDir;
    expect(getBasePath()).toEqual(eslintTodoDir);
  });

  it('returns current working dir if no ENV variable was passed', () => {
    expect(getBasePath()).toEqual(process.cwd());
  });
});
