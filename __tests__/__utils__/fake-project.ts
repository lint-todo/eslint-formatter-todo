import { execSync } from 'child_process';
import Project from 'fixturify-project';

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

    project.addDevDependency('eslint', '^7.10.0');

    project.files['eslint-config.json'] = DEFAULT_ESLINT_CONFIG;

    return project;
  }

  constructor(name = 'fake-project', ...args: any[]) {
    super(name, ...args);
  }

  install(): void {
    const cmd = 'yarn install';

    try {
      execSync(cmd, { cwd: this.baseDir });
    } catch {
      throw new Error(`Couldn't install dependencies using ${cmd}`);
    }
  }
}
