'use client';

import { useState } from 'react';
import { CheckCheck, Save } from 'lucide-react';
import { saveAttendanceAction } from '@/app/actions/portal';
import { SubmitButton } from '@/components/forms/FormShell';
import { Avatar, Card, TableShell } from '@/components/ui';
import type { AttendanceStatus } from '@/lib/domain/types';
import type { Dictionary } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface Row {
  id: string;
  name: string;
  grade: string;
  avatar: string | null;
  status: AttendanceStatus | null;
}

const OPTIONS: AttendanceStatus[] = ['present', 'absent', 'late', 'excused'];

const OPTION_STYLE: Record<AttendanceStatus, string> = {
  present: 'peer-checked:border-success peer-checked:bg-success-soft peer-checked:text-success-ink',
  absent: 'peer-checked:border-danger peer-checked:bg-danger-soft peer-checked:text-danger-ink',
  late: 'peer-checked:border-warning peer-checked:bg-warning-soft peer-checked:text-warning-ink',
  excused: 'peer-checked:border-mauve peer-checked:bg-[#F2EBEE] peer-checked:text-mauve-dark',
};

/**
 * The attendance marking sheet.
 *
 * Radio inputs are used rather than a bespoke widget so the whole sheet is keyboard
 * operable and readable by assistive technology, and the status is never conveyed by
 * colour alone — every option carries its label.
 */
export function AttendanceSheet({
  sessionId,
  rows,
  d,
  readOnly = false,
}: {
  sessionId: string;
  rows: Row[];
  d: Dictionary;
  readOnly?: boolean;
}) {
  const [values, setValues] = useState<Record<string, AttendanceStatus | null>>(
    Object.fromEntries(rows.map((row) => [row.id, row.status])),
  );

  const label: Record<AttendanceStatus, string> = {
    present: d.attendance.present,
    absent: d.attendance.absent,
    late: d.attendance.late,
    excused: d.attendance.excused,
  };

  const markAllPresent = () => {
    setValues(Object.fromEntries(rows.map((row) => [row.id, 'present' as AttendanceStatus])));
  };

  return (
    <form action={saveAttendanceAction} className="grid gap-4">
      <input type="hidden" name="sessionId" value={sessionId} />

      {!readOnly ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={markAllPresent} className="btn btn-outline btn-sm">
            <CheckCheck className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />
            {d.attendance.markAll}
          </button>
          <SubmitButton
            label={d.attendance.saveAttendance}
            pendingLabel={d.common.saving}
            icon={<Save className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.75} />}
          />
        </div>
      ) : null}

      <TableShell className="hidden md:block">
        <table className="aecc-table">
          <caption className="sr-only">{d.attendance.title}</caption>
          <thead>
            <tr>
              <th scope="col">{d.common.member}</th>
              <th scope="col">{d.common.grade}</th>
              <th scope="col">{d.common.status}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <span className="flex items-center gap-3">
                    <Avatar name={row.name} src={row.avatar} size={32} />
                    <span className="text-small font-semibold text-plum">{row.name}</span>
                  </span>
                </td>
                <td className="whitespace-nowrap text-ink-muted">{row.grade}</td>
                <td>
                  <fieldset disabled={readOnly}>
                    <legend className="sr-only">
                      {d.common.status} — {row.name}
                    </legend>
                    <div className="flex flex-wrap gap-1.5">
                      {OPTIONS.map((option) => (
                        <span key={option} className="relative">
                          <input
                            type="radio"
                            id={`${row.id}-${option}`}
                            name={`status:${row.id}`}
                            value={option}
                            checked={values[row.id] === option}
                            onChange={() => setValues((v) => ({ ...v, [row.id]: option }))}
                            className="peer sr-only"
                          />
                          <label
                            htmlFor={`${row.id}-${option}`}
                            className={cn(
                              'inline-flex cursor-pointer items-center rounded-pill border border-line bg-white px-3 py-1 text-caption font-semibold text-ink-muted transition hover:border-rose peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-rose',
                              OPTION_STYLE[option],
                            )}
                          >
                            {label[option]}
                          </label>
                        </span>
                      ))}
                    </div>
                  </fieldset>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>

      {/* Small screens: one card per member instead of a horizontally scrolling table */}
      <ul className="grid gap-3 md:hidden">
        {rows.map((row) => (
          <Card as="li" key={row.id} className="p-4">
            <span className="flex items-center gap-3">
              <Avatar name={row.name} src={row.avatar} size={36} />
              <span className="min-w-0">
                <span className="block truncate text-small font-semibold text-plum">{row.name}</span>
                <span className="block text-caption text-ink-muted">{row.grade}</span>
              </span>
            </span>
            <fieldset disabled={readOnly} className="mt-3">
              <legend className="sr-only">
                {d.common.status} — {row.name}
              </legend>
              <div className="grid grid-cols-2 gap-1.5">
                {OPTIONS.map((option) => (
                  <span key={option} className="relative">
                    <input
                      type="radio"
                      id={`m-${row.id}-${option}`}
                      name={`status:${row.id}`}
                      value={option}
                      checked={values[row.id] === option}
                      onChange={() => setValues((v) => ({ ...v, [row.id]: option }))}
                      className="peer sr-only"
                    />
                    <label
                      htmlFor={`m-${row.id}-${option}`}
                      className={cn(
                        'flex cursor-pointer items-center justify-center rounded-control border border-line bg-white px-3 py-2 text-caption font-semibold text-ink-muted transition',
                        OPTION_STYLE[option],
                      )}
                    >
                      {label[option]}
                    </label>
                  </span>
                ))}
              </div>
            </fieldset>
          </Card>
        ))}
      </ul>

      {!readOnly ? (
        <div className="flex justify-end">
          <SubmitButton
            label={d.attendance.saveAttendance}
            pendingLabel={d.common.saving}
            icon={<Save className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.75} />}
          />
        </div>
      ) : null}
    </form>
  );
}
