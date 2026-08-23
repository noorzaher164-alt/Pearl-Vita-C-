'use client';

import { useActionState } from 'react';
import { ClipboardPlus } from 'lucide-react';
import { createAttendanceSessionAction, type ActionResult } from '@/app/actions/portal';
import { FormFeedback, SubmitButton } from '@/components/forms/FormShell';
import { Card, CardHeader, Field, Input, Select } from '@/components/ui';
import type { Dictionary } from '@/lib/i18n';

export function AttendanceSessionForm({
  d,
  committees,
}: {
  d: Dictionary;
  committees: { id: string; name: string }[];
}) {
  const [state, formAction] = useActionState<ActionResult, FormData>(
    createAttendanceSessionAction,
    {},
  );

  return (
    <form action={formAction} className="grid max-w-2xl gap-6">
      <FormFeedback state={state} d={d} />

      <Card>
        <CardHeader title={d.attendance.newSession} subtitle={d.attendance.subtitle} />
        <div className="grid gap-5 p-6 pt-4">
          <Field label={`${d.common.title} (EN)`} htmlFor="titleEn" required>
            <Input id="titleEn" name="titleEn" required maxLength={160} dir="ltr" />
          </Field>
          <Field label={`${d.common.title} (AR)`} htmlFor="titleAr">
            <Input id="titleAr" name="titleAr" maxLength={160} dir="rtl" />
          </Field>
          <Field label={d.common.category} htmlFor="kind" required>
            <Select id="kind" name="kind" defaultValue="meeting">
              <option value="meeting">{d.attendance.kindMeeting}</option>
              <option value="workshop">{d.attendance.kindWorkshop}</option>
              <option value="event">{d.attendance.kindEvent}</option>
              <option value="competition">{d.attendance.kindCompetition}</option>
              <option value="committee">{d.attendance.kindCommittee}</option>
            </Select>
          </Field>
          <Field label={d.attendance.heldOn} htmlFor="heldAt" required>
            <Input id="heldAt" name="heldAt" type="datetime-local" required />
          </Field>
          <Field
            label={d.common.committee}
            htmlFor="committeeId"
            hint={d.attendance.kindCommittee}
          >
            <Select id="committeeId" name="committeeId" defaultValue="">
              <option value="">{d.common.all}</option>
              {committees.map((committee) => (
                <option key={committee.id} value={committee.id}>
                  {committee.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Card>

      <div>
        <SubmitButton
          label={d.common.create}
          pendingLabel={d.common.saving}
          icon={<ClipboardPlus className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.75} />}
        />
      </div>
    </form>
  );
}
