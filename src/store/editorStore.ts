import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createElement, createStarterDocument } from "@/lib";
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
  selectElement: (id: string | null) => void;
  addElement: (type: ElementType, parentId?: string) => void;
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
): Partial<EditorState> => {
  const document = structuredClone(state.document);
  mutation(document);
  return {
    document,
    past: [...state.past, snapshot(state)].slice(-50),
    future: [],
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
      selectElement: (selectedElementId) => set({ selectedElementId }),
      addElement: (type, parentId) =>
        set((state) =>
          mutateDocument(state, (document) => {
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
            state.selectedElementId = element.id;
          }),
        ),
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
          const selected =
            state.selectedElementId &&
            state.document.elements[state.selectedElementId];
          if (!selected || !selected.parentId) return {};
          let cloneId = "";
          const update = mutateDocument(state, (document) => {
            const clone = structuredClone(selected);
            clone.id = crypto.randomUUID();
            clone.label = `${clone.label} copy`;
            clone.children = [];
            cloneId = clone.id;
            document.elements[clone.id] = clone;
            document.elements[selected.parentId!]?.children.push(clone.id);
          });
          return { ...update, selectedElementId: cloneId };
        }),
      updateSelected: (patch) =>
        set((state) =>
          mutateDocument(state, (document) => {
            const element =
              state.selectedElementId &&
              document.elements[state.selectedElementId];
            if (element) Object.assign(element, patch);
          }),
        ),
      updateStyle: (patch) =>
        set((state) =>
          mutateDocument(state, (document) => {
            const element =
              state.selectedElementId &&
              document.elements[state.selectedElementId];
            if (element)
              element.styles[state.breakpoint] = {
                ...element.styles[state.breakpoint],
                ...patch,
              };
          }),
        ),
      undo: () =>
        set((state) => {
          const previous = state.past.at(-1);
          if (!previous) return {};
          return {
            ...previous,
            past: state.past.slice(0, -1),
            future: [snapshot(state), ...state.future],
          };
        }),
      redo: () =>
        set((state) => {
          const next = state.future[0];
          if (!next) return {};
          return {
            ...next,
            past: [...state.past, snapshot(state)],
            future: state.future.slice(1),
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
      partialize: (state) => ({ projects: state.projects, theme: state.theme }),
    },
  ),
);
