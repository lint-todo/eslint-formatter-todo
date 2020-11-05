import { execSync } from 'child_process';
import Project from 'fixturify-project';

const DEFAULT_ESLINT_CONFIG = `
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
  },
};
`;

export class FakeProject extends Project {
  static getInstance(): FakeProject {
    const project = new this();

    project.addDevDependency('eslint', '^7.10.0');
    project.addDevDependency('eslint-plugin-import', '^2.22.1');
    project.addDevDependency('eslint-config-airbnb-base', '^14.2.0');

    project.files['.eslintrc.js'] = DEFAULT_ESLINT_CONFIG;

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
