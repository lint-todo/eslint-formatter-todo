import { getPackageJson } from './get-package-json';
import type { DaysToDecay } from '@ember-template-lint/todo-utils';

export function getDaysToDecay(
  pkg = getPackageJson()
): DaysToDecay | undefined {
  const todoDaysToWarn = getEnvVar('TODO_DAYS_TO_WARN');
  const todoDaysToError = getEnvVar('TODO_DAYS_TO_ERROR');
  let daysToDecay: DaysToDecay = {};

  if (todoDaysToWarn) {
    daysToDecay.warn = todoDaysToWarn;
  }

  if (todoDaysToError) {
    daysToDecay.error = todoDaysToError;
  }

  if (Object.keys(daysToDecay).length > 0) {
    return daysToDecay;
  }

  if (typeof pkg.lintTodo === 'undefined') {
    return;
  }

  daysToDecay = pkg.lintTodo.daysToDecay;

  if (
    typeof daysToDecay.warn === 'number' &&
    typeof daysToDecay.error === 'number' &&
    daysToDecay.warn > daysToDecay.error
  ) {
    throw new Error(
      'The `lintTodo` configuration in the package.json contains invalid values. The `warn` value must be less than the `error` value.'
    );
  }

  return daysToDecay;
}

function getEnvVar(name: string) {
  if (typeof process.env[name] !== 'undefined' && process.env[name] !== '') {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return Number.parseInt(process.env[name]!, 10);
  }
}
