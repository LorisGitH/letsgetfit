/**
 * Rules that turn a free-exercise-db record into a Catalogue Exercise: which records are kept,
 * and which Equipment each one requires or can use. Pure, so the import and its tests share them.
 */
import type { Equipment } from '../../src/domain/catalogue/equipment.ts';

export interface SourceExercise {
  id: string;
  name: string;
  category: string;
  equipment: string | null;
  level: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  images: string[];
}

export interface EquipmentTags {
  required: Equipment[];
  optional: Equipment[];
}

/** Source equipment values that need nothing beyond the home kit. */
const HOME_SOURCE_EQUIPMENT: Record<string, Equipment | null> = {
  'body only': null,
  dumbbell: 'dumbbells',
  kettlebells: 'kettlebell',
  bands: 'resistanceBand',
  'medicine ball': 'medicineBall',
  'exercise ball': 'exerciseBall',
};

const STRENGTH_CATEGORIES = new Set(['strength', 'plyometrics']);

/** Cardio is kept by name: the source tags machines as "machine" or "other". */
const CARDIO_EQUIPMENT: Record<string, Equipment | null> = {
  Bicycling: 'bicycle',
  Bicycling_Stationary: 'exerciseBike',
  Recumbent_Bike: 'exerciseBike',
  Elliptical_Trainer: 'elliptical',
  Jogging_Treadmill: 'treadmill',
  Running_Treadmill: 'treadmill',
  Walking_Treadmill: 'treadmill',
  Rope_Jumping: 'jumpRope',
  Rowing_Stationary: 'rowingMachine',
  Trail_Running_Walking: null,
};

/**
 * Equipment implied by the exercise name, which the source's single equipment field misses.
 * `onlyWith` limits a rule to records already needing that Equipment.
 */
const NAME_RULES: {
  pattern: RegExp;
  equipment: Equipment;
  onlyWith?: Equipment;
}[] = [
  {
    pattern: /pull-?ups?\b|pullup|chin\b|chin-?ups?|hanging|muscle.?up/i,
    equipment: 'pullUpBar',
  },
  { pattern: /^dips\b/i, equipment: 'dipBars' },
  { pattern: /\bbench\b/i, equipment: 'bench' },
  { pattern: /\bbox\b|step[- ]?ups?\b/i, equipment: 'box' },
  {
    pattern: /exercise ball|stability ball|swiss ball/i,
    equipment: 'exerciseBall',
  },
  { pattern: /medicine ball/i, equipment: 'medicineBall' },
  // Dumbbell work done lying on, or leaning against, a bench.
  {
    pattern:
      /incline|decline|lying|pullover|tate press|close-grip dumbbell press|^dumbbell flyes$/i,
    equipment: 'bench',
    onlyWith: 'dumbbells',
  },
];

/**
 * Corrections from reviewing every kept record by hand. `exclude` drops records that need gym
 * kit or a partner; `require` adds Equipment the name doesn't reveal.
 */
export const OVERRIDES: Record<
  string,
  { exclude: true } | { require: Equipment[] }
> = {
  // Need a decline bench.
  Decline_Crunch: { exclude: true },
  Decline_Oblique_Crunch: { exclude: true },
  Decline_Reverse_Crunch: { exclude: true },
  // Need a preacher bench.
  One_Arm_Dumbbell_Preacher_Curl: { exclude: true },
  Preacher_Hammer_Dumbbell_Curl: { exclude: true },
  'Two-Arm_Dumbbell_Preacher_Curl': { exclude: true },
  Zottman_Preacher_Curl: { exclude: true },
  // Need a partner, a fixed bar at hip height, or a glute-ham bench.
  Hyperextensions_With_No_Hyperextension_Bench: { exclude: true },
  Inverted_Row: { exclude: true },
  'Floor_Glute-Ham_Raise': { exclude: true },
  Natural_Glute_Ham_Raise: { exclude: true },
  Prone_Manual_Hamstring: { exclude: true },
  // Done lying face down on an incline bench.
  Middle_Back_Shrug: { require: ['bench'] },
  // Hands on a dumbbell, though the source says "body only".
  'Close-Grip_Push-Up_off_of_a_Dumbbell': { require: ['dumbbells'] },
  // Despite the name, hanging knee raises on a pull-up bar.
  Wind_Sprints: { require: ['pullUpBar'] },
};

/** Floor push-ups, where push-up bars can replace the hands on the floor. */
const PUSH_UP = /push-?ups?\b|pushups/i;
const NOT_ON_PUSH_UP_BARS =
  /handstand|incline|plyo|kettlebell|dumbbell|exercise ball|clock/i;

export function isHomeExercise(source: SourceExercise): boolean {
  const override = OVERRIDES[source.id];
  if (override && 'exclude' in override) return false;
  // Without instructions an Exercise can't be followed in a guided Session.
  if (source.instructions.length === 0) return false;
  if (source.category === 'cardio') return source.id in CARDIO_EQUIPMENT;
  return (
    STRENGTH_CATEGORIES.has(source.category) &&
    (source.equipment ?? 'body only') in HOME_SOURCE_EQUIPMENT
  );
}

export function kindOf(source: SourceExercise): 'strength' | 'cardio' {
  return source.category === 'cardio' ? 'cardio' : 'strength';
}

export function tagEquipment(source: SourceExercise): EquipmentTags {
  const required = new Set<Equipment>();
  const fromSource =
    source.category === 'cardio'
      ? CARDIO_EQUIPMENT[source.id]
      : HOME_SOURCE_EQUIPMENT[source.equipment ?? 'body only'];
  if (fromSource) required.add(fromSource);

  if (source.category !== 'cardio') {
    for (const { pattern, equipment, onlyWith } of NAME_RULES) {
      if (
        pattern.test(source.name) &&
        (onlyWith === undefined || required.has(onlyWith))
      ) {
        required.add(equipment);
      }
    }
  }
  const override = OVERRIDES[source.id];
  if (override && 'require' in override) {
    for (const equipment of override.require) required.add(equipment);
  }

  const optional: Equipment[] =
    PUSH_UP.test(source.name) && !NOT_ON_PUSH_UP_BARS.test(source.name)
      ? ['pushUpBars']
      : [];
  return { required: [...required], optional };
}

/** Our id for a source id, e.g. `Dumbbell_Bench_Press` becomes `dumbbell-bench-press`. */
export function catalogueId(sourceId: string): string {
  return sourceId
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** `lower back` becomes `lowerBack`, matching the domain's Muscle names. */
export function muscleName(sourceMuscle: string): string {
  return sourceMuscle.replace(/ (\w)/g, (_, letter: string) =>
    letter.toUpperCase(),
  );
}

export function levelOf(
  sourceLevel: string,
): 'beginner' | 'intermediate' | 'advanced' {
  if (sourceLevel === 'expert') return 'advanced';
  return sourceLevel === 'intermediate' ? 'intermediate' : 'beginner';
}
