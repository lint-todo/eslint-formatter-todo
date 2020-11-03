export function updatePaths<T extends { filePath: string }>(
  path: string,
  data: T[]
): T[] {
  data.forEach((d) => (d.filePath = d.filePath.replace('{{path}}', path)));

  return data;
}

export function updatePath<T extends { filePath: string }>(
  path: string,
  data: T
): T {
  const newData = { ...data };

  newData.filePath = newData.filePath.replace('{{path}}', path);

  return newData;
}
