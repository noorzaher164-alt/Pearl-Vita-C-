import Link from 'next/link';
import { CalendarDays, ChevronRight, MapPin, Users } from 'lucide-react';
import { Avatar, Card, Meta, Pill, Progress } from '@/components/ui';
import { NavIcon } from '@/components/portal/NavIcon';
import type { EventView } from '@/lib/db/queries';
import type { AnnouncementView, ProjectView } from '@/lib/db/queries';
import { announcementLevel, eventStatus, projectStatus } from '@/lib/domain/labels';
import type { Committee, MemberView } from '@/lib/domain/types';
import { fill, formatDate, formatDateTime, formatNumber, pick, type Dictionary, type Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/** Shared presentation pieces reused across the portal. */

export function memberName(member: MemberView | null | undefined, locale: Locale): string {
  if (!member) return '—';
  return locale === 'ar' && member.full_name_ar ? member.full_name_ar : member.full_name_en;
}

export function committeeName(committee: Committee | null | undefined, locale: Locale): string {
  if (!committee) return '';
  return pick(locale, committee as unknown as Record<string, unknown>, 'name');
}

/* -------------------------------------------------------------------------- */

export function MemberLine({
  member,
  locale,
  href,
  meta,
  trailing,
  size = 40,
}: {
  member: MemberView;
  locale: Locale;
  href?: string;
  meta?: React.ReactNode;
  trailing?: React.ReactNode;
  size?: number;
}) {
  const name = memberName(member, locale);
  const body = (
    <>
      <Avatar name={name} src={member.avatar_url} size={size} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-small font-semibold text-plum">{name}</span>
        {meta ? <span className="block truncate text-caption text-ink-muted">{meta}</span> : null}
      </span>
      {trailing}
    </>
  );

  if (!href) return <div className="flex items-center gap-3">{body}</div>;

  return (
    <Link href={href} className="flex items-center gap-3 rounded-control transition hover:opacity-80">
      {body}
    </Link>
  );
}

/* -------------------------------------------------------------------------- */

export function EventCard({
  event,
  locale,
  d,
  compact = false,
}: {
  event: EventView;
  locale: Locale;
  d: Dictionary;
  compact?: boolean;
}) {
  const status = eventStatus(event.status, d);
  const title = pick(locale, event as unknown as Record<string, unknown>, 'title');
  const location = pick(locale, event as unknown as Record<string, unknown>, 'location');

  return (
    <Card as="article" className="group overflow-hidden">
      {!compact && event.cover_image ? (
        <div className="relative aspect-[16/6] overflow-hidden bg-blush">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={event.cover_image} alt="" className="h-full w-full object-cover" aria-hidden="true" />
        </div>
      ) : null}
      <div className="p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Pill tone={status.tone}>{status.label}</Pill>
          {event.committee ? <Pill tone="soft">{committeeName(event.committee, locale)}</Pill> : null}
        </div>
        <h3 className="font-brand text-h3 text-plum">
          <Link href={`/portal/events/${event.id}`} className="transition hover:text-plum-dark">
            {title}
          </Link>
        </h3>
        <Meta
          className="mt-3"
          items={[
            <>
              <CalendarDays aria-hidden="true" />
              {formatDateTime(event.starts_at, locale)}
            </>,
            location ? (
              <>
                <MapPin aria-hidden="true" />
                {location}
              </>
            ) : null,
            <>
              <Users aria-hidden="true" />
              {formatNumber(event.registered_count, locale)}/{formatNumber(event.capacity, locale)}
            </>,
          ]}
        />
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */

export function ProjectProgressRow({
  project,
  locale,
  d,
}: {
  project: ProjectView;
  locale: Locale;
  d: Dictionary;
}) {
  const status = projectStatus(project.status, d);
  return (
    <li className="py-4 first:pt-0 last:pb-0">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <Link
          href={`/portal/projects/${project.slug}`}
          className="text-small font-semibold text-plum transition hover:text-plum-dark"
        >
          {pick(locale, project as unknown as Record<string, unknown>, 'title')}
        </Link>
        <Pill tone={status.tone}>{status.label}</Pill>
      </div>
      <Progress value={project.progress} tone={project.status === 'completed' ? 'gold' : 'plum'} />
      <p className="mt-2 text-caption text-ink-faint">
        {fill(d.projects.completedMilestones, {
          done: project.milestones.filter((m) => m.done).length,
          total: project.milestones.length,
        })}
      </p>
    </li>
  );
}

/* -------------------------------------------------------------------------- */

export function AnnouncementCard({
  announcement,
  locale,
  d,
  className,
}: {
  announcement: AnnouncementView;
  locale: Locale;
  d: Dictionary;
  className?: string;
}) {
  const level = announcementLevel(announcement.level, d);
  const accent =
    announcement.level === 'urgent'
      ? 'border-s-danger'
      : announcement.level === 'important'
        ? 'border-s-warning'
        : 'border-s-rose-gold';

  return (
    <Card as="article" className={cn('border-s-[3px] p-5', accent, className)}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Pill tone={level.tone}>{level.label}</Pill>
        {announcement.committee ? (
          <Pill tone="soft">{committeeName(announcement.committee, locale)}</Pill>
        ) : null}
        {announcement.audience_kind === 'leaders' ? (
          <Pill tone="soft">{d.announcements.audienceLeaders}</Pill>
        ) : null}
      </div>
      <h3 className="font-brand text-h3 text-plum">
        {pick(locale, announcement as unknown as Record<string, unknown>, 'title')}
      </h3>
      <p className="mt-2 text-small leading-relaxed text-ink-muted">
        {pick(locale, announcement as unknown as Record<string, unknown>, 'body')}
      </p>
      <Meta
        className="mt-4"
        items={[
          announcement.author ? `${d.announcements.publishedBy} ${memberName(announcement.author, locale)}` : null,
          formatDate(announcement.published_at, locale),
        ]}
      />
    </Card>
  );
}

/* -------------------------------------------------------------------------- */

export function QuickAction({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-control border border-line bg-white px-4 py-3 transition hover:border-rose hover:shadow-soft"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-plum-50 text-plum transition group-hover:bg-plum group-hover:text-white">
        <NavIcon name={icon} className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1 truncate text-small font-semibold text-plum">{label}</span>
      <ChevronRight
        className="h-4 w-4 shrink-0 text-mauve rtl-flip transition group-hover:text-rose"
        aria-hidden="true"
        strokeWidth={1.75}
      />
    </Link>
  );
}

/* -------------------------------------------------------------------------- */

/** Rank medal treatment — restrained rose gold for the top three (guide §8). */
export function RankMark({ rank, locale }: { rank: number; locale: Locale }) {
  const tone =
    rank === 1
      ? 'border-[#E0B79F] bg-[#F9EDE6] text-[#8A5540]'
      : rank === 2
        ? 'border-rose-200 bg-rose-50 text-rose-600'
        : rank === 3
          ? 'border-[#E2D4DA] bg-[#F2EBEE] text-mauve-dark'
          : 'border-line bg-blush text-ink-muted';

  return (
    <span
      className={cn(
        'grid h-8 w-8 shrink-0 place-items-center rounded-pill border font-brand text-small tabular-nums',
        tone,
      )}
    >
      {formatNumber(rank, locale)}
    </span>
  );
}
