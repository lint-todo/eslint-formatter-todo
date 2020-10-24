export function deepCopy<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}
