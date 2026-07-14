import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  onMouseEnter?: () => void;
};

export const SidebarItem = ({
  icon: Icon,
  label,
  isActive,
  onClick,
  onMouseEnter,
}: SidebarItemProps) => {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onFocus={onMouseEnter}
      className={cn(
        "mx-1 my-0.5 h-[48px] w-[calc(100%-8px)] shrink flex-col rounded-lg p-1 text-[#596174] hover:bg-[#f6f5fb] hover:text-[#101426]",
        isActive && "bg-[#eeeaff] font-bold text-[#5b35d5] hover:bg-[#eeeaff] hover:text-[#5b35d5]"
      )}
    >
      <Icon className="size-5 shrink-0 stroke-[2.2]" />
      <span className="mt-0.5 text-[9px] leading-none">
        {label}
      </span>
    </Button>
  );
};
