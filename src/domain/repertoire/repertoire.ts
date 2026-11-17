/** Points at a Catalogue Exercise or one of the Athlete's Custom Exercises. */
export interface ExerciseRef {
  source: 'catalogue' | 'custom';
  id: string;
}

/** The Exercises the Athlete has declared they are comfortable performing, by source. */
export interface Repertoire {
  catalogue: readonly string[];
  custom: readonly string[];
}

export const EMPTY_REPERTOIRE: Repertoire = { catalogue: [], custom: [] };

export function includes(repertoire: Repertoire, ref: ExerciseRef): boolean {
  return repertoire[ref.source].includes(ref.id);
}

export function withExercise(
  repertoire: Repertoire,
  ref: ExerciseRef,
): Repertoire {
  if (includes(repertoire, ref)) return repertoire;
  return { ...repertoire, [ref.source]: [...repertoire[ref.source], ref.id] };
}

export function withoutExercise(
  repertoire: Repertoire,
  ref: ExerciseRef,
): Repertoire {
  return {
    ...repertoire,
    [ref.source]: repertoire[ref.source].filter((id) => id !== ref.id),
  };
}

export function repertoireSize(repertoire: Repertoire): number {
  return repertoire.catalogue.length + repertoire.custom.length;
}

export function toggled(repertoire: Repertoire, ref: ExerciseRef): Repertoire {
  return includes(repertoire, ref)
    ? withoutExercise(repertoire, ref)
    : withExercise(repertoire, ref);
}
