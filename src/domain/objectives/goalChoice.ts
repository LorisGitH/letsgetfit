import { JOINTS, type Joint } from '../body/joint';
import { inListOrder } from '../listOrder';
import {
  checkPresent,
  fieldErrors,
  hasErrors,
  type Validation,
} from '../validation';
import { FOCUS_AREAS, type FocusArea } from './focusArea';
import type { Goal } from './goal';

/** What the Athlete trains for, what to prioritise, and which Joints to spare. */
export interface GoalChoice {
  goal: Goal;
  focusAreas: readonly FocusArea[];
  limitations: readonly Joint[];
}

export interface GoalChoiceInput {
  goal: Goal | undefined;
  focusAreas: readonly FocusArea[];
  limitations: readonly Joint[];
}

export type GoalChoiceField = keyof GoalChoice;

export function validateGoalChoice(
  input: GoalChoiceInput,
): Validation<GoalChoice, GoalChoiceField> {
  const { goal, focusAreas, limitations } = input;
  const errors = fieldErrors<GoalChoiceField>({
    goal: checkPresent(goal),
    focusAreas: undefined,
    limitations: undefined,
  });
  if (hasErrors(errors) || goal === undefined) return { ok: false, errors };
  return {
    ok: true,
    value: {
      goal,
      focusAreas: inListOrder(FOCUS_AREAS, focusAreas),
      limitations: inListOrder(JOINTS, limitations),
    },
  };
}
