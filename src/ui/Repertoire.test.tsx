// @vitest-environment jsdom
import { screen, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { onboarded, renderApp, trxRow } from '../test/appFixtures';
import { createInMemoryAthleteRepository } from '../test/inMemoryAthleteRepository';

const { repertoire: _repertoire, ...beforeExercises } = onboarded;

async function openMyExercises(user: UserEvent) {
  await user.click(await screen.findByRole('button', { name: 'My exercises' }));
}

describe('Repertoire in onboarding', () => {
  it('starts from what the equipment allows and needs at least one exercise', async () => {
    const user = userEvent.setup();
    const repository = createInMemoryAthleteRepository(beforeExercises);
    renderApp(repository);

    expect(
      await screen.findByLabelText('Only what my equipment allows'),
    ).toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Pick at least one exercise.',
    );

    await user.click(screen.getByLabelText('Hammer Curls: in my exercises'));
    expect(screen.getByText('1 in my exercises')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(
      await screen.findByRole('heading', { name: "You're all set" }),
    ).toBeInTheDocument();
    expect(repository.saved?.repertoire).toEqual({
      catalogue: ['hammer-curls'],
      custom: [],
    });
  });
});

describe('Repertoire from the Catalogue', () => {
  it('adds and removes exercises while browsing, saving each change', async () => {
    const user = userEvent.setup();
    const repository = createInMemoryAthleteRepository(onboarded);
    renderApp(repository);
    await user.click(
      await screen.findByRole('button', { name: 'Browse exercises' }),
    );

    await user.click(
      await screen.findByLabelText('Goblet Squat: in my exercises'),
    );
    await user.click(screen.getByLabelText('Pushups: in my exercises'));

    expect(repository.saved?.repertoire?.catalogue).toEqual([
      'hammer-curls',
      'goblet-squat',
    ]);
  });

  it('toggles an exercise from its page', async () => {
    const user = userEvent.setup();
    const repository = createInMemoryAthleteRepository(onboarded);
    renderApp(repository);
    await user.click(
      await screen.findByRole('button', { name: 'Browse exercises' }),
    );
    await user.type(
      await screen.findByRole('searchbox', { name: 'Search' }),
      'pullups',
    );
    await user.click(screen.getByRole('button', { name: /^Pullups$/ }));

    await user.click(
      screen.getByRole('button', { name: 'Add to my exercises' }),
    );
    expect(repository.saved?.repertoire?.catalogue).toContain('pullups');

    await user.click(
      screen.getByRole('button', { name: 'Remove from my exercises' }),
    );
    expect(repository.saved?.repertoire?.catalogue).not.toContain('pullups');
  });

  it('can show only the exercises in the Repertoire', async () => {
    const user = userEvent.setup();
    renderApp(createInMemoryAthleteRepository(onboarded));
    await user.click(
      await screen.findByRole('button', { name: 'Browse exercises' }),
    );

    await user.click(await screen.findByLabelText('Only my exercises'));

    const list = screen.getByRole('list', { name: 'Exercises' });
    expect(within(list).getAllByRole('button')).toHaveLength(2);
    expect(
      within(list).getByRole('button', { name: 'Hammer Curls' }),
    ).toBeInTheDocument();
    expect(
      within(list).getByRole('button', { name: 'Pushups' }),
    ).toBeInTheDocument();
  });
});

describe('My exercises', () => {
  it('lists the Repertoire and removes an exercise from it', async () => {
    const user = userEvent.setup();
    const repository = createInMemoryAthleteRepository(onboarded);
    renderApp(repository);
    await openMyExercises(user);

    expect(await screen.findByText('Hammer Curls')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Remove Pushups' }));

    expect(repository.saved?.repertoire?.catalogue).toEqual(['hammer-curls']);
  });

  it('creates a Custom Exercise that can use Custom Equipment and joins the Repertoire', async () => {
    const user = userEvent.setup();
    const repository = createInMemoryAthleteRepository(onboarded);
    renderApp(repository);
    await openMyExercises(user);

    await user.click(
      await screen.findByRole('button', { name: 'Create an exercise' }),
    );
    const form = screen.getByRole('form', { name: 'New exercise' });
    await user.type(within(form).getByLabelText('Name'), 'TRX pike');
    await user.click(within(form).getByLabelText('Strength'));
    await user.click(
      within(
        within(form).getByRole('group', { name: 'Main muscles' }),
      ).getByLabelText('Abdominals'),
    );
    await user.click(
      within(
        within(form).getByRole('group', { name: 'Joints it strains' }),
      ).getByLabelText('Shoulder'),
    );
    await user.click(within(form).getByLabelText('TRX strap'));
    await user.type(
      within(form).getByLabelText('Notes (optional)'),
      'Feet in the straps.',
    );
    await user.click(within(form).getByRole('button', { name: 'Save' }));

    const created = repository.saved?.customExercises?.find(
      (e) => e.name === 'TRX pike',
    );
    expect(created).toMatchObject({
      kind: 'strength',
      primaryMuscles: ['abdominals'],
      strainedJoints: ['shoulder'],
      requiredEquipment: [],
      requiredCustomEquipment: ['trx'],
      notes: 'Feet in the straps.',
    });
    expect(repository.saved?.repertoire?.custom).toContain(created?.id);
    expect(await screen.findByText('TRX pike')).toBeInTheDocument();
  });

  it('checks a Custom Exercise before saving it', async () => {
    const user = userEvent.setup();
    renderApp(createInMemoryAthleteRepository(onboarded));
    await openMyExercises(user);
    await user.click(
      await screen.findByRole('button', { name: 'Create an exercise' }),
    );

    const form = screen.getByRole('form', { name: 'New exercise' });
    await user.type(within(form).getByLabelText('Name'), 'trx ROW');
    await user.click(within(form).getByRole('button', { name: 'Save' }));

    expect(within(form).getByLabelText('Name')).toHaveAccessibleDescription(
      'You already have an exercise with this name.',
    );
    expect(
      within(form).getByRole('group', { name: 'Main muscles' }),
    ).toHaveAccessibleDescription('Pick at least one muscle.');
  });

  it('edits and deletes a Custom Exercise', async () => {
    const user = userEvent.setup();
    const repository = createInMemoryAthleteRepository(onboarded);
    renderApp(repository);
    await openMyExercises(user);

    await user.click(
      await screen.findByRole('button', { name: 'Edit TRX row' }),
    );
    const form = screen.getByRole('form', { name: 'Edit exercise' });
    await user.clear(within(form).getByLabelText('Name'));
    await user.type(within(form).getByLabelText('Name'), 'TRX inverted row');
    await user.click(within(form).getByRole('button', { name: 'Save' }));
    expect(repository.saved?.customExercises?.[0]?.name).toBe(
      'TRX inverted row',
    );

    await user.click(
      await screen.findByRole('button', { name: 'Delete TRX inverted row' }),
    );
    await user.click(
      screen.getByRole('button', { name: 'Yes, delete TRX inverted row' }),
    );

    expect(repository.saved?.customExercises).toEqual([]);
    expect(repository.saved?.repertoire?.custom).toEqual([]);
  });
});

describe('Custom Equipment in use', () => {
  it('cannot be removed while a Custom Exercise requires it', async () => {
    const user = userEvent.setup();
    const repository = createInMemoryAthleteRepository(onboarded);
    renderApp(repository);
    await user.click(
      await screen.findByRole('button', { name: 'Edit profile' }),
    );

    const form = screen.getByRole('form', { name: 'Your equipment' });
    await user.click(
      within(form).getByRole('button', { name: 'Remove TRX strap' }),
    );

    expect(
      within(form).getByLabelText('Name of TRX strap'),
    ).toHaveAccessibleDescription(
      `Used by: ${trxRow.name}. Edit or delete these exercises first.`,
    );
    await user.click(within(form).getByRole('button', { name: 'Save' }));
    expect(repository.saved?.inventory?.customEquipment).toEqual([
      { id: 'trx', name: 'TRX strap' },
    ]);
  });
});
