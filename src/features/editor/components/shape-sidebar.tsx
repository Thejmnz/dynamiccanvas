import { useLanguage } from "@/lib/contexts/LanguageContext";
import { ActiveTool, Editor } from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

// SVG Shapes - cada forma tiene su SVG string
const SHAPES_SVG: Record<string, string> = {
  circle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480"><g fill="#000000"><circle cx="240" cy="240" r="240"></circle></g></svg>`,
  square: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480"><path d="M70.3 70.3h339.4v339.4H70.3z" fill="#000000"></path></svg>`,
  roundedRect: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480"><g fill="#000000"><rect width="480" height="480" rx="120" ry="120"></rect></g></svg>`,
  verticalRect: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480"><path d="M80 0h320v480H80z" fill="#000000"></path></svg>`,
  triangle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480"><path d="M240 60 32.2 420h415.7L240 60z" fill="#000000"></path></svg>`,
  pentagon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480"><path d="M240 11.8 0 186.1l91.7 282.2h296.6L480 186.1 240 11.8z" fill="#000000"></path></svg>`,
  hexagon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480"><path d="M360 32.2H120L0 240l120 207.9h240L480 240 360 32.2z" fill="#000000"></path></svg>`,
  star: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480"><path d="M240 6 47.5 98.7 0 307l133.2 167h213.6L480 307 432.5 98.7 240 6z" fill="#000000"></path></svg>`,
  heart: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 438.82"><path d="M438.82 41.18c-54.9-54.9-143.92-54.9-198.82 0-54.9-54.9-143.92-54.9-198.82 0-54.9 54.9-54.9 143.92 0 198.82L240 438.82 438.82 240c54.9-54.9 54.9-143.92 0-198.82Z" fill="#000000"></path></svg>`,
  diamond: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480"><path d="M401.6 288.4 450 240l-48.4-48.4 8.1-8.2A80 80 0 0 0 296.6 70.3l-8.2 8.1L240 30l-48.4 48.4-8.2-8.1A80 80 0 0 0 70.3 183.4l8.1 8.2L30 240l48.4 48.4-8.1 8.2a80 80 0 0 0 113.1 113.1l8.2-8.1L240 450l48.4-48.4 8.2 8.1a80 80 0 0 0 113.1-113.1l-8.1-8.2Z" fill="#000000"></path></svg>`,
  cross: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480"><path d="M400 160V80h-80a80 80 0 0 0-160 0H80v80a80 80 0 0 0 0 160v80h80a80 80 0 0 0 160 0h80v-80a80 80 0 0 0 0-160Z" fill="#000000"></path></svg>`,
  plus: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480"><path d="M400 160h-80V80a80 80 0 0 0-160 0v80H80a80 80 0 0 0 0 160h80v80a80 80 0 0 0 160 0v-80h80a80 80 0 0 0 0-160Z" fill="#000000"></path></svg>`,
  thinCross: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480"><path d="M450 210H270V30a30 30 0 1 0-60 0v180H30a30 30 0 1 0 0 60h180v180a30 30 0 1 0 60 0V270h180a30 30 0 1 0 0-60Z" fill="#000000"></path></svg>`,
  asterisk: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480"><path d="M450 210H312.4l97.3-97.3a30 30 0 1 0-42.4-42.4L270 167.6V30a30 30 0 1 0-60 0v137.6l-97.3-97.3a30 30 0 1 0-42.4 42.4l97.3 97.3H30a30 30 0 1 0 0 60h137.6l-97.3 97.3a30 30 0 1 0 42.4 42.4l97.3-97.3V450a30 30 0 1 0 60 0V312.4l97.3 97.3a30 30 0 1 0 42.4-42.4L312.4 270H450a30 30 0 1 0 0-60Z" fill="#000000"></path></svg>`,
  burst: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480"><path d="m452.3 154.4 8.5-47.6A75.6 75.6 0 0 0 373.2 19l-47.4 8.5c-16.7 3-34 .2-49-7.8l-1.1-.6c-22.3-12-49-12-71.4 0l-1.2.6c-15 8-32.2 10.8-48.9 7.8L106.7 19A75.6 75.6 0 0 0 19 106.7l8.5 47.5c3 16.7.3 34-7.8 49l-.6 1.1c-12 22.3-12 49 0 71.3l.6 1.3c8 15 10.8 32.2 7.8 48.9L19 373.3a75.6 75.6 0 0 0 87.7 87.7l47.5-8.5c16.7-3 34-.3 49 7.8l1.1.6c22.3 12 49 12 71.3 0l1.3-.6c15-8 32.2-10.8 48.9-7.8l47.5 8.5a75.6 75.6 0 0 0 87.7-87.7l-8.4-47.2c-3-16.9-.2-34.3 8-49.4a75.5 75.5 0 0 0 .3-71.6l-1-1.8c-8-15-10.7-32.2-7.6-48.9Z" fill="#000000"></path></svg>`,
  flower: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480"><path d="M447.6 180.2v-.2A127.3 127.3 0 0 0 300 32S240 0 240 0l-60 32.1h-.2A127.3 127.3 0 0 0 32 179.8v.2L0 240l32.1 60v.2A127.3 127.3 0 0 0 179.8 448h.2l60 32.1 60-32.1h.3a127.3 127.3 0 0 0 147.6-147.7v-.2l32.1-59-32.4-60.8Z" fill="#000000"></path></svg>`,
  grid: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480"><path d="M160 160h160v160H160zM0 320h160v160H0zM0 0h160v160H0zM320 320h160v160H320zM320 0h160v160H320z" fill="#000000"></path></svg>`,
  brick: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480"><path d="M120 120h120v120H120zM0 240h120v120H0zM120 360h120v120H120zM0 0h120v120H0zM360 120h120v120H360zM240 240h120v120H240zM360 360h120v120H360zM240 0h120v120H240z" fill="#000000"></path></svg>`,
  hashtag: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480"><path d="M480 180V60h-60V0H300v60H180V0H60v60H0v120h60v120H0v120h60v60h120v-60h120v60h120v-60h60V300h-60V180h60ZM300 300H180V180h120v120Z" fill="#000000"></path></svg>`,
};

// Helper para convertir SVG a data URL
const svgToDataUrl = (svg: string): string => {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

interface ShapeSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const ShapeSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: ShapeSidebarProps) => {
  const { t, language } = useLanguage();

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const addShape = (shapeKey: string) => {
    const svg = SHAPES_SVG[shapeKey];
    if (svg && editor?.addImage) {
      const dataUrl = svgToDataUrl(svg);
      editor.addImage(dataUrl);
    }
  };

  return (
    <aside
      className={cn(
        "absolute left-0 top-0 bg-white border-r z-[40] w-[360px] h-full flex flex-col shadow-lg",
        activeTool === "shapes" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title={language === "es" ? "Formas" : "Shapes"}
        description={language === "es" ? "Agrega formas a tu lienzo" : "Add shapes to your canvas"}
      />
      <ScrollArea>
        <div className="p-4 space-y-4">
          {/* Formas */}
          <div>
            <h3 className="text-xs font-medium text-gray-500 mb-2">
              {language === "es" ? "Formas Básicas" : "Basic Shapes"}
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {/* Circle */}
              <button
                onClick={() => addShape("circle")}
                className="aspect-square rounded-lg hover:border-2 transition-colors flex items-center justify-center p-2"
                style={{ backgroundColor: 'rgb(249 250 251)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(147 197 253)';
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.backgroundColor = 'rgb(249 250 251)';
                }}
                title={language === "es" ? "Círculo" : "Circle"}
              >
                <div
                  className="w-8 h-8"
                  dangerouslySetInnerHTML={{ __html: SHAPES_SVG.circle }}
                />
              </button>
              {/* Square */}
              <button
                onClick={() => addShape("square")}
                className="aspect-square rounded-lg hover:border-2 transition-colors flex items-center justify-center p-2"
                style={{ backgroundColor: 'rgb(249 250 251)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(147 197 253)';
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.backgroundColor = 'rgb(249 250 251)';
                }}
                title={language === "es" ? "Cuadrado" : "Square"}
              >
                <div
                  className="w-8 h-8"
                  dangerouslySetInnerHTML={{ __html: SHAPES_SVG.square }}
                />
              </button>
              {/* Rounded Rectangle */}
              <button
                onClick={() => addShape("roundedRect")}
                className="aspect-square rounded-lg hover:border-2 transition-colors flex items-center justify-center p-2"
                style={{ backgroundColor: 'rgb(249 250 251)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(147 197 253)';
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.backgroundColor = 'rgb(249 250 251)';
                }}
                title={language === "es" ? "Rectángulo Redondeado" : "Rounded Rectangle"}
              >
                <div
                  className="w-8 h-8"
                  dangerouslySetInnerHTML={{ __html: SHAPES_SVG.roundedRect }}
                />
              </button>
              {/* Vertical Rectangle */}
              <button
                onClick={() => addShape("verticalRect")}
                className="aspect-square rounded-lg hover:border-2 transition-colors flex items-center justify-center p-2"
                style={{ backgroundColor: 'rgb(249 250 251)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(147 197 253)';
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.backgroundColor = 'rgb(249 250 251)';
                }}
                title={language === "es" ? "Rectángulo Vertical" : "Vertical Rectangle"}
              >
                <div
                  className="w-8 h-8"
                  dangerouslySetInnerHTML={{ __html: SHAPES_SVG.verticalRect }}
                />
              </button>
              {/* Triangle */}
              <button
                onClick={() => addShape("triangle")}
                className="aspect-square rounded-lg hover:border-2 transition-colors flex items-center justify-center p-2"
                style={{ backgroundColor: 'rgb(249 250 251)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(147 197 253)';
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.backgroundColor = 'rgb(249 250 251)';
                }}
                title={language === "es" ? "Triángulo" : "Triangle"}
              >
                <div
                  className="w-8 h-8"
                  dangerouslySetInnerHTML={{ __html: SHAPES_SVG.triangle }}
                />
              </button>
              {/* Pentagon */}
              <button
                onClick={() => addShape("pentagon")}
                className="aspect-square rounded-lg hover:border-2 transition-colors flex items-center justify-center p-2"
                style={{ backgroundColor: 'rgb(249 250 251)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(147 197 253)';
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.backgroundColor = 'rgb(249 250 251)';
                }}
                title={language === "es" ? "Pentágono" : "Pentagon"}
              >
                <div
                  className="w-8 h-8"
                  dangerouslySetInnerHTML={{ __html: SHAPES_SVG.pentagon }}
                />
              </button>
              {/* Hexagon */}
              <button
                onClick={() => addShape("hexagon")}
                className="aspect-square rounded-lg hover:border-2 transition-colors flex items-center justify-center p-2"
                style={{ backgroundColor: 'rgb(249 250 251)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(147 197 253)';
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.backgroundColor = 'rgb(249 250 251)';
                }}
                title={language === "es" ? "Hexágono" : "Hexagon"}
              >
                <div
                  className="w-8 h-8"
                  dangerouslySetInnerHTML={{ __html: SHAPES_SVG.hexagon }}
                />
              </button>
              {/* Star */}
              <button
                onClick={() => addShape("star")}
                className="aspect-square rounded-lg hover:border-2 transition-colors flex items-center justify-center p-2"
                style={{ backgroundColor: 'rgb(249 250 251)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(147 197 253)';
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.backgroundColor = 'rgb(249 250 251)';
                }}
                title={language === "es" ? "Estrella" : "Star"}
              >
                <div
                  className="w-8 h-8"
                  dangerouslySetInnerHTML={{ __html: SHAPES_SVG.star }}
                />
              </button>
              {/* Heart */}
              <button
                onClick={() => addShape("heart")}
                className="aspect-square rounded-lg hover:border-2 transition-colors flex items-center justify-center p-2"
                style={{ backgroundColor: 'rgb(249 250 251)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(147 197 253)';
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.backgroundColor = 'rgb(249 250 251)';
                }}
                title={language === "es" ? "Corazón" : "Heart"}
              >
                <div
                  className="w-8 h-8"
                  dangerouslySetInnerHTML={{ __html: SHAPES_SVG.heart }}
                />
              </button>
              {/* Diamond */}
              <button
                onClick={() => addShape("diamond")}
                className="aspect-square rounded-lg hover:border-2 transition-colors flex items-center justify-center p-2"
                style={{ backgroundColor: 'rgb(249 250 251)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(147 197 253)';
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.backgroundColor = 'rgb(249 250 251)';
                }}
                title={language === "es" ? "Diamante" : "Diamond"}
              >
                <div
                  className="w-8 h-8"
                  dangerouslySetInnerHTML={{ __html: SHAPES_SVG.diamond }}
                />
              </button>
              {/* Cross */}
              <button
                onClick={() => addShape("cross")}
                className="aspect-square rounded-lg hover:border-2 transition-colors flex items-center justify-center p-2"
                style={{ backgroundColor: 'rgb(249 250 251)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(147 197 253)';
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.backgroundColor = 'rgb(249 250 251)';
                }}
                title={language === "es" ? "Cruz" : "Cross"}
              >
                <div
                  className="w-8 h-8"
                  dangerouslySetInnerHTML={{ __html: SHAPES_SVG.cross }}
                />
              </button>
              {/* Plus */}
              <button
                onClick={() => addShape("plus")}
                className="aspect-square rounded-lg hover:border-2 transition-colors flex items-center justify-center p-2"
                style={{ backgroundColor: 'rgb(249 250 251)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(147 197 253)';
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.backgroundColor = 'rgb(249 250 251)';
                }}
                title={language === "es" ? "Más" : "Plus"}
              >
                <div
                  className="w-8 h-8"
                  dangerouslySetInnerHTML={{ __html: SHAPES_SVG.plus }}
                />
              </button>
              {/* Thin Cross */}
              <button
                onClick={() => addShape("thinCross")}
                className="aspect-square rounded-lg hover:border-2 transition-colors flex items-center justify-center p-2"
                style={{ backgroundColor: 'rgb(249 250 251)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(147 197 253)';
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.backgroundColor = 'rgb(249 250 251)';
                }}
                title={language === "es" ? "Cruz Fina" : "Thin Cross"}
              >
                <div
                  className="w-8 h-8"
                  dangerouslySetInnerHTML={{ __html: SHAPES_SVG.thinCross }}
                />
              </button>
              {/* Asterisk */}
              <button
                onClick={() => addShape("asterisk")}
                className="aspect-square rounded-lg hover:border-2 transition-colors flex items-center justify-center p-2"
                style={{ backgroundColor: 'rgb(249 250 251)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(147 197 253)';
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.backgroundColor = 'rgb(249 250 251)';
                }}
                title={language === "es" ? "Asterisco" : "Asterisk"}
              >
                <div
                  className="w-8 h-8"
                  dangerouslySetInnerHTML={{ __html: SHAPES_SVG.asterisk }}
                />
              </button>
              {/* Burst */}
              <button
                onClick={() => addShape("burst")}
                className="aspect-square rounded-lg hover:border-2 transition-colors flex items-center justify-center p-2"
                style={{ backgroundColor: 'rgb(249 250 251)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(147 197 253)';
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.backgroundColor = 'rgb(249 250 251)';
                }}
                title={language === "es" ? "Brillo" : "Burst"}
              >
                <div
                  className="w-8 h-8"
                  dangerouslySetInnerHTML={{ __html: SHAPES_SVG.burst }}
                />
              </button>
              {/* Flower */}
              <button
                onClick={() => addShape("flower")}
                className="aspect-square rounded-lg hover:border-2 transition-colors flex items-center justify-center p-2"
                style={{ backgroundColor: 'rgb(249 250 251)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(147 197 253)';
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.backgroundColor = 'rgb(249 250 251)';
                }}
                title={language === "es" ? "Flor" : "Flower"}
              >
                <div
                  className="w-8 h-8"
                  dangerouslySetInnerHTML={{ __html: SHAPES_SVG.flower }}
                />
              </button>
              {/* Grid */}
              <button
                onClick={() => addShape("grid")}
                className="aspect-square rounded-lg hover:border-2 transition-colors flex items-center justify-center p-2"
                style={{ backgroundColor: 'rgb(249 250 251)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(147 197 253)';
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.backgroundColor = 'rgb(249 250 251)';
                }}
                title={language === "es" ? "Cuadrícula" : "Grid"}
              >
                <div
                  className="w-8 h-8"
                  dangerouslySetInnerHTML={{ __html: SHAPES_SVG.grid }}
                />
              </button>
              {/* Brick */}
              <button
                onClick={() => addShape("brick")}
                className="aspect-square rounded-lg hover:border-2 transition-colors flex items-center justify-center p-2"
                style={{ backgroundColor: 'rgb(249 250 251)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(147 197 253)';
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.backgroundColor = 'rgb(249 250 251)';
                }}
                title={language === "es" ? "Ladrillo" : "Brick"}
              >
                <div
                  className="w-8 h-8"
                  dangerouslySetInnerHTML={{ __html: SHAPES_SVG.brick }}
                />
              </button>
              {/* Hashtag */}
              <button
                onClick={() => addShape("hashtag")}
                className="aspect-square rounded-lg hover:border-2 transition-colors flex items-center justify-center p-2"
                style={{ backgroundColor: 'rgb(249 250 251)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(147 197 253)';
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.backgroundColor = 'rgb(249 250 251)';
                }}
                title={language === "es" ? "Hashtag" : "Hashtag"}
              >
                <div
                  className="w-8 h-8"
                  dangerouslySetInnerHTML={{ __html: SHAPES_SVG.hashtag }}
                />
              </button>
            </div>
          </div>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
