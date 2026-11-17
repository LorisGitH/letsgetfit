import { describe, expect, it } from 'vitest';
import type { BodyStats } from '../../domain/athlete/bodyStats';
import {
  parseDecimal,
  switchUnitSystem,
  toFields,
  toInput,
} from './bodyStatsFields';

const stats: BodyStats = {
  dateOfBirth: '1990-06-15',
  sex: 'male',
  heightCm: 180,
  weightKg: 80,
};

describe('parseDecimal', () => {
  it('reads a dot or a comma as the decimal separator', () => {
    expect(parseDecimal('62.5')).toBe(62.5);
    expect(parseDecimal(' 62,5 ')).toBe(62.5);
  });

  it('is undefined for an empty field and NaN for text that is not a number', () => {
    expect(parseDecimal('  ')).toBeUndefined();
    expect(Number.isNaN(parseDecimal('abc'))).toBe(true);
  });
});

describe('Body Stats fields', () => {
  it('shows stored metric values in the chosen unit system', () => {
    expect(toFields(stats, 'metric')).toMatchObject({
      heightCm: '180',
      weight: '80',
    });
    expect(toFields(stats, 'imperial')).toMatchObject({
      heightFeet: '5',
      heightInches: '11',
      weight: '176.4',
    });
  });

  it('starts empty for a new Athlete', () => {
    expect(toFields(undefined, 'metric')).toEqual({
      unitSystem: 'metric',
      dateOfBirth: '',
      sex: '',
      heightCm: '',
      heightFeet: '',
      heightInches: '',
      weight: '',
    });
  });

  it('turns imperial entries into metric', () => {
    const input = toInput(
      {
        ...toFields(undefined, 'imperial'),
        heightFeet: '6',
        heightInches: '',
        weight: '200',
      },
      undefined,
    );
    expect(input.heightCm).toBeCloseTo(182.88, 2);
    expect(input.weightKg).toBeCloseTo(90.72, 2);
  });

  it('keeps the exact stored values when fields are left untouched', () => {
    // 180 cm shows as 5 ft 11 in, which is 180.34 cm: saving unchanged fields must not drift.
    expect(toInput(toFields(stats, 'imperial'), stats)).toEqual(stats);
  });

  it('converts what is typed when the unit system changes', () => {
    const typed = {
      ...toFields(undefined, 'metric'),
      heightCm: '170',
      weight: '65,5',
    };
    expect(switchUnitSystem(typed, 'imperial', undefined)).toMatchObject({
      unitSystem: 'imperial',
      heightFeet: '5',
      heightInches: '7',
      weight: '144.4',
    });
  });

  it('leaves fields it cannot read when the unit system changes', () => {
    const typed = { ...toFields(undefined, 'metric'), heightCm: 'abc' };
    expect(switchUnitSystem(typed, 'imperial', undefined)).toMatchObject({
      heightFeet: '',
      heightInches: '',
    });
  });
});
