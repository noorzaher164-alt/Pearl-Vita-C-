import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AnnouncementForm } from '@/components/forms/AnnouncementForm';
import { committeeName } from '@/components/portal/Common';
import { PageHeader } from '@/components/ui';
import { requirePermission } from '@/lib/auth/current-user';
import { listCommittees } from '@/lib/db/queries';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Publish announcement' };

export default async function NewAnnouncementPage() {
  await requirePermission('announcements:write', '/portal/announcements/new');
  const { locale, d } = await getT();
  const committees = await listCommittees();

  return (
    <>
      <Link
        href="/portal/announcements"
        className="mb-6 inline-flex items-center gap-2 text-small font-semibold text-plum transition hover:text-plum-dark"
      >
        <ArrowLeft className="h-4 w-4 rtl-flip" aria-hidden="true" strokeWidth={1.75} />
        {d.announcements.title}
      </Link>
      <PageHeader eyebrow={d.brand.fullName} title={d.announcements.create} />
      <AnnouncementForm
        d={d}
        committees={committees.map((c) => ({ id: c.id, name: committeeName(c, locale) }))}
      />
    </>
  );
}
