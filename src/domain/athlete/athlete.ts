import type { Joint } from '../body/joint';
import type { Inventory } from '../inventory/inventory';
import type { CustomExercise } from '../repertoire/customExercise';
import type { Repertoire } from '../repertoire/repertoire';
import type { FocusArea } from '../objectives/focusArea';
import type { Goal } from '../objectives/goal';
import type { Plan } from '../plan/plan';
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
  goal?: Goal;
  focusAreas?: readonly FocusArea[];
  /** Joints the Athlete must spare. */
  limitations?: readonly Joint[];
  bodyStats?: BodyStats;
  experienceLevel?: ExperienceLevel;
  availability?: Availability;
  inventory?: Inventory;
  repertoire?: Repertoire;
  customExercises?: readonly CustomExercise[];
  plan?: Plan;
}

export const NEW_ATHLETE: Athlete = { unitSystem: 'metric' };

export type OnboardingStep =
  | 'disclaimer'
  | 'goal'
  | 'bodyStats'
  | 'training'
  | 'equipment'
  | 'exercises'
  | 'complete';

export function onboardingStep(athlete: Athlete): OnboardingStep {
  if (athlete.disclaimerAcceptedAt === undefined) return 'disclaimer';
  if (athlete.goal === undefined) return 'goal';
  if (athlete.bodyStats === undefined) return 'bodyStats';
  if (
    athlete.experienceLevel === undefined ||
    athlete.availability === undefined
  ) {
    return 'training';
  }
  if (athlete.inventory === undefined) return 'equipment';
  if (athlete.repertoire === undefined) return 'exercises';
  return 'complete';
}
