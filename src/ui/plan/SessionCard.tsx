import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { Session } from '../../domain/plan/plan';
import type { ExerciseRef } from '../../domain/repertoire/repertoire';

interface SessionCardProps {
  session: Session;
  /** The Exercise's name in the interface language, or `undefined` if it no longer exists. */
  nameOf: (ref: ExerciseRef) => string | undefined;
}

export function SessionCard({ session, nameOf }: SessionCardProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const focus = t(`plan.focus.${session.focus}`);

  return (
    <article className="session-card" aria-labelledby={headingId}>
      <h3 id={headingId} className="session-card__title">
        {t('plan.session', {
          weekday: t(`weekdays.${session.weekday}`),
          focus,
        })}
      </h3>
      <p className="session-card__summary">
        {t('plan.summary', { focus, minutes: session.estimatedMinutes })}
      </p>
      {session.exercises.length === 0 ? (
        <p className="session-card__empty">{t('plan.emptySession')}</p>
      ) : (
        <ol className="session-card__exercises">
          {session.exercises.map(({ ref, target }) => (
            <li
              key={`${ref.source}:${ref.id}`}
              className="session-card__exercise"
            >
              <span className="session-card__name">
                {nameOf(ref) ?? t('plan.removedExercise')}
              </span>
              <span className="session-card__target">
                {t('plan.target', {
                  sets: target.sets,
                  repsMin: target.repsMin,
                  repsMax: target.repsMax,
                  rest: target.restSeconds,
                })}
              </span>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}
