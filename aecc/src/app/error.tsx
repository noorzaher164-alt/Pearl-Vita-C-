'use client';

import { useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaced to the server logs; the digest is what a supervisor would quote.
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-dvh place-items-center bg-ivory px-6 py-16">
      <div className="w-full max-w-md text-center">
        <h1 className="font-brand text-h1 text-plum">Something went wrong</h1>
        <p className="mt-3 text-body text-ink-muted">
          An unexpected error occurred. Please try again.
        </p>
        {error.digest ? (
          <p className="mt-2 font-mono text-caption text-ink-faint">{error.digest}</p>
        ) : null}
        <button type="button" onClick={reset} className="btn btn-primary mt-8">
          <RotateCcw className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.75} />
          Try again
        </button>
      </div>
    </main>
  );
}
