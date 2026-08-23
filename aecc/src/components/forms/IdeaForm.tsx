'use client';

import { useActionState } from 'react';
import { Lightbulb } from 'lucide-react';
import { submitIdeaAction, type ActionResult } from '@/app/actions/portal';
import { FormFeedback, SubmitButton } from '@/components/forms/FormShell';
import { Card, CardHeader, Field, Input, Select, Textarea } from '@/components/ui';
import type { Dictionary } from '@/lib/i18n';

const CATEGORIES = ['Experiments', 'Research', 'Education', 'Media', 'Events', 'Sustainability', 'Outreach', 'Operations'];

export function IdeaForm({ d }: { d: Dictionary }) {
  const [state, formAction] = useActionState<ActionResult, FormData>(submitIdeaAction, {});

  return (
    <Card>
      <CardHeader title={d.ideas.submitIdea} />
      <form action={formAction} className="grid gap-5 p-6 pt-4">
        <FormFeedback state={state} d={d} />
        <Field label={d.ideas.ideaTitle} htmlFor="title" required>
          <Input id="title" name="title" required maxLength={140} />
        </Field>
        <Field label={d.common.description} htmlFor="description" required>
          <Textarea id="description" name="description" required maxLength={2000} />
        </Field>
        <Field label={d.ideas.suggestedCategory} htmlFor="category" required>
          <Select id="category" name="category" defaultValue="Experiments">
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </Field>
        <SubmitButton
          label={d.common.submit}
          pendingLabel={d.common.saving}
          icon={<Lightbulb className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.75} />}
        />
      </form>
    </Card>
  );
}
