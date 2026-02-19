import { ActiveTool, Editor } from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useLanguage } from "@/lib/contexts/LanguageContext";
import { Sparkles } from "lucide-react";

interface AiSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const AiSidebar = ({
  activeTool,
  onChangeActiveTool,
}: AiSidebarProps) => {
  const { t } = useLanguage();

  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "ai" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="AI"
        description={t("ai_description")}
      />
      <ScrollArea>
        <div className="flex flex-col items-center justify-center h-[300px] p-6 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Sparkles className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{t("coming_soon")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("ai_coming_soon_desc")}
          </p>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
