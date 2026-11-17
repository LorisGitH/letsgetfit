import { useId, useState, type KeyboardEvent, type SubmitEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { Equipment } from '../../domain/catalogue/equipment';
import {
  checkCustomEquipmentName,
  CUSTOM_EQUIPMENT_NAME_MAX,
  withEquipment,
  type CustomEquipment,
  type Inventory,
} from '../../domain/inventory/inventory';
import type { ValidationError } from '../../domain/validation';
import { ChoiceGroup } from '../form/ChoiceGroup';
import { FormFooter } from '../form/FormFooter';
import { TextField } from '../form/TextField';
import { useSubmitStatus } from '../form/useSubmitStatus';

interface InventoryFormProps {
  stored: Inventory | undefined;
  submitLabel: string;
  confirmSaved?: boolean;
  onSubmit: (inventory: Inventory) => Promise<void>;
}

const STRENGTH_EQUIPMENT: readonly Equipment[] = [
  'dumbbells',
  'kettlebell',
  'resistanceBand',
  'pullUpBar',
  'pushUpBars',
  'dipBars',
  'bench',
  'box',
  'exerciseBall',
  'medicineBall',
  'jumpRope',
];
const CARDIO_EQUIPMENT: readonly Equipment[] = [
  'treadmill',
  'exerciseBike',
  'rowingMachine',
  'elliptical',
  'bicycle',
];

/** A Custom Equipment as edited; `label` keeps its accessible name stable while typing. */
interface CustomRow extends CustomEquipment {
  label: string;
}

const toggle = <Item,>(items: readonly Item[], item: Item): Item[] =>
  items.includes(item)
    ? items.filter((selected) => selected !== item)
    : [...items, item];

export function InventoryForm({
  stored,
  submitLabel,
  confirmSaved = false,
  onSubmit,
}: InventoryFormProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const customHeadingId = useId();
  const [equipment, setEquipment] = useState<readonly Equipment[]>(
    stored?.equipment ?? [],
  );
  const [custom, setCustom] = useState<readonly CustomRow[]>(
    (stored?.customEquipment ?? []).map((item) => ({
      ...item,
      label: item.name,
    })),
  );
  const [newName, setNewName] = useState('');
  const [newNameError, setNewNameError] = useState<
    ValidationError | undefined
  >();
  const [rowErrors, setRowErrors] = useState<
    Partial<Record<string, ValidationError>>
  >({});
  const { status, run, reset } = useSubmitStatus();

  const nameError = (error: ValidationError | undefined) => {
    if (error === undefined) return undefined;
    if (error === 'duplicate') return t('errors.customNameDuplicate');
    if (error === 'tooHigh') {
      return t('errors.customNameTooLong', { max: CUSTOM_EQUIPMENT_NAME_MAX });
    }
    return t('errors.customNameRequired');
  };

  const addCustom = () => {
    const error = checkCustomEquipmentName(newName, custom);
    setNewNameError(error);
    if (error !== undefined) return;
    const name = newName.trim();
    setCustom((rows) => [
      ...rows,
      { id: crypto.randomUUID(), name, label: name },
    ]);
    setNewName('');
    reset();
  };

  const addOnEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addCustom();
    }
  };

  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: Partial<Record<string, ValidationError>> = {};
    for (const row of custom) {
      const error = checkCustomEquipmentName(row.name, custom, row.id);
      if (error !== undefined) errors[row.id] = error;
    }
    setRowErrors(errors);
    if (Object.keys(errors).length > 0) return;
    const inventory = withEquipment(
      {
        equipment: [],
        customEquipment: custom.map(({ id, name }) => ({
          id,
          name: name.trim(),
        })),
      },
      equipment,
    );
    await run(() => onSubmit(inventory));
  };

  const equipmentGroup = (legend: string, items: readonly Equipment[]) => (
    <ChoiceGroup
      legend={legend}
      type="checkbox"
      choices={items.map((value) => ({
        value,
        label: t(`equipment.${value}`),
      }))}
      selected={equipment}
      onToggle={(item) => {
        setEquipment((owned) => toggle(owned, item));
        reset();
      }}
    />
  );

  return (
    <form
      className="form"
      aria-labelledby={headingId}
      noValidate
      onSubmit={(event) => {
        void submit(event);
      }}
    >
      <h2 id={headingId}>{t('inventory.title')}</h2>
      <p className="form__intro">{t('inventory.intro')}</p>

      {equipmentGroup(t('inventory.strength'), STRENGTH_EQUIPMENT)}
      {equipmentGroup(t('inventory.cardio'), CARDIO_EQUIPMENT)}

      <section className="custom-equipment" aria-labelledby={customHeadingId}>
        <h3 id={customHeadingId} className="field__label">
          {t('inventory.custom')}
        </h3>
        <p className="field__hint">{t('inventory.customHint')}</p>
        {custom.length > 0 && (
          <ul className="custom-equipment__list">
            {custom.map((row) => (
              <li key={row.id} className="custom-equipment__row">
                <TextField
                  label={t('inventory.customName', { name: row.label })}
                  value={row.name}
                  maxLength={CUSTOM_EQUIPMENT_NAME_MAX + 10}
                  onChange={(name) => {
                    setCustom((rows) =>
                      rows.map((item) =>
                        item.id === row.id ? { ...item, name } : item,
                      ),
                    );
                    reset();
                  }}
                  error={nameError(rowErrors[row.id])}
                />
                <button
                  type="button"
                  className="button button--quiet"
                  onClick={() => {
                    setCustom((rows) =>
                      rows.filter((item) => item.id !== row.id),
                    );
                    reset();
                  }}
                >
                  {t('inventory.remove', { name: row.label })}
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="custom-equipment__add">
          <TextField
            label={t('inventory.addCustom')}
            value={newName}
            maxLength={CUSTOM_EQUIPMENT_NAME_MAX + 10}
            onChange={(name) => {
              setNewName(name);
              setNewNameError(undefined);
            }}
            onKeyDown={addOnEnter}
            error={nameError(newNameError)}
          />
          <button
            type="button"
            className="button button--quiet"
            onClick={addCustom}
          >
            {t('inventory.add')}
          </button>
        </div>
      </section>

      <FormFooter
        submitLabel={submitLabel}
        status={status}
        confirmSaved={confirmSaved}
      />
    </form>
  );
}
