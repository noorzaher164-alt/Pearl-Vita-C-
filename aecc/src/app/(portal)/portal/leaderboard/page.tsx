import type { Metadata } from 'next';
import { Trophy } from 'lucide-react';
import { NavIcon } from '@/components/portal/NavIcon';
import { MemberLine, RankMark, committeeName, memberName } from '@/components/portal/Common';
import { Avatar, Card, EmptyState, LinkTabs, PageHeader, Pill, TableShell } from '@/components/ui';
import { requireViewer } from '@/lib/auth/current-user';
import { getLeaderboard, type LeaderboardPeriod } from '@/lib/db/queries';
import { formatNumber, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Leaderboard' };

const PODIUM_STYLE = [
  'order-2 md:order-2 bg-[#FBF2EC] border-[#E4C3B0]',
  'order-1 md:order-1 bg-blush border-line',
  'order-3 md:order-3 bg-blush border-line',
];

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const viewer = await requireViewer('/portal/leaderboard');
  const { locale, d } = await getT();
  const params = await searchParams;

  const period: LeaderboardPeriod =
    params.period === 'month' ? 'month' : params.period === 'semester' ? 'semester' : 'all';
  const entries = await getLeaderboard(period);
  const podium = entries.slice(0, 3);
  const rest = entries.slice(3);
  const mine = entries.find((entry) => entry.member.id === viewer.id);

  return (
    <>
      <PageHeader
        eyebrow={d.brand.fullName}
        title={d.leaderboard.title}
        subtitle={d.leaderboard.subtitle}
      />

      <LinkTabs
        className="mb-8"
        activeKey={period}
        items={[
          { key: 'month', label: d.leaderboard.monthly, href: '/portal/leaderboard?period=month' },
          { key: 'semester', label: d.leaderboard.semester, href: '/portal/leaderboard?period=semester' },
          { key: 'all', label: d.leaderboard.allTime, href: '/portal/leaderboard?period=all' },
        ]}
      />

      {entries.length === 0 ? (
        <EmptyState icon={<Trophy />} title={d.leaderboard.noEntries} />
      ) : (
        <>
          {/* Podium — restrained rose gold for first place only (guide §8) */}
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            {podium.map((entry, index) => (
              <Card
                key={entry.member.id}
                className={cn(
                  'flex flex-col items-center border p-6 text-center',
                  PODIUM_STYLE[index],
                  index === 0 ? 'md:-mt-4 md:pb-10 md:pt-10' : '',
                )}
              >
                <RankMark rank={entry.rank} locale={locale} />
                <Avatar
                  name={memberName(entry.member, locale)}
                  src={entry.member.avatar_url}
                  size={index === 0 ? 72 : 60}
                  className="mt-4 ring-2 ring-white"
                />
                <p className="mt-3 font-brand text-h3 text-plum">{memberName(entry.member, locale)}</p>
                <p className="mt-0.5 text-caption text-ink-muted">
                  {committeeName(entry.committee, locale) || entry.member.grade}
                </p>
                <p className="mt-4 font-brand text-metric text-plum tabular-nums">
                  {formatNumber(entry.points, locale)}
                </p>
                <p className="text-caption text-ink-faint">{d.common.points}</p>
                {entry.topBadge ? (
                  <span className="mt-4">
                    <Pill tone="gold" icon={<NavIcon name={entry.topBadge.icon} />}>
                      {pick(locale, entry.topBadge as unknown as Record<string, unknown>, 'name')}
                    </Pill>
                  </span>
                ) : null}
                <p className="mt-3 text-caption font-semibold uppercase tracking-widest text-mauve">
                  {index === 0
                    ? d.leaderboard.firstPlace
                    : index === 1
                      ? d.leaderboard.secondPlace
                      : d.leaderboard.thirdPlace}
                </p>
              </Card>
            ))}
          </div>

          {mine && mine.rank > 3 ? (
            <Card className="mb-6 border-rose-200 bg-rose-50 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <RankMark rank={mine.rank} locale={locale} />
                <span className="text-small font-semibold text-plum">{d.leaderboard.yourPosition}</span>
                <span className="ms-auto font-brand text-h3 text-plum tabular-nums">
                  {formatNumber(mine.points, locale)}
                </span>
              </div>
            </Card>
          ) : null}

          {rest.length > 0 ? (
            <>
              <TableShell className="hidden md:block">
                <table className="aecc-table">
                  <caption className="sr-only">{d.leaderboard.title}</caption>
                  <thead>
                    <tr>
                      <th scope="col" className="w-16">{d.common.rank}</th>
                      <th scope="col">{d.common.member}</th>
                      <th scope="col">{d.common.committee}</th>
                      <th scope="col">{d.achievements.badgeGallery}</th>
                      <th scope="col" className="text-end">{d.common.points}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rest.map((entry) => (
                      <tr
                        key={entry.member.id}
                        className={entry.member.id === viewer.id ? 'bg-rose-50' : undefined}
                      >
                        <td>
                          <RankMark rank={entry.rank} locale={locale} />
                        </td>
                        <td>
                          <MemberLine
                            member={entry.member}
                            locale={locale}
                            href={`/portal/members/${entry.member.id}`}
                            size={32}
                            meta={entry.member.grade}
                          />
                        </td>
                        <td className="text-ink-muted">{committeeName(entry.committee, locale) || '—'}</td>
                        <td>
                          {entry.topBadge ? (
                            <Pill tone="soft" icon={<NavIcon name={entry.topBadge.icon} />}>
                              {pick(locale, entry.topBadge as unknown as Record<string, unknown>, 'name')}
                            </Pill>
                          ) : (
                            <span className="text-caption text-ink-faint">—</span>
                          )}
                        </td>
                        <td className="text-end font-brand text-plum tabular-nums">
                          {formatNumber(entry.points, locale)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableShell>

              <ul className="grid gap-2 md:hidden">
                {rest.map((entry) => (
                  <Card
                    as="li"
                    key={entry.member.id}
                    className={cn('flex items-center gap-3 p-3', entry.member.id === viewer.id && 'bg-rose-50')}
                  >
                    <RankMark rank={entry.rank} locale={locale} />
                    <MemberLine
                      member={entry.member}
                      locale={locale}
                      href={`/portal/members/${entry.member.id}`}
                      size={32}
                      meta={committeeName(entry.committee, locale) || entry.member.grade}
                    />
                    <span className="ms-auto shrink-0 font-brand text-small text-plum tabular-nums">
                      {formatNumber(entry.points, locale)}
                    </span>
                  </Card>
                ))}
              </ul>
            </>
          ) : null}
        </>
      )}
    </>
  );
}
