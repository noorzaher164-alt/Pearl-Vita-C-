'use client';

import { useActionState } from 'react';
import { UserPlus } from 'lucide-react';
import { createUserAction, type ActionResult } from '@/app/actions/portal';
import { FormFeedback, SubmitButton } from '@/components/forms/FormShell';
import { Card, CardHeader, Field, InlineAlert, Input, Select } from '@/components/ui';
import { roleLabel } from '@/lib/domain/labels';
import type { RoleKey } from '@/lib/domain/types';
import type { Dictionary } from '@/lib/i18n';

const ROLES: RoleKey[] = ['member', 'committee_leader', 'vice_president', 'president', 'admin'];

export function CreateUserForm({
  d,
  committees,
  grades,
}: {
  d: Dictionary;
  committees: { id: string; name: string }[];
  grades: string[];
}) {
  const [state, formAction] = useActionState<ActionResult, FormData>(createUserAction, {});

  return (
    <form action={formAction} className="grid max-w-2xl gap-6">
      <FormFeedback
        state={state}
        d={d}
        successMessage={d.common.success}
        messages={{
          username_taken: d.validation.usernameTaken,
          weak_password: d.settings.passwordTooShort,
          validation: d.validation.fixErrors,
        }}
      />

      {state.ok && state.message ? (
        <InlineAlert tone="warning" title={d.admin.temporaryPassword}>
          <span className="font-mono" dir="ltr">
            {state.message}
          </span>
          <span className="mt-1 block">{d.admin.mustChangePassword}</span>
        </InlineAlert>
      ) : null}

      <Card>
        <CardHeader title={d.admin.createUser} subtitle={d.admin.usersSubtitle} />
        <div className="grid gap-5 p-6 pt-4 md:grid-cols-2">
          <Field label={`${d.members.fullName} (EN)`} htmlFor="fullNameEn" required>
            <Input id="fullNameEn" name="fullNameEn" required maxLength={120} dir="ltr" />
          </Field>
          <Field label={d.members.fullNameAr} htmlFor="fullNameAr">
            <Input id="fullNameAr" name="fullNameAr" maxLength={120} dir="rtl" />
          </Field>
          <Field label={d.members.username} htmlFor="username" required hint="lowercase, no spaces">
            <Input id="username" name="username" required maxLength={64} dir="ltr" pattern="[a-z0-9._-]+" />
          </Field>
          <Field label={d.members.email} htmlFor="email">
            <Input id="email" name="email" type="email" maxLength={160} dir="ltr" />
          </Field>
          <Field label={d.common.grade} htmlFor="grade" required>
            <Select id="grade" name="grade" defaultValue={grades[0]}>
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
              <option value="Chemistry Department">Chemistry Department</option>
            </Select>
          </Field>
          <Field label={d.common.role} htmlFor="role" required>
            <Select id="role" name="role" defaultValue="member">
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {roleLabel(role, d)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={d.common.committee} htmlFor="committeeId" className="md:col-span-2">
            <Select id="committeeId" name="committeeId" defaultValue="">
              <option value="">{d.common.none}</option>
              {committees.map((committee) => (
                <option key={committee.id} value={committee.id}>
                  {committee.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label={d.admin.temporaryPassword}
            htmlFor="password"
            hint={`${d.common.optional} — ${d.admin.mustChangePassword}`}
            className="md:col-span-2"
          >
            <Input id="password" name="password" type="text" minLength={8} maxLength={64} dir="ltr" />
          </Field>
        </div>
      </Card>

      <div>
        <SubmitButton
          label={d.admin.createUser}
          pendingLabel={d.common.saving}
          icon={<UserPlus className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.75} />}
        />
      </div>
    </form>
  );
}
