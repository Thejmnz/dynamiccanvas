import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export const Logo = () => {
  return (
    <Link href="/dashboard" aria-label="Dynamic Canvas" className="m-5 flex w-fit transition hover:-translate-y-0.5">
      <BrandMark className="size-12 text-base shadow-[4px_4px_0_#c9ff5a]" />
    </Link>
  );
};
