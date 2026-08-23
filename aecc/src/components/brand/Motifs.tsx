import { cn } from '@/lib/utils';

/**
 * Decorative line motifs drawn from the logo's vocabulary: a broken rose-gold arc,
 * a dotted counter-arc, a four-point spark, fine-line glassware, molecule rings and
 * botanical leaves. All are low-opacity supporting decoration and are hidden from
 * assistive technology.
 */

export function OrbitalArc({ className, opacity = 0.45 }: { className?: string; opacity?: number }) {
  return (
    <svg
      viewBox="0 0 240 240"
      aria-hidden="true"
      className={cn('decor', className)}
      style={{ opacity }}
      focusable="false"
    >
      <path
        d="M 20 120 A 100 100 0 1 1 192 190"
        fill="none"
        stroke="#CB8C78"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const a = Math.PI * (0.62 + i * 0.055);
        return (
          <circle
            key={i}
            cx={120 + Math.cos(a) * 100}
            cy={120 + Math.sin(a) * 100}
            r={1.6 + i * 0.4}
            fill="#CB8C78"
          />
        );
      })}
    </svg>
  );
}

export function Spark({
  className,
  size = 14,
  tone = '#CB8C78',
}: {
  className?: string;
  size?: number;
  tone?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      aria-hidden="true"
      className={cn('decor', className)}
      focusable="false"
    >
      <path
        d="M16 2 Q18.9 13.1 30 16 Q18.9 18.9 16 30 Q13.1 18.9 2 16 Q13.1 13.1 16 2 Z"
        fill={tone}
      />
    </svg>
  );
}

export function MoleculeRing({
  className,
  size = 64,
  opacity = 0.4,
}: {
  className?: string;
  size?: number;
  opacity?: number;
}) {
  const points = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    return [32 + Math.cos(a) * 24, 32 + Math.sin(a) * 24] as const;
  });
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden="true"
      className={cn('decor', className)}
      style={{ opacity }}
      focusable="false"
    >
      <polygon
        points={points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')}
        fill="none"
        stroke="#AF949E"
        strokeWidth="1.3"
      />
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.6" fill="#9F656B" />
      ))}
    </svg>
  );
}

export function BotanicalBranch({
  className,
  size = 120,
  opacity = 0.4,
}: {
  className?: string;
  size?: number;
  opacity?: number;
}) {
  return (
    <svg
      viewBox="0 0 80 160"
      width={size * 0.5}
      height={size}
      aria-hidden="true"
      className={cn('decor', className)}
      style={{ opacity }}
      focusable="false"
    >
      <path d="M40 158 C34 116 46 78 41 8" stroke="#764E61" strokeWidth="1.2" fill="none" />
      {[
        [41, 30, 1],
        [41, 54, -1],
        [42, 78, 1],
        [40, 102, -1],
        [40, 124, 1],
      ].map(([x, y, side], i) => (
        <path
          key={i}
          d={`M ${x} ${y} q ${side * 16} -12 ${side * 26} -2 q ${-side * 12} 14 ${-side * 26} 2 Z`}
          fill="#D7A7A5"
        />
      ))}
    </svg>
  );
}

export function TestTube({ className, size = 96, opacity = 0.5 }: { className?: string; size?: number; opacity?: number }) {
  return (
    <svg
      viewBox="0 0 40 96"
      width={size * 0.42}
      height={size}
      aria-hidden="true"
      className={cn('decor', className)}
      style={{ opacity }}
      focusable="false"
    >
      <path
        d="M11 8 L11 74 A9 9 0 0 0 29 74 L29 8"
        fill="none"
        stroke="#CB8C78"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line x1="7" y1="8" x2="33" y2="8" stroke="#CB8C78" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12.5 46 L12.5 74 A7.5 7.5 0 0 0 27.5 74 L27.5 46 Z" fill="#D7A7A5" opacity="0.45" />
    </svg>
  );
}

/** A hairline rule with the logo's centred spark — used between major sections. */
export function SparkRule({ className }: { className?: string }) {
  return (
    <div className={cn('decor flex items-center gap-3', className)} aria-hidden="true">
      <span className="h-px flex-1 bg-gold-rule" />
      <Spark size={11} />
      <span className="h-px flex-1 bg-gold-rule" />
    </div>
  );
}

/**
 * A restrained decorative field for hero and authentication surfaces. Every element
 * is drawn from the logo, kept at low opacity, and never animated beyond a slow fade.
 */
export function ChemistryField({ className }: { className?: string }) {
  return (
    <div className={cn('decor pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden="true">
      <OrbitalArc className="absolute -end-12 -top-8 h-72 w-72" opacity={0.32} />
      <MoleculeRing className="absolute start-10 top-20" size={76} opacity={0.26} />
      {/* The branch rises out of the tube, exactly as it does in the logo. */}
      <div className="absolute -bottom-6 end-12 flex items-end">
        <BotanicalBranch className="relative -end-6 bottom-8" size={190} opacity={0.3} />
        <TestTube className="relative -ms-12" size={150} opacity={0.32} />
      </div>
      <Spark className="absolute start-1/3 top-12" size={14} />
      <Spark className="absolute start-16 bottom-28" size={10} tone="#D7A7A5" />
    </div>
  );
}
