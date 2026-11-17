import { describe, expect, it } from 'vitest';
import { validateAvailability } from './availability';

describe('validateAvailability', () => {
  it('puts Training Days in week order without duplicates', () => {
    expect(
      validateAvailability({
        trainingDays: ['friday', 'monday', 'friday', 'wednesday'],
        sessionMinutes: 45,
      }),
    ).toEqual({
      ok: true,
      value: {
        trainingDays: ['monday', 'wednesday', 'friday'],
        sessionMinutes: 45,
      },
    });
  });

  it('requires at least one Training Day and a session duration', () => {
    expect(
      validateAvailability({ trainingDays: [], sessionMinutes: undefined }),
    ).toEqual({
      ok: false,
      errors: { trainingDays: 'required', sessionMinutes: 'required' },
    });
  });
});
