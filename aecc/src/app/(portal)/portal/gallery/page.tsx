import type { Metadata } from 'next';
import Link from 'next/link';
import { Images } from 'lucide-react';
import { Card, EmptyState, PageHeader, Pill } from '@/components/ui';
import { requirePermission } from '@/lib/auth/current-user';
import { listAlbums } from '@/lib/db/queries';
import { fill, formatDate, formatNumber, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Gallery' };

export default async function GalleryPage() {
  await requirePermission('gallery:read', '/portal/gallery');
  const { locale, d } = await getT();
  const albums = await listAlbums();

  return (
    <>
      <PageHeader eyebrow={d.brand.fullName} title={d.gallery.title} subtitle={d.gallery.subtitle} />

      {albums.length === 0 ? (
        <EmptyState icon={<Images />} title={d.gallery.noAlbums} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <Card as="article" key={album.id} className="overflow-hidden">
              <Link href={`/portal/gallery/${album.slug}`} className="block">
                <div className="aspect-[4/3] bg-blush">
                  {album.cover_image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={album.cover_image} alt="" className="h-full w-full object-cover" aria-hidden="true" />
                  ) : null}
                </div>
                <div className="p-5">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Pill tone={album.is_public ? 'success' : 'soft'}>
                      {album.is_public ? d.gallery.publicAlbum : d.gallery.privateAlbum}
                    </Pill>
                    <Pill tone="soft">
                      {fill(d.gallery.photoCount, { count: formatNumber(album.images.length, locale) })}
                    </Pill>
                  </div>
                  <h2 className="font-brand text-h3 text-plum">
                    {pick(locale, album as unknown as Record<string, unknown>, 'title')}
                  </h2>
                  <p className="mt-1 text-caption text-ink-muted">
                    {formatDate(album.created_at, locale)}
                  </p>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
