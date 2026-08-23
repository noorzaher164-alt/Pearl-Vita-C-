import { en, type Dictionary } from './en';
import { ar } from './ar';
import type { Locale } from './config';

export * from './config';
export type { Dictionary };

const DICTIONARIES: Record<Locale, Dictionary> = { en, ar };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? en;
}

/** Fill `{placeholder}` slots in a dictionary string. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
