import type { Metadata } from 'next';
import Link from 'next/link';
import { FlaskConical, Heart, Lightbulb, Sparkles, Star, Users } from 'lucide-react';
import { committeeName, memberName } from '@/components/portal/Common';
import { Avatar, Card, CardHeader, PageHeader } from '@/components/ui';
import { requireViewer } from '@/lib/auth/current-user';
import { listCommittees, listMembers } from '@/lib/db/queries';
import { roleLabel } from '@/lib/domain/labels';
import { pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'About the Club' };

export default async function AboutPage() {
  await requireViewer('/portal/about');
  const { locale, d } = await getT();

  const [committees, allMembers] = await Promise.all([listCommittees(), listMembers()]);

  const supervisors = allMembers.filter(
    (m) => m.role === 'admin' || m.role === 'president' || m.role === 'vice_president',
  );
  const studentMembers = allMembers.filter(
    (m) => m.role !== 'admin' && m.role !== 'president' && m.role !== 'vice_president',
  );

  const values = [
    { icon: Lightbulb, title: d.about.valueCuriosity, desc: d.about.valueCuriosityDesc },
    { icon: Users, title: d.about.valueTeamwork, desc: d.about.valueTeamworkDesc },
    { icon: Star, title: d.about.valueExcellence, desc: d.about.valueExcellenceDesc },
    { icon: Heart, title: d.about.valueCreativity, desc: d.about.valueCreativityDesc },
  ];

  return (
    <>
      <PageHeader eyebrow={d.brand.fullName} title={d.about.title} subtitle={d.about.subtitle} />

      {/* Mission & Vision */}
      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <Card>
          <div className="p-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-pill bg-plum/10">
                <FlaskConical className="h-[18px] w-[18px] text-plum" strokeWidth={1.75} />
              </span>
              <h2 className="font-brand text-h3 text-plum">{d.about.mission}</h2>
            </div>
            <p className="text-small leading-relaxed text-ink-muted">{d.about.missionText}</p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-pill bg-rose/10">
                <Sparkles className="h-[18px] w-[18px] text-rose" strokeWidth={1.75} />
              </span>
              <h2 className="font-brand text-h3 text-plum">{d.about.vision}</h2>
            </div>
            <p className="text-small leading-relaxed text-ink-muted">{d.about.visionText}</p>
          </div>
        </Card>
      </div>

      {/* Values */}
      <Card className="mb-8">
        <CardHeader title={d.about.values} />
        <div className="grid gap-4 p-6 pt-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <div key={v.title} className="rounded-card border border-line bg-blush p-4 text-center">
              <v.icon className="mx-auto mb-2 h-6 w-6 text-plum" strokeWidth={1.5} />
              <h3 className="mb-1 text-small font-semibold text-plum">{v.title}</h3>
              <p className="text-caption leading-relaxed text-ink-muted">{v.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Org Chart — Supervisors */}
      <Card className="mb-8">
        <CardHeader title={d.about.orgChart} />
        <div className="p-6 pt-4">
          <h3 className="mb-4 text-small font-semibold uppercase tracking-wider text-mauve">
            {d.about.supervisors}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {supervisors.map((s) => {
              const name = memberName(s, locale);
              const bio = pick(locale, s as unknown as Record<string, unknown>, 'bio');
              return (
                <Link
                  key={s.id}
                  href={`/portal/members/${s.id}`}
                  className="flex items-start gap-3 rounded-card border border-line bg-surface p-4 transition hover:border-rose hover:shadow-card"
                >
                  <Avatar name={name} src={s.avatar_url} size={52} />
                  <div className="min-w-0 flex-1">
                    <p className="font-brand text-body font-semibold text-plum">{name}</p>
                    <p className="text-caption text-rose">{roleLabel(s.role, d)}</p>
                    {bio ? (
                      <p className="mt-1 line-clamp-2 text-caption leading-relaxed text-ink-muted">{bio}</p>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Committees */}
          <h3 className="mb-4 mt-8 text-small font-semibold uppercase tracking-wider text-mauve">
            {d.about.committeesSection}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {committees.map((c) => {
              const cName = committeeName(c, locale);
              return (
                <Link
                  key={c.id}
                  href={`/portal/committees/${c.slug}`}
                  className="rounded-card border border-line bg-surface p-4 transition hover:border-rose hover:shadow-card"
                >
                  <p className="font-brand text-body font-semibold text-plum">{cName}</p>
                  <p className="mt-1 text-caption text-ink-muted">
                    {c.members.length} {d.about.membersSection}
                    {c.leader ? ` · ${d.committees.leader}: ${memberName(c.leader, locale)}` : ''}
                  </p>
                </Link>
              );
            })}
          </div>

          {/* Members count */}
          <h3 className="mb-4 mt-8 text-small font-semibold uppercase tracking-wider text-mauve">
            {d.about.membersSection}
          </h3>
          <div className="flex items-center gap-3 rounded-card border border-line bg-blush p-4">
            <Users className="h-6 w-6 text-plum" strokeWidth={1.5} />
            <div>
              <p className="font-brand text-h3 text-plum">{studentMembers.length}</p>
              <p className="text-caption text-ink-muted">
                {d.members.memberCount.replace('{count}', String(studentMembers.length))}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
