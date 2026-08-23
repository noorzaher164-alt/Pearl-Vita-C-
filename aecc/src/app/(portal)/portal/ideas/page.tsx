import type { Metadata } from 'next';
import { Heart, Lightbulb } from 'lucide-react';
import { IdeaForm } from '@/components/forms/IdeaForm';
import { IdeaModeration, IdeaVoteButton } from '@/components/forms/IdeaControls';
import { memberName } from '@/components/portal/Common';
import { Card, EmptyState, LinkTabs, Meta, PageHeader, Pill } from '@/components/ui';
import { requirePermission } from '@/lib/auth/current-user';
import { getSettings, listIdeas } from '@/lib/db/queries';
import { ideaStatus } from '@/lib/domain/labels';
import { formatDate, formatNumber } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Ideas Box' };

export default async function IdeasPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>;
}) {
  const viewer = await requirePermission('ideas:read', '/portal/ideas');
  const { locale, d } = await getT();
  const params = await searchParams;
  const scope = params.scope === 'mine' ? 'mine' : 'all';

  const [ideas, settings] = await Promise.all([listIdeas(viewer.id), getSettings()]);
  const votingEnabled = settings.idea_voting_enabled === 'true';
  const canModerate = viewer.permissions.can('ideas:moderate');
  const shown = scope === 'mine' ? ideas.filter((idea) => idea.user_id === viewer.id) : ideas;

  return (
    <>
      <PageHeader eyebrow={d.brand.fullName} title={d.ideas.title} subtitle={d.ideas.subtitle} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid content-start gap-6">
          {viewer.permissions.can('ideas:submit') ? <IdeaForm d={d} /> : null}
          {!votingEnabled ? (
            <p className="rounded-control border border-line bg-blush px-4 py-3 text-caption text-ink-muted">
              {d.ideas.votingDisabled}
            </p>
          ) : null}
        </div>

        <div className="lg:col-span-2">
          <LinkTabs
            className="mb-5"
            activeKey={scope}
            items={[
              { key: 'all', label: d.ideas.allIdeas, href: '/portal/ideas', count: ideas.length },
              {
                key: 'mine',
                label: d.ideas.myIdeas,
                href: '/portal/ideas?scope=mine',
                count: ideas.filter((i) => i.user_id === viewer.id).length,
              },
            ]}
          />

          {shown.length === 0 ? (
            <EmptyState icon={<Lightbulb />} title={d.ideas.noIdeas} />
          ) : (
            <ul className="grid gap-4">
              {shown.map((idea) => {
                const status = ideaStatus(idea.status, d);
                return (
                  <Card as="li" key={idea.id} className="p-6">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <Pill tone={status.tone}>{status.label}</Pill>
                      <Pill tone="soft">{idea.category}</Pill>
                    </div>

                    <h2 className="font-brand text-h3 text-plum">{idea.title}</h2>
                    <p className="mt-2 leading-relaxed text-small text-ink-muted">{idea.description}</p>

                    <Meta
                      className="mt-4"
                      items={[
                        `${d.ideas.submittedBy} ${memberName(idea.author, locale)}`,
                        formatDate(idea.created_at, locale),
                      ]}
                    />

                    {idea.admin_feedback ? (
                      <div className="mt-4 rounded-control border border-line bg-blush px-4 py-3">
                        <p className="text-caption font-semibold text-plum">{d.ideas.adminFeedback}</p>
                        <p className="mt-1 text-small text-ink-muted">{idea.admin_feedback}</p>
                      </div>
                    ) : null}

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                      <span className="flex items-center gap-2 text-caption text-ink-muted">
                        <Heart className="h-3.5 w-3.5 text-rose" aria-hidden="true" strokeWidth={1.75} />
                        {formatNumber(idea.votes, locale)} {d.ideas.votes}
                      </span>
                      {votingEnabled ? (
                        <IdeaVoteButton
                          ideaId={idea.id}
                          voted={idea.viewer_voted}
                          labelVote={d.ideas.vote}
                          labelVoted={d.ideas.voted}
                        />
                      ) : null}
                    </div>

                    {canModerate ? <IdeaModeration ideaId={idea.id} current={idea.status} d={d} /> : null}
                  </Card>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
