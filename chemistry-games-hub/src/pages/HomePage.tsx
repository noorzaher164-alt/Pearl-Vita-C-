import type { Page } from '../types';
import { T, getLang, type Lang } from '../i18n';

interface Props {
  onNavigate: (page: Page) => void;
  onStudentJoin: () => void;
  lang?: Lang;
  onToggleLang?: () => void;
}

const GAME_TYPES = [
  { name: 'Quiz', icon: '❓', color: '#6366f1' },
  { name: 'Gameshow Quiz', icon: '🎬', color: '#ec4899' },
  { name: 'Matching Pairs', icon: '🃏', color: '#f59e0b' },
  { name: 'Spin the Wheel', icon: '🎡', color: '#10b981' },
  { name: 'Open the Box', icon: '📦', color: '#3b82f6' },
  { name: 'Find the Match', icon: '🎯', color: '#8b5cf6' },
  { name: 'Anagram', icon: '🔤', color: '#f43f5e' },
  { name: 'Unjumble', icon: '🔀', color: '#14b8a6' },
  { name: 'Match Up', icon: '🔗', color: '#f97316' },
  { name: 'Group Sort', icon: '🗂️', color: '#a855f7' },
  { name: 'Flash Cards', icon: '📋', color: '#06b6d4' },
  { name: 'Wordsearch', icon: '🔍', color: '#84cc16' },
  { name: 'Crossword', icon: '✏️', color: '#6366f1' },
  { name: 'Complete the Sentence', icon: '📝', color: '#ec4899' },
  { name: 'Spell the Word', icon: '🔡', color: '#f59e0b' },
  { name: 'Speaking Cards', icon: '🗣️', color: '#10b981' },
  { name: 'Flip Tiles', icon: '🔄', color: '#3b82f6' },
  { name: 'Labelled Diagram', icon: '🗺️', color: '#8b5cf6' },
];

const SUBJECTS = [
  { icon: '⚗️', name: 'Chemistry', color: '#6366f1' },
  { icon: '🔬', name: 'Biology', color: '#10b981' },
  { icon: '⚡', name: 'Physics', color: '#f59e0b' },
  { icon: '➕', name: 'Math', color: '#3b82f6' },
  { icon: '🌍', name: 'Geography', color: '#84cc16' },
  { icon: '📚', name: 'All Subjects', color: '#ec4899' },
];

export default function HomePage({ onNavigate, onStudentJoin, lang, onToggleLang }: Props) {
  const t = T[lang || getLang()];

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', fontFamily: 'inherit' }}>
      <style>{`
        @keyframes floatUp { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes pop { 0%{transform:scale(1)} 50%{transform:scale(1.08)} 100%{transform:scale(1)} }
        .game-card:hover { transform: translateY(-6px) !important; box-shadow: 0 12px 32px rgba(0,0,0,0.12) !important; }
        .cta-btn:hover { transform: translateY(-3px) !important; filter: brightness(1.05); }
      `}</style>

      {/* Top rainbow bar */}
      <div style={{ height: 5, background: 'linear-gradient(90deg,#6366f1,#ec4899,#f59e0b,#10b981,#3b82f6,#8b5cf6,#f43f5e)' }} />

      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 40px', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>🎮</span>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18, color: '#1a1a2e' }}>Science Games Hub</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: -2 }}>Interactive Learning Platform</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={onToggleLang} style={{ background: '#f3f4f6', border: 'none', color: '#6b7280', borderRadius: 8, padding: '7px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600 }}>
            {lang === 'en' ? 'عربي 🌐' : 'English 🌐'}
          </button>
          <button onClick={onStudentJoin} style={{ background: '#dcfce7', border: 'none', color: '#16a34a', borderRadius: 8, padding: '7px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700 }}>
            🎓 {t.imStudent}
          </button>
          <button onClick={() => onNavigate('dashboard')} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', borderRadius: 8, padding: '7px 18px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700 }}>
            👩‍🏫 {t.imTeacher}
          </button>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(180deg, #f5f7ff 0%, #ffffff 100%)', padding: '80px 24px 60px', textAlign: 'center' }}>
        {/* Floating subject icons */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
            {SUBJECTS.map(s => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 6, background: `${s.color}15`, border: `1px solid ${s.color}30`, borderRadius: 100, padding: '6px 14px', fontSize: 13, color: s.color, fontWeight: 700 }}>
                <span>{s.icon}</span> {s.name}
              </div>
            ))}
          </div>
        </div>

        <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 20, background: 'linear-gradient(135deg,#6366f1 0%,#ec4899 40%,#f59e0b 70%,#10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {t.heroTitle}
        </h1>

        <p style={{ fontSize: 20, color: '#6b7280', maxWidth: 560, margin: '0 auto 48px', lineHeight: 1.7 }}>
          {t.heroDesc}
        </p>

        {/* Big CTA cards */}
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 }}>
          <button className="cta-btn" onClick={onStudentJoin} style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white', border: 'none', borderRadius: 24, padding: '32px 48px',
            cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center', minWidth: 200,
            boxShadow: '0 8px 32px rgba(16,185,129,0.35)', transition: 'all 0.25s',
          }}>
            <div style={{ fontSize: 52, marginBottom: 10 }}>🎓</div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>{t.imStudent}</div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 6 }}>{t.enterPin}</div>
          </button>

          <button className="cta-btn" onClick={() => onNavigate('dashboard')} style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white', border: 'none', borderRadius: 24, padding: '32px 48px',
            cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center', minWidth: 200,
            boxShadow: '0 8px 32px rgba(99,102,241,0.35)', transition: 'all 0.25s',
          }}>
            <div style={{ fontSize: 52, marginBottom: 10 }}>👩‍🏫</div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>{t.imTeacher}</div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 6 }}>{t.goToDashboard}</div>
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 48, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { num: '18', label: 'Game Types', color: '#6366f1' },
            { num: '∞', label: 'Questions', color: '#ec4899' },
            { num: '100%', label: 'Free', color: '#10b981' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 42, fontWeight: 900, color: s.color }}>{s.num}</div>
              <div style={{ fontSize: 14, color: '#9ca3af', fontWeight: 600, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Game Types */}
      <div style={{ padding: '70px 32px', background: '#ffffff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-block', background: '#eef2ff', color: '#6366f1', borderRadius: 100, padding: '6px 18px', fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
              🎮 {t.gameTypes}
            </div>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: '#1a1a2e', margin: '0 0 12px' }}>{t.gameTypesDesc}</h2>
            <p style={{ color: '#6b7280', fontSize: 16 }}>Choose from 18 interactive game formats for any lesson</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
            {GAME_TYPES.map(g => (
              <div key={g.name} className="game-card" style={{
                background: '#fff', border: `2px solid ${g.color}20`,
                borderRadius: 18, padding: '20px 14px', textAlign: 'center',
                transition: 'all 0.25s', cursor: 'default',
                boxShadow: `0 2px 8px ${g.color}15`,
              }}>
                <div style={{ fontSize: 36, marginBottom: 10, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>{g.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1a2e', lineHeight: 1.3 }}>{g.name}</div>
                <div style={{ width: 28, height: 3, background: g.color, borderRadius: 100, margin: '8px auto 0' }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: '70px 32px', background: '#f5f7ff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: '#1a1a2e', margin: '0 0 12px' }}>{t.everythingYouNeed}</h2>
            <p style={{ color: '#6b7280', fontSize: 16 }}>{t.builtForTeachers}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {[
              { icon: '⚡', title: 'Create in Minutes', desc: 'Add your questions and pick a game type — that\'s it. No complicated setup needed.', color: '#f59e0b' },
              { icon: '📺', title: 'Host Live in Class', desc: 'Project the game on the classroom screen. Students join with a PIN from any device.', color: '#6366f1' },
              { icon: '🏆', title: 'Real-Time Leaderboard', desc: 'Students compete live with scores updating instantly — great for engagement.', color: '#ec4899' },
              { icon: '📁', title: 'Organize by Topic', desc: 'Group your games into folders by unit or grade for easy access anytime.', color: '#10b981' },
              { icon: '🧪', title: 'Test Bank Built-In', desc: 'Hundreds of ready-made science questions sorted by topic and semester.', color: '#8b5cf6' },
              { icon: '📊', title: 'Track Results', desc: 'See who played, who scored what, and how students performed.', color: '#3b82f6' },
            ].map(f => (
              <div key={f.title} style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 20, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: `${f.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 16 }}>
                  {f.icon}
                </div>
                <div style={{ fontWeight: 800, fontSize: 17, color: '#1a1a2e', marginBottom: 8 }}>{f.title}</div>
                <div style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA bottom */}
      <div style={{ padding: '80px 24px', textAlign: 'center', background: '#fff' }}>
        <div style={{ background: 'linear-gradient(135deg, #eef2ff, #fdf4ff, #ecfdf5)', border: '1px solid #e8eaf6', borderRadius: 32, padding: '60px 40px', maxWidth: 680, margin: '0 auto' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🚀</div>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#1a1a2e', marginBottom: 12 }}>{t.ctaTitle}</h2>
          <p style={{ color: '#6b7280', marginBottom: 32, fontSize: 16, lineHeight: 1.6 }}>{t.ctaDesc}</p>
          <button className="cta-btn" onClick={() => onNavigate('dashboard')} style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white',
            border: 'none', borderRadius: 14, padding: '16px 48px',
            fontSize: 18, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 8px 28px rgba(99,102,241,0.35)', transition: 'all 0.25s',
          }}>
            {t.startTeaching} →
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#f9fafb', borderTop: '1px solid #f0f0f0', padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
        Science Games Hub · Built for teachers, loved by students 🎮
      </div>
    </div>
  );
}
