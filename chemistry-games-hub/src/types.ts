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
  gradeId?: string;    // 'grade10' | 'grade11' | 'grade12chem' | 'grade12sci'
  semesterId?: string; // 's1' | 's2'
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

export type UserRole = 'admin' | 'teacher' | 'student';
export type QuestionType = 'mcq' | 'true-false' | 'short-answer' | 'yes-no';

export interface User {
  id: string;
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
}

export interface CustomBankFolder {
  id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: string;
}

export interface CustomBankQuestion {
  id: string;
  folderId: string;
  text: string;
  questionType: QuestionType;
  choices: string[];
  correctIndex: number;
  explanation?: string;
  createdAt: string;
}

export type Page =
  | 'home'
  | 'login'
  | 'admin-panel'
  | 'custom-bank'
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
  testBankSemester?: 's1' | 's2';
}
