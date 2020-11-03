import type { Linter } from 'eslint';

declare module 'eslint' {
  export namespace ESLint {
    interface LintResult {
      todoCount: number;
      fixableTodoCount: number;
    }
  }
}

export type TodoResultMessage = Omit<Linter.LintMessage, 'severity'> & {
  severity: Linter.Severity | -1;
};

export interface TodoFormatterOptions {
  includeTodo: boolean;
}

export interface TodoFormatterCounts {
  readonly total: number;
  readonly errorCount: number;
  readonly warningCount: number;
  readonly todoCount: number;
  readonly fixableErrorCount: number;
  readonly fixableWarningCount: number;
  readonly fixableTodoCount: number;
}
