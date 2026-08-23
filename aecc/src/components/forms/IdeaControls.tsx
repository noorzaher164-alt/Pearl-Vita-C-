'use client';

import { Heart } from 'lucide-react';
import { setIdeaStatusAction, voteIdeaAction } from '@/app/actions/portal';
import { Select } from '@/components/ui';
import type { IdeaStatus } from '@/lib/domain/types';
import type { Dictionary } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function IdeaVoteButton({
  ideaId,
  voted,
  labelVote,
  labelVoted,
}: {
  ideaId: string;
  voted: boolean;
  labelVote: string;
  labelVoted: string;
}) {
  return (
    <form action={voteIdeaAction}>
      <input type="hidden" name="ideaId" value={ideaId} />
      <button
        type="submit"
        aria-pressed={voted}
        className={cn('btn btn-sm', voted ? 'btn-secondary' : 'btn-outline')}
      >
        <Heart
          className="h-4 w-4"
          aria-hidden="true"
          strokeWidth={1.75}
          fill={voted ? 'currentColor' : 'none'}
        />
        {voted ? labelVoted : labelVote}
      </button>
    </form>
  );
}

const STATUSES: IdeaStatus[] = [
  'new',
  'under_review',
  'approved',
  'selected',
  'planned',
  'implemented',
  'not_selected',
];

export function IdeaModeration({
  ideaId,
  current,
  d,
}: {
  ideaId: string;
  current: IdeaStatus;
  d: Dictionary;
}) {
  const label: Record<IdeaStatus, string> = {
    new: d.ideas.statusNew,
    under_review: d.ideas.statusUnderReview,
    approved: d.ideas.statusApproved,
    selected: d.ideas.statusSelected,
    planned: d.ideas.statusPlanned,
    implemented: d.ideas.statusImplemented,
    not_selected: d.ideas.statusNotSelected,
  };

  return (
    <form action={setIdeaStatusAction} className="mt-4 grid gap-3 rounded-control bg-blush p-4 sm:grid-cols-[1fr_1fr_auto]">
      <input type="hidden" name="ideaId" value={ideaId} />
      <label className="sr-only" htmlFor={`status-${ideaId}`}>
        {d.common.status}
      </label>
      <Select id={`status-${ideaId}`} name="status" defaultValue={current}>
        {STATUSES.map((status) => (
          <option key={status} value={status}>
            {label[status]}
          </option>
        ))}
      </Select>
      <label className="sr-only" htmlFor={`feedback-${ideaId}`}>
        {d.ideas.adminFeedback}
      </label>
      <input
        id={`feedback-${ideaId}`}
        name="feedback"
        className="field-input"
        placeholder={d.ideas.adminFeedback}
        maxLength={500}
      />
      <button type="submit" className="btn btn-primary">
        {d.common.save}
      </button>
    </form>
  );
}
