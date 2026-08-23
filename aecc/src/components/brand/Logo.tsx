import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Locale } from '@/lib/i18n';

/**
 * The approved AECC logo, rendered as an image asset.
 *
 * The brand guide is explicit: the logo must never be rebuilt in CSS or a substitute
 * font, and its aspect ratio and breathing space must be preserved. This component is
 * the only place the artwork is referenced, so those rules hold everywhere.
 *
 * The English artwork is used for `en` and the Arabic artwork for `ar`; the logo text
 * is never transliterated.
 */

const SOURCES: Record<Locale, Record<'sm' | 'md' | 'lg', string>> = {
  en: {
    sm: '/brand/aecc-logo-en-128.png',
    md: '/brand/aecc-logo-en-256.png',
    lg: '/brand/aecc-logo-en-512.png',
  },
  ar: {
    sm: '/brand/aecc-logo-ar-128.png',
    md: '/brand/aecc-logo-ar-256.png',
    lg: '/brand/aecc-logo-ar-512.png',
  },
};

interface LogoProps {
  locale: Locale;
  /** Rendered edge length in pixels. The artwork is square and never distorted. */
  size?: number;
  variant?: 'sm' | 'md' | 'lg';
  alt: string;
  className?: string;
  priority?: boolean;
}

export function Logo({ locale, size = 48, variant, alt, className, priority = false }: LogoProps) {
  const resolved = variant ?? (size <= 96 ? 'sm' : size <= 224 ? 'md' : 'lg');
  return (
    <Image
      src={SOURCES[locale][resolved]}
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      className={cn('block h-auto w-auto select-none', className)}
      style={{ width: size, height: size }}
    />
  );
}

/**
 * The compact lockup used in the sidebar and site headers: the approved mark at a
 * small size beside a typographic wordmark. The wordmark text is UI type — it never
 * attempts to reproduce the logo lettering.
 */
export function LogoLockup({
  locale,
  alt,
  title,
  subtitle,
  size = 44,
  tone = 'plum',
  className,
}: {
  locale: Locale;
  alt: string;
  title: string;
  subtitle?: string;
  size?: number;
  tone?: 'plum' | 'ivory';
  className?: string;
}) {
  return (
    <span className={cn('flex items-center gap-3', className)}>
      <span
        className="grid shrink-0 place-items-center overflow-hidden rounded-control bg-ivory"
        style={{ width: size, height: size }}
      >
        <Logo locale={locale} size={size} alt={alt} />
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            'block truncate font-brand text-[1.0625rem] leading-tight tracking-wide',
            tone === 'plum' ? 'text-plum' : 'text-ivory',
          )}
        >
          {title}
        </span>
        {subtitle ? (
          <span
            className={cn(
              'block truncate text-caption',
              tone === 'plum' ? 'text-ink-muted' : 'text-rose-soft',
            )}
          >
            {subtitle}
          </span>
        ) : null}
      </span>
    </span>
  );
}
