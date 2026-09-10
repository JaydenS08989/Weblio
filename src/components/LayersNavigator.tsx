import { ArrowDown, ArrowUp, ChevronRight } from "lucide-react";
import type React from "react";
import { getChildIds } from "@/lib";
import { useEditorStore } from "@/store";

const LayersNavigator: React.FC = () => {
  const document = useEditorStore((state) => state.document);
  const selectedElementId = useEditorStore((state) => state.selectedElementId);
  const selectElement = useEditorStore((state) => state.selectElement);
  const moveElement = useEditorStore((state) => state.moveElement);

  const renderLayer = (elementId: string, depth: number): React.ReactNode => {
    const element = document.elements[elementId];
    if (!element) return null;
    const parent = element.parentId
      ? document.elements[element.parentId]
      : undefined;
    const parentChildren = getChildIds(parent);
    const siblingIndex = parentChildren.indexOf(elementId);

    const moveWithinParent = (offset: number) => {
      if (!parent) return;
      moveElement(elementId, parent.id, siblingIndex + offset);
    };

    return (
      <li key={elementId}>
        <div
          className={`layer-row ${selectedElementId === elementId ? "selected" : ""}`}
        >
          <button
            type="button"
            className="layer-select"
            style={{ paddingLeft: 8 + depth * 14 }}
            onClick={() => selectElement(elementId)}
          >
            {getChildIds(element).length > 0 ? (
              <ChevronRight />
            ) : (
              <span className="layer-spacer" />
            )}
            <span>{element.label}</span>
          </button>
          {parent && (
            <span className="layer-actions">
              <button
                type="button"
                onClick={() => moveWithinParent(-1)}
                disabled={siblingIndex === 0}
                aria-label={`Move ${element.label} up`}
              >
                <ArrowUp />
              </button>
              <button
                type="button"
                onClick={() => moveWithinParent(2)}
                disabled={siblingIndex === parentChildren.length - 1}
                aria-label={`Move ${element.label} down`}
              >
                <ArrowDown />
              </button>
            </span>
          )}
        </div>
        {getChildIds(element).length > 0 && (
          <ul>
            {getChildIds(element).map((childId) =>
              renderLayer(childId, depth + 1),
            )}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className="layers">
      <span className="eyebrow">Navigator</span>
      <ul className="layer-tree">{renderLayer(document.rootId, 0)}</ul>
    </div>
  );
};

export default LayersNavigator;
