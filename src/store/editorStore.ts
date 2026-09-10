import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  canContain,
  createElement,
  createWebsitePage,
  duplicateSubtree,
  getBrowserStorage,
  insertElement,
  migrateProject,
  moveElementInDocument,
  removeSubtree,
} from "@/lib";

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
  activePageId: string;
  document: WebsiteDocument;
  selectedElementId: string | null;
  breakpoint: Breakpoint;
  viewportWidth: number;
  zoom: number;
  theme: "light" | "dark";
  past: EditorSnapshot[];
  future: EditorSnapshot[];
  lastHistoryMutation: { key: string; timestamp: number } | null;
  clipboard: EditorElement | null;
  selectElement: (id: string | null) => void;
  addElement: (type: ElementType, parentId?: string, index?: number) => void;
  moveElement: (elementId: string, parentId: string, index?: number) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  copySelected: () => void;
  paste: () => void;
  updateSelected: (patch: Record<string, string>) => void;
  updateStyle: (patch: ElementStyle) => void;
  resetStyle: (property: keyof ElementStyle) => void;
  undo: () => void;
  redo: () => void;
  setBreakpoint: (breakpoint: Breakpoint) => void;
  setViewportWidth: (width: number) => void;
  setZoom: (zoom: number) => void;
  toggleTheme: () => void;
  createProject: () => string;
  openProject: (id: string) => boolean;
  setActivePage: (id: string) => void;
  createPage: () => void;
  renameProject: (id: string, name: string) => void;
  duplicateProject: (id: string) => string | null;
  deleteProject: (id: string) => void;
  publishProject: (id: string) => void;
}

const makeProject = (name: string): WebsiteProject => {
  const page = createWebsitePage();
  return {
    id: crypto.randomUUID(),
    name,
    status: "draft",
    updatedAt: new Date().toISOString(),
    activePageId: page.id,
    pages: [page],
  };
};

const initialProject = { ...makeProject("Northstar Studio"), id: "northstar" };

const snapshot = (state: EditorState): EditorSnapshot => ({
  document: structuredClone(state.document),
  selectedElementId: state.selectedElementId,
});

const synchronizeDocument = (
  projects: WebsiteProject[],
  projectId: string,
  pageId: string,
  document: WebsiteDocument,
): WebsiteProject[] =>
  projects.map((project) =>
    project.id === projectId
      ? {
          ...project,
          updatedAt: new Date().toISOString(),
          pages: project.pages.map((page) =>
            page.id === pageId ? { ...page, document } : page,
          ),
        }
      : project,
  );

const mutateDocument = (
  state: EditorState,
  mutation: (document: WebsiteDocument) => boolean | undefined,
  coalescingKey?: string,
): Partial<EditorState> => {
  const document = structuredClone(state.document);
  if (mutation(document) === false) return {};
  const timestamp = Date.now();
  const shouldCoalesce = Boolean(
    coalescingKey &&
      state.lastHistoryMutation?.key === coalescingKey &&
      timestamp - state.lastHistoryMutation.timestamp < 650,
  );
  return {
    document,
    projects: synchronizeDocument(
      state.projects,
      state.activeProjectId,
      state.activePageId,
      document,
    ),
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
      activePageId: initialProject.activePageId,
      document:
        initialProject.pages[0]?.document ?? createWebsitePage().document,
      selectedElementId: null,
      breakpoint: "desktop",
      viewportWidth: 1200,
      zoom: 0.8,
      theme: "light",
      past: [],
      future: [],
      lastHistoryMutation: null,
      clipboard: null,
      selectElement: (selectedElementId) => set({ selectedElementId }),
      addElement: (type, requestedParentId, index) =>
        set((state) => {
          let parentId =
            requestedParentId ??
            state.selectedElementId ??
            state.document.rootId;
          if (!canContain(state.document.elements[parentId], type)) {
            const selected =
              state.document.elements[state.selectedElementId ?? ""];
            parentId = selected?.parentId ?? state.document.rootId;
          }
          const element = createElement(type, parentId);
          const update = mutateDocument(state, (document) =>
            insertElement(document, element, parentId, index),
          );
          return Object.keys(update).length
            ? { ...update, selectedElementId: element.id }
            : {};
        }),
      moveElement: (elementId, parentId, index) =>
        set((state) =>
          mutateDocument(state, (document) =>
            moveElementInDocument(document, elementId, parentId, index),
          ),
        ),
      deleteSelected: () =>
        set((state) => {
          if (!state.selectedElementId) return {};
          const update = mutateDocument(state, (document) =>
            removeSubtree(document, state.selectedElementId as string),
          );
          return Object.keys(update).length
            ? { ...update, selectedElementId: null }
            : {};
        }),
      duplicateSelected: () =>
        set((state) => {
          if (!state.selectedElementId) return {};
          let cloneId: string | null = null;
          const update = mutateDocument(state, (document) => {
            cloneId = duplicateSubtree(
              document,
              state.selectedElementId as string,
            );
            return Boolean(cloneId);
          });
          return cloneId ? { ...update, selectedElementId: cloneId } : {};
        }),
      copySelected: () => {
        const state = get();
        const element = state.document.elements[state.selectedElementId ?? ""];
        if (element) set({ clipboard: structuredClone(element) });
      },
      paste: () => {
        const state = get();
        if (!state.clipboard) return;
        state.addElement(state.clipboard.type);
      },
      updateSelected: (patch) =>
        set((state) =>
          mutateDocument(
            state,
            (document) => {
              const element = document.elements[state.selectedElementId ?? ""];
              if (!element) return false;
              Object.assign(element, patch);
              return true;
            },
            `content-${state.selectedElementId}-${Object.keys(patch).join("-")}`,
          ),
        ),
      updateStyle: (patch) =>
        set((state) =>
          mutateDocument(
            state,
            (document) => {
              const element = document.elements[state.selectedElementId ?? ""];
              if (!element) return false;
              element.styles[state.breakpoint] = {
                ...element.styles[state.breakpoint],
                ...patch,
              };
              return true;
            },
            `style-${state.selectedElementId}-${state.breakpoint}-${Object.keys(patch).join("-")}`,
          ),
        ),
      resetStyle: (property) =>
        set((state) =>
          mutateDocument(state, (document) => {
            const element = document.elements[state.selectedElementId ?? ""];
            if (!element || state.breakpoint === "desktop") return false;
            delete element.styles[state.breakpoint][property];
            return true;
          }),
        ),
      undo: () =>
        set((state) => {
          const previous = state.past.at(-1);
          if (!previous) return {};
          return {
            ...previous,
            projects: synchronizeDocument(
              state.projects,
              state.activeProjectId,
              state.activePageId,
              previous.document,
            ),
            past: state.past.slice(0, -1),
            future: [snapshot(state), ...state.future].slice(0, 50),
            lastHistoryMutation: null,
          };
        }),
      redo: () =>
        set((state) => {
          const next = state.future[0];
          if (!next) return {};
          return {
            ...next,
            projects: synchronizeDocument(
              state.projects,
              state.activeProjectId,
              state.activePageId,
              next.document,
            ),
            past: [...state.past, snapshot(state)].slice(-50),
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
        const project = makeProject(
          `Untitled site ${get().projects.length + 1}`,
        );
        set((state) => ({
          projects: [project, ...state.projects],
          activeProjectId: project.id,
          activePageId: project.activePageId,
          document: project.pages[0]?.document ?? createWebsitePage().document,
          selectedElementId: null,
          past: [],
          future: [],
        }));
        return project.id;
      },
      openProject: (id) => {
        const project = get().projects.find((candidate) => candidate.id === id);
        const page =
          project?.pages.find(
            (candidate) => candidate.id === project.activePageId,
          ) ?? project?.pages[0];
        if (!project || !page) return false;
        set({
          activeProjectId: id,
          activePageId: page.id,
          document: page.document,
          selectedElementId: null,
          past: [],
          future: [],
        });
        return true;
      },
      setActivePage: (id) => {
        const state = get();
        const project = state.projects.find(
          (candidate) => candidate.id === state.activeProjectId,
        );
        const page = project?.pages.find((candidate) => candidate.id === id);
        if (!project || !page) return;
        set({
          activePageId: id,
          document: page.document,
          selectedElementId: null,
          past: [],
          future: [],
          projects: state.projects.map((candidate) =>
            candidate.id === project.id
              ? { ...candidate, activePageId: id }
              : candidate,
          ),
        });
      },
      createPage: () => {
        const state = get();
        const project = state.projects.find(
          (candidate) => candidate.id === state.activeProjectId,
        );
        if (!project) return;
        const page = createWebsitePage(`Page ${project.pages.length + 1}`);
        set({
          activePageId: page.id,
          document: page.document,
          selectedElementId: null,
          past: [],
          future: [],
          projects: state.projects.map((candidate) =>
            candidate.id === project.id
              ? {
                  ...candidate,
                  activePageId: page.id,
                  pages: [...candidate.pages, page],
                }
              : candidate,
          ),
        });
      },
      renameProject: (id, name) =>
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id
              ? {
                  ...project,
                  name: name.trim() || project.name,
                  updatedAt: new Date().toISOString(),
                }
              : project,
          ),
        })),
      duplicateProject: (id) => {
        const source = get().projects.find((project) => project.id === id);
        if (!source) return null;
        const copy = structuredClone(source);
        copy.id = crypto.randomUUID();
        copy.name = `${copy.name} copy`;
        copy.status = "draft";
        copy.updatedAt = new Date().toISOString();
        delete copy.publishedAt;
        set((state) => ({ projects: [copy, ...state.projects] }));
        return copy.id;
      },
      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
        })),
      publishProject: (id) =>
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id
              ? {
                  ...project,
                  status: "published",
                  publishedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              : project,
          ),
        })),
    }),
    {
      name: "weblio-workspace",
      version: 2,
      storage: createJSONStorage(getBrowserStorage),
      partialize: (state) => ({ projects: state.projects, theme: state.theme }),
      migrate: (persisted) => {
        const state = persisted as Partial<EditorState>;
        const projects = (state.projects ?? [])
          .map(migrateProject)
          .filter((project): project is WebsiteProject => project !== null);
        return {
          ...state,
          projects: projects.length ? projects : [initialProject],
        };
      },
      onRehydrateStorage: () => (state) => {
        const project = state?.projects[0];
        const page =
          project?.pages.find(
            (candidate) => candidate.id === project.activePageId,
          ) ?? project?.pages[0];
        if (state && project && page) {
          state.activeProjectId = project.id;
          state.activePageId = page.id;
          state.document = page.document;
        }
      },
    },
  ),
);
