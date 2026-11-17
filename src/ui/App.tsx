import { useTranslation } from 'react-i18next';
import type { AthleteRepository } from '../domain/athlete/athleteRepository';
import { AthleteProvider } from './athlete/AthleteProvider';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Screens } from './screens/Screens';

interface AppProps {
  athleteRepository: AthleteRepository;
}

export function App({ athleteRepository }: AppProps) {
  const { t } = useTranslation();

  return (
    <div className="shell">
      <header className="shell__header">
        <div>
          <h1 className="shell__title">{t('app.name')}</h1>
          <p className="shell__tagline">{t('app.tagline')}</p>
        </div>
        <LanguageSwitcher />
      </header>
      <main className="shell__main">
        <AthleteProvider repository={athleteRepository}>
          <Screens />
        </AthleteProvider>
      </main>
    </div>
  );
}
