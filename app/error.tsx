'use client';
import React, { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log to monitoring
    // eslint-disable-next-line no-console
    console.error('App error:', error);
  }, [error]);

  return (
    <div
      role="alert"
      className="p-6 rounded-lg bg-red-50 border border-red-200"
    >
      <h2 className="text-red-700 font-semibold mb-2">Something went wrong</h2>
      <p className="text-red-600 mb-4">
        An unexpected error occurred. You can try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        aria-label="Retry after error"
      >
        Try again
      </button>
    </div>
  );
}
