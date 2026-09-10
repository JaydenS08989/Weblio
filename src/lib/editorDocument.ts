import type {
  Breakpoint,
  EditorElement,
  ElementType,
  WebsiteDocument,
} from "@/types";

const responsiveStyles = (
  desktop: EditorElement["styles"][Breakpoint],
): EditorElement["styles"] => ({ desktop, tablet: {}, mobile: {} });
export const createElement = (
  type: ElementType,
  parentId: string | null,
): EditorElement => {
  const id = crypto.randomUUID();
  const defaults: Record<ElementType, Partial<EditorElement>> = {
    section: {
      label: "Section",
      styles: responsiveStyles({ padding: 64, background: "#ffffff" }),
    },
    container: {
      label: "Container",
      styles: responsiveStyles({ padding: 24 }),
    },
    flex: {
      label: "Flex container",
      styles: responsiveStyles({
        display: "flex",
        flexDirection: "row",
        gap: 16,
        alignItems: "center",
      }),
    },
    grid: {
      label: "Grid container",
      styles: responsiveStyles({ display: "grid", gridColumns: 2, gap: 16 }),
    },
    heading: {
      label: "Heading",
      content: "Build something remarkable",
      styles: responsiveStyles({ fontSize: 48, color: "#151515" }),
    },
    text: {
      label: "Text",
      content:
        "Shape every detail of your website with a flexible visual canvas.",
      styles: responsiveStyles({ fontSize: 17, color: "#5c5b57" }),
    },
    button: {
      label: "Button",
      content: "Get started",
      href: "#",
      styles: responsiveStyles({
        background: "#2563eb",
        color: "#ffffff",
        padding: 14,
        borderRadius: 8,
      }),
    },
    image: {
      label: "Image",
      source:
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
      alt: "Bright creative studio",
      styles: responsiveStyles({ borderRadius: 12 }),
    },
  };
  return {
    id,
    type,
    parentId,
    children: [],
    label: defaults[type].label ?? type,
    styles: defaults[type].styles ?? responsiveStyles({}),
    content: defaults[type].content,
    href: defaults[type].href,
    source: defaults[type].source,
    alt: defaults[type].alt,
  };
};

export const createStarterDocument = (): WebsiteDocument => {
  const section = createElement("section", null);
  const heading = createElement("heading", section.id);
  const text = createElement("text", section.id);
  const button = createElement("button", section.id);
  section.children = [heading.id, text.id, button.id];
  return {
    version: 1,
    rootId: section.id,
    elements: {
      [section.id]: section,
      [heading.id]: heading,
      [text.id]: text,
      [button.id]: button,
    },
  };
};

export const getResolvedStyle = (
  element: EditorElement,
  breakpoint: Breakpoint,
) => ({
  ...element.styles.desktop,
  ...(breakpoint === "mobile" ? element.styles.tablet : {}),
  ...element.styles[breakpoint],
});
