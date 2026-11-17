/** Joints and regions an Exercise can strain, from head to toe. */
export const JOINTS = [
  'neck',
  'shoulder',
  'elbow',
  'wrist',
  'lowerBack',
  'hip',
  'knee',
  'ankle',
] as const;
export type Joint = (typeof JOINTS)[number];
