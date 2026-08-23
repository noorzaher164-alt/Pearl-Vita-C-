import type { Metadata } from 'next';
import { Megaphone, Plus } from 'lucide-react';
import { AnnouncementCard } from '@/components/portal/Common';
import { DeleteAnnouncementButton } from '@/components/forms/DeleteAnnouncementButton';
import { EmptyState, LinkButton, PageHeader } from '@/components/ui';
import { requirePermission } from '@/lib/auth/current-user';
import { listAnnouncements } from '@/lib/db/queries';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Announcements' };

export default async function AnnouncementsPage() {
  const viewer = await requirePermission('announcements:read', '/portal/announcements');
  const { locale, d } = await getT();

  const announcements = await listAnnouncements({
    id: viewer.id,
    role: viewer.role,
    committeeId: viewer.committee_id,
  });

  const canWrite = viewer.permissions.can('announcements:write');

  return (
    <>
      <PageHeader
        eyebrow={d.brand.fullName}
        title={d.announcements.title}
        subtitle={d.announcements.subtitle}
        actions={
          canWrite ? (
            <LinkButton href="/portal/announcements/new">
              <Plus className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.75} />
              {d.announcements.create}
            </LinkButton>
          ) : null
        }
      />

      {announcements.length === 0 ? (
        <EmptyState icon={<Megaphone />} title={d.announcements.noAnnouncements} />
      ) : (
        <div className="grid gap-4">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="relative">
              <AnnouncementCard announcement={announcement} locale={locale} d={d} />
              {canWrite ? (
                <div className="absolute end-4 top-4">
                  <DeleteAnnouncementButton id={announcement.id} label={d.common.delete} />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
