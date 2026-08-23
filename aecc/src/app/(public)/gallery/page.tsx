import type { Metadata } from 'next';
import Link from 'next/link';
import { SparkRule } from '@/components/brand/Motifs';
import { Card, EmptyState, Pill } from '@/components/ui';
import { listAlbums } from '@/lib/db/queries';
import { fill, formatDate, formatNumber, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Gallery' };

export default async function PublicGalleryPage() {
  const { locale, d } = await getT();
  const albums = await listAlbums(true);

  return (
    <>
      <section className="border-b border-line bg-blush py-16 text-center md:py-20">
        <div className="shell">
          <p className="eyebrow">{d.brand.fullName}</p>
          <h1 className="mt-3 font-brand text-h1 text-plum md:text-hero">{d.publicSite.galleryTitle}</h1>
          <p className="mx-auto mt-5 max-w-xl text-body text-ink-muted">{d.gallery.subtitle}</p>
          <SparkRule className="mx-auto mt-8 max-w-xs" />
        </div>
      </section>

      <section className="shell py-16 md:py-20">
        {albums.length === 0 ? (
          <EmptyState title={d.gallery.noAlbums} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album) => (
              <Card as="article" key={album.id} className="overflow-hidden">
                <Link href={`/gallery/${album.slug}`} className="group block">
                  <div className="aspect-[4/3] bg-blush">
                    {album.cover_image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={album.cover_image}
                        alt=""
                        className="h-full w-full object-cover transition duration-slow group-hover:scale-[1.02]"
                        aria-hidden="true"
                      />
                    ) : null}
                  </div>
                  <div className="p-6">
                    <Pill tone="soft">
                      {fill(d.gallery.photoCount, { count: formatNumber(album.images.length, locale) })}
                    </Pill>
                    <h2 className="mt-3 font-brand text-h3 text-plum">
                      {pick(locale, album as unknown as Record<string, unknown>, 'title')}
                    </h2>
                    <p className="mt-1 text-small text-ink-muted">
                      {pick(locale, album as unknown as Record<string, unknown>, 'description')}
                    </p>
                    <p className="mt-3 text-caption text-ink-faint">
                      {formatDate(album.created_at, locale)}
                    </p>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
