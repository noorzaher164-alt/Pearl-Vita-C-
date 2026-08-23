import Link from 'next/link';
import { Clock } from 'lucide-react';
import { Card, Pill } from '@/components/ui';
import { accentTone } from '@/lib/domain/labels';
import type { ArticleView } from '@/lib/db/queries';
import { fill, formatDate, pick, type Dictionary, type Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';

function authorName(article: ArticleView, locale: Locale): string {
  if (article.author_profile) {
    return locale === 'ar' && article.author_profile.pen_name_ar
      ? article.author_profile.pen_name_ar
      : article.author_profile.pen_name_en;
  }
  if (!article.author) return '';
  return locale === 'ar' && article.author.full_name_ar
    ? article.author.full_name_ar
    : article.author.full_name_en;
}

/** The large editorial hero used for the featured story on the magazine homepage. */
export function FeaturedArticle({
  article,
  locale,
  d,
}: {
  article: ArticleView;
  locale: Locale;
  d: Dictionary;
}) {
  return (
    <Card as="article" className="overflow-hidden lg:grid lg:grid-cols-2">
      <div className="relative aspect-[16/10] bg-blush lg:aspect-auto lg:min-h-[26rem]">
        {article.cover_image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={article.cover_image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            aria-hidden="true"
          />
        ) : null}
      </div>

      <div className="flex flex-col justify-center p-8 lg:p-12">
        <p className="eyebrow mb-4">{d.magazine.featured}</p>

        {article.category ? (
          <span className="mb-4 w-fit">
            <Pill tone={accentTone(article.category.accent)}>
              {pick(locale, article.category as unknown as Record<string, unknown>, 'name')}
            </Pill>
          </span>
        ) : null}

        <h2 className="font-brand text-[2rem] leading-[1.15] text-plum md:text-[2.5rem]">
          <Link
            href={`/magazine/article/${article.slug}`}
            className="transition hover:text-plum-dark"
          >
            {pick(locale, article as unknown as Record<string, unknown>, 'title')}
          </Link>
        </h2>

        <p className="mt-4 max-w-prose text-[1.0625rem] leading-relaxed text-ink-muted">
          {pick(locale, article as unknown as Record<string, unknown>, 'subtitle')}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-caption text-ink-muted">
          <span className="font-semibold text-plum">{authorName(article, locale)}</span>
          {article.author_profile?.grade ? (
            <>
              <span className="text-rose-gold" aria-hidden="true">·</span>
              <span>{article.author_profile.grade}</span>
            </>
          ) : null}
          {article.published_at ? (
            <>
              <span className="text-rose-gold" aria-hidden="true">·</span>
              <span>{formatDate(article.published_at, locale)}</span>
            </>
          ) : null}
          <span className="text-rose-gold" aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={1.75} />
            {fill(d.magazine.readingTime, { minutes: article.reading_minutes })}
          </span>
        </div>

        <Link
          href={`/magazine/article/${article.slug}`}
          className="btn btn-primary mt-8 w-fit"
        >
          {d.common.readMore}
        </Link>
      </div>
    </Card>
  );
}

/** The standard article card used across listings. */
export function ArticleCard({
  article,
  locale,
  d,
  layout = 'stacked',
}: {
  article: ArticleView;
  locale: Locale;
  d: Dictionary;
  layout?: 'stacked' | 'row';
}) {
  const title = pick(locale, article as unknown as Record<string, unknown>, 'title');
  const subtitle = pick(locale, article as unknown as Record<string, unknown>, 'subtitle');

  return (
    <Card
      as="article"
      className={cn('overflow-hidden', layout === 'row' ? 'flex gap-0 sm:flex-row' : 'flex flex-col')}
    >
      <div
        className={cn(
          'shrink-0 bg-blush',
          layout === 'row' ? 'hidden w-40 sm:block' : 'aspect-[16/9] w-full',
        )}
      >
        {article.cover_image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={article.cover_image}
            alt=""
            className="h-full w-full object-cover"
            aria-hidden="true"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-6">
        {article.category ? (
          <span className="mb-3 w-fit">
            <Pill tone={accentTone(article.category.accent)}>
              {pick(locale, article.category as unknown as Record<string, unknown>, 'name')}
            </Pill>
          </span>
        ) : null}

        <h3 className="font-brand text-h3 leading-snug text-plum">
          <Link
            href={`/magazine/article/${article.slug}`}
            className="transition hover:text-plum-dark"
          >
            {title}
          </Link>
        </h3>

        {subtitle ? (
          <p className="mt-2 line-clamp-2 flex-1 text-small leading-relaxed text-ink-muted">
            {subtitle}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-caption text-ink-faint">
          <span className="font-semibold text-ink-muted">{authorName(article, locale)}</span>
          {article.published_at ? (
            <>
              <span className="text-rose-gold" aria-hidden="true">·</span>
              <span>{formatDate(article.published_at, locale)}</span>
            </>
          ) : null}
          <span className="text-rose-gold" aria-hidden="true">·</span>
          <span>{fill(d.magazine.readingTime, { minutes: article.reading_minutes })}</span>
        </div>
      </div>
    </Card>
  );
}

export { authorName };
