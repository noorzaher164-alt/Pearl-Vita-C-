export const LOCALES = ['en', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_COOKIE = 'aecc_locale';

export type Direction = 'ltr' | 'rtl';

export const LOCALE_META: Record<
  Locale,
  { label: string; nativeLabel: string; dir: Direction; htmlLang: string; intl: string }
> = {
  en: { label: 'English', nativeLabel: 'English', dir: 'ltr', htmlLang: 'en', intl: 'en-GB' },
  ar: { label: 'Arabic', nativeLabel: 'العربية', dir: 'rtl', htmlLang: 'ar', intl: 'ar' },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

export function dirOf(locale: Locale): Direction {
  return LOCALE_META[locale].dir;
}

/** Pick the `<field>_en` / `<field>_ar` variant of a bilingual record. */
export function pick<T extends Record<string, unknown>>(
  locale: Locale,
  record: T,
  field: string,
): string {
  const localised = record[`${field}_${locale}`];
  if (typeof localised === 'string' && localised.trim().length > 0) return localised;
  const fallback = record[`${field}_en`] ?? record[field];
  return typeof fallback === 'string' ? fallback : '';
}

/* -------------------------------------------------------------------------- */
/* Locale-aware formatting (guide §11: dates and numbers follow the locale)    */
/* -------------------------------------------------------------------------- */

export function formatDate(
  value: string | Date,
  locale: Locale,
  opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' },
): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(LOCALE_META[locale].intl, { ...opts, timeZone: 'UTC' }).format(date);
}

export function formatTime(value: string | Date, locale: Locale): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(LOCALE_META[locale].intl, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(date);
}

export function formatDateTime(value: string | Date, locale: Locale): string {
  return `${formatDate(value, locale)} · ${formatTime(value, locale)}`;
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(LOCALE_META[locale].intl).format(value);
}

export function formatPercent(value: number, locale: Locale): string {
  return new Intl.NumberFormat(LOCALE_META[locale].intl, {
    style: 'percent',
    maximumFractionDigits: 0,
  }).format(value / 100);
}

/** "3 days ago" / "in 2 weeks" — used for activity feeds. */
export function formatRelative(value: string | Date, locale: Locale, now = new Date()): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  const diffMs = date.getTime() - now.getTime();
  const rtf = new Intl.RelativeTimeFormat(LOCALE_META[locale].intl, { numeric: 'auto' });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31_536_000_000],
    ['month', 2_592_000_000],
    ['week', 604_800_000],
    ['day', 86_400_000],
    ['hour', 3_600_000],
    ['minute', 60_000],
  ];
  for (const [unit, ms] of units) {
    if (Math.abs(diffMs) >= ms) return rtf.format(Math.round(diffMs / ms), unit);
  }
  return rtf.format(Math.round(diffMs / 1000), 'second');
}
