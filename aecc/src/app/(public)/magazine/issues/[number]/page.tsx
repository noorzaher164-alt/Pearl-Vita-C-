import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Download, Quote } from 'lucide-react';
import { ArticleCard } from '@/components/magazine/ArticleCard';
import { SparkRule } from '@/components/brand/Motifs';
import { Card, InlineAlert } from '@/components/ui';
import { getIssue } from '@/lib/db/queries';
import { fill, formatDate, formatNumber, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Magazine issue' };

export default async function IssuePage({ params }: { params: Promise<{ number: string }> }) {
  const { locale, d } = await getT();
  const { number } = await params;

  const issue = await getIssue(Number(number));
  if (!issue || issue.status !== 'published') notFound();

  const published = issue.articles.filter((article) => article.status === 'published');

  return (
    <div className="shell py-12 md:py-16">
      <Link
        href="/magazine/issues"
        className="mb-6 inline-flex items-center gap-2 text-small font-semibold text-plum transition hover:text-plum-dark"
      >
        <ArrowLeft className="h-4 w-4 rtl-flip" aria-hidden="true" strokeWidth={1.75} />
        {d.magazine.issues}
      </Link>

      <div className="grid gap-10 lg:grid-cols-[20rem_1fr]">
        <div>
          <Card className="overflow-hidden">
            <div className="aspect-[3/4] bg-blush">
              {issue.cover_image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={issue.cover_image} alt="" className="h-full w-full object-cover" aria-hidden="true" />
              ) : null}
            </div>
            <div className="p-6 text-center">
              <p className="eyebrow">
                {fill(d.magazine.issueNumber, { number: formatNumber(issue.number, locale) })}
              </p>
              <h1 className="mt-2 font-brand text-h2 text-plum">
                {pick(locale, issue as unknown as Record<string, unknown>, 'title')}
              </h1>
              {issue.published_on ? (
                <p className="mt-2 text-caption text-ink-muted">{formatDate(issue.published_on, locale)}</p>
              ) : null}
            </div>
          </Card>

          {/* The architecture is prepared for a downloadable PDF edition. */}
          <div className="mt-4">
            <InlineAlert tone="info" icon={<Download />}>
              {d.magazine.pdfPending}
            </InlineAlert>
          </div>
        </div>

        <div>
          <section aria-labelledby="issue-note" className="mb-12">
            <h2 id="issue-note" className="eyebrow mb-4">
              {d.magazine.editorsNote}
            </h2>
            <Card className="border-s-2 border-s-rose-gold p-8">
              <Quote className="mb-4 h-5 w-5 text-rose-gold rtl-flip" aria-hidden="true" strokeWidth={1.5} />
              <p className="font-brand text-[1.1875rem] italic leading-relaxed text-plum">
                {pick(locale, issue as unknown as Record<string, unknown>, 'editors_note')}
              </p>
            </Card>
          </section>

          <SparkRule className="mb-10" />

          <section aria-labelledby="issue-contents">
            <h2 id="issue-contents" className="mb-6 font-brand text-h2 text-plum">
              {d.magazine.inThisIssue}
            </h2>
            <div className="grid gap-5">
              {published.map((article) => (
                <ArticleCard key={article.id} article={article} locale={locale} d={d} layout="row" />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
