import 'eslint';

declare module 'eslint' {
  export namespace ESLint {
    interface LintResult {
      todoCount: number;
    }
  }
}

type TodoResultMessage = Omit<Linter.LintMessage, 'severity'> & {
  severity: Linter.Severity | -1;
};
