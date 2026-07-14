"use client";

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragOverEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { fabric } from "fabric";
import {
  Circle,
  Eye,
  EyeOff,
  GripVertical,
  ImageIcon,
  Layers3,
  Lock,
  PenLine,
  RectangleHorizontal,
  Trash2,
  Type,
  Unlock,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Editor } from "@/features/editor/types";
import {
  isFabricObjectLocked,
  setFabricObjectLocked,
} from "@/features/editor/utils";
import { cn } from "@/lib/utils";

interface LayersPanelProps {
  editor?: Editor;
}

type LayerObject = fabric.Object & {
  __layerId?: string;
  locked?: boolean;
};

interface LayerRowProps {
  object: LayerObject;
  label: string;
  selected: boolean;
  editing: boolean;
  editingName: string;
  onEditingNameChange: (value: string) => void;
  onSelect: () => void;
  onStartRename: () => void;
  onFinishRename: () => void;
  onCancelRename: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  onDelete: () => void;
}

let layerSequence = 0;

const getLayerId = (object: LayerObject) => {
  if (!object.__layerId) {
    layerSequence += 1;
    object.__layerId = `fabric-layer-${layerSequence}`;
  }
  return object.__layerId;
};

const isLocked = (object: LayerObject) => isFabricObjectLocked(object);

const getTypeLabel = (type?: string) => {
  switch (type) {
    case "textbox":
    case "text":
    case "i-text": return "Texto";
    case "image": return "Imagen";
    case "rect": return "Rectángulo";
    case "circle": return "Círculo";
    case "triangle": return "Triángulo";
    case "path": return "Trazo";
    default: return "Elemento";
  }
};

const getLayerLabel = (object: LayerObject, fallbackIndex: number) => {
  if (object.name) return object.name;

  if (["textbox", "text", "i-text"].includes(object.type || "")) {
    const text = (object as fabric.Text).text?.trim();
    if (text) return text.length > 24 ? `${text.slice(0, 24)}…` : text;
  }

  return `${getTypeLabel(object.type)} ${fallbackIndex}`;
};

const TypeIcon = ({ type }: { type?: string }) => {
  const className = "size-3.5";
  if (["textbox", "text", "i-text"].includes(type || "")) return <Type className={className} />;
  if (type === "image") return <ImageIcon className={className} />;
  if (type === "circle") return <Circle className={className} />;
  if (type === "path") return <PenLine className={className} />;
  return <RectangleHorizontal className={className} />;
};

const LayerRowContent = ({
  object,
  label,
  selected,
  editing,
  editingName,
  onEditingNameChange,
  onSelect,
  onStartRename,
  onFinishRename,
  onCancelRename,
  onToggleVisibility,
  onToggleLock,
  onDelete,
  dragHandleProps,
}: LayerRowProps & {
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}) => {
  const locked = isLocked(object);

  return (
    <div
      onClick={onSelect}
      className={cn(
        "group flex items-center gap-1 rounded-md border px-1 py-1",
        selected
          ? "border-[#5b35d5]/25 bg-[#e9e5ff]"
          : "border-transparent bg-white/70 hover:border-slate-200 hover:bg-slate-50",
      )}
    >
      <button
        type="button"
        aria-label={`Mover ${label}`}
        className="flex size-6 shrink-0 cursor-grab touch-none items-center justify-center rounded text-slate-300 hover:bg-slate-100 hover:text-slate-500 active:cursor-grabbing"
        onClick={(event) => event.stopPropagation()}
        {...dragHandleProps}
      >
        <GripVertical className="size-3.5" />
      </button>

      <span className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-500",
        selected && "bg-[#c9ff5a] text-[#101426]",
      )}>
        <TypeIcon type={object.type} />
      </span>

      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            autoFocus
            value={editingName}
            onChange={(event) => onEditingNameChange(event.target.value)}
            onClick={(event) => event.stopPropagation()}
            onBlur={onFinishRename}
            onKeyDown={(event) => {
              if (event.key === "Enter") onFinishRename();
              if (event.key === "Escape") onCancelRename();
            }}
            className="h-6 w-full rounded border border-[#5b35d5] bg-white px-1 text-xs outline-none"
          />
        ) : (
          <span
            className={cn(
              "block cursor-text truncate text-xs text-slate-700",
              object.visible === false && "text-slate-400 line-through",
            )}
            onDoubleClick={(event) => {
              event.stopPropagation();
              onStartRename();
            }}
          >
            {label}
          </span>
        )}
      </div>

      <button
        type="button"
        className="flex size-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        title={object.visible === false ? "Mostrar" : "Ocultar"}
        onClick={(event) => {
          event.stopPropagation();
          onToggleVisibility();
        }}
      >
        {object.visible === false
          ? <EyeOff className="size-3.5 text-red-400" />
          : <Eye className="size-3.5" />}
      </button>

      <button
        type="button"
        className="flex size-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        title={locked ? "Desbloquear" : "Bloquear"}
        onClick={(event) => {
          event.stopPropagation();
          onToggleLock();
        }}
      >
        {locked
          ? <Lock className="size-3.5 text-red-500" />
          : <Unlock className="size-3.5" />}
      </button>

      <button
        type="button"
        className="flex size-6 items-center justify-center rounded text-slate-400 hover:bg-red-50 hover:text-red-600"
        title="Eliminar"
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
};

const SortableLayerRow = (props: LayerRowProps) => {
  const id = getLayerId(props.object);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.2 : 1,
      }}
    >
      <LayerRowContent
        {...props}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};

export const LayersPanel = ({ editor }: LayersPanelProps) => {
  const [revision, setRevision] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragOrder, setDragOrder] = useState<string[] | null>(null);
  const initialDragOrderRef = useRef<string[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    const canvas = editor?.canvas;
    if (!canvas) return;

    const refresh = () => setRevision((value) => value + 1);
    const events = [
      "object:added",
      "object:removed",
      "object:modified",
      "selection:created",
      "selection:updated",
      "selection:cleared",
    ] as const;

    events.forEach((event) => canvas.on(event, refresh));
    refresh();
    return () => events.forEach((event) => canvas.off(event, refresh));
  }, [editor]);

  const canvasObjects = useMemo(() => {
    void revision;
    return (editor?.canvas.getObjects() || [])
      .filter((object) => object.name !== "clip")
      .map((object) => object as LayerObject)
      .reverse();
  }, [editor, revision]);

  const objectById = useMemo(
    () => new Map(canvasObjects.map((object) => [getLayerId(object), object])),
    [canvasObjects],
  );

  const defaultOrder = canvasObjects.map(getLayerId);
  const visibleOrder = dragOrder || defaultOrder;
  const objects = visibleOrder
    .map((id) => objectById.get(id))
    .filter((object): object is LayerObject => Boolean(object));
  const activeObjects = editor?.canvas.getActiveObjects() || [];
  const activeObject = activeId ? objectById.get(activeId) : undefined;

  const refresh = () => setRevision((value) => value + 1);
  const renderAndRefresh = () => {
    editor?.canvas.requestRenderAll();
    refresh();
  };

  const commitObjectChange = (object: LayerObject) => {
    editor?.canvas.fire("object:modified", { target: object });
    renderAndRefresh();
  };

  const applyLayerOrder = (order: string[], commit: boolean, changedObject?: LayerObject) => {
    if (!editor) return;

    const workspace = editor.getWorkspace();
    workspace?.sendToBack();
    const firstLayerIndex = workspace ? 1 : 0;

    [...order].reverse().forEach((id, index) => {
      const object = objectById.get(id);
      if (object) editor.canvas.moveTo(object, firstLayerIndex + index);
    });

    editor.canvas.requestRenderAll();
    if (commit && changedObject) {
      editor.canvas.fire("object:modified", { target: changedObject });
    }
  };

  const toggleLock = (object: LayerObject) => {
    const nextLocked = !isLocked(object);
    setFabricObjectLocked(object, nextLocked);
    commitObjectChange(object);
  };

  const selectObject = (object: LayerObject) => {
    if (!editor || object.visible === false) return;
    editor.canvas.setActiveObject(object);
    editor.canvas.requestRenderAll();
    refresh();
  };

  const deleteObject = (object: LayerObject) => {
    if (!editor) return;
    editor.canvas.remove(object);
    editor.canvas.discardActiveObject();
    renderAndRefresh();
  };

  const finishRename = (object: LayerObject) => {
    const value = editingName.trim();
    if (value) object.name = value;
    setEditingId(null);
    setEditingName("");
    commitObjectChange(object);
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    const id = String(active.id);
    const order = [...defaultOrder];
    setActiveId(id);
    setDragOrder(order);
    initialDragOrderRef.current = order;
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;

    setDragOrder((current) => {
      const order = current || defaultOrder;
      const oldIndex = order.indexOf(String(active.id));
      const newIndex = order.indexOf(String(over.id));
      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return order;

      const nextOrder = arrayMove(order, oldIndex, newIndex);
      applyLayerOrder(nextOrder, false);
      return nextOrder;
    });
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over) {
      const finalOrder = dragOrder || defaultOrder;
      const oldIndex = finalOrder.indexOf(String(active.id));
      const newIndex = finalOrder.indexOf(String(over.id));
      const normalizedOrder = oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex
        ? arrayMove(finalOrder, oldIndex, newIndex)
        : finalOrder;
      applyLayerOrder(normalizedOrder, true, objectById.get(String(active.id)));
    } else {
      applyLayerOrder(initialDragOrderRef.current, false);
    }

    setActiveId(null);
    setDragOrder(null);
    refresh();
  };

  const handleDragCancel = () => {
    applyLayerOrder(initialDragOrderRef.current, false);
    setActiveId(null);
    setDragOrder(null);
    refresh();
  };

  const rowProps = (object: LayerObject, index: number): LayerRowProps => {
    const id = getLayerId(object);
    const label = getLayerLabel(object, objects.length - index);

    return {
      object,
      label,
      selected: activeObjects.includes(object),
      editing: editingId === id,
      editingName,
      onEditingNameChange: setEditingName,
      onSelect: () => selectObject(object),
      onStartRename: () => {
        setEditingId(id);
        setEditingName(label);
      },
      onFinishRename: () => finishRename(object),
      onCancelRename: () => {
        setEditingId(null);
        setEditingName("");
      },
      onToggleVisibility: () => {
        const willHide = object.visible !== false;
        object.set({ visible: !willHide });
        if (willHide && editor?.canvas.getActiveObjects().includes(object)) {
          editor.canvas.discardActiveObject();
        }
        commitObjectChange(object);
      },
      onToggleLock: () => toggleLock(object),
      onDelete: () => deleteObject(object),
    };
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className={cn(
        "fixed right-3 z-40 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white/95 shadow-lg backdrop-blur transition-[top]",
        activeObjects.length > 0 ? "top-52" : "top-20",
      )}>
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-3 py-2">
          <h3 className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Layers3 className="size-3.5" />
            Capas
          </h3>
          <span className="text-[10px] text-slate-400">{objects.length}</span>
        </div>

        <div className="max-h-[min(400px,calc(100vh-150px))] space-y-0.5 overflow-y-auto p-1">
          {objects.length === 0 && (
            <p className="px-3 py-7 text-center text-xs text-slate-400">Sin elementos</p>
          )}
          <SortableContext items={visibleOrder} strategy={verticalListSortingStrategy}>
            {objects.map((object, index) => (
              <SortableLayerRow key={getLayerId(object)} {...rowProps(object, index)} />
            ))}
          </SortableContext>
        </div>

        <p className="border-t border-slate-200 bg-slate-50/80 px-2 py-1 text-center text-[10px] text-slate-400">
          Arrastra para ordenar · doble clic para renombrar
        </p>
      </div>

      <DragOverlay dropAnimation={{ duration: 180, easing: "ease" }}>
        {activeObject && (
          <div aria-hidden="true" className="pointer-events-none w-56 rotate-1 scale-[1.02] rounded-md border border-blue-200 bg-white p-1 shadow-2xl">
            <LayerRowContent
              {...rowProps(activeObject, objects.indexOf(activeObject))}
              onSelect={() => {}}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};
