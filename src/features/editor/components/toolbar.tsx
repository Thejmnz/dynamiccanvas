import { useState, useEffect } from "react";

import {
  FaBold,
  FaItalic,
  FaStrikethrough,
  FaUnderline
} from "react-icons/fa";
import { TbColorFilter } from "react-icons/tb";
import { BsBorderWidth } from "react-icons/bs";
import { RxTransparencyGrid } from "react-icons/rx";
import {
  ArrowUp,
  ArrowDown,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignHorizontalJustifyCenter,
  Trash,
  SquareSplitHorizontal,
  Copy,
  MoveHorizontal,
  MoveVertical,
  Crosshair,
  Minus,
  Baseline
} from "lucide-react";
import { MdVerticalAlignTop, MdVerticalAlignCenter, MdVerticalAlignBottom } from "react-icons/md";

import { isTextType } from "@/features/editor/utils";
import { FontSizeInput } from "@/features/editor/components/font-size-input";
import { LetterSpacingInput } from "@/features/editor/components/letter-spacing-input";
import { LineHeightInput } from "@/features/editor/components/line-height-input";
import {
  ActiveTool,
  Editor,
  FONT_SIZE,
  FONT_WEIGHT
} from "@/features/editor/types";

import { cn } from "@/lib/utils";
import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useLanguage } from "@/lib/contexts/LanguageContext";

interface ToolbarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const Toolbar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: ToolbarProps) => {
  const { t } = useLanguage();
  const initialFillColor = editor?.getActiveFillColor();
  const initialStrokeColor = editor?.getActiveStrokeColor();
  const initialFontFamily = editor?.getActiveFontFamily();
  const initialFontWeight = editor?.getActiveFontWeight() || FONT_WEIGHT;
  const initialFontStyle = editor?.getActiveFontStyle();
  const initialFontLinethrough = editor?.getActiveFontLinethrough();
  const initialFontUnderline = editor?.getActiveFontUnderline();
  const initialTextAlign = editor?.getActiveTextAlign();
  const initialFontSize = editor?.getActiveFontSize() || FONT_SIZE
  const initialLetterSpacing = editor?.getActiveLetterSpacing() || 0;
  const initialLineHeight = editor?.getActiveLineHeight() || 1;
  const initialOpacity = editor?.getActiveOpacity() ?? 1;

  const [properties, setProperties] = useState({
    fillColor: initialFillColor,
    strokeColor: initialStrokeColor,
    fontFamily: initialFontFamily,
    fontWeight: initialFontWeight,
    fontStyle: initialFontStyle,
    fontLinethrough: initialFontLinethrough,
    fontUnderline: initialFontUnderline,
    textAlign: initialTextAlign,
    fontSize: initialFontSize,
    letterSpacing: initialLetterSpacing,
    lineHeight: initialLineHeight,
    opacity: initialOpacity,
  });

  const selectedObject = editor?.selectedObjects[0];
  const selectedObjectType = editor?.selectedObjects[0]?.type;

  const isText = isTextType(selectedObjectType);
  const isImage = selectedObjectType === "image";

  // Actualizar propiedades cuando cambia la selección
  useEffect(() => {
    if (selectedObject) {
      setProperties({
        fillColor: editor?.getActiveFillColor(),
        strokeColor: editor?.getActiveStrokeColor(),
        fontFamily: editor?.getActiveFontFamily(),
        fontWeight: editor?.getActiveFontWeight() || FONT_WEIGHT,
        fontStyle: editor?.getActiveFontStyle(),
        fontLinethrough: editor?.getActiveFontLinethrough(),
        fontUnderline: editor?.getActiveFontUnderline(),
        textAlign: editor?.getActiveTextAlign(),
        fontSize: editor?.getActiveFontSize() || FONT_SIZE,
        letterSpacing: editor?.getActiveLetterSpacing() || 0,
        lineHeight: editor?.getActiveLineHeight() || 1,
        opacity: editor?.getActiveOpacity() ?? 1,
      });
    }
  }, [selectedObject, editor]);

  const onChangeFontSize = (value: number) => {
    if (!selectedObject) {
      return;
    }

    editor?.changeFontSize(value);
    setProperties((current) => ({
      ...current,
      fontSize: value,
    }));
  };

  const onChangeLetterSpacing = (value: number) => {
    if (!selectedObject) {
      return;
    }

    editor?.changeLetterSpacing(value);
    setProperties((current) => ({
      ...current,
      letterSpacing: value,
    }));
  };

  const onChangeLineHeight = (value: number) => {
    if (!selectedObject) {
      return;
    }

    editor?.changeLineHeight(value);
    setProperties((current) => ({
      ...current,
      lineHeight: value,
    }));
  };

  const onChangeOpacity = (value: number) => {
    if (!selectedObject) {
      return;
    }

    editor?.changeOpacity(value);
    setProperties((current) => ({
      ...current,
      opacity: value,
    }));
  };


  const onChangeTextAlign = (value: string) => {
    if (!selectedObject) {
      return;
    }

    editor?.changeTextAlign(value);
    setProperties((current) => ({
      ...current,
      textAlign: value,
    }));
  };

  // Cycle through horizontal alignment: left -> center -> right -> left
  const cycleHorizontalAlign = () => {
    if (!selectedObject) return;

    const aligns: Array<"left" | "center" | "right"> = ["left", "center", "right"];
    const currentIndex = aligns.indexOf(properties.textAlign as "left" | "center" | "right") || 0;
    const nextIndex = (currentIndex + 1) % aligns.length;
    const nextAlign = aligns[nextIndex];

    onChangeTextAlign(nextAlign);
  };

  // Cycle through vertical alignment: top -> middle -> bottom -> top
  const cycleVerticalAlign = () => {
    if (!selectedObject) return;

    const currentAlign = editor?.getActiveTextVerticalAlign() || "top";
    const aligns: Array<"top" | "middle" | "bottom"> = ["top", "middle", "bottom"];
    const currentIndex = aligns.indexOf(currentAlign as "top" | "middle" | "bottom") || 0;
    const nextIndex = (currentIndex + 1) % aligns.length;
    const nextAlign = aligns[nextIndex];

    editor?.changeTextVerticalAlign(nextAlign);
  };

  // Get icon for current horizontal alignment
  const getHorizontalAlignmentIcon = () => {
    switch (properties.textAlign) {
      case "center":
        return <AlignCenter className="size-4" />;
      case "right":
        return <AlignRight className="size-4" />;
      default:
        return <AlignLeft className="size-4" />;
    }
  };

  // Get icon for current vertical alignment
  const getVerticalAlignmentIcon = () => {
    const align = editor?.getActiveTextVerticalAlign() || "top";
    switch (align) {
      case "middle":
        return <Minus className="size-4" />;
      case "bottom":
        return <ArrowDown className="size-4" />;
      default:
        return <ArrowUp className="size-4" />;
    }
  };

  // Get label for current horizontal alignment
  const getHorizontalAlignmentLabel = () => {
    switch (properties.textAlign) {
      case "center":
        return t("tool_align_center");
      case "right":
        return t("tool_align_right");
      default:
        return t("tool_align_left");
    }
  };

  // Get label for current vertical alignment
  const getVerticalAlignmentLabel = () => {
    const align = editor?.getActiveTextVerticalAlign() || "top";
    switch (align) {
      case "middle":
        return t("tool_align_middle");
      case "bottom":
        return t("tool_align_bottom");
      default:
        return t("tool_align_top");
    }
  };

  const toggleBold = () => {
    if (!selectedObject) {
      return;
    }

    const newValue = properties.fontWeight > 500 ? 500 : 700;

    editor?.changeFontWeight(newValue);
    setProperties((current) => ({
      ...current,
      fontWeight: newValue,
    }));
  };

  const toggleItalic = () => {
    if (!selectedObject) {
      return;
    }

    const isItalic = properties.fontStyle === "italic";
    const newValue = isItalic ? "normal" : "italic";

    editor?.changeFontStyle(newValue);
    setProperties((current) => ({
      ...current,
      fontStyle: newValue,
    }));
  };

  const toggleLinethrough = () => {
    if (!selectedObject) {
      return;
    }

    const newValue = properties.fontLinethrough ? false : true;

    editor?.changeFontLinethrough(newValue);
    setProperties((current) => ({
      ...current,
      fontLinethrough: newValue,
    }));
  };

  const toggleUnderline = () => {
    if (!selectedObject) {
      return;
    }

    const newValue = properties.fontUnderline ? false : true;

    editor?.changeFontUnderline(newValue);
    setProperties((current) => ({
      ...current,
      fontUnderline: newValue,
    }));
  };

  if (editor?.selectedObjects.length === 0) {
    return (
      <div className="shrink-0 h-[56px] border-b bg-white w-full flex items-center overflow-x-auto z-[49] p-2 gap-x-2" />
    );
  }

  return (
    <div className="shrink-0 h-[56px] border-b bg-white w-full flex items-center overflow-x-auto z-[49] p-2 gap-x-2">
      {!isImage && (
        <div className="flex items-center h-full justify-center">
          <Hint label={t("tool_color")} side="bottom" sideOffset={5}>
            <Button
              onClick={() => onChangeActiveTool("fill")}
              size="icon"
              variant="ghost"
              className={cn(
                activeTool === "fill" && "bg-gray-100"
              )}
            >
              <div
                className="rounded-sm size-4 border"
                style={{ backgroundColor: properties.fillColor }}
              />
            </Button>
          </Hint>
        </div>
      )}
      {!isText && (
        <div className="flex items-center h-full justify-center">
          <Hint label={t("tool_stroke_color")} side="bottom" sideOffset={5}>
            <Button
              onClick={() => onChangeActiveTool("stroke-color")}
              size="icon"
              variant="ghost"
              className={cn(
                activeTool === "stroke-color" && "bg-gray-100"
              )}
            >
              <div
                className="rounded-sm size-4 border-2 bg-white"
                style={{ borderColor: properties.strokeColor }}
              />
            </Button>
          </Hint>
        </div>
      )}
      {!isText && (
        <div className="flex items-center h-full justify-center">
          <Hint label={t("tool_stroke_width")} side="bottom" sideOffset={5}>
            <Button
              onClick={() => onChangeActiveTool("stroke-width")}
              size="icon"
              variant="ghost"
              className={cn(
                activeTool === "stroke-width" && "bg-gray-100"
              )}
            >
              <BsBorderWidth className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      {isText && (
        <div className="flex items-center h-full justify-center">
          <Hint label={t("tool_font")} side="bottom" sideOffset={5}>
            <Button
              onClick={() => onChangeActiveTool("font")}
              size="icon"
              variant="ghost"
              className={cn(
                "w-auto px-2 text-sm",
                activeTool === "font" && "bg-gray-100"
              )}
            >
              <div className="max-w-[100px] truncate">
                {properties.fontFamily}
              </div>
              <ChevronDown className="size-4 ml-2 shrink-0" />
            </Button>
          </Hint>
        </div>
      )}
      {isText && (
        <div className="flex items-center h-full justify-center">
          <FontSizeInput
            value={properties.fontSize}
            onChange={onChangeFontSize}
          />
        </div>
      )}
      {isText && (
        <div className="flex items-center h-full justify-center">
          <Hint label={t("tool_bold")} side="bottom" sideOffset={5}>
            <Button
              onClick={toggleBold}
              size="icon"
              variant="ghost"
              className={cn(
                properties.fontWeight > 500 && "bg-gray-100"
              )}
            >
              <FaBold className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      {isText && (
        <div className="flex items-center h-full justify-center">
          <Hint label={t("tool_italic")} side="bottom" sideOffset={5}>
            <Button
              onClick={toggleItalic}
              size="icon"
              variant="ghost"
              className={cn(
                properties.fontStyle === "italic" && "bg-gray-100"
              )}
            >
              <FaItalic className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      {isText && (
        <div className="flex items-center h-full justify-center">
          <Hint label={t("tool_underline")} side="bottom" sideOffset={5}>
            <Button
              onClick={toggleUnderline}
              size="icon"
              variant="ghost"
              className={cn(
                properties.fontUnderline && "bg-gray-100"
              )}
            >
              <FaUnderline className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      {isText && (
        <div className="flex items-center h-full justify-center">
          <Hint label={t("tool_strike")} side="bottom" sideOffset={5}>
            <Button
              onClick={toggleLinethrough}
              size="icon"
              variant="ghost"
              className={cn(
                properties.fontLinethrough && "bg-gray-100"
              )}
            >
              <FaStrikethrough className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      {/* Spacing Dropdown - Letter Spacing & Line Height */}
      {isText && (
        <div className="flex items-center h-full justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
              >
                <Baseline className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="p-3 w-48">
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">{t("tool_letter_spacing")}</label>
                  <LetterSpacingInput
                    value={properties.letterSpacing}
                    onChange={onChangeLetterSpacing}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">{t("tool_line_height")}</label>
                  <LineHeightInput
                    value={properties.lineHeight}
                    onChange={onChangeLineHeight}
                  />
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      {/* Horizontal Alignment - Cycles: left -> center -> right */}
      {isText && (
        <div className="flex items-center h-full justify-center">
          <Hint label={getHorizontalAlignmentLabel()} side="bottom" sideOffset={5}>
            <Button
              onClick={cycleHorizontalAlign}
              size="icon"
              variant="ghost"
              className="bg-gray-100"
            >
              {getHorizontalAlignmentIcon()}
            </Button>
          </Hint>
        </div>
      )}
      {/* Vertical Alignment - Cycles: top -> middle -> bottom */}
      {isText && (
        <div className="flex items-center h-full justify-center">
          <Hint label={getVerticalAlignmentLabel()} side="bottom" sideOffset={5}>
            <Button
              onClick={cycleVerticalAlign}
              size="icon"
              variant="ghost"
              className="bg-gray-100"
            >
              {getVerticalAlignmentIcon()}
            </Button>
          </Hint>
        </div>
      )}
      {isImage && (
        <div className="flex items-center h-full justify-center">
          <Hint label={t("tool_filters")} side="bottom" sideOffset={5}>
            <Button
              onClick={() => onChangeActiveTool("filter")}
              size="icon"
              variant="ghost"
              className={cn(
                activeTool === "filter" && "bg-gray-100"
              )}
            >
              <TbColorFilter className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      {isImage && (
        <div className="flex items-center h-full justify-center">
          <Hint label={t("tool_remove_bg")} side="bottom" sideOffset={5}>
            <Button
              onClick={() => onChangeActiveTool("remove-bg")}
              size="icon"
              variant="ghost"
              className={cn(
                activeTool === "remove-bg" && "bg-gray-100"
              )}
            >
              <SquareSplitHorizontal className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      <div className="flex items-center h-full justify-center">
        <Hint label={t("tool_bring_forward")} side="bottom" sideOffset={5}>
          <Button
            onClick={() => editor?.bringForward()}
            size="icon"
            variant="ghost"
          >
            <ArrowUp className="size-4" />
          </Button>
        </Hint>
      </div>
      <div className="flex items-center h-full justify-center">
        <Hint label={t("tool_send_backwards")} side="bottom" sideOffset={5}>
          <Button
            onClick={() => editor?.sendBackwards()}
            size="icon"
            variant="ghost"
          >
            <ArrowDown className="size-4" />
          </Button>
        </Hint>
      </div>
      <div className="flex items-center h-full justify-center">
        <Hint label={t("tool_center_horizontally")} side="bottom" sideOffset={5}>
          <Button
            onClick={() => editor?.centerHorizontally()}
            size="icon"
            variant="ghost"
          >
            <AlignHorizontalJustifyCenter className="size-4" />
          </Button>
        </Hint>
      </div>
      <div className="flex items-center h-full justify-center">
        <Hint label={t("tool_center_vertically")} side="bottom" sideOffset={5}>
          <Button
            onClick={() => editor?.centerVertically()}
            size="icon"
            variant="ghost"
          >
            <AlignVerticalJustifyCenter className="size-4" />
          </Button>
        </Hint>
      </div>
      {/* Opacity Dropdown with Slider */}
      <div className="flex items-center h-full justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
            >
              <RxTransparencyGrid className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="p-4 w-48">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">{t("tool_opacity")}</label>
                <span className="text-xs font-medium text-white">{Math.round(properties.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={properties.opacity}
                onChange={(e) => onChangeOpacity(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#135bec]"
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center h-full justify-center">
        <Hint label={t("tool_duplicate")} side="bottom" sideOffset={5}>
          <Button
            onClick={() => {
              editor?.onCopy();
              editor?.onPaste();
            }}
            size="icon"
            variant="ghost"
          >
            <Copy className="size-4" />
          </Button>
        </Hint>
      </div>
      <div className="flex items-center h-full justify-center">
        <Hint label={t("tool_delete")} side="bottom" sideOffset={5}>
          <Button
            onClick={() => editor?.delete()}
            size="icon"
            variant="ghost"
            className="text-red-600"
          >
            <Trash className="size-4" />
          </Button>
        </Hint>
      </div>
    </div>
  );
};
