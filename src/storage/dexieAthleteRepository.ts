import type { Athlete } from '../domain/athlete/athlete';
import type { AthleteRepository } from '../domain/athlete/athleteRepository';
import { ATHLETE_KEY, type Database } from './database';

export function createDexieAthleteRepository(
  database: Database,
): AthleteRepository {
  return {
    async load() {
      const record = await database.athlete.get(ATHLETE_KEY);
      return record?.athlete;
    },
    async save(athlete: Athlete) {
      await database.athlete.put({ id: ATHLETE_KEY, athlete });
    },
  };
}
