import { useState } from 'react';
import type { User, UserRole } from '../types';
import type { Theme } from '../theme';
import { getTheme } from '../theme';
import { getUsers, updateUser, deleteUser } from '../users';
import { getGames, getFolders, getResults } from '../storage';

interface Props {
  currentUser: User;
  onBack: () => void;
  theme: Theme;
}

const ROLE_COLORS: Record<UserRole, string> = {
  admin: '#f59e0b',
  teacher: '#c084fc',
  student: '#6ee7b7',
};
const ROLE_LABELS: Record<UserRole, string> = { admin: '👑 Admin', teacher: '🧑‍🏫 Teacher', student: '🎓 Student' };

export default function AdminPanelPage({ currentUser, onBack, theme }: Props) {
  const th = getTheme(theme);
  const [users, setUsers] = useState<User[]>(() => getUsers());
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editDisplay, setEditDisplay] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('teacher');
  const [editPw, setEditPw] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [activeTab, setActiveTab] = useState<'users' | 'overview'>('users');

  const reload = () => setUsers(getUsers());

  const games = getGames();
  const folders = getFolders();
  const results = getResults();

  const startEdit = (u: User) => { setEditingUser(u); setEditDisplay(u.displayName); setEditRole(u.role); setEditPw(''); };
  const saveEdit = () => {
    if (!editingUser) return;
    updateUser(editingUser.id, { displayName: editDisplay, role: editRole, ...(editPw ? { password: editPw } : {}) });
    setEditingUser(null); reload();
  };
  const handleDelete = (u: User) => {
    if (u.id === currentUser.id) { alert("You can't delete your own account"); return; }
    if (confirm(`Delete ${u.displayName} (${u.email})? This cannot be undone.`)) { deleteUser(u.id); reload(); }
  };

  const filtered = users.filter(u =>
    (roleFilter === 'all' || u.role === roleFilter) &&
    (u.email.toLowerCase().includes(search.toLowerCase()) ||
     u.displayName.toLowerCase().includes(search.toLowerCase()))
  );

  const card: React.CSSProperties = {
    background: th.cardBg, border: `1px solid ${th.cardBorder}`, borderRadius: 20,
    padding: '22px 24px', boxShadow: th.shadow,
  };

  const tabBtn = (id: typeof activeTab, label: string) => (
    <button onClick={() => setActiveTab(id)} style={{
      background: activeTab === id ? th.accentLight : 'transparent',
      border: activeTab === id ? `1px solid ${th.accent}50` : '1px solid transparent',
      borderRadius: 12, padding: '10px 20px', color: activeTab === id ? th.accent : th.textMuted,
      cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: activeTab === id ? 700 : 400,
    }}>{label}</button>
  );

  return (
    <div style={{ minHeight: '100vh', padding: '32px 36px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <button onClick={onBack} style={{ background: th.cardBg, border: `1px solid ${th.cardBorder}`, color: th.text, borderRadius: 12, padding: '9px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>← Back</button>
        <div>
          <h1 style={{ color: th.text, fontSize: 26, fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>👑</span> Admin Panel
          </h1>
          <p style={{ color: th.textMuted, fontSize: 13, margin: '3px 0 0' }}>Logged in as {currentUser.displayName} · {currentUser.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {tabBtn('overview', '📊 Overview')}
        {tabBtn('users', `👥 Users (${users.length})`)}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
            {[
              { icon: '👥', label: 'Total Users', value: users.length, sub: `${users.filter(u => u.role === 'teacher').length} teachers`, color: '#c084fc' },
              { icon: '🎮', label: 'Total Games', value: games.length, sub: 'across all teachers', color: '#7dd3fc' },
              { icon: '📁', label: 'Folders', value: folders.length, sub: 'created by teachers', color: '#6ee7b7' },
              { icon: '📊', label: 'Sessions Played', value: results.length, sub: 'live + solo', color: '#fbbf24' },
            ].map(s => (
              <div key={s.label} style={{ ...card }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>{s.icon}</div>
                <div style={{ color: s.color, fontSize: 36, fontWeight: 900 }}>{s.value}</div>
                <div style={{ color: th.text, fontWeight: 700, fontSize: 15, marginTop: 2 }}>{s.label}</div>
                <div style={{ color: th.textMuted, fontSize: 12, marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Recent users */}
          <div style={card}>
            <h3 style={{ color: th.text, fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Recent Accounts</h3>
            {[...users].reverse().slice(0, 5).map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${th.divider}` }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: `${ROLE_COLORS[u.role]}25`, border: `2px solid ${ROLE_COLORS[u.role]}60`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: ROLE_COLORS[u.role], fontSize: 15 }}>
                  {u.displayName[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: th.text, fontWeight: 600, fontSize: 14 }}>{u.displayName}</div>
                  <div style={{ color: th.textMuted, fontSize: 12 }}>{u.email}</div>
                </div>
                <span style={{ background: `${ROLE_COLORS[u.role]}20`, border: `1px solid ${ROLE_COLORS[u.role]}50`, borderRadius: 8, padding: '3px 10px', fontSize: 11, color: ROLE_COLORS[u.role], fontWeight: 700 }}>
                  {ROLE_LABELS[u.role]}
                </span>
                <div style={{ color: th.textFaint, fontSize: 11 }}>{new Date(u.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>

          {/* Recent results */}
          {results.length > 0 && (
            <div style={{ ...card, marginTop: 20 }}>
              <h3 style={{ color: th.text, fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Recent Game Sessions</h3>
              {[...results].reverse().slice(0, 5).map(r => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${th.divider}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: th.text, fontWeight: 600, fontSize: 14 }}>{r.gameTitle}</div>
                    <div style={{ color: th.textMuted, fontSize: 12 }}>{r.leaderboard.length} players · {r.sessionType === 'live' ? '⚔️ Live' : '📚 Solo'}</div>
                  </div>
                  {r.leaderboard[0] && <div style={{ color: '#fbbf24', fontWeight: 800, fontSize: 14 }}>🥇 {r.leaderboard[0].nickname} · {r.leaderboard[0].score}pts</div>}
                  <div style={{ color: th.textFaint, fontSize: 11 }}>{new Date(r.playedAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <div style={{ ...card, marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="🔍 Search by name or email..."
                style={{ flex: 1, minWidth: 200, background: th.inputBg, border: `1.5px solid ${th.inputBorder}`, borderRadius: 12, padding: '11px 16px', color: th.text, fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
              <div style={{ display: 'flex', gap: 6 }}>
                {(['all', 'admin', 'teacher', 'student'] as const).map(r => (
                  <button key={r}
                    style={{ background: roleFilter === r ? th.accentLight : th.badge, border: `1px solid ${roleFilter === r ? th.accent + '50' : th.cardBorder}`, borderRadius: 8, padding: '8px 14px', color: roleFilter === r ? th.accent : th.textMuted, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: roleFilter === r ? 700 : 600 }}
                    onClick={() => setRoleFilter(r)}>
                    {r === 'all' ? 'All' : ROLE_LABELS[r]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={card}>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr auto', gap: 12, padding: '0 0 12px', borderBottom: `2px solid ${th.divider}`, marginBottom: 4 }}>
              {['Name', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                <div key={h} style={{ color: th.textFaint, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>{h.toUpperCase()}</div>
              ))}
            </div>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: th.textFaint }}>No users found</div>
            ) : filtered.map(u => (
              <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr auto', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${th.divider}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${ROLE_COLORS[u.role]}20`, border: `2px solid ${ROLE_COLORS[u.role]}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: ROLE_COLORS[u.role], fontSize: 13, flexShrink: 0 }}>
                    {u.displayName[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ color: th.text, fontWeight: 600, fontSize: 14 }}>{u.displayName}</div>
                    {u.id === currentUser.id && <div style={{ color: th.accent, fontSize: 11, fontWeight: 700 }}>You</div>}
                  </div>
                </div>
                <div style={{ color: th.textMuted, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</div>
                <div>
                  <span style={{ background: `${ROLE_COLORS[u.role]}15`, border: `1px solid ${ROLE_COLORS[u.role]}40`, borderRadius: 8, padding: '3px 10px', fontSize: 11, color: ROLE_COLORS[u.role], fontWeight: 700 }}>
                    {ROLE_LABELS[u.role]}
                  </span>
                </div>
                <div style={{ color: th.textFaint, fontSize: 12 }}>{new Date(u.createdAt).toLocaleDateString('en-GB')}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => startEdit(u)} style={{ background: th.accentLight, border: `1px solid ${th.accent}40`, color: th.accent, borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600 }}>✏️ Edit</button>
                  {u.id !== currentUser.id && (
                    <button onClick={() => handleDelete(u)} style={{ background: th.danger, border: `1px solid ${th.dangerText}40`, color: th.dangerText, borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>🗑</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editingUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 24 }}>
          <div style={{ background: th.modalBg, border: `1px solid ${th.cardBorder}`, borderRadius: 24, padding: 32, maxWidth: 440, width: '100%', boxShadow: th.shadow }}>
            <h3 style={{ color: th.text, fontWeight: 800, fontSize: 18, marginBottom: 6 }}>✏️ Edit User</h3>
            <p style={{ color: th.textMuted, fontSize: 13, marginBottom: 24 }}>{editingUser.email}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ color: th.textMuted, fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Full Name</label>
                <input value={editDisplay} onChange={e => setEditDisplay(e.target.value)}
                  style={{ width: '100%', background: th.inputBg, border: `1.5px solid ${th.inputBorder}`, borderRadius: 12, padding: '12px 14px', color: th.text, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ color: th.textMuted, fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Role</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['teacher', 'student', 'admin'] as UserRole[]).map(r => (
                    <button key={r} onClick={() => setEditRole(r)} style={{
                      flex: 1, background: editRole === r ? `${ROLE_COLORS[r]}20` : th.badge,
                      border: `2px solid ${editRole === r ? ROLE_COLORS[r] : 'transparent'}`,
                      borderRadius: 10, padding: '8px 6px', color: editRole === r ? ROLE_COLORS[r] : th.textMuted,
                      cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700,
                    }}>
                      {ROLE_LABELS[r]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ color: th.textMuted, fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>New Password <span style={{ color: th.textFaint, fontWeight: 400 }}>(leave blank to keep current)</span></label>
                <input type="password" value={editPw} onChange={e => setEditPw(e.target.value)}
                  placeholder="Enter new password..."
                  style={{ width: '100%', background: th.inputBg, border: `1.5px solid ${th.inputBorder}`, borderRadius: 12, padding: '12px 14px', color: th.text, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button onClick={() => setEditingUser(null)} style={{ flex: 1, background: th.badge, border: `1px solid ${th.cardBorder}`, color: th.textMuted, borderRadius: 12, padding: '12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15 }}>Cancel</button>
              <button onClick={saveEdit} style={{ flex: 2, background: 'linear-gradient(135deg, #c084fc, #a78bfa)', color: 'white', border: 'none', borderRadius: 12, padding: '12px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                ✓ Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
