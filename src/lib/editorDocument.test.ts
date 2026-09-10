import { describe, expect, it } from "vitest";
import {
  createElement,
  createStarterDocument,
  getResolvedStyle,
} from "./editorDocument";

describe("editor document", () => {
  it("creates a normalized, serializable starter document", () => {
    const document = createStarterDocument();
    expect(document.version).toBe(1);
    expect(document.elements[document.rootId]?.children).toHaveLength(3);
    expect(() => JSON.stringify(document)).not.toThrow();
  });

  it("cascades responsive styles deterministically", () => {
    const heading = createElement("heading", null);
    heading.styles.desktop = { color: "black", fontSize: 48 };
    heading.styles.tablet = { fontSize: 36 };
    heading.styles.mobile = { color: "navy" };
    expect(getResolvedStyle(heading, "mobile")).toEqual({
      color: "navy",
      fontSize: 36,
    });
  });
});
