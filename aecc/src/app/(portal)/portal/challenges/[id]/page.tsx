import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Lightbulb, XCircle } from 'lucide-react';
import { ChallengeAnswerForm } from '@/components/forms/ChallengeAnswerForm';
import { Card, CardHeader, InlineAlert, MetricCard, PageHeader, Pill, Progress } from '@/components/ui';
import { requirePermission } from '@/lib/auth/current-user';
import { getChallenge } from '@/lib/db/queries';
import { challengeKind, challengeStatus } from '@/lib/domain/labels';
import { formatDateTime, formatNumber, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Challenge' };

export default async function ChallengePage({ params }: { params: Promise<{ id: string }> }) {
  const viewer = await requirePermission('challenges:read');
  const { locale, d } = await getT();
  const { id } = await params;

  const challenge = await getChallenge(id, viewer.id);
  if (!challenge) notFound();

  const status = challengeStatus(challenge.live_status, d);
  const canManage = viewer.permissions.can('challenges:write');
  const options = locale === 'ar' ? challenge.options_ar : challenge.options_en;
  const answered = challenge.viewer_submission;
  const closed = challenge.live_status === 'closed';
  const correctRate =
    challenge.participants > 0 ? Math.round((challenge.correct / challenge.participants) * 100) : 0;

  return (
    <>
      <Link
        href="/portal/challenges"
        className="mb-6 inline-flex items-center gap-2 text-small font-semibold text-plum transition hover:text-plum-dark"
      >
        <ArrowLeft className="h-4 w-4 rtl-flip" aria-hidden="true" strokeWidth={1.75} />
        {d.challenges.title}
      </Link>

      <PageHeader
        eyebrow={
          <span className="inline-flex flex-wrap items-center gap-2">
            <Pill tone={status.tone}>{status.label}</Pill>
            <Pill tone="soft">{challengeKind(challenge.kind, d)}</Pill>
            <Pill tone="gold">
              +{formatNumber(challenge.points, locale)} {d.common.points}
            </Pill>
          </span>
        }
        title={pick(locale, challenge as unknown as Record<string, unknown>, 'title')}
        subtitle={`${d.challenges.opensOn} ${formatDateTime(challenge.opens_at, locale)} · ${d.challenges.closesOn} ${formatDateTime(challenge.closes_at, locale)}`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid content-start gap-6 lg:col-span-2">
          <Card>
            <CardHeader title={d.challenges.question} />
            <div className="p-6 pt-4">
              <p className="max-w-prose text-[1.0625rem] leading-relaxed text-ink">
                {pick(locale, challenge as unknown as Record<string, unknown>, 'question')}
              </p>
              {challenge.image_url ? (
                <div className="mt-6 overflow-hidden rounded-control border border-line bg-blush">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={challenge.image_url}
                    alt={pick(locale, challenge as unknown as Record<string, unknown>, 'title')}
                    className="h-auto w-full"
                  />
                </div>
              ) : null}
            </div>
          </Card>

          <Card>
            <CardHeader title={d.challenges.yourAnswer} />
            <div className="p-6 pt-4">
              {answered ? (
                <InlineAlert
                  tone={answered.is_correct ? 'success' : 'warning'}
                  icon={answered.is_correct ? <CheckCircle2 /> : <XCircle />}
                  title={answered.is_correct ? d.challenges.correct : d.challenges.incorrect}
                >
                  {d.challenges.yourAnswer}: {answered.answer}
                </InlineAlert>
              ) : closed ? (
                <InlineAlert tone="info">{d.challenges.statusClosed}</InlineAlert>
              ) : challenge.live_status === 'scheduled' ? (
                <InlineAlert tone="info">
                  {d.challenges.opensOn} {formatDateTime(challenge.opens_at, locale)}
                </InlineAlert>
              ) : (
                <ChallengeAnswerForm
                  challengeId={challenge.id}
                  options={options}
                  kind={challenge.kind}
                  d={d}
                />
              )}
            </div>
          </Card>

          {/* The explanation is withheld until the member has answered or the window
              has closed, so the answer cannot simply be read off the page. */}
          {answered || closed || canManage ? (
            <Card className="border-rose-gold/40 bg-[#FBF2EC]">
              <CardHeader
                title={
                  <span className="inline-flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-[#8A5540]" aria-hidden="true" strokeWidth={1.75} />
                    {d.challenges.explanation}
                  </span>
                }
              />
              <div className="p-6 pt-4">
                <p className="mb-3 text-small font-semibold text-plum">
                  {d.challenges.correctAnswer}: {challenge.correct_answer}
                </p>
                <p className="max-w-prose leading-relaxed text-ink">
                  {pick(locale, challenge as unknown as Record<string, unknown>, 'explanation')}
                </p>
              </div>
            </Card>
          ) : null}
        </div>

        <div className="grid content-start gap-6">
          {canManage ? (
            <>
              <MetricCard
                label={d.challenges.participants}
                value={formatNumber(challenge.participants, locale)}
              />
              <MetricCard
                label={d.challenges.correctRate}
                value={`${formatNumber(correctRate, locale)}%`}
                tone="gold"
              />
              <Card className="p-6">
                <h2 className="mb-4 font-brand text-h3 text-plum">{d.challenges.statistics}</h2>
                <Progress value={correctRate} label={d.challenges.correct} tone="gold" />
                <Progress
                  value={100 - correctRate}
                  label={d.challenges.incorrect}
                  tone="mauve"
                  className="mt-4"
                />
              </Card>
            </>
          ) : (
            <Card className="p-6">
              <h2 className="font-brand text-h3 text-plum">{d.challenges.participation}</h2>
              <p className="mt-4 font-brand text-metric text-plum tabular-nums">
                {formatNumber(challenge.participants, locale)}
              </p>
              <p className="text-caption text-ink-muted">{d.challenges.participants}</p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
