import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>;

const KEY_LENGTH = 64;

/**
 * Passwords are hashed with scrypt and a per-user random salt. A plaintext password
 * is never written to the data layer, a log, or a response (guide §6 / §14).
 */
export async function hashPassword(
  plain: string,
  salt = randomBytes(16).toString('hex'),
): Promise<{ hash: string; salt: string }> {
  const derived = await scrypt(plain.normalize('NFKC'), salt, KEY_LENGTH);
  return { hash: derived.toString('hex'), salt };
}

/** Constant-time comparison so a wrong password cannot be timed character by character. */
export async function verifyPassword(
  plain: string,
  hash: string,
  salt: string,
): Promise<boolean> {
  if (!hash || !salt) return false;
  const derived = await scrypt(plain.normalize('NFKC'), salt, KEY_LENGTH);
  const stored = Buffer.from(hash, 'hex');
  if (stored.length !== derived.length) return false;
  return timingSafeEqual(stored, derived);
}

/** Readable temporary password for supervisor-issued resets. */
export function generateTemporaryPassword(): string {
  const words = ['Flask', 'Orbital', 'Isotope', 'Catalyst', 'Titration', 'Alkali', 'Beaker'];
  const word = words[Math.floor(Math.random() * words.length)];
  const digits = String(Math.floor(1000 + Math.random() * 9000));
  return `${word}-${digits}`;
}

export interface PasswordPolicyResult {
  valid: boolean;
  reason?: 'too_short' | 'too_common';
}

const COMMON = new Set(['password', '12345678', 'qwertyui', 'chemistry', 'aecc1234']);

export function checkPasswordPolicy(plain: string): PasswordPolicyResult {
  if (plain.length < 8) return { valid: false, reason: 'too_short' };
  if (COMMON.has(plain.toLowerCase())) return { valid: false, reason: 'too_common' };
  return { valid: true };
}
