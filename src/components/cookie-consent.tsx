"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/contexts/LanguageContext";

const COOKIE_CONSENT_KEY = "cookie-consent";

export function CookieConsent() {
  const { t } = useLanguage();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-slate-800/95 backdrop-blur border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg mb-2">
                {t("cookie_title")}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {t("cookie_description")}{" "}
                <Link
                  href="/privacy"
                  className="text-[#135bec] hover:underline font-medium"
                >
                  {t("cookie_learn_more")}
                </Link>
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <button
                onClick={handleDecline}
                className="px-5 py-2.5 rounded-lg border border-white/20 text-slate-300 hover:bg-white/5 transition-all text-sm font-medium"
              >
                {t("cookie_decline")}
              </button>
              <button
                onClick={handleAccept}
                className="px-5 py-2.5 rounded-lg bg-[#135bec] hover:bg-[#135bec]/90 text-white transition-all text-sm font-bold shadow-lg shadow-[#135bec]/20"
              >
                {t("cookie_accept")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
