import { beforeEach, describe, expect, it } from "vitest";
import { createStarterDocument } from "@/lib";
import { useEditorStore } from "./editorStore";

describe("editor store history and persistence model", () => {
  beforeEach(() => {
    const document = createStarterDocument();
    useEditorStore.setState({
      activeProjectId: "test-project",
      document,
      projects: [
        {
          id: "test-project",
          name: "Test project",
          status: "draft",
          updatedAt: "2026-01-01T00:00:00.000Z",
          document,
        },
      ],
      selectedElementId: null,
      past: [],
      future: [],
      lastHistoryMutation: null,
    });
  });

  it("synchronizes document changes into the active persisted project", () => {
    useEditorStore.getState().addElement("heading");

    const state = useEditorStore.getState();
    expect(Object.keys(state.document.elements)).toHaveLength(5);
    expect(state.projects[0]?.document).toEqual(state.document);
    expect(state.selectedElementId).not.toBeNull();
  });

  it("restores meaningful document mutations through undo and redo", () => {
    const originalElementCount = Object.keys(
      useEditorStore.getState().document.elements,
    ).length;
    useEditorStore.getState().addElement("button");
    useEditorStore.getState().undo();
    expect(
      Object.keys(useEditorStore.getState().document.elements),
    ).toHaveLength(originalElementCount);

    useEditorStore.getState().redo();
    expect(
      Object.keys(useEditorStore.getState().document.elements),
    ).toHaveLength(originalElementCount + 1);
    expect(useEditorStore.getState().projects[0]?.document).toEqual(
      useEditorStore.getState().document,
    );
  });

  it("coalesces rapid updates to the same inspector property", () => {
    const state = useEditorStore.getState();
    const selectedElementId =
      state.document.elements[state.document.rootId]?.children[0];
    if (!selectedElementId)
      throw new Error("Starter document is missing editable content.");
    state.selectElement(selectedElementId);

    state.updateSelected({ content: "First change" });
    useEditorStore.getState().updateSelected({ content: "Second change" });

    expect(useEditorStore.getState().past).toHaveLength(1);
    useEditorStore.getState().undo();
    expect(
      useEditorStore.getState().document.elements[selectedElementId]?.content,
    ).toBe("Build something remarkable");
  });

  it("rejects a move that would create a document cycle", () => {
    const state = useEditorStore.getState();
    const root = state.document.elements[state.document.rootId];
    const childId = root?.children[0];
    if (!root || !childId)
      throw new Error("Starter document is missing its expected child.");

    state.moveElement(root.id, childId);
    expect(
      useEditorStore.getState().document.elements[root.id]?.parentId,
    ).toBeNull();
    expect(useEditorStore.getState().past).toHaveLength(0);
  });
});
