"use client";

import { useEffect } from "react";

import {
  LayoutTemplate,
  ImageIcon,
  Pencil,
  Shapes,
  Type,
  Upload,
  QrCode,
  Barcode,
  Spline,
} from "lucide-react";

import { ActiveTool } from "@/features/editor/types";
import { SidebarItem } from "@/features/editor/components/sidebar-item";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { prefetchPixabayGallery } from "@/features/editor/pixabay-cache";

interface SidebarProps {
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const Sidebar = ({
  activeTool,
  onChangeActiveTool,
}: SidebarProps) => {
  const { language } = useLanguage();

  useEffect(() => {
    // Warm Pixabay shortly after the editor becomes interactive, without
    // competing with the initial Fabric canvas load.
    const timer = window.setTimeout(() => {
      prefetchPixabayGallery(language === "es" ? "es" : "en");
    }, 700);
    return () => window.clearTimeout(timer);
  }, [language]);

  return (
    <aside className="flex h-full w-[64px] shrink-0 flex-col overflow-hidden border-r border-[#101426]/10 bg-white text-[#101426] shadow-[8px_0_30px_rgba(16,20,38,.035)]">
      <ul className="flex h-full min-h-0 flex-col py-2">
        <SidebarItem
          icon={LayoutTemplate}
          label="Design"
          isActive={activeTool === "templates"}
          onClick={() => onChangeActiveTool("templates")}
        />
        <SidebarItem
          icon={ImageIcon}
          label="Image"
          isActive={activeTool === "images"}
          onClick={() => onChangeActiveTool("images")}
          onMouseEnter={() => prefetchPixabayGallery(language === "es" ? "es" : "en")}
        />
        <SidebarItem
          icon={Upload}
          label="Uploads"
          isActive={activeTool === "uploads"}
          onClick={() => onChangeActiveTool("uploads")}
        />
        <SidebarItem
          icon={Type}
          label="Text"
          isActive={activeTool === "text"}
          onClick={() => onChangeActiveTool("text")}
        />
        <SidebarItem
          icon={Shapes}
          label="Shapes"
          isActive={activeTool === "shapes"}
          onClick={() => onChangeActiveTool("shapes")}
        />
        <SidebarItem
          icon={QrCode}
          label="QR Code"
          isActive={activeTool === "qrcode"}
          onClick={() => onChangeActiveTool("qrcode")}
        />
        <SidebarItem
          icon={Barcode}
          label="Barcode"
          isActive={activeTool === "barcode"}
          onClick={() => onChangeActiveTool("barcode")}
        />
        <SidebarItem
          icon={Spline}
          label="Icons"
          isActive={activeTool === "vector"}
          onClick={() => onChangeActiveTool("vector")}
        />
        <SidebarItem
          icon={Pencil}
          label="Draw"
          isActive={activeTool === "draw"}
          onClick={() => onChangeActiveTool("draw")}
        />
      </ul>
    </aside>
  );
};
