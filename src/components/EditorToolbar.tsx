import {
  ArrowLeft,
  Eye,
  Moon,
  Redo2,
  Rocket,
  Sun,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useEditorStore } from "@/store";

const EditorToolbar: React.FC = () => {
  const navigate = useNavigate();
  const [publishState, setPublishState] = useState<
    "idle" | "publishing" | "published"
  >("idle");
  const {
    past,
    future,
    undo,
    redo,
    zoom,
    setZoom,
    theme,
    toggleTheme,
    activeProjectId,
    activePageId,
    projects,
    setActivePage,
    createPage,
    publishProject,
  } = useEditorStore();
  const project = projects.find(
    (candidate) => candidate.id === activeProjectId,
  );
  const publish = () => {
    setPublishState("publishing");
    window.setTimeout(() => {
      publishProject(activeProjectId);
      setPublishState("published");
    }, 900);
  };
  return (
    <header className="editor-toolbar">
      <Link
        to="/dashboard"
        className="icon-button"
        aria-label="Back to dashboard"
        title="Dashboard"
      >
        <ArrowLeft />
      </Link>
      <div className="brand-mark">W</div>
      <div className="project-identity">
        <strong>{project?.name ?? "Untitled site"}</strong>
        <span>
          {publishState === "published"
            ? "Preview published locally"
            : "All changes saved locally"}
        </span>
      </div>
      <div className="page-picker">
        <label>
          <span className="sr-only">Active website page</span>
          <select
            value={activePageId}
            onChange={(event) => setActivePage(event.target.value)}
          >
            {project?.pages.map((page) => (
              <option key={page.id} value={page.id}>
                {page.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="icon-button"
          onClick={createPage}
          aria-label="Add website page"
        >
          +
        </button>
      </div>
      <div className="toolbar-center">
        <button
          type="button"
          className="icon-button"
          onClick={undo}
          disabled={!past.length}
          aria-label="Undo"
          title="Undo"
        >
          <Undo2 />
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={redo}
          disabled={!future.length}
          aria-label="Redo"
          title="Redo"
        >
          <Redo2 />
        </button>
        <span className="toolbar-divider" />
        <button
          type="button"
          className="icon-button"
          onClick={() => setZoom(zoom - 0.1)}
          aria-label="Zoom out"
        >
          <ZoomOut />
        </button>
        <button type="button" className="zoom-label" onClick={() => setZoom(1)}>
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={() => setZoom(zoom + 0.1)}
          aria-label="Zoom in"
        >
          <ZoomIn />
        </button>
      </div>
      <div className="toolbar-actions">
        <button
          type="button"
          className="icon-button"
          onClick={toggleTheme}
          aria-label="Toggle editor theme"
        >
          {theme === "light" ? <Moon /> : <Sun />}
        </button>
        <button
          type="button"
          className="button secondary"
          onClick={() => navigate(`/preview/${activeProjectId}`)}
        >
          <Eye /> Preview
        </button>
        <button
          type="button"
          className="button primary"
          onClick={publish}
          disabled={publishState === "publishing"}
        >
          <Rocket /> {publishState === "publishing" ? "Publishing…" : "Publish"}
        </button>
      </div>
    </header>
  );
};

export default EditorToolbar;
