import type { User, UserRole } from './types';

const USERS_KEY = 'cgh_users';
const SESSION_KEY = 'cgh_user_session';

const ADMIN_EMAIL = 'noorzaher164@gmail.com';
const ADMIN_PASSWORD = 'Nourhan@2025';
const ADMIN_ID = 'admin_nourhan_2025';

export function seedAdmin(): void {
  const users = getRawUsers();
  if (!users.find(u => u.id === ADMIN_ID)) {
    const admin: User = {
      id: ADMIN_ID, email: ADMIN_EMAIL, password: ADMIN_PASSWORD,
      displayName: 'Ms. Nourhan Zaher', role: 'admin', createdAt: new Date().toISOString(),
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([admin, ...users]));
  }
}

function getRawUsers(): User[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch { return []; }
}

export function getUsers(): User[] {
  seedAdmin();
  return getRawUsers();
}

export function isAdmin(user: User): boolean { return user.role === 'admin'; }

export function registerUser(
  email: string, password: string, displayName: string, role: UserRole = 'teacher',
): { user?: User; error?: string } {
  const e = email.trim().toLowerCase();
  if (!e.includes('@') || !e.includes('.')) return { error: 'Please enter a valid email address' };
  if (password.length < 6) return { error: 'Password must be at least 6 characters' };
  if (!displayName.trim()) return { error: 'Please enter your full name' };
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === e)) return { error: 'An account with this email already exists' };
  const user: User = {
    id: crypto.randomUUID(), email: e, password, displayName: displayName.trim(), role, createdAt: new Date().toISOString(),
  };
  localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
  return { user };
}

export function loginUser(email: string, password: string): User | null {
  return getUsers().find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password) ?? null;
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

export function updateUser(id: string, updates: Partial<Pick<User, 'displayName' | 'role' | 'password'>>): void {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return;
  users[idx] = { ...users[idx], ...updates };
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function deleteUser(id: string): void {
  if (id === ADMIN_ID) return; // can't delete admin
  const users = getUsers().filter(u => u.id !== id);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
