import type { Metadata } from 'next';
import { FileText, Library, Lock, Presentation, Sheet } from 'lucide-react';
import { memberName } from '@/components/portal/Common';
import { ResourceForm } from '@/components/forms/ResourceForm';
import { Card, EmptyState, LinkTabs, Meta, PageHeader, Pill } from '@/components/ui';
import { requirePermission } from '@/lib/auth/current-user';
import { listMembers, listResources } from '@/lib/db/queries';
import { resourceCategory } from '@/lib/domain/labels';
import { formatDate, formatNumber, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Resources' };

const CATEGORIES = ['safety', 'experiments', 'research', 'competitions', 'policies', 'presentations'];

function kindIcon(kind: string) {
  if (kind === 'slides') return <Presentation className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />;
  if (kind === 'sheet') return <Sheet className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />;
  return <FileText className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />;
}

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const viewer = await requirePermission('resources:read', '/portal/resources');
  const { locale, d } = await getT();
  const params = await searchParams;

  // The query filters by the viewer's role, so restricted documents never reach a
  // member's response payload in the first place.
  const [all, members] = await Promise.all([
    listResources(viewer.role),
    listMembers({ studentsOnly: false }),
  ]);

  const active = params.category ?? 'all';
  const shown = active === 'all' ? all : all.filter((r) => r.category === active);
  const memberById = new Map(members.map((m) => [m.id, m]));
  const canWrite = viewer.permissions.can('resources:write');

  return (
    <>
      <PageHeader eyebrow={d.brand.fullName} title={d.resources.title} subtitle={d.resources.subtitle} />

      <LinkTabs
        className="mb-6"
        activeKey={active}
        items={[
          { key: 'all', label: d.common.all, href: '/portal/resources', count: all.length },
          ...CATEGORIES.map((category) => ({
            key: category,
            label: resourceCategory(category, d),
            href: `/portal/resources?category=${category}`,
            count: all.filter((r) => r.category === category).length,
          })),
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className={canWrite ? 'lg:col-span-2' : 'lg:col-span-3'}>
          {shown.length === 0 ? (
            <EmptyState icon={<Library />} title={d.resources.noResources} />
          ) : (
            <ul className="grid gap-3">
              {shown.map((resource) => (
                <Card as="li" key={resource.id} className="p-5">
                  <div className="flex flex-wrap items-start gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-blush text-plum">
                      {kindIcon(resource.file_kind)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-brand text-[1.0625rem] text-plum">
                        {pick(locale, resource as unknown as Record<string, unknown>, 'title')}
                      </h2>
                      <p className="mt-1 text-small text-ink-muted">
                        {pick(locale, resource as unknown as Record<string, unknown>, 'description')}
                      </p>
                      <Meta
                        className="mt-3"
                        items={[
                          resourceCategory(resource.category, d),
                          resource.file_kind.toUpperCase(),
                          resource.size_kb > 0
                            ? `${formatNumber(resource.size_kb, locale)} KB`
                            : null,
                          `${d.resources.uploadedBy} ${memberName(memberById.get(resource.uploaded_by) ?? null, locale)}`,
                          formatDate(resource.uploaded_at, locale),
                        ]}
                      />
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {resource.visibility !== 'all' ? (
                        <Pill tone="warning" icon={<Lock />}>
                          {resource.visibility === 'leaders'
                            ? d.resources.visibilityLeaders
                            : d.resources.visibilityAdmin}
                        </Pill>
                      ) : null}
                      <a
                        href={resource.file_url}
                        className="btn btn-outline btn-sm"
                        target={resource.file_url.startsWith('http') ? '_blank' : undefined}
                        rel="noopener noreferrer"
                      >
                        {d.resources.openFile}
                      </a>
                    </div>
                  </div>
                </Card>
              ))}
            </ul>
          )}
        </div>

        {canWrite ? (
          <div>
            <ResourceForm d={d} />
          </div>
        ) : null}
      </div>
    </>
  );
}
