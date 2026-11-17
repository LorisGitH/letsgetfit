import { useId, useState, type SubmitEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SESSION_DURATIONS,
  validateAvailability,
  WEEKDAYS,
  type Availability,
  type AvailabilityField,
  type SessionMinutes,
  type Weekday,
} from '../../domain/athlete/availability';
import {
  EXPERIENCE_LEVELS,
  type ExperienceLevel,
} from '../../domain/athlete/experienceLevel';
import type { FieldErrors } from '../../domain/validation';
import { ChoiceGroup } from '../form/ChoiceGroup';
import { FormFooter } from '../form/FormFooter';
import { useSubmitStatus } from '../form/useSubmitStatus';

interface TrainingFormProps {
  storedExperienceLevel: ExperienceLevel | undefined;
  storedAvailability: Availability | undefined;
  submitLabel: string;
  confirmSaved?: boolean;
  onSubmit: (
    experienceLevel: ExperienceLevel,
    availability: Availability,
  ) => Promise<void>;
}

type TrainingField = AvailabilityField | 'experienceLevel';

export function TrainingForm({
  storedExperienceLevel,
  storedAvailability,
  submitLabel,
  confirmSaved = false,
  onSubmit,
}: TrainingFormProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const [experienceLevel, setExperienceLevel] = useState(storedExperienceLevel);
  const [trainingDays, setTrainingDays] = useState<readonly Weekday[]>(
    storedAvailability?.trainingDays ?? [],
  );
  const [sessionMinutes, setSessionMinutes] = useState<
    SessionMinutes | undefined
  >(storedAvailability?.sessionMinutes);
  const [errors, setErrors] = useState<FieldErrors<TrainingField>>({});
  const { status, run, reset } = useSubmitStatus();

  const toggleDay = (day: Weekday) => {
    setTrainingDays((days) =>
      days.includes(day)
        ? days.filter((selected) => selected !== day)
        : [...days, day],
    );
    reset();
  };

  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const availability = validateAvailability({ trainingDays, sessionMinutes });
    const nextErrors: FieldErrors<TrainingField> = availability.ok
      ? {}
      : { ...availability.errors };
    if (experienceLevel === undefined) nextErrors.experienceLevel = 'required';
    setErrors(nextErrors);
    if (!availability.ok || experienceLevel === undefined) return;
    await run(() => onSubmit(experienceLevel, availability.value));
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
      <h2 id={headingId}>{t('training.title')}</h2>

      <ChoiceGroup
        legend={t('training.experienceLevel')}
        type="radio"
        choices={EXPERIENCE_LEVELS.map((value) => ({
          value,
          label: t(`training.${value}`),
          hint: t(`training.${value}Hint`),
        }))}
        selected={experienceLevel === undefined ? [] : [experienceLevel]}
        onToggle={(level) => {
          setExperienceLevel(level);
          reset();
        }}
        error={errors.experienceLevel && t('errors.chooseOne')}
      />

      <ChoiceGroup
        legend={t('training.trainingDays')}
        type="checkbox"
        choices={WEEKDAYS.map((value) => ({
          value,
          label: t(`weekdays.${value}`),
        }))}
        selected={trainingDays}
        onToggle={toggleDay}
        error={errors.trainingDays && t('errors.trainingDays')}
      />

      <ChoiceGroup
        legend={t('training.sessionMinutes')}
        type="radio"
        choices={SESSION_DURATIONS.map((minutes) => ({
          value: minutes,
          label: t('training.minutes', { minutes }),
        }))}
        selected={sessionMinutes === undefined ? [] : [sessionMinutes]}
        onToggle={(minutes) => {
          setSessionMinutes(minutes);
          reset();
        }}
        error={errors.sessionMinutes && t('errors.chooseOne')}
      />

      <FormFooter
        submitLabel={submitLabel}
        status={status}
        confirmSaved={confirmSaved}
      />
    </form>
  );
}
