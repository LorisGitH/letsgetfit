/** Muscle groups as the Catalogue's source (free-exercise-db) names them, see ADR 0003. */
export const MUSCLES = [
  'abdominals',
  'abductors',
  'adductors',
  'biceps',
  'calves',
  'chest',
  'forearms',
  'glutes',
  'hamstrings',
  'lats',
  'lowerBack',
  'middleBack',
  'neck',
  'quadriceps',
  'shoulders',
  'traps',
  'triceps',
] as const;
export type Muscle = (typeof MUSCLES)[number];
