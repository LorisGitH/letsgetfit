import type { TFunction } from 'i18next';
import {
  BODY_STATS_LIMITS,
  type BodyStatsField,
} from '../../domain/athlete/bodyStats';
import { toFeetAndInches } from '../../domain/units/length';
import { kilogramsToPounds } from '../../domain/units/mass';
import type { UnitSystem } from '../../domain/units/unitSystem';
import type { ValidationError } from '../../domain/validation';

function formatHeight(
  heightCm: number,
  unitSystem: UnitSystem,
  t: TFunction,
): string {
  if (unitSystem === 'metric') return t('units.cm', { value: heightCm });
  return t('units.feetInches', toFeetAndInches(heightCm));
}

function formatWeight(
  weightKg: number,
  unitSystem: UnitSystem,
  t: TFunction,
): string {
  if (unitSystem === 'metric') return t('units.kg', { value: weightKg });
  return t('units.lb', { value: Math.round(kilogramsToPounds(weightKg)) });
}

/** The message shown under a Body Stats field, with limits in the Athlete's units. */
export function bodyStatsErrorMessage(
  field: BodyStatsField,
  error: ValidationError,
  unitSystem: UnitSystem,
  t: TFunction,
): string {
  if (error === 'required')
    return t(field === 'sex' ? 'errors.chooseOne' : 'errors.required');

  switch (field) {
    case 'dateOfBirth': {
      const { min, max } = BODY_STATS_LIMITS.ageYears;
      if (error === 'tooLow') return t('errors.dateOfBirthTooLow', { min });
      if (error === 'tooHigh') return t('errors.dateOfBirthTooHigh', { max });
      return t('errors.dateOfBirthInvalid');
    }
    case 'heightCm': {
      if (error === 'invalid') return t('errors.number');
      const { min, max } = BODY_STATS_LIMITS.heightCm;
      return t('errors.heightRange', {
        min: formatHeight(min, unitSystem, t),
        max: formatHeight(max, unitSystem, t),
      });
    }
    case 'weightKg': {
      if (error === 'invalid') return t('errors.number');
      const { min, max } = BODY_STATS_LIMITS.weightKg;
      return t('errors.weightRange', {
        min: formatWeight(min, unitSystem, t),
        max: formatWeight(max, unitSystem, t),
      });
    }
    case 'sex':
      return t('errors.chooseOne');
  }
}
