import 'server-only';

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { Database } from '@/lib/domain/types';
import { createSeedDatabase } from '@/data/seed';

/**
 * The local data adapter.
 *
 * It holds the relational sample dataset in memory and writes through to a JSON file
 * so changes made while reviewing the platform survive a reload. It exists so the
 * whole interface is previewable with zero configuration; when the Supabase
 * environment variables are present the Supabase adapter takes over and this file is
 * bypassed entirely (see `src/lib/db/index.ts`).
 */

const DATA_FILE = join(process.cwd(), '.data', 'aecc.json');
const SCHEMA_VERSION = 5;

interface Persisted {
  version: number;
  db: Database;
}

declare global {
  // eslint-disable-next-line no-var
  var __aeccDb: Database | undefined;
  // eslint-disable-next-line no-var
  var __aeccDbPromise: Promise<Database> | undefined;
}

function readFromDisk(): Database | null {
  try {
    if (!existsSync(DATA_FILE)) return null;
    const parsed = JSON.parse(readFileSync(DATA_FILE, 'utf8')) as Persisted;
    if (parsed.version !== SCHEMA_VERSION || !parsed.db?.users?.length) return null;
    return parsed.db;
  } catch {
    return null;
  }
}

function writeToDisk(db: Database): void {
  try {
    mkdirSync(dirname(DATA_FILE), { recursive: true });
    writeFileSync(DATA_FILE, JSON.stringify({ version: SCHEMA_VERSION, db } satisfies Persisted), 'utf8');
  } catch {
    // A read-only filesystem (some hosting targets) is not an error: the dataset simply
    // lives for the lifetime of the process.
  }
}

async function load(): Promise<Database> {
  const fromDisk = readFromDisk();
  if (fromDisk) return fromDisk;
  const seeded = await createSeedDatabase();
  writeToDisk(seeded);
  return seeded;
}

/** Resolves the shared database instance, seeding it on first use. */
export async function db(): Promise<Database> {
  if (globalThis.__aeccDb) return globalThis.__aeccDb;
  if (!globalThis.__aeccDbPromise) {
    globalThis.__aeccDbPromise = load().then((loaded) => {
      globalThis.__aeccDb = loaded;
      return loaded;
    });
  }
  return globalThis.__aeccDbPromise;
}

/** Applies a mutation to the shared instance and persists it. */
export async function write<T>(mutate: (database: Database) => T): Promise<T> {
  const database = await db();
  const result = mutate(database);
  writeToDisk(database);
  return result;
}

/** Sequential id generator scoped to a table, e.g. `nextId(db.tasks, 't')`. */
export function nextId(rows: { id: string }[], prefix: string, width = 3): string {
  let max = 0;
  for (const row of rows) {
    const numeric = Number.parseInt(row.id.split('-').pop() ?? '0', 10);
    if (Number.isFinite(numeric) && numeric > max) max = numeric;
  }
  return `${prefix}-${String(max + 1).padStart(width, '0')}`;
}
