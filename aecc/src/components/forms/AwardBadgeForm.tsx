'use client';

import { Medal } from 'lucide-react';
import { awardBadgeAction } from '@/app/actions/portal';
import { SubmitButton } from '@/components/forms/FormShell';
import { Card, CardHeader, Field, Input, Select } from '@/components/ui';
import type { Dictionary } from '@/lib/i18n';

export function AwardBadgeForm({
  d,
  members,
  badges,
}: {
  d: Dictionary;
  members: { id: string; name: string }[];
  badges: { id: string; name: string }[];
}) {
  return (
    <Card>
      <CardHeader title={d.achievements.awardBadge} />
      <form action={awardBadgeAction} className="grid gap-5 p-6 pt-4">
        <Field label={d.points.selectMember} htmlFor="badgeUserId" required>
          <Select id="badgeUserId" name="userId" required defaultValue="">
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

        <Field label={d.achievements.badgeGallery} htmlFor="badgeId" required>
          <Select id="badgeId" name="badgeId" required defaultValue={badges[0]?.id}>
            {badges.map((badge) => (
              <option key={badge.id} value={badge.id}>
                {badge.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={d.common.notes} htmlFor="badgeNote" hint={d.common.optional}>
          <Input id="badgeNote" name="note" maxLength={200} />
        </Field>

        <SubmitButton
          label={d.achievements.awardBadge}
          pendingLabel={d.common.saving}
          icon={<Medal className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.75} />}
        />
      </form>
    </Card>
  );
}
