import { inListOrder } from '../listOrder';
import {
  checkPresent,
  fieldErrors,
  hasErrors,
  type Validation,
} from '../validation';

/** In week order, starting on Monday. */
export const WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export const SESSION_DURATIONS = [20, 30, 45, 60, 75, 90] as const;
export type SessionMinutes = (typeof SESSION_DURATIONS)[number];

export interface Availability {
  /** The Athlete's Training Days, in week order. */
  trainingDays: readonly Weekday[];
  sessionMinutes: SessionMinutes;
}

export interface AvailabilityInput {
  trainingDays: readonly Weekday[];
  sessionMinutes: SessionMinutes | undefined;
}

export type AvailabilityField = keyof Availability;

export function validateAvailability(
  input: AvailabilityInput,
): Validation<Availability, AvailabilityField> {
  const { trainingDays, sessionMinutes } = input;
  const errors = fieldErrors<AvailabilityField>({
    trainingDays: trainingDays.length === 0 ? 'required' : undefined,
    sessionMinutes: checkPresent(sessionMinutes),
  });
  if (hasErrors(errors) || sessionMinutes === undefined) {
    return { ok: false, errors };
  }
  return {
    ok: true,
    value: {
      trainingDays: inListOrder(WEEKDAYS, trainingDays),
      sessionMinutes,
    },
  };
}
