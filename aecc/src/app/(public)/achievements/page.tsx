import type { Metadata } from 'next';
import { NavIcon } from '@/components/portal/NavIcon';
import { SparkRule } from '@/components/brand/Motifs';
import { Card, Pill } from '@/components/ui';
import { getClubStats, listBadges } from '@/lib/db/queries';
import { badgeTier } from '@/lib/domain/labels';
import { fill, formatNumber, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Achievements' };

export default async function PublicAchievementsPage() {
  const { locale, d } = await getT();
  // Badge definitions and counts only — no individual student is named publicly.
  const [badges, stats] = await Promise.all([listBadges(), getClubStats()]);

  return (
    <>
      <section className="border-b border-line bg-blush py-16 text-center md:py-20">
        <div className="shell">
          <p className="eyebrow">{d.brand.fullName}</p>
          <h1 className="mt-3 font-brand text-h1 text-plum md:text-hero">
            {d.publicSite.achievementsTitle}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-body text-ink-muted">{d.achievements.subtitle}</p>
          <SparkRule className="mx-auto mt-8 max-w-xs" />
        </div>
      </section>

      <section className="shell py-16 md:py-20">
        <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4">
          {[
            { value: stats.totalMembers, label: d.publicSite.statMembers },
            { value: stats.currentProjects, label: d.publicSite.statProjects },
            { value: stats.publishedArticles, label: d.publicSite.statArticles },
            { value: stats.totalEventsThisYear, label: d.publicSite.statEvents },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-brand text-[2.25rem] text-plum tabular-nums">
                {formatNumber(stat.value, locale)}
              </p>
              <p className="mt-1 text-caption uppercase tracking-[0.14em] text-mauve">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {badges.map((badge) => {
            const tier = badgeTier(badge.tier, d);
            return (
              <Card as="article" key={badge.id} className="p-6">
                <div className="flex items-start gap-4">
                  <span
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-pill ${
                      badge.tier === 'honour'
                        ? 'bg-[#F9EDE6] text-[#8A5540]'
                        : badge.tier === 'distinction'
                          ? 'bg-rose-50 text-rose-600'
                          : 'bg-blush text-mauve-dark'
                    }`}
                  >
                    <NavIcon name={badge.icon} className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-brand text-[1.0625rem] text-plum">
                        {pick(locale, badge as unknown as Record<string, unknown>, 'name')}
                      </h2>
                      <Pill tone={tier.tone}>{tier.label}</Pill>
                    </div>
                    <p className="mt-2 text-small leading-relaxed text-ink-muted">
                      {pick(locale, badge as unknown as Record<string, unknown>, 'description')}
                    </p>
                    {badge.awarded_count > 0 ? (
                      <p className="mt-3 text-caption text-ink-faint">
                        {fill(d.achievements.earnedBy, {
                          count: formatNumber(badge.awarded_count, locale),
                        })}
                      </p>
                    ) : null}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <p className="mt-12 text-center text-caption text-ink-faint">{d.publicSite.privacyNote}</p>
      </section>
    </>
  );
}
