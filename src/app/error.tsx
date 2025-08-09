"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="wrap py-16 space-y-4">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      {error?.message && (
        <p className="text-muted break-words">{error.message}</p>
      )}
      <button
        className="underline"
        onClick={() => {
          reset();
        }}
      >
        Try again
      </button>
    </main>
  );
}
