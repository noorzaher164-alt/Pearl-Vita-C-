'use client';

import { useActionState } from 'react';
import { KeyRound, UserCheck, UserX } from 'lucide-react';
import { resetPasswordAction, setAccountStatusAction, type ActionResult } from '@/app/actions/portal';
import type { Dictionary } from '@/lib/i18n';

/**
 * Supervisor-only account controls.
 *
 * The temporary password is shown once, inline, and is never persisted in plaintext —
 * the server stores only its scrypt digest.
 */
export function AccountControls({
  userId,
  status,
  d,
}: {
  userId: string;
  status: string;
  d: Dictionary;
}) {
  const [state, resetAction] = useActionState<ActionResult, FormData>(resetPasswordAction, {});
  const isActive = status === 'active';

  return (
    <span className="inline-flex items-center gap-1">
      <form action={setAccountStatusAction} className="inline">
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="status" value={isActive ? 'inactive' : 'active'} />
        <button
          type="submit"
          className="btn btn-ghost btn-sm"
          title={isActive ? d.members.deactivate : d.members.activate}
        >
          {isActive ? (
            <UserX className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />
          ) : (
            <UserCheck className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />
          )}
          <span className="sr-only">{isActive ? d.members.deactivate : d.members.activate}</span>
        </button>
      </form>

      <form action={resetAction} className="inline">
        <input type="hidden" name="userId" value={userId} />
        <button type="submit" className="btn btn-ghost btn-sm" title={d.members.resetPassword}>
          <KeyRound className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />
          <span className="sr-only">{d.members.resetPassword}</span>
        </button>
      </form>

      {state.ok && state.message ? (
        <span
          className="rounded-pill border border-[#E8CDBF] bg-[#F9EDE6] px-2 py-1 font-mono text-caption text-[#8A5540]"
          dir="ltr"
        >
          {d.admin.temporaryPassword}: {state.message}
        </span>
      ) : null}
    </span>
  );
}
