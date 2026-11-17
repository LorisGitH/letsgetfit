import type { Muscle } from '../body/muscle';

export const FOCUS_AREAS = [
  'bellyAndWaist',
  'arms',
  'chest',
  'back',
  'shoulders',
  'glutes',
  'thighs',
  'calves',
] as const;
export type FocusArea = (typeof FOCUS_AREAS)[number];

const FOCUS_AREA_MUSCLES: Record<FocusArea, readonly Muscle[]> = {
  bellyAndWaist: ['abdominals'],
  arms: ['biceps', 'triceps', 'forearms'],
  chest: ['chest'],
  back: ['lats', 'middleBack', 'lowerBack', 'traps'],
  shoulders: ['shoulders'],
  glutes: ['glutes', 'abductors'],
  thighs: ['quadriceps', 'hamstrings', 'adductors'],
  calves: ['calves'],
};

/** The Muscles that get extra work for these Focus Areas, without duplicates. */
export function musclesFor(focusAreas: readonly FocusArea[]): Muscle[] {
  return [...new Set(focusAreas.flatMap((area) => FOCUS_AREA_MUSCLES[area]))];
}
