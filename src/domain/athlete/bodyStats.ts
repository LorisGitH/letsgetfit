import { isCalendarDate, type CalendarDate } from '../calendarDate';
import {
  checkPresent,
  checkRange,
  fieldErrors,
  hasErrors,
  type Range,
  type Validation,
  type ValidationError,
} from '../validation';

export const SEXES = ['male', 'female', 'unspecified'] as const;
export type Sex = (typeof SEXES)[number];

/** Stored in metric whatever unit system the Athlete uses. */
export interface BodyStats {
  dateOfBirth: CalendarDate;
  sex: Sex;
  heightCm: number;
  weightKg: number;
}

export interface BodyStatsInput {
  dateOfBirth: string;
  sex: Sex | undefined;
  heightCm: number | undefined;
  weightKg: number | undefined;
}

export type BodyStatsField = keyof BodyStats;

export const BODY_STATS_LIMITS = {
  ageYears: { min: 16, max: 100 },
  heightCm: { min: 90, max: 250 },
  weightKg: { min: 30, max: 300 },
} as const satisfies Record<string, Range>;

/** Completed years between a date of birth and a later date. */
export function ageOn(dateOfBirth: CalendarDate, date: CalendarDate): number {
  const years = Number(date.slice(0, 4)) - Number(dateOfBirth.slice(0, 4));
  const birthdayReached = date.slice(5) >= dateOfBirth.slice(5);
  return birthdayReached ? years : years - 1;
}

function checkDateOfBirth(
  dateOfBirth: string,
  today: CalendarDate,
): ValidationError | undefined {
  if (dateOfBirth === '') return 'required';
  if (!isCalendarDate(dateOfBirth) || dateOfBirth > today) return 'invalid';
  return checkRange(ageOn(dateOfBirth, today), BODY_STATS_LIMITS.ageYears);
}

export function validateBodyStats(
  input: BodyStatsInput,
  today: CalendarDate,
): Validation<BodyStats, BodyStatsField> {
  const { dateOfBirth, sex, heightCm, weightKg } = input;
  const errors = fieldErrors<BodyStatsField>({
    dateOfBirth: checkDateOfBirth(dateOfBirth, today),
    sex: checkPresent(sex),
    heightCm: checkRange(heightCm, BODY_STATS_LIMITS.heightCm),
    weightKg: checkRange(weightKg, BODY_STATS_LIMITS.weightKg),
  });
  if (
    hasErrors(errors) ||
    sex === undefined ||
    heightCm === undefined ||
    weightKg === undefined
  ) {
    return { ok: false, errors };
  }
  return { ok: true, value: { dateOfBirth, sex, heightCm, weightKg } };
}
