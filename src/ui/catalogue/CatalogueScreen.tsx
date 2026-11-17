import { useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MUSCLES, type Muscle } from '../../domain/body/muscle';
import { EQUIPMENT, type Equipment } from '../../domain/catalogue/equipment';
import { localized } from '../../domain/catalogue/exercise';
import { filterExercises } from '../../domain/catalogue/search';
import { CatalogueCredit } from './CatalogueCredit';
import { contentLanguage, imageUrl } from './contentLanguage';
import { ExerciseDetail } from './ExerciseDetail';
import { useCatalogue } from './useCatalogue';

interface CatalogueScreenProps {
  onBack: () => void;
}

const isMuscle = (value: string): value is Muscle =>
  MUSCLES.some((muscle) => muscle === value);
const isEquipmentFilter = (value: string): value is Equipment | 'none' =>
  value === 'none' || EQUIPMENT.some((item) => item === value);

export function CatalogueScreen({ onBack }: CatalogueScreenProps) {
  const { t, i18n } = useTranslation();
  const state = useCatalogue();
  const ids = {
    search: useId(),
    muscle: useId(),
    equipment: useId(),
    results: useId(),
  };
  const [query, setQuery] = useState('');
  const [muscle, setMuscle] = useState<Muscle | undefined>();
  const [equipment, setEquipment] = useState<Equipment | 'none' | undefined>();
  const [openId, setOpenId] = useState<string | undefined>();
  const language = contentLanguage(i18n.language);

  const exercises = useMemo(
    () =>
      state.status === 'ready'
        ? filterExercises(
            state.catalogue.exercises,
            { query, muscle, equipment },
            language,
          )
        : [],
    [state, query, muscle, equipment, language],
  );

  if (state.status === 'loading')
    return <p role="status">{t('app.loading')}</p>;
  if (state.status === 'failed')
    return <p role="alert">{t('catalogue.loadFailed')}</p>;

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
      <button type="button" className="button button--quiet" onClick={onBack}>
        {t('common.back')}
      </button>
      <h2>{t('catalogue.title')}</h2>

      <div className="catalogue__filters">
        <div className="field">
          <label className="field__label" htmlFor={ids.search}>
            {t('catalogue.search')}
          </label>
          <input
            id={ids.search}
            type="search"
            className="field__input"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
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
            value={muscle ?? ''}
            onChange={(event) => {
              const { value } = event.target;
              setMuscle(isMuscle(value) ? value : undefined);
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
            value={equipment ?? ''}
            onChange={(event) => {
              const { value } = event.target;
              setEquipment(isEquipmentFilter(value) ? value : undefined);
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

      <p role="status" className="catalogue__count">
        {t('catalogue.count', { count: exercises.length })}
      </p>

      <h3 id={ids.results} className="visually-hidden">
        {t('catalogue.results')}
      </h3>
      <ul aria-labelledby={ids.results} className="catalogue__list">
        {exercises.map((exercise) => {
          const thumbnail = exercise.images[0];
          const nameId = `${ids.results}-${exercise.id}`;
          return (
            <li key={exercise.id}>
              <button
                type="button"
                className="exercise-card"
                aria-labelledby={nameId}
                aria-describedby={`${nameId}-muscles`}
                onClick={() => {
                  setOpenId(exercise.id);
                }}
              >
                {thumbnail === undefined ? (
                  <span className="exercise-card__image exercise-card__image--empty" />
                ) : (
                  <img
                    className="exercise-card__image"
                    src={imageUrl(thumbnail)}
                    alt=""
                    width={600}
                    height={400}
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <span id={nameId} className="exercise-card__name">
                  {localized(exercise.name, language)}
                </span>
                <span
                  id={`${nameId}-muscles`}
                  className="exercise-card__muscles"
                >
                  {exercise.kind === 'cardio'
                    ? t('catalogue.cardio')
                    : exercise.primaryMuscles
                        .map((value) => t(`muscles.${value}`))
                        .join(', ')}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {credit}
    </section>
  );
}
