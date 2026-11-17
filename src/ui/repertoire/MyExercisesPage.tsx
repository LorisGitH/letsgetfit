import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { localized } from '../../domain/catalogue/exercise';
import type { CustomExerciseFields } from '../../domain/repertoire/customExercise';
import {
  EMPTY_REPERTOIRE,
  includes,
  toggled,
  withExercise,
  withoutExercise,
} from '../../domain/repertoire/repertoire';
import { useAthlete } from '../athlete/athleteContext';
import { contentLanguage } from '../catalogue/contentLanguage';
import { useCatalogue } from '../catalogue/useCatalogue';
import { CustomExerciseForm } from './CustomExerciseForm';

/** Creating a new Custom Exercise, or editing the one with this id. */
type Editing = { mode: 'new' } | { mode: 'edit'; id: string };

interface MyExercisesPageProps {
  onBack: () => void;
  onBrowseCatalogue: () => void;
}

/** The Athlete's Repertoire, and the place to create, edit and delete Custom Exercises. */
export function MyExercisesPage({
  onBack,
  onBrowseCatalogue,
}: MyExercisesPageProps) {
  const { t, i18n } = useTranslation();
  const { athlete, save } = useAthlete();
  const catalogue = useCatalogue();
  const [editing, setEditing] = useState<Editing | undefined>();
  const [confirmingDelete, setConfirmingDelete] = useState<
    string | undefined
  >();
  const repertoire = athlete.repertoire ?? EMPTY_REPERTOIRE;
  const customExercises = athlete.customExercises ?? [];
  const language = contentLanguage(i18n.language);

  if (editing !== undefined) {
    const stored =
      editing.mode === 'edit'
        ? customExercises.find((exercise) => exercise.id === editing.id)
        : undefined;
    const submit = async (fields: CustomExerciseFields) => {
      if (stored === undefined) {
        const id = crypto.randomUUID();
        await save({
          ...athlete,
          customExercises: [...customExercises, { id, ...fields }],
          repertoire: withExercise(repertoire, { source: 'custom', id }),
        });
      } else {
        await save({
          ...athlete,
          customExercises: customExercises.map((exercise) =>
            exercise.id === stored.id ? { ...stored, ...fields } : exercise,
          ),
        });
      }
      setEditing(undefined);
    };
    return (
      <section className="page">
        <CustomExerciseForm
          stored={stored}
          existing={customExercises}
          customEquipment={athlete.inventory?.customEquipment ?? []}
          onSubmit={submit}
          onCancel={() => {
            setEditing(undefined);
          }}
        />
      </section>
    );
  }

  const deleteCustom = (id: string) =>
    save({
      ...athlete,
      customExercises: customExercises.filter((exercise) => exercise.id !== id),
      repertoire: withoutExercise(repertoire, { source: 'custom', id }),
    });

  const catalogueEntries =
    catalogue.status === 'ready'
      ? catalogue.catalogue.exercises
          .filter((exercise) => repertoire.catalogue.includes(exercise.id))
          .map((exercise) => ({
            id: exercise.id,
            name: localized(exercise.name, language),
          }))
          .sort((a, b) => a.name.localeCompare(b.name, language))
      : [];

  return (
    <section className="page my-exercises">
      <button type="button" className="button button--quiet" onClick={onBack}>
        {t('common.back')}
      </button>
      <h2>{t('repertoire.myExercises')}</h2>

      <section className="my-exercises__section">
        <h3>{t('repertoire.fromCatalogue')}</h3>
        {catalogue.status === 'loading' && (
          <p role="status">{t('app.loading')}</p>
        )}
        {catalogue.status === 'ready' && catalogueEntries.length === 0 && (
          <p>{t('repertoire.noneFromCatalogue')}</p>
        )}
        <ul className="my-exercises__list">
          {catalogueEntries.map(({ id, name }) => (
            <li key={id} className="my-exercises__row">
              <span>{name}</span>
              <button
                type="button"
                className="button button--quiet"
                onClick={() => {
                  void save({
                    ...athlete,
                    repertoire: withoutExercise(repertoire, {
                      source: 'catalogue',
                      id,
                    }),
                  });
                }}
              >
                {t('repertoire.removeOne', { name })}
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className="button" onClick={onBrowseCatalogue}>
          {t('repertoire.browse')}
        </button>
      </section>

      <section className="my-exercises__section">
        <h3>{t('repertoire.yours')}</h3>
        {customExercises.length === 0 && <p>{t('repertoire.noneYours')}</p>}
        <ul className="my-exercises__list">
          {customExercises.map((exercise) => {
            const ref = { source: 'custom', id: exercise.id } as const;
            return (
              <li key={exercise.id} className="my-exercises__row">
                <span>{exercise.name}</span>
                <label className="choice">
                  <input
                    type="checkbox"
                    checked={includes(repertoire, ref)}
                    onChange={() => {
                      void save({
                        ...athlete,
                        repertoire: toggled(repertoire, ref),
                      });
                    }}
                  />
                  <span className="choice__label">
                    {t('repertoire.inMine')}
                  </span>
                </label>
                <button
                  type="button"
                  className="button button--quiet"
                  onClick={() => {
                    setEditing({ mode: 'edit', id: exercise.id });
                  }}
                >
                  {t('repertoire.edit', { name: exercise.name })}
                </button>
                {confirmingDelete === exercise.id ? (
                  <span className="my-exercises__confirm">
                    <span>
                      {t('repertoire.confirmDelete', { name: exercise.name })}
                    </span>
                    <button
                      type="button"
                      className="button"
                      onClick={() => {
                        void deleteCustom(exercise.id);
                      }}
                    >
                      {t('repertoire.yesDelete', { name: exercise.name })}
                    </button>
                    <button
                      type="button"
                      className="button button--quiet"
                      onClick={() => {
                        setConfirmingDelete(undefined);
                      }}
                    >
                      {t('repertoire.cancel')}
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    className="button button--quiet"
                    onClick={() => {
                      setConfirmingDelete(exercise.id);
                    }}
                  >
                    {t('repertoire.delete', { name: exercise.name })}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          className="button"
          onClick={() => {
            setEditing({ mode: 'new' });
          }}
        >
          {t('repertoire.create')}
        </button>
      </section>
    </section>
  );
}
