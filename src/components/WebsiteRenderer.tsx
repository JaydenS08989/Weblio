import type React from "react";
import { getChildIds, getResolvedStyle, normalizeUrl } from "@/lib";
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
  const { gridColumns, gridRows, ...cssStyle } = style;
  const length = (value: typeof style.width) =>
    value
      ? value.unit === "auto"
        ? "auto"
        : `${value.value}${value.unit}`
      : undefined;
  return {
    ...cssStyle,
    width: length(style.width),
    height: length(style.height),
    minWidth: length(style.minWidth),
    maxWidth: length(style.maxWidth),
    minHeight: length(style.minHeight),
    maxHeight: length(style.maxHeight),
    gridTemplateColumns: gridColumns
      ? `repeat(${gridColumns}, minmax(0, 1fr))`
      : undefined,
    gridTemplateRows: gridRows ? `repeat(${gridRows}, auto)` : undefined,
  };
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
    const children = getChildIds(element).map(renderElement);
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
        <a
          key={id}
          {...props}
          href={editorMode ? undefined : normalizeUrl(element.href)}
        >
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
          loading={element.loading}
          fetchPriority={element.loading === "eager" ? "high" : "auto"}
          decoding="async"
        />
      );
    const Container = element.type === "section" ? "section" : "div";
    return (
      <Container key={id} {...props}>
        {children}
      </Container>
    );
  };
  return <>{renderElement(document.rootId)}</>;
};
export default WebsiteRenderer;
