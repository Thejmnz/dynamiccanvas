"use client";

import React, { useState } from "react";
import { QrCode, Loader2, Link, Palette } from "lucide-react";

import { useLanguage } from "@/lib/contexts/LanguageContext";
import { ActiveTool, Editor } from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface QRCodeSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

// Colores predefinidos para el QR
const QR_COLORS = [
  "#000000", "#1a1a1a", "#333333",
  "#135bec", "#0d4bc9", "#2563eb",
  "#dc2626", "#ea580c", "#d97706",
  "#16a34a", "#059669", "#0d9488",
  "#7c3aed", "#9333ea", "#c026d3",
  "#1e40af", "#1d4ed8", "#0891b2",
];

const QR_SIZE = 300; // Tamaño fijo, se redimensiona en el canvas

export const QRCodeSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: QRCodeSidebarProps) => {
  const { language } = useLanguage();
  const [url, setUrl] = useState("");
  const [qrColor, setQrColor] = useState("#000000");
  const [previewUrl, setPreviewUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Generar URL del QR usando la API de QRServer (gratuita)
  const generateQRUrl = (text: string, color: string) => {
    if (!text.trim()) return "";
    const colorHex = color.replace("#", "");
    return `https://api.qrserver.com/v1/create-qr-code/?size=${QR_SIZE}x${QR_SIZE}&data=${encodeURIComponent(text)}&color=${colorHex}&bgcolor=ffffff&format=png`;
  };

  // Actualizar preview cuando cambian los parámetros
  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (value.trim()) {
      setPreviewUrl(generateQRUrl(value, qrColor));
    } else {
      setPreviewUrl("");
    }
  };

  const handleColorChange = (color: string) => {
    setQrColor(color);
    if (url.trim()) {
      setPreviewUrl(generateQRUrl(url, color));
    }
  };

  // Agregar QR al canvas
  const handleAddQR = () => {
    if (!url.trim() || !editor) return;

    setIsGenerating(true);

    const qrImageUrl = generateQRUrl(url, qrColor);

    // Agregar como imagen al canvas
    editor.addImage(qrImageUrl);

    setTimeout(() => {
      setIsGenerating(false);
    }, 500);
  };

  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "absolute left-0 top-0 bg-white border-r z-[40] w-[360px] h-full flex flex-col shadow-lg",
        activeTool === "qrcode" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader
        title={language === "es" ? "Código QR" : "QR Code"}
        description={language === "es" ? "Genera códigos QR para URLs" : "Generate QR codes for URLs"}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* URL Input */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700 flex items-center gap-2">
            <Link className="h-3.5 w-3.5" />
            {language === "es" ? "URL o texto" : "URL or text"}
          </label>
          <Input
            placeholder={language === "es" ? "https://ejemplo.com" : "https://example.com"}
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            className="text-sm"
          />
          <p className="text-[10px] text-gray-400">
            {language === "es"
              ? "Ingresa la URL o texto para el código QR"
              : "Enter the URL or text for the QR code"}
          </p>
        </div>

        {/* Color Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700 flex items-center gap-2">
            <Palette className="h-3.5 w-3.5" />
            {language === "es" ? "Color del QR" : "QR Color"}
          </label>
          <div className="grid grid-cols-6 gap-2">
            {QR_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className={cn(
                  "w-8 h-8 rounded-md border-2 transition-all",
                  qrColor === color
                    ? "ring-2 ring-blue-500 ring-offset-2 border-transparent"
                    : "border-gray-200 hover:border-gray-300"
                )}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
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
                alt="QR Preview"
                className="max-w-full"
                style={{ maxHeight: "200px" }}
              />
            </div>
          </div>
        )}

        {/* Add Button */}
        <Button
          onClick={handleAddQR}
          disabled={!url.trim() || isGenerating}
          className="w-full bg-[#135bec] hover:bg-[#0d4bc9] text-white"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {language === "es" ? "Agregando..." : "Adding..."}
            </>
          ) : (
            <>
              <QrCode className="h-4 w-4 mr-2" />
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
            <li>{language === "es" ? "Usa URLs completas (incluyendo https://)" : "Use full URLs (including https://)"}</li>
            <li>{language === "es" ? "Colores oscuros funcionan mejor" : "Dark colors work best"}</li>
            <li>{language === "es" ? "Redimensiona el QR en el lienzo según necesites" : "Resize the QR on the canvas as needed"}</li>
          </ul>
        </div>
      </div>

      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
