import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BookMarked, Clock, User } from 'lucide-react';
import { ArticleBody } from '@/components/magazine/ArticleBody';
import { ArticleCard, authorName } from '@/components/magazine/ArticleCard';
import { SparkRule } from '@/components/brand/Motifs';
import { Avatar, Card, Pill } from '@/components/ui';
import { getArticleBySlug, listArticles } from '@/lib/db/queries';
import { accentTone } from '@/lib/domain/labels';
import { fill, formatDate, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: 'Article' };
  return {
    title: article.title_en,
    description: article.subtitle_en,
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { locale, d } = await getT();
  const { slug } = await params;

  const article = await getArticleBySlug(slug);
  // Only published articles are readable on the public site; drafts and submissions
  // stay behind the editorial dashboard.
  if (!article || article.status !== 'published') notFound();

  const related = (await listArticles({ status: 'published' }))
    .filter((a) => a.id !== article.id && a.category_id === article.category_id)
    .slice(0, 3);

  const title = pick(locale, article as unknown as Record<string, unknown>, 'title');
  const subtitle = pick(locale, article as unknown as Record<string, unknown>, 'subtitle');
  const author = authorName(article, locale);
  const authorBio = article.author_profile
    ? pick(locale, article.author_profile as unknown as Record<string, unknown>, 'bio')
    : '';

  return (
    <article>
      {/* Cover */}
      <div className="relative aspect-[21/9] max-h-[26rem] w-full overflow-hidden bg-blush">
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

      <div className="shell -mt-16 pb-16">
        <Card className="mx-auto max-w-3xl p-8 md:p-12">
          <Link
            href="/magazine"
            className="mb-6 inline-flex items-center gap-2 text-caption font-semibold text-plum transition hover:text-plum-dark"
          >
            <ArrowLeft className="h-4 w-4 rtl-flip" aria-hidden="true" strokeWidth={1.75} />
            {d.magazine.backToMagazine}
          </Link>

          <header>
            {article.category ? (
              <Link href={`/magazine/category/${article.category.slug}`} className="inline-block">
                <Pill tone={accentTone(article.category.accent)}>
                  {pick(locale, article.category as unknown as Record<string, unknown>, 'name')}
                </Pill>
              </Link>
            ) : null}

            <h1 className="mt-4 font-brand text-[2.125rem] leading-[1.15] text-plum md:text-[2.75rem]">
              {title}
            </h1>

            {subtitle ? (
              <p className="mt-4 font-brand text-[1.25rem] italic leading-relaxed text-ink-muted">
                {subtitle}
              </p>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3 border-y border-line py-4">
              <span className="flex items-center gap-2">
                <Avatar name={author} src={article.author?.avatar_url} size={36} />
                <span>
                  <span className="block text-small font-semibold text-plum">{author}</span>
                  <span className="block text-caption text-ink-muted">
                    {article.author_profile?.is_student
                      ? `${d.magazine.byStudent}${article.author_profile.grade ? ` · ${article.author_profile.grade}` : ''}`
                      : d.roles.adminShort}
                  </span>
                </span>
              </span>

              <span className="ms-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-ink-muted">
                {article.published_at ? (
                  <span>{formatDate(article.published_at, locale)}</span>
                ) : null}
                <span className="text-rose-gold" aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={1.75} />
                  {fill(d.magazine.readingTime, { minutes: article.reading_minutes })}
                </span>
              </span>
            </div>
          </header>

          <div className="mt-10">
            <ArticleBody
              blocks={article.blocks}
              locale={locale}
              calloutLabel={d.magazine.title}
            />
          </div>

          {article.references.length > 0 ? (
            <section className="mt-14" aria-labelledby="article-references">
              <SparkRule className="mb-8" />
              <h2
                id="article-references"
                className="mb-4 flex items-center gap-2 font-brand text-h3 text-plum"
              >
                <BookMarked className="h-4 w-4 text-rose-gold" aria-hidden="true" strokeWidth={1.75} />
                {d.magazine.references}
              </h2>
              <ol className="grid gap-2">
                {article.references.map((reference, index) => (
                  <li key={index} className="flex gap-3 text-small leading-relaxed text-ink-muted">
                    <span className="shrink-0 font-brand text-rose-soft tabular-nums">{index + 1}.</span>
                    <span>{reference}</span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {/* Author card */}
          <section className="mt-14 rounded-card border border-line bg-blush p-6" aria-labelledby="article-author">
            <h2 id="article-author" className="eyebrow mb-4">
              {d.magazine.aboutAuthor}
            </h2>
            <div className="flex flex-wrap items-start gap-4">
              <Avatar name={author} src={article.author?.avatar_url} size={56} />
              <div className="min-w-0 flex-1">
                <p className="font-brand text-h3 text-plum">{author}</p>
                {authorBio ? (
                  <p className="mt-2 text-small leading-relaxed text-ink-muted">{authorBio}</p>
                ) : null}
                <Link
                  href={`/magazine/authors/${article.author_id}`}
                  className="mt-3 inline-flex items-center gap-1.5 text-caption font-semibold text-plum underline decoration-rose-gold/60 underline-offset-4"
                >
                  <User className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={1.75} />
                  {d.magazine.articlesWritten}
                </Link>
              </div>
            </div>
          </section>
        </Card>

        {related.length > 0 ? (
          <section className="mx-auto mt-16 max-w-5xl" aria-labelledby="article-related">
            <h2 id="article-related" className="mb-6 font-brand text-h2 text-plum">
              {d.magazine.relatedArticles}
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {related.map((item) => (
                <ArticleCard key={item.id} article={item} locale={locale} d={d} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </article>
  );
}
