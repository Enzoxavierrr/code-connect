import { buildCorsOptions } from './cors.js';

describe('buildCorsOptions', () => {
  it('defaults to the Vite dev server', () => {
    expect(buildCorsOptions(undefined).origin).toEqual([
      'http://localhost:5173',
    ]);
  });

  it('parses a comma-separated list', () => {
    expect(buildCorsOptions(' https://a.dev, ,https://b.dev ').origin).toEqual([
      'https://a.dev',
      'https://b.dev',
    ]);
  });

  it('allows any origin with *', () => {
    expect(buildCorsOptions('*').origin).toBe(true);
  });
});
