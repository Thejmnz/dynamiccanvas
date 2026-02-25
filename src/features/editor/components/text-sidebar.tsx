import { useLanguage } from "@/lib/contexts/LanguageContext";
import {
  ActiveTool,
  Editor,
} from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TextSidebarProps {
  editor: any;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const TextSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: TextSidebarProps) => {
  const { t, language } = useLanguage();

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const buttonStyle = {
    backgroundColor: 'rgb(249 250 251)',
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.borderColor = 'rgb(147 197 253)';
    e.currentTarget.style.backgroundColor = '#EFF6FF';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.borderColor = 'transparent';
    e.currentTarget.style.backgroundColor = 'rgb(249 250 251)';
  };

  return (
    <aside
      className={cn(
        "absolute left-0 top-0 bg-white border-r z-[40] w-[360px] h-full flex flex-col shadow-lg",
        activeTool === "text" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title={language === "es" ? "Texto" : "Text"}
        description={language === "es" ? "Agrega texto a tu lienzo" : "Add text to your canvas"}
      />
      <ScrollArea>
        <div className="p-4 space-y-4 border-b">
          {/* Título */}
          <div>
            <h3 className="text-xs font-medium text-gray-500 mb-2">
              {language === "es" ? "Agregar Texto" : "Add Text"}
            </h3>
            <div className="flex flex-col gap-3">
              {/* Heading */}
              <button
                onClick={() => editor?.addText?.("Heading", {
                  fontSize: 80,
                  fontWeight: 700,
                })}
                className="h-20 rounded-lg hover:border-2 transition-colors flex items-center justify-center"
                style={buttonStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                title={language === "es" ? "Título" : "Heading"}
              >
                <span className="text-xl font-bold text-gray-700">
                  {language === "es" ? "Título" : "Heading"}
                </span>
              </button>
              {/* Subheading */}
              <button
                onClick={() => editor?.addText?.("Subheading", {
                  fontSize: 44,
                  fontWeight: 600,
                })}
                className="h-16 rounded-lg hover:border-2 transition-colors flex items-center justify-center"
                style={buttonStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                title={language === "es" ? "Subtítulo" : "Subheading"}
              >
                <span className="text-lg font-semibold text-gray-700">
                  {language === "es" ? "Subtítulo" : "Subheading"}
                </span>
              </button>
              {/* Textbox */}
              <button
                onClick={() => editor?.addText?.("Textbox")}
                className="h-14 rounded-lg hover:border-2 transition-colors flex items-center justify-center"
                style={buttonStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                title={language === "es" ? "Caja de texto" : "Text box"}
              >
                <span className="text-base font-medium text-gray-700">
                  {language === "es" ? "Caja de Texto" : "Text Box"}
                </span>
              </button>
              {/* Paragraph */}
              <button
                onClick={() => editor?.addText?.("Paragraph", {
                  fontSize: 32,
                })}
                className="h-14 rounded-lg hover:border-2 transition-colors flex items-center justify-center"
                style={buttonStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                title={language === "es" ? "Párrafo" : "Paragraph"}
              >
                <span className="text-base font-normal text-gray-700">
                  {language === "es" ? "Párrafo" : "Paragraph"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
