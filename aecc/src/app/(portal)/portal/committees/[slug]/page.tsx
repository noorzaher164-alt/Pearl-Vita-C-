import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarDays, FileText } from 'lucide-react';
import { AnnouncementCard, MemberLine, committeeName, memberName } from '@/components/portal/Common';
import { Card, CardHeader, EmptyState, PageHeader, Pill, Progress } from '@/components/ui';
import { requirePermission } from '@/lib/auth/current-user';
import {
  getCommitteeBySlug,
  listAnnouncements,
  listEvents,
  listProjects,
  listResources,
  listTasks,
} from '@/lib/db/queries';
import { accentTone, projectStatus, roleLabel, taskPriority, taskStatus } from '@/lib/domain/labels';
import { fill, formatDate, formatDateTime, formatNumber, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Committee' };

export default async function CommitteePage({ params }: { params: Promise<{ slug: string }> }) {
  const viewer = await requirePermission('committees:read');
  const { locale, d } = await getT();
  const { slug } = await params;

  const committee = await getCommitteeBySlug(slug);
  if (!committee) notFound();

  const [tasks, events, projects, announcements, resources] = await Promise.all([
    listTasks({ committeeId: committee.id }),
    listEvents(viewer.id),
    listProjects(),
    listAnnouncements({ id: viewer.id, role: viewer.role, committeeId: committee.id }),
    listResources(viewer.role),
  ]);

  const openTasks = tasks.filter((t) => t.status !== 'done');
  const committeeEvents = events
    .filter((e) => e.committee_id === committee.id && new Date(e.starts_at).getTime() >= Date.now())
    .slice(0, 3);
  const committeeProjects = projects.filter((p) => p.committee_id === committee.id);
  const committeeAnnouncements = announcements.filter(
    (a) => a.audience_committee_id === committee.id,
  );
  const committeeResources = resources.slice(0, 4);

  return (
    <>
      <Link
        href="/portal/committees"
        className="mb-6 inline-flex items-center gap-2 text-small font-semibold text-plum transition hover:text-plum-dark"
      >
        <ArrowLeft className="h-4 w-4 rtl-flip" aria-hidden="true" strokeWidth={1.75} />
        {d.committees.title}
      </Link>

      <PageHeader
        eyebrow={
          <span className="inline-flex items-center gap-2">
            <Pill tone={accentTone(committee.accent)}>
              {fill(d.members.memberCount, { count: formatNumber(committee.member_count, locale) })}
            </Pill>
          </span>
        }
        title={committeeName(committee, locale)}
        subtitle={pick(locale, committee as unknown as Record<string, unknown>, 'description')}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid content-start gap-6">
          <Card>
            <CardHeader title={d.committees.leader} />
            <div className="p-6 pt-4">
              {committee.leader ? (
                <MemberLine
                  member={committee.leader}
                  locale={locale}
                  href={`/portal/members/${committee.leader.id}`}
                  size={48}
                  meta={roleLabel(committee.leader.role, d)}
                />
              ) : (
                <p className="text-small text-ink-muted">{d.common.none}</p>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader
              title={d.common.members}
              subtitle={fill(d.members.memberCount, {
                count: formatNumber(committee.member_count, locale),
              })}
            />
            <ul className="grid gap-3 p-6 pt-4">
              {committee.members.map((member) => (
                <li key={member.id}>
                  <MemberLine
                    member={member}
                    locale={locale}
                    href={`/portal/members/${member.id}`}
                    size={34}
                    meta={member.grade}
                    trailing={
                      <span className="ms-auto shrink-0 text-caption font-semibold text-plum tabular-nums">
                        {formatNumber(member.points, locale)}
                      </span>
                    }
                  />
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader title={d.committees.resources} />
            <ul className="grid gap-2 p-6 pt-4">
              {committeeResources.map((resource) => (
                <li key={resource.id}>
                  <Link
                    href="/portal/resources"
                    className="flex items-center gap-2 rounded-control px-2 py-2 text-small text-ink transition hover:bg-blush hover:text-plum"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-mauve" aria-hidden="true" strokeWidth={1.75} />
                    <span className="truncate">
                      {pick(locale, resource as unknown as Record<string, unknown>, 'title')}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="grid content-start gap-6 lg:col-span-2">
          <Card>
            <CardHeader title={d.committees.activeProject} />
            <div className="p-6 pt-4">
              {committeeProjects.length > 0 ? (
                <ul className="grid gap-5">
                  {committeeProjects.map((project) => {
                    const state = projectStatus(project.status, d);
                    return (
                      <li key={project.id}>
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <Link
                            href={`/portal/projects/${project.slug}`}
                            className="font-brand text-[1.0625rem] text-plum transition hover:text-plum-dark"
                          >
                            {pick(locale, project as unknown as Record<string, unknown>, 'title')}
                          </Link>
                          <Pill tone={state.tone}>{state.label}</Pill>
                        </div>
                        <p className="mb-3 text-small text-ink-muted">
                          {pick(locale, project as unknown as Record<string, unknown>, 'objective')}
                        </p>
                        <Progress value={project.progress} />
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-small text-ink-muted">{d.committees.noProject}</p>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader
              title={d.committees.currentTasks}
              action={
                <Link
                  href={`/portal/tasks?committee=${committee.id}`}
                  className="text-caption font-semibold text-plum underline decoration-rose-gold/60 underline-offset-4"
                >
                  {d.common.viewAll}
                </Link>
              }
            />
            <div className="mt-4">
              {openTasks.length > 0 ? (
                <ul className="divide-y divide-line">
                  {openTasks.map((task) => {
                    const state = taskStatus(task.status, d);
                    const priority = taskPriority(task.priority, d);
                    return (
                      <li key={task.id} className="flex flex-wrap items-center gap-3 px-6 py-3">
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-small font-semibold text-plum">
                            {pick(locale, task as unknown as Record<string, unknown>, 'title')}
                          </span>
                          <span className="block text-caption text-ink-faint">
                            {task.assignees.map((a) => memberName(a, locale)).join('، ') || '—'}
                            {task.due_date ? ` · ${formatDate(task.due_date, locale)}` : ''}
                          </span>
                        </span>
                        <Pill tone={priority.tone}>{priority.label}</Pill>
                        <Pill tone={state.tone}>{state.label}</Pill>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="px-6 pb-6 text-small text-ink-muted">{d.tasks.noTasks}</p>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title={d.committees.upcomingActivity} />
            <div className="p-6 pt-4">
              {committeeEvents.length > 0 ? (
                <ul className="grid gap-3">
                  {committeeEvents.map((event) => (
                    <li key={event.id}>
                      <Link
                        href={`/portal/events/${event.id}`}
                        className="flex items-start gap-3 rounded-control border border-line bg-blush px-4 py-3 transition hover:border-rose"
                      >
                        <CalendarDays
                          className="mt-0.5 h-4 w-4 shrink-0 text-rose-gold"
                          aria-hidden="true"
                          strokeWidth={1.75}
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-small font-semibold text-plum">
                            {pick(locale, event as unknown as Record<string, unknown>, 'title')}
                          </span>
                          <span className="block text-caption text-ink-muted">
                            {formatDateTime(event.starts_at, locale)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-small text-ink-muted">{d.committees.noUpcoming}</p>
              )}
            </div>
          </Card>

          <section aria-labelledby="committee-announcements">
            <h2 id="committee-announcements" className="mb-4 font-brand text-h3 text-plum">
              {d.committees.committeeAnnouncements}
            </h2>
            {committeeAnnouncements.length > 0 ? (
              <div className="grid gap-4">
                {committeeAnnouncements.map((announcement) => (
                  <AnnouncementCard
                    key={announcement.id}
                    announcement={announcement}
                    locale={locale}
                    d={d}
                  />
                ))}
              </div>
            ) : (
              <EmptyState title={d.announcements.noAnnouncements} />
            )}
          </section>
        </div>
      </div>
    </>
  );
}
