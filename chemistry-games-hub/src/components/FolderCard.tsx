import React from 'react';
import type { Folder } from '../types';

interface FolderCardProps {
  folder: Folder;
  onClick: (folder: Folder) => void;
  onRename: (folder: Folder) => void;
  onDelete: (folder: Folder) => void;
}

// Utility: convert hex color to "r, g, b" string for rgba()
function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '');
  const expanded = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean;
  const bigint = parseInt(expanded, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
}

const FolderCard: React.FC<FolderCardProps> = ({ folder, onClick, onRename, onDelete }) => {
  const rgb = hexToRgb(folder.color || '#a855f7');
  const accentColor = folder.color || '#c084fc';

  return (
    <div
      style={{
        position: 'relative',
        background: 'rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid rgba(${rgb}, 0.25)`,
        borderRadius: '18px',
        padding: '24px 20px 18px',
        cursor: 'default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        boxShadow: `0 4px 24px rgba(0,0,0,0.3), 0 0 20px rgba(${rgb}, 0.08)`,
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = 'translateY(-4px)';
        el.style.boxShadow = `0 12px 40px rgba(0,0,0,0.4), 0 0 30px rgba(${rgb}, 0.2)`;
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = `0 4px 24px rgba(0,0,0,0.3), 0 0 20px rgba(${rgb}, 0.08)`;
      }}
    >
      {/* Subtle radial glow overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '18px',
          background: `radial-gradient(ellipse at top, rgba(${rgb}, 0.12) 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Clickable main area */}
      <div
        onClick={() => onClick(folder)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          width: '100%',
          flex: 1,
          cursor: 'pointer',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Large emoji icon */}
        <div
          style={{
            fontSize: '3rem',
            lineHeight: 1,
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))',
            userSelect: 'none',
          }}
        >
          {folder.icon || '📁'}
        </div>

        {/* Folder name */}
        <h3
          style={{
            margin: 0,
            fontSize: '1rem',
            fontWeight: 700,
            textAlign: 'center',
            background: `linear-gradient(135deg, #ffffff, ${accentColor})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1.3,
            wordBreak: 'break-word',
          }}
        >
          {folder.name}
        </h3>
      </div>

      {/* Action buttons */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          width: '100%',
          justifyContent: 'center',
          marginTop: '4px',
          position: 'relative',
          zIndex: 1,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Rename */}
        <button
          onClick={() => onRename(folder)}
          title="Rename folder"
          style={{
            flex: 1,
            padding: '6px 10px',
            borderRadius: '10px',
            border: `1px solid rgba(${rgb}, 0.3)`,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.78rem',
            background: `rgba(${rgb}, 0.15)`,
            color: accentColor,
            transition: 'background 0.15s ease, transform 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
          }}
          onMouseEnter={e => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.background = `rgba(${rgb}, 0.28)`;
            b.style.transform = 'scale(1.04)';
          }}
          onMouseLeave={e => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.background = `rgba(${rgb}, 0.15)`;
            b.style.transform = 'scale(1)';
          }}
        >
          ✏️ Rename
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(folder)}
          title="Delete folder"
          style={{
            padding: '6px 12px',
            borderRadius: '10px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.82rem',
            background: 'rgba(239, 68, 68, 0.12)',
            color: '#f87171',
            transition: 'background 0.15s ease, transform 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={e => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.background = 'rgba(239, 68, 68, 0.25)';
            b.style.transform = 'scale(1.04)';
          }}
          onMouseLeave={e => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.background = 'rgba(239, 68, 68, 0.12)';
            b.style.transform = 'scale(1)';
          }}
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default FolderCard;
