import type { Metadata } from 'next';
import { GraduationCap, Target, Users } from 'lucide-react';
import { Logo, } from '@/components/brand/Logo';
import { SparkRule } from '@/components/brand/Motifs';
import { Card, Pill } from '@/components/ui';
import { listCommittees } from '@/lib/db/queries';
import { committeeName } from '@/components/portal/Common';
import { accentTone } from '@/lib/domain/labels';
import { fill, formatNumber, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: 'About AECC',
  description: 'About Al Eman Chemistry Club — vision, mission and committees.',
};

export default async function AboutPage() {
  const { locale, d } = await getT();
  const committees = await listCommittees();

  return (
    <>
      <section className="border-b border-line bg-blush py-16 text-center md:py-20">
        <div className="shell">
          <div className="mx-auto w-fit">
            <Logo locale={locale} size={120} alt={d.a11y.logoAlt} />
          </div>
          <p className="eyebrow mt-6">{d.publicSite.heroKicker}</p>
          <h1 className="mt-3 font-brand text-h1 text-plum md:text-hero">{d.publicSite.aboutTitle}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-muted">
            {d.publicSite.aboutBody}
          </p>
          <SparkRule className="mx-auto mt-8 max-w-xs" />
        </div>
      </section>

      <section className="shell py-16 md:py-20" aria-labelledby="about-vision">
        <h2 id="about-vision" className="sr-only">
          {d.publicSite.vision} · {d.publicSite.mission}
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-8">
            <span className="mb-4 grid h-11 w-11 place-items-center rounded-control bg-plum-50 text-plum">
              <Target className="h-5 w-5" aria-hidden="true" strokeWidth={1.75} />
            </span>
            <h3 className="font-brand text-h2 text-plum">{d.publicSite.vision}</h3>
            <p className="mt-3 leading-relaxed text-ink-muted">{d.publicSite.visionBody}</p>
          </Card>
          <Card className="p-8">
            <span className="mb-4 grid h-11 w-11 place-items-center rounded-control bg-rose-50 text-rose">
              <GraduationCap className="h-5 w-5" aria-hidden="true" strokeWidth={1.75} />
            </span>
            <h3 className="font-brand text-h2 text-plum">{d.publicSite.mission}</h3>
            <p className="mt-3 leading-relaxed text-ink-muted">{d.publicSite.missionBody}</p>
          </Card>
        </div>
      </section>

      <section className="border-t border-line bg-blush py-16 md:py-20" aria-labelledby="about-committees">
        <div className="shell">
          <div className="mb-10 text-center">
            <p className="eyebrow mb-3">{d.committees.title}</p>
            <h2 id="about-committees" className="font-brand text-h1 text-plum">
              {d.committees.subtitle}
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {committees.map((committee) => (
              <Card as="article" key={committee.id} className="p-6">
                <div className="mb-3 flex items-center gap-2">
                  <Pill tone={accentTone(committee.accent)}>
                    {fill(d.members.memberCount, {
                      count: formatNumber(committee.member_count, locale),
                    })}
                  </Pill>
                </div>
                <h3 className="font-brand text-h3 text-plum">{committeeName(committee, locale)}</h3>
                <p className="mt-2 text-small leading-relaxed text-ink-muted">
                  {pick(locale, committee as unknown as Record<string, unknown>, 'description')}
                </p>
              </Card>
            ))}
          </div>
          <p className="mt-10 flex items-center justify-center gap-2 text-caption text-ink-faint">
            <Users className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={1.75} />
            {d.publicSite.privacyNote}
          </p>
        </div>
      </section>
    </>
  );
}
