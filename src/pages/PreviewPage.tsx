import { ArrowLeft } from "lucide-react";
import type React from "react";
import { Link, useParams } from "react-router-dom";
import { WebsiteRenderer } from "@/components";
import { useEditorStore } from "@/store";

const PreviewPage: React.FC = () => {
  const { projectId } = useParams();
  const project = useEditorStore((state) =>
    state.projects.find((candidate) => candidate.id === projectId),
  );
  const page = project?.pages.find(
    (candidate) => candidate.id === project.activePageId,
  );
  if (!project || !page)
    return (
      <main className="not-found-state">
        <h1>Preview not found</h1>
        <p>This site or page is no longer available in this workspace.</p>
        <Link className="button primary" to="/dashboard">
          Return to your sites
        </Link>
      </main>
    );
  return (
    <div className="preview">
      <Link className="preview-return" to={`/editor/${projectId}`}>
        <ArrowLeft />
        Return to editor
      </Link>
      <WebsiteRenderer document={page.document} breakpoint="desktop" />
    </div>
  );
};
export default PreviewPage;
