import { Sparkles, Loader2, FileQuestion } from "lucide-react";

import { useLanguage } from "@/lib/contexts/LanguageContext";
import {
  ActiveTool,
  Editor,
} from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConfirm } from "@/hooks/use-confirm";
import { useGetTemplates } from "@/features/projects/api/use-get-templates";

interface TemplateSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const TemplateSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: TemplateSidebarProps) => {
  const { t, language } = useLanguage();

  const [ConfirmDialog, confirm] = useConfirm(
    t("confirm_replace_template_title"),
    t("confirm_replace_template_desc")
  );

  // Fetch templates from the database (admin uploaded)
  const { data: templates, isLoading, isError } = useGetTemplates({
    page: "1",
    limit: "100",
  });

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const onClick = async (template: { json: string }) => {
    const ok = await confirm();

    if (ok && template.json) {
      editor?.loadJson(template.json);
    }
  };

  // Agrupar por categoría
  const categories = templates ? [...new Set(templates.map(t => t.category).filter(Boolean))] : [];

  return (
    <aside
      className={cn(
        "absolute left-0 top-0 bg-white border-r z-[40] w-[360px] h-full flex flex-col shadow-lg",
        activeTool === "templates" ? "visible" : "hidden",
      )}
    >
      <ConfirmDialog />
      <ToolSidebarHeader
        title={t("sidebar_templates_title")}
        description={t("sidebar_templates_desc")}
      />
      <ScrollArea className="flex-1">
        <div className="p-3">
          {/* Info banner */}
          <div className="mb-4 p-3 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 rounded-lg border border-purple-100">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-purple-500" />
              <span className="text-xs text-purple-700 font-medium">
                {language === "es" ? "Plantillas del administrador" : "Admin templates"}
              </span>
            </div>
            <p className="text-[10px] text-purple-600 mt-1">
              {language === "es"
                ? "Plantillas subidas desde el panel de administración"
                : "Templates uploaded from the admin panel"}
            </p>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="size-8 text-purple-500 animate-spin" />
              <p className="text-sm text-gray-500">
                {language === "es" ? "Cargando plantillas..." : "Loading templates..."}
              </p>
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <FileQuestion className="size-8 text-red-400" />
              <p className="text-sm text-gray-500">
                {language === "es" ? "Error al cargar plantillas" : "Error loading templates"}
              </p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && (!templates || templates.length === 0) && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <FileQuestion className="size-8 text-gray-300" />
              <p className="text-sm text-gray-500 text-center">
                {language === "es"
                  ? "No hay plantillas disponibles.\nSube plantillas desde el panel de administración."
                  : "No templates available.\nUpload templates from the admin panel."}
              </p>
            </div>
          )}

          {/* Templates by category */}
          {!isLoading && !isError && templates && templates.length > 0 && (
            categories.map(category => (
              <div key={category} className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
                  {category}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {templates.filter(t => t.category === category).map((template) => (
                    <button
                      key={template.id}
                      onClick={() => onClick(template)}
                      className="relative w-full group hover:opacity-80 transition bg-gray-100 rounded-md overflow-hidden border border-gray-200 hover:border-purple-400"
                      style={{
                        aspectRatio: `${template.width}/${template.height}`
                      }}
                    >
                      {template.thumbnailUrl ? (
                        <img
                          src={template.thumbnailUrl}
                          alt={template.name}
                          className="object-cover w-full h-full"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                          <Sparkles className="size-8 text-purple-300" />
                        </div>
                      )}
                      {/* Overlay con gradiente */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      {/* Nombre */}
                      <div className="absolute left-0 bottom-0 w-full p-2">
                        <p className="text-[10px] font-medium text-white truncate">
                          {template.name}
                        </p>
                        <p className="text-[8px] text-white/70">
                          {template.width} × {template.height}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
