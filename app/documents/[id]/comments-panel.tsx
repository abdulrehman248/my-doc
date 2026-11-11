"use client";

import { useState, useTransition } from "react";
import type { DocumentComment } from "@/lib/comments";
import { deleteComment, resolveComment } from "./comment-actions";

export type CommentListItem = DocumentComment;

type CommentsPanelProps = {
  documentId: string;
  comments: CommentListItem[];
  currentUserId: string;
  isOwner: boolean;
  activeId: string | null;
  onSelect: (comment: CommentListItem) => void;
  onCommentsChange: (comments: CommentListItem[]) => void;
};

function canManageComment(
  comment: CommentListItem,
  currentUserId: string,
  isOwner: boolean,
): boolean {
  return isOwner || comment.authorId === currentUserId;
}

export function CommentsPanel({
  documentId,
  comments,
  currentUserId,
  isOwner,
  activeId,
  onSelect,
  onCommentsChange,
}: CommentsPanelProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const open = comments.filter((comment) => !comment.resolvedAt);
  const resolved = comments.filter((comment) => comment.resolvedAt);

  function runResolve(commentId: string) {
    setError(null);
    startTransition(async () => {
      const result = await resolveComment(documentId, commentId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onCommentsChange(
        comments.map((comment) =>
          comment.id === commentId
            ? { ...comment, resolvedAt: new Date() }
            : comment,
        ),
      );
    });
  }

  function runDelete(commentId: string) {
    setError(null);
    startTransition(async () => {
      const result = await deleteComment(documentId, commentId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onCommentsChange(comments.filter((comment) => comment.id !== commentId));
    });
  }

  return (
    <aside className="g-comments" aria-label="Comments">
      <div className="g-comments-header">
        <h2 className="g-comments-title">Comments</h2>
        <p className="g-user m-0">
          {open.length === 0
            ? "Select text to leave a comment."
            : `${open.length} open`}
        </p>
      </div>

      {error ? (
        <p role="alert" className="g-alert g-comments-alert">
          {error}
        </p>
      ) : null}

      <div className="g-comments-list">
        {open.length === 0 ? (
          <p className="g-comments-empty">No open comments yet.</p>
        ) : (
          open.map((comment) => {
            const manageable = canManageComment(comment, currentUserId, isOwner);
            return (
              <article
                key={comment.id}
                className={
                  activeId === comment.id
                    ? "g-comment is-active"
                    : "g-comment"
                }
              >
                <button
                  type="button"
                  className="g-comment-hit"
                  onClick={() => onSelect(comment)}
                >
                  <p className="g-comment-author">{comment.authorEmail}</p>
                  <p className="g-comment-quote">“{comment.quote}”</p>
                  <p className="g-comment-body">{comment.body}</p>
                </button>
                {manageable ? (
                  <div className="g-comment-actions">
                    <button
                      type="button"
                      className="g-btn g-btn-ghost"
                      disabled={pending}
                      onClick={() => runResolve(comment.id)}
                    >
                      Resolve
                    </button>
                    <button
                      type="button"
                      className="g-btn g-btn-ghost"
                      disabled={pending}
                      onClick={() => runDelete(comment.id)}
                    >
                      Delete
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })
        )}
      </div>

      {resolved.length > 0 ? (
        <details className="g-comments-resolved">
          <summary>Resolved ({resolved.length})</summary>
          <div className="g-comments-list">
            {resolved.map((comment) => (
              <article key={comment.id} className="g-comment is-resolved">
                <p className="g-comment-author">{comment.authorEmail}</p>
                <p className="g-comment-quote">“{comment.quote}”</p>
                <p className="g-comment-body">{comment.body}</p>
                {canManageComment(comment, currentUserId, isOwner) ? (
                  <div className="g-comment-actions">
                    <button
                      type="button"
                      className="g-btn g-btn-ghost"
                      disabled={pending}
                      onClick={() => runDelete(comment.id)}
                    >
                      Delete
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </details>
      ) : null}
    </aside>
  );
}
