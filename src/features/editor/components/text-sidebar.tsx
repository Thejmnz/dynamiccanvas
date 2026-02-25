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

const PRESET_TITLES = [
  { text: "SPECIAL OFFER", color: "#ef4444", fontFamily: "Impact", fontSize: 60 },
  { text: "DOWNLOAD NOW", color: "#22c55e", fontFamily: "Arial Black", fontSize: 56 },
  { text: "BEST SELLER", color: "#f59e0b", fontFamily: "Georgia", fontSize: 58 },
  { text: "BUY HERE", color: "#3b82f6", fontFamily: "Verdana", fontSize: 54 },
  { text: "SALE", color: "#ec4899", fontFamily: "Impact", fontSize: 72 },
  { text: "NEW ARRIVAL", color: "#8b5cf6", fontFamily: "Trebuchet MS", fontSize: 52 },
  { text: "LIMITED TIME", color: "#06b6d4", fontFamily: "Arial Black", fontSize: 50 },
  { text: "FREE SHIPPING", color: "#10b981", fontFamily: "Tahoma", fontSize: 48 },
  { text: "HOT DEAL", color: "#f97316", fontFamily: "Impact", fontSize: 64 },
  { text: "50% OFF", color: "#dc2626", fontFamily: "Arial Black", fontSize: 68 },
  { text: "EXCLUSIVE", color: "#7c3aed", fontFamily: "Georgia", fontSize: 54 },
  { text: "COMING SOON", color: "#0ea5e9", fontFamily: "Trebuchet MS", fontSize: 52 },
  { text: "SUMMER SALE", color: "#fbbf24", fontFamily: "Impact", fontSize: 56 },
  { text: "WINTER DEAL", color: "#38bdf8", fontFamily: "Arial Black", fontSize: 52 },
  { text: "MUST HAVE", color: "#f472b6", fontFamily: "Georgia", fontSize: 50 },
  { text: "TRENDING", color: "#a855f7", fontFamily: "Verdana", fontSize: 48 },
  { text: "FLASH SALE", color: "#ef4444", fontFamily: "Impact", fontSize: 58 },
  { text: "GET IT NOW", color: "#22c55e", fontFamily: "Arial Black", fontSize: 52 },
  { text: "TOP RATED", color: "#eab308", fontFamily: "Georgia", fontSize: 50 },
  { text: "POPULAR", color: "#f97316", fontFamily: "Trebuchet MS", fontSize: 48 },
  { text: "WOW!", color: "#ec4899", fontFamily: "Impact", fontSize: 80 },
  { text: "AMAZING", color: "#8b5cf6", fontFamily: "Arial Black", fontSize: 56 },
  { text: "DON'T MISS", color: "#dc2626", fontFamily: "Georgia", fontSize: 48 },
  { text: "HURRY UP!", color: "#f59e0b", fontFamily: "Impact", fontSize: 54 },
  { text: "TODAY ONLY", color: "#0ea5e9", fontFamily: "Arial Black", fontSize: 46 },
  { text: "MEGA SALE", color: "#be185d", fontFamily: "Impact", fontSize: 62 },
  { text: "BLACK FRIDAY", color: "#1f2937", fontFamily: "Arial Black", fontSize: 52 },
  { text: "CYBER MONDAY", color: "#2563eb", fontFamily: "Impact", fontSize: 48 },
  { text: "BIG SAVE", color: "#16a34a", fontFamily: "Georgia", fontSize: 54 },
  { text: "PREMIUM", color: "#b45309", fontFamily: "Times New Roman", fontSize: 50 },
];

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
        <div className="p-4 space-y-4">
          {/* Título */}
          <div>
            <h3 className="text-xs font-medium text-gray-500 mb-2">
              {language === "es" ? "Agregar Texto" : "Add Text"}
            </h3>
            <div className="flex flex-col gap-2">
              {/* Heading */}
              <button
                onClick={() => editor?.addText?.("Heading", {
                  fontSize: 80,
                  fontWeight: 700,
                })}
                className="h-12 rounded-lg hover:border-2 transition-colors flex items-center justify-center"
                style={buttonStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                title={language === "es" ? "Título" : "Heading"}
              >
                <span className="text-2xl font-bold text-gray-700">
                  {language === "es" ? "Título" : "Heading"}
                </span>
              </button>
              {/* Subheading */}
              <button
                onClick={() => editor?.addText?.("Subheading", {
                  fontSize: 44,
                  fontWeight: 600,
                })}
                className="h-10 rounded-lg hover:border-2 transition-colors flex items-center justify-center"
                style={buttonStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                title={language === "es" ? "Subtítulo" : "Subheading"}
              >
                <span className="text-xl font-semibold text-gray-700">
                  {language === "es" ? "Subtítulo" : "Subheading"}
                </span>
              </button>
              {/* Textbox */}
              <button
                onClick={() => editor?.addText?.("Textbox")}
                className="h-9 rounded-lg hover:border-2 transition-colors flex items-center justify-center"
                style={buttonStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                title={language === "es" ? "Caja de texto" : "Text box"}
              >
                <span className="text-lg font-medium text-gray-700">
                  {language === "es" ? "Caja de Texto" : "Text Box"}
                </span>
              </button>
              {/* Paragraph */}
              <button
                onClick={() => editor?.addText?.("Paragraph", {
                  fontSize: 32,
                })}
                className="h-8 rounded-lg hover:border-2 transition-colors flex items-center justify-center"
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

          {/* Preset Titles */}
          <div className="pt-2 border-t">
            <h3 className="text-xs font-medium text-gray-500 mb-2">
              {language === "es" ? "Títulos Predefinidos" : "Preset Titles"}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_TITLES.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => editor?.addText?.(preset.text, {
                    fontSize: preset.fontSize,
                    fontFamily: preset.fontFamily,
                    fill: preset.color,
                    fontWeight: preset.fontFamily === "Impact" || preset.fontFamily === "Arial Black" ? 900 : 700,
                  })}
                  className="h-10 rounded-lg hover:border-2 transition-colors flex items-center justify-center border border-gray-200 hover:shadow-md"
                  style={{ backgroundColor: '#fafafa' }}
                >
                  <span 
                    style={{ 
                      color: preset.color, 
                      fontFamily: preset.fontFamily,
                      fontSize: preset.text.length > 10 ? '10px' : preset.text.length > 6 ? '12px' : '14px',
                      fontWeight: preset.fontFamily === "Impact" || preset.fontFamily === "Arial Black" ? 900 : 700,
                      letterSpacing: '0.5px',
                    }}
                  >
                    {preset.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
