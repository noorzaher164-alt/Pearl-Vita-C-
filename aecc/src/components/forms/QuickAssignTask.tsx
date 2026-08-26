'use client';

import { useActionState, useState } from 'react';
import { Plus, UserPlus } from 'lucide-react';
import { createTaskAction, type ActionResult } from '@/app/actions/portal';
import type { Dictionary } from '@/lib/i18n';

interface MemberOption {
  id: string;
  name: string;
}

export function QuickAssignTask({
  d,
  members,
}: {
  d: Dictionary;
  members: MemberOption[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<ActionResult, FormData>(createTaskAction, {});

  if (state.ok && open) {
    setOpen(false);
  }

  if (!open) {
    return (
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-control bg-plum px-4 py-2 text-caption font-semibold text-white transition hover:bg-plum-dark"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          {d.members.assignNewTask}
        </button>
        {state.ok ? (
          <span className="text-caption text-emerald-600">{d.members.taskAssigned}</span>
        ) : null}
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-card border border-line bg-blush p-4">
      <h4 className="mb-3 flex items-center gap-2 text-small font-semibold text-plum">
        <UserPlus className="h-4 w-4" strokeWidth={1.75} />
        {d.members.assignNewTask}
      </h4>
      <p className="mb-4 text-caption text-ink-muted">{d.members.assignTaskHint}</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="qat-title" className="mb-1 block text-caption font-semibold text-ink-muted">
            {d.members.taskTitleLabel}
          </label>
          <input
            id="qat-title"
            name="titleEn"
            required
            minLength={3}
            placeholder={d.members.taskTitlePlaceholder}
            className="w-full rounded-control border border-line bg-white px-3 py-2 text-small text-ink placeholder:text-ink-faint focus:border-plum focus:outline-none focus:ring-1 focus:ring-plum"
          />
        </div>

        <div>
          <label htmlFor="qat-assignee" className="mb-1 block text-caption font-semibold text-ink-muted">
            {d.members.selectAssignee}
          </label>
          <select
            id="qat-assignee"
            name="assignees"
            required
            className="w-full rounded-control border border-line bg-white px-3 py-2 text-small text-ink focus:border-plum focus:outline-none focus:ring-1 focus:ring-plum"
          >
            <option value="">{d.members.selectAssigneePlaceholder}</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="qat-priority" className="mb-1 block text-caption font-semibold text-ink-muted">
            {d.tasks.priority}
          </label>
          <select
            id="qat-priority"
            name="priority"
            defaultValue="medium"
            className="w-full rounded-control border border-line bg-white px-3 py-2 text-small text-ink focus:border-plum focus:outline-none focus:ring-1 focus:ring-plum"
          >
            <option value="low">{d.tasks.priorityLow}</option>
            <option value="medium">{d.tasks.priorityMedium}</option>
            <option value="high">{d.tasks.priorityHigh}</option>
          </select>
        </div>

        <div>
          <label htmlFor="qat-due" className="mb-1 block text-caption font-semibold text-ink-muted">
            {d.tasks.dueDate}
          </label>
          <input
            id="qat-due"
            name="dueDate"
            type="date"
            className="w-full rounded-control border border-line bg-white px-3 py-2 text-small text-ink focus:border-plum focus:outline-none focus:ring-1 focus:ring-plum"
          />
        </div>
      </div>

      {state.error ? (
        <p className="mt-2 text-caption text-danger">{d.common.error}</p>
      ) : null}

      <div className="mt-4 flex items-center gap-2">
        <button
          type="submit"
          className="rounded-control bg-plum px-4 py-2 text-caption font-semibold text-white transition hover:bg-plum-dark"
        >
          {d.tasks.createTask}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-control border border-line bg-white px-4 py-2 text-caption font-semibold text-ink-muted transition hover:bg-blush"
        >
          {d.common.cancel}
        </button>
      </div>
    </form>
  );
}
