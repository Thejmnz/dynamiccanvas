import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  disabled?: boolean;
};

export const SidebarItem = ({
  icon: Icon,
  label,
  isActive,
  onClick,
  disabled,
}: SidebarItemProps) => {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full h-full aspect-video p-3 py-4 flex flex-col rounded-none group transition-all duration-200",
        isActive && "bg-muted text-primary",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <Icon className="size-5 stroke-2 shrink-0 transition-transform duration-200 group-hover:scale-110 group-active:scale-95" />
      <span className="mt-2 text-xs transition-all duration-200 group-hover:font-medium">
        {label}
      </span>
    </Button>
  );
};
