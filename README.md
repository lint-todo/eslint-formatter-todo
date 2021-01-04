# @scalvert/eslint-formatter-todo

![CI Build](https://github.com/scalvert/eslint-formatter-todo/workflows/CI%20Build/badge.svg)
[![npm version](https://badge.fury.io/js/%40scalvert%2Feslint-formatter-todo.svg)](https://badge.fury.io/js/%40scalvert%2Feslint-formatter-todo)
[![License](https://img.shields.io/npm/l/@scalvert/eslint-formatter-todo.svg)](https://github.com/@scalvert/eslint-formatter-todo/blob/master/package.json)
![Dependabot](https://badgen.net/badge/icon/dependabot?icon=dependabot&label)
![Volta Managed](https://img.shields.io/static/v1?label=volta&message=managed&color=yellow&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QAeQC6AMEpK7AhAAAACXBIWXMAAAsSAAALEgHS3X78AAAAB3RJTUUH5AMGFS07qAYEaAAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAFmSURBVDjLY2CgB/g/j0H5/2wGW2xyTAQ1r2DQYOBgm8nwh+EY6TYvZtD7f9rn5e81fAGka17GYPL/esObP+dyj5Cs+edqZsv/V8o//H+z7P+XHarW+NSyoAv8WsFszyKTtoVBM5Tn7/Xys+zf7v76vYrJlPEvAwPjH0YGxp//3jGl/L8LU8+IrPnPUkY3ZomoDQwOpZwMv14zMHy8yMDwh4mB4Q8jA8OTgwz/L299wMDyx4Mp9f9NDAP+bWVwY3jGsJpB3JaDQVCEgYHlLwPDfwYWRqVQJgZmHoZ/+3PPfWP+68Mb/Pw5sqUoLni9ipuRnekrAwMjA8Ofb6K8/PKBF5nU7RX+Hize8Y2DOZTP7+kXogPy1zrH+f/vT/j/Z5nUvGcr5VhJioUf88UC/59L+/97gUgDyVH4YzqXxL8dOs/+zuFLJivd/53HseLPPHZPsjT/nsHi93cqozHZue7rLDYhUvUAADjCgneouzo/AAAAAElFTkSuQmCC&link=https://volta.sh)
![TypeScript](https://badgen.net/badge/icon/typescript?icon=typescript&label)
[![Code Style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](#badge)

An ESLint formatter that can report errors as TODOs, which can be deferred and fixed at a later time.

<img src="docs/post-todo.png" style="background-color: #fff" />

A TODO is an existing linting error present in the project, but one that is transitioned into a new severity level: TODO. This allows for incremental fixing of linting errors in very large projects, where the resolution or introduction of errors can cause undesired degradation in engineer velocity.

When introducing new linting rules to your project, it is possible that you may find many linting errors. If your CI is set up to prevent commits when lint errors are encountered, your team will have to fix all errors before you can add these new rules to your project, leading to a delayed introduction of the rules.

This formatter allows you to introduce new rules immediately, without blocking commits, by taking a snapshot of errors and transforming them to TODOs. Errors not found in this snapshot will continue to reported as errors.

## Usage

When you introduce new linting rules, execute ESLint by setting `UPDATE_TODO=1` and passing the formatter.

```bash
$ UPDATE_TODO=1 eslint --format @scalvert/eslint-formatter-todo
```

This command will transform all reported `error`s to `todo`s and will generate files inside the `.lint-todo` directory to track them.

Executing ESLint without `UPDATE_TODO=1` will run `eslint` normally but will transform errors that are present in the `.lint-todo` directory to `todo` items, not displaying them as errors.

```bash
$ eslint --format @scalvert/eslint-formatter-todo

# no output, no errors
```

To have `todo`s to appear in results, set `INCLUDE_TODO=1`.

```bash
$ INCLUDE_TODO=1 eslint --format @scalvert/eslint-formatter-todo

/path/to/file/fullOfProblems.js
   2:7   todo  Use the isNaN function to compare with NaN  use-isnan
   2:9   todo  Expected '!==' and instead saw '!='         eqeqeq
   3:12  todo  Unary operator '++' used                    no-plusplus

✖ 0 problems (0 errors, 0 warnings, 3 todos)
```
