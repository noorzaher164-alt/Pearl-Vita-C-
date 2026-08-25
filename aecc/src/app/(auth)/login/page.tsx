import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { currentViewer } from '@/lib/auth/current-user';
import { getT } from '@/lib/i18n/server';
import { PREVIEW_ACCOUNTS } from '@/data/people';
import { roleLabel } from '@/lib/domain/labels';

export const metadata: Metadata = { title: 'Sign in' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const viewer = await currentViewer();
  if (viewer) redirect('/portal');

  const { d } = await getT();
  const params = await searchParams;

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="font-brand text-h1 text-plum">{d.auth.welcome}</h1>
        <p className="mt-2 text-small text-ink-muted">{d.auth.welcomeSub}</p>
      </div>

      <LoginForm d={d} next={params.next} />

      <p className="mt-4 text-center text-small text-ink-muted">
        {d.auth.noAccount}{' '}
        <Link
          href="/sign-up"
          className="font-semibold text-plum underline decoration-rose-gold/60 underline-offset-4 transition hover:text-plum-dark"
        >
          {d.auth.signUp}
        </Link>
      </p>

      {/* Preview credentials — present so the platform can be reviewed end to end.
          Remove this block before the club's accounts go live. */}
      <section className="mt-10 rounded-card border border-line bg-blush p-5">
        <h2 className="text-small font-semibold text-plum">{d.auth.demoTitle}</h2>
        <p className="mt-1 text-caption text-ink-muted">{d.auth.demoHint}</p>
        <ul className="mt-4 grid gap-2">
          {PREVIEW_ACCOUNTS.map((account) => (
            <li
              key={account.username}
              className="flex flex-wrap items-center justify-between gap-2 rounded-control bg-surface px-3 py-2"
            >
              <span className="text-caption font-semibold text-plum">
                {roleLabel(account.roleKey, d)}
              </span>
              <code className="font-mono text-caption text-ink-muted" dir="ltr">
                {account.username} · {account.password}
              </code>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
