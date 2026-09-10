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
  const currentDocument = useEditorStore((state) => state.document);
  return (
    <div className="preview">
      <Link className="preview-return" to={`/editor/${projectId}`}>
        <ArrowLeft />
        Return to editor
      </Link>
      <WebsiteRenderer
        document={project?.document ?? currentDocument}
        breakpoint="desktop"
      />
    </div>
  );
};
export default PreviewPage;
