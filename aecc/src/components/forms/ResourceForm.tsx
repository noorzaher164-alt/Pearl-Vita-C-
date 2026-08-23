'use client';

import { useActionState } from 'react';
import { Upload } from 'lucide-react';
import { createResourceAction, type ActionResult } from '@/app/actions/portal';
import { FormFeedback, SubmitButton } from '@/components/forms/FormShell';
import { Card, CardHeader, Field, Input, Select, Textarea } from '@/components/ui';
import { resourceCategory } from '@/lib/domain/labels';
import type { Dictionary } from '@/lib/i18n';

const CATEGORIES = ['safety', 'experiments', 'research', 'competitions', 'policies', 'presentations'];

export function ResourceForm({ d }: { d: Dictionary }) {
  const [state, formAction] = useActionState<ActionResult, FormData>(createResourceAction, {});

  return (
    <Card>
      <CardHeader title={d.resources.addResource} />
      <form action={formAction} className="grid gap-5 p-6 pt-4">
        <FormFeedback state={state} d={d} />

        <Field label={`${d.common.title} (EN)`} htmlFor="resTitleEn" required>
          <Input id="resTitleEn" name="titleEn" required maxLength={160} dir="ltr" />
        </Field>
        <Field label={`${d.common.title} (AR)`} htmlFor="resTitleAr">
          <Input id="resTitleAr" name="titleAr" maxLength={160} dir="rtl" />
        </Field>
        <Field label={d.common.description} htmlFor="resDescription">
          <Textarea id="resDescription" name="descriptionEn" maxLength={600} />
        </Field>
        <Field label={d.common.category} htmlFor="resCategory" required>
          <Select id="resCategory" name="category" defaultValue="safety">
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {resourceCategory(category, d)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={d.resources.fileType} htmlFor="resKind" required>
          <Select id="resKind" name="fileKind" defaultValue="pdf">
            <option value="pdf">PDF</option>
            <option value="doc">Word</option>
            <option value="slides">Presentation</option>
            <option value="sheet">Spreadsheet</option>
            <option value="other">{d.common.none}</option>
          </Select>
        </Field>
        <Field
          label="URL"
          htmlFor="resUrl"
          hint="Link to the document in the club's shared storage."
        >
          <Input id="resUrl" name="fileUrl" type="url" dir="ltr" placeholder="https://" />
        </Field>
        <Field label={d.resources.visibility} htmlFor="resVisibility" required>
          <Select id="resVisibility" name="visibility" defaultValue="all">
            <option value="all">{d.resources.visibilityAll}</option>
            <option value="leaders">{d.resources.visibilityLeaders}</option>
            <option value="admin">{d.resources.visibilityAdmin}</option>
          </Select>
        </Field>

        <SubmitButton
          label={d.resources.addResource}
          pendingLabel={d.common.saving}
          icon={<Upload className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.75} />}
        />
      </form>
    </Card>
  );
}
