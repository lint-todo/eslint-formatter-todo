import { ReadTodoOptions } from '@lint-todo/utils';

export function buildReadOptions(): ReadTodoOptions {
  return { engine: 'eslint', filePath: '' };
}
