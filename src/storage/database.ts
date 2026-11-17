import { Dexie, type EntityTable } from 'dexie';
import type { Athlete } from '../domain/athlete/athlete';

/** An installation has exactly one Athlete, stored under this key. */
export const ATHLETE_KEY = 'self';

export interface AthleteRecord {
  id: typeof ATHLETE_KEY;
  athlete: Athlete;
}

export type Database = Dexie & {
  athlete: EntityTable<AthleteRecord, 'id'>;
};

/**
 * Opens the on-device database (ADR 0001). Each schema change adds a new
 * `version(n)` with its upgrade, never edits an existing one.
 */
export function openDatabase(name = 'letsgetfit'): Database {
  const database = new Dexie(name) as Database;
  database.version(1).stores({ athlete: 'id' });
  return database;
}
