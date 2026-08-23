import type { Metadata } from 'next';
import { updateSettingAction } from '@/app/actions/portal';
import { Card, CardHeader, PageHeader } from '@/components/ui';
import { requirePermission } from '@/lib/auth/current-user';
import { getSettings } from '@/lib/db/queries';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Club settings' };

const TOGGLES = ['idea_voting_enabled', 'event_registration_requires_approval'];

export default async function ClubSettingsPage() {
  await requirePermission('settings:write', '/portal/admin/club-settings');
  const { d } = await getT();
  const settings = await getSettings();

  const textKeys = Object.keys(settings).filter((key) => !TOGGLES.includes(key));

  return (
    <>
      <PageHeader
        eyebrow={d.nav.groupAdmin}
        title={d.admin.clubSettings}
        subtitle={d.admin.clubSettingsSubtitle}
      />

      <div className="grid max-w-3xl gap-6">
        <Card>
          <CardHeader title={d.common.enabled} />
          <div className="grid gap-4 p-6 pt-4">
            {TOGGLES.map((key) => (
              <form
                key={key}
                action={updateSettingAction}
                className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-line bg-blush px-4 py-3"
              >
                <input type="hidden" name="key" value={key} />
                <input type="hidden" name="value" value={settings[key] === 'true' ? 'false' : 'true'} />
                <span className="min-w-0">
                  <span className="block font-mono text-caption text-ink-muted" dir="ltr">
                    {key}
                  </span>
                  <span className="block text-small font-semibold text-plum">
                    {settings[key] === 'true' ? d.common.enabled : d.common.disabled}
                  </span>
                </span>
                <button type="submit" className="btn btn-outline btn-sm">
                  {settings[key] === 'true' ? d.common.disabled : d.common.enabled}
                </button>
              </form>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title={d.admin.clubSettings} />
          <div className="grid gap-4 p-6 pt-4">
            {textKeys.map((key) => (
              <form key={key} action={updateSettingAction} className="grid gap-2 sm:grid-cols-[1fr_2fr_auto] sm:items-end">
                <input type="hidden" name="key" value={key} />
                <label className="field-label" htmlFor={`setting-${key}`} dir="ltr">
                  {key}
                </label>
                <input
                  id={`setting-${key}`}
                  name="value"
                  defaultValue={settings[key]}
                  className="field-input"
                />
                <button type="submit" className="btn btn-primary">
                  {d.common.save}
                </button>
              </form>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
