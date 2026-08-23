import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { SparkRule } from '@/components/brand/Motifs';
import { Card, EmptyState, Pill } from '@/components/ui';
import { listIssues } from '@/lib/db/queries';
import { fill, formatDate, formatNumber, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Magazine issues' };

export default async function IssuesPage() {
  const { locale, d } = await getT();
  const issues = await listIssues(true);

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
        <p className="eyebrow mb-3">{d.magazine.title}</p>
        <h1 className="font-brand text-h1 text-plum">{d.magazine.issues}</h1>
        <SparkRule className="mt-8" />
      </header>

      {issues.length === 0 ? (
        <EmptyState icon={<BookOpen />} title={d.common.empty} />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {issues.map((issue) => (
            <Card as="article" key={issue.id} className="overflow-hidden sm:flex">
              <div className="aspect-[4/3] bg-blush sm:aspect-auto sm:w-48 sm:shrink-0">
                {issue.cover_image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={issue.cover_image} alt="" className="h-full w-full object-cover" aria-hidden="true" />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col p-6">
                <p className="eyebrow">
                  {fill(d.magazine.issueNumber, { number: formatNumber(issue.number, locale) })}
                </p>
                <h2 className="mt-2 font-brand text-h3 text-plum">
                  <Link href={`/magazine/issues/${issue.number}`} className="transition hover:text-plum-dark">
                    {pick(locale, issue as unknown as Record<string, unknown>, 'title')}
                  </Link>
                </h2>
                {issue.published_on ? (
                  <p className="mt-1 text-caption text-ink-muted">{formatDate(issue.published_on, locale)}</p>
                ) : null}
                <p className="mt-3 line-clamp-3 flex-1 text-small leading-relaxed text-ink-muted">
                  {pick(locale, issue as unknown as Record<string, unknown>, 'editors_note')}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Pill tone="soft">
                    {fill(d.magazine.articleCount, { count: formatNumber(issue.articles.length, locale) })}
                  </Pill>
                  <Link
                    href={`/magazine/issues/${issue.number}`}
                    className="text-caption font-semibold text-plum underline decoration-rose-gold/60 underline-offset-4"
                  >
                    {d.magazine.readIssue}
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
