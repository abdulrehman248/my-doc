import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";

export type CommentDecorationItem = {
  id: string;
  quote: string;
};

export type CommentDecorationsStorage = {
  comments: CommentDecorationItem[];
  activeId: string | null;
};

declare module "@tiptap/core" {
  interface Storage {
    commentDecorations: CommentDecorationsStorage;
  }

  interface Commands<ReturnType> {
    commentDecorations: {
      setCommentDecorations: (
        comments: CommentDecorationItem[],
        activeId?: string | null,
      ) => ReturnType;
      setActiveCommentId: (activeId: string | null) => ReturnType;
    };
  }
}

const commentDecorationsKey = new PluginKey<DecorationSet>("commentDecorations");

function findQuoteRange(
  doc: ProseMirrorNode,
  quote: string,
): { from: number; to: number } | null {
  const needle = quote.trim();
  if (!needle) {
    return null;
  }

  let plain = "";
  const map: number[] = [];

  doc.descendants((node, pos) => {
    if (!node.isText || !node.text) {
      return;
    }
    for (let i = 0; i < node.text.length; i += 1) {
      plain += node.text[i];
      map.push(pos + i);
    }
  });

  const index = plain.indexOf(needle);
  if (index < 0) {
    return null;
  }

  const from = map[index];
  const toIndex = index + needle.length - 1;
  const toBase = map[toIndex];
  if (from === undefined || toBase === undefined) {
    return null;
  }

  return { from, to: toBase + 1 };
}

function buildDecorations(
  doc: ProseMirrorNode,
  comments: CommentDecorationItem[],
  activeId: string | null,
): DecorationSet {
  const decorations: Decoration[] = [];
  const usedRanges: Array<{ from: number; to: number }> = [];

  for (const comment of comments) {
    const range = findQuoteRange(doc, comment.quote);
    if (!range) {
      continue;
    }

    const overlaps = usedRanges.some(
      (used) => range.from < used.to && range.to > used.from,
    );
    if (overlaps) {
      continue;
    }
    usedRanges.push(range);

    const isActive = comment.id === activeId;
    decorations.push(
      Decoration.inline(range.from, range.to, {
        class: isActive ? "doc-comment-highlight is-active" : "doc-comment-highlight",
        "data-comment-id": comment.id,
      }),
    );
  }

  return DecorationSet.create(doc, decorations);
}

export function findCommentRange(
  doc: ProseMirrorNode,
  quote: string,
): { from: number; to: number } | null {
  return findQuoteRange(doc, quote);
}

export const CommentDecorations = Extension.create({
  name: "commentDecorations",

  addStorage() {
    return {
      comments: [] as CommentDecorationItem[],
      activeId: null as string | null,
    } satisfies CommentDecorationsStorage;
  },

  addCommands() {
    return {
      setCommentDecorations:
        (comments, activeId = null) =>
        ({ editor }) => {
          editor.storage.commentDecorations.comments = comments;
          editor.storage.commentDecorations.activeId = activeId;
          editor.view.dispatch(
            editor.state.tr.setMeta(commentDecorationsKey, {
              comments,
              activeId,
            }),
          );
          return true;
        },
      setActiveCommentId:
        (activeId) =>
        ({ editor }) => {
          editor.storage.commentDecorations.activeId = activeId;
          editor.view.dispatch(
            editor.state.tr.setMeta(commentDecorationsKey, {
              comments: editor.storage.commentDecorations.comments,
              activeId,
            }),
          );
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    const extension = this;

    return [
      new Plugin({
        key: commentDecorationsKey,
        state: {
          init(_, state) {
            const storage = extension.storage as CommentDecorationsStorage;
            return buildDecorations(state.doc, storage.comments, storage.activeId);
          },
          apply(tr, oldState) {
            const meta = tr.getMeta(commentDecorationsKey) as
              | { comments: CommentDecorationItem[]; activeId: string | null }
              | undefined;
            if (meta) {
              return buildDecorations(tr.doc, meta.comments, meta.activeId);
            }
            if (tr.docChanged) {
              const storage = extension.storage as CommentDecorationsStorage;
              return buildDecorations(tr.doc, storage.comments, storage.activeId);
            }
            return oldState;
          },
        },
        props: {
          decorations(state) {
            return commentDecorationsKey.getState(state);
          },
        },
      }),
    ];
  },
});
