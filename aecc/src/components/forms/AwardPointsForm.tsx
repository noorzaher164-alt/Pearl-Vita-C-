'use client';

import { useActionState, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { awardPointsAction, type ActionResult } from '@/app/actions/portal';
import { FormFeedback, SubmitButton } from '@/components/forms/FormShell';
import { Card, CardHeader, Field, Input, Select } from '@/components/ui';
import type { Dictionary } from '@/lib/i18n';

export function AwardPointsForm({
  d,
  members,
  reasons,
  viewerId,
  defaultMemberId,
}: {
  d: Dictionary;
  members: { id: string; name: string; grade: string }[];
  reasons: { id: string; label: string; points: number }[];
  viewerId: string;
  defaultMemberId?: string;
}) {
  const [state, formAction] = useActionState<ActionResult, FormData>(awardPointsAction, {});
  const [points, setPoints] = useState(reasons[0]?.points ?? 5);

  return (
    <Card>
      <CardHeader title={d.points.awardPoints} />
      <form action={formAction} className="grid gap-5 p-6 pt-4">
        <FormFeedback
          state={state}
          d={d}
          successMessage={d.common.success}
          messages={{
            // A member may never award points to herself, whatever her role.
            self_award: d.auth.permissionDeniedBody,
            validation: d.validation.fixErrors,
          }}
        />

        <Field label={d.points.selectMember} htmlFor="userId" required>
          <Select id="userId" name="userId" required defaultValue={defaultMemberId ?? ''}>
            <option value="" disabled>
              {d.points.selectMember}
            </option>
            {members
              .filter((member) => member.id !== viewerId)
              .map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} — {member.grade}
                </option>
              ))}
          </Select>
        </Field>

        <Field label={d.points.reason} htmlFor="reasonId" required>
          <Select
            id="reasonId"
            name="reasonId"
            required
            defaultValue={reasons[0]?.id}
            onChange={(event) => {
              const reason = reasons.find((r) => r.id === event.target.value);
              if (reason) setPoints(reason.points);
            }}
          >
            {reasons.map((reason) => (
              <option key={reason.id} value={reason.id}>
                {reason.label} (+{reason.points})
              </option>
            ))}
          </Select>
        </Field>

        <Field label={d.points.pointsAmount} htmlFor="points" required>
          <Input
            id="points"
            name="points"
            type="number"
            required
            value={points}
            onChange={(event) => setPoints(Number(event.target.value))}
            min={-200}
            max={200}
          />
        </Field>

        <Field label={d.points.customReason} htmlFor="customReason" hint={d.common.optional}>
          <Input id="customReason" name="customReason" maxLength={200} />
        </Field>

        <SubmitButton
          label={d.points.awardPoints}
          pendingLabel={d.common.saving}
          icon={<Sparkles className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.75} />}
        />
      </form>
    </Card>
  );
}
