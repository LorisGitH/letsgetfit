import i18next, { type i18n } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './locales/en';
import { fr } from './locales/fr';

export const SUPPORTED_LANGUAGES = ['en', 'fr'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

const DEFAULT_LANGUAGE: Language = 'en';

export function isLanguage(value: string): value is Language {
  return SUPPORTED_LANGUAGES.some((language) => language === value);
}

/** Picks the first supported language from browser preferences such as `navigator.languages`. */
export function detectLanguage(preferences: readonly string[]): Language {
  for (const tag of preferences) {
    const base = tag.toLowerCase().split('-')[0] ?? '';
    if (isLanguage(base)) {
      return base;
    }
  }
  return DEFAULT_LANGUAGE;
}

/** Creates an isolated i18next instance, initialised synchronously. */
export function createI18n(language: Language): i18n {
  const instance = i18next.createInstance();
  void instance.use(initReactI18next).init({
    lng: language,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,
    resources: { en: { translation: en }, fr: { translation: fr } },
    interpolation: { escapeValue: false },
    initAsync: false,
  });
  return instance;
}
