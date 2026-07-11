"use client";

import React, { useState } from "react";
import { Barcode, Loader2, Hash, Palette, Settings, Check } from "lucide-react";

import { useLanguage } from "@/lib/contexts/LanguageContext";
import { ActiveTool, Editor } from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BarcodeSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

// Barcode formats comunes
const BARCODE_FORMATS = [
  { value: "code128", label: "CODE128", description: "Alfanumérico general" },
  { value: "code39", label: "CODE39", description: "Industrial" },
  { value: "ean13", label: "EAN-13", description: "13 dígitos" },
  { value: "ean8", label: "EAN-8", description: "8 dígitos" },
  { value: "upca", label: "UPC-A", description: "12 dígitos" },
  { value: "itf14", label: "ITF-14", description: "14 dígitos (envíos)" },
  { value: "codabar", label: "Codabar", description: "Bibliotecas/Bancos" },
];

// Colores predefinidos para el código de barras
const PRESET_COLORS = [
  "#000000", "#1a1a1a", "#333333", "#4a4a4a",
  "#135bec", "#0d4bc9", "#2563eb", "#1e40af",
  "#dc2626", "#ea580c", "#d97706", "#ca8a04",
  "#16a34a", "#059669", "#0d9488", "#0f766e",
  "#7c3aed", "#9333ea", "#c026d3", "#a21caf",
];

export const BarcodeSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: BarcodeSidebarProps) => {
  const { language } = useLanguage();
  const [text, setText] = useState("");
  const [format, setFormat] = useState("code128");
  const [barcodeColor, setBarcodeColor] = useState("#000000");
  const [customColor, setCustomColor] = useState("#000000");
  const [margin, setMargin] = useState(5);
  const [fontSize, setFontSize] = useState(12);
  const [textPosition, setTextPosition] = useState<"bottom" | "top" | "none">("bottom");
  const [textMargin, setTextMargin] = useState(2);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [colorModalOpen, setColorModalOpen] = useState(false);

  // Generar URL del código de barras usando la API de BWIPP
  const generateBarcodeUrl = (
    value: string,
    barcodeFormat: string,
    color: string,
    options: {
      margin: number;
      fontSize: number;
      textPosition: string;
      textMargin: number;
    }
  ) => {
    if (!value.trim()) return "";
    const colorHex = color.replace("#", "");

    const formatMap: Record<string, string> = {
      "code128": "code128",
      "code39": "code39",
      "ean13": "ean13",
      "ean8": "ean8",
      "upca": "upca",
      "itf14": "itf14",
      "codabar": "codabar",
    };

    const bwippFormat = formatMap[barcodeFormat] || "code128";
    const includeText = options.textPosition !== "none";

    const params = new URLSearchParams({
      bcid: bwippFormat,
      text: value,
      scale: "2",
      height: "10",
      includetext: includeText ? "true" : "false",
      textcolor: colorHex,
      barcolor: colorHex,
      backgroundcolor: "ffffff",
      padding: String(options.margin),
    });

    if (includeText) {
      params.set("textsize", String(options.fontSize));
      params.set("textxalign", "center");
      params.set("textyalign", options.textPosition === "top" ? "above" : "below");
      params.set("textgap", String(options.textMargin));
      params.set("includecheck", "true");
      params.set("includecheckintext", "true");
    }

    // Agregar timestamp para evitar caché del navegador
    params.set("_t", Date.now().toString());

    return `https://bwipjs-api.metafloor.com/?${params.toString()}`;
  };

  // Actualizar preview cuando cambian los parámetros
  const updatePreview = (
    newText: string,
    newFormat: string,
    newColor: string,
    newMargin: number,
    newFontSize: number,
    newTextPosition: string,
    newTextMargin: number
  ) => {
    if (newText.trim()) {
      setPreviewUrl(
        generateBarcodeUrl(newText, newFormat, newColor, {
          margin: newMargin,
          fontSize: newFontSize,
          textPosition: newTextPosition,
          textMargin: newTextMargin,
        })
      );
    } else {
      setPreviewUrl("");
    }
  };

  const handleTextChange = (value: string) => {
    setText(value);
    updatePreview(value, format, barcodeColor, margin, fontSize, textPosition, textMargin);
  };

  const handleFormatChange = (newFormat: string) => {
    setFormat(newFormat);
    updatePreview(text, newFormat, barcodeColor, margin, fontSize, textPosition, textMargin);
  };

  const handleColorChange = (color: string) => {
    setBarcodeColor(color);
    setCustomColor(color);
    setColorModalOpen(false);
    updatePreview(text, format, color, margin, fontSize, textPosition, textMargin);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColor(e.target.value);
  };

  const applyCustomColor = () => {
    handleColorChange(customColor);
  };

  const handleMarginChange = (value: number[]) => {
    const newMargin = value[0];
    setMargin(newMargin);
    updatePreview(text, format, barcodeColor, newMargin, fontSize, textPosition, textMargin);
  };

  const handleFontSizeChange = (value: number[]) => {
    const newFontSize = value[0];
    setFontSize(newFontSize);
    updatePreview(text, format, barcodeColor, margin, newFontSize, textPosition, textMargin);
  };

  const handleTextPositionChange = (value: string) => {
    const newPosition = value as "bottom" | "top" | "none";
    setTextPosition(newPosition);
    updatePreview(text, format, barcodeColor, margin, fontSize, newPosition, textMargin);
  };

  const handleTextMarginChange = (value: number[]) => {
    const newTextMargin = value[0];
    setTextMargin(newTextMargin);
    updatePreview(text, format, barcodeColor, margin, fontSize, textPosition, newTextMargin);
  };

  // Agregar código de barras al canvas
  const handleAddBarcode = () => {
    if (!text.trim() || !editor) return;

    setIsGenerating(true);

    const barcodeImageUrl = generateBarcodeUrl(text, format, barcodeColor, {
      margin,
      fontSize,
      textPosition,
      textMargin,
    });

    // Cargar imagen y convertir blanco a transparente
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(img, 0, 0);

        // Obtener datos de imagen y hacer blanco transparente
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          // Si el pixel es casi blanco (tolerancia para anti-aliasing)
          if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) {
            data[i + 3] = 0; // Hacer transparente
          }
        }

        ctx.putImageData(imageData, 0, 0);

        // Convertir a data URL y agregar al canvas
        const transparentUrl = canvas.toDataURL("image/png");
        editor.addImage(transparentUrl);
      }

      setIsGenerating(false);
    };
    img.onerror = () => {
      setIsGenerating(false);
    };
    img.src = barcodeImageUrl;
  };

  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[320px] h-full flex flex-col shrink-0",
        activeTool === "barcode" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader
        title={language === "es" ? "Código de Barras" : "Barcode"}
        description={language === "es" ? "Genera códigos de barras" : "Generate barcodes"}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Formato Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700 flex items-center gap-2">
            <Barcode className="h-3.5 w-3.5" />
            {language === "es" ? "Formato" : "Format"}
          </label>
          <Select value={format} onValueChange={handleFormatChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar formato" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {BARCODE_FORMATS.map((fmt) => (
                <SelectItem key={fmt.value} value={fmt.value}>
                  {fmt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Text Input */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700 flex items-center gap-2">
            <Hash className="h-3.5 w-3.5" />
            {language === "es" ? "Contenido" : "Content"}
          </label>
          <Input
            placeholder={
              format === "ean13" ? "5901234123457"
              : format === "ean8" ? "12345670"
              : format === "upca" ? "012345678905"
              : format === "itf14" ? "12345678901231"
              : format === "code39" ? "CODE39"
              : format === "codabar" ? "A123456789B"
              : "ABC123456"
            }
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            className="text-sm"
          />
        </div>

        {/* Color Selection with Modal */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700 flex items-center gap-2">
            <Palette className="h-3.5 w-3.5" />
            {language === "es" ? "Color" : "Color"}
          </label>
          <Dialog open={colorModalOpen} onOpenChange={setColorModalOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 h-10"
              >
                <div
                  className="w-6 h-6 rounded border border-gray-300"
                  style={{ backgroundColor: barcodeColor }}
                />
                <span className="text-sm">{barcodeColor.toUpperCase()}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[320px]">
              <DialogHeader>
                <DialogTitle className="text-sm">
                  {language === "es" ? "Seleccionar color" : "Select color"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                {/* Preset Colors */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">
                    {language === "es" ? "Colores predefinidos" : "Preset colors"}
                  </Label>
                  <div className="grid grid-cols-5 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorChange(color)}
                        className={cn(
                          "w-10 h-10 rounded-lg border-2 transition-all relative",
                          barcodeColor === color
                            ? "ring-2 ring-blue-500 ring-offset-2 border-transparent"
                            : "border-gray-200 hover:border-gray-400"
                        )}
                        style={{ backgroundColor: color }}
                      >
                        {barcodeColor === color && (
                          <Check className="h-4 w-4 text-white absolute inset-0 m-auto drop-shadow-md" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Color */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">
                    {language === "es" ? "Color personalizado" : "Custom color"}
                  </Label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={customColor}
                      onChange={handleCustomColorChange}
                      className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <Input
                      value={customColor}
                      onChange={handleCustomColorChange}
                      className="flex-1 text-sm"
                      placeholder="#000000"
                    />
                    <Button
                      size="sm"
                      onClick={applyCustomColor}
                      className="bg-[#135bec] hover:bg-[#0d4bc9]"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Advanced Options */}
        <div className="space-y-3 pt-2 border-t border-gray-100">
          <label className="text-xs font-semibold text-gray-700 flex items-center gap-2">
            <Settings className="h-3.5 w-3.5" />
            {language === "es" ? "Opciones avanzadas" : "Advanced options"}
          </label>

          {/* Row 1: Margin & Font Size */}
          <div className="grid grid-cols-2 gap-3">
            {/* Margin */}
            <div className="space-y-1">
              <Label className="text-[10px] text-gray-600">
                {language === "es" ? "Margen" : "Margin"}
              </Label>
              <Input
                type="number"
                value={margin}
                onChange={(e) => handleMarginChange([parseInt(e.target.value) || 0])}
                onBlur={() => handleMarginChange([Math.max(0, Math.min(20, margin))])}
                className="w-full h-8 text-center text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min={0}
                max={20}
              />
            </div>

            {/* Font Size */}
            <div className="space-y-1">
              <Label className="text-[10px] text-gray-600">
                {language === "es" ? "Texto" : "Text"}
              </Label>
              <Input
                type="number"
                value={fontSize}
                onChange={(e) => handleFontSizeChange([parseInt(e.target.value) || 8])}
                onBlur={() => handleFontSizeChange([Math.max(8, Math.min(24, fontSize))])}
                className="w-full h-8 text-center text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min={8}
                max={24}
              />
            </div>
          </div>

          {/* Row 2: Text Position & Text Margin */}
          <div className="grid grid-cols-2 gap-3">
            {/* Text Position */}
            <div className="space-y-1">
              <Label className="text-[10px] text-gray-600">
                {language === "es" ? "Posición" : "Position"}
              </Label>
              <Select value={textPosition} onValueChange={handleTextPositionChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom">{language === "es" ? "Abajo" : "Bottom"}</SelectItem>
                  <SelectItem value="top">{language === "es" ? "Arriba" : "Top"}</SelectItem>
                  <SelectItem value="none">{language === "es" ? "Sin" : "None"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Text Margin */}
            <div className="space-y-1">
              <Label className="text-[10px] text-gray-600">
                {language === "es" ? "Espacio" : "Gap"}
              </Label>
              <Input
                type="number"
                value={textMargin}
                onChange={(e) => handleTextMarginChange([parseInt(e.target.value) || 0])}
                onBlur={() => handleTextMarginChange([Math.max(0, Math.min(10, textMargin))])}
                className="w-full h-8 text-center text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                min={0}
                max={10}
                disabled={textPosition === "none"}
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        {previewUrl && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">
              {language === "es" ? "Vista previa" : "Preview"}
            </label>
            <div className="bg-white border-2 border-gray-200 rounded-lg p-4 flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Barcode Preview"
                className="max-w-full"
                style={{ maxHeight: "120px" }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<span class="text-red-500 text-xs">${language === "es" ? "Error al generar" : "Error generating"}</span>`;
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Add Button */}
        <Button
          onClick={handleAddBarcode}
          disabled={!text.trim() || isGenerating}
          className="w-full bg-[#135bec] hover:bg-[#0d4bc9] text-white"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {language === "es" ? "Agregando..." : "Adding..."}
            </>
          ) : (
            <>
              <Barcode className="h-4 w-4 mr-2" />
              {language === "es" ? "Agregar al lienzo" : "Add to canvas"}
            </>
          )}
        </Button>

        {/* Tips */}
        <div className="bg-blue-50 rounded-lg p-3 space-y-1">
          <p className="text-[10px] font-medium text-blue-700">
            {language === "es" ? "Consejos:" : "Tips:"}
          </p>
          <ul className="text-[10px] text-blue-600 space-y-1 list-disc list-inside">
            <li>{language === "es" ? "CODE128 es el más versátil" : "CODE128 is the most versatile"}</li>
            <li>{language === "es" ? "EAN-13/UPC-A para productos" : "EAN-13/UPC-A for products"}</li>
          </ul>
        </div>
      </div>

      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
