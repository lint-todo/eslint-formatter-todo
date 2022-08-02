import {
  applyTodoChanges,
  buildTodoDatum,
  compactTodoStorageFile,
  generateTodoBatches,
  getSeverity,
  getTodoConfig,
  Severity,
  TodoConfig,
  TodoData,
  todoStorageFileExists,
  Range,
  validateConfig,
  WriteTodoOptions,
  writeTodos,
} from '@lint-todo/utils';
import { relative, join } from 'path';
import hasFlag from 'has-flag';
import ci from 'ci-info';
import { printResults } from './print-results';
import { getBaseDir } from './get-base-dir';

import type { ESLint, Linter } from 'eslint';
import type { TodoFormatterOptions } from './types';

const LINES_PATTERN = /(.*?(?:\r\n?|\n|$))/gm;

export async function formatter(results: ESLint.LintResult[]): Promise<string> {
  const baseDir = getBaseDir();
  const todoConfigResult = validateConfig(baseDir);

  if (!todoConfigResult.isValid) {
    throw new Error(todoConfigResult.message);
  }

  if (process.env.COMPACT_TODO) {
    const { compacted } = compactTodoStorageFile(baseDir);

    return `Removed ${compacted} todos in .lint-todo storage file`;
  }

  const todoInfo = {
    added: 0,
    removed: 0,
    todoConfig: getTodoConfig(process.cwd(), 'eslint') ?? {},
  };

  const formatTodoAs = process.env.FORMAT_TODO_AS;
  const updateTodo = process.env.UPDATE_TODO === '1';
  const includeTodo = process.env.INCLUDE_TODO === '1';
  const cleanTodo = !process.env.NO_CLEAN_TODO && !ci.isCI;
  const shouldFix = hasFlag('fix');
  const shouldCleanTodos = shouldFix || cleanTodo;

  if (
    (process.env.TODO_DAYS_TO_WARN || process.env.TODO_DAYS_TO_ERROR) &&
    !updateTodo
  ) {
    throw new Error(
      'Using `TODO_DAYS_TO_WARN` or `TODO_DAYS_TO_ERROR` is only valid when the `UPDATE_TODO` environment variable is being used.'
    );
  }

  for (const fileResults of results) {
    const maybeTodos = buildMaybeTodos(
      baseDir,
      [fileResults],
      todoInfo.todoConfig
    );

    const optionsForFile: WriteTodoOptions = {
      engine: 'eslint',
      shouldRemove: (todoDatum: TodoData) => todoDatum.engine === 'eslint',
      todoConfig: todoInfo.todoConfig,
      filePath: relative(baseDir, fileResults.filePath),
    };

    if (updateTodo) {
      const { addedCount, removedCount } = writeTodos(
        baseDir,
        maybeTodos,
        optionsForFile
      );

      todoInfo.added += addedCount;
      todoInfo.removed += removedCount;
    }

    processResults(results, maybeTodos, {
      formatTodoAs,
      updateTodo,
      includeTodo,
      shouldCleanTodos,
      todoInfo,
      writeTodoOptions: optionsForFile,
    });
  }

  return await printResults(results, {
    formatTodoAs,
    updateTodo,
    includeTodo,
    shouldCleanTodos,
    todoInfo,
  });
}

function processResults(
  results: ESLint.LintResult[],
  maybeTodos: Set<TodoData>,
  options: TodoFormatterOptions
) {
  const baseDir = getBaseDir();

  if (todoStorageFileExists(baseDir)) {
    const { remove, stable, expired } = generateTodoBatches(
      baseDir,
      maybeTodos,
      options.writeTodoOptions
    );

    if (remove.size > 0 || expired.size > 0) {
      if (options.shouldCleanTodos) {
        applyTodoChanges(baseDir, new Set(), new Set([...remove, ...expired]));
      } else {
        for (const todo of remove) {
          pushResult(results, todo);
        }
      }
    }

    updateResults(results, stable);
  }
}

/**
 * Mutates all errors present in the todo dir to todos in the results array.
 *
 * @param results ESLint results array
 */
export function updateResults(
  results: ESLint.LintResult[],
  existingTodos: Set<TodoData>
): void {
  for (const todo of existingTodos) {
    const severity: Severity = getSeverity(todo);

    if (severity === Severity.error) {
      continue;
    }

    const result = findResult(results, todo);

    if (!result) {
      continue;
    }

    const message = result.messages.find(
      (message) => message === todo.originalLintResult
    );

    if (!message) {
      continue;
    }

    if (severity === Severity.warn) {
      result.warningCount = result.warningCount + 1;

      if (message.fix) {
        result.fixableWarningCount = result.fixableWarningCount + 1;
        result.fixableErrorCount -= 1;
      }
    } else {
      result.todoCount = Number.isInteger(result.todoCount)
        ? result.todoCount + 1
        : 1;

      if (message.fix) {
        result.fixableTodoCount = Number.isInteger(result.fixableTodoCount)
          ? result.fixableTodoCount + 1
          : 1;
        result.fixableErrorCount -= 1;
      }
    }

    message.severity = <Linter.Severity>severity;

    result.errorCount -= 1;
  }
}

export function buildMaybeTodos(
  baseDir: string,
  lintResults: ESLint.LintResult[],
  todoConfig?: TodoConfig,
  engine?: string
): Set<TodoData> {
  const results = lintResults.filter((result) => result.messages.length > 0);

  const todoData = results.reduce((converted, lintResult) => {
    lintResult.messages.forEach((message: Linter.LintMessage) => {
      if (message.severity !== Severity.error) {
        return;
      }

      const range = {
        start: {
          line: message.line,
          column: message.column,
        },
        end: {
          line: message.endLine ?? message.line,
          column: message.endColumn ?? message.column,
        },
      };
      const todoDatum = buildTodoDatum(
        baseDir,
        {
          engine: engine ?? 'eslint',
          filePath: lintResult.filePath,
          ruleId: message.ruleId || '',
          range,
          source: lintResult.source
            ? getSourceForRange(
                lintResult.source.match(LINES_PATTERN) || [],
                range
              )
            : '',
          originalLintResult: message,
        },
        todoConfig
      );

      converted.add(todoDatum);
    });

    return converted;
  }, new Set<TodoData>());

  return todoData;
}

function getSourceForRange(source: string[], range: Range) {
  const firstLine = range.start.line - 1;
  const lastLine = range.end.line - 1;
  let currentLine = firstLine - 1;
  const firstColumn = range.start.column - 1;
  const lastColumn = range.end.column - 1;
  const src = [];
  let line;

  while (currentLine < lastLine) {
    currentLine++;
    line = source[currentLine];

    if (currentLine === firstLine) {
      if (firstLine === lastLine) {
        src.push(line.slice(firstColumn, lastColumn));
      } else {
        src.push(line.slice(firstColumn));
      }
    } else if (currentLine === lastLine) {
      src.push(line.slice(0, lastColumn));
    } else {
      src.push(line);
    }
  }

  return src.join('');
}

function pushResult(results: ESLint.LintResult[], todo: TodoData) {
  const resultForFile = findResult(results, todo);

  const result: Linter.LintMessage = {
    ruleId: 'invalid-todo-violation-rule',
    message: `Todo violation passes \`${todo.ruleId}\` rule. Please run with \`CLEAN_TODO=1\` env var to remove this todo from the todo list.`,
    severity: 2,
    column: 0,
    line: 0,
  };

  if (resultForFile) {
    resultForFile.messages.push(result);
    resultForFile.errorCount += 1;
  } else {
    results.push({
      filePath: join(getBaseDir(), todo.filePath),
      messages: [result],
      errorCount: 1,
      warningCount: 0,
      todoCount: 0,
      fatalErrorCount: 0,
      fixableErrorCount: 0,
      fixableWarningCount: 0,
      fixableTodoCount: 0,
      usedDeprecatedRules: [],
    });
  }
}

function findResult(results: ESLint.LintResult[], todo: TodoData) {
  return results.find(
    (result) => relative(getBaseDir(), result.filePath) === todo.filePath
  );
}
