import { JOINTS, type Joint } from '../body/joint';
import { MUSCLES, type Muscle } from '../body/muscle';
import { EQUIPMENT, type Equipment } from '../catalogue/equipment';
import type { ExerciseKind } from '../catalogue/exercise';
import type { Inventory } from '../inventory/inventory';
import { inListOrder } from '../listOrder';
import {
  checkPresent,
  fieldErrors,
  hasErrors,
  type Validation,
  type ValidationError,
} from '../validation';

/** An Exercise the Athlete created, outside the Catalogue. Written in their own words only. */
export interface CustomExercise {
  id: string;
  name: string;
  kind: ExerciseKind;
  primaryMuscles: readonly Muscle[];
  secondaryMuscles: readonly Muscle[];
  strainedJoints: readonly Joint[];
  requiredEquipment: readonly Equipment[];
  /** Ids of the Athlete's Custom Equipment it needs. Catalogue Exercises never have these. */
  requiredCustomEquipment: readonly string[];
  /** Optional instructions or reminders. */
  notes: string;
}

export type CustomExerciseFields = Omit<CustomExercise, 'id'>;

export type CustomExerciseInput = Omit<CustomExerciseFields, 'kind'> & {
  kind: ExerciseKind | undefined;
};

export type CustomExerciseField = keyof CustomExerciseFields;

export const CUSTOM_EXERCISE_NAME_MAX = 60;
export const CUSTOM_EXERCISE_NOTES_MAX = 1000;

const comparable = (name: string) => name.trim().toLocaleLowerCase();

function checkName(
  name: string,
  existing: readonly CustomExercise[],
  ownId: string | undefined,
): ValidationError | undefined {
  if (name === '') return 'required';
  if (name.length > CUSTOM_EXERCISE_NAME_MAX) return 'tooHigh';
  const taken = existing.some(
    (exercise) =>
      exercise.id !== ownId && comparable(exercise.name) === comparable(name),
  );
  return taken ? 'duplicate' : undefined;
}

/**
 * Checks a Custom Exercise against the Athlete's others. `ownId` is the one being edited,
 * which may keep its own name.
 */
export function validateCustomExercise(
  input: CustomExerciseInput,
  existing: readonly CustomExercise[],
  ownId?: string,
): Validation<CustomExerciseFields, CustomExerciseField> {
  const name = input.name.trim();
  const notes = input.notes.trim();
  const primaryMuscles = inListOrder(MUSCLES, input.primaryMuscles);
  const errors = fieldErrors<CustomExerciseField>({
    name: checkName(name, existing, ownId),
    kind: checkPresent(input.kind),
    primaryMuscles: primaryMuscles.length === 0 ? 'required' : undefined,
    secondaryMuscles: undefined,
    strainedJoints: undefined,
    requiredEquipment: undefined,
    requiredCustomEquipment: undefined,
    notes: notes.length > CUSTOM_EXERCISE_NOTES_MAX ? 'tooHigh' : undefined,
  });
  if (hasErrors(errors) || input.kind === undefined)
    return { ok: false, errors };
  return {
    ok: true,
    value: {
      name,
      kind: input.kind,
      primaryMuscles,
      secondaryMuscles: inListOrder(MUSCLES, input.secondaryMuscles).filter(
        (muscle) => !primaryMuscles.includes(muscle),
      ),
      strainedJoints: inListOrder(JOINTS, input.strainedJoints),
      requiredEquipment: inListOrder(EQUIPMENT, input.requiredEquipment),
      requiredCustomEquipment: [...new Set(input.requiredCustomEquipment)],
      notes,
    },
  };
}

/** True when the Athlete owns every Catalogue and Custom Equipment the exercise needs. */
export function allowsCustom(
  inventory: Inventory,
  exercise: CustomExercise,
): boolean {
  return (
    exercise.requiredEquipment.every((item) =>
      inventory.equipment.includes(item),
    ) &&
    exercise.requiredCustomEquipment.every((id) =>
      inventory.customEquipment.some((item) => item.id === id),
    )
  );
}

/** The Custom Exercises that need this Custom Equipment, which therefore can't be removed. */
export function customExercisesUsing(
  exercises: readonly CustomExercise[],
  customEquipmentId: string,
): CustomExercise[] {
  return exercises.filter((exercise) =>
    exercise.requiredCustomEquipment.includes(customEquipmentId),
  );
}
