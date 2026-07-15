import React from 'react';
import type { Game, GameType } from '../types';

// --- Helper functions ---

export function gameTypeLabel(type: GameType): string {
  const labels: Record<GameType, string> = {
    'quiz': 'Quiz',
    'gameshow-quiz': 'Gameshow Quiz',
    'matching-pairs': 'Matching Pairs',
    'match-up': 'Match Up',
    'anagram': 'Anagram',
    'wordsearch': 'Wordsearch',
    'flash-cards': 'Flash Cards',
    'group-sort': 'Group Sort',
    'spin-the-wheel': 'Spin the Wheel',
    'open-the-box': 'Open the Box',
    'unjumble': 'Unjumble',
    'complete-the-sentence': 'Complete the Sentence',
    'crossword': 'Crossword',
    'spell-the-word': 'Spell the Word',
    'speaking-cards': 'Speaking Cards',
    'flip-tiles': 'Flip Tiles',
    'find-the-match': 'Find the Match',
    'labelled-diagram': 'Labelled Diagram',
  };
  return labels[type] ?? type;
}

export function gameTypeColor(type: GameType): string {
  const colors: Record<GameType, string> = {
    'quiz': '#a855f7',
    'gameshow-quiz': '#3b82f6',
    'matching-pairs': '#eab308',
    'match-up': '#14b8a6',
    'anagram': '#ec4899',
    'wordsearch': '#6366f1',
    'flash-cards': '#f43f5e',
    'group-sort': '#22c55e',
    'spin-the-wheel': '#f97316',
    'open-the-box': '#06b6d4',
    'unjumble': '#8b5cf6',
    'complete-the-sentence': '#0ea5e9',
    'crossword': '#a855f7',
    'spell-the-word': '#10b981',
    'speaking-cards': '#f43f5e',
    'flip-tiles': '#3b82f6',
    'find-the-match': '#22c55e',
    'labelled-diagram': '#f97316',
  };
  return colors[type] ?? '#a855f7';
}

// Utility: convert hex color to "r, g, b" string for rgba()
function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
}

// --- Props ---

interface GameCardProps {
  game: Game;
  onPlay: (game: Game) => void;
  onEdit: (game: Game) => void;
  onDelete: (game: Game) => void;
  onDuplicate: (game: Game) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onPlay, onEdit, onDelete, onDuplicate }) => {
  const typeColor = gameTypeColor(game.gameType);
  const rgb = hexToRgb(typeColor);

  const formattedDate = new Date(game.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        boxShadow: `0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(${rgb}, 0.08)`,
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = 'translateY(-2px)';
        el.style.boxShadow = `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(${rgb}, 0.2)`;
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = `0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(${rgb}, 0.08)`;
      }}
    >
      {/* Colored top accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${typeColor}, transparent)`,
          borderRadius: '16px 16px 0 0',
        }}
      />

      {/* Header: title + type badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <h3
          style={{
            margin: 0,
            fontSize: '1.1rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #e2d9f3, #c084fc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1.3,
            flex: 1,
          }}
        >
          {game.title}
        </h3>
        <span
          style={{
            flexShrink: 0,
            padding: '3px 10px',
            borderRadius: '20px',
            fontSize: '0.7rem',
            fontWeight: 600,
            background: `rgba(${rgb}, 0.2)`,
            color: typeColor,
            border: `1px solid rgba(${rgb}, 0.4)`,
            whiteSpace: 'nowrap',
          }}
        >
          {gameTypeLabel(game.gameType)}
        </span>
      </div>

      {/* Lesson name */}
      <div
        style={{
          fontSize: '0.85rem',
          color: 'rgba(200, 180, 255, 0.8)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span style={{ opacity: 0.7 }}>📚</span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {game.lessonName}
        </span>
      </div>

      {/* Meta row */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          fontSize: '0.78rem',
          color: 'rgba(180, 160, 220, 0.7)',
          flexWrap: 'wrap',
        }}
      >
        <span>🗓 {formattedDate}</span>
        <span>❓ {game.questions.length} question{game.questions.length !== 1 ? 's' : ''}</span>
        {game.isCompetitive && (
          <span style={{ color: '#facc15' }}>🏆 Competitive</span>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
        {/* Play */}
        <button
          onClick={() => onPlay(game)}
          style={{
            flex: 1,
            minWidth: '60px',
            padding: '8px 12px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.82rem',
            background: 'linear-gradient(135deg, #16a34a, #22c55e)',
            color: '#fff',
            transition: 'opacity 0.15s ease, transform 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
          }}
          onMouseEnter={e => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.opacity = '0.85';
            b.style.transform = 'scale(1.03)';
          }}
          onMouseLeave={e => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.opacity = '1';
            b.style.transform = 'scale(1)';
          }}
        >
          ▶ Play
        </button>

        {/* Edit */}
        <button
          onClick={() => onEdit(game)}
          title="Edit"
          style={{
            padding: '8px 12px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.82rem',
            background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
            color: '#fff',
            transition: 'opacity 0.15s ease, transform 0.15s ease',
          }}
          onMouseEnter={e => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.opacity = '0.85';
            b.style.transform = 'scale(1.03)';
          }}
          onMouseLeave={e => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.opacity = '1';
            b.style.transform = 'scale(1)';
          }}
        >
          ✏️
        </button>

        {/* Duplicate */}
        <button
          onClick={() => onDuplicate(game)}
          title="Duplicate"
          style={{
            padding: '8px 12px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.82rem',
            background: 'linear-gradient(135deg, #a16207, #eab308)',
            color: '#fff',
            transition: 'opacity 0.15s ease, transform 0.15s ease',
          }}
          onMouseEnter={e => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.opacity = '0.85';
            b.style.transform = 'scale(1.03)';
          }}
          onMouseLeave={e => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.opacity = '1';
            b.style.transform = 'scale(1)';
          }}
        >
          📋
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(game)}
          title="Delete"
          style={{
            padding: '8px 12px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.82rem',
            background: 'linear-gradient(135deg, #b91c1c, #ef4444)',
            color: '#fff',
            transition: 'opacity 0.15s ease, transform 0.15s ease',
          }}
          onMouseEnter={e => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.opacity = '0.85';
            b.style.transform = 'scale(1.03)';
          }}
          onMouseLeave={e => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.opacity = '1';
            b.style.transform = 'scale(1)';
          }}
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default GameCard;
