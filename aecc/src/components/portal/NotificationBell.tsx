'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { markNotificationReadAction, markAllNotificationsReadAction } from '@/app/actions/portal';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

export function NotificationBell({
  notifications,
  unreadCount,
  labels,
}: {
  notifications: NotificationItem[];
  unreadCount: number;
  labels: { title: string; empty: string; markAllRead: string };
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative grid h-10 w-10 place-items-center rounded-pill border border-line bg-surface transition hover:border-rose"
        aria-label={labels.title}
        aria-expanded={open}
      >
        <Bell className="h-[18px] w-[18px] text-plum" aria-hidden="true" strokeWidth={1.75} />
        {unreadCount > 0 && (
          <span className="absolute -end-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-pill bg-rose px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 top-full z-50 mt-2 w-80 rounded-card border border-line bg-surface shadow-lg">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h3 className="text-small font-semibold text-plum">{labels.title}</h3>
            {unreadCount > 0 && (
              <form action={markAllNotificationsReadAction}>
                <button
                  type="submit"
                  className="flex items-center gap-1 text-caption text-rose transition hover:text-plum"
                  onClick={() => setOpen(false)}
                >
                  <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  {labels.markAllRead}
                </button>
              </form>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-caption text-ink-faint">{labels.empty}</p>
            ) : (
              <ul>
                {notifications.slice(0, 20).map((n) => (
                  <li key={n.id} className={cn('border-b border-line last:border-0', !n.read && 'bg-blush')}>
                    <div className="flex items-start gap-3 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-small font-medium text-plum">{n.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-caption text-ink-muted">{n.body}</p>
                        <p className="mt-1 text-[10px] text-ink-faint">
                          {new Date(n.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        {n.link && (
                          <Link
                            href={n.link}
                            onClick={() => setOpen(false)}
                            className="text-caption text-rose transition hover:text-plum"
                          >
                            &rarr;
                          </Link>
                        )}
                        {!n.read && (
                          <form action={markNotificationReadAction}>
                            <input type="hidden" name="notificationId" value={n.id} />
                            <button
                              type="submit"
                              className="grid h-6 w-6 place-items-center rounded-pill text-ink-faint transition hover:bg-blush hover:text-plum"
                              title="Mark read"
                            >
                              <Check className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
