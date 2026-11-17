import { describe, expect, it } from 'vitest';
import { validateGoalChoice } from './goalChoice';

describe('validateGoalChoice', () => {
  it('requires a Goal', () => {
    expect(
      validateGoalChoice({ goal: undefined, focusAreas: [], limitations: [] }),
    ).toEqual({
      ok: false,
      errors: { goal: 'required' },
    });
  });

  it('allows no Focus Area and no Limitation', () => {
    expect(
      validateGoalChoice({
        goal: 'gainMuscle',
        focusAreas: [],
        limitations: [],
      }),
    ).toEqual({
      ok: true,
      value: { goal: 'gainMuscle', focusAreas: [], limitations: [] },
    });
  });

  it('puts Focus Areas and Limitations in list order without duplicates', () => {
    expect(
      validateGoalChoice({
        goal: 'recomposition',
        focusAreas: ['calves', 'arms', 'calves'],
        limitations: ['knee', 'neck', 'knee'],
      }),
    ).toEqual({
      ok: true,
      value: {
        goal: 'recomposition',
        focusAreas: ['arms', 'calves'],
        limitations: ['neck', 'knee'],
      },
    });
  });
});
