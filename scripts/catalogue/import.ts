/**
 * Imports the Catalogue from free-exercise-db at a pinned commit (ADR 0003): keeps the home
 * subset, tags Equipment and joint strain, merges the reviewed French in
 * `translations/fr.json`, converts images to WebP and writes the Catalogue file.
 *
 *   pnpm catalogue:import                  re-run at the pinned commit (idempotent)
 *   pnpm catalogue:import --commit <sha>   move to another source commit
 *
 * The source is data only: its JSON is parsed, never run, and its images are re-encoded.
 */
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import sharp from 'sharp';
import type { Exercise } from '../../src/domain/catalogue/exercise.ts';
import {
  catalogueId,
  isHomeExercise,
  kindOf,
  levelOf,
  muscleName,
  OVERRIDES,
  tagEquipment,
  type SourceExercise,
} from './tagging.ts';
import { JOINT_OVERRIDES, strainedJoints } from './jointStrain.ts';

const SOURCE_REPOSITORY = 'yuhonas/free-exercise-db';
const PINNED_COMMIT = 'f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5';

const ROOT = join(import.meta.dirname, '..', '..');
const CATALOGUE_FILE = join(ROOT, 'src/domain/catalogue/exercises.json');
const IMAGE_DIR = join(ROOT, 'public/catalogue/images');
const DOWNLOAD_CACHE = join(ROOT, 'node_modules/.cache/catalogue');
const FRENCH_FILE = join(import.meta.dirname, 'translations/fr.json');

const IMAGE_WIDTH = 600;
const WEBP_QUALITY = 70;
const PARALLEL_DOWNLOADS = 8;

const { values: args } = parseArgs({ options: { commit: { type: 'string' } } });
const commit = args.commit ?? PINNED_COMMIT;
if (!/^[0-9a-f]{40}$/.test(commit))
  throw new Error(`--commit must be a full SHA, got ${commit}`);

const rawUrl = (path: string) =>
  `https://raw.githubusercontent.com/${SOURCE_REPOSITORY}/${commit}/${path}`;

async function download(path: string): Promise<Buffer> {
  const cached = join(DOWNLOAD_CACHE, commit, path);
  try {
    return await readFile(cached);
  } catch {
    const response = await fetch(rawUrl(path));
    if (!response.ok)
      throw new Error(`GET ${path}: HTTP ${String(response.status)}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    await mkdir(join(cached, '..'), { recursive: true });
    await writeFile(cached, bytes);
    return bytes;
  }
}

/** Re-encodes one source image; the content hash in its name lets it be cached forever. */
async function convertImage(
  id: string,
  index: number,
  sourcePath: string,
): Promise<string> {
  const webp = await sharp(await download(`exercises/${sourcePath}`))
    .resize({ width: IMAGE_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
  const hash = createHash('sha256').update(webp).digest('hex').slice(0, 10);
  const fileName = `${id}-${String(index)}-${hash}.webp`;
  await writeFile(join(IMAGE_DIR, fileName), webp);
  return fileName;
}

/** A hand-written French name and instructions, keyed by Catalogue id. */
interface Translation {
  name: string;
  instructions: string[];
}

const french = JSON.parse(await readFile(FRENCH_FILE, 'utf8')) as Record<
  string,
  Translation
>;

/** Every kept Exercise needs French with the same steps; leftovers mean an id changed. */
function translationProblems(kept: readonly SourceExercise[]): string[] {
  const keptIds = new Set(kept.map((source) => catalogueId(source.id)));
  const problems: string[] = [];
  for (const source of kept) {
    const id = catalogueId(source.id);
    const translation = french[id];
    if (translation === undefined) {
      problems.push(`${id}: no French`);
    } else if (translation.instructions.length !== source.instructions.length) {
      problems.push(
        `${id}: ${String(translation.instructions.length)} French steps for ${String(source.instructions.length)} English`,
      );
    }
  }
  for (const id of Object.keys(french)) {
    if (!keptIds.has(id))
      problems.push(`${id}: French for an Exercise that isn't kept`);
  }
  return problems;
}

async function toExercise(source: SourceExercise): Promise<Exercise> {
  const id = catalogueId(source.id);
  const translation = french[id];
  if (translation === undefined) throw new Error(`${id}: no French`);
  const { required, optional } = tagEquipment(source);
  const images: string[] = [];
  for (const [index, path] of source.images.entries()) {
    images.push(await convertImage(id, index, path));
  }
  return {
    id,
    kind: kindOf(source),
    name: { en: source.name, fr: translation.name },
    instructions: { en: source.instructions, fr: translation.instructions },
    level: levelOf(source.level),
    primaryMuscles: source.primaryMuscles.map(
      muscleName,
    ) as Exercise['primaryMuscles'],
    secondaryMuscles: source.secondaryMuscles.map(
      muscleName,
    ) as Exercise['secondaryMuscles'],
    strainedJoints: strainedJoints(source),
    requiredEquipment: required,
    optionalEquipment: optional,
    images,
  };
}

/** Runs `work` over `items` with at most `limit` in flight, keeping input order. */
async function inParallel<Item, Result>(
  items: readonly Item[],
  limit: number,
  work: (item: Item) => Promise<Result>,
): Promise<Result[]> {
  const results: Result[] = new Array<Result>(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await work(items[index] as Item);
    }
  };
  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

const sources = JSON.parse(
  (await download('dist/exercises.json')).toString('utf8'),
) as SourceExercise[];

const unknownOverrides = [
  ...Object.keys(OVERRIDES),
  ...Object.keys(JOINT_OVERRIDES),
].filter((id) => !sources.some((source) => source.id === id));
if (unknownOverrides.length > 0) {
  throw new Error(
    `Overrides name records missing at ${commit}: ${unknownOverrides.join(', ')}`,
  );
}

const kept = sources.filter(isHomeExercise);
const untranslated = translationProblems(kept);
if (untranslated.length > 0) {
  throw new Error(
    `Update ${FRENCH_FILE} first:\n${untranslated.map((problem) => `  - ${problem}`).join('\n')}`,
  );
}

await rm(IMAGE_DIR, { recursive: true, force: true });
await mkdir(IMAGE_DIR, { recursive: true });

const exercises = (await inParallel(kept, PARALLEL_DOWNLOADS, toExercise)).sort(
  (a, b) => a.id.localeCompare(b.id),
);

const catalogue = {
  source: { repository: `https://github.com/${SOURCE_REPOSITORY}`, commit },
  exercises,
};
await writeFile(CATALOGUE_FILE, `${JSON.stringify(catalogue, null, 2)}\n`);

const imageCount = (await readdir(IMAGE_DIR)).length;
console.log(
  `Imported ${String(exercises.length)} of ${String(sources.length)} exercises and ${String(imageCount)} images from ${SOURCE_REPOSITORY}@${commit.slice(0, 7)}.`,
);
