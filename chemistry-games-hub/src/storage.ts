import type { Folder, Game, GameResult, CustomBankFolder, CustomBankQuestion } from './types';

// ── KEYS ──────────────────────────────────────────────────────────────────────
const FOLDERS_KEY = 'cgh_folders';
const GAMES_KEY = 'cgh_games';
const RESULTS_KEY = 'cgh_results';
const VERSION_KEY = 'cgh_version';
const CURRENT_VERSION = '3'; // increment when a breaking migration is needed

// ── MIGRATION ─────────────────────────────────────────────────────────────────
// v3: remove old demo folders (f1-f5) and their games; start fresh with grade structure
function migrate() {
  const v = localStorage.getItem(VERSION_KEY);
  if (v === CURRENT_VERSION) return;

  // Remove old demo folder IDs and their games
  const OLD_DEMO_IDS = new Set(['f1', 'f2', 'f3', 'f4', 'f5']);
  const folders: Folder[] = JSON.parse(localStorage.getItem(FOLDERS_KEY) || '[]');
  const cleanFolders = folders.filter(f => !OLD_DEMO_IDS.has(f.id));
  const games: Game[] = JSON.parse(localStorage.getItem(GAMES_KEY) || '[]');
  const cleanGames = games.filter(g => !OLD_DEMO_IDS.has(g.folderId));

  localStorage.setItem(FOLDERS_KEY, JSON.stringify(cleanFolders));
  localStorage.setItem(GAMES_KEY, JSON.stringify(cleanGames));
  localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
}

migrate();

// ── FOLDERS ───────────────────────────────────────────────────────────────────
export function getFolders(): Folder[] {
  // TODO: await supabase.from('folders').select('*')
  return JSON.parse(localStorage.getItem(FOLDERS_KEY) || '[]');
}

export function saveFolder(folder: Folder) {
  const folders = getFolders();
  const idx = folders.findIndex(f => f.id === folder.id);
  if (idx >= 0) folders[idx] = folder;
  else folders.push(folder);
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
}

export function deleteFolder(id: string) {
  const folders = getFolders().filter(f => f.id !== id);
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
  // Delete associated games
  const games = getGames().filter(g => g.folderId !== id);
  localStorage.setItem(GAMES_KEY, JSON.stringify(games));
}

// ── GAMES ─────────────────────────────────────────────────────────────────────
export function getGames(): Game[] {
  // TODO: await supabase.from('games').select('*')
  return JSON.parse(localStorage.getItem(GAMES_KEY) || '[]');
}

export function getGamesByFolder(folderId: string): Game[] {
  return getGames().filter(g => g.folderId === folderId);
}

export function getGameById(id: string): Game | undefined {
  return getGames().find(g => g.id === id);
}

export function saveGame(game: Game) {
  const games = getGames();
  const idx = games.findIndex(g => g.id === game.id);
  if (idx >= 0) games[idx] = game;
  else games.push(game);
  localStorage.setItem(GAMES_KEY, JSON.stringify(games));
}

export function deleteGame(id: string) {
  const games = getGames().filter(g => g.id !== id);
  localStorage.setItem(GAMES_KEY, JSON.stringify(games));
}

export function duplicateGame(id: string): Game | null {
  const game = getGameById(id);
  if (!game) return null;
  const copy: Game = {
    ...game,
    id: crypto.randomUUID(),
    title: `${game.title} (Copy)`,
    createdAt: new Date().toISOString(),
  };
  saveGame(copy);
  return copy;
}

// ── RESULTS ───────────────────────────────────────────────────────────────────
export function getResults(): GameResult[] {
  return JSON.parse(localStorage.getItem(RESULTS_KEY) || '[]');
}

export function saveResult(result: GameResult) {
  const results = getResults();
  // Replace existing record with same id, otherwise prepend
  const idx = results.findIndex(r => r.id === result.id);
  if (idx >= 0) results[idx] = result;
  else results.unshift(result);
  localStorage.setItem(RESULTS_KEY, JSON.stringify(results.slice(0, 200)));
}

export function getResultsByGame(gameId: string): GameResult[] {
  return getResults().filter(r => r.gameId === gameId);
}

// ── CUSTOM BANK ───────────────────────────────────────────────────────────────
const CB_FOLDERS_KEY = 'cgh_cb_folders';
const CB_QUESTIONS_KEY = 'cgh_cb_questions';

export function getCBFolders(): CustomBankFolder[] {
  return JSON.parse(localStorage.getItem(CB_FOLDERS_KEY) || '[]');
}
export function saveCBFolder(f: CustomBankFolder) {
  const arr = getCBFolders();
  const idx = arr.findIndex(x => x.id === f.id);
  if (idx >= 0) arr[idx] = f; else arr.push(f);
  localStorage.setItem(CB_FOLDERS_KEY, JSON.stringify(arr));
}
export function deleteCBFolder(id: string) {
  localStorage.setItem(CB_FOLDERS_KEY, JSON.stringify(getCBFolders().filter(f => f.id !== id)));
  localStorage.setItem(CB_QUESTIONS_KEY, JSON.stringify(getCBQuestions().filter(q => q.folderId !== id)));
}
export function getCBQuestions(folderId?: string): CustomBankQuestion[] {
  const all: CustomBankQuestion[] = JSON.parse(localStorage.getItem(CB_QUESTIONS_KEY) || '[]');
  return folderId ? all.filter(q => q.folderId === folderId) : all;
}
export function saveCBQuestion(q: CustomBankQuestion) {
  const arr = getCBQuestions();
  const idx = arr.findIndex(x => x.id === q.id);
  if (idx >= 0) arr[idx] = q; else arr.push(q);
  localStorage.setItem(CB_QUESTIONS_KEY, JSON.stringify(arr));
}
export function deleteCBQuestion(id: string) {
  localStorage.setItem(CB_QUESTIONS_KEY, JSON.stringify(getCBQuestions().filter(q => q.id !== id)));
}

// ── PIN SYSTEM ────────────────────────────────────────────────────────────────
export function generatePin(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function assignPinToGame(gameId: string): string {
  const games = getGames();
  const game = games.find(g => g.id === gameId);
  if (!game) return '';
  const pin = generatePin();
  game.pin = pin;
  localStorage.setItem(GAMES_KEY, JSON.stringify(games));
  // TODO: await supabase.from('games').update({ pin }).eq('id', gameId)
  return pin;
}
