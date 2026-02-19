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
  Minus
} from "lucide-react";

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
      {isText && (
        <div className="flex items-center h-full justify-center">
          <Hint label={t("tool_align_left")} side="bottom" sideOffset={5}>
            <Button
              onClick={() => onChangeTextAlign("left")}
              size="icon"
              variant="ghost"
              className={cn(
                properties.textAlign === "left" && "bg-gray-100"
              )}
            >
              <AlignLeft className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      {isText && (
        <div className="flex items-center h-full justify-center">
          <Hint label={t("tool_align_center")} side="bottom" sideOffset={5}>
            <Button
              onClick={() => onChangeTextAlign("center")}
              size="icon"
              variant="ghost"
              className={cn(
                properties.textAlign === "center" && "bg-gray-100"
              )}
            >
              <AlignCenter className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      {isText && (
        <div className="flex items-center h-full justify-center">
          <Hint label={t("tool_align_right")} side="bottom" sideOffset={5}>
            <Button
              onClick={() => onChangeTextAlign("right")}
              size="icon"
              variant="ghost"
              className={cn(
                properties.textAlign === "right" && "bg-gray-100"
              )}
            >
              <AlignRight className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      {isText && (
        <div className="flex items-center h-full justify-center gap-0">
          {/* Vertical Align Top */}
          <Hint label="Align Top" side="bottom" sideOffset={5}>
            <Button
              onClick={() => editor?.changeTextVerticalAlign("top")}
              size="icon"
              variant="ghost"
              className={cn(
                editor?.getActiveTextVerticalAlign() === "top" && "bg-gray-100"
              )}
            >
              <ArrowUp className="size-4" />
            </Button>
          </Hint>
          {/* Vertical Align Center */}
          <Hint label="Align Middle" side="bottom" sideOffset={5}>
            <Button
              onClick={() => editor?.changeTextVerticalAlign("middle")}
              size="icon"
              variant="ghost"
              className={cn(
                editor?.getActiveTextVerticalAlign() === "middle" && "bg-gray-100"
              )}
            >
              <Minus className="size-4" />
            </Button>
          </Hint>
          {/* Vertical Align Bottom */}
          <Hint label="Align Bottom" side="bottom" sideOffset={5}>
            <Button
              onClick={() => editor?.changeTextVerticalAlign("bottom")}
              size="icon"
              variant="ghost"
              className={cn(
                editor?.getActiveTextVerticalAlign() === "bottom" && "bg-gray-100"
              )}
            >
              <ArrowDown className="size-4" />
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
          <Hint label={t("tool_letter_spacing")} side="bottom" sideOffset={5}>
            <LetterSpacingInput
              value={properties.letterSpacing}
              onChange={onChangeLetterSpacing}
            />
          </Hint>
        </div>
      )}
      {isText && (
        <div className="flex items-center h-full justify-center">
          <Hint label={t("tool_line_height")} side="bottom" sideOffset={5}>
            <LineHeightInput
              value={properties.lineHeight}
              onChange={onChangeLineHeight}
            />
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
        <Hint label="Center horizontally" side="bottom" sideOffset={5}>
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
        <Hint label="Center vertically" side="bottom" sideOffset={5}>
          <Button
            onClick={() => editor?.centerVertically()}
            size="icon"
            variant="ghost"
          >
            <AlignVerticalJustifyCenter className="size-4" />
          </Button>
        </Hint>
      </div>
      <div className="flex items-center h-full justify-center">
        <Hint label={t("tool_opacity")} side="bottom" sideOffset={5}>
          <Button
            onClick={() => onChangeActiveTool("opacity")}
            size="icon"
            variant="ghost"
            className={cn(activeTool === "opacity" && "bg-gray-100")}
          >
            <RxTransparencyGrid className="size-4" />
          </Button>
        </Hint>
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
