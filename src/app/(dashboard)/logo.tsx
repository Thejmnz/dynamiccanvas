import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export const Logo = () => {
  return (
    <Link href="/dashboard" aria-label="Dynamic Canvas" className="m-5 flex items-center gap-4 w-fit transition hover:-translate-y-0.5">
      <BrandMark className="size-10 text-base shadow-[3px_3px_0_#c9ff5a]" />
      <span className="text-lg font-black tracking-[-0.04em] text-white">Dynamic Canvas</span>
    </Link>
  );
};
