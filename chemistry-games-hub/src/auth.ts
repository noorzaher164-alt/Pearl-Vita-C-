// Client-side auth module — no password ever stored here.
// Token is stored in sessionStorage (cleared when the tab/browser closes).
// The actual password check happens in /.netlify/functions/admin-auth.

const SESSION_KEY = 'chem_session_token';
const SESSION_DAY_KEY = 'chem_session_day';

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

export function isAuthed(): boolean {
  const token = sessionStorage.getItem(SESSION_KEY);
  const day = sessionStorage.getItem(SESSION_DAY_KEY);
  return !!token && day === todayUtc();
}

export function clearAuth() {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_DAY_KEY);
  // Also wipe any legacy localStorage flags from the old implementation
  localStorage.removeItem('chem_admin_auth');
  localStorage.removeItem('chem_dash_auth');
}

export async function login(password: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/.netlify/functions/admin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || 'Login failed' };
    sessionStorage.setItem(SESSION_KEY, data.token);
    sessionStorage.setItem(SESSION_DAY_KEY, data.day);
    return { ok: true };
  } catch {
    return { ok: false, error: 'Network error — could not reach the server' };
  }
}
