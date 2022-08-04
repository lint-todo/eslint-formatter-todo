import {
  DaysToDecay,
  DaysToDecayByRule,
  LintTodoPackageJson,
  TodoConfigByEngine,
} from '@lint-todo/utils';
import { dirname, join } from 'path';
import { mkdirpSync, symlinkSync } from 'fs-extra';
import { BinTesterProject } from '@scalvert/bin-tester';

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

export class FakeProject extends BinTesterProject {
  static async getInstance(): Promise<FakeProject> {
    const project = new this();

    project.files['eslint-config.json'] = DEFAULT_ESLINT_CONFIG;

    await project.write();
    // link binary
    project.symlink(
      join(__dirname, '../..', 'node_modules', '.bin', 'eslint'),
      join(project.baseDir, 'node_modules', '.bin', 'eslint')
    );

    // link package
    project.symlink(
      join(__dirname, '../..', 'node_modules', 'eslint'),
      join(project.baseDir, 'node_modules', 'eslint')
    );

    // link formatter for FORMAT_TODO_AS tests
    project.symlink(
      join(__dirname, '../..', 'node_modules', '@microsoft'),
      join(project.baseDir, 'node_modules', '@microsoft')
    );

    return project;
  }

  constructor(name = 'fake-project', ...args: any[]) {
    super(name, ...args);

    this.pkg = {
      ...this.pkg,
      license: 'MIT',
      description: 'Fake project',
      repository: 'http://fakerepo.com',
    };
  }

  setShorthandPackageJsonTodoConfig(daysToDecay: DaysToDecay): Promise<void> {
    this.pkg = Object.assign({}, this.pkg, {
      lintTodo: {
        daysToDecay,
      },
    });

    return this.write();
  }

  setPackageJsonTodoConfig(
    daysToDecay: DaysToDecay,
    daysToDecayByRule?: DaysToDecayByRule
  ): Promise<void> {
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

    return this.write();
  }

  setLintTodorc(
    daysToDecay: DaysToDecay,
    daysToDecayByRule?: DaysToDecayByRule
  ): Promise<void> {
    const todoConfig: TodoConfigByEngine = {
      eslint: {
        daysToDecay,
      },
    };

    if (daysToDecayByRule) {
      todoConfig['eslint'].daysToDecayByRule = daysToDecayByRule;
    }

    return this.write({
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
