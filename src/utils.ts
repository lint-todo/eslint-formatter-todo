export function getBasePath() {
  return process.env.ESLINT_TODO_DIR || process.cwd();
}
