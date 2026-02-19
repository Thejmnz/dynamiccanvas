"use client";

import { UserButton } from "@/features/auth/components/user-button"
import { useAuth } from "@/lib/contexts/AuthContext";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export const Navbar = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <nav className="w-full flex items-center justify-end px-6 py-4">
      <div className="flex items-center gap-x-3">
        <LanguageSwitcher />
        <UserButton />
        {!user && !loading && (
          <Button onClick={() => router.push("/sign-in")}>
            {t("sign_in")}
          </Button>
        )}
      </div>
    </nav>
  );
};
