"use client";

import React, { useState, useEffect, useRef } from "react";
import { Image as KonvaImageComponent } from "react-konva";
import Konva from "konva";
import { CanvasElement } from "../../types";

interface KonvaImageProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (id: string, changes: Partial<CanvasElement>) => void;
  onDragMove?: (elementId: string, x: number, y: number) => void;
  onDragEnd?: () => void;
}

// Preset filter configurations
// Note: Many Konva filters work without additional setup - they use default values
// Available filters in Konva 10.x: Blur, Brighten, Brightness, Contrast, Emboss, Enhance,
// Grayscale, HSL, HSV, Invert, Kaleidoscope, Mask, Noise, Pixelate, Posterize, RGB, RGBA, Sepia, Solarize, Threshold
const presetFilters: Record<string, {
  filters: any[];
  setup: (node: any) => void;
}> = {
  none: {
    filters: [],
    setup: () => {}
  },
  polaroid: {
    // Simulated polaroid using sepia
    filters: [Konva.Filters.Sepia],
    setup: () => {}
  },
  sepia: {
    filters: [Konva.Filters.Sepia],
    setup: () => {}
  },
  kodachrome: {
    // Simulated kodachrome using contrast and saturation via HSL
    filters: [Konva.Filters.Contrast, Konva.Filters.HSL],
    setup: () => {}
  },
  contrast: {
    filters: [Konva.Filters.Contrast],
    setup: () => {}
  },
  brightness: {
    filters: [Konva.Filters.Brighten],
    setup: () => {}
  },
  greyscale: {
    filters: [Konva.Filters.Grayscale],
    setup: () => {}
  },
  brownie: {
    // Simulated brownie using sepia
    filters: [Konva.Filters.Sepia],
    setup: () => {}
  },
  vintage: {
    // Simulated vintage using sepia and noise
    filters: [Konva.Filters.Sepia, Konva.Filters.Noise],
    setup: (node: any) => {
      node.noise(0.1);
    }
  },
  technicolor: {
    // Simulated technicolor using contrast and HSL
    filters: [Konva.Filters.Contrast, Konva.Filters.HSL],
    setup: () => {}
  },
  pixelate: {
    filters: [Konva.Filters.Pixelate],
    setup: () => {}
  },
  invert: {
    filters: [Konva.Filters.Invert],
    setup: () => {}
  },
  blur: {
    filters: [Konva.Filters.Blur],
    setup: () => {}
  },
  sharpen: {
    // Using Emboss as alternative since Sharpen doesn't exist
    filters: [Konva.Filters.Emboss],
    setup: () => {}
  },
  emboss: {
    filters: [Konva.Filters.Emboss],
    setup: () => {}
  },
  removecolor: {
    // Placeholder - RemoveColor filter not available in Konva 10
    filters: [],
    setup: () => {}
  },
  blacknwhite: {
    filters: [Konva.Filters.Grayscale],
    setup: () => {}
  },
  vibrance: {
    filters: [Konva.Filters.HSL],
    setup: () => {}
  },
  blendcolor: {
    filters: [Konva.Filters.RGBA],
    setup: () => {}
  },
  huerotate: {
    // Using HSL for hue rotation
    filters: [Konva.Filters.HSL],
    setup: () => {}
  },
  resize: {
    filters: [],
    setup: () => {}
  },
  saturation: {
    filters: [Konva.Filters.HSL],
    setup: () => {}
  },
  gamma: {
    // Placeholder - Gamma filter not available in Konva 10
    filters: [Konva.Filters.Brighten],
    setup: () => {}
  }
};

export const KonvaImage: React.FC<KonvaImageProps> = ({
  element,
  onSelect,
  onChange,
  onDragMove,
  onDragEnd,
}) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const imageRef = useRef<any>(null);
  const isCachedRef = useRef(false);

  const {
    id,
    x,
    y,
    width,
    height,
    rotation = 0,
    scaleX = 1,
    scaleY = 1,
    opacity = 1,
    src,
    locked = false,
    cornerRadius = 0,
    strokeWidth = 0,
    stroke = "#000000",
    flipX = false,
    flipY = false,
    // Filter type (preset)
    filterType,
    // Effect properties
    brightness = 1,
    contrast = 1,
    saturation = 1,
    blur = 0,
    shadowColor = "transparent",
    shadowBlur = 0,
    shadowOffsetX = 0,
    shadowOffsetY = 0,
    shadowOpacity = 0.5,
  } = element;

  // Cargar la imagen
  useEffect(() => {
    if (!src) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImage(img);
      isCachedRef.current = false; // Reset cache flag for new image
    };
    img.onerror = () => {
      console.error("Failed to load image:", src);
    };
    img.src = src;

    return () => {
      setImage(null);
      isCachedRef.current = false;
    };
  }, [src]);

  // Check if we need filters (for caching decision)
  const currentFilter = filterType || 'none';
  const hasPresetFilter = currentFilter !== 'none';
  const hasEffectFilters = brightness !== 1 || contrast !== 1 || saturation !== 1 || blur > 0;
  const needsFilters = hasPresetFilter || hasEffectFilters;

  // Apply filters in real-time - runs on every effect property change
  useEffect(() => {
    if (!imageRef.current || !image) return;

    const node = imageRef.current;

    // Clear any existing cache first when changing filters
    if (isCachedRef.current) {
      node.clearCache();
      node.filters([]);
    }

    // Only cache if we need filters
    if (needsFilters) {
      // Build and apply filters
      const filtersToApply: any[] = [];

      // Apply preset filter first (if exists)
      if (hasPresetFilter && presetFilters[currentFilter]) {
        const preset = presetFilters[currentFilter];
        filtersToApply.push(...preset.filters);
        preset.setup(node);
      }

      // Brightness (Konva uses -1 to 1 range, we have 0 to 2)
      if (brightness !== 1) {
        filtersToApply.push(Konva.Filters.Brighten);
        node.brightness(brightness - 1);
      }

      // Contrast
      if (contrast !== 1) {
        filtersToApply.push(Konva.Filters.Contrast);
        node.contrast(contrast - 1);
      }

      // Saturation (HSL filter)
      if (saturation !== 1) {
        filtersToApply.push(Konva.Filters.HSL);
        node.saturation(saturation - 1);
      }

      // Blur
      if (blur > 0) {
        filtersToApply.push(Konva.Filters.Blur);
        node.blurRadius(blur);
      }

      // Apply all filters BEFORE caching
      node.filters(filtersToApply);

      // Cache after setting filters - this is when filters are actually applied
      node.cache({
        pixelRatio: 2, // Higher quality
      });
      isCachedRef.current = true;
    } else {
      isCachedRef.current = false;
    }

    // Shadow properties (not a filter, direct property)
    if (shadowColor && shadowColor !== "transparent") {
      // Apply opacity to shadow color
      const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      };
      const shadowColorWithOpacity = hexToRgba(shadowColor, shadowOpacity);
      node.shadowColor(shadowColorWithOpacity);
      node.shadowBlur(shadowBlur);
      node.shadowOffsetX(shadowOffsetX);
      node.shadowOffsetY(shadowOffsetY);
    } else {
      node.shadowColor("transparent");
      node.shadowBlur(0);
      node.shadowOffsetX(0);
      node.shadowOffsetY(0);
    }

    // Redraw immediately
    const layer = node.getLayer();
    if (layer) {
      layer.batchDraw();
    }
  }, [image, needsFilters, currentFilter, brightness, contrast, saturation, blur, shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY, shadowOpacity, cornerRadius, strokeWidth, stroke]);

  if (!image) {
    return null;
  }

  // Calcular el scaleX y scaleY final combinando el scale del elemento con el flip
  const finalScaleX = scaleX * (flipX ? -1 : 1);
  const finalScaleY = scaleY * (flipY ? -1 : 1);

  // Offset para centrar cuando hay flip
  const offsetX = flipX ? width : 0;
  const offsetY = flipY ? height : 0;

  return (
    <KonvaImageComponent
      ref={imageRef}
      id={id}
      image={image}
      x={x}
      y={y}
      width={width}
      height={height}
      rotation={rotation}
      scaleX={finalScaleX}
      scaleY={finalScaleY}
      offsetX={offsetX}
      offsetY={offsetY}
      opacity={opacity}
      cornerRadius={cornerRadius}
      stroke={stroke}
      strokeWidth={strokeWidth}
      draggable={!locked}
      onDragStart={() => {
        if (locked) return;
        onSelect();
      }}
      onDragMove={(e) => {
        if (locked) return;
        onDragMove?.(id, e.target.x(), e.target.y());
      }}
      onDragEnd={(e) => {
        if (locked) return;
        onChange(id, { x: e.target.x(), y: e.target.y() });
        onDragEnd?.();
      }}
      onClick={onSelect}
      onTap={onSelect}
    />
  );
};
