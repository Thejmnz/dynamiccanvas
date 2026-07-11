import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
      <FileQuestion className="size-12 text-slate-400" />
      <h1 className="text-2xl font-bold text-slate-800">404 - Page Not Found</h1>
      <p className="text-sm text-slate-500">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link
        href="/"
        className="px-4 py-2 bg-[#135bec] text-white rounded-lg font-medium hover:bg-[#135bec]/90 transition"
      >
        Go home
      </Link>
    </div>
  );
}
