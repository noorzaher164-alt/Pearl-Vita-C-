'use client';

import { Trash2 } from 'lucide-react';
import { deleteAnnouncementAction } from '@/app/actions/portal';

export function DeleteAnnouncementButton({ id, label }: { id: string; label: string }) {
  return (
    <form action={deleteAnnouncementAction}>
      <input type="hidden" name="announcementId" value={id} />
      <button
        type="submit"
        aria-label={label}
        title={label}
        className="grid h-8 w-8 place-items-center rounded-control text-mauve transition hover:bg-danger-soft hover:text-danger-ink"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />
      </button>
    </form>
  );
}
