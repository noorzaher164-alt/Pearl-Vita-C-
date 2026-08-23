import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, UploadCloud } from 'lucide-react';
import { IssueForm } from '@/components/forms/IssueForm';
import { Card, CardHeader, PageHeader, Pill } from '@/components/ui';
import { requirePermission } from '@/lib/auth/current-user';
import { listArticles, listIssues } from '@/lib/db/queries';
import { fill, formatDate, formatNumber, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';
import { publishIssueAction } from '@/app/actions/portal';

export const metadata: Metadata = { title: 'Magazine issues' };

export default async function IssueBuilderPage() {
  const viewer = await requirePermission('magazine:read', '/portal/magazine/issues');
  const { locale, d } = await getT();

  const [issues, published] = await Promise.all([
    listIssues(),
    listArticles({ status: 'published' }),
  ]);

  const canPublish = viewer.permissions.can('magazine:publish');

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
        eyebrow={d.magazine.title}
        title={d.magazine.manageIssues}
        subtitle={d.magazine.editorialSubtitle}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid content-start gap-6 lg:col-span-2">
          {issues.map((issue) => (
            <Card as="article" key={issue.id}>
              <CardHeader
                title={
                  <>
                    {fill(d.magazine.issueNumber, { number: formatNumber(issue.number, locale) })} ·{' '}
                    {pick(locale, issue as unknown as Record<string, unknown>, 'title')}
                  </>
                }
                subtitle={
                  issue.published_on
                    ? `${d.magazine.publishedOn} ${formatDate(issue.published_on, locale)}`
                    : d.magazine.statusDraft
                }
                action={
                  <Pill tone={issue.status === 'published' ? 'success' : 'neutral'}>
                    {issue.status === 'published' ? d.magazine.published : d.magazine.statusDraft}
                  </Pill>
                }
              />
              <div className="p-6 pt-4">
                <p className="mb-5 text-small italic leading-relaxed text-ink-muted">
                  {pick(locale, issue as unknown as Record<string, unknown>, 'editors_note')}
                </p>

                <h3 className="eyebrow mb-3">{d.magazine.inThisIssue}</h3>
                <ol className="grid gap-2">
                  {issue.articles.map((article, index) => (
                    <li
                      key={article.id}
                      className="flex items-center gap-3 rounded-control border border-line bg-blush px-4 py-2"
                    >
                      <span className="font-brand text-small text-rose-soft tabular-nums">
                        {formatNumber(index + 1, locale)}
                      </span>
                      <Link
                        href={`/portal/magazine/articles/${article.id}`}
                        className="min-w-0 flex-1 truncate text-small font-semibold text-plum transition hover:text-plum-dark"
                      >
                        {pick(locale, article as unknown as Record<string, unknown>, 'title')}
                      </Link>
                    </li>
                  ))}
                </ol>

                {canPublish && issue.status === 'draft' ? (
                  <form action={publishIssueAction} className="mt-5">
                    <input type="hidden" name="issueId" value={issue.id} />
                    <button type="submit" className="btn btn-primary btn-sm">
                      <UploadCloud className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />
                      {d.magazine.publishNow}
                    </button>
                  </form>
                ) : null}
              </div>
            </Card>
          ))}
        </div>

        {canPublish ? (
          <div>
            <IssueForm
              d={d}
              articles={published.map((article) => ({
                id: article.id,
                title: pick(locale, article as unknown as Record<string, unknown>, 'title'),
              }))}
            />
          </div>
        ) : null}
      </div>
    </>
  );
}
