import { useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { filterExercises } from '../../domain/catalogue/search';
import type { Inventory } from '../../domain/inventory/inventory';
import {
  includes,
  type ExerciseRef,
  type Repertoire,
} from '../../domain/repertoire/repertoire';
import { CatalogueCredit } from './CatalogueCredit';
import {
  CatalogueFilters,
  type CatalogueFilterState,
} from './CatalogueFilters';
import { contentLanguage } from './contentLanguage';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseDetail } from './ExerciseDetail';
import { useCatalogue } from './useCatalogue';

interface CatalogueScreenProps {
  /** The Athlete's Inventory, for the "only what my equipment allows" filter. */
  inventory: Inventory;
  repertoire: Repertoire;
  onToggleRepertoire: (ref: ExerciseRef) => void;
  /** Shown as a Back button when browsing; absent when picking during onboarding. */
  onBack?: () => void;
  /** Onboarding mode: starts filtered to the Inventory and leaves the heading to the step. */
  picking?: boolean;
}

export function CatalogueScreen({
  inventory,
  repertoire,
  onToggleRepertoire,
  onBack,
  picking = false,
}: CatalogueScreenProps) {
  const { t, i18n } = useTranslation();
  const state = useCatalogue();
  const resultsId = useId();
  const [filters, setFilters] = useState<CatalogueFilterState>({
    query: '',
    muscle: undefined,
    equipment: undefined,
    onlyAllowed: picking,
    onlyMine: false,
  });
  const [openId, setOpenId] = useState<string | undefined>();
  const language = contentLanguage(i18n.language);

  const exercises = useMemo(() => {
    if (state.status !== 'ready') return [];
    const { query, muscle, equipment, onlyAllowed, onlyMine } = filters;
    return filterExercises(
      state.catalogue.exercises,
      {
        query,
        muscle,
        equipment,
        allowedBy: onlyAllowed ? inventory : undefined,
      },
      language,
    ).filter(
      (exercise) => !onlyMine || repertoire.catalogue.includes(exercise.id),
    );
  }, [state, filters, inventory, repertoire, language]);

  if (state.status === 'loading')
    return <p role="status">{t('app.loading')}</p>;
  if (state.status === 'failed')
    return <p role="alert">{t('catalogue.loadFailed')}</p>;

  const toggle = (id: string) => {
    onToggleRepertoire({ source: 'catalogue', id });
  };
  const credit = (
    <CatalogueCredit repository={state.catalogue.source.repository} />
  );
  const open = state.catalogue.exercises.find(
    (exercise) => exercise.id === openId,
  );
  if (open) {
    return (
      <section className="page">
        <ExerciseDetail
          exercise={open}
          inRepertoire={repertoire.catalogue.includes(open.id)}
          onToggleRepertoire={() => {
            toggle(open.id);
          }}
          onBack={() => {
            setOpenId(undefined);
          }}
        />
        {credit}
      </section>
    );
  }

  return (
    <section className="page catalogue">
      {onBack && (
        <button type="button" className="button button--quiet" onClick={onBack}>
          {t('common.back')}
        </button>
      )}
      {!picking && <h2>{t('catalogue.title')}</h2>}

      <CatalogueFilters
        filters={filters}
        onChange={(change) => {
          setFilters((current) => ({ ...current, ...change }));
        }}
      />

      <div role="status" className="catalogue__count">
        <span>{t('catalogue.count', { count: exercises.length })}</span>
        <span>
          {t('repertoire.selected', { count: repertoire.catalogue.length })}
        </span>
      </div>

      <h3 id={resultsId} className="visually-hidden">
        {t('catalogue.results')}
      </h3>
      <ul aria-labelledby={resultsId} className="catalogue__list">
        {exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            language={language}
            inRepertoire={includes(repertoire, {
              source: 'catalogue',
              id: exercise.id,
            })}
            onOpen={() => {
              setOpenId(exercise.id);
            }}
            onToggleRepertoire={() => {
              toggle(exercise.id);
            }}
          />
        ))}
      </ul>
      {credit}
    </section>
  );
}
