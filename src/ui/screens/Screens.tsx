import { useState } from 'react';
import { onboardingStep } from '../../domain/athlete/athlete';
import { useAthlete } from '../athlete/athleteContext';
import { HomePage } from './HomePage';
import { Onboarding } from './Onboarding';
import { ProfilePage } from './ProfilePage';

type Screen = 'home' | 'profile';

export function Screens() {
  const { athlete } = useAthlete();
  const [screen, setScreen] = useState<Screen>('home');

  if (onboardingStep(athlete) !== 'complete') return <Onboarding />;
  if (screen === 'profile') {
    return (
      <ProfilePage
        onBack={() => {
          setScreen('home');
        }}
      />
    );
  }
  return (
    <HomePage
      onEditProfile={() => {
        setScreen('profile');
      }}
    />
  );
}
