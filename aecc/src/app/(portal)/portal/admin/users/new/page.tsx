import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CreateUserForm } from '@/components/forms/CreateUserForm';
import { committeeName } from '@/components/portal/Common';
import { PageHeader } from '@/components/ui';
import { requirePermission } from '@/lib/auth/current-user';
import { listCommittees, listGrades } from '@/lib/db/queries';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Create account' };

export default async function NewUserPage() {
  await requirePermission('users:admin', '/portal/admin/users/new');
  const { locale, d } = await getT();
  const [committees, grades] = await Promise.all([listCommittees(), listGrades()]);

  return (
    <>
      <Link
        href="/portal/admin/users"
        className="mb-6 inline-flex items-center gap-2 text-small font-semibold text-plum transition hover:text-plum-dark"
      >
        <ArrowLeft className="h-4 w-4 rtl-flip" aria-hidden="true" strokeWidth={1.75} />
        {d.admin.users}
      </Link>
      <PageHeader eyebrow={d.nav.groupAdmin} title={d.admin.createUser} />
      <CreateUserForm
        d={d}
        grades={grades}
        committees={committees.map((c) => ({ id: c.id, name: committeeName(c, locale) }))}
      />
    </>
  );
}
