import { useState } from 'react';
import { onboardingStep } from '../../domain/athlete/athlete';
import { EMPTY_INVENTORY } from '../../domain/inventory/inventory';
import { EMPTY_REPERTOIRE, toggled } from '../../domain/repertoire/repertoire';
import { useAthlete } from '../athlete/athleteContext';
import { CatalogueScreen } from '../catalogue/CatalogueScreen';
import { MyExercisesPage } from '../repertoire/MyExercisesPage';
import { HomePage } from './HomePage';
import { Onboarding } from './Onboarding';
import { ProfilePage } from './ProfilePage';

type Screen = 'home' | 'profile' | 'catalogue' | 'myExercises';

export function Screens() {
  const { athlete, save } = useAthlete();
  const [screen, setScreen] = useState<Screen>('home');

  if (onboardingStep(athlete) !== 'complete') return <Onboarding />;
  const go = (next: Screen) => () => {
    setScreen(next);
  };

  switch (screen) {
    case 'catalogue': {
      const repertoire = athlete.repertoire ?? EMPTY_REPERTOIRE;
      return (
        <CatalogueScreen
          onBack={go('home')}
          inventory={athlete.inventory ?? EMPTY_INVENTORY}
          repertoire={repertoire}
          onToggleRepertoire={(ref) => {
            void save({ ...athlete, repertoire: toggled(repertoire, ref) });
          }}
        />
      );
    }
    case 'myExercises':
      return (
        <MyExercisesPage
          onBack={go('home')}
          onBrowseCatalogue={go('catalogue')}
        />
      );
    case 'profile':
      return <ProfilePage onBack={go('home')} />;
    case 'home':
      return (
        <HomePage
          onEditProfile={go('profile')}
          onBrowseCatalogue={go('catalogue')}
          onMyExercises={go('myExercises')}
        />
      );
  }
}
