"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
      <TriangleAlert className="size-10 text-red-500" />
      <h2 className="text-xl font-bold text-slate-800">Something went wrong</h2>
      <p className="text-sm text-slate-500 max-w-md text-center">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-[#135bec] text-white rounded-lg font-medium hover:bg-[#135bec]/90 transition"
      >
        Try again
      </button>
    </div>
  );
}
