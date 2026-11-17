import { describe, expect, it } from 'vitest';
import {
  catalogueId,
  isHomeExercise,
  levelOf,
  muscleName,
  tagEquipment,
  type SourceExercise,
} from './tagging';

const source = (overrides: Partial<SourceExercise>): SourceExercise => ({
  id: 'Example',
  name: 'Example',
  category: 'strength',
  equipment: 'body only',
  level: 'beginner',
  primaryMuscles: ['chest'],
  secondaryMuscles: [],
  instructions: ['Do it.'],
  images: [],
  ...overrides,
});

describe('isHomeExercise', () => {
  it('keeps strength and plyometric work done with home equipment', () => {
    expect(isHomeExercise(source({ equipment: 'dumbbell' }))).toBe(true);
    expect(
      isHomeExercise(source({ category: 'plyometrics', equipment: null })),
    ).toBe(true);
  });

  it('drops gym equipment, stretching and excluded records', () => {
    expect(isHomeExercise(source({ equipment: 'barbell' }))).toBe(false);
    expect(isHomeExercise(source({ equipment: 'machine' }))).toBe(false);
    expect(isHomeExercise(source({ category: 'stretching' }))).toBe(false);
    expect(
      isHomeExercise(source({ id: 'Inverted_Row', equipment: null })),
    ).toBe(false);
    expect(isHomeExercise(source({ instructions: [] }))).toBe(false);
  });

  it('keeps cardio by name, whatever the source equipment says', () => {
    expect(
      isHomeExercise(
        source({
          id: 'Rowing_Stationary',
          category: 'cardio',
          equipment: 'machine',
        }),
      ),
    ).toBe(true);
    expect(
      isHomeExercise(
        source({ id: 'Stairmaster', category: 'cardio', equipment: 'machine' }),
      ),
    ).toBe(false);
  });
});

describe('tagEquipment', () => {
  it('maps source equipment to the fixed Equipment list', () => {
    expect(tagEquipment(source({ equipment: 'kettlebells' }))).toEqual({
      required: ['kettlebell'],
      optional: [],
    });
  });

  it('finds Equipment the source misses from the exercise name', () => {
    expect(tagEquipment(source({ name: 'Pullups' })).required).toEqual([
      'pullUpBar',
    ]);
    expect(
      tagEquipment(source({ name: 'Dumbbell Step Ups', equipment: 'dumbbell' }))
        .required,
    ).toEqual(['dumbbells', 'box']);
    expect(
      tagEquipment(
        source({ name: 'Incline Dumbbell Press', equipment: 'dumbbell' }),
      ).required,
    ).toEqual(['dumbbells', 'bench']);
  });

  it('does not ask for a bench for bodyweight incline push-ups', () => {
    expect(tagEquipment(source({ name: 'Incline Push-Up' })).required).toEqual(
      [],
    );
  });

  it('marks push-up bars as optional for floor push-ups only', () => {
    expect(tagEquipment(source({ name: 'Pushups' })).optional).toEqual([
      'pushUpBars',
    ]);
    expect(
      tagEquipment(source({ name: 'Handstand Push-Ups' })).optional,
    ).toEqual([]);
  });

  it('applies hand-reviewed corrections', () => {
    expect(
      tagEquipment(
        source({
          id: 'Middle_Back_Shrug',
          name: 'Middle Back Shrug',
          equipment: 'dumbbell',
        }),
      ).required,
    ).toEqual(['dumbbells', 'bench']);
  });

  it('tags cardio machines', () => {
    expect(
      tagEquipment(
        source({
          id: 'Rowing_Stationary',
          category: 'cardio',
          equipment: 'machine',
        }),
      ).required,
    ).toEqual(['rowingMachine']);
  });
});

describe('source name conversions', () => {
  it('turns source ids into Catalogue ids', () => {
    expect(catalogueId('Dumbbell_Bench_Press')).toBe('dumbbell-bench-press');
    expect(catalogueId('3_4_Sit-Up')).toBe('3-4-sit-up');
  });

  it('turns source muscles and levels into domain names', () => {
    expect(muscleName('lower back')).toBe('lowerBack');
    expect(levelOf('expert')).toBe('advanced');
  });
});
