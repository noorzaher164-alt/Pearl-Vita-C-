// Real-time multiplayer via PeerJS WebRTC DataChannels
// Teacher's browser acts as the server; students connect directly.
// No backend, no rules, no setup — works instantly across devices.
// @ts-ignore
import Peer from 'peerjs';

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
  roomSecret?: string; // included in peer ID so rooms aren't guessable from PIN alone
}

const SESSIONS_FN = '/.netlify/functions/session';

async function storeRoomId(pin: string, peerId: string) {
  try {
    await fetch(`${SESSIONS_FN}?pin=__meta_${pin}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ peerId }),
    });
  } catch { /**/ }
}

async function fetchRoomId(pin: string): Promise<string | null> {
  try {
    const res = await fetch(`${SESSIONS_FN}?pin=__meta_${pin}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.peerId ?? null;
  } catch { return null; }
}

async function clearRoomId(pin: string) {
  try {
    await fetch(`${SESSIONS_FN}?pin=__meta_${pin}`, { method: 'DELETE' });
  } catch { /**/ }
}

// ── Module-level state ────────────────────────────────────────────────────

// Teacher side
let hostPeer: any = null;
let hostSession: LiveSession | null = null;
let hostConns: Map<string, any> = new Map(); // nickname → DataConnection
let hostCallbacks: Set<(s: LiveSession | null) => void> = new Set();
let hostRoomSecret = ''; // random suffix added to peer ID so rooms aren't guessable from PIN

// Student side
let clientPeer: any = null;
let clientConn: any = null;
let clientCallbacks: Map<string, Set<(s: LiveSession | null) => void>> = new Map();

function makePeerId(pin: string, secret: string) {
  return `chem-hub-${pin}-${secret}`;
}

function randomSecret(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(6)))
    .map(b => b.toString(36))
    .join('');
}

function broadcastToStudents(session: LiveSession) {
  hostConns.forEach(conn => {
    if (conn.open) conn.send({ type: 'session', session });
  });
}

function notifyHostCallbacks() {
  const s = hostSession;
  if (!s) return;
  hostCallbacks.forEach(cb => cb(s));
}

// ── Teacher API ───────────────────────────────────────────────────────────

export async function createSession(pin: string, session: LiveSession): Promise<void> {
  hostRoomSecret = randomSecret();
  hostSession = { ...session, students: {}, roomSecret: hostRoomSecret };

  return new Promise((resolve, reject) => {
    // Destroy any existing host peer
    if (hostPeer) { try { hostPeer.destroy(); } catch { /**/ } }

    const peerId = makePeerId(pin, hostRoomSecret);
    hostPeer = new Peer(peerId, {
      host: '0.peerjs.com',
      port: 443,
      path: '/',
      secure: true,
    });

    hostPeer.on('open', () => { storeRoomId(pin, peerId); resolve(); });
    hostPeer.on('error', (err: any) => reject(err));

    hostPeer.on('connection', (conn: any) => {
      conn.on('open', () => {
        // Send current session state immediately
        conn.send({ type: 'session', session: hostSession });
      });
      conn.on('data', (msg: any) => {
        if (!hostSession) return;
        if (msg.type === 'join') {
          const slot: StudentSlot = { ...msg.slot, answers: {}, answeredAt: {} };
          hostSession = { ...hostSession, students: { ...hostSession.students, [slot.nickname]: slot } };
          hostConns.set(slot.nickname, conn);
          broadcastToStudents(hostSession);
          notifyHostCallbacks();
        } else if (msg.type === 'answer') {
          const { nickname, questionIndex, choiceIndex, score, streak } = msg;
          const existing = hostSession.students[nickname] || { nickname, score: 0, streak: 0, answers: {}, answeredAt: {} };
          hostSession = {
            ...hostSession,
            students: {
              ...hostSession.students,
              [nickname]: { ...existing, score, streak, answers: { ...existing.answers, [questionIndex]: choiceIndex } },
            },
          };
          broadcastToStudents(hostSession);
          notifyHostCallbacks();
        } else if (msg.type === 'get-session') {
          conn.send({ type: 'session', session: hostSession });
        }
      });
      conn.on('close', () => {
        // Don't remove student — keep their score visible
      });
    });
  });
}

export async function deleteSession(pin: string): Promise<void> {
  if (hostPeer) { try { hostPeer.destroy(); } catch { /**/ } }
  hostPeer = null;
  hostSession = null;
  hostRoomSecret = '';
  hostConns.clear();
  hostCallbacks.clear();
  clearRoomId(pin);
}

export function subscribeSession(
  pin: string,
  callback: (session: LiveSession | null) => void,
): () => void {
  // Determine if we're the host (hostSession exists for this pin)
  if (hostSession && hostPeer) {
    // Teacher side
    hostCallbacks.add(callback);
    callback(hostSession); // immediate call with current state
    return () => hostCallbacks.delete(callback);
  }

  // Student side — connect to teacher's peer
  if (!clientCallbacks.has(pin)) clientCallbacks.set(pin, new Set());
  const cbs = clientCallbacks.get(pin)!;
  cbs.add(callback);

  let resolvedPeerId: string | null = null;

  async function connectToHost() {
    if (!resolvedPeerId) {
      // First try: peer ID stored in Netlify function (has secret suffix)
      const stored = await fetchRoomId(pin);
      resolvedPeerId = stored ?? makePeerId(pin, ''); // fallback for old-format rooms
    }

    if (clientPeer && !clientPeer.destroyed) {
      openConnection(resolvedPeerId);
      return;
    }
    clientPeer = new Peer({
      host: '0.peerjs.com',
      port: 443,
      path: '/',
      secure: true,
    });
    clientPeer.on('open', () => openConnection(resolvedPeerId!));
    clientPeer.on('error', () => {});
  }

  function openConnection(peerId: string) {
    if (clientConn && clientConn.open) {
      clientConn.send({ type: 'get-session' });
      return;
    }
    clientConn = clientPeer.connect(peerId, { reliable: true });
    clientConn.on('open', () => {
      clientConn.send({ type: 'get-session' });
    });
    clientConn.on('data', (msg: any) => {
      if (msg.type === 'session') {
        const cbs2 = clientCallbacks.get(pin);
        cbs2?.forEach(cb => cb(msg.session));
      }
    });
    clientConn.on('close', () => {
      setTimeout(() => connectToHost(), 2000);
    });
    clientConn.on('error', () => {
      setTimeout(() => connectToHost(), 2000);
    });
  }

  connectToHost();

  return () => {
    cbs.delete(callback);
    if (cbs.size === 0) {
      clientCallbacks.delete(pin);
      if (clientConn) { try { clientConn.close(); } catch { /**/ } clientConn = null; }
    }
  };
}

export async function updateSession(_pin: string, updates: Partial<LiveSession>): Promise<void> {
  if (!hostSession) return;
  const { students, ...rest } = updates as any;
  hostSession = { ...hostSession, ...rest };
  broadcastToStudents(hostSession!);
  notifyHostCallbacks();
}

export async function getSession(pin: string): Promise<LiveSession | null> {
  // Look up the secret-bearing peer ID from the Netlify function first
  const storedPeerId = await fetchRoomId(pin);
  const peerId = storedPeerId ?? makePeerId(pin, ''); // fallback for rooms without secret

  return new Promise(resolve => {
    let done = false;
    let testPeer: any = null;

    try {
      testPeer = new Peer({
        host: '0.peerjs.com',
        port: 443,
        path: '/',
        secure: true,
      });

      testPeer.on('open', () => {
        const conn = testPeer.connect(peerId, { reliable: true });
        conn.on('open', () => {
          conn.send({ type: 'get-session' });
        });
        conn.on('data', (msg: any) => {
          if (done) return;
          if (msg.type === 'session' && msg.session?.gameId) {
            done = true;
            clientPeer = testPeer;
            clientConn = conn;
            resolve(msg.session);
          }
        });
        conn.on('error', () => { if (!done) { done = true; resolve(null); } });
      });
      testPeer.on('error', () => { if (!done) { done = true; resolve(null); } });
      // 8-second timeout with clear failure (fix #8)
      setTimeout(() => { if (!done) { done = true; try { testPeer?.destroy(); } catch { /**/ } resolve(null); } }, 8000);
    } catch {
      resolve(null);
    }
  });
}

export async function joinSession(_pin: string, slot: StudentSlot): Promise<void> {
  return new Promise(resolve => {
    function sendJoin() {
      if (clientConn?.open) {
        clientConn.send({ type: 'join', slot: { nickname: slot.nickname, score: 0, streak: 0 } });
        resolve();
      } else {
        setTimeout(sendJoin, 500);
      }
    }
    sendJoin();
  });
}

export async function submitAnswer(
  _pin: string,
  nickname: string,
  questionIndex: number,
  choiceIndex: number,
  score: number,
  streak: number,
): Promise<void> {
  if (clientConn?.open) {
    clientConn.send({ type: 'answer', nickname, questionIndex, choiceIndex, score, streak });
  }
}
