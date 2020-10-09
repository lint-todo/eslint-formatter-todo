import { generateTodoFiles, getTodoDirPath, readTodoFiles } from '@ember-template-lint/todo-utils'; // eslint-disable-line node/no-unpublished-import
import { TodoData } from '@ember-template-lint/todo-utils/lib/types';
import { ESLint } from 'eslint';
import fs from 'fs';
import { mutateTodoErrorsToWarnings } from './mutate-errors-to-warnings';

function formatResults(results: ESLint.LintResult[]): void {
  // note: using async/await directly causes eslint to print `Promise { <pending> }`
  formatResultsAsync(results);
}

async function formatResultsAsync(results: ESLint.LintResult[]): Promise<void> {
  const UPDATE_TODO: string = process.env.UPDATE_TODO || '0';
  const basePath = process.env.ESLINT_TODO_DIR || process.cwd();

  // handle report when TODO list needs to be updated
  if (UPDATE_TODO == '1') {
    await generateTodoFiles(basePath, results);
    await report(results);
    return;
  }

  // handle report when todo dir exists
  const todoDir = getTodoDirPath(basePath);
  if (fs.existsSync(todoDir)) {
    const todoMap = await readTodoFiles(todoDir);
    await report(results, todoMap);
    return;
  }

  // handle normal report
  await report(results);
}

async function report(results: ESLint.LintResult[], todoMap?: Map<string, TodoData>) {
  mutateTodoErrorsToWarnings(results, todoMap);

  const eslint = new ESLint({});

  const defaultFormatter = await eslint.loadFormatter('stylish');

  console.log(defaultFormatter.format(results));
}

export { formatResults, formatResultsAsync };
