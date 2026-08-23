import type { Metadata } from 'next';
import Link from 'next/link';
import { Brain, Plus } from 'lucide-react';
import { Card, EmptyState, LinkButton, Meta, PageHeader, Pill, Progress } from '@/components/ui';
import { requirePermission } from '@/lib/auth/current-user';
import { listChallenges } from '@/lib/db/queries';
import { challengeKind, challengeStatus } from '@/lib/domain/labels';
import { formatDate, formatNumber, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Challenges' };

export default async function ChallengesPage() {
  const viewer = await requirePermission('challenges:read', '/portal/challenges');
  const { locale, d } = await getT();
  const challenges = await listChallenges(viewer.id);

  const canManage = viewer.permissions.can('challenges:write');

  return (
    <>
      <PageHeader
        eyebrow={d.brand.fullName}
        title={d.challenges.title}
        subtitle={d.challenges.subtitle}
        actions={
          canManage ? (
            <LinkButton href="/portal/challenges/new">
              <Plus className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.75} />
              {d.challenges.createChallenge}
            </LinkButton>
          ) : null
        }
      />

      {challenges.length === 0 ? (
        <EmptyState icon={<Brain />} title={d.challenges.noChallenges} />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {challenges.map((challenge) => {
            const status = challengeStatus(challenge.live_status, d);
            const correctRate =
              challenge.participants > 0
                ? Math.round((challenge.correct / challenge.participants) * 100)
                : 0;

            return (
              <Card as="article" key={challenge.id} className="flex flex-col p-6">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Pill tone={status.tone}>{status.label}</Pill>
                  <Pill tone="soft">{challengeKind(challenge.kind, d)}</Pill>
                  <Pill tone="gold">
                    +{formatNumber(challenge.points, locale)} {d.common.points}
                  </Pill>
                </div>

                <h2 className="font-brand text-h3 text-plum">
                  <Link
                    href={`/portal/challenges/${challenge.id}`}
                    className="transition hover:text-plum-dark"
                  >
                    {pick(locale, challenge as unknown as Record<string, unknown>, 'title')}
                  </Link>
                </h2>
                <p className="mt-2 line-clamp-3 flex-1 text-small leading-relaxed text-ink-muted">
                  {pick(locale, challenge as unknown as Record<string, unknown>, 'question')}
                </p>

                <Meta
                  className="mt-4"
                  items={[
                    `${d.challenges.opensOn} ${formatDate(challenge.opens_at, locale)}`,
                    `${d.challenges.closesOn} ${formatDate(challenge.closes_at, locale)}`,
                  ]}
                />

                {canManage && challenge.participants > 0 ? (
                  <div className="mt-4 border-t border-line pt-4">
                    <Progress
                      value={correctRate}
                      label={`${d.challenges.correctRate} · ${formatNumber(challenge.participants, locale)} ${d.challenges.participants}`}
                      tone="gold"
                    />
                  </div>
                ) : null}

                <div className="mt-5">
                  {challenge.viewer_submission ? (
                    <Pill tone={challenge.viewer_submission.is_correct ? 'success' : 'warning'}>
                      {challenge.viewer_submission.is_correct
                        ? d.challenges.correct
                        : d.challenges.incorrect}
                    </Pill>
                  ) : challenge.live_status === 'open' ? (
                    <LinkButton
                      href={`/portal/challenges/${challenge.id}`}
                      variant="primary"
                      size="sm"
                    >
                      {d.challenges.submitAnswer}
                    </LinkButton>
                  ) : (
                    <LinkButton
                      href={`/portal/challenges/${challenge.id}`}
                      variant="outline"
                      size="sm"
                    >
                      {d.common.viewDetails}
                    </LinkButton>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
