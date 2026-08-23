'use client';

import { useActionState } from 'react';
import { KeyRound } from 'lucide-react';
import { changePasswordAction, type ActionResult } from '@/app/actions/portal';
import { FormFeedback, SubmitButton } from '@/components/forms/FormShell';
import { Card, CardHeader, Field, Input } from '@/components/ui';
import type { Dictionary } from '@/lib/i18n';

export function ChangePasswordForm({ d }: { d: Dictionary }) {
  const [state, formAction] = useActionState<ActionResult, FormData>(changePasswordAction, {});

  return (
    <Card>
      <CardHeader title={d.settings.changePassword} />
      <form action={formAction} className="grid gap-5 p-6 pt-4">
        <FormFeedback
          state={state}
          d={d}
          successMessage={d.settings.passwordUpdated}
          messages={{
            mismatch: d.settings.passwordMismatch,
            weak_password: d.settings.passwordTooShort,
            wrong_current: d.auth.invalidCredentials,
          }}
        />

        <Field label={d.settings.currentPassword} htmlFor="currentPassword" required>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            dir="ltr"
          />
        </Field>
        <Field label={d.settings.newPassword} htmlFor="newPassword" required hint={d.settings.passwordTooShort}>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            dir="ltr"
          />
        </Field>
        <Field label={d.settings.confirmPassword} htmlFor="confirmPassword" required>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            dir="ltr"
          />
        </Field>

        <SubmitButton
          label={d.settings.changePassword}
          pendingLabel={d.common.saving}
          icon={<KeyRound className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.75} />}
        />
      </form>
    </Card>
  );
}
