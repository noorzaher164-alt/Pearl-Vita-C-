import type { Metadata } from 'next';
import Link from 'next/link';
import { ClipboardCheck, ClipboardPlus } from 'lucide-react';
import { committeeName } from '@/components/portal/Common';
import {
  Card,
  EmptyState,
  LinkButton,
  MetricCard,
  PageHeader,
  Pill,
  Progress,
  TableShell,
} from '@/components/ui';
import { requirePermission } from '@/lib/auth/current-user';
import { attendanceByCommittee, listAttendanceSessions, overallAttendanceRate } from '@/lib/db/queries';
import { sessionKind } from '@/lib/domain/labels';
import { formatDate, formatNumber, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Attendance' };

export default async function AttendancePage() {
  const viewer = await requirePermission('attendance:read', '/portal/attendance');
  const { locale, d } = await getT();

  const [sessions, overall, byCommittee] = await Promise.all([
    listAttendanceSessions(),
    overallAttendanceRate(),
    attendanceByCommittee(),
  ]);

  const canWrite = viewer.permissions.can('attendance:write');

  return (
    <>
      <PageHeader
        eyebrow={d.brand.fullName}
        title={d.attendance.title}
        subtitle={d.attendance.subtitle}
        actions={
          canWrite ? (
            <LinkButton href="/portal/attendance/new">
              <ClipboardPlus className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.75} />
              {d.attendance.newSession}
            </LinkButton>
          ) : null
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label={d.attendance.overallRate}
          value={`${formatNumber(overall, locale)}%`}
          icon={<ClipboardCheck strokeWidth={1.75} />}
        />
        <MetricCard
          label={d.attendance.sessions}
          value={formatNumber(sessions.length, locale)}
          tone="rose"
        />
        <MetricCard
          label={d.attendance.present}
          value={formatNumber(
            sessions.reduce((sum, s) => sum + s.present, 0),
            locale,
          )}
          tone="mauve"
        />
        <MetricCard
          label={d.attendance.absent}
          value={formatNumber(
            sessions.reduce((sum, s) => sum + s.absent, 0),
            locale,
          )}
          tone="berry"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-4 font-brand text-h3 text-plum">{d.attendance.sessions}</h2>
          {sessions.length === 0 ? (
            <EmptyState icon={<ClipboardCheck />} title={d.attendance.noSessions} />
          ) : (
            <>
              <TableShell className="hidden md:block">
                <table className="aecc-table">
                  <caption className="sr-only">{d.attendance.title}</caption>
                  <thead>
                    <tr>
                      <th scope="col">{d.attendance.session}</th>
                      <th scope="col">{d.common.date}</th>
                      <th scope="col" className="text-end">{d.attendance.present}</th>
                      <th scope="col" className="text-end">{d.attendance.absent}</th>
                      <th scope="col" className="text-end">{d.attendance.late}</th>
                      <th scope="col">{d.attendance.rate}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session) => (
                      <tr key={session.id}>
                        <td>
                          <Link
                            href={`/portal/attendance/${session.id}`}
                            className="font-semibold text-plum transition hover:text-plum-dark"
                          >
                            {pick(locale, session as unknown as Record<string, unknown>, 'title')}
                          </Link>
                          <span className="mt-1 block">
                            <Pill tone="soft">{sessionKind(session.kind, d)}</Pill>
                          </span>
                        </td>
                        <td className="whitespace-nowrap text-ink-muted">
                          {formatDate(session.held_at, locale)}
                        </td>
                        <td className="text-end tabular-nums">{formatNumber(session.present, locale)}</td>
                        <td className="text-end tabular-nums">{formatNumber(session.absent, locale)}</td>
                        <td className="text-end tabular-nums">{formatNumber(session.late, locale)}</td>
                        <td className="w-32">
                          <Progress value={session.rate} label={`${session.rate}%`} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableShell>

              <ul className="grid gap-3 md:hidden">
                {sessions.map((session) => (
                  <Card as="li" key={session.id} className="p-4">
                    <Link href={`/portal/attendance/${session.id}`}>
                      <span className="block font-brand text-[1.0625rem] text-plum">
                        {pick(locale, session as unknown as Record<string, unknown>, 'title')}
                      </span>
                      <span className="mt-1 block text-caption text-ink-muted">
                        {formatDate(session.held_at, locale)} · {sessionKind(session.kind, d)}
                      </span>
                      <Progress value={session.rate} label={d.attendance.rate} className="mt-3" />
                    </Link>
                  </Card>
                ))}
              </ul>
            </>
          )}
        </div>

        <div>
          <h2 className="mb-4 font-brand text-h3 text-plum">{d.attendance.perCommittee}</h2>
          <Card className="p-6">
            <ul className="grid gap-5">
              {byCommittee.map(({ committee, rate }) => (
                <li key={committee.id}>
                  <Progress value={rate} label={committeeName(committee, locale)} />
                </li>
              ))}
            </ul>
            <p className="mt-6 border-t border-line pt-4 text-caption text-ink-faint">
              {d.attendance.correctionNote}
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
