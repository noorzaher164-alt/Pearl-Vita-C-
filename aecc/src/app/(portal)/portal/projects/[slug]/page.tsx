import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Check, FileText, Target } from 'lucide-react';
import { MemberLine, committeeName, memberName } from '@/components/portal/Common';
import { Card, CardHeader, PageHeader, Pill, Progress, Stat } from '@/components/ui';
import { requirePermission } from '@/lib/auth/current-user';
import { getProject } from '@/lib/db/queries';
import { projectStatus, taskStatus } from '@/lib/domain/labels';
import { fill, formatDate, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Project' };

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  await requirePermission('projects:read');
  const { locale, d } = await getT();
  const { slug } = await params;

  const project = await getProject(slug);
  if (!project) notFound();

  const status = projectStatus(project.status, d);
  const done = project.milestones.filter((m) => m.done).length;
  const results = pick(locale, project as unknown as Record<string, unknown>, 'results');

  return (
    <>
      <Link
        href="/portal/projects"
        className="mb-6 inline-flex items-center gap-2 text-small font-semibold text-plum transition hover:text-plum-dark"
      >
        <ArrowLeft className="h-4 w-4 rtl-flip" aria-hidden="true" strokeWidth={1.75} />
        {d.projects.title}
      </Link>

      <PageHeader
        eyebrow={
          <span className="inline-flex flex-wrap items-center gap-2">
            <Pill tone={status.tone}>{status.label}</Pill>
            {project.committee ? <Pill tone="soft">{committeeName(project.committee, locale)}</Pill> : null}
          </span>
        }
        title={pick(locale, project as unknown as Record<string, unknown>, 'title')}
        subtitle={pick(locale, project as unknown as Record<string, unknown>, 'objective')}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid content-start gap-6 lg:col-span-2">
          <Card>
            <CardHeader
              title={
                <span className="inline-flex items-center gap-2">
                  <Target className="h-4 w-4 text-rose-gold" aria-hidden="true" strokeWidth={1.75} />
                  {d.common.description}
                </span>
              }
            />
            <div className="p-6 pt-4">
              <p className="max-w-prose leading-relaxed text-ink">
                {pick(locale, project as unknown as Record<string, unknown>, 'description')}
              </p>
            </div>
          </Card>

          <Card>
            <CardHeader
              title={d.projects.milestones}
              subtitle={fill(d.projects.completedMilestones, {
                done,
                total: project.milestones.length,
              })}
            />
            <div className="p-6 pt-4">
              <ol className="relative grid gap-0">
                {project.milestones.map((milestone, index) => (
                  <li key={milestone.id} className="relative flex gap-4 pb-6 last:pb-0">
                    {index < project.milestones.length - 1 ? (
                      <span
                        className="absolute start-[13px] top-7 h-full w-px bg-line-strong"
                        aria-hidden="true"
                      />
                    ) : null}
                    <span
                      className={cn(
                        'relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-pill border',
                        milestone.done
                          ? 'border-rose-gold bg-[#F9EDE6] text-[#8A5540]'
                          : 'border-line bg-surface text-mauve',
                      )}
                    >
                      {milestone.done ? (
                        <Check className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={2.25} />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-pill bg-mauve" aria-hidden="true" />
                      )}
                    </span>
                    <span className="min-w-0 pt-0.5">
                      <span
                        className={cn(
                          'block text-small font-semibold',
                          milestone.done ? 'text-ink-muted' : 'text-plum',
                        )}
                      >
                        {pick(locale, milestone as unknown as Record<string, unknown>, 'title')}
                      </span>
                      <span className="block text-caption text-ink-faint">
                        {formatDate(milestone.due_date, locale)}
                      </span>
                    </span>
                    <span className="ms-auto shrink-0 self-start">
                      <Pill tone={milestone.done ? 'success' : 'neutral'}>
                        {milestone.done ? d.tasks.done : d.tasks.todo}
                      </Pill>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </Card>

          {project.tasks.length > 0 ? (
            <Card>
              <CardHeader title={d.projects.relatedTasks} />
              <ul className="mt-4 divide-y divide-line">
                {project.tasks.map((task) => {
                  const state = taskStatus(task.status, d);
                  return (
                    <li key={task.id} className="flex flex-wrap items-center gap-3 px-6 py-3">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-small font-semibold text-plum">
                          {pick(locale, task as unknown as Record<string, unknown>, 'title')}
                        </span>
                        <span className="block text-caption text-ink-faint">
                          {task.assignees.map((a) => memberName(a, locale)).join(' · ') || '—'}
                        </span>
                      </span>
                      <Pill tone={state.tone}>{state.label}</Pill>
                    </li>
                  );
                })}
              </ul>
            </Card>
          ) : null}

          {results ? (
            <Card className="border-rose-gold/40 bg-[#FBF2EC]">
              <CardHeader title={d.projects.results} />
              <div className="p-6 pt-4">
                <p className="max-w-prose leading-relaxed text-ink">{results}</p>
              </div>
            </Card>
          ) : null}
        </div>

        <div className="grid content-start gap-6">
          <Card className="p-6">
            <Progress value={project.progress} label={d.common.progress} />
            <dl className="mt-6 grid gap-4">
              <Stat label={d.projects.startDate} value={formatDate(project.starts_on, locale)} />
              <Stat label={d.common.deadline} value={formatDate(project.deadline, locale)} />
              <Stat label={d.projects.finalStatus} value={status.label} />
            </dl>
          </Card>

          <Card>
            <CardHeader title={d.projects.team} />
            <div className="grid gap-4 p-6 pt-4">
              {project.supervisor ? (
                <div>
                  <p className="mb-2 text-caption text-ink-muted">{d.projects.supervisor}</p>
                  <MemberLine
                    member={project.supervisor}
                    locale={locale}
                    href={`/portal/members/${project.supervisor.id}`}
                    size={34}
                  />
                </div>
              ) : null}
              {project.leader ? (
                <div>
                  <p className="mb-2 text-caption text-ink-muted">{d.projects.projectLeader}</p>
                  <MemberLine
                    member={project.leader}
                    locale={locale}
                    href={`/portal/members/${project.leader.id}`}
                    size={34}
                  />
                </div>
              ) : null}
              <div>
                <p className="mb-2 text-caption text-ink-muted">{d.common.members}</p>
                <ul className="grid gap-3">
                  {project.team.map(({ member, role_in_project }) => (
                    <li key={member.id}>
                      <MemberLine
                        member={member}
                        locale={locale}
                        href={`/portal/members/${member.id}`}
                        size={30}
                        meta={role_in_project}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          {project.files.length > 0 ? (
            <Card>
              <CardHeader title={d.projects.files} />
              <ul className="grid gap-2 p-6 pt-4">
                {project.files.map((file) => (
                  <li key={file.id}>
                    <span className="flex items-center gap-2 rounded-control border border-line bg-blush px-3 py-2 text-small text-ink">
                      <FileText className="h-4 w-4 shrink-0 text-mauve" aria-hidden="true" strokeWidth={1.75} />
                      <span className="truncate">{file.name}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}
