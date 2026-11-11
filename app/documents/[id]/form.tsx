"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import {
  CommentDecorations,
  findCommentRange,
  type CommentDecorationItem,
} from "@/lib/comment-decorations";
import type { DocumentComment } from "@/lib/comments";
import {
  parseContentFromStorage,
  serializeContent,
} from "@/lib/editor-content";
import { PageBreak } from "@/lib/page-break";
import { Pagination } from "@/lib/pagination";
import { autosaveDocument } from "./actions";
import { createComment } from "./comment-actions";
import { CommentsPanel } from "./comments-panel";
import { EditorToolbar } from "./toolbar";

const AUTOSAVE_MS = 1000;

export type ClientComment = {
  id: string;
  documentId: string;
  authorId: string;
  authorEmail: string;
  body: string;
  quote: string;
  resolvedAt: string | Date | null;
  createdAt: string | Date;
};

type DocumentFormProps = {
  documentId: string;
  title: string;
  content: string;
  readOnly?: boolean;
  shareSlot?: ReactNode;
  initialComments: ClientComment[];
  currentUserId: string;
  currentUserEmail: string;
  isOwner: boolean;
};

function initialsFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  const parts = local.split(/[._\-\s]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return local.slice(0, 2).toUpperCase() || "?";
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

function toPanelComment(comment: ClientComment): DocumentComment {
  return {
    ...comment,
    resolvedAt:
      comment.resolvedAt === null || comment.resolvedAt === undefined
        ? null
        : new Date(comment.resolvedAt),
    createdAt: new Date(comment.createdAt),
  };
}

function openDecorationItems(comments: ClientComment[]): CommentDecorationItem[] {
  return comments
    .filter((comment) => !comment.resolvedAt)
    .map((comment) => ({ id: comment.id, quote: comment.quote }));
}

export function DocumentForm({
  documentId,
  title: initialTitle,
  content,
  readOnly = false,
  shareSlot,
  initialComments,
  currentUserId,
  currentUserEmail,
  isOwner,
}: DocumentFormProps) {
  const initialDoc = parseContentFromStorage(content);
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<ClientComment[]>(initialComments);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [selectionQuote, setSelectionQuote] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentPending, startCommentTransition] = useTransition();

  const lastSavedRef = useRef({
    title: initialTitle,
    content: serializeContent(initialDoc),
  });
  const titleRef = useRef(title);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveIdRef = useRef(0);
  const readyRef = useRef(false);

  const panelComments = useMemo(
    () => comments.map(toPanelComment),
    [comments],
  );

  useEffect(() => {
    titleRef.current = title;
  }, [title]);

  const runSave = useCallback(
    async (nextTitle: string, nextContent: string) => {
      if (readOnly) {
        return;
      }
      if (
        nextTitle === lastSavedRef.current.title &&
        nextContent === lastSavedRef.current.content
      ) {
        return;
      }

      const saveId = ++saveIdRef.current;
      setStatus("saving");
      setError(null);

      const result = await autosaveDocument(documentId, nextTitle, nextContent);
      if (saveId !== saveIdRef.current) {
        return;
      }

      if (!result.ok) {
        setStatus("error");
        setError(result.error);
        return;
      }

      lastSavedRef.current = { title: nextTitle.trim(), content: nextContent };
      setStatus("saved");
      setError(null);
    },
    [documentId, readOnly],
  );

  const scheduleSave = useCallback(
    (nextTitle: string, nextContent: string) => {
      if (readOnly || !readyRef.current) {
        return;
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        void runSave(nextTitle, nextContent);
      }, AUTOSAVE_MS);
    },
    [readOnly, runSave],
  );

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    editable: !readOnly,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
      }),
      Underline,
      PageBreak,
      Pagination,
      CommentDecorations,
    ],
    content: initialDoc,
    editorProps: {
      attributes: {
        class: "doc-editor",
      },
    },
    onUpdate: ({ editor: current }) => {
      if (readOnly) {
        return;
      }
      scheduleSave(titleRef.current, serializeContent(current.getJSON()));
    },
    onSelectionUpdate: ({ editor: current }) => {
      const { from, to, empty } = current.state.selection;
      if (empty) {
        setSelectionQuote("");
        return;
      }
      setSelectionQuote(current.state.doc.textBetween(from, to, " ").trim());
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }
    editor.setEditable(!readOnly);
  }, [editor, readOnly]);

  useEffect(() => {
    if (!editor) {
      return;
    }
    editor.commands.setCommentDecorations(
      openDecorationItems(comments),
      activeCommentId,
    );
  }, [editor, comments, activeCommentId]);

  useEffect(() => {
    readyRef.current = true;
    return () => {
      readyRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  function onTitleChange(value: string) {
    if (readOnly) {
      return;
    }
    setTitle(value);
    if (editor) {
      scheduleSave(value, serializeContent(editor.getJSON()));
    }
  }

  function openComposer() {
    if (!selectionQuote) {
      return;
    }
    setCommentError(null);
    setDraft("");
    setComposerOpen(true);
  }

  function closeComposer() {
    if (commentPending) {
      return;
    }
    setComposerOpen(false);
    setCommentError(null);
  }

  useEffect(() => {
    if (!composerOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !commentPending) {
        setComposerOpen(false);
        setCommentError(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [composerOpen, commentPending]);

  function submitComment() {
    if (!selectionQuote) {
      return;
    }
    setCommentError(null);
    startCommentTransition(async () => {
      const result = await createComment(documentId, draft, selectionQuote);
      if (!result.ok) {
        setCommentError(result.error);
        return;
      }
      if (!result.comment) {
        setCommentError("Could not create comment.");
        return;
      }
      setComments((current) => [...current, result.comment as ClientComment]);
      setActiveCommentId(result.comment.id);
      setComposerOpen(false);
      setDraft("");
    });
  }

  function selectComment(comment: DocumentComment) {
    setActiveCommentId(comment.id);
    if (!editor) {
      return;
    }
    const range = findCommentRange(editor.state.doc, comment.quote);
    if (!range) {
      return;
    }
    editor.chain().focus().setTextSelection(range).scrollIntoView().run();
  }

  const statusLabel =
    readOnly
      ? "View only"
      : status === "saving"
        ? "Saving…"
        : status === "saved"
          ? "All changes saved"
          : status === "error"
            ? "Could not save"
            : null;

  const canComment = selectionQuote.length > 0;

  return (
    <>
      <div className="g-doc-top">
        <div className="g-doc-top-inner">
          <div className="g-doc-title-row">
            <label className="g-doc-title-label" htmlFor="title">
              <span className="sr-only">Document title</span>
              <input
                id="title"
                name="title"
                type="text"
                value={title}
                onChange={(event) => onTitleChange(event.target.value)}
                readOnly={readOnly}
                maxLength={200}
                className="g-title-input"
                placeholder="Untitled document"
              />
            </label>
            {statusLabel ? (
              <p
                className="g-status m-0"
                data-tone={status === "error" ? "error" : "default"}
                aria-live="polite"
              >
                {statusLabel}
              </p>
            ) : null}
          </div>
          {shareSlot}
        </div>
        {editor ? (
          <EditorToolbar
            editor={editor}
            showFormatting={!readOnly}
            canComment={canComment}
            onComment={openComposer}
          />
        ) : null}
      </div>

      {error ? (
        <div className="g-canvas">
          <p
            role="alert"
            className="g-alert mx-auto"
            style={{ width: "min(100%, 816px)" }}
          >
            {error}
          </p>
        </div>
      ) : null}

      <div className="g-editor-body">
        <div className="g-canvas g-canvas-with-comments">
          <div className="g-paper">
            <EditorContent editor={editor} />
          </div>
        </div>

        <CommentsPanel
          documentId={documentId}
          comments={panelComments}
          currentUserId={currentUserId}
          isOwner={isOwner}
          activeId={activeCommentId}
          onSelect={selectComment}
          onCommentsChange={(next) => {
            setComments(
              next.map((comment) => ({
                ...comment,
                resolvedAt: comment.resolvedAt,
                createdAt: comment.createdAt,
              })),
            );
            if (activeCommentId && !next.some((c) => c.id === activeCommentId && !c.resolvedAt)) {
              setActiveCommentId(null);
            }
          }}
        />
      </div>

      {composerOpen ? (
        <div className="g-modal-root g-comment-modal-root">
          <button
            type="button"
            className="g-modal-backdrop g-comment-modal-backdrop"
            aria-label="Close comment composer"
            onClick={closeComposer}
          />
          <div
            className="g-comment-composer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="comment-composer-title"
          >
            <div className="g-comment-composer-top">
              <span className="g-comment-composer-avatar" aria-hidden>
                {initialsFromEmail(currentUserEmail)}
              </span>
              <div className="g-comment-composer-heading">
                <h2 id="comment-composer-title" className="g-comment-composer-title">
                  Add a comment
                </h2>
                <p className="g-comment-composer-sub">On the selected text</p>
              </div>
              <button
                type="button"
                className="g-comment-composer-close"
                onClick={closeComposer}
                disabled={commentPending}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <blockquote className="g-comment-composer-quote">
              {selectionQuote}
            </blockquote>

            <label className="g-comment-composer-field">
              <span className="sr-only">Comment</span>
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                    event.preventDefault();
                    if (draft.trim() && !commentPending) {
                      submitComment();
                    }
                  }
                }}
                rows={4}
                className="g-comment-composer-input"
                placeholder="Share feedback or ask a question…"
                autoFocus
              />
            </label>

            {commentError ? (
              <p role="alert" className="g-alert g-comment-composer-alert">
                {commentError}
              </p>
            ) : null}

            <div className="g-comment-composer-actions">
              <button
                type="button"
                className="g-btn g-btn-ghost"
                onClick={closeComposer}
                disabled={commentPending}
              >
                Cancel
              </button>
              <button
                type="button"
                className="g-btn g-btn-primary"
                onClick={submitComment}
                disabled={commentPending || !draft.trim()}
              >
                {commentPending ? "Posting…" : "Comment"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
