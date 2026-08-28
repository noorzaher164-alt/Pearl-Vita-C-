export default function PortalLoading() {
  return (
    <div className="animate-fade-in mx-auto w-full max-w-shell" role="status" aria-live="polite">
      {/* Page header skeleton */}
      <div className="mb-8">
        <div className="skeleton mb-2 h-3 w-24" />
        <div className="skeleton mb-3 h-8 w-64" />
        <div className="skeleton h-4 w-96 max-w-full" />
        <div className="gold-rule mt-6" />
      </div>

      {/* Metric cards skeleton */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="aecc-card p-6">
            <div className="skeleton mb-3 h-3 w-20" />
            <div className="skeleton h-7 w-16" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="aecc-card overflow-hidden">
        <div className="border-b border-line bg-blush px-6 py-3">
          <div className="skeleton h-3 w-32" />
        </div>
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-line px-6 py-4 last:border-b-0">
            <div className="skeleton h-9 w-9 rounded-pill" />
            <div className="flex-1">
              <div className="skeleton mb-2 h-3.5 w-40" />
              <div className="skeleton h-3 w-24" />
            </div>
            <div className="skeleton h-6 w-16 rounded-pill" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
