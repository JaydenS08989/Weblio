import { useEffect } from "react";
import { useEditorStore } from "@/store";

export const useEditorKeyboardShortcuts = () => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;

      if (target.matches("input, textarea, select, [contenteditable=true]")) return;

      const store = useEditorStore.getState();

      const command = event.metaKey || event.ctrlKey;

      if (command && event.key.toLowerCase() === "z") {
        event.preventDefault();
        event.shiftKey ? store.redo() : store.undo();
      } else if (command && event.key.toLowerCase() === "y") {
        event.preventDefault();
        store.redo();
      } else if (command && event.key.toLowerCase() === "d") {
        event.preventDefault();
        store.duplicateSelected();
      } else if (event.key === "Backspace" || event.key === "Delete") store.deleteSelected();
      else if (event.key === "Escape") store.selectElement(null);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
};
