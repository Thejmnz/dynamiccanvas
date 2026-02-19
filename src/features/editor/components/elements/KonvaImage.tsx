"use client";

import React, { useState, useEffect } from "react";
import { Image as KonvaImageComponent } from "react-konva";
import { CanvasElement } from "../../types";

interface KonvaImageProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (id: string, changes: Partial<CanvasElement>) => void;
  onDragMove?: (elementId: string, x: number, y: number) => void;
  onDragEnd?: () => void;
}

export const KonvaImage: React.FC<KonvaImageProps> = ({
  element,
  onSelect,
  onChange,
  onDragMove,
  onDragEnd,
}) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

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
  } = element;

  // Cargar la imagen
  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setImage(img);
    img.onerror = () => {
      console.error("Failed to load image:", src);
    };
    img.src = src;

    return () => {
      setImage(null);
    };
  }, [src]);

  if (!image) {
    return null;
  }

  return (
    <KonvaImageComponent
      id={id}
      image={image}
      x={x}
      y={y}
      width={width}
      height={height}
      rotation={rotation}
      scaleX={scaleX}
      scaleY={scaleY}
      opacity={opacity}
      draggable
      onDragStart={onSelect}
      onDragMove={(e) => {
        onDragMove?.(id, e.target.x(), e.target.y());
      }}
      onDragEnd={(e) => {
        onChange(id, { x: e.target.x(), y: e.target.y() });
        onDragEnd?.();
      }}
      onClick={onSelect}
      onTap={onSelect}
    />
  );
};
