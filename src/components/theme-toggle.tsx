"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/contexts/ThemeContext";
import { useLanguage } from "@/lib/contexts/LanguageContext";

export const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    const { t } = useLanguage();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
            title={theme === "dark" ? t("light_mode") : t("dark_mode")}
        >
            {theme === "dark" ? (
                <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
                <Moon className="h-5 w-5 text-slate-600" />
            )}
        </Button>
    );
};
