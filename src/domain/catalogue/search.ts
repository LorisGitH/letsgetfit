import type { Muscle } from '../body/muscle';
import { allows, type Inventory } from '../inventory/inventory';
import type { Equipment } from './equipment';
import { localized, type ContentLanguage, type Exercise } from './exercise';

export interface CatalogueFilter {
  query?: string;
  /** Matches Exercises whose primary Muscles include it. */
  muscle?: Muscle | undefined;
  /** Equipment the Exercise requires or can use, or `none` for Exercises needing nothing. */
  equipment?: Equipment | 'none' | undefined;
  /** Keeps only Exercises this Inventory allows. */
  allowedBy?: Inventory | undefined;
}

/** Lower case, no accents, words separated by single spaces. */
export function normalizeForSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, ' ')
    .trim();
}

function usesEquipment(
  exercise: Exercise,
  equipment: CatalogueFilter['equipment'],
): boolean {
  if (equipment === undefined) return true;
  if (equipment === 'none') return exercise.requiredEquipment.length === 0;
  return (
    exercise.requiredEquipment.includes(equipment) ||
    exercise.optionalEquipment.includes(equipment)
  );
}

/** The Exercises matching the filter, sorted by their name in the given language. */
export function filterExercises(
  exercises: readonly Exercise[],
  filter: CatalogueFilter,
  language: ContentLanguage,
): Exercise[] {
  const words = normalizeForSearch(filter.query ?? '')
    .split(' ')
    .filter((word) => word !== '');
  const collator = new Intl.Collator(language);

  return exercises
    .map((exercise) => ({ exercise, name: localized(exercise.name, language) }))
    .filter(({ exercise, name }) => {
      const searchable = normalizeForSearch(name);
      return (
        words.every((word) => searchable.includes(word)) &&
        (filter.muscle === undefined ||
          exercise.primaryMuscles.includes(filter.muscle)) &&
        usesEquipment(exercise, filter.equipment) &&
        (filter.allowedBy === undefined || allows(filter.allowedBy, exercise))
      );
    })
    .sort((a, b) => collator.compare(a.name, b.name))
    .map(({ exercise }) => exercise);
}
