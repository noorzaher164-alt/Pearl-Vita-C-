import { useState, useEffect } from 'react';
import type { LeaderboardEntry } from '../types';
import { getGameById } from '../storage';

interface Props {
  gameId: string;
  entries: LeaderboardEntry[];
  onPlayAgain: () => void;
  onBack: () => void;
}

function Confetti() {
  const particles = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: ['#c084fc', '#7dd3fc', '#fde68a', '#6ee7b7', '#fca5a5', '#f093fb', '#34d399', '#fb923c'][i % 8],
    delay: Math.random() * 1,
    duration: 2 + Math.random() * 2,
    size: 6 + Math.random() * 10,
    rotate: Math.random() * 360,
  }));
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 100, overflow: 'hidden' }}>
      <style>{`@keyframes fall { 0% { transform: translateY(-20px) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(720deg); opacity: 0; } }`}</style>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.x}%`, top: 0,
          width: p.size, height: p.size, background: p.color,
          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          transform: `rotate(${p.rotate}deg)`,
          animation: `fall ${p.duration}s ${p.delay}s ease-in forwards`,
        }} />
      ))}
    </div>
  );
}

const RANK_CONFIG = [
  { emoji: '🥇', color: '#fde68a', glow: 'rgba(253,230,138,0.4)', height: 160, label: '1st' },
  { emoji: '🥈', color: '#e2e8f0', glow: 'rgba(226,232,240,0.3)', height: 120, label: '2nd' },
  { emoji: '🥉', color: '#fb923c', glow: 'rgba(251,146,60,0.3)', height: 90, label: '3rd' },
];

export default function ResultsPage({ gameId, entries, onPlayAgain, onBack }: Props) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    setTimeout(() => setShowConfetti(false), 4000);
  }, []);

  const game = getGameById(gameId);
  const sorted = [...entries].sort((a, b) => b.score - a.score);
  const top = sorted[0];
  // Max per question = 100 base + streak bonus capped at 10×30 = 400; use 200 as realistic average max
  // Derive true maximum: 100 base + 30×(question_index) streak bonus per question, summed
  const trueMax = game
    ? game.questions.reduce((sum, _, i) => sum + 100 + Math.min(i, 10) * 30, 0)
    : 1000;
  const accuracy = top && trueMax > 0 ? Math.min(100, Math.round((top.score / trueMax) * 100)) : 0;

  const getMessage = () => {
    if (accuracy >= 80) return { text: 'Outstanding! 🌟', color: '#fde68a' };
    if (accuracy >= 60) return { text: 'Well done! 👏', color: '#6ee7b7' };
    if (accuracy >= 40) return { text: 'Good effort! 💪', color: '#7dd3fc' };
    return { text: 'Keep practicing! 📚', color: '#c084fc' };
  };
  const msg = getMessage();

  // Podium order: 2nd, 1st, 3rd
  const podiumOrder = sorted.length >= 2 ? [1, 0, 2] : [0];

  return (
    <div style={{ minHeight: '100vh', padding: '0 0 80px' }}>
      {showConfetti && <Confetti />}

      {/* Header */}
      <div style={{
        textAlign: 'center',
        padding: '48px 24px 32px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-20px)',
        transition: 'all 0.6s ease',
      }}>
        <div style={{ fontSize: 80, marginBottom: 8, display: 'inline-block', animation: 'trophy 1s ease infinite alternate' }}>🏆</div>
        <h1 style={{
          fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, marginBottom: 8,
          background: 'linear-gradient(135deg, #fde68a, #fca5a5, #c084fc)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Game Over!
        </h1>
        {game && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>📚 {game.title}</p>}
        <p style={{ fontSize: 20, fontWeight: 700, color: msg.color, marginTop: 8 }}>{msg.text}</p>
      </div>

      {/* Score card */}
      {top && (
        <div style={{
          maxWidth: 500, margin: '0 auto 32px', padding: '0 20px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s 0.2s ease',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(253,230,138,0.15), rgba(192,132,252,0.1))',
            border: '1px solid rgba(253,230,138,0.4)',
            borderRadius: 24, padding: '28px 24px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
              {top.nickname}
            </div>
            <div style={{
              fontSize: 72, fontWeight: 900, lineHeight: 1,
              background: 'linear-gradient(135deg, #fde68a, #f093fb)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {top.score}
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>points</div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 32 }}>
              {[
                { label: 'Questions', value: game?.questions.length || 0, icon: '❓' },
                { label: 'Score %', value: `${accuracy}%`, icon: '🎯' },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'white' }}>{stat.icon} {stat.value}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Podium (if multiple players) */}
      {sorted.length >= 2 && (
        <div style={{
          maxWidth: 500, margin: '0 auto 32px', padding: '0 20px',
          opacity: visible ? 1 : 0,
          transition: 'all 0.6s 0.4s ease',
        }}>
          <h2 style={{ color: 'white', fontSize: 18, fontWeight: 700, textAlign: 'center', marginBottom: 24 }}>🏅 Podium</h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 8, height: 200 }}>
            {podiumOrder.filter(i => sorted[i]).map((rankIdx, pos) => {
              const cfg = RANK_CONFIG[rankIdx];
              const player = sorted[rankIdx];
              return (
                <div key={pos} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 28 }}>{cfg.emoji}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'white', textAlign: 'center', lineHeight: 1.2 }}>{player.nickname}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: cfg.color }}>{player.score}</div>
                  <div style={{
                    width: '100%', height: cfg.height,
                    background: `linear-gradient(180deg, ${cfg.color}40, ${cfg.color}20)`,
                    border: `2px solid ${cfg.color}60`,
                    borderRadius: '12px 12px 0 0',
                    boxShadow: `0 0 20px ${cfg.glow}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, fontWeight: 900, color: cfg.color,
                  }}>
                    {rankIdx + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full leaderboard */}
      {sorted.length > 0 && (
        <div style={{ maxWidth: 500, margin: '0 auto 32px', padding: '0 20px' }}>
          <h2 style={{ color: 'white', fontSize: 18, fontWeight: 700, textAlign: 'center', marginBottom: 16 }}>📊 Leaderboard</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sorted.map((entry, i) => (
              <div key={i} style={{
                background: i === 0 ? 'rgba(253,230,138,0.12)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${i === 0 ? 'rgba(253,230,138,0.3)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 14, padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: 14,
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateX(0)' : 'translateX(-20px)',
                transition: `all 0.5s ${0.1 * i + 0.5}s ease`,
              }}>
                <span style={{ fontSize: 24, width: 32, textAlign: 'center' }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </span>
                <span style={{ flex: 1, fontWeight: 600, color: 'white', fontSize: 16 }}>{entry.nickname}</span>
                <span style={{ fontWeight: 800, fontSize: 22, color: i === 0 ? '#fde68a' : '#c084fc' }}>{entry.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Answer review */}
      {game && (
        <div style={{ maxWidth: 600, margin: '0 auto 32px', padding: '0 20px' }}>
          <h2 style={{ color: 'white', fontSize: 18, fontWeight: 700, textAlign: 'center', marginBottom: 16 }}>📝 Answer Review</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {game.questions.map((q, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, padding: '14px 16px',
              }}>
                <p style={{ color: 'white', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Q{i + 1}: {q.text}</p>
                <p style={{ color: '#6ee7b7', fontSize: 13 }}>✓ {q.choices[q.correctIndex]}</p>
                {q.explanation && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 }}>💡 {q.explanation}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', padding: '0 20px' }}>
        <button onClick={onPlayAgain} style={{
          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
          color: 'white', border: 'none', borderRadius: 14,
          padding: '14px 36px', fontSize: 17, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit',
          boxShadow: '0 4px 20px rgba(34,197,94,0.4)',
        }}>🔄 Play Again</button>
        <button onClick={onBack} style={{
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
          color: 'white', borderRadius: 14, padding: '14px 36px',
          fontSize: 17, cursor: 'pointer', fontFamily: 'inherit',
        }}>← Back</button>
      </div>

      <style>{`@keyframes trophy { 0% { transform: scale(1) rotate(-5deg); } 100% { transform: scale(1.1) rotate(5deg); } }`}</style>
    </div>
  );
}
