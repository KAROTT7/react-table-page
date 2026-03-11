import { describe, expect, it } from 'vitest';

import { createGreeting } from '../src/index';

describe('createGreeting', () => {
  it('returns a greeting with the given name', () => {
    expect(createGreeting('world')).toBe('Hello, world!');
  });

  it('supports uppercase output', () => {
    expect(createGreeting('world', { uppercase: true })).toBe('HELLO, WORLD!');
  });
});