import { useTranslation } from 'react-i18next';
import { useAthlete } from '../athlete/athleteContext';
import { BodyStatsForm } from '../athlete/BodyStatsForm';
import { GoalForm } from '../athlete/GoalForm';
import { TrainingForm } from '../athlete/TrainingForm';

interface ProfilePageProps {
  onBack: () => void;
}

export function ProfilePage({ onBack }: ProfilePageProps) {
  const { t } = useTranslation();
  const { athlete, save } = useAthlete();

  return (
    <section className="page">
      <button type="button" className="button button--quiet" onClick={onBack}>
        {t('common.back')}
      </button>
      <h2>{t('profile.title')}</h2>
      <GoalForm
        stored={athlete}
        submitLabel={t('common.save')}
        confirmSaved
        onSubmit={(choice) => save({ ...athlete, ...choice })}
      />
      <BodyStatsForm
        stored={athlete.bodyStats}
        unitSystem={athlete.unitSystem}
        submitLabel={t('common.save')}
        confirmSaved
        onSubmit={(bodyStats, unitSystem) =>
          save({ ...athlete, bodyStats, unitSystem })
        }
      />
      <TrainingForm
        storedExperienceLevel={athlete.experienceLevel}
        storedAvailability={athlete.availability}
        submitLabel={t('common.save')}
        confirmSaved
        onSubmit={(experienceLevel, availability) =>
          save({ ...athlete, experienceLevel, availability })
        }
      />
    </section>
  );
}
