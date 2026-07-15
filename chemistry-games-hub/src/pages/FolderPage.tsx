import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { Game, Folder, Page, GameType } from '../types';
import { getFolders, getGamesByFolder, deleteGame, duplicateGame, assignPinToGame } from '../storage';
import { getTheme } from '../theme';
import type { Theme } from '../theme';

function studentJoinUrl(pin: string) {
  return `${window.location.origin}${window.location.pathname}?join=${pin}`;
}

interface Props {
  folderId: string;
  onNavigate: (page: Page) => void;
  onPlayGame: (gameId: string) => void;
  onHostGame: (gameId: string) => void;
  onCreateGame: () => void;
  onEditGame: (gameId: string) => void;
}

const GAME_LABELS: Record<GameType, string> = {
  'quiz': '❓ Quiz',
  'gameshow-quiz': '🎬 Gameshow Quiz',
  'matching-pairs': '🃏 Matching Pairs',
  'match-up': '🔗 Match Up',
  'anagram': '🔤 Anagram',
  'wordsearch': '🔍 Wordsearch',
  'flash-cards': '📋 Flash Cards',
  'group-sort': '🗂️ Group Sort',
  'spin-the-wheel': '🎡 Spin the Wheel',
  'open-the-box': '📦 Open the Box',
  'unjumble': '🔀 Unjumble',
  'complete-the-sentence': '📝 Complete the Sentence',
  'crossword': '✏️ Crossword',
  'spell-the-word': '🔡 Spell the Word',
  'speaking-cards': '🗣️ Speaking Cards',
  'flip-tiles': '🔄 Flip Tiles',
  'find-the-match': '🎯 Find the Match',
  'labelled-diagram': '🗺️ Labelled Diagram',
};

const GAME_COLORS: Record<GameType, string> = {
  'quiz': '#c084fc',
  'gameshow-quiz': '#7dd3fc',
  'matching-pairs': '#fde68a',
  'match-up': '#a78bfa',
  'anagram': '#60a5fa',
  'wordsearch': '#ff6eb4',
  'flash-cards': '#fca5a5',
  'group-sort': '#6ee7b7',
  'spin-the-wheel': '#fde68a',
  'open-the-box': '#fca5a5',
  'unjumble': '#a78bfa',
  'complete-the-sentence': '#7dd3fc',
  'crossword': '#c084fc',
  'spell-the-word': '#6ee7b7',
  'speaking-cards': '#ff6eb4',
  'flip-tiles': '#60a5fa',
  'find-the-match': '#34d399',
  'labelled-diagram': '#fb923c',
};

type FilterType = 'all' | 'competitive' | 'practice';

export default function FolderPage({ folderId, onNavigate, onPlayGame, onHostGame, onCreateGame, onEditGame }: Props) {
  const theme = (localStorage.getItem('cgh_theme') as Theme) || 'dark';
  const C = getTheme(theme);
  const isDark = theme === 'dark';

  const [folder, setFolder] = useState<Folder | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [pinModal, setPinModal] = useState<{ game: Game; pin: string } | null>(null);

  const load = () => {
    const all = getFolders();
    setFolder(all.find(f => f.id === folderId) || null);
    setGames(getGamesByFolder(folderId));
  };

  useEffect(() => { load(); }, [folderId]);

  const handleDelete = (id: string) => {
    if (!confirm('Delete this game?')) return;
    deleteGame(id);
    load();
  };

  const handleDuplicate = (id: string) => {
    duplicateGame(id);
    load();
  };

  const handleGetPin = (game: Game) => {
    const pin = game.pin || assignPinToGame(game.id);
    load();
    setPinModal({ game, pin });
  };

  const filtered = games.filter(g => {
    const matchSearch = g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.lessonName.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || (filter === 'competitive' ? g.isCompetitive : !g.isCompetitive);
    return matchSearch && matchFilter;
  });

  if (!folder) return <div style={{ color: C.text, padding: 40 }}>Folder not found.</div>;

  return (
    <div style={{ minHeight: '100vh', padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => onNavigate('dashboard')}
            style={{ background: isDark ? 'rgba(255,255,255,0.1)' : '#ede9fe', border: `1px solid ${C.cardBorder}`, color: C.text, borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}
          >
            ← Dashboard
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 36 }}>{folder.icon}</span>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, margin: 0 }}>{folder.name}</h1>
            </div>
            <p style={{ color: C.textFaint, fontSize: 13, margin: 0 }}>{games.length} game{games.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button
          onClick={onCreateGame}
          style={{
            background: 'linear-gradient(135deg, #c084fc, #a78bfa)',
            color: 'white', border: 'none', borderRadius: 12, padding: '12px 24px',
            fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 4px 20px rgba(192,132,252,0.4)',
          }}
        >
          + Create Game
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search games..."
          style={{
            background: C.inputBg, border: `1px solid ${C.inputBorder}`,
            borderRadius: 10, padding: '10px 14px', color: C.text, fontSize: 14,
            outline: 'none', fontFamily: 'inherit', flex: '1', minWidth: 200, maxWidth: 350,
          }}
        />
        {(['all', 'competitive', 'practice'] as FilterType[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              background: filter === f ? 'rgba(192,132,252,0.3)' : C.cardBg,
              border: filter === f ? '1px solid #c084fc' : `1px solid ${C.cardBorder}`,
              color: filter === f ? C.accent : C.textMuted,
              borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
            }}
          >
            {f === 'all' ? 'All' : f === 'competitive' ? '⚔️ Competitive' : '📚 Practice'}
          </button>
        ))}
      </div>

      {/* Games */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px', color: C.textFaint }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎮</div>
          <h3 style={{ fontSize: 20, marginBottom: 8, color: C.textMuted }}>No games found</h3>
          <p style={{ marginBottom: 24 }}>
            {games.length === 0 ? 'Create your first game in this folder!' : 'Try a different search or filter.'}
          </p>
          {games.length === 0 && (
            <button
              onClick={onCreateGame}
              style={{
                background: 'linear-gradient(135deg, #c084fc, #a78bfa)', color: 'white',
                border: 'none', borderRadius: 12, padding: '12px 28px', fontSize: 15,
                fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >+ Create First Game</button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {filtered.map(game => {
            const color = GAME_COLORS[game.gameType];
            return (
              <div key={game.id} style={{
                background: C.cardBg,
                border: `1px solid ${color}30`,
                borderRadius: 20,
                padding: 24,
                transition: 'all 0.3s',
                position: 'relative',
                overflow: 'hidden',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `${color}10`;
                  e.currentTarget.style.borderColor = `${color}50`;
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = `0 12px 40px ${color}25`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = C.cardBg;
                  e.currentTarget.style.borderColor = `${color}30`;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Type badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12,
                  background: `${color}25`, border: `1px solid ${color}50`,
                  borderRadius: 100, padding: '4px 12px', fontSize: 12, fontWeight: 600, color,
                }}>
                  {GAME_LABELS[game.gameType]}
                </div>
                {game.isCompetitive && (
                  <span style={{ marginLeft: 8, fontSize: 11, color: '#fde68a', background: 'rgba(253,230,138,0.15)', padding: '2px 8px', borderRadius: 100 }}>
                    Competitive
                  </span>
                )}

                <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 4 }}>{game.title}</h3>
                <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 4 }}>📚 {game.lessonName}</p>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: C.textFaint, marginBottom: 20 }}>
                  <span>❓ {game.questions.length} questions</span>
                  <span>📅 {new Date(game.createdAt).toLocaleDateString()}</span>
                </div>

                {/* PIN badge */}
                {game.pin && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12,
                    background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
                    borderRadius: 8, padding: '4px 10px', fontSize: 12,
                  }}>
                    <span style={{ color: C.textMuted }}>PIN:</span>
                    <span style={{ fontWeight: 800, color: '#6ee7b7', letterSpacing: 2 }}>{game.pin}</span>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => onPlayGame(game.id)}
                    style={{
                      background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white',
                      border: 'none', borderRadius: 10, padding: '9px 12px', fontSize: 13,
                      fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >▶️ Solo</button>
                  {game.pin && (
                    <button
                      onClick={() => onHostGame(game.id)}
                      style={{
                        background: 'linear-gradient(135deg, #c084fc, #a78bfa)', color: 'white',
                        border: 'none', borderRadius: 10, padding: '9px 12px', fontSize: 13,
                        fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                      }}
                      title="Host live game for students"
                    >🎮 Host Live</button>
                  )}
                  <button
                    onClick={() => handleGetPin(game)}
                    style={{
                      background: 'rgba(34,197,94,0.15)', color: '#6ee7b7',
                      border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '9px 12px',
                      fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
                    }}
                    title="Get student PIN"
                  >🔑</button>
                  <button
                    onClick={() => onEditGame(game.id)}
                    style={{
                      background: 'rgba(125,211,252,0.15)', color: '#7dd3fc',
                      border: '1px solid rgba(125,211,252,0.3)', borderRadius: 10, padding: '9px 12px',
                      fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >✏️</button>
                  <button
                    onClick={() => handleDuplicate(game.id)}
                    style={{
                      background: 'rgba(253,230,138,0.15)', color: '#fde68a',
                      border: '1px solid rgba(253,230,138,0.3)', borderRadius: 10, padding: '9px 12px',
                      fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >📋</button>
                  <button
                    onClick={() => handleDelete(game.id)}
                    style={{
                      background: 'rgba(239,68,68,0.15)', color: '#fca5a5',
                      border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '9px 12px',
                      fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PIN Modal */}
      {pinModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }} onClick={() => setPinModal(null)}>
          <div style={{
            background: 'linear-gradient(135deg, #1a0933, #0d1f3c)',
            border: '1px solid rgba(34,197,94,0.4)',
            borderRadius: 28, padding: '40px 36px', maxWidth: 420, width: '100%', textAlign: 'center',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🔑</div>
            <h2 style={{ color: 'white', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Student Game PIN</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 28 }}>
              {pinModal.game.title}
            </p>

            {/* QR Code */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{ background: 'white', padding: 12, borderRadius: 16 }}>
                <QRCodeSVG value={studentJoinUrl(pinModal.pin)} size={150} />
              </div>
            </div>

            {/* Big PIN display */}
            <div style={{
              background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.5)',
              borderRadius: 20, padding: '20px', marginBottom: 12,
            }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, letterSpacing: 2 }}>GAME PIN</div>
              <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: 10, color: '#6ee7b7', textShadow: '0 0 30px rgba(110,231,183,0.5)' }}>
                {pinModal.pin}
              </div>
            </div>

            {/* Direct link */}
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 14px', marginBottom: 20, wordBreak: 'break-all' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Direct link for students:</div>
              <a href={studentJoinUrl(pinModal.pin)} target="_blank" rel="noreferrer" style={{ color: '#7dd3fc', fontSize: 12, textDecoration: 'none' }}>
                {studentJoinUrl(pinModal.pin)}
              </a>
            </div>

            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 20 }}>
              Students scan the QR code or open the link — the PIN is pre-filled automatically.
            </p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => {
                  const newPin = assignPinToGame(pinModal.game.id);
                  load();
                  setPinModal({ game: pinModal.game, pin: newPin });
                }}
                style={{
                  background: isDark ? 'rgba(255,255,255,0.08)' : '#ede9fe', border: '1px solid rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: '11px 20px',
                  fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >🔄 New PIN</button>
              <button
                onClick={() => setPinModal(null)}
                style={{
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: 'white', border: 'none', borderRadius: 12, padding: '11px 28px',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >✓ Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
