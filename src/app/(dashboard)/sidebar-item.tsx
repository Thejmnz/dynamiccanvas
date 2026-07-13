import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isActive?: boolean;
  onClick?: () => void;
  onboardingId?: string;
};

export const SidebarItem = ({
  icon: Icon,
  label,
  href,
  isActive,
  onClick,
  onboardingId,
}: SidebarItemProps) => {
  return (
    <Link href={href} onClick={onClick} data-onboarding={onboardingId}>
      <div className={cn(
        "flex items-center px-3.5 py-3 rounded-xl border border-transparent transition-all duration-200",
        "text-white/60 hover:bg-white/10 hover:text-white",
        isActive && "border-[#c9ff5a] bg-[#c9ff5a] text-[#101426] font-bold shadow-[4px_4px_0_rgba(201,255,90,.18)]",
      )}>
        <Icon className="size-4 mr-2 stroke-2" />
        <span className="text-sm font-medium">
          {label}
        </span>
      </div>
    </Link>
  );
};
