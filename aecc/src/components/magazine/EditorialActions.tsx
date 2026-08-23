'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  CircleSlash,
  Eye,
  Send,
  Star,
  StarOff,
  Undo2,
  UploadCloud,
} from 'lucide-react';
import { featureArticleAction, transitionArticleAction } from '@/app/actions/portal';
import { Card, CardHeader, Field, Textarea } from '@/components/ui';
import type { ArticleStatus } from '@/lib/domain/types';
import type { Dictionary } from '@/lib/i18n';

/**
 * The editorial control panel.
 *
 * Which transitions are offered depends on the viewer's capabilities, and the server
 * action re-checks the same capability before applying any of them — publishing in
 * particular is restricted to supervisors.
 */
export function EditorialActions({
  articleId,
  status,
  featured,
  isAuthor,
  canReview,
  canPublish,
  d,
}: {
  articleId: string;
  status: ArticleStatus;
  featured: boolean;
  isAuthor: boolean;
  canReview: boolean;
  canPublish: boolean;
  d: Dictionary;
}) {
  const [note, setNote] = useState('');

  const Action = ({
    next,
    label,
    icon,
    variant = 'outline',
    withNote = false,
    scheduled = false,
  }: {
    next: ArticleStatus;
    label: string;
    icon: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    withNote?: boolean;
    scheduled?: boolean;
  }) => (
    <form action={transitionArticleAction}>
      <input type="hidden" name="articleId" value={articleId} />
      <input type="hidden" name="next" value={next} />
      {withNote ? <input type="hidden" name="note" value={note} /> : null}
      {scheduled ? (
        <label className="mb-2 block">
          <span className="field-label">{d.magazine.schedulePublication}</span>
          <input type="datetime-local" name="scheduledFor" className="field-input" required />
        </label>
      ) : null}
      <button type="submit" className={`btn btn-${variant} btn-sm w-full`}>
        {icon}
        {label}
      </button>
    </form>
  );

  return (
    <Card>
      <CardHeader title={d.magazine.workflowTitle} />
      <div className="grid gap-3 p-6 pt-4">
        {isAuthor && (status === 'draft' || status === 'revision_requested') ? (
          <Action
            next="submitted"
            label={d.magazine.submitForReview}
            variant="primary"
            icon={<Send className="h-4 w-4 rtl-flip" aria-hidden="true" strokeWidth={1.75} />}
          />
        ) : null}

        {canReview ? (
          <>
            {status === 'submitted' ? (
              <Action
                next="under_review"
                label={d.magazine.startReview}
                variant="secondary"
                icon={<Eye className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />}
              />
            ) : null}

            {status === 'submitted' || status === 'under_review' ? (
              <>
                <Field label={d.magazine.reviewNotes} htmlFor="review-note" hint={d.magazine.reviewNotesHint}>
                  <Textarea
                    id="review-note"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    maxLength={1000}
                    className="min-h-[88px]"
                  />
                </Field>
                <Action
                  next="approved"
                  label={d.magazine.approveArticle}
                  variant="primary"
                  withNote
                  icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />}
                />
                <Action
                  next="revision_requested"
                  label={d.magazine.requestRevision}
                  withNote
                  icon={<Undo2 className="h-4 w-4 rtl-flip" aria-hidden="true" strokeWidth={1.75} />}
                />
              </>
            ) : null}
          </>
        ) : null}

        {canPublish ? (
          <>
            {status === 'approved' || status === 'scheduled' ? (
              <>
                <Action
                  next="published"
                  label={d.magazine.publishNow}
                  variant="primary"
                  icon={<UploadCloud className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />}
                />
                {status === 'approved' ? (
                  <Action
                    next="scheduled"
                    label={d.magazine.schedulePublication}
                    scheduled
                    icon={<Send className="h-4 w-4 rtl-flip" aria-hidden="true" strokeWidth={1.75} />}
                  />
                ) : null}
              </>
            ) : null}

            {status === 'published' ? (
              <>
                <form action={featureArticleAction}>
                  <input type="hidden" name="articleId" value={articleId} />
                  <input type="hidden" name="featured" value={featured ? 'false' : 'true'} />
                  <button type="submit" className="btn btn-secondary btn-sm w-full">
                    {featured ? (
                      <StarOff className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />
                    ) : (
                      <Star className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />
                    )}
                    {featured ? d.magazine.unfeature : d.magazine.feature}
                  </button>
                </form>
                <Action
                  next="unpublished"
                  label={d.magazine.unpublishArticle}
                  variant="danger"
                  icon={<CircleSlash className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />}
                />
              </>
            ) : null}

            {status === 'unpublished' ? (
              <Action
                next="published"
                label={d.magazine.publishNow}
                variant="primary"
                icon={<UploadCloud className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />}
              />
            ) : null}
          </>
        ) : null}

        {!canReview && !canPublish && !isAuthor ? (
          <p className="text-caption text-ink-muted">{d.auth.permissionDeniedBody}</p>
        ) : null}
      </div>
    </Card>
  );
}
