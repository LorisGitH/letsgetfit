/** Exact by definition: one inch is 2.54 cm. */
const CENTIMETRES_PER_INCH = 2.54;
const INCHES_PER_FOOT = 12;

export function centimetresToInches(centimetres: number): number {
  return centimetres / CENTIMETRES_PER_INCH;
}

/** Whole feet and whole inches, as heights are usually written (e.g. 5 ft 11 in). */
export function toFeetAndInches(centimetres: number): {
  feet: number;
  inches: number;
} {
  const totalInches = Math.round(centimetresToInches(centimetres));
  return {
    feet: Math.floor(totalInches / INCHES_PER_FOOT),
    inches: totalInches % INCHES_PER_FOOT,
  };
}

export function feetAndInchesToCentimetres(
  feet: number,
  inches: number,
): number {
  return (feet * INCHES_PER_FOOT + inches) * CENTIMETRES_PER_INCH;
}
