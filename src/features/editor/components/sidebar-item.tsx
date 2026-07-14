import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  onClick: () => void;
};

export const SidebarItem = ({
  icon: Icon,
  label,
  isActive,
  onClick,
}: SidebarItemProps) => {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        "mx-1 my-0.5 h-[48px] w-[calc(100%-8px)] shrink flex-col rounded-lg p-1 text-white/75 hover:bg-white/10 hover:text-white",
        isActive && "bg-[#5b35d5] text-white shadow-[inset_3px_0_0_#c9ff5a] hover:bg-[#5b35d5] hover:text-white"
      )}
    >
      <Icon className="size-5 shrink-0 stroke-[2.2] text-white" />
      <span className="mt-0.5 text-[9px] leading-none">
        {label}
      </span>
    </Button>
  );
};
