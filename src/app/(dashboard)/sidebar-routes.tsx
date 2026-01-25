"use client";

import { CreditCard, Crown, Home, MessageCircleQuestion, Code } from "lucide-react";
import { usePathname } from "next/navigation";

import { usePaywall } from "@/features/subscriptions/hooks/use-paywall";
import { useCheckout } from "@/features/subscriptions/api/use-checkout";
import { useBilling } from "@/features/subscriptions/api/use-billing";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { SidebarItem } from "./sidebar-item";
import { useLanguage } from "@/lib/contexts/LanguageContext";

export const SidebarRoutes = () => {
  const mutation = useCheckout();
  const billingMutation = useBilling();
  const { shouldBlock, isLoading, triggerPaywall } = usePaywall();
  const { t } = useLanguage();

  const pathname = usePathname();

  const onClick = () => {
    if (shouldBlock) {
      triggerPaywall();
      return;
    }

    billingMutation.mutate();
  };

  return (
    <div className="flex flex-col gap-y-4 flex-1">
      <ul className="flex flex-col gap-y-1 px-3">
        <SidebarItem href="/" icon={Home} label={t("home")} isActive={pathname === "/"} />
        <SidebarItem href="/api-integration" icon={Code} label={t("api_integration")} isActive={pathname === "/api-integration"} />
      </ul>
    </div>
  );
};
