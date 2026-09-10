<<<<<<< HEAD
import { useDroppable } from "@dnd-kit/core";
import { Monitor, Smartphone, Tablet } from "lucide-react";
=======
>>>>>>> fc5d160 (Improved application architecture)
import React from "react";
import WebsiteRenderer from "./WebsiteRenderer";

import { Monitor, Smartphone, Tablet } from "lucide-react";
import { useEditorStore } from "@/store";
import type { Breakpoint } from "@/types";

const breakpoints: Array<{
  id: Breakpoint;
  label: string;
  icon: React.ReactNode;
}> = [
  { id: "desktop", label: "Desktop", icon: <Monitor /> },
  { id: "tablet", label: "Tablet", icon: <Tablet /> },
  { id: "mobile", label: "Mobile", icon: <Smartphone /> },
];

const EditorCanvas: React.FC = () => {
  const {
    document,
    breakpoint,
    setBreakpoint,
    viewportWidth,
    setViewportWidth,
    zoom,
    selectedElementId,
    selectElement,
  } = useEditorStore();
<<<<<<< HEAD
  const { isOver, setNodeRef } = useDroppable({
    id: "editor-canvas-drop-zone",
  });
=======

>>>>>>> fc5d160 (Improved application architecture)
  const resize = (event: React.PointerEvent) => {
    const startX = event.clientX;
    const startWidth = viewportWidth;
    event.currentTarget.setPointerCapture(event.pointerId);
    const move = (moveEvent: PointerEvent) =>
      setViewportWidth(startWidth + ((moveEvent.clientX - startX) * 2) / zoom);
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  };

  return (
    <main
      ref={setNodeRef}
      className={`canvas-workspace ${isOver ? "is-drop-target" : ""}`}
      onClick={() => selectElement(null)}
    >
      <div className="viewport-controls">
        <div className="segmented">
          {breakpoints.map((item) => (
            <button
              type="button"
              key={item.id}
              className={breakpoint === item.id ? "active" : ""}
              onClick={(event) => {
                event.stopPropagation();
                setBreakpoint(item.id);
              }}
              title={item.label}
            >
              {item.icon}
            </button>
          ))}
        </div>
        <span>{Math.round(viewportWidth)} px</span>
      </div>
      <div className="canvas-stage">
        {isOver && (
          <div className="canvas-drop-guidance">Drop to add element</div>
        )}
        <div
          className="canvas-scaler"
          style={{ width: viewportWidth, transform: `scale(${zoom})` }}
        >
          <button
            type="button"
            className="resize-handle left"
            onPointerDown={resize}
            aria-label="Resize canvas from left"
          />
          <div className="website-page">
            <WebsiteRenderer
              document={document}
              breakpoint={breakpoint}
              editorMode
              selectedElementId={selectedElementId}
              onSelect={selectElement}
            />
          </div>
          <button
            type="button"
            className="resize-handle right"
            onPointerDown={resize}
            aria-label="Resize canvas from right"
          />
        </div>
      </div>
    </main>
  );
};

export default EditorCanvas;
