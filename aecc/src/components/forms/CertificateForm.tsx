'use client';

import { useActionState } from 'react';
import { ScrollText } from 'lucide-react';
import { issueCertificateAction, type ActionResult } from '@/app/actions/portal';
import { FormFeedback, SubmitButton } from '@/components/forms/FormShell';
import { Card, CardHeader, Field, Input, Select } from '@/components/ui';
import { certificateKind } from '@/lib/domain/labels';
import type { Dictionary } from '@/lib/i18n';

const KINDS = ['participation', 'outstanding', 'ambassador', 'competition', 'research'];

export function CertificateForm({
  d,
  members,
  events,
}: {
  d: Dictionary;
  members: { id: string; name: string }[];
  events: { id: string; title: string }[];
}) {
  const [state, formAction] = useActionState<ActionResult, FormData>(issueCertificateAction, {});

  return (
    <Card>
      <CardHeader title={d.certificates.issue} />
      <form action={formAction} className="grid gap-5 p-6 pt-4">
        <FormFeedback state={state} d={d} />

        <Field label={d.certificates.recipient} htmlFor="certUserId" required>
          <Select id="certUserId" name="userId" required defaultValue="">
            <option value="" disabled>
              {d.points.selectMember}
            </option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={d.common.category} htmlFor="certKind" required>
          <Select id="certKind" name="kind" defaultValue="participation">
            {KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {certificateKind(kind, d)}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={`${d.common.title} (EN)`} htmlFor="certTitleEn" required>
          <Input id="certTitleEn" name="titleEn" required maxLength={160} dir="ltr" />
        </Field>
        <Field label={`${d.common.title} (AR)`} htmlFor="certTitleAr">
          <Input id="certTitleAr" name="titleAr" maxLength={160} dir="rtl" />
        </Field>

        <Field label={d.events.title} htmlFor="certEventId" hint={d.common.optional}>
          <Select id="certEventId" name="eventId" defaultValue="">
            <option value="">{d.common.none}</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </Select>
        </Field>

        <SubmitButton
          label={d.certificates.issue}
          pendingLabel={d.common.saving}
          icon={<ScrollText className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.75} />}
        />
      </form>
    </Card>
  );
}
