import Link from "next/link";
import { BrandLogo } from "@/components/brand-mark";

export const Logo = () => {
  return (
    <Link href="/dashboard" aria-label="Dynamic Canvas" className="flex w-full justify-center px-5 py-5 transition hover:-translate-y-0.5">
      <BrandLogo className="h-14" />
    </Link>
  );
};
