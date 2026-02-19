"use client";

import React, { useRef, useEffect } from "react";
import { Transformer } from "react-konva";
import { CanvasElement } from "../types";

interface KonvaTransformerProps {
  selectedIds: string[];
  elements: CanvasElement[];
  onChange: (id: string, changes: Partial<CanvasElement>) => void;
  isEditing?: boolean;
}

export const KonvaTransformer: React.FC<KonvaTransformerProps> = ({
  selectedIds,
  elements,
  onChange,
  isEditing = false,
}) => {
  const transformerRef = useRef<any>(null);

  // Determinar qué anchors usar
  const selectedElements = elements.filter(e => selectedIds.includes(e.id));
  const hasText = selectedElements.some(e => e.type === 'text');
  const isSingleText = selectedIds.length === 1 && hasText;

  const enabledAnchors = ['top-left', 'top-center', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right'];

  // Actualizar los nodos seleccionados cuando cambian los selectedIds
  useEffect(() => {
    if (!transformerRef.current) return;

    const stage = transformerRef.current.getStage();
    if (!stage) return;

    const selectedNodes: any[] = [];
    selectedIds.forEach((id) => {
      const node = stage.findOne(`#${id}`);
      if (node) {
        selectedNodes.push(node);
      }
    });

    if (selectedNodes.length > 0) {
      transformerRef.current.nodes(selectedNodes);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedIds, elements]);

  // No mostrar transformer si está editando texto
  if (selectedIds.length === 0 || isEditing) return null;

  return (
    <Transformer
      ref={transformerRef}
      enabledAnchors={enabledAnchors}
      boundBoxFunc={(oldBox, newBox) => {
        // Limitar el tamaño mínimo
        if (newBox.width < 20 || newBox.height < 20) {
          return oldBox;
        }
        return newBox;
      }}
      onTransform={(e) => {
        // Manejar transform en tiempo real para texto
        const transformedNodes = transformerRef.current?.nodes() || [];

        transformedNodes.forEach((node: any) => {
          const element = elements.find(el => el.id === node.id());
          if (element?.type === 'text') {
            // Para texto: convertir escala a dimensiones reales (sin escalar la letra)
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            const newWidth = node.width() * Math.abs(scaleX);
            const newHeight = node.height() * Math.abs(scaleY);
            
            node.setAttrs({
              width: newWidth,
              height: newHeight,
              scaleX: 1,
              scaleY: 1,
            });
          }
        });
      }}
      onTransformEnd={(e) => {
        // Obtener los nodos transformados
        const transformedNodes = transformerRef.current?.nodes() || [];

        transformedNodes.forEach((node: any) => {
          const id = node.id();
          const element = elements.find(el => el.id === id);
          const rotation = node.rotation();
          const x = node.x();
          const y = node.y();

          // Obtener las dimensiones actuales del nodo
          const nodeWidth = node.width();
          const nodeHeight = node.height();

          let newWidth = nodeWidth;
          let newHeight = nodeHeight;

          if (element?.type !== 'text') {
            // Para otros elementos, aplicar la escala
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            newWidth = nodeWidth * Math.abs(scaleX);
            newHeight = nodeHeight * Math.abs(scaleY);
          }

          // Validar que las dimensiones sean válidas
          if (newWidth < 5) newWidth = 5;
          if (newHeight < 5) newHeight = 5;

          // Resetear escala a 1
          node.scaleX(1);
          node.scaleY(1);

          onChange(id, {
            x,
            y,
            width: newWidth,
            height: newHeight,
            rotation,
            scaleX: 1,
            scaleY: 1,
          });
        });
      }}
    />
  );
};
