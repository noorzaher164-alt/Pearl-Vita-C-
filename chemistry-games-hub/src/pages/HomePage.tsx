import type { Page } from '../types';
import { T, getLang, type Lang } from '../i18n';

interface Props {
  onNavigate: (page: Page) => void;
  onStudentJoin: () => void;
  lang?: Lang;
  onToggleLang?: () => void;
}

const GAME_TYPES = [
  { name: 'Quiz', icon: '❓', bg: '#fef3c7', color: '#d97706' },
  { name: 'Gameshow Quiz', icon: '🎬', bg: '#fce7f3', color: '#db2777' },
  { name: 'Matching Pairs', icon: '🃏', bg: '#dcfce7', color: '#16a34a' },
  { name: 'Spin the Wheel', icon: '🎡', bg: '#dbeafe', color: '#2563eb' },
  { name: 'Open the Box', icon: '📦', bg: '#ffedd5', color: '#ea580c' },
  { name: 'Find the Match', icon: '🎯', bg: '#cffafe', color: '#0891b2' },
  { name: 'Anagram', icon: '🔤', bg: '#fce7f3', color: '#be185d' },
  { name: 'Unjumble', icon: '🔀', bg: '#dcfce7', color: '#15803d' },
  { name: 'Match Up', icon: '🔗', bg: '#dbeafe', color: '#1d4ed8' },
  { name: 'Group Sort', icon: '🗂️', bg: '#fff7ed', color: '#c2410c' },
  { name: 'Flash Cards', icon: '📋', bg: '#cffafe', color: '#0e7490' },
  { name: 'Wordsearch', icon: '🔍', bg: '#dcfce7', color: '#166534' },
  { name: 'Crossword', icon: '✏️', bg: '#fef9c3', color: '#a16207' },
  { name: 'Complete the Sentence', icon: '📝', bg: '#fce7f3', color: '#9d174d' },
  { name: 'Spell the Word', icon: '🔡', bg: '#ffedd5', color: '#9a3412' },
  { name: 'Speaking Cards', icon: '🗣️', bg: '#dbeafe', color: '#1e40af' },
  { name: 'Flip Tiles', icon: '🔄', bg: '#dcfce7', color: '#14532d' },
  { name: 'Labelled Diagram', icon: '🗺️', bg: '#cffafe', color: '#155e75' },
];

const FEATURES = [
  { icon: '⚡', title: 'Create in Minutes', desc: 'Add questions and choose a game type — done in seconds.', bg: '#fff7ed', color: '#ea580c' },
  { icon: '📺', title: 'Host Live in Class', desc: 'Students join with a PIN from any phone or tablet.', bg: '#dbeafe', color: '#2563eb' },
  { icon: '🏆', title: 'Real-Time Leaderboard', desc: 'Scores update instantly — students love competing!', bg: '#fce7f3', color: '#db2777' },
  { icon: '📁', title: 'Organize by Topic', desc: 'Group games into folders by unit, grade, or subject.', bg: '#dcfce7', color: '#16a34a' },
  { icon: '🧪', title: 'Built-In Test Bank', desc: 'Hundreds of ready-made science questions by topic.', bg: '#cffafe', color: '#0891b2' },
  { icon: '📊', title: 'Track Results', desc: 'See how each student performed after every session.', bg: '#fef9c3', color: '#ca8a04' },
];

export default function HomePage({ onNavigate, onStudentJoin, lang, onToggleLang }: Props) {
  const t = T[lang || getLang()];

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', fontFamily: 'inherit' }}>
      <style>{`
        .gt-card:hover { transform: translateY(-4px) scale(1.03); box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important; }
        .feat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important; }
        .cta-green:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(16,185,129,0.45) !important; }
        .cta-blue:hover  { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(14,165,233,0.45) !important; }
      `}</style>

      {/* Nav */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f3f4f6', padding: '14px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#f43f5e,#f97316,#10b981,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🎮</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 17, color: '#111827', letterSpacing: -0.3 }}>Science Games Hub</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: -1 }}>Interactive Learning Platform</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={onToggleLang} style={{ background: '#f3f4f6', border: 'none', color: '#6b7280', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600 }}>
            {lang === 'en' ? 'عربي 🌐' : 'English 🌐'}
          </button>
          <button onClick={onStudentJoin} style={{ background: '#dcfce7', border: '1.5px solid #bbf7d0', color: '#15803d', borderRadius: 10, padding: '8px 18px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, transition: 'all 0.2s' }}>
            🎓 {t.imStudent}
          </button>
          <button onClick={() => onNavigate('dashboard')} style={{ background: 'linear-gradient(135deg,#0ea5e9,#38bdf8)', border: 'none', color: '#fff', borderRadius: 10, padding: '8px 20px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, boxShadow: '0 4px 12px rgba(14,165,233,0.3)', transition: 'all 0.2s' }}>
            👩‍🏫 {t.imTeacher}
          </button>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #fff 60%)', padding: '80px 24px 64px', textAlign: 'center' }}>
        {/* Colorful top label */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 100, padding: '8px 20px', marginBottom: 32, fontSize: 14, fontWeight: 700, color: '#374151', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <span>🎉</span> The fun way to learn any subject
        </div>

        <h1 style={{ fontSize: 'clamp(40px,6vw,76px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 20, letterSpacing: -1 }}>
          <span style={{ color: '#111827' }}>Make every lesson</span>{' '}
          <span style={{ background: 'linear-gradient(90deg,#f43f5e,#f97316,#10b981,#0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            unforgettable
          </span>
        </h1>

        <p style={{ fontSize: 20, color: '#6b7280', maxWidth: 520, margin: '0 auto 52px', lineHeight: 1.7 }}>
          Create interactive games in minutes. Host live competitions. Watch your students light up.
        </p>

        {/* Big CTA buttons */}
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}>
          <button className="cta-green" onClick={onStudentJoin} style={{
            background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff',
            border: 'none', borderRadius: 20, padding: '28px 52px',
            cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center', minWidth: 210,
            boxShadow: '0 8px 24px rgba(16,185,129,0.3)', transition: 'all 0.25s',
          }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🎓</div>
            <div style={{ fontSize: 20, fontWeight: 900 }}>{t.imStudent}</div>
            <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>Enter game PIN</div>
          </button>
          <button className="cta-blue" onClick={() => onNavigate('dashboard')} style={{
            background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', color: '#fff',
            border: 'none', borderRadius: 20, padding: '28px 52px',
            cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center', minWidth: 210,
            boxShadow: '0 8px 24px rgba(14,165,233,0.3)', transition: 'all 0.25s',
          }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>👩‍🏫</div>
            <div style={{ fontSize: 20, fontWeight: 900 }}>{t.imTeacher}</div>
            <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>Go to dashboard</div>
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 0, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 500, margin: '0 auto' }}>
          {[
            { num: '18', label: 'Game Types', color: '#f43f5e', bg: '#fff1f2' },
            { num: '∞', label: 'Questions', color: '#ea580c', bg: '#fff7ed' },
            { num: '100%', label: 'Free', color: '#16a34a', bg: '#f0fdf4' },
          ].map((s, i) => (
            <div key={s.label} style={{ flex: 1, textAlign: 'center', padding: '20px 16px', background: s.bg, borderRadius: i === 0 ? '16px 0 0 16px' : i === 2 ? '0 16px 16px 0' : 0, border: '1px solid #f3f4f6' }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: s.color }}>{s.num}</div>
              <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Game Types */}
      <div style={{ padding: '72px 32px', background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-block', background: '#fff7ed', color: '#ea580c', border: '1.5px solid #fed7aa', borderRadius: 100, padding: '6px 18px', fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
              🎮 18 Game Formats
            </div>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: '#111827', margin: 0 }}>One question set, 18 different games</h2>
            <p style={{ color: '#6b7280', marginTop: 10, fontSize: 16 }}>Create once, play in any format you like</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))', gap: 12 }}>
            {GAME_TYPES.map(g => (
              <div key={g.name} className="gt-card" style={{ background: g.bg, border: `1.5px solid ${g.color}25`, borderRadius: 16, padding: '18px 12px', textAlign: 'center', transition: 'all 0.22s', cursor: 'default' }}>
                <div style={{ fontSize: 34, marginBottom: 8 }}>{g.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: g.color, lineHeight: 1.3 }}>{g.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: '72px 32px', background: '#f9fafb' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-block', background: '#dcfce7', color: '#15803d', border: '1.5px solid #bbf7d0', borderRadius: 100, padding: '6px 18px', fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
              ✨ Built for teachers
            </div>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: '#111827', margin: 0 }}>Everything you need, nothing you don't</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 18 }}>
            {FEATURES.map(f => (
              <div key={f.title} className="feat-card" style={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: 20, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', transition: 'all 0.22s' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 16, border: `1.5px solid ${f.color}20` }}>
                  {f.icon}
                </div>
                <div style={{ fontWeight: 800, fontSize: 17, color: '#111827', marginBottom: 8 }}>{f.title}</div>
                <div style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.65 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{ padding: '80px 24px', background: '#fff', textAlign: 'center' }}>
        <div style={{ maxWidth: 660, margin: '0 auto', background: 'linear-gradient(135deg,#fff7ed,#fef9c3,#f0fdf4,#e0f2fe)', border: '1.5px solid #e5e7eb', borderRadius: 28, padding: '60px 40px', boxShadow: '0 4px 32px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🚀</div>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: '#111827', marginBottom: 12 }}>{t.ctaTitle}</h2>
          <p style={{ color: '#6b7280', marginBottom: 36, fontSize: 16, lineHeight: 1.7 }}>{t.ctaDesc}</p>
          <button className="cta-blue" onClick={() => onNavigate('dashboard')} style={{
            background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', color: '#fff',
            border: 'none', borderRadius: 14, padding: '16px 52px',
            fontSize: 18, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 6px 24px rgba(14,165,233,0.3)', transition: 'all 0.25s',
          }}>
            {t.startTeaching} →
          </button>
        </div>
      </div>

      <div style={{ background: '#f9fafb', borderTop: '1px solid #f3f4f6', padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
        Science Games Hub · Made with ❤️ for teachers and students
      </div>
    </div>
  );
}
