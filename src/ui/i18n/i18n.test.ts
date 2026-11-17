import { describe, expect, it } from 'vitest';
import { createI18n, detectLanguage } from './i18n';

describe('detectLanguage', () => {
  it('picks the first supported language from the browser preferences', () => {
    expect(detectLanguage(['de-DE', 'fr-CA', 'en-US'])).toBe('fr');
  });

  it('matches regional tags case-insensitively', () => {
    expect(detectLanguage(['FR-be'])).toBe('fr');
  });

  it('falls back to English when nothing is supported', () => {
    expect(detectLanguage(['de', 'es'])).toBe('en');
    expect(detectLanguage([])).toBe('en');
  });
});

describe('createI18n', () => {
  it('is ready synchronously in the requested language', () => {
    const i18n = createI18n('fr');
    expect(i18n.language).toBe('fr');
    expect(i18n.t('language.label')).toBe('Langue');
  });
});
