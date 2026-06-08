import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Game, LeaderboardEntry } from '../types';
import { getGameById, saveResult } from '../storage';
import { getTemplate, type GameTemplate } from '../templates';

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

const CHOICES = [
  { color: '#e74c3c', darkColor: '#c0392b', shape: '▲', label: 'A' },
  { color: '#2980e4', darkColor: '#1a6bc0', shape: '◆', label: 'B' },
  { color: '#f1c40f', darkColor: '#d4a017', shape: '●', label: 'C' },
  { color: '#27ae60', darkColor: '#1e8449', shape: '■', label: 'D' },
];

function playSound(type: 'correct' | 'wrong' | 'tick' | 'start' | 'finish') {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (type === 'correct') {
      [523, 659, 784, 1047].forEach((f, i) => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination); o.type = 'triangle';
        o.frequency.setValueAtTime(f, ctx.currentTime + i * 0.07);
        g.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.07);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.07 + 0.3);
        o.start(ctx.currentTime + i * 0.07); o.stop(ctx.currentTime + i * 0.07 + 0.3);
      });
    } else if (type === 'wrong') {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination); o.type = 'sawtooth';
      o.frequency.setValueAtTime(250, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.45);
      g.gain.setValueAtTime(0.3, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      o.start(); o.stop(ctx.currentTime + 0.45);
    } else if (type === 'tick') {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination); o.type = 'square';
      o.frequency.setValueAtTime(1400, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.06);
      g.gain.setValueAtTime(0.09, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      o.start(); o.stop(ctx.currentTime + 0.08);
    } else if (type === 'start') {
      [300, 450, 600, 800, 1000, 1200].forEach((f, i) => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination); o.type = 'sine';
        o.frequency.setValueAtTime(f, ctx.currentTime + i * 0.09);
        g.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.09);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.09 + 0.18);
        o.start(ctx.currentTime + i * 0.09); o.stop(ctx.currentTime + i * 0.09 + 0.18);
      });
    } else if (type === 'finish') {
      [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination); o.type = 'triangle';
        o.frequency.setValueAtTime(f, ctx.currentTime + i * 0.1);
        g.gain.setValueAtTime(0.22, ctx.currentTime + i * 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.25);
        o.start(ctx.currentTime + i * 0.1); o.stop(ctx.currentTime + i * 0.1 + 0.25);
      });
    }
  } catch { /* audio not supported */ }
}

function FloatingParticles({ particles, color }: { particles: string[]; color: string }) {
  const items = Array.from({ length: 18 }, (_, i) => ({
    id: i, text: particles[i % particles.length],
    x: (i * 37 + Math.sin(i * 1.7) * 20 + 50) % 95,
    y: (i * 23 + Math.cos(i * 1.3) * 15 + 10) % 90,
    size: 9 + (i % 5) * 3, duration: 6 + (i % 4) * 2, delay: -(i * 0.8),
  }));
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      <style>{`@keyframes floatUp { 0%,100% { transform: translateY(0) rotate(0deg); opacity: 0.15; } 50% { transform: translateY(-18px) rotate(8deg); opacity: 0.35; } }`}</style>
      {items.map(p => (
        <span key={p.id} style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, fontSize: p.size, color, fontWeight: 700, fontFamily: 'monospace', animation: `floatUp ${p.duration}s ${p.delay}s ease-in-out infinite`, userSelect: 'none' }}>{p.text}</span>
      ))}
    </div>
  );
}

function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  const particles = Array.from({ length: 60 }, (_, i) => ({
    id: i, x: Math.random() * 100,
    color: ['#c084fc', '#7dd3fc', '#fde68a', '#6ee7b7', '#fca5a5', '#f093fb'][i % 6],
    delay: Math.random() * 0.5, duration: 1 + Math.random() * 1.5, size: 6 + Math.random() * 8,
  }));
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 200, overflow: 'hidden' }}>
      <style>{`@keyframes confettiFall { 0% { transform: translateY(-20px) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }`}</style>
      {particles.map(p => (
        <div key={p.id} style={{ position: 'absolute', left: `${p.x}%`, top: 0, width: p.size, height: p.size, background: p.color, borderRadius: Math.random() > 0.5 ? '50%' : '2px', animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards` }} />
      ))}
    </div>
  );
}

function TimerCircle({ timeLeft, maxTime, color }: { timeLeft: number; maxTime: number; color: string }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - timeLeft / maxTime);
  return (
    <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto' }}>
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
        <circle cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color }}>{timeLeft}</div>
    </div>
  );
}

// ── FLASHCARDS MODE ───────────────────────────────────────────────────────────
function FlashcardsGame({ game, tpl, onFinish, onBack, soundOn }: { game: Game; tpl: GameTemplate; onFinish: (score: number, streak: number) => void; onBack: () => void; soundOn: boolean }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);

  const q = game.questions[idx];
  const answer = q.choices[q.correctIndex];

  const handleRate = (knew: boolean) => {
    const newScore = knew ? score + 100 : score;
    const newStreak = knew ? streak + 1 : 0;
    setScore(newScore);
    setStreak(newStreak);
    setResults(r => [...r, knew]);
    if (soundOn) playSound(knew ? 'correct' : 'wrong');
    if (idx + 1 >= game.questions.length) {
      setTimeout(() => onFinish(newScore, newStreak), 400);
    } else {
      setIdx(i => i + 1);
      setFlipped(false);
    }
  };

  const progress = ((idx) / game.questions.length) * 100;
  const known = results.filter(Boolean).length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: tpl.bg, position: 'relative', overflow: 'hidden' }}>
      <FloatingParticles particles={tpl.particles} color={tpl.accentColor} />

      {/* Header */}
      <div style={{ background: tpl.headerBg, backdropFilter: 'blur(10px)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'relative', zIndex: 2 }}>
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>✕</button>
        <div style={{ flex: 1 }}>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 100, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${tpl.accentColor}, #7dd3fc)`, borderRadius: 100, transition: 'width 0.5s ease' }} />
          </div>
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 }}>{idx + 1} / {game.questions.length}</div>
        </div>
        <div style={{ fontSize: 13, color: '#6ee7b7', fontWeight: 700 }}>✓ {known}</div>
      </div>

      {/* Card area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: 16, fontSize: 13, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, fontWeight: 700 }}>
          {flipped ? 'ANSWER' : 'CLICK CARD TO REVEAL ANSWER'}
        </div>

        {/* 3D flip card */}
        <div
          onClick={() => !flipped && setFlipped(true)}
          style={{ width: '100%', maxWidth: 560, height: 260, cursor: flipped ? 'default' : 'pointer', perspective: 1200 }}
        >
          <div style={{
            position: 'relative', width: '100%', height: '100%',
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            {/* Front */}
            <div style={{
              position: 'absolute', inset: 0,
              background: tpl.cardBg, border: `2px solid ${tpl.accentColor}40`,
              borderRadius: 24, padding: '32px 28px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              backfaceVisibility: 'hidden', boxShadow: `0 12px 50px rgba(0,0,0,0.4), 0 0 0 1px ${tpl.accentColor}20`,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 11, color: tpl.accentColor, letterSpacing: 3, fontWeight: 800, marginBottom: 16 }}>QUESTION 🃏</div>
              <p style={{ color: 'white', fontSize: 'clamp(16px, 3vw, 24px)', fontWeight: 700, lineHeight: 1.5, margin: 0 }}>{q.text}</p>
              <div style={{ marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>👆 Tap to flip</div>
            </div>

            {/* Back */}
            <div style={{
              position: 'absolute', inset: 0,
              background: `linear-gradient(135deg, ${tpl.accentColor}25, rgba(34,197,94,0.15))`,
              border: `2px solid ${tpl.accentColor}60`,
              borderRadius: 24, padding: '32px 28px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              backfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
              boxShadow: `0 12px 50px rgba(0,0,0,0.4)`, textAlign: 'center',
            }}>
              <div style={{ fontSize: 11, color: '#6ee7b7', letterSpacing: 3, fontWeight: 800, marginBottom: 16 }}>ANSWER ✓</div>
              <p style={{ color: 'white', fontSize: 'clamp(18px, 3.5vw, 28px)', fontWeight: 800, lineHeight: 1.4, margin: 0 }}>{answer}</p>
              {q.explanation && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 12, lineHeight: 1.4 }}>💡 {q.explanation}</p>}
            </div>
          </div>
        </div>

        {/* Rating buttons */}
        {flipped && (
          <div style={{ display: 'flex', gap: 16, marginTop: 28, width: '100%', maxWidth: 560 }}>
            <button onClick={() => handleRate(false)} style={{
              flex: 1, background: 'rgba(239,68,68,0.2)', border: '2px solid rgba(239,68,68,0.5)',
              color: '#fca5a5', borderRadius: 16, padding: '16px', fontSize: 16, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
            >✗ Didn't know</button>
            <button onClick={() => handleRate(true)} style={{
              flex: 1, background: 'rgba(34,197,94,0.2)', border: '2px solid rgba(34,197,94,0.5)',
              color: '#6ee7b7', borderRadius: 16, padding: '16px', fontSize: 16, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.2)'; }}
            >✓ Knew it!</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MATCH TERMS MODE ──────────────────────────────────────────────────────────
function MatchTermsGame({ game, tpl, onFinish, onBack, soundOn }: { game: Game; tpl: GameTemplate; onFinish: (score: number, streak: number) => void; onBack: () => void; soundOn: boolean }) {
  const pairs = useMemo(() => game.questions.map(q => ({
    id: q.id, term: q.text, def: q.choices[q.correctIndex],
  })), [game]);

  const shuffledDefs = useMemo(() => [...pairs].sort(() => Math.random() - 0.5), [pairs]);

  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [flash, setFlash] = useState<{ id: string; ok: boolean } | null>(null);
  const [score, setScore] = useState(0);

  const handleTermClick = (id: string) => {
    if (matched.has(id)) return;
    setSelectedTerm(prev => prev === id ? null : id);
  };

  const handleDefClick = (id: string) => {
    if (matched.has(id)) return;
    if (!selectedTerm) return;

    if (selectedTerm === id) {
      const newScore = score + 100;
      setScore(newScore);
      const newMatched = new Set([...matched, id]);
      setMatched(newMatched);
      setSelectedTerm(null);
      setFlash({ id, ok: true });
      if (soundOn) playSound('correct');
      setTimeout(() => setFlash(null), 600);
      if (newMatched.size >= pairs.length) {
        setTimeout(() => onFinish(newScore, 0), 700);
      }
    } else {
      setFlash({ id, ok: false });
      if (soundOn) playSound('wrong');
      setTimeout(() => { setFlash(null); setSelectedTerm(null); }, 700);
    }
  };

  const progress = (matched.size / pairs.length) * 100;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: tpl.bg }}>
      {/* Header */}
      <div style={{ background: tpl.headerBg, backdropFilter: 'blur(10px)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>✕</button>
        <div style={{ flex: 1 }}>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 100, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${tpl.accentColor}, #6ee7b7)`, borderRadius: 100, transition: 'width 0.5s ease' }} />
          </div>
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 }}>{matched.size} / {pairs.length} matched</div>
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: tpl.accentColor }}>{score}</div>
      </div>

      <div style={{ padding: '16px 16px 32px', maxWidth: 900, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 20 }}>
          {selectedTerm ? '👆 Now click the matching definition on the right' : '👆 Click a term on the left to start'}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {/* Terms column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 11, color: tpl.accentColor, letterSpacing: 2, fontWeight: 800, marginBottom: 4, textAlign: 'center' }}>TERMS</div>
            {pairs.map(p => {
              const isMatched = matched.has(p.id);
              const isSelected = selectedTerm === p.id;
              return (
                <button key={p.id} onClick={() => handleTermClick(p.id)} disabled={isMatched}
                  style={{
                    background: isMatched ? 'rgba(34,197,94,0.2)' : isSelected ? `${tpl.accentColor}30` : 'rgba(255,255,255,0.06)',
                    border: `2px solid ${isMatched ? 'rgba(34,197,94,0.6)' : isSelected ? tpl.accentColor : 'rgba(255,255,255,0.12)'}`,
                    borderRadius: 14, padding: '14px 16px', color: isMatched ? '#6ee7b7' : 'white',
                    cursor: isMatched ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: 14,
                    fontWeight: isSelected ? 700 : 500, textAlign: 'left', lineHeight: 1.4,
                    transition: 'all 0.2s', minHeight: 60,
                    opacity: isMatched ? 0.7 : 1,
                    textDecoration: isMatched ? 'line-through' : 'none',
                  }}>
                  {isMatched ? '✓ ' : ''}{p.term}
                </button>
              );
            })}
          </div>

          {/* Definitions column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 11, color: '#7dd3fc', letterSpacing: 2, fontWeight: 800, marginBottom: 4, textAlign: 'center' }}>DEFINITIONS</div>
            {shuffledDefs.map(p => {
              const isMatched = matched.has(p.id);
              const isFlash = flash?.id === p.id;
              return (
                <button key={p.id} onClick={() => handleDefClick(p.id)} disabled={isMatched}
                  style={{
                    background: isMatched ? 'rgba(34,197,94,0.2)' : isFlash ? (flash!.ok ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)') : 'rgba(255,255,255,0.06)',
                    border: `2px solid ${isMatched ? 'rgba(34,197,94,0.6)' : isFlash ? (flash!.ok ? '#22c55e' : '#ef4444') : 'rgba(125,211,252,0.25)'}`,
                    borderRadius: 14, padding: '14px 16px', color: isMatched ? '#6ee7b7' : 'white',
                    cursor: isMatched ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: 14,
                    fontWeight: 500, textAlign: 'left', lineHeight: 1.4,
                    transition: 'all 0.2s', minHeight: 60,
                    opacity: isMatched ? 0.7 : 1,
                  }}>
                  {isMatched ? '✓ ' : ''}{p.def}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── WORD SEARCH MODE ──────────────────────────────────────────────────────────
function buildWordSearchGrid(words: string[], size = 13) {
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(''));
  const placed: { word: string; cells: [number, number][] }[] = [];

  const cleaned = words
    .map(w => w.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 11))
    .filter((w, i, a) => w.length >= 3 && a.indexOf(w) === i);

  for (const word of cleaned) {
    let success = false;
    for (let attempt = 0; attempt < 200 && !success; attempt++) {
      const horiz = Math.random() > 0.5;
      const maxR = horiz ? size : size - word.length;
      const maxC = horiz ? size - word.length : size;
      if (maxR <= 0 || maxC <= 0) continue;
      const r = Math.floor(Math.random() * maxR);
      const c = Math.floor(Math.random() * maxC);
      const cells: [number, number][] = [];
      let ok = true;
      for (let i = 0; i < word.length; i++) {
        const rr = horiz ? r : r + i;
        const cc = horiz ? c + i : c;
        if (grid[rr][cc] !== '' && grid[rr][cc] !== word[i]) { ok = false; break; }
        cells.push([rr, cc]);
      }
      if (ok) {
        cells.forEach(([rr, cc], i) => { grid[rr][cc] = word[i]; });
        placed.push({ word, cells });
        success = true;
      }
    }
  }

  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (grid[r][c] === '') grid[r][c] = LETTERS[Math.floor(Math.random() * 26)];

  return { grid, placed };
}

function WordSearchGame({ game, tpl, onFinish, onBack, soundOn }: { game: Game; tpl: GameTemplate; onFinish: (score: number, streak: number) => void; onBack: () => void; soundOn: boolean }) {
  const GRID_SIZE = 13;
  const words = game.questions.map(q => q.choices[q.correctIndex]);
  const { grid, placed } = useMemo(() => buildWordSearchGrid(words, GRID_SIZE), []);

  const [selectStart, setSelectStart] = useState<[number, number] | null>(null);
  const [selectEnd, setSelectEnd] = useState<[number, number] | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [foundCells, setFoundCells] = useState<[number, number][]>([]);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [score, setScore] = useState(0);

  const selectedCells = useMemo((): [number, number][] => {
    if (!selectStart || !selectEnd) return selectStart ? [selectStart] : [];
    const [r1, c1] = selectStart, [r2, c2] = selectEnd;
    if (r1 === r2) {
      const [mn, mx] = [Math.min(c1, c2), Math.max(c1, c2)];
      return Array.from({ length: mx - mn + 1 }, (_, i) => [r1, mn + i]);
    } else if (c1 === c2) {
      const [mn, mx] = [Math.min(r1, r2), Math.max(r1, r2)];
      return Array.from({ length: mx - mn + 1 }, (_, i) => [mn + i, c1]);
    }
    return [selectStart];
  }, [selectStart, selectEnd]);

  const isCellSelected = (r: number, c: number) => selectedCells.some(([sr, sc]) => sr === r && sc === c);
  const isCellFound = (r: number, c: number) => foundCells.some(([fr, fc]) => fr === r && fc === c);

  const checkSelection = () => {
    if (selectedCells.length < 2) { setSelectStart(null); setSelectEnd(null); setIsSelecting(false); return; }
    const word = selectedCells.map(([r, c]) => grid[r][c]).join('');
    const revWord = word.split('').reverse().join('');
    const match = placed.find(p => !foundWords.has(p.word) && (p.word === word || p.word === revWord));
    if (match) {
      const newScore = score + 100;
      setScore(newScore);
      setFoundWords(prev => new Set([...prev, match.word]));
      setFoundCells(prev => [...prev, ...match.cells]);
      if (soundOn) playSound('correct');
      const newFound = foundWords.size + 1;
      if (newFound >= placed.length) setTimeout(() => onFinish(newScore, 0), 600);
    } else {
      setWrongFlash(true);
      if (soundOn) playSound('wrong');
      setTimeout(() => setWrongFlash(false), 500);
    }
    setSelectStart(null); setSelectEnd(null); setIsSelecting(false);
  };

  const cellSize = Math.min(Math.floor((Math.min(window.innerWidth - 32, 520)) / GRID_SIZE), 38);
  const progress = (foundWords.size / placed.length) * 100;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: tpl.bg, userSelect: 'none' }}>
      {/* Header */}
      <div style={{ background: tpl.headerBg, backdropFilter: 'blur(10px)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>✕</button>
        <div style={{ flex: 1 }}>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 100, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${tpl.accentColor}, #6ee7b7)`, borderRadius: 100, transition: 'width 0.5s' }} />
          </div>
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 }}>{foundWords.size} / {placed.length} found</div>
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: tpl.accentColor }}>{score}</div>
      </div>

      <div style={{ padding: '16px 16px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>Click and drag to select words in the grid</p>

        {/* Grid */}
        <div style={{ display: 'inline-block', border: `2px solid ${wrongFlash ? 'rgba(239,68,68,0.7)' : tpl.accentColor + '40'}`, borderRadius: 12, overflow: 'hidden', transition: 'border-color 0.2s', cursor: 'crosshair' }}>
          {grid.map((row, r) => (
            <div key={r} style={{ display: 'flex' }}>
              {row.map((letter, c) => {
                const sel = isCellSelected(r, c);
                const found = isCellFound(r, c);
                return (
                  <div key={c}
                    onMouseDown={() => { setSelectStart([r, c]); setSelectEnd([r, c]); setIsSelecting(true); }}
                    onMouseEnter={() => { if (isSelecting) setSelectEnd([r, c]); }}
                    onMouseUp={() => { if (isSelecting) { setSelectEnd([r, c]); checkSelection(); } }}
                    style={{
                      width: cellSize, height: cellSize,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: Math.max(cellSize * 0.45, 11), fontWeight: 800, fontFamily: 'monospace',
                      color: found ? '#1a0933' : sel ? 'white' : 'rgba(255,255,255,0.75)',
                      background: found ? '#6ee7b7' : sel ? tpl.accentColor : 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      transition: 'background 0.1s',
                      cursor: 'crosshair',
                    }}>
                    {letter}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Word list */}
        <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 560 }}>
          {placed.map(p => (
            <span key={p.word} style={{
              background: foundWords.has(p.word) ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.07)',
              border: `1px solid ${foundWords.has(p.word) ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.15)'}`,
              borderRadius: 8, padding: '5px 12px', fontSize: 13, fontWeight: 700,
              color: foundWords.has(p.word) ? '#6ee7b7' : 'rgba(255,255,255,0.6)',
              textDecoration: foundWords.has(p.word) ? 'line-through' : 'none',
              fontFamily: 'monospace',
            }}>{p.word}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function PlayGamePage({ gameId, onFinish, onBack }: Props) {
  const [game, setGame] = useState<Game | null>(null);
  const [tpl, setTpl] = useState<GameTemplate>(getTemplate('periodic-table'));
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
  // Drag & Drop
  const [dragSelected, setDragSelected] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const g = getGameById(gameId);
    if (g) { setGame(g); setTpl(getTemplate(g.templateId || 'periodic-table')); setAllAnswers(new Array(g.questions.length).fill(null)); }
  }, [gameId]);

  const isCompetitive = game ? COMPETITIVE_TYPES.includes(game.gameType) : false;
  const currentQuestion = game?.questions[currentQ];
  const maxTime = currentQuestion?.timeSeconds || (game ? (TIMER_SECS[game.gameType] || 20) : 20);
  const urgencyColor = timeLeft / maxTime > 0.5 ? tpl.timerColor : timeLeft / maxTime > 0.25 ? '#fde68a' : '#ef4444';

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const handleTimeout = useCallback(() => {
    if (soundOn) playSound('wrong');
    setSelected(-1); setStreak(0); setPhase('answer-reveal');
  }, [soundOn]);

  const startTimer = useCallback(() => {
    setTimeLeft(maxTime); setStartTime(Date.now());
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); handleTimeout(); return 0; }
        if (prev <= 5 && soundOn) playSound('tick');
        return prev - 1;
      });
    }, 1000);
  }, [maxTime, soundOn, handleTimeout]);

  const finishGame = useCallback((finalScore: number, finalStreak: number, finalNickname: string) => {
    setPhase('finished');
    if (soundOn) playSound('finish');
    const entry: LeaderboardEntry = { nickname: finalNickname || 'Player', score: finalScore, streak: finalStreak, rank: 1, time: Date.now() };
    saveResult({ id: crypto.randomUUID(), gameId, gameTitle: game?.title ?? '', sessionType: 'solo', leaderboard: [entry], playedAt: new Date().toISOString() });
    onFinish([entry]);
  }, [soundOn, gameId, game, onFinish]);

  const handleStart = () => {
    if (!nickname.trim() && isCompetitive) return;
    if (soundOn) playSound('start');
    setPhase('countdown'); setCountdown(3);
    let c = 3;
    const iv = setInterval(() => {
      c--;
      if (c <= 0) { clearInterval(iv); setPhase('playing'); if (isCompetitive) startTimer(); }
      else setCountdown(c);
    }, 800);
  };

  const handleSelect = (idx: number) => {
    if (phase !== 'playing') return;
    clearTimer(); setSelected(idx); setPhase('answer-reveal');
    const q = game!.questions[currentQ];
    const isCorrect = idx === q.correctIndex;
    const elapsed = Date.now() - startTime;
    const timeBonus = isCompetitive ? Math.max(0, Math.floor((maxTime * 1000 - elapsed) / 100)) : 0;
    const streakBonus = isCompetitive ? streak * 50 : 0;
    const pts = isCorrect ? (100 + timeBonus + streakBonus) : 0;
    if (isCorrect) { setStreak(s => s + 1); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 2000); if (soundOn) playSound('correct'); }
    else { setStreak(0); if (soundOn) playSound('wrong'); }
    setPointsEarned(pts); setScore(prev => prev + pts);
    setAllAnswers(prev => prev.map((a, i) => i === currentQ ? idx : a));
  };

  const handleNext = () => {
    setSelected(null); setPointsEarned(0); setDragSelected(null);
    if (currentQ + 1 >= (game?.questions.length || 0)) finishGame(score, streak, nickname);
    else { setCurrentQ(prev => prev + 1); setPhase('playing'); if (isCompetitive) startTimer(); }
  };

  if (!game) return <div style={{ color: 'white', padding: 40, textAlign: 'center' }}>Loading...</div>;

  // ── NICKNAME SCREEN ─────────────────────────────────────────────────────────
  if (phase === 'nickname') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, background: tpl.bg, position: 'relative', overflow: 'hidden' }}>
        <FloatingParticles particles={tpl.particles} color={tpl.accentColor} />
        <div style={{ textAlign: 'center', maxWidth: 500, width: '100%', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 72, marginBottom: 16, animation: 'bounce 1s infinite' }}>🎮</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: 'white', marginBottom: 8 }}>{game.title}</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>📚 {game.lessonName}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(192,132,252,0.2)', border: '1px solid rgba(192,132,252,0.4)', color: '#c084fc', borderRadius: 100, padding: '4px 14px', fontSize: 13 }}>❓ {game.questions.length} questions</span>
            <span style={{ background: isCompetitive ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)', border: `1px solid ${isCompetitive ? 'rgba(239,68,68,0.4)' : 'rgba(34,197,94,0.4)'}`, color: isCompetitive ? '#fca5a5' : '#6ee7b7', borderRadius: 100, padding: '4px 14px', fontSize: 13 }}>
              {isCompetitive ? '⚔️ Competitive' : '📚 Practice'}
            </span>
          </div>
          {isCompetitive && (
            <div style={{ marginBottom: 24 }}>
              <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, display: 'block', marginBottom: 10 }}>🎭 Enter your nickname:</label>
              <input value={nickname} onChange={e => setNickname(e.target.value)} onKeyDown={e => e.key === 'Enter' && nickname.trim() && handleStart()} placeholder="Your nickname..." autoFocus
                style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(192,132,252,0.5)', borderRadius: 14, padding: '16px 20px', color: 'white', fontSize: 18, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', textAlign: 'center' }} />
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 24 }}>
            <button onClick={() => setSoundOn(s => !s)} style={{ background: soundOn ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${soundOn ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.15)'}`, color: soundOn ? '#6ee7b7' : 'rgba(255,255,255,0.4)', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>
              {soundOn ? '🔊 Sound ON' : '🔇 Sound OFF'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 14, padding: '14px 28px', fontSize: 16, cursor: 'pointer', fontFamily: 'inherit' }}>← Back</button>
            <button onClick={handleStart} disabled={isCompetitive && !nickname.trim()}
              style={{ background: isCompetitive && !nickname.trim() ? 'rgba(34,197,94,0.3)' : 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', border: 'none', borderRadius: 14, padding: '14px 44px', fontSize: 20, fontWeight: 800, cursor: isCompetitive && !nickname.trim() ? 'default' : 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(34,197,94,0.4)', letterSpacing: 1 }}>
              🚀 START!
            </button>
          </div>
        </div>
        <style>{`@keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }`}</style>
      </div>
    );
  }

  // ── COUNTDOWN SCREEN ────────────────────────────────────────────────────────
  if (phase === 'countdown') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: tpl.bg, position: 'relative', overflow: 'hidden' }}>
        <FloatingParticles particles={tpl.particles} color={tpl.accentColor} />
        <div style={{ fontSize: 160, fontWeight: 900, color: tpl.accentColor, textShadow: `0 0 60px ${tpl.accentColor}80`, animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)', position: 'relative', zIndex: 1 }}>{countdown}</div>
        <style>{`@keyframes popIn { 0% { transform: scale(0.3); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }`}</style>
      </div>
    );
  }

  // ── PRACTICE GAME MODES (full-screen) ───────────────────────────────────────
  if (game.gameType === 'flashcards') {
    return <FlashcardsGame game={game} tpl={tpl} onFinish={(s, st) => finishGame(s, st, nickname || 'Player')} onBack={onBack} soundOn={soundOn} />;
  }
  if (game.gameType === 'match-terms') {
    return <MatchTermsGame game={game} tpl={tpl} onFinish={(s, st) => finishGame(s, st, nickname || 'Player')} onBack={onBack} soundOn={soundOn} />;
  }
  if (game.gameType === 'word-search') {
    return <WordSearchGame game={game} tpl={tpl} onFinish={(s, st) => finishGame(s, st, nickname || 'Player')} onBack={onBack} soundOn={soundOn} />;
  }

  // ── QUIZ / MCQ SCREEN (competitive + true-false + drag-drop) ────────────────
  const q = game.questions[currentQ];
  const progress = (currentQ / game.questions.length) * 100;
  const isTrueFalse = game.gameType === 'true-false';
  const isDragDrop = game.gameType === 'drag-drop';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: tpl.bg }}>
      <Confetti active={showConfetti} />

      {/* Top bar */}
      <div style={{ background: tpl.headerBg, backdropFilter: 'blur(10px)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>✕</button>
        <div style={{ flex: 1, maxWidth: 400 }}>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 100, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${tpl.accentColor}, ${tpl.choiceColors[2] || tpl.accentColor})`, borderRadius: 100, transition: 'width 0.5s ease' }} />
          </div>
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 }}>{currentQ + 1} / {game.questions.length}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {streak >= 2 && <div style={{ background: 'linear-gradient(135deg, #fde68a, #fb923c)', borderRadius: 100, padding: '4px 12px', fontSize: 13, fontWeight: 700, color: '#1a0933' }}>🔥 x{streak}</div>}
          {isCompetitive && <div style={{ textAlign: 'center' }}><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>SCORE</div><div style={{ fontSize: 22, fontWeight: 800, color: tpl.accentColor }}>{score}</div></div>}
        </div>
      </div>

      {/* Timer + Question */}
      <div style={{ background: `linear-gradient(180deg, ${tpl.accentColor}18 0%, transparent 100%)`, padding: '24px 20px', textAlign: 'center' }}>
        {isCompetitive && phase === 'playing' && <div style={{ marginBottom: 16 }}><TimerCircle timeLeft={timeLeft} maxTime={maxTime} color={urgencyColor} /></div>}
        <div style={{ background: tpl.cardBg, border: `1px solid ${tpl.accentColor}30`, borderRadius: 24, padding: '28px 28px', maxWidth: 760, margin: '0 auto', boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}>
          <p style={{ color: tpl.accentColor, fontSize: 13, marginBottom: 10, letterSpacing: 2, fontWeight: 700 }}>QUESTION {currentQ + 1}</p>
          <h2 style={{ fontSize: 'clamp(20px, 3.5vw, 32px)', fontWeight: 700, color: 'white', lineHeight: 1.5, margin: 0 }}>{q.text}</h2>
        </div>
      </div>

      {/* ── TRUE/FALSE CHOICES ── */}
      {isTrueFalse && (
        <div style={{ flex: 1, padding: '20px 24px 32px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          {q.choices.slice(0, 2).map((choice, idx) => {
            const isSelected = selected === idx;
            const isCorrect = idx === q.correctIndex;
            const revealed = phase === 'answer-reveal';
            const baseColor = idx === 0 ? '#22c55e' : '#ef4444';
            const icon = idx === 0 ? '✅' : '❌';
            let bg = baseColor;
            let opacity = 1;
            if (revealed) {
              if (isCorrect) { bg = '#22c55e'; }
              else if (isSelected) { bg = '#ef4444'; opacity = 0.9; }
              else { opacity = 0.3; }
            }
            return (
              <button key={idx} onClick={() => handleSelect(idx)} disabled={phase !== 'playing'}
                style={{ background: bg, border: revealed && isCorrect ? '3px solid white' : 'none', borderRadius: 20, padding: '28px 24px', color: 'white', cursor: phase === 'playing' ? 'pointer' : 'default', fontFamily: 'inherit', fontSize: 'clamp(20px, 4vw, 32px)', fontWeight: 800, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, opacity, transition: 'all 0.25s', boxShadow: revealed && isCorrect ? '0 0 50px rgba(34,197,94,0.7)' : `0 8px 30px ${baseColor}60`, minHeight: 100 }}
                onMouseEnter={e => phase === 'playing' && (e.currentTarget.style.transform = 'scale(1.02)')}
                onMouseLeave={e => phase === 'playing' && (e.currentTarget.style.transform = 'scale(1)')}>
                <span style={{ fontSize: 40 }}>{icon}</span>
                <span>{choice}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── DRAG & DROP CHOICES ── */}
      {isDragDrop && (
        <div style={{ flex: 1, padding: '16px 24px 120px', maxWidth: 860, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          {/* Drop zone */}
          <div style={{
            border: `2px dashed ${dragSelected !== null ? tpl.accentColor : 'rgba(255,255,255,0.2)'}`,
            borderRadius: 20, padding: '20px 24px', textAlign: 'center', marginBottom: 24,
            background: dragSelected !== null ? `${tpl.accentColor}12` : 'rgba(255,255,255,0.03)',
            transition: 'all 0.3s', minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); if (dragSelected !== null) { handleSelect(dragSelected); setDragSelected(null); } }}>
            {dragSelected !== null ? (
              <div style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>
                <span style={{ fontSize: 24 }}>{CHOICES[dragSelected]?.shape} </span>
                {q.choices[dragSelected]}
              </div>
            ) : (
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 15 }}>🎯 Drag the correct answer here</div>
            )}
          </div>

          {/* Draggable choices */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {q.choices.map((choice, idx) => {
              const cfg = CHOICES[idx];
              const choiceColor = tpl.choiceColors[idx] || cfg.color;
              const isSelected = selected === idx;
              const isCorrect = idx === q.correctIndex;
              const revealed = phase === 'answer-reveal';
              let bg = choiceColor;
              let opacity = 1;
              if (revealed) {
                if (isCorrect) { bg = '#22c55e'; }
                else if (isSelected) { bg = '#ef4444'; opacity = 0.8; }
                else { opacity = 0.3; }
              }
              return (
                <div key={idx}
                  draggable={phase === 'playing' && !revealed}
                  onClick={() => { if (phase === 'playing') { if (dragSelected === idx) { handleSelect(idx); setDragSelected(null); } else setDragSelected(idx); } }}
                  onDragStart={() => setDragSelected(idx)}
                  onDragEnd={() => {}}
                  style={{
                    background: bg, borderRadius: 18, padding: '20px 18px', color: 'white',
                    cursor: phase === 'playing' ? 'grab' : 'default', fontFamily: 'inherit',
                    fontSize: 'clamp(14px, 2.2vw, 18px)', fontWeight: 700, textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: 12, opacity,
                    transition: 'all 0.2s', minHeight: 80, userSelect: 'none',
                    border: revealed && isCorrect ? '3px solid white' : dragSelected === idx ? `3px solid white` : 'none',
                    boxShadow: revealed && isCorrect ? '0 0 40px rgba(34,197,94,0.7)' : `0 4px 16px ${choiceColor}50`,
                    transform: dragSelected === idx && phase === 'playing' ? 'scale(1.04)' : 'scale(1)',
                  }}>
                  <span style={{ width: 38, height: 38, borderRadius: 8, flexShrink: 0, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                    {revealed && isCorrect ? '✓' : revealed && isSelected ? '✗' : cfg.shape}
                  </span>
                  <span style={{ flex: 1, lineHeight: 1.3 }}>{choice}</span>
                </div>
              );
            })}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, textAlign: 'center', marginTop: 12 }}>
            {phase === 'playing' ? 'Drag to the zone above, or click twice to confirm' : ''}
          </p>
        </div>
      )}

      {/* ── STANDARD MCQ CHOICES ── */}
      {!isTrueFalse && !isDragDrop && (
        <div style={{ flex: 1, padding: '20px 24px 32px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, maxWidth: 860, margin: '0 auto', width: '100%', alignContent: 'start' }}>
          {q.choices.map((choice, idx) => {
            const cfg = CHOICES[idx];
            const choiceColor = tpl.choiceColors[idx] || cfg.color;
            const isSelected = selected === idx;
            const isCorrect = idx === q.correctIndex;
            const revealed = phase === 'answer-reveal';
            let bg = choiceColor, opacity = 1, scale = 'scale(1)', border = 'none';
            if (revealed) {
              if (isCorrect) { bg = '#22c55e'; scale = 'scale(1.03)'; border = '3px solid #fff'; }
              else if (isSelected && !isCorrect) { bg = '#ef4444'; opacity = 0.9; }
              else { opacity = 0.35; }
            }
            return (
              <button key={idx} onClick={() => handleSelect(idx)} disabled={phase !== 'playing'}
                style={{ background: bg, border, borderRadius: 20, padding: '22px 20px', color: 'white', cursor: phase === 'playing' ? 'pointer' : 'default', fontFamily: 'inherit', fontSize: 'clamp(15px, 2.5vw, 20px)', fontWeight: 700, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.25s ease', opacity, transform: scale, boxShadow: revealed && isCorrect ? '0 0 40px rgba(34,197,94,0.7)' : `0 6px 20px ${choiceColor}50`, minHeight: 90 }}
                onMouseEnter={e => phase === 'playing' && (e.currentTarget.style.transform = 'scale(1.03)')}
                onMouseLeave={e => phase === 'playing' && (e.currentTarget.style.transform = 'scale(1)')}>
                <span style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900 }}>
                  {revealed && isCorrect ? '✓' : revealed && isSelected && !isCorrect ? '✗' : cfg.shape}
                </span>
                <span style={{ flex: 1, lineHeight: 1.3 }}>{choice}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Reveal panel */}
      {phase === 'answer-reveal' && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: tpl.cardBg, backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '20px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, animation: 'slideUp 0.3s ease' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: selected === q.correctIndex ? '#22c55e' : selected === -1 ? '#fde68a' : '#ef4444', role: 'status' } as React.CSSProperties} aria-live="assertive">
            {selected === q.correctIndex ? '🎉 Correct!' : selected === -1 ? "⏰ Time's up!" : '❌ Wrong!'}
            {isCompetitive && pointsEarned > 0 && <span style={{ marginLeft: 12, fontSize: 18, color: '#fde68a' }}>+{pointsEarned} pts</span>}
            {streak >= 3 && selected === q.correctIndex && <span style={{ marginLeft: 12, fontSize: 16, color: '#fb923c' }}>🔥 {streak} streak!</span>}
          </div>
          {q.explanation && (
            <div style={{ background: 'rgba(125,211,252,0.1)', border: '1px solid rgba(125,211,252,0.3)', borderRadius: 12, padding: '12px 16px', maxWidth: 600, width: '100%', textAlign: 'center' }}>
              <span style={{ color: '#7dd3fc', fontWeight: 600 }}>💡 </span>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>{q.explanation}</span>
            </div>
          )}
          <button onClick={handleNext} style={{ background: `linear-gradient(135deg, ${tpl.accentColor}, ${tpl.choiceColors[1] || tpl.accentColor})`, color: 'white', border: 'none', borderRadius: 14, padding: '14px 48px', fontSize: 17, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 4px 20px ${tpl.accentColor}50` }}>
            {currentQ + 1 >= game.questions.length ? '🏁 See Results' : 'Next →'}
          </button>
        </div>
      )}

      <style>{`@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  );
}
