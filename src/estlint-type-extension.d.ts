import 'eslint';

declare module 'eslint' {
  namespace ESLint {
    interface LintResult {
      todoCount: number;
    }
  }
  namespace Linter {
    type Severity = -1 | 0 | 1 | 2;
  }
}
