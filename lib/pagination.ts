import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet, type EditorView } from "@tiptap/pm/view";

const paginationKey = new PluginKey<DecorationSet>("pagination");

const DEFAULT_PAGE_HEIGHT = 1056;
const DEFAULT_PAD_TOP = 96;
const DEFAULT_PAD_BOTTOM = 120;
const DEFAULT_PAGE_GAP = 24;

type PageMetrics = {
  contentHeight: number;
  breakChrome: number;
};

function readCssPx(styles: CSSStyleDeclaration, name: string, fallback: number): number {
  const raw = styles.getPropertyValue(name).trim();
  if (!raw) {
    return fallback;
  }
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : fallback;
}

function getPageMetrics(view: EditorView): PageMetrics {
  const canvas = view.dom.closest(".g-canvas");
  const styles = canvas ? getComputedStyle(canvas) : null;
  const padTop = styles ? readCssPx(styles, "--paper-pad-top", DEFAULT_PAD_TOP) : DEFAULT_PAD_TOP;
  const padBottom = styles
    ? readCssPx(styles, "--paper-pad-bottom", DEFAULT_PAD_BOTTOM)
    : DEFAULT_PAD_BOTTOM;
  const pageGap = styles ? readCssPx(styles, "--page-gap", DEFAULT_PAGE_GAP) : DEFAULT_PAGE_GAP;
  const pageHeight = styles
    ? readCssPx(styles, "--page-height", DEFAULT_PAGE_HEIGHT)
    : DEFAULT_PAGE_HEIGHT;

  return {
    contentHeight: Math.max(240, pageHeight - padTop - padBottom),
    breakChrome: padBottom + pageGap + padTop,
  };
}

function blockHeight(element: HTMLElement): number {
  const styles = getComputedStyle(element);
  // Count only bottom margin so collapsed sibling margins are not double-counted.
  const marginBottom = Number.parseFloat(styles.marginBottom) || 0;
  return element.offsetHeight + marginBottom;
}

function createAutoBreakElement(fillerHeight: number, breakChrome: number): HTMLElement {
  const root = document.createElement("div");
  root.className = "doc-auto-page-break";
  root.contentEditable = "false";
  root.dataset.type = "auto-page-break";

  if (fillerHeight > 0) {
    const filler = document.createElement("div");
    filler.className = "doc-page-filler";
    filler.style.height = `${fillerHeight}px`;
    root.append(filler);
  }

  if (breakChrome > 0) {
    const gap = document.createElement("div");
    gap.className = "doc-page-break doc-page-break--auto";
    gap.style.height = `${breakChrome}px`;
    root.append(gap);
  }

  return root;
}

function decorationSignature(set: DecorationSet): string {
  return set
    .find()
    .map((decoration) => {
      const key = typeof decoration.spec.key === "string" ? decoration.spec.key : "";
      return `${decoration.from}:${key}`;
    })
    .join("|");
}

function computeDecorations(view: EditorView): DecorationSet {
  const { contentHeight, breakChrome } = getPageMetrics(view);
  const decorations: Decoration[] = [];
  let used = 0;

  view.state.doc.forEach((node, offset) => {
    const pos = offset;

    if (node.type.name === "pageBreak") {
      if (used > 0 && used < contentHeight) {
        const filler = contentHeight - used;
        decorations.push(
          Decoration.widget(
            pos,
            () => createAutoBreakElement(filler, 0),
            {
              side: -1,
              key: `page-fill-${pos}-${Math.round(filler)}`,
            },
          ),
        );
      }
      used = 0;
      return;
    }

    const dom = view.nodeDOM(pos);
    if (!(dom instanceof HTMLElement)) {
      return;
    }

    const height = blockHeight(dom);
    if (height <= 0) {
      return;
    }

    if (used > 0 && used + height > contentHeight) {
      const filler = Math.max(0, contentHeight - used);
      decorations.push(
        Decoration.widget(
          pos,
          () => createAutoBreakElement(filler, breakChrome),
          {
            side: -1,
            key: `page-break-${pos}-${Math.round(filler)}-${Math.round(breakChrome)}`,
          },
        ),
      );
      used = height > contentHeight ? height % contentHeight : height;
      return;
    }

    used += height;
    if (used > contentHeight) {
      used = used % contentHeight;
    }
  });

  return DecorationSet.create(view.state.doc, decorations);
}

export const Pagination = Extension.create({
  name: "pagination",

  addProseMirrorPlugins() {
    return [
      new Plugin<DecorationSet>({
        key: paginationKey,
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, set) {
            const mapped = set.map(tr.mapping, tr.doc);
            const meta = tr.getMeta(paginationKey) as { decorations?: DecorationSet } | undefined;
            if (meta?.decorations) {
              return meta.decorations;
            }
            return mapped;
          },
        },
        props: {
          decorations(state) {
            return paginationKey.getState(state) ?? DecorationSet.empty;
          },
        },
        view(view) {
          let frame = 0;
          let lastWidth = view.dom.clientWidth;
          let resizeObserver: ResizeObserver | null = null;

          const run = () => {
            if (!view.dom.isConnected) {
              return;
            }
            const next = computeDecorations(view);
            const current = paginationKey.getState(view.state) ?? DecorationSet.empty;
            if (decorationSignature(current) === decorationSignature(next)) {
              return;
            }
            view.dispatch(view.state.tr.setMeta(paginationKey, { decorations: next }).setMeta("addToHistory", false));
          };

          const schedule = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(run);
          };

          schedule();

          if (typeof ResizeObserver !== "undefined") {
            resizeObserver = new ResizeObserver(() => {
              const width = view.dom.clientWidth;
              if (width !== lastWidth) {
                lastWidth = width;
                schedule();
              } else {
                schedule();
              }
            });
            resizeObserver.observe(view.dom);
            const canvas = view.dom.closest(".g-canvas");
            if (canvas) {
              resizeObserver.observe(canvas);
            }
          }

          return {
            update(currentView, previousState) {
              if (!currentView.state.doc.eq(previousState.doc)) {
                schedule();
              }
            },
            destroy() {
              cancelAnimationFrame(frame);
              resizeObserver?.disconnect();
            },
          };
        },
      }),
    ];
  },
});
