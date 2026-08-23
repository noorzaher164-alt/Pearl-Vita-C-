'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PublicNav({
  links,
  label,
  openLabel,
  closeLabel,
}: {
  links: { href: string; label: string }[];
  label: string;
  openLabel: string;
  closeLabel: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <nav aria-label={label} className="hidden lg:block">
        <ul className="flex items-center gap-1">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={cn(
                  'rounded-control px-3 py-2 text-small font-medium transition',
                  isActive(link.href)
                    ? 'bg-blush text-plum'
                    : 'text-ink-muted hover:bg-blush hover:text-plum',
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? closeLabel : openLabel}
        className="btn btn-ghost btn-icon ms-auto lg:hidden"
      >
        {open ? (
          <X className="h-5 w-5" aria-hidden="true" strokeWidth={1.75} />
        ) : (
          <Menu className="h-5 w-5" aria-hidden="true" strokeWidth={1.75} />
        )}
      </button>

      {open ? (
        <nav
          aria-label={label}
          className="absolute inset-x-0 top-full border-b border-line bg-ivory p-4 shadow-card lg:hidden"
        >
          <ul className="grid gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  className={cn(
                    'block rounded-control px-4 py-3 text-small font-medium transition',
                    isActive(link.href) ? 'bg-plum text-white' : 'text-ink-muted hover:bg-blush',
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </>
  );
}
