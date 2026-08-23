import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, History } from 'lucide-react';
import { ArticleBody } from '@/components/magazine/ArticleBody';
import { EditorialActions } from '@/components/magazine/EditorialActions';
import { memberName } from '@/components/portal/Common';
import { Card, CardHeader, InlineAlert, PageHeader, Pill, Stat } from '@/components/ui';
import { requirePermission } from '@/lib/auth/current-user';
import { getArticle, listSubmissionHistory } from '@/lib/db/queries';
import { accentTone, articleStatus } from '@/lib/domain/labels';
import { fill, formatDateTime, formatNumber, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Article' };

export default async function EditorialArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const viewer = await requirePermission('magazine:read');
  const { locale, d } = await getT();
  const { id } = await params;

  const article = await getArticle(id);
  if (!article) notFound();

  const isAuthor = article.author_id === viewer.id;
  const canReview = viewer.permissions.can('magazine:review');

  // An author may only open her own drafts; the editorial desk sees everything.
  if (!isAuthor && !canReview) notFound();

  const history = await listSubmissionHistory(article.id);
  const status = articleStatus(article.status, d);

  return (
    <>
      <Link
        href="/portal/magazine"
        className="mb-6 inline-flex items-center gap-2 text-small font-semibold text-plum transition hover:text-plum-dark"
      >
        <ArrowLeft className="h-4 w-4 rtl-flip" aria-hidden="true" strokeWidth={1.75} />
        {d.magazine.editorial}
      </Link>

      <PageHeader
        eyebrow={
          <span className="inline-flex flex-wrap items-center gap-2">
            <Pill tone={status.tone}>{status.label}</Pill>
            {article.category ? (
              <Pill tone={accentTone(article.category.accent)}>
                {pick(locale, article.category as unknown as Record<string, unknown>, 'name')}
              </Pill>
            ) : null}
            {article.featured ? <Pill tone="gold">{d.magazine.featured}</Pill> : null}
          </span>
        }
        title={pick(locale, article as unknown as Record<string, unknown>, 'title')}
        subtitle={pick(locale, article as unknown as Record<string, unknown>, 'subtitle')}
        actions={
          article.status === 'published' ? (
            <Link href={`/magazine/article/${article.slug}`} className="btn btn-outline">
              <ExternalLink className="h-[18px] w-[18px] rtl-flip" aria-hidden="true" strokeWidth={1.75} />
              {d.common.viewDetails}
            </Link>
          ) : null
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid content-start gap-6 lg:col-span-2">
          {article.review_notes ? (
            <InlineAlert tone="warning" title={d.magazine.reviewNotes}>
              {article.review_notes}
            </InlineAlert>
          ) : null}

          <Card className="p-8">
            {article.cover_image ? (
              <div className="mb-8 overflow-hidden rounded-card border border-line bg-blush">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.cover_image}
                  alt=""
                  className="aspect-[21/9] w-full object-cover"
                  aria-hidden="true"
                />
              </div>
            ) : null}
            <ArticleBody blocks={article.blocks} locale={locale} calloutLabel={d.magazine.title} />

            {article.references.length > 0 ? (
              <section className="mt-12 border-t border-line pt-8">
                <h2 className="mb-3 font-brand text-h3 text-plum">{d.magazine.references}</h2>
                <ol className="grid gap-2">
                  {article.references.map((reference, index) => (
                    <li key={index} className="flex gap-3 text-small text-ink-muted">
                      <span className="font-brand text-rose-soft tabular-nums">{index + 1}.</span>
                      <span>{reference}</span>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}
          </Card>

          <Card>
            <CardHeader
              title={
                <span className="inline-flex items-center gap-2">
                  <History className="h-4 w-4 text-mauve rtl-flip" aria-hidden="true" strokeWidth={1.75} />
                  {d.magazine.historyTitle}
                </span>
              }
            />
            <ol className="mt-4 divide-y divide-line">
              {history.map((entry) => (
                <li key={entry.id} className="flex flex-wrap items-center gap-3 px-6 py-3">
                  <Pill tone="soft">{entry.action.replace('_', ' ')}</Pill>
                  <span className="min-w-0 flex-1">
                    <span className="block text-small text-ink">
                      {memberName(entry.actor, locale)}
                    </span>
                    {entry.note ? (
                      <span className="block text-caption text-ink-muted">{entry.note}</span>
                    ) : null}
                  </span>
                  <span className="text-caption text-ink-faint">
                    {formatDateTime(entry.created_at, locale)}
                  </span>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="grid content-start gap-6">
          <EditorialActions
            articleId={article.id}
            status={article.status}
            featured={article.featured}
            isAuthor={isAuthor}
            canReview={canReview}
            canPublish={viewer.permissions.can('magazine:publish')}
            d={d}
          />

          <Card>
            <CardHeader title={d.common.description} />
            <dl className="grid gap-4 p-6 pt-4">
              <Stat label={d.magazine.author} value={memberName(article.author, locale)} />
              <Stat
                label={d.magazine.readingTime.replace('{minutes} ', '')}
                value={fill(d.magazine.readingTime, { minutes: article.reading_minutes })}
              />
              <Stat label={d.magazine.views} value={formatNumber(article.views, locale)} />
              {article.submitted_at ? (
                <Stat label={d.magazine.submitted} value={formatDateTime(article.submitted_at, locale)} />
              ) : null}
              {article.scheduled_for ? (
                <Stat label={d.magazine.scheduled} value={formatDateTime(article.scheduled_for, locale)} />
              ) : null}
              {article.published_at ? (
                <Stat label={d.magazine.publishedOn} value={formatDateTime(article.published_at, locale)} />
              ) : null}
              <Stat label="Slug" value={<span dir="ltr">{article.slug}</span>} />
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}
