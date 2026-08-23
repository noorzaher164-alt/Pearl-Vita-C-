'use client';

import { useActionState, useState } from 'react';
import { Brain } from 'lucide-react';
import { createChallengeAction, type ActionResult } from '@/app/actions/portal';
import { FormFeedback, SubmitButton } from '@/components/forms/FormShell';
import { Card, CardHeader, Field, Input, Select, Textarea } from '@/components/ui';
import type { Dictionary } from '@/lib/i18n';

export function ChallengeForm({ d }: { d: Dictionary }) {
  const [state, formAction] = useActionState<ActionResult, FormData>(createChallengeAction, {});
  const [kind, setKind] = useState('multiple_choice');

  return (
    <form action={formAction} className="grid max-w-3xl gap-6">
      <FormFeedback state={state} d={d} />

      <Card>
        <CardHeader title={d.challenges.createChallenge} subtitle={d.challenges.subtitle} />
        <div className="grid gap-5 p-6 pt-4 md:grid-cols-2">
          <Field label={`${d.common.title} (EN)`} htmlFor="titleEn" required>
            <Input id="titleEn" name="titleEn" required maxLength={160} dir="ltr" />
          </Field>
          <Field label={`${d.common.title} (AR)`} htmlFor="titleAr">
            <Input id="titleAr" name="titleAr" maxLength={160} dir="rtl" />
          </Field>

          <Field label={d.common.category} htmlFor="kind" required>
            <Select id="kind" name="kind" value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="multiple_choice">{d.challenges.typeMultipleChoice}</option>
              <option value="short_answer">{d.challenges.typeShortAnswer}</option>
              <option value="image">{d.challenges.typeImage}</option>
              <option value="mystery">{d.challenges.typeMystery}</option>
            </Select>
          </Field>
          <Field label={d.common.points} htmlFor="points" required>
            <Input id="points" name="points" type="number" min={1} max={100} defaultValue={10} required />
          </Field>

          <Field label={`${d.challenges.question} (EN)`} htmlFor="questionEn" required className="md:col-span-2">
            <Textarea id="questionEn" name="questionEn" required maxLength={2000} dir="ltr" />
          </Field>
          <Field label={`${d.challenges.question} (AR)`} htmlFor="questionAr" className="md:col-span-2">
            <Textarea id="questionAr" name="questionAr" maxLength={2000} dir="rtl" />
          </Field>

          {kind === 'multiple_choice' ? (
            <>
              <Field
                label={`${d.challenges.options} (EN)`}
                htmlFor="optionsEn"
                hint="One option per line"
                className="md:col-span-2"
              >
                <Textarea id="optionsEn" name="optionsEn" dir="ltr" />
              </Field>
              <Field label={`${d.challenges.options} (AR)`} htmlFor="optionsAr" className="md:col-span-2">
                <Textarea id="optionsAr" name="optionsAr" dir="rtl" />
              </Field>
            </>
          ) : null}

          <Field label={d.challenges.correctAnswer} htmlFor="correctAnswer" required className="md:col-span-2">
            <Input id="correctAnswer" name="correctAnswer" required maxLength={200} />
          </Field>
          <Field label={`${d.challenges.explanation} (EN)`} htmlFor="explanationEn" className="md:col-span-2">
            <Textarea id="explanationEn" name="explanationEn" maxLength={2000} dir="ltr" />
          </Field>
          <Field label={`${d.challenges.explanation} (AR)`} htmlFor="explanationAr" className="md:col-span-2">
            <Textarea id="explanationAr" name="explanationAr" maxLength={2000} dir="rtl" />
          </Field>

          <Field label={d.challenges.opensOn} htmlFor="opensAt" required>
            <Input id="opensAt" name="opensAt" type="datetime-local" required />
          </Field>
          <Field label={d.challenges.closesOn} htmlFor="closesAt" required>
            <Input id="closesAt" name="closesAt" type="datetime-local" required />
          </Field>
        </div>
      </Card>

      <div>
        <SubmitButton
          label={d.challenges.createChallenge}
          pendingLabel={d.common.saving}
          icon={<Brain className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.75} />}
        />
      </div>
    </form>
  );
}
