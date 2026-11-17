import type { UnitSystem } from '../units/unitSystem';
import type { Availability } from './availability';
import type { BodyStats } from './bodyStats';
import type { ExperienceLevel } from './experienceLevel';

/**
 * The one person this installation belongs to. Fields fill in during onboarding,
 * so a partly onboarded Athlete survives closing the app.
 */
export interface Athlete {
  unitSystem: UnitSystem;
  /** ISO 8601 timestamp of when the Athlete accepted the health disclaimer. */
  disclaimerAcceptedAt?: string;
  bodyStats?: BodyStats;
  experienceLevel?: ExperienceLevel;
  availability?: Availability;
}

export const NEW_ATHLETE: Athlete = { unitSystem: 'metric' };

export type OnboardingStep =
  'disclaimer' | 'bodyStats' | 'training' | 'complete';

export function onboardingStep(athlete: Athlete): OnboardingStep {
  if (athlete.disclaimerAcceptedAt === undefined) return 'disclaimer';
  if (athlete.bodyStats === undefined) return 'bodyStats';
  if (
    athlete.experienceLevel === undefined ||
    athlete.availability === undefined
  ) {
    return 'training';
  }
  return 'complete';
}
