import { describe, expect, it } from 'vitest';
import type { Inventory } from '../inventory/inventory';
import {
  allowsCustom,
  customExercisesUsing,
  validateCustomExercise,
  type CustomExercise,
  type CustomExerciseInput,
} from './customExercise';

const trxRow: CustomExercise = {
  id: 'trx-row',
  name: 'TRX row',
  kind: 'strength',
  primaryMuscles: ['middleBack'],
  secondaryMuscles: ['biceps'],
  strainedJoints: ['shoulder', 'elbow'],
  requiredEquipment: [],
  requiredCustomEquipment: ['trx'],
  notes: '',
};

const input: CustomExerciseInput = {
  name: '  Doorway stretch ',
  kind: 'strength',
  primaryMuscles: ['chest'],
  secondaryMuscles: ['shoulders', 'chest'],
  strainedJoints: ['shoulder'],
  requiredEquipment: ['resistanceBand'],
  requiredCustomEquipment: [],
  notes: '  Hold 30 s. ',
};

describe('validateCustomExercise', () => {
  it('trims text, orders lists and drops secondary Muscles that are already primary', () => {
    expect(validateCustomExercise(input, [trxRow])).toEqual({
      ok: true,
      value: {
        name: 'Doorway stretch',
        kind: 'strength',
        primaryMuscles: ['chest'],
        secondaryMuscles: ['shoulders'],
        strainedJoints: ['shoulder'],
        requiredEquipment: ['resistanceBand'],
        requiredCustomEquipment: [],
        notes: 'Hold 30 s.',
      },
    });
  });

  it('requires a name, a kind and a main Muscle', () => {
    expect(
      validateCustomExercise(
        { ...input, name: ' ', kind: undefined, primaryMuscles: [] },
        [],
      ),
    ).toEqual({
      ok: false,
      errors: {
        name: 'required',
        kind: 'required',
        primaryMuscles: 'required',
      },
    });
  });

  it('refuses a name another Custom Exercise already has, unless it is its own', () => {
    expect(
      validateCustomExercise({ ...input, name: 'trx ROW' }, [trxRow]),
    ).toEqual({
      ok: false,
      errors: { name: 'duplicate' },
    });
    expect(
      validateCustomExercise({ ...input, name: 'TRX row' }, [trxRow], 'trx-row')
        .ok,
    ).toBe(true);
  });

  it('limits the length of the name and notes', () => {
    expect(
      validateCustomExercise(
        { ...input, name: 'x'.repeat(61), notes: 'x'.repeat(1001) },
        [],
      ),
    ).toEqual({ ok: false, errors: { name: 'tooHigh', notes: 'tooHigh' } });
  });
});

describe('Custom Equipment in Custom Exercises', () => {
  const inventory: Inventory = {
    equipment: ['dumbbells'],
    customEquipment: [{ id: 'trx', name: 'TRX strap' }],
  };

  it('allows a Custom Exercise only when its Catalogue and Custom Equipment are owned', () => {
    expect(allowsCustom(inventory, trxRow)).toBe(true);
    expect(allowsCustom({ ...inventory, customEquipment: [] }, trxRow)).toBe(
      false,
    );
    expect(
      allowsCustom(inventory, { ...trxRow, requiredEquipment: ['bench'] }),
    ).toBe(false);
  });

  it('finds the Custom Exercises that require a Custom Equipment', () => {
    const plank = {
      ...trxRow,
      id: 'plank',
      name: 'Plank',
      requiredCustomEquipment: [],
    };
    expect(
      customExercisesUsing([trxRow, plank], 'trx').map(
        (exercise) => exercise.name,
      ),
    ).toEqual(['TRX row']);
  });
});
