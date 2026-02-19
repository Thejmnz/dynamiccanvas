import Link from "next/link";

export const Logo = () => {
  return (
    <Link href="/dashboard">
      <div className="flex items-center gap-2 hover:opacity-75 transition px-6 py-4">
        <div className="w-8 h-8 bg-[#135bec] rounded-lg flex items-center justify-center text-white font-bold text-sm">
          DC
        </div>
        <span className="text-lg font-bold text-slate-900">Dynamic Canvas</span>
      </div>
    </Link>
  );
};
