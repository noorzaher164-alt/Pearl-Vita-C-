import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { SparkRule } from '@/components/brand/Motifs';
import { getT } from '@/lib/i18n/server';

export default async function NotFound() {
  const { locale, d } = await getT();
  return (
    <main className="grid min-h-dvh place-items-center bg-ivory px-6 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto w-fit">
          <Logo locale={locale} size={104} alt={d.a11y.logoAlt} />
        </div>
        <SparkRule className="mx-auto my-6 w-40" />
        <h1 className="font-brand text-h1 text-plum">{d.errors.notFoundTitle}</h1>
        <p className="mt-3 text-body text-ink-muted">{d.errors.notFoundBody}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-primary">
            {d.errors.goHome}
          </Link>
          <Link href="/portal" className="btn btn-outline">
            {d.errors.goDashboard}
          </Link>
        </div>
      </div>
    </main>
  );
}
