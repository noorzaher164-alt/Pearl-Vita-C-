import { useState, useEffect } from 'react';
import type { Folder, Page } from '../types';
import { getFolders, saveFolder, deleteFolder } from '../storage';
import { isAuthed, login, clearAuth } from '../auth';

interface Props {
  onNavigate: (page: Page) => void;
  onSelectFolder: (id: string) => void;
}

const FOLDER_COLORS = ['#c084fc', '#7dd3fc', '#fde68a', '#6ee7b7', '#fca5a5', '#a78bfa', '#ff6eb4', '#34d399', '#fb923c', '#60a5fa'];
const FOLDER_ICONS = ['📁', '🧪', '⚗️', '🔬', '🧬', '⚖️', '🔥', '🧫', '⚡', '🌡️', '💊', '🧲'];

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
        <input
          type="password" value={pw} autoFocus
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

export default function DashboardPage({ onNavigate, onSelectFolder }: Props) {
  const [authed, setAuthed] = useState(isAuthed);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('📁');
  const [newColor, setNewColor] = useState(FOLDER_COLORS[0]);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [search, setSearch] = useState('');

  const load = () => setFolders(getFolders());

  useEffect(() => { if (authed) load(); }, [authed]);

  if (!authed) return <LoginGate onAuthed={() => setAuthed(true)} onBack={() => onNavigate('home')} />;

  const handleCreate = () => {
    if (!newName.trim()) return;
    const folder: Folder = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      color: newColor,
      icon: newIcon,
      createdAt: new Date().toISOString(),
    };
    saveFolder(folder);
    setNewName('');
    setShowCreate(false);
    load();
  };

  const handleRename = (id: string) => {
    if (!renameValue.trim()) return;
    const f = folders.find(x => x.id === id);
    if (!f) return;
    saveFolder({ ...f, name: renameValue.trim() });
    setRenamingId(null);
    load();
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this folder and all its games?')) return;
    deleteFolder(id);
    load();
  };

  const filtered = folders.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ minHeight: '100vh', padding: '24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 32,
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => onNavigate('home')}
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}
          >
            ← Home
          </button>
          <button
            onClick={() => onNavigate('admin')}
            style={{ background: 'rgba(192,132,252,0.12)', border: '1px solid rgba(192,132,252,0.3)', color: '#c084fc', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}
          >
            ⚙️ Admin
          </button>
          <button
            onClick={() => { clearAuth(); setAuthed(false); }}
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}
          >
            🔒 Logout
          </button>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(135deg, #f093fb, #a78bfa, #7dd3fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
              Teacher Dashboard
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0 }}>Teacher Nourhan Zaher • Chemistry Games Hub</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            background: 'linear-gradient(135deg, #c084fc, #a78bfa)',
            color: 'white',
            border: 'none',
            borderRadius: 12,
            padding: '12px 24px',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
            boxShadow: '0 4px 20px rgba(192,132,252,0.4)',
          }}
        >
          + Create Folder
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 28, maxWidth: 400 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search folders..."
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 12,
            padding: '12px 16px',
            color: 'white',
            fontSize: 15,
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Create Folder Modal */}
      {showCreate && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }} onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div style={{
            background: 'linear-gradient(135deg, #1a0933, #0d1f3c)',
            border: '1px solid rgba(192,132,252,0.3)',
            borderRadius: 24,
            padding: 32,
            width: '100%',
            maxWidth: 460,
          }}>
            <h2 style={{ color: 'white', fontWeight: 700, marginBottom: 24, fontSize: 22 }}>📁 Create New Folder</h2>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, display: 'block', marginBottom: 8 }}>Folder Name</label>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="e.g. Organic Chemistry"
                autoFocus
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 10,
                  padding: '12px 16px',
                  color: 'white',
                  fontSize: 15,
                  outline: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, display: 'block', marginBottom: 8 }}>Icon</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {FOLDER_ICONS.map(icon => (
                  <button key={icon} onClick={() => setNewIcon(icon)} style={{
                    fontSize: 24, padding: '6px 10px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
                    background: newIcon === icon ? 'rgba(192,132,252,0.3)' : 'rgba(255,255,255,0.05)',
                    border: newIcon === icon ? '2px solid #c084fc' : '1px solid rgba(255,255,255,0.1)',
                  }}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, display: 'block', marginBottom: 8 }}>Color</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {FOLDER_COLORS.map(color => (
                  <button key={color} onClick={() => setNewColor(color)} style={{
                    width: 32, height: 32, borderRadius: '50%', background: color, cursor: 'pointer',
                    border: newColor === color ? '3px solid white' : '2px solid transparent',
                  }} />
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleCreate} style={{
                flex: 1, background: 'linear-gradient(135deg, #c084fc, #a78bfa)', color: 'white',
                border: 'none', borderRadius: 12, padding: '12px', fontSize: 15, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                Create Folder
              </button>
              <button onClick={() => setShowCreate(false)} style={{
                background: 'rgba(255,255,255,0.1)', color: 'white',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '12px 20px',
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Folders Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px', color: 'rgba(255,255,255,0.4)' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📂</div>
          <h3 style={{ fontSize: 20, marginBottom: 8, color: 'rgba(255,255,255,0.6)' }}>No folders yet</h3>
          <p>Create your first folder to start organizing your chemistry games!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
          {filtered.map(folder => (
            <div key={folder.id} style={{ position: 'relative' }}>
              {renamingId === folder.id ? (
                <div style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: `2px solid ${folder.color}`,
                  borderRadius: 20,
                  padding: 20,
                }}>
                  <input
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleRename(folder.id);
                      if (e.key === 'Escape') setRenamingId(null);
                    }}
                    autoFocus
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 8,
                      padding: '8px 12px',
                      color: 'white',
                      fontSize: 15,
                      outline: 'none',
                      fontFamily: 'inherit',
                      marginBottom: 12,
                      boxSizing: 'border-box',
                    }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleRename(folder.id)} style={{
                      flex: 1, background: folder.color, color: 'white', border: 'none',
                      borderRadius: 8, padding: '8px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
                    }}>Save</button>
                    <button onClick={() => setRenamingId(null)} style={{
                      background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none',
                      borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontFamily: 'inherit',
                    }}>✕</button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => onSelectFolder(folder.id)}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${folder.color}40`,
                    borderRadius: 20,
                    padding: 24,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: `0 0 0 0 ${folder.color}`,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget;
                    el.style.background = `${folder.color}15`;
                    el.style.borderColor = `${folder.color}60`;
                    el.style.transform = 'translateY(-4px)';
                    el.style.boxShadow = `0 12px 40px ${folder.color}30`;
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget;
                    el.style.background = 'rgba(255,255,255,0.05)';
                    el.style.borderColor = `${folder.color}40`;
                    el.style.transform = 'translateY(0)';
                    el.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 80, opacity: 0.06 }}>{folder.icon}</div>
                  <div style={{ fontSize: 44, marginBottom: 12 }}>{folder.icon}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 4 }}>{folder.name}</h3>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                    {new Date(folder.createdAt).toLocaleDateString()}
                  </p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    <button
                      onClick={e => { e.stopPropagation(); setRenamingId(folder.id); setRenameValue(folder.name); }}
                      style={{
                        background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none',
                        borderRadius: 8, padding: '6px 12px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >✏️ Rename</button>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(folder.id); }}
                      style={{
                        background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: 'none',
                        borderRadius: 8, padding: '6px 12px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >🗑️</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
