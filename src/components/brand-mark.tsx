import { cn } from "@/lib/utils";

export const BrandMark = ({ className }: { className?: string }) => (
  <span
    aria-hidden="true"
    className={cn(
      "flex size-9 shrink-0 items-center justify-center rounded-xl border-2 border-[#101426] bg-[#5b35d5] text-sm font-black tracking-[-0.06em] text-white shadow-[3px_3px_0_#c9ff5a]",
      className,
    )}
  >
    DC
  </span>
);
