




## v4.0.0 (2022-08-04)

:information_source: This major version supports eslint v8.4.0 and up (it leverages async formatters)

#### :boom: Breaking Change
* [#343](https://github.com/lint-todo/eslint-formatter-todo/pull/343) Enable ESLint built-in formatters with FORMAT_TODO_AS ([@tomcharles](https://github.com/tomcharles))

#### Committers: 1
- Tom Charles ([@tomcharles](https://github.com/tomcharles))


## v3.0.0 (2022-08-01)

#### :boom: Breaking Change
* [#333](https://github.com/lint-todo/eslint-formatter-todo/pull/333) Convert to @scalvert/bin-tester ([@scalvert](https://github.com/scalvert))

#### :rocket: Enhancement
* [#332](https://github.com/lint-todo/eslint-formatter-todo/pull/332) Enable piping output through additional formatter for CI ([@tomcharles](https://github.com/tomcharles))
* [#290](https://github.com/lint-todo/eslint-formatter-todo/pull/290) Adds COMPACT_TODO functionality to compact todo storage file. ([@scalvert](https://github.com/scalvert))

#### :bug: Bug Fix
* [#289](https://github.com/lint-todo/eslint-formatter-todo/pull/289) Updates @lint-todo/utils to latest version for read isolation ([@scalvert](https://github.com/scalvert))

#### :house: Internal
* [#333](https://github.com/lint-todo/eslint-formatter-todo/pull/333) Convert to @scalvert/bin-tester ([@scalvert](https://github.com/scalvert))
* [#334](https://github.com/lint-todo/eslint-formatter-todo/pull/334) Convert to npm vs yarn ([@scalvert](https://github.com/scalvert))
* [#286](https://github.com/lint-todo/eslint-formatter-todo/pull/286) Rename repository to new scope ([@scalvert](https://github.com/scalvert))

#### Committers: 2
- Steve Calvert ([@scalvert](https://github.com/scalvert))
- Tom Charles ([@tomcharles](https://github.com/tomcharles))


## v2.0.0 (2021-12-06)

#### :house: Internal
* [#286](https://github.com/lint-todo/eslint-formatter-todo/pull/286) Rename repository to new scope ([@scalvert](https://github.com/scalvert))

#### Committers: 1
- Steve Calvert ([@scalvert](https://github.com/scalvert))


## v2.0.0 (2021-12-03)

#### :boom: Breaking Change
* [#274](https://github.com/scalvert/eslint-formatter-todo/pull/274) Convert to single file storage ([@scalvert](https://github.com/scalvert))
* [#273](https://github.com/scalvert/eslint-formatter-todo/pull/273) Enable auto-fix of todos ([@scalvert](https://github.com/scalvert))

#### :house: Internal
* [#275](https://github.com/scalvert/eslint-formatter-todo/pull/275) Updating to use @lint-todo/utils package ([@scalvert](https://github.com/scalvert))

#### Committers: 1
- Steve Calvert ([@scalvert](https://github.com/scalvert))


## v1.5.0 (2021-09-14)

#### :rocket: Enhancement
* [#250](https://github.com/scalvert/eslint-formatter-todo/pull/250) Adds CLEAN_TODO env var to match ember-template-lint implementation ([@scalvert](https://github.com/scalvert))

#### Committers: 1
- Steve Calvert ([@scalvert](https://github.com/scalvert))


## v1.4.0 (2021-08-15)

#### :rocket: Enhancement
* [#213](https://github.com/scalvert/eslint-formatter-todo/pull/213) Upgrades to latest version of @ember-template-lint/todo-utils with fuzzy matching ([@scalvert](https://github.com/scalvert))

#### :memo: Documentation
* [#237](https://github.com/scalvert/eslint-formatter-todo/pull/237) Updates the README to clarify usage for configuration ([@scalvert](https://github.com/scalvert))
* [#206](https://github.com/scalvert/eslint-formatter-todo/pull/206) docs(README): `error > warn` ([@buschtoens](https://github.com/buschtoens))

#### Committers: 3
- Jan Buschtöns ([@buschtoens](https://github.com/buschtoens))
- Steve Calvert ([@scalvert](https://github.com/scalvert))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)


## v1.3.1 (2021-02-05)

#### :bug: Bug Fix
* [#86](https://github.com/scalvert/eslint-formatter-todo/pull/86) Fixes issue where todos were deleted from a different engine ([@scalvert](https://github.com/scalvert))

#### :house: Internal
* [#84](https://github.com/scalvert/eslint-formatter-todo/pull/84) Updates @ember-template-lint/todo-utils to latest beta ([@scalvert](https://github.com/scalvert))
* [#76](https://github.com/scalvert/eslint-formatter-todo/pull/76) Adds windows to the testing matrix for CI ([@scalvert](https://github.com/scalvert))

#### Committers: 2
- Steve Calvert ([@scalvert](https://github.com/scalvert))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)


## v1.3.0 (2021-01-15)

#### :rocket: Enhancement
* [#67](https://github.com/scalvert/eslint-formatter-todo/pull/67) Adds output feedback when creating TODOs ([@scalvert](https://github.com/scalvert))

#### Committers: 2
- Steve Calvert ([@scalvert](https://github.com/scalvert))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)


## v1.2.0 (2021-01-08)

#### :rocket: Enhancement
* [#55](https://github.com/scalvert/eslint-formatter-todo/pull/55) Adding ability to set days to decay to warn/error ([@scalvert](https://github.com/scalvert))

#### :house: Internal
* [#62](https://github.com/scalvert/eslint-formatter-todo/pull/62) Converting date validation to use todo-utils internal version. ([@scalvert](https://github.com/scalvert))

#### Committers: 2
- Steve Calvert ([@scalvert](https://github.com/scalvert))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)


## v1.1.0 (2020-12-23)

#### :rocket: Enhancement
* [#40](https://github.com/scalvert/eslint-formatter-todo/pull/40) Enable removal of outstanding todos with --fix ([@scalvert](https://github.com/scalvert))

#### :bug: Bug Fix
* [#49](https://github.com/scalvert/eslint-formatter-todo/pull/49) Converts to sync APIs ([@scalvert](https://github.com/scalvert))

#### :house: Internal
* [#44](https://github.com/scalvert/eslint-formatter-todo/pull/44) Renaming/consolidating files for clarity ([@scalvert](https://github.com/scalvert))

#### Committers: 2
- Steve Calvert ([@scalvert](https://github.com/scalvert))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)


## v1.0.0 (2020-12-01)

#### :boom: Breaking Change
* [#10](https://github.com/scalvert/eslint-formatter-todo/pull/10) Adding scope to package to avoid naming collision ([@scalvert](https://github.com/scalvert))

#### :bug: Bug Fix
* [#9](https://github.com/scalvert/eslint-formatter-todo/pull/9) Fix: formatter printing path of files with todo ([@renatoi](https://github.com/renatoi))
* [#8](https://github.com/scalvert/eslint-formatter-todo/pull/8) Update todo-utils version. Fix dynamic paths in tests ([@scalvert](https://github.com/scalvert))
* [#6](https://github.com/scalvert/eslint-formatter-todo/pull/6) Remove redundancies and fix output example count ([@renatoi](https://github.com/renatoi))

#### :house: Internal
* [#5](https://github.com/scalvert/eslint-formatter-todo/pull/5) Add release-it ([@scalvert](https://github.com/scalvert))
* [#4](https://github.com/scalvert/eslint-formatter-todo/pull/4) Adding github actions ([@scalvert](https://github.com/scalvert))
* [#3](https://github.com/scalvert/eslint-formatter-todo/pull/3) Closes [#2](https://github.com/scalvert/eslint-formatter-todo/issues/2) Initial implementation for ESLint Formatter Todo ([@renatoi](https://github.com/renatoi))

#### Committers: 2
- Renato Iwashima ([@renatoi](https://github.com/renatoi))
- Steve Calvert ([@scalvert](https://github.com/scalvert))


# Changelog
