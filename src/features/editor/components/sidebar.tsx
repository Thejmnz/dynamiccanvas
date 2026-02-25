"use client";

import {
  LayoutTemplate,
  ImageIcon,
  Shapes,
  QrCode,
  Barcode,
  Type,
  Upload,
  Hexagon,
} from "lucide-react";

import { useLanguage } from "@/lib/contexts/LanguageContext";
import { ActiveTool } from "@/features/editor/types";
import { SidebarItem } from "@/features/editor/components/sidebar-item";

interface SidebarProps {
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const Sidebar = ({
  activeTool,
  onChangeActiveTool,
}: SidebarProps) => {
  const { t } = useLanguage();

  return (
    <aside className="bg-white flex flex-col w-[100px] h-full border-r overflow-y-auto">
      <ul className="flex flex-col">
        <SidebarItem
          icon={LayoutTemplate}
          label={t("tool_design")}
          isActive={activeTool === "templates"}
          onClick={() => onChangeActiveTool("templates")}
        />
        <SidebarItem
          icon={ImageIcon}
          label={t("tool_image")}
          isActive={activeTool === "images"}
          onClick={() => onChangeActiveTool("images")}
        />
        <SidebarItem
          icon={Upload}
          label={t("tool_uploads")}
          isActive={activeTool === "uploads"}
          onClick={() => onChangeActiveTool("uploads")}
        />
        <SidebarItem
          icon={Type}
          label={t("tool_text")}
          isActive={activeTool === "text"}
          onClick={() => onChangeActiveTool("text")}
        />
        <SidebarItem
          icon={Shapes}
          label={t("tool_shapes")}
          isActive={activeTool === "shapes"}
          onClick={() => onChangeActiveTool("shapes")}
        />
        <SidebarItem
          icon={Hexagon}
          label={t("tool_vectors")}
          isActive={activeTool === "vectors"}
          onClick={() => onChangeActiveTool("vectors")}
        />
        <SidebarItem
          icon={QrCode}
          label={t("tool_qrcode")}
          isActive={activeTool === "qrcode"}
          onClick={() => onChangeActiveTool("qrcode")}
        />
        <SidebarItem
          icon={Barcode}
          label={t("tool_barcode")}
          isActive={activeTool === "barcode"}
          onClick={() => onChangeActiveTool("barcode")}
        />
      </ul>
    </aside>
  );
};
