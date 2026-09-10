import type React from "react";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AddElementsPanel,
  EditorCanvas,
  EditorDragDropProvider,
  EditorInspector,
  EditorToolbar,
} from "@/components";
import { useEditorKeyboardShortcuts } from "@/hooks";
import { useEditorStore } from "@/store";

const EditorPage: React.FC = () => {
  const { projectId } = useParams();

  const theme = useEditorStore((state) => state.theme);
  const openProject = useEditorStore((state) => state.openProject);
  const projectExists = useEditorStore((state) =>
    state.projects.some((project) => project.id === projectId),
  );

  useEditorKeyboardShortcuts();

  useEffect(() => {
    if (projectId) openProject(projectId);
  }, [projectId, openProject]);

  if (!projectExists)
    return (
      <main className="not-found-state">
        <h1>Site not found</h1>
        <p>
          The requested site may have been deleted from this local workspace.
        </p>
        <Link className="button primary" to="/dashboard">
          Return to your sites
        </Link>
      </main>
    );

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
