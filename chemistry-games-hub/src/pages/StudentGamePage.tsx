import { useState, useEffect, useRef, useCallback } from 'react';
import { getGameById } from '../storage';
import { getTemplate, type GameTemplate } from '../templates';
import { subscribeSession, submitAnswer, joinSession, type LiveSession, type StudentSlot } from '../realtime';

interface Props {
  pin: string;
  nickname: string;
  onFinish: () => void;
  onBack: () => void;
}

type LocalPhase = 'waiting' | 'playing' | 'reveal' | 'leaderboard' | 'finished';

const CAR_EMOJIS = ['🏎️', '🚗', '🚕', '🚙', '🛻', '🏍️', '🚓', '🚑'];
const FISH = ['🐟', '🐠', '🐡', '🦈', '🐬', '🦑', '🐙', '🦐'];
const MEDAL = ['🥇', '🥈', '🥉'];
const RANK_LABEL = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

// ── Sound engine ───────────────────────────────────────────────────────────
function makeCtx() {
  return new (window.AudioContext || (window as any).webkitAudioContext)();
}

function playChallengeCorrect() {
  try {
    const ctx = makeCtx();
    [523, 659, 784, 1047].forEach((f, i) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'triangle';
      o.frequency.setValueAtTime(f, ctx.currentTime + i * 0.07);
      g.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.07);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.07 + 0.25);
      o.start(ctx.currentTime + i * 0.07);
      o.stop(ctx.currentTime + i * 0.07 + 0.25);
    });
  } catch { /* */ }
}

function playChallengeWrong() {
  try {
    const ctx = makeCtx();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(220, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.4);
    g.gain.setValueAtTime(0.3, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    o.start(); o.stop(ctx.currentTime + 0.4);
  } catch { /* */ }
}

function playChallengeStart() {
  try {
    const ctx = makeCtx();
    [300, 500, 700, 1000, 1400].forEach((f, i) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(f, ctx.currentTime + i * 0.1);
      g.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.2);
      o.start(ctx.currentTime + i * 0.1);
      o.stop(ctx.currentTime + i * 0.1 + 0.2);
    });
  } catch { /* */ }
}

function playChallengeVictory(rank: number) {
  try {
    const ctx = makeCtx();
    if (rank === 1) {
      // Grand fanfare for 1st place
      const melody = [523, 659, 784, 1047, 784, 1047, 1175, 1319];
      melody.forEach((f, i) => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'triangle';
        o.frequency.setValueAtTime(f, ctx.currentTime + i * 0.12);
        g.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.12);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.2);
        o.start(ctx.currentTime + i * 0.12);
        o.stop(ctx.currentTime + i * 0.12 + 0.2);
      });
    } else if (rank <= 3) {
      // Nice melody for 2nd/3rd
      [523, 659, 784, 1047].forEach((f, i) => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'sine';
        o.frequency.setValueAtTime(f, ctx.currentTime + i * 0.1);
        g.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.25);
        o.start(ctx.currentTime + i * 0.1);
        o.stop(ctx.currentTime + i * 0.1 + 0.25);
      });
    } else {
      // Simple end sound
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.setValueAtTime(440, ctx.currentTime);
      g.gain.setValueAtTime(0.15, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      o.start(); o.stop(ctx.currentTime + 0.4);
    }
  } catch { /* */ }
}

// ── Confetti ────────────────────────────────────────────────────────────────
function BigConfetti({ active, gold }: { active: boolean; gold?: boolean }) {
  if (!active) return null;
  const particles = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: gold
      ? ['#fde68a', '#fbbf24', '#f59e0b', '#fff', '#c084fc'][i % 5]
      : ['#c084fc', '#7dd3fc', '#6ee7b7', '#fca5a5', '#fde68a', '#f093fb'][i % 6],
    delay: Math.random() * 0.8,
    duration: 1.5 + Math.random() * 2,
    size: 8 + Math.random() * 12,
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

// ── Racing Game ────────────────────────────────────────────────────────────
function RacingGame({ session, nickname, tpl, onAnswer, myScore, answered }: {
  session: LiveSession; nickname: string; tpl: GameTemplate;
  onAnswer: (idx: number) => void; myScore: number; answered: boolean;
}) {
  const game = getGameById(session.gameId);
  if (!game) return null;
  const q = game.questions[session.currentQuestion];
  const students = Object.values(session.students).sort((a, b) => b.score - a.score);
  const maxScore = Math.max(...students.map(s => s.score), 100);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: tpl.bg }}>
      <div style={{ background: tpl.headerBg, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${tpl.accentColor}30` }}>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Q {session.currentQuestion + 1}/{session.questionCount}</div>
        <div style={{ color: tpl.accentColor, fontWeight: 800, fontSize: 18 }}>⭐ {myScore} pts</div>
      </div>

      {/* Race track */}
      <div style={{ background: 'rgba(0,0,0,0.35)', padding: '10px 16px 8px', borderBottom: `1px solid ${tpl.accentColor}15` }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          {students.slice(0, 6).map((s, i) => {
            const pct = Math.min((s.score / maxScore) * 82, 82);
            const isMe = s.nickname === nickname;
            return (
              <div key={s.nickname} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <span style={{ width: 20, fontSize: 13, textAlign: 'center', flexShrink: 0 }}>{MEDAL[i] || `${i+1}`}</span>
                <div style={{ flex: 1, height: 26, background: 'rgba(255,255,255,0.06)', borderRadius: 100, position: 'relative', overflow: 'visible' }}>
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 18px, rgba(255,255,255,0.03) 18px, rgba(255,255,255,0.03) 20px)', borderRadius: 100 }} />
                  <div style={{
                    position: 'absolute', top: '50%', left: `calc(${pct}% - 12px)`,
                    transform: 'translateY(-50%)',
                    fontSize: 18, transition: 'left 0.9s cubic-bezier(0.34,1.56,0.64,1)',
                    filter: isMe ? 'drop-shadow(0 0 6px white)' : 'none',
                  }}>{CAR_EMOJIS[i % CAR_EMOJIS.length]}</div>
                  <div style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', fontSize: 12 }}>🏁</div>
                </div>
                <span style={{ width: 72, fontSize: 11, color: isMe ? tpl.accentColor : 'rgba(255,255,255,0.45)', fontWeight: isMe ? 800 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {isMe ? `⭐${s.nickname}` : s.nickname}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Question */}
      <div style={{ padding: '16px', textAlign: 'center', maxWidth: 700, margin: '0 auto', width: '100%' }}>
        <div style={{ background: tpl.cardBg, border: `1px solid ${tpl.accentColor}30`, borderRadius: 20, padding: '20px', marginBottom: 16 }}>
          <h2 style={{ color: 'white', fontSize: 'clamp(16px,3vw,24px)', fontWeight: 700, lineHeight: 1.4, margin: 0 }}>{q?.text}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {q?.choices.map((choice, ci) => {
            const color = tpl.choiceColors[ci];
            return (
              <button key={ci} onClick={() => !answered && onAnswer(ci)} disabled={answered}
                style={{
                  background: answered ? `${color}35` : color,
                  border: `2px solid ${answered ? color + '30' : color}`,
                  borderRadius: 16, padding: '18px 14px', color: answered ? 'rgba(255,255,255,0.4)' : 'white',
                  cursor: answered ? 'default' : 'pointer', fontFamily: 'inherit',
                  fontSize: 'clamp(14px,2.5vw,18px)', fontWeight: 700, textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.2s',
                  minHeight: 72, boxShadow: answered ? 'none' : `0 4px 18px ${color}50`,
                  transform: answered ? 'scale(0.96)' : 'scale(1)',
                }}>
                <span style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 900, flexShrink: 0 }}>
                  {['▲','◆','●','■'][ci]}
                </span>
                <span style={{ lineHeight: 1.3 }}>{choice}</span>
              </button>
            );
          })}
        </div>
        {answered && <div style={{ color: tpl.accentColor, marginTop: 14, fontWeight: 700, fontSize: 15 }}>✓ Answer locked in! 🏎️</div>}
      </div>
    </div>
  );
}

// ── Fishing Game ───────────────────────────────────────────────────────────
function FishingGame({ session, tpl, onAnswer, answered }: {
  session: LiveSession; tpl: GameTemplate; onAnswer: (idx: number) => void; answered: boolean;
}) {
  const game = getGameById(session.gameId);
  if (!game) return null;
  const q = game.questions[session.currentQuestion];
  const [fishPos, setFishPos] = useState(() =>
    q?.choices.map((_, i) => ({ x: 10 + Math.random() * 60, y: 25 + i * 20 + Math.random() * 8, dir: i % 2 === 0 ? 1 : -1 })) || []
  );
  useEffect(() => {
    const iv = setInterval(() => setFishPos(prev => prev.map(p => {
      let nx = p.x + p.dir * 0.5; let nd = p.dir;
      if (nx > 78 || nx < 5) nd = -nd;
      return { ...p, x: nx, dir: nd };
    })), 80);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0c1445 0%,#0e4d7b 60%,#1a6fa0 100%)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 6, background: 'linear-gradient(90deg,#67e8f9,#38bdf8,#0ea5e9,#38bdf8,#67e8f9)' }} />
      <div style={{ padding: '14px', textAlign: 'center' }}>
        <div style={{ background: 'rgba(14,82,123,0.92)', border: '2px solid #38bdf880', borderRadius: 18, padding: '14px 18px', maxWidth: 580, margin: '0 auto' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 5 }}>🎣 Catch the correct fish!</p>
          <h2 style={{ color: 'white', fontSize: 'clamp(15px,3vw,22px)', fontWeight: 700, lineHeight: 1.4, margin: 0 }}>{q?.text}</h2>
        </div>
      </div>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', margin: '0 14px 14px', background: 'rgba(0,0,0,0.25)', borderRadius: 18, border: '2px solid #38bdf840' }}>
        {q?.choices.map((choice, ci) => {
          const pos = fishPos[ci] || { x: 15 + ci * 18, y: 30 + ci * 18, dir: 1 };
          return (
            <button key={ci} onClick={() => !answered && onAnswer(ci)} disabled={answered}
              style={{ position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`, transform: `scaleX(${pos.dir}) translateX(-50%)`, background: 'none', border: 'none', cursor: answered ? 'default' : 'pointer', fontFamily: 'inherit', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'top 0.08s linear', opacity: answered ? 0.45 : 1 }}>
              <span style={{ fontSize: 40, filter: `drop-shadow(0 0 10px ${tpl.choiceColors[ci] || '#38bdf8'})` }}>{FISH[ci % FISH.length]}</span>
              <span style={{ background: tpl.choiceColors[ci] || '#0ea5e9', color: 'white', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', transform: `scaleX(${pos.dir})` }}>{choice}</span>
            </button>
          );
        })}
        {answered && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)', borderRadius: 16 }}>
            <div style={{ color: '#67e8f9', fontSize: 20, fontWeight: 800, textAlign: 'center' }}>🎣 Caught!<br/><span style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.5)' }}>Waiting for next question...</span></div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Reveal Screen ──────────────────────────────────────────────────────────
function RevealScreen({ session, tpl, myAnswerIdx }: { session: LiveSession; tpl: GameTemplate; myAnswerIdx: number | null }) {
  const game = getGameById(session.gameId);
  if (!game) return null;
  const q = game.questions[session.currentQuestion];
  const isCorrect = myAnswerIdx !== null && myAnswerIdx === q?.correctIndex;
  useEffect(() => { if (isCorrect) playChallengeCorrect(); else playChallengeWrong(); }, []);

  return (
    <div style={{ minHeight: '100vh', background: tpl.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 80, marginBottom: 12, animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
        {isCorrect ? '🎉' : myAnswerIdx === null ? '⏰' : '❌'}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: isCorrect ? '#6ee7b7' : myAnswerIdx === null ? '#fde68a' : '#fca5a5', marginBottom: 8 }}>
        {isCorrect ? 'Correct! +points' : myAnswerIdx === null ? "Time's up!" : 'Wrong answer!'}
      </div>
      {q?.explanation && (
        <div style={{ background: `${tpl.accentColor}15`, border: `1px solid ${tpl.accentColor}40`, borderRadius: 14, padding: '14px 20px', maxWidth: 480, marginTop: 10 }}>
          <span style={{ color: tpl.accentColor }}>💡 </span>
          <span style={{ color: 'rgba(255,255,255,0.8)' }}>{q.explanation}</span>
        </div>
      )}
      <div style={{ color: 'rgba(255,255,255,0.35)', marginTop: 20, fontSize: 13 }}>⏳ Teacher is revealing answer...</div>
      <style>{`@keyframes popIn { 0% { transform: scale(0.2); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  );
}

// ── Between-question Leaderboard ───────────────────────────────────────────
function LeaderboardScreen({ session, nickname, tpl }: { session: LiveSession; nickname: string; tpl: GameTemplate }) {
  const sorted = Object.values(session.students).sort((a, b) => b.score - a.score);
  const myRank = sorted.findIndex(s => s.nickname === nickname) + 1;
  return (
    <div style={{ minHeight: '100vh', background: tpl.bg, display: 'flex', flexDirection: 'column', padding: 24 }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 36, marginBottom: 6 }}>🏆</div>
        <h2 style={{ color: 'white', fontWeight: 800, fontSize: 22, margin: 0 }}>Question {session.currentQuestion + 1} Done!</h2>
        {myRank > 0 && <p style={{ color: tpl.accentColor, marginTop: 4, fontSize: 15 }}>You're in {RANK_LABEL[myRank - 1]} place!</p>}
      </div>
      <div style={{ maxWidth: 460, margin: '0 auto', width: '100%' }}>
        {sorted.slice(0, 8).map((s, i) => {
          const isMe = s.nickname === nickname;
          return (
            <div key={s.nickname} style={{
              background: isMe ? `${tpl.accentColor}25` : tpl.cardBg,
              border: `2px solid ${isMe ? tpl.accentColor : 'transparent'}`,
              borderRadius: 14, padding: '12px 16px', marginBottom: 8,
              display: 'flex', alignItems: 'center', gap: 12,
              animation: `slideIn 0.3s ${i * 0.05}s ease both`,
            }}>
              <span style={{ fontSize: 20, width: 28 }}>{MEDAL[i] || `${i+1}`}</span>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: tpl.choiceColors[i % 4], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: 14, flexShrink: 0 }}>
                {s.nickname[0].toUpperCase()}
              </div>
              <span style={{ flex: 1, color: isMe ? tpl.accentColor : 'white', fontWeight: isMe ? 800 : 600 }}>{s.nickname}{isMe ? ' 👈' : ''}</span>
              <span style={{ color: tpl.accentColor, fontWeight: 800, fontSize: 16 }}>{s.score}</span>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', marginTop: 14, fontSize: 13 }}>⏳ Next question coming soon...</div>
      <style>{`@keyframes slideIn { from { transform: translateX(24px); opacity: 0; } to { transform: none; opacity: 1; } }`}</style>
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
    <div style={{ minHeight: '100vh', background: isWinner ? podiumBg : tpl.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center', position: 'relative' }}>
      <BigConfetti active={isWinner} gold={myRank === 1} />

      {/* Winner burst */}
      {myRank === 1 && (
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(251,191,36,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
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

        {/* My score card */}
        <div style={{ background: 'rgba(0,0,0,0.3)', border: `2px solid ${myRank === 1 ? '#fde68a' : tpl.accentColor}60`, borderRadius: 20, padding: '20px 32px', marginBottom: 28, minWidth: 280 }}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 8, letterSpacing: 2 }}>YOUR RESULT</div>
          <div style={{ fontSize: 52, fontWeight: 900, color: myRank === 1 ? '#fde68a' : tpl.accentColor }}>
            {RANK_LABEL[myRank - 1]?.toUpperCase()}
          </div>
          <div style={{ fontSize: 24, color: 'white', fontWeight: 700, marginTop: 4 }}>{me?.score || 0} pts</div>
        </div>

        {/* Top 3 mini podium */}
        {sorted.length >= 2 && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, justifyContent: 'center', marginBottom: 28 }}>
            {/* 2nd */}
            {sorted[1] && (
              <div style={{ textAlign: 'center', flex: 1, maxWidth: 110 }}>
                <div style={{ background: 'rgba(156,163,175,0.3)', borderRadius: '12px 12px 0 0', padding: '14px 8px 8px', border: '1px solid rgba(156,163,175,0.4)' }}>
                  <div style={{ fontSize: 24 }}>🥈</div>
                  <div style={{ color: 'white', fontSize: 12, fontWeight: 700, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sorted[1].nickname}</div>
                  <div style={{ color: '#9ca3af', fontSize: 13, fontWeight: 800 }}>{sorted[1].score}</div>
                </div>
              </div>
            )}
            {/* 1st */}
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
            {/* 3rd */}
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
    <div style={{ minHeight: '100vh', background: tpl.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      {/* Floating particles */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {['⚗️','🧪','⚛️','🔬','🧬','💊'].map((e, i) => (
          <div key={i} style={{ position: 'absolute', fontSize: 28, opacity: 0.06, top: `${15 + i * 14}%`, left: `${8 + i * 14}%`, animation: `floatP ${4 + i}s ${i * 0.5}s ease-in-out infinite alternate` }}>{e}</div>
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 480, width: '100%' }}>
        {/* Pulsing icon */}
        <div style={{ fontSize: 64, marginBottom: 16, animation: 'pulse 1.5s ease-in-out infinite' }}>⚗️</div>

        <h2 style={{ color: 'white', fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{session.title}</h2>
        <div style={{ background: `${tpl.accentColor}25`, border: `2px solid ${tpl.accentColor}60`, borderRadius: 14, padding: '10px 24px', display: 'inline-block', marginBottom: 20 }}>
          <span style={{ color: tpl.accentColor, fontSize: 20, fontWeight: 900, letterSpacing: 4 }}>{nickname}</span>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, display: 'block', marginTop: 2 }}>You're in! ✓</span>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 20, fontSize: 15 }}>
          Waiting for teacher to start{dots}
        </p>

        {/* Students joined */}
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

// ── Main Component ─────────────────────────────────────────────────────────
export default function StudentGamePage({ pin, nickname, onFinish, onBack }: Props) {
  const [session, setSession] = useState<LiveSession | null>(null);
  const [localPhase, setLocalPhase] = useState<LocalPhase>('waiting');
  const [myScore, setMyScore] = useState(0);
  const [myStreak, setMyStreak] = useState(0);
  const [myAnswers, setMyAnswers] = useState<Record<number, number>>({});
  const joinedRef = useRef(false);

  const tpl = getTemplate(session?.templateId || 'periodic-table');

  useEffect(() => {
    const join = async () => {
      if (!joinedRef.current) {
        joinedRef.current = true;
        const slot: StudentSlot = { nickname, score: 0, streak: 0, answers: {}, answeredAt: {} };
        await joinSession(pin, slot);
      }
    };
    join();
    const unsub = subscribeSession(pin, s => {
      if (!s) return;
      setSession(s);
      setLocalPhase(
        s.status === 'finished' ? 'finished' :
        s.status === 'leaderboard' ? 'leaderboard' :
        s.status === 'reveal' ? 'reveal' :
        s.status === 'playing' ? 'playing' : 'waiting'
      );
      if (s.status === 'playing' && localPhase === 'waiting') playChallengeStart();
    });
    return unsub;
  }, [pin, nickname]);

  const handleAnswer = useCallback(async (choiceIdx: number) => {
    if (!session || myAnswers[session.currentQuestion] !== undefined) return;
    const game = getGameById(session.gameId);
    if (!game) return;
    const q = game.questions[session.currentQuestion];
    const isCorrect = choiceIdx === q.correctIndex;
    const newStreak = isCorrect ? myStreak + 1 : 0;
    const pts = isCorrect ? 100 + newStreak * 30 : 0;
    const newScore = myScore + pts;
    setMyAnswers(prev => ({ ...prev, [session.currentQuestion]: choiceIdx }));
    setMyScore(newScore);
    setMyStreak(newStreak);
    await submitAnswer(pin, nickname, session.currentQuestion, choiceIdx, newScore, newStreak);
  }, [session, myAnswers, myScore, myStreak, pin, nickname]);

  if (!session) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a0a1a,#1a0a2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 48, animation: 'spin 1s linear infinite' }}>⚛️</div>
        <div style={{ color: 'white', fontSize: 18 }}>Connecting...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (localPhase === 'waiting') return <WaitingScreen session={session} nickname={nickname} tpl={tpl} onBack={onBack} />;
  if (localPhase === 'finished') return <FinishedScreen session={session} nickname={nickname} tpl={tpl} onFinish={onFinish} />;
  if (localPhase === 'leaderboard') return <LeaderboardScreen session={session} nickname={nickname} tpl={tpl} />;
  if (localPhase === 'reveal') return <RevealScreen session={session} tpl={tpl} myAnswerIdx={myAnswers[session.currentQuestion] ?? null} />;

  const answered = myAnswers[session.currentQuestion] !== undefined;
  if (session.gameType === 'fastest-molecule') return <FishingGame session={session} tpl={tpl} onAnswer={handleAnswer} answered={answered} />;
  return <RacingGame session={session} nickname={nickname} tpl={tpl} onAnswer={handleAnswer} myScore={myScore} answered={answered} />;
}
