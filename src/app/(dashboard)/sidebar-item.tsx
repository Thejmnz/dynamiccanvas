"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isActive?: boolean;
  onClick?: () => void;
  onboardingId?: string;
  onPrefetch?: () => void;
};

export const SidebarItem = ({
  icon: Icon,
  label,
  href,
  isActive,
  onClick,
  onboardingId,
  onPrefetch,
}: SidebarItemProps) => {
  const router = useRouter();

  return (
    <Link
      href={href}
      onClick={onClick}
      data-onboarding={onboardingId}
      onMouseEnter={() => {
        router.prefetch(href);
        onPrefetch?.();
      }}
      onFocus={() => {
        router.prefetch(href);
        onPrefetch?.();
      }}
    >
      <div className={cn(
        "flex items-center rounded-xl px-3.5 py-3 transition-all duration-200",
        "text-[#596174] hover:bg-[#f6f5fb] hover:text-[#101426]",
        isActive && "bg-[#eeeaff] font-bold text-[#5b35d5]",
      )}>
        <Icon className="mr-3 size-[18px] stroke-2" />
        <span className="text-sm font-semibold">
          {label}
        </span>
      </div>
    </Link>
  );
};
