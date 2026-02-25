"use client";

import React, { useRef } from "react";
import { Rect, Group } from "react-konva";
import { CanvasElement } from "../../types";

interface KonvaRectProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (id: string, changes: Partial<CanvasElement>) => void;
  onDragMove?: (elementId: string, x: number, y: number) => void;
  onDragEnd?: () => void;
}

export const KonvaRect: React.FC<KonvaRectProps> = ({
  element,
  onSelect,
  onChange,
  onDragMove,
  onDragEnd,
}) => {
  const {
    id,
    x,
    y,
    width,
    height,
    rotation = 0,
    scaleX = 1,
    scaleY = 1,
    fill = "#888888",
    stroke,
    strokeWidth = 0,
    opacity = 1,
    cornerRadius = 0,
    locked = false,
  } = element;

  return (
    <Rect
      id={id}
      x={x}
      y={y}
      width={width}
      height={height}
      rotation={rotation}
      scaleX={scaleX}
      scaleY={scaleY}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      opacity={opacity}
      cornerRadius={cornerRadius}
      visible={element.visible !== false}
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
