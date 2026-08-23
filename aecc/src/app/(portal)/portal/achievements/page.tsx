import type { Metadata } from 'next';
import { Medal } from 'lucide-react';
import { AwardBadgeForm } from '@/components/forms/AwardBadgeForm';
import { NavIcon } from '@/components/portal/NavIcon';
import { MemberLine, memberName } from '@/components/portal/Common';
import { AvatarStack, Card, CardHeader, EmptyState, PageHeader, Pill } from '@/components/ui';
import { requirePermission } from '@/lib/auth/current-user';
import { listBadgeAwards, listBadges, listMembers } from '@/lib/db/queries';
import { badgeTier } from '@/lib/domain/labels';
import { fill, formatDate, formatNumber, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Achievements' };

export default async function AchievementsPage() {
  const viewer = await requirePermission('badges:read', '/portal/achievements');
  const { locale, d } = await getT();

  const [badges, awards, members] = await Promise.all([
    listBadges(),
    listBadgeAwards(12),
    listMembers({ studentsOnly: true, status: 'active' }),
  ]);

  const canAward = viewer.permissions.can('badges:award');

  return (
    <>
      <PageHeader
        eyebrow={d.brand.fullName}
        title={d.achievements.title}
        subtitle={d.achievements.subtitle}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid content-start gap-6 lg:col-span-2">
          <section aria-labelledby="badge-gallery">
            <h2 id="badge-gallery" className="mb-4 font-brand text-h3 text-plum">
              {d.achievements.badgeGallery}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {badges.map((badge) => {
                const tier = badgeTier(badge.tier, d);
                const earned = badge.awarded_count > 0;
                return (
                  <Card
                    as="article"
                    key={badge.id}
                    className={cn('p-6', !earned && 'opacity-70')}
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className={cn(
                          'grid h-12 w-12 shrink-0 place-items-center rounded-pill',
                          badge.tier === 'honour'
                            ? 'bg-[#F9EDE6] text-[#8A5540]'
                            : badge.tier === 'distinction'
                              ? 'bg-rose-50 text-rose-600'
                              : 'bg-blush text-mauve-dark',
                        )}
                      >
                        <NavIcon name={badge.icon} className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-brand text-[1.0625rem] text-plum">
                            {pick(locale, badge as unknown as Record<string, unknown>, 'name')}
                          </h3>
                          <Pill tone={tier.tone}>{tier.label}</Pill>
                        </div>
                        <p className="mt-1.5 text-small leading-relaxed text-ink-muted">
                          {pick(locale, badge as unknown as Record<string, unknown>, 'description')}
                        </p>
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <span className="text-caption text-ink-faint">
                            {earned
                              ? fill(d.achievements.earnedBy, {
                                  count: formatNumber(badge.awarded_count, locale),
                                })
                              : d.achievements.notEarned}
                          </span>
                          <AvatarStack
                            people={badge.holders.map((h) => ({
                              name: memberName(h, locale),
                              avatar: h.avatar_url,
                            }))}
                            size={24}
                            max={4}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>

          <Card>
            <CardHeader title={d.achievements.awardHistory} />
            <div className="mt-4">
              {awards.length === 0 ? (
                <div className="p-6">
                  <EmptyState icon={<Medal />} title={d.achievements.noBadges} />
                </div>
              ) : (
                <ul className="divide-y divide-line">
                  {awards.map(({ award, badge, member }) =>
                    badge && member ? (
                      <li key={award.id} className="flex flex-wrap items-center gap-3 px-6 py-3">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-pill bg-[#F9EDE6] text-[#8A5540]">
                          <NavIcon name={badge.icon} className="h-4 w-4" />
                        </span>
                        <MemberLine
                          member={member}
                          locale={locale}
                          href={`/portal/members/${member.id}`}
                          size={28}
                          meta={pick(locale, badge as unknown as Record<string, unknown>, 'name')}
                        />
                        <span className="ms-auto text-caption text-ink-faint">
                          {formatDate(award.awarded_at, locale)}
                        </span>
                      </li>
                    ) : null,
                  )}
                </ul>
              )}
            </div>
          </Card>
        </div>

        {canAward ? (
          <div>
            <AwardBadgeForm
              d={d}
              members={members.map((m) => ({ id: m.id, name: memberName(m, locale) }))}
              badges={badges.map((b) => ({
                id: b.id,
                name: pick(locale, b as unknown as Record<string, unknown>, 'name'),
              }))}
            />
          </div>
        ) : null}
      </div>
    </>
  );
}
