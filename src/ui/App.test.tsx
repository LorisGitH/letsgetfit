// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { describe, expect, it } from 'vitest';
import type { Athlete } from '../domain/athlete/athlete';
import type { AthleteRepository } from '../domain/athlete/athleteRepository';
import { createInMemoryAthleteRepository } from '../test/inMemoryAthleteRepository';
import { App } from './App';
import { createI18n, type Language } from './i18n/i18n';

const onboarded: Athlete = {
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
};

function renderApp(repository: AthleteRepository, language: Language = 'en') {
  return render(
    <I18nextProvider i18n={createI18n(language)}>
      <App athleteRepository={repository} />
    </I18nextProvider>,
  );
}

async function acceptDisclaimer(user: UserEvent) {
  await user.click(await screen.findByLabelText('I understand and accept'));
  await user.click(screen.getByRole('button', { name: 'Continue' }));
}

async function chooseGoal(user: UserEvent) {
  await user.click(await screen.findByLabelText(/^Lose fat/));
  await user.click(screen.getByLabelText('Belly & waist'));
  await user.click(screen.getByLabelText('Knee'));
  await user.click(screen.getByRole('button', { name: 'Continue' }));
}

async function fillBodyStats(user: UserEvent) {
  await user.type(await screen.findByLabelText('Date of birth'), '1990-06-15');
  await user.click(screen.getByLabelText('Female'));
  await user.type(screen.getByLabelText('Height (cm)'), '168');
  await user.type(screen.getByLabelText('Weight (kg)'), '62,5');
  await user.click(screen.getByRole('button', { name: 'Continue' }));
}

describe('App shell', () => {
  it('switches the interface to French', async () => {
    const user = userEvent.setup();
    renderApp(createInMemoryAthleteRepository());

    await user.selectOptions(await screen.findByLabelText('Language'), 'fr');

    expect(screen.getByLabelText('Langue')).toHaveValue('fr');
    expect(
      screen.getByRole('heading', { name: 'Avant de commencer' }),
    ).toBeInTheDocument();
  });

  it('explains when the browser cannot store data', async () => {
    renderApp({
      load: () => Promise.reject(new Error('IndexedDB unavailable')),
      save: () => Promise.resolve(),
    });
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /can't store data/,
    );
  });
});

describe('First-run onboarding', () => {
  it('requires accepting the disclaimer before anything else', async () => {
    const user = userEvent.setup();
    const repository = createInMemoryAthleteRepository();
    renderApp(repository);

    const continueButton = await screen.findByRole('button', {
      name: 'Continue',
    });
    expect(continueButton).toBeDisabled();
    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();

    await acceptDisclaimer(user);

    expect(
      await screen.findByRole('heading', { name: 'Your goal' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
    expect(repository.saved?.disclaimerAcceptedAt).toEqual(expect.any(String));
  });

  it('remembers progress after the app is closed', async () => {
    const user = userEvent.setup();
    const repository = createInMemoryAthleteRepository();
    const { unmount } = renderApp(repository);
    await acceptDisclaimer(user);
    await screen.findByRole('heading', { name: 'Your goal' });
    unmount();

    renderApp(repository);

    expect(
      await screen.findByRole('heading', { name: 'Your goal' }),
    ).toBeInTheDocument();
  });

  it('requires a Goal, while Focus Areas and Limitations are optional', async () => {
    const user = userEvent.setup();
    const repository = createInMemoryAthleteRepository();
    renderApp(repository);
    await acceptDisclaimer(user);

    await user.click(await screen.findByRole('button', { name: 'Continue' }));
    expect(
      screen.getByRole('group', { name: 'Goal' }),
    ).toHaveAccessibleDescription('Choose an option.');

    await user.click(screen.getByLabelText(/^Gain muscle/));
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(
      await screen.findByRole('heading', { name: 'About you' }),
    ).toBeInTheDocument();
    expect(repository.saved).toMatchObject({
      goal: 'gainMuscle',
      focusAreas: [],
      limitations: [],
    });
  });

  it('is honest that Focus Areas do not burn fat from one spot', async () => {
    const user = userEvent.setup();
    renderApp(createInMemoryAthleteRepository());
    await acceptDisclaimer(user);

    expect(
      await screen.findByRole('group', { name: 'Focus Areas (optional)' }),
    ).toHaveAccessibleDescription(/not from one chosen spot/);
  });

  it('shows clear validation messages for Body Stats', async () => {
    const user = userEvent.setup();
    renderApp(createInMemoryAthleteRepository());
    await acceptDisclaimer(user);
    await chooseGoal(user);

    await user.type(await screen.findByLabelText('Height (cm)'), '-170');
    await user.type(screen.getByLabelText('Weight (kg)'), 'heavy');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(screen.getByLabelText('Height (cm)')).toHaveAccessibleDescription(
      'Enter a height between 90 cm and 250 cm.',
    );
    expect(screen.getByLabelText('Weight (kg)')).toHaveAccessibleDescription(
      'Enter a number.',
    );
    expect(screen.getByLabelText('Date of birth')).toHaveAccessibleDescription(
      'Required.',
    );
    expect(
      screen.getByRole('heading', { name: 'About you' }),
    ).toBeInTheDocument();
  });

  it('shows validation messages in French', async () => {
    const user = userEvent.setup();
    renderApp(
      createInMemoryAthleteRepository({
        unitSystem: 'metric',
        disclaimerAcceptedAt: 'x',
        goal: 'gainMuscle',
      }),
      'fr',
    );

    await user.type(await screen.findByLabelText('Taille (cm)'), '300');
    await user.click(screen.getByRole('button', { name: 'Continuer' }));

    expect(screen.getByLabelText('Taille (cm)')).toHaveAccessibleDescription(
      'Saisissez une taille entre 90 cm et 250 cm.',
    );
  });

  it('completes onboarding and saves everything on the device', async () => {
    const user = userEvent.setup();
    const repository = createInMemoryAthleteRepository();
    renderApp(repository);
    await acceptDisclaimer(user);
    await chooseGoal(user);
    await fillBodyStats(user);

    await user.click(await screen.findByLabelText(/^Intermediate/));
    await user.click(screen.getByLabelText('Friday'));
    await user.click(screen.getByLabelText('Monday'));
    await user.click(screen.getByLabelText('45 min'));
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(
      await screen.findByRole('heading', { name: "You're all set" }),
    ).toBeInTheDocument();
    expect(repository.saved).toMatchObject({
      unitSystem: 'metric',
      goal: 'loseFat',
      focusAreas: ['bellyAndWaist'],
      limitations: ['knee'],
      bodyStats: {
        dateOfBirth: '1990-06-15',
        sex: 'female',
        heightCm: 168,
        weightKg: 62.5,
      },
      experienceLevel: 'intermediate',
      availability: { trainingDays: ['monday', 'friday'], sessionMinutes: 45 },
    });
  });

  it('requires at least one Training Day and a session length', async () => {
    const user = userEvent.setup();
    const { availability: _availability, ...withoutAvailability } = onboarded;
    renderApp(createInMemoryAthleteRepository(withoutAvailability));

    await user.click(await screen.findByRole('button', { name: 'Continue' }));

    expect(
      screen.getByRole('group', { name: 'Training days' }),
    ).toHaveAccessibleDescription('Pick at least one day.');
    expect(
      screen.getByRole('group', { name: 'Session length' }),
    ).toHaveAccessibleDescription('Choose an option.');
  });
});

describe('Home', () => {
  it('opens the exercise catalogue', async () => {
    const user = userEvent.setup();
    renderApp(createInMemoryAthleteRepository(onboarded));

    await user.click(
      await screen.findByRole('button', { name: 'Browse exercises' }),
    );

    expect(
      await screen.findByRole('heading', { name: 'Exercise catalogue' }),
    ).toBeInTheDocument();
  });
});

describe('Profile', () => {
  it('shows the Goal on the home screen', async () => {
    renderApp(createInMemoryAthleteRepository(onboarded));

    const goal = await screen.findByText('Goal', { selector: 'dt' });
    expect(goal.nextElementSibling).toHaveTextContent('Lose fat');
  });

  it('replaces the Goal and updates Focus Areas and Limitations', async () => {
    const user = userEvent.setup();
    const repository = createInMemoryAthleteRepository(onboarded);
    renderApp(repository);
    await user.click(
      await screen.findByRole('button', { name: 'Edit profile' }),
    );

    const goalForm = screen.getByRole('form', { name: 'Your goal' });
    await user.click(within(goalForm).getByLabelText(/^Gain muscle/));
    await user.click(within(goalForm).getByLabelText('Belly & waist'));
    await user.click(within(goalForm).getByLabelText('Arms'));
    await user.click(within(goalForm).getByLabelText('Knee'));
    await user.click(within(goalForm).getByLabelText('Wrist'));
    await user.click(within(goalForm).getByRole('button', { name: 'Save' }));

    expect(await within(goalForm).findByRole('status')).toHaveTextContent(
      'Saved.',
    );
    expect(repository.saved).toMatchObject({
      goal: 'gainMuscle',
      focusAreas: ['arms'],
      limitations: ['wrist'],
    });
  });

  it('lets the Athlete edit their details later', async () => {
    const user = userEvent.setup();
    const repository = createInMemoryAthleteRepository(onboarded);
    renderApp(repository);

    await user.click(
      await screen.findByRole('button', { name: 'Edit profile' }),
    );
    await user.click(screen.getByLabelText('Saturday'));
    const trainingForm = screen.getByRole('form', { name: 'Your training' });
    await user.click(
      within(trainingForm).getByRole('button', { name: 'Save' }),
    );

    expect(await within(trainingForm).findByRole('status')).toHaveTextContent(
      'Saved.',
    );
    expect(repository.saved?.availability?.trainingDays).toEqual([
      'monday',
      'thursday',
      'saturday',
    ]);
  });

  it('converts displayed values when switching units, without changing what is stored', async () => {
    const user = userEvent.setup();
    const repository = createInMemoryAthleteRepository(onboarded);
    renderApp(repository);
    await user.click(
      await screen.findByRole('button', { name: 'Edit profile' }),
    );

    await user.click(screen.getByLabelText('Imperial (lb, ft, in)'));

    expect(screen.getByLabelText('Feet')).toHaveValue('5');
    expect(screen.getByLabelText('Inches')).toHaveValue('6');
    expect(screen.getByLabelText('Weight (lb)')).toHaveValue('136.7');

    const bodyStatsForm = screen.getByRole('form', { name: 'About you' });
    await user.click(
      within(bodyStatsForm).getByRole('button', { name: 'Save' }),
    );

    expect(await within(bodyStatsForm).findByRole('status')).toHaveTextContent(
      'Saved.',
    );
    expect(repository.saved).toMatchObject({
      unitSystem: 'imperial',
      bodyStats: onboarded.bodyStats,
    });
  });
});
