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

export type LayoutElementType = "section" | "container" | "flex" | "grid";
export type ContentElementType = "heading" | "text" | "button" | "image";
export type LengthUnit = "px" | "%" | "rem" | "vh" | "vw" | "auto";

export interface StyleLength {
  value: number;
  unit: LengthUnit;
}

export interface ElementStyle {
  width?: StyleLength;
  height?: StyleLength;
  minWidth?: StyleLength;
  maxWidth?: StyleLength;
  minHeight?: StyleLength;
  maxHeight?: StyleLength;
  background?: string;
  color?: string;
  display?: "block" | "flex" | "grid";
  flexDirection?: "row" | "column";
  flexWrap?: "nowrap" | "wrap";
  justifyContent?: "flex-start" | "center" | "flex-end" | "space-between";
  alignItems?: "stretch" | "flex-start" | "center" | "flex-end";
  gap?: number;
  gridColumns?: number;
  gridRows?: number;
  padding?: number;
  margin?: number;
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  fontSize?: number;
  fontWeight?: number;
  lineHeight?: number;
  letterSpacing?: number;
  textAlign?: "left" | "center" | "right";
  objectFit?: "cover" | "contain" | "fill";
  objectPosition?: string;
}

interface ElementBase {
  id: string;
  parentId: string | null;
  label: string;
  styles: Record<Breakpoint, ElementStyle>;
}

export interface LayoutElement extends ElementBase {
  type: LayoutElementType;
  children: string[];
}

export interface TextElement extends ElementBase {
  type: "heading" | "text";
  content: string;
}

export interface ButtonElement extends ElementBase {
  type: "button";
  content: string;
  href: string;
}

export interface ImageElement extends ElementBase {
  type: "image";
  source: string;
  alt: string;
  loading: "eager" | "lazy";
}

export type EditorElement =
  | LayoutElement
  | TextElement
  | ButtonElement
  | ImageElement;

export interface WebsiteDocument {
  version: 2;
  rootId: string;
  elements: Record<string, EditorElement>;
}

export interface WebsitePage {
  id: string;
  name: string;
  slug: string;
  document: WebsiteDocument;
}

export interface WebsiteProject {
  id: string;
  name: string;
  status: "draft" | "published";
  updatedAt: string;
  publishedAt?: string;
  activePageId: string;
  pages: WebsitePage[];
}
