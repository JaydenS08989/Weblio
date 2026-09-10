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
import React from "react";
import { useEditorStore } from "@/store";
import type { ElementType } from "@/types";

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
          <button
            type="button"
            key={option.type}
            onClick={() => addElement(option.type)}
          >
            {option.icon}
            <span>{option.label}</span>
          </button>
        ))}
      </div>
      <div className="layers">
        <span className="eyebrow">Navigator</span>
        <p>Page · Main section</p>
      </div>
    </aside>
  );
};
export default AddElementsPanel;
