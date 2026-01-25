"use client";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/contexts/LanguageContext";

export const LanguageSwitcher = () => {
    const { language, setLanguage } = useLanguage();

    return (
        <Button
            variant="ghost"
            size="sm"
            className="font-bold w-10 h-10 rounded-full"
            onClick={() => setLanguage(language === "en" ? "es" : "en")}
        >
            {language.toUpperCase()}
        </Button>
    );
};
