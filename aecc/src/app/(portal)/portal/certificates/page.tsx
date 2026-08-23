import type { Metadata } from 'next';
import { Download, ScrollText } from 'lucide-react';
import { CertificateForm } from '@/components/forms/CertificateForm';
import { memberName } from '@/components/portal/Common';
import { Card, EmptyState, InlineAlert, PageHeader, Pill } from '@/components/ui';
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

  // A member only ever receives her own certificate records.
  const certificates = await listCertificates(canSeeAll ? undefined : viewer.id);
  const [members, events] = canIssue
    ? await Promise.all([listMembers({ studentsOnly: true }), listEvents()])
    : [[], []];

  return (
    <>
      <PageHeader
        eyebrow={d.brand.fullName}
        title={canSeeAll ? d.certificates.title : d.certificates.myCertificates}
        subtitle={d.certificates.subtitle}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className={canIssue ? 'lg:col-span-2' : 'lg:col-span-3'}>
          {certificates.length === 0 ? (
            <EmptyState icon={<ScrollText />} title={d.certificates.noCertificates} />
          ) : (
            <ul className="grid gap-4">
              {certificates.map((certificate) => (
                <Card as="li" key={certificate.id} className="overflow-hidden">
                  {/* A certificate record rendered in the AECC award language — the
                      same layout the printable PDF template will follow. */}
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
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          disabled
                          title={d.certificates.pdfPending}
                        >
                          <Download className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />
                          {d.certificates.downloadPdf}
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </ul>
          )}

          <div className="mt-6">
            <InlineAlert tone="info">{d.certificates.pdfPending}</InlineAlert>
          </div>
        </div>

        {canIssue ? (
          <div>
            <CertificateForm
              d={d}
              members={members.map((m) => ({ id: m.id, name: memberName(m, locale) }))}
              events={events.map((e) => ({
                id: e.id,
                title: pick(locale, e as unknown as Record<string, unknown>, 'title'),
              }))}
            />
          </div>
        ) : null}
      </div>
    </>
  );
}
