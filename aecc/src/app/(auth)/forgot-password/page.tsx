import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Reset your password' };

export default async function ForgotPasswordPage() {
  const { d } = await getT();

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="font-brand text-h1 text-plum">{d.auth.forgotTitle}</h1>
        <p className="mt-2 text-small text-ink-muted text-pretty">{d.auth.forgotSub}</p>
      </div>
      <ForgotPasswordForm d={d} />
    </>
  );
}
