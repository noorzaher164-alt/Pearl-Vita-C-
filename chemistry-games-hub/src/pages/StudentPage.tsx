import { useState } from 'react';
import { getGames } from '../storage';
import { getSession, FIREBASE_CONFIGURED } from '../realtime';
import type { Game } from '../types';

interface Props {
  initialPin?: string;
  onPlayGame: (gameId: string) => void;
  onJoinLive: (pin: string, nickname: string) => void;
  onBack: () => void;
}

export default function StudentPage({ initialPin, onPlayGame, onJoinLive, onBack }: Props) {
  const [code, setCode] = useState(initialPin || '');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const pinReady = code.length === 6;
  const nameReady = firstName.trim().length > 0 && lastName.trim().length > 0;
  const canJoin = pinReady && nameReady;

  const handleJoin = async () => {
    if (!canJoin) return;
    setLoading(true);
    setError('');
    const trimmedPin = code.trim().toUpperCase();
    const fullName = [firstName.trim(), middleName.trim(), lastName.trim()].filter(Boolean).join(' ');

    // Try live session first
    if (FIREBASE_CONFIGURED) {
      let session = null;
      try { session = await getSession(trimmedPin); } catch { /* network error */ }
      if (session && (session.status === 'waiting' || session.status === 'playing')) {
        setLoading(false);
        onJoinLive(trimmedPin, fullName);
        return;
      }
      if (session === null) {
        // Could be a network issue — check localStorage for solo game
        const game = getGames().find((g: Game) => g.pin === trimmedPin);
        if (!game) {
          setLoading(false);
          setError('⚠️ Could not reach the live game. Check your connection or ask your teacher to share the link directly.');
          return;
        }
        setLoading(false);
        onPlayGame(game.id);
        return;
      }
    }

    // Solo game fallback
    const game = getGames().find((g: Game) => g.pin === trimmedPin);
    setLoading(false);
    if (!game) {
      setError('❌ No game found with this PIN. Ask your teacher!');
      return;
    }
    onPlayGame(game.id);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ position: 'fixed', top: '8%', left: '6%', fontSize: 60, opacity: 0.07, animation: 'spin 20s linear infinite' }}>⚛️</div>
      <div style={{ position: 'fixed', bottom: '10%', right: '8%', fontSize: 50, opacity: 0.07, animation: 'spin 15s linear infinite reverse' }}>🧪</div>

      <div style={{ textAlign: 'center', maxWidth: 480, width: '100%' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(192,132,252,0.12)', border: '1px solid rgba(192,132,252,0.3)', borderRadius: 100, padding: '6px 18px', marginBottom: 20, fontSize: 13, color: '#c084fc' }}>
          🧪 Teacher Nourhan Zaher
        </div>

        <h1 style={{ fontSize: 'clamp(28px, 7vw, 46px)', fontWeight: 900, marginBottom: 6, background: 'linear-gradient(135deg, #f093fb, #a78bfa, #7dd3fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Join a Game!
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', marginBottom: 28, fontSize: 15 }}>
          Enter the game PIN and your name
        </p>

        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '28px 24px', marginBottom: 16 }}>

          {/* PIN boxes */}
          <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, display: 'block', marginBottom: 10 }}>🔑 Game PIN (6 characters)</label>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} style={{
                width: 44, height: 52,
                background: code[i] ? 'rgba(192,132,252,0.25)' : 'rgba(255,255,255,0.05)',
                border: `2px solid ${code[i] ? '#c084fc' : 'rgba(255,255,255,0.15)'}`,
                borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 800, color: 'white', transition: 'all 0.2s',
              }}>
                {code[i] || ''}
              </div>
            ))}
          </div>
          <input
            value={code}
            onChange={e => { setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && canJoin && handleJoin()}
            placeholder="Type PIN here..."
            autoFocus maxLength={6}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 12, padding: '12px 16px', color: 'white', fontSize: 17,
              outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
              textAlign: 'center', letterSpacing: 4, fontWeight: 700, marginBottom: 20,
            }}
          />

          {/* Name fields */}
          <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, display: 'block', marginBottom: 10 }}>👤 Your Name</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8 }}>
            <input
              value={firstName}
              onChange={e => { setFirstName(e.target.value.slice(0, 20)); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && canJoin && handleJoin()}
              placeholder="First name *"
              style={inputStyle}
            />
            <input
              value={middleName}
              onChange={e => { setMiddleName(e.target.value.slice(0, 20)); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && canJoin && handleJoin()}
              placeholder="Middle name (optional)"
              style={{ ...inputStyle, borderColor: 'rgba(255,255,255,0.1)' }}
            />
            <input
              value={lastName}
              onChange={e => { setLastName(e.target.value.slice(0, 20)); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && canJoin && handleJoin()}
              placeholder="Last name *"
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{ marginTop: 8, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', color: '#fca5a5', fontSize: 13, marginBottom: 8 }}>
              {error}
            </div>
          )}

          <button
            onClick={handleJoin}
            disabled={!canJoin || loading}
            style={{
              width: '100%', marginTop: 14,
              background: canJoin ? 'linear-gradient(135deg, #c084fc, #a78bfa, #7dd3fc)' : 'rgba(255,255,255,0.1)',
              color: 'white', border: 'none', borderRadius: 14, padding: '16px',
              fontSize: 18, fontWeight: 700, cursor: canJoin ? 'pointer' : 'default',
              fontFamily: 'inherit', boxShadow: canJoin ? '0 4px 20px rgba(192,132,252,0.4)' : 'none',
              transition: 'all 0.3s',
            }}
          >
            {loading ? '🔍 Joining...' : '🚀 Join Game!'}
          </button>
        </div>

        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>← Back to Home</button>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.08)',
  border: '2px solid rgba(192,132,252,0.35)',
  borderRadius: 12,
  padding: '12px 16px',
  color: 'white',
  fontSize: 15,
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};
