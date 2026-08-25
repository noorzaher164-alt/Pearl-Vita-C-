import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { currentViewer } from '@/lib/auth/current-user';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Sign up' };

export default async function SignUpPage() {
  const viewer = await currentViewer();
  if (viewer) redirect('/portal');

  const { d } = await getT();

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="font-brand text-h1 text-plum">{d.auth.signUpTitle}</h1>
        <p className="mt-2 text-small text-ink-muted">{d.auth.signUpSub}</p>
      </div>

      <SignUpForm d={d} />
    </>
  );
}
