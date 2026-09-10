export type Breakpoint = "desktop" | "tablet" | "mobile";
export type ElementType =
  | "section"
  | "container"
  | "flex"
  | "grid"
  | "heading"
  | "text"
  | "button"
  | "image";

export interface ElementStyle {
  background?: string;
  color?: string;
  display?: "block" | "flex" | "grid";
  flexDirection?: "row" | "column";
  justifyContent?: "flex-start" | "center" | "space-between";
  alignItems?: "stretch" | "flex-start" | "center" | "flex-end";
  gap?: number;
  gridColumns?: number;
  padding?: number;
  borderRadius?: number;
  fontSize?: number;
  textAlign?: "left" | "center" | "right";
}

export interface EditorElement {
  id: string;
  type: ElementType;
  parentId: string | null;
  children: string[];
  label: string;
  content?: string;
  href?: string;
  source?: string;
  alt?: string;
  styles: Record<Breakpoint, ElementStyle>;
}

export interface WebsiteDocument {
  version: 1;
  rootId: string;
  elements: Record<string, EditorElement>;
}
export interface WebsiteProject {
  id: string;
  name: string;
  status: "draft" | "published";
  updatedAt: string;
  document: WebsiteDocument;
}
