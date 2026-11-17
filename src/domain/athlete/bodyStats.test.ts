import { describe, expect, it } from 'vitest';
import { ageOn, validateBodyStats, type BodyStatsInput } from './bodyStats';

const valid: BodyStatsInput = {
  dateOfBirth: '1990-06-15',
  sex: 'female',
  heightCm: 168,
  weightKg: 62,
};
const today = '2026-11-17';

describe('ageOn', () => {
  it('counts completed years', () => {
    expect(ageOn('1990-06-15', '2026-11-17')).toBe(36);
  });

  it('does not count the year until the birthday is reached', () => {
    expect(ageOn('1990-11-18', '2026-11-17')).toBe(35);
    expect(ageOn('1990-11-17', '2026-11-17')).toBe(36);
  });

  it('treats a 29 February birthday as reached on 1 March in other years', () => {
    expect(ageOn('2000-02-29', '2026-02-28')).toBe(25);
    expect(ageOn('2000-02-29', '2026-03-01')).toBe(26);
  });
});

describe('validateBodyStats', () => {
  it('accepts plausible Body Stats', () => {
    expect(validateBodyStats(valid, today)).toEqual({ ok: true, value: valid });
  });

  it('accepts a sex that is not stated', () => {
    const result = validateBodyStats({ ...valid, sex: 'unspecified' }, today);
    expect(result.ok).toBe(true);
  });

  it('reports every missing field', () => {
    const result = validateBodyStats(
      {
        dateOfBirth: '',
        sex: undefined,
        heightCm: undefined,
        weightKg: undefined,
      },
      today,
    );
    expect(result).toEqual({
      ok: false,
      errors: {
        dateOfBirth: 'required',
        sex: 'required',
        heightCm: 'required',
        weightKg: 'required',
      },
    });
  });

  it('rejects malformed, impossible and future dates of birth', () => {
    for (const dateOfBirth of ['15/06/1990', '1990-02-30', '2027-01-01']) {
      expect(validateBodyStats({ ...valid, dateOfBirth }, today)).toEqual({
        ok: false,
        errors: { dateOfBirth: 'invalid' },
      });
    }
  });

  it('rejects Athletes younger than 16 or older than 100', () => {
    expect(
      validateBodyStats({ ...valid, dateOfBirth: '2010-11-18' }, today),
    ).toEqual({
      ok: false,
      errors: { dateOfBirth: 'tooLow' },
    });
    expect(
      validateBodyStats({ ...valid, dateOfBirth: '1925-11-16' }, today),
    ).toEqual({
      ok: false,
      errors: { dateOfBirth: 'tooHigh' },
    });
  });

  it('rejects heights and weights outside human ranges', () => {
    expect(
      validateBodyStats({ ...valid, heightCm: 89, weightKg: 301 }, today),
    ).toEqual({
      ok: false,
      errors: { heightCm: 'tooLow', weightKg: 'tooHigh' },
    });
  });

  it('rejects numbers that are not finite', () => {
    expect(
      validateBodyStats({ ...valid, heightCm: Number.NaN }, today),
    ).toEqual({
      ok: false,
      errors: { heightCm: 'invalid' },
    });
  });
});
