export function setupEnvVar(name: string, value: string): void {
  let oldValue: string | undefined | null;

  beforeEach(function () {
    // eslint-disable-next-line unicorn/no-null
    oldValue = name in process.env ? process.env[name] : null;

    if (value === null) {
      delete process.env[name];
    } else {
      process.env[name] = value;
    }
  });

  afterEach(function () {
    if (oldValue === null) {
      delete process.env[name];
    } else {
      process.env[name] = oldValue;
    }
  });
}
