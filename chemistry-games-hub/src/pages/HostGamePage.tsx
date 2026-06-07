import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { Game, GameResult } from '../types';
import { getGameById, saveResult } from '../storage';
import { getTemplate } from '../templates';
import {
  FIREBASE_CONFIGURED, createSession, subscribeSession, updateSession,
  deleteSession, type LiveSession,
} from '../realtime';

interface Props {
  gameId: string;
  onBack: () => void;
}

const TIMER_SECS: Record<string, number> = {
  'quiz-battle': 20, 'fastest-molecule': 10, 'periodic-challenge': 25,
  'reaction-race': 15, 'energy-points': 20,
};
const COMPETITIVE = ['quiz-battle', 'fastest-molecule', 'periodic-challenge', 'reaction-race', 'energy-points'];
const MEDAL = ['🥇', '🥈', '🥉'];

function joinUrl(pin: string) {
  return `${window.location.origin}${window.location.pathname}?join=${pin}`;
}

// ── Sound for teacher ──────────────────────────────────────────────────────
function playHostSound(type: 'start' | 'next' | 'finish') {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (type === 'start') {
      [400, 600, 900, 1200].forEach((f, i) => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'sine'; o.frequency.setValueAtTime(f, ctx.currentTime + i * 0.1);
        g.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.2);
        o.start(ctx.currentTime + i * 0.1); o.stop(ctx.currentTime + i * 0.1 + 0.2);
      });
    } else if (type === 'next') {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.setValueAtTime(800, ctx.currentTime);
      g.gain.setValueAtTime(0.12, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      o.start(); o.stop(ctx.currentTime + 0.15);
    } else {
      [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'triangle'; o.frequency.setValueAtTime(f, ctx.currentTime + i * 0.1);
        g.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.2);
        o.start(ctx.currentTime + i * 0.1); o.stop(ctx.currentTime + i * 0.1 + 0.2);
      });
    }
  } catch { /* */ }
}

export default function HostGamePage({ gameId, onBack }: Props) {
  const [game, setGame] = useState<Game | null>(null);
  const [session, setSession] = useState<LiveSession | null>(null);
  const [phase, setPhase] = useState<'setup' | 'waiting' | 'hosting' | 'finished'>('setup');
  const [timeLeft, setTimeLeft] = useState(0);
  const [copied, setCopied] = useState(false);
  const [firebaseError, setFirebaseError] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  const pin = game?.pin || '';
  const tpl = getTemplate(game?.templateId || 'periodic-table');
  const isCompetitive = game ? COMPETITIVE.includes(game.gameType) : true;
  const defaultTimer = game ? (TIMER_SECS[game.gameType] || 20) : 20;

  useEffect(() => {
    const g = getGameById(gameId);
    if (g) setGame(g);
    return () => {
      if (unsubRef.current) unsubRef.current();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameId]);

  useEffect(() => {
    if (!pin || phase === 'setup') return;
    unsubRef.current = subscribeSession(pin, s => { if (s) setSession(s); });
    return () => { if (unsubRef.current) unsubRef.current(); };
  }, [pin, phase]);

  const startHosting = async () => {
    if (!game) return;
    setFirebaseError('');
    const s: LiveSession = {
      gameId: game.id, templateId: game.templateId || 'periodic-table',
      gameType: game.gameType, title: game.title, questionCount: game.questions.length,
      questions: game.questions.map(q => ({
        id: q.id, text: q.text, choices: q.choices,
        correctIndex: q.correctIndex, explanation: q.explanation, timeSeconds: q.timeSeconds,
      })),
      status: 'waiting', currentQuestion: 0, questionStartedAt: 0, students: {},
    };
    try {
      await createSession(pin, s);
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes('permission') || msg.includes('PERMISSION')) {
        setFirebaseError('⚠️ Firebase permission denied — go to Firebase Console → Realtime Database → Rules → set ".read" and ".write" to true → Publish');
      } else {
        setFirebaseError(`⚠️ Firebase error: ${msg}`);
      }
      return;
    }
    setSession(s);
    setPhase('waiting');
  };

  const startGame = async () => {
    if (!session) return;
    playHostSound('start');
    await updateSession(pin, { status: 'playing', currentQuestion: 0, questionStartedAt: Date.now() });
    setPhase('hosting');
    const maxTime = game?.questions[0]?.timeSeconds || defaultTimer;
    startQuestionTimer(maxTime);
  };

  const startQuestionTimer = (max: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(max);
    let t = max;
    timerRef.current = setInterval(() => {
      t--;
      setTimeLeft(t);
      if (t <= 0) { clearInterval(timerRef.current!); revealAnswer(); }
    }, 1000);
  };

  const revealAnswer = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    await updateSession(pin, { status: 'reveal' });
    setTimeout(async () => {
      await updateSession(pin, { status: 'leaderboard' });
    }, 4000);
  };

  const nextQuestion = async () => {
    if (!session || !game) return;
    const nextQ = (session.currentQuestion ?? 0) + 1;
    if (nextQ >= game.questions.length) {
      playHostSound('finish');
      await updateSession(pin, { status: 'finished' });
      setPhase('finished');
      if (session && game) {
        const finalStudents = Object.values(session.students).sort((a, b) => b.score - a.score);
        const result: GameResult = {
          gameId: game.id,
          leaderboard: finalStudents.map(s => ({ nickname: s.nickname, score: s.score, time: 0 })),
          playedAt: new Date().toISOString(),
        };
        saveResult(result);
      }
      return;
    }
    playHostSound('next');
    const maxTime = game.questions[nextQ]?.timeSeconds || defaultTimer;
    await updateSession(pin, { status: 'playing', currentQuestion: nextQ, questionStartedAt: Date.now() });
    setSession(prev => prev ? { ...prev, currentQuestion: nextQ, status: 'playing' } : prev);
    startQuestionTimer(maxTime);
  };

  const endSession = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    await deleteSession(pin);
    onBack();
  };

  const copyLink = () => {
    navigator.clipboard.writeText(joinUrl(pin)).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const students = session ? Object.values(session.students) : [];
  const sorted = [...students].sort((a, b) => b.score - a.score);
  const currentQ = game?.questions[session?.currentQuestion ?? 0];
  const answeredCount = students.filter(s => (session?.currentQuestion ?? 0).toString() in (s.answers || {})).length;
  const status = session?.status ?? 'waiting';

  // ── Firebase not configured ────────────────────────────────────────────
  if (!FIREBASE_CONFIGURED) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a0a1a,#1a0a2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 560, textAlign: 'center' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>⚙️</div>
          <h2 style={{ color: 'white', fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Firebase Not Connected</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 20 }}>Add the Firebase environment variables to Netlify to enable live multiplayer hosting.</p>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 12, padding: '12px 28px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15 }}>← Back</button>
        </div>
      </div>
    );
  }

  // ── Setup screen ───────────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <div style={{ minHeight: '100vh', background: tpl.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 500, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🎮</div>
          <h1 style={{ color: 'white', fontSize: 26, fontWeight: 800, marginBottom: 6 }}>{game?.title}</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>{game?.lessonName} • {game?.questions.length} questions</p>
          <div style={{ background: `${tpl.accentColor}15`, border: `2px solid ${tpl.accentColor}40`, borderRadius: 18, padding: '20px', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <div style={{ background: 'white', padding: 10, borderRadius: 12 }}>
                <QRCodeSVG value={joinUrl(pin)} size={120} />
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 6 }}>📱 Students scan or enter PIN:</p>
            <p style={{ color: tpl.accentColor, fontSize: 44, fontWeight: 900, letterSpacing: 8, fontFamily: 'monospace' }}>{pin}</p>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, wordBreak: 'break-all', marginTop: 6 }}>{joinUrl(pin)}</p>
          </div>
          {firebaseError && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 14, padding: '14px 16px', marginBottom: 16, color: '#fca5a5', fontSize: 13, lineHeight: 1.6, textAlign: 'left' }}>
              {firebaseError}
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 12, padding: '14px 24px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15 }}>← Back</button>
            <button onClick={startHosting} style={{ background: `linear-gradient(135deg, ${tpl.accentColor}, ${tpl.choiceColors[0]})`, color: 'white', border: 'none', borderRadius: 12, padding: '14px 36px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 17, fontWeight: 800, boxShadow: `0 4px 24px ${tpl.accentColor}50` }}>
              🚀 Open Waiting Room
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Waiting room ────────────────────────────────────────────────────────
  if (phase === 'waiting') {
    return (
      <div style={{ minHeight: '100vh', background: tpl.bg, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ background: tpl.headerBg, padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${tpl.accentColor}20` }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>HOSTING</div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>{game?.title}</div>
          </div>
          <button onClick={endSession} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600 }}>✕ End</button>
        </div>

        <div style={{ flex: 1, display: 'flex', gap: 24, padding: 24, maxWidth: 1000, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          {/* Left: QR + PIN + start */}
          <div style={{ flex: 1 }}>
            <div style={{ background: tpl.cardBg, borderRadius: 22, padding: 28, textAlign: 'center', border: `2px solid ${tpl.accentColor}35`, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                <div style={{ background: 'white', padding: 12, borderRadius: 16 }}>
                  <QRCodeSVG value={joinUrl(pin)} size={150} />
                </div>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 6 }}>📱 Students scan or type:</div>
              <div style={{ color: tpl.accentColor, fontSize: 58, fontWeight: 900, letterSpacing: 12, fontFamily: 'monospace', textShadow: `0 0 40px ${tpl.accentColor}60` }}>
                {pin}
              </div>
              <button onClick={copyLink} style={{ marginTop: 10, background: copied ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.07)', border: `1px solid ${copied ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.15)'}`, color: copied ? '#6ee7b7' : 'rgba(255,255,255,0.5)', borderRadius: 8, padding: '6px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, transition: 'all 0.2s' }}>
                {copied ? '✓ Copied!' : '🔗 Copy join link'}
              </button>
            </div>

            <button
              onClick={startGame}
              style={{
                width: '100%', padding: '20px', fontSize: 22, fontWeight: 900,
                background: `linear-gradient(135deg, ${tpl.accentColor}, ${tpl.choiceColors[0]})`,
                color: 'white',
                border: 'none', borderRadius: 18, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.3s',
                boxShadow: `0 8px 32px ${tpl.accentColor}50`,
                letterSpacing: 1,
              }}
            >
              {students.length < 1 ? '🚀 START GAME' : `🚀 START GAME (${students.length} ready)`}
            </button>
          </div>

          {/* Right: live student list */}
          <div style={{ width: 280, flexShrink: 0 }}>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
              STUDENTS JOINED ({students.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 500, overflowY: 'auto' }}>
              {students.length === 0 ? (
                <div style={{ color: 'rgba(255,255,255,0.25)', textAlign: 'center', paddingTop: 48, fontSize: 14 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>👀</div>
                  No students yet...
                </div>
              ) : (
                students.map((s, i) => (
                  <div key={s.nickname} style={{
                    background: tpl.cardBg, border: `1px solid ${tpl.accentColor}25`,
                    borderRadius: 12, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10,
                    animation: 'slideIn 0.35s ease',
                  }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: tpl.choiceColors[i % 4], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 900, color: 'white', flexShrink: 0 }}>
                      {s.nickname[0].toUpperCase()}
                    </div>
                    <span style={{ color: 'white', fontWeight: 600, fontSize: 14, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.nickname}</span>
                    <span style={{ color: '#6ee7b7', fontSize: 16 }}>✓</span>
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

  // ── Game hosting screen ────────────────────────────────────────────────
  if (phase === 'hosting') {
    const CHOICE_LABELS = ['A', 'B', 'C', 'D'];
    const choiceAnswerCounts = currentQ?.choices.map((_, ci) =>
      students.filter(s => {
        const key = (session?.currentQuestion ?? 0);
        return s.answers && s.answers[key] === ci;
      }).length
    ) || [];
    const maxCount = Math.max(...choiceAnswerCounts, 1);

    return (
      <div style={{ minHeight: '100vh', background: tpl.bg, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ background: tpl.headerBg, padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${tpl.accentColor}20` }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: 1 }}>QUESTION {(session?.currentQuestion ?? 0) + 1} OF {game?.questions.length}</div>
            <div style={{ color: 'white', fontWeight: 700 }}>{game?.title}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Timer */}
            {status === 'playing' && isCompetitive && (
              <div style={{
                width: 52, height: 52, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `4px solid ${timeLeft <= 5 ? '#ef4444' : timeLeft <= 10 ? '#fde68a' : tpl.timerColor}`,
                color: timeLeft <= 5 ? '#ef4444' : timeLeft <= 10 ? '#fde68a' : tpl.timerColor,
                fontWeight: 900, fontSize: 22, transition: 'all 0.5s',
              }}>{timeLeft}</div>
            )}
            {/* Answer progress */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 1 }}>ANSWERED</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: tpl.accentColor }}>{answeredCount}/{students.length}</div>
            </div>
            <button onClick={endSession} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', borderRadius: 10, padding: '7px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>✕ End</button>
          </div>
        </div>

        <div style={{ flex: 1, padding: '20px 24px', maxWidth: 1000, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          {/* Question card */}
          {currentQ && (
            <div style={{ background: tpl.cardBg, border: `1px solid ${tpl.accentColor}30`, borderRadius: 22, padding: '24px 28px', marginBottom: 20, textAlign: 'center', boxShadow: `0 8px 40px rgba(0,0,0,0.3)` }}>
              <h2 style={{ color: 'white', fontSize: 'clamp(18px,2.8vw,28px)', fontWeight: 700, lineHeight: 1.5, margin: 0 }}>{currentQ.text}</h2>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Left: answer distribution */}
            <div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>ANSWER DISTRIBUTION</div>
              {currentQ?.choices.map((choice, ci) => {
                const count = choiceAnswerCounts[ci] || 0;
                const color = tpl.choiceColors[ci];
                return (
                  <div key={ci} style={{
                    background: `${color}15`,
                    border: `2px solid ${color}50`,
                    borderRadius: 14, padding: '12px 14px', marginBottom: 8, position: 'relative', overflow: 'hidden',
                  }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, background: color + '25', width: `${(count / maxCount) * 100}%`, transition: 'width 0.6s ease', borderRadius: 12 }} />
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 28, height: 28, borderRadius: 6, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                        {CHOICE_LABELS[ci]}
                      </span>
                      <span style={{ color: 'white', fontWeight: 600, fontSize: 13, flex: 1 }}>{choice}</span>
                      <span style={{ color: tpl.accentColor, fontWeight: 900, fontSize: 18 }}>{count}</span>
                    </div>
                  </div>
                );
              })}

              {/* Answer progress bar */}
              <div style={{ background: tpl.cardBg, borderRadius: 14, padding: '14px 16px', marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Students answered</span>
                  <span style={{ color: tpl.accentColor, fontWeight: 700 }}>{answeredCount} / {students.length}</span>
                </div>
                <div style={{ height: 10, background: 'rgba(255,255,255,0.08)', borderRadius: 100, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${students.length > 0 ? (answeredCount / students.length) * 100 : 0}%`, background: `linear-gradient(90deg, ${tpl.accentColor}, ${tpl.choiceColors[0]})`, borderRadius: 100, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            </div>

            {/* Right: live leaderboard / student grid */}
            <div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>LIVE SCOREBOARD</div>
              <div style={{ background: tpl.cardBg, borderRadius: 18, padding: '14px', maxHeight: 340, overflowY: 'auto' }}>
                {sorted.length === 0 ? (
                  <div style={{ color: 'rgba(255,255,255,0.25)', textAlign: 'center', padding: '20px 0', fontSize: 13 }}>Waiting for answers...</div>
                ) : (
                  sorted.map((s, i) => {
                    const hasAnswered = s.answers && (session?.currentQuestion ?? 0) in s.answers;
                    return (
                      <div key={s.nickname} style={{
                        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
                        background: i === 0 ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.04)',
                        borderRadius: 10, padding: '9px 12px', border: `1px solid ${i === 0 ? 'rgba(251,191,36,0.3)' : 'transparent'}`,
                      }}>
                        <span style={{ fontSize: 16, width: 24 }}>{MEDAL[i] || `${i + 1}`}</span>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: tpl.choiceColors[i % 4], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: 12, flexShrink: 0 }}>
                          {s.nickname[0].toUpperCase()}
                        </div>
                        <span style={{ flex: 1, color: 'white', fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.nickname}</span>
                        <span style={{ fontSize: 14, marginRight: 4 }}>{hasAnswered ? '✅' : '⏳'}</span>
                        <span style={{ color: tpl.accentColor, fontWeight: 800, fontSize: 15 }}>{s.score}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
            {status === 'playing' && (
              <button onClick={revealAnswer} style={{ background: `linear-gradient(135deg, ${tpl.accentColor}, ${tpl.choiceColors[0]})`, color: 'white', border: 'none', borderRadius: 14, padding: '16px 44px', fontSize: 17, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 4px 24px ${tpl.accentColor}50` }}>
                ⏩ Next
              </button>
            )}
            {(status === 'leaderboard' || status === 'reveal') && (
              <button onClick={nextQuestion} style={{ background: `linear-gradient(135deg, ${tpl.accentColor}, ${tpl.choiceColors[0]})`, color: 'white', border: 'none', borderRadius: 14, padding: '16px 44px', fontSize: 17, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 4px 24px ${tpl.accentColor}50` }}>
                {(session?.currentQuestion ?? 0) + 1 >= (game?.questions.length ?? 0) ? '🏁 Finish Game' : 'Next Question →'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Final results for teacher ──────────────────────────────────────────
  if (phase === 'finished') {
    const downloadResults = () => {
      const rows = [['Rank', 'Full Name', 'Score', 'Streak']];
      sorted.forEach((s, i) => rows.push([String(i + 1), s.nickname, String(s.score), String(s.streak)]));
      const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = `${game?.title || 'results'}-results.csv`; a.click();
      URL.revokeObjectURL(url);
    };

    return (
      <div style={{ minHeight: '100vh', background: tpl.bg, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: tpl.headerBg, padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>🏁 Game Over — {game?.title}</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={downloadResults} style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.5)', color: '#6ee7b7', borderRadius: 10, padding: '9px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700 }}>📥 Download Excel</button>
            <button onClick={endSession} style={{ background: `linear-gradient(135deg, ${tpl.accentColor}, ${tpl.choiceColors[0]})`, color: 'white', border: 'none', borderRadius: 10, padding: '9px 20px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700 }}>✓ Done</button>
          </div>
        </div>

        <div style={{ flex: 1, padding: '28px 24px', maxWidth: 800, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
            <h2 style={{ color: 'white', fontSize: 26, fontWeight: 900, margin: 0 }}>Final Results</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{students.length} students competed</p>
          </div>

          {/* Top 3 podium */}
          {sorted.length >= 1 && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, justifyContent: 'center', marginBottom: 32 }}>
              {sorted[1] && (
                <div style={{ textAlign: 'center', flex: 1, maxWidth: 180 }}>
                  <div style={{ background: 'linear-gradient(180deg, rgba(156,163,175,0.3) 0%, rgba(107,114,128,0.2) 100%)', borderRadius: '16px 16px 0 0', padding: '20px 14px 14px', border: '1px solid rgba(156,163,175,0.4)' }}>
                    <div style={{ fontSize: 36, marginBottom: 6 }}>🥈</div>
                    <div style={{ color: 'white', fontSize: 16, fontWeight: 800 }}>{sorted[1].nickname}</div>
                    <div style={{ color: '#9ca3af', fontSize: 20, fontWeight: 900 }}>{sorted[1].score} pts</div>
                  </div>
                </div>
              )}
              {sorted[0] && (
                <div style={{ textAlign: 'center', flex: 1, maxWidth: 220 }}>
                  <div style={{ fontSize: 18, marginBottom: 6 }}>⭐⭐⭐</div>
                  <div style={{ background: 'linear-gradient(180deg, rgba(251,191,36,0.3) 0%, rgba(217,119,6,0.2) 100%)', borderRadius: '16px 16px 0 0', padding: '28px 14px 14px', border: '2px solid rgba(251,191,36,0.5)' }}>
                    <div style={{ fontSize: 44, marginBottom: 6 }}>🥇</div>
                    <div style={{ color: '#fde68a', fontSize: 18, fontWeight: 900 }}>{sorted[0].nickname}</div>
                    <div style={{ color: '#fbbf24', fontSize: 24, fontWeight: 900 }}>{sorted[0].score} pts</div>
                  </div>
                </div>
              )}
              {sorted[2] && (
                <div style={{ textAlign: 'center', flex: 1, maxWidth: 180 }}>
                  <div style={{ background: 'linear-gradient(180deg, rgba(180,83,9,0.25) 0%, rgba(124,45,18,0.2) 100%)', borderRadius: '16px 16px 0 0', padding: '14px 14px 14px', border: '1px solid rgba(180,83,9,0.4)' }}>
                    <div style={{ fontSize: 32, marginBottom: 6 }}>🥉</div>
                    <div style={{ color: 'white', fontSize: 15, fontWeight: 800 }}>{sorted[2].nickname}</div>
                    <div style={{ color: '#fb923c', fontSize: 18, fontWeight: 900 }}>{sorted[2].score} pts</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Full list */}
          <div style={{ background: tpl.cardBg, borderRadius: 20, padding: 20 }}>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>ALL PARTICIPANTS</div>
            {sorted.map((s, i) => (
              <div key={s.nickname} style={{
                display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10,
                background: i < 3 ? `${tpl.choiceColors[i]}12` : 'rgba(255,255,255,0.04)',
                borderRadius: 12, padding: '12px 16px', border: `1px solid ${i < 3 ? tpl.choiceColors[i] + '30' : 'transparent'}`,
              }}>
                <span style={{ fontSize: 18, width: 28 }}>{MEDAL[i] || `${i + 1}.`}</span>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: tpl.choiceColors[i % 4], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: 15, flexShrink: 0 }}>
                  {s.nickname[0].toUpperCase()}
                </div>
                <span style={{ flex: 1, color: 'white', fontWeight: 700, fontSize: 15 }}>{s.nickname}</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: tpl.accentColor, fontWeight: 900, fontSize: 18 }}>{s.score} pts</div>
                  {s.streak > 1 && <div style={{ color: '#fb923c', fontSize: 11 }}>🔥 {s.streak} streak</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
