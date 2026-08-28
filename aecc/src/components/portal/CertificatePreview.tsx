'use client';

import { useRef } from 'react';
import { Printer } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n';

export type TemplateStyle = 'classic' | 'modern' | 'elegant';

export interface CertificateData {
  recipientName: string;
  grade: string;
  reason: string;
  kind: string;
  kindLabel: string;
  serial: string;
  date: string;
  coordinatorName: string;
  teacherName: string;
  template: TemplateStyle;
}

const PALETTES: Record<TemplateStyle, {
  border: string;
  accent: string;
  bg: string;
  headerBg: string;
  text: string;
  mutedText: string;
  line: string;
}> = {
  classic: {
    border: '#6B3A5D',
    accent: '#8B5E83',
    bg: '#FFFDF9',
    headerBg: '#6B3A5D',
    text: '#2D1B26',
    mutedText: '#6B5B63',
    line: '#D4C5CF',
  },
  modern: {
    border: '#1A3A4A',
    accent: '#2D7D9A',
    bg: '#F8FBFC',
    headerBg: '#1A3A4A',
    text: '#1A2A32',
    mutedText: '#5A6A72',
    line: '#C5D5DD',
  },
  elegant: {
    border: '#3D2B1F',
    accent: '#B8860B',
    bg: '#FFFEF5',
    headerBg: '#3D2B1F',
    text: '#2A1F15',
    mutedText: '#6B5D52',
    line: '#D4C8B5',
  },
};

export function CertificatePreview({
  data,
  d,
  locale,
}: {
  data: CertificateData;
  d: Dictionary;
  locale: string;
}) {
  const printRef = useRef<HTMLDivElement>(null);
  const p = PALETTES[data.template];
  const isAr = locale === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  function handlePrint() {
    const el = printRef.current;
    if (!el) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="${dir}" lang="${locale}">
      <head>
        <meta charset="utf-8" />
        <title>${d.certificates.certificateFor} ${data.recipientName}</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Noto+Naskh+Arabic:wght@400;700&display=swap" />
        <style>
          @page { size: A4 landscape; margin: 0; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: 297mm;
            height: 210mm;
            overflow: hidden;
            font-family: 'Amiri', 'Noto Naskh Arabic', serif;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>${el.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 600);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-brand text-h3 text-plum">{d.certificates.preview}</h3>
        <button
          type="button"
          onClick={handlePrint}
          className="btn btn-primary flex items-center gap-2"
        >
          <Printer className="h-[18px] w-[18px]" strokeWidth={1.75} />
          {d.certificates.printCertificate}
        </button>
      </div>

      <div className="overflow-x-auto rounded-card border border-line shadow-card">
        <div ref={printRef}>
          <div
            dir={dir}
            style={{
              width: '297mm',
              height: '210mm',
              position: 'relative',
              background: p.bg,
              fontFamily: "'Amiri', 'Noto Naskh Arabic', serif",
              color: p.text,
              overflow: 'hidden',
            }}
          >
            {/* Decorative border */}
            <div
              style={{
                position: 'absolute',
                inset: '8mm',
                border: `3px solid ${p.border}`,
                borderRadius: '4px',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: '11mm',
                border: `1px solid ${p.line}`,
                borderRadius: '2px',
              }}
            />

            {/* Corner ornaments */}
            {data.template === 'elegant' && (
              <>
                <CornerOrnament position="top-left" color={p.accent} />
                <CornerOrnament position="top-right" color={p.accent} />
                <CornerOrnament position="bottom-left" color={p.accent} />
                <CornerOrnament position="bottom-right" color={p.accent} />
              </>
            )}

            {/* Content area */}
            <div
              style={{
                position: 'absolute',
                inset: '16mm',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {/* Header with logos */}
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '6mm',
                }}
              >
                {/* Ministry logo area */}
                <div style={{ textAlign: 'center', width: '60mm' }}>
                  <div
                    style={{
                      width: '18mm',
                      height: '18mm',
                      margin: '0 auto 2mm',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${p.accent}, ${p.border})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '8pt',
                      fontWeight: 700,
                    }}
                  >
                    {isAr ? 'وزارة' : 'MOE'}
                  </div>
                  <p style={{ fontSize: '7pt', color: p.mutedText, lineHeight: 1.3 }}>
                    {d.certificates.ministryOfEducation}
                  </p>
                  <p style={{ fontSize: '6.5pt', color: p.mutedText }}>
                    {d.certificates.stateOfQatar}
                  </p>
                </div>

                {/* Center: School name */}
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <p
                    style={{
                      fontSize: '11pt',
                      fontWeight: 700,
                      color: p.border,
                      letterSpacing: '0.5px',
                    }}
                  >
                    {d.certificates.schoolName}
                  </p>
                  <p style={{ fontSize: '9pt', color: p.accent, marginTop: '1mm' }}>
                    {d.brand.fullName}
                  </p>
                </div>

                {/* Club logo */}
                <div style={{ textAlign: 'center', width: '60mm' }}>
                  <img
                    src={isAr ? '/brand/aecc-logo-ar-128.png' : '/brand/aecc-logo-en-128.png'}
                    alt={d.brand.fullName}
                    style={{
                      width: '20mm',
                      height: '20mm',
                      objectFit: 'contain',
                      margin: '0 auto',
                      display: 'block',
                    }}
                  />
                </div>
              </div>

              {/* Decorative line */}
              <div
                style={{
                  width: '80%',
                  height: '1px',
                  background: `linear-gradient(90deg, transparent, ${p.accent}, transparent)`,
                  marginBottom: '5mm',
                }}
              />

              {/* Certificate type */}
              <p
                style={{
                  fontSize: '13pt',
                  fontWeight: 700,
                  color: p.accent,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  marginBottom: '3mm',
                }}
              >
                {data.kindLabel}
              </p>

              {/* Main title */}
              <h1
                style={{
                  fontSize: data.template === 'elegant' ? '28pt' : '24pt',
                  fontWeight: 700,
                  color: p.border,
                  marginBottom: '6mm',
                  letterSpacing: '1px',
                }}
              >
                {data.kindLabel}
              </h1>

              {/* Body text */}
              <p
                style={{
                  fontSize: '12pt',
                  color: p.mutedText,
                  marginBottom: '3mm',
                }}
              >
                {d.certificates.certifiesThat}
              </p>

              {/* Student name */}
              <p
                style={{
                  fontSize: '22pt',
                  fontWeight: 700,
                  color: p.border,
                  borderBottom: `2px solid ${p.accent}`,
                  paddingBottom: '2mm',
                  paddingLeft: '10mm',
                  paddingRight: '10mm',
                  marginBottom: '3mm',
                }}
              >
                {data.recipientName}
              </p>

              {/* Grade */}
              {data.grade && (
                <p
                  style={{
                    fontSize: '11pt',
                    color: p.mutedText,
                    marginBottom: '3mm',
                  }}
                >
                  {d.certificates.grade}: {data.grade}
                </p>
              )}

              {/* Reason */}
              <p
                style={{
                  fontSize: '12pt',
                  color: p.mutedText,
                  marginBottom: '2mm',
                }}
              >
                {d.certificates.hasBeenAwarded}
              </p>
              <p
                style={{
                  fontSize: '13pt',
                  fontWeight: 700,
                  color: p.text,
                  maxWidth: '200mm',
                  textAlign: 'center',
                  lineHeight: 1.6,
                  marginBottom: '4mm',
                }}
              >
                {data.reason}
              </p>

              {/* Appreciation line */}
              <p
                style={{
                  fontSize: '10pt',
                  fontStyle: 'italic',
                  color: p.accent,
                  marginBottom: '6mm',
                }}
              >
                {d.certificates.withAppreciation}
              </p>

              {/* Signatures area */}
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-around',
                  alignItems: 'flex-end',
                  marginTop: 'auto',
                  paddingTop: '4mm',
                }}
              >
                <SignatureBlock
                  title={d.certificates.coordinator}
                  name={data.coordinatorName}
                  color={p.border}
                  lineColor={p.line}
                />
                <SignatureBlock
                  title={d.certificates.teacher}
                  name={data.teacherName}
                  color={p.border}
                  lineColor={p.line}
                />
              </div>

              {/* Footer */}
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '4mm',
                  paddingTop: '2mm',
                  borderTop: `1px solid ${p.line}`,
                  fontSize: '7.5pt',
                  color: p.mutedText,
                }}
              >
                <span>{data.serial}</span>
                <span>
                  {d.certificates.academicYear}: {d.brand.year}
                </span>
                <span>{data.date}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SignatureBlock({
  title,
  name,
  color,
  lineColor,
}: {
  title: string;
  name: string;
  color: string;
  lineColor: string;
}) {
  return (
    <div style={{ textAlign: 'center', minWidth: '60mm' }}>
      <div
        style={{
          width: '50mm',
          height: '0',
          borderBottom: `1px solid ${lineColor}`,
          margin: '0 auto 3mm',
        }}
      />
      <p style={{ fontSize: '11pt', fontWeight: 700, color }}>{name}</p>
      <p style={{ fontSize: '8pt', color: lineColor, marginTop: '1mm' }}>{title}</p>
    </div>
  );
}

function CornerOrnament({
  position,
  color,
}: {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  color: string;
}) {
  const size = 20;
  const pos: Record<string, string> = {};
  let rotation = 0;

  switch (position) {
    case 'top-left':
      pos.top = '12mm';
      pos.left = '12mm';
      rotation = 0;
      break;
    case 'top-right':
      pos.top = '12mm';
      pos.right = '12mm';
      rotation = 90;
      break;
    case 'bottom-right':
      pos.bottom = '12mm';
      pos.right = '12mm';
      rotation = 180;
      break;
    case 'bottom-left':
      pos.bottom = '12mm';
      pos.left = '12mm';
      rotation = 270;
      break;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      style={{
        position: 'absolute',
        ...pos,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <path
        d="M0 0 L8 0 C4 0 0 4 0 8 Z"
        fill={color}
        opacity={0.3}
      />
      <path
        d="M0 0 L5 0 C2 0 0 2 0 5 Z"
        fill={color}
        opacity={0.5}
      />
    </svg>
  );
}
