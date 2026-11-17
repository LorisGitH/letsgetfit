import { describe, expect, it } from 'vitest';
import {
  EMPTY_REPERTOIRE,
  includes,
  toggled,
  repertoireSize,
  withExercise,
  withoutExercise,
} from './repertoire';

describe('Repertoire', () => {
  it('adds and removes Catalogue and Custom Exercises', () => {
    const repertoire = withExercise(
      withExercise(EMPTY_REPERTOIRE, { source: 'catalogue', id: 'pushups' }),
      { source: 'custom', id: 'trx-row' },
    );
    expect(includes(repertoire, { source: 'catalogue', id: 'pushups' })).toBe(
      true,
    );
    expect(includes(repertoire, { source: 'custom', id: 'pushups' })).toBe(
      false,
    );
    expect(repertoireSize(repertoire)).toBe(2);

    const removed = withoutExercise(repertoire, {
      source: 'catalogue',
      id: 'pushups',
    });
    expect(includes(removed, { source: 'catalogue', id: 'pushups' })).toBe(
      false,
    );
    expect(repertoireSize(removed)).toBe(1);
  });

  it('never holds the same Exercise twice', () => {
    const ref = { source: 'catalogue', id: 'pushups' } as const;
    expect(
      repertoireSize(withExercise(withExercise(EMPTY_REPERTOIRE, ref), ref)),
    ).toBe(1);
  });

  it('toggles an Exercise in and out', () => {
    const ref = { source: 'custom', id: 'trx-row' } as const;
    const added = toggled(EMPTY_REPERTOIRE, ref);
    expect(includes(added, ref)).toBe(true);
    expect(includes(toggled(added, ref), ref)).toBe(false);
  });
});
