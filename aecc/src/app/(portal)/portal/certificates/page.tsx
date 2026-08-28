import type { Metadata } from 'next';
import { ScrollText } from 'lucide-react';
import { CertificateForm } from '@/components/forms/CertificateForm';
import { memberName } from '@/components/portal/Common';
import { Card, EmptyState, PageHeader, Pill } from '@/components/ui';
import { CertificatePrintButton } from '@/components/portal/CertificatePrintButton';
import { requirePermission } from '@/lib/auth/current-user';
import { listCertificates, listEvents, listMembers } from '@/lib/db/queries';
import { certificateKind } from '@/lib/domain/labels';
import { formatDate, pick } from '@/lib/i18n';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Certificates' };

export default async function CertificatesPage() {
  const viewer = await requirePermission(['certificates:read', 'certificates:read_own'], '/portal/certificates');
  const { locale, d } = await getT();

  const canSeeAll = viewer.permissions.can('certificates:read');
  const canIssue = viewer.permissions.can('certificates:issue');

  const certificates = await listCertificates(canSeeAll ? undefined : viewer.id);
  const [members, events] = canIssue
    ? await Promise.all([listMembers({ studentsOnly: true }), listEvents()])
    : [[], []];

  const viewerName = (locale === 'ar' ? viewer.full_name_ar : viewer.full_name_en) || viewer.full_name_en;

  return (
    <>
      <PageHeader
        eyebrow={d.brand.fullName}
        title={canSeeAll ? d.certificates.title : d.certificates.myCertificates}
        subtitle={d.certificates.subtitle}
      />

      <div className={canIssue ? 'grid gap-6 lg:grid-cols-3' : ''}>
        <div className={canIssue ? 'lg:col-span-2' : ''}>
          {certificates.length === 0 ? (
            <EmptyState icon={<ScrollText />} title={d.certificates.noCertificates} />
          ) : (
            <ul className="grid gap-4">
              {certificates.map((certificate) => (
                <Card as="li" key={certificate.id} className="overflow-hidden">
                  <div className="border-s-[3px] border-s-rose-gold bg-[#FBF2EC] p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="eyebrow mb-2">{certificateKind(certificate.kind, d)}</p>
                        <h2 className="font-brand text-h3 text-plum">
                          {pick(locale, certificate as unknown as Record<string, unknown>, 'title')}
                        </h2>
                        {canSeeAll ? (
                          <p className="mt-1 text-small text-ink-muted">
                            {d.certificates.recipient}: {memberName(certificate.member, locale)}
                          </p>
                        ) : null}
                        <p className="mt-3 text-caption text-ink-faint" dir="ltr">
                          {certificate.serial} · {formatDate(certificate.issued_on, locale)}
                          {certificate.issuer ? ` · ${memberName(certificate.issuer, locale)}` : ''}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <Pill tone="gold">{d.certificates.issuedOn}</Pill>
                        <CertificatePrintButton
                          certificate={{
                            recipientName: memberName(certificate.member, locale),
                            grade: certificate.member?.grade ?? '',
                            reason: pick(locale, certificate as unknown as Record<string, unknown>, 'title') ?? '',
                            kind: certificate.kind,
                            kindLabel: certificateKind(certificate.kind, d),
                            serial: certificate.serial,
                            date: formatDate(certificate.issued_on, locale),
                            coordinatorName: d.about.coordinatorName,
                            teacherName: certificate.issuer ? memberName(certificate.issuer, locale) : viewerName,
                          }}
                          d={d}
                          locale={locale}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </ul>
          )}
        </div>

        {canIssue ? (
          <div>
            <CertificateForm
              d={d}
              locale={locale}
              members={members.map((m) => ({
                id: m.id,
                name: memberName(m, locale),
                grade: m.grade,
              }))}
              events={events.map((e) => ({
                id: e.id,
                title: pick(locale, e as unknown as Record<string, unknown>, 'title') ?? '',
              }))}
              viewerName={viewerName}
            />
          </div>
        ) : null}
      </div>
    </>
  );
}
