import type { Athlete } from './athlete';

/** Where the Athlete is kept. Implemented by the storage layer. */
export interface AthleteRepository {
  /** The saved Athlete, or `undefined` on a fresh installation. */
  load(): Promise<Athlete | undefined>;
  save(athlete: Athlete): Promise<void>;
}
