import { Copy, SlidersHorizontal, Trash2 } from "lucide-react";
import React from "react";
import { useEditorStore } from "@/store";

const EditorInspector: React.FC = () => {
  const selectedId = useEditorStore((state) => state.selectedElementId);
  const element = useEditorStore((state) =>
    selectedId ? state.document.elements[selectedId] : undefined,
  );
  const {
    breakpoint,
    updateSelected,
    updateStyle,
    deleteSelected,
    duplicateSelected,
  } = useEditorStore();
  if (!element)
    return (
      <aside className="inspector empty-inspector">
        <SlidersHorizontal />
        <h2>Nothing selected</h2>
        <p>
          Select an element on the canvas to customize its content and
          appearance.
        </p>
      </aside>
    );
  const style = element.styles[breakpoint];
  return (
    <aside className="inspector">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Inspector</span>
          <h2>{element.label}</h2>
        </div>
        <div>
          <button
            type="button"
            className="icon-button"
            onClick={duplicateSelected}
            aria-label="Duplicate selected element"
          >
            <Copy />
          </button>
          <button
            type="button"
            className="icon-button danger"
            onClick={deleteSelected}
            aria-label="Delete selected element"
          >
            <Trash2 />
          </button>
        </div>
      </div>
      {element.content !== undefined && (
        <label className="field">
          <span>Content</span>
          <textarea
            value={element.content}
            onChange={(event) =>
              updateSelected({ content: event.target.value })
            }
          />
        </label>
      )}
      {element.type === "image" && (
        <>
          <label className="field">
            <span>Image URL</span>
            <input
              value={element.source ?? ""}
              onChange={(event) =>
                updateSelected({ source: event.target.value })
              }
            />
          </label>
          <label className="field">
            <span>Alternative text</span>
            <input
              value={element.alt ?? ""}
              onChange={(event) => updateSelected({ alt: event.target.value })}
            />
          </label>
        </>
      )}
      <section className="inspector-section">
        <h3>Layout</h3>
        <div className="field-row">
          <label className="field">
            <span>Padding</span>
            <input
              type="number"
              value={style.padding ?? 0}
              onChange={(event) =>
                updateStyle({ padding: Number(event.target.value) })
              }
            />
          </label>
          <label className="field">
            <span>Gap</span>
            <input
              type="number"
              value={style.gap ?? 0}
              onChange={(event) =>
                updateStyle({ gap: Number(event.target.value) })
              }
            />
          </label>
        </div>
        {element.type === "flex" && (
          <label className="field">
            <span>Direction</span>
            <select
              value={style.flexDirection}
              onChange={(event) =>
                updateStyle({
                  flexDirection: event.target.value as "row" | "column",
                })
              }
            >
              <option value="row">Row</option>
              <option value="column">Column</option>
            </select>
          </label>
        )}
        {element.type === "grid" && (
          <label className="field">
            <span>Columns</span>
            <input
              type="number"
              min="1"
              max="12"
              value={style.gridColumns ?? 2}
              onChange={(event) =>
                updateStyle({ gridColumns: Number(event.target.value) })
              }
            />
          </label>
        )}
      </section>
      <section className="inspector-section">
        <h3>Appearance</h3>
        <div className="field-row">
          <label className="field">
            <span>Text</span>
            <input
              type="color"
              value={style.color ?? "#151515"}
              onChange={(event) => updateStyle({ color: event.target.value })}
            />
          </label>
          <label className="field">
            <span>Background</span>
            <input
              type="color"
              value={style.background ?? "#ffffff"}
              onChange={(event) =>
                updateStyle({ background: event.target.value })
              }
            />
          </label>
        </div>
        <label className="field">
          <span>Corner radius</span>
          <input
            type="range"
            min="0"
            max="48"
            value={style.borderRadius ?? 0}
            onChange={(event) =>
              updateStyle({ borderRadius: Number(event.target.value) })
            }
          />
        </label>
      </section>
      <div className="override-note">
        Editing <strong>{breakpoint}</strong> styles. Values cascade from
        desktop.
      </div>
    </aside>
  );
};
export default EditorInspector;
