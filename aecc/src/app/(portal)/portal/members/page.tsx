import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, UserPlus, Users } from 'lucide-react';
import { MemberLine, committeeName, memberName } from '@/components/portal/Common';
import {
  Avatar,
  Card,
  EmptyState,
  LinkButton,
  Meta,
  Pill,
  Progress,
  TableShell,
} from '@/components/ui';
import { PageHeader } from '@/components/ui';
import { requirePermission } from '@/lib/auth/current-user';
import { listCommittees, listGrades, listMembers } from '@/lib/db/queries';
import { memberStatus, roleLabel, roleTone } from '@/lib/domain/labels';
import { fill, formatDate, formatNumber, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Members' };

interface SearchParams {
  q?: string;
  grade?: string;
  committee?: string;
  role?: string;
  status?: string;
}

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const viewer = await requirePermission('members:read', '/portal/members');
  const { locale, d } = await getT();
  const params = await searchParams;

  const [committees, grades] = await Promise.all([listCommittees(), listGrades()]);
  const members = await listMembers({
    search: params.q,
    grade: params.grade,
    committeeId: params.committee,
    role: params.role as never,
    status: params.status,
    studentsOnly: !viewer.isStaff,
  });

  const committeeById = new Map(committees.map((c) => [c.id, c]));

  return (
    <>
      <PageHeader
        eyebrow={d.brand.fullName}
        title={d.members.title}
        subtitle={d.members.subtitle}
        actions={
          viewer.permissions.can('users:admin') ? (
            <LinkButton href="/portal/admin/users/new">
              <UserPlus className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.75} />
              {d.members.addMember}
            </LinkButton>
          ) : null
        }
      />

      {/* Filters — a GET form so every filtered view is a shareable URL and works
          without JavaScript. */}
      <form method="get" className="mb-6 grid gap-3 rounded-card border border-line bg-blush p-4 md:grid-cols-[1fr_auto]">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search
              className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-mauve"
              aria-hidden="true"
              strokeWidth={1.75}
            />
            <input
              type="search"
              name="q"
              defaultValue={params.q}
              placeholder={d.common.searchPlaceholder}
              aria-label={d.common.search}
              className="field-input ps-10"
            />
          </div>
          <select name="grade" defaultValue={params.grade ?? ''} aria-label={d.members.filterGrade} className="field-input">
            <option value="">{d.members.filterGrade}: {d.common.all}</option>
            {grades.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
          <select
            name="committee"
            defaultValue={params.committee ?? ''}
            aria-label={d.members.filterCommittee}
            className="field-input"
          >
            <option value="">{d.members.filterCommittee}: {d.common.all}</option>
            {committees.map((committee) => (
              <option key={committee.id} value={committee.id}>
                {committeeName(committee, locale)}
              </option>
            ))}
          </select>
          <select name="status" defaultValue={params.status ?? ''} aria-label={d.members.filterStatus} className="field-input">
            <option value="">{d.members.filterStatus}: {d.common.all}</option>
            <option value="active">{d.members.statusActive}</option>
            <option value="inactive">{d.members.statusInactive}</option>
            <option value="alumna">{d.members.statusAlumna}</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button type="submit" className="btn btn-primary">
            {d.common.filter}
          </button>
          <Link href="/portal/members" className="btn btn-ghost">
            {d.common.clearFilters}
          </Link>
        </div>
      </form>

      <p className="mb-4 text-small text-ink-muted">
        {fill(d.members.memberCount, { count: formatNumber(members.length, locale) })}
      </p>

      {members.length === 0 ? (
        <EmptyState icon={<Users />} title={d.members.noMembers} body={d.common.noResultsHint} />
      ) : (
        <>
          {/* Desktop table with a sticky header */}
          <TableShell className="hidden md:block">
            <table className="aecc-table">
              <caption className="sr-only">{d.members.directory}</caption>
              <thead>
                <tr>
                  <th scope="col">{d.common.name}</th>
                  <th scope="col">{d.common.grade}</th>
                  <th scope="col">{d.common.role}</th>
                  <th scope="col">{d.common.committee}</th>
                  <th scope="col" className="text-end">{d.common.points}</th>
                  <th scope="col">{d.members.attendanceRate}</th>
                  <th scope="col">{d.members.membershipStatus}</th>
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
                          size={36}
                          meta={member.username}
                        />
                      </td>
                      <td className="whitespace-nowrap text-ink-muted">{member.grade}</td>
                      <td>
                        <Pill tone={roleTone(member.role)}>{roleLabel(member.role, d)}</Pill>
                      </td>
                      <td className="text-ink-muted">
                        {committeeName(committeeById.get(member.committee_id ?? ''), locale) || '—'}
                      </td>
                      <td className="text-end font-semibold text-plum tabular-nums">
                        {formatNumber(member.points, locale)}
                      </td>
                      <td className="w-32">
                        <Progress value={member.attendance_rate} label={`${member.attendance_rate}%`} />
                      </td>
                      <td>
                        <Pill tone={status.tone}>{status.label}</Pill>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableShell>

          {/* Small screens get member cards rather than a squeezed table (guide §11) */}
          <ul className="grid gap-3 md:hidden">
            {members.map((member) => {
              const status = memberStatus(member.status, d);
              return (
                <Card as="li" key={member.id} className="p-4">
                  <Link href={`/portal/members/${member.id}`} className="flex items-start gap-3">
                    <Avatar name={memberName(member, locale)} src={member.avatar_url} size={44} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-brand text-[1.0625rem] text-plum">
                        {memberName(member, locale)}
                      </span>
                      <Meta
                        className="mt-1"
                        items={[
                          member.grade,
                          committeeName(committeeById.get(member.committee_id ?? ''), locale) || null,
                        ]}
                      />
                      <span className="mt-3 flex flex-wrap items-center gap-2">
                        <Pill tone={roleTone(member.role)}>{roleLabel(member.role, d)}</Pill>
                        <Pill tone={status.tone}>{status.label}</Pill>
                        <Pill tone="gold">
                          {formatNumber(member.points, locale)} {d.common.points}
                        </Pill>
                      </span>
                    </span>
                  </Link>
                </Card>
              );
            })}
          </ul>
        </>
      )}
    </>
  );
}
