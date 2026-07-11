import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export const Logo = () => {
  return (
    <Link
      href="/dashboard"
      aria-label="Ir al dashboard"
      className="transition hover:-translate-y-0.5"
    >
      <BrandMark />
    </Link>
  );
};
