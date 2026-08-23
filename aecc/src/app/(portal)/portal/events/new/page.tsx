import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { EventForm } from '@/components/forms/EventForm';
import { committeeName } from '@/components/portal/Common';
import { PageHeader } from '@/components/ui';
import { requirePermission } from '@/lib/auth/current-user';
import { listCommittees } from '@/lib/db/queries';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Create event' };

export default async function NewEventPage() {
  await requirePermission('events:write', '/portal/events/new');
  const { locale, d } = await getT();
  const committees = await listCommittees();

  return (
    <>
      <Link
        href="/portal/events"
        className="mb-6 inline-flex items-center gap-2 text-small font-semibold text-plum transition hover:text-plum-dark"
      >
        <ArrowLeft className="h-4 w-4 rtl-flip" aria-hidden="true" strokeWidth={1.75} />
        {d.events.title}
      </Link>
      <PageHeader eyebrow={d.brand.fullName} title={d.events.createEvent} />
      <EventForm
        d={d}
        committees={committees.map((c) => ({ id: c.id, name: committeeName(c, locale) }))}
      />
    </>
  );
}
