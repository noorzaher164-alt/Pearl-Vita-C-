import type { Metadata } from 'next';
import Link from 'next/link';
import { Crown, Network, Search, Shield, Star, UserPlus, Users } from 'lucide-react';
import { MemberLine, committeeName, memberName } from '@/components/portal/Common';
import {
  Avatar,
  Card,
  CardHeader,
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

      {/* Organizational Structure — top-down hierarchy */}
      <Card className="mb-8 overflow-x-auto">
        <CardHeader title={d.about.orgChart} />
        <div className="px-6 pb-8 pt-4">
          <div className="flex flex-col items-center gap-0">
            {/* Level 1 — General Supervisor */}
            <div className="flex flex-col items-center gap-3 rounded-card border-2 border-plum bg-plum/5 px-6 py-4 shadow-soft">
              <span className="grid h-10 w-10 place-items-center rounded-pill bg-plum">
                <Shield className="h-5 w-5 text-white" strokeWidth={1.75} />
              </span>
              <p className="text-small font-bold text-plum">{d.about.roleGeneralSupervisor}</p>
            </div>

            {/* Connector line */}
            <div className="h-8 w-px bg-plum/30" />

            {/* Level 2 — President */}
            <div className="flex flex-col items-center gap-2 rounded-card border-2 border-rose bg-rose/5 px-6 py-3 shadow-soft">
              <span className="grid h-9 w-9 place-items-center rounded-pill bg-rose">
                <Crown className="h-4 w-4 text-white" strokeWidth={1.75} />
              </span>
              <p className="text-small font-bold text-plum">{d.about.rolePresident}</p>
            </div>

            {/* Connector line */}
            <div className="h-8 w-px bg-plum/30" />

            {/* Level 3 — VP, Secretary, Relations */}
            <div className="relative flex items-start justify-center gap-6 sm:gap-10">
              {/* Horizontal connector bar */}
              <div className="absolute top-0 hidden h-px w-[calc(100%-4rem)] bg-plum/30 sm:block" />
              {([
                { icon: Star, role: d.about.roleVicePresident },
                { icon: Users, role: d.about.roleSecretary },
                { icon: Network, role: d.about.roleRelationsOfficer },
              ] as const).map((item) => (
                <div key={item.role} className="flex flex-col items-center">
                  <div className="hidden h-5 w-px bg-plum/30 sm:block" />
                  <div className="flex flex-col items-center gap-2 rounded-card border border-line bg-blush px-4 py-3 shadow-soft">
                    <span className="grid h-8 w-8 place-items-center rounded-pill bg-plum/10">
                      <item.icon className="h-4 w-4 text-plum" strokeWidth={1.75} />
                    </span>
                    <p className="max-w-[7rem] text-center text-caption font-semibold text-plum">{item.role}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Connector line to committees */}
            <div className="h-8 w-px bg-plum/30" />
            <div className="mb-1 text-small font-semibold uppercase tracking-wider text-mauve">
              {d.about.committeesSection}
            </div>
            <div className="h-4 w-px bg-plum/30" />

            {/* Level 4 — Committees */}
            <div className="relative w-full">
              {/* Horizontal connector bar */}
              <div className="mx-auto hidden h-px bg-plum/30 sm:block" style={{ width: '80%' }} />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {committees.map((c) => {
                  const cName = committeeName(c, locale);
                  const desc = pick(locale, c as unknown as Record<string, unknown>, 'description');
                  return (
                    <Link
                      key={c.id}
                      href={`/portal/committees/${c.slug}`}
                      className="flex flex-col items-center rounded-card border border-line bg-surface p-4 text-center transition hover:border-rose hover:shadow-card"
                    >
                      <div className="hidden h-4 w-px bg-plum/30 sm:block" />
                      <p className="text-small font-semibold text-plum">{cName}</p>
                      {desc ? (
                        <p className="mt-1 line-clamp-2 text-caption leading-relaxed text-ink-muted">
                          {desc}
                        </p>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Card>

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
