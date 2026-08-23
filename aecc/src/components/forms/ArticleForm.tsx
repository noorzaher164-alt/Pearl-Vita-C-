'use client';

import { useActionState } from 'react';
import { PenLine } from 'lucide-react';
import { createArticleAction, type ActionResult } from '@/app/actions/portal';
import { FormFeedback, SubmitButton } from '@/components/forms/FormShell';
import { Card, CardHeader, Field, Input, Select, Textarea } from '@/components/ui';
import type { Dictionary } from '@/lib/i18n';

export function ArticleForm({
  d,
  categories,
}: {
  d: Dictionary;
  categories: { id: string; name: string }[];
}) {
  const [state, formAction] = useActionState<ActionResult, FormData>(createArticleAction, {});

  return (
    <form action={formAction} className="grid max-w-3xl gap-6">
      <FormFeedback state={state} d={d} />

      <Card>
        <CardHeader title={d.magazine.newArticle} subtitle={d.magazine.subtitle} />
        <div className="grid gap-5 p-6 pt-4 md:grid-cols-2">
          <Field label={`${d.common.title} (EN)`} htmlFor="titleEn" required>
            <Input id="titleEn" name="titleEn" required maxLength={180} dir="ltr" />
          </Field>
          <Field label={`${d.common.title} (AR)`} htmlFor="titleAr">
            <Input id="titleAr" name="titleAr" maxLength={180} dir="rtl" />
          </Field>
          <Field label={`${d.magazine.subtitleField} (EN)`} htmlFor="subtitleEn">
            <Input id="subtitleEn" name="subtitleEn" maxLength={280} dir="ltr" />
          </Field>
          <Field label={`${d.magazine.subtitleField} (AR)`} htmlFor="subtitleAr">
            <Input id="subtitleAr" name="subtitleAr" maxLength={280} dir="rtl" />
          </Field>
          <Field label={d.common.category} htmlFor="categoryId" required className="md:col-span-2">
            <Select id="categoryId" name="categoryId" required defaultValue={categories[0]?.id}>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader title={d.magazine.bodyEn} subtitle={d.magazine.bodyHint} />
        <div className="grid gap-5 p-6 pt-4">
          <Field label={d.magazine.bodyEn} htmlFor="bodyEn" required>
            <Textarea id="bodyEn" name="bodyEn" required className="min-h-[280px] font-mono text-[0.875rem]" dir="ltr" />
          </Field>
          <Field label={d.magazine.bodyAr} htmlFor="bodyAr">
            <Textarea id="bodyAr" name="bodyAr" className="min-h-[280px] font-mono text-[0.875rem]" dir="rtl" />
          </Field>
          <Field label={d.magazine.references} htmlFor="references" hint="One reference per line">
            <Textarea id="references" name="references" className="min-h-[96px]" />
          </Field>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <label className="inline-flex cursor-pointer items-center gap-2 text-small text-ink">
            <input
              type="checkbox"
              name="submit"
              className="h-4 w-4 rounded-[4px] border-line-strong accent-[#48132F]"
            />
            {d.magazine.submitForReview}
          </label>
          <p className="field-hint">{d.magazine.reviewNotesHint}</p>
        </div>
      </Card>

      <div>
        <SubmitButton
          label={d.common.save}
          pendingLabel={d.common.saving}
          icon={<PenLine className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.75} />}
        />
      </div>
    </form>
  );
}
