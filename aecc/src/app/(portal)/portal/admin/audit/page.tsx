import type { Metadata } from 'next';
import { History } from 'lucide-react';
import { memberName } from '@/components/portal/Common';
import { EmptyState, PageHeader, Pill, TableShell } from '@/components/ui';
import { requirePermission } from '@/lib/auth/current-user';
import { listAuditLogs } from '@/lib/db/queries';
import { formatDateTime, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Audit log' };

export default async function AuditPage() {
  await requirePermission('audit:read', '/portal/admin/audit');
  const { locale, d } = await getT();
  const logs = await listAuditLogs(80);

  return (
    <>
      <PageHeader eyebrow={d.nav.groupAdmin} title={d.admin.audit} subtitle={d.admin.auditSubtitle} />

      {logs.length === 0 ? (
        <EmptyState icon={<History />} title={d.admin.noAudit} />
      ) : (
        <TableShell>
          <table className="aecc-table">
            <caption className="sr-only">{d.admin.audit}</caption>
            <thead>
              <tr>
                <th scope="col">{d.admin.action}</th>
                <th scope="col">{d.common.description}</th>
                <th scope="col">{d.admin.actor}</th>
                <th scope="col">{d.common.reason}</th>
                <th scope="col">{d.common.date}</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <Pill tone="soft">
                      <span dir="ltr" className="font-mono text-[0.6875rem]">
                        {log.action}
                      </span>
                    </Pill>
                  </td>
                  <td className="text-ink">
                    {pick(locale, log as unknown as Record<string, unknown>, 'summary')}
                  </td>
                  <td className="text-ink-muted">{memberName(log.actor, locale)}</td>
                  <td className="text-ink-muted">{log.reason ?? '—'}</td>
                  <td className="whitespace-nowrap text-ink-muted">
                    {formatDateTime(log.created_at, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>
      )}
    </>
  );
}
