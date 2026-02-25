"use client";

import React, { useState, useCallback } from "react";
import { Search, Loader2, AlertCircle, Palette } from "lucide-react";

import { useLanguage } from "@/lib/contexts/LanguageContext";
import { ActiveTool, Editor } from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { debounce } from "lodash";

interface VectorSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

// Icon with color info
interface IconItem {
  name: string;
  color?: string; // If provided, icon will have this color
}

// Popular icons - social media, brands, and common icons (with colors)
const POPULAR_ICONS: IconItem[] = [
  // Social Media (brand colors)
  { name: "logos:facebook", color: "#1877F2" },
  { name: "logos:twitter", color: "#1DA1F2" },
  { name: "logos:instagram-icon", color: "#E4405F" },
  { name: "logos:youtube-icon", color: "#FF0000" },
  { name: "logos:linkedin-icon", color: "#0A66C2" },
  { name: "logos:whatsapp-icon", color: "#25D366" },
  { name: "logos:telegram", color: "#26A5E4" },
  { name: "logos:tiktok-icon", color: "#000000" },
  { name: "logos:pinterest", color: "#BD081C" },
  { name: "logos:reddit-icon", color: "#FF4500" },
  { name: "logos:discord-icon", color: "#5865F2" },
  { name: "logos:twitch", color: "#9146FF" },
  { name: "logos:spotify-icon", color: "#1DB954" },
  { name: "logos:soundcloud", color: "#FF5500" },
  { name: "logos:snapchat-icon", color: "#FFFC00" },
  { name: "logos:medium-icon", color: "#000000" },

  // Brands (brand colors)
  { name: "logos:netflix-icon", color: "#E50914" },
  { name: "logos:amazon-icon", color: "#FF9900" },
  { name: "logos:google-icon", color: "#4285F4" },
  { name: "logos:apple", color: "#000000" },
  { name: "logos:microsoft-icon", color: "#00A4EF" },
  { name: "logos:android-icon", color: "#3DDC84" },
  { name: "logos:github-icon", color: "#181717" },
  { name: "logos:gitlab-icon", color: "#FC6D26" },
  { name: "logos:slack-icon", color: "#4A154B" },
  { name: "logos:trello", color: "#0052CC" },
  { name: "logos:figma", color: "#F24E1E" },
  { name: "logos:dribbble-icon", color: "#EA4C89" },
  { name: "logos:behance", color: "#1769FF" },
  { name: "logos:skype", color: "#00AFF0" },
  { name: "logos:zoom-icon", color: "#2D8CFF" },
  { name: "logos:adobe-illustrator", color: "#FF9A00" },
  { name: "logos:adobe-photoshop", color: "#31A8FF" },
  { name: "logos:adobe-xd", color: "#FF61F6" },

  // Common icons (black)
  { name: "mdi:home", color: "#333333" },
  { name: "mdi:heart", color: "#E91E63" },
  { name: "mdi:star", color: "#FFC107" },
  { name: "mdi:cog", color: "#333333" },
  { name: "mdi:account-circle", color: "#333333" },
  { name: "mdi:bell", color: "#333333" },
  { name: "mdi:cart", color: "#333333" },
  { name: "mdi:email", color: "#333333" },
  { name: "mdi:phone", color: "#333333" },
  { name: "mdi:map-marker", color: "#F44336" },
  { name: "mdi:camera", color: "#333333" },
  { name: "mdi:image", color: "#333333" },
  { name: "mdi:music", color: "#9C27B0" },
  { name: "mdi:play-circle", color: "#4CAF50" },
  { name: "mdi:lock", color: "#333333" },
  { name: "mdi:eye", color: "#333333" },
  { name: "mdi:check-circle", color: "#4CAF50" },
  { name: "mdi:close-circle", color: "#F44336" },
  { name: "mdi:plus-circle", color: "#2196F3" },
  { name: "mdi:minus-circle", color: "#FF5722" },
  { name: "mdi:arrow-left-circle", color: "#333333" },
  { name: "mdi:arrow-right-circle", color: "#333333" },
  { name: "mdi:menu", color: "#333333" },
  { name: "mdi:share-variant", color: "#333333" },
  { name: "mdi:download", color: "#333333" },
  { name: "mdi:upload", color: "#333333" },
  { name: "mdi:fire", color: "#FF5722" },
  { name: "mdi:lightning-bolt", color: "#FFC107" },
  { name: "mdi:rocket-launch", color: "#9C27B0" },
  { name: "mdi:crown", color: "#FFC107" },
  { name: "mdi:diamond-stone", color: "#00BCD4" },
  { name: "mdi:gift", color: "#E91E63" },
  { name: "mdi:coffee", color: "#795548" },
  { name: "mdi:pizza", color: "#FF9800" },
  { name: "mdi:car", color: "#333333" },
  { name: "mdi:airplane", color: "#2196F3" },
  { name: "mdi:earth", color: "#4CAF50" },
  { name: "mdi:sun", color: "#FFC107" },
  { name: "mdi:moon-waning-crescent", color: "#3F51B5" },
  { name: "mdi:cloud", color: "#90A4AE" },
  { name: "mdi:water", color: "#2196F3" },
  { name: "mdi:leaf", color: "#4CAF50" },
  { name: "mdi:flower", color: "#E91E63" },
  { name: "mdi:cat", color: "#FF9800" },
  { name: "mdi:dog", color: "#795548" },
];

interface IconifySearchResponse {
  icons: string[];
  total: number;
}

export const VectorSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: VectorSidebarProps) => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [icons, setIcons] = useState<IconItem[]>(POPULAR_ICONS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentColor, setCurrentColor] = useState<string | null>(null);

  // Search icons using Iconify API
  const searchIcons = useCallback(async (query: string) => {
    if (!query.trim()) {
      setIcons(POPULAR_ICONS);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=60`
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      const data: IconifySearchResponse = await response.json();
      const searchResults = (data.icons || []).slice(0, 60).map(name => ({
        name,
        color: currentColor || "#333333"
      }));
      setIcons(searchResults);
    } catch (err) {
      console.error("Error searching icons:", err);
      setError(
        language === "es"
          ? "Error al buscar iconos"
          : "Error searching icons"
      );
    } finally {
      setIsLoading(false);
    }
  }, [language, currentColor]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      searchIcons(query);
    }, 400),
    [searchIcons]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim() === "") {
      setIcons(POPULAR_ICONS);
    } else {
      debouncedSearch(value);
    }
  };

  const handleIconClick = (icon: IconItem) => {
    const color = icon.color || currentColor || "#111111";
    const encodedColor = encodeURIComponent(color);
    const svgUrl = `https://api.iconify.design/${icon.name}.svg?color=${encodedColor}&width=200&height=200`;
    editor?.addImage(svgUrl);
  };

  const onClose = () => {
    onChangeActiveTool("select");
  };

  // Color picker for custom color
  const quickColors = [
    "#000000", "#FFFFFF", "#F44336", "#E91E63", "#9C27B0",
    "#673AB7", "#3F51B5", "#2196F3", "#03A9F4", "#00BCD4",
    "#009688", "#4CAF50", "#8BC34A", "#CDDC39", "#FFEB3B",
    "#FFC107", "#FF9800", "#FF5722", "#795548", "#9E9E9E",
  ];

  return (
    <aside
      className={cn(
        "absolute left-0 top-0 bg-white border-r z-[40] w-[360px] h-full flex flex-col shadow-lg",
        activeTool === "vectors" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader
        title={language === "es" ? "Vectores" : "Vectors"}
        description={language === "es" ? "Busca iconos y vectores" : "Search icons and vectors"}
      />

      <div className="p-4 border-b space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={language === "es" ? "Buscar iconos..." : "Search icons..."}
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>

        {/* Color picker */}
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-gray-500" />
          <span className="text-xs text-gray-500">
            {language === "es" ? "Color:" : "Color:"}
          </span>
          <div className="flex flex-wrap gap-1 flex-1">
            {quickColors.map((color) => (
              <button
                key={color}
                onClick={() => setCurrentColor(currentColor === color ? null : color)}
                className={cn(
                  "w-5 h-5 rounded border-2 transition-all",
                  currentColor === color ? "ring-2 ring-blue-500 ring-offset-1" : "border-gray-300"
                )}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-500 py-4">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {!isLoading && !error && icons.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {language === "es"
                ? "No se encontraron iconos"
                : "No icons found"}
            </div>
          )}

          {!isLoading && icons.length > 0 && (
            <div className="grid grid-cols-5 gap-2">
              {icons.map((icon) => {
                const displayColor = currentColor || icon.color || "#333333";
                const bgColor = displayColor === "#FFFFFF" ? "#f0f0f0" : "transparent";

                return (
                  <button
                    key={icon.name}
                    onClick={() => handleIconClick(icon)}
                    className="aspect-square bg-gray-50 rounded-lg p-1.5 hover:bg-blue-50 hover:ring-2 hover:ring-blue-300 transition-all flex items-center justify-center"
                    title={icon.name.split(":")[1]?.replace(/-/g, " ") || icon.name}
                    style={bgColor !== "transparent" ? { backgroundColor: bgColor } : {}}
                  >
                    <img
                      src={`https://api.iconify.design/${icon.name}.svg?color=${encodeURIComponent(displayColor)}&width=32&height=32`}
                      alt={icon.name}
                      className="w-6 h-6 object-contain"
                      loading="lazy"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Powered by */}
      <div className="p-3 border-t text-center">
        <span className="text-xs text-gray-400">
          {language === "es" ? "Provisto por" : "Powered by"}{" "}
          <a
            href="https://iconify.design"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-800"
          >
            Iconify
          </a>
        </span>
      </div>

      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
