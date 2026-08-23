'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, Eye, EyeOff, LogIn } from 'lucide-react';
import Link from 'next/link';
import { login, type LoginState } from '@/app/actions/auth';
import { Field, InlineAlert, Input } from '@/components/ui';
import type { Dictionary } from '@/lib/i18n';

function SubmitButton({ d }: { d: Dictionary }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary btn-lg w-full" disabled={pending}>
      <LogIn className="h-[18px] w-[18px] rtl-flip" aria-hidden="true" strokeWidth={1.75} />
      {pending ? d.auth.signingIn : d.auth.signIn}
    </button>
  );
}

export function LoginForm({ d, next }: { d: Dictionary; next?: string }) {
  const [state, formAction] = useActionState<LoginState, FormData>(login, {});
  const [showPassword, setShowPassword] = useState(false);

  const errorMessage =
    state.error === 'inactive'
      ? d.auth.accountInactive
      : state.error
        ? d.auth.invalidCredentials
        : null;

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {errorMessage ? (
        <InlineAlert tone="danger" icon={<AlertCircle />}>
          {errorMessage}
        </InlineAlert>
      ) : null}

      <Field label={d.auth.username} htmlFor="username" required>
        <Input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          defaultValue={state.username}
          placeholder={d.auth.usernamePlaceholder}
          aria-invalid={state.error ? true : undefined}
          dir="ltr"
        />
      </Field>

      <Field label={d.auth.password} htmlFor="password" required>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            placeholder={d.auth.passwordPlaceholder}
            aria-invalid={state.error ? true : undefined}
            className="pe-12"
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? d.auth.hidePassword : d.auth.showPassword}
            aria-pressed={showPassword}
            className="absolute inset-y-0 end-0 grid w-12 place-items-center rounded-e-control text-mauve transition hover:text-plum"
          >
            {showPassword ? (
              <EyeOff className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.75} />
            ) : (
              <Eye className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.75} />
            )}
          </button>
        </div>
      </Field>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 text-small text-ink-muted">
          <input
            type="checkbox"
            name="remember"
            className="h-4 w-4 rounded-[4px] border-line-strong text-plum accent-[#48132F]"
          />
          {d.auth.rememberMe}
        </label>
        <Link
          href="/forgot-password"
          className="text-small font-semibold text-plum underline decoration-rose-gold/60 underline-offset-4 transition hover:text-plum-dark"
        >
          {d.auth.forgotPassword}
        </Link>
      </div>

      <SubmitButton d={d} />
    </form>
  );
}
