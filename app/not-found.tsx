'use client';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold mb-2">Page not found</h1>
        <p className="text-slate-600 mb-6">
          The page you are looking for doesn’t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          aria-label="Go back to home"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
