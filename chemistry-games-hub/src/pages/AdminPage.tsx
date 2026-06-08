import { useState, useEffect, useRef } from 'react';
import { getFolders, getGames, deleteGame, deleteFolder, saveFolder, saveGame } from '../storage';
import type { Folder, Game } from '../types';
import { isAuthed, login, clearAuth } from '../auth';

interface Props { onBack: () => void; }

export default function AdminPage({ onBack }: Props) {
  const [authed, setAuthed] = useState(isAuthed);
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [tab, setTab] = useState<'overview' | 'games' | 'export'>('overview');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authed) { setFolders(getFolders()); setGames(getGames()); }
  }, [authed]);

  const handleLogin = async () => {
    if (!pw.trim()) return;
    setLoginLoading(true); setPwError('');
    const result = await login(pw);
    setLoginLoading(false);
    if (result.ok) setAuthed(true);
    else { setPwError(result.error || 'Wrong password'); setPw(''); }
  };

  const handleLogout = () => { clearAuth(); setAuthed(false); };

  const handleDeleteGame = (id: string) => {
    deleteGame(id);
    setGames(getGames());
    setConfirmDelete(null);
  };

  const handleDeleteFolder = (id: string) => {
    const folderGames = games.filter(g => g.folderId === id);
    folderGames.forEach(g => deleteGame(g.id));
    deleteFolder(id);
    setFolders(getFolders()); setGames(getGames());
    setConfirmDelete(null);
  };

  const exportAllData = () => {
    const data = { folders: getFolders(), games: getGames(), exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'chemistry-hub-backup.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        let fCount = 0, gCount = 0;
        if (Array.isArray(data.folders)) { data.folders.forEach((f: Folder) => { saveFolder(f); fCount++; }); }
        if (Array.isArray(data.games)) { data.games.forEach((g: Game) => { saveGame(g); gCount++; }); }
        setFolders(getFolders()); setGames(getGames());
        setImportMsg({ ok: true, text: `✓ Imported ${fCount} folders and ${gCount} games successfully!` });
      } catch {
        setImportMsg({ ok: false, text: '✗ Invalid backup file. Make sure it is a valid JSON backup.' });
      }
      setTimeout(() => setImportMsg(null), 5000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const exportGamesCSV = () => {
    const rows = [['Game Title', 'Lesson', 'Type', 'Questions', 'PIN', 'Created']];
    games.forEach(g => rows.push([g.title, g.lessonName, g.gameType, String(g.questions.length), g.pin || '', g.createdAt]));
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'all-games.csv'; a.click();
    URL.revokeObjectURL(url);
  };


  // ── Login screen ──────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#0a0a1a,#1a0a2e)', padding: 24 }}>
        <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 24, padding: 40, maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🔐</div>
          <h2 style={{ color: 'white', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Admin Panel</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 28, fontSize: 14 }}>Chemistry Games Hub — Teacher Control</p>
          <input
            type="password" value={pw}
            onChange={e => { setPw(e.target.value); setPwError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Enter admin password"
            autoFocus
            style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: `2px solid ${pwError ? '#ef4444' : 'rgba(239,68,68,0.4)'}`, borderRadius: 12, padding: '13px 16px', color: 'white', fontSize: 16, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 8 }}
          />
          {pwError && <div style={{ color: '#fca5a5', fontSize: 13, marginBottom: 10 }}>{pwError}</div>}
          <button onClick={handleLogin} disabled={loginLoading} style={{ width: '100%', background: loginLoading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', border: 'none', borderRadius: 12, padding: '14px', fontSize: 17, fontWeight: 800, cursor: loginLoading ? 'default' : 'pointer', fontFamily: 'inherit', marginBottom: 16 }}>
            {loginLoading ? '⏳ Checking...' : '🔓 Login'}
          </button>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>← Back</button>
        </div>
      </div>
    );
  }

  const totalQ = games.reduce((s, g) => s + g.questions.length, 0);

  // ── Admin dashboard ───────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a0a1a,#1a0a2e)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'rgba(239,68,68,0.1)', borderBottom: '1px solid rgba(239,68,68,0.3)', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: 2 }}>ADMIN PANEL</div>
          <div style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>🔐 Chemistry Games Hub</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>← Exit Admin</button>
          <button onClick={handleLogout} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>🔒 Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, padding: '16px 24px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {(['overview', 'games', 'export'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: tab === t ? 'rgba(239,68,68,0.2)' : 'transparent',
            border: tab === t ? '1px solid rgba(239,68,68,0.5)' : '1px solid transparent',
            color: tab === t ? '#fca5a5' : 'rgba(255,255,255,0.4)',
            borderRadius: '10px 10px 0 0', padding: '10px 20px', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 14, fontWeight: tab === t ? 700 : 400, textTransform: 'capitalize',
          }}>{t === 'overview' ? '📊 Overview' : t === 'games' ? '🎮 Games & Folders' : '📥 Export'}</button>
        ))}
      </div>

      <div style={{ flex: 1, padding: 24, maxWidth: 900, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        {/* Overview tab */}
        {tab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
              {[
                { label: 'Total Folders', value: folders.length, icon: '📁', color: '#c084fc' },
                { label: 'Total Games', value: games.length, icon: '🎮', color: '#7dd3fc' },
                { label: 'Total Questions', value: totalQ, icon: '❓', color: '#6ee7b7' },
                { label: 'Live-ready Games', value: games.filter(g => g.pin).length, icon: '🔴', color: '#fbbf24' },
              ].map(stat => (
                <div key={stat.label} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${stat.color}30`, borderRadius: 16, padding: '20px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{stat.icon}</div>
                  <div style={{ fontSize: 36, fontWeight: 900, color: stat.color }}>{stat.value}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 20 }}>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>FOLDERS SUMMARY</div>
              {folders.length === 0 ? (
                <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>No folders yet.</div>
              ) : folders.map(f => {
                const fg = games.filter(g => g.folderId === f.id);
                return (
                  <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '12px 16px' }}>
                    <span style={{ fontSize: 22 }}>{f.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: 'white', fontWeight: 700 }}>{f.name}</div>
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{fg.length} game{fg.length !== 1 ? 's' : ''} • {fg.reduce((s, g) => s + g.questions.length, 0)} questions</div>
                    </div>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: f.color }} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Games tab */}
        {tab === 'games' && (
          <div>
            {folders.length === 0 && <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 15, textAlign: 'center', paddingTop: 40 }}>No folders or games yet.</div>}
            {folders.map(f => {
              const fg = games.filter(g => g.folderId === f.id);
              return (
                <div key={f.id} style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 20 }}>{f.icon}</span>
                    <span style={{ color: 'white', fontWeight: 800, fontSize: 16 }}>{f.name}</span>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>({fg.length} games)</span>
                    <button onClick={() => setConfirmDelete('folder-' + f.id)} style={{ marginLeft: 'auto', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: 8, padding: '4px 12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>🗑 Delete Folder</button>
                  </div>
                  {fg.length === 0 && <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, paddingLeft: 30, marginBottom: 8 }}>Empty folder</div>}
                  {fg.map(g => (
                    <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 16px', marginBottom: 8, marginLeft: 20 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>{g.title}</div>
                        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{g.lessonName} • {g.questions.length} questions • PIN: {g.pin || '—'}</div>
                      </div>
                      <button onClick={() => setConfirmDelete('game-' + g.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>🗑</button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* Export tab */}
        {tab === 'export' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500 }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 24 }}>
              <h3 style={{ color: 'white', fontWeight: 800, fontSize: 17, marginBottom: 6 }}>📋 Export All Games (CSV)</h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 16 }}>Download a spreadsheet of all games with their details.</p>
              <button onClick={exportGamesCSV} style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: 'white', border: 'none', borderRadius: 12, padding: '13px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>📥 Download CSV</button>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 24 }}>
              <h3 style={{ color: 'white', fontWeight: 800, fontSize: 17, marginBottom: 6 }}>💾 Full Backup (JSON)</h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 16 }}>Export everything — folders, games, and questions — as a backup file.</p>
                  <button onClick={exportAllData} style={{ background: 'linear-gradient(135deg,#7dd3fc,#38bdf8)', color: '#0c1445', border: 'none', borderRadius: 12, padding: '13px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>💾 Download Backup</button>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 24 }}>
              <h3 style={{ color: 'white', fontWeight: 800, fontSize: 17, marginBottom: 6 }}>📤 Restore Backup (JSON)</h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 16 }}>Import a previously saved backup file. Existing data will be kept — duplicates are overwritten.</p>
              <input ref={importRef} type="file" accept=".json" onChange={importBackup} style={{ display: 'none' }} />
              <button onClick={() => importRef.current?.click()} style={{ background: 'linear-gradient(135deg,#c084fc,#a78bfa)', color: 'white', border: 'none', borderRadius: 12, padding: '13px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>📂 Choose Backup File</button>
              {importMsg && <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: importMsg.ok ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${importMsg.ok ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`, color: importMsg.ok ? '#6ee7b7' : '#fca5a5', fontSize: 13 }}>{importMsg.text}</div>}
            </div>
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 16, padding: 24 }}>
              <h3 style={{ color: '#fca5a5', fontWeight: 800, fontSize: 17, marginBottom: 6 }}>⚠️ Clear All Data</h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 16 }}>Permanently delete ALL games and folders. Cannot be undone.</p>
              <button onClick={() => setConfirmDelete('ALL')} style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.5)', color: '#fca5a5', borderRadius: 12, padding: '13px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>🗑 Clear Everything</button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 24 }}>
          <div style={{ background: '#1a0a2e', border: '2px solid rgba(239,68,68,0.5)', borderRadius: 20, padding: 32, maxWidth: 380, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ color: 'white', fontWeight: 800, marginBottom: 8 }}>
              {confirmDelete === 'ALL' ? 'Delete ALL data?' : 'Delete this item?'}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 24 }}>This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setConfirmDelete(null)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 12, padding: '12px 24px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15 }}>Cancel</button>
              <button onClick={() => {
                if (confirmDelete === 'ALL') {
                  games.forEach(g => deleteGame(g.id));
                  folders.forEach(f => deleteFolder(f.id));
                  setGames([]); setFolders([]);
                } else if (confirmDelete.startsWith('game-')) {
                  handleDeleteGame(confirmDelete.replace('game-', ''));
                } else if (confirmDelete.startsWith('folder-')) {
                  handleDeleteFolder(confirmDelete.replace('folder-', ''));
                }
                setConfirmDelete(null);
              }} style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', border: 'none', borderRadius: 12, padding: '12px 24px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, fontWeight: 700 }}>🗑 Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
