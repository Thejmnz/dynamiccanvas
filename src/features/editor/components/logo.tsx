import Link from "next/link";

export const Logo = () => {
  return (
    <Link href="/dashboard" className="hover:opacity-75 transition">
      <div className="w-8 h-8 bg-[#135bec] rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">
        DC
      </div>
    </Link>
  );
};
