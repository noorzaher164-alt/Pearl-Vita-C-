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
  timeSeconds?: number; // per-question timer override
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
  streak: number;
  rank: number;
  time: number;
}

export interface GameResult {
  id: string;          // unique session ID
  gameId: string;
  gameTitle: string;
  sessionType: 'live' | 'solo';
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
  | 'host-game'
  | 'student-game'
  | 'results'
  | 'review'
  | 'admin'
  | 'test-bank';

export interface AppState {
  page: Page;
  selectedFolderId: string | null;
  selectedGameId: string | null;
  editGameId: string | null;
  studentPin: string | null;
  studentNickname: string | null;
}
