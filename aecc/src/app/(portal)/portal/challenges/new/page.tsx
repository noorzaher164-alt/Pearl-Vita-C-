import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ChallengeForm } from '@/components/forms/ChallengeForm';
import { PageHeader } from '@/components/ui';
import { requirePermission } from '@/lib/auth/current-user';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Create challenge' };

export default async function NewChallengePage() {
  await requirePermission('challenges:write', '/portal/challenges/new');
  const { d } = await getT();

  return (
    <>
      <Link
        href="/portal/challenges"
        className="mb-6 inline-flex items-center gap-2 text-small font-semibold text-plum transition hover:text-plum-dark"
      >
        <ArrowLeft className="h-4 w-4 rtl-flip" aria-hidden="true" strokeWidth={1.75} />
        {d.challenges.title}
      </Link>
      <PageHeader eyebrow={d.brand.fullName} title={d.challenges.createChallenge} />
      <ChallengeForm d={d} />
    </>
  );
}
