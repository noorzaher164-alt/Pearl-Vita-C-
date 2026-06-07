import type { Folder, Game, GameResult } from './types';
import { DEMO_FOLDERS, DEMO_GAMES } from './demoData';

// ── KEYS ──────────────────────────────────────────────────────────────────────
const FOLDERS_KEY = 'cgh_folders';
const GAMES_KEY = 'cgh_games';
const RESULTS_KEY = 'cgh_results';

// ── INIT ──────────────────────────────────────────────────────────────────────
// TODO: Replace localStorage with Supabase/Firebase calls here
function init() {
  if (!localStorage.getItem(FOLDERS_KEY)) {
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(DEMO_FOLDERS));
  }
  if (!localStorage.getItem(GAMES_KEY)) {
    localStorage.setItem(GAMES_KEY, JSON.stringify(DEMO_GAMES));
  }
}

init();

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
  results.unshift(result);
  localStorage.setItem(RESULTS_KEY, JSON.stringify(results.slice(0, 100)));
}

export function getResultsByGame(gameId: string): GameResult[] {
  return getResults().filter(r => r.gameId === gameId);
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
