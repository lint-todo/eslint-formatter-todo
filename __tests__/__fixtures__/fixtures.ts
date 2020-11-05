import type { CLIEngine, ESLint } from 'eslint';
import { deepCopy } from '../__utils__/deep-copy';
import { updatePaths } from '../__utils__/update-paths';
import * as eslintWithErrorsWarningsTodos from './eslint-with-errors-warnings-todos.json';
import * as eslintWithErrors from './eslint-with-errors.json';
import * as eslintWithTodos from './eslint-with-todos.json';

const fixtures = {
  eslintWithErrors: <ESLint.LintResult[]>(
    (<CLIEngine.LintReport>(eslintWithErrors as unknown)).results
  ),
  eslintWithTodos: <ESLint.LintResult[]>(
    (<CLIEngine.LintReport>(eslintWithTodos as unknown)).results
  ),
  eslintWithErrorsWarningsTodos: <ESLint.LintResult[]>(
    (<CLIEngine.LintReport>(eslintWithErrorsWarningsTodos as unknown)).results
  ),
};

export default {
  eslintWithErrors(tmp: string): ESLint.LintResult[] {
    return updatePaths(tmp, deepCopy(fixtures.eslintWithErrors));
  },
  eslintWithTodos(tmp: string): ESLint.LintResult[] {
    return updatePaths(tmp, deepCopy(fixtures.eslintWithTodos));
  },
  eslintWithErrorsWarningsTodos(tmp: string): ESLint.LintResult[] {
    return updatePaths(tmp, deepCopy(fixtures.eslintWithErrorsWarningsTodos));
  },
};
