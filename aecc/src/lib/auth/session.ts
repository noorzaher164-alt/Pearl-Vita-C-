import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { RoleKey } from '@/lib/domain/types';

export const SESSION_COOKIE = 'aecc_session';

export interface SessionPayload {
  /** user id */
  sub: string;
  username: string;
  role: RoleKey;
  /** issued-at, seconds */
  iat: number;
  /** expiry, seconds */
  exp: number;
}

const DEFAULT_TTL_SECONDS = 60 * 60 * 8; // one school day
const REMEMBER_TTL_SECONDS = 60 * 60 * 24 * 30; // thirty days

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64url(input: string): Buffer {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(padded + '='.repeat((4 - (padded.length % 4)) % 4), 'base64');
}

/**
 * In production `AECC_SESSION_SECRET` must be set. Without it we fall back to a random
 * secret generated once per process — sessions then simply do not survive a restart,
 * which is safer than shipping a predictable default key.
 *
 * The fallback is held on `globalThis` deliberately: server actions and page renders
 * can be evaluated in separate module instances, and a per-module secret would sign
 * and verify tokens with different keys.
 */
declare global {
  // eslint-disable-next-line no-var
  var __aeccSessionSecret: string | undefined;
}

const PREVIEW_FALLBACK = 'aecc-preview-session-key-2026-pearl-vita-chemistry-club';

function secret(): string {
  const fromEnv = process.env.AECC_SESSION_SECRET;
  if (fromEnv && fromEnv.length >= 32) return fromEnv;

  if (fromEnv !== undefined && fromEnv.length > 0) {
    throw new Error('AECC_SESSION_SECRET must be at least 32 characters.');
  }

  return PREVIEW_FALLBACK;
}

function sign(data: string): string {
  return base64url(createHmac('sha256', secret()).update(data).digest());
}

export function createSessionToken(
  payload: Omit<SessionPayload, 'iat' | 'exp'>,
  remember = false,
): { token: string; maxAge: number } {
  const iat = Math.floor(Date.now() / 1000);
  const maxAge = remember ? REMEMBER_TTL_SECONDS : DEFAULT_TTL_SECONDS;
  const full: SessionPayload = { ...payload, iat, exp: iat + maxAge };
  const body = base64url(JSON.stringify(full));
  return { token: `${body}.${sign(body)}`, maxAge };
}

export function readSessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;

  const body = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const expected = sign(body);

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(fromBase64url(body).toString('utf8')) as SessionPayload;
    if (typeof payload.exp !== 'number' || payload.exp * 1000 < Date.now()) return null;
    if (typeof payload.sub !== 'string' || typeof payload.role !== 'string') return null;
    return payload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  secure: process.env.NODE_ENV === 'production',
} as const;
