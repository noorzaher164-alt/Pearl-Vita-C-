'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  if (!mounted) {
    return <span className={cn('btn btn-icon btn-ghost btn-sm', className)} />;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn('btn btn-icon btn-ghost btn-sm', className)}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? (
        <Sun className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.75} />
      ) : (
        <Moon className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.75} />
      )}
    </button>
  );
}
