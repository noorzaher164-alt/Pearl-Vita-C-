import type { Metadata } from 'next';
import { ListChecks } from 'lucide-react';
import { TaskBoard } from '@/components/portal/TaskBoard';
import { committeeName, memberName } from '@/components/portal/Common';
import { EmptyState, LinkTabs, PageHeader, Pill, TableShell } from '@/components/ui';
import { requirePermission } from '@/lib/auth/current-user';
import { listCommittees, listTasks } from '@/lib/db/queries';
import { taskPriority, taskStatus } from '@/lib/domain/labels';
import { formatDate, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Tasks' };

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; scope?: string; committee?: string }>;
}) {
  const viewer = await requirePermission('tasks:read', '/portal/tasks');
  const { locale, d } = await getT();
  const params = await searchParams;

  const view = params.view === 'list' ? 'list' : 'board';
  const scope = params.scope === 'mine' ? 'mine' : 'all';

  const [tasks, committees] = await Promise.all([
    listTasks({
      userId: scope === 'mine' ? viewer.id : undefined,
      committeeId: params.committee,
    }),
    listCommittees(),
  ]);

  const canWrite = viewer.permissions.can('tasks:write');
  const query = (extra: Record<string, string>) => {
    const search = new URLSearchParams({
      view,
      scope,
      ...(params.committee ? { committee: params.committee } : {}),
      ...extra,
    });
    return `/portal/tasks?${search.toString()}`;
  };

  return (
    <>
      <PageHeader eyebrow={d.brand.fullName} title={d.tasks.title} subtitle={d.tasks.subtitle} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <LinkTabs
          activeKey={scope}
          items={[
            { key: 'all', label: d.tasks.allTasks, href: query({ scope: 'all' }) },
            { key: 'mine', label: d.tasks.myTasks, href: query({ scope: 'mine' }) },
          ]}
        />
        <LinkTabs
          activeKey={view}
          items={[
            { key: 'board', label: d.tasks.board, href: query({ view: 'board' }) },
            { key: 'list', label: d.tasks.list, href: query({ view: 'list' }) },
          ]}
        />
      </div>

      {tasks.length === 0 ? (
        <EmptyState icon={<ListChecks />} title={d.tasks.noTasks} body={d.common.noResultsHint} />
      ) : view === 'board' ? (
        <TaskBoard
          d={d}
          canWrite={canWrite}
          tasks={tasks.map((task) => ({
            id: task.id,
            title: pick(locale, task as unknown as Record<string, unknown>, 'title'),
            description: pick(locale, task as unknown as Record<string, unknown>, 'description'),
            status: task.status,
            priority: task.priority,
            dueDate: task.due_date ? formatDate(task.due_date, locale) : null,
            overdue: task.due_date ? new Date(task.due_date).getTime() < Date.now() && task.status !== 'done' : false,
            committee: committeeName(task.committee, locale),
            assignees: task.assignees.map((a) => ({
              name: memberName(a, locale),
              avatar: a.avatar_url,
            })),
          }))}
        />
      ) : (
        <TableShell>
          <table className="aecc-table">
            <caption className="sr-only">{d.tasks.title}</caption>
            <thead>
              <tr>
                <th scope="col">{d.common.title}</th>
                <th scope="col">{d.tasks.assignee}</th>
                <th scope="col">{d.common.committee}</th>
                <th scope="col">{d.tasks.dueDate}</th>
                <th scope="col">{d.tasks.priority}</th>
                <th scope="col">{d.common.status}</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const state = taskStatus(task.status, d);
                const priority = taskPriority(task.priority, d);
                return (
                  <tr key={task.id}>
                    <td className="font-semibold text-plum">
                      {pick(locale, task as unknown as Record<string, unknown>, 'title')}
                    </td>
                    <td className="text-ink-muted">
                      {task.assignees.map((a) => memberName(a, locale)).join(' · ') || '—'}
                    </td>
                    <td className="text-ink-muted">{committeeName(task.committee, locale) || '—'}</td>
                    <td className="whitespace-nowrap text-ink-muted">
                      {task.due_date ? formatDate(task.due_date, locale) : '—'}
                    </td>
                    <td>
                      <Pill tone={priority.tone}>{priority.label}</Pill>
                    </td>
                    <td>
                      <Pill tone={state.tone}>{state.label}</Pill>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableShell>
      )}

      {committees.length > 0 ? (
        <nav className="mt-8 flex flex-wrap items-center gap-2" aria-label={d.members.filterCommittee}>
          <span className="text-caption text-ink-muted">{d.members.filterCommittee}:</span>
          <a href="/portal/tasks" className="btn btn-ghost btn-sm">
            {d.common.all}
          </a>
          {committees.map((committee) => (
            <a
              key={committee.id}
              href={query({ committee: committee.id })}
              className={`btn btn-sm ${params.committee === committee.id ? 'btn-secondary' : 'btn-ghost'}`}
            >
              {committeeName(committee, locale)}
            </a>
          ))}
        </nav>
      ) : null}
    </>
  );
}
