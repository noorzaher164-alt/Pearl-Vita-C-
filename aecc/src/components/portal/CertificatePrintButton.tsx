'use client';

import { useState } from 'react';
import { Printer } from 'lucide-react';
import { CertificatePreview, type CertificateData } from '@/components/portal/CertificatePreview';
import type { Dictionary } from '@/lib/i18n';

export function CertificatePrintButton({
  certificate,
  d,
  locale,
}: {
  certificate: Omit<CertificateData, 'template'>;
  d: Dictionary;
  locale: string;
}) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
      <button
        type="button"
        className="btn btn-outline btn-sm flex items-center gap-1.5"
        onClick={() => setShowPreview(!showPreview)}
      >
        <Printer className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />
        {d.certificates.printCertificate}
      </button>

      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
          <div className="max-h-[90vh] w-full max-w-[1200px] overflow-auto rounded-card bg-surface p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-brand text-h3 text-plum">{d.certificates.preview}</h3>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setShowPreview(false)}
              >
                {d.common.close}
              </button>
            </div>
            <CertificatePreview
              data={{ ...certificate, template: 'classic' }}
              d={d}
              locale={locale}
            />
          </div>
        </div>
      )}
    </>
  );
}
