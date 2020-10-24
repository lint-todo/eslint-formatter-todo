import type { CLIEngine, ESLint } from 'eslint';
import { deepCopy } from '../__utils__/deep-copy';
import { updatePaths } from '../__utils__/update-paths';
import * as eslintWithErrors from './eslint-with-errors.json';
import * as eslintWithTodos from './eslint-with-todos.json';

const fixtures = {
  eslintWithErrors: <ESLint.LintResult[]>(
    (<CLIEngine.LintReport>(eslintWithErrors as unknown)).results
  ),
  eslintWithTodos: <ESLint.LintResult[]>(
    (<CLIEngine.LintReport>(eslintWithTodos as unknown)).results
  ),
};

export default {
  eslintWithErrors(tmp?: string): ESLint.LintResult[] {
    const eslintWithErrors = deepCopy(fixtures.eslintWithErrors);
    return tmp ? updatePaths(tmp, eslintWithErrors) : eslintWithErrors;
  },
  eslintWithTodos(tmp?: string): ESLint.LintResult[] {
    const eslintWithTodos = deepCopy(fixtures.eslintWithTodos);
    return tmp ? updatePaths(tmp, eslintWithTodos) : eslintWithTodos;
  },
};
