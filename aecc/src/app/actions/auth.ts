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

/* -------------------------------------------------------------------------- */
/* Sign-up                                                                    */
/* -------------------------------------------------------------------------- */

export interface SignUpState {
  error?: 'validation' | 'username_taken' | 'email_taken';
  values?: { username?: string; email?: string; fullNameEn?: string; fullNameAr?: string; grade?: string };
}

const signUpSchema = z.object({
  username: z.string().trim().min(3).max(64).regex(/^[a-z][a-z0-9._-]*$/i),
  email: z.string().trim().email().max(200),
  password: z.string().min(6).max(200),
  confirmPassword: z.string().min(1),
  fullNameEn: z.string().trim().min(2).max(120),
  fullNameAr: z.string().trim().max(120).optional().default(''),
  grade: z.enum(['Grade 10', 'Grade 11', 'Grade 12']),
});

export async function signUp(_prev: SignUpState, formData: FormData): Promise<SignUpState> {
  const parsed = signUpSchema.safeParse({
    username: formData.get('username'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    fullNameEn: formData.get('fullNameEn'),
    fullNameAr: formData.get('fullNameAr') || '',
    grade: formData.get('grade'),
  });

  if (!parsed.success) return { error: 'validation' };
  const { username, email, password, confirmPassword, fullNameEn, fullNameAr, grade } = parsed.data;

  if (password !== confirmPassword) {
    return { error: 'validation', values: { username, email, fullNameEn, fullNameAr, grade } };
  }

  const database = await db();

  if (database.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    return { error: 'username_taken', values: { username, email, fullNameEn, fullNameAr, grade } };
  }
  if (database.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return { error: 'email_taken', values: { username, email, fullNameEn, fullNameAr, grade } };
  }

  const { createUser } = await import('@/lib/db/mutations');
  const userId = await createUser({
    actorId: 'system',
    username,
    email,
    password,
    fullNameEn,
    fullNameAr: fullNameAr || fullNameEn,
    grade,
    role: 'member',
    committeeId: null,
  });

  const role: RoleKey = 'member';
  const { token, maxAge } = createSessionToken({ sub: userId, username, role }, false);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, { ...SESSION_COOKIE_OPTIONS, maxAge });

  redirect('/portal');
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
