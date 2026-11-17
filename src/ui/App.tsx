import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';

export function App() {
  const { t } = useTranslation();

  return (
    <div className="shell">
      <header className="shell__header">
        <h1 className="shell__title">{t('app.name')}</h1>
        <LanguageSwitcher />
      </header>
      <main className="shell__main">
        <p>{t('app.tagline')}</p>
      </main>
    </div>
  );
}
