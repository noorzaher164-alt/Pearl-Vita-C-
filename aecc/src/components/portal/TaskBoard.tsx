'use client';

import { AlertCircle, CalendarClock, ChevronLeft, ChevronRight } from 'lucide-react';
import { moveTaskAction } from '@/app/actions/portal';
import { AvatarStack, Pill } from '@/components/ui';
import { taskPriority } from '@/lib/domain/labels';
import type { TaskPriority, TaskStatus } from '@/lib/domain/types';
import type { Dictionary } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export interface BoardTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  overdue: boolean;
  committee: string;
  assignees: { name: string; avatar: string | null }[];
}

const COLUMNS: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];

/**
 * AECC-styled Kanban board.
 *
 * Movement between columns uses small submit buttons rather than drag-and-drop, so the
 * board is fully keyboard operable and works without JavaScript — the elegance comes
 * from the column typography and card treatment, not from a drag interaction.
 */
export function TaskBoard({
  tasks,
  d,
  canWrite,
}: {
  tasks: BoardTask[];
  d: Dictionary;
  canWrite: boolean;
}) {
  const label: Record<TaskStatus, string> = {
    todo: d.tasks.todo,
    in_progress: d.tasks.inProgress,
    review: d.tasks.review,
    done: d.tasks.done,
  };

  const accent: Record<TaskStatus, string> = {
    todo: 'bg-mauve',
    in_progress: 'bg-rose',
    review: 'bg-berry',
    done: 'bg-rose-gold',
  };

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {COLUMNS.map((column) => {
        const items = tasks.filter((task) => task.status === column);
        const columnIndex = COLUMNS.indexOf(column);

        return (
          <section
            key={column}
            aria-labelledby={`col-${column}`}
            className="rounded-card border border-line bg-blush p-3"
          >
            <header className="mb-3 flex items-center gap-2 px-2 pt-1">
              <span className={cn('h-2 w-2 rounded-pill', accent[column])} aria-hidden="true" />
              <h2 id={`col-${column}`} className="text-small font-semibold text-plum">
                {label[column]}
              </h2>
              <span className="ms-auto rounded-pill bg-surface px-2 py-0.5 text-caption text-ink-muted tabular-nums">
                {items.length}
              </span>
            </header>

            <ul className="grid gap-2">
              {items.map((task) => {
                const priority = taskPriority(task.priority, d);
                return (
                  <li
                    key={task.id}
                    className="rounded-control border border-line bg-surface p-4 shadow-soft transition hover:shadow-card"
                  >
                    <p className="text-small font-semibold leading-snug text-plum">{task.title}</p>
                    {task.description ? (
                      <p className="mt-1.5 line-clamp-2 text-caption leading-relaxed text-ink-muted">
                        {task.description}
                      </p>
                    ) : null}

                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <Pill tone={priority.tone}>{priority.label}</Pill>
                      {task.committee ? <Pill tone="soft">{task.committee}</Pill> : null}
                    </div>

                    {task.dueDate ? (
                      <p
                        className={cn(
                          'mt-3 flex items-center gap-1.5 text-caption',
                          task.overdue ? 'font-semibold text-danger' : 'text-ink-faint',
                        )}
                      >
                        {task.overdue ? (
                          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={1.75} />
                        ) : (
                          <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={1.75} />
                        )}
                        {task.overdue ? `${d.tasks.overdue} · ` : ''}
                        {task.dueDate}
                      </p>
                    ) : null}

                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
                      <AvatarStack people={task.assignees} size={26} max={3} />

                      {canWrite ? (
                        <span className="flex items-center gap-1">
                          {columnIndex > 0 ? (
                            <form action={moveTaskAction}>
                              <input type="hidden" name="taskId" value={task.id} />
                              <input type="hidden" name="status" value={COLUMNS[columnIndex - 1]} />
                              <button
                                type="submit"
                                aria-label={`${d.tasks.moveTo} ${label[COLUMNS[columnIndex - 1]]}`}
                                className="grid h-7 w-7 place-items-center rounded-control text-mauve transition hover:bg-blush hover:text-plum"
                              >
                                <ChevronLeft className="h-4 w-4 rtl-flip" aria-hidden="true" strokeWidth={1.75} />
                              </button>
                            </form>
                          ) : null}
                          {columnIndex < COLUMNS.length - 1 ? (
                            <form action={moveTaskAction}>
                              <input type="hidden" name="taskId" value={task.id} />
                              <input type="hidden" name="status" value={COLUMNS[columnIndex + 1]} />
                              <button
                                type="submit"
                                aria-label={`${d.tasks.moveTo} ${label[COLUMNS[columnIndex + 1]]}`}
                                className="grid h-7 w-7 place-items-center rounded-control text-mauve transition hover:bg-blush hover:text-plum"
                              >
                                <ChevronRight className="h-4 w-4 rtl-flip" aria-hidden="true" strokeWidth={1.75} />
                              </button>
                            </form>
                          ) : null}
                        </span>
                      ) : null}
                    </div>
                  </li>
                );
              })}

              {items.length === 0 ? (
                <li className="rounded-control border border-dashed border-line-strong px-4 py-8 text-center text-caption text-ink-faint">
                  {d.tasks.noTasks}
                </li>
              ) : null}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
