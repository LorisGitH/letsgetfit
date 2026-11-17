import type { Availability } from '../athlete/availability';
import type { ExperienceLevel } from '../athlete/experienceLevel';
import type { Muscle } from '../body/muscle';
import type { Exercise } from '../catalogue/exercise';
import { allows, type Inventory } from '../inventory/inventory';
import type { Goal } from '../objectives/goal';
import {
  allowsCustom,
  type CustomExercise,
} from '../repertoire/customExercise';
import type { ExerciseRef, Repertoire } from '../repertoire/repertoire';
import type {
  Plan,
  PlannedExercise,
  Session,
  SessionFocus,
  StrengthTarget,
} from './plan';

/** Everything a Plan is generated from (ADR 0004: rules, not a model). */
export interface PlanInput {
  goal: Goal;
  experienceLevel: ExperienceLevel;
  availability: Availability;
  inventory: Inventory;
  repertoire: Repertoire;
  catalogue: readonly Exercise[];
  customExercises: readonly CustomExercise[];
}

const REPS_AND_REST: Record<Goal, Omit<StrengthTarget, 'kind' | 'sets'>> = {
  gainMuscle: { repsMin: 8, repsMax: 12, restSeconds: 90 },
  loseFat: { repsMin: 12, repsMax: 15, restSeconds: 45 },
  recomposition: { repsMin: 10, repsMax: 12, restSeconds: 60 },
};

const SETS: Record<ExperienceLevel, number> = {
  beginner: 2,
  intermediate: 3,
  advanced: 4,
};

const WARM_UP_SECONDS = 5 * 60;
const WORK_SECONDS_PER_SET = 45;
const SETUP_SECONDS_PER_EXERCISE = 60;
const MAX_EXERCISES_PER_SESSION = 8;

/** How a week's Sessions are focused, by number of Training Days (index 0 = 1 day). */
const FOCUS_BY_DAY_COUNT: readonly (readonly SessionFocus[])[] = [
  ['fullBody'],
  ['fullBody', 'fullBody'],
  ['fullBody', 'fullBody', 'fullBody'],
  ['upper', 'lower', 'upper', 'lower'],
  ['push', 'pull', 'legs', 'upper', 'lower'],
  ['push', 'pull', 'legs', 'push', 'pull', 'legs'],
  ['push', 'pull', 'legs', 'push', 'pull', 'legs', 'fullBody'],
];

type Region = 'push' | 'pull' | 'lower' | 'core';

const REGION_OF_MUSCLE: Record<Muscle, Region> = {
  chest: 'push',
  shoulders: 'push',
  triceps: 'push',
  lats: 'pull',
  middleBack: 'pull',
  traps: 'pull',
  biceps: 'pull',
  forearms: 'pull',
  neck: 'pull',
  quadriceps: 'lower',
  hamstrings: 'lower',
  glutes: 'lower',
  calves: 'lower',
  adductors: 'lower',
  abductors: 'lower',
  abdominals: 'core',
  lowerBack: 'core',
};

/** The regions a Session fills in turn, focus first. */
const REGIONS_OF_FOCUS: Record<SessionFocus, readonly Region[]> = {
  fullBody: ['lower', 'push', 'pull', 'core'],
  upper: ['push', 'pull'],
  lower: ['lower', 'core'],
  push: ['push'],
  pull: ['pull'],
  legs: ['lower', 'core'],
};

const ALL_REGIONS: readonly Region[] = ['lower', 'push', 'pull', 'core'];

interface Candidate {
  ref: ExerciseRef;
  region: Region;
}

const sortKey = (ref: ExerciseRef) => `${ref.source}:${ref.id}`;

/** Strength Exercises from the Repertoire that the Inventory allows, in a stable order. */
function candidates(input: PlanInput): Candidate[] {
  const { inventory, repertoire } = input;
  const fromCatalogue = input.catalogue
    .filter(
      (exercise) =>
        exercise.kind === 'strength' &&
        repertoire.catalogue.includes(exercise.id) &&
        allows(inventory, exercise),
    )
    .map((exercise) => ({
      ref: { source: 'catalogue', id: exercise.id } as const,
      exercise,
    }));
  const fromCustom = input.customExercises
    .filter(
      (exercise) =>
        exercise.kind === 'strength' &&
        repertoire.custom.includes(exercise.id) &&
        allowsCustom(inventory, exercise),
    )
    .map((exercise) => ({
      ref: { source: 'custom', id: exercise.id } as const,
      exercise,
    }));

  return [...fromCatalogue, ...fromCustom]
    .flatMap(({ ref, exercise }) => {
      const muscle = exercise.primaryMuscles[0];
      return muscle === undefined
        ? []
        : [{ ref, region: REGION_OF_MUSCLE[muscle] }];
    })
    .sort((a, b) => sortKey(a.ref).localeCompare(sortKey(b.ref)));
}

function targetFor(
  goal: Goal,
  experienceLevel: ExperienceLevel,
): StrengthTarget {
  return {
    kind: 'strength',
    sets: SETS[experienceLevel],
    ...REPS_AND_REST[goal],
  };
}

function secondsPerExercise(target: StrengthTarget): number {
  return (
    target.sets * (WORK_SECONDS_PER_SET + target.restSeconds) +
    SETUP_SECONDS_PER_EXERCISE
  );
}

function exercisesThatFit(
  sessionMinutes: number,
  target: StrengthTarget,
): number {
  const fit = Math.floor(
    (sessionMinutes * 60 - WARM_UP_SECONDS) / secondsPerExercise(target),
  );
  return Math.max(0, Math.min(fit, MAX_EXERCISES_PER_SESSION));
}

/**
 * Picks Exercises for every Session. Each region keeps one cursor across the whole week,
 * so Sessions with the same Focus rotate through the region's Exercises.
 */
class Picker {
  private readonly byRegion: Record<Region, Candidate[]>;
  private readonly cursors: Record<Region, number> = {
    push: 0,
    pull: 0,
    lower: 0,
    core: 0,
  };

  constructor(pool: readonly Candidate[]) {
    this.byRegion = { push: [], pull: [], lower: [], core: [] };
    for (const candidate of pool)
      this.byRegion[candidate.region].push(candidate);
  }

  /** The next Exercise of the first region in `preferred` that still has one unused today. */
  next(
    preferred: readonly Region[],
    usedToday: ReadonlySet<string>,
  ): ExerciseRef | undefined {
    for (const region of preferred) {
      const pool = this.byRegion[region];
      for (let offset = 0; offset < pool.length; offset += 1) {
        const index = (this.cursors[region] + offset) % pool.length;
        const candidate = pool[index];
        if (candidate !== undefined && !usedToday.has(sortKey(candidate.ref))) {
          this.cursors[region] = index + 1;
          return candidate.ref;
        }
      }
    }
    return undefined;
  }
}

/** Turns the Athlete's answers into a Plan. Pure: the same input always gives the same Plan. */
export function generatePlan(input: PlanInput): Plan {
  const { trainingDays, sessionMinutes } = input.availability;
  const target = targetFor(input.goal, input.experienceLevel);
  const slots = exercisesThatFit(sessionMinutes, target);
  const focuses = FOCUS_BY_DAY_COUNT[trainingDays.length - 1] ?? [];
  const picker = new Picker(candidates(input));

  const sessions = trainingDays.map((weekday, dayIndex): Session => {
    const focus = focuses[dayIndex] ?? 'fullBody';
    const regions = REGIONS_OF_FOCUS[focus];
    const used = new Set<string>();
    const exercises: PlannedExercise[] = [];
    for (let slot = 0; slot < slots; slot += 1) {
      const turn = regions[slot % regions.length];
      const preferred =
        turn === undefined ? ALL_REGIONS : [turn, ...regions, ...ALL_REGIONS];
      const ref = picker.next(preferred, used);
      if (ref === undefined) break;
      used.add(sortKey(ref));
      exercises.push({ ref, target });
    }
    return {
      weekday,
      focus,
      exercises,
      estimatedMinutes: Math.ceil(
        (WARM_UP_SECONDS + exercises.length * secondsPerExercise(target)) / 60,
      ),
    };
  });

  return { sessions };
}
