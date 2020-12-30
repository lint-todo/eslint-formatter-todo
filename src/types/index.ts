import type { DaysToDecay } from '@ember-template-lint/todo-utils';
import type { Linter } from 'eslint';
import type { PackageJson } from 'type-fest';

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

export enum Severity {
  todo = -1,
  off = 0,
  warn = 1,
  error = 2,
}

export type LintTodoPackageJson = PackageJson & {
  lintTodo?: { daysToDecay: DaysToDecay };
};
