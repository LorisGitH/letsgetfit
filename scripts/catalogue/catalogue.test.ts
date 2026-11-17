import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseCatalogue } from '../../src/domain/catalogue/catalogue';

const root = join(import.meta.dirname, '..', '..');
const catalogue = parseCatalogue(
  JSON.parse(
    readFileSync(join(root, 'src/domain/catalogue/exercises.json'), 'utf8'),
  ),
);
const imageFiles = readdirSync(join(root, 'public/catalogue/images'));

describe('the imported Catalogue', () => {
  it('records the source commit it was imported from', () => {
    expect(catalogue.source.commit).toMatch(/^[0-9a-f]{40}$/);
  });

  it('has Strength and Cardio Exercises with unique ids', () => {
    const ids = catalogue.exercises.map((exercise) => exercise.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(
      catalogue.exercises.some((exercise) => exercise.kind === 'cardio'),
    ).toBe(true);
    expect(catalogue.exercises.length).toBeGreaterThan(250);
  });

  it('gives every Exercise a primary Muscle and instructions', () => {
    for (const exercise of catalogue.exercises) {
      expect(exercise.primaryMuscles.length, exercise.id).toBeGreaterThan(0);
      expect(exercise.instructions.en.length, exercise.id).toBeGreaterThan(0);
    }
  });

  it('tags joint strain for nearly every Exercise', () => {
    const untagged = catalogue.exercises.filter(
      (exercise) => exercise.strainedJoints.length === 0,
    );
    expect(untagged.map((exercise) => exercise.id).sort()).toEqual([
      'dead-bug',
      'dumbbell-incline-row',
      'isometric-chest-squeezes',
      'walking-treadmill',
    ]);
  });

  it('never lists the same Equipment as both required and optional', () => {
    for (const {
      id,
      requiredEquipment,
      optionalEquipment,
    } of catalogue.exercises) {
      expect(
        optionalEquipment.filter((item) => requiredEquipment.includes(item)),
        id,
      ).toEqual([]);
    }
  });

  it('ships exactly the images the Exercises reference', () => {
    const referenced = catalogue.exercises.flatMap(
      (exercise) => exercise.images,
    );
    expect([...referenced].sort()).toEqual([...imageFiles].sort());
  });
});

describe('parseCatalogue', () => {
  it('requires joint tags on every Exercise, from the Joint list', () => {
    const exercise = catalogue.exercises[0];
    const { strainedJoints: _strainedJoints, ...untagged } = exercise ?? {};
    expect(() =>
      parseCatalogue({ ...catalogue, exercises: [untagged] }),
    ).toThrow(/exercises\[0\]\.strainedJoints/);
    expect(() =>
      parseCatalogue({
        ...catalogue,
        exercises: [{ ...exercise, strainedJoints: ['spine'] }],
      }),
    ).toThrow(/strainedJoints\[0\]/);
  });

  it('rejects unknown Muscles and Equipment', () => {
    const exercise = catalogue.exercises[0];
    expect(() =>
      parseCatalogue({
        ...catalogue,
        exercises: [{ ...exercise, primaryMuscles: ['wings'] }],
      }),
    ).toThrow(/primaryMuscles\[0\]/);
    expect(() =>
      parseCatalogue({
        ...catalogue,
        exercises: [{ ...exercise, requiredEquipment: ['barbell'] }],
      }),
    ).toThrow(/requiredEquipment\[0\]/);
  });
});
