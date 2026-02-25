"use client";

import React, { useState, useRef, useEffect } from "react";
import { CanvasElement, ActiveTool } from "../types";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  AlignVerticalJustifyCenter,
  AlignHorizontalJustifyCenter,
  Sparkles,
  X,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Frame,
  Grid3x3,
  Palette,
  FlipHorizontal2,
  FlipVertical2,
  Radius,
  Filter,
  Copy,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Layers,
  Move,
  Type,
  Image,
  Shapes,
  Wand2,
  Eraser,
  RotateCw,
  RotateCcw,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  MoreVertical,
  Smartphone,
  Monitor,
  Tablet,
  Laptop,
  Tv,
  Radio,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Square,
  Circle,
  Triangle,
  Heart,
  Star,
  Sun,
  Moon,
  Cloud,
  Droplet,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Hint } from "@/components/hint";
import { FontSizeInput } from "./font-size-input";
import { useLanguage } from "@/lib/contexts/LanguageContext";

interface FloatingToolbarProps {
  element: CanvasElement;
  elementX: number;
  elementY: number;
  elementWidth: number;
  scale: number;
  stageOffset: { x: number; y: number };
  onChange: (id: string, changes: Partial<CanvasElement>) => void;
  onChangeActiveTool?: (tool: ActiveTool) => void;
  activeTool?: ActiveTool;
  onReplaceImage?: () => void;
}

const EFFECT_PRESETS = [
  { name: "None", filter: "none" },
  { name: "Vintage", filter: "sepia" },
  { name: "B&W", filter: "greyscale" },
  { name: "Warm", filter: "brightness", brightness: 1.1, saturation: 1.2 },
  { name: "Cool", filter: "huerotate" },
  { name: "High Contrast", filter: "contrast", contrast: 1.3 },
  { name: "Soft", filter: "blur", blur: 0.5 },
];

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  element,
  elementX,
  elementY,
  elementWidth,
  scale,
  stageOffset,
  onChange,
  onChangeActiveTool,
  activeTool,
  onReplaceImage,
}) => {
  const { t, language } = useLanguage();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [showOpacityDropdown, setShowOpacityDropdown] = useState(false);
  const [showBorderDropdown, setShowBorderDropdown] = useState(false);
  const [showCornerDropdown, setShowCornerDropdown] = useState(false);

  const opacityDropdownRef = useRef<HTMLDivElement>(null);
  const borderDropdownRef = useRef<HTMLDivElement>(null);
  const cornerDropdownRef = useRef<HTMLDivElement>(null);

  // Element type
  const isText = element.type === "text";
  const isImage = element.type === "image";
  const isVector = isImage && element.src?.includes("api.iconify.design");

  const fontWeight = element.fontWeight || 400;
  const fontStyle = element.fontStyle || "normal";
  const textDecoration = element.textDecoration || "none";
  const textAlign = element.textAlign || "left";
  const textVerticalAlign = element.textVerticalAlign || "top";
  const fontSize = element.fontSize || 32;
  const opacity = element.opacity ?? 1;

  // Image properties
  const flipX = element.flipX ?? false;
  const flipY = element.flipY ?? false;
  const cornerRadius = element.cornerRadius ?? 0;
  const strokeWidth = element.strokeWidth ?? 0;
  const strokeColor = element.stroke || "#000000";
  const brightness = element.brightness ?? 1;
  const contrast = element.contrast ?? 1;
  const saturation = element.saturation ?? 1;
  const blur = element.blur ?? 0;
  const shadowColor = element.shadowColor || "transparent";
  const shadowBlur = element.shadowBlur ?? 0;
  const shadowOffsetX = element.shadowOffsetX ?? 0;
  const shadowOffsetY = element.shadowOffsetY ?? 0;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        opacityDropdownRef.current &&
        !opacityDropdownRef.current.contains(e.target as Node)
      ) {
        setShowOpacityDropdown(false);
      }
      if (
        borderDropdownRef.current &&
        !borderDropdownRef.current.contains(e.target as Node)
      ) {
        setShowBorderDropdown(false);
      }
      if (
        cornerDropdownRef.current &&
        !cornerDropdownRef.current.contains(e.target as Node)
      ) {
        setShowCornerDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle functions
  const toggleBold = () => {
    const newWeight = fontWeight > 500 ? 400 : 700;
    onChange(element.id, { fontWeight: newWeight });
  };

  const toggleItalic = () => {
    const newStyle = fontStyle === "italic" ? "normal" : "italic";
    onChange(element.id, { fontStyle: newStyle });
  };

  const toggleUnderline = () => {
    const isUnderline = textDecoration === "underline";
    onChange(element.id, { textDecoration: isUnderline ? "none" : "underline" });
  };

  const toggleStrikethrough = () => {
    const isStrikethrough = textDecoration === "line-through";
    onChange(element.id, { textDecoration: isStrikethrough ? "none" : "line-through" });
  };

  const cycleHorizontalAlign = () => {
    const aligns: Array<"left" | "center" | "right"> = ["left", "center", "right"];
    const currentIndex = aligns.indexOf(textAlign as "left" | "center" | "right") || 0;
    const nextIndex = (currentIndex + 1) % aligns.length;
    onChange(element.id, { textAlign: aligns[nextIndex] });
  };

  const cycleVerticalAlign = () => {
    const aligns: Array<"top" | "middle" | "bottom"> = ["top", "middle", "bottom"];
    const currentIndex = aligns.indexOf(textVerticalAlign as "top" | "middle" | "bottom") || 0;
    const nextIndex = (currentIndex + 1) % aligns.length;
    onChange(element.id, { textVerticalAlign: aligns[nextIndex] });
  };

  const getHorizontalAlignmentIcon = () => {
    switch (textAlign) {
      case "center":
        return <AlignCenter className="size-3.5" />;
      case "right":
        return <AlignRight className="size-3.5" />;
      default:
        return <AlignLeft className="size-3.5" />;
    }
  };

  const getVerticalAlignmentIcon = () => {
    switch (textVerticalAlign) {
      case "middle":
        return <Minus className="size-3.5" />;
      case "bottom":
        return <ArrowDown className="size-3.5" />;
      default:
        return <ArrowUp className="size-3.5" />;
    }
  };

  // Image handlers
  const toggleFlipX = () => {
    onChange(element.id, { flipX: !flipX });
  };

  const toggleFlipY = () => {
    onChange(element.id, { flipY: !flipY });
  };

  const handleApplyPreset = (preset: typeof EFFECT_PRESETS[0]) => {
    onChange(element.id, {
      filterType: preset.filter,
      brightness: preset.brightness ?? 1,
      contrast: preset.contrast ?? 1,
      saturation: preset.saturation ?? 1,
      blur: preset.blur ?? 0,
    });
  };

  return (
    <>
      {/* Main Toolbar */}
      <div
        ref={toolbarRef}
        style={{
          position: "absolute",
          left: "50%",
          top: 8,
          zIndex: 1000,
          transform: "translateX(-50%)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center gap-0.5 bg-white rounded-lg shadow-lg border border-gray-200 px-1.5 py-1"
          style={{
            animation: "fadeInDown 0.2s ease-out forwards",
          }}
        >
          <style jsx>{`
            @keyframes fadeInDown {
              from {
                opacity: 0;
                transform: translateY(-8px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>

          {/* ===== IMAGE SPECIFIC CONTROLS ===== */}
          {isImage && (
            <>
              {/* Border Dropdown */}
              <div className="relative" ref={borderDropdownRef}>
                <Hint label={t("floating_border")} side="bottom" sideOffset={5}>
                  <button
                    onClick={() => setShowBorderDropdown(!showBorderDropdown)}
                    className={cn(
                      "flex items-center justify-center w-7 h-7 rounded transition-colors",
                      showBorderDropdown ? "bg-blue-100" : "hover:bg-gray-100"
                    )}
                  >
                    <Square className="size-4 text-gray-600" />
                  </button>
                </Hint>

                {showBorderDropdown && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-50">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">{t("floating_border_color")}</label>
                        <input
                          type="color"
                          value={strokeColor}
                          onChange={(e) => onChange(element.id, { stroke: e.target.value })}
                          className="w-full h-8 rounded cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="text-xs text-gray-500">{t("floating_border_width")}</label>
                          <span className="text-xs font-medium">{strokeWidth}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={strokeWidth}
                          onChange={(e) => onChange(element.id, { strokeWidth: parseInt(e.target.value) })}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Corner Rounding Dropdown */}
              <div className="relative" ref={cornerDropdownRef}>
                <Hint label={t("floating_rounded_corners")} side="bottom" sideOffset={5}>
                  <button
                    onClick={() => setShowCornerDropdown(!showCornerDropdown)}
                    className={cn(
                      "flex items-center justify-center w-7 h-7 rounded transition-colors",
                      showCornerDropdown ? "bg-blue-100" : "hover:bg-gray-100"
                    )}
                  >
                    <Radius className="size-4 text-gray-600" />
                  </button>
                </Hint>

                {showCornerDropdown && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-50">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-gray-500">{t("floating_corner_radius")}</span>
                      <span className="text-xs font-medium text-gray-700">{cornerRadius}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={cornerRadius}
                      onChange={(e) => onChange(element.id, { cornerRadius: parseInt(e.target.value) })}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => onChange(element.id, { cornerRadius: 0 })}
                        className="flex-1 text-xs py-1 px-2 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        0
                      </button>
                      <button
                        onClick={() => onChange(element.id, { cornerRadius: 25 })}
                        className="flex-1 text-xs py-1 px-2 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        25
                      </button>
                      <button
                        onClick={() => onChange(element.id, { cornerRadius: 50 })}
                        className="flex-1 text-xs py-1 px-2 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        50
                      </button>
                      <button
                        onClick={() => onChange(element.id, { cornerRadius: 100 })}
                        className="flex-1 text-xs py-1 px-2 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        100
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-px h-5 bg-gray-200 mx-0.5" />

              {/* Flip Horizontal */}
              <Hint label={t("floating_flip_horizontal")} side="bottom" sideOffset={5}>
                <button
                  onClick={toggleFlipX}
                  className={cn(
                    "flex items-center justify-center w-7 h-7 rounded transition-colors",
                    flipX ? "bg-blue-100" : "hover:bg-gray-100"
                  )}
                >
                  <FlipHorizontal2 className="size-4 text-gray-600" />
                </button>
              </Hint>

              {/* FlipVertical */}
              <Hint label={t("floating_flip_vertical")} side="bottom" sideOffset={5}>
                <button
                  onClick={toggleFlipY}
                  className={cn(
                    "flex items-center justify-center w-7 h-7 rounded transition-colors",
                    flipY ? "bg-blue-100" : "hover:bg-gray-100"
                  )}
                >
                  <FlipVertical2 className="size-4 text-gray-600" />
                </button>
              </Hint>

              <div className="w-px h-5 bg-gray-200 mx-0.5" />

              {/* Effects */}
              <Hint label={t("floating_effects")} side="bottom" sideOffset={5}>
                <button
                  onClick={() => onChangeActiveTool?.("effects")}
                  className={cn(
                    "flex items-center justify-center h-7 px-2 rounded transition-colors gap-1",
                    activeTool === "effects" ? "bg-blue-100" : "hover:bg-gray-100"
                  )}
                >
                  <Sparkles className="size-3.5" />
                  <span className="text-xs">{t("floating_effects")}</span>
                </button>
              </Hint>

              <div className="w-px h-5 bg-gray-200 mx-0.5" />
            </>
          )}

          {/* ===== SHAPE CONTROLS (non-text, non-image) ===== */}
          {!isText && !isImage && (
            <>
              {/* Color */}
              <Hint label={t("tool_color")} side="bottom" sideOffset={5}>
                <button
                  onClick={() => onChangeActiveTool?.("fill")}
                  className={cn(
                    "flex items-center justify-center w-7 h-7 rounded transition-colors",
                    activeTool === "fill" ? "bg-blue-100" : "hover:bg-gray-100"
                  )}
                >
                  <div
                    className="rounded-sm size-4 border border-gray-300"
                    style={{ backgroundColor: element.fill || "#000000" }}
                  />
                </button>
              </Hint>

              {/* Stroke color */}
              <Hint label={t("floating_border")} side="bottom" sideOffset={5}>
                <button
                  onClick={() => onChangeActiveTool?.("stroke-color")}
                  className={cn(
                    "flex items-center justify-center w-7 h-7 rounded transition-colors",
                    activeTool === "stroke-color" ? "bg-blue-100" : "hover:bg-gray-100"
                  )}
                >
                  <div
                    className="rounded-sm size-4 border-2 bg-white"
                    style={{ borderColor: element.stroke || "#000000" }}
                  />
                </button>
              </Hint>

              {/* Stroke width */}
              <Hint label={t("tool_stroke_width")} side="bottom" sideOffset={5}>
                <button
                  onClick={() => onChangeActiveTool?.("stroke-width")}
                  className={cn(
                    "flex items-center justify-center w-7 h-7 rounded transition-colors",
                    activeTool === "stroke-width" ? "bg-blue-100" : "hover:bg-gray-100"
                  )}
                >
                  <Frame className="size-4 text-gray-600" />
                </button>
              </Hint>

              <div className="w-px h-5 bg-gray-200 mx-0.5" />
            </>
          )}

          {/* ===== TEXT CONTROLS ===== */}
          {isText && (
            <>
              {/* Color */}
              <Hint label={t("tool_color")} side="bottom" sideOffset={5}>
                <button
                  onClick={() => onChangeActiveTool?.("fill")}
                  className={cn(
                    "flex items-center justify-center w-7 h-7 rounded transition-colors",
                    activeTool === "fill" ? "bg-blue-100" : "hover:bg-gray-100"
                  )}
                >
                  <div
                    className="rounded-sm size-4 border border-gray-300"
                    style={{ backgroundColor: element.fill || "#000000" }}
                  />
                </button>
              </Hint>

              {/* Font family */}
              <Hint label={t("floating_font")} side="bottom" sideOffset={5}>
                <button
                  onClick={() => onChangeActiveTool?.("font")}
                  className={cn(
                    "flex items-center justify-center h-7 px-2 rounded transition-colors gap-1",
                    activeTool === "font" ? "bg-blue-100" : "hover:bg-gray-100"
                  )}
                >
                  <span className="text-xs text-gray-600 max-w-[70px] truncate">
                    {element.fontFamily || "Arial"}
                  </span>
                  <ChevronDown className="size-3" />
                </button>
              </Hint>

              {/* Font size */}
              <FontSizeInput
                value={fontSize}
                onChange={(value) => onChange(element.id, { fontSize: value })}
              />

              <div className="w-px h-5 bg-gray-200 mx-0.5" />

              {/* Bold */}
              <Hint label={t("tool_bold")} side="bottom" sideOffset={5}>
                <button
                  onClick={toggleBold}
                  className={cn(
                    "flex items-center justify-center w-7 h-7 rounded transition-colors",
                    fontWeight > 500 ? "bg-blue-100" : "hover:bg-gray-100"
                  )}
                >
                  <Bold className="size-3.5 text-gray-600" />
                </button>
              </Hint>

              {/* Italic */}
              <Hint label={t("tool_italic")} side="bottom" sideOffset={5}>
                <button
                  onClick={toggleItalic}
                  className={cn(
                    "flex items-center justify-center w-7 h-7 rounded transition-colors",
                    fontStyle === "italic" ? "bg-blue-100" : "hover:bg-gray-100"
                  )}
                >
                  <Italic className="size-3.5 text-gray-600" />
                </button>
              </Hint>

              {/* Underline */}
              <Hint label={t("tool_underline")} side="bottom" sideOffset={5}>
                <button
                  onClick={toggleUnderline}
                  className={cn(
                    "flex items-center justify-center w-7 h-7 rounded transition-colors",
                    textDecoration === "underline" ? "bg-blue-100" : "hover:bg-gray-100"
                  )}
                >
                  <Underline className="size-3.5 text-gray-600" />
                </button>
              </Hint>

              {/* Strikethrough */}
              <Hint label={t("tool_strike")} side="bottom" sideOffset={5}>
                <button
                  onClick={toggleStrikethrough}
                  className={cn(
                    "flex items-center justify-center w-7 h-7 rounded transition-colors",
                    textDecoration === "line-through" ? "bg-blue-100" : "hover:bg-gray-100"
                  )}
                >
                  <Strikethrough className="size-3.5 text-gray-600" />
                </button>
              </Hint>

              {/* Horizontal align */}
              <Hint label={t("floating_align_h")} side="bottom" sideOffset={5}>
                <button
                  onClick={cycleHorizontalAlign}
                  className="flex items-center justify-center w-7 h-7 rounded transition-colors bg-blue-100"
                >
                  {getHorizontalAlignmentIcon()}
                </button>
              </Hint>

              {/* Vertical align */}
              <Hint label={t("floating_align_v")} side="bottom" sideOffset={5}>
                <button
                  onClick={cycleVerticalAlign}
                  className="flex items-center justify-center w-7 h-7 rounded transition-colors bg-blue-100"
                >
                  {getVerticalAlignmentIcon()}
                </button>
              </Hint>

              <div className="w-px h-5 bg-gray-200 mx-0.5" />
            </>
          )}

          {/* ===== COMMON CONTROLS FOR IMAGES ===== */}
          {isImage && (
            <>
              {/* Filters */}
              <Hint label={t("floating_filters")} side="bottom" sideOffset={5}>
                <button
                  onClick={() => onChangeActiveTool?.("filter")}
                  className={cn(
                    "flex items-center justify-center w-7 h-7 rounded transition-colors",
                    activeTool === "filter" ? "bg-blue-100" : "hover:bg-gray-100"
                  )}
                >
                  <Filter className="size-4 text-gray-600" />
                </button>
              </Hint>

              {/* Remove BG */}
              <Hint label={t("floating_remove_bg")} side="bottom" sideOffset={5}>
                <button
                  onClick={() => onChangeActiveTool?.("remove-bg")}
                  className={cn(
                    "flex items-center justify-center w-7 h-7 rounded transition-colors",
                    activeTool === "remove-bg" ? "bg-blue-100" : "hover:bg-gray-100"
                  )}
                >
                  <Eraser className="size-4 text-gray-600" />
                </button>
              </Hint>
            </>
          )}

          {/* Opacity with dropdown - ALL ELEMENTS */}
          <div className="relative" ref={opacityDropdownRef}>
            <Hint label={t("floating_opacity")} side="bottom" sideOffset={5}>
              <button
                onClick={() => setShowOpacityDropdown(!showOpacityDropdown)}
                className={cn(
                  "flex items-center justify-center w-7 h-7 rounded transition-colors",
                  showOpacityDropdown ? "bg-blue-100" : "hover:bg-gray-100"
                )}
              >
                <Grid3x3 className="size-4 text-gray-600" />
              </button>
            </Hint>

            {showOpacityDropdown && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">{t("floating_opacity")}</span>
                  <span className="text-xs font-medium text-gray-700">{Math.round(opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={opacity}
                  onChange={(e) => onChange(element.id, { opacity: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-gray-200 mx-0.5" />

          {/* Center H */}
          <Hint label={t("floating_center_h")} side="bottom" sideOffset={5}>
            <button
              onClick={() => {
                const workspaceWidth = 1080;
                const elWidth = element.width * (element.scaleX ?? 1);
                const newX = (workspaceWidth / 2) - (elWidth / 2);
                onChange(element.id, { x: newX });
              }}
              className="flex items-center justify-center w-7 h-7 rounded hover:bg-gray-100 transition-colors"
            >
              <AlignHorizontalJustifyCenter className="size-4 text-gray-600" />
            </button>
          </Hint>

          {/* Center V */}
          <Hint label={t("floating_center_v")} side="bottom" sideOffset={5}>
            <button
              onClick={() => {
                const workspaceHeight = 1350;
                const elHeight = (element.height || 100) * (element.scaleY ?? 1);
                const newY = (workspaceHeight / 2) - (elHeight / 2);
                onChange(element.id, { y: newY });
              }}
              className="flex items-center justify-center w-7 h-7 rounded hover:bg-gray-100 transition-colors"
            >
              <AlignVerticalJustifyCenter className="size-4 text-gray-600" />
            </button>
          </Hint>
        </div>
      </div>
    </>
  );
};
