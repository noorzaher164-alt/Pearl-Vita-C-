'use client';

import { useActionState, useState } from 'react';
import { Megaphone } from 'lucide-react';
import { createAnnouncementAction, type ActionResult } from '@/app/actions/portal';
import { FormFeedback, SubmitButton } from '@/components/forms/FormShell';
import { Card, CardHeader, Field, Input, Select, Textarea } from '@/components/ui';
import type { Dictionary } from '@/lib/i18n';

export function AnnouncementForm({
  d,
  committees,
}: {
  d: Dictionary;
  committees: { id: string; name: string }[];
}) {
  const [state, formAction] = useActionState<ActionResult, FormData>(createAnnouncementAction, {});
  const [audience, setAudience] = useState('everyone');

  return (
    <form action={formAction} className="grid max-w-3xl gap-6">
      <FormFeedback state={state} d={d} />

      <Card>
        <CardHeader title={d.announcements.create} subtitle={d.announcements.subtitle} />
        <div className="grid gap-5 p-6 pt-4 md:grid-cols-2">
          <Field label={`${d.common.title} (EN)`} htmlFor="titleEn" required>
            <Input id="titleEn" name="titleEn" required maxLength={160} dir="ltr" />
          </Field>
          <Field label={`${d.common.title} (AR)`} htmlFor="titleAr">
            <Input id="titleAr" name="titleAr" maxLength={160} dir="rtl" />
          </Field>
          <Field label={`${d.common.description} (EN)`} htmlFor="bodyEn" required className="md:col-span-2">
            <Textarea id="bodyEn" name="bodyEn" required maxLength={3000} dir="ltr" />
          </Field>
          <Field label={`${d.common.description} (AR)`} htmlFor="bodyAr" className="md:col-span-2">
            <Textarea id="bodyAr" name="bodyAr" maxLength={3000} dir="rtl" />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader title={d.announcements.audience} />
        <div className="grid gap-5 p-6 pt-4 md:grid-cols-2">
          <Field label={d.common.status} htmlFor="level" required>
            <Select id="level" name="level" defaultValue="normal">
              <option value="normal">{d.announcements.levelNormal}</option>
              <option value="important">{d.announcements.levelImportant}</option>
              <option value="urgent">{d.announcements.levelUrgent}</option>
            </Select>
          </Field>

          <Field label={d.announcements.audience} htmlFor="audienceKind" required>
            <Select
              id="audienceKind"
              name="audienceKind"
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
            >
              <option value="everyone">{d.announcements.audienceEveryone}</option>
              <option value="committee">{d.announcements.audienceCommittee}</option>
              <option value="leaders">{d.announcements.audienceLeaders}</option>
            </Select>
          </Field>

          {audience === 'committee' ? (
            <Field label={d.common.committee} htmlFor="audienceCommitteeId" required className="md:col-span-2">
              <Select id="audienceCommitteeId" name="audienceCommitteeId" required>
                {committees.map((committee) => (
                  <option key={committee.id} value={committee.id}>
                    {committee.name}
                  </option>
                ))}
              </Select>
            </Field>
          ) : null}

          <label className="inline-flex cursor-pointer items-center gap-2 text-small text-ink md:col-span-2">
            <input
              type="checkbox"
              name="pinned"
              className="h-4 w-4 rounded-[4px] border-line-strong accent-[#48132F]"
            />
            {d.announcements.pin}
          </label>
        </div>
      </Card>

      <div>
        <SubmitButton
          label={d.announcements.create}
          pendingLabel={d.common.saving}
          icon={<Megaphone className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.75} />}
        />
      </div>
    </form>
  );
}
