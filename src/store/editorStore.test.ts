import { beforeEach, describe, expect, it } from "vitest";

import { createWebsitePage, getChildIds } from "@/lib";
import { useEditorStore } from "@/store";
import type { WebsiteProject } from "@/types";

const required = <Value>(value: Value | undefined): Value => {
  if (value === undefined) throw new Error("Expected test fixture value");
  return value;
};

const persistedDocument = () =>
  required(required(useEditorStore.getState().projects[0]).pages[0]).document;

const reset = () => {
  const page = createWebsitePage();
  const project: WebsiteProject = {
    id: "test",
    name: "Test",
    status: "draft",
    updatedAt: new Date(0).toISOString(),
    activePageId: page.id,
    pages: [page],
  };
  useEditorStore.setState({
    projects: [project],
    activeProjectId: project.id,
    activePageId: page.id,
    document: page.document,
    selectedElementId: null,
    past: [],
    future: [],
    lastHistoryMutation: null,
  });
};

describe("editor store history", () => {
  beforeEach(reset);

  it("coalesces rapid edits to the same property", () => {
    const id = required(
      getChildIds(
        useEditorStore.getState().document.elements[
          useEditorStore.getState().document.rootId
        ],
      )[0],
    );
    useEditorStore.getState().selectElement(id);
    useEditorStore.getState().updateSelected({ content: "A" });
    useEditorStore.getState().updateSelected({ content: "AB" });
    expect(useEditorStore.getState().past).toHaveLength(1);
  });

  it("keeps persisted project documents synchronized through undo and redo", () => {
    const store = useEditorStore.getState();
    const before = getChildIds(
      store.document.elements[store.document.rootId],
    ).length;
    store.addElement("text");
    expect(
      getChildIds(persistedDocument().elements[store.document.rootId]),
    ).toHaveLength(before + 1);
    useEditorStore.getState().undo();
    expect(
      getChildIds(persistedDocument().elements[store.document.rootId]),
    ).toHaveLength(before);
    useEditorStore.getState().redo();
    expect(
      getChildIds(persistedDocument().elements[store.document.rootId]),
    ).toHaveLength(before + 1);
  });
});
