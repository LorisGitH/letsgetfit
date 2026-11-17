import { useTranslation } from 'react-i18next';
import { onboardingStep } from '../../domain/athlete/athlete';
import { useAthlete } from '../athlete/athleteContext';
import { BodyStatsForm } from '../athlete/BodyStatsForm';
import { GoalForm } from '../athlete/GoalForm';
import { InventoryForm } from '../athlete/InventoryForm';
import { TrainingForm } from '../athlete/TrainingForm';
import { DisclaimerStep } from './DisclaimerStep';

const STEPS = [
  'disclaimer',
  'goal',
  'bodyStats',
  'training',
  'equipment',
] as const;

/** First-run flow: each step is saved as soon as it is done, so closing the app loses nothing. */
export function Onboarding() {
  const { t } = useTranslation();
  const { athlete, save } = useAthlete();
  const step = onboardingStep(athlete);
  if (step === 'complete') return null;

  return (
    <section className="onboarding">
      <p className="onboarding__progress">
        {t('onboarding.progress', {
          current: STEPS.indexOf(step) + 1,
          total: STEPS.length,
        })}
      </p>
      {step === 'disclaimer' && (
        <DisclaimerStep
          onAccept={() =>
            save({ ...athlete, disclaimerAcceptedAt: new Date().toISOString() })
          }
        />
      )}
      {step === 'goal' && (
        <GoalForm
          stored={athlete}
          submitLabel={t('common.continue')}
          onSubmit={(choice) => save({ ...athlete, ...choice })}
        />
      )}
      {step === 'bodyStats' && (
        <BodyStatsForm
          stored={athlete.bodyStats}
          unitSystem={athlete.unitSystem}
          submitLabel={t('common.continue')}
          onSubmit={(bodyStats, unitSystem) =>
            save({ ...athlete, bodyStats, unitSystem })
          }
        />
      )}
      {step === 'training' && (
        <TrainingForm
          storedExperienceLevel={athlete.experienceLevel}
          storedAvailability={athlete.availability}
          submitLabel={t('common.continue')}
          onSubmit={(experienceLevel, availability) =>
            save({ ...athlete, experienceLevel, availability })
          }
        />
      )}
      {step === 'equipment' && (
        <InventoryForm
          stored={athlete.inventory}
          submitLabel={t('common.continue')}
          onSubmit={(inventory) => save({ ...athlete, inventory })}
        />
      )}
    </section>
  );
}
