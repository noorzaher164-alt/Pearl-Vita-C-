'use client';

import { useActionState } from 'react';
import { BookPlus } from 'lucide-react';
import { createIssueAction, type ActionResult } from '@/app/actions/portal';
import { FormFeedback, SubmitButton } from '@/components/forms/FormShell';
import { Card, CardHeader, Field, Input, Textarea } from '@/components/ui';
import type { Dictionary } from '@/lib/i18n';

export function IssueForm({
  d,
  articles,
}: {
  d: Dictionary;
  articles: { id: string; title: string }[];
}) {
  const [state, formAction] = useActionState<ActionResult, FormData>(createIssueAction, {});

  return (
    <Card>
      <CardHeader title={d.magazine.createIssue} />
      <form action={formAction} className="grid gap-5 p-6 pt-4">
        <FormFeedback state={state} d={d} />

        <Field label={`${d.common.title} (EN)`} htmlFor="issueTitleEn" required>
          <Input id="issueTitleEn" name="titleEn" required maxLength={140} dir="ltr" />
        </Field>
        <Field label={`${d.common.title} (AR)`} htmlFor="issueTitleAr">
          <Input id="issueTitleAr" name="titleAr" maxLength={140} dir="rtl" />
        </Field>
        <Field label={`${d.magazine.editorsNote} (EN)`} htmlFor="editorsNoteEn">
          <Textarea id="editorsNoteEn" name="editorsNoteEn" maxLength={2000} dir="ltr" />
        </Field>
        <Field label={`${d.magazine.editorsNote} (AR)`} htmlFor="editorsNoteAr">
          <Textarea id="editorsNoteAr" name="editorsNoteAr" maxLength={2000} dir="rtl" />
        </Field>

        <fieldset>
          <legend className="field-label">{d.magazine.assignArticles}</legend>
          <div className="max-h-64 overflow-y-auto rounded-control border border-line bg-white p-3">
            {articles.length === 0 ? (
              <p className="text-caption text-ink-muted">{d.magazine.noArticles}</p>
            ) : (
              <ul className="grid gap-2">
                {articles.map((article) => (
                  <li key={article.id}>
                    <label className="flex cursor-pointer items-start gap-2 text-small text-ink">
                      <input
                        type="checkbox"
                        name="articles"
                        value={article.id}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded-[4px] border-line-strong accent-[#48132F]"
                      />
                      <span>{article.title}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </fieldset>

        <SubmitButton
          label={d.magazine.createIssue}
          pendingLabel={d.common.saving}
          icon={<BookPlus className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.75} />}
        />
      </form>
    </Card>
  );
}
