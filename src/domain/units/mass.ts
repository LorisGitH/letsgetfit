/** Exact by definition: the international avoirdupois pound is 0.45359237 kg. */
const KILOGRAMS_PER_POUND = 0.45359237;

export function kilogramsToPounds(kilograms: number): number {
  return kilograms / KILOGRAMS_PER_POUND;
}

export function poundsToKilograms(pounds: number): number {
  return pounds * KILOGRAMS_PER_POUND;
}
