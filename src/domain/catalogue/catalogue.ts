import { EXPERIENCE_LEVELS } from '../athlete/experienceLevel';
import { MUSCLES } from '../body/muscle';
import { EQUIPMENT } from './equipment';
import { EXERCISE_KINDS, type Exercise, type Localized } from './exercise';

/** The built-in Exercises and where they come from (ADR 0003). */
export interface Catalogue {
  source: { repository: string; commit: string };
  exercises: readonly Exercise[];
}

type Json = Record<string, unknown>;

const isRecord = (value: unknown): value is Json =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function fail(path: string, expected: string): never {
  throw new Error(`Invalid Catalogue: ${path} should be ${expected}`);
}

function record(value: unknown, path: string): Json {
  return isRecord(value) ? value : fail(path, 'an object');
}

function text(value: unknown, path: string): string {
  return typeof value === 'string' && value.trim() !== ''
    ? value
    : fail(path, 'non-empty text');
}

function texts(value: unknown, path: string): string[] {
  return Array.isArray(value)
    ? value.map((item, index) => text(item, `${path}[${String(index)}]`))
    : fail(path, 'a list of text');
}

function oneOf<Value extends string>(
  list: readonly Value[],
  value: unknown,
  path: string,
): Value {
  return (
    list.find((item) => item === value) ??
    fail(path, `one of ${list.join(', ')}`)
  );
}

function listOf<Value extends string>(
  list: readonly Value[],
  value: unknown,
  path: string,
): Value[] {
  return Array.isArray(value)
    ? value.map((item, index) => oneOf(list, item, `${path}[${String(index)}]`))
    : fail(path, 'a list');
}

function localizedOf<Content>(
  value: unknown,
  path: string,
  read: (content: unknown, contentPath: string) => Content,
): Localized<Content> {
  const languages = record(value, path);
  const content: Localized<Content> = { en: read(languages.en, `${path}.en`) };
  if (languages.fr !== undefined) content.fr = read(languages.fr, `${path}.fr`);
  return content;
}

function parseExercise(value: unknown, path: string): Exercise {
  const raw = record(value, path);
  return {
    id: text(raw.id, `${path}.id`),
    kind: oneOf(EXERCISE_KINDS, raw.kind, `${path}.kind`),
    name: localizedOf(raw.name, `${path}.name`, text),
    instructions: localizedOf(raw.instructions, `${path}.instructions`, texts),
    level: oneOf(EXPERIENCE_LEVELS, raw.level, `${path}.level`),
    primaryMuscles: listOf(
      MUSCLES,
      raw.primaryMuscles,
      `${path}.primaryMuscles`,
    ),
    secondaryMuscles: listOf(
      MUSCLES,
      raw.secondaryMuscles,
      `${path}.secondaryMuscles`,
    ),
    requiredEquipment: listOf(
      EQUIPMENT,
      raw.requiredEquipment,
      `${path}.requiredEquipment`,
    ),
    optionalEquipment: listOf(
      EQUIPMENT,
      raw.optionalEquipment,
      `${path}.optionalEquipment`,
    ),
    images: texts(raw.images, `${path}.images`),
  };
}

/** Checks the imported Catalogue file's shape, so a bad import fails loudly rather than later. */
export function parseCatalogue(value: unknown): Catalogue {
  const raw = record(value, 'catalogue');
  const source = record(raw.source, 'source');
  const exercises = Array.isArray(raw.exercises)
    ? raw.exercises.map((exercise, index) =>
        parseExercise(exercise, `exercises[${String(index)}]`),
      )
    : fail('exercises', 'a list');
  return {
    source: {
      repository: text(source.repository, 'source.repository'),
      commit: text(source.commit, 'source.commit'),
    },
    exercises,
  };
}

/** Loads the Catalogue on demand, so its data stays out of the app's first download. */
export async function loadCatalogue(): Promise<Catalogue> {
  const data: unknown = (await import('./exercises.json')).default;
  return parseCatalogue(data);
}
