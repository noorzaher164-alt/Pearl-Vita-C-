import Link from 'next/link';
import { LogIn } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Logo, LogoLockup } from '@/components/brand/Logo';
import { SparkRule } from '@/components/brand/Motifs';
import { PublicNav } from '@/components/public/PublicNav';
import { ThemeToggle } from '@/components/ThemeToggle';
import { currentViewer } from '@/lib/auth/current-user';
import { getT } from '@/lib/i18n/server';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const { locale, d } = await getT();
  const viewer = await currentViewer();

  const links = [
    { href: '/', label: d.publicSite.home },
    { href: '/about', label: d.publicSite.about },
    { href: '/activities', label: d.publicSite.clubLife },
    { href: '/magazine', label: d.publicSite.magazine },
    { href: '/gallery', label: d.publicSite.gallery },
  ];

  return (
    <div className="flex min-h-dvh flex-col bg-ivory">
      <a
        href="#public-main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-[60] focus:rounded-control focus:bg-plum-accent focus:px-4 focus:py-2 focus:text-small focus:text-white"
      >
        {d.a11y.skipToContent}
      </a>

      <header className="sticky top-0 z-40 border-b border-line bg-blush/85 backdrop-blur-md">
        <div className="shell flex items-center gap-4 py-3">
          <Link href="/" className="shrink-0">
            <LogoLockup
              locale={locale}
              alt={d.a11y.logoAlt}
              title={d.brand.name}
              subtitle={d.brand.school}
              size={56}
            />
          </Link>

          <PublicNav links={links} label={d.a11y.mainNavigation} openLabel={d.a11y.openMenu} closeLabel={d.a11y.closeMenu} />

          <div className="ms-auto flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher locale={locale} d={d} className="hidden sm:inline-flex" />
            <Link href={viewer ? '/portal' : '/login'} className="btn btn-primary btn-sm">
              <LogIn className="h-4 w-4 rtl-flip" aria-hidden="true" strokeWidth={1.75} />
              <span className="hidden sm:inline">
                {viewer ? d.nav.backToPortal : d.publicSite.memberLogin}
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main id="public-main" className="page-enter flex-1">
        {children}
      </main>

      <footer className="mt-20 border-t border-line bg-blush">
        <div className="shell py-14">
          <div className="grid gap-10 md:grid-cols-[auto_1fr_1fr]">
            <div>
              <Logo locale={locale} size={92} alt={d.a11y.logoAlt} />
              <p className="tagline mt-4 text-small">{d.brand.tagline}</p>
            </div>

            <nav aria-label={d.a11y.mainNavigation}>
              <h2 className="eyebrow mb-4">{d.publicSite.home}</h2>
              <ul className="grid gap-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-small text-ink-muted transition hover:text-plum"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <h2 className="eyebrow mb-4">{d.publicSite.contact}</h2>
              <p className="max-w-xs text-small leading-relaxed text-ink-muted">
                {d.publicSite.joinBody}
              </p>
              <p className="mt-4 text-caption text-ink-faint">{d.publicSite.privacyNote}</p>
            </div>
          </div>

          <SparkRule className="my-10" />

          <div className="flex flex-wrap items-center justify-between gap-3 text-caption text-ink-faint">
            <span>
              © {new Date().getFullYear()} {d.publicSite.footerBuiltFor}. {d.publicSite.footerRights}
            </span>
            <span>{d.brand.year}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
