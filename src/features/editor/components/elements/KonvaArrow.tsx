"use client";

import React from "react";
import { Line } from "react-konva";
import { CanvasElement } from "../../types";

interface KonvaArrowProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (id: string, changes: Partial<CanvasElement>) => void;
  onDragMove?: (elementId: string, x: number, y: number) => void;
  onDragEnd?: () => void;
}

export const KonvaArrow: React.FC<KonvaArrowProps> = ({
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
    locked = false,
  } = element;

  // Flecha apuntando a la derecha
  const arrowHeight = height;
  const arrowWidth = Math.min(width * 0.3, height); // Ancho de la punta
  const bodyWidth = width - arrowWidth;

  const points = [
    0, arrowHeight * 0.3,              // Inicio superior del cuerpo
    bodyWidth, arrowHeight * 0.3,       // Esquina superior de la punta
    bodyWidth, 0,                       // Punta superior
    width, arrowHeight * 0.5,           // Punta de la flecha
    bodyWidth, arrowHeight,             // Punta inferior
    bodyWidth, arrowHeight * 0.7,       // Esquina inferior de la punta
    0, arrowHeight * 0.7,               // Inicio inferior del cuerpo
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
