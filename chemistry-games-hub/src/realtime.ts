// Real-time multiplayer via Netlify Functions + Netlify Blobs
// Polls every 2 seconds — no external services, no setup, always works

export const FIREBASE_CONFIGURED = true;

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

const API = '/.netlify/functions/session';

// ── CRUD helpers ─────────────────────────────────────────────────────────

export async function createSession(pin: string, session: LiveSession): Promise<void> {
  const res = await fetch(`${API}?pin=${pin}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...session, students: {} }),
  });
  if (!res.ok) throw new Error(`Session create failed: ${res.status}`);
}

export async function deleteSession(pin: string): Promise<void> {
  await fetch(`${API}?pin=${pin}`, { method: 'DELETE' });
}

export async function getSession(pin: string): Promise<LiveSession | null> {
  try {
    const res = await fetch(`${API}?pin=${pin}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data && data.gameId ? buildSession(data) : null;
  } catch {
    return null;
  }
}

export function subscribeSession(
  pin: string,
  callback: (session: LiveSession | null) => void,
): () => void {
  let active = true;
  let lastHash = '';

  async function poll() {
    if (!active) return;
    try {
      const res = await fetch(`${API}?pin=${pin}`);
      const data = res.ok ? await res.json() : null;
      const hash = JSON.stringify(data);
      if (hash !== lastHash) {
        lastHash = hash;
        callback(data && data.gameId ? buildSession(data) : null);
      }
    } catch { /* ignore network blips */ }
    if (active) setTimeout(poll, 2000);
  }

  poll();
  return () => { active = false; };
}

export async function updateSession(pin: string, updates: Partial<LiveSession>): Promise<void> {
  const { students, ...rest } = updates as any;
  await fetch(`${API}?pin=${pin}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rest),
  });
}

export async function joinSession(pin: string, slot: StudentSlot): Promise<void> {
  await fetch(`${API}?pin=${pin}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      students: { [slot.nickname]: { nickname: slot.nickname, score: 0, streak: 0 } },
    }),
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
  const studentUpdate: Record<string, unknown> = { score, streak };
  studentUpdate[`ans_${questionIndex}`] = choiceIndex;
  await fetch(`${API}?pin=${pin}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ students: { [nickname]: studentUpdate } }),
  });
}

// ── helpers ───────────────────────────────────────────────────────────────

function buildSession(data: any): LiveSession {
  const students: Record<string, StudentSlot> = {};
  if (data.students && typeof data.students === 'object') {
    for (const [key, val] of Object.entries(data.students)) {
      const v = val as any;
      if (!v || !v.nickname) continue;
      const answers: Record<string, number> = {};
      for (const k of Object.keys(v)) {
        if (k.startsWith('ans_')) answers[k.replace('ans_', '')] = v[k];
      }
      students[key] = {
        nickname: v.nickname,
        score: v.score || 0,
        streak: v.streak || 0,
        answers,
        answeredAt: {},
      };
    }
  }
  return {
    gameId: data.gameId || '',
    templateId: data.templateId || 'periodic-table',
    gameType: data.gameType || 'quiz-battle',
    title: data.title || '',
    questionCount: data.questionCount || 0,
    status: data.status || 'waiting',
    currentQuestion: data.currentQuestion ?? 0,
    questionStartedAt: data.questionStartedAt || 0,
    students,
  };
}
