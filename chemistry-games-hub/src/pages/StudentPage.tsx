import { useState } from 'react';
import { getGames } from '../storage';
import type { Game } from '../types';

interface Props {
  onPlayGame: (gameId: string) => void;
  onBack: () => void;
}

const GAME_TYPE_LABELS: Record<string, string> = {
  'quiz-battle': '⚔️ Quiz Battle',
  'fastest-molecule': '⚡ Fastest Molecule',
  'periodic-challenge': '🔬 Periodic Challenge',
  'reaction-race': '🏃 Reaction Race',
  'energy-points': '💎 Energy Points',
  'match-terms': '🔗 Match Terms',
  'word-search': '🔍 Word Search',
  'drag-drop': '🧩 Drag & Drop',
  'true-false': '✅ True or False',
  'flashcards': '🃏 Flashcards',
};

export default function StudentPage({ onPlayGame, onBack }: Props) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [foundGame, setFoundGame] = useState<Game | null>(null);
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');

  const handleSearch = () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 6) { setError('Please enter a 6-digit code'); return; }
    const games = getGames();
    // TODO: Replace with backend lookup: await supabase.from('games').select('*').eq('pin', trimmed)
    const game = games.find(g => g.pin === trimmed);
    if (!game) {
      setError('❌ No game found with this code. Ask your teacher for the correct PIN!');
      setFoundGame(null);
      return;
    }
    setError('');
    setFoundGame(game);
    setStep('confirm');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  if (step === 'confirm' && foundGame) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: 24,
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(192,132,252,0.3)',
          borderRadius: 28, padding: 40, maxWidth: 480, width: '100%', textAlign: 'center',
        }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎮</div>
          <div style={{
            display: 'inline-block',
            background: 'rgba(192,132,252,0.2)', border: '1px solid rgba(192,132,252,0.4)',
            borderRadius: 100, padding: '4px 16px', fontSize: 13, color: '#c084fc', marginBottom: 16,
          }}>
            {GAME_TYPE_LABELS[foundGame.gameType] || foundGame.gameType}
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 8 }}>{foundGame.title}</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>📚 {foundGame.lessonName}</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 32 }}>
            ❓ {foundGame.questions.length} questions
            {foundGame.isCompetitive ? ' • ⚔️ Competitive' : ' • 📖 Practice'}
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => { setStep('enter'); setFoundGame(null); setCode(''); }} style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
              color: 'white', borderRadius: 14, padding: '13px 24px',
              fontSize: 16, cursor: 'pointer', fontFamily: 'inherit',
            }}>← Back</button>
            <button onClick={() => onPlayGame(foundGame.id)} style={{
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: 'white', border: 'none', borderRadius: 14, padding: '13px 36px',
              fontSize: 18, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 20px rgba(34,197,94,0.5)',
            }}>🚀 Join Game!</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      {/* Floating chemistry icons */}
      <div style={{ position: 'fixed', top: '8%', left: '6%', fontSize: 60, opacity: 0.07, animation: 'spin 20s linear infinite' }}>⚛️</div>
      <div style={{ position: 'fixed', bottom: '10%', right: '8%', fontSize: 50, opacity: 0.07, animation: 'spin 15s linear infinite reverse' }}>🧪</div>

      <div style={{ textAlign: 'center', maxWidth: 460, width: '100%' }}>
        {/* Brand */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(192,132,252,0.12)', border: '1px solid rgba(192,132,252,0.3)',
          borderRadius: 100, padding: '6px 18px', marginBottom: 28, fontSize: 13, color: '#c084fc',
        }}>
          🧪 Teacher Nourhan Zaher
        </div>

        <h1 style={{
          fontSize: 'clamp(32px, 7vw, 52px)', fontWeight: 900, marginBottom: 8,
          background: 'linear-gradient(135deg, #f093fb, #a78bfa, #7dd3fc)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Join a Game!
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', marginBottom: 40, fontSize: 16 }}>
          Enter the PIN your teacher gave you
        </p>

        {/* PIN input */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 24, padding: '32px 28px',
          marginBottom: 16,
        }}>
          <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, display: 'block', marginBottom: 14 }}>
            🔑 Game PIN (6 characters)
          </label>

          {/* Big PIN display boxes */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} style={{
                width: 44, height: 56,
                background: code[i] ? 'rgba(192,132,252,0.25)' : 'rgba(255,255,255,0.05)',
                border: `2px solid ${code[i] ? '#c084fc' : 'rgba(255,255,255,0.15)'}`,
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 800, color: 'white',
                transition: 'all 0.2s',
              }}>
                {code[i] || ''}
              </div>
            ))}
          </div>

          <input
            value={code}
            onChange={e => {
              const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
              setCode(val);
              setError('');
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type PIN here..."
            autoFocus
            maxLength={6}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12,
              padding: '14px 16px', color: 'white', fontSize: 18,
              outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
              textAlign: 'center', letterSpacing: 4, fontWeight: 700,
            }}
          />

          {error && (
            <div style={{
              marginTop: 14,
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 10, padding: '10px 14px',
              color: '#fca5a5', fontSize: 14,
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSearch}
            disabled={code.length !== 6}
            style={{
              width: '100%', marginTop: 20,
              background: code.length === 6
                ? 'linear-gradient(135deg, #c084fc, #a78bfa, #7dd3fc)'
                : 'rgba(255,255,255,0.1)',
              color: 'white', border: 'none', borderRadius: 14, padding: '16px',
              fontSize: 18, fontWeight: 700, cursor: code.length === 6 ? 'pointer' : 'default',
              fontFamily: 'inherit',
              boxShadow: code.length === 6 ? '0 4px 20px rgba(192,132,252,0.4)' : 'none',
              transition: 'all 0.3s',
            }}
          >
            🎮 Find Game
          </button>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginBottom: 24 }}>
          Ask your teacher for the game PIN to join
        </p>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
          cursor: 'pointer', fontFamily: 'inherit', fontSize: 14,
        }}>← Back to Home</button>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
