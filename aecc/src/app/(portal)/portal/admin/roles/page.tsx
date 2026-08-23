import type { Metadata } from 'next';
import { Check, Minus, ShieldCheck } from 'lucide-react';
import { Card, InlineAlert, PageHeader, Pill, TableShell } from '@/components/ui';
import { requirePermission } from '@/lib/auth/current-user';
import { ALL_PERMISSIONS, ROLES, ROLE_ORDER, can } from '@/lib/auth/rbac';
import { roleLabel, roleTone } from '@/lib/domain/labels';
import { fill, formatNumber } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Roles & permissions' };

export default async function RolesPage() {
  await requirePermission('users:admin', '/portal/admin/roles');
  const { locale, d } = await getT();

  return (
    <>
      <PageHeader eyebrow={d.nav.groupAdmin} title={d.admin.roles} subtitle={d.admin.rolesSubtitle} />

      <div className="mb-6">
        <InlineAlert tone="info" icon={<ShieldCheck />} title={d.admin.rolesSubtitle}>
          {d.auth.permissionDeniedBody}
        </InlineAlert>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {ROLE_ORDER.map((role) => (
          <Card key={role} className="p-5">
            <Pill tone={roleTone(role)}>{roleLabel(role, d)}</Pill>
            <p className="mt-4 font-brand text-h2 text-plum tabular-nums">
              {formatNumber(ROLES[role].permissions.length, locale)}
            </p>
            <p className="text-caption text-ink-muted">
              {fill(d.admin.permissionsCount, {
                count: formatNumber(ROLES[role].permissions.length, locale),
              })}
            </p>
          </Card>
        ))}
      </div>

      <TableShell>
        <table className="aecc-table">
          <caption className="sr-only">{d.admin.roles}</caption>
          <thead>
            <tr>
              <th scope="col">{d.admin.permission}</th>
              {ROLE_ORDER.map((role) => (
                <th key={role} scope="col" className="text-center">
                  {roleLabel(role, d)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ALL_PERMISSIONS.map((permission) => (
              <tr key={permission}>
                <th scope="row" className="px-4 py-3 text-start font-mono text-caption font-normal text-ink" dir="ltr">
                  {permission}
                </th>
                {ROLE_ORDER.map((role) => {
                  const granted = can(role, permission);
                  return (
                    <td key={role} className="text-center">
                      <span className="sr-only">
                        {granted ? d.common.yes : d.common.no}
                      </span>
                      {granted ? (
                        <Check
                          className="mx-auto h-4 w-4 text-success"
                          aria-hidden="true"
                          strokeWidth={2.25}
                        />
                      ) : (
                        <Minus
                          className="mx-auto h-4 w-4 text-ink-faint"
                          aria-hidden="true"
                          strokeWidth={1.75}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>
    </>
  );
}
