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
        "mx-1 my-0.5 h-[48px] w-[calc(100%-8px)] shrink flex-col rounded-lg p-1 text-white/60 hover:bg-white/10 hover:text-white",
        isActive && "bg-[#c9ff5a] text-[#101426] hover:bg-[#c9ff5a] hover:text-[#101426]"
      )}
    >
      <Icon className="size-4 shrink-0 stroke-2" />
      <span className="mt-0.5 text-[9px] leading-none">
        {label}
      </span>
    </Button>
  );
};
