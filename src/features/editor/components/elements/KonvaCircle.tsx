"use client";

import React from "react";
import { Circle } from "react-konva";
import { CanvasElement } from "../../types";

interface KonvaCircleProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (id: string, changes: Partial<CanvasElement>) => void;
  onDragMove?: (elementId: string, x: number, y: number) => void;
  onDragEnd?: () => void;
}

export const KonvaCircle: React.FC<KonvaCircleProps> = ({
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
  } = element;

  const radiusX = width / 2;
  const radiusY = height / 2;

  return (
    <Circle
      id={id}
      x={x + radiusX}
      y={y + radiusY}
      radiusX={radiusX}
      radiusY={radiusY}
      rotation={rotation}
      scaleX={scaleX}
      scaleY={scaleY}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      opacity={opacity}
      draggable
      onDragStart={onSelect}
      onDragMove={(e) => {
        onDragMove?.(id, e.target.x() - radiusX * scaleX, e.target.y() - radiusY * scaleY);
      }}
      onDragEnd={(e) => {
        onChange(id, { x: e.target.x() - radiusX * scaleX, y: e.target.y() - radiusY * scaleY });
        onDragEnd?.();
      }}
      onClick={onSelect}
      onTap={onSelect}
    />
  );
};
