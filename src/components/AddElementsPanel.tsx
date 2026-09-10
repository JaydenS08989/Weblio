import { useDraggable } from "@dnd-kit/core";
import {
  Box,
  Grid2X2,
  Heading,
  Image,
  LayoutTemplate,
  MousePointerClick,
  Rows3,
  Type,
} from "lucide-react";

import { useEditorStore } from "@/store";
import type { ElementType } from "@/types";
import type { AddElementDragData } from "./EditorDragDropProvider";
import LayersNavigator from "./LayersNavigator";

const options: Array<{
  type: ElementType;
  label: string;
  icon: React.ReactNode;
}> = [
  { type: "container", label: "Container", icon: <Box /> },
  { type: "flex", label: "Flex container", icon: <Rows3 /> },
  { type: "grid", label: "Grid container", icon: <Grid2X2 /> },
  { type: "heading", label: "Heading", icon: <Heading /> },
  { type: "text", label: "Text", icon: <Type /> },
  { type: "button", label: "Button", icon: <MousePointerClick /> },
  { type: "image", label: "Image", icon: <Image /> },
];
interface AddElementButtonProps {
  elementType: ElementType;
  icon: React.ReactNode;
  label: string;
  onAdd: (elementType: ElementType) => void;
}

const AddElementButton: React.FC<AddElementButtonProps> = ({
  elementType,
  icon,
  label,
  onAdd,
}) => {
  const dragData: AddElementDragData = {
    kind: "new-element",
    elementType,
    label,
  };
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `add-${elementType}`,
    data: dragData,
  });

  return (
    <button
      type="button"
      ref={setNodeRef}
      className={isDragging ? "is-dragging" : undefined}
      onClick={() => onAdd(elementType)}
      {...listeners}
      {...attributes}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

const AddElementsPanel: React.FC = () => {
  const addElement = useEditorStore((state) => state.addElement);

  return (
    <aside className="left-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Build</span>
          <h2>Add elements</h2>
        </div>
        <LayoutTemplate />
      </div>
      <p className="panel-help">
        Choose an element to add it to the selected container.
      </p>
      <div className="element-grid">
        {options.map((option) => (
          <AddElementButton
            key={option.type}
            elementType={option.type}
            icon={option.icon}
            label={option.label}
            onAdd={addElement}
          />
        ))}
      </div>
      <LayersNavigator />
    </aside>
  );
};

export default AddElementsPanel;
