import 'eslint';

declare module 'eslint' {
  export namespace ESLint {
    interface LintResult {
      todoCount: number;
    }
  }
}
