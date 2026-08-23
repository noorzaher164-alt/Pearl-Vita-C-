'use client';

import { Undo2 } from 'lucide-react';
import { reversePointsAction } from '@/app/actions/portal';

/**
 * Corrections are compensating transactions, never deletions — so this posts a new
 * reversing entry rather than removing the original row.
 */
export function ReversePointsButton({
  transactionId,
  label,
}: {
  transactionId: string;
  label: string;
}) {
  return (
    <form action={reversePointsAction} className="inline">
      <input type="hidden" name="transactionId" value={transactionId} />
      <input type="hidden" name="reason" value="Correction recorded from the points ledger" />
      <button
        type="submit"
        className="inline-flex items-center gap-1.5 rounded-control px-2 py-1 text-caption font-semibold text-ink-muted transition hover:bg-danger-soft hover:text-danger-ink"
        title={label}
      >
        <Undo2 className="h-3.5 w-3.5 rtl-flip" aria-hidden="true" strokeWidth={1.75} />
        <span className="sr-only sm:not-sr-only">{label}</span>
      </button>
    </form>
  );
}
