// Real-time multiplayer via Gun.js — no setup, no rules, works instantly
// Public relay servers sync data across all connected browsers
// @ts-ignore
import Gun from 'gun';

export const FIREBASE_CONFIGURED = true; // always available

export interface StudentSlot {
  nickname: string;
  score: number;
  streak: number;
  answers: Record<string, number>;
  answeredAt: Record<string, number>;
}

export interface LiveSession {
  gameId: string;
  templateId: string;
  gameType: string;
  title: string;
  questionCount: number;
  status: 'waiting' | 'playing' | 'reveal' | 'leaderboard' | 'finished';
  currentQuestion: number;
  questionStartedAt: number;
  students: Record<string, StudentSlot>;
}

// ── Gun instance (lazy) ──────────────────────────────────────────────────
let _gun: any = null;

function gun() {
  if (_gun) return _gun;
  _gun = Gun([
    'https://peer.wallie.io/gun',
    'https://gundb-relay-mlv5.onrender.com/gun',
    'https://gun.eco/gun',
  ]);
  return _gun;
}

// Namespace all keys so we don't clash with other Gun users
const NS = 'chem-hub-v1';

// ── CRUD helpers ─────────────────────────────────────────────────────────

export async function createSession(pin: string, session: LiveSession): Promise<void> {
  return new Promise((resolve, reject) => {
    const g = gun();
    if (!g) { reject(new Error('Gun not ready')); return; }
    const { students, ...meta } = session;
    g.get(NS).get(pin).put(meta, (ack: any) => {
      if (ack.err) reject(new Error(ack.err));
      else resolve();
    });
  });
}

export async function deleteSession(pin: string): Promise<void> {
  gun()?.get(NS)?.get(pin)?.put(null);
}

export async function getSession(pin: string): Promise<LiveSession | null> {
  return new Promise(resolve => {
    const g = gun();
    if (!g) { resolve(null); return; }
    let done = false;
    g.get(NS).get(pin).once((data: any) => {
      if (done) return;
      if (!data || !data.gameId) return; // Gun null fire — keep waiting
      done = true;
      resolve(buildSession(data, {}));
    });
    setTimeout(() => { if (!done) { done = true; resolve(null); } }, 8000);
  });
}

export function subscribeSession(
  pin: string,
  callback: (session: LiveSession | null) => void,
): () => void {
  const g = gun();
  if (!g) return () => {};

  // Cache of last-known data
  let lastMeta: any = {};
  let lastStudents: Record<string, StudentSlot> = {};

  const emit = () => callback(buildSession(lastMeta, lastStudents));

  // Subscribe to session meta
  const sessionNode = g.get(NS).get(pin);
  sessionNode.on((data: any) => {
    if (!data || !data.gameId) return; // ignore null/partial Gun.js fires
    lastMeta = { ...data };
    emit();
  });

  // Subscribe to all students
  sessionNode.get('students').map().on((data: any, key: string) => {
    if (!key || key === '_' || !data || typeof data !== 'object') return;
    if (data.nickname) {
      lastStudents = { ...lastStudents, [key]: sanitizeStudent(data) };
      emit();
    }
  });

  return () => {
    try { sessionNode.off(); } catch { /* */ }
  };
}

export async function updateSession(pin: string, updates: Partial<LiveSession>): Promise<void> {
  return new Promise((resolve) => {
    const { students, ...meta } = updates as any;
    const g = gun();
    if (!g) { resolve(); return; }
    g.get(NS).get(pin).put(meta, () => resolve());
  });
}

export async function joinSession(pin: string, slot: StudentSlot): Promise<void> {
  return new Promise((resolve) => {
    const g = gun();
    if (!g) { resolve(); return; }
    g.get(NS).get(pin).get('students').get(slot.nickname).put(
      { nickname: slot.nickname, score: 0, streak: 0 },
      () => resolve(),
    );
  });
}

export async function submitAnswer(
  pin: string,
  nickname: string,
  questionIndex: number,
  choiceIndex: number,
  score: number,
  streak: number,
): Promise<void> {
  return new Promise((resolve) => {
    const g = gun();
    if (!g) { resolve(); return; }
    const update: any = { score, streak };
    update[`ans_${questionIndex}`] = choiceIndex;
    g.get(NS).get(pin).get('students').get(nickname).put(update, () => resolve());
  });
}

// ── helpers ───────────────────────────────────────────────────────────────

function sanitizeStudent(data: any): StudentSlot {
  const answers: Record<string, number> = {};
  const answeredAt: Record<string, number> = {};
  Object.keys(data).forEach(k => {
    if (k.startsWith('ans_')) {
      const qi = k.replace('ans_', '');
      answers[qi] = data[k];
    }
  });
  return {
    nickname: data.nickname || '?',
    score: data.score || 0,
    streak: data.streak || 0,
    answers,
    answeredAt,
  };
}

function buildSession(meta: any, students: Record<string, StudentSlot>): LiveSession {
  return {
    gameId: meta.gameId || '',
    templateId: meta.templateId || 'periodic-table',
    gameType: meta.gameType || 'quiz-battle',
    title: meta.title || '',
    questionCount: meta.questionCount || 0,
    status: meta.status || 'waiting',
    currentQuestion: meta.currentQuestion ?? 0,
    questionStartedAt: meta.questionStartedAt || 0,
    students,
  };
}
