import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createElement,
  createStarterDocument,
  duplicateSubtree,
  getChildIds,
  getResolvedStyle,
  insertElement,
  moveElementInDocument,
  removeSubtree,
} from "@/lib";

const required = <Value>(value: Value | undefined): Value => {
  if (value === undefined) throw new Error("Expected test fixture value");
  return value;
};

describe("editor document invariants", () => {
  beforeEach(() => {
    let id = 0;
    vi.stubGlobal("crypto", { randomUUID: () => `id-${++id}` });
  });

  it("allows insertion only into layout elements", () => {
    const document = createStarterDocument();
    const heading = required(
      document.elements[
        required(getChildIds(document.elements[document.rootId])[0])
      ],
    );
    expect(
      insertElement(document, createElement("text", heading.id), heading.id),
    ).toBe(false);
    expect(
      insertElement(
        document,
        createElement("text", document.rootId),
        document.rootId,
      ),
    ).toBe(true);
  });

  it("moves exactly one position in both directions", () => {
    const document = createStarterDocument();
    const original = [...getChildIds(document.elements[document.rootId])];
    expect(
      moveElementInDocument(
        document,
        required(original[0]),
        document.rootId,
        2,
      ),
    ).toBe(true);
    expect(getChildIds(document.elements[document.rootId])).toEqual([
      original[1],
      original[0],
      original[2],
    ]);
    expect(
      moveElementInDocument(
        document,
        required(original[2]),
        document.rootId,
        1,
      ),
    ).toBe(true);
    expect(getChildIds(document.elements[document.rootId])).toEqual([
      original[1],
      original[2],
      original[0],
    ]);
  });

  it("rejects cycles and moves between compatible parents", () => {
    const document = createStarterDocument();
    const first = createElement("container", document.rootId);
    const nested = createElement("container", first.id);
    expect(insertElement(document, first, document.rootId)).toBe(true);
    expect(insertElement(document, nested, first.id)).toBe(true);
    expect(moveElementInDocument(document, first.id, nested.id)).toBe(false);
    const textId = required(getChildIds(document.elements[document.rootId])[1]);
    expect(moveElementInDocument(document, textId, nested.id)).toBe(true);
    expect(document.elements[textId]?.parentId).toBe(nested.id);
  });

  it("duplicates a complete subtree with fresh identifiers", () => {
    const document = createStarterDocument();
    const container = createElement("container", document.rootId);
    insertElement(document, container, document.rootId);
    insertElement(document, createElement("text", container.id), container.id);
    const cloneId = duplicateSubtree(document, container.id);
    expect(cloneId).not.toBe(container.id);
    const cloneChildren = getChildIds(document.elements[cloneId as string]);
    expect(cloneChildren).toHaveLength(1);
    expect(cloneChildren[0]).not.toBe(getChildIds(container)[0]);
    expect(document.elements[cloneChildren[0] as string]?.parentId).toBe(
      cloneId,
    );
  });

  it("deletes descendants recursively", () => {
    const document = createStarterDocument();
    const container = createElement("container", document.rootId);
    const child = createElement("text", container.id);
    insertElement(document, container, document.rootId);
    insertElement(document, child, container.id);
    expect(removeSubtree(document, container.id)).toBe(true);
    expect(document.elements[container.id]).toBeUndefined();
    expect(document.elements[child.id]).toBeUndefined();
  });

  it("resolves mobile styles through tablet and desktop", () => {
    const element = createElement("text", null);
    element.styles.desktop = { fontSize: 18, color: "black" };
    element.styles.tablet = { fontSize: 16 };
    element.styles.mobile = { color: "blue" };
    expect(getResolvedStyle(element, "mobile")).toEqual({
      fontSize: 16,
      color: "blue",
    });
  });
});
