import { useTranslation } from 'react-i18next';
import { useAthlete } from '../athlete/athleteContext';

interface HomePageProps {
  onEditProfile: () => void;
  onBrowseCatalogue: () => void;
}

export function HomePage({ onEditProfile, onBrowseCatalogue }: HomePageProps) {
  const { t } = useTranslation();
  const { athlete } = useAthlete();
  const {
    goal,
    focusAreas = [],
    limitations = [],
    availability,
    experienceLevel,
  } = athlete;
  const listOrNone = (items: readonly string[]) =>
    items.length > 0 ? items.join(', ') : t('home.none');

  return (
    <section className="page">
      <h2>{t('home.title')}</h2>
      <p>{t('home.planComing')}</p>
      <dl className="summary">
        {goal && (
          <>
            <dt>{t('home.goal')}</dt>
            <dd>{t(`goal.${goal}`)}</dd>
          </>
        )}
        <dt>{t('home.focusAreas')}</dt>
        <dd>{listOrNone(focusAreas.map((area) => t(`focusAreas.${area}`)))}</dd>
        <dt>{t('home.limitations')}</dt>
        <dd>{listOrNone(limitations.map((joint) => t(`joints.${joint}`)))}</dd>
        {availability && (
          <>
            <dt>{t('home.trainingDays')}</dt>
            <dd>
              {availability.trainingDays
                .map((day) => t(`weekdays.${day}`))
                .join(', ')}
            </dd>
            <dt>{t('home.sessionMinutes')}</dt>
            <dd>
              {t('training.minutes', { minutes: availability.sessionMinutes })}
            </dd>
          </>
        )}
        {experienceLevel && (
          <>
            <dt>{t('home.experienceLevel')}</dt>
            <dd>{t(`training.${experienceLevel}`)}</dd>
          </>
        )}
      </dl>
      <div className="page__actions">
        <button type="button" className="button" onClick={onBrowseCatalogue}>
          {t('home.browseCatalogue')}
        </button>
        <button
          type="button"
          className="button button--quiet"
          onClick={onEditProfile}
        >
          {t('home.editProfile')}
        </button>
      </div>
    </section>
  );
}
