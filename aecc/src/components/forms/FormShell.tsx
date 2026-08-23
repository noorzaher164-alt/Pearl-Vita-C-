'use client';

import { useFormStatus } from 'react-dom';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { InlineAlert } from '@/components/ui';
import type { Dictionary } from '@/lib/i18n';

/** Submit button that reflects the pending state of the enclosing form. */
export function SubmitButton({
  label,
  pendingLabel,
  variant = 'primary',
  className,
  icon,
}: {
  label: string;
  pendingLabel?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  className?: string;
  icon?: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={`btn btn-${variant} ${className ?? ''}`} disabled={pending}>
      {icon}
      {pending ? (pendingLabel ?? label) : label}
    </button>
  );
}

/** Renders the outcome of a server action in brand-consistent language. */
export function FormFeedback({
  state,
  d,
  successMessage,
  messages,
}: {
  state: { ok?: boolean; error?: string; message?: string };
  d: Dictionary;
  successMessage?: string;
  messages?: Record<string, string>;
}) {
  if (state.ok) {
    return (
      <InlineAlert tone="success" icon={<CheckCircle2 />}>
        {successMessage ?? d.common.success}
      </InlineAlert>
    );
  }
  if (!state.error) return null;

  const text = messages?.[state.error] ?? d.validation.fixErrors;
  return (
    <InlineAlert tone="danger" icon={<AlertCircle />}>
      {text}
    </InlineAlert>
  );
}
