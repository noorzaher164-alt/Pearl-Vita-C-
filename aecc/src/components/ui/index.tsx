import Link from 'next/link';
import type { ComponentProps, HTMLAttributes, ReactNode } from 'react';
import { cn, clampPercent, initialsOf } from '@/lib/utils';
import { SparkRule } from '@/components/brand/Motifs';

/* -------------------------------------------------------------------------- */
/* Buttons                                                                    */
/* -------------------------------------------------------------------------- */

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

const SIZE: Record<ButtonSize, string> = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
  icon: 'btn-icon',
};

export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', extra?: string) {
  return cn('btn', VARIANT[variant], SIZE[size], extra);
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ComponentProps<'button'> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export function LinkButton({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

/* -------------------------------------------------------------------------- */
/* Surfaces                                                                   */
/* -------------------------------------------------------------------------- */

type CardTag = 'div' | 'section' | 'article' | 'li';

export function Card({
  className,
  as: Tag = 'div',
  children,
  ...props
}: HTMLAttributes<HTMLElement> & { as?: CardTag }) {
  return (
    <Tag className={cn('aecc-card', className)} {...props}>
      {children}
    </Tag>
  );
}

export function Panel({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('aecc-panel', className)} {...props} />;
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-3 px-6 pt-6', className)}>
      <div className="min-w-0">
        <h2 className="font-brand text-h3 text-plum">{title}</h2>
        {subtitle ? <p className="mt-1 text-small text-ink-muted">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Page furniture                                                             */
/* -------------------------------------------------------------------------- */

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('mb-8', className)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 max-w-prose">
          {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
          <h1 className="font-brand text-h1 text-plum">{title}</h1>
          {subtitle ? <p className="mt-2 text-body text-ink-muted text-pretty">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      <SparkRule className="mt-6" />
    </header>
  );
}

export function SectionTitle({
  children,
  action,
  className,
}: {
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-4 flex items-center justify-between gap-4', className)}>
      <h2 className="font-brand text-h3 text-plum">{children}</h2>
      {action}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Status pills                                                               */
/* -------------------------------------------------------------------------- */

export type PillTone =
  | 'plum'
  | 'rose'
  | 'gold'
  | 'mauve'
  | 'berry'
  | 'soft'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral';

const PILL: Record<PillTone, string> = {
  plum: 'bg-plum-accent text-white',
  rose: 'bg-rose-100 text-rose-600 border-rose-200',
  gold: 'bg-[#F9EDE6] text-[#8A5540] border-[#E8CDBF]',
  mauve: 'bg-[#F2EBEE] text-mauve-dark border-[#E2D4DA]',
  berry: 'bg-[#EFE6EB] text-berry border-[#DFCDD7]',
  soft: 'bg-blush text-ink-muted border-line',
  success: 'bg-success-soft text-success-ink border-[#CFE0D3]',
  warning: 'bg-warning-soft text-warning-ink border-[#EFDCC2]',
  danger: 'bg-danger-soft text-danger-ink border-[#EFD0CD]',
  neutral: 'bg-blush text-ink-muted border-line',
};

export function Pill({
  tone = 'neutral',
  children,
  icon,
  className,
}: {
  tone?: PillTone;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn('pill border', PILL[tone], className)}>
      {icon ? <span className="grid place-items-center [&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span> : null}
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Avatar                                                                     */
/* -------------------------------------------------------------------------- */

export function Avatar({
  name,
  src,
  size = 40,
  className,
}: {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-grid shrink-0 place-items-center overflow-hidden rounded-pill border border-line bg-blush',
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {src ? (
        // Monogram artwork generated from the palette — no student photographs are shipped.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" width={size} height={size} className="h-full w-full object-cover" />
      ) : (
        <span
          className="font-brand text-plum"
          style={{ fontSize: Math.max(11, Math.round(size * 0.34)) }}
        >
          {initialsOf(name)}
        </span>
      )}
    </span>
  );
}

export function AvatarStack({
  people,
  max = 5,
  size = 30,
}: {
  people: { name: string; avatar?: string | null }[];
  max?: number;
  size?: number;
}) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return (
    <span className="flex items-center">
      {shown.map((person, index) => (
        <span key={index} className={index === 0 ? '' : '-ms-2'}>
          <Avatar name={person.name} src={person.avatar} size={size} className="ring-2 ring-surface" />
        </span>
      ))}
      {rest > 0 ? (
        <span
          className="-ms-2 grid place-items-center rounded-pill border border-line bg-blush text-caption font-semibold text-ink-muted ring-2 ring-surface"
          style={{ width: size, height: size }}
        >
          +{rest}
        </span>
      ) : null}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Progress                                                                   */
/* -------------------------------------------------------------------------- */

export function Progress({
  value,
  label,
  tone = 'plum',
  className,
}: {
  value: number;
  label?: string;
  tone?: 'plum' | 'rose' | 'gold' | 'mauve';
  className?: string;
}) {
  const pct = clampPercent(value);
  const fill = {
    plum: 'bg-plum',
    rose: 'bg-rose',
    gold: 'bg-rose-gold',
    mauve: 'bg-mauve',
  }[tone];

  return (
    <div className={className}>
      {label ? (
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <span className="text-caption text-ink-muted">{label}</span>
          <span className="text-caption font-semibold text-plum tabular-nums">{pct}%</span>
        </div>
      ) : null}
      <div
        className="h-1.5 w-full overflow-hidden rounded-pill bg-ivory-deep"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className={cn('h-full rounded-pill transition-slow', fill)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Metric card                                                                */
/* -------------------------------------------------------------------------- */

export function MetricCard({
  label,
  value,
  hint,
  icon,
  tone = 'plum',
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: 'plum' | 'rose' | 'gold' | 'mauve' | 'berry';
}) {
  const iconTone = {
    plum: 'bg-plum-50 text-plum',
    rose: 'bg-rose-50 text-rose',
    gold: 'bg-[#F9EDE6] text-[#8A5540]',
    mauve: 'bg-[#F2EBEE] text-mauve-dark',
    berry: 'bg-[#EFE6EB] text-berry',
  }[tone];

  return (
    <Card className="animate-fade-up p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-small text-ink-muted">{label}</p>
        {icon ? (
          <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-control', iconTone)}>
            <span className="[&>svg]:h-[18px] [&>svg]:w-[18px]">{icon}</span>
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-brand text-metric text-plum tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-caption text-ink-faint">{hint}</p> : null}
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* States                                                                     */
/* -------------------------------------------------------------------------- */

export function EmptyState({
  title,
  body,
  icon,
  action,
  className,
}: {
  title: string;
  body?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-card border border-dashed border-line-strong bg-blush px-6 py-12 text-center',
        className,
      )}
    >
      {icon ? (
        <span className="mb-4 grid h-12 w-12 place-items-center rounded-pill bg-ivory text-mauve [&>svg]:h-5 [&>svg]:w-5">
          {icon}
        </span>
      ) : null}
      <p className="font-brand text-h3 text-plum">{title}</p>
      {body ? <p className="mt-2 max-w-[42ch] text-small text-ink-muted">{body}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function InlineAlert({
  tone = 'info',
  title,
  children,
  icon,
}: {
  tone?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  children?: ReactNode;
  icon?: ReactNode;
}) {
  const tones = {
    info: 'bg-info-soft border-[#DED2DC] text-info-ink',
    success: 'bg-success-soft border-[#CFE0D3] text-success-ink',
    warning: 'bg-warning-soft border-[#EFDCC2] text-warning-ink',
    danger: 'bg-danger-soft border-[#EFD0CD] text-danger-ink',
  }[tone];

  return (
    <div className={cn('flex gap-3 rounded-control border px-4 py-3 text-small', tones)} role="status">
      {icon ? <span className="mt-0.5 shrink-0 [&>svg]:h-4 [&>svg]:w-4">{icon}</span> : null}
      <div className="min-w-0">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className={title ? 'mt-1' : undefined}>{children}</div> : null}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Tables                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Table shell. Tables scroll inside their own container and are paired with a card
 * list on small screens rather than overflowing the page (guide §5 / §11).
 */
export function TableShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('aecc-card overflow-hidden', className)}>
      <div className="max-h-[70vh] overflow-auto">{children}</div>
    </div>
  );
}

export function DataList({ children, className }: { children: ReactNode; className?: string }) {
  return <ul className={cn('grid gap-3', className)}>{children}</ul>;
}

/* -------------------------------------------------------------------------- */
/* Form fields                                                                */
/* -------------------------------------------------------------------------- */

export function Field({
  label,
  hint,
  error,
  required,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="field-label" htmlFor={htmlFor}>
        {label}
        {required ? (
          <span className="ms-1 text-rose" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint && !error ? <p className="field-hint">{hint}</p> : null}
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn('field-input', className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea className={cn('field-input', className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<'select'>) {
  return <select className={cn('field-input', className)} {...props} />;
}

/* -------------------------------------------------------------------------- */
/* Tabs (link-based, so they work without JavaScript)                          */
/* -------------------------------------------------------------------------- */

export function LinkTabs({
  items,
  activeKey,
  className,
}: {
  items: { key: string; label: string; href: string; count?: number }[];
  activeKey: string;
  className?: string;
}) {
  return (
    <nav className={cn('no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1 pb-1', className)}>
      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-control px-4 py-2 text-small font-semibold transition',
              active
                ? 'bg-plum-accent text-white shadow-soft'
                : 'text-ink-muted hover:bg-blush hover:text-plum',
            )}
          >
            {item.label}
            {typeof item.count === 'number' ? (
              <span
                className={cn(
                  'rounded-pill px-2 py-0.5 text-caption tabular-nums',
                  active ? 'bg-white/20 text-white' : 'bg-surface text-ink-muted',
                )}
              >
                {item.count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/* Misc                                                                       */
/* -------------------------------------------------------------------------- */

export function Meta({ items, className }: { items: (ReactNode | null | undefined)[]; className?: string }) {
  const visible = items.filter(Boolean);
  return (
    <p className={cn('flex flex-wrap items-center gap-x-2 gap-y-1 text-caption text-ink-muted', className)}>
      {visible.map((item, index) => (
        <span key={index} className="inline-flex items-center gap-2">
          {index > 0 ? (
            <span className="text-rose-gold" aria-hidden="true">
              ·
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5 [&>svg]:h-3.5 [&>svg]:w-3.5">{item}</span>
        </span>
      ))}
    </p>
  );
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-caption text-ink-muted">{label}</dt>
      <dd className="mt-0.5 text-small font-semibold text-plum">{value}</dd>
    </div>
  );
}
