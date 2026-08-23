import type { Metadata } from 'next';
import { ChartColumn, ClipboardCheck, Newspaper, Sparkles, Users } from 'lucide-react';
import { BrandAreaChart, BrandBarChart, BrandPieChart } from '@/components/charts/AeccCharts';
import { committeeName } from '@/components/portal/Common';
import { Card, CardHeader, EmptyState, MetricCard, PageHeader, Progress } from '@/components/ui';
import { requirePermission } from '@/lib/auth/current-user';
import { getClubStats, getReportData } from '@/lib/db/queries';
import { articleStatus, projectStatus } from '@/lib/domain/labels';
import { formatDate, formatNumber, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Reports & analytics' };

export default async function ReportsPage() {
  await requirePermission('reports:read', '/portal/reports');
  const { locale, d } = await getT();

  const [stats, report] = await Promise.all([getClubStats(), getReportData()]);

  const committeePoints = report.pointsByCommittee.map((row) => ({
    name: committeeName(row.committee, locale),
    points: row.points,
  }));

  const attendanceTrend = report.attendanceTrend.map((row) => ({
    label: formatDate(row.label, locale, { day: 'numeric', month: 'short' }),
    rate: row.rate,
  }));

  const eventParticipation = report.eventParticipation.map((row) => ({
    name: pick(locale, row.event as unknown as Record<string, unknown>, 'title'),
    registered: row.registered,
  }));

  const challengeData = report.challengeParticipation.map((row) => ({
    name: pick(locale, row.challenge as unknown as Record<string, unknown>, 'title'),
    participants: row.participants,
    correct: row.correct,
  }));

  const articleData = report.articleStatusCounts
    .filter((row) => row.count > 0)
    .map((row) => ({ name: articleStatus(row.status, d).label, value: row.count }));

  return (
    <>
      <PageHeader eyebrow={d.brand.fullName} title={d.reports.title} subtitle={d.reports.subtitle} />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label={d.reports.activeMembers}
          value={formatNumber(stats.activeMembers, locale)}
          hint={`${formatNumber(stats.totalMembers, locale)} ${d.common.total.toLowerCase()}`}
          icon={<Users strokeWidth={1.75} />}
        />
        <MetricCard
          label={d.dashboard.attendanceRate}
          value={`${formatNumber(stats.attendanceRate, locale)}%`}
          icon={<ClipboardCheck strokeWidth={1.75} />}
          tone="rose"
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
          icon={<Newspaper strokeWidth={1.75} />}
          tone="berry"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title={d.reports.attendanceStats} subtitle={d.attendance.overallRate} />
          <div className="p-6 pt-4">
            {attendanceTrend.length > 0 ? (
              <BrandAreaChart
                data={attendanceTrend}
                xKey="label"
                areaKey="rate"
                label={d.attendance.rate}
              />
            ) : (
              <EmptyState icon={<ChartColumn />} title={d.reports.noData} />
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title={d.reports.committeeActivity} subtitle={d.reports.pointsDistribution} />
          <div className="p-6 pt-4">
            <BrandBarChart
              data={committeePoints}
              xKey="name"
              bars={[{ key: 'points', label: d.common.points }]}
              layout="vertical"
              height={280}
            />
          </div>
        </Card>

        <Card>
          <CardHeader title={d.reports.eventParticipation} />
          <div className="p-6 pt-4">
            <BrandBarChart
              data={eventParticipation}
              xKey="name"
              bars={[{ key: 'registered', label: d.events.registered }]}
              layout="vertical"
              height={280}
            />
          </div>
        </Card>

        <Card>
          <CardHeader title={d.reports.challengeParticipation} />
          <div className="p-6 pt-4">
            {challengeData.length > 0 ? (
              <BrandBarChart
                data={challengeData}
                xKey="name"
                bars={[
                  { key: 'participants', label: d.challenges.participants },
                  { key: 'correct', label: d.challenges.correct },
                ]}
                layout="vertical"
                height={280}
              />
            ) : (
              <EmptyState icon={<ChartColumn />} title={d.reports.noData} />
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title={d.reports.pointsDistribution} subtitle={d.reports.participation} />
          <div className="p-6 pt-4">
            <BrandBarChart
              data={report.pointsDistribution.map((row) => ({ band: row.band, members: row.count }))}
              xKey="band"
              bars={[{ key: 'members', label: d.common.members }]}
            />
          </div>
        </Card>

        <Card>
          <CardHeader title={d.reports.magazineSubmissions} />
          <div className="p-6 pt-4">
            {articleData.length > 0 ? (
              <BrandPieChart data={articleData} />
            ) : (
              <EmptyState icon={<ChartColumn />} title={d.reports.noData} />
            )}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title={d.reports.projectProgress} />
          <ul className="grid gap-5 p-6 pt-4 md:grid-cols-2">
            {report.projectProgress.map(({ project, progress }) => (
              <li key={project.id}>
                <Progress
                  value={progress}
                  label={`${pick(locale, project as unknown as Record<string, unknown>, 'title')} — ${projectStatus(project.status, d).label}`}
                  tone={project.status === 'completed' ? 'gold' : 'plum'}
                />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
