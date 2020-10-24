export function getBasePath(): string {
  return process.env.ESLINT_TODO_DIR || process.cwd();
}
