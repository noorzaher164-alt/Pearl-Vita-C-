import type { LeaderboardEntry, Game } from '../types';
import { getGameById } from '../storage';

interface Props {
  gameId: string;
  entries: LeaderboardEntry[];
  onPlayAgain: () => void;
  onBack: () => void;
}

const MEDALS = ['🥇', '🥈', '🥉'];

export default function ResultsPage({ gameId, entries, onPlayAgain, onBack }: Props) {
  const game: Game | undefined = getGameById(gameId);
  const sorted = [...entries].sort((a, b) => b.score - a.score);
  const top = sorted[0];
  const maxScore = game ? game.questions.length * 200 : 1000;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24 }}>
      {/* Trophy */}
      <div style={{ textAlign: 'center', padding: '48px 24px 32px' }}>
        <div style={{ fontSize: 80, marginBottom: 16, animation: 'bounceIn 0.6s ease' }}>🏆</div>
        <h1 style={{
          fontSize: 36, fontWeight: 800, marginBottom: 8,
          background: 'linear-gradient(135deg, #fde68a, #fca5a5, #c084fc)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Game Complete!
        </h1>
        {game && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>{game.title}</p>}
      </div>

      {/* Score card */}
      {top && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(192,132,252,0.2), rgba(125,211,252,0.1))',
          border: '1px solid rgba(192,132,252,0.4)',
          borderRadius: 24, padding: '32px 48px', marginBottom: 32, textAlign: 'center',
          maxWidth: 400, width: '100%',
        }}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 8 }}>
            {top.nickname}'s Score
          </div>
          <div style={{
            fontSize: 72, fontWeight: 800,
            background: 'linear-gradient(135deg, #fde68a, #f093fb)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            {top.score}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
            out of ~{maxScore} possible pts
          </div>

          {game && (
            <div style={{
              marginTop: 20,
              display: 'flex',
              justifyContent: 'center',
              gap: 32,
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#6ee7b7' }}>
                  {game.questions.length}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Questions</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#7dd3fc' }}>
                  {top.score > 0 ? Math.min(100, Math.round((top.score / maxScore) * 100)) : 0}%
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Accuracy</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard */}
      {sorted.length > 0 && (
        <div style={{ maxWidth: 500, width: '100%', marginBottom: 32 }}>
          <h2 style={{ color: 'white', fontSize: 20, fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>
            🏅 Leaderboard
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sorted.map((entry, i) => (
              <div key={i} style={{
                background: i === 0 ? 'rgba(253,230,138,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${i === 0 ? 'rgba(253,230,138,0.4)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 14,
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}>
                <span style={{ fontSize: 28, width: 36 }}>{MEDALS[i] || `#${i + 1}`}</span>
                <span style={{ flex: 1, fontWeight: 600, color: 'white', fontSize: 16 }}>{entry.nickname}</span>
                <span style={{ fontWeight: 800, fontSize: 20, color: i === 0 ? '#fde68a' : '#c084fc' }}>
                  {entry.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 }}>
        <button
          onClick={onPlayAgain}
          style={{
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: 'white', border: 'none', borderRadius: 14,
            padding: '14px 32px', fontSize: 16, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 4px 20px rgba(34,197,94,0.4)',
          }}
        >
          🔄 Play Again
        </button>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
            color: 'white', borderRadius: 14, padding: '14px 32px',
            fontSize: 16, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          ← Back to Folder
        </button>
      </div>

      <style>{`
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          60% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
