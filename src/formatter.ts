import { dim, magenta, red, reset, underline, yellow } from 'chalk';
import { ESLint } from 'eslint';
import stripAnsi from 'strip-ansi';
import table from 'text-table';

function pluralize(word: string, count: number): string {
  return count === 1 ? word : `${word}s`;
}

export function formatter(
  results: ESLint.LintResult[],
  shouldIncludeTodo?: boolean
) {
  let output = '\n',
    errorCount = 0,
    warningCount = 0,
    todoCount = 0,
    fixableErrorCount = 0,
    fixableWarningCount = 0,
    chalkColorFunction = yellow,
    hasAnyErrors = false;

  results.forEach((result) => {
    const messages = result.messages;

    if (messages.length === 0) {
      return;
    }

    errorCount += result.errorCount;
    warningCount += result.warningCount;
    todoCount += result.todoCount | 0;
    fixableErrorCount += result.fixableErrorCount;
    fixableWarningCount += result.fixableWarningCount;

    const areAllMessagesTodo = messages.every(
      (message) => (message.severity as number) === -1
    );

    if (shouldIncludeTodo || !areAllMessagesTodo) {
      output += `${underline(result.filePath)}\n`;
    }

    let messageRows: Array<Array<{}>> = [];
    messages.forEach((message) => {
      let messageType;

      if (message.fatal || message.severity === 2) {
        messageType = red('error');
        hasAnyErrors = true;
      } else if ((message.severity as number) === -1) {
        messageType = magenta('todo');
      } else {
        messageType = yellow('warning');
      }

      if ((message.severity as number) === -1 && !shouldIncludeTodo) {
        return;
      }

      messageRows.push([
        '',
        message.line || 0,
        message.column || 0,
        messageType,
        message.message.replace(/([^ ])\.$/u, '$1'),
        dim(message.ruleId || ''),
      ]);
    });

    if (messageRows.length > 0) {
      const messageTable = table(messageRows, {
        align: ['.', 'r', 'l'],
        stringLength(str) {
          return stripAnsi(str).length;
        },
      })
        .split('\n')
        .map((el) =>
          el.replace(/(\d+)\s+(\d+)/u, (m, p1, p2) => dim(`${p1}:${p2}`))
        )
        .join('\n');

      output += `${messageTable}\n\n`;
    }
  });

  const total = errorCount + warningCount + todoCount;

  if (total > 0) {
    chalkColorFunction = hasAnyErrors ? red : chalkColorFunction;

    output += chalkColorFunction.bold(
      [
        '\u2716 ',
        total,
        pluralize(' problem', total),
        ' (',
        errorCount,
        pluralize(' error', errorCount),
        ', ',
        warningCount,
        pluralize(' warning', warningCount),
        ', ',
        todoCount,
        pluralize(' todo', todoCount),
        ')\n',
      ].join('')
    );

    if (fixableErrorCount > 0 || fixableWarningCount > 0) {
      output += chalkColorFunction.bold(
        [
          '  ',
          fixableErrorCount,
          pluralize(' error', fixableErrorCount),
          ' and ',
          fixableWarningCount,
          pluralize(' warning', fixableWarningCount),
          ' potentially fixable with the `--fix` option.\n',
        ].join('')
      );
    }

    output += '\n';
  }

  // Resets output color to prevent change on top level
  return total > 0 ? reset(output) : '';
}
