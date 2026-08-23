'use client';

import { useActionState } from 'react';
import { Save } from 'lucide-react';
import { updateMemberAction, type ActionResult } from '@/app/actions/portal';
import { FormFeedback, SubmitButton } from '@/components/forms/FormShell';
import { Card, CardHeader, Field, Input, Select, Textarea } from '@/components/ui';
import { roleLabel } from '@/lib/domain/labels';
import type { MemberView, RoleKey } from '@/lib/domain/types';
import type { Dictionary } from '@/lib/i18n';

const ROLES: RoleKey[] = ['member', 'committee_leader', 'vice_president', 'president', 'admin'];

export function MemberEditForm({
  d,
  member,
  committees,
  grades,
  canAssignRole,
  canEditNotes,
  adminNotes,
}: {
  d: Dictionary;
  member: MemberView;
  committees: { id: string; name: string }[];
  grades: string[];
  canAssignRole: boolean;
  canEditNotes: boolean;
  adminNotes: string | null;
}) {
  const [state, formAction] = useActionState<ActionResult, FormData>(updateMemberAction, {});

  return (
    <form action={formAction} className="grid max-w-2xl gap-6">
      <input type="hidden" name="userId" value={member.id} />
      <FormFeedback state={state} d={d} />

      <Card>
        <CardHeader title={d.members.editMember} subtitle={member.username} />
        <div className="grid gap-5 p-6 pt-4 md:grid-cols-2">
          <Field label={`${d.members.fullName} (EN)`} htmlFor="fullNameEn" required>
            <Input
              id="fullNameEn"
              name="fullNameEn"
              defaultValue={member.full_name_en}
              required
              maxLength={120}
              dir="ltr"
            />
          </Field>
          <Field label={d.members.fullNameAr} htmlFor="fullNameAr">
            <Input
              id="fullNameAr"
              name="fullNameAr"
              defaultValue={member.full_name_ar}
              maxLength={120}
              dir="rtl"
            />
          </Field>
          <Field label={d.members.email} htmlFor="email">
            <Input id="email" name="email" type="email" defaultValue={member.email} dir="ltr" />
          </Field>
          <Field label={d.common.grade} htmlFor="grade">
            <Select id="grade" name="grade" defaultValue={member.grade}>
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
              <option value="Chemistry Department">Chemistry Department</option>
            </Select>
          </Field>
          <Field label={d.common.committee} htmlFor="committeeId">
            <Select id="committeeId" name="committeeId" defaultValue={member.committee_id ?? ''}>
              <option value="">{d.committees.noCommittee}</option>
              {committees.map((committee) => (
                <option key={committee.id} value={committee.id}>
                  {committee.name}
                </option>
              ))}
            </Select>
          </Field>
          {canAssignRole ? (
            <Field label={d.common.role} htmlFor="role" hint={d.admin.dangerZone}>
              <Select id="role" name="role" defaultValue={member.role}>
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {roleLabel(role, d)}
                  </option>
                ))}
              </Select>
            </Field>
          ) : null}
          <Field label={`${d.members.bio} (EN)`} htmlFor="bioEn" className="md:col-span-2">
            <Textarea id="bioEn" name="bioEn" defaultValue={member.bio_en} maxLength={600} dir="ltr" />
          </Field>
          <Field label={`${d.members.bio} (AR)`} htmlFor="bioAr" className="md:col-span-2">
            <Textarea id="bioAr" name="bioAr" defaultValue={member.bio_ar} maxLength={600} dir="rtl" />
          </Field>
        </div>
      </Card>

      {canEditNotes ? (
        <Card className="border-plum-100 bg-plum-50/40">
          <CardHeader title={d.members.adminNotes} subtitle={d.members.adminNotesHint} />
          <div className="p-6 pt-4">
            <Field label={d.members.adminNotes} htmlFor="adminNotes">
              <Textarea id="adminNotes" name="adminNotes" defaultValue={adminNotes ?? ''} maxLength={1000} />
            </Field>
          </div>
        </Card>
      ) : null}

      <div>
        <SubmitButton
          label={d.common.saveChanges}
          pendingLabel={d.common.saving}
          icon={<Save className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.75} />}
        />
      </div>
    </form>
  );
}
