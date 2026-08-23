import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  ClipboardCheck,
  Clock,
  MapPin,
  Package,
  Sparkles,
  UserCheck,
  Users,
} from 'lucide-react';
import { joinEventAction, leaveEventAction } from '@/app/actions/portal';
import { MemberLine, committeeName } from '@/components/portal/Common';
import {
  Card,
  CardHeader,
  InlineAlert,
  LinkButton,
  Pill,
  Progress,
  Stat,
} from '@/components/ui';
import { requirePermission } from '@/lib/auth/current-user';
import { getEvent } from '@/lib/db/queries';
import { eventStatus } from '@/lib/domain/labels';
import { fill, formatDate, formatDateTime, formatNumber, formatTime, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Event' };

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const viewer = await requirePermission('events:read');
  const { locale, d } = await getT();
  const { id } = await params;

  const event = await getEvent(id, viewer.id);
  if (!event) notFound();

  const status = eventStatus(event.status, d);
  const title = pick(locale, event as unknown as Record<string, unknown>, 'title');
  const deadlinePassed = event.registration_deadline
    ? new Date(event.registration_deadline).getTime() < Date.now()
    : false;
  const isPast = new Date(event.starts_at).getTime() < Date.now();
  const canJoin =
    viewer.permissions.can('events:register') &&
    !isPast &&
    !deadlinePassed &&
    event.status !== 'cancelled' &&
    event.status !== 'completed' &&
    event.spots_left > 0;

  return (
    <>
      <Link
        href="/portal/events"
        className="mb-6 inline-flex items-center gap-2 text-small font-semibold text-plum transition hover:text-plum-dark"
      >
        <ArrowLeft className="h-4 w-4 rtl-flip" aria-hidden="true" strokeWidth={1.75} />
        {d.events.title}
      </Link>

      <Card className="mb-6 overflow-hidden">
        {event.cover_image ? (
          <div className="relative aspect-[21/7] bg-blush">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={event.cover_image} alt="" className="h-full w-full object-cover" aria-hidden="true" />
          </div>
        ) : null}
        <div className="p-6 md:p-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Pill tone={status.tone}>{status.label}</Pill>
            {event.committee ? <Pill tone="soft">{committeeName(event.committee, locale)}</Pill> : null}
            <Pill tone="gold">
              +{formatNumber(event.points_reward, locale)} {d.common.points}
            </Pill>
          </div>

          <h1 className="font-brand text-h1 text-plum">{title}</h1>

          <dl className="mt-6 grid gap-5 border-t border-line pt-6 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label={d.common.date}
              value={
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-rose-gold" aria-hidden="true" strokeWidth={1.75} />
                  {formatDate(event.starts_at, locale)}
                </span>
              }
            />
            <Stat
              label={d.common.time}
              value={
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-rose-gold" aria-hidden="true" strokeWidth={1.75} />
                  {formatTime(event.starts_at, locale)} – {formatTime(event.ends_at, locale)}
                </span>
              }
            />
            <Stat
              label={d.common.location}
              value={
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-rose-gold" aria-hidden="true" strokeWidth={1.75} />
                  {pick(locale, event as unknown as Record<string, unknown>, 'location')}
                </span>
              }
            />
            <Stat
              label={d.events.organizer}
              value={event.organizer ? event.organizer.full_name_en : '—'}
            />
          </dl>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid content-start gap-6 lg:col-span-2">
          <Card>
            <CardHeader title={d.events.aboutEvent} />
            <div className="p-6 pt-4">
              <p className="max-w-prose leading-relaxed text-ink">
                {pick(locale, event as unknown as Record<string, unknown>, 'description')}
              </p>
            </div>
          </Card>

          {pick(locale, event as unknown as Record<string, unknown>, 'materials') ? (
            <Card>
              <CardHeader
                title={
                  <span className="inline-flex items-center gap-2">
                    <Package className="h-4 w-4 text-mauve" aria-hidden="true" strokeWidth={1.75} />
                    {d.events.requiredMaterials}
                  </span>
                }
              />
              <div className="p-6 pt-4">
                <p className="text-small text-ink-muted">
                  {pick(locale, event as unknown as Record<string, unknown>, 'materials')}
                </p>
              </div>
            </Card>
          ) : null}

          {pick(locale, event as unknown as Record<string, unknown>, 'safety_note') ? (
            <InlineAlert tone="warning" title={d.events.safetyNote} icon={<AlertTriangle />}>
              {pick(locale, event as unknown as Record<string, unknown>, 'safety_note')}
            </InlineAlert>
          ) : null}

          <Card>
            <CardHeader
              title={d.events.registeredMembers}
              subtitle={`${formatNumber(event.registered_count, locale)} / ${formatNumber(event.capacity, locale)}`}
              action={
                viewer.permissions.can('attendance:write') && isPast ? (
                  <LinkButton href="/portal/attendance" variant="outline" size="sm">
                    <ClipboardCheck className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />
                    {d.events.markAttendance}
                  </LinkButton>
                ) : null
              }
            />
            <div className="p-6 pt-4">
              <Progress
                value={(event.registered_count / Math.max(1, event.capacity)) * 100}
                className="mb-5"
              />
              {event.attendees.length > 0 ? (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {event.attendees.map((member) => (
                    <li key={member.id}>
                      <MemberLine
                        member={member}
                        locale={locale}
                        href={`/portal/members/${member.id}`}
                        size={32}
                        meta={member.grade}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-small text-ink-muted">{d.common.empty}</p>
              )}
            </div>
          </Card>
        </div>

        <div className="grid content-start gap-6">
          <Card className="p-6">
            <h2 className="font-brand text-h3 text-plum">{d.events.registered}</h2>
            <p className="mt-4 font-brand text-metric text-plum tabular-nums">
              {formatNumber(event.registered_count, locale)}
            </p>
            <p className="text-caption text-ink-muted">
              {fill(d.events.spotsLeft, { count: formatNumber(event.spots_left, locale) })}
            </p>

            {event.registration_deadline ? (
              <p className="mt-4 flex items-center gap-2 text-caption text-ink-muted">
                <Clock className="h-3.5 w-3.5 text-rose-gold" aria-hidden="true" strokeWidth={1.75} />
                {d.events.registrationDeadline}: {formatDateTime(event.registration_deadline, locale)}
              </p>
            ) : null}

            <div className="mt-6">
              {event.viewer_registration === 'registered' ? (
                <>
                  <div className="mb-3 flex items-center gap-2 rounded-control border border-[#CFE0D3] bg-success-soft px-4 py-3 text-small text-success-ink">
                    <UserCheck className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />
                    {d.events.joined}
                  </div>
                  {!isPast ? (
                    <form action={leaveEventAction}>
                      <input type="hidden" name="eventId" value={event.id} />
                      <button type="submit" className="btn btn-outline w-full">
                        {d.events.leaveEvent}
                      </button>
                    </form>
                  ) : null}
                </>
              ) : event.viewer_registration === 'pending' ? (
                <Pill tone="warning">{d.events.pendingApproval}</Pill>
              ) : canJoin ? (
                <form action={joinEventAction}>
                  <input type="hidden" name="eventId" value={event.id} />
                  <button type="submit" className="btn btn-primary w-full">
                    <Sparkles className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.75} />
                    {d.events.joinEvent}
                  </button>
                </form>
              ) : (
                <p className="rounded-control border border-line bg-blush px-4 py-3 text-center text-small text-ink-muted">
                  {event.spots_left === 0
                    ? d.events.full
                    : isPast || event.status === 'completed'
                      ? d.events.statusCompleted
                      : d.events.registrationClosed}
                </p>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 font-brand text-h3 text-plum">{d.events.responsibleCommittee}</h2>
            {event.committee ? (
              <Link
                href={`/portal/committees/${event.committee.slug}`}
                className="flex items-center gap-3 rounded-control border border-line bg-blush px-4 py-3 transition hover:border-rose"
              >
                <Users className="h-4 w-4 shrink-0 text-rose-gold" aria-hidden="true" strokeWidth={1.75} />
                <span className="text-small font-semibold text-plum">
                  {committeeName(event.committee, locale)}
                </span>
              </Link>
            ) : (
              <p className="text-small text-ink-muted">{d.common.none}</p>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
