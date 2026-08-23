import type { Metadata } from 'next';
import Link from 'next/link';
import { Newspaper } from 'lucide-react';
import { memberName } from '@/components/portal/Common';
import { EmptyState, LinkTabs, PageHeader, Pill, TableShell } from '@/components/ui';
import { requirePermission } from '@/lib/auth/current-user';
import { listArticles } from '@/lib/db/queries';
import { articleStatus } from '@/lib/domain/labels';
import { formatDate, formatNumber, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';
import type { ArticleStatus } from '@/lib/domain/types';

export const metadata: Metadata = { title: 'Articles' };

const TABS: (ArticleStatus | 'all')[] = [
  'all',
  'draft',
  'submitted',
  'under_review',
  'approved',
  'scheduled',
  'published',
];

export default async function ArticlesListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const viewer = await requirePermission('magazine:read', '/portal/magazine/articles');
  const { locale, d } = await getT();
  const params = await searchParams;

  const canReview = viewer.permissions.can('magazine:review');
  const all = await listArticles();
  const visible = canReview ? all : all.filter((a) => a.author_id === viewer.id);

  const active = (params.status ?? 'all') as ArticleStatus | 'all';
  const shown = active === 'all' ? visible : visible.filter((a) => a.status === active);

  const label = (key: ArticleStatus | 'all') =>
    key === 'all' ? d.magazine.allArticles : articleStatus(key, d).label;

  return (
    <>
      <PageHeader
        eyebrow={d.magazine.title}
        title={canReview ? d.magazine.allArticles : d.magazine.myArticles}
        subtitle={d.magazine.editorialSubtitle}
      />

      <LinkTabs
        className="mb-6"
        activeKey={active}
        items={TABS.map((key) => ({
          key,
          label: label(key),
          href: key === 'all' ? '/portal/magazine/articles' : `/portal/magazine/articles?status=${key}`,
          count: key === 'all' ? visible.length : visible.filter((a) => a.status === key).length,
        }))}
      />

      {shown.length === 0 ? (
        <EmptyState icon={<Newspaper />} title={d.magazine.noArticles} />
      ) : (
        <TableShell>
          <table className="aecc-table">
            <caption className="sr-only">{d.magazine.allArticles}</caption>
            <thead>
              <tr>
                <th scope="col">{d.common.title}</th>
                <th scope="col">{d.magazine.author}</th>
                <th scope="col">{d.common.category}</th>
                <th scope="col">{d.common.status}</th>
                <th scope="col">{d.magazine.publishedOn}</th>
                <th scope="col" className="text-end">{d.magazine.views}</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((article) => {
                const status = articleStatus(article.status, d);
                return (
                  <tr key={article.id}>
                    <td>
                      <Link
                        href={`/portal/magazine/articles/${article.id}`}
                        className="font-semibold text-plum transition hover:text-plum-dark"
                      >
                        {pick(locale, article as unknown as Record<string, unknown>, 'title')}
                      </Link>
                    </td>
                    <td className="text-ink-muted">{memberName(article.author, locale)}</td>
                    <td className="text-ink-muted">
                      {article.category
                        ? pick(locale, article.category as unknown as Record<string, unknown>, 'name')
                        : '—'}
                    </td>
                    <td>
                      <Pill tone={status.tone}>{status.label}</Pill>
                    </td>
                    <td className="whitespace-nowrap text-ink-muted">
                      {article.published_at ? formatDate(article.published_at, locale) : '—'}
                    </td>
                    <td className="text-end tabular-nums text-ink-muted">
                      {formatNumber(article.views, locale)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableShell>
      )}
    </>
  );
}
