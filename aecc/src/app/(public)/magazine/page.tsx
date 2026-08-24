import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, Eye } from 'lucide-react';
import { ArticleCard, FeaturedArticle } from '@/components/magazine/ArticleCard';
import { SparkRule } from '@/components/brand/Motifs';
import { Card, EmptyState, Pill } from '@/components/ui';
import { getFeaturedArticle, listArticles, listCategories, listIssues } from '@/lib/db/queries';
import { accentTone } from '@/lib/domain/labels';
import { fill, formatDate, formatNumber, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: 'Electronic Magazine',
  description:
    'The AECC Electronic Magazine — science writing by the students of Al Eman Chemistry Club.',
};

export default async function MagazineHomePage() {
  const { locale, d } = await getT();

  const [featured, published, categories, issues] = await Promise.all([
    getFeaturedArticle(),
    listArticles({ status: 'published' }),
    listCategories(),
    listIssues(true),
  ]);

  const latest = published.filter((article) => article.id !== featured?.id);
  const mostRead = [...published].sort((a, b) => b.views - a.views).slice(0, 5);
  const activeCategories = categories.filter((category) => category.count > 0);

  return (
    <>
      {/* Masthead */}
      <section className="border-b border-line bg-blush">
        <div className="shell py-14 text-center md:py-20">
          <p className="eyebrow">{d.brand.school}</p>
          <h1 className="mt-4 font-brand text-[2.5rem] leading-tight text-plum md:text-hero">
            {d.magazine.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-body text-ink-muted">{d.magazine.subtitle}</p>
          <SparkRule className="mx-auto mt-8 max-w-xs" />
        </div>
      </section>

      <div className="shell py-12 md:py-16">
        {featured ? (
          <section aria-labelledby="mag-featured" className="mb-16">
            <h2 id="mag-featured" className="sr-only">
              {d.magazine.featured}
            </h2>
            <FeaturedArticle article={featured} locale={locale} d={d} />
          </section>
        ) : null}

        <div className="grid gap-12 lg:grid-cols-[1fr_20rem]">
          {/* Latest */}
          <section aria-labelledby="mag-latest">
            <div className="mb-6 flex items-baseline justify-between gap-4">
              <h2 id="mag-latest" className="font-brand text-h2 text-plum">
                {d.magazine.latest}
              </h2>
              <span className="text-caption text-ink-muted">
                {fill(d.magazine.articleCount, { count: formatNumber(published.length, locale) })}
              </span>
            </div>

            {latest.length === 0 ? (
              <EmptyState icon={<BookOpen />} title={d.magazine.noArticles} />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {latest.map((article) => (
                  <ArticleCard key={article.id} article={article} locale={locale} d={d} />
                ))}
              </div>
            )}
          </section>

          {/* Rail */}
          <aside className="grid content-start gap-10">
            <section aria-labelledby="mag-categories">
              <h2 id="mag-categories" className="mb-4 font-brand text-h3 text-plum">
                {d.magazine.categories}
              </h2>
              <ul className="flex flex-wrap gap-2">
                {activeCategories.map((category) => (
                  <li key={category.id}>
                    <Link href={`/magazine/category/${category.slug}`} className="inline-block">
                      <Pill tone={accentTone(category.accent)}>
                        {pick(locale, category as unknown as Record<string, unknown>, 'name')}
                        <span className="opacity-70">{formatNumber(category.count, locale)}</span>
                      </Pill>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="mag-issues">
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <h2 id="mag-issues" className="font-brand text-h3 text-plum">
                  {d.magazine.issues}
                </h2>
                <Link
                  href="/magazine/issues"
                  className="text-caption font-semibold text-plum underline decoration-rose-gold/60 underline-offset-4"
                >
                  {d.common.viewAll}
                </Link>
              </div>
              <ul className="grid gap-3">
                {issues.map((issue) => (
                  <li key={issue.id}>
                    <Link
                      href={`/magazine/issues/${issue.number}`}
                      className="group flex gap-3 rounded-card border border-line bg-surface p-3 transition hover:border-rose"
                    >
                      <span className="h-16 w-14 shrink-0 overflow-hidden rounded-control bg-blush">
                        {issue.cover_image ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={issue.cover_image}
                            alt=""
                            className="h-full w-full object-cover"
                            aria-hidden="true"
                          />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-caption uppercase tracking-widest text-mauve">
                          {fill(d.magazine.issueNumber, {
                            number: formatNumber(issue.number, locale),
                          })}
                        </span>
                        <span className="mt-0.5 block truncate font-brand text-[1rem] text-plum">
                          {pick(locale, issue as unknown as Record<string, unknown>, 'title')}
                        </span>
                        {issue.published_on ? (
                          <span className="block text-caption text-ink-faint">
                            {formatDate(issue.published_on, locale)}
                          </span>
                        ) : null}
                      </span>
                      <ArrowRight
                        className="h-4 w-4 shrink-0 self-center text-mauve rtl-flip transition group-hover:text-rose"
                        aria-hidden="true"
                        strokeWidth={1.75}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {mostRead.length > 0 ? (
              <section aria-labelledby="mag-most-read">
                <h2 id="mag-most-read" className="mb-4 font-brand text-h3 text-plum">
                  {d.magazine.mostRead}
                </h2>
                <Card className="p-2">
                  <ol className="grid">
                    {mostRead.map((article, index) => (
                      <li key={article.id}>
                        <Link
                          href={`/magazine/article/${article.slug}`}
                          className="flex gap-3 rounded-control p-3 transition hover:bg-blush"
                        >
                          <span className="font-brand text-h3 leading-none text-rose-soft tabular-nums">
                            {formatNumber(index + 1, locale)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-small font-semibold leading-snug text-plum">
                              {pick(locale, article as unknown as Record<string, unknown>, 'title')}
                            </span>
                            <span className="mt-1 flex items-center gap-1.5 text-caption text-ink-faint">
                              <Eye className="h-3 w-3" aria-hidden="true" strokeWidth={1.75} />
                              {formatNumber(article.views, locale)} {d.magazine.views}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </Card>
              </section>
            ) : null}
          </aside>
        </div>
      </div>
    </>
  );
}
