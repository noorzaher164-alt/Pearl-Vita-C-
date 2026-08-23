'use client';

import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import type { NavGroup } from '@/lib/navigation';
import { SidebarNav } from './SidebarNav';

/**
 * Drawer navigation for tablet and mobile (guide §11 / brief §35).
 *
 * Keyboard behaviour is deliberate: the drawer traps nothing the user cannot escape —
 * Escape closes it, focus moves into the panel on open and returns to the trigger on
 * close, and background scrolling is locked while it is open.
 */
export function MobileNav({
  groups,
  navLabel,
  openLabel,
  closeLabel,
  header,
  footer,
}: {
  groups: NavGroup[];
  navLabel: string;
  openLabel: string;
  closeLabel: string;
  header: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // A route change always closes the drawer.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={openLabel}
        aria-expanded={open}
        className="btn btn-ghost btn-icon lg:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label={closeLabel}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-plum-dark/40 backdrop-blur-[2px] animate-fade-in"
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={navLabel}
            tabIndex={-1}
            className="absolute inset-y-0 start-0 flex w-[min(304px,86vw)] flex-col bg-plum-veil shadow-lift animate-fade-in focus:outline-none"
          >
            <div className="flex items-start justify-between gap-3 border-b border-white/10 p-4">
              {header}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={closeLabel}
                className="btn btn-icon shrink-0 text-rose-soft hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <SidebarNav groups={groups} label={navLabel} onNavigate={() => setOpen(false)} />
            </div>
            {footer ? <div className="border-t border-white/10 p-4">{footer}</div> : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
