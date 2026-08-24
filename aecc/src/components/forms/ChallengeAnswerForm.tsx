'use client';

import { useActionState } from 'react';
import { CheckCircle2, Send, XCircle } from 'lucide-react';
import { submitChallengeAction, type ActionResult } from '@/app/actions/portal';
import { SubmitButton } from '@/components/forms/FormShell';
import { Field, InlineAlert, Input } from '@/components/ui';
import type { Dictionary } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function ChallengeAnswerForm({
  challengeId,
  options,
  kind,
  d,
}: {
  challengeId: string;
  options: string[];
  kind: string;
  d: Dictionary;
}) {
  const [state, formAction] = useActionState<ActionResult, FormData>(submitChallengeAction, {});

  if (state.ok) {
    const correct = state.message === 'correct';
    return (
      <InlineAlert
        tone={correct ? 'success' : 'warning'}
        icon={correct ? <CheckCircle2 /> : <XCircle />}
        title={correct ? d.challenges.correct : d.challenges.incorrect}
      >
        {d.challenges.answerRecorded}
      </InlineAlert>
    );
  }

  return (
    <form action={formAction} className="grid gap-5">
      <input type="hidden" name="challengeId" value={challengeId} />

      {state.error === 'already_answered' ? (
        <InlineAlert tone="info">{d.challenges.alreadyAnswered}</InlineAlert>
      ) : state.error ? (
        <InlineAlert tone="danger">{d.validation.fixErrors}</InlineAlert>
      ) : null}

      {kind === 'multiple_choice' && options.length > 0 ? (
        <fieldset>
          <legend className="field-label">{d.challenges.options}</legend>
          <div className="grid gap-2">
            {options.map((option, index) => (
              <span key={option} className="relative block">
                <input
                  type="radio"
                  id={`answer-${index}`}
                  name="answer"
                  value={option}
                  required
                  className="peer sr-only"
                />
                <label
                  htmlFor={`answer-${index}`}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-control border border-line bg-surface px-4 py-3 text-small text-ink transition',
                    'hover:border-rose peer-checked:border-plum peer-checked:bg-plum-50 peer-checked:font-semibold peer-checked:text-plum',
                    'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-rose',
                  )}
                >
                  <span
                    className="grid h-5 w-5 shrink-0 place-items-center rounded-pill border border-line-strong"
                    aria-hidden="true"
                  >
                    <span className="h-2 w-2 rounded-pill bg-transparent peer-checked:bg-plum" />
                  </span>
                  {option}
                </label>
              </span>
            ))}
          </div>
        </fieldset>
      ) : (
        <Field label={d.challenges.yourAnswer} htmlFor="answer" required>
          <Input id="answer" name="answer" required maxLength={200} autoComplete="off" />
        </Field>
      )}

      <div>
        <SubmitButton
          label={d.challenges.submitAnswer}
          pendingLabel={d.common.saving}
          icon={<Send className="h-[18px] w-[18px] rtl-flip" aria-hidden="true" strokeWidth={1.75} />}
        />
      </div>
    </form>
  );
}
