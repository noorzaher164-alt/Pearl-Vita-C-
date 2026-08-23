'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { LOCALE_COOKIE, isLocale } from '@/lib/i18n';

/** Persists the chosen locale. The layout reads it to set `<html lang dir>`. */
export async function setLocale(formData: FormData): Promise<void> {
  const next = formData.get('locale');
  if (!isLocale(next)) return;

  const store = await cookies();
  store.set(LOCALE_COOKIE, next, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });

  revalidatePath('/', 'layout');
}
