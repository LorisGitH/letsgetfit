export const GOALS = ['gainMuscle', 'loseFat', 'recomposition'] as const;
export type Goal = (typeof GOALS)[number];
