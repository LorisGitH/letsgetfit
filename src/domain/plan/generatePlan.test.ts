import { describe, expect, it } from 'vitest';
import type { Weekday } from '../athlete/availability';
import type { Muscle } from '../body/muscle';
import type { Equipment } from '../catalogue/equipment';
import type { Exercise, ExerciseKind } from '../catalogue/exercise';
import type { CustomExercise } from '../repertoire/customExercise';
import { generatePlan, type PlanInput } from './generatePlan';
import { SESSION_DURATIONS } from '../athlete/availability';

function exercise(
  id: string,
  muscle: Muscle,
  requiredEquipment: Equipment[] = [],
  kind: ExerciseKind = 'strength',
): Exercise {
  return {
    id,
    kind,
    name: { en: id, fr: id },
    instructions: { en: ['Do it.'], fr: ['Faites-le.'] },
    level: 'beginner',
    primaryMuscles: [muscle],
    secondaryMuscles: [],
    strainedJoints: [],
    requiredEquipment,
    optionalEquipment: [],
    images: [],
  };
}

const catalogue: Exercise[] = [
  exercise('squat', 'quadriceps'),
  exercise('lunge', 'quadriceps'),
  exercise('bridge', 'glutes'),
  exercise('pushups', 'chest'),
  exercise('dumbbell-press', 'shoulders', ['dumbbells']),
  exercise('dips', 'triceps', ['dipBars']),
  exercise('pullups', 'lats', ['pullUpBar']),
  exercise('dumbbell-row', 'middleBack', ['dumbbells']),
  exercise('curl', 'biceps', ['dumbbells']),
  exercise('plank', 'abdominals'),
  exercise('crunch', 'abdominals'),
  exercise('rowing-machine', 'quadriceps', ['rowingMachine'], 'cardio'),
  exercise('not-in-repertoire', 'chest'),
];

const trxRow: CustomExercise = {
  id: 'trx-row',
  name: 'TRX row',
  kind: 'strength',
  primaryMuscles: ['middleBack'],
  secondaryMuscles: [],
  strainedJoints: [],
  requiredEquipment: [],
  requiredCustomEquipment: ['trx'],
  notes: '',
};

const input: PlanInput = {
  goal: 'gainMuscle',
  experienceLevel: 'intermediate',
  availability: {
    trainingDays: ['monday', 'wednesday', 'friday'],
    sessionMinutes: 45,
  },
  inventory: {
    equipment: ['dumbbells'],
    customEquipment: [{ id: 'trx', name: 'TRX' }],
  },
  repertoire: {
    catalogue: catalogue
      .map((e) => e.id)
      .filter((id) => id !== 'not-in-repertoire'),
    custom: ['trx-row'],
  },
  catalogue,
  customExercises: [trxRow],
};

const plannedIds = (plan: ReturnType<typeof generatePlan>) =>
  plan.sessions.flatMap((session) =>
    session.exercises.map((planned) => planned.ref.id),
  );

describe('generatePlan', () => {
  it('is deterministic, whatever the order of the inputs', () => {
    const shuffled: PlanInput = {
      ...input,
      catalogue: [...catalogue].reverse(),
      repertoire: {
        ...input.repertoire,
        catalogue: [...input.repertoire.catalogue].reverse(),
      },
    };
    expect(generatePlan(input)).toEqual(generatePlan(input));
    expect(generatePlan(shuffled)).toEqual(generatePlan(input));
  });

  it('has one Session per Training Day, in week order', () => {
    const plan = generatePlan(input);
    expect(plan.sessions.map((session) => session.weekday)).toEqual([
      'monday',
      'wednesday',
      'friday',
    ]);
  });

  it('only uses strength Exercises from the Repertoire that the Inventory allows', () => {
    const ids = new Set(plannedIds(generatePlan(input)));
    for (const excluded of [
      'dips',
      'pullups',
      'rowing-machine',
      'not-in-repertoire',
    ]) {
      expect(ids.has(excluded), excluded).toBe(false);
    }
    expect(ids.has('trx-row')).toBe(true);
  });

  it('leaves out a Custom Exercise whose Custom Equipment is no longer owned', () => {
    const ids = plannedIds(
      generatePlan({
        ...input,
        inventory: { ...input.inventory, customEquipment: [] },
      }),
    );
    expect(ids).not.toContain('trx-row');
  });

  it('never repeats an Exercise within a Session', () => {
    for (const session of generatePlan(input).sessions) {
      const ids = session.exercises.map((planned) => planned.ref.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('fits every Session in its duration, for every Goal, level and length', () => {
    for (const goal of ['gainMuscle', 'loseFat', 'recomposition'] as const) {
      for (const experienceLevel of [
        'beginner',
        'intermediate',
        'advanced',
      ] as const) {
        for (const sessionMinutes of SESSION_DURATIONS) {
          const plan = generatePlan({
            ...input,
            goal,
            experienceLevel,
            availability: { ...input.availability, sessionMinutes },
          });
          for (const session of plan.sessions) {
            expect(session.exercises.length).toBeGreaterThan(0);
            expect(session.estimatedMinutes).toBeLessThanOrEqual(
              sessionMinutes,
            );
          }
        }
      }
    }
  });

  it('fits more Exercises into longer Sessions', () => {
    const count = (sessionMinutes: 30 | 60) =>
      generatePlan({
        ...input,
        availability: { ...input.availability, sessionMinutes },
      }).sessions[0]?.exercises.length ?? 0;
    expect(count(60)).toBeGreaterThan(count(30));
  });

  it('sets Targets by Goal: rep range and rest', () => {
    const target = (goal: PlanInput['goal']) =>
      generatePlan({ ...input, goal }).sessions[0]?.exercises[0]?.target;
    expect(target('gainMuscle')).toMatchObject({
      repsMin: 8,
      repsMax: 12,
      restSeconds: 90,
    });
    expect(target('loseFat')).toMatchObject({
      repsMin: 12,
      repsMax: 15,
      restSeconds: 45,
    });
    expect(target('recomposition')).toMatchObject({
      repsMin: 10,
      repsMax: 12,
      restSeconds: 60,
    });
  });

  it('sets volume by Experience Level', () => {
    const sets = (experienceLevel: PlanInput['experienceLevel']) =>
      generatePlan({ ...input, experienceLevel }).sessions[0]?.exercises[0]
        ?.target.sets;
    expect([sets('beginner'), sets('intermediate'), sets('advanced')]).toEqual([
      2, 3, 4,
    ]);
  });

  it('focuses Sessions by the number of Training Days', () => {
    const focus = (trainingDays: Weekday[]) =>
      generatePlan({
        ...input,
        availability: { ...input.availability, trainingDays },
      }).sessions.map((session) => session.focus);
    expect(focus(['monday', 'thursday'])).toEqual(['fullBody', 'fullBody']);
    expect(focus(['monday', 'tuesday', 'thursday', 'friday'])).toEqual([
      'upper',
      'lower',
      'upper',
      'lower',
    ]);
    expect(
      focus(['monday', 'tuesday', 'wednesday', 'friday', 'saturday']),
    ).toEqual(['push', 'pull', 'legs', 'upper', 'lower']);
  });

  it('trains the Session Focus first', () => {
    const plan = generatePlan({
      ...input,
      availability: {
        trainingDays: ['monday', 'tuesday', 'thursday', 'friday'],
        sessionMinutes: 30,
      },
    });
    const lower = plan.sessions[1];
    expect(lower?.focus).toBe('lower');
    expect(['squat', 'lunge', 'bridge']).toContain(lower?.exercises[0]?.ref.id);
  });

  it('rotates Exercises so Sessions with the same Focus differ', () => {
    const [first, second] = generatePlan({
      ...input,
      availability: {
        trainingDays: ['monday', 'thursday'],
        sessionMinutes: 20,
      },
    }).sessions;
    expect(first?.exercises.map((p) => p.ref.id)).not.toEqual(
      second?.exercises.map((p) => p.ref.id),
    );
  });

  it('gives empty Sessions when nothing in the Repertoire can be done', () => {
    const plan = generatePlan({
      ...input,
      repertoire: { catalogue: ['dips'], custom: [] },
    });
    expect(plan.sessions).toHaveLength(3);
    expect(plannedIds(plan)).toEqual([]);
  });
});
