import type { IconType } from "react-icons";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface ShapeToolProps {
  onClick: () => void;
  icon?: LucideIcon | IconType;
  iconClassName?: string;
  label?: string;
  path?: string;
};

export const ShapeTool = ({
  onClick,
  icon: Icon,
  iconClassName,
  label,
  path,
}: ShapeToolProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="group flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-[#101426]/15 bg-[#f6f5ef] p-3 transition hover:border-[#5b35d5] hover:bg-[#e9e5ff] hover:shadow-sm"
    >
      {path ? (
        <svg viewBox="0 0 100 100" className="h-10 w-10 overflow-visible" aria-hidden="true">
          <path
            d={path}
            fill="currentColor"
            fillRule="evenodd"
            className="text-slate-700 transition-colors group-hover:text-[#5b35d5]"
          />
        </svg>
      ) : Icon ? (
        <Icon className={cn("h-10 w-10", iconClassName)} />
      ) : null}
      {label ? <span className="w-full truncate text-[10px] text-slate-500">{label}</span> : null}
    </button>
  );
};
