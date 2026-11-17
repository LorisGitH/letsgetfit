import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import type { Athlete } from '../domain/athlete/athlete';
import { openDatabase, type Database } from './database';
import { createDexieAthleteRepository } from './dexieAthleteRepository';

const athlete: Athlete = {
  unitSystem: 'imperial',
  disclaimerAcceptedAt: '2026-11-17T10:00:00.000Z',
  bodyStats: {
    dateOfBirth: '1990-06-15',
    sex: 'unspecified',
    heightCm: 175,
    weightKg: 70,
  },
  experienceLevel: 'intermediate',
  availability: { trainingDays: ['tuesday', 'saturday'], sessionMinutes: 60 },
};

let opened: Database[] = [];
let counter = 0;
function freshDatabase(): Database {
  counter += 1;
  const database = openDatabase(`letsgetfit-test-${String(counter)}`);
  opened.push(database);
  return database;
}

afterEach(async () => {
  await Promise.all(opened.map((database) => database.delete()));
  opened = [];
});

describe('Dexie Athlete repository', () => {
  it('has no Athlete on a fresh installation', async () => {
    const repository = createDexieAthleteRepository(freshDatabase());
    expect(await repository.load()).toBeUndefined();
  });

  it('loads the Athlete it saved', async () => {
    const repository = createDexieAthleteRepository(freshDatabase());
    await repository.save(athlete);
    expect(await repository.load()).toEqual(athlete);
  });

  it('keeps one Athlete, replacing it on each save', async () => {
    const database = freshDatabase();
    const repository = createDexieAthleteRepository(database);
    await repository.save(athlete);
    await repository.save({ unitSystem: 'metric' });
    expect(await repository.load()).toEqual({ unitSystem: 'metric' });
    expect(await database.athlete.count()).toBe(1);
  });

  it('survives reopening the database', async () => {
    const database = freshDatabase();
    await createDexieAthleteRepository(database).save(athlete);
    database.close();
    const reopened = openDatabase(database.name);
    opened.push(reopened);
    expect(await createDexieAthleteRepository(reopened).load()).toEqual(
      athlete,
    );
  });
});
