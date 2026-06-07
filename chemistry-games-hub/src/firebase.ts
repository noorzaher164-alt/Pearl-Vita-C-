import { initializeApp } from 'firebase/app';
import {
  getDatabase, ref, set, get, onValue, update, remove, off,
  type Database, type DataSnapshot,
} from 'firebase/database';

export const FIREBASE_CONFIGURED = !!(import.meta.env.VITE_FIREBASE_DATABASE_URL);

let _db: Database | null = null;

if (FIREBASE_CONFIGURED) {
  const app = initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  });
  _db = getDatabase(app);
}

export const db = _db;
export { ref, set, get, onValue, update, remove, type DataSnapshot };

// ── Session types ──────────────────────────────────────────────────────────

export interface StudentSlot {
  nickname: string;
  score: number;
  streak: number;
  answers: Record<number, number>; // questionIndex → choiceIndex
  answeredAt: Record<number, number>; // questionIndex → timestamp
}

export interface LiveSession {
  gameId: string;
  templateId: string;
  gameType: string;
  title: string;
  questionCount: number;
  status: 'waiting' | 'playing' | 'reveal' | 'leaderboard' | 'finished';
  currentQuestion: number;
  questionStartedAt: number; // server ms timestamp
  students: Record<string, StudentSlot>;
}

// ── CRUD helpers ───────────────────────────────────────────────────────────

export async function createSession(pin: string, session: LiveSession) {
  if (!db) return;
  await set(ref(db, `sessions/${pin}`), session);
}

export async function deleteSession(pin: string) {
  if (!db) return;
  await remove(ref(db, `sessions/${pin}`));
}

export async function getSession(pin: string): Promise<LiveSession | null> {
  if (!db) return null;
  const snap = await get(ref(db, `sessions/${pin}`));
  return snap.exists() ? (snap.val() as LiveSession) : null;
}

export function subscribeSession(
  pin: string,
  callback: (session: LiveSession | null) => void,
): () => void {
  if (!db) return () => {};
  const r = ref(db, `sessions/${pin}`);
  onValue(r, (snap: DataSnapshot) => {
    callback(snap.exists() ? (snap.val() as LiveSession) : null);
  });
  return () => { off(r); };
}

export async function updateSession(pin: string, updates: Partial<LiveSession>) {
  if (!db) return;
  await update(ref(db, `sessions/${pin}`), updates);
}

export async function joinSession(pin: string, slot: StudentSlot) {
  if (!db) return;
  await set(ref(db, `sessions/${pin}/students/${slot.nickname}`), slot);
}

export async function submitAnswer(
  pin: string,
  nickname: string,
  questionIndex: number,
  choiceIndex: number,
  score: number,
  streak: number,
) {
  if (!db) return;
  await update(ref(db, `sessions/${pin}/students/${nickname}`), {
    score,
    streak,
    [`answers/${questionIndex}`]: choiceIndex,
    [`answeredAt/${questionIndex}`]: Date.now(),
  });
}
