import type {
  BodyStats,
  BodyStatsInput,
  Sex,
} from '../../domain/athlete/bodyStats';
import {
  feetAndInchesToCentimetres,
  toFeetAndInches,
} from '../../domain/units/length';
import { kilogramsToPounds, poundsToKilograms } from '../../domain/units/mass';
import type { UnitSystem } from '../../domain/units/unitSystem';

/** The Body Stats form as typed, in the unit system the Athlete is entering. */
export interface BodyStatsFields {
  unitSystem: UnitSystem;
  dateOfBirth: string;
  sex: Sex | '';
  heightCm: string;
  heightFeet: string;
  heightInches: string;
  /** In kilograms (metric) or pounds (imperial). */
  weight: string;
}

/** Reads a number typed with a dot or a comma; `undefined` when empty, `NaN` when unreadable. */
export function parseDecimal(text: string): number | undefined {
  const trimmed = text.trim();
  return trimmed === '' ? undefined : Number(trimmed.replace(',', '.'));
}

const oneDecimal = (value: number) => String(Math.round(value * 10) / 10);

type HeightFields = Pick<
  BodyStatsFields,
  'heightCm' | 'heightFeet' | 'heightInches'
>;

function heightFields(
  heightCm: number | undefined,
  unitSystem: UnitSystem,
): HeightFields {
  if (heightCm === undefined || !Number.isFinite(heightCm)) {
    return { heightCm: '', heightFeet: '', heightInches: '' };
  }
  if (unitSystem === 'metric') {
    return { heightCm: oneDecimal(heightCm), heightFeet: '', heightInches: '' };
  }
  const { feet, inches } = toFeetAndInches(heightCm);
  return {
    heightCm: '',
    heightFeet: String(feet),
    heightInches: String(inches),
  };
}

function weightField(
  weightKg: number | undefined,
  unitSystem: UnitSystem,
): string {
  if (weightKg === undefined || !Number.isFinite(weightKg)) return '';
  return oneDecimal(
    unitSystem === 'metric' ? weightKg : kilogramsToPounds(weightKg),
  );
}

function readHeightCm(fields: BodyStatsFields): number | undefined {
  if (fields.unitSystem === 'metric') return parseDecimal(fields.heightCm);
  const feet = parseDecimal(fields.heightFeet);
  const inches = parseDecimal(fields.heightInches);
  if (feet === undefined && inches === undefined) return undefined;
  return feetAndInchesToCentimetres(feet ?? 0, inches ?? 0);
}

function readWeightKg(fields: BodyStatsFields): number | undefined {
  const weight = parseDecimal(fields.weight);
  if (weight === undefined || fields.unitSystem === 'metric') return weight;
  return poundsToKilograms(weight);
}

const sameHeight = (a: HeightFields, b: HeightFields) =>
  a.heightCm === b.heightCm &&
  a.heightFeet === b.heightFeet &&
  a.heightInches === b.heightInches;

export function toFields(
  stats: BodyStats | undefined,
  unitSystem: UnitSystem,
): BodyStatsFields {
  return {
    unitSystem,
    dateOfBirth: stats?.dateOfBirth ?? '',
    sex: stats?.sex ?? '',
    ...heightFields(stats?.heightCm, unitSystem),
    weight: weightField(stats?.weightKg, unitSystem),
  };
}

/**
 * Converts the fields to metric for validation. A field still showing the stored value keeps
 * that exact value, so saving without edits never drifts through unit rounding.
 */
export function toInput(
  fields: BodyStatsFields,
  stored: BodyStats | undefined,
): BodyStatsInput {
  const typed: BodyStatsInput = {
    dateOfBirth: fields.dateOfBirth,
    sex: fields.sex === '' ? undefined : fields.sex,
    heightCm: readHeightCm(fields),
    weightKg: readWeightKg(fields),
  };
  if (stored === undefined) return typed;

  const shown = toFields(stored, fields.unitSystem);
  return {
    ...typed,
    heightCm: sameHeight(fields, shown) ? stored.heightCm : typed.heightCm,
    weightKg: fields.weight === shown.weight ? stored.weightKg : typed.weightKg,
  };
}

/** Re-expresses what has been typed in another unit system; unreadable entries are cleared. */
export function switchUnitSystem(
  fields: BodyStatsFields,
  unitSystem: UnitSystem,
  stored: BodyStats | undefined,
): BodyStatsFields {
  const { heightCm, weightKg } = toInput(fields, stored);
  return {
    ...fields,
    unitSystem,
    ...heightFields(heightCm, unitSystem),
    weight: weightField(weightKg, unitSystem),
  };
}
