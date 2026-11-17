import { useId, useState, type SubmitEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { JOINTS, type Joint } from '../../domain/body/joint';
import { FOCUS_AREAS, type FocusArea } from '../../domain/objectives/focusArea';
import { GOALS, type Goal } from '../../domain/objectives/goal';
import {
  validateGoalChoice,
  type GoalChoice,
  type GoalChoiceField,
} from '../../domain/objectives/goalChoice';
import type { FieldErrors } from '../../domain/validation';
import { ChoiceGroup } from '../form/ChoiceGroup';
import { FormFooter } from '../form/FormFooter';
import { useSubmitStatus } from '../form/useSubmitStatus';

interface GoalFormProps {
  stored: Partial<GoalChoice>;
  submitLabel: string;
  confirmSaved?: boolean;
  onSubmit: (choice: GoalChoice) => Promise<void>;
}

const toggle = <Item,>(items: readonly Item[], item: Item): Item[] =>
  items.includes(item)
    ? items.filter((selected) => selected !== item)
    : [...items, item];

export function GoalForm({
  stored,
  submitLabel,
  confirmSaved = false,
  onSubmit,
}: GoalFormProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const [goal, setGoal] = useState<Goal | undefined>(stored.goal);
  const [focusAreas, setFocusAreas] = useState<readonly FocusArea[]>(
    stored.focusAreas ?? [],
  );
  const [limitations, setLimitations] = useState<readonly Joint[]>(
    stored.limitations ?? [],
  );
  const [errors, setErrors] = useState<FieldErrors<GoalChoiceField>>({});
  const { status, run, reset } = useSubmitStatus();

  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = validateGoalChoice({ goal, focusAreas, limitations });
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    await run(() => onSubmit(result.value));
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
      <h2 id={headingId}>{t('goal.title')}</h2>

      <ChoiceGroup
        legend={t('goal.goal')}
        type="radio"
        choices={GOALS.map((value) => ({
          value,
          label: t(`goal.${value}`),
          hint: t(`goal.${value}Hint`),
        }))}
        selected={goal === undefined ? [] : [goal]}
        onToggle={(value) => {
          setGoal(value);
          reset();
        }}
        error={errors.goal && t('errors.chooseOne')}
      />

      <ChoiceGroup
        legend={t('goal.focusAreas')}
        hint={t('goal.focusAreasNote')}
        type="checkbox"
        choices={FOCUS_AREAS.map((value) => ({
          value,
          label: t(`focusAreas.${value}`),
        }))}
        selected={focusAreas}
        onToggle={(area) => {
          setFocusAreas((areas) => toggle(areas, area));
          reset();
        }}
      />

      <ChoiceGroup
        legend={t('goal.limitations')}
        hint={t('goal.limitationsHint')}
        type="checkbox"
        choices={JOINTS.map((value) => ({
          value,
          label: t(`joints.${value}`),
        }))}
        selected={limitations}
        onToggle={(joint) => {
          setLimitations((joints) => toggle(joints, joint));
          reset();
        }}
      />

      <FormFooter
        submitLabel={submitLabel}
        status={status}
        confirmSaved={confirmSaved}
      />
    </form>
  );
}
