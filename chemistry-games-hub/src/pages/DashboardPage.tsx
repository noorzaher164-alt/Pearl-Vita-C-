import { useState, useEffect } from 'react';
import type { Folder, Page } from '../types';
import { getFolders, saveFolder, deleteFolder, getGamesByFolder } from '../storage';
import { isAuthed, login, clearAuth } from '../auth';

interface Props {
  onNavigate: (page: Page, extra?: Partial<Record<string, unknown>>) => void;
  onSelectFolder: (id: string) => void;
}

// ── GRADE / SEMESTER DEFINITIONS ─────────────────────────────────────────────
const GRADES = [
  { id: 'grade10',    label: 'Grade 10',              icon: '🔟', color: '#7dd3fc', bg: 'rgba(125,211,252,0.15)', border: 'rgba(125,211,252,0.4)' },
  { id: 'grade11',    label: 'Grade 11',              icon: '1️⃣1️⃣', color: '#6ee7b7', bg: 'rgba(110,231,183,0.15)', border: 'rgba(110,231,183,0.4)' },
  { id: 'grade12chem',label: 'Grade 12 (Chemistry)',  icon: '⚗️',  color: '#c084fc', bg: 'rgba(192,132,252,0.15)', border: 'rgba(192,132,252,0.4)' },
  { id: 'grade12sci', label: 'Grade 12 (Science)',    icon: '🔬',  color: '#fbbf24', bg: 'rgba(251,191,36,0.15)',  border: 'rgba(251,191,36,0.4)'  },
] as const;

const SEMESTERS = [
  { id: 's1', label: 'First Semester',  icon: '📗', color: '#6ee7b7' },
  { id: 's2', label: 'Second Semester', icon: '📘', color: '#7dd3fc' },
] as const;

type GradeId = (typeof GRADES)[number]['id'];
type SemId   = (typeof SEMESTERS)[number]['id'];

// Test bank available for Grade 12 Chemistry — both semesters
function hasTestBank(g: GradeId, s: SemId) { return g === 'grade12chem' && (s === 's1' || s === 's2'); }
function testBankSemester(s: SemId): 's1' | 's2' { return s === 's2' ? 's2' : 's1'; }

// ── FOLDER COLORS / ICONS for picker ─────────────────────────────────────────
const FOLDER_COLORS = ['#c084fc','#7dd3fc','#fde68a','#6ee7b7','#fca5a5','#a78bfa','#ff6eb4','#34d399','#fb923c','#60a5fa'];
const FOLDER_ICONS  = ['📁','🧪','⚗️','🔬','🧬','⚖️','🔥','🧫','⚡','🌡️','💊','🧲','📝','🎯','💡'];

// ── LOGIN GATE ────────────────────────────────────────────────────────────────
function LoginGate({ onAuthed, onBack }: { onAuthed: () => void; onBack: () => void }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const attempt = async () => {
    if (!pw.trim()) return;
    setLoading(true); setError('');
    const result = await login(pw);
    setLoading(false);
    if (result.ok) onAuthed();
    else setError(result.error || 'Incorrect password');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(192,132,252,0.3)', borderRadius: 28, padding: 40, maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🔐</div>
        <h2 style={{ color: 'white', fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Teacher Dashboard</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 28 }}>Enter your teacher password to continue</p>
        <input type="password" value={pw} autoFocus
          onChange={e => { setPw(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && attempt()}
          placeholder="Password"
          style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: `2px solid ${error ? '#ef4444' : 'rgba(192,132,252,0.4)'}`, borderRadius: 12, padding: '13px 16px', color: 'white', fontSize: 16, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 8 }}
        />
        {error && <div style={{ color: '#fca5a5', fontSize: 13, marginBottom: 8 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 12, padding: '12px 20px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>← Back</button>
          <button onClick={attempt} disabled={loading} style={{ flex: 1, background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #c084fc, #a78bfa)', color: 'white', border: 'none', borderRadius: 12, padding: '12px', fontSize: 16, fontWeight: 700, cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit' }}>
            {loading ? '⏳ Checking...' : '🔓 Enter'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
export default function DashboardPage({ onNavigate, onSelectFolder }: Props) {
  const [authed, setAuthed] = useState(isAuthed);

  // Navigation state
  const [activeGrade, setActiveGrade] = useState<GradeId | null>(null);
  const [activeSem, setActiveSem]     = useState<SemId | null>(null);

  // Folders in current semester
  const [folders, setFolders] = useState<Folder[]>([]);

  // Create-folder modal
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName]       = useState('');
  const [newIcon, setNewIcon]       = useState('📁');
  const [newColor, setNewColor]     = useState(FOLDER_COLORS[0]);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal]   = useState('');

  // Load folders scoped to current grade+semester
  const loadFolders = () => {
    if (!activeGrade || !activeSem) return;
    const all = getFolders();
    setFolders(all.filter(f => f.gradeId === activeGrade && f.semesterId === activeSem));
  };

  useEffect(() => { if (authed) loadFolders(); }, [authed, activeGrade, activeSem]);

  // ── not authed ──────────────────────────────────────────────────────────────
  if (!authed) return <LoginGate onAuthed={() => setAuthed(true)} onBack={() => onNavigate('home')} />;

  const grade = GRADES.find(g => g.id === activeGrade);
  const sem   = SEMESTERS.find(s => s.id === activeSem);

  // Ensure a default "General" folder exists for this grade-semester and return its id
  const ensureDefaultFolder = (): string => {
    const defId = `sys_${activeGrade}_${activeSem}`;
    const existing = getFolders().find(f => f.id === defId);
    if (!existing) {
      saveFolder({
        id: defId,
        name: `${grade!.label} — ${sem!.label} (General)`,
        color: grade!.color,
        icon: grade!.icon,
        createdAt: new Date().toISOString(),
        gradeId: activeGrade!,
        semesterId: activeSem!,
      });
      loadFolders();
    }
    return defId;
  };

  const handleCreateFolder = () => {
    if (!newName.trim() || !activeGrade || !activeSem) return;
    const folder: Folder = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      color: newColor,
      icon: newIcon,
      createdAt: new Date().toISOString(),
      gradeId: activeGrade,
      semesterId: activeSem,
    };
    saveFolder(folder);
    setNewName(''); setShowCreate(false);
    loadFolders();
  };

  const handleRename = (id: string) => {
    if (!renameVal.trim()) return;
    const f = getFolders().find(x => x.id === id);
    if (!f) return;
    saveFolder({ ...f, name: renameVal.trim() });
    setRenamingId(null);
    loadFolders();
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this folder and all its games?')) return;
    deleteFolder(id);
    loadFolders();
  };

  // ── Header ──────────────────────────────────────────────────────────────────
  const Header = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
      {activeGrade ? (
        <button onClick={() => { setActiveGrade(null); setActiveSem(null); }}
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>← Grades</button>
      ) : (
        <button onClick={() => onNavigate('home')}
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>← Home</button>
      )}
      {activeSem && activeGrade && (
        <button onClick={() => setActiveSem(null)}
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>← {grade?.label}</button>
      )}
      <button onClick={() => onNavigate('test-bank')}
        style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.35)', color: '#fbbf24', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700 }}>🏫 Test Bank</button>
      <button onClick={() => onNavigate('admin')}
        style={{ background: 'rgba(192,132,252,0.12)', border: '1px solid rgba(192,132,252,0.3)', color: '#c084fc', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>⚙️ Admin</button>
      <button onClick={() => { clearAuth(); setAuthed(false); }}
        style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>🔒 Logout</button>
      <div style={{ marginLeft: 4 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, background: 'linear-gradient(135deg, #f093fb, #a78bfa, #7dd3fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
          {activeSem && grade && sem ? `${grade.icon} ${grade.label} — ${sem.label}` : activeGrade && grade ? `${grade.icon} ${grade.label}` : 'Teacher Dashboard'}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0 }}>Teacher Nourhan Zaher • Chemistry Games Hub</p>
      </div>
    </div>
  );

  // ── LEVEL 1: Grade selection ─────────────────────────────────────────────────
  if (!activeGrade) {
    return (
      <div style={{ minHeight: '100vh', padding: 24, maxWidth: 860, margin: '0 auto' }}>
        <Header />
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, letterSpacing: 2, fontWeight: 700, marginBottom: 20 }}>SELECT GRADE</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            {GRADES.map(g => (
              <button key={g.id} onClick={() => setActiveGrade(g.id)}
                style={{ background: g.bg, border: `2px solid ${g.border}`, borderRadius: 24, padding: '32px 28px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.25s', display: 'flex', flexDirection: 'column', gap: 10 }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 40px ${g.color}30`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <span style={{ fontSize: 52 }}>{g.icon}</span>
                <div>
                  <div style={{ color: 'white', fontWeight: 800, fontSize: 20 }}>{g.label}</div>
                  <div style={{ color: g.color, fontSize: 13, marginTop: 4 }}>2 Semesters →</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── LEVEL 2: Semester selection ───────────────────────────────────────────────
  if (!activeSem) {
    return (
      <div style={{ minHeight: '100vh', padding: 24, maxWidth: 860, margin: '0 auto' }}>
        <Header />
        <h2 style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, letterSpacing: 2, fontWeight: 700, marginBottom: 20 }}>SELECT SEMESTER</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18, maxWidth: 600 }}>
          {SEMESTERS.map(s => (
            <button key={s.id} onClick={() => setActiveSem(s.id)}
              style={{ background: 'rgba(255,255,255,0.05)', border: `2px solid ${grade!.border}`, borderRadius: 24, padding: '36px 28px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center', transition: 'all 0.25s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
              onMouseEnter={e => { e.currentTarget.style.background = grade!.bg; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <span style={{ fontSize: 52 }}>{s.icon}</span>
              <div style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>{s.label}</div>
              {hasTestBank(activeGrade as GradeId, s.id) && (
                <span style={{ background: 'rgba(251,191,36,0.2)', border: '1px solid rgba(251,191,36,0.4)', borderRadius: 100, padding: '3px 10px', fontSize: 11, color: '#fbbf24', fontWeight: 700 }}>🏫 Test Bank Available</span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── LEVEL 3: Semester workspace ───────────────────────────────────────────────
  const isTestBankAvailable = hasTestBank(activeGrade as GradeId, activeSem as SemId);

  return (
    <div style={{ minHeight: '100vh', padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <Header />

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
        {/* Create Game */}
        <button onClick={() => {
          const fid = ensureDefaultFolder();
          onSelectFolder(fid); // navigate to folder page
        }}
          style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', border: 'none', borderRadius: 14, padding: '14px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(34,197,94,0.4)', display: 'flex', alignItems: 'center', gap: 8 }}>
          🎮 Create Game
        </button>

        {/* Create Folder */}
        <button onClick={() => setShowCreate(true)}
          style={{ background: 'rgba(192,132,252,0.15)', border: '2px solid rgba(192,132,252,0.4)', color: '#c084fc', borderRadius: 14, padding: '14px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}>
          📁 Create Folder
        </button>

        {/* Generate from Test Bank */}
        {isTestBankAvailable && (
          <button onClick={() => onNavigate('test-bank', { testBankSemester: testBankSemester(activeSem as SemId) })}
            style={{ background: 'rgba(251,191,36,0.15)', border: '2px solid rgba(251,191,36,0.4)', color: '#fbbf24', borderRadius: 14, padding: '14px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}>
            🏫 Generate from Test Bank
          </button>
        )}
      </div>

      {/* Folders grid */}
      {folders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 24 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📁</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, marginBottom: 8 }}>No folders yet for this semester</div>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Click "Create Game" to start with a default folder, or "Create Folder" to organize by topic</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
          {folders.map(f => {
            const gameCount = getGamesByFolder(f.id).length;
            return (
              <div key={f.id} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${f.color}30`, borderRadius: 20, overflow: 'hidden', transition: 'all 0.25s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 30px ${f.color}20`; e.currentTarget.style.borderColor = `${f.color}60`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = `${f.color}30`; }}>
                {/* Color bar */}
                <div style={{ height: 6, background: f.color }} />

                {/* Card body */}
                <div style={{ padding: '20px 18px', cursor: 'pointer' }} onClick={() => onSelectFolder(f.id)}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>{f.icon}</div>
                  {renamingId === f.id ? (
                    <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 6 }}>
                      <input autoFocus value={renameVal} onChange={e => setRenameVal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleRename(f.id); if (e.key === 'Escape') setRenamingId(null); }}
                        style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '6px 10px', color: 'white', fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
                      <button onClick={() => handleRename(f.id)} style={{ background: '#22c55e', border: 'none', borderRadius: 8, padding: '6px 10px', color: 'white', cursor: 'pointer', fontSize: 14 }}>✓</button>
                    </div>
                  ) : (
                    <div style={{ color: 'white', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{f.name}</div>
                  )}
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>{gameCount} game{gameCount !== 1 ? 's' : ''}</div>
                </div>

                {/* Actions */}
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

      {/* Create Folder modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 24 }}>
          <div style={{ background: '#1a0a2e', border: '1px solid rgba(192,132,252,0.3)', borderRadius: 24, padding: 32, maxWidth: 440, width: '100%' }}>
            <h3 style={{ color: 'white', fontWeight: 800, fontSize: 18, marginBottom: 20 }}>📁 New Folder</h3>

            <input value={newName} onChange={e => setNewName(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
              placeholder="Folder name (e.g. Organic Chemistry)"
              style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(192,132,252,0.4)', borderRadius: 12, padding: '13px 16px', color: 'white', fontSize: 15, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 20 }} />

            {/* Icon picker */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 10 }}>Icon</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {FOLDER_ICONS.map(ic => (
                  <button key={ic} onClick={() => setNewIcon(ic)}
                    style={{ width: 40, height: 40, fontSize: 20, background: newIcon === ic ? 'rgba(192,132,252,0.3)' : 'rgba(255,255,255,0.06)', border: newIcon === ic ? '2px solid #c084fc' : '1px solid rgba(255,255,255,0.1)', borderRadius: 10, cursor: 'pointer' }}>{ic}</button>
                ))}
              </div>
            </div>

            {/* Color picker */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 10 }}>Color</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {FOLDER_COLORS.map(c => (
                  <button key={c} onClick={() => setNewColor(c)}
                    style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: newColor === c ? '3px solid white' : '2px solid transparent', cursor: 'pointer' }} />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setShowCreate(false); setNewName(''); }}
                style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 12, padding: '12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15 }}>Cancel</button>
              <button onClick={handleCreateFolder} disabled={!newName.trim()}
                style={{ flex: 2, background: newName.trim() ? 'linear-gradient(135deg, #c084fc, #a78bfa)' : 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: 12, padding: '12px', fontSize: 15, fontWeight: 700, cursor: newName.trim() ? 'pointer' : 'default', fontFamily: 'inherit' }}>
                ✓ Create Folder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
