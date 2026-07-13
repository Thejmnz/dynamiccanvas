"use client";

import { Home, Code, Shield, KeyRound, BookOpen, Images, MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";

import { SidebarItem } from "./sidebar-item";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { CreateTemplateModal } from "./create-template-modal";
import { useUserRole } from "@/hooks/use-user-role";

export const SidebarRoutes = () => {
  const { t, language } = useLanguage();
  const pathname = usePathname();
  const { role } = useUserRole();

  const openSupportChat = () => {
    window.$crisp = window.$crisp || [];
    window.$crisp.push(["do", "chat:show"]);
    window.$crisp.push(["do", "chat:open"]);
  };

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
          onboardingId="api-key"
        />
        <SidebarItem
          href="/playground"
          icon={Code}
          label={t("api_integration")}
          isActive={pathname === "/playground"}
          onboardingId="playground"
        />
        <SidebarItem
          href="/renders"
          icon={Images}
          label="Renders"
          isActive={pathname === "/renders"}
        />

        {/* Admin button - only visible for superadmins */}
        {role === "superadmin" && (
          <SidebarItem
            href="/admin"
            icon={Shield}
            label={t("admin")}
            isActive={pathname === "/admin"}
          />
        )}
      </ul>

      <div className="mt-auto space-y-1 border-t border-white/10 pb-5 pt-4">
        <SidebarItem
          href="/docs"
          icon={BookOpen}
          label={t("documentation")}
          isActive={pathname === "/docs"}
        />
        <button
          type="button"
          onClick={openSupportChat}
          data-onboarding="support"
          className="flex w-full items-center rounded-xl border border-transparent px-3.5 py-3 text-left text-white/60 transition-all duration-200 hover:bg-white/10 hover:text-white"
        >
          <MessageCircle className="mr-2 size-4 stroke-2" />
          <span className="text-sm font-medium">
            {language === "es" ? "Chat de soporte" : "Chat Support"}
          </span>
        </button>
      </div>
    </div>
  );
};
