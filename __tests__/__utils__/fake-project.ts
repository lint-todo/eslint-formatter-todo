import {
  DaysToDecay,
  DaysToDecayByRule,
  LintTodoPackageJson,
  TodoConfigByEngine,
} from '@ember-template-lint/todo-utils';
import { dirname, join } from 'path';
import fixturify from 'fixturify';
import Project from 'fixturify-project';
import { mkdirpSync, symlinkSync } from 'fs-extra';

const DEFAULT_ESLINT_CONFIG = `{
  "env": {
    "browser": true,
    "es2021": true
  },
  "parserOptions": {
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "rules": {
    "no-alert": ["warn"],
    "no-unused-vars": [
      "error",
      {
        "vars": "all",
        "args": "after-used",
        "ignoreRestSiblings": true
      }
    ],
    "use-isnan": ["error"],
    "eqeqeq": [
      "error",
      "always",
      {
        "null": "ignore"
      }
    ],
    "no-plusplus": ["error"],
    "no-param-reassign": [
      "error",
      {
        "props": true,
        "ignorePropertyModificationsFor": [
          "acc",
          "accumulator",
          "e",
          "ctx",
          "context",
          "req",
          "request",
          "res",
          "response",
          "$scope",
          "staticContext"
        ]
      }
    ],
    "consistent-return": ["error"],
    "no-useless-return": ["error"],
    "quotes": [
      "error",
      "single",
      {
        "avoidEscape": true
      }
    ]
  }
}
`;

export class FakeProject extends Project {
  static getInstance(): FakeProject {
    const project = new this();

    // project.addDevDependency('eslint', '^7.10.0');

    project.files['eslint-config.json'] = DEFAULT_ESLINT_CONFIG;

    return project;
  }

  constructor(name = 'fake-project', ...args: any[]) {
    super(name, ...args);

    this.pkg = Object.assign({}, this.pkg, {
      license: 'MIT',
      description: 'Fake project',
      repository: 'http://fakerepo.com',
    });

    // link binary
    this.symlink(
      join(__dirname, '../..', 'node_modules', '.bin', 'eslint'),
      join(this.baseDir, 'node_modules', '.bin', 'eslint')
    );

    // link package
    this.symlink(
      join(__dirname, '../..', 'node_modules', 'eslint'),
      join(this.baseDir, 'node_modules', 'eslint')
    );
  }

  write(dirJSON: fixturify.DirJSON): void {
    Object.assign(this.files, dirJSON);
    this.writeSync();
  }

  setShorthandPackageJsonTodoConfig(daysToDecay: DaysToDecay): void {
    this.pkg = Object.assign({}, this.pkg, {
      lintTodo: {
        daysToDecay,
      },
    });

    this.writeSync();
  }

  setPackageJsonTodoConfig(
    daysToDecay: DaysToDecay,
    daysToDecayByRule?: DaysToDecayByRule
  ): void {
    const todoConfig: LintTodoPackageJson = {
      lintTodo: {
        eslint: {
          daysToDecay,
        },
      },
    };

    if (daysToDecayByRule) {
      (<TodoConfigByEngine>todoConfig.lintTodo)!['eslint'].daysToDecayByRule =
        daysToDecayByRule;
    }

    this.pkg = Object.assign({}, this.pkg, todoConfig);

    this.writeSync();
  }

  setLintTodorc(
    daysToDecay: DaysToDecay,
    daysToDecayByRule?: DaysToDecayByRule
  ): void {
    const todoConfig: TodoConfigByEngine = {
      eslint: {
        daysToDecay,
      },
    };

    if (daysToDecayByRule) {
      todoConfig['eslint'].daysToDecayByRule = daysToDecayByRule;
    }

    this.write({
      '.lint-todorc.js': `module.exports = ${JSON.stringify(
        todoConfig,
        // eslint-disable-next-line unicorn/no-null
        null,
        2
      )}`,
    });
  }

  symlink(source: string, target: string): void {
    mkdirpSync(dirname(target));
    symlinkSync(source, target);
  }
}
