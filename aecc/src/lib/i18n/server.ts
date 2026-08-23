import 'server-only';

import { cookies } from 'next/headers';
import { DEFAULT_LOCALE, LOCALE_COOKIE, getDictionary, isLocale, type Dictionary, type Locale } from './index';

/** Resolves the active locale from the cookie set by the language switcher. */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getT(): Promise<{ locale: Locale; d: Dictionary; dir: 'ltr' | 'rtl' }> {
  const locale = await getLocale();
  return { locale, d: getDictionary(locale), dir: locale === 'ar' ? 'rtl' : 'ltr' };
}
