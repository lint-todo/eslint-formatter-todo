# @scalvert/eslint-formatter-todo

An ESLint formatter that can report errors as todos.

<img src="docs/post-todo.png" style="background-color: #fff" />

A todo is an existing linting error present in the project, but one that is transitioned into a todo state. This allows for incremental fixing of linting errors on very large projects, where the resolution or introduction of errors can cause undesired delays in engineer velocity.

When introducing new linting rules to your project it is possible that you may find many linting errors. If your CI is setup to prevent commits when lint errors happen, your team will have to fix all errors before you can add these new rules to your project leading to a delayed introduction of the rules.

This formatter allows you to introduce new rules immediately without blocking commits by taking a snapshot of errors and transforming them to todos. Errors not found in this snapshot will continue to reported as errors.

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
