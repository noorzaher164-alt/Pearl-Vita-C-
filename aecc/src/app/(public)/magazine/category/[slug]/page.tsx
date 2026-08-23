import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { ArticleCard } from '@/components/magazine/ArticleCard';
import { SparkRule } from '@/components/brand/Motifs';
import { EmptyState, Pill } from '@/components/ui';
import { listArticles, listCategories } from '@/lib/db/queries';
import { accentTone } from '@/lib/domain/labels';
import { fill, formatNumber, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Category' };

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { locale, d } = await getT();
  const { slug } = await params;

  const categories = await listCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const articles = await listArticles({ status: 'published', categorySlug: slug });
  const name = pick(locale, category as unknown as Record<string, unknown>, 'name');

  return (
    <div className="shell py-12 md:py-16">
      <Link
        href="/magazine"
        className="mb-6 inline-flex items-center gap-2 text-small font-semibold text-plum transition hover:text-plum-dark"
      >
        <ArrowLeft className="h-4 w-4 rtl-flip" aria-hidden="true" strokeWidth={1.75} />
        {d.magazine.backToMagazine}
      </Link>

      <header className="mb-10">
        <p className="eyebrow mb-3">{d.magazine.categories}</p>
        <h1 className="font-brand text-h1 text-plum">{name}</h1>
        <p className="mt-2 max-w-prose text-body text-ink-muted">
          {pick(locale, category as unknown as Record<string, unknown>, 'description')}
        </p>
        <p className="mt-4">
          <Pill tone={accentTone(category.accent)}>
            {fill(d.magazine.articleCount, { count: formatNumber(articles.length, locale) })}
          </Pill>
        </p>
        <SparkRule className="mt-8" />
      </header>

      {articles.length === 0 ? (
        <EmptyState icon={<BookOpen />} title={d.magazine.noArticles} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} locale={locale} d={d} />
          ))}
        </div>
      )}

      <nav className="mt-14 flex flex-wrap gap-2" aria-label={d.magazine.categories}>
        {categories
          .filter((c) => c.count > 0)
          .map((c) => (
            <Link key={c.id} href={`/magazine/category/${c.slug}`}>
              <Pill tone={c.slug === slug ? 'plum' : accentTone(c.accent)}>
                {pick(locale, c as unknown as Record<string, unknown>, 'name')}
              </Pill>
            </Link>
          ))}
      </nav>
    </div>
  );
}
