import { ActiveTool, Editor, CanvasElement } from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface EffectsSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
  selectedElement: CanvasElement | null | undefined;
  onChangeElement: (id: string, changes: Partial<CanvasElement>) => void;
}

const EFFECT_PRESETS = [
  { name: "None", filter: "none", brightness: 1, contrast: 1, saturation: 1, blur: 0 },
  { name: "Vintage", filter: "sepia", brightness: 1.1, contrast: 1.1, saturation: 0.8, blur: 0 },
  { name: "B&W", filter: "greyscale", brightness: 1, contrast: 1.2, saturation: 0, blur: 0 },
  { name: "Warm", filter: "warm", brightness: 1.1, contrast: 1, saturation: 1.2, blur: 0 },
  { name: "Cool", filter: "cool", brightness: 1, contrast: 1, saturation: 0.9, blur: 0 },
  { name: "High Contrast", filter: "highcontrast", brightness: 1, contrast: 1.3, saturation: 1.1, blur: 0 },
  { name: "Soft", filter: "soft", brightness: 1, contrast: 0.9, saturation: 1, blur: 0.5 },
];

export const EffectsSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
  selectedElement,
  onChangeElement,
}: EffectsSidebarProps) => {
  const onClose = () => {
    onChangeActiveTool("select");
  };

  const selectedId = selectedElement?.id;

  // Get current values from selected element
  const brightness = selectedElement?.brightness ?? 1;
  const contrast = selectedElement?.contrast ?? 1;
  const saturation = selectedElement?.saturation ?? 1;
  const blur = selectedElement?.blur ?? 0;
  const shadowColor = selectedElement?.shadowColor || "transparent";
  const shadowBlur = selectedElement?.shadowBlur ?? 0;
  const shadowOffsetX = selectedElement?.shadowOffsetX ?? 0;
  const shadowOffsetY = selectedElement?.shadowOffsetY ?? 0;
  const filterType = selectedElement?.filterType ?? "none";

  // Update a property
  const updateProperty = (property: string, value: any) => {
    if (!selectedId) return;
    onChangeElement(selectedId, { [property]: value });
  };

  const applyPreset = (preset: typeof EFFECT_PRESETS[0]) => {
    if (!selectedId) return;
    onChangeElement(selectedId, {
      filterType: preset.filter,
      brightness: preset.brightness,
      contrast: preset.contrast,
      saturation: preset.saturation,
      blur: preset.blur,
    });
  };

  const resetAdjustments = () => {
    if (!selectedId) return;
    onChangeElement(selectedId, {
      brightness: 1,
      contrast: 1,
      saturation: 1,
      blur: 0,
    });
  };

  const resetShadow = () => {
    if (!selectedId) return;
    onChangeElement(selectedId, {
      shadowColor: "transparent",
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowOpacity: 0.5,
    });
  };

  // Check if there's a selected image
  const hasSelectedImage = selectedElement?.type === "image";

  if (!hasSelectedImage) {
    return (
      <aside
        className={cn(
          "absolute left-0 top-0 bg-white border-r z-[40] w-[360px] h-full flex flex-col shadow-lg",
          activeTool === "effects" ? "visible" : "hidden",
        )}
      >
        <ToolSidebarHeader
          title="Efectos de imagen"
          description="Selecciona una imagen para aplicar efectos"
        />
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-muted-foreground text-center">
            Selecciona una imagen en el lienzo para aplicar efectos
          </p>
        </div>
        <ToolSidebarClose onClick={onClose} />
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        "absolute left-0 top-0 bg-white border-r z-[40] w-[360px] h-full flex flex-col shadow-lg",
        activeTool === "effects" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Efectos de imagen"
        description="Ajusta brillo, contraste, saturación y más"
      />
      <ScrollArea>
        <Tabs defaultValue="presets" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="adjustments">Ajustes</TabsTrigger>
            <TabsTrigger value="shadow">Sombra</TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="p-4">
            <div className="grid grid-cols-2 gap-2">
              {EFFECT_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className={cn(
                    "p-3 rounded-lg border text-sm font-medium transition-all",
                    filterType === preset.filter
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="adjustments" className="p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Brillo</Label>
                <span className="text-sm text-muted-foreground">{Math.round(brightness * 100)}%</span>
              </div>
              <Slider
                value={[brightness * 100]}
                min={0}
                max={200}
                step={1}
                onValueChange={(value) => updateProperty("brightness", value[0] / 100)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Contraste</Label>
                <span className="text-sm text-muted-foreground">{Math.round(contrast * 100)}%</span>
              </div>
              <Slider
                value={[contrast * 100]}
                min={0}
                max={200}
                step={1}
                onValueChange={(value) => updateProperty("contrast", value[0] / 100)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Saturación</Label>
                <span className="text-sm text-muted-foreground">{Math.round(saturation * 100)}%</span>
              </div>
              <Slider
                value={[saturation * 100]}
                min={0}
                max={200}
                step={1}
                onValueChange={(value) => updateProperty("saturation", value[0] / 100)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Desenfoque</Label>
                <span className="text-sm text-muted-foreground">{blur.toFixed(1)}px</span>
              </div>
              <Slider
                value={[blur * 10]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => updateProperty("blur", value[0] / 10)}
              />
            </div>

            <button
              onClick={resetAdjustments}
              className="w-full py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Restablecer ajustes
            </button>
          </TabsContent>

          <TabsContent value="shadow" className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>Color de sombra</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={shadowColor === "transparent" ? "#000000" : shadowColor}
                  onChange={(e) => updateProperty("shadowColor", e.target.value)}
                  className="w-full h-10 rounded cursor-pointer border"
                />
                <button
                  onClick={() => updateProperty("shadowColor", "transparent")}
                  className={cn(
                    "px-3 h-10 rounded border text-xs",
                    shadowColor === "transparent" ? "bg-gray-200" : "hover:bg-gray-100"
                  )}
                >
                  Sin
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Opacidad</Label>
                <span className="text-sm text-muted-foreground">{Math.round((selectedElement?.shadowOpacity ?? 0.5) * 100)}%</span>
              </div>
              <Slider
                value={[(selectedElement?.shadowOpacity ?? 0.5) * 100]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => updateProperty("shadowOpacity", value[0] / 100)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Difuminado</Label>
                <span className="text-sm text-muted-foreground">{shadowBlur}px</span>
              </div>
              <Slider
                value={[shadowBlur]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => updateProperty("shadowBlur", value[0])}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Desplazamiento X</Label>
                <span className="text-sm text-muted-foreground">{shadowOffsetX}px</span>
              </div>
              <Slider
                value={[shadowOffsetX + 100]}
                min={0}
                max={200}
                step={1}
                onValueChange={(value) => updateProperty("shadowOffsetX", value[0] - 100)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Desplazamiento Y</Label>
                <span className="text-sm text-muted-foreground">{shadowOffsetY}px</span>
              </div>
              <Slider
                value={[shadowOffsetY + 100]}
                min={0}
                max={200}
                step={1}
                onValueChange={(value) => updateProperty("shadowOffsetY", value[0] - 100)}
              />
            </div>

            <button
              onClick={resetShadow}
              className="w-full py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Quitar sombra
            </button>
          </TabsContent>
        </Tabs>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
