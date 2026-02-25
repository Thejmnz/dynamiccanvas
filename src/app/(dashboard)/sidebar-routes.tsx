"use client";

import { Home, Code, Shield, Plus, KeyRound } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";

import { SidebarItem } from "./sidebar-item";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { CreateTemplateModal } from "./create-template-modal";

export const SidebarRoutes = () => {
  const { t } = useLanguage();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col flex-1 px-3 pt-4">
      <ul className="flex flex-col gap-y-1">
        {/* Create Template Button */}
        <li>
          <CreateTemplateModal />
        </li>

        <SidebarItem
          href="/dashboard"
          icon={Home}
          label={t("home")}
          isActive={pathname === "/dashboard"}
        />
        <SidebarItem
          href="/api-key"
          icon={KeyRound}
          label={t("api_key")}
          isActive={pathname === "/api-key"}
        />
        <SidebarItem
          href="/api-integration"
          icon={Code}
          label={t("api_integration")}
          isActive={pathname === "/api-integration"}
        />

        {/* Admin button - only visible for superadmins */}
        {session?.user?.role === "superadmin" && (
          <SidebarItem
            href="/admin"
            icon={Shield}
            label={t("admin")}
            isActive={pathname === "/admin"}
          />
        )}
      </ul>
    </div>
  );
};
