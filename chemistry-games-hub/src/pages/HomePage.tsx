import type { Page } from '../types';
import { getTheme } from '../theme';
import type { Theme } from '../theme';
import { T, getLang, type Lang } from '../i18n';

interface Props {
  onNavigate: (page: Page) => void;
  onStudentJoin: () => void;
  lang?: Lang;
  onToggleLang?: () => void;
}

const gameTypes = [
  { name: 'Quiz', icon: '❓', color: '#c084fc', type: 'competitive' },
  { name: 'Gameshow Quiz', icon: '🎬', color: '#7dd3fc', type: 'competitive' },
  { name: 'Matching Pairs', icon: '🃏', color: '#fde68a', type: 'competitive' },
  { name: 'Spin the Wheel', icon: '🎡', color: '#6ee7b7', type: 'competitive' },
  { name: 'Open the Box', icon: '📦', color: '#fca5a5', type: 'competitive' },
  { name: 'Find the Match', icon: '🎯', color: '#34d399', type: 'competitive' },
  { name: 'Anagram', icon: '🔤', color: '#a78bfa', type: 'practice' },
  { name: 'Unjumble', icon: '🔀', color: '#ff6eb4', type: 'practice' },
  { name: 'Match Up', icon: '🔗', color: '#60a5fa', type: 'practice' },
  { name: 'Group Sort', icon: '🗂️', color: '#fb923c', type: 'practice' },
  { name: 'Flash Cards', icon: '📋', color: '#fde68a', type: 'practice' },
  { name: 'Wordsearch', icon: '🔍', color: '#6ee7b7', type: 'practice' },
  { name: 'Crossword', icon: '✏️', color: '#c084fc', type: 'practice' },
  { name: 'Complete the Sentence', icon: '📝', color: '#7dd3fc', type: 'practice' },
  { name: 'Spell the Word', icon: '🔡', color: '#fca5a5', type: 'practice' },
  { name: 'Speaking Cards', icon: '🗣️', color: '#a78bfa', type: 'practice' },
  { name: 'Flip Tiles', icon: '🔄', color: '#34d399', type: 'practice' },
  { name: 'Labelled Diagram', icon: '🗺️', color: '#ff6eb4', type: 'practice' },
];

export default function HomePage({ onNavigate, onStudentJoin, lang, onToggleLang }: Props) {
  const theme = (localStorage.getItem('cgh_theme') as Theme) || 'dark';
  const C = getTheme(theme);
  const isDark = theme === 'dark';
  const t = T[lang || getLang()];

  const cardBg = isDark ? 'rgba(255,255,255,0.05)' : 'white';
  const cardBorder = isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb';
  const cardHoverBg = isDark ? 'rgba(192,132,252,0.1)' : '#f5f3ff';
  const cardHoverBorder = isDark ? 'rgba(192,132,252,0.3)' : '#c084fc';

  const features = [
    { icon: '🧪', title: 'Interactive Games', desc: '10 unique game types for competitive & self-paced learning' },
    { icon: '📁', title: 'Folder System', desc: 'Organize games by topic and lesson for easy access' },
    { icon: '🏆', title: 'Leaderboards', desc: 'Live competition with real-time scores and rankings' },
    { icon: '✏️', title: 'Easy Creation', desc: 'Build MCQ questions with explanations in minutes' },
    { icon: '💾', title: 'Auto-Save', desc: 'All games saved automatically in your browser' },
    { icon: '📱', title: 'Responsive', desc: 'Works perfectly on laptops, tablets, and phones' },
  ];

  return (
    <div className="min-h-screen">
      {/* Language toggle */}
      <button
        onClick={onToggleLang}
        style={{
          position: 'fixed', top: 16, right: 16, zIndex: 100,
          background: 'rgba(192,132,252,0.2)', border: '1px solid #c084fc',
          color: '#9333ea', borderRadius: 10, padding: '6px 14px',
          cursor: 'pointer', fontWeight: 700, fontSize: 14,
        }}
      >
        {lang === 'en' ? 'عربي' : 'English'}
      </button>

      {/* Hero */}
      <div className="relative overflow-hidden" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        {/* Decorative atoms */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', fontSize: 80, opacity: 0.15, animation: 'spin 20s linear infinite' }}>⚛️</div>
        <div style={{ position: 'absolute', top: '20%', right: '8%', fontSize: 60, opacity: 0.12, animation: 'spin 15s linear infinite reverse' }}>🧬</div>
        <div style={{ position: 'absolute', bottom: '15%', left: '10%', fontSize: 50, opacity: 0.1, animation: 'spin 25s linear infinite' }}>🔬</div>
        <div style={{ position: 'absolute', bottom: '20%', right: '5%', fontSize: 70, opacity: 0.12, animation: 'spin 18s linear infinite reverse' }}>⚗️</div>

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        `}</style>

        <div className="container mx-auto px-6 py-20 text-center" style={{ maxWidth: 900 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: isDark ? 'rgba(192,132,252,0.15)' : '#ede9fe',
            border: `1px solid ${isDark ? 'rgba(192,132,252,0.4)' : '#c084fc'}`,
            borderRadius: 100, padding: '8px 20px', marginBottom: 32, fontSize: 14, color: '#9333ea',
          }}>
            <span>🧪</span>
            <span>{t.tagline}</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(48px, 8vw, 84px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 24,
            background: 'linear-gradient(135deg, #f093fb 0%, #a78bfa 40%, #7dd3fc 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            whiteSpace: 'pre-line',
          }}>
            {t.heroTitle}
          </h1>

          <p style={{ fontSize: 20, color: C.textMuted, maxWidth: 600, margin: '0 auto 48px', lineHeight: 1.6 }}>
            {t.heroDesc}
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onStudentJoin} style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: 'white', border: 'none', borderRadius: 20,
              padding: '24px 36px', fontSize: 16, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 8px 30px rgba(34,197,94,0.5)',
              transition: 'all 0.3s', textAlign: 'center', minWidth: 180,
            }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={{ fontSize: 40, marginBottom: 8 }}>🎓</div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{t.imStudent}</div>
              <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>{t.enterPin}</div>
            </button>

            <button onClick={() => onNavigate('dashboard')} style={{
              background: 'linear-gradient(135deg, #c084fc 0%, #a78bfa 50%, #7dd3fc 100%)',
              color: 'white', border: 'none', borderRadius: 20,
              padding: '24px 36px', fontSize: 16, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 8px 30px rgba(167,139,250,0.5)',
              transition: 'all 0.3s', textAlign: 'center', minWidth: 180,
            }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={{ fontSize: 40, marginBottom: 8 }}>👩‍🏫</div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{t.imTeacher}</div>
              <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>{t.goToDashboard}</div>
            </button>
          </div>

          <div style={{ display: 'flex', gap: 40, justifyContent: 'center', marginTop: 64, flexWrap: 'wrap' }}>
            {[{ num: '10', label: 'Game Types' }, { num: '5', label: 'Demo Topics' }, { num: '∞', label: 'Questions' }].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, fontWeight: 800, background: 'linear-gradient(135deg, #f093fb, #7dd3fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stat.num}</div>
                <div style={{ color: C.textMuted, fontSize: 14 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 36, fontWeight: 700, marginBottom: 16, color: C.text }}>
          {t.everythingYouNeed}
        </h2>
        <p style={{ textAlign: 'center', color: C.textMuted, marginBottom: 48 }}>{t.builtForTeachers}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {features.map(f => (
            <div key={f.title} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 20, padding: 28, backdropFilter: 'blur(10px)', transition: 'all 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.background = cardHoverBg; e.currentTarget.style.borderColor = cardHoverBorder; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = cardBg; e.currentTarget.style.borderColor = cardBorder; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ fontSize: 40, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: C.textMuted, fontSize: 14, lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Game Types */}
      <div style={{ padding: '60px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 36, fontWeight: 700, marginBottom: 8, color: C.text }}>
          {t.gameTypes}
        </h2>
        <p style={{ textAlign: 'center', color: C.textMuted, marginBottom: 48 }}>
          {t.gameTypesDesc}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
          {gameTypes.map(g => (
            <div key={g.name} style={{ background: cardBg, border: `1px solid ${g.color}33`, borderRadius: 16, padding: 20, textAlign: 'center', transition: 'all 0.3s', cursor: 'default' }}
              onMouseEnter={e => { e.currentTarget.style.background = `${g.color}20`; e.currentTarget.style.borderColor = `${g.color}60`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = cardBg; e.currentTarget.style.borderColor = `${g.color}33`; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ fontSize: 36, marginBottom: 10 }}>{g.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>{g.name}</div>
              <div style={{
                display: 'inline-block', fontSize: 10, padding: '2px 8px', borderRadius: 100,
                background: g.type === 'competitive' ? 'rgba(192,132,252,0.2)' : 'rgba(110,231,183,0.2)',
                color: g.type === 'competitive' ? '#9333ea' : '#059669',
              }}>
                {g.type === 'competitive' ? t.filterCompetitive : t.filterPractice}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{
          background: isDark ? 'linear-gradient(135deg, rgba(192,132,252,0.2) 0%, rgba(125,211,252,0.1) 100%)' : 'linear-gradient(135deg, #ede9fe, #dbeafe)',
          border: `1px solid ${isDark ? 'rgba(192,132,252,0.3)' : '#c4b5fd'}`,
          borderRadius: 32, padding: '60px 40px', maxWidth: 700, margin: '0 auto',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🧑‍🔬</div>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: C.text, marginBottom: 16 }}>
            {t.ctaTitle}
          </h2>
          <p style={{ color: C.textMuted, marginBottom: 32, fontSize: 16 }}>
            {t.ctaDesc}
          </p>
          <button onClick={() => onNavigate('dashboard')} style={{
            background: 'linear-gradient(135deg, #c084fc 0%, #a78bfa 50%, #7dd3fc 100%)',
            color: 'white', border: 'none', borderRadius: 14, padding: '14px 36px',
            fontSize: 17, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 8px 30px rgba(167,139,250,0.4)',
          }}>
            {t.startTeaching}
          </button>
        </div>
      </div>
    </div>
  );
}
