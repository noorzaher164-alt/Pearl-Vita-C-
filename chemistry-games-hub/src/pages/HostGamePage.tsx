import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { Game } from '../types';
import { getGameById } from '../storage';
import { getTemplate } from '../templates';
import {
  FIREBASE_CONFIGURED, createSession, subscribeSession, updateSession,
  deleteSession, type LiveSession,
} from '../firebase';

function joinUrl(pin: string) {
  return `${window.location.origin}${window.location.pathname}?join=${pin}`;
}

interface Props {
  gameId: string;
  onBack: () => void;
}

const TIMER_SECS: Record<string, number> = {
  'quiz-battle': 20, 'fastest-molecule': 10, 'periodic-challenge': 25,
  'reaction-race': 15, 'energy-points': 20,
};
const COMPETITIVE = ['quiz-battle', 'fastest-molecule', 'periodic-challenge', 'reaction-race', 'energy-points'];

export default function HostGamePage({ gameId, onBack }: Props) {
  const [game, setGame] = useState<Game | null>(null);
  const [session, setSession] = useState<LiveSession | null>(null);
  const [phase, setPhase] = useState<'setup' | 'waiting' | 'playing' | 'finished'>('setup');
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  const pin = game?.pin || '';
  const tpl = getTemplate(game?.templateId || 'periodic-table');
  const isCompetitive = game ? COMPETITIVE.includes(game.gameType) : true;
  const maxTime = game ? (TIMER_SECS[game.gameType] || 20) : 20;

  useEffect(() => {
    const g = getGameById(gameId);
    if (g) setGame(g);
    return () => {
      if (unsubRef.current) unsubRef.current();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameId]);

  useEffect(() => {
    if (!pin || phase !== 'waiting') return;
    unsubRef.current = subscribeSession(pin, s => {
      if (s) setSession(s);
    });
    return () => { if (unsubRef.current) unsubRef.current(); };
  }, [pin, phase]);

  const startHosting = async () => {
    if (!game) return;
    const s: LiveSession = {
      gameId: game.id,
      templateId: game.templateId || 'periodic-table',
      gameType: game.gameType,
      title: game.title,
      questionCount: game.questions.length,
      status: 'waiting',
      currentQuestion: 0,
      questionStartedAt: 0,
      students: {},
    };
    await createSession(pin, s);
    setSession(s);
    setPhase('waiting');
  };

  const startGame = async () => {
    if (!session) return;
    const now = Date.now();
    await updateSession(pin, { status: 'playing', currentQuestion: 0, questionStartedAt: now });
    setPhase('playing');
    startQuestionTimer();
  };

  const startQuestionTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(maxTime);
    let t = maxTime;
    timerRef.current = setInterval(() => {
      t--;
      setTimeLeft(t);
      if (t <= 0) {
        clearInterval(timerRef.current!);
        revealAnswer();
      }
    }, 1000);
  };

  const revealAnswer = async () => {
    await updateSession(pin, { status: 'reveal' });
    setTimeout(async () => {
      await updateSession(pin, { status: 'leaderboard' });
    }, 3000);
  };

  const nextQuestion = async () => {
    if (!session || !game) return;
    const nextQ = (session.currentQuestion ?? 0) + 1;
    if (nextQ >= game.questions.length) {
      await updateSession(pin, { status: 'finished' });
      setPhase('finished');
      return;
    }
    const now = Date.now();
    await updateSession(pin, {
      status: 'playing',
      currentQuestion: nextQ,
      questionStartedAt: now,
    });
    setSession(prev => prev ? { ...prev, currentQuestion: nextQ, status: 'playing' } : prev);
    startQuestionTimer();
  };

  const endSession = async () => {
    await deleteSession(pin);
    onBack();
  };

  const students = session ? Object.values(session.students) : [];
  const sorted = [...students].sort((a, b) => b.score - a.score);

  const currentQ = game?.questions[session?.currentQuestion ?? 0];
  const answeredCount = currentQ
    ? students.filter(s => (session?.currentQuestion ?? 0) in (s.answers || {})).length
    : 0;

  // ── Setup screen (Firebase not configured) ────────────────────────────────
  if (!FIREBASE_CONFIGURED) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a0a1a,#1a0a2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 560, textAlign: 'center' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>⚙️</div>
          <h2 style={{ color: 'white', fontSize: 26, fontWeight: 800, marginBottom: 12 }}>Firebase Setup Required</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 24 }}>
            To host live multiplayer games, add these environment variables to your Netlify site settings under <strong style={{ color: '#c084fc' }}>Environment Variables</strong>:
          </p>
          <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(192,132,252,0.3)', borderRadius: 14, padding: '16px 20px', textAlign: 'left', fontFamily: 'monospace', fontSize: 12, color: '#c084fc', marginBottom: 24, lineHeight: 2 }}>
            VITE_FIREBASE_API_KEY=...<br/>
            VITE_FIREBASE_AUTH_DOMAIN=...<br/>
            VITE_FIREBASE_DATABASE_URL=...<br/>
            VITE_FIREBASE_PROJECT_ID=...<br/>
            VITE_FIREBASE_STORAGE_BUCKET=...<br/>
            VITE_FIREBASE_MESSAGING_SENDER_ID=...<br/>
            VITE_FIREBASE_APP_ID=...
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 24 }}>
            Create a free project at <strong>console.firebase.google.com</strong> → Enable Realtime Database → Copy config
          </p>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 12, padding: '12px 28px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15 }}>← Back</button>
        </div>
      </div>
    );
  }

  // ── Setup screen ──────────────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <div style={{ minHeight: '100vh', background: tpl.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 500, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🎮</div>
          <h1 style={{ color: 'white', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>{game?.title}</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>{game?.lessonName} • {game?.questions.length} questions</p>
          <div style={{ background: `${tpl.accentColor}20`, border: `1px solid ${tpl.accentColor}50`, borderRadius: 14, padding: '20px', marginBottom: 28, marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <div style={{ background: 'white', padding: 10, borderRadius: 12 }}>
                <QRCodeSVG value={joinUrl(pin)} size={110} />
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 4 }}>📱 Scan to join — or enter PIN:</p>
            <p style={{ color: tpl.accentColor, fontSize: 42, fontWeight: 900, letterSpacing: 8, fontFamily: 'monospace' }}>{pin}</p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, wordBreak: 'break-all' }}>{joinUrl(pin)}</p>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 12, padding: '14px 24px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15 }}>← Back</button>
            <button onClick={startHosting} style={{ background: `linear-gradient(135deg, ${tpl.accentColor}, ${tpl.choiceColors[0]})`, color: 'white', border: 'none', borderRadius: 12, padding: '14px 36px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 17, fontWeight: 800 }}>
              🚀 Host Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Waiting room ──────────────────────────────────────────────────────────
  if (phase === 'waiting') {
    return (
      <div style={{ minHeight: '100vh', background: tpl.bg, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ background: tpl.headerBg, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Hosting: {game?.title}</div>
            <div style={{ color: 'white', fontWeight: 700 }}>{students.length} students joined</div>
          </div>
          <button onClick={endSession} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>End</button>
        </div>

        <div style={{ flex: 1, display: 'flex', gap: 24, padding: 24, maxWidth: 960, margin: '0 auto', width: '100%' }}>
          {/* PIN display */}
          <div style={{ flex: 1 }}>
            <div style={{ background: tpl.cardBg, borderRadius: 20, padding: 28, textAlign: 'center', border: `2px solid ${tpl.accentColor}40`, marginBottom: 20 }}>
              {/* QR code */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <div style={{ background: 'white', padding: 12, borderRadius: 16 }}>
                  <QRCodeSVG value={joinUrl(pin)} size={140} />
                </div>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 6 }}>📱 Scan QR code or enter PIN:</div>
              <div style={{ color: tpl.accentColor, fontSize: 56, fontWeight: 900, letterSpacing: 10, fontFamily: 'monospace', textShadow: `0 0 40px ${tpl.accentColor}60` }}>
                {pin}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 8, wordBreak: 'break-all' }}>
                {joinUrl(pin)}
              </div>
            </div>

            <button
              onClick={startGame}
              disabled={students.length === 0}
              style={{
                width: '100%', padding: '20px', fontSize: 22, fontWeight: 800,
                background: students.length > 0
                  ? `linear-gradient(135deg, ${tpl.accentColor}, ${tpl.choiceColors[0]})`
                  : 'rgba(255,255,255,0.1)',
                color: students.length > 0 ? 'white' : 'rgba(255,255,255,0.3)',
                border: 'none', borderRadius: 16, cursor: students.length > 0 ? 'pointer' : 'default',
                fontFamily: 'inherit', transition: 'all 0.3s',
                boxShadow: students.length > 0 ? `0 8px 32px ${tpl.accentColor}40` : 'none',
              }}
            >
              {students.length === 0 ? '⏳ Waiting for students...' : `🚀 Start Game (${students.length} ready)`}
            </button>
          </div>

          {/* Student list */}
          <div style={{ width: 260, flexShrink: 0 }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 12, fontWeight: 600 }}>JOINED STUDENTS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
              {students.length === 0 ? (
                <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', paddingTop: 40, fontSize: 14 }}>No students yet...</div>
              ) : (
                students.map((s, i) => (
                  <div key={s.nickname} style={{
                    background: tpl.cardBg, border: `1px solid ${tpl.accentColor}30`,
                    borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
                    animation: 'slideIn 0.3s ease',
                  }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: tpl.choiceColors[i % 4], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: 'white', flexShrink: 0 }}>
                      {s.nickname[0].toUpperCase()}
                    </div>
                    <span style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>{s.nickname}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 12, color: tpl.accentColor }}>✓</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <style>{`@keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: none; opacity: 1; } }`}</style>
      </div>
    );
  }

  // ── Playing / Reveal / Leaderboard screen ─────────────────────────────────
  if (phase === 'playing' || phase === 'finished') {
    const q = game!.questions[session?.currentQuestion ?? 0];
    const status = session?.status ?? 'playing';
    const CHOICE_COLORS = ['#e74c3c', '#2980e4', '#f1c40f', '#27ae60'];

    const choiceAnswerCounts = q?.choices.map((_, ci) =>
      students.filter(s => s.answers?.[(session?.currentQuestion ?? 0).toString() as unknown as number] === ci).length
    ) || [];

    return (
      <div style={{ minHeight: '100vh', background: tpl.bg, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ background: tpl.headerBg, padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: 'white', fontWeight: 700 }}>{game?.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
              Q {(session?.currentQuestion ?? 0) + 1} / {game?.questions.length}
            </span>
            {status === 'playing' && isCompetitive && (
              <div style={{
                width: 44, height: 44, borderRadius: '50%', border: `3px solid ${tpl.timerColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: tpl.timerColor, fontWeight: 800, fontSize: 18,
              }}>{timeLeft}</div>
            )}
            <span style={{ color: tpl.accentColor, fontSize: 13, fontWeight: 600 }}>
              {answeredCount}/{students.length} answered
            </span>
            <button onClick={endSession} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>End</button>
          </div>
        </div>

        <div style={{ flex: 1, padding: 24, maxWidth: 900, margin: '0 auto', width: '100%' }}>
          {/* Question */}
          {q && (
            <div style={{ background: tpl.cardBg, border: `1px solid ${tpl.accentColor}30`, borderRadius: 20, padding: '28px 24px', marginBottom: 24, textAlign: 'center' }}>
              <h2 style={{ color: 'white', fontSize: 'clamp(18px,3vw,28px)', fontWeight: 700, lineHeight: 1.4, margin: 0 }}>{q.text}</h2>
            </div>
          )}

          {/* Answer distribution (during reveal) */}
          {status === 'reveal' && q && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {q.choices.map((choice, ci) => {
                const count = choiceAnswerCounts[ci] || 0;
                const isCorrect = ci === q.correctIndex;
                const maxCount = Math.max(...choiceAnswerCounts, 1);
                return (
                  <div key={ci} style={{
                    background: isCorrect ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
                    border: `2px solid ${isCorrect ? '#22c55e' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 14, padding: '14px 16px', position: 'relative', overflow: 'hidden',
                  }}>
                    <div style={{ position: 'absolute', inset: 0, background: CHOICE_COLORS[ci] + '20', width: `${(count / maxCount) * 100}%`, transition: 'width 0.8s ease' }} />
                    <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: isCorrect ? '#6ee7b7' : 'white', fontWeight: 600, fontSize: 14 }}>
                        {isCorrect ? '✓ ' : ''}{choice}
                      </span>
                      <span style={{ color: tpl.accentColor, fontWeight: 800, fontSize: 18 }}>{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Live leaderboard (during reveal/leaderboard) */}
          {(status === 'reveal' || status === 'leaderboard') && (
            <div style={{ background: tpl.cardBg, borderRadius: 20, padding: 20, marginBottom: 20 }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 14, fontWeight: 600 }}>🏆 LEADERBOARD</div>
              {sorted.slice(0, 8).map((s, i) => (
                <div key={s.nickname} style={{
                  display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10,
                  background: i === 0 ? 'rgba(253,230,138,0.1)' : 'rgba(255,255,255,0.04)',
                  borderRadius: 10, padding: '10px 14px',
                }}>
                  <span style={{ fontSize: 18, width: 28, textAlign: 'center' }}>{['🥇','🥈','🥉'][i] || `${i+1}.`}</span>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: tpl.choiceColors[i % 4], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'white' }}>
                    {s.nickname[0].toUpperCase()}
                  </div>
                  <span style={{ color: 'white', flex: 1, fontWeight: 600 }}>{s.nickname}</span>
                  <span style={{ color: tpl.accentColor, fontWeight: 800, fontSize: 16 }}>{s.score} pts</span>
                </div>
              ))}
            </div>
          )}

          {/* Live answer progress (during playing) */}
          {status === 'playing' && (
            <div style={{ background: tpl.cardBg, borderRadius: 16, padding: '16px 20px', marginBottom: 20 }}>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 12 }}>
                Answered: {answeredCount} / {students.length} students
              </div>
              <div style={{ height: 12, background: 'rgba(255,255,255,0.1)', borderRadius: 100, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${students.length > 0 ? (answeredCount / students.length) * 100 : 0}%`,
                  background: `linear-gradient(90deg, ${tpl.accentColor}, ${tpl.choiceColors[0]})`,
                  borderRadius: 100, transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            {status === 'playing' && (
              <button onClick={revealAnswer} style={{ background: `linear-gradient(135deg, ${tpl.accentColor}, ${tpl.choiceColors[0]})`, color: 'white', border: 'none', borderRadius: 14, padding: '16px 40px', fontSize: 17, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
                ⏩ Show Answer
              </button>
            )}
            {status === 'leaderboard' && (
              <button onClick={nextQuestion} style={{ background: `linear-gradient(135deg, ${tpl.accentColor}, ${tpl.choiceColors[0]})`, color: 'white', border: 'none', borderRadius: 14, padding: '16px 40px', fontSize: 17, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
                {(session?.currentQuestion ?? 0) + 1 >= (game?.questions.length ?? 0) ? '🏁 Finish Game' : 'Next Question →'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
