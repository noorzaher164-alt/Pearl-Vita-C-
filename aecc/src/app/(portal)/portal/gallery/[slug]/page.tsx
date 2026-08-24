import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { EmptyState, PageHeader, Pill } from '@/components/ui';
import { requirePermission } from '@/lib/auth/current-user';
import { getAlbum } from '@/lib/db/queries';
import { fill, formatNumber, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Album' };

export default async function AlbumPage({ params }: { params: Promise<{ slug: string }> }) {
  await requirePermission('gallery:read');
  const { locale, d } = await getT();
  const { slug } = await params;

  const album = await getAlbum(slug);
  if (!album) notFound();

  return (
    <>
      <Link
        href="/portal/gallery"
        className="mb-6 inline-flex items-center gap-2 text-small font-semibold text-plum transition hover:text-plum-dark"
      >
        <ArrowLeft className="h-4 w-4 rtl-flip" aria-hidden="true" strokeWidth={1.75} />
        {d.gallery.backToAlbums}
      </Link>

      <PageHeader
        eyebrow={
          <Pill tone={album.is_public ? 'success' : 'soft'}>
            {album.is_public ? d.gallery.publicAlbum : d.gallery.privateAlbum}
          </Pill>
        }
        title={pick(locale, album as unknown as Record<string, unknown>, 'title')}
        subtitle={pick(locale, album as unknown as Record<string, unknown>, 'description')}
      />

      {album.images.length === 0 ? (
        <EmptyState title={d.gallery.noPhotos} />
      ) : (
        <>
          <p className="mb-4 text-small text-ink-muted">
            {fill(d.gallery.photoCount, { count: formatNumber(album.images.length, locale) })}
          </p>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {album.images.map((image) => (
              <li key={image.id}>
                <figure className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
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
        </>
      )}
    </>
  );
}
