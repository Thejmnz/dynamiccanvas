"use client";

import { TriangleAlert } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <TriangleAlert className="size-10 text-red-500" />
          <h2 className="text-xl font-bold">Something went wrong</h2>
          <button
            onClick={reset}
            className="px-4 py-2 bg-[#135bec] text-white rounded-lg font-medium"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
