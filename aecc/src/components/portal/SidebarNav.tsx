'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { activeNavKey, type NavGroup } from '@/lib/navigation';
import { NavIcon } from './NavIcon';

/**
 * The navigation list itself. It is a client component only so the active route can
 * be highlighted; the item set is decided on the server and passed in already
 * filtered by permission.
 */
export function SidebarNav({
  groups,
  label,
  onNavigate,
  tone = 'plum',
}: {
  groups: NavGroup[];
  label: string;
  onNavigate?: () => void;
  tone?: 'plum' | 'light';
}) {
  const pathname = usePathname();
  const active = activeNavKey(pathname, groups);

  return (
    <nav aria-label={label} className="flex flex-col gap-5">
      {groups.map((group) => (
        <div key={group.key}>
          <p
            className={cn(
              'mb-2 px-3 text-[0.625rem] font-bold uppercase tracking-[0.18em]',
              tone === 'plum' ? 'text-rose-soft/70' : 'text-mauve',
            )}
          >
            {group.label}
          </p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const isActive = item.key === active;
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'group flex items-center gap-3 rounded-control px-3 py-2 text-small font-medium transition',
                      tone === 'plum'
                        ? isActive
                          ? 'bg-ivory text-plum shadow-soft'
                          : 'text-rose-soft hover:bg-white/10 hover:text-white'
                        : isActive
                          ? 'bg-plum text-white'
                          : 'text-ink-muted hover:bg-blush hover:text-plum',
                    )}
                  >
                    <NavIcon
                      name={item.icon}
                      className={cn(
                        'h-[18px] w-[18px] shrink-0',
                        tone === 'plum'
                          ? isActive
                            ? 'text-rose'
                            : 'text-rose-soft/80 group-hover:text-white'
                          : isActive
                            ? 'text-white'
                            : 'text-mauve group-hover:text-plum',
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
