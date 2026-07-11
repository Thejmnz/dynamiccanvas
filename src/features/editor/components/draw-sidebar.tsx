"use client";

import { 
  ActiveTool, 
  Editor, 
  STROKE_COLOR, 
  STROKE_WIDTH
} from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { ColorPicker } from "@/features/editor/components/color-picker";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/lib/contexts/LanguageContext";

interface DrawSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const DrawSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: DrawSidebarProps) => {
  const { t } = useLanguage();
  const colorValue = editor?.getActiveStrokeColor() || STROKE_COLOR;
  const widthValue = editor?.getActiveStrokeWidth() || STROKE_WIDTH;

  const onClose = () => {
    editor?.disableDrawingMode();
    onChangeActiveTool("select");
  };

  const onColorChange = (value: string) => {
    editor?.changeStrokeColor(value);
  };

  const onWidthChange = (value: number) => {
    editor?.changeStrokeWidth(value);
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[320px] h-full flex flex-col",
        activeTool === "draw" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title={t("sidebar_draw_title")}
        description={t("sidebar_draw_desc")}
      />
      <ScrollArea>
        <div className="p-4 space-y-6 border-b">
          <Label className="text-sm">
            {t("brush_width")}
          </Label>
          <Slider
            value={[widthValue]}
            onValueChange={(values) => onWidthChange(values[0])}
          />
        </div>
        <div className="p-4 space-y-6">
          <ColorPicker
            value={colorValue}
            onChange={onColorChange}
          />
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
