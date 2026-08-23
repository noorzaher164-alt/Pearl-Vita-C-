import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ArticleForm } from '@/components/forms/ArticleForm';
import { PageHeader } from '@/components/ui';
import { requirePermission } from '@/lib/auth/current-user';
import { listCategories } from '@/lib/db/queries';
import { pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'New article' };

export default async function NewArticlePage() {
  await requirePermission('magazine:write', '/portal/magazine/new');
  const { locale, d } = await getT();
  const categories = await listCategories();

  return (
    <>
      <Link
        href="/portal/magazine"
        className="mb-6 inline-flex items-center gap-2 text-small font-semibold text-plum transition hover:text-plum-dark"
      >
        <ArrowLeft className="h-4 w-4 rtl-flip" aria-hidden="true" strokeWidth={1.75} />
        {d.magazine.editorial}
      </Link>
      <PageHeader eyebrow={d.magazine.title} title={d.magazine.newArticle} />
      <ArticleForm
        d={d}
        categories={categories.map((c) => ({
          id: c.id,
          name: pick(locale, c as unknown as Record<string, unknown>, 'name'),
        }))}
      />
    </>
  );
}
