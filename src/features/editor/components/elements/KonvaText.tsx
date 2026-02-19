"use client";

import React, { useRef, useCallback, useEffect, useState } from "react";
import { Text } from "react-konva";
import { CanvasElement } from "../../types";

interface KonvaTextProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (id: string, changes: Partial<CanvasElement>) => void;
  onEditingChange?: (isEditing: boolean) => void;
  onDragMove?: (elementId: string, x: number, y: number) => void;
  onDragEnd?: () => void;
}

export const KonvaText: React.FC<KonvaTextProps> = ({
  element,
  onSelect,
  onChange,
  onEditingChange,
  onDragMove,
  onDragEnd,
}) => {
  const textRef = useRef<any>(null);
  const textareaRef = useRef<HTMLDivElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const {
    id,
    x,
    y,
    width,
    height = 100,
    rotation = 0,
    text = "Texto",
    fontSize = 32,
    fontFamily = "Arial",
    textAlign = "left",
    textVerticalAlign = "top",
    lineHeight = 1.2,
    fill = "#000000",
    opacity = 1,
    fontStyle = "normal",
    textDecoration = "none",
  } = element;

  const handleDblClick = useCallback(() => {
    if (!textRef.current) return;

    const textNode = textRef.current;
    const stage = textNode.getStage();
    if (!stage) return;

    // Obtener información del nodo y del stage
    const stageBox = stage.container().getBoundingClientRect();
    const stageScaleX = stage.scaleX();
    const stageScaleY = stage.scaleY();

    const nodeX = textNode.x();
    const nodeY = textNode.y();
    const nodeWidth = textNode.width();
    const nodeHeight = textNode.height();

    // Guardar el centro vertical ANTES de empezar a editar
    const elementCenterY = nodeY + nodeHeight / 2;

    // Calcular posición en pantalla
    const screenX = stageBox.left + nodeX * stageScaleX;
    const screenY = stageBox.top + nodeY * stageScaleY;
    const screenWidth = nodeWidth * stageScaleX;
    const screenHeight = nodeHeight * stageScaleY;

    // Crear contenedor
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = screenY + 'px';
    container.style.left = screenX + 'px';
    container.style.width = screenWidth + 'px';
    container.style.height = screenHeight + 'px';
    container.style.border = 'none';
    container.style.backgroundColor = 'transparent';
    container.style.boxSizing = 'border-box';
    container.style.zIndex = '9999';
    container.style.overflow = 'hidden';
    container.style.display = 'flex';

    // Aplicar alineación vertical
    if (textVerticalAlign === 'middle') {
      container.style.alignItems = 'center';
    } else if (textVerticalAlign === 'bottom') {
      container.style.alignItems = 'flex-end';
    } else {
      container.style.alignItems = 'flex-start';
    }

    // Crear textarea
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'relative';
    textarea.style.width = '100%';
    textarea.style.flex = textVerticalAlign === 'middle' || textVerticalAlign === 'bottom' ? '0 0 auto' : '1';
    textarea.style.border = 'none';
    textarea.style.padding = '4px';
    textarea.style.margin = '0px';
    textarea.style.background = 'transparent';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.fontFamily = fontFamily;
    textarea.style.fontSize = (fontSize * stageScaleX) + 'px';
    textarea.style.fontStyle = fontStyle.includes('italic') ? 'italic' : 'normal';
    textarea.style.fontWeight = fontStyle.includes('bold') ? 'bold' : 'normal';
    textarea.style.textDecoration = textDecoration;
    textarea.style.lineHeight = lineHeight.toString();
    textarea.style.textAlign = textAlign;
    textarea.style.color = fill;
    textarea.style.boxSizing = 'border-box';
    textarea.style.whiteSpace = 'pre-wrap';
    textarea.style.overflowWrap = 'break-word';
    textarea.style.overflow = 'hidden';

    container.appendChild(textarea);
    document.body.appendChild(container);
    textareaRef.current = container;

    textarea.focus();
    textarea.select();

    // Variable para trackear la altura actual del textarea
    let currentTextareaHeight = screenHeight;

    const removeContainer = () => {
      textarea.removeEventListener('keydown', handleKeyDown);
      textarea.removeEventListener('input', handleInput);
      window.removeEventListener('click', handleOutsideClick);
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
      textareaRef.current = null;
      textNode.show();
      textNode.getLayer()?.batchDraw();
      setIsEditing(false);
      onEditingChange?.(false);
    };

    const finishEditing = () => {
      const newText = textarea.value;

      // Calcular la altura final del contenido
      const finalScrollHeight = textarea.scrollHeight;
      const elementHeight = finalScrollHeight / stageScaleY;

      if (textVerticalAlign === 'middle') {
        // Mantener el centro: el nuevo Y = centro - (nueva altura / 2)
        const newY = elementCenterY - elementHeight / 2;
        onChange(id, { text: newText, height: elementHeight, y: newY });
      } else {
        onChange(id, { text: newText, height: elementHeight });
      }

      removeContainer();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        finishEditing();
      }
      if (e.key === 'Escape') {
        removeContainer();
      }
    };

    const handleOutsideClick = (e: MouseEvent) => {
      if (!container.contains(e.target as Node)) {
        finishEditing();
      }
    };

    const handleInput = () => {
      const scrollHeight = textarea.scrollHeight;

      // Actualizar el DOM inmediatamente para suavidad
      if (scrollHeight > currentTextareaHeight) {
        container.style.height = scrollHeight + 'px';
        textarea.style.height = scrollHeight + 'px';

        // Si está centrado verticalmente, ajustar la posición del contenedor
        if (textVerticalAlign === 'middle') {
          const heightDiff = scrollHeight - currentTextareaHeight;
          const currentTop = parseFloat(container.style.top);
          container.style.top = (currentTop - heightDiff / 2) + 'px';
        }

        currentTextareaHeight = scrollHeight;
      }
    };

    // Ocultar el nodo ANTES de crear el contenedor
    textNode.hide();
    textNode.getLayer()?.batchDraw();

    setIsEditing(true);
    onEditingChange?.(true);

    textarea.addEventListener('keydown', handleKeyDown);
    textarea.addEventListener('input', handleInput);
    setTimeout(() => {
      window.addEventListener('click', handleOutsideClick);
      // Inicializar la altura actual
      currentTextareaHeight = textarea.scrollHeight;
    }, 0);

  }, [text, id, onChange, onEditingChange, fontSize, fontFamily, fontStyle, textDecoration, textAlign, textVerticalAlign, fill, lineHeight, width, height]);

  // Konva no usa fontWeight numérico, solo fontStyle (normal, bold, italic, bold italic)
  const textWidth = width && width > 0 ? width : undefined;

  return (
    <Text
      ref={textRef}
      id={id}
      name={text}
      x={x}
      y={y}
      width={textWidth}
      height={height}
      text={text}
      fontSize={fontSize}
      fontFamily={fontFamily}
      fontStyle={fontStyle}
      textDecoration={textDecoration}
      align={textAlign}
      verticalAlign={textVerticalAlign}
      lineHeight={lineHeight}
      fill={fill}
      opacity={opacity}
      rotation={rotation}
      visible={true}
      listening={true}
      draggable
      onDragStart={() => {
        onSelect();
      }}
      onDragMove={(e) => {
        onDragMove?.(id, e.target.x(), e.target.y());
      }}
      onDragEnd={(e) => {
        onChange(id, {
          x: e.target.x(),
          y: e.target.y(),
        });
        onDragEnd?.();
      }}
      onClick={onSelect}
      onTap={onSelect}
      onDblClick={handleDblClick}
      onDblTap={handleDblClick}
    />
  );
};
