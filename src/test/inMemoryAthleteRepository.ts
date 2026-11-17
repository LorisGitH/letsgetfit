import type { Athlete } from '../domain/athlete/athlete';
import type { AthleteRepository } from '../domain/athlete/athleteRepository';

/** An AthleteRepository held in memory, for UI tests. `saved` exposes what was last saved. */
export function createInMemoryAthleteRepository(
  initial?: Athlete,
): AthleteRepository & {
  readonly saved: Athlete | undefined;
} {
  let saved = initial;
  return {
    get saved() {
      return saved;
    },
    load() {
      return Promise.resolve(saved);
    },
    save(athlete: Athlete) {
      saved = athlete;
      return Promise.resolve();
    },
  };
}
