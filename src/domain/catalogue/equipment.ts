/** The fixed Equipment list the Catalogue is tagged with (home kit, no barbell). */
export const EQUIPMENT = [
  'dumbbells',
  'kettlebell',
  'resistanceBand',
  'pullUpBar',
  'pushUpBars',
  'dipBars',
  'bench',
  'box',
  'exerciseBall',
  'medicineBall',
  'jumpRope',
  'treadmill',
  'exerciseBike',
  'rowingMachine',
  'elliptical',
  'bicycle',
] as const;
export type Equipment = (typeof EQUIPMENT)[number];
