import { useState, useEffect, useRef } from 'react';
import type { Game, LeaderboardEntry } from '../types';
import { getGameById, saveResult } from '../storage';

interface Props {
  gameId: string;
  onFinish: (entries: LeaderboardEntry[]) => void;
  onBack: () => void;
}

type Phase = 'nickname' | 'playing' | 'answer-reveal' | 'finished';

const COMPETITIVE_TYPES = ['quiz-battle', 'fastest-molecule', 'periodic-challenge', 'reaction-race', 'energy-points'];
const TIMER_SECS: Record<string, number> = {
  'quiz-battle': 20, 'fastest-molecule': 10, 'periodic-challenge': 25,
  'reaction-race': 15, 'energy-points': 20,
};

export default function PlayGamePage({ gameId, onFinish, onBack }: Props) {
  const [game, setGame] = useState<Game | null>(null);
  const [phase, setPhase] = useState<Phase>('nickname');
  const [nickname, setNickname] = useState('');
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [startTime, setStartTime] = useState(0);
  const [, setAnswers] = useState<(number | null)[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const g = getGameById(gameId);
    if (g) { setGame(g); setAnswers(new Array(g.questions.length).fill(null)); }
  }, [gameId]);

  const isCompetitive = game ? COMPETITIVE_TYPES.includes(game.gameType) : false;
  const maxTime = game ? (TIMER_SECS[game.gameType] || 20) : 20;

  const startTimer = () => {
    setTimeLeft(maxTime);
    setStartTime(Date.now());
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeout = () => {
    setSelected(-1);
    setShowExplanation(true);
    setPhase('answer-reveal');
  };

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleStart = () => {
    if (!nickname.trim() && isCompetitive) return;
    setPhase('playing');
    if (isCompetitive) startTimer();
  };

  const handleSelect = (idx: number) => {
    if (phase !== 'playing') return;
    clearTimer();
    setSelected(idx);
    setPhase('answer-reveal');
    setShowExplanation(true);

    const q = game!.questions[currentQ];
    const isCorrect = idx === q.correctIndex;
    const elapsed = Date.now() - startTime;
    const timeBonus = isCompetitive ? Math.max(0, Math.floor((maxTime * 1000 - elapsed) / 100)) : 0;
    const pts = isCorrect ? (100 + timeBonus) : 0;
    setScore(prev => prev + pts);
    setAnswers(prev => prev.map((a, i) => i === currentQ ? idx : a));
  };

  const handleNext = () => {
    setShowExplanation(false);
    setSelected(null);
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
    const entry: LeaderboardEntry = { nickname: nickname || 'Player', score, time: Date.now() };
    const result = { gameId, leaderboard: [entry], playedAt: new Date().toISOString() };
    saveResult(result);
    onFinish([entry]);
  };

  if (!game) return <div style={{ color: 'white', padding: 40, textAlign: 'center' }}>Loading...</div>;

  // Nickname screen
  if (phase === 'nickname') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: 24,
      }}>
        <div style={{ textAlign: 'center', maxWidth: 480, width: '100%' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎮</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: 'white', marginBottom: 8 }}>{game.title}</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>📚 {game.lessonName}</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 32 }}>
            {game.questions.length} questions • {isCompetitive ? '⚔️ Competitive' : '📚 Practice'}
          </p>

          {isCompetitive && (
            <div style={{ marginBottom: 24 }}>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, display: 'block', marginBottom: 10 }}>
                Enter your nickname to join:
              </label>
              <input
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleStart()}
                placeholder="Your nickname..."
                autoFocus
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.08)',
                  border: '2px solid rgba(192,132,252,0.4)', borderRadius: 14,
                  padding: '14px 18px', color: 'white', fontSize: 16,
                  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                  textAlign: 'center',
                }}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={onBack} style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
              color: 'white', borderRadius: 14, padding: '14px 28px',
              fontSize: 16, cursor: 'pointer', fontFamily: 'inherit',
            }}>← Back</button>
            <button
              onClick={handleStart}
              disabled={isCompetitive && !nickname.trim()}
              style={{
                background: isCompetitive && !nickname.trim()
                  ? 'rgba(192,132,252,0.3)'
                  : 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white', border: 'none', borderRadius: 14, padding: '14px 40px',
                fontSize: 18, fontWeight: 700, cursor: isCompetitive && !nickname.trim() ? 'default' : 'pointer',
                fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(34,197,94,0.4)',
              }}
            >🚀 Start Game!</button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz screen
  const q = game.questions[currentQ];
  const CHOICE_COLORS = ['#c084fc', '#7dd3fc', '#fde68a', '#6ee7b7'];

  const getChoiceBg = (idx: number) => {
    if (phase === 'playing') return `${CHOICE_COLORS[idx]}20`;
    if (idx === q.correctIndex) return 'rgba(34,197,94,0.25)';
    if (selected === idx && idx !== q.correctIndex) return 'rgba(239,68,68,0.25)';
    return 'rgba(255,255,255,0.04)';
  };
  const getChoiceBorder = (idx: number) => {
    if (phase === 'playing') return `1px solid ${CHOICE_COLORS[idx]}50`;
    if (idx === q.correctIndex) return '2px solid #22c55e';
    if (selected === idx && idx !== q.correctIndex) return '2px solid #ef4444';
    return '1px solid rgba(255,255,255,0.1)';
  };

  const timerPercent = (timeLeft / maxTime) * 100;
  const timerColor = timerPercent > 50 ? '#22c55e' : timerPercent > 25 ? '#fde68a' : '#ef4444';

  return (
    <div style={{ minHeight: '100vh', padding: 24 }}>
      {/* Header bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24, flexWrap: 'wrap', gap: 12,
      }}>
        <button onClick={onBack} style={{
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
          color: 'white', borderRadius: 10, padding: '8px 14px',
          cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
        }}>← Exit</button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Question</div>
          <div style={{ fontWeight: 700, color: 'white', fontSize: 16 }}>
            {currentQ + 1} / {game.questions.length}
          </div>
        </div>

        {isCompetitive ? (
          <div style={{ textAlign: 'center', minWidth: 80 }}>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Score</div>
            <div style={{ fontWeight: 800, fontSize: 20, color: '#fde68a' }}>{score}</div>
          </div>
        ) : <div style={{ width: 80 }} />}
      </div>

      {/* Timer (competitive only) */}
      {isCompetitive && phase === 'playing' && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 100, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${timerPercent}%`,
              background: `linear-gradient(90deg, ${timerColor}, ${timerColor}aa)`,
              borderRadius: 100,
              transition: 'width 1s linear, background 0.3s',
            }} />
          </div>
          <div style={{ textAlign: 'right', color: timerColor, fontSize: 14, fontWeight: 700, marginTop: 4 }}>
            {timeLeft}s
          </div>
        </div>
      )}

      {/* Question */}
      <div style={{
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 24, padding: '32px 28px', marginBottom: 24, textAlign: 'center',
      }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 12 }}>
          {isCompetitive ? `⚔️ ${game.gameType.replace('-', ' ').toUpperCase()}` : `📚 ${game.gameType.replace('-', ' ').toUpperCase()}`}
        </p>
        <h2 style={{ fontSize: 'clamp(18px, 4vw, 28px)', fontWeight: 700, color: 'white', lineHeight: 1.4 }}>
          {q.text}
        </h2>
      </div>

      {/* Choices */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 24 }}>
        {q.choices.map((choice, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            disabled={phase !== 'playing'}
            style={{
              background: getChoiceBg(idx),
              border: getChoiceBorder(idx),
              borderRadius: 16,
              padding: '18px 20px',
              color: 'white',
              cursor: phase === 'playing' ? 'pointer' : 'default',
              fontFamily: 'inherit',
              fontSize: 15,
              fontWeight: 500,
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              transition: 'all 0.2s',
              transform: 'scale(1)',
            }}
            onMouseEnter={e => phase === 'playing' && (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <span style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: CHOICE_COLORS[idx] + '30',
              border: `2px solid ${CHOICE_COLORS[idx]}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 14, color: CHOICE_COLORS[idx],
            }}>
              {phase !== 'playing' && idx === q.correctIndex ? '✓' : phase !== 'playing' && selected === idx && idx !== q.correctIndex ? '✗' : String.fromCharCode(65 + idx)}
            </span>
            {choice}
          </button>
        ))}
      </div>

      {/* Explanation */}
      {showExplanation && q.explanation && (
        <div style={{
          background: 'rgba(125,211,252,0.1)', border: '1px solid rgba(125,211,252,0.3)',
          borderRadius: 16, padding: '16px 20px', marginBottom: 20,
          animation: 'fadeIn 0.3s ease',
        }}>
          <p style={{ color: '#7dd3fc', fontWeight: 600, marginBottom: 4 }}>💡 Explanation</p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.5 }}>{q.explanation}</p>
        </div>
      )}

      {/* Next button */}
      {phase === 'answer-reveal' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            marginBottom: 16, padding: '12px 24px', borderRadius: 100,
            background: selected === q.correctIndex ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
            border: `1px solid ${selected === q.correctIndex ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'}`,
            fontSize: 18, fontWeight: 700,
            color: selected === q.correctIndex ? '#22c55e' : '#ef4444',
          }}>
            {selected === q.correctIndex ? '🎉 Correct!' : selected === -1 ? '⏰ Time\'s up!' : '❌ Incorrect'}
            {isCompetitive && selected === q.correctIndex && (
              <span style={{ color: '#fde68a', fontSize: 14 }}>+{score - (currentQ * 0)} pts</span>
            )}
          </div>
          <br />
          <button
            onClick={handleNext}
            style={{
              background: 'linear-gradient(135deg, #c084fc, #a78bfa)',
              color: 'white', border: 'none', borderRadius: 14, padding: '14px 40px',
              fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 20px rgba(192,132,252,0.4)',
            }}
          >
            {currentQ + 1 >= game.questions.length ? '🏁 Finish Game' : 'Next Question →'}
          </button>
        </div>
      )}

      {/* Practice mode: no timer, always show next */}
      {!isCompetitive && phase === 'playing' && selected === null && (
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
          Select an answer to continue
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
