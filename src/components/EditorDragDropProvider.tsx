import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import React, { useState } from "react";
import { useEditorStore } from "@/store";
import type { ElementType } from "@/types";

interface EditorDragDropProviderProps {
  children: React.ReactNode;
}
export interface AddElementDragData {
  kind: "new-element";
  elementType: ElementType;
  label: string;
}

export const isAddElementDragData = (
  dragData: unknown,
): dragData is AddElementDragData => {
  if (!dragData || typeof dragData !== "object") return false;
  return "kind" in dragData && dragData.kind === "new-element";
};

const EditorDragDropProvider: React.FC<EditorDragDropProviderProps> = ({
  children,
}) => {
  const addElement = useEditorStore((state) => state.addElement);
  const [activeDrag, setActiveDrag] = useState<AddElementDragData | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const dragData = event.active.data.current;
    setActiveDrag(isAddElementDragData(dragData) ? dragData : null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const dragData = event.active.data.current;
    if (
      event.over?.id === "editor-canvas-drop-zone" &&
      isAddElementDragData(dragData)
    ) {
      addElement(dragData.elementType);
    }
    setActiveDrag(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragCancel={() => setActiveDrag(null)}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay dropAnimation={{ duration: 160, easing: "ease-out" }}>
        {activeDrag ? (
          <div className="element-drag-overlay">{activeDrag.label}</div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default EditorDragDropProvider;
