import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { 
  FaBold, 
  FaItalic, 
  FaStrikethrough, 
  FaUnderline
} from "react-icons/fa";
import { BsBorderWidth } from "react-icons/bs";
import { RxTransparencyGrid } from "react-icons/rx";
import { 
  ArrowUp, 
  ArrowDown, 
  ChevronDown, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  Ban,
  Circle,
  CircleDashed,
  Crop,
  Diamond,
  FlipHorizontal2,
  FlipVertical2,
  Frame,
  Hexagon,
  Loader,
  Moon,
  Octagon,
  Pentagon,
  RefreshCw,
  Rows3,
  Square,
  Sparkles,
  Star,
  Trash,
  Triangle,
  UploadCloud,
  SquareSplitHorizontal,
  Copy
} from "lucide-react";

import { isTextType } from "@/features/editor/utils";
import { FontSizeInput } from "@/features/editor/components/font-size-input";
import { 
  ActiveTool, 
  Editor, 
  FONT_LINE_HEIGHT,
  FONT_SIZE, 
  FONT_WEIGHT
} from "@/features/editor/types";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { resizeImageIfNeeded } from "@/lib/utils/resize-image";
import { USER_UPLOADS_QUERY_KEY } from "@/features/images/api/use-get-images";
import { uploadUserImage } from "@/features/images/api/upload-user-image";
import {
  DEFAULT_IMAGE_EFFECTS,
  ImageEffectSettings,
  ImageMaskShape,
} from "@/features/editor/image-effects";

const ImageSliderRow = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between gap-3">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <input
        aria-label={`${label} value`}
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-7 w-16 rounded-md border border-slate-200 px-2 text-right text-xs tabular-nums outline-none focus:border-blue-500"
      />
    </div>
    <input
      aria-label={label}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-600"
    />
  </div>
);

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
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const initialFillColor = editor?.getActiveFillColor();
  const initialStrokeColor = editor?.getActiveStrokeColor();
  const initialFontFamily = editor?.getActiveFontFamily();
  const initialFontWeight = editor?.getActiveFontWeight() || FONT_WEIGHT;
  const initialFontStyle = editor?.getActiveFontStyle();
  const initialFontLinethrough = editor?.getActiveFontLinethrough();
  const initialFontUnderline = editor?.getActiveFontUnderline();
  const initialTextAlign = editor?.getActiveTextAlign();
  const initialTextVerticalAlign = editor?.getActiveTextVerticalAlign() || "top";
  const initialFontSize = editor?.getActiveFontSize() || FONT_SIZE
  const initialLineHeight = editor?.getActiveLineHeight() || FONT_LINE_HEIGHT;
  const initialCharSpacing = editor?.getActiveCharSpacing() || 0;
  const initialOpacity = editor?.getActiveOpacity() ?? 1;

  const [showOpacityDropdown, setShowOpacityDropdown] = useState(false);
  const [showLineHeightDropdown, setShowLineHeightDropdown] = useState(false);
  const [showMaskDropdown, setShowMaskDropdown] = useState(false);
  const [showImageBorderDropdown, setShowImageBorderDropdown] = useState(false);
  const [showImageCornersDropdown, setShowImageCornersDropdown] = useState(false);
  const [showImageShadowDropdown, setShowImageShadowDropdown] = useState(false);
  const [imageSettings, setImageSettings] = useState<ImageEffectSettings>(DEFAULT_IMAGE_EFFECTS);
  const [isReplacingImage, setIsReplacingImage] = useState(false);
  const opacityDropdownRef = useRef<HTMLDivElement>(null);
  const lineHeightDropdownRef = useRef<HTMLDivElement>(null);
  const maskDropdownRef = useRef<HTMLDivElement>(null);
  const imageBorderDropdownRef = useRef<HTMLDivElement>(null);
  const imageCornersDropdownRef = useRef<HTMLDivElement>(null);
  const imageShadowDropdownRef = useRef<HTMLDivElement>(null);
  const replaceImageInputRef = useRef<HTMLInputElement>(null);
  const svgMaskInputRef = useRef<HTMLInputElement>(null);

  const [properties, setProperties] = useState({
    fillColor: initialFillColor,
    strokeColor: initialStrokeColor,
    fontFamily: initialFontFamily,
    fontWeight: initialFontWeight,
    fontStyle: initialFontStyle,
    fontLinethrough: initialFontLinethrough,
    fontUnderline: initialFontUnderline,
    textAlign: initialTextAlign,
    textVerticalAlign: initialTextVerticalAlign,
    fontSize: initialFontSize,
    lineHeight: initialLineHeight,
    charSpacing: initialCharSpacing,
    opacity: initialOpacity,
  });

  useEffect(() => {
    const closeOpacityDropdown = (event: MouseEvent) => {
      if (
        opacityDropdownRef.current &&
        !opacityDropdownRef.current.contains(event.target as Node)
      ) {
        setShowOpacityDropdown(false);
      }
      if (
        lineHeightDropdownRef.current &&
        !lineHeightDropdownRef.current.contains(event.target as Node)
      ) {
        setShowLineHeightDropdown(false);
      }
      if (
        maskDropdownRef.current &&
        !maskDropdownRef.current.contains(event.target as Node)
      ) {
        setShowMaskDropdown(false);
      }
      if (
        imageBorderDropdownRef.current &&
        !imageBorderDropdownRef.current.contains(event.target as Node)
      ) {
        setShowImageBorderDropdown(false);
      }
      if (
        imageCornersDropdownRef.current &&
        !imageCornersDropdownRef.current.contains(event.target as Node)
      ) {
        setShowImageCornersDropdown(false);
      }
      if (
        imageShadowDropdownRef.current &&
        !imageShadowDropdownRef.current.contains(event.target as Node)
      ) {
        setShowImageShadowDropdown(false);
      }
    };

    document.addEventListener("mousedown", closeOpacityDropdown);
    return () => document.removeEventListener("mousedown", closeOpacityDropdown);
  }, []);

  const selectedObject = editor?.selectedObjects[0];
  const selectedObjectType = editor?.selectedObjects[0]?.type;

  const isText = isTextType(selectedObjectType);
  const isImage = selectedObjectType === "image";

  useEffect(() => {
    if (!selectedObject) return;

    setProperties((current) => ({
      ...current,
      fillColor: editor?.getActiveFillColor(),
      strokeColor: editor?.getActiveStrokeColor(),
      fontFamily: editor?.getActiveFontFamily(),
      fontWeight: editor?.getActiveFontWeight() || FONT_WEIGHT,
      fontStyle: editor?.getActiveFontStyle(),
      fontLinethrough: editor?.getActiveFontLinethrough(),
      fontUnderline: editor?.getActiveFontUnderline(),
      textAlign: editor?.getActiveTextAlign(),
      textVerticalAlign: editor?.getActiveTextVerticalAlign() || "top",
      fontSize: editor?.getActiveFontSize() || FONT_SIZE,
      lineHeight: editor?.getActiveLineHeight() || FONT_LINE_HEIGHT,
      charSpacing: editor?.getActiveCharSpacing() || 0,
      opacity: editor?.getActiveOpacity() ?? 1,
    }));
    if (selectedObject.type === "image") {
      setImageSettings(editor?.getActiveImageEffects() || DEFAULT_IMAGE_EFFECTS);
    }
  }, [editor, selectedObject]);

  const updateImageSettings = (values: Partial<ImageEffectSettings>) => {
    setImageSettings((current) => ({ ...current, ...values }));
    editor?.updateActiveImageEffects(values);
  };

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

  const onChangeLineHeight = (value: number) => {
    if (!selectedObject || !Number.isFinite(value)) return;

    const nextValue = Math.round(Math.min(3, Math.max(0.5, value)) * 100) / 100;
    editor?.changeLineHeight(nextValue);
    setProperties((current) => ({
      ...current,
      lineHeight: nextValue,
    }));
  };

  const onChangeCharSpacing = (value: number) => {
    if (!selectedObject || !Number.isFinite(value)) return;

    const nextValue = Math.round(Math.min(800, Math.max(-200, value)));
    editor?.changeCharSpacing(nextValue);
    setProperties((current) => ({
      ...current,
      charSpacing: nextValue,
    }));
  };

  const replaceSelectedImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;
    setIsReplacingImage(true);

    try {
      const resizedFile = await resizeImageIfNeeded(file);
      const uploadedImage = await uploadUserImage(resizedFile);
      editor.replaceActiveImage(uploadedImage.url);
      queryClient.invalidateQueries({ queryKey: [USER_UPLOADS_QUERY_KEY] });
      toast.success(language === "es" ? "Imagen reemplazada" : "Image replaced");
    } catch (error) {
      console.error(error);
      toast.error(language === "es" ? "No se pudo reemplazar la imagen" : "Could not replace image");
    } finally {
      setIsReplacingImage(false);
      event.target.value = "";
    }
  };

  const uploadSvgMask = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    try {
      editor.applyActiveImageSvgMask(await file.text());
      setShowMaskDropdown(false);
      toast.success(language === "es" ? "Máscara SVG aplicada" : "SVG mask applied");
    } catch (error) {
      console.error(error);
      toast.error(language === "es" ? "No se pudo aplicar la máscara" : "Could not apply mask");
    } finally {
      event.target.value = "";
    }
  };

  const maskOptions: Array<{
    value: ImageMaskShape;
    label: string;
    icon: typeof Circle;
  }> = [
    { value: "none", label: language === "es" ? "Ninguna" : "None", icon: Ban },
    { value: "star", label: language === "es" ? "Estrella" : "Star", icon: Star },
    { value: "triangle", label: language === "es" ? "Triángulo" : "Triangle", icon: Triangle },
    { value: "diamond", label: language === "es" ? "Diamante" : "Diamond", icon: Diamond },
    { value: "circle", label: language === "es" ? "Círculo" : "Circle", icon: Circle },
    { value: "pentagon", label: language === "es" ? "Pentágono" : "Pentagon", icon: Pentagon },
    { value: "hexagon", label: language === "es" ? "Hexágono" : "Hexagon", icon: Hexagon },
    { value: "octagon", label: language === "es" ? "Octágono" : "Octagon", icon: Octagon },
    { value: "quarter-circle", label: language === "es" ? "Cuarto de círculo" : "Quarter Circle", icon: Moon },
    { value: "rounded-rectangle", label: language === "es" ? "Rectángulo redondeado" : "Rounded Rectangle", icon: Frame },
  ];

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

  const onChangeTextVerticalAlign = (value: "top" | "middle" | "bottom") => {
    if (!selectedObject) {
      return;
    }

    editor?.changeTextVerticalAlign(value);
    setProperties((current) => ({
      ...current,
      textVerticalAlign: value,
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
    return null;
  }

  return (
    <div className="absolute left-1/2 top-2 z-[60] flex min-h-11 max-w-[calc(100%-24px)] -translate-x-1/2 items-center gap-x-1 overflow-visible rounded-lg border border-slate-200 bg-white/95 p-1.5 shadow-lg backdrop-blur">
      {!isImage && (
        <div className="flex items-center h-full justify-center">
          <Hint label="Color" side="bottom" sideOffset={5}>
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
      {!isText && !isImage && (
        <div className="flex items-center h-full justify-center">
          <Hint label="Stroke color" side="bottom" sideOffset={5}>
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
      {!isText && !isImage && (
        <div className="flex items-center h-full justify-center">
          <Hint label="Stroke width" side="bottom" sideOffset={5}>
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
          <Hint label="Font" side="bottom" sideOffset={5}>
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
          <Hint label="Bold" side="bottom" sideOffset={5}>
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
          <Hint label="Italic" side="bottom" sideOffset={5}>
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
          <Hint label="Underline" side="bottom" sideOffset={5}>
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
          <Hint label="Strike" side="bottom" sideOffset={5}>
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
          <Hint label="Align left" side="bottom" sideOffset={5}>
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
          <Hint label="Align center" side="bottom" sideOffset={5}>
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
          <Hint label="Align right" side="bottom" sideOffset={5}>
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
      {selectedObjectType === "textbox" && (
        <div className="flex items-center h-full justify-center border-l pl-2">
          <Hint label="Alinear texto arriba dentro del cuadro" side="bottom" sideOffset={5}>
            <Button
              onClick={() => onChangeTextVerticalAlign("top")}
              size="icon"
              variant="ghost"
              className={cn(
                properties.textVerticalAlign === "top" && "bg-gray-100"
              )}
            >
              <AlignVerticalJustifyStart className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      {selectedObjectType === "textbox" && (
        <div className="flex items-center h-full justify-center">
          <Hint label="Centrar texto verticalmente dentro del cuadro" side="bottom" sideOffset={5}>
            <Button
              onClick={() => onChangeTextVerticalAlign("middle")}
              size="icon"
              variant="ghost"
              className={cn(
                properties.textVerticalAlign === "middle" && "bg-gray-100"
              )}
            >
              <AlignVerticalJustifyCenter className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      {selectedObjectType === "textbox" && (
        <div className="flex items-center h-full justify-center">
          <Hint label="Alinear texto abajo dentro del cuadro" side="bottom" sideOffset={5}>
            <Button
              onClick={() => onChangeTextVerticalAlign("bottom")}
              size="icon"
              variant="ghost"
              className={cn(
                properties.textVerticalAlign === "bottom" && "bg-gray-100"
              )}
            >
              <AlignVerticalJustifyEnd className="size-4" />
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
        <div
          ref={lineHeightDropdownRef}
          className="relative flex h-full items-center justify-center"
        >
          <Hint
            label={language === "es" ? "Interlineado" : "Line height"}
            side="bottom"
            sideOffset={5}
          >
            <Button
              type="button"
              aria-label={language === "es" ? "Espaciado del texto" : "Text spacing"}
              onClick={() => setShowLineHeightDropdown((current) => !current)}
              variant="ghost"
              className={cn(
                "h-8 px-2",
                showLineHeightDropdown && "bg-gray-100"
              )}
            >
              <Rows3 className="size-4" />
            </Button>
          </Hint>
          {showLineHeightDropdown && (
            <div className="absolute left-1/2 top-full z-[70] mt-2 w-80 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
              <div>
                <div className="mb-2 text-sm font-medium text-slate-700">
                  {language === "es" ? "Espaciado entre letras" : "Letter spacing"}
                </div>
                <div className="flex items-center gap-4">
                  <input
                    aria-label={language === "es" ? "Ajustar espaciado entre letras" : "Adjust letter spacing"}
                    type="range"
                    min="-200"
                    max="800"
                    step="1"
                    value={properties.charSpacing}
                    onChange={(event) => onChangeCharSpacing(Number(event.target.value))}
                    className="h-2 min-w-0 flex-1 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-500"
                  />
                  <input
                    aria-label={language === "es" ? "Valor del espaciado entre letras" : "Letter spacing value"}
                    type="number"
                    min="-200"
                    max="800"
                    step="1"
                    value={properties.charSpacing}
                    onChange={(event) => onChangeCharSpacing(Number(event.target.value))}
                    className="h-9 w-20 rounded-md border border-slate-200 px-2 text-right text-sm tabular-nums outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-5">
                <div className="mb-2 text-sm font-medium text-slate-700">
                  {language === "es" ? "Interlineado" : "Line spacing"}
                </div>
                <div className="flex items-center gap-4">
                  <input
                    aria-label={language === "es" ? "Ajustar interlineado" : "Adjust line spacing"}
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.05"
                    value={properties.lineHeight}
                    onChange={(event) => onChangeLineHeight(Number(event.target.value))}
                    className="h-2 min-w-0 flex-1 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-500"
                  />
                  <input
                    aria-label={language === "es" ? "Valor de interlineado" : "Line spacing value"}
                    type="number"
                    min="0.5"
                    max="3"
                    step="0.05"
                    value={properties.lineHeight.toFixed(2)}
                    onChange={(event) => onChangeLineHeight(Number(event.target.value))}
                    className="h-9 w-20 rounded-md border border-slate-200 px-2 text-right text-sm tabular-nums outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {isImage && (
        <>
          <input
            ref={replaceImageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={replaceSelectedImage}
          />
          <div className="flex items-center h-full justify-center">
            <Hint label={language === "es" ? "Reemplazar imagen" : "Replace image"} side="bottom" sideOffset={5}>
              <Button
                type="button"
                aria-label={language === "es" ? "Reemplazar imagen" : "Replace image"}
                onClick={() => replaceImageInputRef.current?.click()}
                size="icon"
                variant="ghost"
                disabled={isReplacingImage}
              >
                {isReplacingImage ? <Loader className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              </Button>
            </Hint>
          </div>
          <div className="flex items-center h-full justify-center">
            <Hint label={language === "es" ? "Voltear horizontalmente" : "Flip horizontal"} side="bottom" sideOffset={5}>
              <Button
                type="button"
                aria-label={language === "es" ? "Voltear horizontalmente" : "Flip horizontal"}
                onClick={() => editor?.flipActiveImage("horizontal")}
                size="icon"
                variant="ghost"
              >
                <FlipHorizontal2 className="size-4" />
              </Button>
            </Hint>
          </div>
          <div className="flex items-center h-full justify-center">
            <Hint label={language === "es" ? "Voltear verticalmente" : "Flip vertical"} side="bottom" sideOffset={5}>
              <Button
                type="button"
                aria-label={language === "es" ? "Voltear verticalmente" : "Flip vertical"}
                onClick={() => editor?.flipActiveImage("vertical")}
                size="icon"
                variant="ghost"
              >
                <FlipVertical2 className="size-4" />
              </Button>
            </Hint>
          </div>
          <div ref={maskDropdownRef} className="relative flex h-full items-center justify-center">
            <Hint label={language === "es" ? "Aplicar máscara" : "Apply mask"} side="bottom" sideOffset={5}>
              <Button
                type="button"
                aria-label={language === "es" ? "Aplicar máscara" : "Apply mask"}
                onClick={() => setShowMaskDropdown((current) => !current)}
                size="icon"
                variant="ghost"
                className={cn(showMaskDropdown && "bg-gray-100")}
              >
                <Frame className="size-4" />
              </Button>
            </Hint>
            {showMaskDropdown && (
              <div className="absolute left-1/2 top-full z-[75] mt-2 w-72 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                {maskOptions.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      editor?.applyActiveImageMask(value);
                      setShowMaskDropdown(false);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                  >
                    <span>{label}</span>
                    <Icon className="size-5" />
                  </button>
                ))}
                <div className="my-1 border-t border-slate-200" />
                <button
                  type="button"
                  onClick={() => svgMaskInputRef.current?.click()}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                >
                  <span>{language === "es" ? "Subir máscara SVG" : "Upload SVG Mask"}</span>
                  <UploadCloud className="size-5" />
                </button>
                <input
                  ref={svgMaskInputRef}
                  type="file"
                  accept="image/svg+xml,.svg"
                  className="hidden"
                  onChange={uploadSvgMask}
                />
              </div>
            )}
          </div>
          <div className="flex items-center h-full justify-center">
            <Hint label={language === "es" ? "Recortar imagen" : "Crop image"} side="bottom" sideOffset={5}>
              <Button
                type="button"
                aria-label={language === "es" ? "Recortar imagen" : "Crop image"}
                onClick={() => onChangeActiveTool("crop")}
                size="icon"
                variant="ghost"
                className={cn(activeTool === "crop" && "bg-gray-100")}
              >
                <Crop className="size-4" />
              </Button>
            </Hint>
          </div>
          <div className="flex items-center h-full justify-center border-l pl-1">
            <Hint label={language === "es" ? "Efectos" : "Effects"} side="bottom" sideOffset={5}>
              <Button
                type="button"
                aria-label={language === "es" ? "Efectos de imagen" : "Image effects"}
                onClick={() => onChangeActiveTool("filter")}
                variant="ghost"
                className={cn(
                  "h-8 gap-1.5 px-2 text-sm",
                  activeTool === "filter" && "bg-gray-100"
                )}
              >
                <Sparkles className="size-4" />
                <span>{language === "es" ? "Efectos" : "Effects"}</span>
              </Button>
            </Hint>
          </div>
          <div
            ref={imageBorderDropdownRef}
            className="relative flex h-full items-center justify-center"
          >
            <Hint label={language === "es" ? "Borde" : "Border"} side="bottom" sideOffset={5}>
              <Button
                type="button"
                aria-label={language === "es" ? "Borde de imagen" : "Image border"}
                onClick={() => {
                  setShowImageBorderDropdown((current) => !current);
                  setShowImageCornersDropdown(false);
                  setShowImageShadowDropdown(false);
                }}
                size="icon"
                variant="ghost"
                className={cn(showImageBorderDropdown && "bg-gray-100")}
              >
                <Square className="size-4" />
              </Button>
            </Hint>
            {showImageBorderDropdown && (
              <div className="absolute left-1/2 top-full z-[75] mt-2 w-64 -translate-x-1/2 space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
                <div className="text-sm font-semibold text-slate-900">
                  {language === "es" ? "Borde" : "Border"}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-slate-600">
                    {language === "es" ? "Color" : "Color"}
                  </span>
                  <input
                    aria-label={language === "es" ? "Color del borde" : "Border color"}
                    type="color"
                    value={imageSettings.borderColor}
                    onChange={(event) => updateImageSettings({ borderColor: event.target.value })}
                    className="h-9 w-14 cursor-pointer rounded-md border border-slate-200 bg-white p-1"
                  />
                </div>
                <ImageSliderRow
                  label={language === "es" ? "Ancho" : "Width"}
                  value={imageSettings.borderWidth}
                  min={0}
                  max={60}
                  onChange={(value) => updateImageSettings({ borderWidth: value })}
                />
              </div>
            )}
          </div>
          <div
            ref={imageCornersDropdownRef}
            className="relative flex h-full items-center justify-center"
          >
            <Hint label={language === "es" ? "Esquinas" : "Corners"} side="bottom" sideOffset={5}>
              <Button
                type="button"
                aria-label={language === "es" ? "Redondeo de esquinas" : "Corner rounding"}
                onClick={() => {
                  setShowImageCornersDropdown((current) => !current);
                  setShowImageBorderDropdown(false);
                  setShowImageShadowDropdown(false);
                }}
                size="icon"
                variant="ghost"
                className={cn(showImageCornersDropdown && "bg-gray-100")}
              >
                <CircleDashed className="size-4" />
              </Button>
            </Hint>
            {showImageCornersDropdown && (
              <div className="absolute left-1/2 top-full z-[75] mt-2 w-72 -translate-x-1/2 space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
                <div className="text-sm font-semibold text-slate-900">
                  {language === "es" ? "Redondeo de esquinas" : "Corner Rounding"}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-slate-600">
                    {language === "es" ? "Modo" : "Rounding Mode"}
                  </span>
                  <div className="flex rounded-lg border border-slate-200 p-1">
                    {(["px", "%"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => updateImageSettings({ cornerMode: mode })}
                        className={cn(
                          "rounded-md px-3 py-1 text-xs font-semibold",
                          imageSettings.cornerMode === mode
                            ? "bg-slate-900 text-white"
                            : "text-slate-500 hover:bg-slate-100",
                        )}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
                <ImageSliderRow
                  label={language === "es" ? "Radio" : "Corner Radius"}
                  value={imageSettings.cornerRadius}
                  min={0}
                  max={imageSettings.cornerMode === "%" ? 50 : 400}
                  onChange={(value) => updateImageSettings({ cornerRadius: value })}
                />
                <ImageSliderRow
                  label={language === "es" ? "Bordes suaves" : "Soft Edges"}
                  value={imageSettings.softEdges}
                  min={0}
                  max={100}
                  onChange={(value) => updateImageSettings({ softEdges: value })}
                />
              </div>
            )}
          </div>
          <div
            ref={imageShadowDropdownRef}
            className="relative flex h-full items-center justify-center"
          >
            <Hint label={language === "es" ? "Sombra" : "Shadow"} side="bottom" sideOffset={5}>
              <Button
                type="button"
                aria-label={language === "es" ? "Sombra de imagen" : "Image shadow"}
                onClick={() => {
                  setShowImageShadowDropdown((current) => !current);
                  setShowImageBorderDropdown(false);
                  setShowImageCornersDropdown(false);
                }}
                size="icon"
                variant="ghost"
                className={cn(showImageShadowDropdown && "bg-gray-100")}
              >
                <Moon className="size-4" />
              </Button>
            </Hint>
            {showImageShadowDropdown && (
              <div className="absolute right-0 top-full z-[75] mt-2 w-72 space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
                <div className="text-sm font-semibold text-slate-900">
                  {language === "es" ? "Sombra" : "Shadow"}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-slate-600">Color</span>
                  <input
                    aria-label={language === "es" ? "Color de sombra" : "Shadow color"}
                    type="color"
                    value={imageSettings.shadowColor}
                    onChange={(event) => updateImageSettings({ shadowColor: event.target.value })}
                    className="h-9 w-14 cursor-pointer rounded-md border border-slate-200 bg-white p-1"
                  />
                </div>
                <ImageSliderRow
                  label={language === "es" ? "Desenfoque" : "Blur"}
                  value={imageSettings.shadowBlur}
                  min={0}
                  max={100}
                  onChange={(value) => updateImageSettings({ shadowBlur: value })}
                />
                <ImageSliderRow
                  label={language === "es" ? "Opacidad" : "Opacity"}
                  value={Math.round(imageSettings.shadowOpacity * 100)}
                  min={0}
                  max={100}
                  onChange={(value) => updateImageSettings({ shadowOpacity: value / 100 })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <ImageSliderRow
                    label="X"
                    value={imageSettings.shadowOffsetX}
                    min={-100}
                    max={100}
                    onChange={(value) => updateImageSettings({ shadowOffsetX: value })}
                  />
                  <ImageSliderRow
                    label="Y"
                    value={imageSettings.shadowOffsetY}
                    min={-100}
                    max={100}
                    onChange={(value) => updateImageSettings({ shadowOffsetY: value })}
                  />
                </div>
              </div>
            )}
          </div>
        </>
      )}
      {isImage && (
        <div className="flex items-center h-full justify-center">
          <Hint label="Remove background" side="bottom" sideOffset={5}>
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
        <Hint label="Bring forward" side="bottom" sideOffset={5}>
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
        <Hint label="Send backwards" side="bottom" sideOffset={5}>
          <Button
            onClick={() => editor?.sendBackwards()}
            size="icon"
            variant="ghost"
          >
            <ArrowDown className="size-4" />
          </Button>
        </Hint>
      </div>
      <div ref={opacityDropdownRef} className="relative flex h-full items-center justify-center">
        <Hint label="Opacity" side="bottom" sideOffset={5}>
          <Button
            aria-label="Opacidad"
            onClick={() => {
              if (activeTool === "opacity") onChangeActiveTool("opacity");
              setShowOpacityDropdown((current) => !current);
            }}
            size="icon"
            variant="ghost"
            className={cn(showOpacityDropdown && "bg-gray-100")}
          >
            <RxTransparencyGrid className="size-4" />
          </Button>
        </Hint>
        {showOpacityDropdown && (
          <div className="absolute left-1/2 top-full z-[70] mt-2 w-44 -translate-x-1/2 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-slate-500">Opacidad</span>
              <span className="text-xs font-medium text-slate-700">
                {Math.round(properties.opacity * 100)}%
              </span>
            </div>
            <input
              aria-label="Opacidad del elemento"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={properties.opacity}
              onChange={(event) => {
                const opacity = Number.parseFloat(event.target.value);
                editor?.changeOpacity(opacity);
                setProperties((current) => ({ ...current, opacity }));
              }}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600"
            />
          </div>
        )}
      </div>
      <div className="flex items-center h-full justify-center">
        <Hint label="Duplicate" side="bottom" sideOffset={5}>
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
        <Hint label="Delete" side="bottom" sideOffset={5}>
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
