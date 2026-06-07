import { useState } from 'react';
import { TEMPLATES, type GameTemplate } from '../templates';

interface Props {
  selected: string;
  onChange: (templateId: string) => void;
}

export default function TemplatePicker({ selected, onChange }: Props) {
  const [preview, setPreview] = useState<GameTemplate | null>(null);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12 }}>
        {TEMPLATES.map(t => {
          const isSelected = selected === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              onMouseEnter={() => setPreview(t)}
              onMouseLeave={() => setPreview(null)}
              style={{
                background: isSelected
                  ? 'rgba(192,132,252,0.2)'
                  : 'rgba(255,255,255,0.04)',
                border: isSelected
                  ? '2px solid #c084fc'
                  : '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16,
                padding: 0,
                cursor: 'pointer',
                fontFamily: 'inherit',
                overflow: 'hidden',
                transition: 'all 0.25s',
                transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                boxShadow: isSelected ? '0 0 20px rgba(192,132,252,0.35)' : 'none',
                textAlign: 'left',
              }}
            >
              {/* Mini preview of the template */}
              <div style={{
                background: t.bg,
                padding: '16px 14px 12px',
                position: 'relative',
                overflow: 'hidden',
                height: 90,
              }}>
                {/* Floating particles preview */}
                {t.particles.slice(0, 4).map((p, i) => (
                  <span key={i} style={{
                    position: 'absolute',
                    fontSize: p.length <= 2 ? 13 : 10,
                    color: t.accentColor,
                    opacity: 0.4,
                    top: [8, 20, 55, 35][i],
                    left: [10, 70, 30, 110][i],
                    fontWeight: 700,
                    fontFamily: 'monospace',
                  }}>{p}</span>
                ))}

                {/* Mini answer buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 'auto', position: 'absolute', bottom: 10, left: 10, right: 10 }}>
                  {t.choiceColors.map((c, i) => (
                    <div key={i} style={{ height: 12, borderRadius: 4, background: c, opacity: 0.85 }} />
                  ))}
                </div>

                {/* Big emoji */}
                <div style={{ fontSize: 28, position: 'absolute', top: 8, right: 10, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }}>
                  {t.emoji}
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.3)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 2 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: t.accentColor, opacity: 0.9 }}>{t.topic}</div>
              </div>

              {isSelected && (
                <div style={{
                  position: 'absolute', top: 8, left: 8,
                  background: '#c084fc', borderRadius: '50%',
                  width: 20, height: 20,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, color: 'white',
                }}>✓</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Hover preview tooltip */}
      {preview && (
        <div style={{
          marginTop: 16,
          background: 'rgba(255,255,255,0.05)',
          border: `1px solid ${preview.accentColor}40`,
          borderRadius: 12, padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 28 }}>{preview.emoji}</span>
          <div>
            <div style={{ fontWeight: 700, color: 'white', fontSize: 14 }}>{preview.name} — {preview.nameAr}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 }}>{preview.description}</div>
            <div style={{ color: preview.accentColor, fontSize: 12, marginTop: 2 }}>Best for: {preview.topic}</div>
          </div>
        </div>
      )}
    </div>
  );
}
