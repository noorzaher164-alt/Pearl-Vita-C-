import { useState, useEffect, useRef, useCallback } from 'react';
import { getTemplate, type GameTemplate } from '../templates';
import { subscribeSession, submitAnswer, joinSession, type LiveSession, type LiveQuestion, type StudentSlot } from '../realtime';

interface Props {
  pin: string;
  nickname: string;
  onFinish: () => void;
  onBack: () => void;
}

type LocalPhase = 'waiting' | 'playing' | 'reveal' | 'leaderboard' | 'finished';

const MEDAL = ['🥇', '🥈', '🥉'];
const RANK_LABEL = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

// ── Sound engine ───────────────────────────────────────────────────────────
function playTick() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'square'; o.frequency.value = 880;
    g.gain.setValueAtTime(0.06, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    o.start(); o.stop(ctx.currentTime + 0.05);
  } catch {}
}

function playUrgent() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    [880, 1100, 880, 1100].forEach((f, i) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'square'; o.frequency.value = f;
      g.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.12);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.1);
      o.start(ctx.currentTime + i * 0.12); o.stop(ctx.currentTime + i * 0.12 + 0.1);
    });
  } catch {}
}

function playChallengeCorrect() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    [523, 659, 784, 1047, 1319].forEach((f, i) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'triangle';
      o.frequency.setValueAtTime(f, ctx.currentTime + i * 0.06);
      g.gain.setValueAtTime(0.28, ctx.currentTime + i * 0.06);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.22);
      o.start(ctx.currentTime + i * 0.06); o.stop(ctx.currentTime + i * 0.06 + 0.22);
    });
  } catch {}
}

function playChallengeWrong() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(300, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.5);
    g.gain.setValueAtTime(0.3, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    o.start(); o.stop(ctx.currentTime + 0.5);
  } catch {}
}

function playChallengeStart() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    [261, 329, 392, 523, 659, 784, 1047].forEach((f, i) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = i < 4 ? 'triangle' : 'sine';
      o.frequency.setValueAtTime(f, ctx.currentTime + i * 0.09);
      g.gain.setValueAtTime(0.22, ctx.currentTime + i * 0.09);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.09 + 0.25);
      o.start(ctx.currentTime + i * 0.09); o.stop(ctx.currentTime + i * 0.09 + 0.25);
    });
  } catch {}
}

function playChallengeVictory(rank: number) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const melody = rank === 1
      ? [523, 659, 784, 1047, 784, 1047, 1319, 1047, 1319, 1568]
      : rank <= 3
      ? [523, 659, 784, 1047, 784, 1047, 1175]
      : [523, 659, 784, 1047];
    melody.forEach((f, i) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = rank === 1 ? 'triangle' : 'sine';
      o.frequency.setValueAtTime(f, ctx.currentTime + i * 0.11);
      g.gain.setValueAtTime(rank === 1 ? 0.28 : 0.2, ctx.currentTime + i * 0.11);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.11 + 0.2);
      o.start(ctx.currentTime + i * 0.11); o.stop(ctx.currentTime + i * 0.11 + 0.2);
    });
  } catch {}
}

// ── Confetti ────────────────────────────────────────────────────────────────
function BigConfetti({ active, gold }: { active: boolean; gold?: boolean }) {
  if (!active) return null;
  const particles = Array.from({ length: 120 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: gold
      ? ['#fde68a', '#fbbf24', '#f59e0b', '#fff', '#c084fc'][i % 5]
      : ['#c084fc', '#7dd3fc', '#6ee7b7', '#fca5a5', '#fde68a', '#f093fb'][i % 6],
    delay: Math.random() * 1.2,
    duration: 1.8 + Math.random() * 2.5,
    size: 8 + Math.random() * 14,
    shape: i % 3,
  }));
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 300, overflow: 'hidden' }}>
      <style>{`
        @keyframes confettiDrop { 0% { transform: translateY(-30px) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translateY(105vh) rotate(720deg) scale(0.5); opacity: 0; } }
      `}</style>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.x}%`, top: 0,
          width: p.size, height: p.size,
          background: p.color,
          borderRadius: p.shape === 0 ? '50%' : p.shape === 1 ? '2px' : '0',
          animation: `confettiDrop ${p.duration}s ${p.delay}s ease-in forwards`,
        }} />
      ))}
    </div>
  );
}

// ── QuizGame ───────────────────────────────────────────────────────────────
const KAHOOT_COLORS = ['#e21b3c', '#1368ce', '#d89e00', '#26890c'];
const KAHOOT_SHAPES = ['▲', '◆', '●', '■'];

function QuizGame({ session, nickname, tpl: _tpl, onAnswer, myScore, answered, timeLeft }: {
  session: LiveSession; nickname: string; tpl: GameTemplate;
  onAnswer: (idx: number) => void; myScore: number; answered: boolean; timeLeft: number;
}) {
  const questions = session.questions;
  const questionsArr: LiveQuestion[] = Array.isArray(questions)
    ? questions
    : Object.values(questions ?? {});
  const q: LiveQuestion | undefined = questionsArr[session.currentQuestion];
  if (!q) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#46178f', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48, animation: 'spin 1s linear infinite' }}>⚛️</div>
      <div style={{ color: 'white', fontSize: 18 }}>Loading question...</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const totalTime = q.timeSeconds || 20;
  const timerPct = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0;
  const isUrgent = timeLeft <= 5;

  const myRank = Object.values(session.students)
    .sort((a, b) => b.score - a.score)
    .findIndex(s => s.nickname === nickname) + 1;

  const myStudentAnswers = session.students[nickname]?.answers;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#46178f' }}>
      {/* Header bar */}
      <div style={{ background: 'rgba(0,0,0,0.35)', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 700 }}>
          Q {session.currentQuestion + 1} / {session.questionCount}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ color: 'white', fontWeight: 800, fontSize: 15 }}>⭐ {myScore}</div>
          {myRank > 0 && (
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '3px 10px', color: 'white', fontSize: 12, fontWeight: 700 }}>
              {MEDAL[myRank - 1] || `#${myRank}`}
            </div>
          )}
        </div>
      </div>

      {/* Timer bar */}
      <div style={{ height: 8, background: 'rgba(255,255,255,0.15)', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${timerPct}%`,
          background: isUrgent ? '#ef4444' : 'white',
          transition: 'width 1s linear',
          animation: isUrgent ? 'timerPulse 0.5s ease-in-out infinite alternate' : 'none',
        }} />
      </div>

      {/* Question card */}
      <div style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '35vh', position: 'relative' }}>
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: '28px 36px',
          maxWidth: 720,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
          position: 'relative',
        }}>
          {/* Circular timer */}
          <div style={{
            position: 'absolute', top: -20, right: -20,
            width: 52, height: 52, borderRadius: '50%',
            background: isUrgent ? '#e21b3c' : '#46178f',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 900, fontSize: 22,
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            transition: 'background 0.3s',
            animation: isUrgent ? 'timerPulse 0.5s ease-in-out infinite alternate' : 'none',
          }}
            aria-live="assertive" aria-label={`${timeLeft} seconds left`}
          >{timeLeft}</div>
          <h2 style={{ color: '#1a1a2e', fontSize: 'clamp(18px,3vw,28px)', fontWeight: 800, lineHeight: 1.4, margin: 0, direction: 'rtl', unicodeBidi: 'plaintext' }}>{q.text}</h2>
        </div>
      </div>

      {/* 2×2 answer grid */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 10px 16px', minHeight: '45vh' }}>
        {q.choices.map((choice, ci) => {
          const color = KAHOOT_COLORS[ci];
          const isChosen = answered && myStudentAnswers?.[session.currentQuestion] === ci;
          const dimmed = answered && !isChosen;
          return (
            <button
              key={ci}
              onClick={() => !answered && onAnswer(ci)}
              disabled={answered}
              aria-label={`${['A','B','C','D'][ci]}: ${choice}`}
              aria-pressed={isChosen}
              style={{
                background: color,
                border: isChosen ? '5px solid white' : '5px solid transparent',
                borderRadius: 14,
                color: 'white',
                fontWeight: 800,
                fontSize: 'clamp(14px,2.5vw,18px)',
                cursor: answered ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 14, padding: '0 18px',
                opacity: dimmed ? 0.45 : 1,
                transition: 'all 0.2s',
                boxShadow: dimmed ? 'none' : `0 6px 20px rgba(0,0,0,0.35)`,
                transform: isChosen ? 'scale(1.02)' : dimmed ? 'scale(0.97)' : 'scale(1)',
                fontFamily: 'inherit',
                overflow: 'hidden',
              }}
            >
              <span style={{
                width: 44, height: 44, background: 'rgba(0,0,0,0.2)', borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, flexShrink: 0, fontWeight: 900,
              }}>{KAHOOT_SHAPES[ci]}</span>
              <span style={{ lineHeight: 1.3, textAlign: 'left', direction: 'rtl', unicodeBidi: 'plaintext', flex: 1 }}>{choice}</span>
            </button>
          );
        })}
      </div>

      {answered && (
        <div style={{ textAlign: 'center', paddingBottom: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 800, fontSize: 15, letterSpacing: 0.5 }}>
          ✓ Answer locked in!
        </div>
      )}

      <style>{`
        @keyframes timerPulse { 0% { opacity: 1; } 100% { opacity: 0.55; } }
      `}</style>
    </div>
  );
}

// ── Reveal Screen ──────────────────────────────────────────────────────────
function RevealScreen({ session, tpl, myAnswerIdx, myScore }: {
  session: LiveSession; tpl: GameTemplate; myAnswerIdx: number | null; myScore: number;
}) {
  const questionsArr: LiveQuestion[] = Array.isArray(session.questions)
    ? session.questions
    : Object.values(session.questions ?? {});
  const q: LiveQuestion | undefined = questionsArr[session.currentQuestion];
  if (!q) return null;
  const isCorrect = myAnswerIdx !== null && myAnswerIdx === q.correctIndex;

  useEffect(() => {
    if (isCorrect) playChallengeCorrect(); else playChallengeWrong();
  }, []);

  const correctChoiceText = q.choices[q.correctIndex];

  return (
    <div style={{ minHeight: '100vh', background: '#46178f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 90, marginBottom: 12, animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
        {isCorrect ? '✅' : myAnswerIdx === null ? '⏰' : '❌'}
      </div>
      <div role="status" aria-live="polite" style={{ fontSize: 30, fontWeight: 900, color: isCorrect ? '#6ee7b7' : myAnswerIdx === null ? '#fde68a' : '#fca5a5', marginBottom: 10 }}>
        {isCorrect ? 'Correct!' : myAnswerIdx === null ? "Time's up!" : 'Wrong answer!'}
      </div>

      {isCorrect && (
        <div style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', borderRadius: 14, padding: '10px 24px', marginBottom: 14, fontSize: 18, fontWeight: 800, color: '#6ee7b7' }}>
          ⭐ {myScore} total pts
        </div>
      )}

      <div style={{ background: `${tpl.accentColor}15`, border: `2px solid ${tpl.accentColor}40`, borderRadius: 16, padding: '14px 24px', maxWidth: 480, marginBottom: 12 }}>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 6, letterSpacing: 1 }}>CORRECT ANSWER</div>
        <div style={{ color: 'white', fontSize: 18, fontWeight: 700 }}>{correctChoiceText}</div>
      </div>

      {q.explanation && (
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 14, padding: '12px 20px', maxWidth: 480, marginTop: 4 }}>
          <span style={{ color: tpl.accentColor }}>💡 </span>
          <span style={{ color: 'rgba(255,255,255,0.75)' }}>{q.explanation}</span>
        </div>
      )}

      <div style={{ color: 'rgba(255,255,255,0.3)', marginTop: 20, fontSize: 13 }}>⏳ Scores loading...</div>
      <style>{`@keyframes popIn { 0% { transform: scale(0.2); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  );
}

// ── Between-question Leaderboard ───────────────────────────────────────────
function LeaderboardScreen({ session, nickname, tpl }: { session: LiveSession; nickname: string; tpl: GameTemplate }) {
  const sorted = Object.values(session.students).sort((a, b) => b.score - a.score);
  const myRank = sorted.findIndex(s => s.nickname === nickname) + 1;
  return (
    <div style={{ minHeight: '100vh', background: '#46178f', display: 'flex', flexDirection: 'column', padding: 24 }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 40, marginBottom: 6 }}>🏆</div>
        <h2 style={{ color: 'white', fontWeight: 900, fontSize: 24, margin: 0 }}>Leaderboard</h2>
        {myRank > 0 && (
          <div style={{ marginTop: 8, display: 'inline-block', background: `${tpl.accentColor}25`, border: `2px solid ${tpl.accentColor}60`, borderRadius: 20, padding: '6px 20px' }}>
            <span style={{ color: tpl.accentColor, fontWeight: 900, fontSize: 16 }}>
              {MEDAL[myRank - 1] || `#${myRank}`} You're in {RANK_LABEL[myRank - 1] || `${myRank}th`} place!
            </span>
          </div>
        )}
      </div>
      <div style={{ maxWidth: 460, margin: '0 auto', width: '100%' }}>
        {sorted.slice(0, 8).map((s, i) => {
          const isMe = s.nickname === nickname;
          return (
            <div key={s.nickname} style={{
              background: isMe ? `${tpl.accentColor}25` : i === 0 ? 'rgba(251,191,36,0.1)' : tpl.cardBg,
              border: `2px solid ${isMe ? tpl.accentColor : i === 0 ? 'rgba(251,191,36,0.35)' : 'transparent'}`,
              borderRadius: 16, padding: '13px 18px', marginBottom: 8,
              display: 'flex', alignItems: 'center', gap: 12,
              animation: `slideIn 0.3s ${i * 0.05}s ease both`,
              transform: isMe ? 'scale(1.02)' : 'scale(1)',
            }}>
              <span style={{ fontSize: 22, width: 30 }}>{MEDAL[i] || `${i + 1}`}</span>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: tpl.choiceColors[i % 4], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: 14, flexShrink: 0 }}>
                {s.nickname[0].toUpperCase()}
              </div>
              <span style={{ flex: 1, color: isMe ? tpl.accentColor : 'white', fontWeight: isMe ? 900 : 600, fontSize: 15 }}>
                {s.nickname}{isMe ? ' 👈' : ''}
              </span>
              <span style={{ color: i === 0 ? '#fde68a' : tpl.accentColor, fontWeight: 900, fontSize: 18 }}>{s.score}</span>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', marginTop: 16, fontSize: 13, animation: 'pulse 1.5s ease-in-out infinite' }}>⏳ Next question coming...</div>
      <style>{`
        @keyframes slideIn { from { transform: translateX(28px); opacity: 0; } to { transform: none; opacity: 1; } }
        @keyframes pulse { 0%,100% { opacity: 0.35; } 50% { opacity: 0.7; } }
      `}</style>
    </div>
  );
}

// ── Final Results Screen ───────────────────────────────────────────────────
function FinishedScreen({ session, nickname, tpl, onFinish }: { session: LiveSession; nickname: string; tpl: GameTemplate; onFinish: () => void }) {
  const sorted = Object.values(session.students).sort((a, b) => b.score - a.score);
  const myRank = sorted.findIndex(s => s.nickname === nickname) + 1;
  const me = sorted.find(s => s.nickname === nickname);
  const isWinner = myRank <= 3;

  useEffect(() => {
    playChallengeVictory(myRank);
  }, []);

  const podiumBg =
    myRank === 1 ? 'linear-gradient(135deg, #78350f, #b45309, #d97706)' :
    myRank === 2 ? 'linear-gradient(135deg, #374151, #6b7280, #9ca3af)' :
    myRank === 3 ? 'linear-gradient(135deg, #7c2d12, #9a3412, #c2410c)' :
    tpl.bg;

  return (
    <div style={{ minHeight: '100vh', background: isWinner ? podiumBg : '#46178f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center', position: 'relative' }}>
      <BigConfetti active={isWinner} gold={myRank === 1} />

      {myRank === 1 && (
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(251,191,36,0.3) 0%, transparent 70%)', pointerEvents: 'none' }} />
      )}

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: myRank <= 3 ? 96 : 64, marginBottom: 12, animation: 'bounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1)' }}>
          {myRank === 1 ? '🏆' : myRank === 2 ? '🥈' : myRank === 3 ? '🥉' : '🎓'}
        </div>

        <h1 style={{ color: 'white', fontSize: myRank === 1 ? 36 : 28, fontWeight: 900, marginBottom: 8, textShadow: myRank === 1 ? '0 0 30px rgba(251,191,36,0.8)' : 'none' }}>
          {myRank === 1 ? '🎉 YOU WON! 🎉' : myRank === 2 ? '2nd Place! 🥈' : myRank === 3 ? '3rd Place! 🥉' : `You finished ${RANK_LABEL[myRank - 1]}!`}
        </h1>

        <div style={{ fontSize: 20, color: myRank === 1 ? '#fde68a' : tpl.accentColor, fontWeight: 700, marginBottom: 4 }}>
          Final Score: {me?.score || 0} points
        </div>
        <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 28, fontSize: 14 }}>
          out of {sorted.length} players
        </div>

        <div style={{ background: 'rgba(0,0,0,0.3)', border: `2px solid ${myRank === 1 ? '#fde68a' : tpl.accentColor}60`, borderRadius: 20, padding: '20px 32px', marginBottom: 28, minWidth: 280 }}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 8, letterSpacing: 2 }}>YOUR RESULT</div>
          <div style={{ fontSize: 52, fontWeight: 900, color: myRank === 1 ? '#fde68a' : tpl.accentColor }}>
            {RANK_LABEL[myRank - 1]?.toUpperCase() || `${myRank}TH`}
          </div>
          <div style={{ fontSize: 24, color: 'white', fontWeight: 700, marginTop: 4 }}>{me?.score || 0} pts</div>
          {me?.streak && me.streak > 1 ? <div style={{ color: '#fb923c', fontSize: 13, marginTop: 4 }}>🔥 Best streak: {me.streak}</div> : null}
        </div>

        {sorted.length >= 2 && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, justifyContent: 'center', marginBottom: 28 }}>
            {sorted[1] && (
              <div style={{ textAlign: 'center', flex: 1, maxWidth: 110 }}>
                <div style={{ background: 'rgba(156,163,175,0.3)', borderRadius: '12px 12px 0 0', padding: '14px 8px 8px', border: '1px solid rgba(156,163,175,0.4)' }}>
                  <div style={{ fontSize: 24 }}>🥈</div>
                  <div style={{ color: 'white', fontSize: 12, fontWeight: 700, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sorted[1].nickname}</div>
                  <div style={{ color: '#9ca3af', fontSize: 13, fontWeight: 800 }}>{sorted[1].score}</div>
                </div>
              </div>
            )}
            {sorted[0] && (
              <div style={{ textAlign: 'center', flex: 1, maxWidth: 130 }}>
                <div style={{ fontSize: 16, marginBottom: 4 }}>⭐⭐⭐</div>
                <div style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.3), rgba(217,119,6,0.3))', borderRadius: '12px 12px 0 0', padding: '18px 8px 8px', border: '1px solid rgba(251,191,36,0.5)' }}>
                  <div style={{ fontSize: 28 }}>🥇</div>
                  <div style={{ color: '#fde68a', fontSize: 13, fontWeight: 800, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sorted[0].nickname}</div>
                  <div style={{ color: '#fbbf24', fontSize: 15, fontWeight: 900 }}>{sorted[0].score}</div>
                </div>
              </div>
            )}
            {sorted[2] && (
              <div style={{ textAlign: 'center', flex: 1, maxWidth: 110 }}>
                <div style={{ background: 'rgba(180,83,9,0.25)', borderRadius: '12px 12px 0 0', padding: '10px 8px 8px', border: '1px solid rgba(180,83,9,0.4)' }}>
                  <div style={{ fontSize: 22 }}>🥉</div>
                  <div style={{ color: 'white', fontSize: 12, fontWeight: 700, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sorted[2].nickname}</div>
                  <div style={{ color: '#fb923c', fontSize: 13, fontWeight: 800 }}>{sorted[2].score}</div>
                </div>
              </div>
            )}
          </div>
        )}

        <button onClick={onFinish} style={{ background: `linear-gradient(135deg, ${tpl.accentColor}, ${tpl.choiceColors[0]})`, color: 'white', border: 'none', borderRadius: 14, padding: '16px 40px', fontSize: 17, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 6px 24px ${tpl.accentColor}50` }}>
          🏠 Back to Home
        </button>
      </div>

      <style>{`@keyframes bounceIn { 0% { transform: scale(0.3) rotate(-10deg); opacity: 0; } 60% { transform: scale(1.15) rotate(3deg); } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }`}</style>
    </div>
  );
}

// ── Waiting Screen ─────────────────────────────────────────────────────────
function WaitingScreen({ session, nickname, tpl, onBack }: { session: LiveSession; nickname: string; tpl: GameTemplate; onBack: () => void }) {
  const students = Object.values(session.students);
  const [dots, setDots] = useState('');
  useEffect(() => {
    const iv = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#46178f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {['⚗️','🧪','⚛️','🔬','🧬','💊'].map((e, i) => (
          <div key={i} style={{ position: 'absolute', fontSize: 28, opacity: 0.06, top: `${15 + i * 14}%`, left: `${8 + i * 14}%`, animation: `floatP ${4 + i}s ${i * 0.5}s ease-in-out infinite alternate` }}>{e}</div>
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 480, width: '100%' }}>
        <div style={{ fontSize: 64, marginBottom: 16, animation: 'pulse 1.5s ease-in-out infinite' }}>⚗️</div>

        <h2 style={{ color: 'white', fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{session.title}</h2>
        <div style={{ background: `${tpl.accentColor}25`, border: `2px solid ${tpl.accentColor}60`, borderRadius: 14, padding: '10px 24px', display: 'inline-block', marginBottom: 20 }}>
          <span style={{ color: tpl.accentColor, fontSize: 20, fontWeight: 900, letterSpacing: 4 }}>{nickname}</span>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, display: 'block', marginTop: 2 }}>You're in! ✓</span>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 20, fontSize: 15 }}>
          Waiting for teacher to start{dots}
        </p>

        <div style={{ background: tpl.cardBg, borderRadius: 18, padding: '16px 20px', marginBottom: 20, border: `1px solid ${tpl.accentColor}20` }}>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 12, fontWeight: 600, letterSpacing: 1 }}>
            {students.length} STUDENT{students.length !== 1 ? 'S' : ''} JOINED
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {students.map((s, i) => (
              <div key={s.nickname} style={{
                background: `${tpl.choiceColors[i % 4]}25`,
                border: `1px solid ${tpl.choiceColors[i % 4]}60`,
                borderRadius: 100, padding: '5px 14px',
                color: s.nickname === nickname ? tpl.accentColor : 'white',
                fontSize: 13, fontWeight: s.nickname === nickname ? 800 : 500,
                animation: 'popIn 0.3s ease',
              }}>
                {s.nickname === nickname ? `⭐ ${s.nickname}` : s.nickname}
              </div>
            ))}
            {students.length === 0 && <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>Waiting...</div>}
          </div>
        </div>

        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.4)', borderRadius: 10, padding: '9px 20px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>Leave</button>
      </div>
      <style>{`
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.12); } }
        @keyframes floatP { 0% { transform: translateY(0); } 100% { transform: translateY(-20px); } }
        @keyframes popIn { from { transform: scale(0.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}

// ── Connecting Screen ──────────────────────────────────────────────────────
function Connecting() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a0a1a,#1a0a2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48, animation: 'spin 1s linear infinite' }}>⚛️</div>
      <div style={{ color: 'white', fontSize: 18 }}>Connecting...</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function StudentGamePage({ pin, nickname, onFinish, onBack }: Props) {
  const [session, setSession] = useState<LiveSession | null>(null);
  const [localPhase, setLocalPhase] = useState<LocalPhase>('waiting');
  const [myScore, setMyScore] = useState(0);
  const [myStreak, setMyStreak] = useState(0);
  const [myAnswers, setMyAnswers] = useState<Record<number, number>>({});
  const [studentTimer, setStudentTimer] = useState(0);
  const [connFailed, setConnFailed] = useState(false);
  const joinedRef = useRef(false);
  const hasPlayedStartRef = useRef(false);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionRef = useRef<LiveSession | null>(null);
  const connTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tpl = getTemplate(session?.templateId || 'periodic-table');

  // Live timer for playing phase
  useEffect(() => {
    if (!session || session.status !== 'playing') {
      if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
      return;
    }
    const totalTime = session.questions[session.currentQuestion]?.timeSeconds || 20;
    const questionStartedAt = session.questionStartedAt;
    const compute = () => Math.max(0, totalTime - Math.floor((Date.now() - questionStartedAt) / 1000));
    setStudentTimer(compute());

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      const t = compute();
      setStudentTimer(t);
      playTick();
      if (t <= 3) playUrgent();
    }, 1000);

    return () => { if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; } };
  }, [session?.status, session?.currentQuestion, session?.questionStartedAt]);

  useEffect(() => {
    // 15-second timeout — if no session found, show error
    connTimeoutRef.current = setTimeout(() => {
      if (!sessionRef.current) setConnFailed(true);
    }, 15000);

    // Subscribe first so we start polling immediately
    const unsub = subscribeSession(pin, s => {
      if (!s) return;
      if (connTimeoutRef.current) { clearTimeout(connTimeoutRef.current); connTimeoutRef.current = null; }
      sessionRef.current = s;
      setSession(s);

      // Join once we confirm the session exists
      if (!joinedRef.current) {
        joinedRef.current = true;
        const slot: StudentSlot = { nickname, score: 0, streak: 0, answers: {}, answeredAt: {} };
        joinSession(pin, slot);
      }

      if (s.status === 'finished') {
        setLocalPhase('finished');
      } else if (s.status === 'leaderboard') {
        setLocalPhase('leaderboard');
      } else if (s.status === 'reveal') {
        setLocalPhase('reveal');
      } else if (s.status === 'playing') {
        setLocalPhase('playing');
        if (!hasPlayedStartRef.current) {
          hasPlayedStartRef.current = true;
          playChallengeStart();
        }
      } else {
        setLocalPhase('waiting');
      }
    });
    return () => { unsub(); if (connTimeoutRef.current) clearTimeout(connTimeoutRef.current); };
  }, [pin, nickname]);

  if (connFailed) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a0a1a,#1a0a2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 56 }}>📡</div>
        <h2 style={{ color: 'white', fontSize: 22, fontWeight: 800 }}>Connection Failed</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 360, lineHeight: 1.6 }}>
          Could not reach the teacher's game. Check that the teacher's screen is still open, your device is on the same network, and try again.
        </p>
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 12, padding: '12px 28px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15 }}>← Back</button>
      </div>
    );
  }

  const handleAnswer = useCallback(async (choiceIdx: number) => {
    const s = sessionRef.current;
    if (!s || myAnswers[s.currentQuestion] !== undefined) return;
    const q = s.questions?.[s.currentQuestion];
    if (!q) return;
    const isCorrect = choiceIdx === q.correctIndex;
    const newStreak = isCorrect ? myStreak + 1 : 0;
    const pts = isCorrect ? 100 + newStreak * 30 : 0;
    const newScore = myScore + pts;
    setMyAnswers(prev => ({ ...prev, [s.currentQuestion]: choiceIdx }));
    setMyScore(newScore);
    setMyStreak(newStreak);
    await submitAnswer(pin, nickname, s.currentQuestion, choiceIdx, newScore, newStreak);
  }, [myAnswers, myScore, myStreak, pin, nickname]);

  if (!session) return <Connecting />;
  if (localPhase === 'waiting') return <WaitingScreen session={session} nickname={nickname} tpl={tpl} onBack={onBack} />;
  if (localPhase === 'finished') return <FinishedScreen session={session} nickname={nickname} tpl={tpl} onFinish={onFinish} />;
  if (localPhase === 'leaderboard') return <LeaderboardScreen session={session} nickname={nickname} tpl={tpl} />;
  if (localPhase === 'reveal') return <RevealScreen session={session} tpl={tpl} myAnswerIdx={myAnswers[session.currentQuestion] ?? null} myScore={myScore} />;

  const answered = myAnswers[session.currentQuestion] !== undefined;
  return <QuizGame session={session} nickname={nickname} tpl={tpl} onAnswer={handleAnswer} myScore={myScore} answered={answered} timeLeft={studentTimer} />;
}
