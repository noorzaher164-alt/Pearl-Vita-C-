export default function Loading() {
  return (
    <div className="grid min-h-[60vh] place-items-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
        {/* An orbital ring drawn from the logo, used as the loading indicator. */}
        <svg viewBox="0 0 48 48" className="h-10 w-10 animate-spin" aria-hidden="true">
          <circle cx="24" cy="24" r="20" fill="none" stroke="#F6DED9" strokeWidth="2.5" />
          <path
            d="M24 4 a20 20 0 0 1 20 20"
            fill="none"
            stroke="#CB8C78"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
        <span className="text-caption text-ink-muted">Loading…</span>
      </div>
    </div>
  );
}
