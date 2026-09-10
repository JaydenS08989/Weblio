import type {
  Breakpoint,
  EditorElement,
  ElementStyle,
  ElementType,
  LayoutElement,
  WebsiteDocument,
  WebsitePage,
  WebsiteProject,
} from "@/types";

const responsiveStyles = (
  desktop: ElementStyle,
): Record<Breakpoint, ElementStyle> => ({ desktop, tablet: {}, mobile: {} });

export const isLayoutElement = (
  element: EditorElement | undefined,
): element is LayoutElement =>
  Boolean(
    element && ["section", "container", "flex", "grid"].includes(element.type),
  );

export const canContain = (
  parent: EditorElement | undefined,
  childType: ElementType,
): boolean => {
  if (!isLayoutElement(parent)) return false;
  return parent.type !== "section" || childType !== "section";
};

export const createElement = (
  type: ElementType,
  parentId: string | null,
): EditorElement => {
  const common = {
    id: crypto.randomUUID(),
    parentId,
    styles: responsiveStyles({}),
  };
  switch (type) {
    case "section":
      return {
        ...common,
        type,
        label: "Section",
        children: [],
        styles: responsiveStyles({ padding: 64, background: "#ffffff" }),
      };
    case "container":
      return {
        ...common,
        type,
        label: "Container",
        children: [],
        styles: responsiveStyles({ padding: 24 }),
      };
    case "flex":
      return {
        ...common,
        type,
        label: "Flex container",
        children: [],
        styles: responsiveStyles({
          display: "flex",
          flexDirection: "row",
          gap: 16,
          alignItems: "center",
        }),
      };
    case "grid":
      return {
        ...common,
        type,
        label: "Grid container",
        children: [],
        styles: responsiveStyles({ display: "grid", gridColumns: 2, gap: 16 }),
      };
    case "heading":
      return {
        ...common,
        type,
        label: "Heading",
        content: "Build something remarkable",
        styles: responsiveStyles({ fontSize: 48, color: "#151515" }),
      };
    case "text":
      return {
        ...common,
        type,
        label: "Text",
        content:
          "Shape every detail of your website with a flexible visual canvas.",
        styles: responsiveStyles({ fontSize: 17, color: "#5c5b57" }),
      };
    case "button":
      return {
        ...common,
        type,
        label: "Button",
        content: "Get started",
        href: "#",
        styles: responsiveStyles({
          background: "#2563eb",
          color: "#ffffff",
          padding: 14,
          borderRadius: 8,
        }),
      };
    case "image":
      return {
        ...common,
        type,
        label: "Image",
        source:
          "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
        alt: "Bright creative studio",
        loading: "lazy",
        styles: responsiveStyles({ borderRadius: 12, objectFit: "cover" }),
      };
  }
};

export const createStarterDocument = (): WebsiteDocument => {
  const section = createElement("section", null) as LayoutElement;
  const heading = createElement("heading", section.id);
  const text = createElement("text", section.id);
  const button = createElement("button", section.id);
  section.children = [heading.id, text.id, button.id];
  return {
    version: 2,
    rootId: section.id,
    elements: {
      [section.id]: section,
      [heading.id]: heading,
      [text.id]: text,
      [button.id]: button,
    },
  };
};

export const createWebsitePage = (name = "Home"): WebsitePage => ({
  id: crypto.randomUUID(),
  name,
  slug: name === "Home" ? "/" : `/${name.toLowerCase().replace(/\W+/g, "-")}`,
  document: createStarterDocument(),
});

export const getResolvedStyle = (
  element: EditorElement,
  breakpoint: Breakpoint,
): ElementStyle => ({
  ...element.styles.desktop,
  ...(breakpoint === "mobile" ? element.styles.tablet : {}),
  ...element.styles[breakpoint],
});

export const getChildIds = (element: EditorElement | undefined): string[] =>
  isLayoutElement(element) ? element.children : [];

export const isDescendant = (
  document: WebsiteDocument,
  ancestorId: string,
  candidateId: string,
): boolean =>
  getChildIds(document.elements[ancestorId]).some(
    (id) => id === candidateId || isDescendant(document, id, candidateId),
  );

export const insertElement = (
  document: WebsiteDocument,
  element: EditorElement,
  parentId: string,
  index?: number,
): boolean => {
  const parent = document.elements[parentId];
  if (!canContain(parent, element.type) || document.elements[element.id])
    return false;
  const children = (parent as LayoutElement).children;
  const target = Math.min(
    Math.max(index ?? children.length, 0),
    children.length,
  );
  element.parentId = parentId;
  document.elements[element.id] = element;
  children.splice(target, 0, element.id);
  return true;
};

export const moveElementInDocument = (
  document: WebsiteDocument,
  elementId: string,
  parentId: string,
  index?: number,
): boolean => {
  const element = document.elements[elementId];
  const targetParent = document.elements[parentId];
  if (
    !element ||
    elementId === document.rootId ||
    !canContain(targetParent, element.type) ||
    elementId === parentId ||
    isDescendant(document, elementId, parentId)
  )
    return false;
  const oldParent = document.elements[element.parentId ?? ""];
  if (!isLayoutElement(oldParent) || !isLayoutElement(targetParent))
    return false;
  const oldIndex = oldParent.children.indexOf(elementId);
  oldParent.children.splice(oldIndex, 1);
  let target = index ?? targetParent.children.length;
  if (oldParent.id === targetParent.id && oldIndex < target) target -= 1;
  target = Math.min(Math.max(target, 0), targetParent.children.length);
  targetParent.children.splice(target, 0, elementId);
  element.parentId = parentId;
  return true;
};

export const removeSubtree = (
  document: WebsiteDocument,
  elementId: string,
): boolean => {
  const element = document.elements[elementId];
  if (!element || elementId === document.rootId) return false;
  const parent = document.elements[element.parentId ?? ""];
  if (isLayoutElement(parent))
    parent.children = parent.children.filter((id) => id !== elementId);
  const remove = (id: string) => {
    for (const childId of getChildIds(document.elements[id])) remove(childId);
    delete document.elements[id];
  };
  remove(elementId);
  return true;
};

export const duplicateSubtree = (
  document: WebsiteDocument,
  elementId: string,
): string | null => {
  const source = document.elements[elementId];
  const parent = document.elements[source?.parentId ?? ""];
  if (!source || !isLayoutElement(parent)) return null;
  const clone = (id: string, parentId: string): string => {
    const original = document.elements[id] as EditorElement;
    const copy = structuredClone(original);
    copy.id = crypto.randomUUID();
    copy.parentId = parentId;
    if (isLayoutElement(copy))
      copy.children = getChildIds(original).map((childId) =>
        clone(childId, copy.id),
      );
    document.elements[copy.id] = copy;
    return copy.id;
  };
  const cloneId = clone(elementId, parent.id);
  const index = parent.children.indexOf(elementId);
  parent.children.splice(index + 1, 0, cloneId);
  const rootClone = document.elements[cloneId];
  if (rootClone) rootClone.label = `${source.label} copy`;
  return cloneId;
};

export const isValidDocument = (value: unknown): value is WebsiteDocument => {
  if (!value || typeof value !== "object") return false;
  const document = value as Partial<WebsiteDocument>;
  if (document.version !== 2 || !document.rootId || !document.elements)
    return false;
  const root = document.elements[document.rootId];
  if (!isLayoutElement(root) || root.parentId !== null) return false;
  return Object.values(document.elements).every((element) =>
    getChildIds(element).every(
      (id) => document.elements?.[id]?.parentId === element.id,
    ),
  );
};

export const normalizeUrl = (url: string): string | undefined => {
  const trimmed = url.trim();
  if (trimmed.startsWith("#") || trimmed.startsWith("/")) return trimmed;
  try {
    const parsed = new URL(trimmed);
    return ["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol)
      ? parsed.href
      : undefined;
  } catch {
    return undefined;
  }
};

export const migrateProject = (value: unknown): WebsiteProject | null => {
  if (!value || typeof value !== "object") return null;
  const project = value as Record<string, unknown>;
  if (Array.isArray(project.pages)) {
    const candidate = project as unknown as WebsiteProject;
    return candidate.pages.length > 0 &&
      candidate.pages.every((page) => isValidDocument(page.document))
      ? candidate
      : null;
  }
  const legacy = project.document;
  if (!legacy || typeof legacy !== "object") return null;
  const old = legacy as {
    version?: number;
    rootId?: string;
    elements?: Record<string, Record<string, unknown>>;
  };
  if (old.version !== 1 || !old.rootId || !old.elements) return null;
  const migrated = structuredClone(old) as unknown as WebsiteDocument;
  migrated.version = 2;
  for (const element of Object.values(migrated.elements)) {
    if (!isLayoutElement(element))
      delete (element as unknown as { children?: string[] }).children;
    if (element.type === "image") element.loading = "lazy";
  }
  if (!isValidDocument(migrated)) return null;
  const page = {
    id: crypto.randomUUID(),
    name: "Home",
    slug: "/",
    document: migrated,
  };
  return {
    id: String(project.id),
    name: String(project.name),
    status: project.status === "published" ? "published" : "draft",
    updatedAt:
      typeof project.updatedAt === "string"
        ? project.updatedAt
        : new Date().toISOString(),
    activePageId: page.id,
    pages: [page],
  };
};
