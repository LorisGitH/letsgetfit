export type ValidationError =
  'required' | 'invalid' | 'tooLow' | 'tooHigh' | 'duplicate';

export type FieldErrors<Field extends string> = Partial<
  Record<Field, ValidationError>
>;

export type Validation<Value, Field extends string> =
  { ok: true; value: Value } | { ok: false; errors: FieldErrors<Field> };

export interface Range {
  min: number;
  max: number;
}

export function checkRange(
  value: number | undefined,
  range: Range,
): ValidationError | undefined {
  if (value === undefined) return 'required';
  if (!Number.isFinite(value)) return 'invalid';
  if (value < range.min) return 'tooLow';
  if (value > range.max) return 'tooHigh';
  return undefined;
}

export function checkPresent(value: unknown): ValidationError | undefined {
  return value === undefined ? 'required' : undefined;
}

/** Keeps only the fields whose check reported an error. */
export function fieldErrors<Field extends string>(
  checks: Record<Field, ValidationError | undefined>,
): FieldErrors<Field> {
  const errors: FieldErrors<Field> = {};
  for (const field of Object.keys(checks) as Field[]) {
    const error = checks[field];
    if (error !== undefined) errors[field] = error;
  }
  return errors;
}

export function hasErrors(errors: FieldErrors<string>): boolean {
  return Object.keys(errors).length > 0;
}
