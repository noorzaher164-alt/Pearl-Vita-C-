import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Users } from 'lucide-react';
import { AvatarStack, Card, PageHeader, Pill, Progress } from '@/components/ui';
import { committeeName, memberName } from '@/components/portal/Common';
import { requirePermission } from '@/lib/auth/current-user';
import { listCommittees } from '@/lib/db/queries';
import { accentTone } from '@/lib/domain/labels';
import { fill, formatNumber, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Committees' };

export default async function CommitteesPage() {
  await requirePermission('committees:read', '/portal/committees');
  const { locale, d } = await getT();
  const committees = await listCommittees();

  return (
    <>
      <PageHeader eyebrow={d.brand.fullName} title={d.committees.title} subtitle={d.committees.subtitle} />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {committees.map((committee) => (
          <Card as="article" key={committee.id} className="flex flex-col p-6">
            <div className="mb-3 flex items-start justify-between gap-3">
              <Pill tone={accentTone(committee.accent)}>
                {fill(d.members.memberCount, { count: formatNumber(committee.member_count, locale) })}
              </Pill>
              {committee.open_tasks > 0 ? (
                <Pill tone="soft">
                  {formatNumber(committee.open_tasks, locale)} {d.committees.currentTasks.toLowerCase()}
                </Pill>
              ) : null}
            </div>

            <h2 className="font-brand text-h3 text-plum">
              <Link href={`/portal/committees/${committee.slug}`} className="transition hover:text-plum-dark">
                {committeeName(committee, locale)}
              </Link>
            </h2>
            <p className="mt-2 flex-1 text-small leading-relaxed text-ink-muted">
              {pick(locale, committee as unknown as Record<string, unknown>, 'description')}
            </p>

            <dl className="mt-5 grid gap-3 border-t border-line pt-5">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-caption text-ink-muted">{d.committees.leader}</dt>
                <dd className="text-caption font-semibold text-plum">
                  {committee.leader ? memberName(committee.leader, locale) : '—'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-caption text-ink-muted">{d.committees.activeProject}</dt>
                <dd className="truncate text-caption font-semibold text-plum">
                  {committee.active_project
                    ? pick(locale, committee.active_project as unknown as Record<string, unknown>, 'title')
                    : d.committees.noProject}
                </dd>
              </div>
            </dl>

            <Progress value={committee.progress} label={d.committees.progressLabel} className="mt-4" />

            <div className="mt-5 flex items-center justify-between gap-3">
              <AvatarStack
                people={committee.members.map((m) => ({ name: memberName(m, locale), avatar: m.avatar_url }))}
                max={5}
              />
              <Link
                href={`/portal/committees/${committee.slug}`}
                className="inline-flex items-center gap-1.5 text-caption font-semibold text-plum transition hover:text-plum-dark"
              >
                {d.common.viewDetails}
                <ArrowRight className="h-3.5 w-3.5 rtl-flip" aria-hidden="true" strokeWidth={1.75} />
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
