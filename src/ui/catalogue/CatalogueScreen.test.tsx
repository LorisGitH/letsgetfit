// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { describe, expect, it, vi } from 'vitest';
import { createI18n, type Language } from '../i18n/i18n';
import { CatalogueScreen } from './CatalogueScreen';

function renderCatalogue(language: Language = 'en') {
  const onBack = vi.fn();
  render(
    <I18nextProvider i18n={createI18n(language)}>
      <CatalogueScreen onBack={onBack} />
    </I18nextProvider>,
  );
  return { onBack };
}

const results = (name = 'Exercises') => screen.getByRole('list', { name });

describe('Catalogue browser', () => {
  it('lists the whole Catalogue and credits its source', async () => {
    renderCatalogue();

    expect(await screen.findByText(/^\d{3} exercises$/)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'free-exercise-db' }),
    ).toHaveAttribute('href', 'https://github.com/yuhonas/free-exercise-db');
  });

  it('searches by name', async () => {
    const user = userEvent.setup();
    renderCatalogue();

    await user.type(
      await screen.findByRole('searchbox', { name: 'Search' }),
      'pushups close',
    );

    expect(within(results()).getAllByRole('button')).toHaveLength(1);
    expect(
      within(results()).getByRole('button', {
        name: 'Pushups (Close and Wide Hand Positions)',
      }),
    ).toHaveAccessibleDescription('Chest');
  });

  it('filters by Muscle and by Equipment', async () => {
    const user = userEvent.setup();
    renderCatalogue();

    await user.selectOptions(await screen.findByLabelText('Muscle'), 'biceps');
    await user.selectOptions(
      screen.getByLabelText('Equipment'),
      'resistanceBand',
    );
    expect(screen.getByText('0 exercises')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Equipment'), 'dumbbells');
    expect(
      within(results()).getByRole('button', { name: /^Hammer Curls/ }),
    ).toBeInTheDocument();
  });

  it('shows only bodyweight Exercises when asked', async () => {
    const user = userEvent.setup();
    renderCatalogue();

    await user.selectOptions(await screen.findByLabelText('Equipment'), 'none');

    expect(
      within(results()).getByRole('button', { name: /^Pushups$/ }),
    ).toBeInTheDocument();
    expect(
      within(results()).queryByRole('button', { name: /^Hammer Curls/ }),
    ).toBeNull();
  });

  it('opens an Exercise with its instructions, Muscles and Equipment', async () => {
    const user = userEvent.setup();
    renderCatalogue();

    await user.type(
      await screen.findByRole('searchbox', { name: 'Search' }),
      'pushups',
    );
    await user.click(
      within(results()).getByRole('button', { name: /^Pushups$/ }),
    );

    expect(
      screen.getByRole('heading', { level: 2, name: 'Pushups' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('list', { name: 'Instructions' }).children.length,
    ).toBeGreaterThan(1);
    expect(screen.getByText('No equipment needed')).toBeInTheDocument();
    expect(screen.getByText('Push-up bars')).toBeInTheDocument();
    expect(
      screen.getAllByRole('img', { name: /^Pushups, step \d$/ }).length,
    ).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Back to the list' }));
    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveValue(
      'pushups',
    );
  });

  it('speaks French, and says when instructions are not translated yet', async () => {
    const user = userEvent.setup();
    renderCatalogue('fr');

    await user.selectOptions(await screen.findByLabelText('Muscle'), 'chest');
    expect(
      screen.getByRole('option', { name: 'Pectoraux' }),
    ).toBeInTheDocument();

    await user.click(
      within(results('Exercices')).getByRole('button', { name: /^Pushups$/ }),
    );
    expect(screen.getByText(/en anglais pour le moment/)).toBeInTheDocument();
  });

  it('goes back home', async () => {
    const user = userEvent.setup();
    const { onBack } = renderCatalogue();

    await user.click(await screen.findByRole('button', { name: 'Back' }));

    expect(onBack).toHaveBeenCalledOnce();
  });
});
