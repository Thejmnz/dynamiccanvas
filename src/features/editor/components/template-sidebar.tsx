import Image from "next/image";
import { AlertTriangle, Loader, Crown } from "lucide-react";

import { useLanguage } from "@/lib/contexts/LanguageContext";
import {
  ActiveTool,
  Editor,
} from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";

import { ResponseType, useGetTemplates } from "@/features/projects/api/use-get-templates";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConfirm } from "@/hooks/use-confirm";

interface TemplateSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const TemplateSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: TemplateSidebarProps) => {
  const { t } = useLanguage();

  const [ConfirmDialog, confirm] = useConfirm(
    t("confirm_replace_template_title"),
    t("confirm_replace_template_desc")
  );

  const { data, isLoading, isError } = useGetTemplates({
    limit: "20",
    page: "1",
  });

  // DEBUG: Log para ver qué datos llegan
  console.log("🎨 Templates loaded:", data);
  console.log("🎨 Is loading:", isLoading);
  console.log("🎨 Is error:", isError);

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const onClick = async (template: ResponseType["data"][0]) => {
    const ok = await confirm();

    if (ok) {
      editor?.loadJson(template.json);
    }
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "templates" ? "visible" : "hidden",
      )}
    >
      <ConfirmDialog />
      <ToolSidebarHeader
        title={t("sidebar_templates_title")}
        description={t("sidebar_templates_desc")}
      />
      {isLoading && (
        <div className="flex items-center justify-center flex-1">
          <Loader className="size-4 text-muted-foreground animate-spin" />
        </div>
      )}
      {isError && (
        <div className="flex flex-col gap-y-4 items-center justify-center flex-1">
          <AlertTriangle className="size-4 text-muted-foreground" />
          <p className="text-muted-foreground text-xs">
            {t("templates_fetch_failed")}
          </p>
        </div>
      )}
      <ScrollArea>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {data && data.map((template) => {
              return (
                <button
                  style={{
                    aspectRatio: `${template.width}/${template.height}`
                  }}
                  onClick={() => onClick(template)}
                  key={template.id}
                  className="relative w-full group hover:opacity-75 transition bg-muted rounded-sm overflow-hidden border"
                >
                  <Image
                    fill
                    src={template.thumbnailUrl || ""}
                    alt={template.name || "Template"}
                    className="object-cover"
                  />
                  {template.isPro && (
                    <div className="absolute top-2 right-2 size-8 items-center flex justify-center bg-black/50 rounded-full">
                      <Crown className="size-4 fill-yellow-500 text-yellow-500" />
                    </div>
                  )}
                  <div
                    className="opacity-0 group-hover:opacity-100 absolute left-0 bottom-0 w-full text-[10px] truncate text-white p-1 bg-black/50 text-left"
                  >
                    {template.name}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
