"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import type { DocumentShareListItem, ShareRole } from "@/lib/documents";
import { changeShareRole, revokeShare, shareDocument, type ShareFormState } from "./actions";

const initialState: ShareFormState = { error: null, done: false };

type ShareDialogProps = {
  documentId: string;
  documentTitle: string;
  shares: DocumentShareListItem[];
};

function roleLabel(role: ShareRole): string {
  return role === "edit" ? "Editor" : "Viewer";
}

export function ShareDialog({ documentId, documentTitle, shares }: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const emailRef = useRef<HTMLInputElement>(null);
  const boundShare = shareDocument.bind(null, documentId);
  const [state, action, pending] = useActionState(boundShare, initialState);

  useEffect(() => {
    if (state.done) {
      setOpen(false);
    }
  }, [state]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    emailRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button type="button" className="g-btn g-btn-primary" onClick={() => setOpen(true)}>
        Share
      </button>

      {open ? (
        <div className="g-modal-root">
          <button
            type="button"
            className="g-modal-backdrop"
            aria-label="Close share dialog"
            onClick={() => setOpen(false)}
          />
          <div
            className="g-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <div className="g-modal-header">
              <div>
                <h2 id={titleId} className="g-modal-title">
                  Share “{documentTitle}”
                </h2>
                <p className="g-user m-0 mt-1">
                  Add people by email. They need an Ajaia Docs account.
                </p>
              </div>
              <button
                type="button"
                className="g-btn g-btn-ghost"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form action={action} className="mt-4 flex flex-col gap-3">
              <label className="g-field" htmlFor="share-email">
                People
                <input
                  ref={emailRef}
                  id="share-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="off"
                  placeholder="Enter email address"
                  className="g-input"
                />
              </label>
              <label className="g-field" htmlFor="share-role">
                Role
                <select
                  id="share-role"
                  name="role"
                  defaultValue="view"
                  className="g-select"
                >
                  <option value="view">Viewer</option>
                  <option value="edit">Editor</option>
                </select>
              </label>

              {state.error && !state.done ? (
                <p role="alert" className="g-alert">
                  {state.error}
                </p>
              ) : null}

              <div className="g-modal-actions">
                <button
                  type="button"
                  className="g-btn g-btn-ghost"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" disabled={pending} className="g-btn g-btn-primary">
                  {pending ? "Sharing…" : "Send"}
                </button>
              </div>
            </form>

            <div className="g-modal-people">
              <h3 className="g-section-title m-0">People with access</h3>
              {shares.length === 0 ? (
                <p className="g-user mt-2">Only you can access this document.</p>
              ) : (
                <div className="mt-2">
                  {shares.map((share) => (
                    <div key={share.id} className="g-share-item text-sm">
                      <div>
                        <p className="m-0 font-medium text-docs-ink">{share.email}</p>
                        <p className="g-user m-0 mt-1">{roleLabel(share.role)}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <form action={changeShareRole} className="flex items-center gap-2">
                          <input type="hidden" name="shareId" value={share.id} />
                          <input type="hidden" name="documentId" value={documentId} />
                          <label className="sr-only" htmlFor={`role-${share.id}`}>
                            Role for {share.email}
                          </label>
                          <select
                            id={`role-${share.id}`}
                            name="role"
                            defaultValue={share.role}
                            className="g-select"
                          >
                            <option value="view">Viewer</option>
                            <option value="edit">Editor</option>
                          </select>
                          <button type="submit" className="g-btn g-btn-secondary">
                            Update
                          </button>
                        </form>
                        <form action={revokeShare}>
                          <input type="hidden" name="shareId" value={share.id} />
                          <input type="hidden" name="documentId" value={documentId} />
                          <button type="submit" className="g-btn g-btn-danger">
                            Remove
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
