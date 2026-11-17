import { render } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import type { Athlete } from '../domain/athlete/athlete';
import type { AthleteRepository } from '../domain/athlete/athleteRepository';
import type { CustomExercise } from '../domain/repertoire/customExercise';
import { App } from '../ui/App';
import { createI18n, type Language } from '../ui/i18n/i18n';

export const trxRow: CustomExercise = {
  id: 'trx-row',
  name: 'TRX row',
  kind: 'strength',
  primaryMuscles: ['middleBack'],
  secondaryMuscles: ['biceps'],
  strainedJoints: ['shoulder', 'elbow'],
  requiredEquipment: [],
  requiredCustomEquipment: ['trx'],
  notes: '',
};

/** An Athlete who has finished onboarding. */
export const onboarded: Athlete = {
  unitSystem: 'metric',
  disclaimerAcceptedAt: '2026-11-17T10:00:00.000Z',
  goal: 'loseFat',
  focusAreas: ['bellyAndWaist'],
  limitations: ['knee'],
  bodyStats: {
    dateOfBirth: '1990-06-15',
    sex: 'female',
    heightCm: 168,
    weightKg: 62,
  },
  experienceLevel: 'beginner',
  availability: { trainingDays: ['monday', 'thursday'], sessionMinutes: 45 },
  inventory: {
    equipment: ['dumbbells'],
    customEquipment: [{ id: 'trx', name: 'TRX strap' }],
  },
  repertoire: { catalogue: ['pushups', 'hammer-curls'], custom: ['trx-row'] },
  customExercises: [trxRow],
};

export function renderApp(
  repository: AthleteRepository,
  language: Language = 'en',
) {
  return render(
    <I18nextProvider i18n={createI18n(language)}>
      <App athleteRepository={repository} />
    </I18nextProvider>,
  );
}
