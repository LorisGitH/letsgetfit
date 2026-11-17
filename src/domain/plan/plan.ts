import type { Weekday } from '../athlete/availability';
import type { ExerciseRef } from '../repertoire/repertoire';

export const SESSION_FOCUSES = [
  'fullBody',
  'upper',
  'lower',
  'push',
  'pull',
  'legs',
] as const;
export type SessionFocus = (typeof SESSION_FOCUSES)[number];

/** What a Session asks for one Strength Exercise. Load is left to the Athlete for now. */
export interface StrengthTarget {
  kind: 'strength';
  sets: number;
  repsMin: number;
  repsMax: number;
  restSeconds: number;
}

export type Target = StrengthTarget;

export interface PlannedExercise {
  ref: ExerciseRef;
  target: Target;
}

/** One workout on one weekday of the Plan. */
export interface Session {
  weekday: Weekday;
  focus: SessionFocus;
  exercises: readonly PlannedExercise[];
  /** Warm-up plus every Exercise's sets, rest and setup, rounded up. */
  estimatedMinutes: number;
}

/** A template week of Sessions that repeats. */
export interface Plan {
  sessions: readonly Session[];
}
