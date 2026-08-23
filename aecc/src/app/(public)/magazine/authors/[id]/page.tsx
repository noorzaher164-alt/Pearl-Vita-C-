import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { ArticleCard } from '@/components/magazine/ArticleCard';
import { NavIcon } from '@/components/portal/NavIcon';
import { SparkRule } from '@/components/brand/Motifs';
import { Avatar, EmptyState, Pill } from '@/components/ui';
import { getAuthorProfile } from '@/lib/db/queries';
import { fill, formatNumber, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Author' };

export default async function AuthorPage({ params }: { params: Promise<{ id: string }> }) {
  const { locale, d } = await getT();
  const { id } = await params;

  const data = await getAuthorProfile(id);
  if (!data) notFound();

  const { profile, articles, badges } = data;
  const name = locale === 'ar' && profile.pen_name_ar ? profile.pen_name_ar : profile.pen_name_en;
  const bio = pick(locale, profile as unknown as Record<string, unknown>, 'bio');

  return (
    <div className="shell py-12 md:py-16">
      <Link
        href="/magazine"
        className="mb-6 inline-flex items-center gap-2 text-small font-semibold text-plum transition hover:text-plum-dark"
      >
        <ArrowLeft className="h-4 w-4 rtl-flip" aria-hidden="true" strokeWidth={1.75} />
        {d.magazine.backToMagazine}
      </Link>

      <header className="mb-10 flex flex-wrap items-start gap-6">
        <Avatar name={name} src={data.member?.avatar_url} size={88} />
        <div className="min-w-0 flex-1">
          <p className="eyebrow mb-2">{d.magazine.author}</p>
          <h1 className="font-brand text-h1 text-plum">{name}</h1>
          {profile.is_student && profile.grade ? (
            <p className="mt-1 text-small text-ink-muted">
              {d.magazine.byStudent} · {profile.grade}
            </p>
          ) : null}
          {bio ? <p className="mt-4 max-w-prose text-body text-ink-muted">{bio}</p> : null}

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Pill tone="plum">
              {fill(d.magazine.articleCount, { count: formatNumber(articles.length, locale) })}
            </Pill>
            {badges.map(({ award, badge }) =>
              badge ? (
                <Pill key={award.id} tone="gold" icon={<NavIcon name={badge.icon} />}>
                  {pick(locale, badge as unknown as Record<string, unknown>, 'name')}
                </Pill>
              ) : null,
            )}
          </div>
        </div>
      </header>

      <SparkRule className="mb-10" />

      <h2 className="mb-6 font-brand text-h2 text-plum">{d.magazine.articlesWritten}</h2>
      {articles.length === 0 ? (
        <EmptyState icon={<BookOpen />} title={d.magazine.noArticles} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} locale={locale} d={d} />
          ))}
        </div>
      )}
    </div>
  );
}
