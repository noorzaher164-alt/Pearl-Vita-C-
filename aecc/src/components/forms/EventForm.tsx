'use client';

import { useActionState } from 'react';
import { CalendarPlus } from 'lucide-react';
import { createEventAction, type ActionResult } from '@/app/actions/portal';
import { FormFeedback, SubmitButton } from '@/components/forms/FormShell';
import { Card, CardHeader, Field, Input, Select, Textarea } from '@/components/ui';
import type { Dictionary } from '@/lib/i18n';

export function EventForm({
  d,
  committees,
}: {
  d: Dictionary;
  committees: { id: string; name: string }[];
}) {
  const [state, formAction] = useActionState<ActionResult, FormData>(createEventAction, {});

  return (
    <form action={formAction} className="grid gap-6">
      <FormFeedback state={state} d={d} />

      <Card>
        <CardHeader title={d.events.createEvent} subtitle={d.events.subtitle} />
        <div className="grid gap-5 p-6 pt-4 md:grid-cols-2">
          <Field label={`${d.common.title} (EN)`} htmlFor="titleEn" required>
            <Input id="titleEn" name="titleEn" required maxLength={160} dir="ltr" />
          </Field>
          <Field label={`${d.common.title} (AR)`} htmlFor="titleAr">
            <Input id="titleAr" name="titleAr" maxLength={160} dir="rtl" />
          </Field>

          <Field label={`${d.common.description} (EN)`} htmlFor="descriptionEn" required className="md:col-span-2">
            <Textarea id="descriptionEn" name="descriptionEn" required maxLength={4000} dir="ltr" />
          </Field>
          <Field label={`${d.common.description} (AR)`} htmlFor="descriptionAr" className="md:col-span-2">
            <Textarea id="descriptionAr" name="descriptionAr" maxLength={4000} dir="rtl" />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader title={`${d.common.date} · ${d.common.location}`} />
        <div className="grid gap-5 p-6 pt-4 md:grid-cols-2">
          <Field label={`${d.common.date} — ${d.common.open}`} htmlFor="startsAt" required>
            <Input id="startsAt" name="startsAt" type="datetime-local" required />
          </Field>
          <Field label={`${d.common.date} — ${d.common.closed}`} htmlFor="endsAt" required>
            <Input id="endsAt" name="endsAt" type="datetime-local" required />
          </Field>
          <Field label={`${d.common.location} (EN)`} htmlFor="locationEn">
            <Input id="locationEn" name="locationEn" maxLength={160} dir="ltr" />
          </Field>
          <Field label={`${d.common.location} (AR)`} htmlFor="locationAr">
            <Input id="locationAr" name="locationAr" maxLength={160} dir="rtl" />
          </Field>
          <Field label={d.events.responsibleCommittee} htmlFor="committeeId">
            <Select id="committeeId" name="committeeId" defaultValue="">
              <option value="">{d.common.none}</option>
              {committees.map((committee) => (
                <option key={committee.id} value={committee.id}>
                  {committee.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={d.events.registrationDeadline} htmlFor="registrationDeadline">
            <Input id="registrationDeadline" name="registrationDeadline" type="datetime-local" />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader title={`${d.common.capacity} · ${d.events.safetyNote}`} />
        <div className="grid gap-5 p-6 pt-4 md:grid-cols-2">
          <Field label={d.common.capacity} htmlFor="capacity" required>
            <Input id="capacity" name="capacity" type="number" min={1} max={1000} defaultValue={20} required />
          </Field>
          <Field label={d.events.pointsAwarded} htmlFor="pointsReward">
            <Input id="pointsReward" name="pointsReward" type="number" min={0} max={200} defaultValue={10} />
          </Field>
          <Field label={d.events.requiredMaterials} htmlFor="materialsEn" className="md:col-span-2">
            <Textarea id="materialsEn" name="materialsEn" maxLength={1000} />
          </Field>
          <Field
            label={d.events.safetyNote}
            htmlFor="safetyNoteEn"
            hint={d.attendance.correctionNote}
            className="md:col-span-2"
          >
            <Textarea id="safetyNoteEn" name="safetyNoteEn" maxLength={1000} />
          </Field>
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <SubmitButton
          label={d.events.createEvent}
          pendingLabel={d.common.saving}
          icon={<CalendarPlus className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.75} />}
        />
      </div>
    </form>
  );
}
