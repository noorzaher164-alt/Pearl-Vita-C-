import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { AttendanceSheet } from '@/components/forms/AttendanceSheet';
import { committeeName, memberName } from '@/components/portal/Common';
import { InlineAlert, MetricCard, PageHeader, Pill } from '@/components/ui';
import { requirePermission } from '@/lib/auth/current-user';
import { getAttendanceSession } from '@/lib/db/queries';
import { sessionKind } from '@/lib/domain/labels';
import { formatDateTime, formatNumber, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Attendance session' };

export default async function AttendanceSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const viewer = await requirePermission('attendance:read');
  const { locale, d } = await getT();
  const { id } = await params;

  const data = await getAttendanceSession(id);
  if (!data) notFound();

  const { session, rows } = data;
  const canWrite = viewer.permissions.can('attendance:write');

  return (
    <>
      <Link
        href="/portal/attendance"
        className="mb-6 inline-flex items-center gap-2 text-small font-semibold text-plum transition hover:text-plum-dark"
      >
        <ArrowLeft className="h-4 w-4 rtl-flip" aria-hidden="true" strokeWidth={1.75} />
        {d.attendance.title}
      </Link>

      <PageHeader
        eyebrow={
          <span className="inline-flex items-center gap-2">
            <Pill tone="soft">{sessionKind(session.kind, d)}</Pill>
            {session.committee ? <Pill tone="mauve">{committeeName(session.committee, locale)}</Pill> : null}
          </span>
        }
        title={pick(locale, session as unknown as Record<string, unknown>, 'title')}
        subtitle={`${d.attendance.heldOn} ${formatDateTime(session.held_at, locale)}`}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label={d.attendance.present} value={formatNumber(session.present, locale)} />
        <MetricCard label={d.attendance.absent} value={formatNumber(session.absent, locale)} tone="berry" />
        <MetricCard label={d.attendance.late} value={formatNumber(session.late, locale)} tone="gold" />
        <MetricCard label={d.attendance.rate} value={`${formatNumber(session.rate, locale)}%`} tone="rose" />
      </div>

      {!canWrite ? (
        <InlineAlert tone="info" title={d.auth.permissionDenied}>
          {d.attendance.correctionNote}
        </InlineAlert>
      ) : null}

      <AttendanceSheet
        sessionId={session.id}
        readOnly={!canWrite}
        d={d}
        rows={rows.map(({ member, record }) => ({
          id: member.id,
          name: memberName(member, locale),
          grade: member.grade,
          avatar: member.avatar_url,
          status: record?.status ?? null,
        }))}
      />
    </>
  );
}
