import Image from "next/image";
import { cn } from "@/lib/utils";

export const BrandMark = ({ className }: { className?: string }) => (
  <span
    aria-hidden="true"
    className={cn(
      "relative block size-9 shrink-0 overflow-hidden",
      className,
    )}
  >
    <Image
      src="/dynamic-canvas-logo.png"
      alt=""
      width={967}
      height={361}
      className="absolute inset-y-0 left-0 h-full w-auto max-w-none select-none object-left"
      draggable={false}
    />
  </span>
);

export const BrandLogo = ({ className }: { className?: string }) => (
  <Image
    src="/dynamic-canvas-logo.png"
    alt="Dynamic Canvas"
    width={967}
    height={361}
    className={cn("h-10 w-auto select-none object-contain", className)}
    draggable={false}
  />
);
