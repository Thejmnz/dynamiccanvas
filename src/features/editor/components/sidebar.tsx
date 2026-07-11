"use client";

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

interface SidebarProps {
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const Sidebar = ({
  activeTool,
  onChangeActiveTool,
}: SidebarProps) => {
  return (
    <aside className="flex h-full w-[88px] shrink-0 flex-col overflow-hidden border-r-2 border-[#101426] bg-[#101426] text-white">
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
