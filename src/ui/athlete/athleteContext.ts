import { createContext, use } from 'react';
import type { Athlete } from '../../domain/athlete/athlete';

export interface AthleteState {
  athlete: Athlete;
  /** Saves the Athlete on the device, then shows it everywhere. */
  save: (athlete: Athlete) => Promise<void>;
}

export const AthleteContext = createContext<AthleteState | undefined>(
  undefined,
);

export function useAthlete(): AthleteState {
  const state = use(AthleteContext);
  if (state === undefined) {
    throw new Error('useAthlete must be used inside <AthleteProvider>');
  }
  return state;
}
