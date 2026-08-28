export default function PublicLoading() {
  return (
    <div className="animate-fade-in" role="status" aria-live="polite">
      {/* Hero skeleton */}
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-20">
        <div className="skeleton mx-auto mb-4 h-4 w-28" />
        <div className="skeleton mx-auto mb-3 h-10 w-80 max-w-full" />
        <div className="skeleton mx-auto mb-6 h-5 w-64 max-w-full" />
        <div className="skeleton mx-auto h-11 w-40 rounded-control" />
      </div>

      {/* Content skeleton */}
      <div className="shell py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="aecc-card overflow-hidden">
              <div className="skeleton h-44 rounded-none" />
              <div className="p-5">
                <div className="skeleton mb-2 h-4 w-3/4" />
                <div className="skeleton h-3 w-full" />
                <div className="skeleton mt-1 h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
