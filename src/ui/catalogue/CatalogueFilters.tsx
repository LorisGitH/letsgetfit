import { useId, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { MUSCLES, type Muscle } from '../../domain/body/muscle';
import { EQUIPMENT, type Equipment } from '../../domain/catalogue/equipment';

export interface CatalogueFilterState {
  query: string;
  muscle: Muscle | undefined;
  equipment: Equipment | 'none' | undefined;
  onlyAllowed: boolean;
  onlyMine: boolean;
}

interface CatalogueFiltersProps {
  filters: CatalogueFilterState;
  onChange: (change: Partial<CatalogueFilterState>) => void;
}

const isMuscle = (value: string): value is Muscle =>
  MUSCLES.some((muscle) => muscle === value);
const isEquipmentFilter = (value: string): value is Equipment | 'none' =>
  value === 'none' || EQUIPMENT.some((item) => item === value);

function Toggle({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="choice">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => {
          onChange(event.target.checked);
        }}
      />
      <span className="choice__label">{children}</span>
    </label>
  );
}

export function CatalogueFilters({ filters, onChange }: CatalogueFiltersProps) {
  const { t } = useTranslation();
  const ids = { search: useId(), muscle: useId(), equipment: useId() };

  return (
    <div className="catalogue__filters">
      <div className="catalogue__fields">
        <div className="field">
          <label className="field__label" htmlFor={ids.search}>
            {t('catalogue.search')}
          </label>
          <input
            id={ids.search}
            type="search"
            className="field__input"
            value={filters.query}
            onChange={(event) => {
              onChange({ query: event.target.value });
            }}
          />
        </div>
        <div className="field">
          <label className="field__label" htmlFor={ids.muscle}>
            {t('catalogue.muscle')}
          </label>
          <select
            id={ids.muscle}
            className="field__input"
            value={filters.muscle ?? ''}
            onChange={(event) => {
              const { value } = event.target;
              onChange({ muscle: isMuscle(value) ? value : undefined });
            }}
          >
            <option value="">{t('catalogue.allMuscles')}</option>
            {MUSCLES.map((value) => (
              <option key={value} value={value}>
                {t(`muscles.${value}`)}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="field__label" htmlFor={ids.equipment}>
            {t('catalogue.equipment')}
          </label>
          <select
            id={ids.equipment}
            className="field__input"
            value={filters.equipment ?? ''}
            onChange={(event) => {
              const { value } = event.target;
              onChange({
                equipment: isEquipmentFilter(value) ? value : undefined,
              });
            }}
          >
            <option value="">{t('catalogue.allEquipment')}</option>
            <option value="none">{t('catalogue.noEquipment')}</option>
            {EQUIPMENT.map((value) => (
              <option key={value} value={value}>
                {t(`equipment.${value}`)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="catalogue__toggles">
        <Toggle
          checked={filters.onlyAllowed}
          onChange={(onlyAllowed) => {
            onChange({ onlyAllowed });
          }}
        >
          {t('catalogue.onlyAllowed')}
        </Toggle>
        <Toggle
          checked={filters.onlyMine}
          onChange={(onlyMine) => {
            onChange({ onlyMine });
          }}
        >
          {t('repertoire.onlyMine')}
        </Toggle>
      </div>
    </div>
  );
}
