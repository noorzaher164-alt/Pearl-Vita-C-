'use client';

import { useActionState, useState } from 'react';
import { Eye, ScrollText } from 'lucide-react';
import { issueCertificateAction, type ActionResult } from '@/app/actions/portal';
import { FormFeedback, SubmitButton } from '@/components/forms/FormShell';
import { CertificatePreview, type CertificateData, type TemplateStyle } from '@/components/portal/CertificatePreview';
import { Card, CardHeader, Field, Input, Select } from '@/components/ui';
import { certificateKind } from '@/lib/domain/labels';
import type { Dictionary } from '@/lib/i18n';

const KINDS = ['participation', 'outstanding', 'ambassador', 'competition', 'research'];
const TEMPLATES: TemplateStyle[] = ['classic', 'modern', 'elegant'];

export function CertificateForm({
  d,
  locale,
  members,
  events,
  viewerName,
}: {
  d: Dictionary;
  locale: string;
  members: { id: string; name: string; grade?: string }[];
  events: { id: string; title: string }[];
  viewerName: string;
}) {
  const [state, formAction] = useActionState<ActionResult, FormData>(issueCertificateAction, {});
  const [showPreview, setShowPreview] = useState(false);
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedKind, setSelectedKind] = useState('participation');
  const [reason, setReason] = useState('');
  const [grade, setGrade] = useState('');
  const [template, setTemplate] = useState<TemplateStyle>('classic');

  const member = members.find((m) => m.id === selectedMember);

  const previewData: CertificateData = {
    recipientName: member?.name ?? '---',
    grade: grade || member?.grade || '',
    reason: reason || '---',
    kind: selectedKind,
    kindLabel: certificateKind(selectedKind, d),
    serial: `AECC-${new Date().getFullYear()}-XXXX`,
    date: new Date().toLocaleDateString(locale === 'ar' ? 'ar-QA' : 'en-QA'),
    coordinatorName: d.about.coordinatorName,
    teacherName: viewerName,
    template,
  };

  return (
    <>
      <Card>
        <CardHeader title={d.certificates.issue} />
        <form action={formAction} className="grid gap-5 p-6 pt-4">
          <FormFeedback state={state} d={d} />

          <Field label={d.certificates.recipient} htmlFor="certUserId" required>
            <Select
              id="certUserId"
              name="userId"
              required
              defaultValue=""
              onChange={(e) => {
                setSelectedMember(e.target.value);
                const m = members.find((x) => x.id === e.target.value);
                if (m?.grade) setGrade(m.grade);
              }}
            >
              <option value="" disabled>
                {d.points.selectMember}
              </option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={d.common.category} htmlFor="certKind" required>
            <Select
              id="certKind"
              name="kind"
              defaultValue="participation"
              onChange={(e) => setSelectedKind(e.target.value)}
            >
              {KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {certificateKind(kind, d)}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={`${d.common.title} (EN)`} htmlFor="certTitleEn" required>
            <Input id="certTitleEn" name="titleEn" required maxLength={160} dir="ltr" />
          </Field>
          <Field label={`${d.common.title} (AR)`} htmlFor="certTitleAr">
            <Input id="certTitleAr" name="titleAr" maxLength={160} dir="rtl" />
          </Field>

          <Field label={d.certificates.grade} htmlFor="certGrade">
            <Input
              id="certGrade"
              name="grade"
              maxLength={60}
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            />
          </Field>

          <Field label={d.certificates.reason} htmlFor="certReason" required>
            <Input
              id="certReason"
              name="reason"
              required
              maxLength={300}
              placeholder={d.certificates.reasonPlaceholder}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Field>

          <Field label={d.certificates.template} htmlFor="certTemplate">
            <Select
              id="certTemplate"
              name="template"
              value={template}
              onChange={(e) => setTemplate(e.target.value as TemplateStyle)}
            >
              {TEMPLATES.map((t) => (
                <option key={t} value={t}>
                  {d.certificates[`template${t.charAt(0).toUpperCase()}${t.slice(1)}` as keyof typeof d.certificates] as string}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={d.events.title} htmlFor="certEventId" hint={d.common.optional}>
            <Select id="certEventId" name="eventId" defaultValue="">
              <option value="">{d.common.none}</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </Select>
          </Field>

          <div className="flex gap-3">
            <SubmitButton
              label={d.certificates.issue}
              pendingLabel={d.common.saving}
              icon={<ScrollText className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.75} />}
            />
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="btn btn-outline flex items-center gap-2"
              disabled={!selectedMember || !reason}
            >
              <Eye className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.75} />
              {d.certificates.previewAndPrint}
            </button>
          </div>
        </form>
      </Card>

      {showPreview && selectedMember && reason && (
        <div className="mt-6">
          <CertificatePreview data={previewData} d={d} locale={locale} />
        </div>
      )}
    </>
  );
}
