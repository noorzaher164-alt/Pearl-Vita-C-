export type GameType =
  | 'quiz-battle'
  | 'fastest-molecule'
  | 'periodic-challenge'
  | 'reaction-race'
  | 'energy-points'
  | 'match-terms'
  | 'word-search'
  | 'drag-drop'
  | 'true-false'
  | 'flashcards';

export interface Question {
  id: string;
  text: string;
  choices: string[];
  correctIndex: number;
  explanation?: string;
  imageUrl?: string;
}

export interface Game {
  id: string;
  title: string;
  folderId: string;
  lessonName: string;
  gameType: GameType;
  questions: Question[];
  createdAt: string;
  isCompetitive: boolean;
  pin?: string;        // 6-char student access code
  templateId?: string; // visual theme template
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  nickname: string;
  score: number;
  time: number;
}

export interface GameResult {
  gameId: string;
  leaderboard: LeaderboardEntry[];
  playedAt: string;
}

export type Page =
  | 'home'
  | 'student'
  | 'dashboard'
  | 'folder'
  | 'create-game'
  | 'play-game'
  | 'results'
  | 'review';

export interface AppState {
  page: Page;
  selectedFolderId: string | null;
  selectedGameId: string | null;
  editGameId: string | null;
}
