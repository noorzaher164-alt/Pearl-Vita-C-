import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { MemberEditForm } from '@/components/forms/MemberEditForm';
import { committeeName, memberName } from '@/components/portal/Common';
import { PageHeader } from '@/components/ui';
import { requirePermission } from '@/lib/auth/current-user';
import { getAdminNotes, getMember, listCommittees, listGrades } from '@/lib/db/queries';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Edit member' };

export default async function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const viewer = await requirePermission('members:write');
  const { locale, d } = await getT();
  const { id } = await params;

  const member = await getMember(id);
  if (!member) notFound();

  const canEditNotes = viewer.permissions.can('members:notes');
  const [committees, grades, adminNotes] = await Promise.all([
    listCommittees(),
    listGrades(),
    canEditNotes ? getAdminNotes(id) : Promise.resolve(null),
  ]);

  return (
    <>
      <Link
        href={`/portal/members/${member.id}`}
        className="mb-6 inline-flex items-center gap-2 text-small font-semibold text-plum transition hover:text-plum-dark"
      >
        <ArrowLeft className="h-4 w-4 rtl-flip" aria-hidden="true" strokeWidth={1.75} />
        {memberName(member, locale)}
      </Link>

      <PageHeader eyebrow={d.members.title} title={d.members.editMember} />

      <MemberEditForm
        d={d}
        member={member}
        grades={grades}
        adminNotes={adminNotes}
        canEditNotes={canEditNotes}
        canAssignRole={viewer.permissions.can('roles:assign')}
        committees={committees.map((c) => ({ id: c.id, name: committeeName(c, locale) }))}
      />
    </>
  );
}
