import { describe, expect, it } from 'vitest';
import type { Exercise } from './exercise';
import { filterExercises, normalizeForSearch } from './search';

const exercise = (id: string, overrides: Partial<Exercise>): Exercise => ({
  id,
  kind: 'strength',
  name: { en: id },
  instructions: { en: ['Do it.'] },
  level: 'beginner',
  primaryMuscles: ['chest'],
  secondaryMuscles: [],
  requiredEquipment: [],
  optionalEquipment: [],
  images: [],
  ...overrides,
});

const pushups = exercise('pushups', {
  name: { en: 'Pushups', fr: 'Pompes' },
  secondaryMuscles: ['triceps'],
  optionalEquipment: ['pushUpBars'],
});
const curl = exercise('curl', {
  name: { en: 'Dumbbell Bicep Curl', fr: 'Curl biceps avec haltères' },
  primaryMuscles: ['biceps'],
  requiredEquipment: ['dumbbells'],
});
const row = exercise('row', {
  name: { en: 'Rowing, Stationary' },
  kind: 'cardio',
  primaryMuscles: ['quadriceps'],
  requiredEquipment: ['rowingMachine'],
});
const all = [row, curl, pushups];

describe('normalizeForSearch', () => {
  it('ignores case, accents and punctuation', () => {
    expect(normalizeForSearch('  Haltères, Élevés ')).toBe('halteres eleves');
  });
});

describe('filterExercises', () => {
  it('sorts by name in the chosen language', () => {
    expect(filterExercises(all, {}, 'en').map((e) => e.id)).toEqual([
      'curl',
      'pushups',
      'row',
    ]);
    expect(filterExercises(all, {}, 'fr').map((e) => e.id)).toEqual([
      'curl',
      'pushups',
      'row',
    ]);
  });

  it('matches every word of the query, in any order, without accents', () => {
    expect(
      filterExercises(all, { query: 'curl dumbbell' }, 'en').map((e) => e.id),
    ).toEqual(['curl']);
    expect(
      filterExercises(all, { query: 'halteres' }, 'fr').map((e) => e.id),
    ).toEqual(['curl']);
  });

  it('falls back to the English name when there is no translation', () => {
    expect(
      filterExercises(all, { query: 'rowing' }, 'fr').map((e) => e.id),
    ).toEqual(['row']);
  });

  it('filters by primary Muscle', () => {
    expect(filterExercises(all, { muscle: 'triceps' }, 'en')).toEqual([]);
    expect(
      filterExercises(all, { muscle: 'biceps' }, 'en').map((e) => e.id),
    ).toEqual(['curl']);
  });

  it('filters by Equipment that is required or can be used', () => {
    expect(
      filterExercises(all, { equipment: 'pushUpBars' }, 'en').map((e) => e.id),
    ).toEqual(['pushups']);
    expect(
      filterExercises(all, { equipment: 'dumbbells' }, 'en').map((e) => e.id),
    ).toEqual(['curl']);
  });

  it('can show only Exercises that need no Equipment', () => {
    expect(
      filterExercises(all, { equipment: 'none' }, 'en').map((e) => e.id),
    ).toEqual(['pushups']);
  });
});
