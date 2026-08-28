import Link from 'next/link';
import { ClipboardList, ExternalLink, LogOut, Settings, UserRound } from 'lucide-react';
import { logout } from '@/app/actions/auth';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { LogoLockup } from '@/components/brand/Logo';
import { MobileNav } from '@/components/portal/MobileNav';
import { NotificationBell } from '@/components/portal/NotificationBell';
import { SidebarNav } from '@/components/portal/SidebarNav';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Avatar, Pill } from '@/components/ui';
import { requireViewer } from '@/lib/auth/current-user';
import { listNotifications, countUnreadNotifications, countOpenTasks } from '@/lib/db/queries';
import { roleLabel, roleTone } from '@/lib/domain/labels';
import { getT } from '@/lib/i18n/server';
import { navigationFor } from '@/lib/navigation';
import { pick } from '@/lib/i18n';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const viewer = await requireViewer('/portal');
  const { locale, d } = await getT();
  const groups = navigationFor(viewer.role, d);
  const displayName = pick(locale, viewer as unknown as Record<string, unknown>, 'full_name');
  const [rawNotifications, unreadCount, openTaskCount] = await Promise.all([
    listNotifications(viewer.id),
    countUnreadNotifications(viewer.id),
    countOpenTasks(viewer.id),
  ]);
  const notifications = rawNotifications.slice(0, 20).map((n) => ({
    id: n.id,
    title: locale === 'ar' ? n.title_ar : n.title_en,
    body: locale === 'ar' ? n.body_ar : n.body_en,
    link: n.link,
    read: n.read,
    created_at: n.created_at,
  }));

  const brandLockup = (
    <LogoLockup
      locale={locale}
      alt={d.a11y.logoAlt}
      title={d.brand.name}
      subtitle={d.brand.school}
      tone="ivory"
      size={42}
    />
  );

  const accountBlock = (
    <Link
      href="/portal/profile"
      className="flex items-center gap-3 rounded-control p-2 transition hover:bg-white/10"
    >
      <Avatar name={displayName} src={viewer.avatar_url} size={38} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-small font-semibold text-white">{displayName}</span>
        <span className="block truncate text-caption text-rose-soft">
          {roleLabel(viewer.role, d)}
        </span>
      </span>
    </Link>
  );

  return (
    <div className="flex min-h-dvh flex-col bg-ivory lg:flex-row">
      <a
        href="#portal-main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-[60] focus:rounded-control focus:bg-plum-accent focus:px-4 focus:py-2 focus:text-small focus:text-white"
      >
        {d.a11y.skipToContent}
      </a>

      {/* Persistent desktop sidebar — 264px per the layout tokens. */}
      <aside className="sticky top-0 hidden h-dvh w-66 shrink-0 flex-col bg-plum-veil lg:flex">
        <div className="p-5">
          <Link href="/portal" className="block rounded-control">
            {brandLockup}
          </Link>
        </div>
        <div className="mx-5 h-px bg-white/10" />
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <SidebarNav groups={groups} label={d.a11y.mainNavigation} />
        </div>
        <div className="border-t border-white/10 p-3">
          {accountBlock}
          <div className="mt-1 grid gap-0.5">
            <Link
              href="/portal/settings"
              className="flex items-center gap-3 rounded-control px-3 py-2 text-small text-rose-soft transition hover:bg-white/10 hover:text-white"
            >
              <Settings className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.75} />
              {d.nav.settings}
            </Link>
            <Link
              href="/"
              className="flex items-center gap-3 rounded-control px-3 py-2 text-small text-rose-soft transition hover:bg-white/10 hover:text-white"
            >
              <ExternalLink className="h-[18px] w-[18px] rtl-flip" aria-hidden="true" strokeWidth={1.75} />
              {d.nav.viewPublicSite}
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-control px-3 py-2 text-start text-small text-rose-soft transition hover:bg-white/10 hover:text-white"
              >
                <LogOut className="h-[18px] w-[18px] rtl-flip" aria-hidden="true" strokeWidth={1.75} />
                {d.nav.signOut}
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-40 border-b border-line bg-ivory/85 backdrop-blur-md">
          <div className="flex items-center gap-3 px-4 py-3 md:px-8">
            <MobileNav
              groups={groups}
              navLabel={d.a11y.mainNavigation}
              openLabel={d.a11y.openMenu}
              closeLabel={d.a11y.closeMenu}
              header={brandLockup}
              footer={
                <form action={logout}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-3 rounded-control px-3 py-2 text-start text-small text-rose-soft transition hover:bg-white/10 hover:text-white"
                  >
                    <LogOut className="h-[18px] w-[18px] rtl-flip" aria-hidden="true" strokeWidth={1.75} />
                    {d.nav.signOut}
                  </button>
                </form>
              }
            />

            <Link href="/portal" className="flex items-center gap-2 lg:hidden">
              <LogoLockup locale={locale} alt={d.a11y.logoAlt} title={d.brand.name} size={34} />
            </Link>

            <div className="ms-auto flex items-center gap-2">
              <Pill tone={roleTone(viewer.role)} className="hidden sm:inline-flex">
                {roleLabel(viewer.role, d)}
              </Pill>
              <Link
                href="/portal/tasks"
                className="relative grid h-10 w-10 place-items-center rounded-pill border border-line bg-surface transition hover:border-rose"
                aria-label={d.nav.tasks}
              >
                <ClipboardList className="h-[18px] w-[18px] text-plum" aria-hidden="true" strokeWidth={1.75} />
                {openTaskCount > 0 && (
                  <span className="absolute -end-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-pill bg-plum px-1 text-[10px] font-bold text-white">
                    {openTaskCount > 99 ? '99+' : openTaskCount}
                  </span>
                )}
              </Link>
              <NotificationBell
                notifications={notifications}
                unreadCount={unreadCount}
                labels={{
                  title: d.settings.notifications,
                  empty: d.settings.noNotifications,
                  markAllRead: d.settings.markAllRead,
                }}
              />
              <ThemeToggle />
              <LanguageSwitcher locale={locale} d={d} />
              <Link
                href="/portal/profile"
                className="grid h-10 w-10 place-items-center rounded-pill border border-line bg-surface transition hover:border-rose lg:hidden"
                aria-label={d.nav.profile}
              >
                <UserRound className="h-[18px] w-[18px] text-plum" aria-hidden="true" strokeWidth={1.75} />
              </Link>
            </div>
          </div>
        </header>

        <main id="portal-main" className="flex-1 px-4 py-8 md:px-8 md:py-10">
          <div className="page-enter mx-auto w-full max-w-shell">{children}</div>
        </main>

        <footer className="border-t border-line px-4 py-6 text-caption text-ink-faint md:px-8">
          <div className="mx-auto flex max-w-shell flex-wrap items-center justify-between gap-2">
            <span>
              {d.brand.fullName} · {d.brand.year}
            </span>
            <span className="tagline">{d.brand.tagline}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
