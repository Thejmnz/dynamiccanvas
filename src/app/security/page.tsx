"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/language-switcher";
import { BrandLogo } from "@/components/brand-mark";

export default function SecurityPage() {
  const { t } = useLanguage();

  return (
    <div className="legal-modern min-h-screen bg-[#fafafe] text-[#101426] antialiased">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-[#101426]/10 bg-white/90 shadow-[0_8px_30px_rgba(16,20,38,.035)] backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link
              href="/"
              className="flex items-center gap-2 group cursor-pointer"
            >
              <BrandLogo className="h-9" />
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-black text-white mb-4">
          {t("security_title")}
        </h1>
        <p className="text-slate-400 mb-8">
          {t("last_updated")}: January 2025
        </p>

        <div className="prose prose-invert prose-slate max-w-none">
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t("security_intro_title")}
            </h2>
            <p className="text-slate-300 leading-relaxed">
              {t("security_intro_desc")}
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t("security_infrastructure_title")}
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              {t("security_infrastructure_desc")}
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>{t("security_infrastructure_hosting")}</li>
              <li>{t("security_infrastructure_encryption")}</li>
              <li>{t("security_infrastructure_backups")}</li>
              <li>{t("security_infrastructure_monitoring")}</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t("security_api_title")}
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              {t("security_api_desc")}
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>{t("security_api_keys")}</li>
              <li>{t("security_api_https")}</li>
              <li>{t("security_api_rate")}</li>
              <li>{t("security_api_audit")}</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t("security_data_title")}
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              {t("security_data_desc")}
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>{t("security_data_rest")}</li>
              <li>{t("security_data_transit")}</li>
              <li>{t("security_data_retention")}</li>
              <li>{t("security_data_deletion")}</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t("security_access_title")}
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              {t("security_access_desc")}
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>{t("security_access_authentication")}</li>
              <li>{t("security_access_authorization")}</li>
              <li>{t("security_access_least")}</li>
              <li>{t("security_access_logging")}</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t("security_compliance_title")}
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              {t("security_compliance_desc")}
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>{t("security_compliance_gdpr")}</li>
              <li>{t("security_compliance_soc")}</li>
              <li>{t("security_compliance_pci")}</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t("security_incident_title")}
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              {t("security_incident_desc")}
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>{t("security_incident_detection")}</li>
              <li>{t("security_incident_response")}</li>
              <li>{t("security_incident_notification")}</li>
              <li>{t("security_incident_post")}</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t("security_vulnerability_title")}
            </h2>
            <p className="text-slate-300 leading-relaxed">
              {t("security_vulnerability_desc")}
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t("security_contact_title")}
            </h2>
            <p className="text-slate-300 leading-relaxed">
              {t("security_contact_desc")}{" "}
              <a
                href="mailto:security@dynamiccanvas.com"
                className="text-[#135bec] hover:underline"
              >
                security@dynamiccanvas.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10">
          <Link
            href="/"
            className="text-[#135bec] hover:underline flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            {t("back_to_home")}
          </Link>
        </div>
      </main>
    </div>
  );
}
