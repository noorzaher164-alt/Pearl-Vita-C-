import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarDays, CalendarPlus, List } from 'lucide-react';
import { EventCard, committeeName } from '@/components/portal/Common';
import { Card, EmptyState, LinkButton, LinkTabs, PageHeader, Pill } from '@/components/ui';
import { requirePermission } from '@/lib/auth/current-user';
import { listEvents } from '@/lib/db/queries';
import { eventStatus } from '@/lib/domain/labels';
import { formatDate, formatDateTime, formatNumber, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Events' };

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; filter?: string }>;
}) {
  const viewer = await requirePermission('events:read', '/portal/events');
  const { locale, d } = await getT();
  const params = await searchParams;
  const view = params.view === 'calendar' ? 'calendar' : 'list';
  const filter = params.filter === 'past' ? 'past' : 'upcoming';

  const all = await listEvents(viewer.id);
  const now = Date.now();
  const upcoming = all.filter((e) => new Date(e.starts_at).getTime() >= now);
  const past = all
    .filter((e) => new Date(e.starts_at).getTime() < now)
    .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime());
  const shown = filter === 'past' ? past : upcoming;

  // Calendar view: group by month, then by day.
  const byMonth = new Map<string, typeof shown>();
  for (const event of shown) {
    const key = event.starts_at.slice(0, 7);
    byMonth.set(key, [...(byMonth.get(key) ?? []), event]);
  }

  return (
    <>
      <PageHeader
        eyebrow={d.brand.fullName}
        title={d.events.title}
        subtitle={d.events.subtitle}
        actions={
          viewer.permissions.can('events:write') ? (
            <LinkButton href="/portal/events/new">
              <CalendarPlus className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.75} />
              {d.events.createEvent}
            </LinkButton>
          ) : null
        }
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <LinkTabs
          activeKey={filter}
          items={[
            { key: 'upcoming', label: d.events.upcoming, href: `/portal/events?view=${view}`, count: upcoming.length },
            { key: 'past', label: d.events.past, href: `/portal/events?view=${view}&filter=past`, count: past.length },
          ]}
        />
        <LinkTabs
          activeKey={view}
          items={[
            { key: 'list', label: d.events.listView, href: `/portal/events?filter=${filter}` },
            { key: 'calendar', label: d.events.calendarView, href: `/portal/events?view=calendar&filter=${filter}` },
          ]}
        />
      </div>

      {shown.length === 0 ? (
        <EmptyState icon={<CalendarDays />} title={d.events.noEvents} />
      ) : view === 'list' ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {shown.map((event) => (
            <EventCard key={event.id} event={event} locale={locale} d={d} />
          ))}
        </div>
      ) : (
        <div className="grid gap-8">
          {Array.from(byMonth.entries()).map(([month, events]) => (
            <section key={month} aria-labelledby={`month-${month}`}>
              <h2 id={`month-${month}`} className="mb-4 font-brand text-h3 text-plum">
                {formatDate(`${month}-01`, locale, { month: 'long', year: 'numeric' })}
              </h2>
              <Card className="divide-y divide-line">
                {events.map((event) => {
                  const status = eventStatus(event.status, d);
                  const date = new Date(event.starts_at);
                  return (
                    <Link
                      key={event.id}
                      href={`/portal/events/${event.id}`}
                      className="flex flex-wrap items-center gap-4 p-4 transition hover:bg-blush"
                    >
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-control border border-line bg-blush text-center">
                        <span className="block font-brand text-h3 leading-none text-plum tabular-nums">
                          {formatNumber(date.getUTCDate(), locale)}
                        </span>
                        <span className="mt-0.5 block text-[0.625rem] uppercase tracking-widest text-mauve">
                          {formatDate(event.starts_at, locale, { month: 'short' })}
                        </span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-brand text-[1.0625rem] text-plum">
                          {pick(locale, event as unknown as Record<string, unknown>, 'title')}
                        </span>
                        <span className="block text-caption text-ink-muted">
                          {formatDateTime(event.starts_at, locale)}
                          {event.committee ? ` · ${committeeName(event.committee, locale)}` : ''}
                        </span>
                      </span>
                      <Pill tone={status.tone}>{status.label}</Pill>
                    </Link>
                  );
                })}
              </Card>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
