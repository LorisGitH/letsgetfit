import type { ExperienceLevel } from '../athlete/experienceLevel';
import type { Joint } from '../body/joint';
import type { Muscle } from '../body/muscle';
import type { Equipment } from './equipment';

export const EXERCISE_KINDS = ['strength', 'cardio'] as const;
export type ExerciseKind = (typeof EXERCISE_KINDS)[number];

/** Languages every Catalogue Exercise is written in. */
export const CONTENT_LANGUAGES = ['en', 'fr'] as const;
export type ContentLanguage = (typeof CONTENT_LANGUAGES)[number];

export type Localized<Content> = Record<ContentLanguage, Content>;

export interface Exercise {
  id: string;
  kind: ExerciseKind;
  name: Localized<string>;
  instructions: Localized<readonly string[]>;
  /** How much training the movement suits; dataset "expert" maps to advanced. */
  level: ExperienceLevel;
  primaryMuscles: readonly Muscle[];
  secondaryMuscles: readonly Muscle[];
  /** Joints the movement loads; Limitations leave out Exercises straining theirs. */
  strainedJoints: readonly Joint[];
  /** Everything needed to do the Exercise; empty for bodyweight work. */
  requiredEquipment: readonly Equipment[];
  /** Equipment that can be used but isn't needed, e.g. push-up bars for push-ups. */
  optionalEquipment: readonly Equipment[];
  /** File names of the Exercise's images in the Catalogue's image folder. */
  images: readonly string[];
}

export function localized<Content>(
  content: Localized<Content>,
  language: ContentLanguage,
): Content {
  return content[language];
}
