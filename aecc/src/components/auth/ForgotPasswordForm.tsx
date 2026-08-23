'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { ArrowLeft, CheckCircle2, Send } from 'lucide-react';
import Link from 'next/link';
import { requestPasswordReset, type ForgotState } from '@/app/actions/auth';
import { Field, InlineAlert, Input } from '@/components/ui';
import type { Dictionary } from '@/lib/i18n';

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary w-full" disabled={pending}>
      <Send className="h-[18px] w-[18px] rtl-flip" aria-hidden="true" strokeWidth={1.75} />
      {label}
    </button>
  );
}

export function ForgotPasswordForm({ d }: { d: Dictionary }) {
  const [state, formAction] = useActionState<ForgotState, FormData>(requestPasswordReset, {});

  if (state.sent) {
    return (
      <div className="grid gap-6">
        <InlineAlert tone="success" icon={<CheckCircle2 />}>
          {d.auth.forgotSent}
        </InlineAlert>
        <Link href="/login" className="btn btn-outline w-full">
          <ArrowLeft className="h-[18px] w-[18px] rtl-flip" aria-hidden="true" strokeWidth={1.75} />
          {d.auth.backToLogin}
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-5">
      <Field
        label={d.auth.username}
        htmlFor="username"
        required
        error={state.error ? d.validation.requiredField : undefined}
      >
        <Input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          placeholder={d.auth.usernamePlaceholder}
          dir="ltr"
        />
      </Field>

      <SubmitButton label={d.auth.forgotSubmit} />

      <Link
        href="/login"
        className="text-center text-small font-semibold text-plum underline decoration-rose-gold/60 underline-offset-4 transition hover:text-plum-dark"
      >
        {d.auth.backToLogin}
      </Link>
    </form>
  );
}
