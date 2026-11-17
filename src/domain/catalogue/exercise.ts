import type { ExperienceLevel } from '../athlete/experienceLevel';
import type { Muscle } from '../body/muscle';
import type { Equipment } from './equipment';

export const EXERCISE_KINDS = ['strength', 'cardio'] as const;
export type ExerciseKind = (typeof EXERCISE_KINDS)[number];

/** Languages Catalogue content is written in; English is always present. */
export type ContentLanguage = 'en' | 'fr';

export type Localized<Content> = { en: Content } & Partial<
  Record<ContentLanguage, Content>
>;

export interface Exercise {
  id: string;
  kind: ExerciseKind;
  name: Localized<string>;
  instructions: Localized<readonly string[]>;
  /** How much training the movement suits; dataset "expert" maps to advanced. */
  level: ExperienceLevel;
  primaryMuscles: readonly Muscle[];
  secondaryMuscles: readonly Muscle[];
  /** Everything needed to do the Exercise; empty for bodyweight work. */
  requiredEquipment: readonly Equipment[];
  /** Equipment that can be used but isn't needed, e.g. push-up bars for push-ups. */
  optionalEquipment: readonly Equipment[];
  /** File names of the Exercise's images in the Catalogue's image folder. */
  images: readonly string[];
}

/** Content in the requested language, falling back to English until it is translated. */
export function localized<Content>(
  content: Localized<Content>,
  language: ContentLanguage,
): Content {
  return content[language] ?? content.en;
}
