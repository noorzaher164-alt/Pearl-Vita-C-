import { useState, useEffect } from 'react';
import type { Folder, Page, User } from '../types';
import { getFolders, saveFolder, deleteFolder, getGamesByFolder, getGames, getResults } from '../storage';
import { setCurrentUser } from '../users';

interface Props {
  user: User;
  onNavigate: (page: Page, extra?: Partial<Record<string, unknown>>) => void;
  onSelectFolder: (id: string) => void;
  onLogout: () => void;
}

// ── Grades / Semesters ────────────────────────────────────────────────────────
const GRADES = [
  { id: 'grade10',     label: 'Grade 10',             icon: '🔟', color: '#7dd3fc', bg: 'rgba(125,211,252,0.15)', border: 'rgba(125,211,252,0.4)' },
  { id: 'grade11',     label: 'Grade 11',             icon: '1️⃣1️⃣', color: '#6ee7b7', bg: 'rgba(110,231,183,0.15)', border: 'rgba(110,231,183,0.4)' },
  { id: 'grade12chem', label: 'Grade 12 Chemistry',   icon: '⚗️',  color: '#c084fc', bg: 'rgba(192,132,252,0.15)', border: 'rgba(192,132,252,0.4)' },
  { id: 'grade12sci',  label: 'Grade 12 Science',     icon: '🔬',  color: '#fbbf24', bg: 'rgba(251,191,36,0.15)',  border: 'rgba(251,191,36,0.4)'  },
] as const;

const SEMESTERS = [
  { id: 's1', label: 'First Semester',  icon: '📗', color: '#6ee7b7' },
  { id: 's2', label: 'Second Semester', icon: '📘', color: '#7dd3fc' },
] as const;

type GradeId = (typeof GRADES)[number]['id'];
type SemId   = (typeof SEMESTERS)[number]['id'];
type SidebarView = 'home' | 'grades' | 'games' | 'results' | 'testbank';

function hasTestBank(g: GradeId, _s: SemId) { return g === 'grade12chem'; }
function testBankSemId(s: SemId): 's1' | 's2' { return s; }

const FOLDER_COLORS = ['#c084fc','#7dd3fc','#fde68a','#6ee7b7','#fca5a5','#a78bfa','#ff6eb4','#34d399','#fb923c','#60a5fa'];
const FOLDER_ICONS  = ['📁','🧪','⚗️','🔬','🧬','⚖️','🔥','🧫','⚡','🌡️','💊','🧲','📝','🎯','💡'];

// ── Sidebar nav items ─────────────────────────────────────────────────────────
const NAV: { id: SidebarView; icon: string; label: string }[] = [
  { id: 'home',     icon: '🏠', label: 'Home' },
  { id: 'grades',   icon: '📁', label: 'Grades & Folders' },
  { id: 'games',    icon: '🎮', label: 'All Games' },
  { id: 'results',  icon: '📊', label: 'Results' },
  { id: 'testbank', icon: '🏦', label: 'Test Bank' },
];

export default function DashboardPage({ user, onNavigate, onSelectFolder, onLogout }: Props) {
  const [view, setView] = useState<SidebarView>('home');

  // Grades → Semesters → Folders navigation
  const [activeGrade, setActiveGrade] = useState<GradeId | null>(null);
  const [activeSem, setActiveSem]     = useState<SemId | null>(null);
  const [folders, setFolders]         = useState<Folder[]>([]);

  // Create folder modal
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName]       = useState('');
  const [newIcon, setNewIcon]       = useState('📁');
  const [newColor, setNewColor]     = useState(FOLDER_COLORS[0]);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal]   = useState('');

  // All games search
  const [gameSearch, setGameSearch] = useState('');

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
      saveFolder({
        id: defId,
        name: `${grade!.label} — ${sem!.label} (General)`,
        color: grade!.color, icon: grade!.icon,
        createdAt: new Date().toISOString(),
        gradeId: activeGrade!, semesterId: activeSem!,
      });
      loadFolders();
    }
    return defId;
  };

  const handleCreateFolder = () => {
    if (!newName.trim() || !activeGrade || !activeSem) return;
    saveFolder({ id: crypto.randomUUID(), name: newName.trim(), color: newColor, icon: newIcon, createdAt: new Date().toISOString(), gradeId: activeGrade, semesterId: activeSem });
    setNewName(''); setShowCreate(false);
    loadFolders();
  };

  const handleRename = (id: string) => {
    const f = getFolders().find(x => x.id === id);
    if (!f || !renameVal.trim()) return;
    saveFolder({ ...f, name: renameVal.trim() });
    setRenamingId(null); loadFolders();
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this folder and all its games?')) return;
    deleteFolder(id); loadFolders();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    onLogout();
  };

  // ── Sidebar ───────────────────────────────────────────────────────────────
  const Sidebar = () => (
    <div style={{
      width: 240, minHeight: '100vh', background: '#0d0820',
      borderRight: '1px solid rgba(192,132,252,0.15)',
      display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh',
    }}>
      {/* Brand */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 32, marginBottom: 6 }}>⚗️</div>
        <div style={{ color: 'white', fontWeight: 800, fontSize: 15, lineHeight: 1.2 }}>Chemistry<br />Games Hub</div>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 4 }}>Teacher Platform</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV.map(item => {
          const active = view === item.id;
          return (
            <button key={item.id} onClick={() => { setView(item.id); if (item.id !== 'grades') { setActiveGrade(null); setActiveSem(null); } }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: active ? 'rgba(192,132,252,0.18)' : 'transparent',
                border: active ? '1px solid rgba(192,132,252,0.35)' : '1px solid transparent',
                borderRadius: 12, padding: '11px 14px', color: active ? 'white' : 'rgba(255,255,255,0.45)',
                cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: active ? 700 : 400,
                width: '100%', textAlign: 'left', transition: 'all 0.15s',
              }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              {item.label}
              {active && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#c084fc' }} />}
            </button>
          );
        })}

        <div style={{ margin: '8px 0', borderTop: '1px solid rgba(255,255,255,0.07)' }} />

        <button onClick={() => onNavigate('admin')}
          style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'transparent', border: '1px solid transparent', borderRadius: 12, padding: '11px 14px', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, width: '100%', textAlign: 'left' }}>
          <span style={{ fontSize: 18 }}>⚙️</span> Admin Panel
        </button>
      </nav>

      {/* User */}
      <div style={{ padding: '16px 14px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #c084fc, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: 15, flexShrink: 0 }}>
            {user.displayName[0].toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: 'white', fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.displayName}</div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>@{user.username}</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{ width: '100%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', borderRadius: 10, padding: '8px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600 }}>
          🔒 Log Out
        </button>
      </div>
    </div>
  );

  // ── HOME view ─────────────────────────────────────────────────────────────
  const HomeView = () => {
    const allGames = getGames();
    const allFolders = getFolders();
    const allResults = getResults();
    return (
      <div style={{ padding: '32px 36px', maxWidth: 900 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, background: 'linear-gradient(135deg, #f093fb, #a78bfa, #7dd3fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 4px' }}>
          Welcome back, {user.displayName}! 👋
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 32 }}>
          Chemistry Games Hub — Teacher Dashboard
        </p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 36 }}>
          {[
            { icon: '🎮', label: 'Total Games', value: allGames.length, color: '#c084fc' },
            { icon: '📁', label: 'Folders', value: allFolders.length, color: '#7dd3fc' },
            { icon: '📊', label: 'Sessions Played', value: allResults.length, color: '#6ee7b7' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${s.color}25`, borderRadius: 18, padding: '22px 20px' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ color: s.color, fontSize: 32, fontWeight: 900 }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <h3 style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, letterSpacing: 2, fontWeight: 700, marginBottom: 14 }}>QUICK ACTIONS</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 36 }}>
          {[
            { icon: '📁', label: 'Browse Grades', desc: 'Find games by grade & semester', color: '#7dd3fc', action: () => setView('grades') },
            { icon: '🎮', label: 'All Games', desc: 'Search across all your games', color: '#c084fc', action: () => setView('games') },
            { icon: '🏦', label: 'Test Bank', desc: 'Generate from question bank', color: '#fbbf24', action: () => setView('testbank') },
            { icon: '📊', label: 'View Results', desc: 'Past game session history', color: '#6ee7b7', action: () => setView('results') },
          ].map(a => (
            <button key={a.label} onClick={a.action} style={{
              background: `${a.color}10`, border: `1px solid ${a.color}30`,
              borderRadius: 16, padding: '18px 16px', cursor: 'pointer', fontFamily: 'inherit',
              textAlign: 'left', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = `${a.color}20`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = `${a.color}10`; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{a.icon}</div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{a.label}</div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{a.desc}</div>
            </button>
          ))}
        </div>

        {/* Recent games */}
        {allGames.length > 0 && (
          <>
            <h3 style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, letterSpacing: 2, fontWeight: 700, marginBottom: 14 }}>RECENT GAMES</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...allGames].reverse().slice(0, 5).map(g => {
                const folder = getFolders().find(f => f.id === g.folderId);
                return (
                  <div key={g.id} onClick={() => { if (folder) onSelectFolder(folder.id); }}
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: `${folder?.color || '#c084fc'}20`, border: `1px solid ${folder?.color || '#c084fc'}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{folder?.icon || '🎮'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: 'white', fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.title}</div>
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{g.lessonName} • {g.questions.length} Qs</div>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 18 }}>→</div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  };

  // ── ALL GAMES view ────────────────────────────────────────────────────────
  const AllGamesView = () => {
    const allGames = getGames();
    const filtered = allGames.filter(g =>
      g.title.toLowerCase().includes(gameSearch.toLowerCase()) ||
      g.lessonName.toLowerCase().includes(gameSearch.toLowerCase())
    );
    return (
      <div style={{ padding: '32px 36px', maxWidth: 900 }}>
        <h2 style={{ color: 'white', fontSize: 22, fontWeight: 800, marginBottom: 6 }}>🎮 All Games</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 24 }}>{allGames.length} games across all grades</p>
        <input value={gameSearch} onChange={e => setGameSearch(e.target.value)}
          placeholder="🔍 Search by title or lesson..."
          style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(192,132,252,0.3)', borderRadius: 14, padding: '13px 18px', color: 'white', fontSize: 15, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 20 }} />
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.25)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎮</div>
            {allGames.length === 0 ? 'No games yet — go to Grades to create one!' : 'No games match your search'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(g => {
              const folder = getFolders().find(f => f.id === g.folderId);
              return (
                <div key={g.id} onClick={() => folder && onSelectFolder(folder.id)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(192,132,252,0.1)'; e.currentTarget.style.borderColor = 'rgba(192,132,252,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${folder?.color || '#c084fc'}20`, border: `1px solid ${folder?.color || '#c084fc'}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{folder?.icon || '🎮'}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.title}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>{g.lessonName} • {g.questions.length} questions • {g.gameType.replace(/-/g, ' ')}</div>
                  </div>
                  <div style={{ background: g.isCompetitive ? 'rgba(239,68,68,0.15)' : 'rgba(110,231,183,0.15)', border: `1px solid ${g.isCompetitive ? 'rgba(239,68,68,0.3)' : 'rgba(110,231,183,0.3)'}`, borderRadius: 8, padding: '3px 10px', fontSize: 11, color: g.isCompetitive ? '#fca5a5' : '#6ee7b7', fontWeight: 700, flexShrink: 0 }}>
                    {g.isCompetitive ? '⚔️ LIVE' : '📚 SOLO'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ── RESULTS view ──────────────────────────────────────────────────────────
  const ResultsView = () => {
    const results = getResults();
    return (
      <div style={{ padding: '32px 36px', maxWidth: 900 }}>
        <h2 style={{ color: 'white', fontSize: 22, fontWeight: 800, marginBottom: 6 }}>📊 Results</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 24 }}>{results.length} game sessions recorded</p>
        {results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.25)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
            No results yet — play some games first!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[...results].reverse().map(r => (
              <div key={r.id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>{r.gameTitle}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>
                      {new Date(r.playedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} • {r.leaderboard.length} players • {r.sessionType === 'live' ? '⚔️ Live' : '📚 Solo'}
                    </div>
                  </div>
                  {r.leaderboard[0] && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#fbbf24', fontSize: 11, fontWeight: 700 }}>🥇 WINNER</div>
                      <div style={{ color: 'white', fontWeight: 700 }}>{r.leaderboard[0].nickname}</div>
                      <div style={{ color: '#fbbf24', fontWeight: 900, fontSize: 18 }}>{r.leaderboard[0].score} pts</div>
                    </div>
                  )}
                </div>
                {r.leaderboard.length > 1 && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {r.leaderboard.slice(0, 6).map((e, i) => (
                      <div key={e.nickname} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '5px 10px', fontSize: 12 }}>
                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>{i + 1}. </span>
                        <span style={{ color: 'white' }}>{e.nickname}</span>
                        <span style={{ color: '#a78bfa', marginLeft: 6, fontWeight: 700 }}>{e.score}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ── TEST BANK view ────────────────────────────────────────────────────────
  const TestBankView = () => (
    <div style={{ padding: '32px 36px', maxWidth: 900 }}>
      <h2 style={{ color: 'white', fontSize: 22, fontWeight: 800, marginBottom: 6 }}>🏦 Test Bank</h2>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 32 }}>Generate quiz games from the official question bank</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {[
          { title: 'Grade 12 Chemistry — S1', subtitle: 'First Semester', icon: '⚗️', color: '#c084fc', sem: 's1' as const },
          { title: 'Grade 12 Chemistry — S2', subtitle: 'Second Semester', icon: '🧪', color: '#7dd3fc', sem: 's2' as const },
        ].map(tb => (
          <button key={tb.sem} onClick={() => onNavigate('test-bank', { testBankSemester: tb.sem })}
            style={{ background: `${tb.color}12`, border: `2px solid ${tb.color}35`, borderRadius: 22, padding: '32px 24px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = `${tb.color}22`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = `${tb.color}12`; e.currentTarget.style.transform = 'none'; }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>{tb.icon}</div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 18, marginBottom: 4 }}>{tb.title}</div>
            <div style={{ color: tb.color, fontSize: 13, marginBottom: 12 }}>{tb.subtitle}</div>
            <div style={{ background: `${tb.color}20`, border: `1px solid ${tb.color}40`, borderRadius: 8, padding: '5px 12px', display: 'inline-block', color: tb.color, fontSize: 12, fontWeight: 700 }}>
              Open Test Bank →
            </div>
          </button>
        ))}
      </div>
      <div style={{ marginTop: 24, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 16, padding: '16px 20px' }}>
        <p style={{ color: '#fbbf24', fontSize: 13, margin: 0 }}>
          💡 <strong>Tip:</strong> The test bank has 81 MCQ questions for Grade 12 Chemistry (S2) and 80+ for S1. Select questions to auto-generate a quiz game in any folder.
        </p>
      </div>
    </div>
  );

  // ── GRADES / FOLDERS view ─────────────────────────────────────────────────
  const GradesView = () => {
    // Level 1: grade picker
    if (!activeGrade) return (
      <div style={{ padding: '32px 36px', maxWidth: 900 }}>
        <h2 style={{ color: 'white', fontSize: 22, fontWeight: 800, marginBottom: 6 }}>📁 Grades & Folders</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 28 }}>Choose a grade to browse its folders and games</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
          {GRADES.map(g => (
            <button key={g.id} onClick={() => setActiveGrade(g.id)}
              style={{ background: g.bg, border: `2px solid ${g.border}`, borderRadius: 24, padding: '32px 28px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.25s', display: 'flex', flexDirection: 'column', gap: 10 }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 40px ${g.color}30`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              <span style={{ fontSize: 52 }}>{g.icon}</span>
              <div>
                <div style={{ color: 'white', fontWeight: 800, fontSize: 20 }}>{g.label}</div>
                <div style={{ color: g.color, fontSize: 13, marginTop: 4 }}>2 Semesters →</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );

    // Level 2: semester picker
    if (!activeSem) return (
      <div style={{ padding: '32px 36px', maxWidth: 900 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <button onClick={() => setActiveGrade(null)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>← Grades</button>
          <h2 style={{ color: 'white', fontSize: 22, fontWeight: 800, margin: 0 }}>{grade?.icon} {grade?.label}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18, maxWidth: 540 }}>
          {SEMESTERS.map(s => (
            <button key={s.id} onClick={() => setActiveSem(s.id)}
              style={{ background: 'rgba(255,255,255,0.05)', border: `2px solid ${grade!.border}`, borderRadius: 24, padding: '36px 28px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center', transition: 'all 0.25s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
              onMouseEnter={e => { e.currentTarget.style.background = grade!.bg; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'none'; }}>
              <span style={{ fontSize: 52 }}>{s.icon}</span>
              <div style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>{s.label}</div>
              {hasTestBank(activeGrade as GradeId, s.id as SemId) && (
                <span style={{ background: 'rgba(251,191,36,0.2)', border: '1px solid rgba(251,191,36,0.4)', borderRadius: 100, padding: '3px 10px', fontSize: 11, color: '#fbbf24', fontWeight: 700 }}>🏦 Test Bank</span>
              )}
            </button>
          ))}
        </div>
      </div>
    );

    // Level 3: folders workspace
    const isTestBankAvailable = hasTestBank(activeGrade as GradeId, activeSem as SemId);
    return (
      <div style={{ padding: '32px 36px', maxWidth: 1000 }}>
        {/* Breadcrumb + actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          <button onClick={() => setActiveSem(null)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>← {grade?.label}</button>
          <h2 style={{ color: 'white', fontSize: 20, fontWeight: 800, margin: 0 }}>{grade?.icon} {grade?.label} — {sem?.label}</h2>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
          <button onClick={() => { const fid = ensureDefaultFolder(); onSelectFolder(fid); }}
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', border: 'none', borderRadius: 12, padding: '12px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(34,197,94,0.3)' }}>
            🎮 Create Game
          </button>
          <button onClick={() => setShowCreate(true)}
            style={{ background: 'rgba(192,132,252,0.15)', border: '2px solid rgba(192,132,252,0.35)', color: '#c084fc', borderRadius: 12, padding: '12px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            📁 New Folder
          </button>
          {isTestBankAvailable && (
            <button onClick={() => onNavigate('test-bank', { testBankSemester: testBankSemId(activeSem as SemId) })}
              style={{ background: 'rgba(251,191,36,0.12)', border: '2px solid rgba(251,191,36,0.35)', color: '#fbbf24', borderRadius: 12, padding: '12px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              🏦 Generate from Test Bank
            </button>
          )}
        </div>

        {folders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 24 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📁</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, marginBottom: 8 }}>No folders yet</div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Click "Create Game" to add a default folder, or "New Folder" to organise by topic</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 18 }}>
            {folders.map(f => {
              const gameCount = getGamesByFolder(f.id).length;
              return (
                <div key={f.id} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${f.color}30`, borderRadius: 20, overflow: 'hidden', transition: 'all 0.25s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 30px ${f.color}20`; e.currentTarget.style.borderColor = `${f.color}60`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = `${f.color}30`; }}>
                  <div style={{ height: 6, background: f.color }} />
                  <div style={{ padding: '20px 18px', cursor: 'pointer' }} onClick={() => onSelectFolder(f.id)}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>{f.icon}</div>
                    {renamingId === f.id ? (
                      <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 6 }}>
                        <input autoFocus value={renameVal} onChange={e => setRenameVal(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleRename(f.id); if (e.key === 'Escape') setRenamingId(null); }}
                          style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '6px 10px', color: 'white', fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
                        <button onClick={() => handleRename(f.id)} style={{ background: '#22c55e', border: 'none', borderRadius: 8, padding: '6px 10px', color: 'white', cursor: 'pointer', fontSize: 14 }}>✓</button>
                      </div>
                    ) : (
                      <div style={{ color: 'white', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{f.name}</div>
                    )}
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>{gameCount} game{gameCount !== 1 ? 's' : ''}</div>
                  </div>
                  <div style={{ padding: '0 14px 14px', display: 'flex', gap: 8 }}>
                    <button onClick={() => { setRenamingId(f.id); setRenameVal(f.name); }}
                      style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', borderRadius: 8, padding: '7px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>✏️ Rename</button>
                    <button onClick={() => handleDelete(f.id)}
                      style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', fontSize: 13 }}>🗑</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      {/* Main content */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: '100vh' }}>
        {view === 'home'     && <HomeView />}
        {view === 'grades'   && <GradesView />}
        {view === 'games'    && <AllGamesView />}
        {view === 'results'  && <ResultsView />}
        {view === 'testbank' && <TestBankView />}
      </div>

      {/* Create Folder modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 24 }}>
          <div style={{ background: '#1a0a2e', border: '1px solid rgba(192,132,252,0.3)', borderRadius: 24, padding: 32, maxWidth: 440, width: '100%' }}>
            <h3 style={{ color: 'white', fontWeight: 800, fontSize: 18, marginBottom: 20 }}>📁 New Folder</h3>
            <input value={newName} onChange={e => setNewName(e.target.value)} autoFocus
              onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
              placeholder="Folder name (e.g. Organic Chemistry)"
              style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(192,132,252,0.4)', borderRadius: 12, padding: '13px 16px', color: 'white', fontSize: 15, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 20 }} />
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 10 }}>Icon</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {FOLDER_ICONS.map(ic => (
                  <button key={ic} onClick={() => setNewIcon(ic)} style={{ width: 40, height: 40, fontSize: 20, background: newIcon === ic ? 'rgba(192,132,252,0.3)' : 'rgba(255,255,255,0.06)', border: newIcon === ic ? '2px solid #c084fc' : '1px solid rgba(255,255,255,0.1)', borderRadius: 10, cursor: 'pointer' }}>{ic}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 10 }}>Color</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {FOLDER_COLORS.map(c => (
                  <button key={c} onClick={() => setNewColor(c)} style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: newColor === c ? '3px solid white' : '2px solid transparent', cursor: 'pointer' }} />
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setShowCreate(false); setNewName(''); }} style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 12, padding: '12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15 }}>Cancel</button>
              <button onClick={handleCreateFolder} disabled={!newName.trim()} style={{ flex: 2, background: newName.trim() ? 'linear-gradient(135deg, #c084fc, #a78bfa)' : 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: 12, padding: '12px', fontSize: 15, fontWeight: 700, cursor: newName.trim() ? 'pointer' : 'default', fontFamily: 'inherit' }}>
                ✓ Create Folder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
