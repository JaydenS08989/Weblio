import type React from "react";
import { getResolvedStyle } from "@/lib";
import type { Breakpoint, EditorElement, WebsiteDocument } from "@/types";

interface WebsiteRendererProps {
  document: WebsiteDocument;
  breakpoint: Breakpoint;
  editorMode?: boolean;
  selectedElementId?: string | null;
  onSelect?: (id: string) => void;
}
const styleFor = (
  element: EditorElement,
  breakpoint: Breakpoint,
): React.CSSProperties => {
  const style = getResolvedStyle(element, breakpoint);
  return {
    ...style,
    gridTemplateColumns: style.gridColumns
      ? `repeat(${style.gridColumns}, minmax(0, 1fr))`
      : undefined,
  } as React.CSSProperties;
};
const WebsiteRenderer: React.FC<WebsiteRendererProps> = ({
  document,
  breakpoint,
  editorMode = false,
  selectedElementId,
  onSelect,
}) => {
  const renderElement = (id: string): React.ReactNode => {
    const element = document.elements[id];
    if (!element) return null;
    const props = {
      style: styleFor(element, breakpoint),
      className: `${editorMode ? "rendered-element" : ""} ${selectedElementId === id ? "is-selected" : ""}`,
      onClick: editorMode
        ? (event: React.MouseEvent) => {
            event.stopPropagation();
            onSelect?.(id);
          }
        : undefined,
    };
    const children = element.children.map(renderElement);
    if (element.type === "heading")
      return (
        <h1 key={id} {...props}>
          {element.content}
        </h1>
      );
    if (element.type === "text")
      return (
        <p key={id} {...props}>
          {element.content}
        </p>
      );
    if (element.type === "button")
      return (
        <a key={id} {...props} href={editorMode ? undefined : element.href}>
          {element.content}
        </a>
      );
    if (element.type === "image")
      return (
        <img
          key={id}
          {...props}
          src={element.source}
          alt={element.alt ?? ""}
          width="1200"
          height="700"
          loading="lazy"
          decoding="async"
        />
      );
    return (
      <div key={id} {...props}>
        {children}
      </div>
    );
  };
  return <>{renderElement(document.rootId)}</>;
};
export default WebsiteRenderer;
