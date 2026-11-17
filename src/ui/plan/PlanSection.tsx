import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { localized } from '../../domain/catalogue/exercise';
import { EMPTY_INVENTORY } from '../../domain/inventory/inventory';
import { generatePlan } from '../../domain/plan/generatePlan';
import {
  EMPTY_REPERTOIRE,
  type ExerciseRef,
} from '../../domain/repertoire/repertoire';
import { useAthlete } from '../athlete/athleteContext';
import { contentLanguage } from '../catalogue/contentLanguage';
import { useCatalogue } from '../catalogue/useCatalogue';
import { useSubmitStatus } from '../form/useSubmitStatus';
import { SessionCard } from './SessionCard';

/** The Athlete's Plan on the home screen, and the button that (re)generates it. */
export function PlanSection() {
  const { t, i18n } = useTranslation();
  const { athlete, save } = useAthlete();
  const catalogue = useCatalogue();
  const headingId = useId();
  const { status, run } = useSubmitStatus();
  const { plan, goal, experienceLevel, availability } = athlete;
  const language = contentLanguage(i18n.language);

  const generate = () => {
    if (
      catalogue.status !== 'ready' ||
      !goal ||
      !experienceLevel ||
      !availability
    )
      return;
    const next = generatePlan({
      goal,
      experienceLevel,
      availability,
      inventory: athlete.inventory ?? EMPTY_INVENTORY,
      repertoire: athlete.repertoire ?? EMPTY_REPERTOIRE,
      catalogue: catalogue.catalogue.exercises,
      customExercises: athlete.customExercises ?? [],
    });
    void run(() => save({ ...athlete, plan: next }));
  };

  const nameOf = (ref: ExerciseRef): string | undefined => {
    if (ref.source === 'custom') {
      return athlete.customExercises?.find((exercise) => exercise.id === ref.id)
        ?.name;
    }
    if (catalogue.status !== 'ready') return undefined;
    const exercise = catalogue.catalogue.exercises.find(
      (candidate) => candidate.id === ref.id,
    );
    return exercise && localized(exercise.name, language);
  };

  return (
    <section className="plan" aria-labelledby={headingId}>
      <h2 id={headingId}>{t('plan.title')}</h2>
      {plan === undefined && <p>{t('plan.intro')}</p>}
      {plan && catalogue.status === 'ready' && (
        <div className="plan__sessions">
          {plan.sessions.map((session) => (
            <SessionCard
              key={session.weekday}
              session={session}
              nameOf={nameOf}
            />
          ))}
        </div>
      )}
      {catalogue.status === 'failed' && (
        <p role="alert">{t('catalogue.loadFailed')}</p>
      )}
      <button
        type="button"
        className={plan === undefined ? 'button' : 'button button--quiet'}
        disabled={catalogue.status !== 'ready' || status === 'saving'}
        onClick={generate}
      >
        {t(plan === undefined ? 'plan.generate' : 'plan.regenerate')}
      </button>
      {status === 'failed' && (
        <p role="alert" className="field__error">
          {t('app.saveFailed')}
        </p>
      )}
    </section>
  );
}
