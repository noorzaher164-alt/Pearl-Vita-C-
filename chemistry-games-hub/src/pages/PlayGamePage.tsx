import { useState, useEffect, useRef, useCallback } from 'react';
import type { Game, LeaderboardEntry } from '../types';
import { getGameById, saveResult } from '../storage';

interface Props {
  gameId: string;
  onFinish: (entries: LeaderboardEntry[]) => void;
  onBack: () => void;
}

type Phase = 'nickname' | 'countdown' | 'playing' | 'answer-reveal' | 'between' | 'finished';

const COMPETITIVE_TYPES = ['quiz-battle', 'fastest-molecule', 'periodic-challenge', 'reaction-race', 'energy-points'];
const TIMER_SECS: Record<string, number> = {
  'quiz-battle': 20, 'fastest-molecule': 10, 'periodic-challenge': 25,
  'reaction-race': 15, 'energy-points': 20,
};

// Kahoot-style choice config
const CHOICES = [
  { color: '#e74c3c', darkColor: '#c0392b', shape: '▲', label: 'A' },
  { color: '#2980e4', darkColor: '#1a6bc0', shape: '◆', label: 'B' },
  { color: '#f1c40f', darkColor: '#d4a017', shape: '●', label: 'C' },
  { color: '#27ae60', darkColor: '#1e8449', shape: '■', label: 'D' },
];

// Web Audio API sound effects
function playSound(type: 'correct' | 'wrong' | 'tick' | 'start' | 'finish') {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'correct') {
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(); osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'wrong') {
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.setValueAtTime(150, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(); osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'tick') {
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start(); osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'start') {
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'finish') {
      const freqs = [523, 659, 784, 1047];
      freqs.forEach((f, i) => {
        const o2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        o2.connect(g2); g2.connect(ctx.destination);
        o2.frequency.setValueAtTime(f, ctx.currentTime + i * 0.1);
        g2.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1);
        g2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.3);
        o2.start(ctx.currentTime + i * 0.1);
        o2.stop(ctx.currentTime + i * 0.1 + 0.3);
      });
    }
  } catch { /* audio not supported */ }
}

// Confetti particle component
function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  const particles = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: ['#c084fc', '#7dd3fc', '#fde68a', '#6ee7b7', '#fca5a5', '#f093fb'][i % 6],
    delay: Math.random() * 0.5,
    duration: 1 + Math.random() * 1.5,
    size: 6 + Math.random() * 8,
  }));

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 200, overflow: 'hidden' }}>
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.x}%`,
          top: 0,
          width: p.size,
          height: p.size,
          background: p.color,
          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
        }} />
      ))}
    </div>
  );
}

// Animated circular timer
function TimerCircle({ timeLeft, maxTime, color }: { timeLeft: number; maxTime: number; color: string }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / maxTime;
  const offset = circumference * (1 - progress);

  return (
    <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto' }}>
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={radius} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28, fontWeight: 800, color,
      }}>
        {timeLeft}
      </div>
    </div>
  );
}

export default function PlayGamePage({ gameId, onFinish, onBack }: Props) {
  const [game, setGame] = useState<Game | null>(null);
  const [phase, setPhase] = useState<Phase>('nickname');
  const [nickname, setNickname] = useState('');
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [startTime, setStartTime] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [soundOn, setSoundOn] = useState(true);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [, setAllAnswers] = useState<(number | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const g = getGameById(gameId);
    if (g) { setGame(g); setAllAnswers(new Array(g.questions.length).fill(null)); }
  }, [gameId]);

  const isCompetitive = game ? COMPETITIVE_TYPES.includes(game.gameType) : false;
  const maxTime = game ? (TIMER_SECS[game.gameType] || 20) : 20;

  const timerColor = timeLeft / maxTime > 0.5 ? '#22c55e' : timeLeft / maxTime > 0.25 ? '#fde68a' : '#ef4444';

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const handleTimeout = useCallback(() => {
    if (soundOn) playSound('wrong');
    setSelected(-1);
    setStreak(0);
    setPhase('answer-reveal');
  }, [soundOn]);

  const startTimer = useCallback(() => {
    setTimeLeft(maxTime);
    setStartTime(Date.now());
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeout();
          return 0;
        }
        if (prev <= 5 && soundOn) playSound('tick');
        return prev - 1;
      });
    }, 1000);
  }, [maxTime, soundOn, handleTimeout]);

  const handleStart = () => {
    if (!nickname.trim() && isCompetitive) return;
    if (soundOn) playSound('start');
    // Countdown 3-2-1
    setPhase('countdown');
    setCountdown(3);
    let c = 3;
    const iv = setInterval(() => {
      c--;
      if (c <= 0) {
        clearInterval(iv);
        setPhase('playing');
        if (isCompetitive) startTimer();
      } else {
        setCountdown(c);
      }
    }, 800);
  };

  const handleSelect = (idx: number) => {
    if (phase !== 'playing') return;
    clearTimer();
    setSelected(idx);
    setPhase('answer-reveal');

    const q = game!.questions[currentQ];
    const isCorrect = idx === q.correctIndex;
    const elapsed = Date.now() - startTime;
    const timeBonus = isCompetitive ? Math.max(0, Math.floor((maxTime * 1000 - elapsed) / 100)) : 0;
    const streakBonus = isCompetitive ? streak * 50 : 0;
    const pts = isCorrect ? (100 + timeBonus + streakBonus) : 0;

    if (isCorrect) {
      setStreak(s => s + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      if (soundOn) playSound('correct');
    } else {
      setStreak(0);
      if (soundOn) playSound('wrong');
    }

    setPointsEarned(pts);
    setScore(prev => prev + pts);
    setAllAnswers(prev => prev.map((a, i) => i === currentQ ? idx : a));
  };

  const handleNext = () => {
    setSelected(null);
    setPointsEarned(0);
    if (currentQ + 1 >= (game?.questions.length || 0)) {
      handleFinish();
    } else {
      setCurrentQ(prev => prev + 1);
      setPhase('playing');
      if (isCompetitive) startTimer();
    }
  };

  const handleFinish = () => {
    setPhase('finished');
    if (soundOn) playSound('finish');
    const entry: LeaderboardEntry = { nickname: nickname || 'Player', score, time: Date.now() };
    saveResult({ gameId, leaderboard: [entry], playedAt: new Date().toISOString() });
    onFinish([entry]);
  };

  if (!game) return <div style={{ color: 'white', padding: 40, textAlign: 'center' }}>Loading...</div>;

  // ── NICKNAME SCREEN ──────────────────────────────────────────────────────────
  if (phase === 'nickname') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 500, width: '100%' }}>
          <div style={{ fontSize: 72, marginBottom: 16, animation: 'bounce 1s infinite' }}>🎮</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: 'white', marginBottom: 8 }}>{game.title}</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>📚 {game.lessonName}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(192,132,252,0.2)', border: '1px solid rgba(192,132,252,0.4)', color: '#c084fc', borderRadius: 100, padding: '4px 14px', fontSize: 13 }}>
              ❓ {game.questions.length} questions
            </span>
            <span style={{ background: isCompetitive ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)', border: `1px solid ${isCompetitive ? 'rgba(239,68,68,0.4)' : 'rgba(34,197,94,0.4)'}`, color: isCompetitive ? '#fca5a5' : '#6ee7b7', borderRadius: 100, padding: '4px 14px', fontSize: 13 }}>
              {isCompetitive ? '⚔️ Competitive' : '📚 Practice'}
            </span>
          </div>

          {isCompetitive && (
            <div style={{ marginBottom: 24 }}>
              <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, display: 'block', marginBottom: 10 }}>🎭 Enter your nickname:</label>
              <input
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && nickname.trim() && handleStart()}
                placeholder="Your nickname..."
                autoFocus
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.08)',
                  border: '2px solid rgba(192,132,252,0.5)', borderRadius: 14,
                  padding: '16px 20px', color: 'white', fontSize: 18,
                  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', textAlign: 'center',
                }}
              />
            </div>
          )}

          {/* Sound toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 24 }}>
            <button onClick={() => setSoundOn(s => !s)} style={{
              background: soundOn ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${soundOn ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.15)'}`,
              color: soundOn ? '#6ee7b7' : 'rgba(255,255,255,0.4)',
              borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14,
            }}>
              {soundOn ? '🔊 Sound ON' : '🔇 Sound OFF'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={onBack} style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
              color: 'white', borderRadius: 14, padding: '14px 28px', fontSize: 16, cursor: 'pointer', fontFamily: 'inherit',
            }}>← Back</button>
            <button
              onClick={handleStart}
              disabled={isCompetitive && !nickname.trim()}
              style={{
                background: isCompetitive && !nickname.trim() ? 'rgba(34,197,94,0.3)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white', border: 'none', borderRadius: 14, padding: '14px 44px',
                fontSize: 20, fontWeight: 800, cursor: isCompetitive && !nickname.trim() ? 'default' : 'pointer',
                fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(34,197,94,0.4)',
                letterSpacing: 1,
              }}
            >🚀 START!</button>
          </div>
        </div>
        <style>{`@keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }`}</style>
      </div>
    );
  }

  // ── COUNTDOWN SCREEN ─────────────────────────────────────────────────────────
  if (phase === 'countdown') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          fontSize: 160, fontWeight: 900, color: 'white',
          textShadow: '0 0 60px rgba(192,132,252,0.8)',
          animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          {countdown}
        </div>
        <style>{`@keyframes popIn { 0% { transform: scale(0.3); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }`}</style>
      </div>
    );
  }

  // ── QUIZ SCREEN ───────────────────────────────────────────────────────────────
  const q = game.questions[currentQ];
  const progress = ((currentQ) / game.questions.length) * 100;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Confetti active={showConfetti} />

      {/* Top bar */}
      <div style={{
        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)',
        padding: '12px 20px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 12,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <button onClick={onBack} style={{
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
          color: 'white', borderRadius: 8, padding: '6px 12px',
          cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
        }}>✕</button>

        {/* Progress bar */}
        <div style={{ flex: 1, maxWidth: 400 }}>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 100, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: 'linear-gradient(90deg, #c084fc, #7dd3fc)',
              borderRadius: 100, transition: 'width 0.5s ease',
            }} />
          </div>
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 }}>
            {currentQ + 1} / {game.questions.length}
          </div>
        </div>

        {/* Score + streak */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {streak >= 2 && (
            <div style={{
              background: 'linear-gradient(135deg, #fde68a, #fb923c)',
              borderRadius: 100, padding: '4px 12px', fontSize: 13, fontWeight: 700, color: '#1a0933',
            }}>
              🔥 x{streak}
            </div>
          )}
          {isCompetitive && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>SCORE</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fde68a' }}>{score}</div>
            </div>
          )}
        </div>
      </div>

      {/* Timer + Question */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(192,132,252,0.15) 0%, transparent 100%)',
        padding: '24px 20px', textAlign: 'center',
      }}>
        {isCompetitive && phase === 'playing' && (
          <div style={{ marginBottom: 16 }}>
            <TimerCircle timeLeft={timeLeft} maxTime={maxTime} color={timerColor} />
          </div>
        )}

        <div style={{
          background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 20, padding: '24px 20px', maxWidth: 700, margin: '0 auto',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 8, letterSpacing: 1 }}>
            QUESTION {currentQ + 1}
          </p>
          <h2 style={{ fontSize: 'clamp(18px, 3.5vw, 28px)', fontWeight: 700, color: 'white', lineHeight: 1.4, margin: 0 }}>
            {q.text}
          </h2>
        </div>
      </div>

      {/* Answer choices — Kahoot style */}
      <div style={{
        flex: 1, padding: '16px 20px 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 12,
        maxWidth: 800,
        margin: '0 auto',
        width: '100%',
        alignContent: 'start',
      }}>
        {q.choices.map((choice, idx) => {
          const cfg = CHOICES[idx];
          const isSelected = selected === idx;
          const isCorrect = idx === q.correctIndex;
          const revealed = phase === 'answer-reveal';

          let bg = cfg.color;
          let opacity = 1;
          let scale = 'scale(1)';
          let border = 'none';

          if (revealed) {
            if (isCorrect) { bg = '#22c55e'; scale = 'scale(1.03)'; border = '3px solid #fff'; }
            else if (isSelected && !isCorrect) { bg = '#ef4444'; opacity = 0.9; }
            else { opacity = 0.35; }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={phase !== 'playing'}
              style={{
                background: bg,
                border,
                borderRadius: 16,
                padding: '20px 16px',
                color: 'white',
                cursor: phase === 'playing' ? 'pointer' : 'default',
                fontFamily: 'inherit',
                fontSize: 'clamp(14px, 2.5vw, 18px)',
                fontWeight: 700,
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: 'all 0.25s ease',
                opacity,
                transform: scale,
                boxShadow: revealed && isCorrect ? '0 0 30px rgba(34,197,94,0.6)' : `0 4px 15px ${cfg.color}60`,
                minHeight: 70,
              }}
              onMouseEnter={e => phase === 'playing' && (e.currentTarget.style.transform = 'scale(1.03)')}
              onMouseLeave={e => phase === 'playing' && (e.currentTarget.style.transform = 'scale(1)')}
            >
              <span style={{
                width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                background: 'rgba(0,0,0,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 900,
              }}>
                {revealed && isCorrect ? '✓' : revealed && isSelected && !isCorrect ? '✗' : cfg.shape}
              </span>
              <span style={{ flex: 1, lineHeight: 1.3 }}>{choice}</span>
            </button>
          );
        })}
      </div>

      {/* Reveal panel */}
      {phase === 'answer-reveal' && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'rgba(15,10,30,0.97)', backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          padding: '20px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          animation: 'slideUp 0.3s ease',
        }}>
          {/* Result badge */}
          <div style={{
            fontSize: 22, fontWeight: 800,
            color: selected === q.correctIndex ? '#22c55e' : selected === -1 ? '#fde68a' : '#ef4444',
          }}>
            {selected === q.correctIndex ? '🎉 Correct!' : selected === -1 ? '⏰ Time\'s up!' : '❌ Wrong!'}
            {isCompetitive && pointsEarned > 0 && (
              <span style={{ marginLeft: 12, fontSize: 18, color: '#fde68a' }}>+{pointsEarned} pts</span>
            )}
            {streak >= 3 && selected === q.correctIndex && (
              <span style={{ marginLeft: 12, fontSize: 16, color: '#fb923c' }}>🔥 {streak} streak!</span>
            )}
          </div>

          {/* Explanation */}
          {q.explanation && (
            <div style={{
              background: 'rgba(125,211,252,0.1)', border: '1px solid rgba(125,211,252,0.3)',
              borderRadius: 12, padding: '12px 16px', maxWidth: 600, width: '100%', textAlign: 'center',
            }}>
              <span style={{ color: '#7dd3fc', fontWeight: 600 }}>💡 </span>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>{q.explanation}</span>
            </div>
          )}

          <button
            onClick={handleNext}
            style={{
              background: 'linear-gradient(135deg, #c084fc, #a78bfa)',
              color: 'white', border: 'none', borderRadius: 14, padding: '14px 48px',
              fontSize: 17, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 20px rgba(192,132,252,0.5)',
            }}
          >
            {currentQ + 1 >= game.questions.length ? '🏁 See Results' : 'Next →'}
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}
