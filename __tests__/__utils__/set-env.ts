export function setUpdateTodoEnv(shouldEnable: boolean): void {
  process.env.UPDATE_TODO = shouldEnable ? '1' : '0';
}
