import type { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink, Eye, FileEdit, Megaphone, Newspaper, PenLine, Send, Star, Trophy } from 'lucide-react';
import { memberName } from '@/components/portal/Common';
import { Card, CardHeader, EmptyState, LinkButton, MetricCard, PageHeader, Pill, SectionTitle } from '@/components/ui';
import { requirePermission } from '@/lib/auth/current-user';
import { listAnnouncements, listArticles, listCategories, listIssues } from '@/lib/db/queries';
import { accentTone, articleStatus } from '@/lib/domain/labels';
import { fill, formatDate, formatNumber, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';
import type { ArticleStatus } from '@/lib/domain/types';

export const metadata: Metadata = { title: 'Editorial dashboard' };

const PIPELINE: ArticleStatus[] = [
  'draft',
  'submitted',
  'under_review',
  'revision_requested',
  'approved',
  'scheduled',
  'published',
];

export default async function MagazineDashboardPage() {
  const viewer = await requirePermission('magazine:read', '/portal/magazine');
  const { locale, d } = await getT();

  const canReview = viewer.permissions.can('magazine:review');
  const [all, categories, issues, announcements] = await Promise.all([
    listArticles(),
    listCategories(),
    listIssues(),
    listAnnouncements({ id: viewer.id, role: viewer.role, committeeId: viewer.committee_id }),
  ]);

  // An author sees her own pipeline; an editor sees the whole desk.
  const visible = canReview ? all : all.filter((article) => article.author_id === viewer.id);

  const countOf = (status: ArticleStatus) => visible.filter((a) => a.status === status).length;
  const waiting = visible.filter(
    (a) => a.status === 'submitted' || a.status === 'under_review',
  );
  const published = visible.filter((a) => a.status === 'published');
  const mostRead = [...published].sort((a, b) => b.views - a.views).slice(0, 5);
  const authors = new Set(all.map((a) => a.author_id));

  return (
    <>
      <PageHeader
        eyebrow={d.magazine.title}
        title={canReview ? d.magazine.editorial : d.magazine.myArticles}
        subtitle={canReview ? d.magazine.editorialSubtitle : d.magazine.subtitle}
        actions={
          <>
            <LinkButton href="/magazine" variant="outline">
              <ExternalLink className="h-[18px] w-[18px] rtl-flip" aria-hidden="true" strokeWidth={1.75} />
              {d.magazine.shortTitle}
            </LinkButton>
            <LinkButton href="/portal/magazine/new">
              <PenLine className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.75} />
              {d.magazine.newArticle}
            </LinkButton>
          </>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label={d.magazine.drafts}
          value={formatNumber(countOf('draft'), locale)}
          icon={<FileEdit strokeWidth={1.75} />}
          tone="mauve"
        />
        <MetricCard
          label={d.magazine.waitingReview}
          value={formatNumber(waiting.length, locale)}
          icon={<Send strokeWidth={1.75} />}
          tone="gold"
        />
        <MetricCard
          label={d.magazine.published}
          value={formatNumber(published.length, locale)}
          icon={<Newspaper strokeWidth={1.75} />}
        />
        <MetricCard
          label={d.magazine.views}
          value={formatNumber(
            published.reduce((sum, a) => sum + a.views, 0),
            locale,
          )}
          icon={<Eye strokeWidth={1.75} />}
          tone="rose"
        />
      </div>

      {/* Pipeline overview */}
      <section className="mb-8" aria-labelledby="mag-pipeline">
        <h2 id="mag-pipeline" className="mb-4 font-brand text-h3 text-plum">
          {d.magazine.workflowTitle}
        </h2>
        <Card className="p-6">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-3">
            {PIPELINE.map((status, index) => {
              const descriptor = articleStatus(status, d);
              return (
                <li key={status} className="flex items-center gap-2">
                  <Link href={`/portal/magazine/articles?status=${status}`} className="inline-block">
                    <Pill tone={descriptor.tone}>
                      {descriptor.label}
                      <span className="tabular-nums opacity-70">{formatNumber(countOf(status), locale)}</span>
                    </Pill>
                  </Link>
                  {index < PIPELINE.length - 1 ? (
                    <span className="text-rose-gold rtl-flip" aria-hidden="true">
                      →
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid content-start gap-6 lg:col-span-2">
          <Card>
            <CardHeader
              title={canReview ? d.magazine.submissions : d.magazine.myArticles}
              subtitle={canReview ? d.magazine.reviewNotesHint : undefined}
              action={
                <Link
                  href="/portal/magazine/articles"
                  className="text-caption font-semibold text-plum underline decoration-rose-gold/60 underline-offset-4"
                >
                  {d.common.viewAll}
                </Link>
              }
            />
            <div className="mt-4">
              {visible.length === 0 ? (
                <div className="p-6">
                  <EmptyState icon={<Newspaper />} title={d.magazine.noSubmissions} />
                </div>
              ) : (
                <ul className="divide-y divide-line">
                  {visible.slice(0, 10).map((article) => {
                    const status = articleStatus(article.status, d);
                    return (
                      <li key={article.id} className="flex flex-wrap items-center gap-3 px-6 py-4">
                        <span className="min-w-0 flex-1">
                          <Link
                            href={`/portal/magazine/articles/${article.id}`}
                            className="block truncate text-small font-semibold text-plum transition hover:text-plum-dark"
                          >
                            {pick(locale, article as unknown as Record<string, unknown>, 'title')}
                          </Link>
                          <span className="block text-caption text-ink-faint">
                            {memberName(article.author, locale)}
                            {article.category
                              ? ` · ${pick(locale, article.category as unknown as Record<string, unknown>, 'name')}`
                              : ''}
                            {article.published_at ? ` · ${formatDate(article.published_at, locale)}` : ''}
                          </span>
                        </span>
                        {article.featured ? (
                          <Pill tone="gold" icon={<Star />}>
                            {d.magazine.featured}
                          </Pill>
                        ) : null}
                        <Pill tone={status.tone}>{status.label}</Pill>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </Card>

          {mostRead.length > 0 ? (
            <Card>
              <CardHeader title={d.magazine.mostRead} />
              <ol className="mt-4 divide-y divide-line">
                {mostRead.map((article, index) => (
                  <li key={article.id} className="flex items-center gap-4 px-6 py-3">
                    <span className="font-brand text-h3 text-rose-soft tabular-nums">
                      {formatNumber(index + 1, locale)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-small font-semibold text-plum">
                      {pick(locale, article as unknown as Record<string, unknown>, 'title')}
                    </span>
                    <span className="shrink-0 text-caption text-ink-muted tabular-nums">
                      {formatNumber(article.views, locale)} {d.magazine.views}
                    </span>
                  </li>
                ))}
              </ol>
            </Card>
          ) : null}
        </div>

        <div className="grid content-start gap-6">
          <Card>
            <CardHeader
              title={d.magazine.manageIssues}
              action={
                <Link
                  href="/portal/magazine/issues"
                  className="text-caption font-semibold text-plum underline decoration-rose-gold/60 underline-offset-4"
                >
                  {d.common.viewAll}
                </Link>
              }
            />
            <ul className="grid gap-3 p-6 pt-4">
              {issues.map((issue) => (
                <li key={issue.id} className="flex items-center justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block truncate text-small font-semibold text-plum">
                      {fill(d.magazine.issueNumber, { number: formatNumber(issue.number, locale) })} ·{' '}
                      {pick(locale, issue as unknown as Record<string, unknown>, 'title')}
                    </span>
                    <span className="block text-caption text-ink-faint">
                      {fill(d.magazine.articleCount, {
                        count: formatNumber(issue.articles.length, locale),
                      })}
                    </span>
                  </span>
                  <Pill tone={issue.status === 'published' ? 'success' : 'neutral'}>
                    {issue.status === 'published' ? d.magazine.published : d.magazine.statusDraft}
                  </Pill>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader title={d.magazine.categories} />
            <div className="p-6 pt-4">
              <ul className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <li key={category.id}>
                    <Pill tone={accentTone(category.accent)}>
                      {pick(locale, category as unknown as Record<string, unknown>, 'name')}
                      <span className="tabular-nums opacity-70">
                        {formatNumber(category.count, locale)}
                      </span>
                    </Pill>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-brand text-h3 text-plum">{d.magazine.authors}</h2>
            <p className="mt-4 font-brand text-metric text-plum tabular-nums">
              {formatNumber(authors.size, locale)}
            </p>
            <p className="text-caption text-ink-muted">{d.magazine.scienceWriterBadge}</p>
          </Card>
        </div>
      </div>

      {/* Department news & achievements */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="mag-news">
          <SectionTitle>
            <span id="mag-news" className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-plum" strokeWidth={1.75} aria-hidden="true" />
              {d.magazine.departmentNews}
            </span>
          </SectionTitle>
          <Card className="p-2">
            {announcements.length > 0 ? (
              <ul className="divide-y divide-line">
                {announcements.slice(0, 5).map((ann) => (
                  <li key={ann.id} className="flex items-start gap-3 p-4">
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-pill bg-plum-50 text-plum">
                      <Megaphone className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-small font-semibold text-plum">
                        {pick(locale, ann as unknown as Record<string, unknown>, 'title')}
                      </span>
                      <span className="mt-1 block text-caption text-ink-faint">
                        {formatDate(ann.published_at, locale)}
                      </span>
                    </span>
                    <Pill tone={ann.level === 'urgent' ? 'danger' : ann.level === 'important' ? 'gold' : 'neutral'}>
                      {ann.level === 'urgent' ? d.announcements.levelUrgent : ann.level === 'important' ? d.announcements.levelImportant : d.announcements.levelNormal}
                    </Pill>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6">
                <EmptyState icon={<Megaphone />} title={d.magazine.noDepartmentNews} />
              </div>
            )}
          </Card>
        </section>

        <section aria-labelledby="mag-achievements">
          <SectionTitle>
            <span id="mag-achievements" className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-plum" strokeWidth={1.75} aria-hidden="true" />
              {d.magazine.departmentAchievements}
            </span>
          </SectionTitle>
          <Card className="p-2">
            {published.length > 0 ? (
              <ul className="divide-y divide-line">
                {published.slice(0, 5).map((article) => (
                  <li key={article.id} className="flex items-start gap-3 p-4">
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-pill bg-rose-50 text-rose">
                      <Trophy className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <Link
                        href={`/portal/magazine/articles/${article.id}`}
                        className="block text-small font-semibold text-plum transition hover:text-plum-dark"
                      >
                        {pick(locale, article as unknown as Record<string, unknown>, 'title')}
                      </Link>
                      <span className="mt-1 block text-caption text-ink-faint">
                        {memberName(article.author, locale)}
                        {article.published_at ? ` · ${formatDate(article.published_at, locale)}` : ''}
                      </span>
                    </span>
                    {article.featured ? (
                      <Pill tone="gold" icon={<Star />}>{d.magazine.featured}</Pill>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6">
                <EmptyState icon={<Trophy />} title={d.magazine.noDepartmentAchievements} />
              </div>
            )}
          </Card>
        </section>
      </div>
    </>
  );
}
