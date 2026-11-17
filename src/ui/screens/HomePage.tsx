import { useTranslation } from 'react-i18next';
import { useAthlete } from '../athlete/athleteContext';

interface HomePageProps {
  onEditProfile: () => void;
}

export function HomePage({ onEditProfile }: HomePageProps) {
  const { t } = useTranslation();
  const { athlete } = useAthlete();
  const { availability, experienceLevel } = athlete;

  return (
    <section className="page">
      <h2>{t('home.title')}</h2>
      <p>{t('home.planComing')}</p>
      {availability && experienceLevel && (
        <dl className="summary">
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
          <dt>{t('home.experienceLevel')}</dt>
          <dd>{t(`training.${experienceLevel}`)}</dd>
        </dl>
      )}
      <button type="button" className="button" onClick={onEditProfile}>
        {t('home.editProfile')}
      </button>
    </section>
  );
}
