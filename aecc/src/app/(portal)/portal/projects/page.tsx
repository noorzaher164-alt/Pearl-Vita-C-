import type { Metadata } from 'next';
import Link from 'next/link';
import { FlaskConical } from 'lucide-react';
import { AvatarStack, Card, EmptyState, Meta, PageHeader, Pill, Progress } from '@/components/ui';
import { committeeName, memberName } from '@/components/portal/Common';
import { requirePermission } from '@/lib/auth/current-user';
import { listProjects } from '@/lib/db/queries';
import { projectStatus } from '@/lib/domain/labels';
import { fill, formatDate, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Projects' };

export default async function ProjectsPage() {
  await requirePermission('projects:read', '/portal/projects');
  const { locale, d } = await getT();
  const projects = await listProjects();

  return (
    <>
      <PageHeader eyebrow={d.brand.fullName} title={d.projects.title} subtitle={d.projects.subtitle} />

      {projects.length === 0 ? (
        <EmptyState icon={<FlaskConical />} title={d.projects.noProjects} />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {projects.map((project) => {
            const status = projectStatus(project.status, d);
            const done = project.milestones.filter((m) => m.done).length;
            return (
              <Card as="article" key={project.id} className="flex flex-col overflow-hidden">
                {project.cover_image ? (
                  <div className="aspect-[16/6] bg-blush">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={project.cover_image}
                      alt=""
                      className="h-full w-full object-cover"
                      aria-hidden="true"
                    />
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Pill tone={status.tone}>{status.label}</Pill>
                    {project.committee ? (
                      <Pill tone="soft">{committeeName(project.committee, locale)}</Pill>
                    ) : null}
                  </div>

                  <h2 className="font-brand text-h3 text-plum">
                    <Link
                      href={`/portal/projects/${project.slug}`}
                      className="transition hover:text-plum-dark"
                    >
                      {pick(locale, project as unknown as Record<string, unknown>, 'title')}
                    </Link>
                  </h2>
                  <p className="mt-2 flex-1 text-small leading-relaxed text-ink-muted">
                    {pick(locale, project as unknown as Record<string, unknown>, 'objective')}
                  </p>

                  <Progress value={project.progress} label={d.common.progress} className="mt-5" />

                  <Meta
                    className="mt-4"
                    items={[
                      project.leader ? `${d.projects.projectLeader}: ${memberName(project.leader, locale)}` : null,
                      `${d.common.deadline}: ${formatDate(project.deadline, locale)}`,
                      fill(d.projects.completedMilestones, { done, total: project.milestones.length }),
                    ]}
                  />

                  <div className="mt-4 border-t border-line pt-4">
                    <AvatarStack
                      people={project.team.map(({ member }) => ({
                        name: memberName(member, locale),
                        avatar: member.avatar_url,
                      }))}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
