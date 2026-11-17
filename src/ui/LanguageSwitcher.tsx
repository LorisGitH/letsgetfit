import { useId, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { isLanguage, SUPPORTED_LANGUAGES } from './i18n/i18n';

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const id = useId();

  const changeLanguage = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    if (isLanguage(value)) {
      void i18n.changeLanguage(value);
    }
  };

  return (
    <div className="language-switcher">
      <label htmlFor={id}>{t('language.label')}</label>
      <select id={id} value={i18n.language} onChange={changeLanguage}>
        {SUPPORTED_LANGUAGES.map((language) => (
          <option key={language} value={language}>
            {t(`language.${language}`)}
          </option>
        ))}
      </select>
    </div>
  );
}
