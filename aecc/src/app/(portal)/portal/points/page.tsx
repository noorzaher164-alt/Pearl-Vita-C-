import type { Metadata } from 'next';
import { Sparkles } from 'lucide-react';
import { AwardPointsForm } from '@/components/forms/AwardPointsForm';
import { ReversePointsButton } from '@/components/forms/ReversePointsButton';
import { memberName } from '@/components/portal/Common';
import {
  Card,
  CardHeader,
  EmptyState,
  InlineAlert,
  MetricCard,
  PageHeader,
  Pill,
  TableShell,
} from '@/components/ui';
import { requirePermission } from '@/lib/auth/current-user';
import { listMembers, listPointReasons, listPointTransactions, totalClubPoints } from '@/lib/db/queries';
import { formatDate, formatNumber, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Points' };

export default async function PointsPage() {
  const viewer = await requirePermission(['points:read', 'points:award'], '/portal/points');
  const { locale, d } = await getT();

  const [transactions, reasons, members, total] = await Promise.all([
    listPointTransactions(undefined, 60),
    listPointReasons(),
    listMembers({ studentsOnly: true, status: 'active' }),
    totalClubPoints(),
  ]);

  const canAward = viewer.permissions.can('points:award');
  const awarded = transactions.filter((t) => t.points > 0).length;
  const corrections = transactions.filter((t) => t.reversal_of).length;

  return (
    <>
      <PageHeader eyebrow={d.brand.fullName} title={d.points.title} subtitle={d.points.subtitle} />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <MetricCard
          label={d.dashboard.clubPoints}
          value={formatNumber(total, locale)}
          icon={<Sparkles strokeWidth={1.75} />}
          tone="gold"
        />
        <MetricCard label={d.points.earned} value={formatNumber(awarded, locale)} tone="rose" />
        <MetricCard label={d.points.deducted} value={formatNumber(corrections, locale)} tone="mauve" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {canAward ? (
          <div className="grid content-start gap-6">
            <AwardPointsForm
              d={d}
              viewerId={viewer.id}
              members={members.map((m) => ({ id: m.id, name: memberName(m, locale), grade: m.grade }))}
              reasons={reasons.map((r) => ({
                id: r.id,
                label: pick(locale, r as unknown as Record<string, unknown>, 'label'),
                points: r.default_points,
              }))}
            />
            <InlineAlert tone="info">{d.points.appendOnlyNote}</InlineAlert>
          </div>
        ) : null}

        <div className={canAward ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <Card>
            <CardHeader title={d.points.ledger} subtitle={d.points.subtitle} />
            <div className="mt-4">
              {transactions.length === 0 ? (
                <div className="p-6">
                  <EmptyState icon={<Sparkles />} title={d.points.noTransactions} />
                </div>
              ) : (
                <TableShell className="rounded-none border-0 shadow-none">
                  <table className="aecc-table">
                    <caption className="sr-only">{d.points.ledger}</caption>
                    <thead>
                      <tr>
                        <th scope="col">{d.common.member}</th>
                        <th scope="col" className="text-end">{d.common.points}</th>
                        <th scope="col">{d.points.reason}</th>
                        <th scope="col">{d.points.awardedBy}</th>
                        <th scope="col">{d.common.date}</th>
                        {canAward ? <th scope="col" className="text-end">{d.common.actions}</th> : null}
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id}>
                          <td className="font-semibold text-plum">{memberName(tx.member, locale)}</td>
                          <td
                            className={`text-end font-brand tabular-nums ${tx.points >= 0 ? 'text-plum' : 'text-danger'}`}
                          >
                            {tx.points >= 0 ? '+' : ''}
                            {formatNumber(tx.points, locale)}
                          </td>
                          <td className="text-ink-muted">
                            {pick(locale, tx as unknown as Record<string, unknown>, 'reason_text')}
                            {tx.reversal_of ? (
                              <span className="ms-2 inline-block">
                                <Pill tone="warning">{d.points.reversalOf}</Pill>
                              </span>
                            ) : null}
                          </td>
                          <td className="text-ink-muted">{memberName(tx.awarded_by_member, locale)}</td>
                          <td className="whitespace-nowrap text-ink-muted">
                            {formatDate(tx.created_at, locale)}
                          </td>
                          {canAward ? (
                            <td className="text-end">
                              {!tx.reversal_of && tx.points > 0 ? (
                                <ReversePointsButton transactionId={tx.id} label={d.points.reverse} />
                              ) : null}
                            </td>
                          ) : null}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableShell>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
