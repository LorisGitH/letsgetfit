// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { describe, expect, it } from 'vitest';
import { App } from './App';
import { createI18n } from './i18n/i18n';

function renderApp(language: 'en' | 'fr') {
  render(
    <I18nextProvider i18n={createI18n(language)}>
      <App />
    </I18nextProvider>,
  );
}

describe('App shell', () => {
  it('shows the shell in English', () => {
    renderApp('en');
    expect(
      screen.getByRole('heading', { level: 1, name: 'letsgetfit' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/train solo/i)).toBeInTheDocument();
  });

  it('switches the interface to French', async () => {
    const user = userEvent.setup();
    renderApp('en');

    await user.selectOptions(screen.getByLabelText('Language'), 'fr');

    expect(screen.getByLabelText('Langue')).toHaveValue('fr');
    expect(screen.getByText(/entraînez-vous seul/i)).toBeInTheDocument();
  });
});
