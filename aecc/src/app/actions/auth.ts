'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { verifyPassword } from '@/lib/auth/password';
import { SESSION_COOKIE, SESSION_COOKIE_OPTIONS, createSessionToken } from '@/lib/auth/session';
import { db } from '@/lib/db/store';
import { touchLastLogin } from '@/lib/db/mutations';
import type { RoleKey } from '@/lib/domain/types';

export interface LoginState {
  error?: 'invalid' | 'inactive' | 'validation';
  username?: string;
}

const loginSchema = z.object({
  username: z.string().trim().min(1).max(64),
  password: z.string().min(1).max(200),
  remember: z.string().optional(),
  next: z.string().optional(),
});

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password'),
    remember: formData.get('remember') ?? undefined,
    next: formData.get('next') ?? undefined,
  });

  if (!parsed.success) return { error: 'validation' };
  const { username, password, remember, next } = parsed.data;

  const database = await db();
  const user = database.users.find((u) => u.username.toLowerCase() === username.toLowerCase());

  // Always run the hash comparison so a missing account and a wrong password take a
  // comparable amount of time.
  const ok = user
    ? await verifyPassword(password, user.password_hash, user.password_salt)
    : await verifyPassword(password, 'f'.repeat(128), 'decoy');

  if (!user || !ok) return { error: 'invalid', username };
  if (user.status !== 'active') return { error: 'inactive', username };

  const role = (database.user_roles.find((r) => r.user_id === user.id)?.role_key ?? 'member') as RoleKey;
  const { token, maxAge } = createSessionToken(
    { sub: user.id, username: user.username, role },
    remember === 'on',
  );

  const store = await cookies();
  store.set(SESSION_COOKIE, token, { ...SESSION_COOKIE_OPTIONS, maxAge });

  await touchLastLogin(user.id);

  const destination = next && next.startsWith('/') && !next.startsWith('//') ? next : '/portal';
  redirect(destination);
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect('/login');
}

export interface ForgotState {
  sent?: boolean;
  error?: 'validation';
}

export async function requestPasswordReset(_prev: ForgotState, formData: FormData): Promise<ForgotState> {
  const username = String(formData.get('username') ?? '').trim();
  if (username.length === 0) return { error: 'validation' };

  // The response is intentionally identical whether or not the account exists, so the
  // form cannot be used to discover valid usernames. A supervisor completes the reset.
  const database = await db();
  const user = database.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  if (user) {
    const { recordAudit } = await import('@/lib/db/mutations');
    await recordAudit({
      actorId: user.id,
      action: 'user.request_reset',
      entity: 'users',
      entityId: user.id,
      summaryEn: 'Requested a password reset',
      summaryAr: 'طلب إعادة تعيين كلمة المرور',
    });
  }

  return { sent: true };
}
