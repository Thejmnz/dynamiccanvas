"use client";

import React from "react";
import { Line } from "react-konva";
import { CanvasElement } from "../../types";

interface KonvaDiamondProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (id: string, changes: Partial<CanvasElement>) => void;
  onDragMove?: (elementId: string, x: number, y: number) => void;
  onDragEnd?: () => void;
}

export const KonvaDiamond: React.FC<KonvaDiamondProps> = ({
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

  // Puntos del diamante
  const points = [
    width / 2, 0,      // Punta superior
    width, height / 2, // Punta derecha
    width / 2, height, // Punta inferior
    0, height / 2,     // Punta izquierda
  ];

  return (
    <Line
      id={id}
      points={points}
      x={x}
      y={y}
      rotation={rotation}
      scaleX={scaleX}
      scaleY={scaleY}
      closed={true}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
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
