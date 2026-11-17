/** Values are always stored in metric; the unit system only changes how they are shown and entered. */
export const UNIT_SYSTEMS = ['metric', 'imperial'] as const;
export type UnitSystem = (typeof UNIT_SYSTEMS)[number];
