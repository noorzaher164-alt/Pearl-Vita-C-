import type { Metadata } from 'next';
import { ChangePasswordForm } from '@/components/forms/ChangePasswordForm';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Card, CardHeader, PageHeader, Stat } from '@/components/ui';
import { requireViewer } from '@/lib/auth/current-user';
import { roleLabel } from '@/lib/domain/labels';
import { formatDate } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const viewer = await requireViewer('/portal/settings');
  const { locale, d } = await getT();

  return (
    <>
      <PageHeader eyebrow={d.brand.fullName} title={d.settings.title} subtitle={d.settings.subtitle} />

      <div className="grid max-w-3xl gap-6">
        <Card>
          <CardHeader title={d.settings.languageSection} subtitle={d.settings.languageHint} />
          <div className="p-6 pt-4">
            <LanguageSwitcher locale={locale} d={d} />
          </div>
        </Card>

        <Card>
          <CardHeader title={d.settings.accountSection} />
          <dl className="grid gap-4 p-6 pt-4 sm:grid-cols-2">
            <Stat label={d.members.username} value={<span dir="ltr">{viewer.username}</span>} />
            <Stat label={d.members.email} value={<span dir="ltr">{viewer.email}</span>} />
            <Stat label={d.common.role} value={roleLabel(viewer.role, d)} />
            <Stat label={d.auth.memberSince} value={formatDate(viewer.joined_at, locale)} />
          </dl>
        </Card>

        <ChangePasswordForm d={d} />

        <Card>
          <CardHeader title={d.settings.notifications} />
          <div className="grid gap-3 p-6 pt-4">
            {[d.settings.notifyEvents, d.settings.notifyPoints, d.settings.notifyMagazine].map(
              (label) => (
                <label key={label} className="flex cursor-pointer items-center gap-3 text-small text-ink">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded-[4px] border-line-strong accent-[#48132F]"
                  />
                  {label}
                </label>
              ),
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
