import type { Metadata } from 'next';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import { AccountControls } from '@/components/forms/AccountControls';
import { MemberLine, committeeName } from '@/components/portal/Common';
import { LinkButton, PageHeader, Pill, TableShell } from '@/components/ui';
import { requirePermission } from '@/lib/auth/current-user';
import { listCommittees, listMembers } from '@/lib/db/queries';
import { memberStatus, roleLabel, roleTone } from '@/lib/domain/labels';
import { formatDate } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'User management' };

export default async function UsersAdminPage() {
  const viewer = await requirePermission('users:admin', '/portal/admin/users');
  const { locale, d } = await getT();

  const [members, committees] = await Promise.all([
    listMembers({ studentsOnly: false }),
    listCommittees(),
  ]);
  const committeeById = new Map(committees.map((c) => [c.id, c]));

  return (
    <>
      <PageHeader
        eyebrow={d.nav.groupAdmin}
        title={d.admin.users}
        subtitle={d.admin.usersSubtitle}
        actions={
          <LinkButton href="/portal/admin/users/new">
            <UserPlus className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.75} />
            {d.admin.createUser}
          </LinkButton>
        }
      />

      <TableShell>
        <table className="aecc-table">
          <caption className="sr-only">{d.admin.users}</caption>
          <thead>
            <tr>
              <th scope="col">{d.common.name}</th>
              <th scope="col">{d.members.username}</th>
              <th scope="col">{d.common.role}</th>
              <th scope="col">{d.common.committee}</th>
              <th scope="col">{d.admin.accountStatus}</th>
              <th scope="col">{d.auth.lastLogin}</th>
              <th scope="col" className="text-end">{d.common.actions}</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              const status = memberStatus(member.status, d);
              return (
                <tr key={member.id}>
                  <td>
                    <MemberLine
                      member={member}
                      locale={locale}
                      href={`/portal/members/${member.id}`}
                      size={32}
                      meta={member.grade}
                    />
                  </td>
                  <td className="text-ink-muted" dir="ltr">
                    {member.username}
                  </td>
                  <td>
                    <Pill tone={roleTone(member.role)}>{roleLabel(member.role, d)}</Pill>
                  </td>
                  <td className="text-ink-muted">
                    {committeeName(committeeById.get(member.committee_id ?? ''), locale) || '—'}
                  </td>
                  <td>
                    <Pill tone={status.tone}>{status.label}</Pill>
                  </td>
                  <td className="whitespace-nowrap text-ink-muted">
                    {member.last_login_at ? formatDate(member.last_login_at, locale) : d.auth.neverSignedIn}
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/portal/members/${member.id}/edit`}
                        className="btn btn-ghost btn-sm"
                      >
                        {d.common.edit}
                      </Link>
                      {/* A supervisor cannot deactivate or reset her own account here. */}
                      {member.id === viewer.id ? null : (
                        <AccountControls
                          userId={member.id}
                          status={member.status}
                          d={d}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableShell>
    </>
  );
}
