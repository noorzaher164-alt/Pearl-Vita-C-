import { Languages } from 'lucide-react';
import { setLocale } from '@/app/actions/locale';
import { LOCALES, LOCALE_META, type Dictionary, type Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/**
 * Language switcher.
 *
 * Implemented as a form posting to a server action so it works without JavaScript and
 * so the locale is resolved on the server before `<html lang dir>` is rendered — the
 * layout genuinely flips to RTL rather than restyling after hydration.
 */
export function LanguageSwitcher({
  locale,
  d,
  tone = 'light',
  className,
}: {
  locale: Locale;
  d: Dictionary;
  tone?: 'light' | 'dark';
  className?: string;
}) {
  return (
    <form
      action={setLocale}
      className={cn(
        'inline-flex items-center gap-1 rounded-pill border p-1',
        tone === 'light' ? 'border-line bg-white' : 'border-white/20 bg-white/10',
        className,
      )}
      aria-label={d.a11y.languageSwitcher}
    >
      <span
        className={cn(
          'grid h-7 w-7 place-items-center rounded-pill',
          tone === 'light' ? 'text-mauve' : 'text-rose-soft',
        )}
        aria-hidden="true"
      >
        <Languages className="h-4 w-4" />
      </span>
      {LOCALES.map((option) => {
        const active = option === locale;
        return (
          <button
            key={option}
            type="submit"
            name="locale"
            value={option}
            aria-pressed={active}
            lang={LOCALE_META[option].htmlLang}
            className={cn(
              'rounded-pill px-3 py-1 text-caption font-semibold transition',
              active
                ? tone === 'light'
                  ? 'bg-plum text-white'
                  : 'bg-ivory text-plum'
                : tone === 'light'
                  ? 'text-ink-muted hover:bg-blush hover:text-plum'
                  : 'text-rose-soft hover:bg-white/10 hover:text-white',
            )}
          >
            {LOCALE_META[option].nativeLabel}
          </button>
        );
      })}
    </form>
  );
}
