import type { IconType } from "react-icons";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface ShapeToolProps {
  onClick: () => void;
  icon: LucideIcon | IconType;
  iconClassName?: string;
  label?: string;
};

export const ShapeTool = ({
  onClick,
  icon: Icon,
  iconClassName,
  label
}: ShapeToolProps) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1 aspect-square border rounded-lg p-2 hover:bg-gray-50 transition"
    >
      <Icon className={cn("h-6 w-6", iconClassName)} />
      {label && (
        <span className="text-[9px] text-gray-500 text-center leading-tight">{label}</span>
      )}
    </button>
  );
};
