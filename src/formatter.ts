import { blueBright, dim, red, reset, underline, yellow } from 'chalk';
import stripAnsi from 'strip-ansi';
import table from 'text-table';
import type { ESLint } from 'eslint';
import type {
  TodoFormatterCounts,
  TodoFormatterOptions,
  TodoResultMessage,
} from './types';

export function formatter(
  results: ESLint.LintResult[],
  { includeTodo }: TodoFormatterOptions = {
    includeTodo: false,
  }
): string {
  const counts = tallyResults(results);

  let output = '\n';

  output += formatResults(results, counts, { includeTodo });

  output += formatSummary(counts, { includeTodo });

  // Resets output color to prevent change on top level
  return counts.total > 0 || (includeTodo && counts.todoCount > 0)
    ? reset(output)
    : '';
}

function formatResults(
  results: ESLint.LintResult[],
  counts: TodoFormatterCounts,
  options: TodoFormatterOptions
): string {
  let output = '';

  results.forEach((result) => {
    const messages = result.messages as TodoResultMessage[];

    if (messages.length === 0) {
      return;
    }

    const areAllMessagesTodo =
      counts.errorCount === 0 &&
      counts.warningCount === 0 &&
      counts.todoCount > 0;

    if (options.includeTodo || !areAllMessagesTodo) {
      output += `${underline(result.filePath)}\n`;
    }

    output += `${formatMessages(messages, options)}\n\n`;
  });

  return output;
}

function formatMessages(
  messages: TodoResultMessage[],
  options: TodoFormatterOptions
): string {
  const messageRows = messages
    .filter((message) => message.severity !== -1 || options.includeTodo)
    .map((message) => {
      let messageType;

      if (message.fatal || message.severity === 2) {
        messageType = red('error');
      } else if (message.severity === -1) {
        messageType = blueBright('todo');
      } else {
        messageType = yellow('warning');
      }

      return [
        '',
        message.line || 0,
        message.column || 0,
        messageType,
        message.message.replace(/([^ ])\.$/u, '$1'),
        dim(message.ruleId || ''),
      ];
    });

  const messageTableOptions: table.Options = {
    align: ['.', 'r', 'l'],
    stringLength(str) {
      return stripAnsi(str).length;
    },
  };

  return messageRows.length > 0
    ? table(messageRows, messageTableOptions)
        .split('\n')
        .map((el) =>
          el.replace(/(\d+)\s+(\d+)/u, (m, p1, p2) => dim(`${p1}:${p2}`))
        )
        .join('\n')
    : '';
}

function formatSummary(
  counts: TodoFormatterCounts,
  options: TodoFormatterOptions
) {
  let output = '';

  const { includeTodo } = options;

  const {
    total,
    errorCount,
    warningCount,
    todoCount,
    fixableErrorCount,
    fixableWarningCount,
    fixableTodoCount,
  } = counts;

  if (total > 0 || (includeTodo && todoCount > 0)) {
    const chalkColorFunction = errorCount > 0 ? red : yellow;

    let summary = [
      '\u2716 ',
      total,
      pluralize(' problem', total),
      ' (',
      errorCount,
      pluralize(' error', errorCount),
      ', ',
      warningCount,
      pluralize(' warning', warningCount),
    ];

    if (includeTodo) {
      summary = [...summary, ', ', todoCount, pluralize(' todo', todoCount)];
    }

    summary = [...summary, ')\n'];

    output += chalkColorFunction.bold(summary.join(''));

    if (
      fixableErrorCount > 0 ||
      fixableWarningCount > 0 ||
      (includeTodo && fixableTodoCount > 0)
    ) {
      let fixableMessage = includeTodo
        ? [
            '  ',
            fixableErrorCount,
            pluralize(' error', fixableErrorCount),
            ',',
            pluralize(' warning', fixableWarningCount),
            ', and',
            pluralize('todo', fixableTodoCount),
          ]
        : [
            '  ',
            fixableErrorCount,
            pluralize(' error', fixableErrorCount),
            ' and',
            pluralize(' warning', fixableWarningCount),
          ];

      fixableMessage = [
        ...fixableMessage,
        ' potentially fixable with the `--fix` option.\n',
      ];

      output += chalkColorFunction.bold(fixableMessage.join(''));
    }

    output += '\n';
  }

  return output;
}

function tallyResults(results: ESLint.LintResult[]): TodoFormatterCounts {
  const counts = {
    total: 0,
    errorCount: 0,
    warningCount: 0,
    todoCount: 0,
    fixableErrorCount: 0,
    fixableWarningCount: 0,
    fixableTodoCount: 0,
  };

  results.forEach((result) => {
    counts.errorCount += result.errorCount;
    counts.warningCount += result.warningCount;
    counts.todoCount += result.todoCount || 0;
    counts.fixableErrorCount += result.fixableErrorCount;
    counts.fixableWarningCount += result.fixableWarningCount;
    counts.fixableTodoCount += result.fixableTodoCount || 0;
  });

  counts.total = counts.errorCount + counts.warningCount;

  return counts;
}

function pluralize(word: string, count: number): string {
  return count === 1 ? word : `${word}s`;
}
