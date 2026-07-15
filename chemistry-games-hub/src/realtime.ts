// Real-time multiplayer via Netlify serverless function + HTTP polling.
// Teacher writes session state to the function; students poll every second.
// No WebRTC, no PeerJS, no STUN — works instantly and reliably on any network.

export const FIREBASE_CONFIGURED = true;

export interface StudentSlot {
  nickname: string;
  score: number;
  streak: number;
  answers: Record<string, number>;
  answeredAt: Record<string, number>;
}

export interface LiveQuestion {
  id: string;
  text: string;
  choices: string[];
  correctIndex: number;
  explanation?: string;
  timeSeconds?: number;
}

export interface LiveSession {
  gameId: string;
  templateId: string;
  gameType: string;
  title: string;
  questionCount: number;
  questions: LiveQuestion[];
  status: 'waiting' | 'playing' | 'reveal' | 'leaderboard' | 'finished';
  currentQuestion: number;
  questionStartedAt: number;
  students: Record<string, StudentSlot>;
}

const FN = '/.netlify/functions/session';

// ── Teacher API ───────────────────────────────────────────────────────────────

export async function createSession(pin: string, session: LiveSession): Promise<void> {
  const res = await fetch(`${FN}?pin=${pin}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...session, students: {} }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => String(res.status));
    throw new Error(text || `HTTP ${res.status}`);
  }
}

export async function updateSession(pin: string, updates: Partial<LiveSession>): Promise<void> {
  await fetch(`${FN}?pin=${pin}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
}

export async function deleteSession(pin: string): Promise<void> {
  await fetch(`${FN}?pin=${pin}`, { method: 'DELETE' });
}

// ── Subscription (works for both teacher and student) ─────────────────────────

export function subscribeSession(
  pin: string,
  callback: (session: LiveSession | null) => void,
): () => void {
  let active = true;

  async function poll() {
    if (!active) return;
    try {
      const res = await fetch(`${FN}?pin=${pin}`, { cache: 'no-store' });
      if (res.ok) {
        const data: LiveSession | null = await res.json();
        callback(data);
      }
    } catch { /* network error — retry next tick */ }
    if (active) setTimeout(poll, 1000);
  }

  poll();
  return () => { active = false; };
}

// ── Student API ───────────────────────────────────────────────────────────────

export async function getSession(pin: string): Promise<LiveSession | null> {
  try {
    const res = await fetch(`${FN}?pin=${pin}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

export async function joinSession(pin: string, slot: StudentSlot): Promise<void> {
  await fetch(`${FN}?pin=${pin}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      students: { [slot.nickname]: { nickname: slot.nickname, score: 0, streak: 0, answers: {}, answeredAt: {} } },
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
  await fetch(`${FN}?pin=${pin}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      students: {
        [nickname]: { score, streak, answers: { [questionIndex]: choiceIndex } },
      },
    }),
  });
}
