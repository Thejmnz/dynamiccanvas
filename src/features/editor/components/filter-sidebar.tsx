import {
  ActiveTool,
  Editor,
  filters,
} from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { useLanguage } from "@/lib/contexts/LanguageContext";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface FilterSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const FilterSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: FilterSidebarProps) => {
  const { t } = useLanguage();

  const onClose = () => {
    onChangeActiveTool("select");
  };

  // Get the currently selected filter from the selected image element
  const selectedElement = editor?.getSelectedElements?.()?.[0];
  const currentFilter = selectedElement?.filterType || 'none';

  return (
    <aside
      className={cn(
        "absolute left-0 top-0 bg-white border-r z-[40] w-[360px] h-full flex flex-col shadow-lg",
        activeTool === "filter" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title={t("sidebar_filters_title")}
        description={t("sidebar_filters_desc")}
      />
      <ScrollArea>
        <div className="p-4 space-y-1 border-b">
          {filters.map((filter) => {
            const isSelected = currentFilter === filter;
            return (
              <Button
                key={filter}
                variant={isSelected ? "default" : "secondary"}
                size="lg"
                className={cn(
                  "w-full h-12 justify-start text-left relative",
                  isSelected && "bg-[#135bec] text-white hover:bg-[#135bec]/90"
                )}
                onClick={() => editor?.changeImageFilter(filter)}
              >
                <span className="capitalize">{filter}</span>
                {isSelected && (
                  <Check className="size-4 absolute right-3" />
                )}
              </Button>
            );
          })}
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
