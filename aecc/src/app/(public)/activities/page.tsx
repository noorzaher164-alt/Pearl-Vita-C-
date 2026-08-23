import type { Metadata } from 'next';
import { CalendarDays, FlaskConical, Leaf, MapPin, Microscope, PenLine } from 'lucide-react';
import { SparkRule } from '@/components/brand/Motifs';
import { Card, Meta, Pill } from '@/components/ui';
import { committeeName } from '@/components/portal/Common';
import { listEvents } from '@/lib/db/queries';
import { eventStatus } from '@/lib/domain/labels';
import { formatDateTime, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Activities' };

export default async function ActivitiesPage() {
  const { locale, d } = await getT();
  const events = await listEvents();
  const upcoming = events.filter(
    (event) => new Date(event.starts_at).getTime() >= Date.now() && event.status !== 'cancelled',
  );

  const pillars = [
    { icon: <FlaskConical />, title: d.publicSite.activityExperiments, body: d.publicSite.activityExperimentsBody },
    { icon: <Microscope />, title: d.publicSite.activityResearch, body: d.publicSite.activityResearchBody },
    { icon: <PenLine />, title: d.publicSite.activityMagazine, body: d.publicSite.activityMagazineBody },
    { icon: <Leaf />, title: d.publicSite.activityCommunity, body: d.publicSite.activityCommunityBody },
  ];

  return (
    <>
      <section className="border-b border-line bg-blush py-16 text-center md:py-20">
        <div className="shell">
          <p className="eyebrow">{d.brand.fullName}</p>
          <h1 className="mt-3 font-brand text-h1 text-plum md:text-hero">
            {d.publicSite.activitiesTitle}
          </h1>
          <SparkRule className="mx-auto mt-8 max-w-xs" />
        </div>
      </section>

      <section className="shell py-16 md:py-20" aria-labelledby="activities-pillars">
        <h2 id="activities-pillars" className="sr-only">
          {d.publicSite.activitiesTitle}
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {pillars.map((pillar) => (
            <Card key={pillar.title} className="p-8">
              <span className="mb-4 grid h-11 w-11 place-items-center rounded-control bg-plum-50 text-plum [&>svg]:h-5 [&>svg]:w-5">
                {pillar.icon}
              </span>
              <h3 className="font-brand text-h2 text-plum">{pillar.title}</h3>
              <p className="mt-3 leading-relaxed text-ink-muted">{pillar.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {upcoming.length > 0 ? (
        <section className="border-t border-line bg-blush py-16 md:py-20" aria-labelledby="activities-events">
          <div className="shell">
            <div className="mb-10 text-center">
              <p className="eyebrow mb-3">{d.events.upcoming}</p>
              <h2 id="activities-events" className="font-brand text-h1 text-plum">
                {d.events.title}
              </h2>
            </div>
            <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((event) => {
                const status = eventStatus(event.status, d);
                return (
                  <Card as="li" key={event.id} className="p-6">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <Pill tone={status.tone}>{status.label}</Pill>
                      {event.committee ? (
                        <Pill tone="soft">{committeeName(event.committee, locale)}</Pill>
                      ) : null}
                    </div>
                    <h3 className="font-brand text-h3 text-plum">
                      {pick(locale, event as unknown as Record<string, unknown>, 'title')}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-small leading-relaxed text-ink-muted">
                      {pick(locale, event as unknown as Record<string, unknown>, 'description')}
                    </p>
                    <Meta
                      className="mt-4"
                      items={[
                        <>
                          <CalendarDays aria-hidden="true" />
                          {formatDateTime(event.starts_at, locale)}
                        </>,
                        <>
                          <MapPin aria-hidden="true" />
                          {pick(locale, event as unknown as Record<string, unknown>, 'location')}
                        </>,
                      ]}
                    />
                  </Card>
                );
              })}
            </ul>
            <p className="mt-10 text-center text-caption text-ink-faint">{d.publicSite.privacyNote}</p>
          </div>
        </section>
      ) : null}
    </>
  );
}
