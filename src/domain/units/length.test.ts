import { describe, expect, it } from 'vitest';
import {
  centimetresToInches,
  feetAndInchesToCentimetres,
  toFeetAndInches,
} from './length';

describe('length conversion', () => {
  it('converts centimetres to inches', () => {
    expect(centimetresToInches(2.54)).toBeCloseTo(1, 10);
    expect(centimetresToInches(180)).toBeCloseTo(70.866, 3);
  });

  it('splits centimetres into whole feet and rounded inches', () => {
    expect(toFeetAndInches(180)).toEqual({ feet: 5, inches: 11 });
    expect(toFeetAndInches(152.4)).toEqual({ feet: 5, inches: 0 });
  });

  it('carries rounded-up inches into the next foot', () => {
    // 182.6 cm is 71.89 in, which rounds to 72 in: 6 ft 0 in, never 5 ft 12 in.
    expect(toFeetAndInches(182.6)).toEqual({ feet: 6, inches: 0 });
  });

  it('converts feet and inches back to centimetres', () => {
    expect(feetAndInchesToCentimetres(5, 11)).toBeCloseTo(180.34, 2);
    expect(feetAndInchesToCentimetres(6, 0)).toBeCloseTo(182.88, 2);
  });
});
