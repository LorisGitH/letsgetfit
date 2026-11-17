import { useId, useState, type SubmitEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { JOINTS, type Joint } from '../../domain/body/joint';
import { MUSCLES, type Muscle } from '../../domain/body/muscle';
import { EQUIPMENT, type Equipment } from '../../domain/catalogue/equipment';
import {
  EXERCISE_KINDS,
  type ExerciseKind,
} from '../../domain/catalogue/exercise';
import type { CustomEquipment } from '../../domain/inventory/inventory';
import {
  CUSTOM_EXERCISE_NAME_MAX,
  CUSTOM_EXERCISE_NOTES_MAX,
  validateCustomExercise,
  type CustomExercise,
  type CustomExerciseField,
  type CustomExerciseFields,
} from '../../domain/repertoire/customExercise';
import type { FieldErrors } from '../../domain/validation';
import { ChoiceGroup } from '../form/ChoiceGroup';
import { FormFooter } from '../form/FormFooter';
import { TextAreaField } from '../form/TextAreaField';
import { TextField } from '../form/TextField';
import { useSubmitStatus } from '../form/useSubmitStatus';

interface CustomExerciseFormProps {
  /** The exercise being edited, or `undefined` to create one. */
  stored: CustomExercise | undefined;
  existing: readonly CustomExercise[];
  customEquipment: readonly CustomEquipment[];
  onSubmit: (fields: CustomExerciseFields) => Promise<void>;
  onCancel: () => void;
}

/** Catalogue Equipment and Custom Equipment share one list, told apart by a prefix. */
type EquipmentChoice = `equipment:${Equipment}` | `custom:${string}`;

const toggle = <Item,>(items: readonly Item[], item: Item): Item[] =>
  items.includes(item)
    ? items.filter((selected) => selected !== item)
    : [...items, item];

export function CustomExerciseForm({
  stored,
  existing,
  customEquipment,
  onSubmit,
  onCancel,
}: CustomExerciseFormProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const [name, setName] = useState(stored?.name ?? '');
  const [kind, setKind] = useState<ExerciseKind | undefined>(stored?.kind);
  const [primaryMuscles, setPrimaryMuscles] = useState<readonly Muscle[]>(
    stored?.primaryMuscles ?? [],
  );
  const [secondaryMuscles, setSecondaryMuscles] = useState<readonly Muscle[]>(
    stored?.secondaryMuscles ?? [],
  );
  const [strainedJoints, setStrainedJoints] = useState<readonly Joint[]>(
    stored?.strainedJoints ?? [],
  );
  const [equipment, setEquipment] = useState<readonly EquipmentChoice[]>([
    ...(stored?.requiredEquipment ?? []).map(
      (item) => `equipment:${item}` as const,
    ),
    ...(stored?.requiredCustomEquipment ?? []).map(
      (id) => `custom:${id}` as const,
    ),
  ]);
  const [notes, setNotes] = useState(stored?.notes ?? '');
  const [errors, setErrors] = useState<FieldErrors<CustomExerciseField>>({});
  const { status, run } = useSubmitStatus();

  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = validateCustomExercise(
      {
        name,
        kind,
        primaryMuscles,
        secondaryMuscles,
        strainedJoints,
        requiredEquipment: EQUIPMENT.filter((item) =>
          equipment.includes(`equipment:${item}`),
        ),
        requiredCustomEquipment: customEquipment
          .filter((item) => equipment.includes(`custom:${item.id}`))
          .map((item) => item.id),
        notes,
      },
      existing,
      stored?.id,
    );
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    await run(() => onSubmit(result.value));
  };

  const nameError = () => {
    if (errors.name === undefined) return undefined;
    if (errors.name === 'duplicate') return t('errors.exerciseNameDuplicate');
    if (errors.name === 'tooHigh') {
      return t('errors.nameTooLong', { max: CUSTOM_EXERCISE_NAME_MAX });
    }
    return t('errors.required');
  };

  const muscleChoices = MUSCLES.map((value) => ({
    value,
    label: t(`muscles.${value}`),
  }));

  return (
    <form
      className="form"
      aria-labelledby={headingId}
      noValidate
      onSubmit={(event) => {
        void submit(event);
      }}
    >
      <h2 id={headingId}>
        {t(
          stored === undefined
            ? 'customExercise.newTitle'
            : 'customExercise.editTitle',
        )}
      </h2>

      <TextField
        label={t('customExercise.name')}
        value={name}
        maxLength={CUSTOM_EXERCISE_NAME_MAX + 10}
        onChange={setName}
        error={nameError()}
      />

      <ChoiceGroup
        legend={t('customExercise.kind')}
        type="radio"
        choices={EXERCISE_KINDS.map((value) => ({
          value,
          label: t(`customExercise.${value}`),
        }))}
        selected={kind === undefined ? [] : [kind]}
        onToggle={setKind}
        error={errors.kind && t('errors.chooseOne')}
      />

      <ChoiceGroup
        legend={t('customExercise.primaryMuscles')}
        type="checkbox"
        choices={muscleChoices}
        selected={primaryMuscles}
        onToggle={(muscle) => {
          setPrimaryMuscles((muscles) => toggle(muscles, muscle));
        }}
        error={errors.primaryMuscles && t('errors.pickMuscle')}
      />

      <ChoiceGroup
        legend={t('customExercise.secondaryMuscles')}
        type="checkbox"
        choices={muscleChoices}
        selected={secondaryMuscles}
        onToggle={(muscle) => {
          setSecondaryMuscles((muscles) => toggle(muscles, muscle));
        }}
      />

      <ChoiceGroup
        legend={t('customExercise.strainedJoints')}
        hint={t('customExercise.strainedJointsHint')}
        type="checkbox"
        choices={JOINTS.map((value) => ({
          value,
          label: t(`joints.${value}`),
        }))}
        selected={strainedJoints}
        onToggle={(joint) => {
          setStrainedJoints((joints) => toggle(joints, joint));
        }}
      />

      <ChoiceGroup<EquipmentChoice>
        legend={t('customExercise.equipment')}
        type="checkbox"
        choices={[
          ...EQUIPMENT.map((item) => ({
            value: `equipment:${item}` as const,
            label: t(`equipment.${item}`),
          })),
          ...customEquipment.map((item) => ({
            value: `custom:${item.id}` as const,
            label: item.name,
          })),
        ]}
        selected={equipment}
        onToggle={(choice) => {
          setEquipment((choices) => toggle(choices, choice));
        }}
      />

      <TextAreaField
        label={t('customExercise.notes')}
        value={notes}
        rows={4}
        maxLength={CUSTOM_EXERCISE_NOTES_MAX + 50}
        onChange={setNotes}
        error={
          errors.notes &&
          t('errors.notesTooLong', { max: CUSTOM_EXERCISE_NOTES_MAX })
        }
      />

      <div className="page__actions">
        <FormFooter submitLabel={t('common.save')} status={status} />
        <button
          type="button"
          className="button button--quiet"
          onClick={onCancel}
        >
          {t('repertoire.cancel')}
        </button>
      </div>
    </form>
  );
}
