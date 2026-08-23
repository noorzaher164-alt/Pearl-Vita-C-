import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { SparkRule } from '@/components/brand/Motifs';
import { getAlbum } from '@/lib/db/queries';
import { fill, formatNumber, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Album' };

export default async function PublicAlbumPage({ params }: { params: Promise<{ slug: string }> }) {
  const { locale, d } = await getT();
  const { slug } = await params;

  // Private albums are never reachable from the public site.
  const album = await getAlbum(slug, true);
  if (!album) notFound();

  return (
    <div className="shell py-12 md:py-16">
      <Link
        href="/gallery"
        className="mb-6 inline-flex items-center gap-2 text-small font-semibold text-plum transition hover:text-plum-dark"
      >
        <ArrowLeft className="h-4 w-4 rtl-flip" aria-hidden="true" strokeWidth={1.75} />
        {d.gallery.backToAlbums}
      </Link>

      <header className="mb-10">
        <p className="eyebrow mb-3">{d.publicSite.gallery}</p>
        <h1 className="font-brand text-h1 text-plum">
          {pick(locale, album as unknown as Record<string, unknown>, 'title')}
        </h1>
        <p className="mt-2 max-w-prose text-body text-ink-muted">
          {pick(locale, album as unknown as Record<string, unknown>, 'description')}
        </p>
        <p className="mt-3 text-caption text-ink-faint">
          {fill(d.gallery.photoCount, { count: formatNumber(album.images.length, locale) })}
        </p>
        <SparkRule className="mt-8" />
      </header>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {album.images.map((image) => (
          <li key={image.id}>
            <figure className="overflow-hidden rounded-card border border-line bg-white shadow-card">
              <div className="aspect-[4/3] bg-blush">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={pick(locale, image as unknown as Record<string, unknown>, 'caption')}
                  className="h-full w-full object-cover"
                />
              </div>
              <figcaption className="px-4 py-3 text-caption text-ink-muted">
                {pick(locale, image as unknown as Record<string, unknown>, 'caption')}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}
