import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/utils";

export const BrandLoading = ({
  fullScreen = false,
  label = "Cargando",
  className,
}: {
  fullScreen?: boolean;
  label?: string;
  className?: string;
}) => (
  <div
    role="status"
    aria-live="polite"
    className={cn(
      "modern-app-background flex items-center justify-center bg-[#f8f9fc]",
      fullScreen ? "min-h-screen w-full" : "min-h-56 w-full rounded-[24px] border border-[#101426]/8",
      className,
    )}
  >
    <div className="flex flex-col items-center">
      <div className="relative">
        <span className="absolute -inset-5 animate-ping rounded-[24px] bg-[#5b35d5]/10 [animation-duration:1.8s]" />
        <BrandMark className="relative size-16 animate-[dc-loader-bob_1.15s_ease-in-out_infinite]" />
      </div>
      <div className="mt-7 flex items-center gap-1.5" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="size-2 rounded-full bg-[#5b35d5] animate-[dc-loader-dot_1s_ease-in-out_infinite]"
            style={{ animationDelay: `${index * 140}ms` }}
          />
        ))}
      </div>
      {label && (
        <span className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-[#101426]/45">
          {label}
        </span>
      )}
    </div>
  </div>
);
