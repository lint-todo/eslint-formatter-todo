# eslint-formatter-todo

A ESLint formatter that only reports errors when they are not present in a list of "TODOS", while allowing authors to update the list of "TODOS" from a list of errors automatically.

A "TODO" is an existing linting error present in the project, but one that is transitioned into a todo state. This allows for incremental fixing of linting errors on very large projects, where the resolution or introduction of errors can cause undesired delays in engineer velocity.

The "TODO" functionality allows for the incremental resolution of errors, which allows project maintainers to determine how aggressive they want to address these types of quality issues.

When introducing new linting rules to your project it is possible that you may find many linting errors. If your CI is setup to prevent commits when lint errors happen, your team will have to fix all errors before you can add these new rules to your project leading to a delayed introduction of the rules.

This formatter allows you to introduce new rules immediately without blocking commits by taking a snapshot of errors and transforming them to warnings. Errors not found in this snapshot will continue to reported as errors.

## Usage

When you introduce new linting rules, execute ESLint by setting `UPDATE_TODO=1` and passing this formatter:

```bash
$ UPDATE_TODO=1 eslint --format eslint-formatter-todo
```

This command will transform all reported ERRORS to WARNINGS and will generate files inside the `.lint-todo` directory to track them.

After that, just execute ESLint normally while also passing this formatter:

```bash
$ eslint --format eslint-formatter-todo
```
