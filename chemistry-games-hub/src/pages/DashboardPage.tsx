import { useState, useEffect } from 'react';
import type { Folder, Page, User } from '../types';
import type { Theme } from '../theme';
import { getTheme } from '../theme';
import { getFolders, saveFolder, deleteFolder, getGamesByFolder, getGames, getResults } from '../storage';
import { setCurrentUser } from '../users';
import { T, getLang, type Lang } from '../i18n';

interface Props {
  user: User;
  theme: Theme;
  onThemeToggle: () => void;
  onNavigate: (page: Page, extra?: Partial<Record<string, unknown>>) => void;
  onSelectFolder: (id: string) => void;
  onCreateGame: (folderId: string) => void;
  onLogout: () => void;
  lang?: Lang;
  onToggleLang?: () => void;
}

type SidebarView = 'home' | 'library' | 'games' | 'results' | 'testbank';

const FOLDER_COLORS = ['#f43f5e','#0ea5e9','#10b981','#f97316','#ec4899','#f59e0b','#8b5cf6','#14b8a6','#ef4444','#3b82f6'];
const FOLDER_ICONS  = ['📁','🧪','⚗️','🔬','🧬','⚖️','🔥','🧫','⚡','🌡️','💊','🧲','📝','🎯','💡','🌊','🌿','🦋','🔭','🎨'];

// Chemistry molecule decoration for light mode

const CHEMISTRY_TIPS = [
  '💡 Tip: Use "Host Live" to project the game on your classroom screen!',
  '🔬 Tip: Add explanations to questions — students see them after answering.',
  '⚗️ Tip: True/False questions are great for warm-ups at lesson start.',
  '🏆 Tip: Live games with leaderboards boost classroom engagement by 3×.',
  '📝 Tip: Build your question bank first, then generate games in seconds.',
  '🎯 Tip: Short games (5–8 questions) work best for daily review.',
];

export default function DashboardPage({ user, theme, onThemeToggle, onNavigate, onSelectFolder, onCreateGame, onLogout, lang, onToggleLang }: Props) {
  const th = getTheme(theme);
  const isDark = theme === 'dark';
  const t = T[lang || getLang()];
  const [view, setView] = useState<SidebarView>('home');
  const [activeFolder, setActiveFolder] = useState<Folder | null>(null);
  const [allFolders, setAllFolders] = useState<Folder[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('📁');
  const [newColor, setNewColor] = useState(FOLDER_COLORS[0]);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState('');
  const [gameSearch, setGameSearch] = useState('');
  const [tip] = useState(() => CHEMISTRY_TIPS[Math.floor(Math.random() * CHEMISTRY_TIPS.length)]);

  const reloadFolders = () => setAllFolders(getFolders());
  useEffect(() => { reloadFolders(); }, []);

  const handleCreateFolder = () => {
    if (!newName.trim()) return;
    saveFolder({ id: crypto.randomUUID(), name: newName.trim(), color: newColor, icon: newIcon, createdAt: new Date().toISOString() });
    setNewName(''); setShowCreate(false); reloadFolders();
  };

  const handleRename = (id: string) => {
    const f = getFolders().find(x => x.id === id);
    if (!f || !renameVal.trim()) return;
    saveFolder({ ...f, name: renameVal.trim() }); setRenamingId(null); reloadFolders();
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this folder and all its games?')) return;
    deleteFolder(id);
    if (activeFolder?.id === id) setActiveFolder(null);
    reloadFolders();
  };

  const handleLogout = () => { setCurrentUser(null); onLogout(); };
  const switchView = (v: SidebarView) => { setView(v); setActiveFolder(null); };

  // ── Shared styles ─────────────────────────────────────────────────────────
  const card: React.CSSProperties = { background: th.cardBg, border: `1px solid ${th.cardBorder}`, borderRadius: 20, padding: '20px 22px', boxShadow: th.shadow };
  const inp: React.CSSProperties = { width: '100%', background: th.inputBg, border: `1.5px solid ${th.inputBorder}`, borderRadius: 12, padding: '12px 16px', color: th.text, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };

  const NAV: { id: SidebarView; icon: string; label: string }[] = [
    { id: 'home',     icon: '🏠', label: t.home },
    { id: 'library',  icon: '📚', label: t.library },
    { id: 'games',    icon: '🎮', label: t.allGames },
    { id: 'results',  icon: '📊', label: t.results },
    { id: 'testbank', icon: '🏦', label: t.testBank },
  ];

  // ── Sidebar ───────────────────────────────────────────────────────────────
  const NAV_COLORS = ['#f43f5e','#0ea5e9','#10b981','#f97316','#ec4899'];

  const Sidebar = () => (
    <div style={{ width: 256, minHeight: '100vh', background: th.sidebarBg, borderRight: `1px solid ${th.sidebarBorder}`, display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', boxShadow: isDark ? 'none' : '2px 0 16px rgba(0,0,0,0.05)' }}>
      {/* Colorful top strip */}
      {!isDark && <div style={{ height: 4, background: 'linear-gradient(90deg,#f43f5e,#f97316,#f59e0b,#10b981,#0ea5e9,#ec4899)', flexShrink: 0 }} />}

      {/* Brand */}
      <div style={{ padding: '20px 18px 16px', borderBottom: `1px solid ${th.divider}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 42, height: 42, borderRadius: 13, background: 'linear-gradient(135deg,#f43f5e,#f97316,#10b981,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🎮</div>
          <div>
            <div style={{ color: th.text, fontWeight: 900, fontSize: 14, lineHeight: 1.2 }}>{t.appName}</div>
            <div style={{ color: th.textFaint, fontSize: 10, marginTop: 1 }}>{t.tagline}</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {NAV.map((item, i) => {
          const active = view === item.id;
          const color = NAV_COLORS[i % NAV_COLORS.length];
          const bgPastel = ['#fff1f2','#e0f2fe','#dcfce7','#fff7ed','#fce7f3'][i % 5];
          return (
            <button key={item.id} onClick={() => switchView(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: active ? bgPastel : 'transparent',
              border: active ? `1.5px solid ${color}30` : '1.5px solid transparent',
              borderRadius: 12, padding: '10px 14px',
              color: active ? color : th.textMuted,
              cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: active ? 700 : 500,
              width: '100%', textAlign: 'left', transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: 18, width: 22, textAlign: 'center' }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {active && <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />}
            </button>
          );
        })}

        <div style={{ margin: '6px 4px', borderTop: `1px solid ${th.divider}` }} />
        {user.role === 'admin' && (
          <button onClick={() => onNavigate('admin-panel' as any)} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fef9c3', border: '1.5px solid #fde047', borderRadius: 12, padding: '10px 14px', color: '#a16207', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, width: '100%', textAlign: 'left' }}>
            <span style={{ fontSize: 18, width: 22, textAlign: 'center' }}>👑</span> Admin Panel
          </button>
        )}
        <button onClick={onThemeToggle} style={{ display: 'flex', alignItems: 'center', gap: 12, background: th.badge, border: `1px solid ${th.cardBorder}`, borderRadius: 12, padding: '10px 14px', color: th.textMuted, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, width: '100%', textAlign: 'left', fontWeight: 500 }}>
          <span style={{ fontSize: 18, width: 22, textAlign: 'center' }}>{isDark ? '☀️' : '🌙'}</span>
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button onClick={onToggleLang} style={{ display: 'flex', alignItems: 'center', gap: 12, background: th.badge, border: `1px solid ${th.cardBorder}`, borderRadius: 12, padding: '10px 14px', color: th.textMuted, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, width: '100%', textAlign: 'left', fontWeight: 500 }}>
          <span style={{ fontSize: 18, width: 22, textAlign: 'center' }}>🌐</span>
          {lang === 'en' ? 'عربي' : 'English'}
        </button>
      </nav>

      {/* User */}
      <div style={{ padding: '14px 12px', borderTop: `1px solid ${th.divider}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#f43f5e,#f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: 15, flexShrink: 0 }}>
            {(user.displayName?.[0] || '?').toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden', minWidth: 0 }}>
            <div style={{ color: th.text, fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.displayName}</div>
            <div style={{ color: th.textFaint, fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{ width: '100%', background: th.danger, border: `1px solid ${th.dangerText}30`, color: th.dangerText, borderRadius: 10, padding: '8px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600 }}>🔒 {t.logout}</button>
      </div>
    </div>
  );

  // ── HOME ─────────────────────────────────────────────────────────────────
  const HomeView = () => {
    const allGames = getGames();
    const allResults = getResults();
    const liveCount = allResults.filter(r => r.sessionType === 'live').length;

    return (
      <div style={{ padding: '36px 40px', maxWidth: 1100 }}>
        {/* Hero banner */}
        <div style={{ background: isDark ? 'rgba(14,165,233,0.08)' : 'linear-gradient(135deg,#fff7ed 0%,#ecfdf5 50%,#e0f2fe 100%)', border: `1px solid ${isDark ? 'rgba(14,165,233,0.2)' : '#e5e7eb'}`, borderRadius: 28, padding: '32px 36px', marginBottom: 32, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: 32, top: '50%', transform: 'translateY(-50%)', fontSize: 90, opacity: 0.2, userSelect: 'none', pointerEvents: 'none' }}>🎮</div>
          <div style={{ position: 'absolute', right: 160, top: 10, fontSize: 40, opacity: 0.15, userSelect: 'none', pointerEvents: 'none' }}>⭐</div>
          <div style={{ position: 'absolute', right: 250, bottom: 10, fontSize: 30, opacity: 0.15, userSelect: 'none', pointerEvents: 'none' }}>🏆</div>
          <div style={{ position: 'relative' }}>
            <div style={{ color: '#ea580c', fontSize: 12, fontWeight: 800, letterSpacing: 2, marginBottom: 8 }}>{t.appName.toUpperCase()} · TEACHER DASHBOARD</div>
            <h1 style={{ color: th.text, fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 900, margin: '0 0 10px', lineHeight: 1.2 }}>
              {t.welcomeBack}, {user.displayName.split(' ').slice(-1)[0]}! 👋<br />
              <span style={{ background: 'linear-gradient(90deg,#f43f5e,#f97316,#10b981,#0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Ready to ignite curiosity?</span>
            </h1>
            <p style={{ color: th.textMuted, fontSize: 15, marginBottom: 24, maxWidth: 480 }}>{t.dashDesc}</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={() => onCreateGame('')}
                style={{ background: 'linear-gradient(135deg,#f43f5e,#f97316)', color: 'white', border: 'none', borderRadius: 14, padding: '13px 24px', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(244,63,94,0.3)' }}>
                ✨ {t.createNewGame}
              </button>
              <button onClick={() => switchView('library')}
                style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'white', border: `1px solid ${th.cardBorder}`, color: th.text, borderRadius: 14, padding: '13px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: th.shadow }}>
                📚 {t.openLibrary}
              </button>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 36 }}>
          {[
            { icon: '🎮', label: t.games, value: allGames.length, color: '#f43f5e', bg: isDark ? 'rgba(244,63,94,0.08)' : '#fff1f2' },
            { icon: '📁', label: t.folders, value: allFolders.length, color: '#0ea5e9', bg: isDark ? 'rgba(14,165,233,0.08)' : '#e0f2fe' },
            { icon: '📊', label: t.sessions, value: allResults.length, color: '#10b981', bg: isDark ? 'rgba(16,185,129,0.08)' : '#dcfce7' },
            { icon: '⚡', label: t.live, value: liveCount, color: '#f97316', bg: isDark ? 'rgba(249,115,22,0.08)' : '#fff7ed' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}25`, borderRadius: 18, padding: '20px 18px', borderTop: `3px solid ${s.color}` }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ color: s.color, fontSize: 32, fontWeight: 900 }}>{s.value}</div>
              <div style={{ color: th.textMuted, fontSize: 13, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <h3 style={{ color: th.textMuted, fontSize: 11, letterSpacing: 2, fontWeight: 700, marginBottom: 14 }}>{t.quickActions}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 12, marginBottom: 36 }}>
          {[
            { icon: '✨', label: t.createNewGame, desc: 'Create from scratch', color: '#f43f5e', action: () => onCreateGame('') },
            { icon: '📚', label: t.library, desc: 'Browse your folders', color: '#0ea5e9', action: () => switchView('library') },
            { icon: '🏦', label: t.testBank, desc: 'Generate from bank', color: '#f97316', action: () => switchView('testbank') },
            { icon: '📊', label: t.results, desc: 'Session history', color: '#10b981', action: () => switchView('results') },
          ].map(a => (
            <button key={a.label} onClick={a.action}
              style={{ background: isDark ? `${a.color}08` : `${a.color}10`, border: `1.5px solid ${a.color}25`, borderRadius: 18, padding: '20px 16px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${a.color}20`; e.currentTarget.style.borderColor = `${a.color}55`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = `${a.color}25`; }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{a.icon}</div>
              <div style={{ color: th.text, fontWeight: 800, fontSize: 15, marginBottom: 3 }}>{a.label}</div>
              <div style={{ color: th.textMuted, fontSize: 12 }}>{a.desc}</div>
            </button>
          ))}
        </div>

        {/* Tip of the day */}
        <div style={{ background: isDark ? 'rgba(96,165,250,0.08)' : '#eff6ff', border: `1px solid ${isDark ? 'rgba(96,165,250,0.2)' : 'rgba(96,165,250,0.3)'}`, borderRadius: 16, padding: '14px 18px', marginBottom: 32 }}>
          <p style={{ color: isDark ? '#93c5fd' : '#1d4ed8', fontSize: 14, margin: 0, fontWeight: 500 }}>{tip}</p>
        </div>

        {/* Recent games */}
        {allGames.length > 0 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ color: th.textMuted, fontSize: 11, letterSpacing: 2, fontWeight: 700, margin: 0 }}>{t.recentGames}</h3>
              <button onClick={() => switchView('games')} style={{ background: 'transparent', border: 'none', color: th.accent, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>See all →</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...allGames].reverse().slice(0, 5).map(g => {
                const folder = allFolders.find(f => f.id === g.folderId);
                return (
                  <div key={g.id} onClick={() => folder && onSelectFolder(folder.id)}
                    style={{ ...card, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = th.accent + '40'; e.currentTarget.style.transform = 'translateX(3px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = th.cardBorder; e.currentTarget.style.transform = 'none'; }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${folder?.color || '#0ea5e9'}15`, border: `2px solid ${folder?.color || '#0ea5e9'}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{folder?.icon || '🎮'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: th.text, fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.title}</div>
                      <div style={{ color: th.textMuted, fontSize: 12 }}>{g.lessonName} · {g.questions.length}Q</div>
                    </div>
                    <span style={{ background: g.isCompetitive ? 'rgba(226,27,60,0.1)' : 'rgba(19,104,206,0.1)', border: `1px solid ${g.isCompetitive ? '#e21b3c' : '#1368ce'}40`, borderRadius: 8, padding: '3px 10px', fontSize: 11, color: g.isCompetitive ? '#e21b3c' : '#1368ce', fontWeight: 700, flexShrink: 0 }}>
                      {g.isCompetitive ? '⚔️ Live' : '📚 Solo'}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {allGames.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 24px', background: isDark ? 'rgba(255,255,255,0.03)' : '#f0fdf4', border: `2px dashed ${th.cardBorder}`, borderRadius: 24 }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🧪</div>
            <div style={{ color: th.text, fontWeight: 800, fontSize: 18, marginBottom: 6 }}>{t.noGamesYet}</div>
            <div style={{ color: th.textMuted, fontSize: 14, marginBottom: 20 }}>{t.createFirstGame}</div>
            <button onClick={() => switchView('library')} style={{ background: 'linear-gradient(135deg, #f43f5e, #f97316)', color: 'white', border: 'none', borderRadius: 14, padding: '13px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(244,63,94,0.3)' }}>
              {t.openLibrary} →
            </button>
          </div>
        )}
      </div>
    );
  };

  // ── LIBRARY ───────────────────────────────────────────────────────────────
  const LibraryView = () => {
    // Folder detail view
    if (activeFolder) {
      const folderGames = getGamesByFolder(activeFolder.id);
      return (
        <div style={{ padding: '32px 40px', maxWidth: 1000 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
            <button onClick={() => setActiveFolder(null)} style={{ background: th.cardBg, border: `1px solid ${th.cardBorder}`, color: th.text, borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>{t.backToLibrary}</button>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: `${activeFolder.color}20`, border: `2px solid ${activeFolder.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{activeFolder.icon}</div>
            <div>
              <h2 style={{ color: th.text, fontSize: 22, fontWeight: 800, margin: 0 }}>{activeFolder.name}</h2>
              <div style={{ color: th.textMuted, fontSize: 13 }}>{folderGames.length} game{folderGames.length !== 1 ? 's' : ''}</div>
            </div>
            <button onClick={() => onCreateGame(activeFolder.id)}
              style={{ marginLeft: 'auto', background: 'linear-gradient(135deg, #f43f5e, #f97316)', color: 'white', border: 'none', borderRadius: 14, padding: '12px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(244,63,94,0.3)', whiteSpace: 'nowrap' }}>
              {t.createGameInFolder}
            </button>
          </div>

          {folderGames.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', background: isDark ? 'rgba(255,255,255,0.03)' : '#f0fdf4', border: `2px dashed ${th.cardBorder}`, borderRadius: 24 }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>🎮</div>
              <div style={{ color: th.text, fontWeight: 700, fontSize: 16, marginBottom: 6 }}>No games in this folder yet</div>
              <div style={{ color: th.textMuted, fontSize: 14, marginBottom: 20 }}>Click "Create Game" above to add your first game here</div>
              <button onClick={() => onCreateGame(activeFolder.id)} style={{ background: 'linear-gradient(135deg, #f43f5e, #f97316)', color: 'white', border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                ✨ Create First Game
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {folderGames.map(g => (
                <div key={g.id}
                  style={{ ...card, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = activeFolder.color + '50'; e.currentTarget.style.boxShadow = `0 4px 20px ${activeFolder.color}15`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = th.cardBorder; e.currentTarget.style.boxShadow = th.shadow; }}
                  onClick={() => onSelectFolder(activeFolder.id)}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${activeFolder.color}15`, border: `1px solid ${activeFolder.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🎮</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: th.text, fontWeight: 700, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.title}</div>
                    <div style={{ color: th.textMuted, fontSize: 12, marginTop: 2 }}>{g.lessonName} · {g.questions.length} questions · {g.gameType.replace(/-/g, ' ')}</div>
                  </div>
                  <span style={{ background: g.isCompetitive ? 'rgba(226,27,60,0.1)' : 'rgba(19,104,206,0.1)', border: `1px solid ${g.isCompetitive ? '#e21b3c' : '#1368ce'}40`, borderRadius: 8, padding: '4px 12px', fontSize: 12, color: g.isCompetitive ? '#e21b3c' : '#1368ce', fontWeight: 700, flexShrink: 0 }}>
                    {g.isCompetitive ? '⚔️ LIVE' : '📚 SOLO'}
                  </span>
                  <div style={{ color: th.textFaint, fontSize: 18 }}>→</div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Folder grid
    return (
      <div style={{ padding: '32px 40px', maxWidth: 1000 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ color: th.text, fontSize: 24, fontWeight: 900, margin: 0 }}>{t.myLibrary}</h2>
            <p style={{ color: th.textMuted, fontSize: 14, margin: '4px 0 0' }}>{t.libraryDesc}</p>
          </div>
          <button onClick={() => setShowCreate(true)}
            style={{ background: 'linear-gradient(135deg, #f43f5e, #f97316)', color: 'white', border: 'none', borderRadius: 14, padding: '12px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(244,63,94,0.3)', whiteSpace: 'nowrap' }}>
            {t.newFolder}
          </button>
        </div>

        {allFolders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', background: isDark ? 'rgba(255,255,255,0.03)' : '#f0fdf4', border: `2px dashed ${th.cardBorder}`, borderRadius: 28 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📚</div>
            <div style={{ color: th.text, fontWeight: 800, fontSize: 20, marginBottom: 8 }}>{t.noFolders}</div>
            <div style={{ color: th.textMuted, fontSize: 15, marginBottom: 24 }}>{t.createFolderFirst}</div>
            <button onClick={() => setShowCreate(true)} style={{ background: 'linear-gradient(135deg, #f43f5e, #f97316)', color: 'white', border: 'none', borderRadius: 14, padding: '14px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(244,63,94,0.3)' }}>
              {t.newFolder}
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 18 }}>
            {allFolders.map(f => {
              const gameCount = getGamesByFolder(f.id).length;
              return (
                <div key={f.id}
                  style={{ background: th.cardBg, border: `2px solid ${f.color}25`, borderRadius: 22, overflow: 'hidden', transition: 'all 0.25s', boxShadow: th.shadow, cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 36px ${f.color}25`; e.currentTarget.style.borderColor = `${f.color}60`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = th.shadow; e.currentTarget.style.borderColor = `${f.color}25`; }}>
                  <div style={{ height: 6, background: `linear-gradient(90deg, ${f.color}, ${f.color}99)` }} />
                  <div style={{ padding: '20px 18px 14px' }} onClick={() => setActiveFolder(f)}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>{f.icon}</div>
                    {renamingId === f.id ? (
                      <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 6 }}>
                        <input autoFocus value={renameVal} onChange={e => setRenameVal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleRename(f.id); if (e.key === 'Escape') setRenamingId(null); }}
                          style={{ flex: 1, background: th.inputBg, border: `1px solid ${th.inputBorder}`, borderRadius: 8, padding: '6px 10px', color: th.text, fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
                        <button onClick={() => handleRename(f.id)} style={{ background: '#22c55e', border: 'none', borderRadius: 8, padding: '6px 10px', color: 'white', cursor: 'pointer', fontSize: 14 }}>✓</button>
                      </div>
                    ) : (
                      <div style={{ color: th.text, fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{f.name}</div>
                    )}
                    <div style={{ color: th.textMuted, fontSize: 13, marginBottom: 14 }}>{gameCount} game{gameCount !== 1 ? 's' : ''}</div>
                    <div style={{ background: `${f.color}15`, border: `1px solid ${f.color}35`, borderRadius: 10, padding: '8px 12px', color: f.color, fontSize: 13, fontWeight: 700, textAlign: 'center', transition: 'all 0.15s' }}>
                      {t.openFolder}
                    </div>
                  </div>
                  <div style={{ padding: '0 14px 14px', display: 'flex', gap: 8 }}>
                    <button onClick={e => { e.stopPropagation(); setRenamingId(f.id); setRenameVal(f.name); }} style={{ flex: 1, background: th.badge, border: `1px solid ${th.cardBorder}`, color: th.textMuted, borderRadius: 8, padding: '7px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>✏️ Rename</button>
                    <button onClick={e => { e.stopPropagation(); handleDelete(f.id); }} style={{ background: th.danger, border: `1px solid ${th.dangerText}30`, color: th.dangerText, borderRadius: 8, padding: '7px 10px', cursor: 'pointer', fontSize: 13 }}>🗑</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ── ALL GAMES ─────────────────────────────────────────────────────────────
  const AllGamesView = () => {
    const allGames = getGames();
    const filtered = allGames.filter(g =>
      g.title.toLowerCase().includes(gameSearch.toLowerCase()) ||
      g.lessonName.toLowerCase().includes(gameSearch.toLowerCase())
    );

    const handleCreateFromAllGames = () => {
      onCreateGame('');
    };

    return (
      <div style={{ padding: '32px 40px', maxWidth: 1000 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ color: th.text, fontSize: 24, fontWeight: 900, margin: 0 }}>{t.allGamesTitle}</h2>
            <p style={{ color: th.textMuted, fontSize: 14, margin: '4px 0 0' }}>{allGames.length} {t.games}</p>
          </div>
          <button onClick={handleCreateFromAllGames}
            style={{ background: 'linear-gradient(135deg, #f43f5e, #f97316)', color: 'white', border: 'none', borderRadius: 14, padding: '12px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(244,63,94,0.3)', whiteSpace: 'nowrap' }}>
            {t.createNewGame}
          </button>
        </div>

        <input value={gameSearch} onChange={e => setGameSearch(e.target.value)}
          placeholder={t.searchGames}
          style={{ ...inp, marginBottom: 20, fontSize: 15, padding: '13px 18px' }} />

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: th.textFaint }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎮</div>
            {allGames.length === 0 ? (
              <>
                <div style={{ color: th.text, fontWeight: 700, fontSize: 16, marginBottom: 8 }}>No games yet</div>
                <div style={{ color: th.textMuted, fontSize: 14, marginBottom: 20 }}>Create a folder in your Library first, then add games</div>
                <button onClick={() => switchView('library')} style={{ background: 'linear-gradient(135deg, #f43f5e, #f97316)', color: 'white', border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Go to Library →</button>
              </>
            ) : 'No games match your search'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(g => {
              const folder = allFolders.find(f => f.id === g.folderId);
              return (
                <div key={g.id} onClick={() => folder && onSelectFolder(folder.id)}
                  style={{ ...card, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = th.accent + '40'; e.currentTarget.style.boxShadow = `0 4px 20px ${th.accent}12`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = th.cardBorder; e.currentTarget.style.boxShadow = th.shadow; }}>
                  <div style={{ width: 46, height: 46, borderRadius: 13, background: `${folder?.color || '#0ea5e9'}15`, border: `2px solid ${folder?.color || '#0ea5e9'}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{folder?.icon || '🎮'}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: th.text, fontWeight: 700, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.title}</div>
                    <div style={{ color: th.textMuted, fontSize: 12, marginTop: 2 }}>
                      {g.lessonName} · {g.questions.length} questions ·
                      <span style={{ color: folder?.color || th.accent, marginLeft: 4 }}>{folder?.name || 'No folder'}</span>
                    </div>
                  </div>
                  <span style={{ background: g.isCompetitive ? 'rgba(226,27,60,0.1)' : 'rgba(19,104,206,0.1)', border: `1px solid ${g.isCompetitive ? '#e21b3c' : '#1368ce'}40`, borderRadius: 8, padding: '4px 12px', fontSize: 12, color: g.isCompetitive ? '#e21b3c' : '#1368ce', fontWeight: 700, flexShrink: 0 }}>
                    {g.isCompetitive ? '⚔️ LIVE' : '📚 SOLO'}
                  </span>
                  <div style={{ color: th.textFaint, fontSize: 18 }}>→</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ── RESULTS ───────────────────────────────────────────────────────────────
  const ResultsView = () => {
    const results = getResults();
    return (
      <div style={{ padding: '32px 40px', maxWidth: 900 }}>
        <h2 style={{ color: th.text, fontSize: 24, fontWeight: 900, marginBottom: 4 }}>📊 {t.results}</h2>
        <p style={{ color: th.textMuted, fontSize: 14, marginBottom: 28 }}>{results.length} sessions recorded</p>
        {results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>📊</div>
            <div style={{ color: th.text, fontWeight: 700, fontSize: 16, marginBottom: 6 }}>No results yet</div>
            <div style={{ color: th.textMuted }}>Play some games to see results here</div>
          </div>
        ) : [...results].reverse().map(r => (
          <div key={r.id} style={{ ...card, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: r.leaderboard.length > 1 ? 12 : 0 }}>
              <div>
                <div style={{ color: th.text, fontWeight: 700, fontSize: 16 }}>{r.gameTitle}</div>
                <div style={{ color: th.textMuted, fontSize: 12, marginTop: 3 }}>
                  {new Date(r.playedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} · {r.leaderboard.length} players · {r.sessionType === 'live' ? '⚔️ Live' : '📚 Solo'}
                </div>
              </div>
              {r.leaderboard[0] && <div style={{ textAlign: 'right' }}><div style={{ color: '#f59e0b', fontSize: 11, fontWeight: 700 }}>🥇 WINNER</div><div style={{ color: th.text, fontWeight: 700 }}>{r.leaderboard[0].nickname}</div><div style={{ color: '#f59e0b', fontWeight: 900, fontSize: 18 }}>{r.leaderboard[0].score}pts</div></div>}
            </div>
            {r.leaderboard.length > 1 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {r.leaderboard.slice(0, 5).map((e, i) => (
                  <div key={e.nickname} style={{ background: th.badge, borderRadius: 8, padding: '5px 10px', fontSize: 12 }}>
                    <span style={{ color: th.textFaint }}>{i + 1}. </span>
                    <span style={{ color: th.text, fontWeight: 600 }}>{e.nickname}</span>
                    <span style={{ color: th.accent, marginLeft: 6, fontWeight: 700 }}>{e.score}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // ── TEST BANK ─────────────────────────────────────────────────────────────
  const TestBankView = () => (
    <div style={{ padding: '32px 40px', maxWidth: 900 }}>
      <h2 style={{ color: th.text, fontSize: 24, fontWeight: 900, marginBottom: 4 }}>🏦 {t.testBank}</h2>
      <p style={{ color: th.textMuted, fontSize: 14, marginBottom: 32 }}>Official question banks + your custom library</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
        {[
          { title: 'Grade 12 Chem · S1', subtitle: 'Official First Semester Bank', icon: '⚗️', color: '#0ea5e9', action: () => onNavigate('test-bank', { testBankSemester: 's1' }) },
          { title: 'Grade 12 Chem · S2', subtitle: 'Official Second Semester Bank', icon: '🧪', color: '#7dd3fc', action: () => onNavigate('test-bank', { testBankSemester: 's2' }) },
          { title: 'My Question Bank', subtitle: 'Custom topics & questions', icon: '📝', color: '#34d399', action: () => onNavigate('custom-bank' as any) },
        ].map(tb => (
          <button key={tb.title} onClick={tb.action}
            style={{ background: isDark ? `${tb.color}08` : `${tb.color}10`, border: `2px solid ${tb.color}30`, borderRadius: 22, padding: '28px 22px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = `${tb.color}20`; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 10px 32px ${tb.color}25`; }}
            onMouseLeave={e => { e.currentTarget.style.background = isDark ? `${tb.color}08` : `${tb.color}10`; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>{tb.icon}</div>
            <div style={{ color: th.text, fontWeight: 800, fontSize: 17, marginBottom: 4 }}>{tb.title}</div>
            <div style={{ color: tb.color, fontSize: 13, marginBottom: 14 }}>{tb.subtitle}</div>
            <span style={{ background: `${tb.color}20`, border: `1px solid ${tb.color}40`, borderRadius: 8, padding: '4px 12px', color: tb.color, fontSize: 12, fontWeight: 700 }}>Open →</span>
          </button>
        ))}
      </div>
    </div>
  );

  // ── Create Folder modal ───────────────────────────────────────────────────
  const CreateFolderModal = () => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 24 }}>
      <div style={{ background: th.modalBg, border: `1px solid ${th.cardBorder}`, borderRadius: 24, padding: 32, maxWidth: 460, width: '100%', boxShadow: th.shadow }}>
        <h3 style={{ color: th.text, fontWeight: 800, fontSize: 18, marginBottom: 6 }}>{t.createFolder}</h3>
        <p style={{ color: th.textMuted, fontSize: 14, marginBottom: 20 }}>{t.libraryDesc}</p>
        <input value={newName} onChange={e => setNewName(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
          placeholder={t.folderName} style={{ ...inp, marginBottom: 18, fontSize: 15 }} />
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: th.textMuted, fontSize: 12, fontWeight: 600, marginBottom: 10 }}>{t.icon}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {FOLDER_ICONS.map(ic => <button key={ic} onClick={() => setNewIcon(ic)} style={{ width: 40, height: 40, fontSize: 20, background: newIcon === ic ? th.accentLight : th.badge, border: newIcon === ic ? `2px solid ${th.accent}` : `1px solid ${th.cardBorder}`, borderRadius: 10, cursor: 'pointer' }}>{ic}</button>)}
          </div>
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ color: th.textMuted, fontSize: 12, fontWeight: 600, marginBottom: 10 }}>{t.color}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {FOLDER_COLORS.map(c => <button key={c} onClick={() => setNewColor(c)} style={{ width: 30, height: 30, borderRadius: '50%', background: c, border: newColor === c ? '3px solid white' : '2px solid transparent', cursor: 'pointer', boxShadow: newColor === c ? `0 0 0 2px ${th.accent}` : 'none' }} />)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => { setShowCreate(false); setNewName(''); }} style={{ flex: 1, background: th.badge, border: `1px solid ${th.cardBorder}`, color: th.textMuted, borderRadius: 12, padding: '12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15 }}>{t.cancel}</button>
          <button onClick={handleCreateFolder} disabled={!newName.trim()} style={{ flex: 2, background: newName.trim() ? 'linear-gradient(135deg, #f43f5e, #f97316)' : th.badge, color: newName.trim() ? 'white' : th.textFaint, border: 'none', borderRadius: 12, padding: '12px', fontSize: 15, fontWeight: 700, cursor: newName.trim() ? 'pointer' : 'default', fontFamily: 'inherit' }}>
            {t.createFolderBtn}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, overflowY: 'auto', minHeight: '100vh' }}>
        {view === 'home'     && <HomeView />}
        {view === 'library'  && <LibraryView />}
        {view === 'games'    && <AllGamesView />}
        {view === 'results'  && <ResultsView />}
        {view === 'testbank' && <TestBankView />}
      </div>

      {showCreate && <CreateFolderModal />}
    </div>
  );
}
