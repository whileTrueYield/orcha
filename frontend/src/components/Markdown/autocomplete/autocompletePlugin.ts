/**
 * The editor-boundary plugin that drives `@`/`#`/`:`/`/` autocomplete in Crepe
 * (PRD #36, issue #42).
 *
 * It ties together the tested, headless pieces — `findActiveTrigger` to detect
 * what the user is typing and `fetchCandidates` to resolve options — with the
 * parts that only exist in a live editor: a floating popup, keyboard navigation,
 * and inserting the chosen custom node in place of the typed `@query`. That
 * contenteditable/DOM wiring is why this module is the untestable boundary; the
 * logic worth testing was extracted into `triggers.ts` and `candidates.ts`.
 *
 * Public API:
 *   - directiveAutocomplete: MilkdownPlugin — add via `crepe.editor.use(...)`
 *
 * Assumes the mention/ticket/emoji node schemas from `editorNodes.ts` are
 * registered on the same editor; it looks them up by name when inserting.
 */
import { $prose } from "@milkdown/kit/utils";
import { Plugin, PluginKey } from "@milkdown/kit/prose/state";
import type { EditorView } from "@milkdown/kit/prose/view";

import { onGraphQLError } from "utils/GQLClient";

import type { DirectiveCandidate } from "./candidates";
import { fetchCandidates } from "./fetchCandidates";
import { type ActiveTrigger, findActiveTrigger } from "./triggers";

import "./autocomplete.css";

// Searches are debounced so fast typing does not fire a GraphQL query per
// keystroke; 150ms keeps the popup feeling live without flooding the backend.
const SEARCH_DEBOUNCE_MS = 150;

// The contiguous run of text before the cursor in the current block — what
// `findActiveTrigger` inspects. Returns null unless the selection is an empty
// caret inside a text block, so the popup never opens over a range selection.
function textBeforeCursor(view: EditorView): string | null {
  const { selection } = view.state;
  const { $from, empty } = selection;
  if (!empty || !$from.parent.isTextblock) return null;
  return $from.parent.textBetween(0, $from.parentOffset, undefined, "￼");
}

// All the live state of an open autocomplete session. Held in a controller (not
// ProseMirror state) because it is transient UI plus an in-flight async fetch.
class AutocompleteController {
  #view: EditorView | null = null;
  #popup: HTMLDivElement | null = null;
  #items: DirectiveCandidate[] = [];
  #selected = 0;
  #range: { from: number; to: number } | null = null;
  // Identifies the current trigger+query so we neither refetch an unchanged
  // query nor apply a stale async result after the query has moved on.
  #requestKey = "";
  #debounce: ReturnType<typeof setTimeout> | null = null;

  attach(view: EditorView): void {
    this.#view = view;
    const popup = document.createElement("div");
    popup.className = "orcha-autocomplete";
    popup.dataset.show = "false";
    document.body.appendChild(popup);
    this.#popup = popup;
  }

  destroy(): void {
    if (this.#debounce) clearTimeout(this.#debounce);
    this.#popup?.remove();
    this.#popup = null;
    this.#view = null;
  }

  // Recompute on every editor update: figure out whether a trigger is active and
  // (debounced) fetch its candidates.
  update(view: EditorView): void {
    const text = textBeforeCursor(view);
    const active = text === null ? null : findActiveTrigger(text);
    if (!active) {
      this.#close();
      return;
    }

    const key = `${active.char}:${active.query}`;
    if (key === this.#requestKey) return;
    this.#requestKey = key;

    if (this.#debounce) clearTimeout(this.#debounce);
    this.#debounce = setTimeout(() => this.#fetch(view, active, key), SEARCH_DEBOUNCE_MS);
  }

  #fetch(view: EditorView, active: ActiveTrigger, key: string): void {
    fetchCandidates(active.char, active.query)
      .then((items) => {
        // Drop the result if the user has typed on since this request fired.
        if (key !== this.#requestKey) return;
        const cursor = view.state.selection.from;
        this.#items = items;
        this.#selected = 0;
        this.#range = {
          from: cursor - active.query.length - 1,
          to: cursor,
        };
        this.#render(view);
      })
      // A failed search just leaves the popup closed; never crash the editor.
      .catch(() => this.#close());
  }

  // Arrow keys move the selection, Enter/Tab commit, Escape dismisses. Returns
  // true only when the popup is open and actually handled the key, so normal
  // typing is never swallowed.
  handleKeyDown(event: KeyboardEvent): boolean {
    if (!this.#isOpen()) return false;

    switch (event.key) {
      case "ArrowDown":
        this.#move(1);
        return true;
      case "ArrowUp":
        this.#move(-1);
        return true;
      case "Enter":
      case "Tab":
        this.#commit(this.#selected);
        return true;
      case "Escape":
        this.#close();
        return true;
      default:
        return false;
    }
  }

  #isOpen(): boolean {
    return this.#popup?.dataset.show === "true" && this.#items.length > 0;
  }

  #move(delta: number): void {
    const count = this.#items.length;
    this.#selected = (this.#selected + delta + count) % count;
    if (this.#view) this.#render(this.#view);
  }

  // Replace the typed `@query` with the chosen node. An inline chip (mention,
  // emoji) gets a trailing space so the caret leaves the atom; a block embed
  // (ticket, drawing) replaces the selection, letting ProseMirror split the
  // paragraph.
  #commit(index: number): void {
    const view = this.#view;
    const candidate = this.#items[index];
    if (!view || !candidate || !this.#range) return;

    const type = view.state.schema.nodes[candidate.nodeName];
    if (!type) return;

    const { from, to } = this.#range;
    this.#close();

    if (!candidate.resolveAttrs) {
      const node = type.create(candidate.attrs);
      const tr = view.state.tr;
      if (type.isBlock) {
        tr.delete(from, to).replaceSelectionWith(node);
      } else {
        tr.replaceWith(from, to, node).insertText(" ");
      }
      view.dispatch(tr.scrollIntoView());
      view.focus();
      return;
    }

    // Create-first inserts (drawing): the backing record is created before the
    // node goes in, so a saved body never holds a dangling id. The typed
    // `/query` is removed synchronously — the range cannot drift while the
    // mutation runs — and the node lands at the caret once the attrs resolve.
    view.dispatch(view.state.tr.delete(from, to));
    view.focus();
    candidate.resolveAttrs().then(
      (attrs) => {
        view.dispatch(
          view.state.tr
            .replaceSelectionWith(type.create(attrs))
            .scrollIntoView(),
        );
      },
      (error) =>
        onGraphQLError({ title: `Could not insert ${candidate.display}` })(
          error,
        ),
    );
  }

  #close(): void {
    this.#requestKey = "";
    this.#items = [];
    this.#range = null;
    if (this.#popup) this.#popup.dataset.show = "false";
  }

  #render(view: EditorView): void {
    const popup = this.#popup;
    if (!popup) return;

    if (this.#items.length === 0) {
      popup.dataset.show = "false";
      return;
    }

    popup.replaceChildren(
      ...this.#items.map((item, index) => {
        const row = document.createElement("button");
        row.type = "button";
        row.className =
          "orcha-autocomplete__item" +
          (index === this.#selected ? " is-selected" : "");
        row.textContent = item.display;
        // mousedown, not click: clicking would blur the editor first and the
        // selection range would be lost before we could replace it.
        row.addEventListener("mousedown", (event) => {
          event.preventDefault();
          this.#commit(index);
        });
        return row;
      }),
    );

    // Anchor the popup just below the trigger char.
    const anchor = this.#range?.from ?? view.state.selection.from;
    const coords = view.coordsAtPos(anchor);
    popup.style.left = `${coords.left}px`;
    popup.style.top = `${coords.bottom}px`;
    popup.dataset.show = "true";
  }
}

export const directiveAutocomplete = $prose(() => {
  const controller = new AutocompleteController();
  return new Plugin({
    key: new PluginKey("orchaDirectiveAutocomplete"),
    view: (view) => {
      controller.attach(view);
      return {
        update: (updatedView) => controller.update(updatedView),
        destroy: () => controller.destroy(),
      };
    },
    props: {
      handleKeyDown: (_view, event) => controller.handleKeyDown(event),
    },
  });
});
