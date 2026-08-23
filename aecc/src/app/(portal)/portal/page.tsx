import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Activity,
  CalendarDays,
  ClipboardCheck,
  FlaskConical,
  ListChecks,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import { AnnouncementCard, EventCard, MemberLine, ProjectProgressRow, QuickAction, RankMark, committeeName, memberName } from '@/components/portal/Common';
import { NavIcon } from '@/components/portal/NavIcon';
import {
  Card,
  EmptyState,
  LinkButton,
  MetricCard,
  Meta,
  Pill,
  Progress,
  SectionTitle,
} from '@/components/ui';
import { requireViewer } from '@/lib/auth/current-user';
import {
  getClubStats,
  getLeaderboard,
  getMemberBadges,
  getOpenChallenge,
  listAnnouncements,
  listProjects,
  listTasks,
  listUpcomingEvents,
  recentActivity,
} from '@/lib/db/queries';
import { taskPriority } from '@/lib/domain/labels';
import { fill, formatDate, formatNumber, formatRelative, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Dashboard' };

function greeting(d: Awaited<ReturnType<typeof getT>>['d']): string {
  const hour = new Date().getUTCHours();
  if (hour < 12) return d.dashboard.greetingMorning;
  if (hour < 17) return d.dashboard.greetingAfternoon;
  return d.dashboard.greetingEvening;
}

export default async function DashboardPage() {
  const viewer = await requireViewer('/portal');
  const { locale, d } = await getT();

  const [stats, upcoming, leaderboard, projects, activity, announcements, challenge] = await Promise.all([
    getClubStats(),
    listUpcomingEvents(viewer.id, 3),
    getLeaderboard('all', 5),
    listProjects(),
    recentActivity(7),
    listAnnouncements({ id: viewer.id, role: viewer.role, committeeId: viewer.committee_id }),
    getOpenChallenge(viewer.id),
  ]);

  const showsAdminView = viewer.isStaff;
  const myTasks = showsAdminView ? [] : (await listTasks({ userId: viewer.id })).filter((t) => t.status !== 'done');
  const myBadges = showsAdminView ? [] : await getMemberBadges(viewer.id);
  const myRank = leaderboard.length
    ? (await getLeaderboard('all')).find((entry) => entry.member.id === viewer.id)?.rank ?? null
    : null;

  const activeProjects = projects.filter((p) => p.status === 'active' || p.status === 'review').slice(0, 3);
  const displayName = memberName(viewer, locale).split(' ')[0];

  return (
    <>
      <header className="mb-8">
        <p className="eyebrow mb-2">{d.brand.year}</p>
        <h1 className="font-brand text-h1 text-plum">
          {greeting(d)}, {displayName}
        </h1>
        <p className="mt-2 text-body text-ink-muted">
          {showsAdminView ? d.dashboard.adminSubtitle : d.dashboard.memberSubtitle}
        </p>
      </header>

      {/* KPI row — admin sees the club, a member sees herself. */}
      <section
        className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        aria-label={showsAdminView ? d.dashboard.adminSubtitle : d.dashboard.memberSubtitle}
      >
        {showsAdminView ? (
          <>
            <MetricCard
              label={d.dashboard.totalMembers}
              value={formatNumber(stats.totalMembers, locale)}
              hint={`${formatNumber(stats.activeMembers, locale)} ${d.members.statusActive.toLowerCase()}`}
              icon={<Users strokeWidth={1.75} />}
            />
            <MetricCard
              label={d.dashboard.upcomingEvents}
              value={formatNumber(stats.upcomingEvents, locale)}
              hint={d.dashboard.thisTerm}
              icon={<CalendarDays strokeWidth={1.75} />}
              tone="rose"
            />
            <MetricCard
              label={d.dashboard.currentProjects}
              value={formatNumber(stats.currentProjects, locale)}
              icon={<FlaskConical strokeWidth={1.75} />}
              tone="berry"
            />
            <MetricCard
              label={d.dashboard.attendanceRate}
              value={`${formatNumber(stats.attendanceRate, locale)}%`}
              icon={<ClipboardCheck strokeWidth={1.75} />}
              tone="mauve"
            />
            <MetricCard
              label={d.dashboard.clubPoints}
              value={formatNumber(stats.clubPoints, locale)}
              icon={<Sparkles strokeWidth={1.75} />}
              tone="gold"
            />
            <MetricCard
              label={d.reports.publishedArticles}
              value={formatNumber(stats.publishedArticles, locale)}
              icon={<NavIcon name="newspaper" />}
              tone="plum"
            />
          </>
        ) : (
          <>
            <MetricCard
              label={d.dashboard.myPoints}
              value={formatNumber(viewer.points, locale)}
              icon={<Sparkles strokeWidth={1.75} />}
              tone="gold"
            />
            <MetricCard
              label={d.dashboard.myRank}
              value={myRank ? `#${formatNumber(myRank, locale)}` : '—'}
              hint={fill(d.dashboard.outOfMembers, { total: formatNumber(stats.totalMembers, locale) })}
              icon={<Trophy strokeWidth={1.75} />}
              tone="rose"
            />
            <MetricCard
              label={d.dashboard.myAttendance}
              value={`${formatNumber(viewer.attendance_rate, locale)}%`}
              icon={<ClipboardCheck strokeWidth={1.75} />}
              tone="mauve"
            />
          </>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Primary column */}
        <div className="grid gap-6 lg:col-span-2">
          {announcements[0] ? (
            <section aria-labelledby="dash-announcement">
              <SectionTitle>
                <span id="dash-announcement">{d.dashboard.latestAnnouncement}</span>
              </SectionTitle>
              <AnnouncementCard announcement={announcements[0]} locale={locale} d={d} />
            </section>
          ) : null}

          <section aria-labelledby="dash-events">
            <SectionTitle
              action={
                <Link
                  href="/portal/events"
                  className="text-caption font-semibold text-plum underline decoration-rose-gold/60 underline-offset-4"
                >
                  {d.common.viewAll}
                </Link>
              }
            >
              <span id="dash-events">{d.dashboard.upcomingEvent}</span>
            </SectionTitle>
            {upcoming.length > 0 ? (
              <div className="grid gap-4">
                {upcoming.map((event, index) => (
                  <EventCard key={event.id} event={event} locale={locale} d={d} compact={index > 0} />
                ))}
              </div>
            ) : (
              <EmptyState title={d.dashboard.noUpcomingEvent} icon={<CalendarDays />} />
            )}
          </section>

          {showsAdminView ? (
            <section aria-labelledby="dash-projects">
              <SectionTitle>
                <span id="dash-projects">{d.dashboard.projectProgress}</span>
              </SectionTitle>
              <Card className="px-6 py-2">
                {activeProjects.length > 0 ? (
                  <ul className="divide-y divide-line">
                    {activeProjects.map((project) => (
                      <ProjectProgressRow key={project.id} project={project} locale={locale} d={d} />
                    ))}
                  </ul>
                ) : (
                  <p className="py-8 text-center text-small text-ink-muted">{d.projects.noProjects}</p>
                )}
              </Card>
            </section>
          ) : (
            <section aria-labelledby="dash-tasks">
              <SectionTitle
                action={
                  <Link
                    href="/portal/tasks"
                    className="text-caption font-semibold text-plum underline decoration-rose-gold/60 underline-offset-4"
                  >
                    {d.common.viewAll}
                  </Link>
                }
              >
                <span id="dash-tasks">{d.dashboard.activeTasks}</span>
              </SectionTitle>
              {myTasks.length > 0 ? (
                <Card className="divide-y divide-line">
                  {myTasks.slice(0, 4).map((task) => {
                    const priority = taskPriority(task.priority, d);
                    return (
                      <div key={task.id} className="flex flex-wrap items-center gap-3 p-4">
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-small font-semibold text-plum">
                            {pick(locale, task as unknown as Record<string, unknown>, 'title')}
                          </span>
                          {task.due_date ? (
                            <span className="block text-caption text-ink-muted">
                              {d.tasks.dueDate}: {formatDate(task.due_date, locale)}
                            </span>
                          ) : null}
                        </span>
                        <Pill tone={priority.tone}>{priority.label}</Pill>
                      </div>
                    );
                  })}
                </Card>
              ) : (
                <EmptyState title={d.dashboard.noActiveTasks} icon={<ListChecks />} />
              )}
            </section>
          )}

          <section aria-labelledby="dash-activity">
            <SectionTitle>
              <span id="dash-activity">{d.dashboard.recentActivity}</span>
            </SectionTitle>
            <Card className="p-2">
              {activity.length > 0 ? (
                <ul>
                  {activity.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.href ?? '#'}
                        className="flex items-start gap-3 rounded-control p-3 transition hover:bg-blush"
                      >
                        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-pill bg-blush text-mauve">
                          <Activity className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={1.75} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-small text-ink">
                            {locale === 'ar' ? item.text_ar : item.text_en}
                          </span>
                          <span className="block text-caption text-ink-faint">
                            {formatRelative(item.at, locale)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-8 text-center text-small text-ink-muted">{d.dashboard.noActivity}</p>
              )}
            </Card>
          </section>
        </div>

        {/* Secondary column */}
        <div className="grid content-start gap-6">
          {viewer.permissions.canAny(['members:write', 'events:write', 'points:award', 'announcements:write']) ? (
            <section aria-labelledby="dash-quick">
              <SectionTitle>
                <span id="dash-quick">{d.dashboard.quickActions}</span>
              </SectionTitle>
              <div className="grid gap-2">
                {viewer.permissions.can('users:admin') ? (
                  <QuickAction href="/portal/admin/users" label={d.dashboard.qaAddMember} icon="user-cog" />
                ) : null}
                {viewer.permissions.can('events:write') ? (
                  <QuickAction href="/portal/events/new" label={d.dashboard.qaCreateEvent} icon="calendar-days" />
                ) : null}
                {viewer.permissions.can('attendance:write') ? (
                  <QuickAction
                    href="/portal/attendance"
                    label={d.dashboard.qaMarkAttendance}
                    icon="clipboard-check"
                  />
                ) : null}
                {viewer.permissions.can('points:award') ? (
                  <QuickAction href="/portal/points" label={d.dashboard.qaAddPoints} icon="sparkles" />
                ) : null}
                {viewer.permissions.can('announcements:write') ? (
                  <QuickAction
                    href="/portal/announcements/new"
                    label={d.dashboard.qaPublishAnnouncement}
                    icon="megaphone"
                  />
                ) : null}
                {viewer.permissions.can('magazine:write') ? (
                  <QuickAction href="/portal/magazine/new" label={d.dashboard.qaAddArticle} icon="newspaper" />
                ) : null}
              </div>
            </section>
          ) : null}

          <section aria-labelledby="dash-top">
            <SectionTitle
              action={
                <Link
                  href="/portal/leaderboard"
                  className="text-caption font-semibold text-plum underline decoration-rose-gold/60 underline-offset-4"
                >
                  {d.common.viewAll}
                </Link>
              }
            >
              <span id="dash-top">{d.dashboard.topMembers}</span>
            </SectionTitle>
            <Card className="p-2">
              <ol>
                {leaderboard.map((entry) => (
                  <li key={entry.member.id} className="flex items-center gap-3 rounded-control p-3">
                    <RankMark rank={entry.rank} locale={locale} />
                    <MemberLine
                      member={entry.member}
                      locale={locale}
                      href={`/portal/members/${entry.member.id}`}
                      size={32}
                      meta={committeeName(entry.committee, locale)}
                    />
                    <span className="ms-auto shrink-0 font-brand text-small text-plum tabular-nums">
                      {formatNumber(entry.points, locale)}
                    </span>
                  </li>
                ))}
              </ol>
            </Card>
          </section>

          {challenge ? (
            <section aria-labelledby="dash-challenge">
              <SectionTitle>
                <span id="dash-challenge">{d.dashboard.weeklyChallenge}</span>
              </SectionTitle>
              <Card className="p-6">
                <Pill tone="success">{d.challenges.statusOpen}</Pill>
                <h3 className="mt-3 font-brand text-h3 text-plum">
                  {pick(locale, challenge as unknown as Record<string, unknown>, 'title')}
                </h3>
                <p className="mt-2 line-clamp-3 text-small text-ink-muted">
                  {pick(locale, challenge as unknown as Record<string, unknown>, 'question')}
                </p>
                <Meta
                  className="mt-4"
                  items={[
                    `${d.challenges.closesOn} ${formatDate(challenge.closes_at, locale)}`,
                    `+${formatNumber(challenge.points, locale)} ${d.common.points}`,
                  ]}
                />
                <LinkButton
                  href={`/portal/challenges/${challenge.id}`}
                  variant={challenge.viewer_submission ? 'outline' : 'primary'}
                  size="sm"
                  className="mt-5 w-full"
                >
                  {challenge.viewer_submission ? d.challenges.answered : d.challenges.submitAnswer}
                </LinkButton>
              </Card>
            </section>
          ) : null}

          {!showsAdminView && myBadges.length > 0 ? (
            <section aria-labelledby="dash-badges">
              <SectionTitle>
                <span id="dash-badges">{d.dashboard.myBadges}</span>
              </SectionTitle>
              <Card className="p-5">
                <ul className="grid gap-3">
                  {myBadges.slice(0, 4).map(({ award, badge }) =>
                    badge ? (
                      <li key={award.id} className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-pill bg-[#F9EDE6] text-[#8A5540]">
                          <NavIcon name={badge.icon} className="h-[18px] w-[18px]" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-small font-semibold text-plum">
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
              </Card>
            </section>
          ) : null}

          {showsAdminView ? (
            <section aria-labelledby="dash-attendance">
              <SectionTitle>
                <span id="dash-attendance">{d.attendance.overallRate}</span>
              </SectionTitle>
              <Card className="p-6">
                <p className="font-brand text-metric text-plum tabular-nums">
                  {formatNumber(stats.attendanceRate, locale)}%
                </p>
                <Progress value={stats.attendanceRate} className="mt-4" />
                <p className="mt-3 text-caption text-ink-faint">{d.attendance.correctionNote}</p>
              </Card>
            </section>
          ) : null}
        </div>
      </div>
    </>
  );
}
