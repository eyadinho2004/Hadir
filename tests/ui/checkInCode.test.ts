import { describe, expect, it } from 'vitest';
import { buildJoinUrl, generateCheckInCode, parseCheckInCode } from '../../src/lib/checkInCode';

describe('generateCheckInCode', () => {
  it('returns four digits', () => {
    expect(generateCheckInCode()).toMatch(/^\d{4}$/);
  });

  it('avoids codes that are already used', () => {
    const used = new Set<string>();
    for (let i = 0; i < 20; i += 1) {
      const code = generateCheckInCode(used);
      expect(used.has(code)).toBe(false);
      used.add(code);
    }
  });
});

describe('parseCheckInCode', () => {
  it('accepts a plain code and trims it', () => {
    expect(parseCheckInCode(' 4821 ')).toBe('4821');
  });

  it('reads a payload and a join link', () => {
    expect(parseCheckInCode('HADIR:4821')).toBe('4821');
    expect(parseCheckInCode('HADIR:JOIN:4821')).toBe('4821');
    expect(parseCheckInCode('https://hadir.app/participant/sessions?code=4821')).toBe('4821');
  });

  it('rejects anything that is not a code', () => {
    expect(parseCheckInCode('')).toBeNull();
    expect(parseCheckInCode('482')).toBeNull();
    expect(parseCheckInCode('abcd')).toBeNull();
    expect(parseCheckInCode('https://hadir.app/participant/sessions')).toBeNull();
  });
});

describe('buildJoinUrl', () => {
  it('builds a join link carrying the code', () => {
    const url = buildJoinUrl('4821');
    expect(url).toContain('/participant/sessions?code=4821');
    expect(parseCheckInCode(url)).toBe('4821');
  });
});
