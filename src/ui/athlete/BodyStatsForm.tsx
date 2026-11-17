import { useId, useState, type SubmitEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SEXES,
  validateBodyStats,
  type BodyStats,
  type BodyStatsField,
} from '../../domain/athlete/bodyStats';
import { UNIT_SYSTEMS, type UnitSystem } from '../../domain/units/unitSystem';
import type { FieldErrors } from '../../domain/validation';
import { todayCalendarDate } from '../dates';
import { ChoiceGroup } from '../form/ChoiceGroup';
import { FormFooter } from '../form/FormFooter';
import { TextField } from '../form/TextField';
import { useSubmitStatus } from '../form/useSubmitStatus';
import { bodyStatsErrorMessage } from './bodyStatsErrors';
import {
  switchUnitSystem,
  toFields,
  toInput,
  type BodyStatsFields,
} from './bodyStatsFields';

interface BodyStatsFormProps {
  stored: BodyStats | undefined;
  unitSystem: UnitSystem;
  submitLabel: string;
  confirmSaved?: boolean;
  onSubmit: (bodyStats: BodyStats, unitSystem: UnitSystem) => Promise<void>;
}

export function BodyStatsForm({
  stored,
  unitSystem,
  submitLabel,
  confirmSaved = false,
  onSubmit,
}: BodyStatsFormProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const [fields, setFields] = useState(() => toFields(stored, unitSystem));
  const [errors, setErrors] = useState<FieldErrors<BodyStatsField>>({});
  const { status, run, reset } = useSubmitStatus();

  const update = (change: Partial<BodyStatsFields>) => {
    setFields((current) => ({ ...current, ...change }));
    reset();
  };

  const changeUnitSystem = (next: UnitSystem) => {
    setFields((current) => switchUnitSystem(current, next, stored));
    reset();
  };

  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = validateBodyStats(
      toInput(fields, stored),
      todayCalendarDate(),
    );
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    await run(() => onSubmit(result.value, fields.unitSystem));
  };

  const errorFor = (field: BodyStatsField) => {
    const error = errors[field];
    return error === undefined
      ? undefined
      : bodyStatsErrorMessage(field, error, fields.unitSystem, t);
  };

  return (
    <form
      className="form"
      aria-labelledby={headingId}
      noValidate
      onSubmit={(event) => {
        void submit(event);
      }}
    >
      <h2 id={headingId}>{t('bodyStats.title')}</h2>
      <p className="form__intro">{t('bodyStats.intro')}</p>

      <ChoiceGroup
        legend={t('units.label')}
        type="radio"
        choices={UNIT_SYSTEMS.map((value) => ({
          value,
          label: t(`units.${value}`),
        }))}
        selected={[fields.unitSystem]}
        onToggle={changeUnitSystem}
      />

      <TextField
        label={t('bodyStats.dateOfBirth')}
        type="date"
        autoComplete="bday"
        max={todayCalendarDate()}
        value={fields.dateOfBirth}
        onChange={(dateOfBirth) => {
          update({ dateOfBirth });
        }}
        error={errorFor('dateOfBirth')}
      />

      <ChoiceGroup
        legend={t('bodyStats.sex')}
        hint={t('bodyStats.sexHint')}
        type="radio"
        choices={SEXES.map((value) => ({
          value,
          label: t(`bodyStats.${value}`),
        }))}
        selected={fields.sex === '' ? [] : [fields.sex]}
        onToggle={(sex) => {
          update({ sex });
        }}
        error={errorFor('sex')}
      />

      {fields.unitSystem === 'metric' ? (
        <TextField
          label={t('bodyStats.heightCm')}
          inputMode="decimal"
          value={fields.heightCm}
          onChange={(heightCm) => {
            update({ heightCm });
          }}
          error={errorFor('heightCm')}
        />
      ) : (
        <fieldset className="field-row">
          <legend className="field__label">{t('bodyStats.height')}</legend>
          <TextField
            label={t('bodyStats.heightFeet')}
            inputMode="numeric"
            value={fields.heightFeet}
            onChange={(heightFeet) => {
              update({ heightFeet });
            }}
            error={errorFor('heightCm')}
          />
          <TextField
            label={t('bodyStats.heightInches')}
            inputMode="numeric"
            value={fields.heightInches}
            onChange={(heightInches) => {
              update({ heightInches });
            }}
          />
        </fieldset>
      )}

      <TextField
        label={t(
          fields.unitSystem === 'metric'
            ? 'bodyStats.weightKg'
            : 'bodyStats.weightLb',
        )}
        inputMode="decimal"
        value={fields.weight}
        onChange={(weight) => {
          update({ weight });
        }}
        error={errorFor('weightKg')}
      />

      <FormFooter
        submitLabel={submitLabel}
        status={status}
        confirmSaved={confirmSaved}
      />
    </form>
  );
}
