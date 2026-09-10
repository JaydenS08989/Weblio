import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createElement, createStarterDocument, getBrowserStorage } from "@/lib";
import type {
  Breakpoint,
  EditorElement,
  ElementStyle,
  ElementType,
  WebsiteDocument,
  WebsiteProject,
} from "@/types";

interface EditorSnapshot {
  document: WebsiteDocument;
  selectedElementId: string | null;
}

interface EditorState {
  projects: WebsiteProject[];
  activeProjectId: string;
  document: WebsiteDocument;
  selectedElementId: string | null;
  breakpoint: Breakpoint;
  viewportWidth: number;
  zoom: number;
  theme: "light" | "dark";
  past: EditorSnapshot[];
  future: EditorSnapshot[];
  lastHistoryMutation: { key: string; timestamp: number } | null;
  selectElement: (id: string | null) => void;
  addElement: (type: ElementType, parentId?: string) => void;
  moveElement: (
    elementId: string,
    parentId: string,
    insertionIndex?: number,
  ) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  updateSelected: (
    patch: Partial<Pick<EditorElement, "content" | "alt" | "source">>,
  ) => void;
  updateStyle: (patch: ElementStyle) => void;
  undo: () => void;
  redo: () => void;
  setBreakpoint: (breakpoint: Breakpoint) => void;
  setViewportWidth: (width: number) => void;
  setZoom: (zoom: number) => void;
  toggleTheme: () => void;
  createProject: () => string;
  openProject: (id: string) => void;
}

const initialDocument = createStarterDocument();

const initialProject: WebsiteProject = {
  id: "northstar",
  name: "Northstar Studio",
  status: "draft",
  updatedAt: new Date().toISOString(),
  document: initialDocument,
};

const snapshot = (state: EditorState): EditorSnapshot => ({
  document: structuredClone(state.document),
  selectedElementId: state.selectedElementId,
});

const mutateDocument = (
  state: EditorState,
  mutation: (document: WebsiteDocument) => void,
  coalescingKey?: string,
): Partial<EditorState> => {
  const document = structuredClone(state.document);

  mutation(document);
  const updatedAt = new Date().toISOString();
  const projects = state.projects.map((project) =>
    project.id === state.activeProjectId
      ? { ...project, document, updatedAt }
      : project,
  );

  const timestamp = Date.now();
  const shouldCoalesce = Boolean(
    coalescingKey &&
      state.lastHistoryMutation?.key === coalescingKey &&
      timestamp - state.lastHistoryMutation.timestamp < 650,
  );

  return {
    document,
    projects,
    past: shouldCoalesce
      ? state.past
      : [...state.past, snapshot(state)].slice(-50),
    future: [],
    lastHistoryMutation: coalescingKey
      ? { key: coalescingKey, timestamp }
      : null,
  };
};

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      projects: [initialProject],
      activeProjectId: initialProject.id,
      document: initialDocument,
      selectedElementId: null,
      breakpoint: "desktop",
      viewportWidth: 1200,
      zoom: 0.8,
      theme: "light",
      past: [],
      future: [],
      lastHistoryMutation: null,
      selectElement: (selectedElementId) => set({ selectedElementId }),

      addElement: (type, parentId) =>
        set((state) => {
          let selectedElementId = state.selectedElementId;
          const mutation = mutateDocument(state, (document) => {
            const parent =
              document.elements[
                parentId ?? state.selectedElementId ?? document.rootId
              ];

            const safeParent = parent?.children
              ? parent
              : document.elements[document.rootId];

            if (!safeParent) return;

            const element = createElement(type, safeParent.id);

            document.elements[element.id] = element;
            safeParent.children.push(element.id);
            selectedElementId = element.id;
          });

          return { ...mutation, selectedElementId };
        }),
      moveElement: (elementId, parentId, insertionIndex) =>
        set((state) => {
          const element = state.document.elements[elementId];
          const nextParent = state.document.elements[parentId];
          if (!element || !nextParent || element.id === state.document.rootId)
            return {};

          const descendantIds = new Set<string>();
          const collectDescendants = (id: string) => {
            state.document.elements[id]?.children.forEach((childId) => {
              descendantIds.add(childId);
              collectDescendants(childId);
            });
          };
          collectDescendants(elementId);
          if (descendantIds.has(parentId)) return {};

          return mutateDocument(state, (document) => {
            const previousParent =
              element.parentId && document.elements[element.parentId];
            if (previousParent) {
              previousParent.children = previousParent.children.filter(
                (childId) => childId !== elementId,
              );
            }

            const parent = document.elements[parentId];
            const movedElement = document.elements[elementId];
            if (!parent || !movedElement) return;
            movedElement.parentId = parentId;
            const targetIndex = Math.min(
              Math.max(insertionIndex ?? parent.children.length, 0),
              parent.children.length,
            );
            parent.children.splice(targetIndex, 0, elementId);
          });
        }),
      deleteSelected: () =>
        set((state) => {
          const selected =
            state.selectedElementId &&
            state.document.elements[state.selectedElementId];

          if (!selected || selected.id === state.document.rootId) return {};

          return {
            ...mutateDocument(state, (document) => {
              const parent =
                selected.parentId && document.elements[selected.parentId];

              if (parent)
                parent.children = parent.children.filter(
                  (id) => id !== selected.id,
                );

              const remove = (id: string) => {
                document.elements[id]?.children.forEach(remove);
                delete document.elements[id];
              };

              remove(selected.id);
            }),
            selectedElementId: null,
          };
        }),

      duplicateSelected: () =>
        set((state) => {
          const selected = state.selectedElementId
            ? state.document.elements[state.selectedElementId]
            : undefined;

          if (!selected?.parentId) return {};

          const parentId = selected.parentId;
          let cloneId = "";

          const update = mutateDocument(state, (document) => {
            const clone = structuredClone(selected);

            clone.id = crypto.randomUUID();
            clone.label = `${clone.label} copy`;
            clone.children = [];
            cloneId = clone.id;

            document.elements[clone.id] = clone;
            document.elements[parentId]?.children.push(clone.id);
          });

          return { ...update, selectedElementId: cloneId };
        }),

      updateSelected: (patch) =>
        set((state) =>
          mutateDocument(
            state,
            (document) => {
              const element =
                state.selectedElementId &&
                document.elements[state.selectedElementId];
              if (element) Object.assign(element, patch);
            },
            `content-${state.selectedElementId}`,
          ),
        ),

      updateStyle: (patch) =>
        set((state) =>
          mutateDocument(
            state,
            (document) => {
              const element =
                state.selectedElementId &&
                document.elements[state.selectedElementId];
              if (element)
                element.styles[state.breakpoint] = {
                  ...element.styles[state.breakpoint],
                  ...patch,
                };
            },
            `style-${state.selectedElementId}-${state.breakpoint}-${Object.keys(patch).join("-")}`,
          ),
        ),

      undo: () =>
        set((state) => {
          const previous = state.past.at(-1);

          if (!previous) return {};
          const projects = state.projects.map((project) =>
            project.id === state.activeProjectId
              ? { ...project, document: previous.document }
              : project,
          );
          return {
            ...previous,
            projects,
            past: state.past.slice(0, -1),
            future: [snapshot(state), ...state.future],
            lastHistoryMutation: null,
          };
        }),

      redo: () =>
        set((state) => {
          const next = state.future[0];

          if (!next) return {};
          const projects = state.projects.map((project) =>
            project.id === state.activeProjectId
              ? { ...project, document: next.document }
              : project,
          );
          return {
            ...next,
            projects,
            past: [...state.past, snapshot(state)],
            future: state.future.slice(1),
            lastHistoryMutation: null,
          };
        }),

      setBreakpoint: (breakpoint) =>
        set({
          breakpoint,
          viewportWidth: { desktop: 1200, tablet: 768, mobile: 390 }[
            breakpoint
          ],
        }),

      setViewportWidth: (viewportWidth) =>
        set({ viewportWidth: Math.min(1440, Math.max(320, viewportWidth)) }),

      setZoom: (zoom) => set({ zoom: Math.min(1.25, Math.max(0.5, zoom)) }),

      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),

      createProject: () => {
        const id = crypto.randomUUID();

        const project = {
          id,
          name: `Untitled site ${get().projects.length + 1}`,
          status: "draft" as const,
          updatedAt: new Date().toISOString(),
          document: createStarterDocument(),
        };

        set((state) => ({
          projects: [project, ...state.projects],
          activeProjectId: id,
          document: project.document,
          past: [],
          future: [],
        }));

        return id;
      },

      openProject: (id) => {
        const project = get().projects.find((candidate) => candidate.id === id);

        if (project)
          set({
            activeProjectId: id,
            document: project.document,
            past: [],
            future: [],
            selectedElementId: null,
          });
      },
    }),
    {
      name: "weblio-workspace-v1",
      storage: createJSONStorage(getBrowserStorage),
      partialize: (state) => ({ projects: state.projects, theme: state.theme }),
    },
  ),
);
