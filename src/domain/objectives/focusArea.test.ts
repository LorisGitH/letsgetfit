import { describe, expect, it } from 'vitest';
import { FOCUS_AREAS, musclesFor } from './focusArea';

describe('Focus Areas', () => {
  it('map every Focus Area to at least one Muscle', () => {
    for (const area of FOCUS_AREAS) {
      expect(musclesFor([area]).length).toBeGreaterThan(0);
    }
  });

  it('combine the Muscles of several Focus Areas without duplicates', () => {
    expect(musclesFor(['bellyAndWaist', 'back'])).toEqual([
      'abdominals',
      'lats',
      'middleBack',
      'lowerBack',
      'traps',
    ]);
  });

  it('give no Muscles when there is no Focus Area', () => {
    expect(musclesFor([])).toEqual([]);
  });
});
