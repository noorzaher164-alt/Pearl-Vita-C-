import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Logo } from '@/components/brand/Logo';
import { ChemistryField, SparkRule } from '@/components/brand/Motifs';
import { getT } from '@/lib/i18n/server';

/**
 * The authentication shell.
 *
 * An editorial ivory/blush screen carrying the approved logo and restrained chemistry
 * line art — deliberately not a generic centred SaaS card on a grey page.
 */
export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const { locale, d } = await getT();

  return (
    <div className="relative flex min-h-dvh flex-col lg:flex-row">
      {/* Editorial panel */}
      <section className="relative hidden overflow-hidden bg-plum-veil lg:flex lg:w-[46%] lg:flex-col lg:justify-between lg:p-12">
        <ChemistryField className="opacity-[0.55]" />

        <Link href="/" className="relative z-10 inline-flex items-center gap-2 text-caption text-rose-soft transition hover:text-white">
          <ArrowLeft className="h-4 w-4 rtl-flip" aria-hidden="true" strokeWidth={1.75} />
          {d.publicSite.home}
        </Link>

        <div className="relative z-10 max-w-md">
          <p className="eyebrow text-rose-soft/80">{d.publicSite.heroKicker}</p>
          <h2 className="mt-4 font-brand text-hero text-ivory">{d.brand.fullName}</h2>
          <p className="tagline mt-3 text-[1.0625rem] text-rose-soft">{d.brand.tagline}</p>
          <div className="mt-8 h-px w-40 bg-gold-rule" />
          <p className="mt-8 max-w-sm text-small leading-relaxed text-rose-soft/90">
            {d.publicSite.aboutBody}
          </p>
        </div>

        <p className="relative z-10 text-caption text-rose-soft/70">
          {d.brand.school} · {d.brand.year}
        </p>
      </section>

      {/* Form panel */}
      <section className="relative flex flex-1 flex-col bg-ivory">
        <header className="flex items-center justify-between gap-3 px-6 py-5 md:px-10">
          <Link href="/" className="lg:hidden">
            <Logo locale={locale} size={40} alt={d.a11y.logoAlt} />
          </Link>
          <div className="ms-auto">
            <LanguageSwitcher locale={locale} d={d} />
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center px-6 pb-16 md:px-10">
          <div className="w-full max-w-[26rem]">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-6 w-fit">
                <Logo locale={locale} size={132} variant="md" alt={d.a11y.logoAlt} priority />
              </div>
              <SparkRule className="mx-auto mb-6 w-40" />
            </div>
            {children}
          </div>
        </main>

        <footer className="px-6 pb-8 text-center text-caption text-ink-faint md:px-10">
          <span className="tagline">{d.brand.tagline}</span>
        </footer>
      </section>
    </div>
  );
}
