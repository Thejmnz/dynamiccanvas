"use client";

import { Home, Code } from "lucide-react";
import { usePathname } from "next/navigation";

import { SidebarItem } from "./sidebar-item";
import { useLanguage } from "@/lib/contexts/LanguageContext";

export const SidebarRoutes = () => {
  const { t } = useLanguage();
  const pathname = usePathname();

  return (
    <div className="flex flex-col flex-1 px-3 pt-4">
      <ul className="flex flex-col gap-y-1">
        <SidebarItem href="/dashboard" icon={Home} label={t("home")} isActive={pathname === "/dashboard"} />
        <SidebarItem href="/api-integration" icon={Code} label={t("api_integration")} isActive={pathname === "/api-integration"} />
      </ul>
    </div>
  );
};
