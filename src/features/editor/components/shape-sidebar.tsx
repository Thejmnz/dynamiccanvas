"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { ShapeTool } from "@/features/editor/components/shape-tool";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import {
  SHAPE_CATEGORIES,
  SHAPE_LIBRARY,
} from "@/features/editor/shape-library";
import { ActiveTool, Editor } from "@/features/editor/types";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface ShapeSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const ShapeSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: ShapeSidebarProps) => {
  const { language } = useLanguage();

  return (
    <aside
      className={cn(
        "relative z-[40] flex h-full w-[320px] flex-col border-r bg-white",
        activeTool === "shapes" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title={language === "es" ? "Formas" : "Shapes"}
        description={language === "es"
          ? "Agrega formas editables al lienzo"
          : "Add editable shapes to your canvas"}
      />
      <ScrollArea>
        <div className="space-y-5 p-4">
          {SHAPE_CATEGORIES.map((category) => (
            <section key={category.id}>
              <h3 className="mb-2 text-xs font-medium text-slate-500">
                {category.label[language]}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {SHAPE_LIBRARY
                  .filter((shape) => shape.category === category.id)
                  .map((shape) => (
                    <ShapeTool
                      key={shape.kind}
                      label={shape.label[language]}
                      path={shape.path}
                      onClick={() => editor?.addShape(shape.kind)}
                    />
                  ))}
              </div>
            </section>
          ))}
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={() => onChangeActiveTool("select")} />
    </aside>
  );
};
