import type { User } from './types';

const USERS_KEY = 'cgh_users';
const SESSION_KEY = 'cgh_user_session';

export function getUsers(): User[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch { return []; }
}

export function registerUser(
  username: string,
  password: string,
  displayName: string,
): { user?: User; error?: string } {
  const u = username.trim();
  if (u.length < 3) return { error: 'Username must be at least 3 characters' };
  if (password.length < 4) return { error: 'Password must be at least 4 characters' };
  const users = getUsers();
  if (users.find(x => x.username.toLowerCase() === u.toLowerCase())) {
    return { error: 'Username already taken — try another' };
  }
  const user: User = {
    id: crypto.randomUUID(),
    username: u,
    password,
    displayName: displayName.trim() || u,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
  return { user };
}

export function loginUser(username: string, password: string): User | null {
  return getUsers().find(
    u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password,
  ) ?? null;
}

export function getCurrentUser(): User | null {
  try {
    const id = localStorage.getItem(SESSION_KEY);
    if (!id) return null;
    return getUsers().find(u => u.id === id) ?? null;
  } catch { return null; }
}

export function setCurrentUser(user: User | null): void {
  if (user) localStorage.setItem(SESSION_KEY, user.id);
  else localStorage.removeItem(SESSION_KEY);
}
