// @vitest-environment jsdom
import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { onboarded, renderApp } from '../test/appFixtures';
import { createInMemoryAthleteRepository } from '../test/inMemoryAthleteRepository';

/** Clicks the generate button once the Catalogue has loaded and enabled it. */
async function generate(user: UserEvent, name = 'Generate my plan') {
  const button = await screen.findByRole('button', { name });
  await waitFor(() => {
    expect(button).toBeEnabled();
  });
  await user.click(button);
}

describe('Plan', () => {
  it('generates the Plan from the home screen and shows each Session', async () => {
    const user = userEvent.setup();
    const repository = createInMemoryAthleteRepository(onboarded);
    renderApp(repository);

    await generate(user);

    const monday = await screen.findByRole('article', { name: /^Monday/ });
    expect(
      within(monday).getByText('Full body · about 17 min'),
    ).toBeInTheDocument();
    expect(within(monday).getByText('Pushups')).toBeInTheDocument();
    expect(
      within(monday).getAllByText('2 × 12–15 reps · rest 45 s'),
    ).toHaveLength(3);
    expect(
      screen.getByRole('article', { name: /^Thursday/ }),
    ).toBeInTheDocument();
    expect(
      repository.saved?.plan?.sessions.map((session) => session.weekday),
    ).toEqual(['monday', 'thursday']);
  });

  it('shows Custom Exercises by their own name', async () => {
    const user = userEvent.setup();
    renderApp(createInMemoryAthleteRepository(onboarded));

    await generate(user);

    const monday = await screen.findByRole('article', { name: /^Monday/ });
    expect(within(monday).getByText('TRX row')).toBeInTheDocument();
  });

  it('keeps the Plan after the app is closed', async () => {
    const user = userEvent.setup();
    const repository = createInMemoryAthleteRepository(onboarded);
    const { unmount } = renderApp(repository);
    await generate(user);
    await screen.findByRole('article', { name: /^Monday/ });
    unmount();

    renderApp(repository);

    expect(
      await screen.findByRole('article', { name: /^Monday/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Generate again' }),
    ).toBeInTheDocument();
  });

  it('says so when a Session has no exercise it can use', async () => {
    const user = userEvent.setup();
    renderApp(
      createInMemoryAthleteRepository({
        ...onboarded,
        repertoire: { catalogue: ['pullups'], custom: [] },
      }),
    );

    await generate(user);

    const monday = await screen.findByRole('article', { name: /^Monday/ });
    expect(
      within(monday).getByText(
        'No exercise in your list can be used for this session yet.',
      ),
    ).toBeInTheDocument();
  });

  it('is shown in French', async () => {
    const user = userEvent.setup();
    renderApp(createInMemoryAthleteRepository(onboarded), 'fr');

    await generate(user, 'Générer mon plan');

    const monday = await screen.findByRole('article', { name: /^Lundi/ });
    expect(within(monday).getByText('Pompes')).toBeInTheDocument();
    expect(
      within(monday).getAllByText('2 × 12–15 rép. · repos 45 s'),
    ).toHaveLength(3);
  });
});
