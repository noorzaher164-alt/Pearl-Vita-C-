'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, Eye, EyeOff, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { signUp, type SignUpState } from '@/app/actions/auth';
import { Field, InlineAlert, Input, Select } from '@/components/ui';
import type { Dictionary } from '@/lib/i18n';

function SubmitButton({ d }: { d: Dictionary }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary btn-lg w-full" disabled={pending}>
      <UserPlus className="h-[18px] w-[18px] rtl-flip" aria-hidden="true" strokeWidth={1.75} />
      {pending ? d.auth.signingUp : d.auth.signUp}
    </button>
  );
}

export function SignUpForm({ d }: { d: Dictionary }) {
  const [state, formAction] = useActionState<SignUpState, FormData>(signUp, {});
  const [showPassword, setShowPassword] = useState(false);

  const errorMessage =
    state.error === 'username_taken'
      ? d.auth.usernameTaken
      : state.error === 'email_taken'
        ? d.auth.emailTaken
        : state.error === 'validation'
          ? d.auth.passwordsMismatch
          : null;

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      {errorMessage ? (
        <InlineAlert tone="danger" icon={<AlertCircle />}>
          {errorMessage}
        </InlineAlert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={d.auth.fullNameEn} htmlFor="fullNameEn" required>
          <Input
            id="fullNameEn"
            name="fullNameEn"
            type="text"
            autoComplete="name"
            required
            defaultValue={state.values?.fullNameEn}
            placeholder={d.auth.fullNameEnPlaceholder}
            dir="ltr"
          />
        </Field>

        <Field label={d.auth.fullNameAr} htmlFor="fullNameAr">
          <Input
            id="fullNameAr"
            name="fullNameAr"
            type="text"
            defaultValue={state.values?.fullNameAr}
            placeholder={d.auth.fullNameArPlaceholder}
            dir="rtl"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={d.auth.username} htmlFor="username" required>
          <Input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            defaultValue={state.values?.username}
            placeholder={d.auth.usernamePlaceholder}
            aria-invalid={state.error === 'username_taken' ? true : undefined}
            dir="ltr"
          />
        </Field>

        <Field label={d.auth.emailAddress} htmlFor="email" required>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={state.values?.email}
            placeholder={d.auth.emailPlaceholder}
            aria-invalid={state.error === 'email_taken' ? true : undefined}
            dir="ltr"
          />
        </Field>
      </div>

      <Field label={d.auth.gradeField} htmlFor="grade" required>
        <Select id="grade" name="grade" required defaultValue={state.values?.grade ?? ''}>
          <option value="" disabled>
            {d.auth.selectGrade}
          </option>
          <option value="Grade 10">{d.auth.grade10}</option>
          <option value="Grade 11">{d.auth.grade11}</option>
          <option value="Grade 12">{d.auth.grade12}</option>
        </Select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={d.auth.password} htmlFor="password" required>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              placeholder={d.auth.passwordPlaceholder}
              className="pe-12"
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
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

        <Field label={d.auth.confirmPassword} htmlFor="confirmPassword" required>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            placeholder={d.auth.confirmPasswordPlaceholder}
            dir="ltr"
          />
        </Field>
      </div>

      <SubmitButton d={d} />

      <p className="text-center text-small text-ink-muted">
        {d.auth.haveAccount}{' '}
        <Link
          href="/login"
          className="font-semibold text-plum underline decoration-rose-gold/60 underline-offset-4 transition hover:text-plum-dark"
        >
          {d.auth.signIn}
        </Link>
      </p>
    </form>
  );
}
