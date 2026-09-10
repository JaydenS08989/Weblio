import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useEditorKeyboardShortcuts } from "@/hooks";
import { useEditorStore } from "@/store";
import AddElementsPanel from "./AddElementsPanel";
import EditorCanvas from "./EditorCanvas";
import EditorDragDropProvider from "./EditorDragDropProvider";
import EditorInspector from "./EditorInspector";
import EditorToolbar from "./EditorToolbar";

const EditorPage: React.FC = () => {
  const { projectId } = useParams();
  const theme = useEditorStore((state) => state.theme);
  const openProject = useEditorStore((state) => state.openProject);
  useEditorKeyboardShortcuts();
  useEffect(() => {
    if (projectId) openProject(projectId);
  }, [projectId, openProject]);
  return (
    <div className="editor" data-theme={theme}>
      <EditorToolbar />
      <EditorDragDropProvider>
        <div className="editor-body">
          <AddElementsPanel />
          <EditorCanvas />
          <EditorInspector />
        </div>
      </EditorDragDropProvider>
      <div className="mobile-editor-notice">
        <strong>Weblio Editor works best on desktop</strong>
        <p>
          Open this project on a larger screen for the complete visual editing
          experience.
        </p>
      </div>
    </div>
  );
};
export default EditorPage;
