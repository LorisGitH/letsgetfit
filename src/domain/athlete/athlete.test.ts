import { describe, expect, it } from 'vitest';
import { NEW_ATHLETE, onboardingStep, type Athlete } from './athlete';

const accepted: Athlete = {
  unitSystem: 'metric',
  disclaimerAcceptedAt: '2026-11-17T10:00:00.000Z',
};
const withBodyStats: Athlete = {
  ...accepted,
  bodyStats: {
    dateOfBirth: '1990-06-15',
    sex: 'male',
    heightCm: 180,
    weightKg: 80,
  },
};

describe('onboardingStep', () => {
  it('starts with the disclaimer', () => {
    expect(onboardingStep(NEW_ATHLETE)).toBe('disclaimer');
  });

  it('asks for Body Stats once the disclaimer is accepted', () => {
    expect(onboardingStep(accepted)).toBe('bodyStats');
  });

  it('asks for training details until Experience Level and Availability are both set', () => {
    expect(
      onboardingStep({ ...withBodyStats, experienceLevel: 'beginner' }),
    ).toBe('training');
    expect(
      onboardingStep({
        ...withBodyStats,
        availability: { trainingDays: ['monday'], sessionMinutes: 30 },
      }),
    ).toBe('training');
  });

  it('is complete when everything is set', () => {
    expect(
      onboardingStep({
        ...withBodyStats,
        experienceLevel: 'beginner',
        availability: {
          trainingDays: ['monday', 'thursday'],
          sessionMinutes: 30,
        },
      }),
    ).toBe('complete');
  });
});
