import { useState, useEffect } from 'react';
import type { Folder, Page, User } from '../types';
import type { Theme } from '../theme';
import { getTheme } from '../theme';
import { getFolders, saveFolder, deleteFolder, getGamesByFolder, getGames, getResults } from '../storage';
import { setCurrentUser } from '../users';

interface Props {
  user: User;
  theme: Theme;
  onThemeToggle: () => void;
  onNavigate: (page: Page, extra?: Partial<Record<string, unknown>>) => void;
  onSelectFolder: (id: string) => void;
  onCreateGame: (folderId: string) => void;
  onLogout: () => void;
}

const GRADES = [
  { id: 'grade10',     label: 'Grade 10',            icon: '🔟', color: '#7dd3fc', bg: 'rgba(125,211,252,0.12)', border: 'rgba(125,211,252,0.35)' },
  { id: 'grade11',     label: 'Grade 11',            icon: '1️⃣1️⃣', color: '#6ee7b7', bg: 'rgba(110,231,183,0.12)', border: 'rgba(110,231,183,0.35)' },
  { id: 'grade12chem', label: 'Grade 12 Chemistry',  icon: '⚗️',  color: '#c084fc', bg: 'rgba(192,132,252,0.12)', border: 'rgba(192,132,252,0.35)' },
  { id: 'grade12sci',  label: 'Grade 12 Science',    icon: '🔬',  color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.35)'  },
] as const;

const SEMESTERS = [
  { id: 's1', label: 'First Semester',  icon: '📗', color: '#6ee7b7' },
  { id: 's2', label: 'Second Semester', icon: '📘', color: '#7dd3fc' },
] as const;

type GradeId = (typeof GRADES)[number]['id'];
type SemId   = (typeof SEMESTERS)[number]['id'];
type SidebarView = 'home' | 'grades' | 'games' | 'results' | 'testbank';

const FOLDER_COLORS = ['#c084fc','#7dd3fc','#fde68a','#6ee7b7','#fca5a5','#a78bfa','#ff6eb4','#34d399','#fb923c','#60a5fa'];
const FOLDER_ICONS  = ['📁','🧪','⚗️','🔬','🧬','⚖️','🔥','🧫','⚡','🌡️','💊','🧲','📝','🎯','💡'];

const NAV: { id: SidebarView; icon: string; label: string }[] = [
  { id: 'home',     icon: '🏠', label: 'Home' },
  { id: 'grades',   icon: '📁', label: 'Grades & Folders' },
  { id: 'games',    icon: '🎮', label: 'All Games' },
  { id: 'results',  icon: '📊', label: 'Results' },
  { id: 'testbank', icon: '🏦', label: 'Test Bank' },
];

export default function DashboardPage({ user, theme, onThemeToggle, onNavigate, onSelectFolder, onCreateGame, onLogout }: Props) {
  const th = getTheme(theme);
  const [view, setView] = useState<SidebarView>('home');
  const [activeGrade, setActiveGrade] = useState<GradeId | null>(null);
  const [activeSem, setActiveSem]     = useState<SemId | null>(null);
  const [folders, setFolders]         = useState<Folder[]>([]);
  const [showCreate, setShowCreate]   = useState(false);
  const [newName, setNewName]         = useState('');
  const [newIcon, setNewIcon]         = useState('📁');
  const [newColor, setNewColor]       = useState(FOLDER_COLORS[0]);
  const [renamingId, setRenamingId]   = useState<string | null>(null);
  const [renameVal, setRenameVal]     = useState('');
  const [gameSearch, setGameSearch]   = useState('');

  const loadFolders = () => {
    if (!activeGrade || !activeSem) return;
    setFolders(getFolders().filter(f => f.gradeId === activeGrade && f.semesterId === activeSem));
  };
  useEffect(() => { loadFolders(); }, [activeGrade, activeSem]);

  const grade = GRADES.find(g => g.id === activeGrade);
  const sem   = SEMESTERS.find(s => s.id === activeSem);

  const ensureDefaultFolder = (): string => {
    const defId = `sys_${activeGrade}_${activeSem}`;
    if (!getFolders().find(f => f.id === defId)) {
      saveFolder({ id: defId, name: `${grade!.label} — ${sem!.label}`, color: grade!.color, icon: grade!.icon, createdAt: new Date().toISOString(), gradeId: activeGrade!, semesterId: activeSem! });
      loadFolders();
    }
    return defId;
  };

  const handleCreateFolder = () => {
    if (!newName.trim() || !activeGrade || !activeSem) return;
    saveFolder({ id: crypto.randomUUID(), name: newName.trim(), color: newColor, icon: newIcon, createdAt: new Date().toISOString(), gradeId: activeGrade, semesterId: activeSem });
    setNewName(''); setShowCreate(false); loadFolders();
  };

  const handleRename = (id: string) => {
    const f = getFolders().find(x => x.id === id);
    if (!f || !renameVal.trim()) return;
    saveFolder({ ...f, name: renameVal.trim() }); setRenamingId(null); loadFolders();
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this folder and all its games?')) return;
    deleteFolder(id); loadFolders();
  };

  const handleLogout = () => { setCurrentUser(null); onLogout(); };
  const switchView = (v: SidebarView) => { setView(v); if (v !== 'grades') { setActiveGrade(null); setActiveSem(null); } };

  // ── Shared styles ─────────────────────────────────────────────────────────
  const card: React.CSSProperties = { background: th.cardBg, border: `1px solid ${th.cardBorder}`, borderRadius: 20, padding: '22px 24px', boxShadow: th.shadow };
  const inp: React.CSSProperties = { width: '100%', background: th.inputBg, border: `1.5px solid ${th.inputBorder}`, borderRadius: 12, padding: '12px 16px', color: th.text, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };

  // ── Sidebar ───────────────────────────────────────────────────────────────
  const Sidebar = () => (
    <div style={{ width: 250, minHeight: '100vh', background: th.sidebarBg, borderRight: `1px solid ${th.sidebarBorder}`, display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', boxShadow: theme === 'light' ? '2px 0 20px rgba(0,0,0,0.06)' : 'none' }}>
      {/* Brand */}
      <div style={{ padding: '22px 18px 18px', borderBottom: `1px solid ${th.divider}` }}>
        <div style={{ fontSize: 28, marginBottom: 6 }}>⚗️</div>
        <div style={{ color: th.text, fontWeight: 900, fontSize: 15 }}>Chemistry Games Hub</div>
        <div style={{ color: th.textMuted, fontSize: 11, marginTop: 2 }}>Teacher Platform</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {NAV.map(item => {
          const active = view === item.id;
          return (
            <button key={item.id} onClick={() => switchView(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: 11,
              background: active ? th.accentLight : 'transparent',
              border: active ? `1px solid ${th.accent}40` : '1px solid transparent',
              borderRadius: 12, padding: '11px 14px',
              color: active ? th.accent : th.textMuted,
              cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: active ? 700 : 400,
              width: '100%', textAlign: 'left', transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: 17 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {active && <div style={{ width: 6, height: 6, borderRadius: '50%', background: th.accent, flexShrink: 0 }} />}
            </button>
          );
        })}

        <div style={{ margin: '8px 4px', borderTop: `1px solid ${th.divider}` }} />

        {user.role === 'admin' && (
          <button onClick={() => onNavigate('admin-panel' as any)} style={{ display: 'flex', alignItems: 'center', gap: 11, background: 'transparent', border: '1px solid transparent', borderRadius: 12, padding: '11px 14px', color: th.warningText, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, width: '100%', textAlign: 'left' }}>
            <span style={{ fontSize: 17 }}>👑</span> Admin Panel
          </button>
        )}

        {/* Theme toggle */}
        <button onClick={onThemeToggle} style={{ display: 'flex', alignItems: 'center', gap: 11, background: th.badge, border: `1px solid ${th.cardBorder}`, borderRadius: 12, padding: '11px 14px', color: th.textMuted, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, width: '100%', textAlign: 'left' }}>
          <span style={{ fontSize: 17 }}>{theme === 'dark' ? '☀️' : '🌙'}</span>
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
      </nav>

      {/* User */}
      <div style={{ padding: '14px 12px', borderTop: `1px solid ${th.divider}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #c084fc, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: 14, flexShrink: 0 }}>
            {user.displayName[0].toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden', minWidth: 0 }}>
            <div style={{ color: th.text, fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.displayName}</div>
            <div style={{ color: th.textMuted, fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{ width: '100%', background: th.danger, border: `1px solid ${th.dangerText}30`, color: th.dangerText, borderRadius: 10, padding: '8px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600 }}>
          🔒 Log Out
        </button>
      </div>
    </div>
  );

  // ── HOME ──────────────────────────────────────────────────────────────────
  const HomeView = () => {
    const allGames = getGames();
    const allFolders = getFolders();
    const allResults = getResults();
    return (
      <div style={{ padding: '32px 36px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, background: 'linear-gradient(135deg, #f093fb, #a78bfa, #7dd3fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 4px' }}>
          Welcome back, {user.displayName.split(' ')[0]}! 👋
        </h1>
        <p style={{ color: th.textMuted, fontSize: 14, marginBottom: 32 }}>Ready to make chemistry fun today?</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginBottom: 36 }}>
          {[
            { icon: '🎮', label: 'Games', value: allGames.length, color: '#c084fc' },
            { icon: '📁', label: 'Folders', value: allFolders.length, color: '#7dd3fc' },
            { icon: '📊', label: 'Sessions', value: allResults.length, color: '#6ee7b7' },
            { icon: '👥', label: 'Live games', value: allResults.filter(r => r.sessionType === 'live').length, color: '#fbbf24' },
          ].map(s => (
            <div key={s.label} style={{ ...card, borderTop: `3px solid ${s.color}` }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ color: s.color, fontSize: 30, fontWeight: 900 }}>{s.value}</div>
              <div style={{ color: th.textMuted, fontSize: 13, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <h3 style={{ color: th.textMuted, fontSize: 11, letterSpacing: 2, fontWeight: 700, marginBottom: 12 }}>QUICK ACTIONS</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))', gap: 12, marginBottom: 36 }}>
          {[
            { icon: '📁', label: 'Browse Grades', desc: 'Open a grade & semester', color: '#7dd3fc', action: () => switchView('grades') },
            { icon: '🎮', label: 'All Games', desc: 'Search across everything', color: '#c084fc', action: () => switchView('games') },
            { icon: '🏦', label: 'Test Bank', desc: 'Generate from bank', color: '#fbbf24', action: () => switchView('testbank') },
            { icon: '📊', label: 'Results', desc: 'View session history', color: '#6ee7b7', action: () => switchView('results') },
          ].map(a => (
            <button key={a.label} onClick={a.action} style={{ background: theme === 'dark' ? `${a.color}10` : `${a.color}15`, border: `1px solid ${a.color}30`, borderRadius: 16, padding: '18px 16px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 20px ${a.color}25`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>{a.icon}</div>
              <div style={{ color: th.text, fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{a.label}</div>
              <div style={{ color: th.textMuted, fontSize: 12 }}>{a.desc}</div>
            </button>
          ))}
        </div>

        {allGames.length > 0 && (
          <>
            <h3 style={{ color: th.textMuted, fontSize: 11, letterSpacing: 2, fontWeight: 700, marginBottom: 12 }}>RECENT GAMES</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...allGames].reverse().slice(0, 5).map(g => {
                const folder = getFolders().find(f => f.id === g.folderId);
                return (
                  <div key={g.id} onClick={() => folder && onSelectFolder(folder.id)}
                    style={{ ...card, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = th.rowHover; e.currentTarget.style.borderColor = th.accent + '30'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = th.cardBg; e.currentTarget.style.borderColor = th.cardBorder; }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: `${folder?.color || '#c084fc'}15`, border: `1px solid ${folder?.color || '#c084fc'}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{folder?.icon || '🎮'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: th.text, fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.title}</div>
                      <div style={{ color: th.textMuted, fontSize: 12 }}>{g.lessonName} · {g.questions.length} questions</div>
                    </div>
                    <span style={{ background: g.isCompetitive ? 'rgba(226,27,60,0.12)' : 'rgba(19,104,206,0.12)', border: `1px solid ${g.isCompetitive ? '#e21b3c' : '#1368ce'}40`, borderRadius: 8, padding: '3px 10px', fontSize: 11, color: g.isCompetitive ? '#e21b3c' : '#1368ce', fontWeight: 700, flexShrink: 0 }}>
                      {g.isCompetitive ? '⚔️ Live' : '📚 Solo'}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
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
    return (
      <div style={{ padding: '32px 36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ color: th.text, fontSize: 22, fontWeight: 800, margin: 0 }}>🎮 All Games</h2>
            <p style={{ color: th.textMuted, fontSize: 14, margin: '4px 0 0' }}>{allGames.length} games across all grades</p>
          </div>
          <button onClick={() => { switchView('grades'); }} style={{ background: 'linear-gradient(135deg, #c084fc, #a78bfa)', color: 'white', border: 'none', borderRadius: 14, padding: '12px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(192,132,252,0.35)', whiteSpace: 'nowrap' }}>
            ✨ Create New Game
          </button>
        </div>

        <input value={gameSearch} onChange={e => setGameSearch(e.target.value)}
          placeholder="🔍 Search by title or lesson name..."
          style={{ ...inp, marginBottom: 20, fontSize: 15, padding: '13px 18px' }} />

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: th.textFaint }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎮</div>
            {allGames.length === 0 ? (
              <>
                <div style={{ color: th.text, fontWeight: 700, fontSize: 16, marginBottom: 8 }}>No games yet!</div>
                <div style={{ color: th.textMuted, fontSize: 14, marginBottom: 20 }}>Go to Grades & Folders to create your first game</div>
                <button onClick={() => switchView('grades')} style={{ background: 'linear-gradient(135deg, #c084fc, #a78bfa)', color: 'white', border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Browse Grades →</button>
              </>
            ) : 'No games match your search'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(g => {
              const folder = getFolders().find(f => f.id === g.folderId);
              return (
                <div key={g.id} onClick={() => folder && onSelectFolder(folder.id)}
                  style={{ ...card, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = th.accent + '40'; e.currentTarget.style.boxShadow = `0 4px 20px ${th.accent}15`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = th.cardBorder; e.currentTarget.style.boxShadow = th.shadow; }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: `${folder?.color || '#c084fc'}15`, border: `1px solid ${folder?.color || '#c084fc'}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{folder?.icon || '🎮'}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: th.text, fontWeight: 700, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.title}</div>
                    <div style={{ color: th.textMuted, fontSize: 12, marginTop: 2 }}>{g.lessonName} · {g.questions.length} questions · {g.gameType.replace(/-/g, ' ')}</div>
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
      <div style={{ padding: '32px 36px' }}>
        <h2 style={{ color: th.text, fontSize: 22, fontWeight: 800, marginBottom: 4 }}>📊 Results</h2>
        <p style={{ color: th.textMuted, fontSize: 14, marginBottom: 28 }}>{results.length} sessions recorded</p>
        {results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: th.textFaint }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
            <div style={{ color: th.text, fontWeight: 700, fontSize: 16, marginBottom: 6 }}>No results yet</div>
            <div style={{ color: th.textMuted }}>Play some games first!</div>
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
              {r.leaderboard[0] && <div style={{ textAlign: 'right' }}><div style={{ color: '#fbbf24', fontSize: 11, fontWeight: 700 }}>🥇 WINNER</div><div style={{ color: th.text, fontWeight: 700 }}>{r.leaderboard[0].nickname}</div><div style={{ color: '#fbbf24', fontWeight: 900, fontSize: 18 }}>{r.leaderboard[0].score}pts</div></div>}
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
    <div style={{ padding: '32px 36px' }}>
      <h2 style={{ color: th.text, fontSize: 22, fontWeight: 800, marginBottom: 4 }}>🏦 Test Bank</h2>
      <p style={{ color: th.textMuted, fontSize: 14, marginBottom: 32 }}>Official question bank + your own custom questions</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
        {[
          { title: 'Grade 12 Chem · S1', subtitle: 'Official First Semester Bank', icon: '⚗️', color: '#c084fc', sem: 's1' as const },
          { title: 'Grade 12 Chem · S2', subtitle: 'Official Second Semester Bank', icon: '🧪', color: '#7dd3fc', sem: 's2' as const },
          { title: 'My Question Bank', subtitle: 'Your custom topics & questions', icon: '📝', color: '#6ee7b7', sem: null },
        ].map(tb => (
          <button key={tb.title} onClick={() => onNavigate(tb.sem !== null ? 'test-bank' : 'custom-bank' as any, tb.sem !== null ? { testBankSemester: tb.sem } : {})}
            style={{ background: theme === 'dark' ? `${tb.color}10` : `${tb.color}12`, border: `2px solid ${tb.color}35`, borderRadius: 22, padding: '28px 24px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = `${tb.color}20`; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 30px ${tb.color}25`; }}
            onMouseLeave={e => { e.currentTarget.style.background = theme === 'dark' ? `${tb.color}10` : `${tb.color}12`; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>{tb.icon}</div>
            <div style={{ color: th.text, fontWeight: 800, fontSize: 17, marginBottom: 4 }}>{tb.title}</div>
            <div style={{ color: tb.color, fontSize: 13, marginBottom: 14 }}>{tb.subtitle}</div>
            <span style={{ background: `${tb.color}20`, border: `1px solid ${tb.color}40`, borderRadius: 8, padding: '4px 12px', color: tb.color, fontSize: 12, fontWeight: 700 }}>Open →</span>
          </button>
        ))}
      </div>
      <div style={{ marginTop: 20, background: th.warning, border: `1px solid ${th.warningText}40`, borderRadius: 14, padding: '14px 18px' }}>
        <p style={{ color: th.warningText, fontSize: 13, margin: 0 }}>💡 <strong>Tip:</strong> Use "My Question Bank" to build your own library of questions organized by topic — then generate game sets from them instantly.</p>
      </div>
    </div>
  );

  // ── GRADES ────────────────────────────────────────────────────────────────
  const GradesView = () => {
    if (!activeGrade) return (
      <div style={{ padding: '32px 36px' }}>
        <h2 style={{ color: th.text, fontSize: 22, fontWeight: 800, marginBottom: 4 }}>📁 Grades & Folders</h2>
        <p style={{ color: th.textMuted, fontSize: 14, marginBottom: 28 }}>Choose a grade to open its workspace</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 18 }}>
          {GRADES.map(g => (
            <button key={g.id} onClick={() => setActiveGrade(g.id)}
              style={{ background: theme === 'dark' ? g.bg : `${g.color}08`, border: `2px solid ${g.border}`, borderRadius: 24, padding: '28px 24px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.25s', display: 'flex', flexDirection: 'column', gap: 10 }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 40px ${g.color}25`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              <span style={{ fontSize: 48 }}>{g.icon}</span>
              <div>
                <div style={{ color: th.text, fontWeight: 800, fontSize: 20 }}>{g.label}</div>
                <div style={{ color: g.color, fontSize: 13, marginTop: 4 }}>2 Semesters →</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );

    if (!activeSem) return (
      <div style={{ padding: '32px 36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <button onClick={() => setActiveGrade(null)} style={{ background: th.cardBg, border: `1px solid ${th.cardBorder}`, color: th.text, borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>← Grades</button>
          <h2 style={{ color: th.text, fontSize: 22, fontWeight: 800, margin: 0 }}>{grade?.icon} {grade?.label}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18, maxWidth: 520 }}>
          {SEMESTERS.map(s => (
            <button key={s.id} onClick={() => setActiveSem(s.id)}
              style={{ background: th.cardBg, border: `2px solid ${grade!.border}`, borderRadius: 24, padding: '32px 24px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center', transition: 'all 0.25s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, boxShadow: th.shadow }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 40px ${grade!.color}25`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = th.shadow; }}>
              <span style={{ fontSize: 48 }}>{s.icon}</span>
              <div style={{ color: th.text, fontWeight: 800, fontSize: 17 }}>{s.label}</div>
              {activeGrade === 'grade12chem' && (
                <span style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.4)', borderRadius: 100, padding: '3px 10px', fontSize: 11, color: '#d97706', fontWeight: 700 }}>🏦 Test Bank</span>
              )}
            </button>
          ))}
        </div>
      </div>
    );

    return (
      <div style={{ padding: '32px 36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <button onClick={() => setActiveSem(null)} style={{ background: th.cardBg, border: `1px solid ${th.cardBorder}`, color: th.text, borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>← {grade?.label}</button>
          <h2 style={{ color: th.text, fontSize: 20, fontWeight: 800, margin: 0 }}>{grade?.icon} {grade?.label} — {sem?.label}</h2>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
          <button onClick={() => { const fid = ensureDefaultFolder(); onCreateGame(fid); }}
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', border: 'none', borderRadius: 12, padding: '12px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(34,197,94,0.3)' }}>
            ✨ Create Game
          </button>
          <button onClick={() => setShowCreate(true)}
            style={{ background: th.accentLight, border: `2px solid ${th.accent}40`, color: th.accent, borderRadius: 12, padding: '12px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            📁 New Folder
          </button>
          {activeGrade === 'grade12chem' && (
            <button onClick={() => onNavigate('test-bank', { testBankSemester: activeSem })}
              style={{ background: th.warning, border: `2px solid ${th.warningText}40`, color: th.warningText, borderRadius: 12, padding: '12px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              🏦 Generate from Test Bank
            </button>
          )}
        </div>

        {folders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: th.cardBg, border: `2px dashed ${th.cardBorder}`, borderRadius: 24 }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>📁</div>
            <div style={{ color: th.text, fontWeight: 700, fontSize: 16, marginBottom: 6 }}>No folders yet</div>
            <div style={{ color: th.textMuted, fontSize: 14 }}>Click "Create Game" to start, or "New Folder" to organise by topic</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 18 }}>
            {folders.map(f => {
              const gameCount = getGamesByFolder(f.id).length;
              return (
                <div key={f.id} style={{ background: th.cardBg, border: `1px solid ${f.color}25`, borderRadius: 20, overflow: 'hidden', transition: 'all 0.25s', boxShadow: th.shadow }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 30px ${f.color}20`; e.currentTarget.style.borderColor = `${f.color}55`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = th.shadow; e.currentTarget.style.borderColor = `${f.color}25`; }}>
                  <div style={{ height: 5, background: f.color }} />
                  <div style={{ padding: '18px 16px', cursor: 'pointer' }} onClick={() => onSelectFolder(f.id)}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>{f.icon}</div>
                    {renamingId === f.id ? (
                      <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 6 }}>
                        <input autoFocus value={renameVal} onChange={e => setRenameVal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleRename(f.id); if (e.key === 'Escape') setRenamingId(null); }}
                          style={{ flex: 1, background: th.inputBg, border: `1px solid ${th.inputBorder}`, borderRadius: 8, padding: '6px 10px', color: th.text, fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
                        <button onClick={() => handleRename(f.id)} style={{ background: '#22c55e', border: 'none', borderRadius: 8, padding: '6px 10px', color: 'white', cursor: 'pointer', fontSize: 14 }}>✓</button>
                      </div>
                    ) : (
                      <div style={{ color: th.text, fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{f.name}</div>
                    )}
                    <div style={{ color: th.textMuted, fontSize: 13 }}>{gameCount} game{gameCount !== 1 ? 's' : ''}</div>
                  </div>
                  <div style={{ padding: '0 12px 12px', display: 'flex', gap: 8 }}>
                    <button onClick={() => { setRenamingId(f.id); setRenameVal(f.name); }} style={{ flex: 1, background: th.badge, border: `1px solid ${th.cardBorder}`, color: th.textMuted, borderRadius: 8, padding: '7px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>✏️ Rename</button>
                    <button onClick={() => handleDelete(f.id)} style={{ background: th.danger, border: `1px solid ${th.dangerText}30`, color: th.dangerText, borderRadius: 8, padding: '7px 10px', cursor: 'pointer', fontSize: 13 }}>🗑</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, overflowY: 'auto', minHeight: '100vh', background: th.appBg === 'f3f0ff' ? th.appBg : undefined }}>
        {view === 'home'     && <HomeView />}
        {view === 'grades'   && <GradesView />}
        {view === 'games'    && <AllGamesView />}
        {view === 'results'  && <ResultsView />}
        {view === 'testbank' && <TestBankView />}
      </div>

      {/* Create Folder modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 24 }}>
          <div style={{ background: th.modalBg, border: `1px solid ${th.cardBorder}`, borderRadius: 24, padding: 32, maxWidth: 440, width: '100%', boxShadow: th.shadow }}>
            <h3 style={{ color: th.text, fontWeight: 800, fontSize: 18, marginBottom: 20 }}>📁 New Folder</h3>
            <input value={newName} onChange={e => setNewName(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
              placeholder="Folder name (e.g. Organic Chemistry)" style={{ ...inp, marginBottom: 20, fontSize: 15 }} />
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: th.textMuted, fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Icon</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {FOLDER_ICONS.map(ic => (
                  <button key={ic} onClick={() => setNewIcon(ic)} style={{ width: 40, height: 40, fontSize: 20, background: newIcon === ic ? th.accentLight : th.badge, border: newIcon === ic ? `2px solid ${th.accent}` : `1px solid ${th.cardBorder}`, borderRadius: 10, cursor: 'pointer' }}>{ic}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: th.textMuted, fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Color</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {FOLDER_COLORS.map(c => (
                  <button key={c} onClick={() => setNewColor(c)} style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: newColor === c ? '3px solid white' : '2px solid transparent', cursor: 'pointer', boxShadow: newColor === c ? `0 0 0 2px ${th.accent}` : 'none' }} />
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setShowCreate(false); setNewName(''); }} style={{ flex: 1, background: th.badge, border: `1px solid ${th.cardBorder}`, color: th.textMuted, borderRadius: 12, padding: '12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15 }}>Cancel</button>
              <button onClick={handleCreateFolder} disabled={!newName.trim()} style={{ flex: 2, background: newName.trim() ? 'linear-gradient(135deg, #c084fc, #a78bfa)' : th.badge, color: newName.trim() ? 'white' : th.textFaint, border: 'none', borderRadius: 12, padding: '12px', fontSize: 15, fontWeight: 700, cursor: newName.trim() ? 'pointer' : 'default', fontFamily: 'inherit' }}>
                ✓ Create Folder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
