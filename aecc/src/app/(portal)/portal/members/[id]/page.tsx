import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  ClipboardList,
  Lock,
  Mail,
  Pencil,
  ScrollText,
  Sparkles,
} from 'lucide-react';
import { NavIcon } from '@/components/portal/NavIcon';
import { committeeName, memberName } from '@/components/portal/Common';
import {
  Avatar,
  Card,
  CardHeader,
  EmptyState,
  LinkButton,
  Meta,
  Pill,
  Progress,

  Stat,
  TableShell,
} from '@/components/ui';
import { requirePermission } from '@/lib/auth/current-user';
import {
  getCommittee,
  getMember,
  getMemberAttendance,
  getMemberBadges,
  getMemberProjects,
  listCertificates,
  listPointTransactions,
  listStaffTasks,
  listTasks,
  getAdminNotes,
} from '@/lib/db/queries';
import {
  attendanceStatus,
  memberStatus,
  roleLabel,
  roleTone,
  taskStatus,
  projectStatus,
  certificateKind,
} from '@/lib/domain/labels';
import { formatDate, formatNumber, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Member profile' };

export default async function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const viewer = await requirePermission('members:read');
  const { locale, d } = await getT();
  const { id } = await params;

  const member = await getMember(id);
  if (!member) notFound();

  const isOwnProfile = viewer.id === member.id;
  const canSeeNotes = viewer.permissions.can('members:notes');
  const canSeeContact = viewer.isStaff || isOwnProfile;

  const showStaffTasks = viewer.isStaff && isOwnProfile;

  const [committee, points, badges, attendance, projects, tasks, certificates, adminNotes, staffTasks] =
    await Promise.all([
      member.committee_id ? getCommittee(member.committee_id) : Promise.resolve(null),
      listPointTransactions(member.id, 12),
      getMemberBadges(member.id),
      getMemberAttendance(member.id),
      getMemberProjects(member.id),
      listTasks({ userId: member.id }),
      listCertificates(member.id),
      canSeeNotes ? getAdminNotes(member.id) : Promise.resolve(null),
      showStaffTasks ? listStaffTasks(member.id) : Promise.resolve([]),
    ]);

  const status = memberStatus(member.status, d);
  const name = memberName(member, locale);
  const bio = pick(locale, member as unknown as Record<string, unknown>, 'bio');
  const openTasks = tasks.filter((t) => t.status !== 'done');

  return (
    <>
      <Link
        href="/portal/members"
        className="mb-6 inline-flex items-center gap-2 text-small font-semibold text-plum transition hover:text-plum-dark"
      >
        <ArrowLeft className="h-4 w-4 rtl-flip" aria-hidden="true" strokeWidth={1.75} />
        {d.members.title}
      </Link>

      {/* Identity header */}
      <Card className="mb-6 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-plum/80 to-plum-veil" aria-hidden="true" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <Avatar name={name} src={member.avatar_url} size={88} className="shrink-0 ring-4 ring-white dark:ring-neutral-800" />
              <div className="min-w-0 pb-1">
                <h1 className="break-words font-brand text-h2 text-plum">{name}</h1>
                <Meta
                  className="mt-1"
                  items={[member.grade, committeeName(committee, locale) || d.committees.noCommittee]}
                />
              </div>
            </div>
            {viewer.permissions.can('members:write') ? (
              <LinkButton href={`/portal/members/${member.id}/edit`} variant="outline" size="sm">
                <Pencil className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />
                {d.common.edit}
              </LinkButton>
            ) : null}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Pill tone={roleTone(member.role)}>{roleLabel(member.role, d)}</Pill>
            <Pill tone={status.tone}>{status.label}</Pill>
            <Pill tone="gold">
              {formatNumber(member.points, locale)} {d.common.points}
            </Pill>
            <Pill tone="soft">
              {d.members.attendanceRate} {formatNumber(member.attendance_rate, locale)}%
            </Pill>
          </div>

          {bio ? <p className="mt-5 max-w-prose text-small leading-relaxed text-ink-muted">{bio}</p> : null}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid content-start gap-6">
          <Card>
            <CardHeader title={d.members.personalDetails} />
            <dl className="grid gap-4 p-6 pt-4">
              <Stat label={d.members.username} value={<span dir="ltr">{member.username}</span>} />
              <Stat label={d.members.joinedOn} value={formatDate(member.joined_at, locale)} />
              <Stat label={d.common.grade} value={member.grade} />
              <Stat
                label={d.common.committee}
                value={
                  committee ? (
                    <Link href={`/portal/committees/${committee.slug}`} className="underline decoration-rose-gold/60 underline-offset-4">
                      {committeeName(committee, locale)}
                    </Link>
                  ) : (
                    d.committees.noCommittee
                  )
                }
              />
              {canSeeContact ? (
                <Stat
                  label={d.members.email}
                  value={
                    <a href={`mailto:${member.email}`} className="inline-flex items-center gap-1.5 underline decoration-rose-gold/60 underline-offset-4" dir="ltr">
                      <Mail className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={1.75} />
                      {member.email}
                    </a>
                  }
                />
              ) : null}
              {viewer.isStaff ? (
                <Stat
                  label={d.auth.lastLogin}
                  value={member.last_login_at ? formatDate(member.last_login_at, locale) : d.auth.neverSignedIn}
                />
              ) : null}
            </dl>
          </Card>

          {/* Supervisor-only notes. The value is only fetched when the viewer holds
              `members:notes`, so it never reaches a student's response payload. */}
          {canSeeNotes ? (
            <Card className="border-plum-100 bg-plum-50/40">
              <CardHeader
                title={
                  <span className="inline-flex items-center gap-2">
                    <Lock className="h-4 w-4 text-mauve" aria-hidden="true" strokeWidth={1.75} />
                    {d.members.adminNotes}
                  </span>
                }
                subtitle={d.members.adminNotesHint}
              />
              <div className="p-6 pt-4">
                <p className="text-small text-ink-muted">{adminNotes || d.common.empty}</p>
              </div>
            </Card>
          ) : null}

          <Card>
            <CardHeader title={d.members.badges} />
            <div className="p-6 pt-4">
              {badges.length > 0 ? (
                <ul className="grid gap-3">
                  {badges.map(({ award, badge }) =>
                    badge ? (
                      <li key={award.id} className="flex items-start gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-pill bg-[#F9EDE6] text-[#8A5540]">
                          <NavIcon name={badge.icon} className="h-[18px] w-[18px]" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-small font-semibold text-plum">
                            {pick(locale, badge as unknown as Record<string, unknown>, 'name')}
                          </span>
                          <span className="block text-caption text-ink-faint">
                            {d.achievements.earnedOn} {formatDate(award.awarded_at, locale)}
                          </span>
                        </span>
                      </li>
                    ) : null,
                  )}
                </ul>
              ) : (
                <p className="text-small text-ink-muted">{d.achievements.noBadges}</p>
              )}
            </div>
          </Card>
        </div>

        <div className="grid content-start gap-6 lg:col-span-2">
          <Card>
            <CardHeader
              title={d.members.pointsHistory}
              subtitle={d.points.appendOnlyNote}
              action={
                viewer.permissions.can('points:award') && !isOwnProfile ? (
                  <LinkButton href={`/portal/points/new?member=${member.id}`} variant="secondary" size="sm">
                    <Sparkles className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />
                    {d.points.awardPoints}
                  </LinkButton>
                ) : null
              }
            />
            <div className="mt-4">
              {points.length > 0 ? (
                <ul className="divide-y divide-line">
                  {points.map((tx) => (
                    <li key={tx.id} className="flex flex-wrap items-center gap-3 px-6 py-3">
                      <span
                        className={`shrink-0 font-brand text-body tabular-nums ${tx.points >= 0 ? 'text-plum' : 'text-danger'}`}
                      >
                        {tx.points >= 0 ? '+' : ''}
                        {formatNumber(tx.points, locale)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-small text-ink">
                          {pick(locale, tx as unknown as Record<string, unknown>, 'reason_text')}
                        </span>
                        <span className="block text-caption text-ink-faint">
                          {formatDate(tx.created_at, locale)}
                          {tx.awarded_by_member ? ` · ${d.points.awardedBy} ${memberName(tx.awarded_by_member, locale)}` : ''}
                        </span>
                      </span>
                      {tx.reversal_of ? <Pill tone="warning">{d.points.reversalOf}</Pill> : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-6 pb-6 text-small text-ink-muted">{d.points.noTransactions}</p>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader
              title={d.members.eventsAttended}
              subtitle={`${d.attendance.rate}: ${formatNumber(member.attendance_rate, locale)}%`}
            />
            <div className="p-6 pt-4">
              <Progress value={member.attendance_rate} className="mb-5" />
              {attendance.length > 0 ? (
                <TableShell className="shadow-none">
                  <table className="aecc-table">
                    <caption className="sr-only">{d.attendance.title}</caption>
                    <thead>
                      <tr>
                        <th scope="col">{d.attendance.session}</th>
                        <th scope="col">{d.common.date}</th>
                        <th scope="col">{d.common.status}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.slice(0, 10).map(({ record, session }) => {
                        const state = attendanceStatus(record.status, d);
                        return (
                          <tr key={record.id}>
                            <td>{session ? pick(locale, session as unknown as Record<string, unknown>, 'title') : '—'}</td>
                            <td className="whitespace-nowrap text-ink-muted">
                              {session ? formatDate(session.held_at, locale) : '—'}
                            </td>
                            <td>
                              <Pill tone={state.tone}>{state.label}</Pill>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </TableShell>
              ) : (
                <p className="text-small text-ink-muted">{d.attendance.noSessions}</p>
              )}
            </div>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader title={d.members.projectsTab} />
              <div className="p-6 pt-4">
                {projects.length > 0 ? (
                  <ul className="grid gap-3">
                    {projects.map((project) => {
                      const state = projectStatus(project.status, d);
                      return (
                        <li key={project.id} className="flex items-center justify-between gap-3">
                          <Link
                            href={`/portal/projects/${project.slug}`}
                            className="min-w-0 flex-1 truncate text-small font-semibold text-plum transition hover:text-plum-dark"
                          >
                            {pick(locale, project as unknown as Record<string, unknown>, 'title')}
                          </Link>
                          <Pill tone={state.tone}>{state.label}</Pill>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-small text-ink-muted">{d.projects.noProjects}</p>
                )}
              </div>
            </Card>

            <Card>
              <CardHeader title={d.members.tasksTab} />
              <div className="p-6 pt-4">
                {openTasks.length > 0 ? (
                  <ul className="grid gap-3">
                    {openTasks.slice(0, 6).map((task) => {
                      const state = taskStatus(task.status, d);
                      return (
                        <li key={task.id} className="flex items-center justify-between gap-3">
                          <span className="min-w-0 flex-1 truncate text-small text-ink">
                            {pick(locale, task as unknown as Record<string, unknown>, 'title')}
                          </span>
                          <Pill tone={state.tone}>{state.label}</Pill>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-small text-ink-muted">{d.tasks.noTasks}</p>
                )}
              </div>
            </Card>
          </div>

          {/* Staff / Teacher supervisory tasks */}
          {showStaffTasks && staffTasks.length > 0 ? (
            <Card>
              <CardHeader
                title={
                  <span className="inline-flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-plum" aria-hidden="true" strokeWidth={1.75} />
                    {d.members.staffTasksTab}
                  </span>
                }
                subtitle={d.members.staffTasksHint}
              />
              <div className="mt-2">
                <TableShell className="shadow-none">
                  <table className="aecc-table">
                    <caption className="sr-only">{d.members.staffTasksTab}</caption>
                    <thead>
                      <tr>
                        <th scope="col">{d.tasks.title}</th>
                        <th scope="col">{d.common.status}</th>
                        <th scope="col">{d.tasks.priority}</th>
                        <th scope="col">{d.tasks.dueDate}</th>
                        <th scope="col">{d.tasks.completedAt}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffTasks.map((task) => {
                        const state = taskStatus(task.status, d);
                        const isDone = task.status === 'done';
                        return (
                          <tr key={task.id}>
                            <td className="max-w-[200px]">
                              <span className="block truncate text-small text-ink">
                                {pick(locale, task as unknown as Record<string, unknown>, 'title')}
                              </span>
                              {task.assignees.length > 0 ? (
                                <span className="mt-0.5 block truncate text-caption text-ink-faint">
                                  {d.tasks.assignee}: {task.assignees.map((a) => memberName(a, locale)).join(', ')}
                                </span>
                              ) : null}
                            </td>
                            <td><Pill tone={state.tone}>{state.label}</Pill></td>
                            <td className="whitespace-nowrap text-caption text-ink-muted">{d.tasks[`priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}` as 'priorityLow' | 'priorityMedium' | 'priorityHigh']}</td>
                            <td className="whitespace-nowrap text-ink-muted">{task.due_date ? formatDate(task.due_date, locale) : '—'}</td>
                            <td>
                              {isDone ? (
                                <span className="inline-flex items-center gap-1.5 text-small text-emerald-600">
                                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />
                                  {task.completed_at ? formatDate(task.completed_at, locale) : d.tasks.done}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-small text-ink-faint">
                                  <Circle className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />
                                  {d.tasks.notCompleted}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </TableShell>
              </div>
            </Card>
          ) : showStaffTasks ? (
            <Card>
              <CardHeader
                title={
                  <span className="inline-flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-plum" aria-hidden="true" strokeWidth={1.75} />
                    {d.members.staffTasksTab}
                  </span>
                }
              />
              <div className="p-6 pt-4">
                <p className="text-small text-ink-muted">{d.tasks.noStaffTasks}</p>
              </div>
            </Card>
          ) : null}

          <Card>
            <CardHeader title={d.members.certificatesTab} />
            <div className="p-6 pt-4">
              {certificates.length > 0 ? (
                <ul className="grid gap-3">
                  {certificates.map((certificate) => (
                    <li
                      key={certificate.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-line bg-blush px-4 py-3"
                    >
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 text-small font-semibold text-plum">
                          <ScrollText className="h-4 w-4 text-rose-gold" aria-hidden="true" strokeWidth={1.75} />
                          {pick(locale, certificate as unknown as Record<string, unknown>, 'title')}
                        </span>
                        <span className="mt-1 block text-caption text-ink-faint" dir="ltr">
                          {certificate.serial} · {formatDate(certificate.issued_on, locale)}
                        </span>
                      </span>
                      <Pill tone="gold">{certificateKind(certificate.kind, d)}</Pill>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-small text-ink-muted">{d.certificates.noCertificates}</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
