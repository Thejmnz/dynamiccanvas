"use client";

// This component is now empty since create template was moved to navbar
// Keeping for backwards compatibility if referenced elsewhere

import { useLanguage } from "@/lib/contexts/LanguageContext";

export const TemplatesSection = () => {
  const { t } = useLanguage();

  return null;
};
