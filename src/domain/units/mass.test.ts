import { describe, expect, it } from 'vitest';
import { kilogramsToPounds, poundsToKilograms } from './mass';

describe('mass conversion', () => {
  it('converts kilograms to pounds', () => {
    expect(kilogramsToPounds(1)).toBeCloseTo(2.20462, 5);
    expect(kilogramsToPounds(80)).toBeCloseTo(176.37, 2);
  });

  it('converts pounds to kilograms', () => {
    expect(poundsToKilograms(1)).toBeCloseTo(0.453592, 6);
    expect(poundsToKilograms(176.37)).toBeCloseTo(80, 2);
  });

  it('round-trips without drift', () => {
    expect(poundsToKilograms(kilogramsToPounds(72.5))).toBeCloseTo(72.5, 10);
  });

  it('keeps zero as zero', () => {
    expect(kilogramsToPounds(0)).toBe(0);
    expect(poundsToKilograms(0)).toBe(0);
  });
});
