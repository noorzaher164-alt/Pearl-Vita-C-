import { MemoryStore, BrandInfo, ProjectInfo } from './types';
import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Default empty memory structure
// ---------------------------------------------------------------------------

const DEFAULT_MEMORY: MemoryStore = {
  user_preferences: {},
  brands: {},
  projects: {},
  teaching: {},
};

// ---------------------------------------------------------------------------
// Storage path -- JSON file at the project root
// ---------------------------------------------------------------------------

const MEMORY_DIR = path.resolve(process.cwd(), 'memory');
const MEMORY_FILE = path.join(MEMORY_DIR, 'store.json');

// ---------------------------------------------------------------------------
// In-memory cache
// ---------------------------------------------------------------------------

let memoryCache: MemoryStore | null = null;

// ---------------------------------------------------------------------------
// File I/O helpers
// ---------------------------------------------------------------------------

function ensureDirectory(): void {
  try {
    if (!fs.existsSync(MEMORY_DIR)) {
      fs.mkdirSync(MEMORY_DIR, { recursive: true });
    }
  } catch {
    // Running in an environment without filesystem access (e.g., edge runtime)
    // -- fall back to pure in-memory mode.
  }
}

function loadFromDisk(): MemoryStore {
  try {
    if (fs.existsSync(MEMORY_FILE)) {
      const raw = fs.readFileSync(MEMORY_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      // Merge with defaults so new keys are always present
      return {
        ...DEFAULT_MEMORY,
        ...parsed,
        user_preferences: { ...DEFAULT_MEMORY.user_preferences, ...parsed.user_preferences },
        brands: { ...DEFAULT_MEMORY.brands, ...parsed.brands },
        projects: { ...DEFAULT_MEMORY.projects, ...parsed.projects },
        teaching: { ...DEFAULT_MEMORY.teaching, ...parsed.teaching },
      };
    }
  } catch {
    // Corrupt or inaccessible file -- start fresh
  }
  return structuredClone(DEFAULT_MEMORY);
}

function saveToDisk(store: MemoryStore): void {
  try {
    ensureDirectory();
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch {
    // Silently fail in environments where writing is not possible
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns the current memory store, loading from disk on first access.
 */
export function getMemory(): MemoryStore {
  if (!memoryCache) {
    memoryCache = loadFromDisk();
  }
  return memoryCache;
}

/**
 * Update a value in one of the memory categories.
 *
 * @param category - One of the top-level MemoryStore keys.
 * @param key      - The key within that category.
 * @param value    - The value to store (string for simple categories,
 *                   BrandInfo for 'brands', ProjectInfo for 'projects').
 */
export function updateMemory(
  category: keyof MemoryStore,
  key: string,
  value: string | BrandInfo | ProjectInfo,
): void {
  const store = getMemory();

  switch (category) {
    case 'user_preferences':
      store.user_preferences[key] = value as string;
      break;
    case 'brands':
      store.brands[key] = value as BrandInfo;
      break;
    case 'projects':
      store.projects[key] = value as ProjectInfo;
      break;
    case 'teaching':
      store.teaching[key] = value as string;
      break;
    default: {
      // Exhaustiveness check
      const _never: never = category;
      throw new Error(`Unknown memory category: ${_never}`);
    }
  }

  saveToDisk(store);
}

/**
 * Delete a key from a memory category.
 */
export function deleteMemory(category: keyof MemoryStore, key: string): void {
  const store = getMemory();

  switch (category) {
    case 'user_preferences':
      delete store.user_preferences[key];
      break;
    case 'brands':
      delete store.brands[key];
      break;
    case 'projects':
      delete store.projects[key];
      break;
    case 'teaching':
      delete store.teaching[key];
      break;
    default: {
      const _never: never = category;
      throw new Error(`Unknown memory category: ${_never}`);
    }
  }

  saveToDisk(store);
}

/**
 * Reset the entire memory store to its default empty state.
 * Overwrites both the in-memory cache and the disk file.
 */
export function resetMemory(): void {
  memoryCache = structuredClone(DEFAULT_MEMORY);
  saveToDisk(memoryCache);
}

/**
 * Force-reload the memory from disk, discarding the in-memory cache.
 * Useful after external edits to the store.json file.
 */
export function reloadMemory(): MemoryStore {
  memoryCache = loadFromDisk();
  return memoryCache;
}
