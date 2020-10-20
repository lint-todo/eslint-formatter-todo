import { formatter } from '../src/formatter';
import { readJson } from './__utils__/read-json';

describe('formatter', () => {
  const INITIAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...INITIAL_ENV };
  });

  afterAll(() => {
    process.env = INITIAL_ENV;
  });

  it('matches error snapshot (all errors are visible)', async () => {
    const results = await readJson(
      require.resolve('./__fixtures__/eslint-with-errors.json')
    );
    expect(formatter(results)).toMatchSnapshot();
  });

  it('matches todo snapshot with no INCLUDE_TODO (nothing is visible except summary)', async () => {
    const results = await readJson(
      require.resolve('./__fixtures__/eslint-with-todos.json')
    );

    expect(formatter(results)).toMatchSnapshot();
  });

  it('matches todo snapshot with INCLUDE_TODO (all todo items are visible)', async () => {
    const results = await readJson(
      require.resolve('./__fixtures__/eslint-with-todos.json')
    );

    expect(formatter(results, true)).toMatchSnapshot();
  });
});
