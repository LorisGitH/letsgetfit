import { useState } from 'react';
import { onboardingStep } from '../../domain/athlete/athlete';
import { useAthlete } from '../athlete/athleteContext';
import { CatalogueScreen } from '../catalogue/CatalogueScreen';
import { HomePage } from './HomePage';
import { Onboarding } from './Onboarding';
import { ProfilePage } from './ProfilePage';

type Screen = 'home' | 'profile' | 'catalogue';

export function Screens() {
  const { athlete } = useAthlete();
  const [screen, setScreen] = useState<Screen>('home');

  if (onboardingStep(athlete) !== 'complete') return <Onboarding />;
  const goHome = () => {
    setScreen('home');
  };
  if (screen === 'catalogue') return <CatalogueScreen onBack={goHome} />;
  if (screen === 'profile') {
    return <ProfilePage onBack={goHome} />;
  }
  return (
    <HomePage
      onEditProfile={() => {
        setScreen('profile');
      }}
      onBrowseCatalogue={() => {
        setScreen('catalogue');
      }}
    />
  );
}
